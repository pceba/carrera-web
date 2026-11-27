import Link from "next/link";
import { SITE } from "@/lib/site";
import { ButtonLink } from "./Button";
import { NAV_LINKS, ROUTES } from "./site-data";
import styles from "./shell.module.css";

/** No JS needed: few links, so on phones they wrap under the logo instead of hiding in a menu. */
export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href={ROUTES.home} className={styles.logo}>
          {SITE.name}
        </Link>
        <nav aria-label="Principal" className={styles.nav}>
          <ul className={styles.navList}>
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={styles.navLink}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.headerCta}>
          <ButtonLink href={ROUTES.signUp} variant="secondary">
            Crear cuenta
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
