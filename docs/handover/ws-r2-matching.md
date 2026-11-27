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

## Left / next (WS-R2b)
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
