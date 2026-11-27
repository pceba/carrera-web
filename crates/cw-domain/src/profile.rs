use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::Industry;

/// Whether the person wants to work remotely. Postings only carry a yes/no `remote` flag, so
/// three values are all the matcher can use.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[serde(rename_all = "kebab-case")]
#[ts(export)]
pub enum RemotePreference {
    /// No preference: remote and on-site postings rank the same.
    #[default]
    Any,
    /// Prefers remote postings.
    Remote,
    /// Prefers working from an office.
    Onsite,
}

/// What the matcher knows about a person. It is built in the browser (detected from a CV, then
/// edited by the person) and never contains the CV text itself. Every field is optional on the
/// wire (`#[serde(default)]`) so an old profile saved in `localStorage` still loads after a new
/// field is added.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(default)]
#[ts(export)]
pub struct Profile {
    /// Industries the person is interested in, **most wanted first**: the order is a preference.
    pub industries: Vec<Industry>,
    /// Role titles they look for, free text ("analista financiero", "data scientist").
    pub roles: Vec<String>,
    /// Skills, free text. Names the lexicon knows ("SQL", "Valoración") also tell the matcher
    /// which industries they help in.
    pub skills: Vec<String>,
    /// Languages they speak, in Spanish ("Inglés", "Francés").
    pub languages: Vec<String>,
    /// Studies, one line each ("Grado en Economía, Universidad de Navarra").
    pub education: Vec<String>,
    /// Cities where they would work ("Madrid", "Barcelona").
    pub locations: Vec<String>,
    pub remote: RemotePreference,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn an_empty_object_is_a_valid_profile() {
        let profile: Profile = serde_json::from_str("{}").unwrap();
        assert_eq!(profile, Profile::default());
    }

    #[test]
    fn unknown_fields_from_the_future_are_ignored() {
        let profile: Profile =
            serde_json::from_str(r#"{"skills":["SQL"],"salary":42,"remote":"onsite"}"#).unwrap();
        assert_eq!(profile.skills, ["SQL"]);
        assert_eq!(profile.remote, RemotePreference::Onsite);
    }
}
