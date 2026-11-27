import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Encaje } from "@/components/match/Encaje";
import { SAMPLE_POSTINGS } from "@/components/match/sample-postings";
import { Heading, Kicker, Page, Shell } from "@/components/ui";
import { fetchPostings } from "@/lib/postings/query";
import styles from "../../(account)/account.module.css";

export const metadata: Metadata = { title: "Tu encaje (desarrollo)", robots: { index: false } };

/** Same screen as `/cuenta/encaje` but without a session, for local work and e2e. Not in production. */
export default async function DevEncajePage() {
  if (process.env.NODE_ENV === "production") notFound();
  const live = await fetchPostings({});
  return (
    <Shell>
      <Page narrow>
        <header className={styles.intro}>
          <Kicker>Desarrollo</Kicker>
          <Heading level="h1">Tu encaje</Heading>
          <p className={styles.lead}>
            Sube tu CV, revisa lo que detectamos y mira qué ofertas te convienen mirar primero.
          </p>
        </header>
        <Encaje postings={live.length ? live : SAMPLE_POSTINGS} />
      </Page>
    </Shell>
  );
}
