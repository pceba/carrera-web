import { describe, expect, it } from "vitest";
import { computeStats, deadlineStatus, filterBySector, nextStepsIcs, toCsv } from "./insights";
import type { Application } from "./types";

const app = (over: Partial<Application>): Application => ({
  id: "id1",
  firm: "Firma",
  industry: null,
  role: null,
  stage: "enviada",
  applied_on: null,
  next_step: null,
  next_step_on: null,
  url: null,
  notes: null,
  created_at: "",
  updated_at: "",
  ...over,
});

describe("computeStats", () => {
  it("counts total, in progress and the response rate over sent entries", () => {
    const s = computeStats([
      app({ stage: "interes" }),
      app({ stage: "enviada" }),
      app({ stage: "pruebas" }),
      app({ stage: "entrevista" }),
      app({ stage: "descartada" }),
    ]);
    expect(s).toEqual({ total: 5, inProgress: 3, sent: 4, responseRate: 50 });
  });
  it("has no rate before anything is sent", () => {
    expect(computeStats([app({ stage: "interes" })]).responseRate).toBeNull();
    expect(computeStats([]).total).toBe(0);
  });
});

describe("filterBySector", () => {
  const list = [app({ id: "a", industry: "big-law" }), app({ id: "b" })];
  it("filters by sector, by none, and passes all", () => {
    expect(filterBySector(list, "all")).toHaveLength(2);
    expect(filterBySector(list, "big-law").map((a) => a.id)).toEqual(["a"]);
    expect(filterBySector(list, "none").map((a) => a.id)).toEqual(["b"]);
  });
});

describe("deadlineStatus", () => {
  const today = "2026-12-01";
  it("flags overdue and this-week steps of open entries only", () => {
    expect(deadlineStatus(app({ next_step_on: "2026-11-30" }), today)).toBe("overdue");
    expect(deadlineStatus(app({ next_step_on: "2026-12-01" }), today)).toBe("week");
    expect(deadlineStatus(app({ next_step_on: "2026-12-08" }), today)).toBe("week");
    expect(deadlineStatus(app({ next_step_on: "2026-12-09" }), today)).toBeNull();
    expect(
      deadlineStatus(app({ next_step_on: "2026-11-30", stage: "descartada" }), today),
    ).toBeNull();
    expect(deadlineStatus(app({}), today)).toBeNull();
  });
});

describe("toCsv", () => {
  it("quotes cells, escapes quotes and defuses spreadsheet formulas", () => {
    const csv = toCsv(
      [app({ firm: 'A, "B"', notes: "=HYPERLINK(1)", industry: "ai" })],
      () => "Roles de IA",
    );
    const [header, row] = csv.trim().split("\r\n");
    expect(header).toContain("Empresa,Sector");
    expect(row).toContain('"A, ""B"""');
    expect(row).toContain("'=HYPERLINK(1)");
    expect(row).toContain("Roles de IA");
    expect(row).toContain("Enviada");
  });
});

describe("nextStepsIcs", () => {
  it("builds all-day events for dated, non-discarded steps", () => {
    const ics = nextStepsIcs(
      [
        app({
          id: "x",
          firm: "Acme",
          next_step: "Entrevista; RR. HH.",
          next_step_on: "2026-12-10",
        }),
        app({ id: "y", next_step_on: "2026-12-11", stage: "descartada" }),
        app({ id: "z" }),
      ],
      new Date("2026-12-01T10:00:00Z"),
    )!;
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261210");
    expect(ics).toContain("DTEND;VALUE=DATE:20261211");
    expect(ics).toContain("SUMMARY:Acme: Entrevista\\; RR. HH.");
    expect(ics).toContain("\r\n");
  });
  it("returns null with nothing dated", () => {
    expect(nextStepsIcs([app({})])).toBeNull();
  });
});
