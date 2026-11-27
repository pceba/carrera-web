//! The keyword rules, loaded from `config/rules.yaml`.

use cw_domain::{Industry, Level};
use indexmap::IndexMap;
use serde::Deserialize;

use crate::text::norm;

/// The YAML file embedded at compile time, so the binary needs no files next to it.
const BUNDLED: &str = include_str!("../../../config/rules.yaml");

#[derive(Debug, thiserror::Error)]
pub enum RulesError {
    #[error("invalid rules YAML: {0}")]
    Yaml(#[from] serde_yaml_ng::Error),
    #[error("rules contain an empty keyword in `{0}`")]
    EmptyKeyword(&'static str),
}

/// A rule city keeps its original spelling (`A Coruña`) for display and the normalised one
/// (`a coruna`) for matching.
#[derive(Debug, Clone)]
pub struct City {
    pub raw: String,
    pub norm: String,
}

/// The file as written. `IndexMap` keeps the YAML order, which *is* the priority order.
#[derive(Deserialize)]
struct RawRules {
    levels: IndexMap<Level, Vec<String>>,
    exclude: Vec<String>,
    spain: RawSpain,
    remote_ok: Vec<String>,
    remote_words: Vec<String>,
    industries: IndexMap<Industry, Vec<String>>,
}

#[derive(Deserialize)]
struct RawSpain {
    cities: Vec<String>,
    names: Vec<String>,
}

/// Rules ready to match: every keyword is already normalised (accent-free, lowercase), so the
/// hot loop only compares strings.
#[derive(Debug, Clone)]
pub struct Rules {
    pub(crate) levels: IndexMap<Level, Vec<String>>,
    pub(crate) exclude: Vec<String>,
    pub(crate) cities: Vec<City>,
    pub(crate) country_names: Vec<String>,
    pub(crate) remote_ok: Vec<String>,
    pub(crate) remote_words: Vec<String>,
    pub(crate) industries: IndexMap<Industry, Vec<String>>,
}

fn normalised(words: &[String], section: &'static str) -> Result<Vec<String>, RulesError> {
    words
        .iter()
        .map(|word| {
            let word = norm(word);
            if word.is_empty() {
                Err(RulesError::EmptyKeyword(section))
            } else {
                Ok(word)
            }
        })
        .collect()
}

fn normalised_map<K: std::hash::Hash + Eq + Copy>(
    map: IndexMap<K, Vec<String>>,
    section: &'static str,
) -> Result<IndexMap<K, Vec<String>>, RulesError> {
    map.into_iter()
        .map(|(key, words)| Ok((key, normalised(&words, section)?)))
        .collect()
}

impl Rules {
    pub fn from_yaml(yaml: &str) -> Result<Self, RulesError> {
        let raw: RawRules = serde_yaml_ng::from_str(yaml)?;
        let city_words = normalised(&raw.spain.cities, "spain.cities")?;
        Ok(Self {
            levels: normalised_map(raw.levels, "levels")?,
            exclude: normalised(&raw.exclude, "exclude")?,
            cities: raw
                .spain
                .cities
                .into_iter()
                .zip(city_words)
                .map(|(raw, norm)| City { raw, norm })
                .collect(),
            country_names: normalised(&raw.spain.names, "spain.names")?,
            remote_ok: normalised(&raw.remote_ok, "remote_ok")?,
            remote_words: normalised(&raw.remote_words, "remote_words")?,
            industries: normalised_map(raw.industries, "industries")?,
        })
    }

    /// The rules shipped in `config/rules.yaml`. Panics only if that file is broken, which the
    /// unit tests would catch before it ships.
    pub fn bundled() -> Self {
        Self::from_yaml(BUNDLED).expect("config/rules.yaml must be valid")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bundled_rules_load_and_keep_yaml_order() {
        let rules = Rules::bundled();
        let order: Vec<Level> = rules.levels.keys().copied().collect();
        assert_eq!(
            order,
            [
                Level::Intern,
                Level::Trainee,
                Level::Graduate,
                Level::Junior,
                Level::Analyst
            ]
        );
        assert_eq!(rules.industries.keys().next(), Some(&Industry::Consulting));
        assert!(rules.cities.iter().any(|c| c.norm == "a coruna"));
        // "it " in the YAML must lose its trailing space, as the Python normalisation did.
        assert!(rules.industries[&Industry::Tech].contains(&"it".to_owned()));
    }

    #[test]
    fn unknown_level_is_a_load_error() {
        let yaml = "levels: { wizard: [x] }\nexclude: []\nspain: { cities: [], names: [] }\nremote_ok: []\nremote_words: []\nindustries: {}\n";
        assert!(Rules::from_yaml(yaml).is_err());
    }
}
