//! What each source's terms of use require of us, encoded as data next to the code that calls
//! the source. The full reasoning (with links and the date the terms were last read) is in
//! `SOURCES.md`; the website's attribution line and any future alert e-mail must honour these.

use std::time::Duration;

use cw_domain::Source;

/// The name and link every posting card must show for the source.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Attribution {
    pub label: &'static str,
    pub url: &'static str,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct SourceTerms {
    pub source: Source,
    /// Must be shown and linked on every card. `None` for company boards: the card shows the
    /// employer's name and links to the employer's own application page.
    pub attribution: Option<Attribution>,
    /// Shortest time we allow between two collections of this source.
    pub min_interval: Duration,
    /// Upper bound of HTTP requests in one run (a self-imposed cap below the source's limit).
    pub max_requests_per_run: u32,
    /// May postings of this source appear in e-mail alerts or behind a login?
    pub allowed_in_alerts: bool,
}

const DAY: Duration = Duration::from_secs(24 * 60 * 60);
const HOUR: Duration = Duration::from_secs(60 * 60);

/// Company boards: public job-board APIs that exist so employers' postings can be listed
/// elsewhere. Our policy is one GET per company per day.
pub const BOARD_INTERVAL: Duration = DAY;

pub const fn terms(source: Source) -> SourceTerms {
    match source {
        Source::Greenhouse | Source::Lever | Source::Ashby | Source::Workable => SourceTerms {
            source,
            attribution: None,
            min_interval: BOARD_INTERVAL,
            max_requests_per_run: 1,
            allowed_in_alerts: true,
        },
        // Spain-only paging, capped at five pages of 100.
        Source::SmartRecruiters => SourceTerms {
            source,
            attribution: None,
            min_interval: BOARD_INTERVAL,
            max_requests_per_run: 5,
            allowed_in_alerts: true,
        },
        // Terms: name Remotive, link back to the Remotive URL, at most 4 requests a day, never
        // pass jobs on to other sites. Not for alerts or behind a login.
        Source::Remotive => SourceTerms {
            source,
            attribution: Some(Attribution {
                label: "Remotive",
                url: "https://remotive.com",
            }),
            min_interval: Duration::from_secs(6 * 60 * 60),
            max_requests_per_run: 1,
            allowed_in_alerts: false,
        },
        // Credit Jobicy with a direct link; at most one sync per hour. Terms page not fully read.
        Source::Jobicy => SourceTerms {
            source,
            attribution: Some(Attribution {
                label: "Jobicy",
                url: "https://jobicy.com",
            }),
            min_interval: HOUR,
            max_requests_per_run: 1,
            allowed_in_alerts: true,
        },
        // Each listing labelled "Adzuna" and hyperlinked to the Adzuna site; free tier is 250
        // requests a day and we use about 14.
        Source::Adzuna => SourceTerms {
            source,
            attribution: Some(Attribution {
                label: "Adzuna",
                url: "https://www.adzuna.es",
            }),
            min_interval: HOUR,
            max_requests_per_run: 20,
            allowed_in_alerts: true,
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_source_has_terms_and_aggregators_must_be_credited() {
        for source in Source::ALL {
            let t = terms(source);
            assert_eq!(t.source, source);
            assert_eq!(
                t.attribution.is_some(),
                !source.is_company_board(),
                "{source}: aggregators need attribution, company boards do not"
            );
        }
    }

    #[test]
    fn remotive_stays_out_of_alerts() {
        assert!(!terms(Source::Remotive).allowed_in_alerts);
    }
}
