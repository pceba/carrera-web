/**
 * Shared constants and filter parsing for the public postings page.
 *
 * `Industry`, `Level`, `Source` and the posting shape come from the Rust engine (`cw-domain`),
 * generated into `src/lib/generated/` by `cargo test`. Do not redefine them here.
 */

import type { Industry } from "@/lib/generated/Industry";
import type { Level } from "@/lib/generated/Level";
import type { Posting as PostingFields } from "@/lib/generated/Posting";
import type { Source } from "@/lib/generated/Source";

export type { Industry, Level, Source };

/** A row of the `postings` table: what the pipeline writes plus what the database adds. */
export type Posting = PostingFields & {
  id: string;
  first_seen_at: string;
};

export const LEVELS: Record<Level, string> = {
  intern: "Prácticas / becario",
  trainee: "Trainee",
  graduate: "Graduate",
  junior: "Junior",
  analyst: "Analista",
};

const SIX_INDUSTRIES: Record<Industry, string> = {
  consulting: "Consultoría",
  ai: "Roles de IA",
  "data-science": "Data science",
  "private-equity": "Private equity",
  "investment-banking": "Banca de inversión",
  "big-law": "Big Law",
};

/**
 * Labels for the six industries. `other` no longer exists as an industry (the classifier drops
 * those postings), but `(public)/ofertas` still reads `INDUSTRY_LABELS.other` as a fallback.
 * It is kept as a non-enumerable property so the filter menus list only the six; remove it when
 * WS-IA's rebuild of that page stops reading it.
 */
export const INDUSTRY_LABELS = Object.defineProperty({ ...SIX_INDUSTRIES }, "other", {
  value: "Otras",
  enumerable: false,
}) as Record<Industry, string> & { other: string };

/** value = what the pipeline stores in `city` (accent-free, capitalised). */
export const CITIES: { value: string; label: string }[] = [
  { value: "Madrid", label: "Madrid" },
  { value: "Barcelona", label: "Barcelona" },
  { value: "Valencia", label: "Valencia" },
  { value: "Sevilla", label: "Sevilla" },
  { value: "Bilbao", label: "Bilbao" },
  { value: "Malaga", label: "Málaga" },
  { value: "Zaragoza", label: "Zaragoza" },
];

/** Name and home page shown next to every card (each source's terms require it). */
export const SOURCES: Partial<Record<Source, { name: string; url: string }>> = {
  remotive: { name: "Remotive", url: "https://remotive.com" },
  jobicy: { name: "Jobicy", url: "https://jobicy.com" },
  adzuna: { name: "Adzuna", url: "https://www.adzuna.es" },
};

export type Filters = {
  industry?: Industry;
  level?: Level;
  city?: string;
  remote?: boolean;
};

type Params = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function isIndustry(value: string | undefined): value is Industry {
  return value !== undefined && Object.hasOwn(INDUSTRY_LABELS, value);
}

function isLevel(value: string | undefined): value is Level {
  return value !== undefined && Object.hasOwn(LEVELS, value);
}

/** Keeps only known values, so nothing from the URL reaches the database query unchecked. */
export function parseFilters(params: Params): Filters {
  const industry = one(params.industria);
  const level = one(params.nivel);
  const city = one(params.ciudad);
  return {
    industry: isIndustry(industry) ? industry : undefined,
    level: isLevel(level) ? level : undefined,
    city: city && CITIES.some((c) => c.value === city) ? city : undefined,
    remote: one(params.remoto) === "1" ? true : undefined,
  };
}

/** Source name for the attribution line; company boards show the employer's own board. */
export function sourceLabel(p: Pick<Posting, "source" | "company">): {
  name: string;
  url?: string;
} {
  const known = SOURCES[p.source];
  return known ?? { name: `${p.company} (web de empleo propia)` };
}
