import { describe, expect, it } from "vitest";
import type { Posting } from "@/lib/postings/types";
import {
  buildHref,
  isCompanyBoard,
  isNew,
  orderByRanking,
  postingToApplication,
  searchPostings,
} from "./logic";

const base = {
  source: "greenhouse",
  external_id: "1",
  source_url: "https://boards.example/1",
  company: "Acme",
  title: "Analista Junior",
  location: "Madrid, España",
  city: "Madrid",
  remote: false,
  level: "junior",
  industry: "consulting",
  posted_at: null,
  id: "a",
  first_seen_at: "2026-11-28T00:00:00Z",
} as unknown as Posting;
const mk = (o: Partial<Posting>): Posting => ({ ...base, ...o });

describe("isNew", () => {
  const now = Date.parse("2026-11-30T00:00:00Z");
  it("is true under 3 days and false after", () => {
    expect(isNew(mk({ first_seen_at: "2026-11-28T12:00:00Z" }), now)).toBe(true);
    expect(isNew(mk({ first_seen_at: "2026-11-27T00:00:00Z" }), now)).toBe(false);
    expect(isNew(mk({ first_seen_at: "garbage" }), now)).toBe(false);
  });
});

describe("searchPostings", () => {
  const list = [mk({ id: "1" }), mk({ id: "2", company: "Banco Ñandú", title: "Becario Riesgos" })];
  it("matches every word, ignoring accents and case", () => {
    expect(searchPostings(list, "nandu riesgos").map((p) => p.id)).toEqual(["2"]);
    expect(searchPostings(list, "espana junior").map((p) => p.id)).toEqual(["1"]);
    expect(searchPostings(list, "  ")).toHaveLength(2);
  });
});

describe("orderByRanking", () => {
  it("follows the ranking and appends the rest", () => {
    const list = [mk({ id: "a" }), mk({ id: "b" }), mk({ id: "c" })];
    const out = orderByRanking(list, [{ index: 2 }, { index: 2 }, { index: 9 }, { index: 0 }]);
    expect(out.map((p) => p.id)).toEqual(["c", "a", "b"]);
  });
});

describe("buildHref", () => {
  it("keeps only set values", () => {
    expect(buildHref({})).toBe("/ofertas");
    expect(buildHref({ industry: "ai", remote: true, q: " sql ", sort: "encaje" })).toBe(
      "/ofertas?industria=ai&remoto=1&q=sql&orden=encaje",
    );
  });
});

describe("postingToApplication", () => {
  it("creates a valid 'interes' entry with the original link", () => {
    const a = postingToApplication(mk({}));
    expect(a).toMatchObject({
      firm: "Acme",
      role: "Analista Junior",
      stage: "interes",
      industry: "consulting",
      url: "https://boards.example/1",
    });
    expect(a.id).toBeTruthy();
  });
});

describe("isCompanyBoard", () => {
  it("is false for aggregators", () => {
    expect(isCompanyBoard({ source: "adzuna" })).toBe(false);
    expect(isCompanyBoard({ source: "lever" })).toBe(true);
  });
});
