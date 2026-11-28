import { loadLocal, newId, saveLocal } from "@/lib/tracker/store";
import type { Application } from "@/lib/tracker/types";
import { INDUSTRIES } from "../../../content/catalog";
import { PROGRAMME_LABELS, type Programme } from "./types";

export type AddResult = "added" | "exists" | "failed";

/** Adds a programme to the browser-local tracker as stage `interes`. Never overwrites. */
export function addToLocalTracker(p: Programme): AddResult {
  const role = `${PROGRAMME_LABELS[p.programme]} (calendario)`;
  const items = loadLocal();
  if (items.some((a) => a.firm === p.firm && a.role === role)) return "exists";
  const now = new Date().toISOString();
  const app: Application = {
    id: newId(),
    firm: p.firm,
    industry: INDUSTRIES.find((i) => i.slug === p.industry)?.rust ?? null,
    role,
    stage: "interes",
    applied_on: null,
    next_step: p.closes ? "Presentar la solicitud" : null,
    next_step_on: p.closes,
    url: p.source_url,
    notes: null,
    created_at: now,
    updated_at: now,
  };
  return saveLocal([...items, app]) ? "added" : "failed";
}
