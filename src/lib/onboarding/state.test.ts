import { describe, expect, it } from "vitest";
import { currentStep, doneSteps, sanitizeState, toggleStep } from "./state";

describe("onboarding state", () => {
  it("drops unknown keys and non-true values", () => {
    expect(sanitizeState({ diagnostico: true, guia: "yes", x: true })).toEqual({
      diagnostico: true,
    });
    expect(sanitizeState(null)).toEqual({});
    expect(sanitizeState("a")).toEqual({});
  });

  it("toggles a step on and off without mutating", () => {
    const a = {};
    const b = toggleStep(a, "guia");
    expect(b).toEqual({ guia: true });
    expect(a).toEqual({});
    expect(toggleStep(b, "guia")).toEqual({});
  });

  it("merges ticked and detected steps and finds the current one", () => {
    const done = doneSteps({ diagnostico: true }, { candidatura: true });
    expect([...done]).toEqual(["diagnostico", "candidatura"]);
    expect(currentStep(done)).toBe("guia");
    expect(
      currentStep(
        doneSteps({ diagnostico: true, guia: true, encaje: true }, { candidatura: true }),
      ),
    ).toBeNull();
  });
});
