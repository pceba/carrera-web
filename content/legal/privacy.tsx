/**
 * DRAFTED WITH AI, TO BE CHECKED BY PABLO. NOT LEGAL ADVICE.
 * Privacy policy (RGPD + LOPDGDD). Must stay accurate to supabase/migrations and the account pages.
 * Placeholders: {{CONTROLLER_NAME}}, {{CONTACT_EMAIL}}.
 */
import Link from "next/link";

export function PrivacyBody() {
  return (
    <>
      <h2>1. Quién es el responsable</h2>
      <p>
        El responsable del tratamiento de tus datos es {"{{CONTROLLER_NAME}}"} (en adelante, «el
        responsable»), persona física que gestiona este proyecto gratuito, abierto y sin ánimo de
        lucro. Puedes escribirle a {"{{CONTACT_EMAIL}}"}. Más datos en el{" "}
        <Link href="/legal/aviso-legal">aviso legal</Link>.
      </p>

      <h2>2. Sin cuenta: qué pasa si solo lees la guía</h2>
      <p>
        Toda la guía es pública. Si no creas una cuenta no te pedimos ningún dato, no usamos
        analítica ni publicidad y no instalamos cookies de seguimiento. Como cualquier servidor web,
        el proveedor de alojamiento (Vercel) puede registrar de forma técnica y temporal datos de
        conexión, como la dirección IP, para servir la página y proteger el servicio.
      </p>

      <h2>3. Qué datos tratamos si creas una cuenta</h2>
      <ul>
        <li>
          <strong>Correo electrónico.</strong> Para enviarte el enlace de acceso (no usamos
          contraseñas) y, si lo aceptas, avisos. Lo guarda el sistema de autenticación.
        </li>
        <li>
          <strong>Año de nacimiento</strong> (solo el año, no la fecha completa). Para comprobar la
          edad mínima de 16 años.
        </li>
        <li>
          <strong>Perfil opcional:</strong> nombre para mostrar (máx. 80 caracteres), estudios (máx.
          120), curso (1 a 8) y hasta 12 industrias de interés.
        </li>
        <li>
          <strong>Aceptaciones:</strong> qué versión de esta política y de los términos aceptaste,
          si marcaste recibir avisos por correo, y la fecha y hora.
        </li>
        <li>
          <strong>Elementos guardados</strong> (ofertas o progreso que marques): una referencia y
          datos mínimos asociados a tu cuenta.
        </li>
        <li>
          <strong>Datos técnicos de la sesión:</strong> la cookie de sesión necesaria para
          mantenerte conectado (ver <Link href="/legal/cookies">cookies</Link>).
        </li>
      </ul>
      <p>
        <strong>No</strong> guardamos tu CV, ni tus claves de IA, ni tu fecha de nacimiento
        completa, ni datos de categorías especiales.
      </p>

      <h2>4. Para qué los usamos y con qué base legal</h2>
      <table>
        <thead>
          <tr>
            <th>Finalidad</th>
            <th>Base legal (RGPD)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              Crear y mantener tu cuenta, enviarte el enlace de acceso, guardar tu perfil y tus
              elementos guardados
            </td>
            <td>Ejecución del servicio que pides (art. 6.1.b)</td>
          </tr>
          <tr>
            <td>Comprobar la edad mínima de 16 años</td>
            <td>
              Obligación legal y interés legítimo en proteger a menores (arts. 6.1.c y 6.1.f; art. 7
              LOPDGDD)
            </td>
          </tr>
          <tr>
            <td>Guardar la prueba de que aceptaste esta política y los términos</td>
            <td>Interés legítimo en poder demostrar el consentimiento (art. 6.1.f)</td>
          </tr>
          <tr>
            <td>Enviarte avisos por correo (por ejemplo, de ofertas)</td>
            <td>Tu consentimiento (art. 6.1.a); puedes retirarlo cuando quieras</td>
          </tr>
          <tr>
            <td>Seguridad y funcionamiento técnico del servicio</td>
            <td>Interés legítimo (art. 6.1.f)</td>
          </tr>
        </tbody>
      </table>
      <p>
        No tomamos decisiones automatizadas sobre ti ni elaboramos perfiles con efectos jurídicos.
        No vendemos ni cedemos tus datos con fines comerciales.
      </p>

      <h2>5. Edad mínima: 16 años</h2>
      <p>
        Para crear una cuenta debes tener 16 años o más. En España, a partir de los 14 años una
        persona puede consentir por sí misma el tratamiento de sus datos (art. 7 LOPDGDD); elegimos
        16 por prudencia, porque el servicio trata de decisiones profesionales y deja abierta la
        posibilidad de contacto con adultos. Lo comprobamos con tu año de nacimiento y con una
        declaración expresa. Si descubrimos una cuenta que no cumple el requisito, la eliminaremos.
        El contacto con mentores está reservado a mayores de 18 años. La guía pública se puede leer
        a cualquier edad.
      </p>

      <h2>6. Quién más ve tus datos (encargados del tratamiento)</h2>
      <p>
        Usamos servicios de terceros que tratan datos por cuenta del responsable, con contrato de
        encargo conforme al art. 28 RGPD:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> (base de datos y autenticación). Proyecto alojado en la Unión
          Europea.
        </li>
        <li>
          <strong>Vercel</strong> (alojamiento de la web). Puede procesar datos de conexión;
          configurado para la región de la UE cuando es posible, aunque la red de entrega puede usar
          nodos fuera de la UE.
        </li>
        <li>
          <strong>Resend</strong> (envío de correos como el enlace de acceso y los avisos).
        </li>
      </ul>
      <p>
        Si alguno de ellos transfiere datos fuera del Espacio Económico Europeo, lo hace con las
        garantías del RGPD (por ejemplo, cláusulas contractuales tipo o el Marco de Privacidad de
        Datos UE-EE. UU.).
      </p>

      <h2>7. Claves de IA: se quedan en tu navegador</h2>
      <p>
        Las funciones de IA (como la práctica de entrevistas) funcionan con{" "}
        <strong>tu propia clave</strong> de un proveedor de IA. La clave se guarda solo en tu
        navegador y <strong>nunca se envía a nuestros servidores</strong>. Lo que escribas en una
        función de IA va directamente de tu navegador al proveedor que elijas, y se rige por las
        condiciones de ese proveedor; no lo recibimos ni lo guardamos. Evita incluir datos
        personales de otras personas.
      </p>

      <h2>8. Cuánto tiempo los conservamos</h2>
      <ul>
        <li>Mientras tu cuenta exista: perfil, aceptaciones y elementos guardados.</li>
        <li>
          Si eliminas la cuenta, borramos todo ello de forma inmediata (el borrado se propaga a
          todas las tablas). Las copias de seguridad del proveedor pueden conservar datos un tiempo
          limitado hasta que se renuevan: {"{{BACKUP_RETENTION_DAYS}}"} días.
        </li>
        <li>
          Registros técnicos de los proveedores: según su política, normalmente por un periodo
          corto.
        </li>
      </ul>

      <h2>9. Tus derechos</h2>
      <p>
        Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y
        portabilidad, y retirar tu consentimiento en cualquier momento:
      </p>
      <ul>
        <li>
          <strong>Acceso y portabilidad:</strong> desde tu página de cuenta puedes descargar tus
          datos en formato JSON.
        </li>
        <li>
          <strong>Rectificación:</strong> edita tu perfil en la página de cuenta.
        </li>
        <li>
          <strong>Supresión:</strong> elimina tu cuenta desde la página de cuenta; se borra todo.
        </li>
        <li>
          <strong>Resto de derechos o dudas:</strong> escribe a {"{{CONTACT_EMAIL}}"}.
        </li>
      </ul>
      <p>
        Si crees que tus derechos no se han respetado, puedes reclamar ante la Agencia Española de
        Protección de Datos (<a href="https://www.aepd.es">www.aepd.es</a>).
      </p>

      <h2>10. Seguridad</h2>
      <p>
        Cada persona solo puede acceder a sus propios datos (seguridad a nivel de fila en la base de
        datos). No usamos contraseñas. Aun así, ningún sistema es infalible; si hubiera una brecha
        que te afectara de forma relevante, te lo comunicaremos y avisaremos a la AEPD cuando
        corresponda.
      </p>

      <h2>11. Cambios</h2>
      <p>
        Si cambiamos esta política de forma relevante, actualizaremos la versión y la fecha de
        arriba y te lo indicaremos en la cuenta. Guardamos qué versión aceptaste.
      </p>
    </>
  );
}
