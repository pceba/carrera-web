//! Small helpers shared by the parsers. They mirror the dynamic-typing conveniences of the
//! Python original (`a or b`, "string or number", lenient dates) in an explicit, typed way.

use chrono::{DateTime, NaiveDate, NaiveDateTime, Utc};
use serde::Deserialize;
use serde_json::Value;

/// A JSON id that sources send as a string or as a number.
#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
pub enum Id {
    Text(String),
    Number(serde_json::Number),
}

impl Id {
    pub fn into_string(self) -> String {
        match self {
            Self::Text(text) => text,
            Self::Number(number) => number.to_string(),
        }
    }
}

/// A JSON field that is either one string or a list of strings.
#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
pub enum OneOrMany {
    One(String),
    Many(Vec<String>),
}

impl OneOrMany {
    pub fn joined(&self) -> String {
        match self {
            Self::One(text) => text.clone(),
            Self::Many(items) => items.join(", "),
        }
    }
}

/// Python's `a or b` for optional strings: the first one that is present and not empty,
/// otherwise `b` as it is.
pub fn or_else_empty(a: Option<String>, b: Option<String>) -> Option<String> {
    match a {
        Some(text) if !text.is_empty() => Some(text),
        _ => b,
    }
}

/// `Some` only for non-empty text.
pub fn non_empty(text: Option<String>) -> Option<String> {
    text.filter(|t| !t.is_empty())
}

/// Python truthiness for a JSON value.
fn is_truthy(value: &Value) -> bool {
    match value {
        Value::Null => false,
        Value::Bool(b) => *b,
        Value::Number(n) => n.as_f64().is_some_and(|f| f != 0.0),
        Value::String(s) => !s.is_empty(),
        Value::Array(a) => !a.is_empty(),
        Value::Object(o) => !o.is_empty(),
    }
}

/// `first or second` for date fields: the second field is used only when the first is missing
/// or empty (an unparseable first value is *not* replaced, as in the Python original).
pub fn parse_first_date(first: &Value, second: &Value) -> Option<DateTime<Utc>> {
    parse_datetime(if is_truthy(first) { first } else { second })
}

/// ISO-8601 string or epoch milliseconds to UTC; `None` if missing or unparseable. Strings
/// without an offset are taken as UTC, and a bare date means midnight UTC.
pub fn parse_datetime(value: &Value) -> Option<DateTime<Utc>> {
    match value {
        Value::Number(n) => {
            let micros = n.as_f64()? * 1000.0;
            if !micros.is_finite() {
                return None;
            }
            #[allow(clippy::cast_possible_truncation)]
            DateTime::from_timestamp_micros(micros as i64)
        }
        Value::String(text) if !text.is_empty() => parse_iso(text),
        _ => None,
    }
}

fn parse_iso(text: &str) -> Option<DateTime<Utc>> {
    const WITH_OFFSET: [&str; 6] = [
        "%Y-%m-%dT%H:%M:%S%.f%:z",
        "%Y-%m-%d %H:%M:%S%.f%:z",
        "%Y-%m-%dT%H:%M:%S%.f%z",
        "%Y-%m-%d %H:%M:%S%.f%z",
        "%Y-%m-%dT%H:%M%:z",
        "%Y-%m-%d %H:%M%:z",
    ];
    const NAIVE: [&str; 4] = [
        "%Y-%m-%dT%H:%M:%S%.f",
        "%Y-%m-%d %H:%M:%S%.f",
        "%Y-%m-%dT%H:%M",
        "%Y-%m-%d %H:%M",
    ];
    // "Z" is how most APIs write UTC; the parsers below expect "+00:00".
    let text = text
        .strip_suffix('Z')
        .map_or_else(|| text.to_owned(), |without_z| format!("{without_z}+00:00"));
    for format in WITH_OFFSET {
        if let Ok(parsed) = DateTime::parse_from_str(&text, format) {
            return Some(parsed.with_timezone(&Utc));
        }
    }
    let naive_text = text.strip_suffix("+00:00").unwrap_or(&text);
    for format in NAIVE {
        if let Ok(parsed) = NaiveDateTime::parse_from_str(naive_text, format) {
            return Some(parsed.and_utc());
        }
    }
    NaiveDate::parse_from_str(&text, "%Y-%m-%d")
        .ok()
        .and_then(|date| date.and_hms_opt(0, 0, 0))
        .map(|naive| naive.and_utc())
}

const SKIPPED_TAGS: [&str; 6] = ["script", "style", "noscript", "svg", "head", "template"];
const BLOCK_TAGS: [&str; 14] = [
    "p", "div", "br", "li", "ul", "ol", "h1", "h2", "h3", "h4", "h5", "h6", "tr", "table",
];

/// HTML (possibly entity-escaped, as Greenhouse sends it) to plain text: block tags become line
/// breaks, `<script>`/`<style>` content is dropped, entities are decoded and blank lines vanish.
///
/// Source titles are plain text most of the time, so this only has to be careful, not complete.
pub fn html_to_text(raw: Option<&str>) -> String {
    let Some(raw) = raw.filter(|r| !r.is_empty()) else {
        return String::new();
    };
    let unescaped;
    let raw = if raw.contains("&lt;") {
        unescaped = html_escape::decode_html_entities(raw).into_owned();
        unescaped.as_str()
    } else {
        raw
    };

    let mut out = String::with_capacity(raw.len());
    let mut skip = 0usize;
    let mut rest = raw;
    while let Some(lt) = rest.find('<') {
        let (text, from_tag) = rest.split_at(lt);
        if skip == 0 {
            out.push_str(&html_escape::decode_html_entities(text));
        }
        let next = from_tag[1..].chars().next();
        match next {
            Some('!') => {
                // Comment, doctype or CDATA: drop it up to its end.
                let end = if from_tag.starts_with("<!--") {
                    from_tag.find("-->").map(|i| i + 3)
                } else {
                    from_tag.find('>').map(|i| i + 1)
                };
                rest = end.map_or("", |e| &from_tag[e..]);
            }
            Some(c) if c.is_ascii_alphabetic() || c == '/' => {
                let Some(close) = from_tag.find('>') else {
                    // An unfinished tag at the end of the text is just text.
                    if skip == 0 {
                        out.push_str(from_tag);
                    }
                    rest = "";
                    break;
                };
                let inside = &from_tag[1..close];
                let closing = inside.starts_with('/');
                let name: String = inside
                    .trim_start_matches('/')
                    .chars()
                    .take_while(char::is_ascii_alphanumeric)
                    .collect::<String>()
                    .to_ascii_lowercase();
                rest = &from_tag[close + 1..];
                if SKIPPED_TAGS.contains(&name.as_str()) {
                    if closing {
                        skip = skip.saturating_sub(1);
                    } else if !inside.ends_with('/') {
                        skip += 1;
                        if name == "script" || name == "style" {
                            // Raw-text elements: everything up to the closing tag is not HTML.
                            rest = skip_raw_text(rest, &name);
                            skip -= 1;
                        }
                    }
                } else if BLOCK_TAGS.contains(&name.as_str()) && skip == 0 {
                    out.push('\n');
                }
            }
            _ => {
                // A lone "<" ("5 < 6") is text.
                if skip == 0 {
                    out.push('<');
                }
                rest = &from_tag[1..];
            }
        }
    }
    if skip == 0 {
        out.push_str(&html_escape::decode_html_entities(rest));
    }
    collapse_lines(&out)
}

/// Skip to just after `</name`'s closing `>`; the whole rest of the input if it never closes.
fn skip_raw_text<'a>(rest: &'a str, name: &str) -> &'a str {
    let lower = rest.to_ascii_lowercase();
    let marker = format!("</{name}");
    lower
        .find(&marker)
        .and_then(|at| rest[at..].find('>').map(|gt| &rest[at + gt + 1..]))
        .unwrap_or("")
}

fn collapse_lines(text: &str) -> String {
    let text = text.replace('\u{a0}', " ");
    let mut squeezed = String::with_capacity(text.len());
    let mut previous_blank = false;
    for c in text.chars() {
        let blank = c == ' ' || c == '\t';
        if !(blank && previous_blank) {
            squeezed.push(if blank { ' ' } else { c });
        }
        previous_blank = blank;
    }
    squeezed
        // Python's `splitlines` also breaks on these separators.
        .split(|c| {
            matches!(
                c,
                '\n' | '\r'
                    | '\u{b}'
                    | '\u{c}'
                    | '\u{1c}'
                    | '\u{1d}'
                    | '\u{1e}'
                    | '\u{85}'
                    | '\u{2028}'
                    | '\u{2029}'
            )
        })
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join("\n")
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;
    use serde_json::json;

    #[test]
    fn html_is_flattened() {
        assert_eq!(
            html_to_text(Some("&lt;p&gt;Hola&lt;/p&gt;&lt;li&gt;uno&lt;/li&gt;")),
            "Hola\nuno"
        );
        assert_eq!(
            html_to_text(Some("Becario/a de <strong>Finanzas</strong>")),
            "Becario/a de Finanzas"
        );
        assert_eq!(html_to_text(Some("<script>x()</script>Title")), "Title");
        assert_eq!(html_to_text(Some("5 < 6 and 7 > 3")), "5 < 6 and 7 > 3");
        assert_eq!(html_to_text(None), "");
    }

    #[test]
    fn dates_parse_like_the_python_version() {
        let utc = |y, m, d, h, mi, s| Utc.with_ymd_and_hms(y, m, d, h, mi, s).unwrap();
        assert_eq!(
            parse_datetime(&json!("2026-11-20T10:00:00Z")),
            Some(utc(2026, 11, 20, 10, 0, 0))
        );
        assert_eq!(
            parse_datetime(&json!("2026-11-20")),
            Some(utc(2026, 11, 20, 0, 0, 0))
        );
        assert_eq!(
            parse_datetime(&json!("2026-11-20T10:00:00+02:00")),
            Some(utc(2026, 11, 20, 8, 0, 0))
        );
        assert_eq!(
            parse_datetime(&json!("2026-11-20T10:00:00")),
            Some(utc(2026, 11, 20, 10, 0, 0))
        );
        assert_eq!(
            parse_datetime(&json!(1_700_000_000_000_i64)),
            Some(utc(2023, 11, 14, 22, 13, 20))
        );
        assert_eq!(parse_datetime(&json!("not a date")), None);
        assert_eq!(parse_datetime(&Value::Null), None);
    }

    #[test]
    fn milliseconds_in_a_string_are_kept() {
        let parsed = parse_datetime(&json!("2026-11-24T11:56:07.009Z")).unwrap();
        assert_eq!(parsed.timestamp_subsec_millis(), 9);
    }

    #[test]
    fn first_date_falls_back_only_when_empty() {
        let a = json!("");
        let b = json!("2026-11-20");
        assert!(parse_first_date(&a, &b).is_some());
        let bad = json!("garbage");
        assert!(parse_first_date(&bad, &b).is_none());
    }

    #[test]
    fn or_else_empty_matches_python_or() {
        assert_eq!(
            or_else_empty(Some("a".into()), Some("b".into())).as_deref(),
            Some("a")
        );
        assert_eq!(
            or_else_empty(Some(String::new()), Some("b".into())).as_deref(),
            Some("b")
        );
        assert_eq!(or_else_empty(None, None), None);
    }
}
