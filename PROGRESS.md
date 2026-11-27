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
- Consultoría slices A+B: shorter pages, McKinsey Solve confirmed on its site (BCG Casey and AI
  case interviews still "según guías de preparación"), estrategia refresh, routes from any uni.
- Big Law slice A: hub, como-funciona (Spain access path), empresas, el-trabajo. Heights 4.6–5.1k px
  (11 sources); Examen de Estado details and Garrigues not verified (`docs/handover/w2-big-law.md`).

## Next task

Apply the identity (direction B + chosen symbol): tokens, Geist fonts, wordmark, favicon, OG image,
name in `src/lib/site.ts`; plus a compact sources footer on phones so pages fit ~4,000 px.

## Then

Big Law slice B; PE, data, AI; WS-F2 (`/cuenta/alertas` + `/alertas/baja`); `config/companies.yaml` for
the six industries; human review of every page marked `pendiente` (check Michael Page table on
PDF p. 5); stale `industrias/consultoria/` row in `docs/ownership.md`.

## Open threads (Pablo)

Connect Vercel; Supabase EU + migrations + secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`RESEND_API_KEY`, `ALERTS_FROM`, `SITE_URL`); legal placeholders; name chosen: **Path** (domain and
trademark check pending); visual direction B chosen (see `docs/naming.md`), symbol variant still to
pick, then one session applies it; Jobicy terms;
London right-to-work question (IB dossier Q1). 13 stale worktrees in `.claude/worktrees/`.

## Gotchas

- Windows: `cargo +stable-x86_64-pc-windows-gnu` with WinLibs `mingw64/bin` on PATH.
- `cargo test` regenerates `src/lib/generated/`; commit it. Rebuild WASM: `sh crates/cw-wasm/build.sh`.
- e2e reuses any server on :3000/:3100: kill orphan `next start` from other worktrees first, or
  you test the wrong build. `rm -rf .next` after route moves.
- Worktrees may show CRLF `format:check` noise on untouched files; check on main.
- Postings have titles only: matching is a sort order, not a verdict. MDX has no GFM tables.
