import { describe, expect, it } from "vitest";
import { LEGAL_DATES, LEGAL_VERSIONS, OTHER_LEGAL_VERSIONS } from "./versions";

describe("legal versions", () => {
  it("are non-empty ISO-date strings", () => {
    for (const v of [...Object.values(LEGAL_VERSIONS), ...Object.values(OTHER_LEGAL_VERSIONS)]) {
      expect(v).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it("have a human date for every document", () => {
    expect(Object.keys(LEGAL_DATES).sort()).toEqual(
      [...Object.keys(LEGAL_VERSIONS), ...Object.keys(OTHER_LEGAL_VERSIONS)].sort(),
    );
  });
});
