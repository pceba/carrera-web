"""No live network: parsers run on recorded fixtures, HTTP and Supabase use httpx.MockTransport."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path

import httpx
import pytest

from pipeline import ats, general
from pipeline.classify import classify
from pipeline.http import FetchError, get_json, make_client
from pipeline.models import RawPosting, html_to_text, parse_datetime
from pipeline.store import row, sync

FIX = Path(__file__).parent / "fixtures"


def load(name: str):
    return json.loads((FIX / f"{name}.json").read_text(encoding="utf-8"))


def raw(title: str, location: str | None = "Madrid, Spain", **kw) -> RawPosting:
    base = {
        "source": "greenhouse",
        "external_id": "1",
        "company": "Acme",
        "title": title,
        "url": "https://example.com/1",
        "location": location,
    }
    return RawPosting(**(base | kw))


# --- parsers ----------------------------------------------------------------------------------


@pytest.mark.parametrize(
    ("name", "parse"),
    [
        ("greenhouse", lambda d: ats.parse_greenhouse(d, "Celonis")),
        ("lever", lambda d: ats.parse_lever(d, "Veepee")),
        ("ashby", lambda d: ats.parse_ashby(d, "OpenAI")),
        ("workable", lambda d: ats.parse_workable(d, "Example")),
        ("smartrecruiters", lambda d: ats.parse_smartrecruiters(d, "Bosch", "BoschGroup")),
        ("remotive", general.parse_remotive),
        ("jobicy", general.parse_jobicy),
        ("adzuna", general.parse_adzuna),
    ],
)
def test_parsers_return_complete_postings(name, parse):
    items = parse(load(name))
    assert items
    for p in items:
        assert p.source and p.external_id and p.title and p.company
        assert p.url.startswith("http")


def test_workable_and_adzuna_details():
    w = ats.parse_workable(load("workable"), "Example")[0]
    assert w.location == "Madrid, Spain"
    assert w.posted_at == datetime(2026, 11, 20, tzinfo=UTC)
    a = general.parse_adzuna(load("adzuna"))[0]
    assert a.title == "Becario/a de Finanzas"  # HTML stripped
    assert a.url.startswith("https://www.adzuna.es/")


def test_remote_sources_mark_location_remote():
    for p in general.parse_remotive(load("remotive")):
        assert p.workplace_type == "remote"
        assert p.location.startswith("Remote")


def test_html_and_dates():
    assert html_to_text("&lt;p&gt;Hola&lt;/p&gt;&lt;li&gt;uno&lt;/li&gt;") == "Hola\nuno"
    assert parse_datetime("2026-11-20T10:00:00Z") == datetime(2026, 11, 20, 10, tzinfo=UTC)
    assert parse_datetime(1_700_000_000_000).tzinfo is UTC
    assert parse_datetime("not a date") is None


# --- classification -----------------------------------------------------------------------------


@pytest.mark.parametrize(
    ("title", "level"),
    [
        ("Junior Data Analyst", "junior"),
        ("Estudiante en prácticas - Logística", "intern"),
        ("Marketing Intern", "intern"),
        ("Becario/a de Finanzas", "intern"),
        ("Graduate Programme 2027", "trainee"),
        ("Software Engineer, New Grad", "graduate"),
        ("Financial Analyst", "analyst"),
        ("Management Trainee", "trainee"),
    ],
)
def test_levels_kept(title, level):
    p = classify(raw(title))
    assert p is not None
    assert p.level == level


@pytest.mark.parametrize(
    "title",
    ["Senior Analyst", "Junior Team Lead", "Account Executive", "Internal Tools Engineer"],
)
def test_levels_dropped(title):
    assert classify(raw(title)) is None


def test_intern_from_employment_type():
    assert classify(raw("Risk Support", employment_type="Internship")).level == "intern"


def test_location_rules():
    madrid = classify(raw("Junior Analyst", "Madrid, Spain"))
    assert madrid and madrid.city == "Madrid" and not madrid.remote
    assert classify(raw("Junior Analyst", "Paris, France")) is None
    assert classify(raw("Junior Analyst", "Remote, USA", workplace_type="remote")) is None
    eu = classify(raw("Junior Analyst", "Remote, Europe", workplace_type="remote"))
    assert eu and eu.remote and eu.city is None
    es_remote = classify(raw("Junior Analyst", "Sevilla (remoto)"))
    assert es_remote and es_remote.remote


def test_industry_rules():
    assert classify(raw("Junior Consultant")).industry == "consulting"
    assert classify(raw("Junior Software Engineer")).industry == "tech"
    assert classify(raw("Junior Risk Analyst", company="Banco Ejemplo")).industry == "banking"
    assert classify(raw("Becario de Producción")).industry == "industrial"
    assert classify(raw("Junior Receptionist")).industry == "other"


def test_rejects_postings_without_a_link():
    assert classify(raw("Junior Analyst", url="")) is None


# --- HTTP ---------------------------------------------------------------------------------------


def test_get_json_retries_then_succeeds():
    calls = []

    def handler(_req):
        calls.append(1)
        return httpx.Response(503) if len(calls) < 3 else httpx.Response(200, json={"ok": True})

    with make_client(httpx.MockTransport(handler)) as c:
        assert get_json(c, "https://x.test/a", sleep=lambda _s: None) == {"ok": True}
    assert len(calls) == 3


def test_get_json_does_not_retry_404():
    calls = []

    def handler(_req):
        calls.append(1)
        return httpx.Response(404)

    with make_client(httpx.MockTransport(handler)) as c, pytest.raises(FetchError):
        get_json(c, "https://x.test/a", sleep=lambda _s: None)
    assert len(calls) == 1


def test_adzuna_needs_credentials(monkeypatch):
    monkeypatch.delenv("ADZUNA_APP_ID", raising=False)
    monkeypatch.delenv("ADZUNA_APP_KEY", raising=False)
    with pytest.raises(general.MissingCredentials), make_client() as c:
        general.fetch_adzuna(c, ["junior"])


# --- Supabase sync ------------------------------------------------------------------------------


def test_sync_upserts_then_expires_old_rows():
    seen: list[httpx.Request] = []

    def handler(req: httpx.Request):
        seen.append(req)
        if req.method == "PATCH":
            return httpx.Response(200, json=[{"id": "a"}, {"id": "b"}])
        return httpx.Response(201)

    now = datetime(2026, 11, 27, 6, tzinfo=UTC)
    p = classify(raw("Junior Analyst"))
    out = sync([p], "https://proj.supabase.co", "service-key", now, httpx.MockTransport(handler))
    assert out == {"upserted": 1, "expired": 2}
    post, patch = seen
    assert post.url.params["on_conflict"] == "source,external_id"
    assert post.headers["authorization"] == "Bearer service-key"
    body = json.loads(post.content)
    assert "first_seen_at" not in body[0]  # never overwritten on conflict
    assert body[0]["active"] is True
    assert patch.url.params["last_seen_at"] == "lt.2026-11-20T06:00:00+00:00"
    assert json.loads(patch.content) == {"active": False}


def test_row_shape():
    p = classify(raw("Junior Analyst"))
    r = row(p, datetime(2026, 11, 27, tzinfo=UTC))
    assert set(r) == {
        "source", "external_id", "source_url", "company", "title", "location", "city",
        "remote", "level", "industry", "posted_at", "last_seen_at", "active",
    }  # fmt: skip


# --- CLI ----------------------------------------------------------------------------------------


def test_cli_without_secrets_fails_cleanly(monkeypatch, capsys):
    from pipeline.cli import main

    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY", raising=False)
    assert main(["run"]) == 2
    assert "missing" in capsys.readouterr().err


def test_cli_dry_run_writes_json(monkeypatch, tmp_path):
    from pipeline import cli

    monkeypatch.setattr(cli, "OUT_DIR", tmp_path)
    p = classify(raw("Junior Analyst"))
    stats = {"greenhouse": {"fetched": 1, "kept": 1, "errors": [], "skipped": None}}
    monkeypatch.setattr(cli, "collect", lambda only=None: ([p], stats))
    assert cli.main(["run", "--dry-run"]) == 0
    data = json.loads((tmp_path / "postings.json").read_text(encoding="utf-8"))
    assert data[0]["title"] == "Junior Analyst"
    summary = json.loads((tmp_path / "summary.json").read_text(encoding="utf-8"))
    assert summary["total_kept"] == 1
