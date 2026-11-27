use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// Where a posting came from. Company boards (the first five) are one GET per employer; the
/// last three are general job sources. The serialized names are stored in `postings.source`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export)]
pub enum Source {
    Greenhouse,
    Lever,
    Ashby,
    Workable,
    SmartRecruiters,
    Remotive,
    Jobicy,
    Adzuna,
}

impl Source {
    pub const ALL: [Self; 8] = [
        Self::Greenhouse,
        Self::Lever,
        Self::Ashby,
        Self::Workable,
        Self::SmartRecruiters,
        Self::Remotive,
        Self::Jobicy,
        Self::Adzuna,
    ];

    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Greenhouse => "greenhouse",
            Self::Lever => "lever",
            Self::Ashby => "ashby",
            Self::Workable => "workable",
            Self::SmartRecruiters => "smartrecruiters",
            Self::Remotive => "remotive",
            Self::Jobicy => "jobicy",
            Self::Adzuna => "adzuna",
        }
    }

    /// True for the per-company ATS boards listed in `config/companies.yaml`.
    pub const fn is_company_board(self) -> bool {
        matches!(
            self,
            Self::Greenhouse | Self::Lever | Self::Ashby | Self::Workable | Self::SmartRecruiters
        )
    }
}

impl std::fmt::Display for Source {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.as_str())
    }
}

impl std::str::FromStr for Source {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::ALL
            .into_iter()
            .find(|source| source.as_str() == s)
            .ok_or_else(|| format!("unknown source `{s}`"))
    }
}
