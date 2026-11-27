# crates

**Owner:** WS-R Rust core

The Cargo workspace behind the site's data (see `docs/architecture.md` and ADR-001 to ADR-003).

| Crate         | Role                                                                            |
| ------------- | ------------------------------------------------------------------------------- |
| `cw-domain`   | Shared types; `cargo test` exports them to `src/lib/generated/` with `ts-rs`.   |
| `cw-sources`  | One client per official API, with each source's terms (`SOURCES.md`).           |
| `cw-classify` | Spain / junior / industry rules from `config/rules.yaml`. No network.           |
| `cw-pipeline` | `cw-pipeline run [--dry-run] [--only a,b]`: collect, classify, upsert, expire.  |
| `cw-alerts`   | `cw-alerts run [--dry-run] [--preview]`: daily digest by email through Resend.   |

```powershell
cargo test --workspace                       # also regenerates src/lib/generated/
cargo run -p cw-pipeline -- run --dry-run    # writes out/postings.json and out/summary.json
```

Secrets (GitHub Actions only): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (to write), `ADZUNA_APP_ID`,
`ADZUNA_APP_KEY` (optional). Without the Supabase pair, `run` exits with code 2 and writes nothing.

Only the owning stream edits this folder. Anything else is a request in the PR description.
