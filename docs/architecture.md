# Architecture (ADR-001, 2026-11-27)

Status: accepted. Owner request: "Rust wherever reasonable", a product that is genuinely good,
EUR 0/month, no server-side AI, data in the EU.

## Decision in one line

**Rust is the engine, TypeScript is the face.** Every piece of logic that processes data (collecting
postings, classifying them, matching them to a person, scoring practice, sending alerts) lives in
one Cargo workspace. The website stays Next.js + MDX, and it calls that Rust code either as data
in Postgres or as WebAssembly in the browser. There is no always-on server of our own.

## Why not Rust for the website too

Leptos and Dioxus can render a full site in Rust, and we considered them. We chose not to:

- The core value is hand-written content (MDX guides with embedded interactive pieces). The React/MDX
  ecosystem for that, plus accessibility primitives and OG images, is mature; in Rust it is not yet.
- A Rust SSR site needs a running server. Free hosting for that is scarce or unstable, while Next.js
  on Vercel Hobby is free and zero-ops.
- Content writers (future sector reviewers) can edit MDX; they cannot edit Rust components.
  Rust earns its place where correctness and performance matter: parsing many APIs, deterministic
  classification, matching, and code shared by batch jobs and the browser.

## Components

```
                 GitHub Actions (cron, free)
   ┌───────────────────────────────────────────────────┐
   │ cw-pipeline (Rust bin): collect -> classify -> upsert│──┐
   │ cw-alerts   (Rust bin): match new postings -> Resend │  │
   └───────────────────────────────────────────────────┘  │ SQL (service role)
                                                          ▼
   Browser ── Next.js on Vercel (SSR/static) ──► Supabase EU: Postgres + Auth + RLS
      │  MDX guides, interactive cases                     ▲
      │  cw-wasm (Rust -> WebAssembly): CV parsing,        │ anon key + RLS
      │  profile/posting matching, case scoring            │
      └─ BYOK: calls the AI provider directly from the browser; the key never reaches us
```

## Cargo workspace (`crates/`)

| Crate         | Kind         | Role                                                                                                                                                                                                         |
| ------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cw-domain`   | lib          | Shared types (Posting, Industry, Level, Location, Source). Exports TypeScript types with `ts-rs` into `src/lib/generated/`, so web, jobs and DB agree on one definition.                                     |
| `cw-sources`  | lib          | One client per official API (Greenhouse, Lever, Ashby, SmartRecruiters, Remotive, Jobicy, Adzuna), with each source's terms (attribution, minimum interval) encoded next to the client. `reqwest` + `tokio`. |
| `cw-classify` | lib          | Deterministic rules from YAML: Spain/remote filter, junior level, industry tagging. No network, fully unit-tested.                                                                                           |
| `cw-pipeline` | bin          | `cw-pipeline run [--dry-run]`: collect, classify, upsert into Postgres (`sqlx`, runtime queries), expire stale postings.                                                                                     |
| `cw-match`    | lib          | Profile-to-posting ranking (port of job-hunter's keyword ranking). Pure, no I/O, `no_std`-friendly where possible.                                                                                           |
| `cw-wasm`     | lib (cdylib) | `wasm-bindgen` wrapper over `cw-match` and later the case scorer, for the browser. **Phase 2.**                                                                                                              |
| `cw-alerts`   | bin          | Daily digest: new postings that match each opted-in user, sent through Resend. **Phase 2.**                                                                                                                  |

## Rules that follow from this

- **The CV never leaves the browser.** Parsing and matching run in `cw-wasm`; we store only the
  structured preferences the user chooses to save. This is the strongest privacy promise we can make
  and it costs nothing to host.
- **Postgres is the only shared state.** Schema lives in `supabase/migrations/`; Rust jobs write with
  the service role from CI secrets; the web reads with the anon key under RLS.
- **Types flow one way:** Rust (`cw-domain`) -> generated TS. Hand-written TS must not redefine them.
- **WASM build for Vercel (phase 2):** CI builds `cw-wasm` with `wasm-pack` and commits the package
  to `src/lib/wasm/` only through a checked step (CI fails if the committed build is stale), because
  Vercel's build image has no Rust toolchain.
- **Python leaves the repo** once `cw-pipeline` matches its results on the recorded fixtures.
- **Quality gates:** `cargo fmt --check`, `cargo clippy -- -D warnings`, `cargo test` in CI next to
  the web checks.

## Revisit when

A feature needs a real-time server (e.g. live mock interviews with streaming), or traffic outgrows
free tiers. Candidates then: Rust (Axum) on a small paid host, or Cloudflare Workers with `workers-rs`.
