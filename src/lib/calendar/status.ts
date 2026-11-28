import { STATUS_LABELS, type Programme, type Status } from "./types";

export const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Status from today's ISO date (`YYYY-MM-DD`). A row with no dates is never guessed. */
export function statusOf(p: Pick<Programme, "opens" | "closes">, today: string): Status {
  const { opens, closes } = p;
  if (!opens && !closes) return "nodates";
  if (closes && today > closes) return "closed";
  if (opens && today < opens) return "soon";
  return "open";
}

export function statusLabel(s: Status): string {
  return STATUS_LABELS[s];
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${MONTHS_ES[m! - 1]} de ${y}`;
}

export function todayIso(now = new Date()): string {
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${mm}-${dd}`;
}

/** Group dated rows by the month their window starts (or closes, if only that is known). */
export function groupByMonth(
  rows: Programme[],
): { key: string; label: string; rows: Programme[] }[] {
  const map = new Map<string, Programme[]>();
  for (const r of rows) {
    const key = (r.opens ?? r.closes)!.slice(0, 7);
    map.set(key, [...(map.get(key) ?? []), r]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => {
      const [y, m] = key.split("-").map(Number);
      return { key, label: `${MONTHS_ES[m! - 1]} ${y}`, rows: items };
    });
}
