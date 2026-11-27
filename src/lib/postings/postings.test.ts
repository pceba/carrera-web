import { afterEach, describe, expect, it, vi } from "vitest";
import { buildQuery, fetchPostings } from "./query";
import { parseFilters, sourceLabel } from "./types";

describe("parseFilters", () => {
  it("keeps known values and drops everything else", () => {
    expect(
      parseFilters({ industria: "data-science", nivel: "junior", ciudad: "Madrid", remoto: "1" }),
    ).toEqual({ industry: "data-science", level: "junior", city: "Madrid", remote: true });
    expect(
      parseFilters({ industria: "x;drop table", nivel: ["intern", "junior"], ciudad: "Narnia" }),
    ).toEqual({ industry: undefined, level: "intern", city: undefined, remote: undefined });
  });
});

describe("buildQuery", () => {
  it("always asks for active rows and adds only the chosen filters", () => {
    const base = new URLSearchParams(buildQuery({}));
    expect(base.get("active")).toBe("eq.true");
    expect(base.has("industry")).toBe(false);
    const q = new URLSearchParams(buildQuery({ industry: "data-science", remote: true }));
    expect(q.get("industry")).toBe("eq.data-science");
    expect(q.get("remote")).toBe("eq.true");
  });
});

describe("fetchPostings", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("returns an empty list when Supabase is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const spy = vi.fn();
    expect(await fetchPostings({}, spy as unknown as typeof fetch)).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("returns rows, and [] on errors", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://p.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    const ok = vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: "1" }] });
    expect(await fetchPostings({}, ok as unknown as typeof fetch)).toHaveLength(1);
    const bad = vi.fn().mockResolvedValue({ ok: false });
    expect(await fetchPostings({}, bad as unknown as typeof fetch)).toEqual([]);
    const boom = vi.fn().mockRejectedValue(new Error("down"));
    expect(await fetchPostings({}, boom as unknown as typeof fetch)).toEqual([]);
  });
});

describe("sourceLabel", () => {
  it("names aggregators and falls back to the employer's own board", () => {
    expect(sourceLabel({ source: "remotive", company: "X" }).name).toBe("Remotive");
    expect(sourceLabel({ source: "greenhouse", company: "Celonis" }).name).toContain("Celonis");
  });
});
