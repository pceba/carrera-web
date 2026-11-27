import type { ReactNode } from "react";
import styles from "./callout.module.css";

const LABELS = { info: "Nota", warning: "Ojo", danger: "Importante", success: "Consejo" } as const;

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: keyof typeof LABELS;
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className={`${styles.callout} ${styles[tone]}`}>
      <p className={styles.title}>{title ?? LABELS[tone]}</p>
      <div className={styles.body}>{children}</div>
    </aside>
  );
}
