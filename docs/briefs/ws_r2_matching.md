# Brief WS-R2: Rust phase 2, matching in the browser

Read `docs/architecture.md`, `docs/roadmap.md`, `AGENTS.md`, `PROGRESS.md`, `docs/decisions.md`
and `crates/` first. Reply to Pablo in Spanish; code in English; UI copy in Spanish. Pablo is
learning Rust: idiomatic code, short doc comments on non-obvious choices.

## Toolchain on this machine

No MSVC. Use `cargo +stable-x86_64-pc-windows-gnu` with
`/c/Users/pablo/AppData/Local/Microsoft/WinGet/Packages/BrechtSanders.WinLibs.POSIX.UCRT_Microsoft.Winget.Source_8wekyb3d8bbwe/mingw64/bin`
and `$USERPROFILE/.cargo/bin` on PATH. Add the `wasm32-unknown-unknown` target and install
`wasm-pack` (prebuilt binary or `cargo install`). Keep `rust-toolchain.toml` portable.

## You own

`crates/`, `config/`, `Cargo.*`, `src/lib/` (including new `src/lib/wasm/` and
`src/lib/generated/`), `src/components/match/` (new), `src/app/(account)/cuenta/encaje/` (new),
`.github/workflows/` (add jobs; do not break existing ones), and one migration in
`supabase/migrations/` if you need it. Do not touch `src/app/(public)/`, `src/components/ui/`,
`src/styles/` or `content/`: WS-IA is rebuilding them in parallel. Use the existing UI primitives
as they are.

## Scope

1. **Taxonomy:** `Industry` becomes exactly `consulting`, `ai`, `data-science`, `private-equity`,
   `investment-banking`, `big-law` (see `docs/roadmap.md`). Update `config/rules.yaml`, the
   classifier tests and the parity notes (parity with Python is no longer the goal; document it).
   Postings outside the six are dropped. Rework `config/companies.yaml` toward these industries
   (verify each board returns data) and report the new mix.
2. **`cw-match`:** profile-to-posting ranking (port the idea of job-hunter's
   `src/job_hunter/score/quick.py`; read only job-hunter's `src/`). Profile = industries, roles,
   skills, languages, locations, remote preference. Output: score plus human-readable reasons
   ("coincide: SQL, Python; ubicación: Madrid"). Pure, deterministic, unit-tested.
3. **`cw-cv`:** extract text from PDF, DOCX and TXT and detect a draft profile (skills, languages,
   education, locations) from dictionaries in `config/`. Must compile to WASM. Test with fictional
   CVs only, created by you in `crates/cw-cv/tests/fixtures/`.
4. **`cw-wasm`:** `wasm-bindgen` exports `parse_cv(bytes, kind)` and `rank(profile, postings)`.
   Build with `wasm-pack --target web`, commit the package to `src/lib/wasm/`, and add a CI job that
   rebuilds it and fails if the committed package is stale (Vercel has no Rust; see ADR-001).
5. **`/cuenta/encaje`:** upload a CV (it never leaves the browser; say so on the page), review and
   edit the detected profile, see ranked postings with reasons. Postings come from
   `src/lib/postings/`. The profile is kept in the browser (`localStorage`, wrapped in try/catch);
   saving to the account is optional and only the structured fields. Add a `/dev/encaje` route that
   works without a session (only when `NODE_ENV !== "production"`) for testing, with e2e tests.

## Done when

Rust gates (fmt, clippy -D warnings, test), web checks and e2e pass; WASM bundle size reported
(target under 1 MB gzipped); a dry run reports postings per industry; decisions logged in
`docs/decisions.md`. Commit in small steps on your branch; no push, no merge.
