import type { Metadata } from "next";
import {
  formatDate,
  Heading,
  Page,
  Prose,
  ReviewedBy,
  ROUTES,
  SourceList,
  uiMdxComponents,
} from "@/components/ui";
import type { MDXComponents } from "mdx/types";
import { notFound } from "next/navigation";
import { CopyLink } from "@/components/guide/CopyLink";
import { GuideHero } from "@/components/guide/GuideHero";
import { GuideToc } from "@/components/guide/GuideToc";
import { extractHeadings, makeSlugger, readingMinutes, textOf } from "@/components/guide/headings";
import { PagerCards } from "@/components/guide/PagerCards";
import { ReadingProgress } from "@/components/guide/ReadingProgress";
import { readGuideSource } from "@/components/guide/source";
import guide from "@/components/guide/guide.module.css";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
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

  // Reading aids are derived from the MDX source; the text itself is never touched.
  const source = readGuideSource(industry.slug, page.slug);
  const toc = extractHeadings(source);
  const minutes = readingMinutes(source);
  // Same slugger rules as `extractHeadings`, applied to the rendered headings in document order,
  // so every table-of-contents link has a target (checked in e2e/guide.spec.ts).
  const slugFor = makeSlugger();
  const components: MDXComponents = {
    ...uiMdxComponents,
    h2: (p) => (
      <Heading level="h2" as="h2" id={slugFor(textOf(p.children))}>
        {p.children}
      </Heading>
    ),
  };

  const index = industry.sections.findIndex((s) => s.slug === page.slug);
  const where =
    kind === "segment"
      ? `Segmento de ${industry.title}`
      : `${industry.title} · Sección ${index + 1} de ${industry.sections.length}`;

  return (
    <Page>
      <ReadingProgress />
      <Breadcrumbs
        items={[
          { href: ROUTES.home, label: "Inicio" },
          { href: ROUTES.industries, label: "Industrias" },
          { href: industryHref(industry.slug), label: industry.title },
          { href: pageHref(industry.slug, page.slug), label: page.title },
        ]}
      />

      <div className={guide.layout}>
        <SectionNav industry={industry} current={page.slug} />

        <div className={guide.main}>
          <GuideHero
            slug={industry.slug}
            eyebrow={where}
            title={page.title}
            titleId="titulo"
            lead={page.summary}
            facts={[
              `${minutes} min de lectura`,
              <>
                Revisada el <time dateTime={meta.reviewed_at}>{formatDate(meta.reviewed_at)}</time>
              </>,
            ]}
            actions={<CopyLink />}
          />

          <GuideToc items={toc} variant="compact" />

          <article id="guia-articulo" className={styles.article} aria-labelledby="titulo">
            <Prose>
              <Content components={components} />
            </Prose>

            <footer className={styles.articleFoot}>
              {cited.length ? <SourceList sources={sources} only={cited} /> : null}
              <ReviewedBy reviewer={meta.reviewer} reviewedAt={meta.reviewed_at} />
              <PagerCards prev={prev} next={next} />
              <Related links={related(industry, page)} />
            </footer>
          </article>
        </div>

        <GuideToc items={toc} variant="rail" />
      </div>
    </Page>
  );
}
