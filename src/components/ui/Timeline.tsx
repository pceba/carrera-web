import type { ReactNode } from "react";
import styles from "./timeline.module.css";

export type TimelineStep = { label: string; title: string; content?: ReactNode };

/** Ordered steps (e.g. a selection process). The label is the "when": "Semana 1", "Fase 2"... */
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className={styles.timeline}>
      {steps.map((s) => (
        <li key={s.title} className={styles.step}>
          <span className={styles.label}>{s.label}</span>
          <h3 className={styles.title}>{s.title}</h3>
          {s.content ? <div className={styles.content}>{s.content}</div> : null}
        </li>
      ))}
    </ol>
  );
}
