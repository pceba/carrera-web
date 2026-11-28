import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { INDUSTRIES } from "../../../content/catalog";
import { COMPARE, DIMENSIONS } from "./data";

const root = join(process.cwd(), "content", "industrias");

describe("compare data", () => {
  it("covers every industry and every dimension", () => {
    for (const i of INDUSTRIES) {
      expect(Object.keys(COMPARE[i.slug]).sort()).toEqual(DIMENSIONS.map((d) => d.id).sort());
    }
  });

  it("cites an existing guide page for every non-empty value", () => {
    for (const [slug, dims] of Object.entries(COMPARE)) {
      for (const [dim, cell] of Object.entries(dims)) {
        if (cell.value === null) continue;
        expect(cell.source.startsWith(`${slug}/`), `${slug}.${dim}`).toBe(true);
        expect(existsSync(join(root, `${cell.source}.mdx`)), `${slug}.${dim}: ${cell.source}`).toBe(
          true,
        );
      }
    }
  });

  it("leaves industries without a guide empty and explains every gap", () => {
    for (const i of INDUSTRIES) {
      for (const cell of Object.values(COMPARE[i.slug])) {
        if (i.status === "preparing") expect(cell.value).toBeNull();
        if (cell.value === null) expect(cell.reason.length).toBeGreaterThan(0);
      }
    }
  });

  it("never gives pay per firm: pay values come from the sueldos page", () => {
    for (const dims of Object.values(COMPARE)) {
      const cell = dims.sueldo;
      if (cell.value !== null) expect(cell.source.endsWith("/sueldos")).toBe(true);
    }
  });
});
