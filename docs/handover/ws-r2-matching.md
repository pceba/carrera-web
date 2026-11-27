# Handover: WS-R2a (matching core)

Date: 2026-11-27 (Claude Sonnet 5.5). Branch `claude/ws-r2-matching-bbf4c1` lineage; no push, no merge.

## Done
- Workspace green: `cargo fmt --check`, `clippy --all-targets -D warnings`, `cargo test` (all pass),
  `npm run typecheck && lint && format:check && test` pass. The WIP only needed one clippy fix in
  `cw-lexicon`; the classifier tests and `tests/parity.rs` already matched the six-industry taxonomy.
- ADR-004 in `docs/decisions.md`: six industries; parity with Python now covers parsers, level and
  place only, not industry.
- New crate `crates/cw-match` (pure, no I/O; `cargo check --target wasm32-unknown-unknown` passes).
  API: `rank(&Profile, &[Posting], &Lexicon) -> Vec<Ranked{index, score 0..=100, reasons}>` and
  `score(..)`. Signals: industry 35 (order = preference), role 30, skills 20 (title hits + skills
  that help in the industry), location 10, remote 5. Empty profile fields are neutral (half
  points, no reason). Ties: newer `posted_at`, then input order. 14 unit tests. Generated
  `src/lib/generated/Ranked.ts` is committed.

## Dry run (no secrets), 2026-11-27, 27 postings kept
consulting 19 (Sopra Steria 18, Celonis 1) · ai 4 · data-science 3 · big-law 1 · **private-equity 0 ·
investment-banking 0**. By source: smartrecruiters 19, greenhouse 5, lever 2, ashby 1; remotive,
jobicy, workable kept 0; Adzuna skipped (no keys). 7,000+ fetched, so the filter is very strict.

## WS-R2b (done)
- big-law now means law firms: removed generic "legal analyst/intern/trainee/assistant" keywords; Cabify regression test.
- `cw-cv`: TXT, DOCX (zip + quick-xml) and PDF (lopdf), 20 MB inflate cap; `detect_profile` drafts skills, languages, locations, education, up to 3 industries (needs 2 skills each); roles never inferred. Fictional CV in `tests/fixtures/`; DOCX/PDF test files are built in memory. Scanned PDFs yield an empty draft.
- `cw-wasm`: `parse_cv(bytes, kind) -> JSON Profile`, `rank(profileJson, postingsJson) -> JSON Ranked[]`; errors are strings. Bundle in `src/lib/wasm/`: 1.94 MB raw, **835 KB gzipped**. Rebuild with `sh crates/cw-wasm/build.sh`; staleness is checked via `INPUTS.sha256` (hash of the Rust inputs, because the .wasm is not byte-reproducible across OSes). CI job `wasm` added to ci.yml. Release profile now opt-level s + LTO (affects cw-pipeline too).
- Root config touched: eslint ignore and .prettierignore for `src/lib/wasm`.
- Dependencies added with Pablo approval: zip, quick-xml, lopdf, wasm-bindgen, serde_json.

## Left (WS-R2c)
- `config/companies.yaml` rework: PE, IB and big-law have no boards at all; consulting is almost all
  Sopra Steria. Big firms use Workday (no public API); look for firms on Greenhouse/Lever/Ashby/
  SmartRecruiters, or accept thin postings and lean on the guides.
- Check the one big-law hit: it is Cabify, probably an in-house legal role, i.e. a rules false
  positive in `config/rules.yaml` (big-law should be law firms).
- `cw-cv`, `cw-wasm` (wasm-bindgen `rank(profile, postings)`; `Lexicon::bundled()` embeds the YAML),
  `/cuenta/encaje`.

## Gotchas
- Postings have no description, so skills match the title only; the UI should say the ranking is a
  sort order, not a verdict.
- Do not regenerate `tests/golden/` to silence parity failures (see ADR-004).
- `cargo test` regenerates `src/lib/generated/`; commit the result.
