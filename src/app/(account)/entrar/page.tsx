import type { Metadata } from "next";
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
import { requestMagicLink } from "./actions";
import styles from "../account.module.css";

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
    <Page>
      <div className={styles.split}>
        <header className={styles.intro}>
          <Kicker>Tu cuenta</Kicker>
          <Heading level="display">Entrar</Heading>
          <p className={styles.lead}>
            Toda la guía es pública. La cuenta solo sirve para guardar tu progreso, recibir alertas
            de ofertas y practicar con tu propia clave de IA.
          </p>
          <ul className={styles.points}>
            <li>Sin contraseñas: te mandamos un enlace de un solo uso.</li>
            <li>Solo pedimos tu año de nacimiento para comprobar la edad mínima (16).</li>
            <li>Puedes descargar o borrar tus datos cuando quieras.</li>
          </ul>
        </header>

        <Panel>
          {enviado ? (
            <Notice>
              Si el correo es válido, te hemos enviado un enlace para entrar. Ábrelo en este mismo
              navegador. Caduca en poco tiempo.
            </Notice>
          ) : (
            <form action={requestMagicLink} className={styles.form}>
              {error && ERRORS[error] ? <Notice tone="alert">{ERRORS[error]}</Notice> : null}
              <input type="hidden" name="next" value={next ?? "/cuenta"} />
              <Field id="email" label="Correo electrónico">
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </Field>
              <Fieldset legend="¿Primera vez? Crea tu cuenta">
                <p className={styles.note}>
                  Si ya tienes cuenta, deja estos campos vacíos. Solo pedimos tu año de nacimiento
                  para comprobar la edad mínima; no guardamos tu fecha completa.
                </p>
                <Field id="birth_year" label="Año de nacimiento">
                  <Input
                    id="birth_year"
                    name="birth_year"
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={4}
                    autoComplete="bday-year"
                  />
                </Field>
                <Checkbox name="age_ok">Confirmo que tengo 16 años o más</Checkbox>
              </Fieldset>
              <div className={styles.actions}>
                <Button type="submit">Enviarme el enlace</Button>
              </div>
              <p className={styles.note}>
                No usamos contraseñas: te mandamos un enlace de un solo uso.
              </p>
            </form>
          )}
        </Panel>
      </div>
    </Page>
  );
}
