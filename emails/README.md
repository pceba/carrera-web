# emails

**Owner:** WS-F Alerts (M2)

Resend email templates. Daily digest, never one email per posting.

The digest is rendered in Rust (`crates/cw-alerts/src/render.rs`): plain text plus simple HTML, no
images and no tracking pixels. There is no separate template file to keep in sync; run
`cargo run -p cw-alerts -- run --preview` to see a rendered email with fictional data.

Only the owning stream edits this folder. Anything else is a request in the PR description. See `docs/ownership.md`.
