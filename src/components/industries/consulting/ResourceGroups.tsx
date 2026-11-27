import Link from "next/link";
import { formatDate } from "@/components/ui";
import { RESOURCE_TYPES, resourcesFor } from "../../../../content/catalog";
import styles from "./resources.module.css";

/** Order shown on the page: practice first, then guides, then official sites. */
const ORDER = ["casos", "guia", "web-oficial"];

/**
 * Consulting resources grouped by type. Compact on phones: one collapsible group per type, the
 * first open, one title + short note per item. The review date is shown once per group.
 */
export function ResourceGroups({ industry }: { industry: string }) {
  const all = resourcesFor({ industry });
  const groups = RESOURCE_TYPES.map((t) => ({
    ...t,
    items: all.filter((r) => r.type === t.slug),
  }))
    .filter((g) => g.items.length)
    .sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug));

  if (!groups.length) return <p>Todavía no hay recursos revisados.</p>;

  return (
    <div className={styles.groups}>
      {groups.map((g, i) => {
        const checked = g.items.map((r) => r.checked).sort()[0] ?? "";
        return (
          <details key={g.slug} className={styles.group} open={i === 0}>
            <summary className={styles.summary}>
              {g.label} <span className={styles.count}>({g.items.length})</span>
            </summary>
            <ul className={styles.list}>
              {g.items.map((r) => (
                <li key={r.id} className={styles.item}>
                  <p className={styles.title}>
                    {r.url.startsWith("/") ? (
                      <Link href={r.url}>{r.title}</Link>
                    ) : (
                      <a href={r.url} rel="noopener noreferrer" target="_blank">
                        {r.title}
                        <span className={styles.sr}> (se abre en otra pestaña)</span>
                      </a>
                    )}
                    <span className={styles.publisher}> · {r.publisher}</span>
                  </p>
                  <p className={styles.note}>{r.note}</p>
                </li>
              ))}
            </ul>
            <p className={styles.checked}>
              Revisado el <time dateTime={checked}>{formatDate(checked)}</time>
            </p>
          </details>
        );
      })}
    </div>
  );
}
