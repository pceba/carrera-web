use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// The six industries the site covers (`docs/roadmap.md`). A posting outside all six is dropped
/// by the classifier, so there is deliberately no `Other` variant: an untagged posting cannot
/// exist downstream.
///
/// The serialised names are kebab-case (`data-science`, `private-equity`...) and are also what
/// the `postings.industry` column stores.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize, TS)]
#[serde(rename_all = "kebab-case")]
#[ts(export)]
pub enum Industry {
    Consulting,
    Ai,
    DataScience,
    PrivateEquity,
    InvestmentBanking,
    BigLaw,
}

impl Industry {
    /// Every industry, in the order the site lists them.
    pub const ALL: [Self; 6] = [
        Self::Consulting,
        Self::Ai,
        Self::DataScience,
        Self::PrivateEquity,
        Self::InvestmentBanking,
        Self::BigLaw,
    ];

    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Consulting => "consulting",
            Self::Ai => "ai",
            Self::DataScience => "data-science",
            Self::PrivateEquity => "private-equity",
            Self::InvestmentBanking => "investment-banking",
            Self::BigLaw => "big-law",
        }
    }
}

impl std::fmt::Display for Industry {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.as_str())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn serde_names_match_as_str() {
        for industry in Industry::ALL {
            let json = serde_json::to_string(&industry).unwrap();
            assert_eq!(json, format!("\"{}\"", industry.as_str()));
            assert_eq!(serde_json::from_str::<Industry>(&json).unwrap(), industry);
        }
    }

    #[test]
    fn the_old_taxonomy_is_gone() {
        for old in ["banking", "tech", "industrial", "marketing", "other"] {
            assert!(serde_json::from_str::<Industry>(&format!("\"{old}\"")).is_err());
        }
    }
}
