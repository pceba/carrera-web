import Link from "next/link";
import type { Link as CatalogLink } from "../../../content/catalog";
import styles from "./nav.module.css";

/** Previous / next along the reading path. */
export function PrevNext({ prev, next }: { prev?: CatalogLink; next?: CatalogLink }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="Anterior y siguiente" className={styles.prevNext}>
      {prev ? (
        <Link href={prev.href} rel="prev" className={styles.prev}>
          <span className={styles.pnLabel}>
            <span aria-hidden="true">←</span> Anterior
          </span>
          <span className={styles.pnTitle}>{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} rel="next" className={styles.next}>
          <span className={styles.pnLabel}>
            Siguiente <span aria-hidden="true">→</span>
          </span>
          <span className={styles.pnTitle}>{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
