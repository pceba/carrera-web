import type { Industry } from "@/lib/generated/Industry";
import { localDate } from "./derive";
import { STAGE_LABELS, type Application } from "./types";

export interface Stats {
  total: number;
  /** Sent and still open: enviada, pruebas or entrevista. */
  inProgress: number;
  /** Entries that left "Me interesa" (a real application was made). */
  sent: number;
  /** Share of sent entries that reached pruebas, entrevista or oferta; null with nothing sent. */
  responseRate: number | null;
}

/**
 * "Tasa de respuesta" counts progress only (pruebas and beyond). A "descartada" is not counted as a
 * response because the user may have discarded it themselves.
 */
export function computeStats(items: readonly Application[]): Stats {
  const sent = items.filter((a) => a.stage !== "interes");
  const responded = sent.filter(
    (a) => a.stage === "pruebas" || a.stage === "entrevista" || a.stage === "oferta",
  );
  return {
    total: items.length,
    inProgress: items.filter(
      (a) => a.stage === "enviada" || a.stage === "pruebas" || a.stage === "entrevista",
    ).length,
    sent: sent.length,
    responseRate: sent.length === 0 ? null : Math.round((responded.length / sent.length) * 100),
  };
}

export type SectorFilter = "all" | "none" | Industry;

export function filterBySector(items: Application[], filter: SectorFilter): Application[] {
  if (filter === "all") return items;
  if (filter === "none") return items.filter((a) => a.industry === null);
  return items.filter((a) => a.industry === filter);
}

export type Deadline = "overdue" | "week" | null;

/** Open entries only: past dates are "overdue", today through the next 7 days are "this week". */
export function deadlineStatus(a: Application, today: string): Deadline {
  if (!a.next_step_on || a.stage === "descartada" || a.stage === "oferta") return null;
  if (a.next_step_on < today) return "overdue";
  const end = new Date(`${today}T00:00:00`);
  end.setDate(end.getDate() + 7);
  return a.next_step_on <= localDate(end) ? "week" : null;
}

/** Spreadsheets run text starting with these as formulas; a leading apostrophe defuses it. */
function csvCell(value: string | null): string {
  let text = value ?? "";
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const CSV_HEADER = [
  "Empresa",
  "Sector",
  "Puesto",
  "Fase",
  "Fecha de envío",
  "Próximo paso",
  "Fecha del paso",
  "Enlace",
  "Notas",
];

export function toCsv(items: readonly Application[], sectorLabel: (i: Industry) => string): string {
  const rows = items.map((a) =>
    [
      a.firm,
      a.industry ? sectorLabel(a.industry) : null,
      a.role,
      STAGE_LABELS[a.stage],
      a.applied_on,
      a.next_step,
      a.next_step_on,
      a.url,
      a.notes,
    ]
      .map(csvCell)
      .join(","),
  );
  return [CSV_HEADER.join(","), ...rows].join("\r\n") + "\r\n";
}

const icsEscape = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const compact = (iso: string) => iso.replace(/-/g, "");

function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** One all-day event per dated next step of an open entry; null when there is none. */
export function nextStepsIcs(items: readonly Application[], stamp = new Date()): string | null {
  const dated = items.filter((a) => a.next_step_on && a.stage !== "descartada");
  if (dated.length === 0) return null;
  const dtstamp = stamp
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Path//Candidaturas//ES",
    "CALSCALE:GREGORIAN",
  ];
  for (const a of dated) {
    const date = a.next_step_on!;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${a.id}-${compact(date)}@path`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${compact(date)}`,
      `DTEND;VALUE=DATE:${compact(nextDay(date))}`,
      `SUMMARY:${icsEscape(`${a.firm}: ${a.next_step ?? "Próximo paso"}`)}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
