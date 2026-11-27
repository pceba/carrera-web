/** Shared constants and filter parsing for the public postings page. */

export type Posting = {
  id: string;
  source: string;
  source_url: string;
  company: string;
  title: string;
  location: string | null;
  city: string | null;
  remote: boolean;
  level: string;
  industry: string;
  posted_at: string | null;
  first_seen_at: string;
};

export const LEVELS: Record<string, string> = {
  intern: "Prácticas / becario",
  trainee: "Trainee",
  graduate: "Graduate",
  junior: "Junior",
  analyst: "Analista",
};

export const INDUSTRY_LABELS: Record<string, string> = {
  consulting: "Consultoría",
  banking: "Banca y finanzas",
  tech: "Tecnología",
  industrial: "Industria e ingeniería",
  marketing: "Marketing",
  sales: "Ventas",
  operations: "Operaciones y RRHH",
  other: "Otras",
};

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
export const SOURCES: Record<string, { name: string; url: string }> = {
  remotive: { name: "Remotive", url: "https://remotive.com" },
  jobicy: { name: "Jobicy", url: "https://jobicy.com" },
  adzuna: { name: "Adzuna", url: "https://www.adzuna.es" },
};

export type Filters = {
  industry?: string;
  level?: string;
  city?: string;
  remote?: boolean;
};

type Params = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** Keeps only known values, so nothing from the URL reaches the database query unchecked. */
export function parseFilters(params: Params): Filters {
  const industry = one(params.industria);
  const level = one(params.nivel);
  const city = one(params.ciudad);
  return {
    industry: industry && industry in INDUSTRY_LABELS ? industry : undefined,
    level: level && level in LEVELS ? level : undefined,
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
