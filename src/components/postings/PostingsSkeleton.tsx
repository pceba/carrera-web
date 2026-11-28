import styles from "./postings.module.css";

/** Placeholder cards for `loading.tsx`: same grid as the real list, so nothing jumps. */
export function PostingsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-label="Cargando ofertas" className={styles.skelWrap}>
      <ul className={styles.list} aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className={`${styles.card} ${styles.skel}`}>
            <span className={styles.skelLine} style={{ inlineSize: "40%" }} />
            <span className={styles.skelLine} style={{ inlineSize: "85%", blockSize: "1.5rem" }} />
            <span className={styles.skelLine} style={{ inlineSize: "55%" }} />
            <span className={styles.skelLine} style={{ inlineSize: "30%" }} />
          </li>
        ))}
      </ul>
      <span className={styles.sr}>Cargando ofertas…</span>
    </div>
  );
}
