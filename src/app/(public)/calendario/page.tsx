import type { Metadata } from "next";
import { CalendarView } from "@/components/calendar/CalendarView";
import { Heading, Kicker, Page, ReviewedBy, SourceList, Text } from "@/components/ui";
import { loadProgrammes } from "@/lib/calendar/programmes";

export const metadata: Metadata = {
  title: "Calendario de procesos",
  description:
    "Cuándo abren los programas de prácticas y graduate de las empresas que cubrimos, según sus webs oficiales.",
};

export default function CalendarioPage() {
  const data = loadProgrammes();
  return (
    <Page>
      <Kicker>Herramienta</Kicker>
      <Heading level="h1" as="h1">
        Calendario de procesos
      </Heading>
      <Text>
        Ventanas de solicitud de prácticas y programas graduate. Solo mostramos una fecha si la web
        oficial de la empresa la publica; si no, lo decimos y te llevamos a la fuente.
      </Text>
      <CalendarView programmes={data.programmes} />
      <ReviewedBy
        reviewer={data.reviewer}
        reviewedAt={data.reviewed_at}
        nextReview={data.next_review}
      />
      <SourceList sources={data.sources.map((url) => ({ title: url, url }))} />
    </Page>
  );
}
