"""Filter and tag postings with the keyword rules in rules.yaml.

The idea (explainable keyword levels, no AI) comes from job-hunter's score/quick.py (same author,
MIT); the rules themselves are new and live in YAML so they can be reviewed without reading code.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from functools import cache
from pathlib import Path

import yaml

from pipeline.models import Posting, RawPosting

RULES_PATH = Path(__file__).with_name("rules.yaml")


def norm(text: str | None) -> str:
    """Lowercase, accent-free, single-spaced."""
    s = unicodedata.normalize("NFKD", text or "")
    s = "".join(c for c in s if not unicodedata.combining(c)).lower()
    return re.sub(r"\s+", " ", s).strip()


def _any_word(words: list[str], text: str) -> bool:
    return any(re.search(rf"(?<!\w){re.escape(norm(w))}(?!\w)", text) for w in words)


@dataclass(frozen=True)
class Rules:
    levels: dict[str, list[str]]
    exclude: list[str]
    cities: list[str]
    names: list[str]
    remote_ok: list[str]
    remote_words: list[str]
    industries: dict[str, list[str]]


@cache
def load_rules(path: Path = RULES_PATH) -> Rules:
    d = yaml.safe_load(path.read_text(encoding="utf-8"))
    return Rules(
        levels=d["levels"],
        exclude=d["exclude"],
        cities=d["spain"]["cities"],
        names=d["spain"]["names"],
        remote_ok=d["remote_ok"],
        remote_words=d["remote_words"],
        industries=d["industries"],
    )


def detect_level(p: RawPosting, rules: Rules) -> str | None:
    title = norm(p.title)
    if _any_word(rules.exclude, title):
        return None
    meta = norm(f"{p.employment_type or ''} {p.department or ''}")
    for level, words in rules.levels.items():
        if _any_word(words, title) or (level == "intern" and _any_word(["intern", "internship"], meta)):
            return level
    return None


def detect_location(p: RawPosting, rules: Rules) -> tuple[bool, str | None, bool]:
    """(accepted, city, remote). Spain, or remote roles open to Spain."""
    loc = norm(p.location)
    title = norm(p.title)
    remote = (p.workplace_type or "").lower() == "remote" or _any_word(rules.remote_words, f"{loc} {title}")
    city = next((c for c in rules.cities if _any_word([c], loc)), None)
    in_spain = bool(city) or _any_word(rules.names, loc)
    if in_spain:
        return True, (city.title() if city else None), remote
    if remote and (not loc or _any_word(rules.remote_ok, loc)):
        return True, None, True
    return False, None, remote


def detect_industry(p: RawPosting, rules: Rules) -> str:
    text = norm(f"{p.company} {p.title} {p.department or ''}")
    for industry, words in rules.industries.items():
        if _any_word(words, text):
            return industry
    return "other"


def classify(p: RawPosting, rules: Rules | None = None) -> Posting | None:
    """The tagged posting, or None when it is not a junior role in/for Spain."""
    rules = rules or load_rules()
    if not p.url.startswith("http") or not p.title:
        return None
    level = detect_level(p, rules)
    if level is None:
        return None
    ok, city, remote = detect_location(p, rules)
    if not ok:
        return None
    return Posting(
        source=p.source,
        external_id=p.external_id,
        source_url=p.url,
        company=p.company,
        title=p.title,
        location=p.location,
        city=city,
        remote=remote,
        level=level,
        industry=detect_industry(p, rules),
        posted_at=p.posted_at,
    )
