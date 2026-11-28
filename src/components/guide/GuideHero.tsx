import type { ReactNode } from "react";
import type { IndustrySlug } from "../../../content/catalog";
import { CoverArt } from "../marketing/CoverArt";
import { Eyebrow } from "../ui/Typography";
import styles from "./guide.module.css";

/**
 * Hero band of a guide page: eyebrow, the page's h1, its lead, a row of facts and actions, and
 * the industry's cover art. The art is decorative (`aria-hidden` inside CoverArt).
 */
export function GuideHero({
  slug,
  eyebrow,
  title,
  titleId,
  lead,
  facts,
  actions,
}: {
  slug: IndustrySlug;
  eyebrow: ReactNode;
  title: string;
  titleId?: string;
  lead: string;
  /** Short facts shown as a row of mono chips ("7 min de lectura"). */
  facts?: ReactNode[];
  actions?: ReactNode;
}) {
  return (
    <header className={styles.hero}>
      <div className={styles.heroText}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 id={titleId} className={styles.heroTitle}>
          {title}
        </h1>
        <p className={styles.heroLead}>{lead}</p>
        {facts?.length ? (
          <ul className={styles.facts}>
            {facts.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        ) : null}
        {actions ? <div className={styles.heroActions}>{actions}</div> : null}
      </div>
      <div className={styles.heroArt}>
        <CoverArt slug={slug} />
      </div>
    </header>
  );
}
