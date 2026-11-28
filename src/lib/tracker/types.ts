import type { Industry } from "@/lib/generated/Industry";

/** Stages in board order. The slug is what both localStorage and the DB store. */
export const STAGES = [
  { slug: "interes", label: "Me interesa" },
  { slug: "enviada", label: "Enviada" },
  { slug: "pruebas", label: "Pruebas" },
  { slug: "entrevista", label: "Entrevista" },
  { slug: "oferta", label: "Oferta" },
  { slug: "descartada", label: "Descartada" },
] as const;

export type Stage = (typeof STAGES)[number]["slug"];
export const STAGE_SLUGS: readonly Stage[] = STAGES.map((s) => s.slug);
export const STAGE_LABELS = Object.fromEntries(STAGES.map((s) => [s.slug, s.label])) as Record<
  Stage,
  string
>;

/** The six industries of the site (mirrors `Industry`; the DB check uses the same list). */
export const INDUSTRY_SLUGS: readonly Industry[] = [
  "consulting",
  "ai",
  "data-science",
  "private-equity",
  "investment-banking",
  "big-law",
];

/** Same limits as the `applications` check constraints. */
export const LIMITS = {
  firm: 120,
  role: 120,
  nextStep: 80,
  url: 500,
  notes: 2000,
} as const;

/** What the user types / what is stored, minus bookkeeping. Empty optionals are `null`. */
export interface ApplicationDraft {
  firm: string;
  industry: Industry | null;
  role: string | null;
  stage: Stage;
  applied_on: string | null; // YYYY-MM-DD
  next_step: string | null;
  next_step_on: string | null; // YYYY-MM-DD
  url: string | null;
  notes: string | null;
}

export interface Application extends ApplicationDraft {
  id: string;
  created_at: string;
  updated_at: string;
}

export const EMPTY_DRAFT: ApplicationDraft = {
  firm: "",
  industry: null,
  role: null,
  stage: "interes",
  applied_on: null,
  next_step: null,
  next_step_on: null,
  url: null,
  notes: null,
};
