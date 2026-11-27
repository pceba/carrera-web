import type { Metadata } from "next";
import { requestMagicLink } from "./actions";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

const ERRORS: Record<string, string> = {
  email: "Escribe un correo válido.",
  anio: "Escribe tu año de nacimiento con 4 cifras (por ejemplo, 2005).",
  edad: "Hay que tener 16 años o más para crear una cuenta. Toda la guía sigue siendo pública y gratis sin cuenta.",
  config: "El inicio de sesión aún no está configurado en este entorno.",
  servicio: "No hemos podido enviar el enlace. Inténtalo de nuevo en unos minutos.",
};

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; enviado?: string; next?: string }>;
}) {
  const { error, enviado, next } = await searchParams;

  return (
    <main>
      <h1>Entrar</h1>
      {enviado ? (
        <p role="status">
          Si el correo es válido, te hemos enviado un enlace para entrar. Ábrelo en este mismo
          navegador. Caduca en poco tiempo.
        </p>
      ) : (
        <form action={requestMagicLink}>
          {error && ERRORS[error] ? <p role="alert">{ERRORS[error]}</p> : null}
          <input type="hidden" name="next" value={next ?? "/cuenta"} />
          <p>
            <label htmlFor="email">Correo electrónico</label>
            <br />
            <input id="email" name="email" type="email" autoComplete="email" required />
          </p>
          <fieldset>
            <legend>¿Primera vez? Crea tu cuenta</legend>
            <p>
              Si ya tienes cuenta, deja estos campos vacíos. Solo pedimos tu año de nacimiento para
              comprobar la edad mínima; no guardamos tu fecha completa.
            </p>
            <p>
              <label htmlFor="birth_year">Año de nacimiento</label>
              <br />
              <input
                id="birth_year"
                name="birth_year"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                autoComplete="bday-year"
              />
            </p>
            <p>
              <label>
                <input type="checkbox" name="age_ok" /> Confirmo que tengo 16 años o más
              </label>
            </p>
          </fieldset>
          <p>
            <button type="submit">Enviarme el enlace</button>
          </p>
          <p>No usamos contraseñas: te mandamos un enlace de un solo uso.</p>
        </form>
      )}
    </main>
  );
}
