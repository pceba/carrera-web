import type { Metadata } from "next";
import Link from "next/link";
import { Heading, Page, ROUTES, Text } from "@/components/ui";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { getIndustry, INDUSTRIES, PREP_GUIDES, prepHref } from "../../../../content/catalog";
import styles from "./preparacion.module.css";

export const metadata: Metadata = {
  title: "Preparación",
  description: "Guías de preparación que sirven para varias industrias: entrevistas, pruebas y CV.",
};

export default function PreparationIndex() {
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

      <ul className={styles.list}>
        {PREP_GUIDES.map((g) => (
          <li key={g.slug}>
            <Link href={prepHref(g.slug)} className={styles.row}>
              <span className={styles.rowTitle}>{g.title}</span>
              <span className={styles.rowText}>{g.summary}</span>
              <span className={styles.rowMeta}>
                {g.industries.length === INDUSTRIES.length
                  ? "Todas las industrias"
                  : g.industries.map((s) => getIndustry(s)?.title ?? s).join(" · ")}
                {g.hasContent ? "" : " · En preparación"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
