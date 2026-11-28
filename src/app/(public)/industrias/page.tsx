import type { Metadata } from "next";
import { Eyebrow, Page, Reveal } from "@/components/ui";
import { IndustryCard } from "@/components/marketing/IndustryCard";
import { IndustryFilter } from "@/components/marketing/IndustryFilter";
import { INDUSTRIES, PREP_GUIDES } from "../../../../content/catalog";
import styles from "./hub.module.css";

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
  // Guides that exist come first.
  const ordered = [...INDUSTRIES].sort(
    (a, b) => Number(b.status === "live") - Number(a.status === "live"),
  );
  const items = ordered.map((i) => {
    const near = sharedWith(i.slug);
    return {
      slug: i.slug,
      status: i.status,
      card: (
        <IndustryCard
          industry={i}
          note={near.length ? `Comparte preparación con ${near.join(", ")}.` : undefined}
        />
      ),
    };
  });

  return (
    <Page>
      <header className={styles.head}>
        <Eyebrow>El mapa</Eyebrow>
        <h1 className={styles.title}>Seis industrias, cada una con su guía.</h1>
        <p className={styles.lead}>
          Las que tienen sello «En preparación» solo muestran lo que ya podemos citar. Las demás
          tienen guía completa, con fuentes y fecha de revisión.
        </p>
      </header>
      <Reveal>
        <section aria-label="Industrias" className={styles.block}>
          <IndustryFilter items={items} />
        </section>
      </Reveal>
    </Page>
  );
}
