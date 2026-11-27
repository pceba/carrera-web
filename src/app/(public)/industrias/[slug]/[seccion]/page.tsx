import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Heading,
  Page,
  Prose,
  ReviewedBy,
  ROUTES,
  SourceList,
  Text,
  uiMdxComponents,
} from "@/components/ui";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { PrevNext } from "@/components/nav/PrevNext";
import { Related } from "@/components/nav/Related";
import { SectionNav } from "@/components/nav/SectionNav";
import {
  getIndustry,
  getPage,
  INDUSTRIES,
  industryHref,
  neighbours,
  pageHref,
  related,
} from "../../../../../../content/catalog";
import { citedOn, loadMeta, loadPage } from "../../_lib/content";
import styles from "../../industrias.module.css";

type Params = Promise<{ slug: string; seccion: string }>;

export const dynamicParams = false;

/** Every section and segment of every published industry; the rest 404. */
export function generateStaticParams() {
  return INDUSTRIES.filter((i) => i.status === "live").flatMap((i) =>
    [...i.sections, ...i.segments].map((p) => ({ slug: i.slug, seccion: p.slug })),
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, seccion } = await params;
  const industry = getIndustry(slug);
  const found = industry && getPage(industry, seccion);
  if (!industry || !found) return {};
  return { title: `${found.page.title} · ${industry.title}`, description: found.page.summary };
}

export default async function IndustrySection({ params }: { params: Params }) {
  const { slug, seccion } = await params;
  const industry = getIndustry(slug);
  const found = industry && getPage(industry, seccion);
  if (!industry || !found || industry.status !== "live") notFound();

  const { page, kind } = found;
  const [mod, { meta, sources }] = await Promise.all([
    loadPage(industry.slug, page.slug),
    loadMeta(industry.slug),
  ]);
  const Content = mod.default;
  const cited = citedOn(industry.slug, page.slug, mod);
  const { prev, next } = neighbours(industry, page.slug);

  return (
    <Page>
      <Breadcrumbs
        items={[
          { href: ROUTES.home, label: "Inicio" },
          { href: ROUTES.industries, label: "Industrias" },
          { href: industryHref(industry.slug), label: industry.title },
          { href: pageHref(industry.slug, page.slug), label: page.title },
        ]}
      />

      <div className={styles.guide}>
        <SectionNav industry={industry} current={page.slug} />

        <article className={styles.article} aria-labelledby="titulo">
          <header className={styles.articleHead}>
            {kind === "segment" ? <p className={styles.kind}>Segmento de {industry.title}</p> : null}
            <Heading level="h1" as="h1" id="titulo">
              {page.title}
            </Heading>
            <Text variant="lead">{page.summary}</Text>
          </header>

          <Prose>
            <Content components={uiMdxComponents} />
          </Prose>

          <footer className={styles.articleFoot}>
            {cited.length ? <SourceList sources={sources} only={cited} /> : null}
            <ReviewedBy reviewer={meta.reviewer} reviewedAt={meta.reviewed_at} />
            <PrevNext prev={prev} next={next} />
            <Related links={related(industry, page)} />
          </footer>
        </article>
      </div>
    </Page>
  );
}
