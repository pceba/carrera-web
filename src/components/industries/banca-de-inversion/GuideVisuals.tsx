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

export type PayRow = { profile: string; level: string; base: string; bonus: string };

/** Pay ranges by level for one profile; stacks as definition rows, no wide table on phones. */
export function PayRanges({ caption, rows }: { caption: string; rows: PayRow[] }) {
  return (
    <figure className={styles.pay}>
      <figcaption className={styles.payCaption}>{caption}</figcaption>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Nivel</th>
            <th scope="col">Base anual</th>
            <th scope="col">Bonus</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.profile + r.level}>
              <th scope="row">{r.level}</th>
              <td data-label="Base">{r.base}</td>
              <td data-label="Bonus">{r.bonus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
