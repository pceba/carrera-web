//! Parity with the Python pipeline this crate replaces.
//!
//! `tests/golden/*.json` were produced once by running the Python parsers and classifier
//! (`pipeline/`, now deleted) over the recorded fixtures in `crates/cw-sources/tests/fixtures/`
//! and over a matrix of 605 synthetic postings (titles x companies x locations x metadata,
//! seeded sample). These tests assert that the Rust code returns exactly the same postings, with
//! the same tags, and the same plain text for HTML titles.

use cw_classify::Rules;
use cw_domain::{Industry, Level, Posting, RawPosting};
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

#[derive(Deserialize)]
struct GoldenFixture {
    raw: Vec<RawPosting>,
    kept: Vec<Posting>,
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
        let kept: Vec<Posting> = raw.iter().filter_map(|r| rules.classify(r)).collect();
        assert_eq!(
            kept, expected.kept,
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
    industry: Industry,
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
        let got = rules.classify(&case.raw);
        let same = match (&got, &case.kept) {
            (None, None) => true,
            (Some(g), Some(k)) => {
                g.level == k.level
                    && g.industry == k.industry
                    && g.city == k.city
                    && g.remote == k.remote
            }
            _ => false,
        };
        kept_count += usize::from(got.is_some());
        if !same {
            failures.push(format!(
                "{:?} @ {:?} -> rust {:?}, python {:?}",
                case.raw.title,
                case.raw.location,
                got.map(|g| (g.level, g.industry, g.city, g.remote)),
                case.kept
                    .as_ref()
                    .map(|k| (k.level, k.industry, &k.city, k.remote)),
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
