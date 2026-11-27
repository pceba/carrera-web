# PROGRESS

Last updated: 2026-11-27 (Claude Opus 5.5, orchestrator; merged WS-R2a)

## Current step

Phase 2 (plan in `docs/roadmap.md`, six industries). Orchestrator brief: `docs/ORCHESTRATOR_PROMPT.md`.
At most 2 sessions at a time, slices of about 1 hour (briefs in `docs/briefs/ws_*2*`, `ws_ia3_*`).

## Done

- M1 + Rust core phase 1 (ADR-001). Editorial UI v1.
- WS-R2a merged: six-industry taxonomy (ADR-004, parity now covers parsers/level/place only),
  `cw-lexicon`, `cw-match` (score 0-100 + Spanish reasons, builds for wasm32). Dry run keeps 27
  postings: consulting 19, ai 4, data-science 3, big-law 1 (false positive), PE 0, IB 0.

## In flight

- WS-IA (branch `claude/nifty-solomon-fc84d8`): build green, home + map + hub/section CSS done.
  Now slice 2: `/preparacion`, `/recursos`, visual check. Then slice 3: e2e rewrite, Lighthouse,
  screenshots v2; merge only after that.
- WS-R2 (branch `claude/sleepy-wilson-35377a`): slice b = big-law rule fix, `cw-cv`, `cw-wasm` +
  CI staleness job. Then slice c: `/cuenta/encaje` + `/dev/encaje` (after WS-IA merges, it uses UI).

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
