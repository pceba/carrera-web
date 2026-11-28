import type { Metadata } from "next";
import { Heading, Kicker, Page, Text } from "@/components/ui";
import { Quiz } from "@/components/quiz/Quiz";

export const metadata: Metadata = {
  title: "¿Qué industria encaja contigo?",
  description:
    "Ocho preguntas para orientarte entre consultoría, banca de inversión, Big Law, private equity, data science y roles de IA. Sin cuenta y sin guardar nada.",
};

export default function DiagnosticoPage() {
  return (
    <Page>
      <Kicker>Herramienta</Kicker>
      <Heading level="h1" as="h1">
        ¿Qué industria encaja contigo?
      </Heading>
      <Text>
        Ocho preguntas, un minuto. No guardamos tus respuestas: todo ocurre en tu navegador y no se
        envía nada.
      </Text>
      <Quiz />
    </Page>
  );
}
