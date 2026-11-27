/// Why a source could not be collected. One failing board never stops the run: the pipeline
/// records the error in the summary and moves on.
#[derive(Debug, thiserror::Error)]
pub enum FetchError {
    /// The server answered with a status we do not retry (4xx) or kept failing (429, 5xx).
    #[error("{url}: HTTP {status}")]
    Status { url: String, status: u16 },
    /// Network failure or a body that is not JSON, after all retries.
    #[error("{url}: {message}")]
    Transport { url: String, message: String },
    /// The JSON arrived but did not have the shape the source documents.
    #[error("unexpected response shape: {0}")]
    Shape(#[from] serde_json::Error),
}
