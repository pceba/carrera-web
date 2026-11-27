//! One digest per person: new postings only, best first, at most ten, never empty.

use chrono::{DateTime, Duration, Utc};
use cw_domain::Posting;
use cw_lexicon::Lexicon;

use crate::model::{Candidate, Recipient};

/// Postings per email.
pub const MAX_ITEMS: usize = 10;
/// A first digest (no `last_sent_at`) looks back this far, not at the whole table.
pub const FIRST_WINDOW_DAYS: i64 = 7;
/// Below this `cw-match` score a posting is noise for that person. An empty profile scores 51
/// (every signal neutral) so it still receives everything; a person who picked industries does
/// not receive postings from the others unless role, skills and place all line up.
pub const MIN_SCORE: u8 = 50;

#[derive(Debug)]
pub struct Item<'a> {
    pub posting: &'a Posting,
    pub score: u8,
    pub reasons: Vec<String>,
}

#[derive(Debug)]
pub struct Digest<'a> {
    pub recipient: &'a Recipient,
    pub items: Vec<Item<'a>>,
}

/// Only postings first seen after this moment are new for the person.
pub fn since(recipient: &Recipient, now: DateTime<Utc>) -> DateTime<Utc> {
    recipient
        .last_sent_at
        .unwrap_or_else(|| now - Duration::days(FIRST_WINDOW_DAYS))
}

/// Build the digests that have something to say. Recipients with nothing new are skipped, so
/// the caller never sends an empty email. Output order follows the input order.
pub fn build<'a>(
    recipients: &'a [Recipient],
    candidates: &'a [Candidate],
    lexicon: &Lexicon,
    now: DateTime<Utc>,
) -> Vec<Digest<'a>> {
    recipients
        .iter()
        .filter_map(|recipient| {
            let cutoff = since(recipient, now);
            let fresh: Vec<&Candidate> = candidates
                .iter()
                .filter(|c| c.first_seen_at.unwrap_or(now) > cutoff)
                .collect();
            // `rank` wants a slice of postings and answers with positions into it.
            let postings: Vec<Posting> = fresh.iter().map(|c| c.posting.clone()).collect();
            let items: Vec<Item<'a>> = cw_match::rank(&recipient.profile(), &postings, lexicon)
                .into_iter()
                .filter(|r| r.score >= MIN_SCORE)
                .take(MAX_ITEMS)
                .map(|r| Item {
                    posting: &fresh[r.index].posting,
                    score: r.score,
                    reasons: r.reasons,
                })
                .collect();
            (!items.is_empty()).then_some(Digest { recipient, items })
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;
    use cw_domain::{Industry, Level, Source};
    use serde_json::json;

    fn now() -> DateTime<Utc> {
        Utc.with_ymd_and_hms(2026, 11, 27, 8, 0, 0).unwrap()
    }

    fn recipient(industries: &[&str], last_sent_days_ago: Option<i64>) -> Recipient {
        serde_json::from_value(json!({
            "subscription_id": "s1",
            "email": "persona@example.com",
            "industries": industries,
            "roles": [], "skills": [], "locations": [],
            "last_sent_at": last_sent_days_ago.map(|d| (now() - Duration::days(d)).to_rfc3339()),
            "unsubscribe_token": "tok"
        }))
        .unwrap()
    }

    fn candidate(id: &str, title: &str, industry: Industry, hours_ago: i64) -> Candidate {
        Candidate {
            posting: Posting {
                source: Source::Greenhouse,
                external_id: id.into(),
                source_url: format!("https://example.com/{id}"),
                company: "Empresa Ficticia".into(),
                title: title.into(),
                location: None,
                city: None,
                remote: false,
                level: Level::Junior,
                industry,
                posted_at: None,
            },
            first_seen_at: Some(now() - Duration::hours(hours_ago)),
        }
    }

    fn lexicon() -> Lexicon {
        Lexicon::bundled()
    }

    #[test]
    fn only_postings_newer_than_last_sent_count() {
        let recipients = [recipient(&["consulting"], Some(1))];
        let candidates = [
            candidate("new", "Analista", Industry::Consulting, 5),
            candidate("old", "Analista", Industry::Consulting, 30),
        ];
        let digests = build(&recipients, &candidates, &lexicon(), now());
        assert_eq!(digests.len(), 1);
        assert_eq!(digests[0].items.len(), 1);
        assert_eq!(digests[0].items[0].posting.external_id, "new");
    }

    #[test]
    fn a_first_digest_looks_back_seven_days() {
        let recipients = [recipient(&["consulting"], None)];
        let candidates = [
            candidate("six-days", "Analista", Industry::Consulting, 6 * 24),
            candidate("eight-days", "Analista", Industry::Consulting, 8 * 24),
        ];
        let digests = build(&recipients, &candidates, &lexicon(), now());
        assert_eq!(digests[0].items.len(), 1);
        assert_eq!(digests[0].items[0].posting.external_id, "six-days");
    }

    #[test]
    fn nothing_new_means_no_digest() {
        let recipients = [recipient(&["consulting"], Some(1))];
        let candidates = [candidate("old", "Analista", Industry::Consulting, 48)];
        assert!(build(&recipients, &candidates, &lexicon(), now()).is_empty());
        assert!(build(&recipients, &[], &lexicon(), now()).is_empty());
    }

    #[test]
    fn other_industries_are_left_out() {
        let recipients = [recipient(&["consulting"], Some(1))];
        let candidates = [candidate("law", "Abogado junior", Industry::BigLaw, 2)];
        assert!(build(&recipients, &candidates, &lexicon(), now()).is_empty());
    }

    #[test]
    fn an_empty_profile_still_gets_everything_new() {
        let recipients = [recipient(&[], Some(1))];
        let candidates = [candidate("law", "Abogado junior", Industry::BigLaw, 2)];
        assert_eq!(build(&recipients, &candidates, &lexicon(), now()).len(), 1);
    }

    #[test]
    fn at_most_ten_and_best_first() {
        let recipients = [recipient(&["consulting", "ai"], Some(1))];
        let mut candidates: Vec<Candidate> = (0..12)
            .map(|i| candidate(&format!("c{i}"), "Analista", Industry::Consulting, 2))
            .collect();
        // The second-choice industry scores lower, so it must come after every consulting one.
        candidates.insert(0, candidate("ai", "Analista", Industry::Ai, 2));
        let digests = build(&recipients, &candidates, &lexicon(), now());
        let items = &digests[0].items;
        assert_eq!(items.len(), MAX_ITEMS);
        assert!(items.windows(2).all(|w| w[0].score >= w[1].score));
        assert!(items.iter().all(|i| i.posting.external_id != "ai"));
    }

    #[test]
    fn each_person_gets_their_own_digest() {
        let recipients = [
            recipient(&["consulting"], Some(1)),
            recipient(&["big-law"], Some(1)),
        ];
        let candidates = [candidate("c", "Analista", Industry::Consulting, 2)];
        let digests = build(&recipients, &candidates, &lexicon(), now());
        assert_eq!(digests.len(), 1);
        assert_eq!(digests[0].recipient.industries, vec![Industry::Consulting]);
    }
}
