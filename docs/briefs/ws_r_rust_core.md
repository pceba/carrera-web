# Brief WS-R: Rust core, phase 1 (workspace + pipeline port)

Read `docs/architecture.md` (the decision you implement), `AGENTS.md`, `PROGRESS.md`,
`docs/ownership.md` and `pipeline/` first. Reply to Pablo in Spanish; code, comments and docs in English.
Pablo is learning Rust: keep the code idiomatic and explain non-obvious choices in short doc comments.

## Toolchain

Rust is being installed with rustup (winget). If `cargo` is not on PATH, look in
`%USERPROFILE%\.cargo\bin`. If no MSVC linker exists, use the `stable-x86_64-pc-windows-gnu`
toolchain. Pin the toolchain in `rust-toolchain.toml` (stable, with rustfmt and clippy).

## You own

`Cargo.toml` (workspace root), `Cargo.lock`, `rust-toolchain.toml`, `crates/`, `pipeline/` (to be
removed), `.github/workflows/postings.yml`, a new `rust` job in `.github/workflows/ci.yml` (add the
job only, do not change the existing one), `src/lib/generated/`, and `src/lib/postings/` (switch it
to the generated types). Do not touch `src/components/`, `src/app/` or `src/styles/`: the UI session
is redesigning them in parallel.

## Scope

1. Workspace with `cw-domain`, `cw-sources`, `cw-classify`, `cw-pipeline` (see the architecture
   table). `cw-match`, `cw-wasm` and `cw-alerts` are phase 2: do not start them.
2. Port the Python pipeline faithfully: same sources, same terms rules (`pipeline/SOURCES.md` moves
   to `crates/cw-sources/SOURCES.md`), same YAML rules (move them to `config/`), same behaviour
   (Spain/remote filter, junior levels, industry tags, 7-day expiry, dry run to JSON).
3. **Parity test:** run the Rust classifier over the recorded fixtures from `pipeline/tests/` and
   assert the same kept postings and tags as the Python version. Only after it passes, delete
   `pipeline/`.
4. Postgres writes with `sqlx` (runtime queries, rustls) using `DATABASE_URL`, or PostgREST with
   `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`; pick one, justify it in `docs/decisions.md`. The
   workflow must skip the write cleanly when secrets are missing and upload the dry-run JSON.
5. `ts-rs` exports for `Posting`, `Industry`, `Level`, `Source` into `src/lib/generated/`; make
   `src/lib/postings/` use them; add a CI check that the generated files are up to date.
6. Expand `config/companies.yaml` with employers that hire juniors in Spain on supported ATS boards
   (consulting, banking, tech), verifying each board slug returns data. Today 57 of 71 postings
   are Bosch internships; aim for a balanced mix.
7. CI: `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`, `cargo test`, with caching.
   The postings workflow builds in release mode with caching.

## Done when

All Rust gates and the web checks pass; the parity test passes and `pipeline/` is gone; a real
`cw-pipeline run --dry-run` works and you report counts per source and industry; decisions are
logged. Commit in small steps on your branch; no push, no merge.
