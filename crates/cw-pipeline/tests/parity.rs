//! Parity with the Python pipeline this crate replaces.
//!
//! `tests/golden/*.json` were produced once by running the Python parsers and classifier
//! (`pipeline/`, now deleted) over the recorded fixtures in `crates/cw-sources/tests/fixtures/`
//! and over a matrix of 605 synthetic postings (titles x companies x locations x metadata,
//! seeded sample). These tests assert that the Rust code returns exactly the same postings, with
//! the same tags, and the same plain text for HTML titles.
//!
//! Phase 2 narrowed the industry taxonomy to six industries and drops the rest (see
//! `docs/decisions.md`), so **industry is no longer compared**: only the parsers, the level and
//! the location decisions still have to equal Python. A posting Python kept may now be dropped for
//! having no industry; the tests below check that the level/place verdict alone still agrees.

use cw_classify::Rules;
use cw_domain::{Level, RawPosting};
use cw_sources::{
    html_to_text, parse_adzuna, parse_ashby, parse_greenhouse, parse_jobicy, parse_lever,
    parse_remotive, parse_smartrecruiters, parse_workable,
};
use serde::Deserialize;
use serde_json::Value;

fn read(path: &str) -> String {
    std::fs::read_to_string(format!("{}/{path}", env!("CARGO_MANIFEST_DIR")))
        .unwrap_or_else(|e| panic!("{path}: {e}"))
}

fn fixture(name: &str) -> Value {
    serde_json::from_str(&read(&format!("../cw-sources/tests/fixtures/{name}.json"))).unwrap()
}

/// What Python decided about a posting apart from its industry: level, city and remote flag, or
/// `None` when it was rejected for level or location.
fn verdict(rules: &Rules, raw: &RawPosting) -> Option<(Level, Option<String>, bool)> {
    if !raw.url.starts_with("http") || raw.title.is_empty() {
        return None;
    }
    let level = rules.detect_level(raw)?;
    let place = rules.detect_place(raw)?;
    Some((level, place.city, place.remote))
}

#[derive(Deserialize)]
struct GoldenFixture {
    raw: Vec<RawPosting>,
    kept: Vec<GoldenKept>,
}

/// A Python-kept posting; the old `industry` tag is ignored on purpose (see module docs).
#[derive(Deserialize)]
struct GoldenKept {
    level: Level,
    city: Option<String>,
    remote: bool,
}

#[test]
fn parsers_and_classifier_match_python_on_the_recorded_fixtures() {
    let golden: std::collections::BTreeMap<String, GoldenFixture> =
        serde_json::from_str(&read("tests/golden/python_fixtures.json")).unwrap();
    let rules = Rules::bundled();

    let parsed: [(&str, Vec<RawPosting>); 8] = [
        (
            "greenhouse",
            parse_greenhouse(fixture("greenhouse"), "Celonis").unwrap(),
        ),
        ("lever", parse_lever(fixture("lever"), "Veepee").unwrap()),
        ("ashby", parse_ashby(fixture("ashby"), "OpenAI").unwrap()),
        (
            "workable",
            parse_workable(fixture("workable"), "Example").unwrap(),
        ),
        (
            "smartrecruiters",
            parse_smartrecruiters(&fixture("smartrecruiters"), "Bosch", "BoschGroup").unwrap(),
        ),
        ("remotive", parse_remotive(fixture("remotive")).unwrap()),
        ("jobicy", parse_jobicy(fixture("jobicy")).unwrap()),
        ("adzuna", parse_adzuna(fixture("adzuna")).unwrap()),
    ];
    assert_eq!(golden.len(), parsed.len());

    let mut kept_total = 0;
    for (name, raw) in parsed {
        let expected = &golden[name];
        assert_eq!(
            raw, expected.raw,
            "{name}: parsed postings differ from Python"
        );
        let kept: Vec<_> = raw.iter().filter_map(|r| verdict(&rules, r)).collect();
        let expected_kept: Vec<_> = expected
            .kept
            .iter()
            .map(|p| (p.level, p.city.clone(), p.remote))
            .collect();
        assert_eq!(
            kept, expected_kept,
            "{name}: kept postings differ from Python"
        );
        kept_total += kept.len();
    }
    // Guards against an empty golden file making the test vacuous.
    assert_eq!(kept_total, 4);
}

#[derive(Deserialize)]
struct MatrixCase {
    raw: RawPosting,
    kept: Option<MatrixKept>,
}

#[derive(Deserialize)]
struct MatrixKept {
    level: Level,
    city: Option<String>,
    remote: bool,
}

#[test]
fn classifier_matches_python_on_the_synthetic_matrix() {
    let cases: Vec<MatrixCase> =
        serde_json::from_str(&read("tests/golden/python_matrix.json")).unwrap();
    assert!(cases.len() > 600);
    let rules = Rules::bundled();

    let mut kept_count = 0;
    let mut failures = Vec::new();
    for case in &cases {
        let got = verdict(&rules, &case.raw);
        let expected = case
            .kept
            .as_ref()
            .map(|k| (k.level, k.city.clone(), k.remote));
        kept_count += usize::from(got.is_some());
        if got != expected {
            failures.push(format!(
                "{:?} @ {:?} -> rust {got:?}, python {expected:?}",
                case.raw.title, case.raw.location,
            ));
        }
    }
    assert!(
        failures.is_empty(),
        "{} mismatches:\n{}",
        failures.len(),
        failures.join("\n")
    );
    assert_eq!(
        kept_count, 290,
        "the matrix must keep and drop both kinds of postings"
    );
}

#[derive(Deserialize)]
struct HtmlCase {
    #[serde(rename = "in")]
    input: Option<String>,
    out: String,
}

#[test]
fn html_to_text_matches_python() {
    let cases: Vec<HtmlCase> =
        serde_json::from_str(&read("tests/golden/python_html.json")).unwrap();
    for case in cases {
        assert_eq!(
            html_to_text(case.input.as_deref()),
            case.out,
            "input: {:?}",
            case.input
        );
    }
}
