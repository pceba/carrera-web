//! Company ATS boards: public, documented job-board endpoints, one GET per company.
//!
//! - Greenhouse: <https://developers.greenhouse.io/job-board.html>
//! - Lever: <https://github.com/lever/postings-api>
//! - Ashby: <https://developers.ashbyhq.com/docs/public-job-posting-api>
//! - Workable: `https://apply.workable.com/api/v1/widget/accounts/{slug}`
//! - SmartRecruiters: <https://developers.smartrecruiters.com/docs/posting-api>
//!
//! Descriptions are never fetched: the public page only links to the original listing.
//!
//! Each `parse_*` function is pure (JSON in, postings out) so it is tested on recorded fixtures;
//! the `fetch_*` functions add the HTTP call. Serde structs describe only the fields we read.

use cw_domain::{RawPosting, Source};
use serde::Deserialize;
use serde_json::Value;

use crate::error::FetchError;
use crate::http::HttpClient;
use crate::util::{Id, non_empty, or_else_empty, parse_datetime, parse_first_date};

/// Download and parse one company's board.
pub async fn fetch_board(
    client: &HttpClient,
    source: Source,
    company: &str,
    slug: &str,
) -> Result<Vec<RawPosting>, FetchError> {
    match source {
        Source::Greenhouse => {
            let url = format!("https://boards-api.greenhouse.io/v1/boards/{slug}/jobs");
            parse_greenhouse(client.get_json(&url, &[]).await?, company)
        }
        Source::Lever => {
            let url = format!("https://api.lever.co/v0/postings/{slug}?mode=json");
            parse_lever(client.get_json(&url, &[]).await?, company)
        }
        Source::Ashby => {
            let url = format!("https://api.ashbyhq.com/posting-api/job-board/{slug}");
            parse_ashby(client.get_json(&url, &[]).await?, company)
        }
        Source::Workable => {
            let url = format!("https://apply.workable.com/api/v1/widget/accounts/{slug}");
            parse_workable(client.get_json(&url, &[]).await?, company)
        }
        Source::SmartRecruiters => {
            fetch_smartrecruiters(client, SMARTRECRUITERS_API, company, slug).await
        }
        other => Err(FetchError::Transport {
            url: slug.to_owned(),
            message: format!("{other} is not a company board"),
        }),
    }
}

// --- Greenhouse -------------------------------------------------------------------------------

#[derive(Deserialize)]
struct GreenhousePayload {
    #[serde(default)]
    jobs: Vec<GreenhouseJob>,
}

#[derive(Deserialize)]
struct GreenhouseJob {
    id: Id,
    title: String,
    absolute_url: String,
    location: Option<NamedItem>,
    departments: Option<Vec<NamedItem>>,
    #[serde(default)]
    first_published: Value,
    #[serde(default)]
    updated_at: Value,
}

#[derive(Deserialize)]
struct NamedItem {
    name: Option<String>,
}

pub fn parse_greenhouse(payload: Value, company: &str) -> Result<Vec<RawPosting>, FetchError> {
    let payload: GreenhousePayload = serde_json::from_value(payload)?;
    Ok(payload
        .jobs
        .into_iter()
        .map(|job| {
            let departments: Vec<String> = job
                .departments
                .unwrap_or_default()
                .into_iter()
                .filter_map(|d| non_empty(d.name))
                .collect();
            RawPosting {
                source: Source::Greenhouse,
                external_id: job.id.into_string(),
                company: company.to_owned(),
                title: job.title.trim().to_owned(),
                url: job.absolute_url,
                location: job.location.and_then(|l| l.name),
                department: non_empty(Some(departments.join(", "))),
                employment_type: None,
                workplace_type: None,
                posted_at: parse_first_date(&job.first_published, &job.updated_at),
            }
        })
        .collect())
}

// --- Lever ------------------------------------------------------------------------------------

#[derive(Deserialize)]
struct LeverJob {
    id: String,
    text: String,
    #[serde(rename = "hostedUrl")]
    hosted_url: String,
    categories: Option<LeverCategories>,
    #[serde(rename = "workplaceType")]
    workplace_type: Option<String>,
    #[serde(rename = "createdAt", default)]
    created_at: Value,
}

#[derive(Deserialize, Default)]
struct LeverCategories {
    #[serde(rename = "allLocations")]
    all_locations: Option<Vec<String>>,
    location: Option<String>,
    team: Option<String>,
    department: Option<String>,
    commitment: Option<String>,
}

/// Lever answers with a bare JSON array.
pub fn parse_lever(payload: Value, company: &str) -> Result<Vec<RawPosting>, FetchError> {
    let jobs: Vec<LeverJob> = serde_json::from_value(payload)?;
    Ok(jobs
        .into_iter()
        .map(|job| {
            let categories = job.categories.unwrap_or_default();
            let locations = categories.all_locations.unwrap_or_default();
            RawPosting {
                source: Source::Lever,
                external_id: job.id,
                company: company.to_owned(),
                title: job.text.trim().to_owned(),
                url: job.hosted_url,
                location: if locations.is_empty() {
                    categories.location
                } else {
                    Some(locations.join("; "))
                },
                department: or_else_empty(categories.team, categories.department),
                employment_type: categories.commitment,
                workplace_type: job.workplace_type,
                posted_at: parse_datetime(&job.created_at),
            }
        })
        .collect())
}

// --- Ashby ------------------------------------------------------------------------------------

#[derive(Deserialize)]
struct AshbyPayload {
    #[serde(default)]
    jobs: Vec<AshbyJob>,
}

#[derive(Deserialize)]
struct AshbyJob {
    id: String,
    title: String,
    #[serde(rename = "jobUrl")]
    job_url: String,
    #[serde(rename = "isListed")]
    is_listed: Option<bool>,
    location: Option<String>,
    #[serde(rename = "secondaryLocations")]
    secondary_locations: Option<Vec<AshbyLocation>>,
    team: Option<String>,
    department: Option<String>,
    #[serde(rename = "employmentType")]
    employment_type: Option<String>,
    #[serde(rename = "isRemote")]
    is_remote: Option<bool>,
    #[serde(rename = "workplaceType")]
    workplace_type: Option<String>,
    #[serde(rename = "publishedAt", default)]
    published_at: Value,
}

#[derive(Deserialize)]
struct AshbyLocation {
    location: Option<String>,
}

pub fn parse_ashby(payload: Value, company: &str) -> Result<Vec<RawPosting>, FetchError> {
    let payload: AshbyPayload = serde_json::from_value(payload)?;
    Ok(payload
        .jobs
        .into_iter()
        .filter(|job| job.is_listed != Some(false))
        .map(|job| {
            let locations: Vec<String> = std::iter::once(job.location)
                .chain(
                    job.secondary_locations
                        .unwrap_or_default()
                        .into_iter()
                        .map(|s| s.location),
                )
                .filter_map(non_empty)
                .collect();
            RawPosting {
                source: Source::Ashby,
                external_id: job.id,
                company: company.to_owned(),
                title: job.title.trim().to_owned(),
                url: job.job_url,
                location: non_empty(Some(locations.join("; "))),
                department: or_else_empty(job.team, job.department),
                employment_type: job.employment_type,
                workplace_type: if job.is_remote == Some(true) {
                    Some("remote".to_owned())
                } else {
                    job.workplace_type
                },
                posted_at: parse_datetime(&job.published_at),
            }
        })
        .collect())
}

// --- Workable ---------------------------------------------------------------------------------

#[derive(Deserialize)]
struct WorkablePayload {
    #[serde(default)]
    jobs: Vec<WorkableJob>,
}

#[derive(Deserialize)]
struct WorkableJob {
    shortcode: String,
    title: String,
    url: Option<String>,
    shortlink: Option<String>,
    department: Option<String>,
    employment_type: Option<String>,
    telecommuting: Option<bool>,
    #[serde(default)]
    published_on: Value,
    #[serde(default)]
    created_at: Value,
    locations: Option<Vec<WorkableLocation>>,
    city: Option<String>,
    country: Option<String>,
}

#[derive(Deserialize)]
struct WorkableLocation {
    city: Option<String>,
    country: Option<String>,
}

impl WorkableLocation {
    fn label(self) -> String {
        [self.city, self.country]
            .into_iter()
            .filter_map(non_empty)
            .collect::<Vec<_>>()
            .join(", ")
    }
}

pub fn parse_workable(payload: Value, company: &str) -> Result<Vec<RawPosting>, FetchError> {
    let payload: WorkablePayload = serde_json::from_value(payload)?;
    Ok(payload
        .jobs
        .into_iter()
        .map(|job| {
            // Some accounts only fill the flat `city`/`country`; an empty list falls back to them.
            let locations = match job.locations {
                Some(list) if !list.is_empty() => list,
                _ => vec![WorkableLocation {
                    city: job.city,
                    country: job.country,
                }],
            };
            let location = locations
                .into_iter()
                .map(WorkableLocation::label)
                .collect::<Vec<_>>()
                .join("; ");
            RawPosting {
                source: Source::Workable,
                external_id: job.shortcode,
                company: company.to_owned(),
                title: job.title.trim().to_owned(),
                url: or_else_empty(job.url, job.shortlink).unwrap_or_default(),
                location: non_empty(Some(location)),
                department: non_empty(job.department),
                employment_type: non_empty(job.employment_type),
                workplace_type: (job.telecommuting == Some(true)).then(|| "remote".to_owned()),
                posted_at: parse_first_date(&job.published_on, &job.created_at),
            }
        })
        .collect())
}

// --- SmartRecruiters --------------------------------------------------------------------------

pub const SMARTRECRUITERS_API: &str = "https://api.smartrecruiters.com";
const SMARTRECRUITERS_PAGE: usize = 100;
const SMARTRECRUITERS_MAX_PAGES: usize = 5;

#[derive(Deserialize)]
struct SmartPayload {
    #[serde(default)]
    content: Vec<SmartItem>,
    #[serde(rename = "totalFound", default)]
    total_found: usize,
}

#[derive(Deserialize)]
struct SmartItem {
    id: Id,
    name: String,
    location: Option<SmartLocation>,
    department: Option<SmartLabel>,
    #[serde(rename = "typeOfEmployment")]
    type_of_employment: Option<SmartLabel>,
    #[serde(rename = "releasedDate", default)]
    released_date: Value,
}

#[derive(Deserialize)]
struct SmartLocation {
    remote: Option<bool>,
    hybrid: Option<bool>,
    #[serde(rename = "fullLocation")]
    full_location: Option<String>,
    city: Option<String>,
}

#[derive(Deserialize)]
struct SmartLabel {
    label: Option<String>,
}

pub fn parse_smartrecruiters(
    payload: &Value,
    company: &str,
    slug: &str,
) -> Result<Vec<RawPosting>, FetchError> {
    let payload: SmartPayload = serde_json::from_value(payload.clone())?;
    Ok(payload
        .content
        .into_iter()
        .map(|item| {
            let id = item.id.into_string();
            let location = item.location;
            let workplace_type = match &location {
                Some(l) if l.remote == Some(true) => Some("remote".to_owned()),
                Some(l) if l.hybrid == Some(true) => Some("hybrid".to_owned()),
                _ => None,
            };
            RawPosting {
                source: Source::SmartRecruiters,
                url: format!("https://jobs.smartrecruiters.com/{slug}/{id}"),
                external_id: id,
                company: company.to_owned(),
                title: item.name.trim().to_owned(),
                location: location.and_then(|l| or_else_empty(l.full_location, l.city)),
                department: item.department.and_then(|d| d.label),
                employment_type: item.type_of_employment.and_then(|t| t.label),
                workplace_type,
                posted_at: parse_datetime(&item.released_date),
            }
        })
        .collect())
}

/// Spain only (a server-side filter) keeps paging short; capped at five pages of 100.
pub async fn fetch_smartrecruiters(
    client: &HttpClient,
    api_base: &str,
    company: &str,
    slug: &str,
) -> Result<Vec<RawPosting>, FetchError> {
    let url = format!("{api_base}/v1/companies/{slug}/postings");
    let mut items = Vec::new();
    for page in 0..SMARTRECRUITERS_MAX_PAGES {
        let query = [
            ("limit", SMARTRECRUITERS_PAGE.to_string()),
            ("offset", (page * SMARTRECRUITERS_PAGE).to_string()),
            ("country", "es".to_owned()),
        ];
        let data = client.get_json(&url, &query).await?;
        let (total, empty) = {
            let payload: SmartPayload = serde_json::from_value(data.clone())?;
            (payload.total_found, payload.content.is_empty())
        };
        items.extend(parse_smartrecruiters(&data, company, slug)?);
        if (page + 1) * SMARTRECRUITERS_PAGE >= total || empty {
            break;
        }
    }
    Ok(items)
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
        let all = [
            parse_greenhouse(fixture("greenhouse"), "Celonis").unwrap(),
            parse_lever(fixture("lever"), "Veepee").unwrap(),
            parse_ashby(fixture("ashby"), "OpenAI").unwrap(),
            parse_workable(fixture("workable"), "Example").unwrap(),
            parse_smartrecruiters(&fixture("smartrecruiters"), "Bosch", "BoschGroup").unwrap(),
        ];
        for postings in all {
            assert!(!postings.is_empty());
            for p in postings {
                assert!(!p.external_id.is_empty() && !p.title.is_empty() && !p.company.is_empty());
                assert!(p.url.starts_with("http"));
            }
        }
    }

    #[test]
    fn workable_location_and_date() {
        let p = &parse_workable(fixture("workable"), "Example").unwrap()[0];
        assert_eq!(p.location.as_deref(), Some("Madrid, Spain"));
        assert_eq!(
            p.posted_at.unwrap().to_rfc3339(),
            "2026-11-20T00:00:00+00:00"
        );
    }

    #[test]
    fn ashby_skips_unlisted_jobs_and_marks_remote() {
        let payload = json!({"jobs": [
            {"id": "1", "title": " A ", "jobUrl": "https://x/1", "isListed": false},
            {"id": "2", "title": "B", "jobUrl": "https://x/2", "isRemote": true, "location": "Madrid",
             "secondaryLocations": [{"location": "Lisbon"}, {"location": null}]},
        ]});
        let jobs = parse_ashby(payload, "Co").unwrap();
        assert_eq!(jobs.len(), 1);
        assert_eq!(jobs[0].workplace_type.as_deref(), Some("remote"));
        assert_eq!(jobs[0].location.as_deref(), Some("Madrid; Lisbon"));
    }

    #[test]
    fn a_job_missing_a_required_field_fails_the_board() {
        let payload = json!({"jobs": [{"title": "No id", "absolute_url": "https://x"}]});
        assert!(parse_greenhouse(payload, "Co").is_err());
    }

    #[tokio::test]
    async fn smartrecruiters_pages_until_everything_is_read() {
        let server = MockServer::start().await;
        let page = |ids: std::ops::Range<u32>, total: u32| {
            let content: Vec<Value> = ids
                .map(|i| json!({"id": i.to_string(), "name": format!("Junior {i}")}))
                .collect();
            ResponseTemplate::new(200)
                .set_body_json(json!({"totalFound": total, "content": content}))
        };
        Mock::given(method("GET"))
            .and(path("/v1/companies/acme/postings"))
            .and(query_param("offset", "0"))
            .and(query_param("country", "es"))
            .respond_with(page(0..100, 130))
            .expect(1)
            .mount(&server)
            .await;
        Mock::given(method("GET"))
            .and(path("/v1/companies/acme/postings"))
            .and(query_param("offset", "100"))
            .respond_with(page(100..130, 130))
            .expect(1)
            .mount(&server)
            .await;
        let client = HttpClient::new()
            .unwrap()
            .with_backoff(Duration::from_millis(1));
        let items = fetch_smartrecruiters(&client, &server.uri(), "Acme", "acme")
            .await
            .unwrap();
        assert_eq!(items.len(), 130);
        assert_eq!(items[0].url, "https://jobs.smartrecruiters.com/acme/0");
    }
}
