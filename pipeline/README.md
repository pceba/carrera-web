# pipeline

**Owner:** WS-E Postings pipeline (M2)

Daily collector for junior and internship postings in Spain. Python 3.12, official APIs only
(see `SOURCES.md` for the terms of each source). Collectors are ported from the author's personal
job-hunter (MIT); no personal data.

```powershell
cd pipeline
python -m venv .venv; .venv\Scripts\pip install -e ".[dev]"
.venv\Scripts\python -m pipeline run --dry-run      # writes pipeline/out/postings.json + summary.json
.venv\Scripts\python -m pytest; .venv\Scripts\ruff check .
```

- `pipeline/companies.yaml`: employers (ATS + slug). `pipeline/rules.yaml`: level, location and industry keywords.
- Without `--dry-run` it upserts into the `postings` table through PostgREST (`SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`) and deactivates rows not seen for 7 days.
- `.github/workflows/postings.yml` runs it daily and skips cleanly if the secrets are missing.

Only the owning stream edits this folder. Anything else is a request in the PR description. See `docs/ownership.md`.
