//! The dry run: write what would be stored as JSON, so a human (or a CI artifact) can inspect it.

use std::collections::BTreeMap;
use std::path::Path;

use chrono::{DateTime, SecondsFormat, Utc};
use cw_domain::{Industry, Level, Posting};
use serde::Serialize;

use crate::collect::Stats;

#[derive(Debug, Serialize)]
pub struct Summary<'a> {
    pub generated_at: String,
    pub total_kept: usize,
    pub by_source: &'a Stats,
    pub by_level: BTreeMap<Level, usize>,
    pub by_industry: BTreeMap<Industry, usize>,
}

pub fn summarize<'a>(postings: &[Posting], stats: &'a Stats, now: DateTime<Utc>) -> Summary<'a> {
    let mut by_level = BTreeMap::new();
    let mut by_industry = BTreeMap::new();
    for posting in postings {
        *by_level.entry(posting.level).or_insert(0) += 1;
        *by_industry.entry(posting.industry).or_insert(0) += 1;
    }
    Summary {
        generated_at: now.to_rfc3339_opts(SecondsFormat::Secs, true),
        total_kept: postings.len(),
        by_source: stats,
        by_level,
        by_industry,
    }
}

/// Writes `postings.json` and `summary.json` into `dir` (created if missing).
pub fn write_json(dir: &Path, postings: &[Posting], stats: &Stats) -> anyhow::Result<()> {
    std::fs::create_dir_all(dir)?;
    std::fs::write(
        dir.join("postings.json"),
        serde_json::to_string_pretty(postings)?,
    )?;
    let summary = summarize(postings, stats, Utc::now());
    std::fs::write(
        dir.join("summary.json"),
        serde_json::to_string_pretty(&summary)?,
    )?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use cw_domain::Source;

    #[test]
    fn dry_run_writes_both_files() {
        let posting = Posting {
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
        };
        let mut stats = Stats::new();
        stats.entry(Source::Greenhouse).or_default().kept = 1;
        let dir = tempfile::tempdir().unwrap();
        write_json(dir.path(), &[posting], &stats).unwrap();

        let postings: serde_json::Value = serde_json::from_str(
            &std::fs::read_to_string(dir.path().join("postings.json")).unwrap(),
        )
        .unwrap();
        assert_eq!(postings[0]["title"], "Junior Analyst");
        let summary: serde_json::Value = serde_json::from_str(
            &std::fs::read_to_string(dir.path().join("summary.json")).unwrap(),
        )
        .unwrap();
        assert_eq!(summary["total_kept"], 1);
        assert_eq!(summary["by_source"]["greenhouse"]["kept"], 1);
        assert_eq!(summary["by_level"]["junior"], 1);
        assert_eq!(summary["by_industry"]["consulting"], 1);
    }
}
