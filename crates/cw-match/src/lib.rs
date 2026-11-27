//! Profile-to-posting ranking, the heart of "tu encaje".
//!
//! Design rules (they are why this crate has no I/O and no clock):
//! - **Pure and deterministic**: the same profile, postings and lexicon always give the same
//!   order. That makes it unit-testable and lets it run unchanged in the browser (WASM).
//! - **Explainable**: every point comes from one named signal and each signal that fired adds a
//!   Spanish reason, so the UI can say *why* a posting is on top. There is no hidden model.
//! - **Honest about what it knows**: a posting only has title, place, level, remote flag and
//!   industry (no description), so skills are matched against the *title* and against the
//!   industry. It is a sort order, not a judgement; the UI should say so.
//!
//! Score = sum of five signals, 0..=100 (integers, so there is no float rounding to reason about):
//!
//! | signal   | max | fires when                                                          |
//! |----------|----:|---------------------------------------------------------------------|
//! | industry |  35 | the posting's industry is one the person picked (first pick = most) |
//! | role     |  30 | the title contains a role the person looks for                      |
//! | skills   |  20 | the title names one of their skills / their skills help in the industry |
//! | location |  10 | the posting is in one of their cities (or remote and they want it)  |
//! | remote   |   5 | the remote/on-site flag agrees with their preference                |
//!
//! A signal the person left empty (no industries, no cities...) is **neutral**: it gives half
//! its points and no reason, so an empty profile does not zero every posting and an unfilled
//! field never punishes anyone.

use cw_classify::{contains_word, norm};
use cw_domain::{Industry, Posting, Profile, RemotePreference};
use cw_lexicon::Lexicon;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

const INDUSTRY_MAX: u8 = 35;
const ROLE_MAX: u8 = 30;
const SKILLS_MAX: u8 = 20;
const LOCATION_MAX: u8 = 10;
const REMOTE_MAX: u8 = 5;

/// One ranked posting. It points back into the slice given to [`rank`] by position instead of
/// copying the posting, so the browser can keep its own list and just look entries up.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Ranked {
    /// Position of the posting in the input slice.
    pub index: usize,
    /// 0..=100. Compare scores only within one ranking.
    pub score: u8,
    /// Spanish sentences, strongest signal first ("coincide: SQL, Python").
    pub reasons: Vec<String>,
}

/// Score of one posting, with its reasons.
pub fn score(profile: &Profile, posting: &Posting, lexicon: &Lexicon) -> (u8, Vec<String>) {
    let mut reasons = Vec::new();
    let mut total = 0;
    total += industry_signal(profile, posting.industry, &mut reasons);
    total += role_signal(profile, &posting.title, &mut reasons);
    total += skills_signal(profile, posting, lexicon, &mut reasons);
    total += location_signal(profile, posting, &mut reasons);
    total += remote_signal(profile, posting, &mut reasons);
    (total, reasons)
}

/// Rank postings for a profile, best first.
///
/// Ties break on the newer `posted_at` (a posting with no date goes after dated ones), then on
/// the input position, so the order is total and stable.
pub fn rank(profile: &Profile, postings: &[Posting], lexicon: &Lexicon) -> Vec<Ranked> {
    let mut ranked: Vec<Ranked> = postings
        .iter()
        .enumerate()
        .map(|(index, posting)| {
            let (score, reasons) = score(profile, posting, lexicon);
            Ranked {
                index,
                score,
                reasons,
            }
        })
        .collect();
    // `sort_by` is stable, but we compare `index` explicitly anyway so the contract does not
    // silently depend on that. `Option<DateTime>` orders `None` below any date, which is what
    // puts undated postings last when we compare newest-first.
    ranked.sort_by(|a, b| {
        b.score
            .cmp(&a.score)
            .then_with(|| {
                postings[b.index]
                    .posted_at
                    .cmp(&postings[a.index].posted_at)
            })
            .then_with(|| a.index.cmp(&b.index))
    });
    ranked
}

/// Spanish name of an industry, for reasons. (The site's page titles live in `content/`; this is
/// only the short noun used mid-sentence.)
pub const fn industry_label(industry: Industry) -> &'static str {
    match industry {
        Industry::Consulting => "consultoría",
        Industry::Ai => "inteligencia artificial",
        Industry::DataScience => "ciencia de datos",
        Industry::PrivateEquity => "private equity",
        Industry::InvestmentBanking => "banca de inversión",
        Industry::BigLaw => "derecho de los grandes despachos",
    }
}

/// Half of a signal's points, rounded up: what an unfilled field earns.
const fn neutral(max: u8) -> u8 {
    max.div_ceil(2)
}

fn industry_signal(profile: &Profile, industry: Industry, reasons: &mut Vec<String>) -> u8 {
    if profile.industries.is_empty() {
        return neutral(INDUSTRY_MAX);
    }
    let Some(position) = profile.industries.iter().position(|&i| i == industry) else {
        return 0;
    };
    reasons.push(format!("sector: {}", industry_label(industry)));
    // First pick earns everything; each later pick loses 5 points, never below 15, so any
    // chosen industry still outranks an unchosen one.
    let penalty = u8::try_from(position).unwrap_or(u8::MAX).saturating_mul(5);
    INDUSTRY_MAX.saturating_sub(penalty).max(15)
}

fn role_signal(profile: &Profile, title: &str, reasons: &mut Vec<String>) -> u8 {
    let roles: Vec<&String> = profile
        .roles
        .iter()
        .filter(|r| !norm(r).is_empty())
        .collect();
    if roles.is_empty() {
        return neutral(ROLE_MAX);
    }
    let title_norm = norm(title);
    let mut best: Option<(u8, &str)> = None;
    for role in roles {
        let points = role_points(&norm(role), &title_norm);
        if points > best.map_or(0, |(p, _)| p) {
            best = Some((points, role.as_str()));
        }
    }
    match best {
        Some((points, role)) => {
            reasons.push(format!("puesto: «{}»", role.trim()));
            points
        }
        None => 0,
    }
}

/// Points for one role against one title (both already normalised).
/// - the whole phrase appears as words in the title: all the points;
/// - otherwise, if at least half of the role's meaningful words appear, a proportional share,
///   capped at 80% so a partial match never ties a full one. One word alone never counts, so a
///   single filler word cannot match.
fn role_points(role: &str, title: &str) -> u8 {
    if contains_word(title, role) {
        return ROLE_MAX;
    }
    // Words of 3 letters or fewer ("de", "en", "of") carry no meaning for this purpose.
    let words: Vec<&str> = role.split_whitespace().filter(|w| w.len() > 3).collect();
    if words.len() < 2 {
        return 0;
    }
    let hits = words.iter().filter(|w| contains_word(title, w)).count();
    if hits * 2 < words.len() {
        return 0;
    }
    let share = u32::try_from(hits * 80 / words.len()).unwrap_or(0);
    u8::try_from(u32::from(ROLE_MAX) * share / 100).unwrap_or(0)
}

fn skills_signal(
    profile: &Profile,
    posting: &Posting,
    lexicon: &Lexicon,
    reasons: &mut Vec<String>,
) -> u8 {
    if profile.skills.is_empty() {
        return neutral(SKILLS_MAX);
    }
    // The person's skills, resolved to canonical dictionary entries when they are known
    // ("sql " -> SQL); unknown free-text skills are matched literally against the title.
    let title_norm = norm(&posting.title);
    let in_title = lexicon.find_skills(&posting.title);
    let mut named: Vec<String> = Vec::new();
    let mut helpful: Vec<String> = Vec::new();
    for skill in &profile.skills {
        match lexicon.skill_named(skill) {
            Some(entry) => {
                if in_title.iter().any(|e| e.name == entry.name) {
                    push_unique(&mut named, entry.name.clone());
                } else if entry.industries.contains(&posting.industry) {
                    push_unique(&mut helpful, entry.name.clone());
                }
            }
            None => {
                let text = norm(skill);
                if !text.is_empty() && contains_word(&title_norm, &text) {
                    push_unique(&mut named, skill.trim().to_owned());
                }
            }
        }
    }
    // Naming a skill in the title is strong evidence (8 each, up to 16); skills that merely
    // help in the industry are weak evidence (2 each, up to 4).
    let strong = u8::try_from(named.len().min(2)).unwrap_or(2) * 8;
    let weak = u8::try_from(helpful.len().min(2)).unwrap_or(2) * 2;
    if !named.is_empty() {
        reasons.push(format!("coincide: {}", named.join(", ")));
    }
    if !helpful.is_empty() {
        reasons.push(format!(
            "tus habilidades sirven en {}: {}",
            industry_label(posting.industry),
            helpful.join(", ")
        ));
    }
    (strong + weak).min(SKILLS_MAX)
}

fn push_unique(list: &mut Vec<String>, item: String) {
    if !list.contains(&item) {
        list.push(item);
    }
}

fn location_signal(profile: &Profile, posting: &Posting, reasons: &mut Vec<String>) -> u8 {
    // Someone who wants remote work is served by a remote posting wherever it is based.
    if posting.remote && profile.remote == RemotePreference::Remote {
        reasons.push("ubicación: en remoto".to_owned());
        return LOCATION_MAX;
    }
    if profile.locations.iter().all(|l| norm(l).is_empty()) {
        return neutral(LOCATION_MAX);
    }
    let place = norm(&format!(
        "{} {}",
        posting.city.as_deref().unwrap_or_default(),
        posting.location.as_deref().unwrap_or_default()
    ));
    let hit = profile
        .locations
        .iter()
        .find(|l| !norm(l).is_empty() && contains_word(&place, &norm(l)));
    match hit {
        Some(city) => {
            reasons.push(format!("ubicación: {}", city.trim()));
            LOCATION_MAX
        }
        None => 0,
    }
}

fn remote_signal(profile: &Profile, posting: &Posting, reasons: &mut Vec<String>) -> u8 {
    match (profile.remote, posting.remote) {
        (RemotePreference::Any, _) => neutral(REMOTE_MAX),
        (RemotePreference::Remote, true) => {
            reasons.push("se puede hacer en remoto".to_owned());
            REMOTE_MAX
        }
        (RemotePreference::Onsite, false) => {
            reasons.push("presencial, como prefieres".to_owned());
            REMOTE_MAX
        }
        _ => 0,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{TimeZone, Utc};
    use cw_domain::{Level, Source};

    fn posting(title: &str, industry: Industry) -> Posting {
        Posting {
            source: Source::Greenhouse,
            external_id: title.to_owned(),
            source_url: "https://example.com".into(),
            company: "Acme".into(),
            title: title.to_owned(),
            location: Some("Madrid, Spain".into()),
            city: Some("Madrid".into()),
            remote: false,
            level: Level::Analyst,
            industry,
            posted_at: None,
        }
    }

    fn lexicon() -> Lexicon {
        Lexicon::bundled()
    }

    fn s(items: &[&str]) -> Vec<String> {
        items.iter().map(|i| (*i).to_owned()).collect()
    }

    #[test]
    fn empty_profile_is_neutral_and_silent() {
        let (points, reasons) = score(
            &Profile::default(),
            &posting("Analyst", Industry::Consulting),
            &lexicon(),
        );
        assert_eq!(points, 18 + 15 + 10 + 5 + 3);
        assert!(reasons.is_empty());
    }

    #[test]
    fn industry_order_is_a_preference() {
        let profile = Profile {
            industries: vec![Industry::Ai, Industry::Consulting],
            ..Profile::default()
        };
        let first = industry_signal(&profile, Industry::Ai, &mut Vec::new());
        let second = industry_signal(&profile, Industry::Consulting, &mut Vec::new());
        let other = industry_signal(&profile, Industry::BigLaw, &mut Vec::new());
        assert_eq!((first, second, other), (35, 30, 0));
    }

    #[test]
    fn industry_reason_is_in_spanish() {
        let profile = Profile {
            industries: vec![Industry::DataScience],
            ..Profile::default()
        };
        let mut reasons = Vec::new();
        industry_signal(&profile, Industry::DataScience, &mut reasons);
        assert_eq!(reasons, ["sector: ciencia de datos"]);
    }

    #[test]
    fn role_full_phrase_beats_partial_and_none() {
        let full = role_points("data scientist", &norm("Junior Data Scientist"));
        let partial = role_points(
            "analista financiero inversiones",
            &norm("Analista Financiero"),
        );
        let none = role_points("data scientist", &norm("Paralegal"));
        assert_eq!(full, 30);
        assert!(partial > 0 && partial < full, "partial = {partial}");
        assert_eq!(none, 0);
    }

    #[test]
    fn role_ignores_accents_and_case() {
        let profile = Profile {
            roles: s(&["Analista de Inversión"]),
            ..Profile::default()
        };
        let mut reasons = Vec::new();
        let points = role_signal(&profile, "ANALISTA DE INVERSION, Madrid", &mut reasons);
        assert_eq!(points, 30);
        assert_eq!(reasons, ["puesto: «Analista de Inversión»"]);
    }

    #[test]
    fn skills_named_in_title_are_reported() {
        let profile = Profile {
            skills: s(&["sql", "Python", "Valoración"]),
            ..Profile::default()
        };
        let p = posting("Data Analyst (SQL, Python)", Industry::DataScience);
        let mut reasons = Vec::new();
        let points = skills_signal(&profile, &p, &lexicon(), &mut reasons);
        assert_eq!(reasons[0], "coincide: SQL, Python");
        assert!(points >= 16, "points = {points}");
    }

    #[test]
    fn skills_that_help_in_the_industry_earn_a_little() {
        let profile = Profile {
            skills: s(&["Python"]),
            ..Profile::default()
        };
        let p = posting("Analyst", Industry::DataScience);
        let mut reasons = Vec::new();
        let points = skills_signal(&profile, &p, &lexicon(), &mut reasons);
        assert_eq!(points, 2);
        assert_eq!(
            reasons,
            ["tus habilidades sirven en ciencia de datos: Python"]
        );
    }

    #[test]
    fn unknown_free_text_skill_matches_the_title_literally() {
        let profile = Profile {
            skills: s(&["Cobol"]),
            ..Profile::default()
        };
        let mut reasons = Vec::new();
        let p = posting("Cobol Developer", Industry::Ai);
        assert_eq!(skills_signal(&profile, &p, &lexicon(), &mut reasons), 8);
        assert_eq!(reasons, ["coincide: Cobol"]);
    }

    #[test]
    fn location_matches_city_and_reports_the_users_spelling() {
        let profile = Profile {
            locations: s(&["Barcelona", "Madrid"]),
            ..Profile::default()
        };
        let mut reasons = Vec::new();
        let p = posting("Analyst", Industry::Consulting);
        assert_eq!(location_signal(&profile, &p, &mut reasons), 10);
        assert_eq!(reasons, ["ubicación: Madrid"]);
        let mut elsewhere = p;
        elsewhere.city = Some("Valencia".into());
        elsewhere.location = Some("Valencia, Spain".into());
        assert_eq!(location_signal(&profile, &elsewhere, &mut Vec::new()), 0);
    }

    #[test]
    fn remote_posting_satisfies_location_for_remote_seekers() {
        let profile = Profile {
            locations: s(&["Madrid"]),
            remote: RemotePreference::Remote,
            ..Profile::default()
        };
        let mut p = posting("Analyst", Industry::Consulting);
        p.remote = true;
        p.city = None;
        p.location = Some("Remote - EMEA".into());
        let mut reasons = Vec::new();
        assert_eq!(location_signal(&profile, &p, &mut reasons), 10);
        assert_eq!(reasons, ["ubicación: en remoto"]);
    }

    #[test]
    fn remote_preference_signal() {
        let mut remote = posting("A", Industry::Ai);
        remote.remote = true;
        let onsite = posting("A", Industry::Ai);
        let wants = |remote| Profile {
            remote,
            ..Profile::default()
        };
        let pts = |profile: &Profile, p: &Posting| remote_signal(profile, p, &mut Vec::new());
        assert_eq!(pts(&wants(RemotePreference::Remote), &remote), 5);
        assert_eq!(pts(&wants(RemotePreference::Remote), &onsite), 0);
        assert_eq!(pts(&wants(RemotePreference::Onsite), &onsite), 5);
        assert_eq!(pts(&wants(RemotePreference::Onsite), &remote), 0);
        assert_eq!(pts(&wants(RemotePreference::Any), &remote), 3);
    }

    #[test]
    fn rank_orders_by_score_then_recency_then_position() {
        let profile = Profile {
            industries: vec![Industry::Consulting],
            ..Profile::default()
        };
        let mut old = posting("Analyst A", Industry::Consulting);
        old.posted_at = Some(Utc.with_ymd_and_hms(2026, 1, 1, 0, 0, 0).unwrap());
        let mut new = posting("Analyst B", Industry::Consulting);
        new.posted_at = Some(Utc.with_ymd_and_hms(2026, 6, 1, 0, 0, 0).unwrap());
        let undated = posting("Analyst C", Industry::Consulting);
        let wrong_industry = posting("Analyst D", Industry::BigLaw);
        let postings = [old, wrong_industry, undated, new];
        let order: Vec<usize> = rank(&profile, &postings, &lexicon())
            .iter()
            .map(|r| r.index)
            .collect();
        // Same score for 0, 2, 3: newest first, undated last; the other industry is last.
        assert_eq!(order, [3, 0, 2, 1]);
    }

    #[test]
    fn rank_is_deterministic_and_explains_itself() {
        let profile = Profile {
            industries: vec![Industry::DataScience, Industry::Ai],
            roles: s(&["data analyst"]),
            skills: s(&["SQL", "Python"]),
            locations: s(&["Madrid"]),
            remote: RemotePreference::Any,
            ..Profile::default()
        };
        let postings = [
            posting("Paralegal", Industry::BigLaw),
            posting("Junior Data Analyst - SQL, Python", Industry::DataScience),
        ];
        let first = rank(&profile, &postings, &lexicon());
        assert_eq!(first, rank(&profile, &postings, &lexicon()));
        assert_eq!(first[0].index, 1);
        assert_eq!(first[0].score, 35 + 30 + 16 + 10 + 3);
        assert_eq!(
            first[0].reasons,
            [
                "sector: ciencia de datos",
                "puesto: «data analyst»",
                "coincide: SQL, Python",
                "ubicación: Madrid"
            ]
        );
        assert!(first[1].score < first[0].score);
    }
}
