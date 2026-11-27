import { describe, expect, it } from "vitest";
import { checkAnswer, checklistScore, choiceScore, parseNumber, type Choice } from "./case-logic";

describe("parseNumber", () => {
  it("handles Spanish and English formats", () => {
    expect(parseNumber("1.080")).toBe(1080);
    expect(parseNumber("1 080")).toBe(1080);
    expect(parseNumber("1080,5")).toBe(1080.5);
    expect(parseNumber("1.080,5")).toBe(1080.5);
    expect(parseNumber("1,080.5")).toBe(1080.5);
    expect(parseNumber("0,25")).toBe(0.25);
  });
  it("rejects junk", () => {
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
    expect(parseNumber("12€")).toBeNull();
  });
});

describe("checkAnswer", () => {
  it("grades by relative error", () => {
    expect(checkAnswer("1080", 1080).status).toBe("correct");
    expect(checkAnswer("1.085", 1080).status).toBe("correct");
    expect(checkAnswer("1000", 1080).status).toBe("close");
    expect(checkAnswer("500", 1080).status).toBe("wrong");
    expect(checkAnswer("n/a", 1080).status).toBe("invalid");
  });
});

describe("scores", () => {
  const choices: Choice[] = [
    { id: "a", label: "A", good: true, feedback: "" },
    { id: "b", label: "B", good: false, feedback: "" },
    { id: "c", label: "C", good: true, feedback: "" },
  ];
  it("counts good picks and penalises bad ones, floor 0", () => {
    expect(choiceScore(["a", "c"], choices)).toBe(2);
    expect(choiceScore(["a", "b"], choices)).toBe(0);
    expect(choiceScore(["b"], choices)).toBe(0);
    expect(choiceScore(["a", "a"], choices)).toBe(1);
  });
  it("checklist score is clamped", () => {
    expect(checklistScore(3, 4)).toBe(0.75);
    expect(checklistScore(5, 4)).toBe(1);
    expect(checklistScore(1, 0)).toBe(0);
  });
});
