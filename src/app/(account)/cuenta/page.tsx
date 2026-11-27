import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, Field, Heading, Input, Kicker, Notice, Page, Panel } from "@/components/ui";
import { deleteAccount, signOut, updateProfile } from "./actions";
import styles from "../account.module.css";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

const MESSAGES: Record<string, string> = {
  guardar: "No hemos podido guardar los cambios.",
  confirmar: "Escribe ELIMINAR para confirmar el borrado.",
  eliminar: "No hemos podido eliminar la cuenta. Inténtalo de nuevo.",
};

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; guardado?: string }>;
}) {
  const { error, guardado } = await searchParams;
  const supabase = await createClient();
  if (!supabase) redirect("/entrar?error=config");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, degree, study_year, target_industries, onboarded_at")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (!profile?.onboarded_at) redirect("/cuenta/bienvenida");

  return (
    <Page narrow>
      <header className={styles.intro}>
        <Kicker>Tu cuenta</Kicker>
        <Heading level="h1">Mi cuenta</Heading>
        <p className={styles.lead}>Sesión iniciada como {auth.user.email}.</p>
      </header>

      <div className={styles.stack}>
        {guardado ? <Notice>Cambios guardados.</Notice> : null}
        {error && MESSAGES[error] ? <Notice tone="alert">{MESSAGES[error]}</Notice> : null}

        <Panel title="Mi perfil">
          <form action={updateProfile} className={styles.form}>
            <Field id="display_name" label="Nombre">
              <Input
                id="display_name"
                name="display_name"
                maxLength={80}
                defaultValue={profile.display_name ?? ""}
              />
            </Field>
            <Field id="degree" label="Estudios">
              <Input
                id="degree"
                name="degree"
                maxLength={120}
                defaultValue={profile.degree ?? ""}
              />
            </Field>
            <Field id="study_year" label="Curso">
              <Input
                id="study_year"
                name="study_year"
                type="number"
                min={1}
                max={8}
                defaultValue={profile.study_year ?? ""}
              />
            </Field>
            <Field id="target_industries" label="Sectores" hint="Separados por comas.">
              <Input
                id="target_industries"
                name="target_industries"
                aria-describedby="target_industries-hint"
                defaultValue={(profile.target_industries ?? []).join(", ")}
              />
            </Field>
            <div className={styles.actions}>
              <Button type="submit">Guardar cambios</Button>
            </div>
          </form>
        </Panel>

        <Panel title="Mis datos">
          <p>Descarga una copia de todo lo que guardamos sobre ti.</p>
          <div className={styles.actions}>
            <a href="/cuenta/exportar" className={styles.download}>
              Descargar mis datos (JSON)
            </a>
          </div>
        </Panel>

        <Panel title="Cerrar sesión">
          <form action={signOut} className={styles.actions}>
            <Button type="submit" variant="secondary">
              Cerrar sesión
            </Button>
          </form>
        </Panel>

        <Panel title="Eliminar mi cuenta" tone="danger">
          <p>
            Se borrarán tu cuenta, tu perfil, tus consentimientos y tus elementos guardados. No se
            puede deshacer.
          </p>
          <form action={deleteAccount} className={styles.form}>
            <Field id="confirm" label="Escribe ELIMINAR para confirmar">
              <Input id="confirm" name="confirm" autoComplete="off" required />
            </Field>
            <div className={styles.actions}>
              <Button type="submit" variant="danger">
                Eliminar mi cuenta definitivamente
              </Button>
            </div>
          </form>
        </Panel>
      </div>
    </Page>
  );
}
