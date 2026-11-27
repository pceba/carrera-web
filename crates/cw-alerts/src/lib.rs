//! Daily digest of new postings, by email (`docs/decisions.md`, ADR-005).
//!
//! `digest` decides who gets what (pure, uses `cw-match`), `render` writes the Spanish email,
//! `resend` and `store` do the I/O, and `run` ties them together. Dry run is the default: mail
//! only leaves when a Resend key is present.

pub mod demo;
pub mod digest;
pub mod model;
pub mod render;
pub mod resend;
pub mod run;
pub mod store;
