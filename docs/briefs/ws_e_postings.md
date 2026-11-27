# Brief WS-E: junior postings pipeline and search page

Read `AGENTS.md`, `PROGRESS.md`, `docs/ownership.md`, `docs/decisions.md` first. Reply to Pablo in
Spanish; code in English; UI in Spanish.

## Goal

A daily, zero-cost pipeline that collects junior and internship postings in Spain from official APIs
used within their terms, stores them in Postgres (Supabase), and a public page to search them.

## You own

`pipeline/` (Python 3.12, its own `pyproject.toml`, ruff + pytest), `.github/workflows/postings.yml`,
one new migration `supabase/migrations/<timestamp>_postings.sql` (only this file in `supabase/`),
and `src/app/(public)/ofertas/` (plus `src/lib/postings/` for the read query). Never edit other
folders; WS-B is working in the consulting folders in parallel.

## Reuse

Port, do not import, the collectors from `C:\Users\pablo\Proyectos\job-hunter\src\job_hunter\collect\`
(`collector.py`, `general.py`, `posting.py`, `sources.py`) and the keyword logic in
`score/quick.py`. Read only `src/` and `examples/` there; never read its `private/`, `data/`, the
`state` branch or any secret. Note the origin in a module docstring (same author, MIT).

## Sources (terms first)

- Company ATS boards (Greenhouse, Lever, Ashby, Workable, SmartRecruiters) for a curated list of
  employers hiring juniors in Spain, kept in `pipeline/companies.yaml`.
- Remotive, Jobicy (no key); Adzuna (free key, `ADZUNA_APP_ID`/`ADZUNA_APP_KEY` secrets) only if its
  terms allow showing listings on a public site; job-hunter only checked personal use. Re-read each
  source's terms, record the URL, date and the rules (attribution, rate limits) in
  `pipeline/SOURCES.md`, and drop any source whose terms do not allow this use.
- No scraping of LinkedIn, Indeed or similar, ever.

## Behaviour

- Keep only Spain (or remote open to Spain) and junior levels (intern, graduate, junior, analyst,
  trainee, becario, prácticas). Tag each posting with an industry (consulting, tech, banking, ...)
  using keyword rules in YAML.
- Table `postings`: source, source_url, company, title, location, remote, level, industry, posted_at,
  first_seen_at, last_seen_at, active. Public read via RLS, writes only with the service role.
  Expire postings not seen for 7 days.
- `python -m pipeline run --dry-run` writes JSON to `pipeline/out/` with no database; the workflow
  runs daily and needs `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` secrets (Pablo adds them). The
  workflow must skip cleanly when secrets are missing.
- Page `/ofertas`: filters by industry, level, city and remote; each card shows the source name and
  links to the original listing (attribution). Uses WS-A primitives; works with an empty table.

## Done when

`ruff`, `pytest` (with recorded fixtures, no live network in tests), and the web checks pass; a real
dry run succeeds and you report counts per source; `SOURCES.md` is complete. Commit in small
steps on your branch; no push, no merge.
