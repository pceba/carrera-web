import { describe, expect, it } from "vitest";
import { groupByStage, upcomingSteps } from "./derive";
import { sanitizeStored } from "./store";
import type { Application } from "./types";
import { validateDraft } from "./validate";

const base = { firm: "McKinsey", stage: "enviada" };

describe("validateDraft", () => {
  it("accepts a minimal entry and nulls empty optionals", () => {
    const r = validateDraft({ ...base, role: "  ", url: "" });
    expect(r).toMatchObject({ ok: true, value: { firm: "McKinsey", role: null, url: null } });
  });
  it("requires a firm and enforces lengths", () => {
    expect(validateDraft({ firm: "  " })).toMatchObject({ ok: false });
    const r = validateDraft({
      firm: "x".repeat(121),
      notes: "n".repeat(2001),
      next_step: "s".repeat(81),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["firm", "next_step", "notes"]);
  });
  it("accepts only https URLs", () => {
    expect(validateDraft({ ...base, url: "http://a.es" }).ok).toBe(false);
    expect(validateDraft({ ...base, url: "javascript:alert(1)" }).ok).toBe(false);
    expect(validateDraft({ ...base, url: "https://a.es/x" }).ok).toBe(true);
  });
  it("rejects unknown stages, industries and impossible dates", () => {
    expect(validateDraft({ ...base, stage: "fichada" }).ok).toBe(false);
    expect(validateDraft({ ...base, industry: "retail" }).ok).toBe(false);
    expect(validateDraft({ ...base, industry: "big-law" }).ok).toBe(true);
    expect(validateDraft({ ...base, applied_on: "2026-02-31" }).ok).toBe(false);
  });
  it("tolerates non-object input", () => {
    expect(validateDraft(null).ok).toBe(false);
  });
});

describe("sanitizeStored", () => {
  it("keeps valid entries, drops invalid ones, fills ids", () => {
    const items = sanitizeStored({
      version: 1,
      items: [{ firm: "A" }, { firm: "" }, 3, { firm: "B", id: "x" }],
    });
    expect(items.map((i) => i.firm)).toEqual(["A", "B"]);
    expect(items[1]?.id).toBe("x");
    expect(items[0]?.id).toBeTruthy();
  });
  it("returns [] for garbage", () => {
    expect(sanitizeStored("x")).toEqual([]);
    expect(sanitizeStored({ items: "no" })).toEqual([]);
  });
});

const app = (over: Partial<Application>): Application => ({
  id: "1",
  firm: "F",
  industry: null,
  role: null,
  stage: "enviada",
  applied_on: null,
  next_step: "Llamada",
  next_step_on: null,
  url: null,
  notes: null,
  created_at: "",
  updated_at: "",
  ...over,
});

describe("derive", () => {
  it("groups by stage keeping every stage key", () => {
    const g = groupByStage([app({ stage: "oferta" })]);
    expect(g.oferta).toHaveLength(1);
    expect(g.interes).toEqual([]);
  });
  it("lists next steps in the next 14 days, soonest first, skipping discarded", () => {
    const list = upcomingSteps(
      [
        app({ id: "a", next_step_on: "2026-12-10" }),
        app({ id: "b", next_step_on: "2026-12-02" }),
        app({ id: "c", next_step_on: "2026-12-20" }),
        app({ id: "d", next_step_on: "2026-11-30" }),
        app({ id: "e", next_step_on: "2026-12-03", stage: "descartada" }),
        app({ id: "f", next_step_on: "2026-12-14" }),
      ],
      "2026-12-01",
    );
    expect(list.map((i) => i.id)).toEqual(["b", "a", "f"]);
  });
});
