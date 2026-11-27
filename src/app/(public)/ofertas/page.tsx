import type { Metadata } from "next";
import { Button, Card, Heading, Kicker, Page, Tag, Text } from "@/components/ui";
import { fetchPostings, PAGE_SIZE } from "@/lib/postings/query";
import {
  CITIES,
  INDUSTRY_LABELS,
  LEVELS,
  parseFilters,
  sourceLabel,
  type Posting,
} from "@/lib/postings/types";
import styles from "./ofertas.module.css";

export const metadata: Metadata = {
  title: "Ofertas junior",
  description:
    "Prácticas y puestos junior en España, recogidos cada día de fuentes oficiales. Cada oferta enlaza a su anuncio original.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function formatPosted(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function Select({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select name={name} defaultValue={value ?? ""}>
        <option value="">Todas</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PostingCard({ p }: { p: Posting }) {
  const src = sourceLabel(p);
  const posted = formatPosted(p.posted_at);
  const where = [
    p.location,
    p.remote && !p.location?.toLowerCase().includes("remot") ? "Remoto" : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Card
      title={p.title}
      headingLevel="h2"
      eyebrow={
        <>
          <Tag tone="accent">{LEVELS[p.level] ?? p.level}</Tag>{" "}
          <Tag>{INDUSTRY_LABELS[p.industry] ?? INDUSTRY_LABELS.other}</Tag>
        </>
      }
      footer={
        <p className={styles.meta}>
          <a
            className={styles.original}
            href={p.source_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            Ver la oferta original
            <span className={styles.sr}> de {p.title} (se abre en otra pestaña)</span>
          </a>
          <span>
            Fuente:{" "}
            {src.url ? (
              <a
                className={p.source === "adzuna" ? styles.adzuna : undefined}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {src.name}
              </a>
            ) : (
              src.name
            )}
            {posted ? ` · ${posted}` : ""}
          </span>
        </p>
      }
    >
      <p className={styles.company}>
        <strong>{p.company}</strong>
        {where ? ` · ${where}` : ""}
      </p>
    </Card>
  );
}

export default async function OffersPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseFilters(await searchParams);
  const postings = await fetchPostings(filters);
  const filtered = Boolean(filters.industry || filters.level || filters.city || filters.remote);

  return (
    <Page>
      <header className={styles.hero}>
        <Kicker>Ofertas</Kicker>
        <Heading level="display">
          Ofertas junior <em>en España</em>
        </Heading>
        <Text variant="lead">
          Prácticas, trainee y puestos junior de webs de empleo oficiales de empresas y de portales
          que permiten mostrar sus anuncios. Se actualizan cada día; cada tarjeta enlaza al anuncio
          original, que es donde se solicita.
        </Text>
      </header>

      <form className={styles.filters} method="get" aria-label="Filtrar ofertas">
        <Select
          name="industria"
          label="Industria"
          value={filters.industry}
          options={Object.entries(INDUSTRY_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <Select
          name="nivel"
          label="Nivel"
          value={filters.level}
          options={Object.entries(LEVELS).map(([value, label]) => ({ value, label }))}
        />
        <Select name="ciudad" label="Ciudad" value={filters.city} options={CITIES} />
        <label className={styles.check}>
          <input type="checkbox" name="remoto" value="1" defaultChecked={filters.remote} />
          <span>Solo remoto</span>
        </label>
        <div className={styles.actions}>
          <Button type="submit" variant="accent">
            Filtrar
          </Button>
          {filtered ? (
            <a className={styles.reset} href="/ofertas">
              Quitar filtros
            </a>
          ) : null}
        </div>
      </form>

      <section className={styles.results} aria-label="Resultados" aria-live="polite">
        {postings.length === 0 ? (
          <Card
            title={filtered ? "Ninguna oferta con esos filtros" : "Aún no hay ofertas"}
            headingLevel="h2"
            muted
          >
            {filtered
              ? "Prueba con menos filtros o quita la ciudad."
              : "Estamos conectando las fuentes. Vuelve en unos días: la lista se rellena sola cada mañana."}
          </Card>
        ) : (
          <>
            <p className={styles.count}>
              {postings.length >= PAGE_SIZE
                ? `Las ${PAGE_SIZE} más recientes`
                : `${postings.length} ${postings.length === 1 ? "oferta" : "ofertas"}`}
            </p>
            <ul className={styles.list}>
              {postings.map((p) => (
                <li key={p.id}>
                  <PostingCard p={p} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <p className={styles.note}>
        Recogemos las ofertas por las APIs oficiales de cada fuente, sin rastrear webs. No
        garantizamos que sigan abiertas: confirma siempre en el anuncio original.
      </p>
    </Page>
  );
}
