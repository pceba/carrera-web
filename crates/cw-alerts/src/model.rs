//! What the digest job reads: who gets an email and which postings are candidates.

use chrono::{DateTime, Utc};
use cw_domain::{Industry, Posting, Profile, RemotePreference};
use serde::Deserialize;

/// One person with an active subscription, as returned by the `alert_recipients()` SQL function.
/// The service role is the only caller; the address never leaves this process except to Resend.
#[derive(Clone, Deserialize)]
pub struct Recipient {
    pub subscription_id: String,
    pub email: String,
    #[serde(default)]
    pub industries: Vec<Industry>,
    #[serde(default)]
    pub roles: Vec<String>,
    #[serde(default)]
    pub skills: Vec<String>,
    #[serde(default)]
    pub locations: Vec<String>,
    #[serde(default)]
    pub remote: RemotePreference,
    pub last_sent_at: Option<DateTime<Utc>>,
    pub unsubscribe_token: String,
}

// Hand-written so a stray `{:?}` in a log can never leak an address or an unsubscribe token.
impl std::fmt::Debug for Recipient {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Recipient")
            .field("subscription_id", &self.subscription_id)
            .field("industries", &self.industries)
            .field("last_sent_at", &self.last_sent_at)
            .finish_non_exhaustive()
    }
}

impl Recipient {
    /// The profile `cw-match` ranks against. Languages and education are not stored for alerts
    /// (data minimisation) and the matcher does not use them.
    pub fn profile(&self) -> Profile {
        Profile {
            industries: self.industries.clone(),
            roles: self.roles.clone(),
            skills: self.skills.clone(),
            locations: self.locations.clone(),
            remote: self.remote,
            ..Profile::default()
        }
    }
}

/// A posting plus the moment the database first saw it. `first_seen_at` (not `posted_at`) decides
/// what is "new": many sources give no posting date, and a date can be in the past for a posting
/// we only just collected.
#[derive(Debug, Clone, Deserialize)]
pub struct Candidate {
    #[serde(flatten)]
    pub posting: Posting,
    /// `None` (a posting read from the pipeline's dry-run JSON) counts as seen right now.
    #[serde(default)]
    pub first_seen_at: Option<DateTime<Utc>>,
}
