import { SITE } from "@/lib/site";
import { PathSymbol } from "./PathSymbol";
import styles from "./wordmark.module.css";

/**
 * Brand mark: the Path symbol plus the lowercase site name in Geist 600. The name comes from
 * SITE.name, so renaming the project is a one-line change.
 */
export function Wordmark({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className={`${styles.wordmark} ${size === "lg" ? styles.lg : ""}`}>
      <PathSymbol />
      <span className={styles.name}>{SITE.name.toLowerCase()}</span>
    </span>
  );
}
