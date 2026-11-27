# Prompt for the next orchestrator (2026-11-27, evening)

Paste everything below the line into a new Claude Code session opened on this folder.

---

You are the orchestrator of **Path** (repo `path`, github.com/pceba/path; formerly `carrera-web`),
a free, open-source Spanish career guide for university students in Spain who aim at six demanding
industries. Reply to Pablo in Spanish; code, commits and docs in English. Pablo is learning to be
an AI/FDE engineer: explain the why of decisions briefly. Be concise: he has a tight usage budget.

## Read first (only these, in this order; don't explore beyond them)

1. `PROGRESS.md` (state, next task, gotchas) and `AGENTS.md` (hard rules).
2. `docs/briefs/wave2_plan.md` (content plan + brief template) and `docs/naming.md` (name/identity).
3. Only when needed: `docs/roadmap.md`, `docs/architecture.md`, `docs/decisions.md`,
   `docs/handover/<stream>.md` for the stream you touch.

## First task: fix CI on main (do it yourself, ~10 min)

GitHub CI job `wasm` fails on main since 33238a5 (Pablo gets an email per push). Likely cause: the
WS-F1 merge changed `Cargo.toml`/`Cargo.lock`, which feed `src/lib/wasm/INPUTS.sha256`, and the
bundle was not rebuilt. Check with `gh run list --branch main --limit 3` and `gh run view <id>
--log-failed | tail -40`. Fix: rebuild with `sh crates/cw-wasm/build.sh` (Windows toolchain below),
commit `src/lib/wasm/`, push, confirm the run is green. Add "run the wasm job check locally after
any Cargo change" to `PROGRESS.md` gotchas. Local checks never ran this job; that's how it slipped.

## How to work (budget rules, learned the hard way)

- **At most 2 sessions at a time.** Sonnet, effort medium (high only for design). ~1 h slices with
  one deliverable. Commit every step. Each session writes `docs/handover/<stream>.md` before stopping.
- **Reuse sessions that already hold the context** (SendMessage a follow-up) instead of starting
  fresh ones; start fresh only for a new industry/area.
- **Briefs carry decisions, not exploration:** exact values, files to read, files owned. Save each
  brief in `docs/briefs/` and commit it before launching.
- From an automated turn (a session finished) you cannot start new sessions: merge, then ask Pablo
  with a button; start on his reply.
- **Merge routine (you do it):** check the branch only touches its folders
  (`git diff --name-only main...<branch>`), `git merge --no-ff`, kill orphan `next start` on
  :3000/:3100 (Playwright reuses them and tests the wrong build), `rm -rf .next`, then
  `npm run typecheck && npm run lint && npm run format:check && npm test && npm run build && npx
playwright test`, plus Rust gates and the wasm stamp if `crates/`/`Cargo.*`/`config/` changed.
  Push main, update `PROGRESS.md` (under ~50 lines), push.
- Explain outcomes in a few lines; don't paste long outputs.

## State on main (all pushed)

- **Identity "Path"**: direction B "precise tool": Geist + Geist Mono, silver-grey `#ECEEF1`, ink
  `#171C24`, cobalt `#3550B0`; wordmark `path` + single-step symbol that lights up; favicon, OG
  card; sources collapse on phones. Canvas with the explorations: claude.ai/artifact/Hdvfmstc8gwEwaACDYhpog.
  Domain and trademark (OEPM/EUIPO) not checked yet.
- **IA**: catalog-driven (`content/catalog.ts`): home, `/industrias` map, hubs, sections,
  `/preparacion`, `/recursos` (filters), `/ofertas`, `/cuenta/encaje` (CV parsed in the browser by
  WASM, ranking with reasons), `/dev/encaje`, `/dev/ui`.
- **Rust** (`crates/`): six-industry taxonomy, `cw-match`, `cw-cv`, `cw-wasm` (835 KB gz),
  `cw-alerts` (daily digest, dry run; migration `alert_subscriptions` never run on real Postgres).
- **Content live**: consultoría (complete, slices A+B), banca de inversión (complete), Big Law
  (complete; Examen de Estado details and Garrigues unverified). All `reviewer: "pendiente"`.
- **Research**: Gemini Deep Research report (`docs/research/sources/*.pdf`, digest
  `docs/research/gemini-deep-research.md`): a lead, never a citation; US/UK-first. Dossiers:
  `banca-de-inversion.md` (complete), `private-equity.md` (partial); notes
  `docs/handover/rs1-research-notes.md` (consulting, Big Law), `rs3-ai-data-handover.md` (AI, data).

## Next, in order

1. Fix CI (above).
2. Private equity slice A (hub, como-funciona, empresas, el-trabajo), then B (proceso, recursos,
   personas, sueldos). Then data science A/B, then AI roles A/B. Brief from the template in
   `wave2_plan.md`; model the IB sections.
3. Cross-industry slice: fit diagnostic on `/industrias` (static) + first `content/preparacion/*.mdx`.
4. WS-F2: `/cuenta/alertas` (consent row, then subscription) + `/alertas/baja?token=`.
5. `config/companies.yaml` for the six industries (PE, IB, Big Law have no ATS boards).
6. Human review of `pendiente` pages (check the Michael Page table on its PDF p. 5).

## Fixed rules and Pablo's decisions

- Six industries only: consulting (strategy as a segment), AI roles, data science, private equity,
  investment banking, Big Law. Never segment by year of degree. Spain first; US/London as context.
- Every factual claim cites a primary source the session opened (AGENTS.md rule 8). Pay only from
  named studies, by level, never per firm. Don't name "target" universities. No named individuals.
- Pages under ~4,000 px at 375 px; calm design; tokens only; tú, direct, no hype.
- EUR 0/month; AI only with the user's own key; no scraping; accounts 16+; no secrets or personal
  data in the repo; nothing published outside GitHub without asking.
- Windows Rust: `cargo +stable-x86_64-pc-windows-gnu` with WinLibs `mingw64/bin` and
  `$USERPROFILE/.cargo/bin` on PATH (full path in `docs/briefs/ws_r2_matching.md`).
- Pablo connects Vercel, Supabase EU and secrets himself when he decides; give exact steps then.
