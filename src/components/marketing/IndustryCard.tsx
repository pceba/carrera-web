import Link from "next/link";
import { industryHref, type Industry } from "../../../content/catalog";
import { CoverArt } from "./CoverArt";
import styles from "./industry-card.module.css";

/** Mono fact for the card: only what the catalogue itself can count, never an outside number. */
export function industryFact(i: Industry): string {
  const pages = i.sections.length + i.segments.length;
  return i.status === "live" ? `${pages} páginas con fuentes` : "En preparación";
}

/**
 * Industry card: cover art, a mono fact, the name and the one-line description. The whole card is
 * the link (one tab stop). `note` adds a line under the description (the map uses it).
 */
export function IndustryCard({ industry, note }: { industry: Industry; note?: string }) {
  return (
    <Link href={industryHref(industry.slug)} className={styles.card}>
      <span className={styles.art}>
        <CoverArt slug={industry.slug} className={styles.svg} />
      </span>
      <span className={styles.body}>
        <span className={styles.fact} data-live={industry.status === "live" || undefined}>
          {industryFact(industry)}
        </span>
        <span className={styles.name}>{industry.title}</span>
        <span className={styles.line}>{industry.line}</span>
        {note ? <span className={styles.note}>{note}</span> : null}
        <span className={styles.go} aria-hidden="true">
          →
        </span>
      </span>
    </Link>
  );
}
