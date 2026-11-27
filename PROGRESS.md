# PROGRESS

Last updated: 2026-11-27 (Claude Opus 5.5, orchestrator)

## Current step

Phase 2, wave 2 (content per industry). Orchestrator brief `docs/ORCHESTRATOR_PROMPT.md`; plan
`docs/briefs/wave2_plan.md`. At most 2 sessions at a time, ~1 h slices, briefs in `docs/briefs/`.

## Done (on main, CI green)

- Wave 1: calm silver-grey design + catalog IA (WS-IA); six-industry taxonomy, `cw-match`,
  `cw-cv`, `cw-wasm` (835 KB gz), `/cuenta/encaje` (WS-R2a/b/c); `cw-alerts` dry run, migration
  `alert_subscriptions` (never run on real Postgres), `alerts.yml` (WS-F1, ADR-005).
- Gemini Deep Research report: PDF in `docs/research/sources/`, digest
  `docs/research/gemini-deep-research.md` (a lead, not a citation; US/UK-first).
- Banca de inversión live: hub, como-funciona, empresas, el-trabajo, sueldos, proceso, recursos,
  personas (`reviewer: "pendiente"`). Pablo's scope decisions in its dossier §15.
- Consultoría slice A: all sections under 4,000 px at 375 px; 2026 online tests as "según guías
  de preparación" (no official page confirmed them).

## Next task

Wave 2 #3 Big Law slice A (hub, como-funciona with the Spain access path, el-trabajo), using
`docs/handover/rs1-research-notes.md` + report pp. 27–33. Brief from the template in the plan.

## Then

Consulting slice B (estrategia refresh, routes from any university; verify Solve/Casey on firm
pages); PE, data, AI; WS-F2 (`/cuenta/alertas` + `/alertas/baja`); `config/companies.yaml` for
the six industries; human review of every page marked `pendiente` (check Michael Page table on
PDF p. 5); stale `industrias/consultoria/` row in `docs/ownership.md`.

## Open threads (Pablo)

Connect Vercel; Supabase EU + migrations + secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`RESEND_API_KEY`, `ALERTS_FROM`, `SITE_URL`); legal placeholders; site name; Jobicy terms;
London right-to-work question (IB dossier Q1). 13 stale worktrees in `.claude/worktrees/`.

## Gotchas

- Windows: `cargo +stable-x86_64-pc-windows-gnu` with WinLibs `mingw64/bin` on PATH.
- `cargo test` regenerates `src/lib/generated/`; commit it. Rebuild WASM: `sh crates/cw-wasm/build.sh`.
- e2e reuses any server on :3000/:3100: kill orphan `next start` from other worktrees first, or
  you test the wrong build. `rm -rf .next` after route moves.
- Worktrees may show CRLF `format:check` noise on untouched files; check on main.
- Postings have titles only: matching is a sort order, not a verdict. MDX has no GFM tables.
