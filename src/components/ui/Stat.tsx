import type { ReactNode } from "react";
import styles from "./stat.module.css";

/** A big figure with context. `source` should always say where the number comes from. */
export function Stat({
  value,
  label,
  source,
}: {
  value: string;
  label: string;
  source?: ReactNode;
}) {
  return (
    <figure className={styles.stat}>
      <figcaption className={styles.label}>{label}</figcaption>
      <p className={styles.value}>{value}</p>
      {source ? <p className={styles.source}>{source}</p> : null}
    </figure>
  );
}
