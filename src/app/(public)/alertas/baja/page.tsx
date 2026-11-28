import type { Metadata } from "next";
import { ButtonLink, Heading, Kicker, Notice, Page, Text } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { isToken } from "@/lib/alerts/validate";

export const metadata: Metadata = {
  title: "Darse de baja de los avisos",
  robots: { index: false },
};

type Search = Promise<{ token?: string | string[] }>;

/**
 * One click from the email link, no sign-in. The unguessable token is the credential. The answer is
 * the same whether the token matched, was already used or never existed, so it reveals nothing.
 */
export default async function BajaPage({ searchParams }: { searchParams: Search }) {
  const { token } = await searchParams;
  let failed = false;
  if (isToken(token)) {
    const supabase = await createClient();
    if (!supabase) failed = true;
    else {
      const { error } = await supabase.rpc("unsubscribe_alerts", { token });
      failed = !!error;
    }
  }

  return (
    <Page narrow>
      <Kicker>Avisos por email</Kicker>
      <Heading level="h1" as="h1">
        {failed ? "No hemos podido procesarlo" : "Listo, te hemos dado de baja"}
      </Heading>
      {failed ? (
        <Notice tone="alert">
          Algo ha fallado por nuestra parte. Inténtalo de nuevo en un rato.
        </Notice>
      ) : (
        <Text>
          Si este enlace correspondía a una suscripción activa, ya no recibirás más avisos. Puedes
          volver a activarlos cuando quieras desde tu cuenta.
        </Text>
      )}
      <ButtonLink href="/" variant="secondary">
        Volver al inicio
      </ButtonLink>
    </Page>
  );
}
