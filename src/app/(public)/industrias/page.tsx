import type { Metadata } from "next";
import Link from "next/link";
import { Heading, Page, Text } from "@/components/ui";
import { INDUSTRIES, industryHref, PREP_GUIDES } from "../../../../content/catalog";
import styles from "./industrias.module.css";

export const metadata: Metadata = {
  title: "Industrias",
  description: "Las seis industrias de la guía, en una línea cada una, y cómo se relacionan.",
};

/** Industries that share preparation guides with `slug`, to explain how the map connects. */
function sharedWith(slug: string): string[] {
  const names = new Set<string>();
  for (const g of PREP_GUIDES) {
    if (!g.industries.some((s) => s === slug)) continue;
    // Guides that apply to every industry say nothing about proximity: skip them.
    if (g.industries.length === INDUSTRIES.length) continue;
    for (const other of g.industries) {
      if (other !== slug) names.add(INDUSTRIES.find((i) => i.slug === other)?.title ?? other);
    }
  }
  return [...names];
}

export default function IndustriesPage() {
  return (
    <Page>
      <header className={styles.hubHead}>
        <Heading level="display">Industrias</Heading>
        <Text variant="lead">
          Seis industrias, cada una con su guía. Las que tienen sello «En preparación» solo muestran
          lo que ya podemos citar.
        </Text>
      </header>

      <section aria-labelledby="mapa" className={styles.block}>
        <h2 id="mapa" className={styles.blockTitle}>
          El mapa
        </h2>
        <ul className={styles.toc}>
          {INDUSTRIES.map((i) => {
            const near = sharedWith(i.slug);
            return (
              <li key={i.slug}>
                <Link href={industryHref(i.slug)} className={styles.tocLink}>
                  <span className={styles.tocTitle}>{i.title}</span>
                  <span className={styles.tocText}>
                    {i.line}
                    {near.length ? ` Comparte preparación con ${near.join(", ")}.` : ""}
                  </span>
                  {i.status === "preparing" ? (
                    <span className={styles.kind}>En preparación</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </Page>
  );
}
