# PROGRESS

Last updated: 2026-11-27 (Claude Sonnet 5.5, WS-R session, branch `claude/ws-r-rust-core-07b0c9`)

## Current step

WS-R Rust core phase 1 is done on its branch (not pushed, not merged): Cargo workspace with `cw-domain`,
`cw-sources`, `cw-classify`, `cw-pipeline`; the Python pipeline is gone. All Rust and web gates pass.

## Done this session

- Rust port of the postings pipeline, with a parity test against recorded Python output (fixtures + 605 synthetic cases).
- `ts-rs` types in `src/lib/generated/`; `src/lib/postings/types.ts` uses them.
- `config/rules.yaml` and `config/companies.yaml` (42 boards, slugs verified); CI `rust` job; `postings.yml` builds in release mode.
- ADR-002 (PostgREST, not sqlx) and ADR-003 (layout, TLS, parity) in `docs/decisions.md`.
- Real dry run: 102 postings (smartrecruiters 76, greenhouse 17, ashby 4, jobicy 3, lever 2); Bosch is 55 of them.

## Next task

Merge WS-R, then phase 2: `cw-match` + `cw-wasm` (CV parsing/matching in the browser), then `cw-alerts`.
Pablo: add the `ADZUNA_*` secrets if wanted (Adzuna is skipped without them) and read Jobicy's terms by hand.

## Open threads

- `AGENTS.md` map still says `pipeline/ (Python)`; should say `crates/` (Rust) and `config/`. Shared file, so not touched here.
- Consulting is thin on ATS boards (Sopra Steria, ALTEN, Celonis); big firms use Workday, which has no public API.

## Gotchas

- Windows here has no MSVC: build with `cargo +stable-x86_64-pc-windows-gnu` and WinLibs `mingw64/bin` on PATH. Git Bash's `link` shadows MSVC's.
- `cargo test` regenerates `src/lib/generated/`; commit the result or CI fails.
- Worktree needs `npm ci` before web checks.
