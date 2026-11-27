import { describe, expect, it } from "vitest";
import { parseList, sanitizeProfile } from "./profile-store";

describe("parseList", () => {
  it("splits, trims and de-duplicates", () => {
    expect(parseList("SQL, Python ,, SQL;\nPower BI")).toEqual(["SQL", "Python", "Power BI"]);
  });
});

describe("sanitizeProfile", () => {
  it("keeps valid fields and drops unknown industries", () => {
    const profile = sanitizeProfile({
      industries: ["consulting", "other", 3],
      skills: ["SQL"],
      remote: "onsite",
      salary: 1,
    });
    expect(profile.industries).toEqual([]); // a list with a non-string entry is rejected whole
    expect(profile.skills).toEqual(["SQL"]);
    expect(profile.remote).toBe("onsite");
  });

  it("filters industries that are no longer in the six", () => {
    expect(sanitizeProfile({ industries: ["ai", "retail"] }).industries).toEqual(["ai"]);
  });

  it("returns an empty profile for garbage", () => {
    expect(sanitizeProfile(null).skills).toEqual([]);
    expect(sanitizeProfile("x").remote).toBe("any");
  });
});
