use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// Industry tag decided by the keyword rules. `Other` is the fallback when no rule matches.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export)]
pub enum Industry {
    Consulting,
    Banking,
    Industrial,
    Tech,
    Marketing,
    Sales,
    Operations,
    Other,
}

impl Industry {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Consulting => "consulting",
            Self::Banking => "banking",
            Self::Industrial => "industrial",
            Self::Tech => "tech",
            Self::Marketing => "marketing",
            Self::Sales => "sales",
            Self::Operations => "operations",
            Self::Other => "other",
        }
    }
}

impl std::fmt::Display for Industry {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.as_str())
    }
}
