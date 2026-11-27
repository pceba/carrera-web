//! Shared types for the whole engine: collectors, classifier, pipeline and (later) matching and
//! alerts all speak these types, and the website reads the TypeScript twins that `ts-rs`
//! generates from them into `src/lib/generated/`.
//!
//! Rule: hand-written TypeScript must not redefine these types. Change them here, run
//! `cargo test`, commit the regenerated files; CI fails if the committed copies are stale.

mod industry;
mod level;
mod posting;
mod source;

pub use industry::Industry;
pub use level::Level;
pub use posting::{Posting, RawPosting};
pub use source::Source;
