/**
 * DRAFTED WITH AI, TO BE CHECKED BY PABLO. NOT LEGAL ADVICE.
 * Cookies policy. List ONLY what the code sets: the Supabase auth session cookies (@supabase/ssr),
 * set only after sign-in. No analytics, no ads. Update this if that ever changes.
 */
import Link from "next/link";

export function CookiesBody() {
  return (
    <>
      <h2>Qué son las cookies</h2>
      <p>
        Son pequeños archivos que un sitio guarda en tu navegador. Algunos son imprescindibles para
        que el sitio funcione; otros sirven para medir o personalizar.
      </p>

      <h2>Qué cookies usamos</h2>
      <p>
        Solo usamos cookies <strong>estrictamente necesarias</strong>. Si no inicias sesión, no
        guardamos ninguna.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Para qué</th>
            <th>Cuándo</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>sb-…-auth-token</code> (puede estar partida en varias)
            </td>
            <td>Mantener tu sesión iniciada (Supabase Auth)</td>
            <td>Solo después de entrar con tu enlace</td>
            <td>Sesión; se renueva mientras uses la cuenta y se borra al cerrar sesión</td>
          </tr>
        </tbody>
      </table>

      <h2>Por qué no hay banner de cookies</h2>
      <p>
        La normativa (art. 22.2 LSSI y guía de la AEPD) exige pedir consentimiento solo para cookies
        que no son necesarias. La cookie de sesión es técnica y necesaria para prestar el servicio
        que solicitas al iniciar sesión, así que está exenta. No usamos analítica, publicidad ni
        cookies de terceros, por eso no mostramos banner. Si algún día las añadimos, pediremos tu
        consentimiento antes y actualizaremos esta página.
      </p>

      <h2>Almacenamiento local de tu navegador</h2>
      <p>
        Las funciones de IA guardan tu clave en el almacenamiento local de tu navegador, no en
        nuestros servidores (ver <Link href="/legal/privacidad">privacidad</Link>). Solo existe si
        tú la introduces, y puedes borrarla cuando quieras.
      </p>

      <h2>Cómo borrarlas</h2>
      <p>
        Cierra sesión desde tu cuenta o borra las cookies desde los ajustes de tu navegador. Tendrás
        que volver a entrar.
      </p>
    </>
  );
}
