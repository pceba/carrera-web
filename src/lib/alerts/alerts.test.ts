import { describe, expect, it } from "vitest";
import { ALERT_INDUSTRIES, toDbIndustries, toDbIndustry, toUiIndustry } from "./industries";
import { isToken, splitList, validatePreferences } from "./validate";

describe("industry mapping", () => {
  it("maps every UI slug to the English value of the table and back", () => {
    expect(ALERT_INDUSTRIES.map((i) => toDbIndustry(i.ui))).toEqual([
      "consulting",
      "ai",
      "data-science",
      "private-equity",
      "investment-banking",
      "big-law",
    ]);
    for (const i of ALERT_INDUSTRIES) expect(toUiIndustry(i.db)).toBe(i.ui);
  });
  it("accepts English values (Encaje profile), drops unknown and duplicates", () => {
    expect(toDbIndustries(["consultoria", "consulting", "retail", "big-law"])).toEqual([
      "consulting",
      "big-law",
    ]);
  });
});

const ok = { industries: ["consultoria"], roles: "", skills: "", locations: "", remote: "any" };

describe("validatePreferences", () => {
  it("accepts a minimal valid input", () => {
    expect(validatePreferences(ok)).toMatchObject({ ok: true });
  });
  it("needs an industry and a valid remote value", () => {
    expect(validatePreferences({ ...ok, industries: ["x"] }).ok).toBe(false);
    expect(validatePreferences({ ...ok, remote: "maybe" }).ok).toBe(false);
  });
  it("enforces the table limits", () => {
    const many = (n: number) => Array.from({ length: n }, (_, i) => `a${i}`).join(",");
    expect(validatePreferences({ ...ok, roles: many(11) }).ok).toBe(false);
    expect(validatePreferences({ ...ok, roles: many(10) }).ok).toBe(true);
    expect(validatePreferences({ ...ok, skills: many(21) }).ok).toBe(false);
    expect(validatePreferences({ ...ok, locations: many(11) }).ok).toBe(false);
    expect(validatePreferences({ ...ok, skills: "x".repeat(81) }).ok).toBe(false);
  });
});

describe("helpers", () => {
  it("splitList trims and de-duplicates", () => {
    expect(splitList("SQL, Python ,, SQL;\nExcel")).toEqual(["SQL", "Python", "Excel"]);
  });
  it("isToken only accepts UUIDs", () => {
    expect(isToken("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
    expect(isToken("bogus")).toBe(false);
    expect(isToken(undefined)).toBe(false);
  });
});
