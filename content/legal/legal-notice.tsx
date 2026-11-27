/**
 * DRAFTED WITH AI, TO BE CHECKED BY PABLO. NOT LEGAL ADVICE.
 * Aviso legal (art. 10 LSSI). Placeholders: {{CONTROLLER_NAME}}, {{CONTACT_EMAIL}}, {{CONTROLLER_ADDRESS}}, {{CONTROLLER_ID}}.
 */
import Link from "next/link";

export function LegalNoticeBody() {
  return (
    <>
      <h2>Datos del titular</h2>
      <p>
        En cumplimiento del art. 10 de la Ley 34/2002 de servicios de la sociedad de la información
        (LSSI), te informamos de que este sitio web es titularidad de:
      </p>
      <ul>
        <li>
          <strong>Titular:</strong> {"{{CONTROLLER_NAME}}"}
        </li>
        <li>
          <strong>NIF/DNI:</strong> {"{{CONTROLLER_ID}}"}
        </li>
        <li>
          <strong>Domicilio:</strong> {"{{CONTROLLER_ADDRESS}}"}
        </li>
        <li>
          <strong>Correo de contacto:</strong> {"{{CONTACT_EMAIL}}"}
        </li>
      </ul>
      <p>
        Es un proyecto personal, gratuito y sin ánimo de lucro: no se cobra por ningún servicio ni
        se muestra publicidad, por lo que no hay actividad económica registrada.
      </p>

      <h2>Objeto</h2>
      <p>
        Guía abierta de orientación profesional para jóvenes en España. El uso del sitio implica
        aceptar los <Link href="/legal/terminos">términos de uso</Link>.
      </p>

      <h2>Propiedad intelectual</h2>
      <p>
        El código se publica bajo licencia MIT y el contenido bajo Creative Commons
        Atribución-CompartirIgual 4.0. Detalles en los términos de uso. Las marcas de terceros
        pertenecen a sus titulares.
      </p>

      <h2>Responsabilidad</h2>
      <p>
        Procuramos que la información sea correcta y esté fuente citada, pero no garantizamos que
        esté libre de errores ni actualizada en todo momento. No nos hacemos responsables del
        contenido de sitios enlazados.
      </p>

      <h2>Datos personales y cookies</h2>
      <p>
        Consulta la <Link href="/legal/privacidad">política de privacidad</Link> y la{" "}
        <Link href="/legal/cookies">política de cookies</Link>.
      </p>

      <h2>Legislación</h2>
      <p>
        Este sitio se rige por la legislación española. Para cualquier controversia, si eres
        consumidor, serán competentes los juzgados que te correspondan conforme a la ley.
      </p>
    </>
  );
}
