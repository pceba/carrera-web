//! Read a CV and draft a [`Profile`] from it. Runs in the browser (WASM): the CV bytes never
//! leave the device, and this crate has no I/O of its own, only functions from bytes to values.
//!
//! The draft is a *suggestion*: the person reviews and edits it before anything is matched, so
//! the detector favours precision (only dictionary words from `config/lexicon.yaml`) over
//! guessing. Roles are never inferred (a CV lists past jobs, not what the person wants).

use cw_domain::{Industry, Profile};
use cw_lexicon::Lexicon;

/// File kinds the reader accepts.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CvKind {
    Txt,
    Docx,
    Pdf,
}

impl CvKind {
    /// Parse the tag used by the web layer (`"txt"`, `"docx"`, `"pdf"`).
    pub fn parse(tag: &str) -> Option<Self> {
        match tag.to_ascii_lowercase().as_str() {
            "txt" | "text" => Some(Self::Txt),
            "docx" => Some(Self::Docx),
            "pdf" => Some(Self::Pdf),
            _ => None,
        }
    }
}

#[derive(Debug, thiserror::Error, PartialEq, Eq)]
pub enum CvError {
    #[error("unknown CV file kind `{0}`")]
    UnknownKind(String),
    #[error("reading {0:?} files is not available yet")]
    Unsupported(CvKind),
}

/// Plain text of a CV file.
pub fn extract_text(bytes: &[u8], kind: CvKind) -> Result<String, CvError> {
    match kind {
        // Lossy: a stray byte in a pasted CV must not make the whole file unreadable.
        CvKind::Txt => Ok(String::from_utf8_lossy(bytes).into_owned()),
        other => Err(CvError::Unsupported(other)),
    }
}

/// Draft a profile from CV text using the dictionaries in `lexicon`.
pub fn detect_profile(text: &str, lexicon: &Lexicon) -> Profile {
    let skills = lexicon.find_skills(text);
    Profile {
        industries: infer_industries(&skills),
        roles: Vec::new(),
        skills: skills.iter().map(|e| e.name.clone()).collect(),
        languages: lexicon
            .find_languages(text)
            .iter()
            .map(|e| e.name.clone())
            .collect(),
        education: education_lines(text, lexicon),
        locations: lexicon
            .find_locations(text)
            .iter()
            .map(|e| e.name.clone())
            .collect(),
        remote: cw_domain::RemotePreference::Any,
    }
}

/// Convenience: bytes to draft profile.
pub fn parse_cv(bytes: &[u8], kind: CvKind, lexicon: &Lexicon) -> Result<Profile, CvError> {
    Ok(detect_profile(&extract_text(bytes, kind)?, lexicon))
}

/// Up to three industries, those that the most detected skills point to (at least two skills
/// each, so one stray "Python" does not tag someone as AI). Ties keep the site's industry order.
fn infer_industries(skills: &[&cw_lexicon::Entry]) -> Vec<Industry> {
    let mut counted: Vec<(Industry, usize)> = Industry::ALL
        .iter()
        .map(|&industry| {
            let n = skills
                .iter()
                .filter(|s| s.industries.contains(&industry))
                .count();
            (industry, n)
        })
        .filter(|&(_, n)| n >= 2)
        .collect();
    // Stable sort: equal counts stay in `Industry::ALL` order.
    counted.sort_by_key(|&(_, n)| std::cmp::Reverse(n));
    counted.into_iter().take(3).map(|(i, _)| i).collect()
}

/// Lines that mention a degree word, trimmed, de-duplicated, at most five and 160 chars each.
fn education_lines(text: &str, lexicon: &Lexicon) -> Vec<String> {
    let mut lines: Vec<String> = Vec::new();
    for line in text.lines().map(str::trim) {
        let line = line.trim_start_matches(['-', '•', '*', ' ']);
        if line.is_empty() || line.chars().count() > 160 || !lexicon.mentions_degree(line) {
            continue;
        }
        if !lines.iter().any(|l| l == line) {
            lines.push(line.to_owned());
        }
    }
    lines.truncate(5);
    lines
}

#[cfg(test)]
mod tests {
    use super::*;

    const LUCIA: &str = include_str!("../tests/fixtures/cv_lucia_ficticia.txt");

    #[test]
    fn drafts_a_profile_from_a_fictional_cv() {
        let profile = parse_cv(LUCIA.as_bytes(), CvKind::Txt, &Lexicon::bundled()).unwrap();
        for skill in ["SQL", "Python", "Power BI"] {
            assert!(profile.skills.iter().any(|s| s == skill), "{skill}");
        }
        assert_eq!(profile.languages, ["Inglés", "Francés", "Español"]);
        assert_eq!(profile.locations, ["Madrid", "Barcelona"]);
        assert_eq!(profile.education.len(), 2, "{:?}", profile.education);
        assert!(profile.education[0].starts_with("Grado en Economia"));
        assert!(profile.roles.is_empty());
    }

    #[test]
    fn industries_need_two_skills_and_are_capped_at_three() {
        let lexicon = Lexicon::bundled();
        assert!(
            detect_profile("Solo Python", &lexicon)
                .industries
                .is_empty()
        );
        let profile = detect_profile("SQL, Python, estadistica, Power BI", &lexicon);
        assert!(!profile.industries.is_empty() && profile.industries.len() <= 3);
        assert!(profile.industries.contains(&Industry::DataScience));
    }

    #[test]
    fn empty_and_unrelated_text_gives_an_empty_draft() {
        let profile = detect_profile("Me gusta el senderismo.", &Lexicon::bundled());
        assert_eq!(profile, Profile::default());
    }

    #[test]
    fn txt_with_invalid_bytes_is_still_read() {
        let text = extract_text(b"SQL \xff Madrid", CvKind::Txt).unwrap();
        assert!(text.contains("SQL") && text.contains("Madrid"));
    }

    #[test]
    fn kind_tags_and_unsupported_formats() {
        assert_eq!(CvKind::parse("PDF"), Some(CvKind::Pdf));
        assert_eq!(CvKind::parse("rtf"), None);
        assert_eq!(
            extract_text(b"%PDF", CvKind::Pdf),
            Err(CvError::Unsupported(CvKind::Pdf))
        );
    }
}
