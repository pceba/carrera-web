use std::time::Duration;

use serde_json::Value;

use crate::error::FetchError;

pub const USER_AGENT: &str = "path-postings/0.1 (open-source career guide; github.com/pceba/path)";

/// reqwest is built without a bundled crypto provider (the default one needs cmake and NASM to
/// compile on Windows), so `ring` is installed process-wide instead. Call it before building any
/// `reqwest::Client`. An error only means a provider is already installed, which is fine.
pub fn install_tls_provider() {
    let _ = rustls::crypto::ring::default_provider().install_default();
}

/// A small wrapper over `reqwest` that every source shares: one User-Agent, a 30 s timeout and
/// retries with exponential backoff.
#[derive(Debug, Clone)]
pub struct HttpClient {
    inner: reqwest::Client,
    retries: u32,
    backoff: Duration,
}

impl HttpClient {
    pub fn new() -> Result<Self, reqwest::Error> {
        install_tls_provider();
        let inner = reqwest::Client::builder()
            .user_agent(USER_AGENT)
            .timeout(Duration::from_secs(30))
            .build()?;
        Ok(Self {
            inner,
            retries: 2,
            backoff: Duration::from_secs(2),
        })
    }

    /// Base delay between attempts (doubles each time). Tests use a few milliseconds.
    #[must_use]
    pub fn with_backoff(mut self, backoff: Duration) -> Self {
        self.backoff = backoff;
        self
    }

    /// GET + parse JSON. Retries network errors, bad JSON, 429 and 5xx; any other 4xx is
    /// permanent and returns at once.
    ///
    /// `query` is passed separately from `url` on purpose: error messages mention only `url`,
    /// so API keys in the query string never reach the logs.
    pub async fn get_json(&self, url: &str, query: &[(&str, String)]) -> Result<Value, FetchError> {
        let mut last = FetchError::Transport {
            url: url.to_owned(),
            message: "no attempt made".into(),
        };
        for attempt in 0..=self.retries {
            match self.attempt(url, query).await {
                Ok(value) => return Ok(value),
                Err((error, retry)) => {
                    last = error;
                    if !retry {
                        return Err(last);
                    }
                }
            }
            if attempt < self.retries {
                tokio::time::sleep(self.backoff * 2u32.pow(attempt)).await;
            }
        }
        Err(last)
    }

    /// One try. The `bool` in the error says whether another try makes sense.
    async fn attempt(
        &self,
        url: &str,
        query: &[(&str, String)],
    ) -> Result<Value, (FetchError, bool)> {
        let transport = |message: String| FetchError::Transport {
            url: url.to_owned(),
            message,
        };
        let response = self
            .inner
            .get(url)
            .header(reqwest::header::ACCEPT, "application/json")
            .query(query)
            .send()
            .await
            // `without_url` keeps the query string (and any key in it) out of the message.
            .map_err(|e| (transport(e.without_url().to_string()), true))?;
        let status = response.status();
        if status.as_u16() == 429 || status.is_server_error() {
            return Err((
                FetchError::Status {
                    url: url.to_owned(),
                    status: status.as_u16(),
                },
                true,
            ));
        }
        if status.is_client_error() {
            return Err((
                FetchError::Status {
                    url: url.to_owned(),
                    status: status.as_u16(),
                },
                false,
            ));
        }
        response
            .json::<Value>()
            .await
            .map_err(|e| (transport(e.without_url().to_string()), true))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wiremock::matchers::{method, path};
    use wiremock::{Mock, MockServer, ResponseTemplate};

    fn fast_client() -> HttpClient {
        HttpClient::new()
            .unwrap()
            .with_backoff(Duration::from_millis(1))
    }

    #[tokio::test]
    async fn retries_server_errors_then_succeeds() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/a"))
            .respond_with(ResponseTemplate::new(503))
            .up_to_n_times(2)
            .expect(2)
            .mount(&server)
            .await;
        Mock::given(method("GET"))
            .and(path("/a"))
            .respond_with(ResponseTemplate::new(200).set_body_json(serde_json::json!({"ok": true})))
            .expect(1)
            .mount(&server)
            .await;
        let value = fast_client()
            .get_json(&format!("{}/a", server.uri()), &[])
            .await
            .unwrap();
        assert_eq!(value["ok"], true);
    }

    #[tokio::test]
    async fn does_not_retry_not_found() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .respond_with(ResponseTemplate::new(404))
            .expect(1)
            .mount(&server)
            .await;
        let error = fast_client()
            .get_json(&format!("{}/missing", server.uri()), &[])
            .await
            .unwrap_err();
        assert!(matches!(error, FetchError::Status { status: 404, .. }));
    }

    #[tokio::test]
    async fn gives_up_after_the_retries_and_hides_the_query() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .respond_with(ResponseTemplate::new(500))
            .expect(3)
            .mount(&server)
            .await;
        let error = fast_client()
            .get_json(&server.uri(), &[("app_key", "SECRET".into())])
            .await
            .unwrap_err();
        assert!(matches!(error, FetchError::Status { status: 500, .. }));
        assert!(!error.to_string().contains("SECRET"));
    }

    #[tokio::test]
    async fn invalid_json_is_retried_then_reported() {
        let server = MockServer::start().await;
        Mock::given(method("GET"))
            .respond_with(ResponseTemplate::new(200).set_body_string("<html>not json</html>"))
            .expect(3)
            .mount(&server)
            .await;
        let error = fast_client()
            .get_json(&server.uri(), &[])
            .await
            .unwrap_err();
        assert!(matches!(error, FetchError::Transport { .. }));
    }
}
