import type { Metadata } from "next";
import { Heading, Kicker, Page, Text } from "@/components/ui";
import { LocalTracker } from "@/components/tracker/LocalTracker";

export const metadata: Metadata = {
  title: "Mis candidaturas",
  description:
    "Apunta a qué empresas te presentas, en qué fase está cada una y cuál es tu próximo paso. Funciona sin cuenta.",
};

export default function CandidaturasPage() {
  return (
    <Page>
      <Kicker>Herramienta</Kicker>
      <Heading level="h1" as="h1">
        Mis candidaturas
      </Heading>
      <Text>
        Un tablero sencillo para no perder el hilo de lo que has enviado y lo que toca hacer.
      </Text>
      <LocalTracker />
    </Page>
  );
}
