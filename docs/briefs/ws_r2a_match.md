# Brief WS-R2a: six-industry taxonomy builds, plus cw-match (about 1 hour)

Continues `claude/ws-r2-matching-bbf4c1` (full brief: `docs/briefs/ws_r2_matching.md`). The WIP
commit has the six-industry `Industry`, a `Profile` type, `config/lexicon.yaml` and a
`cw-lexicon` crate, none of it compiled yet. Same ownership as the full brief.

## Deliverable

1. Get the workspace building: `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`,
   `cargo test`. Fix the classifier tests and `crates/cw-pipeline/tests/parity.rs` (parity with
   Python is no longer the goal: document that in `docs/decisions.md`). Commit the regenerated
   `src/lib/generated/`, and make `npm run typecheck && npm test` pass.
2. New crate `cw-match`: profile-to-posting ranking (idea from job-hunter's
   `src/job_hunter/score/quick.py`; read only its `src/`). Inputs: `Profile` (industries, roles,
   skills, languages, locations, remote preference) and postings. Output: score plus Spanish
   reasons ("coincide: SQL, Python; ubicación: Madrid"). Pure, deterministic, no I/O, so it can go
   to WASM later. Unit tests for each signal and for ordering.
3. Dry run of the pipeline: report postings per industry in the handover.

Out of scope (brief WS-R2b): `cw-cv`, `cw-wasm`, `/cuenta/encaje`, `config/companies.yaml` rework.

## Rules

Windows toolchain in `PROGRESS.md` gotchas (`cargo +stable-x86_64-pc-windows-gnu`, WinLibs on
PATH). Commit after each numbered step. No push, no merge. Before stopping, write
`docs/handover/ws-r2-matching.md` (done, left, gotchas).
