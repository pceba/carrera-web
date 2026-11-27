//! Resend's HTTP API (free tier: 100 emails a day, 3,000 a month). Only used when
//! `RESEND_API_KEY` is set. The key is never logged (`Debug` hides it) and errors carry
//! Resend's own explanation, which does not echo the key or the address.

use anyhow::{Context, bail};
use serde_json::json;

use crate::render::Email;

pub const API_URL: &str = "https://api.resend.com/emails";

pub struct Resend {
    client: reqwest::Client,
    url: String,
    key: String,
    from: String,
}

impl std::fmt::Debug for Resend {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Resend")
            .field("url", &self.url)
            .finish_non_exhaustive()
    }
}

impl Resend {
    pub fn new(url: &str, key: &str, from: &str) -> anyhow::Result<Self> {
        cw_sources::install_tls_provider();
        Ok(Self {
            client: reqwest::Client::builder()
                .timeout(std::time::Duration::from_secs(30))
                .build()?,
            url: url.to_owned(),
            key: key.to_owned(),
            from: from.to_owned(),
        })
    }

    pub async fn send(&self, to: &str, email: &Email) -> anyhow::Result<()> {
        let body = json!({
            "from": self.from,
            "to": [to],
            "subject": email.subject,
            "text": email.text,
            "html": email.html,
            "headers": { "List-Unsubscribe": format!("<{}>", email.unsubscribe_url) },
        });
        let response = self
            .client
            .post(&self.url)
            .bearer_auth(&self.key)
            .json(&body)
            .send()
            .await
            .map_err(|e| e.without_url())
            .context("sending email")?;
        let status = response.status();
        if !status.is_success() {
            let text = response.text().await.unwrap_or_default();
            let text: String = text.chars().take(200).collect();
            bail!("Resend answered HTTP {status}: {text}");
        }
        Ok(())
    }
}
