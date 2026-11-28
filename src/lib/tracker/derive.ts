import { STAGE_SLUGS, type Application, type Stage } from "./types";

export function groupByStage(items: Application[]): Record<Stage, Application[]> {
  const out = Object.fromEntries(STAGE_SLUGS.map((s) => [s, [] as Application[]])) as Record<
    Stage,
    Application[]
  >;
  for (const item of items) out[item.stage].push(item);
  return out;
}

/** YYYY-MM-DD in the user's local time zone (not UTC, so "today" matches their calendar). */
export function localDate(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Next steps dated between `today` and `today + days`, soonest first. Discarded entries are skipped. */
export function upcomingSteps(items: Application[], today: string, days = 14): Application[] {
  const end = new Date(`${today}T00:00:00`);
  end.setDate(end.getDate() + days);
  const limit = localDate(end);
  return items
    .filter(
      (a) =>
        a.next_step_on !== null &&
        a.next_step_on >= today &&
        a.next_step_on <= limit &&
        a.stage !== "descartada",
    )
    .sort((a, b) => (a.next_step_on! < b.next_step_on! ? -1 : 1));
}
