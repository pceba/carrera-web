import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Button,
  ButtonLink,
  Field,
  Heading,
  Input,
  Kicker,
  Notice,
  Page,
  Panel,
  Tag,
} from "@/components/ui";
import { EncajeCard } from "@/components/account/EncajeCard";
import { groupByStage, localDate, upcomingSteps } from "@/lib/tracker/derive";
import { STAGES, type Application } from "@/lib/tracker/types";
import ui from "@/components/account/account-ui.module.css";
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

  // Both reads are RLS-scoped to this user. A failure (e.g. a table not migrated yet) shows the
  // empty state instead of breaking the hub.
  const { data: appRows } = await supabase
    .from("applications")
    .select("id, firm, stage, next_step, next_step_on");
  const apps = (appRows ?? []) as unknown as Application[];
  const byStage = groupByStage(apps);
  const upcoming = upcomingSteps(apps, localDate());
  const { data: alerts } = await supabase
    .from("alert_subscriptions")
    .select("active")
    .maybeSingle();
  const greeting = profile.display_name ? `Hola, ${profile.display_name}` : "Hola";

  return (
    <Page>
      <header className={styles.intro}>
        <Kicker>Mi Path</Kicker>
        <Heading level="h1">{greeting}</Heading>
        <p className={styles.lead}>Sesión iniciada como {auth.user.email}.</p>
      </header>

      {guardado ? <Notice>Cambios guardados.</Notice> : null}
      {error && MESSAGES[error] ? <Notice tone="alert">{MESSAGES[error]}</Notice> : null}

      <div className={ui.grid}>
        <section className={`${ui.card} ${ui.wide}`} aria-labelledby="hub-cand">
          <h2 id="hub-cand" className={ui.cardTitle}>
            Candidaturas
          </h2>
          {apps.length === 0 ? (
            <>
              <p>
                Aún no has añadido ninguna. Apunta a qué empresas te presentas y qué toca hacer cada
                semana.
              </p>
              <div>
                <ButtonLink href="/candidaturas">Añadir la primera</ButtonLink>
              </div>
            </>
          ) : (
            <>
              <ul className={ui.counts}>
                {STAGES.map((s) => (
                  <li key={s.slug}>
                    <strong>{byStage[s.slug].length}</strong>
                    {s.label}
                  </li>
                ))}
              </ul>
              {upcoming.length > 0 ? (
                <ul className={ui.list} aria-label="Próximos 14 días">
                  {upcoming.slice(0, 4).map((a) => (
                    <li key={a.id}>
                      <span className={ui.mono}>{a.next_step_on}</span> <strong>{a.firm}</strong>:{" "}
                      {a.next_step ?? "Próximo paso"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={ui.muted}>Sin pasos fechados en los próximos 14 días.</p>
              )}
              <div>
                <ButtonLink href="/candidaturas" variant="secondary">
                  Abrir mi tablero
                </ButtonLink>
              </div>
            </>
          )}
        </section>

        <section className={ui.card} aria-labelledby="hub-alertas">
          <h2 id="hub-alertas" className={ui.cardTitle}>
            Alertas
          </h2>
          {alerts ? (
            <p>
              <Tag tone={alerts.active ? "success" : "muted"}>
                {alerts.active ? "Activas" : "En pausa"}
              </Tag>
            </p>
          ) : (
            <p>Recibe un email al día como máximo, solo con ofertas nuevas que encajan contigo.</p>
          )}
          <div>
            <ButtonLink href="/cuenta/alertas" variant="secondary">
              {alerts ? "Gestionar alertas" : "Activar alertas"}
            </ButtonLink>
          </div>
        </section>

        <EncajeCard />

        <section className={ui.card} aria-labelledby="hub-diag">
          <h2 id="hub-diag" className={ui.cardTitle}>
            Diagnóstico
          </h2>
          <p>Ocho preguntas para ver qué industria encaja mejor contigo.</p>
          <div>
            <ButtonLink href="/diagnostico" variant="secondary">
              Hacer el diagnóstico
            </ButtonLink>
          </div>
        </section>

        <section className={ui.card} aria-labelledby="hub-cal">
          <h2 id="hub-cal" className={ui.cardTitle}>
            Calendario
          </h2>
          <p>Cuándo abren y cierran los programas de las empresas.</p>
          <div>
            <ButtonLink href="/calendario" variant="secondary">
              Ver el calendario
            </ButtonLink>
          </div>
        </section>

        <section className={`${ui.card} ${ui.wide}`} aria-labelledby="hub-datos">
          <h2 id="hub-datos" className={ui.cardTitle}>
            Tus datos
          </h2>
          <p>Descarga una copia de todo lo que guardamos sobre ti, o cierra la sesión.</p>
          <div className={ui.row}>
            <a href="/cuenta/exportar" className={styles.download}>
              Descargar mis datos (JSON)
            </a>
            <form action={signOut}>
              <Button type="submit" variant="secondary">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </section>
      </div>

      <div className={styles.stack}>
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
