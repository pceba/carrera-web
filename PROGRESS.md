# PROGRESS

Last updated: 2026-11-27 (Claude Opus 5.5, orchestrator; merged WS-R and WS-UI)

## Current step

M1 + Rust core phase 1 on `main`. Architecture: ADR-001 in `docs/architecture.md` (Rust engine,
Next.js face). Nothing connected yet (Vercel, Supabase, secrets).

## Done

- Rust workspace `crates/` (`cw-domain`, `cw-sources`, `cw-classify`, `cw-pipeline`); Python
  pipeline removed after a parity test. `ts-rs` types in `src/lib/generated/`. ADR-002 (PostgREST),
  ADR-003 in `docs/decisions.md`. Dry run: 102 postings, 42 verified boards; Bosch still 55 of them.
- UI redesign: paper/ink + terracotta tokens, Instrument Serif + Schibsted Grotesk, wordmark, theme
  switch, mobile menu, richer home, bespoke consulting page (rail, ladder, calendar, case panel),
  styled offers and account pages. Screenshots in `docs/screenshots/before|after/`.

## Next task

Phase 2 of the Rust core: `cw-match` + `cw-wasm` (CV parsing and matching in the browser), then
`cw-alerts`. In parallel: run Lighthouse and fix what it finds.

## Open threads

- Pablo: connect Vercel; create Supabase EU, apply migrations, add secrets; fill legal placeholders;
  choose the name; read Jobicy's terms; Adzuna keys optional.
- Consulting is thin on ATS boards (big firms use Workday, no public API).
- Lighthouse not run yet (`npx lighthouse` blocked in-session). Proxy: LCP 1.1-1.3 s, CLS 0.

## Gotchas

- Windows: no MSVC. Build Rust with `cargo +stable-x86_64-pc-windows-gnu` and WinLibs
  `mingw64/bin` on PATH.
- `cargo test` regenerates `src/lib/generated/`; commit the result or CI fails.
- Worktrees need `npm ci` before web checks. Run `npx prettier --write` before committing.
- `npm run start` from a background shell can leave an orphan `next start`; kill by port.
