use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{Industry, Level, Source};

/// What a source parser returns, before filtering and tagging. Internal to the engine, so it is
/// not exported to TypeScript.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RawPosting {
    pub source: Source,
    pub external_id: String,
    pub company: String,
    pub title: String,
    pub url: String,
    pub location: Option<String>,
    pub department: Option<String>,
    pub employment_type: Option<String>,
    /// `remote`, `hybrid` or `onsite`, exactly as the source reports it.
    pub workplace_type: Option<String>,
    pub posted_at: Option<DateTime<Utc>>,
}

/// A kept posting, ready for the `postings` table. The database adds `id` and `first_seen_at`;
/// the website's own row type extends this one with them.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Posting {
    pub source: Source,
    pub external_id: String,
    pub source_url: String,
    pub company: String,
    pub title: String,
    pub location: Option<String>,
    pub city: Option<String>,
    pub remote: bool,
    pub level: Level,
    pub industry: Industry,
    pub posted_at: Option<DateTime<Utc>>,
}

#[cfg(test)]
mod tests {
    use super::*;

    fn json<T: Serialize>(value: &T) -> String {
        serde_json::to_string(value).unwrap()
    }

    #[test]
    fn serialized_names_match_the_database() {
        assert_eq!(json(&Level::Intern), "\"intern\"");
        assert_eq!(json(&Industry::Consulting), "\"consulting\"");
        assert_eq!(json(&Source::SmartRecruiters), "\"smartrecruiters\"");
    }

    #[test]
    fn source_round_trips_through_its_name() {
        for source in Source::ALL {
            assert_eq!(source.as_str().parse::<Source>(), Ok(source));
            assert_eq!(json(&source), format!("\"{source}\""));
        }
        assert!("linkedin".parse::<Source>().is_err());
    }

    #[test]
    fn posting_serializes_dates_as_rfc3339() {
        let posting = Posting {
            source: Source::Workable,
            external_id: "ABC123".into(),
            source_url: "https://apply.workable.com/example/j/ABC123/".into(),
            company: "Example".into(),
            title: "Junior Data Analyst".into(),
            location: Some("Madrid, Spain".into()),
            city: Some("Madrid".into()),
            remote: false,
            level: Level::Junior,
            industry: Industry::DataScience,
            posted_at: Some("2026-11-20T00:00:00Z".parse().unwrap()),
        };
        let value = serde_json::to_value(&posting).unwrap();
        assert_eq!(value["posted_at"], "2026-11-20T00:00:00Z");
        assert_eq!(value["level"], "junior");
    }
}
