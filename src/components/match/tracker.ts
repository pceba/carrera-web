import { loadLocal, newId, saveLocal } from "@/lib/tracker/store";
import type { Application } from "@/lib/tracker/types";
import type { Posting } from "@/lib/postings/types";

export type AddResult = "added" | "exists" | "failed";

/** Adds a ranked posting to the browser-local tracker as stage `interes`. Never overwrites. */
export function addPostingToTracker(p: Posting): AddResult {
  const items = loadLocal();
  if (items.some((a) => a.url === p.source_url)) return "exists";
  const now = new Date().toISOString();
  const app: Application = {
    id: newId(),
    firm: p.company.slice(0, 120),
    industry: p.industry,
    role: p.title.slice(0, 120),
    stage: "interes",
    applied_on: null,
    next_step: null,
    next_step_on: null,
    url: p.source_url.slice(0, 500),
    notes: null,
    created_at: now,
    updated_at: now,
  };
  return saveLocal([...items, app]) ? "added" : "failed";
}
