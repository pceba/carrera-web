import type { ReactNode } from "react";
import styles from "./window.module.css";

/**
 * A product window: rounded frame, fake title bar with an address label. Purely presentational;
 * what goes inside decides its own semantics (mockups inside are `aria-hidden`).
 */
export function WindowFrame({
  address,
  children,
  className,
}: {
  /** Text in the fake address bar, e.g. `path.app/encaje`. Decorative. */
  address: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.frame} ${className ?? ""}`}>
      <div className={styles.bar} aria-hidden="true">
        <span className={styles.dots}>
          <i />
          <i />
          <i />
        </span>
        <span className={styles.address}>{address}</span>
        <span className={styles.spacer} />
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
