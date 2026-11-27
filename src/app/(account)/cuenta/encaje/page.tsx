import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchPostings } from "@/lib/postings/query";
import { Encaje } from "@/components/match/Encaje";
import { Heading, Kicker, Page } from "@/components/ui";
import styles from "../../account.module.css";

export const metadata: Metadata = { title: "Tu encaje", robots: { index: false } };

export default async function EncajePage() {
  const supabase = await createClient();
  if (!supabase) redirect("/entrar?error=config");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/entrar");

  const postings = await fetchPostings({});
  return (
    <Page narrow>
      <header className={styles.intro}>
        <Kicker>Tu cuenta</Kicker>
        <Heading level="h1">Tu encaje</Heading>
        <p className={styles.lead}>
          Sube tu CV, revisa lo que detectamos y mira qué ofertas te convienen mirar primero.
        </p>
      </header>
      <Encaje postings={postings} />
    </Page>
  );
}
