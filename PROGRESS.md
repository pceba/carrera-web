# PROGRESS

Last updated: 2026-11-27 (Claude Opus 5.5, orchestrator; merged WS-R2a and WS-R2b)

## Current step

Phase 2 (plan in `docs/roadmap.md`, six industries). Orchestrator brief: `docs/ORCHESTRATOR_PROMPT.md`.
At most 2 sessions at a time, slices of about 1 hour (briefs in `docs/briefs/ws_*2*`, `ws_ia3_*`).

## Done

- M1 + Rust core phase 1 (ADR-001). Editorial UI v1.
- WS-R2a merged: six-industry taxonomy (ADR-004, parity now covers parsers/level/place only),
  `cw-lexicon`, `cw-match` (score 0-100 + Spanish reasons, builds for wasm32). Dry run keeps 27
  postings: consulting 19, ai 4, data-science 3, PE 0, IB 0 (big-law's one hit was Cabify in-house
  legal, fixed in WS-R2b).
- WS-R2b merged: `cw-cv` (TXT/DOCX/PDF, pure Rust: zip, quick-xml, lopdf), `cw-wasm`
  (`parse_cv`, `rank`), bundle in `src/lib/wasm/` 835 KB gzipped, CI job `wasm` checks
  `INPUTS.sha256` staleness. Rebuild: `sh crates/cw-wasm/build.sh`.

## In flight

- WS-IA (branch `claude/nifty-solomon-fc84d8`): build green, home + map + hub/section CSS done.
  Slice 2 (`/preparacion`, `/recursos`) done. Slice 3 running: e2e rewrite, Lighthouse,
  screenshots v2, merge main in; merge into main only after that.
- WS-R2c (not started): `/cuenta/encaje` + `/dev/encaje`, after WS-IA merges (it uses the new UI).

## Next after these

`cw-alerts` (Resend digest via GitHub Actions); rework `config/companies.yaml` for the six
industries (PE, IB, Big Law have no ATS boards; consulting is mostly Sopra Steria).

## On hold

Industry research: wait for Pablo's Gemini Deep Research report, then plan wave 2.

## Open threads

- Pablo: connect Vercel; Supabase EU + migrations + secrets; legal placeholders; site name;
  Jobicy terms; Adzuna keys optional. 13 stale worktrees in `.claude/worktrees/` (ask before removing).

## Gotchas

- Windows: no MSVC. `cargo +stable-x86_64-pc-windows-gnu` with WinLibs `mingw64/bin` on PATH.
- `cargo test` regenerates `src/lib/generated/`; commit the result or CI fails.
- Worktrees need `npm ci`. Run `npx prettier --write` on docs too (handovers broke format:check).
- Stale `.next/` can break `tsc` after route moves: `rm -rf .next`.
- Postings have no description: matching uses titles only; present ranking as a sort, not a verdict.
