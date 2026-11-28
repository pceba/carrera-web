"use client";

import { Button, ButtonLink, Heading, Kicker, Page, Text } from "@/components/ui";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <Page narrow>
      <Kicker>Algo ha fallado</Kicker>
      <Heading level="h1" as="h1">
        Esta página no ha podido cargar
      </Heading>
      <Text>
        Ha sido un fallo nuestro, no tuyo. Vuelve a intentarlo; si sigue igual, prueba más tarde. Lo
        que hayas guardado en este navegador sigue ahí.
      </Text>
      <p style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
        <Button variant="accent" onClick={() => reset()}>
          Reintentar
        </Button>
        <ButtonLink href="/" variant="secondary">
          Ir al inicio
        </ButtonLink>
      </p>
    </Page>
  );
}
