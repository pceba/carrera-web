import Link from "next/link";
import { formatDate } from "@/components/ui";
import { getIndustry, RESOURCE_TYPES, resourcesFor, type Resource } from "../../../content/catalog";
import styles from "./nav.module.css";

const typeLabel = (t: Resource["type"]) => RESOURCE_TYPES.find((r) => r.slug === t)?.one ?? t;

/** A plain list of resources from the catalogue. Filters are optional; empty -> a short note. */
export function ResourceList({
  industry,
  type,
  prep,
  showIndustry = false,
}: {
  industry?: string;
  type?: string;
  prep?: string;
  showIndustry?: boolean;
}) {
  const items = resourcesFor({ industry, type, prep });
  if (!items.length) {
    return <p className={styles.empty}>Todavía no hay recursos revisados con estos filtros.</p>;
  }
  return (
    <ul className={styles.resources}>
      {items.map((r) => {
        const internal = r.url.startsWith("/");
        const meta = [
          typeLabel(r.type),
          r.publisher,
          showIndustry ? r.industries.map((s) => getIndustry(s)?.title).join(", ") : null,
        ]
          .filter(Boolean)
          .join(" · ");
        return (
          <li key={r.id} className={styles.resource}>
            <p className={styles.resourceMeta}>{meta}</p>
            <h3 className={styles.resourceTitle}>
              {internal ? (
                <Link href={r.url}>{r.title}</Link>
              ) : (
                <a href={r.url} rel="noopener noreferrer" target="_blank">
                  {r.title}
                  <span className={styles.sr}> (se abre en otra pestaña)</span>
                </a>
              )}
            </h3>
            <p className={styles.resourceNote}>{r.note}</p>
            <p className={styles.resourceChecked}>
              Revisado el <time dateTime={r.checked}>{formatDate(r.checked)}</time>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
