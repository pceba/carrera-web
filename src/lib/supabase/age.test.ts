import { describe, expect, it } from "vitest";
import { isOldEnough, parseBirthYear } from "./age";

describe("age gate", () => {
  const now = new Date("2026-11-27");

  it("blocks under 16 and allows 16+", () => {
    expect(isOldEnough(2011, now)).toBe(false);
    expect(isOldEnough(2010, now)).toBe(true);
    expect(isOldEnough(2004, now)).toBe(true);
  });

  it("rejects nonsense years", () => {
    expect(isOldEnough(1800, now)).toBe(false);
    expect(isOldEnough(NaN, now)).toBe(false);
  });

  it("parses birth year form values", () => {
    expect(parseBirthYear("2004")).toBe(2004);
    expect(parseBirthYear(" 2004 ")).toBe(2004);
    expect(parseBirthYear("04")).toBeNull();
    expect(parseBirthYear("abcd")).toBeNull();
    expect(parseBirthYear("3000")).toBeNull();
    expect(parseBirthYear(null)).toBeNull();
  });
});
