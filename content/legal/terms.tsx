/**
 * DRAFTED WITH AI, TO BE CHECKED BY PABLO. NOT LEGAL ADVICE.
 * Terms of use. Placeholders: {{CONTROLLER_NAME}}, {{CONTACT_EMAIL}}, {{COMMUNITY_RULES_URL}}.
 */
import Link from "next/link";

export function TermsBody() {
  return (
    <>
      <h2>1. Qué es este servicio</h2>
      <p>
        Este sitio es una guía gratuita, abierta y sin ánimo de lucro para jóvenes que empiezan su
        carrera profesional en España, gestionada por {"{{CONTROLLER_NAME}}"}. Al usarlo aceptas
        estos términos. Si creas una cuenta, los aceptas de forma expresa y guardamos qué versión
        aceptaste.
      </p>

      <h2>2. Es una guía, no asesoramiento</h2>
      <p>
        El contenido es orientativo y educativo. No es asesoramiento profesional, laboral, jurídico,
        fiscal ni financiero, ni garantiza que consigas una entrevista, una oferta o un resultado
        concreto. Citamos fuentes, pero los procesos de selección, las empresas y los salarios
        cambian: comprueba siempre la información oficial antes de decidir.
      </p>

      <h2>3. Sin garantías</h2>
      <p>
        El servicio se ofrece «tal cual», sin garantías de disponibilidad ni de ausencia de errores.
        Puede cambiar, interrumpirse o cerrarse. En la medida permitida por la ley, el responsable
        no responde de daños derivados del uso del sitio; esto no limita derechos que la ley te
        reconoce como consumidor ni la responsabilidad que no pueda excluirse.
      </p>

      <h2>4. Tu cuenta</h2>
      <ul>
        <li>Debes tener 16 años o más y facilitar un año de nacimiento veraz.</li>
        <li>Accedes con un enlace enviado a tu correo; protege el acceso a tu correo.</li>
        <li>
          Puedes descargar tus datos o eliminar tu cuenta cuando quieras desde tu página de cuenta.
        </li>
        <li>
          Podemos suspender o eliminar cuentas que incumplan estos términos o la ley, o que no
          cumplan la edad mínima.
        </li>
      </ul>
      <p>
        Cómo tratamos tus datos está en la{" "}
        <Link href="/legal/privacidad">política de privacidad</Link>.
      </p>

      <h2>5. Uso aceptable</h2>
      <p>No puedes:</p>
      <ul>
        <li>suplantar a otras personas ni dar datos falsos de forma maliciosa;</li>
        <li>intentar acceder a datos de otras personas o saltarte medidas de seguridad;</li>
        <li>sobrecargar el servicio, ni extraerlo de forma masiva y automatizada;</li>
        <li>usar el servicio para acosar, discriminar, estafar o infringir la ley;</li>
        <li>subir o enviar contenido ilícito, ofensivo o que vulnere derechos de terceros.</li>
      </ul>

      <h2>6. Mentores y normas de la comunidad</h2>
      <p>
        El contacto con profesionales (mentores) es voluntario y solo para personas de 18 años o
        más. Los mentores dan su opinión personal; no representan a su empresa ni garantizan
        resultados. Respeta a las personas y no pidas ni compartas datos personales innecesarios.
        Las normas de la comunidad completas estarán en {"{{COMMUNITY_RULES_URL}}"} cuando esta
        función esté activa.
      </p>

      <h2>7. Funciones de IA con tu propia clave</h2>
      <p>
        Las funciones de IA usan tu propia clave, guardada en tu navegador. Los costes y las
        condiciones del proveedor que elijas son cosa tuya. Las respuestas de la IA pueden ser
        incorrectas: verifícalas.
      </p>

      <h2>8. Licencias y propiedad intelectual</h2>
      <ul>
        <li>
          <strong>Código:</strong> licencia MIT.
        </li>
        <li>
          <strong>Contenido de la guía</strong> (carpeta <code>content/</code>): licencia{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.es">
            Creative Commons Atribución-CompartirIgual 4.0
          </a>
          . Puedes copiarlo y adaptarlo citando la autoría y compartiendo bajo la misma licencia.
        </li>
        <li>
          Los nombres y marcas de empresas que aparecen pertenecen a sus titulares y se citan solo
          con fines informativos; no hay vinculación ni patrocinio.
        </li>
      </ul>

      <h2>9. Enlaces a terceros</h2>
      <p>
        Enlazamos a páginas externas (empresas, convocatorias, fuentes). No controlamos su contenido
        ni sus políticas.
      </p>

      <h2>10. Cambios, ley aplicable</h2>
      <p>
        Podemos actualizar estos términos; indicaremos la nueva versión y fecha, y te lo diremos en
        la cuenta si el cambio es relevante. Se rigen por la ley española. Si eres consumidor,
        conservas los derechos y los tribunales que te correspondan por ley. Contacto:{" "}
        {"{{CONTACT_EMAIL}}"}.
      </p>
    </>
  );
}
