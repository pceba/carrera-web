import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./form.module.css";

/** Label + control + optional hint, stacked. The control must carry the same `id`. */
export function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children}
      {hint ? (
        <p className={styles.hint} id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={styles.input} />;
}

/** Checkbox with its label as a single 44 px tap row. */
export function Checkbox({
  children,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { children: ReactNode }) {
  return (
    <label className={styles.check}>
      <input type="checkbox" {...rest} />
      <span>{children}</span>
    </label>
  );
}

/** Grouped fields with a visible legend. */
export function Fieldset({ legend, children }: { legend: ReactNode; children: ReactNode }) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      {children}
    </fieldset>
  );
}

/** Form feedback. "alert" interrupts screen readers; "status" is polite. */
export function Notice({
  tone = "status",
  children,
}: {
  tone?: "status" | "alert";
  children: ReactNode;
}) {
  return (
    <p role={tone} className={`${styles.notice} ${tone === "alert" ? styles.alert : ""}`}>
      {children}
    </p>
  );
}

/** A bordered panel that holds one form or one group of account actions. */
export function Panel({
  title,
  tone,
  children,
}: {
  title?: ReactNode;
  tone?: "danger";
  children: ReactNode;
}) {
  return (
    <section className={`${styles.panel} ${tone === "danger" ? styles.danger : ""}`}>
      {title ? <h2 className={styles.panelTitle}>{title}</h2> : null}
      {children}
    </section>
  );
}
