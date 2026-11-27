//! Read subscribers and new postings, and mark digests as sent, through PostgREST with the
//! service-role key (same approach as `cw-pipeline`, ADR-002). Addresses come from the
//! `alert_recipients()` SQL function because `auth.users` is not exposed by the REST API.

use anyhow::{Context, bail};
use chrono::{DateTime, SecondsFormat, Utc};

use crate::model::{Candidate, Recipient};

/// Safety cap on postings read in one run.
const POSTINGS_LIMIT: usize = 2000;
const POSTING_COLUMNS: &str = "source,external_id,source_url,company,title,location,city,remote,level,industry,posted_at,first_seen_at";

pub struct Store {
    client: reqwest::Client,
    base: String,
    key: String,
}

impl std::fmt::Debug for Store {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Store")
            .field("base", &self.base)
            .finish_non_exhaustive()
    }
}

impl Store {
    pub fn new(supabase_url: &str, service_role_key: &str) -> anyhow::Result<Self> {
        cw_sources::install_tls_provider();
        Ok(Self {
            client: reqwest::Client::builder()
                .timeout(std::time::Duration::from_secs(60))
                .build()?,
            base: format!("{}/rest/v1", supabase_url.trim_end_matches('/')),
            key: service_role_key.to_owned(),
        })
    }

    fn request(&self, builder: reqwest::RequestBuilder) -> reqwest::RequestBuilder {
        builder.header("apikey", &self.key).bearer_auth(&self.key)
    }

    /// Active subscribers, longest-waiting first, so a daily cap on emails is fair.
    pub async fn recipients(&self) -> anyhow::Result<Vec<Recipient>> {
        let response = self
            .request(
                self.client
                    .post(format!("{}/rpc/alert_recipients", self.base)),
            )
            .json(&serde_json::json!({}))
            .send()
            .await
            .map_err(|e| e.without_url())
            .context("reading recipients")?;
        check(response)
            .await
            .context("reading recipients")?
            .json()
            .await
            .map_err(|e| e.without_url())
            .context("parsing recipients")
    }

    /// Active postings first seen at or after `since`, newest first.
    pub async fn candidates(&self, since: DateTime<Utc>) -> anyhow::Result<Vec<Candidate>> {
        let response = self
            .request(self.client.get(format!("{}/postings", self.base)))
            .query(&[
                ("select", POSTING_COLUMNS.to_owned()),
                ("active", "eq.true".to_owned()),
                (
                    "first_seen_at",
                    format!("gte.{}", since.to_rfc3339_opts(SecondsFormat::Secs, true)),
                ),
                ("order", "first_seen_at.desc".to_owned()),
                ("limit", POSTINGS_LIMIT.to_string()),
            ])
            .send()
            .await
            .map_err(|e| e.without_url())
            .context("reading postings")?;
        check(response)
            .await
            .context("reading postings")?
            .json()
            .await
            .map_err(|e| e.without_url())
            .context("parsing postings")
    }

    /// Move the window forward once an email has really gone out.
    pub async fn mark_sent(&self, subscription_id: &str, now: DateTime<Utc>) -> anyhow::Result<()> {
        let response = self
            .request(
                self.client
                    .patch(format!("{}/alert_subscriptions", self.base)),
            )
            .query(&[("id", format!("eq.{subscription_id}"))])
            .header("Prefer", "return=minimal")
            .json(&serde_json::json!({
                "last_sent_at": now.to_rfc3339_opts(SecondsFormat::Secs, true)
            }))
            .send()
            .await
            .map_err(|e| e.without_url())
            .context("marking digest as sent")?;
        check(response).await.context("marking digest as sent")?;
        Ok(())
    }
}

async fn check(response: reqwest::Response) -> anyhow::Result<reqwest::Response> {
    let status = response.status();
    if status.is_success() {
        return Ok(response);
    }
    let body = response.text().await.unwrap_or_default();
    let body: String = body.chars().take(300).collect();
    bail!("HTTP {status}: {body}")
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;
    use serde_json::json;
    use wiremock::matchers::{body_json, header, method, path, query_param};
    use wiremock::{Mock, MockServer, ResponseTemplate};

    fn now() -> DateTime<Utc> {
        Utc.with_ymd_and_hms(2026, 11, 27, 8, 0, 0).unwrap()
    }

    #[tokio::test]
    async fn reads_recipients_and_postings_and_marks_sent() {
        let server = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/rest/v1/rpc/alert_recipients"))
            .and(header("apikey", "svc"))
            .respond_with(ResponseTemplate::new(200).set_body_json(json!([{
                "subscription_id": "s1", "email": "a@example.com", "industries": ["ai"],
                "roles": [], "skills": [], "locations": [], "remote": "any",
                "last_sent_at": null, "unsubscribe_token": "t"
            }])))
            .mount(&server)
            .await;
        Mock::given(method("GET"))
            .and(path("/rest/v1/postings"))
            .and(query_param("first_seen_at", "gte.2026-11-26T08:00:00Z"))
            .respond_with(ResponseTemplate::new(200).set_body_json(json!([{
                "source": "greenhouse", "external_id": "1", "source_url": "https://example.com/1",
                "company": "Empresa Ficticia", "title": "Analista", "location": null,
                "city": null, "remote": false, "level": "junior", "industry": "ai",
                "posted_at": null, "first_seen_at": "2026-11-27T01:00:00Z"
            }])))
            .mount(&server)
            .await;
        Mock::given(method("PATCH"))
            .and(path("/rest/v1/alert_subscriptions"))
            .and(query_param("id", "eq.s1"))
            .and(body_json(json!({"last_sent_at": "2026-11-27T08:00:00Z"})))
            .respond_with(ResponseTemplate::new(204))
            .expect(1)
            .mount(&server)
            .await;

        let store = Store::new(&server.uri(), "svc").unwrap();
        let recipients = store.recipients().await.unwrap();
        assert_eq!(recipients.len(), 1);
        let since = now() - chrono::Duration::days(1);
        let candidates = store.candidates(since).await.unwrap();
        assert_eq!(candidates[0].posting.title, "Analista");
        store.mark_sent("s1", now()).await.unwrap();
    }
}
