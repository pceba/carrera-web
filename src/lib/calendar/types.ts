import type { IndustrySlug } from "../../../content/catalog";

export const PROGRAMMES = ["internship", "graduate", "off-cycle"] as const;
export type ProgrammeKind = (typeof PROGRAMMES)[number];

export const PROGRAMME_LABELS: Record<ProgrammeKind, string> = {
  internship: "Prácticas",
  graduate: "Graduate",
  "off-cycle": "Off-cycle",
};

export interface Programme {
  firm: string;
  industry: IndustrySlug;
  programme: ProgrammeKind;
  /** ISO dates, only when the official page states them. */
  opens: string | null;
  closes: string | null;
  status_note: string;
  source_url: string;
  checked_at: string;
}

export interface ProgrammeFile {
  reviewer: string;
  reviewed_at: string;
  next_review: string;
  sources: string[];
  programmes: Programme[];
}

export type Status = "open" | "soon" | "closed" | "nodates";

export const STATUS_LABELS: Record<Status, string> = {
  open: "Abierto ahora",
  soon: "Próximamente",
  closed: "Cerrado",
  nodates: "Sin fechas",
};
