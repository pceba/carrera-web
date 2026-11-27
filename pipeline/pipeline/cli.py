"""`python -m pipeline run [--dry-run]`: collect, filter, tag, then write JSON or sync to Supabase."""

from __future__ import annotations

import argparse
import json
import os
import sys
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime
from pathlib import Path

import yaml

from pipeline import ats, general
from pipeline.classify import classify, load_rules
from pipeline.http import make_client
from pipeline.models import Posting, RawPosting
from pipeline.store import MissingSecrets, sync

COMPANIES_PATH = Path(__file__).with_name("companies.yaml")
OUT_DIR = Path(__file__).resolve().parent.parent / "out"
ADZUNA_QUERIES = [
    "junior", "becario", "prácticas", "trainee", "graduate", "analista junior", "programa de graduados",
]  # fmt: skip


def collect(only: set[str] | None = None) -> tuple[list[Posting], dict[str, dict]]:
    """Fetch every source. One failing source or board never stops the rest."""
    rules = load_rules()
    companies = yaml.safe_load(COMPANIES_PATH.read_text(encoding="utf-8"))["companies"]
    stats: dict[str, dict] = {}
    raw: list[RawPosting] = []

    def note(source: str, fetched: int = 0, error: str | None = None, skipped: str | None = None):
        s = stats.setdefault(source, {"fetched": 0, "kept": 0, "errors": [], "skipped": None})
        s["fetched"] += fetched
        if error:
            s["errors"].append(error)
        if skipped:
            s["skipped"] = skipped

    with make_client() as client:

        def board(c: dict):
            try:
                return c, ats.FETCHERS[c["ats"]](client, c["name"], c["slug"]), None
            except Exception as e:  # noqa: BLE001 - a bad board must not stop the run
                return c, [], f"{c['name']}: {type(e).__name__}: {e}"

        selected = [c for c in companies if not only or c["ats"] in only]
        with ThreadPoolExecutor(max_workers=6) as pool:
            for c, items, err in pool.map(board, selected):
                note(c["ats"], len(items), err)
                raw += items

        general_sources = {
            "remotive": lambda: general.fetch_remotive(client),
            "jobicy": lambda: general.fetch_jobicy(client),
            "adzuna": lambda: general.fetch_adzuna(client, ADZUNA_QUERIES),
        }
        for name, fetch in general_sources.items():
            if only and name not in only:
                continue
            try:
                items = fetch()
            except general.MissingCredentials as e:
                note(name, skipped=str(e))
                continue
            except Exception as e:  # noqa: BLE001
                note(name, error=f"{type(e).__name__}: {e}")
                continue
            note(name, len(items))
            raw += items

    kept: dict[tuple[str, str], Posting] = {}
    for r in raw:
        p = classify(r, rules)
        if p:
            kept.setdefault((p.source, p.external_id), p)
    for p in kept.values():
        stats[p.source]["kept"] += 1
    return list(kept.values()), stats


def write_json(postings: list[Posting], stats: dict[str, dict], out_dir: Path | None = None) -> None:
    out_dir = out_dir or OUT_DIR
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "postings.json").write_text(
        json.dumps([p.model_dump(mode="json") for p in postings], ensure_ascii=False, indent=1),
        encoding="utf-8",
    )
    summary = {
        "generated_at": datetime.now(UTC).isoformat(timespec="seconds"),
        "total_kept": len(postings),
        "by_source": stats,
        "by_level": Counter(p.level for p in postings),
        "by_industry": Counter(p.industry for p in postings),
    }
    (out_dir / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=1), encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="pipeline")
    sub = ap.add_subparsers(dest="cmd", required=True)
    run = sub.add_parser("run", help="collect postings")
    run.add_argument("--dry-run", action="store_true", help="write JSON to pipeline/out/, no database")
    run.add_argument("--only", help="comma-separated source names (e.g. greenhouse,remotive)")
    args = ap.parse_args(argv)

    url, key = os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not args.dry_run and not (url and key):
        print("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing: nothing written.", file=sys.stderr)
        return 2

    only = set(args.only.split(",")) if args.only else None
    postings, stats = collect(only)
    for name, s in sorted(stats.items()):
        extra = f" skipped: {s['skipped']}" if s["skipped"] else ""
        print(f"{name:16} fetched={s['fetched']:5} kept={s['kept']:4} errors={len(s['errors'])}{extra}")
        for e in s["errors"]:
            print(f"    ! {e}", file=sys.stderr)

    if args.dry_run:
        write_json(postings, stats)
        print(f"dry run: {len(postings)} postings -> {OUT_DIR}")
        return 0
    try:
        result = sync(postings, url, key)  # type: ignore[arg-type]
    except MissingSecrets as e:
        print(e, file=sys.stderr)
        return 2
    print(f"synced: {result}")
    return 0
