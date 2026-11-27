/** Pure scoring logic for the market-sizing case. No React, no I/O: easy to unit test. */

export type Choice = { id: string; label: string; good: boolean; feedback: string };

/** Parses numbers typed the Spanish way ("1.080", "1 080", "1080,5") or the English way. */
export function parseNumber(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, "");
  if (!s || !/^-?[\d.,]+$/.test(s)) return null;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  let normalised: string;
  if (lastComma > -1 && lastDot > -1) {
    // Whichever separator comes last is the decimal one.
    normalised = lastComma > lastDot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (lastComma > -1) {
    normalised = s.replace(/,/g, ".");
  } else if (lastDot > -1 && /^-?\d{1,3}(\.\d{3})+$/.test(s)) {
    normalised = s.replace(/\./g, ""); // "1.080" is a thousands separator in Spain
  } else {
    normalised = s;
  }
  const n = Number(normalised);
  return Number.isFinite(n) ? n : null;
}

export type MathsResult =
  { status: "invalid" } | { status: "correct" | "close" | "wrong"; value: number };

/** "correct" within 1 %, "close" within 10 % (rounding along the way), otherwise "wrong". */
export function checkAnswer(raw: string, expected: number): MathsResult {
  const value = parseNumber(raw);
  if (value === null) return { status: "invalid" };
  const error = Math.abs(value - expected) / Math.abs(expected);
  if (error <= 0.01) return { status: "correct", value };
  if (error <= 0.1) return { status: "close", value };
  return { status: "wrong", value };
}

/** Share of ticked self-assessment items, 0..1. */
export function checklistScore(ticked: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, ticked / total));
}

/** Number of picked choices that are the good ones, minus wrong picks (never below 0). */
export function choiceScore(picked: readonly string[], choices: readonly Choice[]): number {
  const good = new Set(choices.filter((c) => c.good).map((c) => c.id));
  let score = 0;
  for (const id of new Set(picked)) score += good.has(id) ? 1 : -1;
  return Math.max(0, score);
}
