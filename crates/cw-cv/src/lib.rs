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
    #[error("could not read the {0:?} file: {1}")]
    Unreadable(CvKind, String),
}

/// Upper bound for what we inflate from an untrusted file (a "zip bomb" guard): 20 MB of text is
/// far more than any CV.
const MAX_TEXT_BYTES: usize = 20 * 1024 * 1024;

/// Plain text of a CV file.
pub fn extract_text(bytes: &[u8], kind: CvKind) -> Result<String, CvError> {
    match kind {
        // Lossy: a stray byte in a pasted CV must not make the whole file unreadable.
        CvKind::Txt => Ok(String::from_utf8_lossy(bytes).into_owned()),
        CvKind::Docx => docx_text(bytes).map_err(|e| CvError::Unreadable(kind, e)),
        CvKind::Pdf => pdf_text(bytes).map_err(|e| CvError::Unreadable(kind, e)),
    }
}

/// A DOCX is a zip whose `word/document.xml` holds the text: `<w:t>` runs inside `<w:p>`
/// paragraphs. We read just that, one line per paragraph.
fn docx_text(bytes: &[u8]) -> Result<String, String> {
    use quick_xml::{Reader, events::Event};
    use std::io::Read;

    let mut archive =
        zip::ZipArchive::new(std::io::Cursor::new(bytes)).map_err(|e| e.to_string())?;
    let file = archive
        .by_name("word/document.xml")
        .map_err(|_| "not a Word document (no word/document.xml)".to_owned())?;
    let mut xml = Vec::new();
    file.take(MAX_TEXT_BYTES as u64)
        .read_to_end(&mut xml)
        .map_err(|e| e.to_string())?;

    let mut reader = Reader::from_reader(xml.as_slice());
    let (mut text, mut in_text) = (String::new(), false);
    loop {
        match reader.read_event().map_err(|e| e.to_string())? {
            Event::Start(e) if e.local_name().as_ref() == "t" => in_text = true,
            Event::End(e) => match e.local_name().as_ref() {
                "t" => in_text = false,
                "p" => text.push('\n'),
                _ => {}
            },
            Event::Empty(e) => match e.local_name().as_ref() {
                "tab" => text.push('\t'),
                "br" => text.push('\n'),
                _ => {}
            },
            Event::Text(t) if in_text => text.push_str(&t.xml10_content()),
            // `&amp;`, `&lt;`... arrive as separate events in this quick-xml version.
            Event::GeneralRef(r) if in_text => match &*r {
                "amp" => text.push('&'),
                "lt" => text.push('<'),
                "gt" => text.push('>'),
                "quot" => text.push('"'),
                "apos" => text.push('\''),
                _ => {}
            },
            Event::Eof => break,
            _ => {}
        }
    }
    Ok(text)
}

/// Text of every page of a PDF. Works for PDFs that carry real text; a scanned image has none,
/// which the caller sees as an empty draft (the UI then asks for a TXT or DOCX).
fn pdf_text(bytes: &[u8]) -> Result<String, String> {
    let doc = lopdf::Document::load_mem(bytes).map_err(|e| e.to_string())?;
    let pages: Vec<u32> = doc.get_pages().keys().copied().collect();
    doc.extract_text_with_limit(&pages, MAX_TEXT_BYTES)
        .map_err(|e| e.to_string())
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
    }

    #[test]
    fn broken_files_are_errors_not_panics() {
        assert!(matches!(
            extract_text(b"%PDF-1.4 garbage", CvKind::Pdf),
            Err(CvError::Unreadable(CvKind::Pdf, _))
        ));
        assert!(matches!(
            extract_text(b"not a zip", CvKind::Docx),
            Err(CvError::Unreadable(CvKind::Docx, _))
        ));
    }

    /// Build a DOCX in memory from plain lines (a real DOCX has more parts; we read only one).
    fn docx_from(lines: &[&str]) -> Vec<u8> {
        use std::io::Write;
        let body: String = lines
            .iter()
            .map(|l| {
                format!(
                    "<w:p><w:r><w:t>{}</w:t></w:r></w:p>",
                    l.replace('&', "&amp;")
                )
            })
            .collect();
        let xml = format!(
            "<?xml version=\"1.0\"?><w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body>{body}</w:body></w:document>"
        );
        let mut zip = zip::ZipWriter::new(std::io::Cursor::new(Vec::new()));
        zip.start_file(
            "word/document.xml",
            zip::write::SimpleFileOptions::default(),
        )
        .unwrap();
        zip.write_all(xml.as_bytes()).unwrap();
        zip.finish().unwrap().into_inner()
    }

    /// Build a one-page PDF whose lines are drawn with the standard Helvetica font.
    fn pdf_from(lines: &[&str]) -> Vec<u8> {
        use lopdf::content::{Content, Operation};
        use lopdf::{Document, Object, Stream, dictionary};
        let mut doc = Document::with_version("1.5");
        let pages_id = doc.new_object_id();
        let font_id = doc.add_object(dictionary! {
            "Type" => "Font", "Subtype" => "Type1", "BaseFont" => "Helvetica",
        });
        let resources_id = doc.add_object(dictionary! {
            "Font" => dictionary! { "F1" => font_id },
        });
        let mut ops = vec![
            Operation::new("BT", vec![]),
            Operation::new("Tf", vec!["F1".into(), 12.into()]),
            Operation::new("Td", vec![50.into(), 750.into()]),
            Operation::new("TL", vec![14.into()]),
        ];
        for line in lines {
            ops.push(Operation::new("Tj", vec![Object::string_literal(*line)]));
            ops.push(Operation::new("T*", vec![]));
        }
        ops.push(Operation::new("ET", vec![]));
        let content = Content { operations: ops };
        let content_id = doc.add_object(Stream::new(dictionary! {}, content.encode().unwrap()));
        let page_id = doc.add_object(dictionary! {
            "Type" => "Page", "Parent" => pages_id, "Contents" => content_id,
            "Resources" => resources_id,
            "MediaBox" => vec![0.into(), 0.into(), 595.into(), 842.into()],
        });
        doc.objects.insert(
            pages_id,
            Object::Dictionary(dictionary! {
                "Type" => "Pages", "Kids" => vec![page_id.into()], "Count" => 1,
            }),
        );
        let catalog_id = doc.add_object(dictionary! { "Type" => "Catalog", "Pages" => pages_id });
        doc.trailer.set("Root", catalog_id);
        let mut out = Vec::new();
        doc.save_to(&mut out).unwrap();
        out
    }

    #[test]
    fn docx_and_pdf_give_the_same_draft_as_txt() {
        let lexicon = Lexicon::bundled();
        let lines: Vec<&str> = LUCIA.lines().collect();
        let from_txt = detect_profile(LUCIA, &lexicon);
        let from_docx = parse_cv(&docx_from(&lines), CvKind::Docx, &lexicon).unwrap();
        assert_eq!(from_docx, from_txt);
        // PDF text extraction keeps the words but not our exact line structure, so compare the
        // dictionary-driven fields only.
        let from_pdf = parse_cv(&pdf_from(&lines), CvKind::Pdf, &lexicon).unwrap();
        assert_eq!(from_pdf.skills, from_txt.skills);
        assert_eq!(from_pdf.languages, from_txt.languages);
        assert_eq!(from_pdf.locations, from_txt.locations);
    }
}
