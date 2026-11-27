//! Write postings to Supabase through PostgREST with the service-role key.
//!
//! PostgREST (not a direct Postgres connection with `sqlx`) because the only secrets are then
//! `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, exactly what the repository already holds;
//! Supabase's direct connection also needs IPv6 or the pooler, which GitHub runners make awkward.
//! See ADR-002 in `docs/decisions.md`. The key bypasses RLS: it is read from the environment,
//! never logged (`Debug` hides it) and never written to disk.

use anyhow::{Context, bail};
use chrono::{DateTime, Duration, SecondsFormat, Utc};
use cw_domain::{Industry, Level, Posting, Source};
use serde::Serialize;

/// Postings not seen for this many days are deactivated.
pub const EXPIRE_AFTER_DAYS: i64 = 7;
/// Rows per request; keeps each body well under PostgREST's limits.
const BATCH: usize = 500;

pub struct Store {
    client: reqwest::Client,
    table_url: String,
    key: String,
}

impl std::fmt::Debug for Store {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Store")
            .field("table_url", &self.table_url)
            .finish_non_exhaustive()
    }
}

#[derive(Debug, PartialEq, Eq)]
pub struct SyncResult {
    pub upserted: usize,
    pub expired: usize,
}

impl std::fmt::Display for SyncResult {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "upserted={} expired={}", self.upserted, self.expired)
    }
}

/// One row of the `postings` table as we write it. `first_seen_at` is left out on purpose: the
/// column default sets it on insert and the upsert leaves it alone on conflict.
#[derive(Debug, Serialize)]
pub struct Row<'a> {
    source: Source,
    external_id: &'a str,
    source_url: &'a str,
    company: &'a str,
    title: &'a str,
    location: Option<&'a str>,
    city: Option<&'a str>,
    remote: bool,
    level: Level,
    industry: Industry,
    posted_at: Option<DateTime<Utc>>,
    last_seen_at: DateTime<Utc>,
    active: bool,
}

pub fn row(posting: &Posting, now: DateTime<Utc>) -> Row<'_> {
    Row {
        source: posting.source,
        external_id: &posting.external_id,
        source_url: &posting.source_url,
        company: &posting.company,
        title: &posting.title,
        location: posting.location.as_deref(),
        city: posting.city.as_deref(),
        remote: posting.remote,
        level: posting.level,
        industry: posting.industry,
        posted_at: posting.posted_at,
        last_seen_at: now,
        active: true,
    }
}

impl Store {
    pub fn new(supabase_url: &str, service_role_key: &str) -> anyhow::Result<Self> {
        cw_sources::install_tls_provider();
        Ok(Self {
            client: reqwest::Client::builder()
                .timeout(std::time::Duration::from_secs(60))
                .build()?,
            table_url: format!("{}/rest/v1/postings", supabase_url.trim_end_matches('/')),
            key: service_role_key.to_owned(),
        })
    }

    fn request(&self, builder: reqwest::RequestBuilder) -> reqwest::RequestBuilder {
        builder.header("apikey", &self.key).bearer_auth(&self.key)
    }

    /// Upsert the postings seen today, then deactivate those not seen for 7 days.
    pub async fn sync(
        &self,
        postings: &[Posting],
        now: DateTime<Utc>,
    ) -> anyhow::Result<SyncResult> {
        let rows: Vec<Row> = postings.iter().map(|p| row(p, now)).collect();
        for chunk in rows.chunks(BATCH) {
            let response = self
                .request(self.client.post(&self.table_url))
                .query(&[("on_conflict", "source,external_id")])
                .header("Prefer", "resolution=merge-duplicates,return=minimal")
                .json(chunk)
                .send()
                .await
                .map_err(|e| e.without_url())
                .context("upserting postings")?;
            check(response).await.context("upserting postings")?;
        }

        let cutoff =
            (now - Duration::days(EXPIRE_AFTER_DAYS)).to_rfc3339_opts(SecondsFormat::Secs, true);
        let response = self
            .request(self.client.patch(&self.table_url))
            .query(&[
                ("active", "eq.true".to_owned()),
                ("last_seen_at", format!("lt.{cutoff}")),
                ("select", "id".to_owned()),
            ])
            .header("Prefer", "return=representation")
            .json(&serde_json::json!({ "active": false }))
            .send()
            .await
            .map_err(|e| e.without_url())
            .context("expiring old postings")?;
        let expired: Vec<serde_json::Value> = check(response)
            .await
            .context("expiring old postings")?
            .json()
            .await
            .map_err(|e| e.without_url())?;
        Ok(SyncResult {
            upserted: rows.len(),
            expired: expired.len(),
        })
    }
}

/// Turn a non-2xx answer into an error that includes PostgREST's own explanation (it never
/// echoes our key).
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
    use serde_json::Value;
    use wiremock::matchers::{header, method, path, query_param};
    use wiremock::{Mock, MockServer, ResponseTemplate};

    fn posting() -> Posting {
        Posting {
            source: Source::Greenhouse,
            external_id: "1".into(),
            source_url: "https://example.com/1".into(),
            company: "Acme".into(),
            title: "Junior Analyst".into(),
            location: Some("Madrid, Spain".into()),
            city: Some("Madrid".into()),
            remote: false,
            level: Level::Junior,
            industry: Industry::Consulting,
            posted_at: None,
        }
    }

    #[test]
    fn row_has_exactly_the_columns_the_pipeline_writes() {
        let now = Utc.with_ymd_and_hms(2026, 11, 27, 0, 0, 0).unwrap();
        let value = serde_json::to_value(row(&posting(), now)).unwrap();
        let mut keys: Vec<_> = value.as_object().unwrap().keys().cloned().collect();
        keys.sort();
        assert_eq!(
            keys,
            [
                "active",
                "city",
                "company",
                "external_id",
                "industry",
                "last_seen_at",
                "level",
                "location",
                "posted_at",
                "remote",
                "source",
                "source_url",
                "title"
            ]
        );
        assert!(
            value.get("first_seen_at").is_none(),
            "never overwritten on conflict"
        );
        assert_eq!(value["source"], "greenhouse");
    }

    #[test]
    fn debug_output_hides_the_key() {
        let store = Store::new("https://p.supabase.co", "super-secret").unwrap();
        assert!(!format!("{store:?}").contains("super-secret"));
    }

    #[tokio::test]
    async fn upserts_then_expires_old_rows() {
        let server = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/rest/v1/postings"))
            .and(query_param("on_conflict", "source,external_id"))
            .and(header("authorization", "Bearer service-key"))
            .and(header("apikey", "service-key"))
            .respond_with(ResponseTemplate::new(201))
            .expect(1)
            .mount(&server)
            .await;
        Mock::given(method("PATCH"))
            .and(path("/rest/v1/postings"))
            .and(query_param("active", "eq.true"))
            .and(query_param("last_seen_at", "lt.2026-11-20T06:00:00Z"))
            .respond_with(
                ResponseTemplate::new(200)
                    .set_body_json(serde_json::json!([{"id": "a"}, {"id": "b"}])),
            )
            .expect(1)
            .mount(&server)
            .await;

        let store = Store::new(&server.uri(), "service-key").unwrap();
        let now = Utc.with_ymd_and_hms(2026, 11, 27, 6, 0, 0).unwrap();
        let result = store.sync(&[posting()], now).await.unwrap();
        assert_eq!(
            result,
            SyncResult {
                upserted: 1,
                expired: 2
            }
        );

        let requests = server.received_requests().await.unwrap();
        let body: Value = serde_json::from_slice(&requests[0].body).unwrap();
        assert_eq!(body[0]["active"], true);
        assert!(body[0].get("first_seen_at").is_none());
        let patch: Value = serde_json::from_slice(&requests[1].body).unwrap();
        assert_eq!(patch, serde_json::json!({"active": false}));
    }

    #[tokio::test]
    async fn database_errors_are_reported_without_the_key() {
        let server = MockServer::start().await;
        Mock::given(method("POST"))
            .respond_with(
                ResponseTemplate::new(401).set_body_string("{\"message\":\"Invalid API key\"}"),
            )
            .mount(&server)
            .await;
        let store = Store::new(&server.uri(), "service-key").unwrap();
        let error = store.sync(&[posting()], Utc::now()).await.unwrap_err();
        let text = format!("{error:#}");
        assert!(text.contains("401") && text.contains("Invalid API key"));
        assert!(!text.contains("service-key"));
    }
}
