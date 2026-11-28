import type { Industry } from "@/lib/generated/Industry";
import {
  EMPTY_DRAFT,
  INDUSTRY_SLUGS,
  LIMITS,
  STAGE_SLUGS,
  type ApplicationDraft,
  type Stage,
} from "./types";

export type DraftErrors = Partial<Record<keyof ApplicationDraft, string>>;
export type ValidationResult =
  { ok: true; value: ApplicationDraft } | { ok: false; errors: DraftErrors };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/**
 * Validates untrusted input (a form, localStorage, a server-action payload) against the same
 * limits the database enforces. Empty optional fields become `null`.
 */
export function validateDraft(input: unknown): ValidationResult {
  const v = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const errors: DraftErrors = {};

  const optional = (key: "role" | "next_step" | "notes", max: number, label: string) => {
    const text = str(v[key]);
    if (text.length > max) errors[key] = `${label}: máximo ${max} caracteres.`;
    return text === "" ? null : text;
  };
  const date = (key: "applied_on" | "next_step_on") => {
    const text = str(v[key]);
    if (text === "") return null;
    if (!isValidDate(text)) errors[key] = "Fecha no válida.";
    return text;
  };

  const firm = str(v.firm);
  if (firm === "") errors.firm = "Escribe el nombre de la empresa.";
  else if (firm.length > LIMITS.firm) errors.firm = `Empresa: máximo ${LIMITS.firm} caracteres.`;

  const industryRaw = str(v.industry);
  let industry: Industry | null = null;
  if (industryRaw !== "") {
    if (INDUSTRY_SLUGS.includes(industryRaw as Industry)) industry = industryRaw as Industry;
    else errors.industry = "Sector no válido.";
  }

  const stageRaw = str(v.stage) || EMPTY_DRAFT.stage;
  let stage: Stage = EMPTY_DRAFT.stage;
  if (STAGE_SLUGS.includes(stageRaw as Stage)) stage = stageRaw as Stage;
  else errors.stage = "Fase no válida.";

  let url: string | null = null;
  const urlRaw = str(v.url);
  if (urlRaw !== "") {
    if (urlRaw.length > LIMITS.url) errors.url = `Enlace: máximo ${LIMITS.url} caracteres.`;
    else if (!/^https:\/\//i.test(urlRaw) || !URL.canParse(urlRaw))
      errors.url = "El enlace debe empezar por https://";
    else url = urlRaw;
  }

  const value: ApplicationDraft = {
    firm,
    industry,
    role: optional("role", LIMITS.role, "Puesto"),
    stage,
    applied_on: date("applied_on"),
    next_step: optional("next_step", LIMITS.nextStep, "Próximo paso"),
    next_step_on: date("next_step_on"),
    url,
    notes: optional("notes", LIMITS.notes, "Notas"),
  };
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value };
}
