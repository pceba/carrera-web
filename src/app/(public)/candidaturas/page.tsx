import type { Metadata } from "next";
import { Heading, Kicker, Page, Text } from "@/components/ui";
import { LocalTracker } from "@/components/tracker/LocalTracker";
import { RemoteTracker } from "@/components/tracker/RemoteTracker";
import { createClient } from "@/lib/supabase/server";
import type { Application } from "@/lib/tracker/types";

export const metadata: Metadata = {
  title: "Mis candidaturas",
  description:
    "Apunta a qué empresas te presentas, en qué fase está cada una y cuál es tu próximo paso. Funciona sin cuenta.",
};

/** Signed-in users get their rows from Supabase (RLS applies); everyone else stays in the browser. */
async function loadRemote(): Promise<Application[] | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, firm, industry, role, stage, applied_on, next_step, next_step_on, url, notes, created_at, updated_at",
    )
    .order("created_at");
  return error ? null : (data as Application[]);
}

export default async function CandidaturasPage() {
  const remote = await loadRemote();
  return (
    <Page>
      <Kicker>Herramienta</Kicker>
      <Heading level="h1" as="h1">
        Mis candidaturas
      </Heading>
      <Text>
        Un tablero sencillo para no perder el hilo de lo que has enviado y lo que toca hacer.
      </Text>
      {remote ? <RemoteTracker initial={remote} /> : <LocalTracker />}
    </Page>
  );
}
