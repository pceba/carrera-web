import Link from "next/link";
import { FOOTER_GROUPS, REPO_URL, ROUTES } from "./site-data";
import { Wordmark } from "./Wordmark";
import styles from "./footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.lead}>
          <Link href={ROUTES.home} className={styles.brand} aria-label="Inicio">
            <Wordmark />
          </Link>
          <p className={styles.motto}>
            Guía abierta y gratuita para empezar tu carrera en España. Con fuentes y sin rastreo.
          </p>
        </div>

        <nav aria-label="Pie de página" className={styles.groups}>
          {FOOTER_GROUPS.map((g) => (
            <div key={g.title} className={styles.group}>
              <h2 className={styles.groupTitle}>{g.title}</h2>
              <ul className={styles.list}>
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={styles.link}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <p className={styles.base}>
          Código MIT y contenidos CC BY-SA 4.0 ·{" "}
          <a href={REPO_URL} rel="noopener noreferrer">
            Código en GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
