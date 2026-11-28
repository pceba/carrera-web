import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { INDUSTRIES } from "../../../content/catalog";
import { buildIcs } from "./ics";
import { parseProgrammes } from "./parse";
import { groupByMonth, statusOf } from "./status";
import { PROGRAMMES, type Programme } from "./types";

const data = parseProgrammes(
  readFileSync(path.join(process.cwd(), "content/calendario/programas.yaml"), "utf8"),
);
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const validIso = (v: string) =>
  ISO.test(v) && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;

describe("programas.yaml", () => {
  it("has review front matter", () => {
    expect(data.reviewer).toBeTruthy();
    expect(validIso(data.reviewed_at)).toBe(true);
    expect(validIso(data.next_review)).toBe(true);
    expect(data.sources.length).toBeGreaterThan(0);
    for (const s of data.sources) expect(s).toMatch(/^https:\/\//);
  });

  it.each(data.programmes.map((p) => [`${p.firm} · ${p.programme}`, p] as const))(
    "%s is valid",
    (_n, p) => {
      expect(p.firm.length).toBeGreaterThan(0);
      expect(INDUSTRIES.map((i) => i.slug)).toContain(p.industry);
      expect(PROGRAMMES).toContain(p.programme);
      expect(p.source_url).toMatch(/^https:\/\//);
      expect(data.sources).toContain(p.source_url);
      expect(p.status_note.length).toBeGreaterThan(0);
      expect(validIso(p.checked_at)).toBe(true);
      for (const d of [p.opens, p.closes]) if (d !== null) expect(validIso(d)).toBe(true);
      if (p.opens && p.closes) expect(p.closes >= p.opens).toBe(true);
    },
  );

  it("has no duplicate firm + programme + industry rows", () => {
    const keys = data.programmes.map((p) => `${p.firm}|${p.programme}|${p.industry}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("parser", () => {
  it("rejects unsupported syntax", () => {
    expect(() => parseProgrammes("a:\n  b: [1]\n")).toThrow();
  });
  it("reads null and quoted values", () => {
    const f = parseProgrammes('x: "a"\nprogrammes:\n  - firm: "F"\n    opens: null\n');
    expect(f.programmes[0]).toEqual({ firm: "F", opens: null });
  });
});

const row = (opens: string | null, closes: string | null): Programme => ({
  firm: "Acme, S.L.",
  industry: "consultoria",
  programme: "internship",
  opens,
  closes,
  status_note: "x",
  source_url: "https://acme.test",
  checked_at: "2026-11-28",
});

describe("status and ics", () => {
  it("computes status from today", () => {
    expect(statusOf(row(null, null), "2026-11-28")).toBe("nodates");
    expect(statusOf(row("2026-12-01", "2026-12-20"), "2026-11-28")).toBe("soon");
    expect(statusOf(row("2026-11-01", "2026-12-20"), "2026-11-28")).toBe("open");
    expect(statusOf(row("2026-11-01", "2026-11-27"), "2026-11-28")).toBe("closed");
    expect(statusOf(row("2026-11-28", "2026-11-28"), "2026-11-28")).toBe("open");
  });
  it("groups by month", () => {
    const g = groupByMonth([row("2027-02-03", null), row("2026-12-01", null)]);
    expect(g.map((m) => m.key)).toEqual(["2026-12", "2027-02"]);
  });
  it("builds all-day events and escapes text", () => {
    expect(buildIcs(row(null, null))).toBeNull();
    const ics = buildIcs(row("2026-12-31", "2027-01-10"), new Date("2026-11-28T10:00:00Z"))!;
    expect(ics).toContain("DTSTART;VALUE=DATE:20261231");
    expect(ics).toContain("DTEND;VALUE=DATE:20270101");
    expect(ics).toContain("SUMMARY:Abre: Acme\\, S.L. · Prácticas");
    expect(ics.split("BEGIN:VEVENT").length - 1).toBe(2);
  });
});
