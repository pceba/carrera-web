/** Pure helpers for the postings browser: no React, so they are unit-tested directly. */
import { newId } from "@/lib/tracker/store";
import { INDUSTRY_SLUGS, type Application } from "@/lib/tracker/types";
import { SOURCES, type Filters, type Posting } from "@/lib/postings/types";

export type SortMode = "recientes" | "encaje";

const DAY = 86_400_000;
export const NEW_DAYS = 3;

/** "Nueva" = first seen by us less than 3 days ago. */
export function isNew(p: Pick<Posting, "first_seen_at">, now: number = Date.now()): boolean {
  const t = Date.parse(p.first_seen_at);
  return Number.isFinite(t) && now - t < NEW_DAYS * DAY && now - t >= -DAY;
}

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** Every word of the query must appear in company, title or location (accent-insensitive). */
export function searchPostings(postings: Posting[], query: string): Posting[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return postings;
  return postings.filter((p) => {
    const hay = fold(`${p.company} ${p.title} ${p.location ?? ""}`);
    return words.every((w) => hay.includes(w));
  });
}

/** Reorder by a ranking (`index` into `postings`); postings the ranking misses keep their order. */
export function orderByRanking(postings: Posting[], ranking: { index: number }[]): Posting[] {
  const seen = new Set<number>();
  const out: Posting[] = [];
  for (const { index } of ranking) {
    const p = postings[index];
    if (p && !seen.has(index)) {
      seen.add(index);
      out.push(p);
    }
  }
  postings.forEach((p, i) => {
    if (!seen.has(i)) out.push(p);
  });
  return out;
}

/** Query string for the page URL; empty values are left out so `/ofertas` stays clean. */
export function buildHref(
  state: Filters & { q?: string; sort?: SortMode },
  base = "/ofertas",
): string {
  const q = new URLSearchParams();
  if (state.industry) q.set("industria", state.industry);
  if (state.level) q.set("nivel", state.level);
  if (state.city) q.set("ciudad", state.city);
  if (state.remote) q.set("remoto", "1");
  if (state.q?.trim()) q.set("q", state.q.trim());
  if (state.sort === "encaje") q.set("orden", "encaje");
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

/** A tracker entry for a posting, in the stage "Me interesa". */
export function postingToApplication(p: Posting, now: Date = new Date()): Application {
  const iso = now.toISOString();
  return {
    id: newId(),
    firm: p.company.slice(0, 120),
    industry: INDUSTRY_SLUGS.includes(p.industry) ? p.industry : null,
    role: p.title.slice(0, 120),
    stage: "interes",
    applied_on: null,
    next_step: null,
    next_step_on: null,
    url: p.source_url.length <= 500 ? p.source_url : null,
    notes: null,
    created_at: iso,
    updated_at: iso,
  };
}

/** True for postings published on the employer's own board (not an aggregator). */
export const isCompanyBoard = (p: Pick<Posting, "source">) => !(p.source in SOURCES);
