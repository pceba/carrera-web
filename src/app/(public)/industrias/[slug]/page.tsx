import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink, formatDate, Page, ROUTES, Tag } from "@/components/ui";
import { CopyLink } from "@/components/guide/CopyLink";
import { GuideHero } from "@/components/guide/GuideHero";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { Related } from "@/components/nav/Related";
import {
  getIndustry,
  INDUSTRIES,
  pageHref,
  related,
  type Industry,
} from "../../../../../content/catalog";
import { loadMeta } from "../_lib/content";
import styles from "../industrias.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const industry = getIndustry((await params).slug);
  return industry ? { title: industry.title, description: industry.line } : {};
}

export default async function IndustryHub({ params }: { params: Promise<{ slug: string }> }) {
  const industry = getIndustry((await params).slug);
  if (!industry) notFound();

  return (
    <Page>
      <Breadcrumbs
        items={[
          { href: ROUTES.home, label: "Inicio" },
          { href: ROUTES.industries, label: "Industrias" },
          { href: `/industrias/${industry.slug}`, label: industry.title },
        ]}
      />
      {industry.status === "live" ? (
        <LiveHub industry={industry} />
      ) : (
        <PreparingHub industry={industry} />
      )}
    </Page>
  );
}

async function LiveHub({ industry }: { industry: Industry }) {
  const { meta, sources } = await loadMeta(industry.slug);
  const start =
    industry.sections.find((s) => s.slug === industry.startHere) ?? industry.sections[0];

  return (
    <>
      <GuideHero
        slug={industry.slug}
        eyebrow="Guía de industria"
        title={industry.title}
        lead={industry.line}
        facts={[
          `${industry.sections.length} secciones`,
          `${sources.length} fuentes`,
          <>
            Revisada el <time dateTime={meta.reviewed_at}>{formatDate(meta.reviewed_at)}</time>
          </>,
          <>
            Próxima revisión <time dateTime={meta.next_review}>{formatDate(meta.next_review)}</time>
          </>,
        ]}
        actions={
          <>
            {start ? (
              <ButtonLink href={pageHref(industry.slug, start.slug)} arrow>
                Empieza por «{start.title}»
              </ButtonLink>
            ) : null}
            <CopyLink />
          </>
        }
      />

      <section aria-labelledby="secciones" className={styles.block}>
        <h2 id="secciones" className={styles.blockTitle}>
          La guía, en orden
        </h2>
        <ol className={styles.toc}>
          {industry.sections.map((s, i) => (
            <li key={s.slug}>
              <Link href={pageHref(industry.slug, s.slug)} className={styles.tocLink}>
                <span className={styles.tocN} aria-hidden="true">
                  {i + 1}
                </span>
                <span className={styles.tocTitle}>{s.title}</span>
                <span className={styles.tocText}>{s.summary}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {industry.segments.length ? (
        <section aria-labelledby="segmentos" className={styles.block}>
          <h2 id="segmentos" className={styles.blockTitle}>
            Segmentos con página propia
          </h2>
          <ul className={styles.toc}>
            {industry.segments.map((s) => (
              <li key={s.slug}>
                <Link href={pageHref(industry.slug, s.slug)} className={styles.tocLink}>
                  <span className={styles.tocN} aria-hidden="true">
                    →
                  </span>
                  <span className={styles.tocTitle}>{s.title}</span>
                  <span className={styles.tocText}>{s.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className={styles.block}>
        <Related links={related(industry)} title="Preparación que comparte con otras industrias" />
      </div>
    </>
  );
}

function PreparingHub({ industry }: { industry: Industry }) {
  return (
    <>
      <GuideHero
        slug={industry.slug}
        eyebrow="En preparación"
        title={industry.title}
        lead={industry.line}
        facts={["Solo publicamos lo que podemos citar"]}
      />
      <p className={styles.hubMeta}>
        <Tag tone="muted">En preparación</Tag> Estamos escribiendo esta guía a partir de fuentes
        oficiales. Solo publicamos lo que podemos citar, así que de momento aquí no hay más. La guía
        de <Link href={ROUTES.consulting}>consultoría</Link> te enseña cómo será.
      </p>
      <div className={styles.block}>
        <Related links={related(industry)} title="Mientras tanto" />
      </div>
    </>
  );
}
