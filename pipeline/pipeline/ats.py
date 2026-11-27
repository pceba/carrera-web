"""Company ATS boards: public, documented job-board endpoints, one GET per company.

Ported from job-hunter (same author, MIT): collect/sources.py. Endpoints:
  Greenhouse      https://developers.greenhouse.io/job-board.html
  Lever           https://github.com/lever/postings-api
  Ashby           https://developers.ashbyhq.com/docs/public-job-posting-api
  Workable        https://apply.workable.com/api/v1/widget/accounts/{slug}
  SmartRecruiters https://developers.smartrecruiters.com/docs/posting-api
Descriptions are not fetched: the public page only links to the original listing.
"""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

import httpx

from pipeline.http import get_json
from pipeline.models import RawPosting, parse_datetime


def parse_greenhouse(payload: dict, company: str) -> list[RawPosting]:
    return [
        RawPosting(
            source="greenhouse",
            external_id=str(j["id"]),
            company=company,
            title=j["title"].strip(),
            url=j["absolute_url"],
            location=(j.get("location") or {}).get("name"),
            department=", ".join(d["name"] for d in j.get("departments") or [] if d.get("name")) or None,
            posted_at=parse_datetime(j.get("first_published") or j.get("updated_at")),
        )
        for j in payload.get("jobs", [])
    ]


def parse_lever(payload: list, company: str) -> list[RawPosting]:
    out = []
    for j in payload:
        cat = j.get("categories") or {}
        all_locs = cat.get("allLocations") or []
        out.append(
            RawPosting(
                source="lever",
                external_id=j["id"],
                company=company,
                title=j["text"].strip(),
                url=j["hostedUrl"],
                location="; ".join(all_locs) if all_locs else cat.get("location"),
                department=cat.get("team") or cat.get("department"),
                employment_type=cat.get("commitment"),
                workplace_type=j.get("workplaceType"),
                posted_at=parse_datetime(j.get("createdAt")),
            )
        )
    return out


def parse_ashby(payload: dict, company: str) -> list[RawPosting]:
    out = []
    for j in payload.get("jobs", []):
        if j.get("isListed") is False:
            continue
        locs = [j.get("location")] + [s.get("location") for s in j.get("secondaryLocations") or []]
        out.append(
            RawPosting(
                source="ashby",
                external_id=j["id"],
                company=company,
                title=j["title"].strip(),
                url=j["jobUrl"],
                location="; ".join(x for x in locs if x) or None,
                department=j.get("team") or j.get("department"),
                employment_type=j.get("employmentType"),
                workplace_type="remote" if j.get("isRemote") else j.get("workplaceType"),
                posted_at=parse_datetime(j.get("publishedAt")),
            )
        )
    return out


def parse_workable(payload: dict, company: str) -> list[RawPosting]:
    out = []
    for j in payload.get("jobs", []):
        locs = j.get("locations") or [{"city": j.get("city"), "country": j.get("country")}]
        location = "; ".join(", ".join(p for p in (loc.get("city"), loc.get("country")) if p) for loc in locs)
        out.append(
            RawPosting(
                source="workable",
                external_id=j["shortcode"],
                company=company,
                title=j["title"].strip(),
                url=j.get("url") or j.get("shortlink") or "",
                location=location or None,
                department=j.get("department") or None,
                employment_type=j.get("employment_type") or None,
                workplace_type="remote" if j.get("telecommuting") else None,
                posted_at=parse_datetime(j.get("published_on") or j.get("created_at")),
            )
        )
    return out


def parse_smartrecruiters(payload: dict, company: str, slug: str) -> list[RawPosting]:
    out = []
    for it in payload.get("content", []):
        loc = it.get("location") or {}
        workplace = "remote" if loc.get("remote") else "hybrid" if loc.get("hybrid") else None
        out.append(
            RawPosting(
                source="smartrecruiters",
                external_id=str(it["id"]),
                company=company,
                title=it["name"].strip(),
                url=f"https://jobs.smartrecruiters.com/{slug}/{it['id']}",
                location=loc.get("fullLocation") or loc.get("city"),
                department=(it.get("department") or {}).get("label"),
                employment_type=(it.get("typeOfEmployment") or {}).get("label"),
                workplace_type=workplace,
                posted_at=parse_datetime(it.get("releasedDate")),
            )
        )
    return out


def fetch_smartrecruiters(client: httpx.Client, company: str, slug: str) -> list[RawPosting]:
    """Spain only (server-side filter) keeps paging short; capped at 5 pages."""
    items: list[RawPosting] = []
    for page in range(5):
        data = get_json(
            client,
            f"https://api.smartrecruiters.com/v1/companies/{slug}/postings",
            params={"limit": 100, "offset": page * 100, "country": "es"},
        )
        items += parse_smartrecruiters(data, company, slug)
        if (page + 1) * 100 >= data.get("totalFound", 0) or not data.get("content"):
            break
    return items


def _simple(url: Callable[[str], str], parse: Callable[[Any, str], list[RawPosting]]):
    def fetch(client: httpx.Client, company: str, slug: str) -> list[RawPosting]:
        return parse(get_json(client, url(slug)), company)

    return fetch


FETCHERS: dict[str, Callable[[httpx.Client, str, str], list[RawPosting]]] = {
    "greenhouse": _simple(lambda s: f"https://boards-api.greenhouse.io/v1/boards/{s}/jobs", parse_greenhouse),
    "lever": _simple(lambda s: f"https://api.lever.co/v0/postings/{s}?mode=json", parse_lever),
    "ashby": _simple(lambda s: f"https://api.ashbyhq.com/posting-api/job-board/{s}", parse_ashby),
    "workable": _simple(lambda s: f"https://apply.workable.com/api/v1/widget/accounts/{s}", parse_workable),
    "smartrecruiters": fetch_smartrecruiters,
}
