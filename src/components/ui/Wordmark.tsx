import { SITE } from "@/lib/site";
import styles from "./wordmark.module.css";

/**
 * Brand mark: three rising steps (the first rungs of a career) plus the site name set in the
 * display serif. The name comes from SITE.name, so renaming the project is a one-line change.
 */
export function Wordmark({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className={`${styles.wordmark} ${size === "lg" ? styles.lg : ""}`}>
      <svg className={styles.mark} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="1" y="15" width="7" height="8" rx="1" className={styles.step} />
        <rect x="8.5" y="9" width="7" height="14" rx="1" className={styles.step} />
        <rect x="16" y="2" width="7" height="21" rx="1" className={styles.top} />
      </svg>
      <span className={styles.name}>{SITE.name}</span>
    </span>
  );
}
