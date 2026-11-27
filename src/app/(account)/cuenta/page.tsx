import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteAccount, signOut, updateProfile } from "./actions";

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
    <main>
      <h1>Mi cuenta</h1>
      <p>Sesión iniciada como {auth.user.email}.</p>
      {guardado ? <p role="status">Cambios guardados.</p> : null}
      {error && MESSAGES[error] ? <p role="alert">{MESSAGES[error]}</p> : null}

      <h2>Mi perfil</h2>
      <form action={updateProfile}>
        <p>
          <label htmlFor="display_name">Nombre</label>
          <br />
          <input
            id="display_name"
            name="display_name"
            maxLength={80}
            defaultValue={profile.display_name ?? ""}
          />
        </p>
        <p>
          <label htmlFor="degree">Estudios</label>
          <br />
          <input id="degree" name="degree" maxLength={120} defaultValue={profile.degree ?? ""} />
        </p>
        <p>
          <label htmlFor="study_year">Curso</label>
          <br />
          <input
            id="study_year"
            name="study_year"
            type="number"
            min={1}
            max={8}
            defaultValue={profile.study_year ?? ""}
          />
        </p>
        <p>
          <label htmlFor="target_industries">Sectores (separados por comas)</label>
          <br />
          <input
            id="target_industries"
            name="target_industries"
            defaultValue={(profile.target_industries ?? []).join(", ")}
          />
        </p>
        <p>
          <button type="submit">Guardar cambios</button>
        </p>
      </form>

      <h2>Mis datos</h2>
      <p>
        Descarga una copia de todo lo que guardamos sobre ti.{" "}
        <a href="/cuenta/exportar">Descargar mis datos (JSON)</a>
      </p>

      <h2>Cerrar sesión</h2>
      <form action={signOut}>
        <button type="submit">Cerrar sesión</button>
      </form>

      <h2>Eliminar mi cuenta</h2>
      <p>
        Se borrarán tu cuenta, tu perfil, tus consentimientos y tus elementos guardados. No se puede
        deshacer.
      </p>
      <form action={deleteAccount}>
        <p>
          <label htmlFor="confirm">Escribe ELIMINAR para confirmar</label>
          <br />
          <input id="confirm" name="confirm" autoComplete="off" required />
        </p>
        <button type="submit">Eliminar mi cuenta definitivamente</button>
      </form>
    </main>
  );
}
