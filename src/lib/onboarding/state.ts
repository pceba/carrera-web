export const ONBOARDING_KEY = "path.onboarding.v1";

export const STEP_IDS = ["diagnostico", "guia", "encaje", "candidatura"] as const;
export type StepId = (typeof STEP_IDS)[number];

/** Steps the user ticked by hand. Auto-detected completion is computed, never stored. */
export type OnboardingState = Partial<Record<StepId, true>>;

export function sanitizeState(value: unknown): OnboardingState {
  const out: OnboardingState = {};
  if (typeof value !== "object" || value === null) return out;
  const record = value as Record<string, unknown>;
  for (const id of STEP_IDS) if (record[id] === true) out[id] = true;
  return out;
}

export function loadState(): OnboardingState {
  try {
    const raw = window.localStorage.getItem(ONBOARDING_KEY);
    return raw ? sanitizeState(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

export function saveState(state: OnboardingState): void {
  try {
    window.localStorage.setItem(ONBOARDING_KEY, JSON.stringify(sanitizeState(state)));
  } catch {
    // Private mode or full storage: the page still works for this visit.
  }
}

export function toggleStep(state: OnboardingState, id: StepId): OnboardingState {
  const next = { ...state };
  if (next[id]) delete next[id];
  else next[id] = true;
  return next;
}

/** A step is done if the user ticked it or existing local state proves it. */
export function doneSteps(state: OnboardingState, detected: OnboardingState): Set<StepId> {
  return new Set(STEP_IDS.filter((id) => state[id] || detected[id]));
}

/** First step not done, or null when the path is finished. */
export function currentStep(done: Set<StepId>): StepId | null {
  return STEP_IDS.find((id) => !done.has(id)) ?? null;
}
