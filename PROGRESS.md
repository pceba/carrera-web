# PROGRESS

Last updated: 2026-11-28 (Claude Opus 5.5, orchestrator)

## Current step

Product phase (content paused; `docs/ORCHESTRATOR_PROMPT.md`). On main 2026-11-28 (108 unit,
142 e2e green; Cargo gates green): P1 `/candidaturas`, P2a `/calendario` (all dates null: no
official page publishes them), P2b `/cuenta/alertas` + `/alertas/baja`, P3 redesign (dropdowns,
Ctrl/⌘K palette, dialogs, motion), P4 `/diagnostico`, P5 `/practica` (BYOK Gemini/Anthropic/
OpenAI, key never hits our server), P6 +12 official boards, P7 `/entrar` tabs + `/cuenta` hub,
P8 public `/encaje` (old URL redirects), P9 comparison on `/industrias`. Wave 3 (130 unit, 214
e2e green): P10 `/ofertas` cards/chips/dialog, P11 tracker v2 (drag, stats, CSV, .ics), P12 guide
TOC/progress, P13 sitemap/robots/manifest/404/OG, P14 library + saved, P15 `/empezar`, P16
`/contribuir` + issue templates. Briefs `docs/briefs/p*`,
handovers `docs/handover/p*`. Deployed: https://path-ten-theta.vercel.app (noindex).

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
- Big Law slices A+B: hub, como-funciona (Spain access path), empresas, el-trabajo, proceso,
  sueldos, recursos, personas; pages ~4.1k px or less. Examen de Estado details and Garrigues not
  verified (`docs/handover/w2-big-law.md`). IB pages all under 4,000 px.

- Identity "Path" applied (WS-BRAND): Geist/Geist Mono, direction B tokens (AA ratios in
  `docs/handover/ws-brand.md`), single-step symbol, favicon, OG card, sources collapsed on phones.
  Screenshots `docs/screenshots/v3/` (light only).

## Next task

Slow review of waves 1-3 with a cheaper model (one route per pass: a11y, copy, 375 px, facts).
Check `/ofertas` shows the 27 postings (else Vercel env vars). Verify signed-in paths live once
the magic link works. Wire the handover requests (home/header links to `/empezar`, `/contribuir`).

## Then

Industry comparison on `/industrias`; real firm logos only from official press kits. Content later: PE, data
science, AI; WS-F2 (`/cuenta/alertas` + `/alertas/baja`); `config/companies.yaml` for
the six industries; human review of every page marked `pendiente` (check Michael Page table on
PDF p. 5); stale `industrias/consultoria/` row in `docs/ownership.md`.

## Open threads (Pablo)

Magic link sends no email: check Supabase Auth logs; built-in SMTP only mails org members, ~2/h;
leaving the birth year empty on a new email silently skips sign-up; Site URL + redirect
`https://path-ten-theta.vercel.app/auth/callback`. Failures now logged in Vercel by code. Secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`RESEND_API_KEY`, `ALERTS_FROM`, `SITE_URL`); legal placeholders; name chosen: **Path** (domain and
trademark check pending; identity in `docs/naming.md`); Jobicy terms;
London right-to-work question (IB dossier Q1). 13 stale worktrees in `.claude/worktrees/`.

## Gotchas

- Windows: `cargo +stable-x86_64-pc-windows-gnu` with WinLibs `mingw64/bin` on PATH.
- `cargo test` regenerates `src/lib/generated/`; commit it. Rebuild WASM: `sh crates/cw-wasm/build.sh`.
- e2e reuses any server on :3000/:3100: kill orphan `next start` from other worktrees first, or
  you test the wrong build. `rm -rf .next` after route moves.
- Worktrees may show CRLF `format:check` noise on untouched files; check on main.
- `consulting.spec.ts` "proceso lists" is flaky under load (passes isolated).
- Postings have titles only: matching is a sort order, not a verdict. MDX has no GFM tables.
