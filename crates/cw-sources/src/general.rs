//! General job sources, not tied to one employer. Terms are in [`crate::terms`] and `SOURCES.md`.
//!
//! - Remotive: remote jobs, no key; one request returns the list.
//! - Jobicy: remote jobs, no key; one request per run.
//! - Adzuna: Spanish on-site jobs, free key (`ADZUNA_APP_ID` / `ADZUNA_APP_KEY`); skipped without it.

use std::collections::HashSet;

use cw_domain::{RawPosting, Source};
use serde::Deserialize;
use serde_json::Value;

use crate::error::FetchError;
use crate::http::HttpClient;
use crate::terms::terms;
use crate::util::{Id, OneOrMany, html_to_text, non_empty, parse_datetime};

pub const REMOTIVE_API: &str = "https://remotive.com/api/remote-jobs";
pub const JOBICY_API: &str = "https://jobicy.com/api/v2/remote-jobs";
pub const ADZUNA_API: &str = "https://api.adzuna.com/v1/api/jobs/es/search";

const NO_NAME: &str = "Empresa sin nombre";

/// "Remote" plus the region the job accepts, with whitespace squeezed.
fn remote_label(region: Option<&str>) -> String {
    let region = region
        .unwrap_or("")
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ");
    if region.is_empty() {
        "Remote".to_owned()
    } else {
        format!("Remote, {region}")
    }
}

fn company_or_default(name: Option<&str>) -> String {
    name.map(str::trim)
        .filter(|n| !n.is_empty())
        .unwrap_or(NO_NAME)
        .to_owned()
}

// --- Remotive ---------------------------------------------------------------------------------

#[derive(Deserialize)]
struct RemotivePayload {
    #[serde(default)]
    jobs: Vec<RemotiveJob>,
}

#[derive(Deserialize)]
struct RemotiveJob {
    id: Id,
    company_name: Option<String>,
    title: Option<String>,
    url: Option<String>,
    candidate_required_location: Option<String>,
    category: Option<String>,
    job_type: Option<String>,
    #[serde(default)]
    publication_date: Value,
}

pub fn parse_remotive(payload: Value) -> Result<Vec<RawPosting>, FetchError> {
    let payload: RemotivePayload = serde_json::from_value(payload)?;
    Ok(payload
        .jobs
        .into_iter()
        .map(|job| RawPosting {
            source: Source::Remotive,
            external_id: job.id.into_string(),
            company: company_or_default(job.company_name.as_deref()),
            title: html_to_text(job.title.as_deref()),
            url: job.url.unwrap_or_default(),
            location: Some(remote_label(job.candidate_required_location.as_deref())),
            department: job.category,
            employment_type: non_empty(job.job_type.map(|t| t.replace('_', " "))),
            workplace_type: Some("remote".to_owned()),
            posted_at: parse_datetime(&job.publication_date),
        })
        .collect())
}

pub async fn fetch_remotive(client: &HttpClient) -> Result<Vec<RawPosting>, FetchError> {
    parse_remotive(client.get_json(REMOTIVE_API, &[]).await?)
}

// --- Jobicy -----------------------------------------------------------------------------------

#[derive(Deserialize)]
struct JobicyPayload {
    #[serde(default)]
    jobs: Vec<JobicyJob>,
}

#[derive(Deserialize)]
struct JobicyJob {
    id: Id,
    #[serde(rename = "companyName")]
    company_name: Option<String>,
    #[serde(rename = "jobTitle")]
    job_title: Option<String>,
    url: Option<String>,
    #[serde(rename = "jobGeo")]
    job_geo: Option<OneOrMany>,
    #[serde(rename = "jobType")]
    job_type: Option<OneOrMany>,
    #[serde(rename = "jobIndustry")]
    job_industry: Option<OneOrMany>,
    #[serde(rename = "pubDate", default)]
    pub_date: Value,
}

pub fn parse_jobicy(payload: Value) -> Result<Vec<RawPosting>, FetchError> {
    let payload: JobicyPayload = serde_json::from_value(payload)?;
    Ok(payload
        .jobs
        .into_iter()
        .map(|job| RawPosting {
            source: Source::Jobicy,
            external_id: job.id.into_string(),
            company: company_or_default(job.company_name.as_deref()),
            title: html_to_text(job.job_title.as_deref()),
            url: job.url.unwrap_or_default(),
            location: Some(remote_label(job.job_geo.map(|g| g.joined()).as_deref())),
            department: non_empty(job.job_industry.map(|i| i.joined())),
            // Unlike the other fields, a missing `jobType` is kept as an empty string.
            employment_type: Some(job.job_type.map(|t| t.joined()).unwrap_or_default()),
            workplace_type: Some("remote".to_owned()),
            posted_at: parse_datetime(&job.pub_date),
        })
        .collect())
}

pub async fn fetch_jobicy(client: &HttpClient) -> Result<Vec<RawPosting>, FetchError> {
    let query = [("count", "100".to_owned()), ("geo", "spain".to_owned())];
    parse_jobicy(client.get_json(JOBICY_API, &query).await?)
}

// --- Adzuna -----------------------------------------------------------------------------------

#[derive(Deserialize)]
struct AdzunaPayload {
    #[serde(default)]
    results: Vec<AdzunaJob>,
}

#[derive(Deserialize)]
struct AdzunaJob {
    id: Id,
    title: Option<String>,
    company: Option<DisplayName>,
    location: Option<DisplayName>,
    category: Option<Label>,
    contract_type: Option<String>,
    contract_time: Option<String>,
    redirect_url: Option<String>,
    #[serde(default)]
    created: Value,
}

#[derive(Deserialize)]
struct DisplayName {
    display_name: Option<String>,
}

#[derive(Deserialize)]
struct Label {
    label: Option<String>,
}

pub fn parse_adzuna(payload: Value) -> Result<Vec<RawPosting>, FetchError> {
    let payload: AdzunaPayload = serde_json::from_value(payload)?;
    Ok(payload
        .results
        .into_iter()
        .map(|job| {
            let contract = [job.contract_type, job.contract_time]
                .into_iter()
                .filter_map(non_empty)
                .collect::<Vec<_>>()
                .join(" ");
            RawPosting {
                source: Source::Adzuna,
                external_id: job.id.into_string(),
                company: company_or_default(job.company.and_then(|c| c.display_name).as_deref()),
                title: html_to_text(job.title.as_deref()),
                url: job.redirect_url.unwrap_or_default(),
                location: job.location.and_then(|l| l.display_name),
                department: job.category.and_then(|c| c.label),
                employment_type: non_empty(Some(contract)),
                workplace_type: None,
                posted_at: parse_datetime(&job.created),
            }
        })
        .collect())
}

/// Credentials for the Adzuna API. Without them the source is skipped, not failed.
#[derive(Clone)]
pub struct AdzunaCredentials {
    app_id: String,
    app_key: String,
}

// Hand-written so the key can never end up in a log through `{:?}`.
impl std::fmt::Debug for AdzunaCredentials {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("AdzunaCredentials").finish_non_exhaustive()
    }
}

impl AdzunaCredentials {
    pub fn new(app_id: impl Into<String>, app_key: impl Into<String>) -> Self {
        Self {
            app_id: app_id.into(),
            app_key: app_key.into(),
        }
    }

    /// Reads `ADZUNA_APP_ID` and `ADZUNA_APP_KEY`; `None` when either is missing or empty.
    pub fn from_env() -> Option<Self> {
        let get = |name| std::env::var(name).ok().filter(|v| !v.is_empty());
        Some(Self::new(get("ADZUNA_APP_ID")?, get("ADZUNA_APP_KEY")?))
    }
}

/// Keyword searches in Spain, two pages of 50 per query, de-duplicated by id. Stays far under
/// the free tier (250 requests a day) thanks to the request cap in [`terms`].
pub async fn fetch_adzuna(
    client: &HttpClient,
    credentials: &AdzunaCredentials,
    queries: &[&str],
) -> Result<Vec<RawPosting>, FetchError> {
    fetch_adzuna_from(client, ADZUNA_API, credentials, queries).await
}

pub async fn fetch_adzuna_from(
    client: &HttpClient,
    api_base: &str,
    credentials: &AdzunaCredentials,
    queries: &[&str],
) -> Result<Vec<RawPosting>, FetchError> {
    const PAGES: u32 = 2;
    const PAGE_SIZE: usize = 50;
    let max_requests = terms(Source::Adzuna).max_requests_per_run;
    let mut seen = HashSet::new();
    let mut found = Vec::new();
    let mut requests = 0;
    for query in queries {
        for page in 1..=PAGES {
            if requests >= max_requests {
                return Ok(found);
            }
            requests += 1;
            let params = [
                ("app_id", credentials.app_id.clone()),
                ("app_key", credentials.app_key.clone()),
                ("what", (*query).to_owned()),
                ("max_days_old", "30".to_owned()),
                ("results_per_page", PAGE_SIZE.to_string()),
                ("sort_by", "date".to_owned()),
                ("content-type", "application/json".to_owned()),
            ];
            let data = client
                .get_json(&format!("{api_base}/{page}"), &params)
                .await?;
            let batch = parse_adzuna(data)?;
            let batch_len = batch.len();
            for posting in batch {
                if seen.insert(posting.external_id.clone()) {
                    found.push(posting);
                }
            }
            if batch_len < PAGE_SIZE {
                break;
            }
        }
    }
    Ok(found)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use std::time::Duration;
    use wiremock::matchers::{method, path, query_param};
    use wiremock::{Mock, MockServer, ResponseTemplate};

    fn fixture(name: &str) -> Value {
        let path = format!("{}/tests/fixtures/{name}.json", env!("CARGO_MANIFEST_DIR"));
        serde_json::from_str(&std::fs::read_to_string(path).unwrap()).unwrap()
    }

    #[test]
    fn fixtures_parse_into_complete_postings() {
        for postings in [
            parse_remotive(fixture("remotive")).unwrap(),
            parse_jobicy(fixture("jobicy")).unwrap(),
            parse_adzuna(fixture("adzuna")).unwrap(),
        ] {
            assert!(!postings.is_empty());
            for p in postings {
                assert!(!p.external_id.is_empty() && !p.title.is_empty() && !p.company.is_empty());
                assert!(p.url.starts_with("http"));
            }
        }
    }

    #[test]
    fn adzuna_strips_html_from_titles() {
        let first = &parse_adzuna(fixture("adzuna")).unwrap()[0];
        assert_eq!(first.title, "Becario/a de Finanzas");
        assert!(first.url.starts_with("https://www.adzuna.es/"));
    }

    #[test]
    fn remote_sources_mark_the_location_remote() {
        for p in parse_remotive(fixture("remotive")).unwrap() {
            assert_eq!(p.workplace_type.as_deref(), Some("remote"));
            assert!(p.location.unwrap().starts_with("Remote"));
        }
    }

    #[test]
    fn missing_company_gets_a_placeholder() {
        let payload =
            json!({"jobs": [{"id": 7, "company_name": "  ", "title": "T", "url": "https://x"}]});
        assert_eq!(parse_remotive(payload).unwrap()[0].company, NO_NAME);
    }

    #[test]
    fn credentials_never_show_up_in_debug_output() {
        let text = format!("{:?}", AdzunaCredentials::new("id", "TOP-SECRET"));
        assert!(!text.contains("TOP-SECRET"));
    }

    #[tokio::test]
    async fn adzuna_dedupes_and_stops_at_a_short_page() {
        let server = MockServer::start().await;
        let results: Vec<Value> = (0..3)
            .map(|i| json!({"id": i.to_string(), "title": "Junior", "redirect_url": "https://x"}))
            .collect();
        Mock::given(method("GET"))
            .and(path("/1"))
            .and(query_param("app_id", "id"))
            .respond_with(ResponseTemplate::new(200).set_body_json(json!({"results": results})))
            .expect(2) // one request per query; a short page ends the paging
            .mount(&server)
            .await;
        let client = HttpClient::new()
            .unwrap()
            .with_backoff(Duration::from_millis(1));
        let credentials = AdzunaCredentials::new("id", "key");
        let found = fetch_adzuna_from(&client, &server.uri(), &credentials, &["junior", "becario"])
            .await
            .unwrap();
        assert_eq!(found.len(), 3);
    }
}
