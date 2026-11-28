import type { Metadata } from "next";
import { Encaje } from "@/components/match/Encaje";
import { Heading, Kicker, Page } from "@/components/ui";
import { fetchPostings } from "@/lib/postings/query";
import { createClient } from "@/lib/supabase/server";
import styles from "../../(account)/account.module.css";

export const metadata: Metadata = {
  title: "Tu encaje",
  description:
    "Sube tu CV, lo leemos en tu navegador y te ordenamos las ofertas. Sin cuenta y sin subir nada.",
};

/** Whether a session exists. Never blocks the page: Encaje works for everyone. */
async function isSignedIn(): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data } = await supabase.auth.getUser();
  return Boolean(data.user);
}

export default async function EncajePage() {
  const [postings, signedIn] = await Promise.all([fetchPostings({}), isSignedIn()]);
  return (
    <Page narrow>
      <header className={styles.intro}>
        <Kicker>Herramienta</Kicker>
        <Heading level="h1">Tu encaje</Heading>
        <p className={styles.lead}>
          Sube tu CV, revisa lo que detectamos y mira qué ofertas te convienen mirar primero. No
          necesitas cuenta.
        </p>
      </header>
      <Encaje postings={postings} signedIn={signedIn} />
    </Page>
  );
}
