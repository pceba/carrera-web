//! One run of the job: build the digests, then send them (or only count them).

use chrono::{DateTime, Utc};
use cw_lexicon::Lexicon;

use crate::digest::{self, Digest};
use crate::model::{Candidate, Recipient};
use crate::render::{self, Email};
use crate::resend::Resend;
use crate::store::Store;

/// Resend's free tier allows 100 emails a day; stay under it and leave the rest for tomorrow
/// (their `last_sent_at` does not move, so nobody loses postings).
pub const DEFAULT_MAX_EMAILS: usize = 90;

/// Counts only: this is what ends up in the CI log. No addresses, no names, no postings.
#[derive(Debug, Default, PartialEq, Eq)]
pub struct Report {
    pub recipients: usize,
    pub candidates: usize,
    pub digests: usize,
    pub skipped_empty: usize,
    pub over_cap: usize,
    pub sent: usize,
    pub would_send: usize,
    pub failed: usize,
}

impl std::fmt::Display for Report {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "recipients={} candidates={} digests={} skipped_empty={} over_cap={} sent={} would_send={} failed={}",
            self.recipients,
            self.candidates,
            self.digests,
            self.skipped_empty,
            self.over_cap,
            self.sent,
            self.would_send,
            self.failed
        )
    }
}

/// How emails leave. `None` for the mailer is the dry run.
pub struct Delivery<'a> {
    pub mailer: Option<&'a Resend>,
    /// Needed to move `last_sent_at` after a real send.
    pub store: Option<&'a Store>,
}

pub struct Settings<'a> {
    pub site_url: &'a str,
    pub max_emails: usize,
}

/// Build every digest and render it. Pure: the I/O lives in [`run`].
pub fn prepare<'a>(
    recipients: &'a [Recipient],
    candidates: &'a [Candidate],
    now: DateTime<Utc>,
) -> Vec<Digest<'a>> {
    digest::build(recipients, candidates, &Lexicon::bundled(), now)
}

pub async fn run(
    recipients: &[Recipient],
    candidates: &[Candidate],
    delivery: &Delivery<'_>,
    settings: &Settings<'_>,
    now: DateTime<Utc>,
) -> Report {
    let digests = prepare(recipients, candidates, now);
    let mut report = Report {
        recipients: recipients.len(),
        candidates: candidates.len(),
        digests: digests.len(),
        skipped_empty: recipients.len() - digests.len(),
        ..Report::default()
    };
    for (n, digest) in digests.iter().enumerate() {
        if n >= settings.max_emails {
            report.over_cap += 1;
            continue;
        }
        let email: Email = render::render(digest, settings.site_url);
        let Some(mailer) = delivery.mailer else {
            report.would_send += 1;
            continue;
        };
        match mailer.send(&digest.recipient.email, &email).await {
            Ok(()) => {
                report.sent += 1;
                if let Some(store) = delivery.store
                    && let Err(error) = store
                        .mark_sent(&digest.recipient.subscription_id, now)
                        .await
                {
                    // The email is out; failing to move the window means a repeat tomorrow.
                    // Log the error text only (it carries no address).
                    eprintln!("warning: could not mark a digest as sent: {error:#}");
                }
            }
            Err(error) => {
                report.failed += 1;
                eprintln!("warning: a digest was not sent: {error:#}");
            }
        }
    }
    report
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::demo;
    use wiremock::matchers::{header, method, path};
    use wiremock::{Mock, MockServer, ResponseTemplate};

    const SETTINGS: Settings<'static> = Settings {
        site_url: "https://site.example",
        max_emails: 90,
    };

    #[tokio::test]
    async fn dry_run_counts_and_sends_nothing() {
        let now = Utc::now();
        let report = run(
            &demo::recipients(now),
            &demo::candidates(now),
            &Delivery {
                mailer: None,
                store: None,
            },
            &SETTINGS,
            now,
        )
        .await;
        // Ana has new matches; Luis (big law) has nothing new that fits.
        assert_eq!(
            report,
            Report {
                recipients: 2,
                candidates: 3,
                digests: 1,
                skipped_empty: 1,
                would_send: 1,
                ..Report::default()
            }
        );
    }

    #[tokio::test]
    async fn sends_one_email_per_person_through_resend() {
        let server = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/emails"))
            .and(header("authorization", "Bearer re_test"))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({"id": "x"})))
            .expect(1)
            .mount(&server)
            .await;
        let mailer = Resend::new(
            &format!("{}/emails", server.uri()),
            "re_test",
            "Alertas <a@site.example>",
        )
        .unwrap();
        let now = Utc::now();
        let report = run(
            &demo::recipients(now),
            &demo::candidates(now),
            &Delivery {
                mailer: Some(&mailer),
                store: None,
            },
            &SETTINGS,
            now,
        )
        .await;
        assert_eq!((report.sent, report.failed, report.would_send), (1, 0, 0));
    }

    #[tokio::test]
    async fn a_failed_send_does_not_leak_the_key_or_the_address() {
        let server = MockServer::start().await;
        Mock::given(method("POST"))
            .respond_with(ResponseTemplate::new(403).set_body_string("forbidden"))
            .mount(&server)
            .await;
        let mailer = Resend::new(&server.uri(), "re_secret", "a@site.example").unwrap();
        let email = Email {
            subject: "s".into(),
            text: "t".into(),
            html: "h".into(),
            unsubscribe_url: "u".into(),
        };
        let error = mailer.send("p@example.com", &email).await.unwrap_err();
        let shown = format!("{error:#} {mailer:?}");
        assert!(shown.contains("403"));
        assert!(!shown.contains("re_secret") && !shown.contains("p@example.com"));
    }

    #[tokio::test]
    async fn the_daily_cap_defers_the_rest() {
        let now = Utc::now();
        let mut recipients = demo::recipients(now);
        recipients.truncate(1);
        recipients.push(recipients[0].clone());
        let report = run(
            &recipients,
            &demo::candidates(now),
            &Delivery {
                mailer: None,
                store: None,
            },
            &Settings {
                site_url: "https://site.example",
                max_emails: 1,
            },
            now,
        )
        .await;
        assert_eq!(
            (report.digests, report.would_send, report.over_cap),
            (2, 1, 1)
        );
    }
}
