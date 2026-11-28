"use client";

import { MODES, type ModeId } from "@/lib/practice/modes";
import styles from "./practice.module.css";

/** Choice of exercise. Radio semantics: one mode at a time. */
export function ModePicker({
  value,
  onChange,
  disabled,
}: {
  value: ModeId;
  onChange: (id: ModeId) => void;
  disabled?: boolean;
}) {
  return (
    <section className={styles.card} aria-labelledby="modo-titulo">
      <h2 id="modo-titulo" className={styles.cardTitle}>
        2. Qué quieres practicar
      </h2>
      <div role="radiogroup" aria-label="Tipo de práctica" className={styles.modes}>
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={m.id === value}
            disabled={disabled}
            className={styles.mode}
            onClick={() => onChange(m.id)}
          >
            <span className={styles.modeTitle}>{m.title}</span>
            <span className={styles.modeText}>{m.summary}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
