import Link from "next/link";
import { industryHref, pageHref, type Industry } from "../../../content/catalog";
import styles from "./nav.module.css";

/**
 * Where you are inside an industry guide. Desktop: a sticky list beside the content. Phones: one
 * compact disclosure ("Sección 3 de 7") above the content. Pure HTML: no JavaScript needed.
 * Only one of the two is displayed at a time, so assistive tech sees a single navigation.
 */
export function SectionNav({ industry, current }: { industry: Industry; current: string }) {
  const all = [...industry.sections, ...industry.segments];
  const here = all.find((p) => p.slug === current);
  const index = industry.sections.findIndex((s) => s.slug === current);

  const list = (
    <>
      <ol className={styles.sectionList}>
        <li>
          <Link
            href={industryHref(industry.slug)}
            aria-current={current === "" ? "page" : undefined}
          >
            Resumen
          </Link>
        </li>
        {industry.sections.map((s) => (
          <li key={s.slug}>
            <Link
              href={pageHref(industry.slug, s.slug)}
              aria-current={s.slug === current ? "page" : undefined}
            >
              {s.title}
            </Link>
          </li>
        ))}
      </ol>
      {industry.segments.length ? (
        <>
          <p className={styles.sectionGroup}>Segmentos</p>
          <ul className={styles.sectionList}>
            {industry.segments.map((s) => (
              <li key={s.slug}>
                <Link
                  href={pageHref(industry.slug, s.slug)}
                  aria-current={s.slug === current ? "page" : undefined}
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );

  return (
    <>
      <nav aria-label="En esta guía" className={styles.sectionRail}>
        <p className={styles.sectionHome}>
          <Link href={industryHref(industry.slug)}>{industry.title}</Link>
        </p>
        {list}
      </nav>

      <nav aria-label="En esta guía" className={styles.sectionCompact}>
        <details>
          <summary>
            <span className={styles.compactWhere}>
              {here?.title ?? "Resumen"}
              <span className={styles.compactCount}>
                {index >= 0
                  ? ` · ${index + 1} de ${industry.sections.length}`
                  : here
                    ? " · segmento"
                    : ""}
              </span>
            </span>
            <span className={styles.compactHint}>Secciones</span>
          </summary>
          {list}
        </details>
      </nav>
    </>
  );
}
