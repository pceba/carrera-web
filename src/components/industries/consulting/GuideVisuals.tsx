import type { ReactNode } from "react";
import type { TimelineStep } from "@/components/ui";
import styles from "./guide-visuals.module.css";

/**
 * Consulting-specific renderings of content that lives in content/industrias/consultoria.
 * They only change the presentation: titles, labels and citations come from the MDX as written.
 */

/** The career ladder: steps rise left to right on desktop and bottom to top on phones. */
export function CareerLadder({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className={styles.ladder} aria-label="Escalera de carrera">
      {steps.map((s, i) => (
        <li key={s.title} className={styles.rung} style={{ "--i": i } as React.CSSProperties}>
          <div className={styles.rungCard}>
            <p className={styles.rungLabel}>
              {s.label}
              {i === 0 ? <span className={styles.entry}>Entras aquí</span> : null}
            </p>
            <h3 className={styles.rungTitle}>{s.title}</h3>
            {s.content ? <div className={styles.rungText}>{s.content}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

/** An example week laid out on a Monday-to-Friday grid ("Martes-miércoles" spans two days). */
export function WeekPlan({ steps }: { steps: TimelineStep[] }) {
  // First grid column of each step: 1 + the days spanned by the steps before it.
  const spans = steps.map((s) => s.label.split("-").length);
  const starts = spans.map((_, i) => 1 + spans.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <div className={styles.week}>
      <div className={styles.weekDays} aria-hidden="true">
        {DAYS.map((d) => (
          <span key={d}>{d.slice(0, 3)}</span>
        ))}
      </div>
      <ol className={styles.weekList}>
        {steps.map((s, i) => {
          const style = {
            "--day-col": `${starts[i]} / span ${spans[i]}`,
          } as React.CSSProperties;
          return (
            <li key={s.title} className={styles.day} style={style}>
              <p className={styles.dayLabel}>{s.label}</p>
              <h3 className={styles.dayTitle}>
                <span className={styles.dayN} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.title}
              </h3>
              {s.content ? <div className={styles.dayText}>{s.content}</div> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export type CalendarEvent = {
  id: string;
  title: string;
  /** Months 1-12 of `year`. A deadline has from === to. */
  from: number;
  to: number;
  kind: "plazo" | "programa";
  detail: ReactNode;
};

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Published recruiting dates on a 12-month axis, plus the ones with no fixed month. */
export function RecruitingCalendar({
  year,
  events,
  undated = [],
}: {
  year: number;
  events: CalendarEvent[];
  undated?: { id: string; title: string; detail: ReactNode }[];
}) {
  return (
    <figure className={styles.calendar}>
      <figcaption className={styles.calCaption}>
        <span className={styles.calYear}>{year}</span>
        Fechas publicadas por las firmas (ejemplos confirmados)
      </figcaption>
      <div className={styles.calGrid}>
        <div className={styles.calMonths} aria-hidden="true">
          {MONTHS.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <ol className={styles.calEvents}>
          {events.map((e) => (
            <li key={e.id} className={styles.calEvent}>
              <div
                className={`${styles.calBar} ${e.kind === "plazo" ? styles.calDeadline : ""}`}
                style={{ gridColumn: `${e.from} / ${e.to + 1}` } as React.CSSProperties}
                aria-hidden="true"
              />
              <div className={styles.calText}>
                <p className={styles.calWhen}>
                  {e.kind === "plazo" ? "Cierre de plazo · " : "Programa · "}
                  {e.from === e.to
                    ? `${MONTHS[e.from - 1]} ${year}`
                    : `${MONTHS[e.from - 1]}–${MONTHS[e.to - 1]} ${year}`}
                </p>
                <h3 className={styles.calTitle}>{e.title}</h3>
                <div className={styles.calDetail}>{e.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
      {undated.length ? (
        <div className={styles.calUndated}>
          <p className={styles.calWhen}>Sin mes fijo</p>
          <ul>
            {undated.map((u) => (
              <li key={u.id}>
                <h3 className={styles.calTitle}>{u.title}</h3>
                <div className={styles.calDetail}>{u.detail}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </figure>
  );
}
