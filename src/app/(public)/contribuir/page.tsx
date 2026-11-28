import type { Metadata } from "next";
import {
  ButtonLink,
  Callout,
  Card,
  Heading,
  Kicker,
  Page,
  REPO_URL,
  Text,
  Timeline,
} from "@/components/ui";
import styles from "./contribuir.module.css";

export const metadata: Metadata = {
  title: "Contribuir como profesional",
  description:
    "Si trabajas en una de las industrias que cubrimos, puedes revisar una guía o proponer una fuente. Qué pedimos, cómo es el proceso y qué recibes.",
};

// TODO(Pablo): add a public contact address (a `contacto@` mailbox) and link it in "Cómo
// empezar". Until then the only channel is GitHub issues; no placeholder address is shown.
const ISSUES = `${REPO_URL}/issues/new?template=`;

const ASKS = [
  {
    title: "Fuentes verificables",
    body: "Cada dato de una guía cita una fuente en su ficha: web oficial, estudio con nombre o normativa. Si una cifra sale de tu experiencia, la anotamos como tal y no como dato.",
  },
  {
    title: "Tu nombre y fecha en la página",
    body: "Una revisión queda registrada con tu nombre (o el que prefieras) y la fecha. Si prefieres no figurar, también vale: tus correcciones se aplican igual.",
  },
  {
    title: "Licencia abierta",
    body: "Los textos son CC BY-SA 4.0: cualquiera puede copiarlos y adaptarlos citando la autoría y manteniendo la misma licencia. Al proponer cambios aceptas esa licencia.",
  },
  {
    title: "Sin pagos por empresa",
    body: "Los sueldos se dan por nivel y de estudios con nombre, nunca por firma. No publicamos rankings pagados ni contenido patrocinado.",
  },
  {
    title: "España primero",
    body: "Hablamos del camino real en España: procesos, titulaciones, fechas y sueldos de aquí. Lo de otros países solo como contraste y dicho como tal.",
  },
];

const STEPS = [
  {
    title: "Elige una página",
    body: "Abre la guía de tu industria y localiza lo que sepas de primera mano: acceso, proceso, día a día, sueldos.",
  },
  {
    title: "Abre un issue",
    body: "Con «Revisar una página» nos dices qué está desfasado, incompleto o mal, y con qué fuente se corrige. Con «Proponer una fuente», nos mandas un enlace que deberíamos citar.",
  },
  {
    title: "Lo contrastamos",
    body: "Comprobamos la fuente y respondemos en el propio issue. Si el cambio es tuyo, te mencionamos como revisor/a; si prefieres, lo aplicamos nosotros y tú das el visto bueno.",
  },
  {
    title: "Queda a tu nombre",
    body: "La página muestra quién la revisó y cuándo, y fija la próxima revisión para que la información no envejezca.",
  },
];

export default function ContribuirPage() {
  return (
    <Page>
      <Kicker>Para profesionales</Kicker>
      <Heading level="h1" as="h1">
        Ayúdanos a que las guías sean correctas
      </Heading>
      <Text>
        Path es una guía gratuita y de código abierto para quienes empiezan su carrera en España.
        Las páginas las ha escrito una persona con fuentes públicas, pero nadie que trabaje en esas
        industrias las ha revisado todavía. Si eres tú, tu criterio vale más que cualquier búsqueda.
      </Text>
      <div className={styles.actions}>
        <ButtonLink href={`${ISSUES}review-page.yml`} variant="accent" arrow>
          Revisar una página
        </ButtonLink>
        <ButtonLink href={`${ISSUES}propose-source.yml`} variant="secondary">
          Proponer una fuente
        </ButtonLink>
      </div>

      <section aria-labelledby="que-pedimos" className={styles.section}>
        <Heading level="h2" as="h2" id="que-pedimos">
          Qué pedimos
        </Heading>
        <div className={styles.grid}>
          {ASKS.map((a) => (
            <Card key={a.title} title={a.title} headingLevel="h3">
              <Text>{a.body}</Text>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="como-funciona" className={styles.section}>
        <Heading level="h2" as="h2" id="como-funciona">
          Cómo funciona
        </Heading>
        <Timeline
          steps={STEPS.map((s, i) => ({ label: `Paso ${i + 1}`, title: s.title, content: s.body }))}
        />
        <Text>
          Todo el proceso es público en GitHub. No hay formulario en esta web ni te pedimos datos
          personales: solo lo que quieras escribir en el issue.
        </Text>
      </section>

      <section aria-labelledby="que-recibes" className={styles.section}>
        <Heading level="h2" as="h2" id="que-recibes">
          Qué recibes
        </Heading>
        <Text>
          Crédito visible en cada página que revises, con tu nombre y la fecha, y la posibilidad de
          enlazar tu perfil profesional si quieres. No hay pago: es un proyecto sin ingresos, y
          preferimos decirlo claro.
        </Text>
      </section>

      <Callout tone="info" title="Mentoría">
        Si más adelante ofreces contacto con estudiantes, será solo con personas de 18 años o más y
        siempre voluntario. Todavía no está abierto.
      </Callout>

      <Text>
        ¿Prefieres escribir o corregir tú el texto? La guía técnica está en{" "}
        <a href={`${REPO_URL}/blob/main/docs/contributing-content.md`}>
          docs/contributing-content.md
        </a>
        .
      </Text>
    </Page>
  );
}
