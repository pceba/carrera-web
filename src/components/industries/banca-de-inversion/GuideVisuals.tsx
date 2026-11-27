import type { TimelineStep } from "@/components/ui";
import styles from "./guide-visuals.module.css";

/** A deal in four stages, left to right on desktop and top to bottom on phones. */
export function DealFlow({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className={styles.flow} aria-label="Fases de una operación">
      {steps.map((s, i) => (
        <li key={s.title} className={styles.stage}>
          <span className={styles.num} aria-hidden="true">
            {i + 1}
          </span>
          <div>
            <p className={styles.label}>{s.label}</p>
            <h3 className={styles.title}>{s.title}</h3>
            {s.content ? <div className={styles.text}>{s.content}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export type PayColumn = { profile: string; cells: { base: string; bonus: string }[] };

/** Pay ranges: one row per level, one column per profile; base and bonus share a cell. */
export function PayRanges({
  caption,
  levels,
  columns,
}: {
  caption: string;
  levels: string[];
  columns: PayColumn[];
}) {
  return (
    <figure className={styles.pay}>
      <figcaption className={styles.payCaption}>{caption}</figcaption>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Nivel</th>
            {columns.map((c) => (
              <th key={c.profile} scope="col">
                {c.profile}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {levels.map((level, i) => (
            <tr key={level}>
              <th scope="row">{level}</th>
              {columns.map((c) => (
                <td key={c.profile}>
                  {c.cells[i]!.base}
                  <span className={styles.bonus}>{c.cells[i]!.bonus}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
