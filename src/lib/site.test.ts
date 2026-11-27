import { describe, expect, it } from "vitest";
import { SITE } from "./site";

describe("SITE", () => {
  it("is Spanish-first and 16+", () => {
    expect(SITE.locale).toBe("es");
    expect(SITE.minAge).toBe(16);
  });
});
