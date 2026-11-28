import { Eyebrow, Reveal } from "../ui";
import styles from "./logo-wall.module.css";

/**
 * A typographic "logo" wall: the firm names set as wordmarks, no logo files (trademarks, and we
 * have no licensed source). Only firms already named in `content/industrias/*` (the empresas
 * pages and `consultoria/firms.ts`). Greyscale, ink on hover.
 */
type Mark = { name: string; cls: string };

const FIRMS: Mark[] = [
  { name: "McKinsey & Company", cls: "serifless" },
  { name: "BCG", cls: "heavy" },
  { name: "Bain & Company", cls: "tight" },
  { name: "Oliver Wyman", cls: "light" },
  { name: "KPMG", cls: "wide" },
  { name: "Deloitte", cls: "heavy" },
  { name: "EY", cls: "wide" },
  { name: "PwC", cls: "tight" },
  { name: "Accenture", cls: "light" },
  { name: "Santander CIB", cls: "caps" },
  { name: "BBVA CIB", cls: "heavy" },
  { name: "Alantra", cls: "light" },
  { name: "Rothschild & Co", cls: "mono" },
  { name: "Goldman Sachs", cls: "tight" },
  { name: "Uría Menéndez", cls: "light" },
  { name: "Cuatrecasas", cls: "caps" },
  { name: "Garrigues", cls: "heavy" },
  { name: "Freshfields", cls: "mono" },
  { name: "Clifford Chance", cls: "wide" },
  { name: "A&O Shearman", cls: "tight" },
];

export function LogoWall() {
  return (
    <section className={styles.section} aria-label="Empresas que analiza la guía">
      <Reveal>
        <Eyebrow>Empresas que analiza la guía</Eyebrow>
        <ul className={styles.grid}>
          {FIRMS.map((f) => (
            <li key={f.name} className={styles.cell}>
              <span className={`${styles.mark} ${styles[f.cls]}`}>{f.name}</span>
            </li>
          ))}
        </ul>
        <p className={styles.fine}>Path no está afiliado a ninguna de ellas.</p>
      </Reveal>
    </section>
  );
}
