import type { Metadata } from "next";
import { Heading, Kicker, Page, Text } from "@/components/ui";
import { PostingsBrowser } from "@/components/postings/PostingsBrowser";
import { fetchPostings, PAGE_SIZE } from "@/lib/postings/query";
import { parseFilters } from "@/lib/postings/types";
import styles from "./ofertas.module.css";

export const metadata: Metadata = {
  title: "Ofertas junior",
  description:
    "Prácticas y puestos junior en España, recogidos cada día de fuentes oficiales. Cada oferta enlaza a su anuncio original.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function OffersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const postings = await fetchPostings(filters);
  const query = (first(params.q) ?? "").slice(0, 80);
  const sort = first(params.orden) === "encaje" ? "encaje" : "recientes";

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

      <PostingsBrowser
        postings={postings}
        filters={filters}
        initialQuery={query}
        initialSort={sort}
        pageSize={PAGE_SIZE}
      />

      <p className={styles.note}>
        Recogemos las ofertas por las APIs oficiales de cada fuente, sin rastrear webs. No
        garantizamos que sigan abiertas: confirma siempre en el anuncio original.
      </p>
    </Page>
  );
}
