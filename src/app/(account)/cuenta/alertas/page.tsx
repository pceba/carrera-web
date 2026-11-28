import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button, Checkbox, Heading, Kicker, Notice, Page, Panel, Tag, Text } from "@/components/ui";
import { DeleteSubscription } from "@/components/alerts/DeleteSubscription";
import { PreferencesForm, type FormValues } from "@/components/alerts/PreferencesForm";
import { toUiIndustry } from "@/lib/alerts/industries";
import {
  deleteSubscription,
  giveConsent,
  setActive,
  subscribe,
  updatePreferences,
} from "./actions";
import styles from "@/components/alerts/alerts.module.css";

export const metadata: Metadata = { title: "Avisos por email", robots: { index: false } };

const ERRORS: Record<string, string> = {
  consentimiento: "Marca la casilla para activar los avisos.",
  datos:
    "Revisa las preferencias: elige al menos una industria y respeta los límites de cada lista.",
  guardar: "No hemos podido guardar los cambios. Inténtalo de nuevo.",
};
const DONE: Record<string, string> = {
  guardado: "Guardado.",
  pausada: "Avisos en pausa. No recibirás emails hasta que los reanudes.",
  reanudada: "Avisos reanudados.",
  eliminada: "Suscripción eliminada.",
};

type Search = Promise<Record<string, string | undefined>>;

export default async function AlertasPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const supabase = await createClient();
  if (!supabase) redirect("/entrar?error=config");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/entrar?next=/cuenta/alertas");

  const { data: sub } = await supabase
    .from("alert_subscriptions")
    .select("industries, roles, skills, locations, remote, active")
    .maybeSingle();

  const live = process.env.ALERTS_LIVE === "true";
  const error = sp.error ? (ERRORS[sp.error] ?? null) : null;
  const done = Object.keys(DONE).find((k) => sp[k]);

  const initial: FormValues = {
    industries: (sub?.industries ?? []).flatMap((i: string) => toUiIndustry(i) ?? []),
    roles: (sub?.roles ?? []).join(", "),
    skills: (sub?.skills ?? []).join(", "),
    locations: (sub?.locations ?? []).join(", "),
    remote: (sub?.remote as FormValues["remote"]) ?? "any",
  };

  return (
    <Page narrow>
      <Kicker>Cuenta</Kicker>
      <Heading level="h1" as="h1">
        Avisos por email
      </Heading>
      <Text>
        Te escribimos como máximo una vez al día, solo si hay ofertas nuevas que encajan con lo que
        buscas. Cada email lleva un enlace para darte de baja con un clic.
      </Text>

      <div className={styles.stack}>
        {!live ? <Notice>Los envíos aún están en pruebas.</Notice> : null}
        {error ? <Notice tone="alert">{error}</Notice> : null}
        {done ? <Notice>{DONE[done]}</Notice> : null}

        {sub ? (
          <>
            <Panel title="Estado">
              <p>
                <Tag tone={sub.active ? "success" : "muted"}>
                  {sub.active ? "Activa" : "En pausa"}
                </Tag>
              </p>
              <form action={setActive} className={styles.actions}>
                <input type="hidden" name="active" value={sub.active ? "false" : "true"} />
                <Button type="submit" variant="secondary">
                  {sub.active ? "Pausar avisos" : "Reanudar avisos"}
                </Button>
              </form>
            </Panel>
            <Panel title="Qué quieres recibir">
              <PreferencesForm
                action={updatePreferences}
                initial={initial}
                prefillFromProfile={false}
                submitLabel="Guardar cambios"
              />
            </Panel>
            <Panel title="Eliminar">
              <p>Borra tu suscripción y tus preferencias de avisos.</p>
              <DeleteSubscription action={deleteSubscription} />
            </Panel>
          </>
        ) : sp.paso === "2" ? (
          <Panel title="Paso 2: qué quieres recibir">
            <PreferencesForm
              action={subscribe}
              initial={initial}
              prefillFromProfile
              submitLabel="Activar avisos"
            />
          </Panel>
        ) : (
          <Panel title="Paso 1: tu permiso">
            <ul className={styles.points}>
              <li>Un email al día como máximo, y solo con ofertas nuevas que encajan.</li>
              <li>Usamos únicamente tus preferencias de aviso, nunca tu CV.</li>
              <li>Puedes pausar o borrar la suscripción cuando quieras.</li>
            </ul>
            <form action={giveConsent} className={styles.form}>
              <Checkbox name="opt_in" required>
                Quiero recibir avisos por email con ofertas nuevas.
              </Checkbox>
              <div className={styles.actions}>
                <Button type="submit">Continuar</Button>
              </div>
            </form>
          </Panel>
        )}
      </div>
    </Page>
  );
}
