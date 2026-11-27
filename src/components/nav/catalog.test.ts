import { describe, expect, it } from "vitest";
import {
  getIndustry,
  getPage,
  industryHref,
  INDUSTRIES,
  neighbours,
  pageHref,
  pagesForPrep,
  PREP_GUIDES,
  related,
} from "../../../content/catalog";

const consulting = getIndustry("consultoria")!;
const sections = consulting.sections;

describe("catalog data", () => {
  it("has the six focus industries with unique slugs", () => {
    expect(INDUSTRIES).toHaveLength(6);
    expect(new Set(INDUSTRIES.map((i) => i.slug)).size).toBe(6);
  });

  it("publishes pages only for live industries", () => {
    for (const i of INDUSTRIES) {
      if (i.status === "preparing") expect(i.sections).toHaveLength(0);
    }
  });
});

describe("getPage", () => {
  it("tells sections from segments", () => {
    expect(getPage(consulting, "proceso")?.kind).toBe("section");
    expect(getPage(consulting, "estrategia")?.kind).toBe("segment");
    expect(getPage(consulting, "no-existe")).toBeUndefined();
  });
});

describe("neighbours", () => {
  it("goes back to the hub from the first section", () => {
    const { prev, next } = neighbours(consulting, sections[0]!.slug);
    expect(prev?.href).toBe(industryHref("consultoria"));
    expect(next?.href).toBe(pageHref("consultoria", sections[1]!.slug));
  });

  it("walks the reading path in order", () => {
    const { prev, next } = neighbours(consulting, sections[2]!.slug);
    expect(prev?.href).toBe(pageHref("consultoria", sections[1]!.slug));
    expect(next?.href).toBe(pageHref("consultoria", sections[3]!.slug));
  });

  it("has no next link on the last section", () => {
    const last = sections[sections.length - 1]!;
    const { prev, next } = neighbours(consulting, last.slug);
    expect(next).toBeUndefined();
    expect(prev?.href).toBe(pageHref("consultoria", sections[sections.length - 2]!.slug));
  });

  it("sends a segment back to the hub and on to the first section", () => {
    const { prev, next } = neighbours(consulting, "estrategia");
    expect(prev?.href).toBe(industryHref("consultoria"));
    expect(next?.href).toBe(pageHref("consultoria", sections[0]!.slug));
  });

  it("has no next link in an industry without sections", () => {
    const preparing = INDUSTRIES.find((i) => i.sections.length === 0)!;
    const { prev, next } = neighbours(preparing, "x");
    expect(prev?.href).toBe(industryHref(preparing.slug));
    expect(next).toBeUndefined();
  });
});

describe("related", () => {
  it("links the guides a page feeds, then the industries that share them", () => {
    const proceso = getPage(consulting, "proceso")!.page;
    const links = related(consulting, proceso);
    expect(links.length).toBeGreaterThan(0);
    expect(links.length).toBeLessThanOrEqual(5);
    expect(links[0]!.href).toBe("/preparacion/entrevistas-de-caso");
    expect(links.some((l) => l.href === industryHref("private-equity"))).toBe(true);
  });

  it("never links to its own industry hub", () => {
    for (const i of INDUSTRIES) {
      expect(related(i).map((l) => l.href)).not.toContain(industryHref(i.slug));
    }
  });

  it("has no duplicate links", () => {
    const links = related(consulting, getPage(consulting, "proceso")!.page);
    expect(new Set(links.map((l) => l.href)).size).toBe(links.length);
  });

  it("falls back to the industry's own guides when the page declares none", () => {
    const links = related(consulting, getPage(consulting, "el-trabajo")!.page);
    expect(links.length).toBeGreaterThan(0);
  });
});

describe("pagesForPrep", () => {
  it("lists the pages that feed a guide, with their industry", () => {
    const pages = pagesForPrep("entrevistas-de-caso");
    expect(pages.some((p) => p.href === pageHref("consultoria", "proceso"))).toBe(true);
    expect(pages.every((p) => p.industry.slug)).toBe(true);
  });

  it("is empty for a guide no page uses", () => {
    const used = new Set(
      INDUSTRIES.flatMap((i) => [...i.sections, ...i.segments]).flatMap((p) => p.prep ?? []),
    );
    const unused = PREP_GUIDES.find((g) => !used.has(g.slug));
    if (unused) expect(pagesForPrep(unused.slug)).toEqual([]);
  });
});
