use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// How junior a posting is. The values are the ones allowed by the `postings.level` check
/// constraint in `supabase/migrations/`.
///
/// The declaration order is only documentation: the *priority* between levels (which one wins
/// when a title matches several) is the order of the `levels` map in `config/rules.yaml`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export)]
pub enum Level {
    Intern,
    Trainee,
    Graduate,
    Junior,
    Analyst,
}

impl Level {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Intern => "intern",
            Self::Trainee => "trainee",
            Self::Graduate => "graduate",
            Self::Junior => "junior",
            Self::Analyst => "analyst",
        }
    }
}

impl std::fmt::Display for Level {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.as_str())
    }
}
