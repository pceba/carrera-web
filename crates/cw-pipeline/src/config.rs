//! `config/companies.yaml`: the employers whose public ATS board we read.

use cw_domain::Source;
use serde::Deserialize;

const BUNDLED: &str = include_str!("../../../config/companies.yaml");

#[derive(Debug, Clone, Deserialize, PartialEq, Eq)]
pub struct Company {
    pub name: String,
    pub ats: Source,
    pub slug: String,
}

#[derive(Deserialize)]
struct CompaniesFile {
    companies: Vec<Company>,
}

pub fn parse_companies(yaml: &str) -> anyhow::Result<Vec<Company>> {
    let file: CompaniesFile = serde_yaml_ng::from_str(yaml)?;
    for company in &file.companies {
        anyhow::ensure!(
            company.ats.is_company_board(),
            "{}: `{}` is not a company board (use greenhouse, lever, ashby, workable or smartrecruiters)",
            company.name,
            company.ats
        );
    }
    Ok(file.companies)
}

pub fn bundled_companies() -> Vec<Company> {
    parse_companies(BUNDLED).expect("config/companies.yaml must be valid")
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashSet;

    #[test]
    fn bundled_companies_are_valid_and_unique() {
        let companies = bundled_companies();
        assert!(companies.len() >= 20);
        let mut seen = HashSet::new();
        for c in &companies {
            assert!(
                seen.insert((c.ats, c.slug.to_lowercase())),
                "duplicate board: {} {}",
                c.ats,
                c.slug
            );
        }
    }

    #[test]
    fn a_general_source_is_not_a_board() {
        let yaml = "companies:\n  - { name: X, ats: remotive, slug: x }\n";
        assert!(parse_companies(yaml).is_err());
    }
}
