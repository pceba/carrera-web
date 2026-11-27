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
            <Wordmark size="lg" />
          </Link>
          <p className={styles.motto}>
            Guía abierta y gratuita para empezar tu carrera en España. Escrita a mano, con fuentes y
            sin rastreo.
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
          <div className={styles.group}>
            <h2 className={styles.groupTitle}>Proyecto</h2>
            <ul className={styles.list}>
              <li>
                <a href={REPO_URL} className={styles.link} rel="noopener noreferrer">
                  Código en GitHub
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className={styles.base}>
          <p>
            Código con licencia MIT · contenidos CC BY-SA 4.0. Sin cookies de seguimiento. Las
            funciones de IA usan tu propia clave, que no sale de tu navegador.
          </p>
        </div>
      </div>
    </footer>
  );
}
