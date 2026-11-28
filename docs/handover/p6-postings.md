# P6 handover: real postings in `/ofertas`

## Root cause of the empty page

The repository has **no GitHub Actions secrets** (`gh api repos/pceba/path/actions/secrets` returns
`total_count: 0`; no environments or variables either). The `postings` workflow checks for
`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`, finds them empty, and falls back to
`cw-pipeline run --dry-run`: it collects ~25-27 postings, uploads `postings.json` as an artifact and
**exits green**. Nothing is ever written to the `postings` table, so `fetchPostings` returns `[]`.
The page and the query are correct (RLS policy `postings are public` + anon key).

## Fixes in this branch

- `postings.yml`: a **scheduled** run without secrets now fails with a clear `::error::` (manual
  dry-runs stay green). It can no longer look healthy while empty.
- `config/companies.yaml`: +12 verified boards (Alan, Pennylane, Mollie, Finom, Raisin, Adyen,
  Quantexa, Anthropic, Legora, Harvey ...). Local dry-run: 27 postings, 0 errors (one transient
  Workable 429 for Kantox from my own probing).
- `crates/cw-sources/SOURCES.md`: coverage by industry and terms. PE, investment banking and big
  law have **no** public board on the five ATSs (checked ~100 slugs); not forced.
- WASM inputs stamp refreshed (`src/lib/wasm/INPUTS.sha256`).

## Steps for Pablo (secrets and dashboards; I never touched them)

1. Supabase dashboard > Project Settings > API: copy the project URL and the `service_role` key.
2. GitHub repo `pceba/path` > Settings > Secrets and variables > Actions > New repository secret:
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (names exact; the anon key is not used by the job).
   Or: `gh secret set SUPABASE_URL` / `gh secret set SUPABASE_SERVICE_ROLE_KEY`.
3. Run the workflow once with the dry-run box **unticked**: Actions > postings > Run workflow
   (`gh workflow run postings -f dry_run=false`). Log should end `upserted=N expired=0`.
4. Check Vercel > Project > Settings > Environment Variables has `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Production (I could not verify this; without them the page
   is also empty). Redeploy after adding. Page revalidates every 30 min.
5. Optional: add `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` for the only Spanish-language coverage of
   IB/PE/law-adjacent roles; Jobicy terms still need a manual read (see SOURCES.md).

## Not verified

The DB write path was not exercised against production (no secrets available). It is covered by the
wiremock tests in `store.rs`; the migration table matches the `Row` columns.
