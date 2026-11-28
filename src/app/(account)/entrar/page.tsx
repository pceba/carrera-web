import type { Metadata } from "next";
import Link from "next/link";
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
import { AuthTabs } from "@/components/account/AuthTabs";
import ui from "@/components/account/account-ui.module.css";
import { requestMagicLink } from "./actions";
import styles from "../account.module.css";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

const ERRORS: Record<string, string> = {
  email: "Escribe un correo válido.",
  anio: "Escribe tu año de nacimiento con 4 cifras (por ejemplo, 2005).",
  edad: "Hay que tener 16 años o más para crear una cuenta. Toda la guía sigue siendo pública y gratis sin cuenta.",
  config: "El inicio de sesión aún no está configurado en este entorno.",
  servicio: "No hemos podido enviar el enlace. Inténtalo de nuevo en unos minutos.",
  limite: "Hemos enviado demasiados enlaces en poco tiempo. Espera una hora y vuelve a probar.",
};

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; enviado?: string; next?: string; modo?: string }>;
}) {
  const { error, enviado, next, modo } = await searchParams;
  const mode = modo === "crear" ? "crear" : "entrar";
  const creating = mode === "crear";

  return (
    <Page>
      <div className={styles.split}>
        <header className={styles.intro}>
          <Kicker>Tu cuenta</Kicker>
          <Heading level="display">{creating ? "Crear cuenta" : "Entrar"}</Heading>
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
          <AuthTabs mode={mode} next={next} />
          {enviado ? (
            <div className={styles.form}>
              <Notice>
                Si el correo es válido, te hemos enviado un enlace para{" "}
                {creating ? "crear tu cuenta" : "entrar"}.
              </Notice>
              <ul className={ui.tips}>
                <li>Mira también en spam o en correo no deseado.</li>
                <li>El enlace vale aproximadamente una hora y solo funciona una vez.</li>
                <li>Ábrelo en este mismo navegador.</li>
                {creating ? null : (
                  <li>
                    Si no llega nada, quizá aún no tienes cuenta:{" "}
                    <Link href="/entrar?modo=crear">crea una</Link>.
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <form action={requestMagicLink} className={styles.form}>
              {error && ERRORS[error] ? <Notice tone="alert">{ERRORS[error]}</Notice> : null}
              <input type="hidden" name="next" value={next ?? "/cuenta"} />
              <input type="hidden" name="mode" value={mode} />
              <Field id="email" label="Correo electrónico">
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </Field>
              {creating ? (
                <Fieldset legend="Edad mínima">
                  <p className={styles.note}>
                    Solo pedimos tu año de nacimiento para comprobar la edad mínima; no guardamos tu
                    fecha completa.
                  </p>
                  <Field id="birth_year" label="Año de nacimiento">
                    <Input
                      id="birth_year"
                      name="birth_year"
                      inputMode="numeric"
                      pattern="\d{4}"
                      maxLength={4}
                      autoComplete="bday-year"
                      required
                    />
                  </Field>
                  <Checkbox name="age_ok" required>
                    Confirmo que tengo 16 años o más
                  </Checkbox>
                </Fieldset>
              ) : null}
              <div className={styles.actions}>
                <Button type="submit">{creating ? "Crear mi cuenta" : "Enviarme el enlace"}</Button>
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
