//! `cw-pipeline`: collect, classify and store junior postings. The binary in `main.rs` is a thin
//! command-line wrapper over this library, which keeps every step testable.

pub mod collect;
pub mod config;
pub mod output;
pub mod store;
