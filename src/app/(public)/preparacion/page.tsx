import type { Metadata } from "next";
import { PrepLibrary, type PrepCard } from "@/components/library/PrepLibrary";
import { Heading, Page, ROUTES, Text } from "@/components/ui";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { getIndustry, INDUSTRIES, PREP_GUIDES, prepHref } from "../../../../content/catalog";
import styles from "./preparacion.module.css";

export const metadata: Metadata = {
  title: "Preparación",
  description: "Guías de preparación que sirven para varias industrias: entrevistas, pruebas y CV.",
};

export default function PreparationIndex() {
  const cards: PrepCard[] = PREP_GUIDES.map((g) => ({
    slug: g.slug,
    href: prepHref(g.slug),
    title: g.title,
    summary: g.summary,
    industries: g.industries,
    where:
      (g.industries.length === INDUSTRIES.length
        ? "Todas las industrias"
        : g.industries.map((s) => getIndustry(s)?.title ?? s).join(" · ")) +
      (g.hasContent ? "" : " · En preparación"),
    ready: g.hasContent,
  }));
  const industries = INDUSTRIES.map((i) => ({ slug: i.slug, title: i.title }));
  return (
    <Page>
      <Breadcrumbs
        items={[
          { href: ROUTES.home, label: "Inicio" },
          { href: ROUTES.prep, label: "Preparación" },
        ]}
      />
      <header className={styles.head}>
        <Heading level="display">Preparación</Heading>
        <Text variant="lead">
          Lo que se prepara una vez y sirve en varias industrias. Cada guía dice dónde se usa.
        </Text>
      </header>

      <PrepLibrary cards={cards} industries={industries} />
    </Page>
  );
}
