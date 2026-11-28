import type { Metadata } from "next";
import { Heading, Kicker, Page, Text } from "@/components/ui";
import { Onboarding } from "@/components/onboarding/Onboarding";

export const metadata: Metadata = {
  title: "Empieza aquí",
  description:
    "Un camino de cuatro pasos para empezar: diagnóstico, guía de tu industria, Encaje y tu primera candidatura. Todo en tu navegador.",
};

export default function EmpezarPage() {
  return (
    <Page narrow>
      <Kicker>Empieza aquí</Kicker>
      <Heading level="h1" as="h1">
        Cuatro pasos para arrancar
      </Heading>
      <Text>
        Sigue el orden o salta al que te sirva. Marcamos lo que detectamos en este navegador; lo
        demás lo marcas tú. No hay cuenta ni se envía nada.
      </Text>
      <Onboarding />
    </Page>
  );
}
