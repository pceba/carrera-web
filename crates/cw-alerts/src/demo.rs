//! Fictional data for the dry run when Supabase is not connected. Nothing here is real: the
//! addresses use the reserved `example.com` domain and the companies do not exist.

use chrono::{DateTime, Duration, Utc};
use serde_json::json;

use crate::model::{Candidate, Recipient};

pub fn recipients(now: DateTime<Utc>) -> Vec<Recipient> {
    let rows = json!([
        {
            "subscription_id": "demo-1",
            "email": "ana@example.com",
            "industries": ["consulting", "data-science"],
            "roles": ["analista"],
            "skills": ["SQL", "Python"],
            "locations": ["Madrid"],
            "remote": "any",
            "last_sent_at": (now - Duration::days(1)).to_rfc3339(),
            "unsubscribe_token": "demo-token-1"
        },
        {
            "subscription_id": "demo-2",
            "email": "luis@example.com",
            "industries": ["big-law"],
            "roles": ["abogado"],
            "skills": [],
            "locations": ["Barcelona"],
            "remote": "onsite",
            "last_sent_at": (now - Duration::days(1)).to_rfc3339(),
            "unsubscribe_token": "demo-token-2"
        }
    ]);
    serde_json::from_value(rows).expect("demo recipients are valid")
}

pub fn candidates(now: DateTime<Utc>) -> Vec<Candidate> {
    let fresh = (now - Duration::hours(6)).to_rfc3339();
    let old = (now - Duration::days(3)).to_rfc3339();
    let rows = json!([
        {
            "source": "greenhouse", "external_id": "d1", "source_url": "https://example.com/d1",
            "company": "Consultora Ficticia", "title": "Analista junior de consultoría",
            "location": "Madrid, España", "city": "Madrid", "remote": false,
            "level": "junior", "industry": "consulting", "posted_at": null,
            "first_seen_at": fresh
        },
        {
            "source": "greenhouse", "external_id": "d2", "source_url": "https://example.com/d2",
            "company": "Datos Imaginarios", "title": "Junior Data Analyst (SQL, Python)",
            "location": "Madrid, España", "city": "Madrid", "remote": false,
            "level": "junior", "industry": "data-science", "posted_at": null,
            "first_seen_at": fresh
        },
        {
            "source": "greenhouse", "external_id": "d3", "source_url": "https://example.com/d3",
            "company": "Consultora Antigua", "title": "Analista de consultoría",
            "location": "Madrid, España", "city": "Madrid", "remote": false,
            "level": "junior", "industry": "consulting", "posted_at": null,
            "first_seen_at": old
        }
    ]);
    serde_json::from_value(rows).expect("demo candidates are valid")
}
