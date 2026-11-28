import Link from "next/link";
import { ROUTES } from "./site-data";
import styles from "./announcement.module.css";

/** Thin mono bar above the header: one announcement, one link. Not sticky. */
export function Announcement() {
  return (
    <div className={styles.bar}>
      <Link href={ROUTES.tracker} className={styles.link}>
        <span className={styles.tag}>Nuevo</span>
        <span className={styles.text}>Tracker de candidaturas</span>
        <span aria-hidden="true" className={styles.arrow}>
          →
        </span>
      </Link>
    </div>
  );
}
