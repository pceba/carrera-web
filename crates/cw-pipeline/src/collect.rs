//! Collect from every source, classify, and keep count of what happened to each one.

use std::collections::{BTreeMap, HashSet};

use cw_classify::Rules;
use cw_domain::{Posting, RawPosting, Source};
use cw_sources::{
    AdzunaCredentials, HttpClient, fetch_adzuna, fetch_board, fetch_jobicy, fetch_remotive,
};
use futures::StreamExt;
use serde::Serialize;

use crate::config::Company;

/// Search terms sent to Adzuna (Spanish on-site jobs).
const ADZUNA_QUERIES: [&str; 7] = [
    "junior",
    "becario",
    "prácticas",
    "trainee",
    "graduate",
    "analista junior",
    "programa de graduados",
];

/// How many company boards are downloaded at the same time.
const BOARD_CONCURRENCY: usize = 6;

/// What happened to one source in this run.
#[derive(Debug, Default, Clone, PartialEq, Eq, Serialize)]
pub struct SourceStats {
    pub fetched: usize,
    pub kept: usize,
    pub errors: Vec<String>,
    /// Why the source was not even tried (e.g. missing API key).
    pub skipped: Option<String>,
}

pub type Stats = BTreeMap<Source, SourceStats>;

pub struct Collected {
    pub raw: Vec<RawPosting>,
    pub stats: Stats,
}

/// Fetch every source. One failing source or board never stops the rest: its error is recorded
/// in the stats and the run continues.
pub async fn collect_raw(
    client: &HttpClient,
    companies: &[Company],
    only: Option<&HashSet<Source>>,
    adzuna: Option<&AdzunaCredentials>,
) -> Collected {
    let wanted = |source: Source| only.is_none_or(|set| set.contains(&source));
    let mut raw = Vec::new();
    let mut stats = Stats::new();

    // `buffered` (not `buffer_unordered`) keeps the results in the order of the YAML file, so
    // the output is the same from one run to the next.
    let boards: Vec<_> = companies.iter().filter(|c| wanted(c.ats)).collect();
    let results: Vec<_> = futures::stream::iter(boards)
        .map(|company| async move {
            let result = fetch_board(client, company.ats, &company.name, &company.slug).await;
            (company, result)
        })
        .buffered(BOARD_CONCURRENCY)
        .collect()
        .await;
    for (company, result) in results {
        let entry = stats.entry(company.ats).or_default();
        match result {
            Ok(items) => {
                entry.fetched += items.len();
                raw.extend(items);
            }
            Err(error) => entry.errors.push(format!("{}: {error}", company.name)),
        }
    }

    if wanted(Source::Remotive) {
        record(
            &mut stats,
            &mut raw,
            Source::Remotive,
            fetch_remotive(client).await,
        );
    }
    if wanted(Source::Jobicy) {
        record(
            &mut stats,
            &mut raw,
            Source::Jobicy,
            fetch_jobicy(client).await,
        );
    }
    if wanted(Source::Adzuna) {
        match adzuna {
            Some(credentials) => {
                let result = fetch_adzuna(client, credentials, &ADZUNA_QUERIES).await;
                record(&mut stats, &mut raw, Source::Adzuna, result);
            }
            None => {
                stats.entry(Source::Adzuna).or_default().skipped =
                    Some("ADZUNA_APP_ID / ADZUNA_APP_KEY not set".to_owned());
            }
        }
    }
    Collected { raw, stats }
}

fn record(
    stats: &mut Stats,
    raw: &mut Vec<RawPosting>,
    source: Source,
    result: Result<Vec<RawPosting>, cw_sources::FetchError>,
) {
    let entry = stats.entry(source).or_default();
    match result {
        Ok(items) => {
            entry.fetched += items.len();
            raw.extend(items);
        }
        Err(error) => entry.errors.push(error.to_string()),
    }
}

/// Keep the junior-in-Spain postings and count them per source. A posting seen twice (same
/// source and external id) is kept once, the first time.
pub fn classify_all(raw: &[RawPosting], rules: &Rules, stats: &mut Stats) -> Vec<Posting> {
    let mut seen = HashSet::new();
    let mut kept = Vec::new();
    for item in raw {
        if let Some(posting) = rules.classify(item)
            && seen.insert((posting.source, posting.external_id.clone()))
        {
            stats.entry(posting.source).or_default().kept += 1;
            kept.push(posting);
        }
    }
    kept
}

#[cfg(test)]
mod tests {
    use super::*;

    fn raw(id: &str, title: &str) -> RawPosting {
        RawPosting {
            source: Source::Lever,
            external_id: id.into(),
            company: "Acme".into(),
            title: title.into(),
            url: "https://example.com".into(),
            location: Some("Madrid, Spain".into()),
            department: None,
            employment_type: None,
            workplace_type: None,
            posted_at: None,
        }
    }

    #[test]
    fn counts_kept_postings_and_drops_duplicates() {
        let items = [
            raw("1", "Junior Analyst"),
            raw("1", "Junior Analyst (copy)"),
            raw("2", "Senior Analyst"),
            raw("3", "Marketing Intern"),
        ];
        let mut stats = Stats::new();
        let kept = classify_all(&items, &Rules::bundled(), &mut stats);
        assert_eq!(kept.len(), 2);
        assert_eq!(kept[0].title, "Junior Analyst");
        assert_eq!(stats[&Source::Lever].kept, 2);
    }
}
