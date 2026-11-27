"""General job sources (not tied to one employer). Ported from job-hunter (same author, MIT):
collect/general.py and collect/adzuna.py. Terms are recorded in pipeline/SOURCES.md.

  remotive  remote jobs, no key; one request returns the list.
  jobicy    remote jobs, no key; one request per run.
  adzuna    Spanish on-site jobs, free key (ADZUNA_APP_ID / ADZUNA_APP_KEY); skipped without it.
"""

from __future__ import annotations

import os

import httpx

from pipeline.http import get_json
from pipeline.models import RawPosting, html_to_text, parse_datetime

REMOTIVE_API = "https://remotive.com/api/remote-jobs"
JOBICY_API = "https://jobicy.com/api/v2/remote-jobs"
ADZUNA_API = "https://api.adzuna.com/v1/api/jobs/es/search/{page}"

# Shown on every card: each source's terms require naming it and linking to the listing.
ATTRIBUTION = {
    "remotive": ("Remotive", "https://remotive.com"),
    "jobicy": ("Jobicy", "https://jobicy.com"),
    "adzuna": ("Adzuna", "https://www.adzuna.es"),
}


class MissingCredentials(RuntimeError):
    pass


def _remote(where: str | None) -> str:
    where = " ".join((where or "").split())
    return f"Remote, {where}" if where else "Remote"


def parse_remotive(payload: dict) -> list[RawPosting]:
    return [
        RawPosting(
            source="remotive",
            external_id=str(j["id"]),
            company=(j.get("company_name") or "").strip() or "Empresa sin nombre",
            title=html_to_text(j.get("title")),
            url=j.get("url") or "",
            location=_remote(j.get("candidate_required_location")),
            department=j.get("category"),
            employment_type=(j.get("job_type") or "").replace("_", " ") or None,
            workplace_type="remote",
            posted_at=parse_datetime(j.get("publication_date")),
        )
        for j in payload.get("jobs", [])
    ]


def parse_jobicy(payload: dict) -> list[RawPosting]:
    out = []
    for j in payload.get("jobs", []):
        kinds = j.get("jobType") or []
        geo = j.get("jobGeo")
        out.append(
            RawPosting(
                source="jobicy",
                external_id=str(j["id"]),
                company=(j.get("companyName") or "").strip() or "Empresa sin nombre",
                title=html_to_text(j.get("jobTitle")),
                url=j.get("url") or "",
                location=_remote(", ".join(geo) if isinstance(geo, list) else geo),
                department=", ".join(j.get("jobIndustry") or []) or None,
                employment_type=", ".join(kinds) if isinstance(kinds, list) else str(kinds),
                workplace_type="remote",
                posted_at=parse_datetime(j.get("pubDate")),
            )
        )
    return out


def parse_adzuna(payload: dict) -> list[RawPosting]:
    out = []
    for j in payload.get("results", []):
        company = ((j.get("company") or {}).get("display_name") or "").strip()
        out.append(
            RawPosting(
                source="adzuna",
                external_id=str(j["id"]),
                company=company or "Empresa sin nombre",
                title=html_to_text(j.get("title")),
                url=j.get("redirect_url") or "",
                location=(j.get("location") or {}).get("display_name"),
                department=(j.get("category") or {}).get("label"),
                employment_type=" ".join(x for x in (j.get("contract_type"), j.get("contract_time")) if x)
                or None,
                posted_at=parse_datetime(j.get("created")),
            )
        )
    return out


def fetch_remotive(client: httpx.Client) -> list[RawPosting]:
    return parse_remotive(get_json(client, REMOTIVE_API))


def fetch_jobicy(client: httpx.Client) -> list[RawPosting]:
    return parse_jobicy(get_json(client, JOBICY_API, params={"count": 100, "geo": "spain"}))


def fetch_adzuna(
    client: httpx.Client, queries: list[str], pages: int = 2, max_requests: int = 20
) -> list[RawPosting]:
    """Keyword searches in Spain; stays far under the free tier (250 requests/day)."""
    app_id, app_key = os.environ.get("ADZUNA_APP_ID"), os.environ.get("ADZUNA_APP_KEY")
    if not app_id or not app_key:
        raise MissingCredentials("ADZUNA_APP_ID / ADZUNA_APP_KEY not set")
    seen: dict[str, RawPosting] = {}
    requests = 0
    for query in queries:
        for page in range(1, pages + 1):
            if requests >= max_requests:
                return list(seen.values())
            requests += 1
            data = get_json(
                client,
                ADZUNA_API.format(page=page),
                params={
                    "app_id": app_id,
                    "app_key": app_key,
                    "what": query,
                    "max_days_old": 30,
                    "results_per_page": 50,
                    "sort_by": "date",
                    "content-type": "application/json",
                },
            )
            batch = parse_adzuna(data)
            for p in batch:
                seen.setdefault(p.external_id, p)
            if len(batch) < 50:
                break
    return list(seen.values())
