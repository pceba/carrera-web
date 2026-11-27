import Link from "next/link";
import { SITE } from "@/lib/site";
import { ROUTES } from "./site-data";
import styles from "./shell.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div>
          <p className={styles.footerName}>{SITE.name}</p>
          <p className={styles.footerText}>
            Guía abierta y gratuita para empezar tu carrera en España. Código bajo licencia MIT,
            contenidos CC BY-SA 4.0.
          </p>
        </div>
        <nav aria-label="Pie de página">
          <ul className={styles.footerList}>
            <li>
              <Link href={ROUTES.industries}>Industrias</Link>
            </li>
            <li>
              <Link href={ROUTES.privacy}>Privacidad</Link>
            </li>
            <li>
              <Link href={ROUTES.terms}>Términos de uso</Link>
            </li>
          </ul>
        </nav>
        <p className={styles.footerText}>
          Sin cookies de seguimiento. Las funciones de IA usan tu propia clave, que no sale de tu
          navegador.
        </p>
      </div>
    </footer>
  );
}
