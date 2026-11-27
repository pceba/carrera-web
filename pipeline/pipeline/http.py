"""HTTP helper with retries. Ported from job-hunter (same author, MIT): collect/sources.py."""

from __future__ import annotations

import time
from typing import Any

import httpx

USER_AGENT = "carrera-web-postings/0.1 (open-source career guide; github.com/pceba/carrera-web)"


class FetchError(RuntimeError):
    pass


def make_client(transport: httpx.BaseTransport | None = None) -> httpx.Client:
    return httpx.Client(
        timeout=30,
        headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
        follow_redirects=True,
        transport=transport,
    )


def get_json(
    client: httpx.Client,
    url: str,
    *,
    params: dict | None = None,
    retries: int = 2,
    backoff: float = 2.0,
    sleep=time.sleep,
) -> Any:
    """GET + parse JSON. Retries network errors, 429 and 5xx; other 4xx are permanent."""
    last: Exception | None = None
    for attempt in range(retries + 1):
        try:
            r = client.get(url, params=params)
            if r.status_code == 429 or r.status_code >= 500:
                last = FetchError(f"HTTP {r.status_code}")
            elif r.status_code >= 400:
                raise FetchError(f"{url}: HTTP {r.status_code}")
            else:
                return r.json()
        except (httpx.HTTPError, ValueError) as e:
            last = e
        if attempt < retries:
            sleep(backoff * 2**attempt)
    raise FetchError(f"{url}: {last}")
