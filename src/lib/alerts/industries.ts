/**
 * The site's industry slugs (Spanish, as in `content/catalog.ts`) against the values the
 * `alert_subscriptions` table and the Rust matcher use (English). One tested place for the mapping.
 */
export const ALERT_INDUSTRIES = [
  { ui: "consultoria", db: "consulting", label: "Consultoría" },
  { ui: "inteligencia-artificial", db: "ai", label: "Roles de IA" },
  { ui: "data-science", db: "data-science", label: "Data science" },
  { ui: "private-equity", db: "private-equity", label: "Private equity" },
  { ui: "banca-de-inversion", db: "investment-banking", label: "Banca de inversión" },
  { ui: "big-law", db: "big-law", label: "Big Law" },
] as const;

export type DbIndustry = (typeof ALERT_INDUSTRIES)[number]["db"];

/** UI slug (or an already-English value, as the Encaje profile stores) to the DB value. */
export function toDbIndustry(value: string): DbIndustry | null {
  const hit = ALERT_INDUSTRIES.find((i) => i.ui === value || i.db === value);
  return hit ? hit.db : null;
}

/** DB value (or UI slug) to the UI slug used by the form checkboxes. */
export function toUiIndustry(value: string): string | null {
  const hit = ALERT_INDUSTRIES.find((i) => i.ui === value || i.db === value);
  return hit ? hit.ui : null;
}

/** Maps a list, drops unknown values and duplicates, keeps the user's order. */
export function toDbIndustries(values: readonly string[]): DbIndustry[] {
  const out: DbIndustry[] = [];
  for (const v of values) {
    const db = toDbIndustry(v);
    if (db && !out.includes(db)) out.push(db);
  }
  return out;
}
