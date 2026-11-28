import type { Programme } from "./types";
import { PROGRAMME_LABELS } from "./types";

const esc = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
const compact = (iso: string) => iso.replace(/-/g, "");

function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * All-day events for the dates the official page states: one for the opening, one for the closing.
 * Returns `null` when the row has no dates (nothing to add).
 */
export function buildIcs(p: Programme, stamp = new Date()): string | null {
  const events: { uid: string; date: string; title: string }[] = [];
  const name = `${p.firm} · ${PROGRAMME_LABELS[p.programme]}`;
  if (p.opens) events.push({ uid: "open", date: p.opens, title: `Abre: ${name}` });
  if (p.closes) events.push({ uid: "close", date: p.closes, title: `Cierra: ${name}` });
  if (events.length === 0) return null;
  const dtstamp = stamp
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const slug = p.firm.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Path//Calendario//ES",
    "CALSCALE:GREGORIAN",
  ];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${slug}-${p.programme}-${e.uid}-${compact(e.date)}@path`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${compact(e.date)}`,
      `DTEND;VALUE=DATE:${compact(nextDay(e.date))}`,
      `SUMMARY:${esc(e.title)}`,
      `DESCRIPTION:${esc(`Fuente oficial: ${p.source_url}`)}`,
      `URL:${p.source_url}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
