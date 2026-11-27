//! Text helpers shared by every rule: accent-free normalisation and whole-word matching.

use unicode_normalization::UnicodeNormalization;
use unicode_normalization::char::canonical_combining_class;

/// Lowercase, accent-free, single-spaced.
///
/// NFKD splits `á` into `a` + a combining accent; dropping the combining characters leaves
/// `a`. `ñ` becomes `n`, so the rule word `españa` and the posting text `Espana` meet.
pub fn norm(text: &str) -> String {
    let stripped: String = text
        .nfkd()
        .filter(|c| canonical_combining_class(*c) == 0)
        .collect();
    stripped
        .to_lowercase()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}

/// A "word character" for boundary checks: letters, digits and `_` (what `\w` means in regexes).
fn is_word_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_'
}

/// True when `needle` occurs in `haystack` as a whole word or phrase: the characters right
/// before and after the match must not be word characters.
///
/// Both arguments must already be normalised with [`norm`]. We do this by hand instead of with
/// a regex because the `regex` crate has no look-around, and a hand loop is easier to read.
pub fn contains_word(haystack: &str, needle: &str) -> bool {
    if needle.is_empty() {
        return false;
    }
    let mut from = 0;
    while let Some(offset) = haystack[from..].find(needle) {
        let start = from + offset;
        let end = start + needle.len();
        let before_ok = haystack[..start]
            .chars()
            .next_back()
            .is_none_or(|c| !is_word_char(c));
        let after_ok = haystack[end..]
            .chars()
            .next()
            .is_none_or(|c| !is_word_char(c));
        if before_ok && after_ok {
            return true;
        }
        // Resume one character after the start so overlapping candidates are not skipped.
        from = start + haystack[start..].chars().next().map_or(1, char::len_utf8);
    }
    false
}

/// Capitalise the first letter of every word and lowercase the rest (`"las palmas"` →
/// `"Las Palmas"`), the way Python's `str.title()` does. Used for the stored city name.
pub fn title_case(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let mut in_word = false;
    for c in text.chars() {
        if c.is_alphabetic() {
            if in_word {
                out.extend(c.to_lowercase());
            } else {
                out.extend(c.to_uppercase());
            }
            in_word = true;
        } else {
            out.push(c);
            in_word = false;
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn norm_removes_accents_case_and_extra_spaces() {
        assert_eq!(
            norm("  Prácticas   de INGENIERÍA "),
            "practicas de ingenieria"
        );
        assert_eq!(norm("España"), "espana");
        assert_eq!(norm("A Coruña"), "a coruna");
        assert_eq!(norm(""), "");
    }

    #[test]
    fn whole_word_matching_respects_boundaries() {
        assert!(contains_word("junior data analyst", "junior"));
        assert!(contains_word("jr. developer", "jr"));
        assert!(contains_word("marketing intern", "intern"));
        assert!(!contains_word("internal tools engineer", "intern"));
        assert!(!contains_word("janalyst", "analyst"));
        assert!(!contains_word("analyst_2", "analyst"));
        assert!(contains_word("junior-analyst", "analyst"));
        assert!(contains_word(
            "graduate programme 2027",
            "graduate programme"
        ));
    }

    #[test]
    fn a_later_occurrence_can_still_match() {
        assert!(contains_word("internal intern", "intern"));
    }

    #[test]
    fn title_case_matches_python() {
        assert_eq!(title_case("madrid"), "Madrid");
        assert_eq!(title_case("las palmas"), "Las Palmas");
        assert_eq!(title_case("a coruña"), "A Coruña");
        assert_eq!(
            title_case("santa cruz de tenerife"),
            "Santa Cruz De Tenerife"
        );
    }
}
