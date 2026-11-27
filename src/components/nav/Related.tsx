import Link from "next/link";
import type { Link as CatalogLink } from "../../../content/catalog";
import styles from "./nav.module.css";

/** Links across industries and preparation guides. Renders nothing when there are none. */
export function Related({
  links,
  title = "Relacionado",
}: {
  links: CatalogLink[];
  title?: string;
}) {
  if (!links.length) return null;
  return (
    <aside aria-label={title} className={styles.related}>
      <h2 className={styles.relatedTitle}>{title}</h2>
      <ul>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href}>{l.title}</Link>
            {l.summary ? <span className={styles.relatedNote}>{l.summary}</span> : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}
