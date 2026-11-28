import { describe, expect, it } from "vitest";
import { INDUSTRY_ORDER, QUESTIONS, type QuizIndustry } from "./questions";
import { decodeAnswers, encodeAnswers, rank, reasons } from "./score";

/** Every combination of answers (4*3*... a few thousand), so "can win" is checked, not assumed. */
function* allAnswers(): Generator<number[]> {
  const cur: number[] = [];
  function* walk(q: number): Generator<number[]> {
    if (q === QUESTIONS.length) {
      yield [...cur];
      return;
    }
    for (let i = 0; i < QUESTIONS[q]!.options.length; i++) {
      cur[q] = i;
      yield* walk(q + 1);
    }
  }
  yield* walk(0);
}

describe("quiz data", () => {
  it("has 8 questions with 3-4 options and only known industries", () => {
    expect(QUESTIONS).toHaveLength(8);
    for (const q of QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(q.options.length).toBeLessThanOrEqual(4);
      for (const o of q.options)
        for (const slug of Object.keys(o.weights)) expect(INDUSTRY_ORDER).toContain(slug);
    }
  });
});

describe("rank", () => {
  it("lets every industry win outright for some answers", () => {
    const winners = new Set<QuizIndustry>();
    for (const a of allAnswers()) {
      const [first, second] = rank(a);
      if (first!.score > second!.score) winners.add(first!.slug);
    }
    expect([...winners].sort()).toEqual([...INDUSTRY_ORDER].sort());
  });

  it("is stable: same answers, same order; ties follow the fixed industry order", () => {
    const none = Array(QUESTIONS.length).fill(null);
    expect(rank(none).map((r) => r.slug)).toEqual([...INDUSTRY_ORDER]);
    const a = [0, 1, 2, 0, 1, 2, 0, 1];
    expect(rank(a)).toEqual(rank([...a]));
  });

  it("returns all six, sorted by score, with percents in 0-100", () => {
    const r = rank([0, 3, 0, 0, 0, 0, 0, 2]);
    expect(r).toHaveLength(6);
    for (let i = 1; i < r.length; i++) expect(r[i - 1]!.score).toBeGreaterThanOrEqual(r[i]!.score);
    for (const x of r) expect(x.percent >= 0 && x.percent <= 100).toBe(true);
  });
});

describe("reasons", () => {
  it("gives up to two reasons taken from the answers that helped", () => {
    const a = [2, 0, 0, 2, 1, 2, 2, 0];
    const list = reasons(a, rank(a)[0]!.slug);
    expect(list.length).toBeGreaterThan(0);
    expect(list.length).toBeLessThanOrEqual(2);
  });
});

describe("hash encoding", () => {
  it("round-trips and rejects anything incomplete or out of range", () => {
    const a = [0, 1, 2, 0, 3, 1, 0, 2];
    expect(decodeAnswers(encodeAnswers(a))).toEqual(a);
    expect(decodeAnswers("123")).toBeNull();
    expect(decodeAnswers("00000000")).toBeNull();
    expect(decodeAnswers("99999999")).toBeNull();
    expect(decodeAnswers("abcdefgh")).toBeNull();
  });
});
