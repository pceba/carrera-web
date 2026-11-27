import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { completeOnboarding } from "../actions";

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
    <main>
      <h1>Bienvenida</h1>
      <p>
        Cuéntanos un poco para personalizar la guía. Todo es opcional salvo aceptar las condiciones.
      </p>
      {error ? (
        <p role="alert">
          {error === "terminos"
            ? "Para continuar, acepta la política de privacidad y las condiciones."
            : "No hemos podido guardar tus datos. Inténtalo de nuevo."}
        </p>
      ) : null}
      <form action={completeOnboarding}>
        <p>
          <label htmlFor="display_name">Cómo quieres que te llamemos</label>
          <br />
          <input id="display_name" name="display_name" maxLength={80} />
        </p>
        <p>
          <label htmlFor="degree">Estudios</label>
          <br />
          <input id="degree" name="degree" maxLength={120} />
        </p>
        <p>
          <label htmlFor="study_year">Curso</label>
          <br />
          <input id="study_year" name="study_year" type="number" min={1} max={8} />
        </p>
        <p>
          <label htmlFor="target_industries">Sectores que te interesan (separados por comas)</label>
          <br />
          <input id="target_industries" name="target_industries" placeholder="consultoria, banca" />
        </p>
        <p>
          <label>
            <input type="checkbox" name="accept_terms" required /> He leído y acepto la política de
            privacidad y las condiciones de uso
          </label>
        </p>
        <p>
          <label>
            <input type="checkbox" name="marketing_opt_in" /> Quiero recibir avisos por correo
            (opcional; puedes retirarlo cuando quieras)
          </label>
        </p>
        <p>
          <button type="submit">Guardar y continuar</button>
        </p>
      </form>
    </main>
  );
}
