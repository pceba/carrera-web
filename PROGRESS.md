# PROGRESS

Last updated: 2026-11-27 (Claude Opus 5.5, orchestrator; merged WS-R2a/b/c, WS-IA, WS-F1)

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
  `INPUTS.sha256` staleness (green on Linux CI). Rebuild: `sh crates/cw-wasm/build.sh`.
- WS-IA merged: calm silver-grey tokens, catalog-driven IA (home, map, hubs, sections, segment
  `estrategia`, `/preparacion`, `/recursos`), nav components, e2e 57 pass. Lighthouse: a11y, BP,
  SEO 100; perf 100 desktop, mobile 93-100 light (noisy on this machine). Screenshots
  `docs/screenshots/v2/`. Handover `docs/handover/ws-ia-calm-structure.md`.

- WS-R2c merged: `/cuenta/encaje` + `/dev/encaje` (CV read in the browser via lazy WASM chunk,
  editable profile in localStorage, ranked postings with reasons). e2e 63 pass; Playwright now
  also starts `next dev` on :3100 for `/dev/*`. Not done: saving the profile to the account.

- WS-F1 merged: `cw-alerts` (digest top 10, min score 50, Spanish text/HTML, Resend + PostgREST,
  dry run by default), migration `alert_subscriptions` (NOT yet run on a real Postgres), workflow
  `alerts.yml` 06:17 UTC, ADR-005. Handover `docs/handover/ws-f-alerts.md`.

## In flight

- W2 IB slice A (branch `claude/confident-kare-97f997`): hub, `como-funciona`, `el-trabajo` done;
  fixing page heights (~6k px) by moving "who hires" into `empresas`. Brief `w2_ib_a.md`;
  Pablo's scope decisions in `docs/research/banca-de-inversion.md` §15.

## Next after these

WS-F2: `/cuenta/alertas` UI (consent row, then subscription) + `/alertas/baja?token=` route. Rework `config/companies.yaml` for the six
industries (PE, IB, Big Law have no ATS boards; consulting is mostly Sopra Steria). Fix stale
`industrias/consultoria/` row in `docs/ownership.md`. (Long consulting sections: wave 2 #2.)

## Wave 2 (planned)

Gemini report saved (PDF in `docs/research/sources/`, digest `docs/research/gemini-deep-research.md`:
a lead, not a citation; US/UK-first). Plan `docs/briefs/wave2_plan.md`: two ~1 h slices per
industry, IB first (running), then consulting, Big Law, PE, data, AI.

## Open threads

- Pablo: connect Vercel; Supabase EU + migrations + secrets; legal placeholders; site name;
  Jobicy terms; Adzuna keys optional. 13 stale worktrees in `.claude/worktrees/` (ask before removing).

## Gotchas

- Windows: no MSVC. `cargo +stable-x86_64-pc-windows-gnu` with WinLibs `mingw64/bin` on PATH.
- `cargo test` regenerates `src/lib/generated/`; commit the result or CI fails.
- Worktrees need `npm ci`. Run `npx prettier --write` on docs too (handovers broke format:check).
- Stale `.next/` can break `tsc` after route moves: `rm -rf .next`.
- Postings have no description: matching uses titles only; present ranking as a sort, not a verdict.
