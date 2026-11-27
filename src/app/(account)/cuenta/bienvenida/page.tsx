import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Button,
  Checkbox,
  Field,
  Fieldset,
  Heading,
  Input,
  Kicker,
  Notice,
  Page,
  Panel,
} from "@/components/ui";
import { completeOnboarding } from "../actions";
import styles from "../../account.module.css";

export const metadata: Metadata = { title: "Bienvenida", robots: { index: false } };

export default async function BienvenidaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  if (!supabase) redirect("/entrar?error=config");

  return (
    <Page narrow>
      <header className={styles.intro}>
        <Kicker>Tu cuenta</Kicker>
        <Heading level="h1">Bienvenida</Heading>
        <p className={styles.lead}>
          Cuéntanos un poco para personalizar la guía. Todo es opcional salvo aceptar las
          condiciones.
        </p>
      </header>
      <Panel>
        <form action={completeOnboarding} className={styles.form}>
          {error ? (
            <Notice tone="alert">
              {error === "terminos"
                ? "Para continuar, acepta la política de privacidad y las condiciones."
                : "No hemos podido guardar tus datos. Inténtalo de nuevo."}
            </Notice>
          ) : null}
          <Field id="display_name" label="Cómo quieres que te llamemos">
            <Input id="display_name" name="display_name" maxLength={80} />
          </Field>
          <Field id="degree" label="Estudios">
            <Input id="degree" name="degree" maxLength={120} />
          </Field>
          <Field id="study_year" label="Curso">
            <Input id="study_year" name="study_year" type="number" min={1} max={8} />
          </Field>
          <Field
            id="target_industries"
            label="Sectores que te interesan"
            hint="Separados por comas."
          >
            <Input
              id="target_industries"
              name="target_industries"
              placeholder="consultoria, banca"
              aria-describedby="target_industries-hint"
            />
          </Field>
          <Fieldset legend="Condiciones">
            <Checkbox name="accept_terms" required>
              He leído y acepto la política de privacidad y las condiciones de uso
            </Checkbox>
            <Checkbox name="marketing_opt_in">
              Quiero recibir avisos por correo (opcional; puedes retirarlo cuando quieras)
            </Checkbox>
          </Fieldset>
          <div className={styles.actions}>
            <Button type="submit">Guardar y continuar</Button>
          </div>
        </form>
      </Panel>
    </Page>
  );
}
