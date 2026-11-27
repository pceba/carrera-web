# Brief WS-R2b: cw-cv and cw-wasm (about 1 hour)

Continues WS-R2 after WS-R2a was merged into main (ec4cf4c). Same ownership as
`docs/briefs/ws_r2_matching.md`.

## Deliverable

1. Quick fix: big-law must mean law firms. The Cabify hit in the dry run is an in-house legal role;
   tighten `config/rules.yaml` and add a classifier test for it.
2. `crates/cw-cv`: extract text from PDF, DOCX and TXT and detect a draft `Profile` (skills,
   languages, education, locations) from `cw-lexicon`. Must build for `wasm32-unknown-unknown`
   (pick pure-Rust deps; ask before adding any heavy one). Tests with fictional CVs you create in
   `crates/cw-cv/tests/fixtures/` (no real personal data).
3. `crates/cw-wasm`: `wasm-bindgen` exports `parse_cv(bytes, kind)` and `rank(profile, postings)`
   (`Lexicon::bundled()`). Build with `wasm-pack --target web`, commit the package to
   `src/lib/wasm/`, report its gzipped size (target under 1 MB). Add a CI job in
   `.github/workflows/ci.yml` that rebuilds it and fails if the committed package is stale.

Out of scope (WS-R2c): `/cuenta/encaje` and `/dev/encaje`. Gates: fmt, clippy -D warnings, test,
web checks. Commit after each step; no push, no merge; update `docs/handover/ws-r2-matching.md`.
