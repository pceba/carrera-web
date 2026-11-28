import { INDUSTRY_ORDER, QUESTIONS, type QuizIndustry } from "./questions";

/** One chosen option index per question, in order. `null` = not answered yet. */
export type Answers = readonly (number | null)[];

export interface RankedIndustry {
  slug: QuizIndustry;
  score: number;
  /** 0-100: score against the most this industry could get with this question set. */
  percent: number;
}

const maxFor = (slug: QuizIndustry) =>
  QUESTIONS.reduce((sum, q) => sum + Math.max(...q.options.map((o) => o.weights[slug] ?? 0)), 0);
const MAX = Object.fromEntries(INDUSTRY_ORDER.map((s) => [s, maxFor(s)])) as Record<
  QuizIndustry,
  number
>;

export function scoreAnswers(answers: Answers): Record<QuizIndustry, number> {
  const totals = Object.fromEntries(INDUSTRY_ORDER.map((s) => [s, 0])) as Record<
    QuizIndustry,
    number
  >;
  answers.forEach((choice, q) => {
    const option = choice === null ? undefined : QUESTIONS[q]?.options[choice];
    if (!option) return;
    for (const slug of INDUSTRY_ORDER) totals[slug] += option.weights[slug] ?? 0;
  });
  return totals;
}

/** Highest score first; ties keep the fixed `INDUSTRY_ORDER`, so the same answers always rank the same. */
export function rank(answers: Answers): RankedIndustry[] {
  const totals = scoreAnswers(answers);
  return INDUSTRY_ORDER.map((slug, order) => ({ slug, order }))
    .sort((a, b) => totals[b.slug] - totals[a.slug] || a.order - b.order)
    .map(({ slug }) => ({
      slug,
      score: totals[slug],
      percent: Math.round((totals[slug] / MAX[slug]) * 100),
    }));
}

/** Up to `count` short reasons: the answers that pushed this industry up the most. */
export function reasons(answers: Answers, slug: QuizIndustry, count = 2): string[] {
  const contributions = answers.flatMap((choice, q) => {
    const option = choice === null ? undefined : QUESTIONS[q]?.options[choice];
    const weight = option?.weights[slug] ?? 0;
    return option && weight > 0 ? [{ q, weight, text: option.because }] : [];
  });
  return contributions
    .sort((a, b) => b.weight - a.weight || a.q - b.q)
    .slice(0, count)
    .map((c) => c.text);
}

/** "13212431": option number (1-based) per question. Used in the URL hash, so no storage. */
export function encodeAnswers(answers: Answers): string {
  return answers.map((a) => (a === null ? "0" : String(a + 1))).join("");
}

/** Returns null unless every question has a valid answer. */
export function decodeAnswers(code: string): number[] | null {
  if (code.length !== QUESTIONS.length) return null;
  const out: number[] = [];
  for (let q = 0; q < QUESTIONS.length; q++) {
    const n = Number(code[q]);
    if (!Number.isInteger(n) || n < 1 || n > QUESTIONS[q]!.options.length) return null;
    out.push(n - 1);
  }
  return out;
}
