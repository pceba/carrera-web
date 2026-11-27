//! The browser-facing surface of the engine, compiled to WebAssembly with `wasm-pack`.
//!
//! Deliberately thin: every export takes and returns **JSON strings** (and the CV as raw bytes).
//! That keeps the boundary trivial to reason about (the TypeScript types in `src/lib/generated/`
//! describe the JSON) and avoids an extra serialisation dependency. The logic lives in `cw-cv`
//! and `cw-match`, which are tested natively; this crate only converts and forwards.
//!
//! Privacy: nothing here touches the network or storage. The CV bytes stay in WASM memory for the
//! duration of the call.

use cw_cv::CvKind;
use cw_domain::{Posting, Profile};
use cw_lexicon::Lexicon;
use std::sync::OnceLock;
use wasm_bindgen::prelude::*;

/// The dictionaries are parsed once per page load, not once per call.
fn lexicon() -> &'static Lexicon {
    static LEXICON: OnceLock<Lexicon> = OnceLock::new();
    LEXICON.get_or_init(Lexicon::bundled)
}

/// Draft a profile from a CV. `kind` is `"txt"`, `"docx"` or `"pdf"`. Returns the `Profile` as
/// JSON; throws a `string` error if the file cannot be read.
#[wasm_bindgen]
pub fn parse_cv(bytes: &[u8], kind: &str) -> Result<String, String> {
    run_parse_cv(bytes, kind)
}

/// Rank postings (JSON array of `Posting`) for a profile (JSON `Profile`). Returns a JSON array
/// of `Ranked`, best first, each pointing at its posting by `index`.
#[wasm_bindgen]
pub fn rank(profile_json: &str, postings_json: &str) -> Result<String, String> {
    run_rank(profile_json, postings_json)
}

// The real work sits in plain functions so unit tests can call them on the native target
// (`#[wasm_bindgen]` functions returning `Result<_, String>` also work natively, but keeping a
// seam makes the intent clear).

fn run_parse_cv(bytes: &[u8], kind: &str) -> Result<String, String> {
    let kind = CvKind::parse(kind).ok_or_else(|| format!("unknown CV file kind `{kind}`"))?;
    let profile = cw_cv::parse_cv(bytes, kind, lexicon()).map_err(|e| e.to_string())?;
    serde_json::to_string(&profile).map_err(|e| e.to_string())
}

fn run_rank(profile_json: &str, postings_json: &str) -> Result<String, String> {
    let profile: Profile =
        serde_json::from_str(profile_json).map_err(|e| format!("invalid profile: {e}"))?;
    let postings: Vec<Posting> =
        serde_json::from_str(postings_json).map_err(|e| format!("invalid postings: {e}"))?;
    let ranked = cw_match::rank(&profile, &postings, lexicon());
    serde_json::to_string(&ranked).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    const CV: &str = "Grado en Economia. SQL y Python. Ingles C1. Madrid.";
    const POSTING: &str = r#"[{"source":"greenhouse","external_id":"1","source_url":"https://e.com",
        "company":"Acme","title":"Data Analyst - SQL","location":"Madrid","city":"Madrid",
        "remote":false,"level":"analyst","industry":"data-science","posted_at":null,
        "id":"ignored-extra-field"}]"#;

    #[test]
    fn parse_then_rank_round_trip_through_json() {
        let profile = run_parse_cv(CV.as_bytes(), "txt").unwrap();
        assert!(profile.contains("\"SQL\"") && profile.contains("\"Madrid\""));
        let ranked = run_rank(&profile, POSTING).unwrap();
        assert!(ranked.starts_with(r#"[{"index":0,"score":"#), "{ranked}");
        assert!(ranked.contains("coincide: SQL"), "{ranked}");
    }

    #[test]
    fn errors_are_readable_strings() {
        assert!(run_parse_cv(b"x", "rtf").unwrap_err().contains("rtf"));
        assert!(run_rank("{", "[]").unwrap_err().contains("invalid profile"));
        assert!(
            run_rank("{}", "{")
                .unwrap_err()
                .contains("invalid postings")
        );
    }
}
