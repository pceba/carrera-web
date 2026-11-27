//! One client per official job API. Each source's terms (attribution, minimum interval) are
//! encoded in [`terms`], next to the code that calls it; `SOURCES.md` has the reading behind them.
//!
//! Parsers are pure functions from JSON to [`cw_domain::RawPosting`] and are tested on recorded
//! fixtures, so no test touches the network.

mod boards;
mod error;
mod general;
mod http;
pub mod terms;
mod util;

pub use boards::{
    SMARTRECRUITERS_API, fetch_board, fetch_smartrecruiters, parse_ashby, parse_greenhouse,
    parse_lever, parse_smartrecruiters, parse_workable,
};
pub use error::FetchError;
pub use general::{
    ADZUNA_API, AdzunaCredentials, JOBICY_API, REMOTIVE_API, fetch_adzuna, fetch_adzuna_from,
    fetch_jobicy, fetch_remotive, parse_adzuna, parse_jobicy, parse_remotive,
};
pub use http::{HttpClient, USER_AGENT, install_tls_provider};
pub use util::{html_to_text, parse_datetime};
