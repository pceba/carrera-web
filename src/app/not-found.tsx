import type { Metadata } from "next";
import { ButtonLink, Heading, Kicker, Page, ROUTES, Shell, Text } from "@/components/ui";

export const metadata: Metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return (
    <Shell>
      <Page narrow>
        <Kicker>Error 404</Kicker>
        <Heading level="h1" as="h1">
          No encontramos esa página
        </Heading>
        <Text>
          Puede que el enlace esté mal escrito o que la página se haya movido. Pulsa Ctrl+K (⌘K en
          Mac) para buscar por toda la web, o empieza por una de estas herramientas.
        </Text>
        <p style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <ButtonLink href={ROUTES.home} variant="accent">
            Ir al inicio
          </ButtonLink>
          <ButtonLink href={ROUTES.industries} variant="secondary">
            Industrias
          </ButtonLink>
          <ButtonLink href={ROUTES.diagnostic} variant="secondary">
            Diagnóstico
          </ButtonLink>
          <ButtonLink href={ROUTES.tracker} variant="secondary">
            Candidaturas
          </ButtonLink>
        </p>
      </Page>
    </Shell>
  );
}
