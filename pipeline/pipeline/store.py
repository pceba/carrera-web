"""Write postings to Supabase through PostgREST with the service-role key.

PostgREST (not a direct Postgres connection) so the only secrets are SUPABASE_URL and
SUPABASE_SERVICE_ROLE_KEY, exactly what the workflow gets. The key bypasses RLS: it is read from
the environment, never logged, never written to disk.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import httpx

from pipeline.models import Posting

EXPIRE_AFTER_DAYS = 7
BATCH = 500


class MissingSecrets(RuntimeError):
    pass


def _headers(key: str) -> dict[str, str]:
    return {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}


def row(p: Posting, now: datetime) -> dict:
    # first_seen_at is omitted on purpose: the column default sets it on insert and the upsert
    # leaves it alone on conflict.
    return {
        "source": p.source,
        "external_id": p.external_id,
        "source_url": p.source_url,
        "company": p.company,
        "title": p.title,
        "location": p.location,
        "city": p.city,
        "remote": p.remote,
        "level": p.level,
        "industry": p.industry,
        "posted_at": p.posted_at.isoformat() if p.posted_at else None,
        "last_seen_at": now.isoformat(),
        "active": True,
    }


def sync(
    postings: list[Posting],
    url: str,
    key: str,
    now: datetime | None = None,
    transport: httpx.BaseTransport | None = None,
) -> dict[str, int]:
    """Upsert the postings seen today, then deactivate those not seen for 7 days."""
    now = now or datetime.now(UTC)
    base = url.rstrip("/") + "/rest/v1/postings"
    with httpx.Client(timeout=60, transport=transport) as c:
        rows = [row(p, now) for p in postings]
        for i in range(0, len(rows), BATCH):
            r = c.post(
                base,
                params={"on_conflict": "source,external_id"},
                headers={**_headers(key), "Prefer": "resolution=merge-duplicates,return=minimal"},
                json=rows[i : i + BATCH],
            )
            r.raise_for_status()
        cutoff = (now - timedelta(days=EXPIRE_AFTER_DAYS)).isoformat()
        r = c.patch(
            base,
            params={"active": "eq.true", "last_seen_at": f"lt.{cutoff}"},
            headers={**_headers(key), "Prefer": "return=representation"},
            json={"active": False},
        )
        r.raise_for_status()
        expired = len(r.json())
    return {"upserted": len(rows), "expired": expired}
