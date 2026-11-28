import Link from "next/link";
import type { Link as CatalogLink } from "../../../content/catalog";
import styles from "./guide.module.css";

/** Previous / next as cards with the page's summary. Same landmark name as the old PrevNext. */
export function PagerCards({ prev, next }: { prev?: CatalogLink; next?: CatalogLink }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="Anterior y siguiente" className={styles.pager}>
      {prev ? (
        <Link href={prev.href} rel="prev" className={`${styles.pagerCard} ${styles.pagerPrev}`}>
          <span className={styles.pagerLabel}>
            <span aria-hidden="true">←</span> Anterior
          </span>
          <span className={styles.pagerTitle}>{prev.title}</span>
          {prev.summary ? <span className={styles.pagerText}>{prev.summary}</span> : null}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} rel="next" className={`${styles.pagerCard} ${styles.pagerNext}`}>
          <span className={styles.pagerLabel}>
            Siguiente <span aria-hidden="true">→</span>
          </span>
          <span className={styles.pagerTitle}>{next.title}</span>
          {next.summary ? <span className={styles.pagerText}>{next.summary}</span> : null}
        </Link>
      ) : null}
    </nav>
  );
}
