import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Heading, Page, ROUTES, Text } from "@/components/ui";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { Related } from "@/components/nav/Related";
import { ResourceList } from "@/components/nav/ResourceList";
import {
  getIndustry,
  getPrepGuide,
  industryHref,
  PREP_GUIDES,
  pagesForPrep,
  prepHref,
  resourcesFor,
} from "../../../../../content/catalog";
import styles from "../preparacion.module.css";

type Params = Promise<{ guia: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return PREP_GUIDES.map((g) => ({ guia: g.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const guide = getPrepGuide((await params).guia);
  return guide ? { title: guide.title, description: guide.summary } : {};
}

export default async function PreparationGuide({ params }: { params: Params }) {
  const guide = getPrepGuide((await params).guia);
  if (!guide) notFound();

  const industries = guide.industries.flatMap((s) => getIndustry(s) ?? []);
  const pages = pagesForPrep(guide.slug);
  const hasResources = resourcesFor({ prep: guide.slug }).length > 0;
  const others = PREP_GUIDES.filter((g) => g.slug !== guide.slug)
    .slice(0, 4)
    .map((g) => ({ href: prepHref(g.slug), title: g.title, summary: g.summary }));

  return (
    <Page>
      <Breadcrumbs
        items={[
          { href: ROUTES.home, label: "Inicio" },
          { href: ROUTES.prep, label: "Preparación" },
          { href: prepHref(guide.slug), label: guide.title },
        ]}
      />
      <header className={styles.head}>
        {guide.hasContent ? null : <p className={styles.status}>En preparación</p>}
        <Heading level="display">{guide.title}</Heading>
        <Text variant="lead">{guide.summary}</Text>
        {guide.hasContent ? null : (
          <Text variant="muted">
            Estamos escribiendo esta guía a partir de fuentes citables. Hasta entonces, aquí tienes
            dónde se usa y qué material enlazamos.
          </Text>
        )}
      </header>

      <section aria-labelledby="industrias" className={styles.block}>
        <h2 id="industrias" className={styles.blockTitle}>
          Industrias que la usan
        </h2>
        <ul className={styles.chips}>
          {industries.map((i) => (
            <li key={i.slug}>
              <Link href={industryHref(i.slug)} className={styles.chip}>
                {i.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {pages.length ? (
        <section aria-labelledby="paginas" className={styles.block}>
          <h2 id="paginas" className={styles.blockTitle}>
            Dónde la tratan las guías de industria
          </h2>
          <ul className={styles.list}>
            {pages.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className={styles.row}>
                  <span className={styles.rowTitle}>{p.title}</span>
                  <span className={styles.rowText}>{p.summary}</span>
                  <span className={styles.rowMeta}>{p.industry.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasResources ? (
        <section aria-labelledby="recursos" className={styles.block}>
          <h2 id="recursos" className={styles.blockTitle}>
            Recursos para esta preparación
          </h2>
          <ResourceList prep={guide.slug} showIndustry />
        </section>
      ) : null}

      <div className={styles.block}>
        <Related links={others} title="Otras guías de preparación" />
      </div>
    </Page>
  );
}
