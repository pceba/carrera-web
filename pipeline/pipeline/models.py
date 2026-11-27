"""Normalised posting shape.

Ported from job-hunter (same author, MIT): src/job_hunter/collect/posting.py. Personal-use
fields (salary, description scoring) were dropped; only what the public page shows is kept.
"""

from __future__ import annotations

import html
import re
from datetime import UTC, datetime
from html.parser import HTMLParser

from pydantic import BaseModel


class RawPosting(BaseModel):
    """What a source parser returns, before filtering and tagging."""

    source: str  # greenhouse | lever | ashby | workable | smartrecruiters | remotive | jobicy | adzuna
    external_id: str
    company: str
    title: str
    url: str
    location: str | None = None
    department: str | None = None
    employment_type: str | None = None
    workplace_type: str | None = None  # remote | hybrid | onsite, as reported
    posted_at: datetime | None = None
    description: str = ""


class Posting(BaseModel):
    """A kept posting, ready for the `postings` table."""

    source: str
    external_id: str
    source_url: str
    company: str
    title: str
    location: str | None
    city: str | None
    remote: bool
    level: str
    industry: str
    posted_at: datetime | None


_SKIP = {"script", "style", "noscript", "svg", "head", "template"}
_BLOCK = {"p", "div", "br", "li", "ul", "ol", "h1", "h2", "h3", "h4", "h5", "h6", "tr"}


class _Text(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in _SKIP:
            self.skip += 1
        elif tag in _BLOCK:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in _SKIP:
            self.skip = max(0, self.skip - 1)
        elif tag in _BLOCK:
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)


def html_to_text(raw: str | None) -> str:
    """HTML (possibly entity-escaped, as Greenhouse sends it) to plain text."""
    if not raw:
        return ""
    if "&lt;" in raw:
        raw = html.unescape(raw)
    p = _Text()
    p.feed(raw)
    text = "".join(p.parts).replace("\xa0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    return "\n".join(line.strip() for line in text.splitlines() if line.strip())


def parse_datetime(value: str | int | float | None) -> datetime | None:
    """ISO-8601 string or epoch milliseconds to an aware UTC datetime; None if unparseable."""
    if value in (None, ""):
        return None
    try:
        if isinstance(value, int | float):
            return datetime.fromtimestamp(value / 1000, tz=UTC)
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except (ValueError, OverflowError, OSError):
        return None
    return dt.astimezone(UTC) if dt.tzinfo else dt.replace(tzinfo=UTC)
