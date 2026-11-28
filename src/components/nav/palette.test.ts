import { describe, expect, it } from "vitest";
import { buildPaletteItems, normalize, searchPalette } from "./palette-data";

const items = buildPaletteItems();

describe("command palette data", () => {
  it("covers tools, every industry and the guide pages", () => {
    const groups = new Set(items.map((i) => i.group));
    expect(groups).toEqual(
      new Set([
        "Herramientas",
        "Industrias",
        "Guías de industria",
        "Preparación",
        "Cuenta",
        "Acciones",
      ]),
    );
    expect(items.filter((i) => i.id.startsWith("industry-"))).toHaveLength(6);
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });

  it("gives every item a target or an action id", () => {
    for (const i of items) expect(i.href ?? i.id).toBeTruthy();
  });
});

describe("searchPalette", () => {
  it("ignores accents and case", () => {
    expect(normalize("Preparación")).toBe("preparacion");
    const hits = searchPalette(items, "PREPARACION");
    expect(hits.some((h) => h.id === "preparacion")).toBe(true);
  });

  it("ranks a title that starts with the query first", () => {
    expect(searchPalette(items, "banca")[0]?.id).toBe("industry-banca-de-inversion");
  });

  it("requires every word to match", () => {
    const hits = searchPalette(items, "banca proceso");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.href).toBe("/industrias/banca-de-inversion/proceso");
    expect(searchPalette(items, "zzzz qqqq")).toEqual([]);
  });
});
