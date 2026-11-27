import Link from "next/link";
import styles from "./nav.module.css";

export type Crumb = { href: string; label: string };

/** "Inicio / Industrias / Consultoría": the last crumb is the current page and is not a link. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Migas de pan" className={styles.crumbs}>
      <ol>
        {items.map((c, i) =>
          i === items.length - 1 ? (
            <li key={c.href}>
              <span aria-current="page">{c.label}</span>
            </li>
          ) : (
            <li key={c.href}>
              <Link href={c.href}>{c.label}</Link>
            </li>
          ),
        )}
      </ol>
    </nav>
  );
}
