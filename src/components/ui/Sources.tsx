import type { ReactNode } from "react";
import styles from "./sources.module.css";

export type Source = { title: string; url: string; publisher?: string; accessed?: string };

/** Inline superscript pointing at a numbered source, e.g. <Cite n={1} />. */
export function Cite({ n }: { n: number }) {
  return (
    <sup className={styles.cite}>
      <a href={`#fuente-${n}`} aria-label={`Fuente ${n}`}>
        [{n}]
      </a>
    </sup>
  );
}

/** Numbered list of sources. Every factual claim in `content/` must end up here (AGENTS.md rule 8). */
export function SourceList({
  sources,
  title = "Fuentes",
  only,
}: {
  sources: Source[];
  title?: string;
  /** 1-based numbers to show (e.g. the ones cited on this page). Numbers stay as in `sources`. */
  only?: readonly number[];
}) {
  const rows = sources
    .map((s, i) => ({ s, n: i + 1 }))
    .filter(({ n }) => !only || only.includes(n));
  return (
    <section className={styles.sources} aria-label={title}>
      <h2 className={styles.heading}>{title}</h2>
      <ol className={styles.list}>
        {rows.map(({ s, n }) => (
          <li key={`${n}-${s.url}`} id={`fuente-${n}`} data-n={n}>
            <a href={s.url} rel="noopener noreferrer" target="_blank">
              {s.title}
            </a>
            {s.publisher || s.accessed ? (
              <span className={styles.meta}>
                {" "}
                {[s.publisher, s.accessed ? `consultado ${formatDate(s.accessed)}` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** "Revisado por X el DD/MM/AAAA" badge; dates are ISO strings from front matter. */
export function ReviewedBy({
  reviewer,
  reviewedAt,
  nextReview,
}: {
  reviewer: string;
  reviewedAt: string;
  nextReview?: string;
}): ReactNode {
  return (
    <p className={styles.reviewed}>
      <span aria-hidden="true" className={styles.seal}>
        ✓
      </span>
      <span>
        Revisado por <strong>{reviewer}</strong> el{" "}
        <time dateTime={reviewedAt}>{formatDate(reviewedAt)}</time>
        {nextReview ? (
          <>
            {" "}
            · próxima revisión <time dateTime={nextReview}>{formatDate(nextReview)}</time>
          </>
        ) : null}
      </span>
    </p>
  );
}

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Deterministic es-ES date (no Intl, so server and client always agree). */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}
