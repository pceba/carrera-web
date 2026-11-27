//! Deterministic classification of raw postings: is it a junior role in (or open to) Spain, and
//! which level and industry does it belong to? No network, no AI, no randomness: the same input
//! and the same `config/rules.yaml` always give the same answer, and every decision can be
//! explained by pointing at a keyword in that file.
//!
//! Level and location rules still behave exactly like the Python `pipeline/classify.py` this crate
//! replaced (the parity test in `cw-pipeline` replays those results). The industry taxonomy does
//! **not**: phase 2 narrowed it to six industries (`docs/roadmap.md`) and drops every posting
//! outside them, so parity with Python is no longer a goal for industry tags.

mod rules;
mod text;

pub use rules::{Rules, RulesError};
pub use text::{contains_word, norm, title_case};

use cw_domain::{Industry, Level, Posting, RawPosting};

/// Where a posting is, as far as the rules can tell.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Place {
    /// Capitalised city name when one of the rule cities appears in the location.
    pub city: Option<String>,
    pub remote: bool,
}

impl Rules {
    /// The tagged posting, or `None` when it is not a junior role in/for Spain.
    pub fn classify(&self, raw: &RawPosting) -> Option<Posting> {
        if !raw.url.starts_with("http") || raw.title.is_empty() {
            return None;
        }
        let level = self.detect_level(raw)?;
        let place = self.detect_place(raw)?;
        let industry = self.detect_industry(raw)?;
        Some(Posting {
            source: raw.source,
            external_id: raw.external_id.clone(),
            source_url: raw.url.clone(),
            company: raw.company.clone(),
            title: raw.title.clone(),
            location: raw.location.clone(),
            city: place.city,
            remote: place.remote,
            level,
            industry,
            posted_at: raw.posted_at,
        })
    }

    /// First level (in `rules.yaml` order) whose words appear in the title. A title containing
    /// any `exclude` word ("Senior Analyst") is never junior.
    pub fn detect_level(&self, raw: &RawPosting) -> Option<Level> {
        let title = norm(&raw.title);
        if self.exclude.iter().any(|word| contains_word(&title, word)) {
            return None;
        }
        let meta = norm(&format!(
            "{} {}",
            raw.employment_type.as_deref().unwrap_or(""),
            raw.department.as_deref().unwrap_or("")
        ));
        self.levels.iter().find_map(|(level, words)| {
            let in_title = words.iter().any(|word| contains_word(&title, word));
            // Boards often put "Internship" in the employment type rather than in the title.
            let intern_by_metadata = *level == Level::Intern
                && (contains_word(&meta, "intern") || contains_word(&meta, "internship"));
            (in_title || intern_by_metadata).then_some(*level)
        })
    }

    /// Spain, or a remote role open to Spain. `None` means the posting is rejected.
    pub fn detect_place(&self, raw: &RawPosting) -> Option<Place> {
        let location = norm(raw.location.as_deref().unwrap_or(""));
        let title = norm(&raw.title);
        let remote_text = format!("{location} {title}");
        let remote = raw
            .workplace_type
            .as_deref()
            .is_some_and(|w| w.eq_ignore_ascii_case("remote"))
            || self
                .remote_words
                .iter()
                .any(|word| contains_word(&remote_text, word));

        let city = self
            .cities
            .iter()
            .find(|city| contains_word(&location, &city.norm));
        let in_spain = city.is_some()
            || self
                .country_names
                .iter()
                .any(|name| contains_word(&location, name));
        if in_spain {
            return Some(Place {
                city: city.map(|c| title_case(&c.raw)),
                remote,
            });
        }
        let open_to_spain = location.is_empty()
            || self
                .remote_ok
                .iter()
                .any(|word| contains_word(&location, word));
        (remote && open_to_spain).then_some(Place { city: None, remote })
    }

    /// First industry (in `rules.yaml` order) with a word in company + title + department.
    /// `None` means the posting belongs to none of the six industries and is dropped.
    pub fn detect_industry(&self, raw: &RawPosting) -> Option<Industry> {
        let text = norm(&format!(
            "{} {} {}",
            raw.company,
            raw.title,
            raw.department.as_deref().unwrap_or("")
        ));
        self.industries
            .iter()
            .find(|(_, words)| words.iter().any(|word| contains_word(&text, word)))
            .map(|(industry, _)| *industry)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use cw_domain::Source;

    fn raw(title: &str, location: Option<&str>) -> RawPosting {
        RawPosting {
            source: Source::Greenhouse,
            external_id: "1".into(),
            company: "Deloitte".into(),
            title: title.into(),
            url: "https://example.com/1".into(),
            location: location.map(str::to_owned),
            department: None,
            employment_type: None,
            workplace_type: None,
            posted_at: None,
        }
    }

    fn classify(title: &str) -> Option<Posting> {
        Rules::bundled().classify(&raw(title, Some("Madrid, Spain")))
    }

    #[test]
    fn keeps_junior_levels() {
        for (title, level) in [
            ("Junior Data Analyst", Level::Junior),
            ("Estudiante en prácticas - Logística", Level::Intern),
            ("Marketing Intern", Level::Intern),
            ("Becario/a de Finanzas", Level::Intern),
            ("Graduate Programme 2027", Level::Trainee),
            ("Law Firm Intern, Summer Associate", Level::Intern),
            ("Vacation Scheme", Level::Intern),
            ("Paralegal", Level::Junior),
            ("Software Engineer, New Grad", Level::Graduate),
            ("Financial Analyst", Level::Analyst),
            ("Management Trainee", Level::Trainee),
        ] {
            assert_eq!(classify(title).map(|p| p.level), Some(level), "{title}");
        }
    }

    #[test]
    fn drops_senior_and_unrelated_titles() {
        for title in [
            "Senior Analyst",
            "Junior Team Lead",
            "Account Executive",
            "Internal Tools Engineer",
        ] {
            assert!(classify(title).is_none(), "{title}");
        }
    }

    #[test]
    fn intern_can_come_from_the_employment_type() {
        let mut posting = raw("Strategy Support", Some("Madrid, Spain"));
        posting.employment_type = Some("Internship".into());
        let kept = Rules::bundled().classify(&posting).unwrap();
        assert_eq!(kept.level, Level::Intern);
    }

    #[test]
    fn location_rules() {
        let rules = Rules::bundled();
        let madrid = rules
            .classify(&raw("Junior Analyst", Some("Madrid, Spain")))
            .unwrap();
        assert_eq!(madrid.city.as_deref(), Some("Madrid"));
        assert!(!madrid.remote);

        assert!(
            rules
                .classify(&raw("Junior Analyst", Some("Paris, France")))
                .is_none()
        );

        let mut us = raw("Junior Analyst", Some("Remote, USA"));
        us.workplace_type = Some("remote".into());
        assert!(rules.classify(&us).is_none());

        let mut eu = raw("Junior Analyst", Some("Remote, Europe"));
        eu.workplace_type = Some("remote".into());
        let eu = rules.classify(&eu).unwrap();
        assert!(eu.remote && eu.city.is_none());

        let seville = rules
            .classify(&raw("Junior Analyst", Some("Sevilla (remoto)")))
            .unwrap();
        assert!(seville.remote);
    }

    #[test]
    fn industry_rules() {
        let industry = |title: &str, company: &str| {
            let mut posting = raw(title, Some("Madrid, Spain"));
            posting.company = company.into();
            Rules::bundled().classify(&posting).map(|p| p.industry)
        };
        let cases = [
            ("Junior Consultant", "Acme", Industry::Consulting),
            ("Analyst", "McKinsey & Company", Industry::Consulting),
            ("Junior Machine Learning Engineer", "Acme", Industry::Ai),
            ("Graduate Software Engineer", "OpenAI", Industry::Ai),
            ("Junior Data Scientist", "Acme", Industry::DataScience),
            ("Junior Data Analyst", "Deloitte", Industry::DataScience),
            (
                "Summer Analyst",
                "Private Equity Fund",
                Industry::PrivateEquity,
            ),
            ("Analyst", "KKR", Industry::PrivateEquity),
            (
                "Investment Banking Analyst",
                "Acme",
                Industry::InvestmentBanking,
            ),
            (
                "Summer Analyst",
                "Goldman Sachs",
                Industry::InvestmentBanking,
            ),
            ("Abogado Junior", "Acme", Industry::BigLaw),
            ("Trainee Lawyer", "Garrigues", Industry::BigLaw),
            ("Paralegal", "Clifford Chance", Industry::BigLaw),
        ];
        for (title, company, expected) in cases {
            assert_eq!(
                industry(title, company),
                Some(expected),
                "{title} @ {company}"
            );
        }
    }

    #[test]
    fn postings_outside_the_six_industries_are_dropped() {
        for (title, company) in [
            ("Junior Software Engineer", "Acme"),
            ("Becario de Producción", "Bosch"),
            ("Marketing Intern", "Acme"),
            ("Junior Receptionist", "Acme"),
            ("Financial Analyst", "Acme"),
        ] {
            let mut posting = raw(title, Some("Madrid, Spain"));
            posting.company = company.into();
            assert!(Rules::bundled().classify(&posting).is_none(), "{title}");
        }
    }

    #[test]
    fn first_matching_industry_wins() {
        // "Data Scientist" is more specific than the consulting firm it works for.
        let mut posting = raw("Junior Data Scientist", Some("Madrid, Spain"));
        posting.company = "Accenture".into();
        let kept = Rules::bundled().classify(&posting).unwrap();
        assert_eq!(kept.industry, Industry::DataScience);
    }

    #[test]
    fn rejects_postings_without_a_link_or_title() {
        let rules = Rules::bundled();
        let mut no_link = raw("Junior Analyst", Some("Madrid"));
        no_link.url.clear();
        assert!(rules.classify(&no_link).is_none());
        assert!(rules.classify(&raw("", Some("Madrid"))).is_none());
    }
}
