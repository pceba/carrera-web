//! Dictionaries (`config/lexicon.yaml`) shared by the CV reader and the matcher: skills with the
//! industries they help in, languages, cities and degree words.
//!
//! Matching reuses the whole-word rules of `cw-classify` (accent- and case-insensitive), so
//! `Estadistica` in a CV finds the skill `Estadística`. Everything a user can see detected comes
//! from this file, so a wrong detection is fixed by editing YAML, not code.

use cw_classify::{contains_word, norm};
use cw_domain::Industry;
use serde::Deserialize;

/// Embedded at compile time so the WASM bundle needs no extra request.
const BUNDLED: &str = include_str!("../../../config/lexicon.yaml");

#[derive(Debug, thiserror::Error)]
pub enum LexiconError {
    #[error("invalid lexicon YAML: {0}")]
    Yaml(#[from] serde_yaml_ng::Error),
    #[error("`{0}` has an empty name or alias")]
    Empty(String),
}

/// An entry as written in the YAML.
#[derive(Deserialize)]
struct RawEntry {
    name: String,
    #[serde(default)]
    aliases: Vec<String>,
    /// Match the name with its exact case ("R", "SAS"); aliases still match loosely.
    #[serde(default)]
    exact: bool,
    #[serde(default)]
    industries: Vec<Industry>,
}

#[derive(Deserialize)]
struct RawLexicon {
    skills: Vec<RawEntry>,
    languages: Vec<RawEntry>,
    locations: Vec<RawEntry>,
    degrees: Vec<RawEntry>,
}

/// A dictionary entry ready to match.
#[derive(Debug, Clone)]
pub struct Entry {
    /// Display name, in Spanish ("Inglés", "Valoración de empresas").
    pub name: String,
    /// Industries the entry helps in (skills only; empty for the other dictionaries).
    pub industries: Vec<Industry>,
    /// Normalised name and aliases, matched loosely.
    terms: Vec<String>,
    /// Set when the name is only valid with its exact case.
    exact_name: Option<String>,
}

impl Entry {
    fn new(raw: RawEntry, section: &str) -> Result<Self, LexiconError> {
        let normalised = |word: &str| {
            let word = norm(word);
            if word.is_empty() {
                Err(LexiconError::Empty(format!("{section}: {}", raw.name)))
            } else {
                Ok(word)
            }
        };
        let mut terms = raw
            .aliases
            .iter()
            .map(|alias| normalised(alias))
            .collect::<Result<Vec<_>, _>>()?;
        let exact_name = if raw.exact {
            normalised(&raw.name)?;
            Some(raw.name.clone())
        } else {
            terms.push(normalised(&raw.name)?);
            None
        };
        Ok(Self {
            name: raw.name,
            industries: raw.industries,
            terms,
            exact_name,
        })
    }

    /// True when `text` (original) mentions the entry. `normalised` is `norm(text)`, passed in so
    /// the caller normalises a long CV once, not once per entry.
    fn found_in(&self, text: &str, normalised: &str) -> bool {
        self.terms
            .iter()
            .any(|term| contains_word(normalised, term))
            || self
                .exact_name
                .as_deref()
                .is_some_and(|name| contains_word(text, name))
    }

    /// True when `text` is exactly this entry's name or one of its aliases ("sql", "Estadistica").
    fn is_named(&self, text: &str) -> bool {
        let text = norm(text);
        self.terms.contains(&text)
            || self
                .exact_name
                .as_deref()
                .is_some_and(|name| norm(name) == text)
    }
}

#[derive(Debug, Clone)]
pub struct Lexicon {
    pub skills: Vec<Entry>,
    pub languages: Vec<Entry>,
    pub locations: Vec<Entry>,
    pub degrees: Vec<Entry>,
}

fn entries(raw: Vec<RawEntry>, section: &str) -> Result<Vec<Entry>, LexiconError> {
    raw.into_iter().map(|e| Entry::new(e, section)).collect()
}

fn found<'a>(list: &'a [Entry], text: &str) -> Vec<&'a Entry> {
    let normalised = norm(text);
    list.iter()
        .filter(|entry| entry.found_in(text, &normalised))
        .collect()
}

impl Lexicon {
    pub fn from_yaml(yaml: &str) -> Result<Self, LexiconError> {
        let raw: RawLexicon = serde_yaml_ng::from_str(yaml)?;
        Ok(Self {
            skills: entries(raw.skills, "skills")?,
            languages: entries(raw.languages, "languages")?,
            locations: entries(raw.locations, "locations")?,
            degrees: entries(raw.degrees, "degrees")?,
        })
    }

    /// The dictionaries shipped in `config/lexicon.yaml`. Panics only if that file is broken,
    /// which the unit tests would catch before it ships.
    pub fn bundled() -> Self {
        Self::from_yaml(BUNDLED).expect("config/lexicon.yaml must be valid")
    }

    pub fn find_skills(&self, text: &str) -> Vec<&Entry> {
        found(&self.skills, text)
    }

    pub fn find_languages(&self, text: &str) -> Vec<&Entry> {
        found(&self.languages, text)
    }

    pub fn find_locations(&self, text: &str) -> Vec<&Entry> {
        found(&self.locations, text)
    }

    /// True when the text contains a degree word ("Máster", "Grado", "MBA").
    pub fn mentions_degree(&self, text: &str) -> bool {
        !found(&self.degrees, text).is_empty()
    }

    /// The dictionary skill a user-typed skill refers to (`"sql "`, `"estadistica"`), if any.
    pub fn skill_named(&self, text: &str) -> Option<&Entry> {
        self.skills.iter().find(|skill| skill.is_named(text))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn names(found: Vec<&Entry>) -> Vec<&str> {
        found.into_iter().map(|e| e.name.as_str()).collect()
    }

    #[test]
    fn bundled_lexicon_loads_and_every_skill_has_industries() {
        let lexicon = Lexicon::bundled();
        assert!(lexicon.skills.len() > 60);
        assert!(lexicon.skills.iter().all(|s| !s.industries.is_empty()));
        // Every one of the six industries has at least a few skills that point to it.
        for industry in Industry::ALL {
            let count = lexicon
                .skills
                .iter()
                .filter(|s| s.industries.contains(&industry))
                .count();
            assert!(count >= 5, "{industry} has only {count} skills");
        }
    }

    #[test]
    fn finds_skills_ignoring_case_and_accents() {
        let lexicon = Lexicon::bundled();
        let text = "Manejo SQL y python; estadistica aplicada, Power BI.";
        assert_eq!(
            names(lexicon.find_skills(text)),
            ["SQL", "Python", "Estadística", "Power BI"]
        );
    }

    #[test]
    fn exact_names_need_their_case_and_whole_words() {
        let lexicon = Lexicon::bundled();
        assert_eq!(
            names(lexicon.find_skills("Lenguajes: R, Python")),
            ["Python", "R"]
        );
        // "r" in lower case, or as part of a word, is not the language R.
        assert!(!names(lexicon.find_skills("responsable de caja, sin r")).contains(&"R"));
        // Short names do not match inside longer words.
        assert!(names(lexicon.find_skills("Gitano, SQLite")).is_empty());
    }

    #[test]
    fn aliases_resolve_to_the_canonical_name() {
        let lexicon = Lexicon::bundled();
        assert_eq!(
            names(lexicon.find_skills("DCF models and financial modelling")),
            ["Modelización financiera", "Valoración de empresas"]
        );
        assert_eq!(
            lexicon
                .skill_named("  Estadistica ")
                .map(|s| s.name.as_str()),
            Some("Estadística")
        );
        assert_eq!(lexicon.skill_named("r").map(|s| s.name.as_str()), Some("R"));
        assert!(lexicon.skill_named("cooking").is_none());
    }

    #[test]
    fn finds_languages_locations_and_degrees() {
        let lexicon = Lexicon::bundled();
        let text = "Idiomas: Inglés (C1), French B2. Vivo en San Sebastian; trabajé en London.";
        assert_eq!(names(lexicon.find_languages(text)), ["Inglés", "Francés"]);
        assert_eq!(
            names(lexicon.find_locations(text)),
            ["San Sebastián", "Londres"]
        );
        assert!(lexicon.mentions_degree("Máster en Finanzas"));
        assert!(lexicon.mentions_degree("MBA, IE Business School"));
        assert!(!lexicon.mentions_degree("Responsable de caja"));
    }

    #[test]
    fn a_basque_city_is_not_the_basque_language() {
        let lexicon = Lexicon::bundled();
        assert!(lexicon.find_languages("Bilbao, País Vasco").is_empty());
    }

    #[test]
    fn empty_names_are_rejected() {
        let yaml =
            "skills: [{ name: X, aliases: [''] }]\nlanguages: []\nlocations: []\ndegrees: []\n";
        assert!(Lexicon::from_yaml(yaml).is_err());
    }
}
