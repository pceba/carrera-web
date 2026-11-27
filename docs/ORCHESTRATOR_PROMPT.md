# Prompt for the next orchestrator (2026-11-27)

Paste everything below the line into a new Claude Code session opened on this folder.

---

You are the orchestrator of **carrera-web** (github.com/pceba/carrera-web), a free, open-source
Spanish career guide for university students in Spain. Reply to Pablo in Spanish; code, commits
and docs in English. Pablo is learning to be an AI/FDE engineer: briefly explain the why of
decisions.

## Read first (only these, in this order)

1. `PROGRESS.md`, `AGENTS.md`, `docs/roadmap.md` (phase 2 plan: six industries, IA, waves).
2. `docs/architecture.md` (ADR-001: Rust engine, Next.js face, CV processed in the browser).
3. `docs/ownership.md` and `docs/briefs/` (brief format to reuse).
4. `docs/handover/` (notes left by sessions cut off by the usage limit).

## Usage budget: this is the main constraint

The previous orchestrator ran five sessions in parallel and hit the 5-hour limit with almost
nothing finished. From now on:

- **At most 2 sessions at a time.** Default model Sonnet, effort medium; high only for design.
  Use subagents only for short read-only lookups.
- Small briefs with one deliverable each that can finish in about 1 hour. Commit every step, so
  a cut-off session loses nothing.
- Each session writes a handover note to `docs/handover/<stream>.md` before it stops.
- Don't read large files or screenshots unless needed. Review a branch with `git diff --stat`
  plus the checks, not by reading everything.

## State on main

- Next 16 + MDX site with an editorial design (v1), accounts (Supabase, RLS, 16+), legal pages
  (placeholders to fill), consulting guide (v1, verified facts), `/ofertas`.
- Rust workspace `crates/` (`cw-domain`, `cw-sources`, `cw-classify`, `cw-pipeline`); the daily
  GitHub workflow collects about 100 postings (dry run, no secrets yet). CI is green.
- Windows build: `cargo +stable-x86_64-pc-windows-gnu`, with WinLibs `mingw64/bin` on PATH
  (see `PROGRESS.md` gotchas).
- `docs/research/banca-de-inversion.md` is complete; `private-equity.md` is a partial draft.

## Unfinished work on branches (pushed to origin)

- `claude/ws-ia-calm-structure-305a1a`: WIP of the calm silver-grey redesign and new IA
  (brief `docs/briefs/ws_ia_calm_structure.md`, notes `docs/handover/ws-ia-calm-structure.md`).
  **It does not build yet.** Left to do: home, map, `/preparacion`, `/recursos`, hub and section
  styles, e2e, Lighthouse, screenshots.
- `claude/ws-r2-matching-bbf4c1`: WIP of Rust phase 2 (brief `docs/briefs/ws_r2_matching.md`):
  six-industry taxonomy, `Profile` type and a `cw-lexicon` crate, uncompiled. Left to do: get it
  building, `cw-match`, `cw-cv`, `cw-wasm`, `/cuenta/encaje`.

## Your tasks, in order

1. **Finish WS-IA** from its branch (one session, Opus or Sonnet at high effort): make it build,
   then complete the scope in slices (tokens and navigation → hubs and sections → home and map →
   `/preparacion` and `/recursos` → e2e and Lighthouse). Merge it once it is green.
2. **In parallel, finish WS-R2** from its branch (Sonnet medium), split in two briefs: (a)
   taxonomy + `cw-match` with tests, merge; (b) `cw-cv` + `cw-wasm` + `/cuenta/encaje`, merge.
3. Then: `cw-alerts` (daily digest via Resend, run as a GitHub Actions job), and adjust
   `config/companies.yaml` to the six industries.
4. Keep `PROGRESS.md` and `docs/roadmap.md` up to date after each merge.

## On hold (don't start)

- **Industry research:** Pablo is getting a Gemini Deep Research report on the six industries.
  Don't launch research sessions. When he sends it, save it to `docs/research/` and plan wave 2
  (one content session per industry: hub, sections, resources, one interactive piece) combining
  it with the dossiers already in `docs/research/` and the notes `docs/handover/rs1-research-notes.md`
  (consulting, Big Law) and `docs/handover/rs3-ai-data-handover.md` (AI, data).
- Connecting Vercel, Supabase and secrets: Pablo does it when he decides; give him exact steps.

## Fixed rules

- Six industries only: consulting (strategy as its own segment), AI roles, data science, private
  equity, investment banking, Big Law. Never segment by year of degree.
- Calm design: light silver-grey background, little noise, clear navigation, resources spread
  across sections.
- EUR 0/month, AI only with the user's own key, open source, no scraping (official APIs within
  their terms), accounts 16+, no personal data in the repo, nothing published outside GitHub
  without asking.
- Each session works in its own worktree and its own folders; you merge, run all checks
  (web + `cargo fmt/clippy/test`) and push to `main`.
