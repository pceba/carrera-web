import type { Metadata } from "next";
import Link from "next/link";
import { Heading, Page, ROUTES, Text } from "@/components/ui";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { ResourceList } from "@/components/nav/ResourceList";
import { INDUSTRIES, RESOURCE_TYPES } from "../../../../content/catalog";
import styles from "./recursos.module.css";

export const metadata: Metadata = {
  title: "Recursos",
  description:
    "Webs oficiales, guías y material para practicar, con la fecha en que los revisamos.",
};

type Search = Promise<{ industria?: string | string[]; tipo?: string | string[] }>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Filter URL that keeps the other filter. A null value clears that filter. */
function href(industria: string | null, tipo: string | null) {
  const q = new URLSearchParams();
  if (industria) q.set("industria", industria);
  if (tipo) q.set("tipo", tipo);
  const s = q.toString();
  return s ? `${ROUTES.resources}?${s}` : ROUTES.resources;
}

export default async function ResourcesPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  // Unknown values are ignored instead of producing an empty page nobody can explain.
  const industria = INDUSTRIES.find((i) => i.slug === first(sp.industria))?.slug ?? null;
  const tipo = RESOURCE_TYPES.find((t) => t.slug === first(sp.tipo))?.slug ?? null;

  return (
    <Page>
      <Breadcrumbs
        items={[
          { href: ROUTES.home, label: "Inicio" },
          { href: ROUTES.resources, label: "Recursos" },
        ]}
      />
      <header className={styles.head}>
        <Heading level="display">Recursos</Heading>
        <Text variant="lead">
          Material para prepararte, con la fecha en que una persona abrió cada enlace por última
          vez.
        </Text>
      </header>

      <nav aria-label="Filtros" className={styles.filters}>
        <FilterGroup
          id="filtro-industria"
          label="Industria"
          allHref={href(null, tipo)}
          active={industria}
          options={INDUSTRIES.map((i) => ({
            key: i.slug,
            label: i.title,
            href: href(i.slug, tipo),
          }))}
        />
        <FilterGroup
          id="filtro-tipo"
          label="Tipo"
          allHref={href(industria, null)}
          active={tipo}
          options={RESOURCE_TYPES.map((t) => ({
            key: t.slug,
            label: t.label,
            href: href(industria, t.slug),
          }))}
        />
      </nav>

      <div className={styles.results}>
        <ResourceList industry={industria ?? undefined} type={tipo ?? undefined} showIndustry />
        {industria || tipo ? (
          <p>
            <Link href={ROUTES.resources} className={styles.clear}>
              Quitar los filtros
            </Link>
          </p>
        ) : null}
      </div>
    </Page>
  );
}

function FilterGroup({
  id,
  label,
  allHref,
  active,
  options,
}: {
  id: string;
  label: string;
  allHref: string;
  active: string | null;
  options: { key: string; label: string; href: string }[];
}) {
  return (
    <div className={styles.group}>
      <p className={styles.groupLabel} id={id}>
        {label}
      </p>
      <ul className={styles.chips} aria-labelledby={id}>
        <li>
          <Link href={allHref} className={styles.chip} aria-current={active ? undefined : "true"}>
            Todas
          </Link>
        </li>
        {options.map((o) => (
          <li key={o.key}>
            <Link
              href={o.href}
              className={styles.chip}
              aria-current={active === o.key ? "true" : undefined}
            >
              {o.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
