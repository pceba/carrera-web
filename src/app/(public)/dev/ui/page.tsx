import type { Metadata } from "next";
import {
  Accordion,
  Button,
  ButtonLink,
  Callout,
  Card,
  Cite,
  Heading,
  Kicker,
  Page,
  Prose,
  ReviewedBy,
  SourceList,
  Stat,
  Tabs,
  Tag,
  Text,
  Timeline,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Showcase de UI",
  robots: { index: false, follow: false },
};

const sources = [
  {
    title: "Encuesta de ejemplo sobre empleo juvenil",
    url: "https://example.org/encuesta",
    publisher: "Organismo de ejemplo",
    accessed: "27 nov 2026",
  },
];

function Block({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <section
      data-primitive={name}
      aria-label={name}
      style={{
        display: "grid",
        gap: "var(--space-4)",
        padding: "var(--space-8) 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <Kicker>{name}</Kicker>
      {children}
    </section>
  );
}

export default function UiShowcase() {
  return (
    <Page>
      <Heading level="h1">Showcase de UI</Heading>
      <Text variant="muted">Página interna: todos los primitivos del sistema de diseño.</Text>

      <Block name="Tipografía">
        <Heading level="display" as="h2">
          Display
        </Heading>
        <Heading level="h1" as="h2">
          Título 1
        </Heading>
        <Heading level="h2" as="h3">
          Título 2
        </Heading>
        <Heading level="h3" as="h4">
          Título 3
        </Heading>
        <Text variant="lead">Párrafo destacado para abrir una sección.</Text>
        <Text>Párrafo normal con medida de lectura cómoda para textos largos.</Text>
        <Text variant="muted">Texto secundario.</Text>
        <Prose>
          <p>
            Contenido largo con una cita
            <Cite n={1} /> y un <a href="#fuente-1">enlace</a>.
          </p>
          <ul>
            <li>Primer punto</li>
            <li>Segundo punto</li>
          </ul>
          <blockquote>Una cita destacada.</blockquote>
        </Prose>
      </Block>

      <Block name="Botón">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <Button>Principal</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="ghost">Fantasma</Button>
          <Button disabled>Desactivado</Button>
          <ButtonLink href="/industrias">Enlace</ButtonLink>
        </div>
      </Block>

      <Block name="Tarjeta">
        <div
          style={{
            display: "grid",
            gap: "var(--space-4)",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 16rem), 1fr))",
          }}
        >
          <Card
            title="Con enlace"
            href="/industrias"
            eyebrow={<Tag tone="success">Disponible</Tag>}
          >
            Toda la tarjeta es un enlace.
          </Card>
          <Card title="Atenuada" muted eyebrow={<Tag tone="muted">Próximamente</Tag>}>
            Sin enlace.
          </Card>
        </div>
      </Block>

      <Block name="Etiqueta">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
          <Tag>Neutral</Tag>
          <Tag tone="accent">Acento</Tag>
          <Tag tone="success">Éxito</Tag>
          <Tag tone="muted">Atenuada</Tag>
        </div>
      </Block>

      <Block name="Aviso">
        <Callout>Información general.</Callout>
        <Callout tone="warning">Algo a tener en cuenta.</Callout>
        <Callout tone="danger">Algo importante.</Callout>
        <Callout tone="success" title="Truco">
          Un consejo práctico.
        </Callout>
      </Block>

      <Block name="Pestañas">
        <Tabs
          label="Ejemplo de pestañas"
          items={[
            { id: "uno", label: "Primero", content: <Text>Contenido del primer panel.</Text> },
            { id: "dos", label: "Segundo", content: <Text>Contenido del segundo panel.</Text> },
            { id: "tres", label: "Tercero", content: <Text>Contenido del tercer panel.</Text> },
          ]}
        />
      </Block>

      <Block name="Acordeón">
        <Accordion
          items={[
            { id: "a", title: "¿Qué es esto?", content: <p>Una respuesta breve.</p>, open: true },
            { id: "b", title: "¿Cuesta dinero?", content: <p>No.</p> },
          ]}
        />
      </Block>

      <Block name="Línea de tiempo">
        <Timeline
          steps={[
            { label: "Fase 1", title: "Solicitud", content: <p>CV y carta.</p> },
            { label: "Fase 2", title: "Pruebas online" },
            { label: "Fase 3", title: "Entrevistas", content: <p>Casos y encaje.</p> },
          ]}
        />
      </Block>

      <Block name="Cifra">
        <div
          style={{
            display: "grid",
            gap: "var(--space-4)",
            gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))",
          }}
        >
          <Stat value="3" label="Fases de selección" source="Fuente de ejemplo" />
          <Stat value="24 %" label="Ofertas junior" />
        </div>
      </Block>

      <Block name="Fuentes y revisión">
        <ReviewedBy reviewer="Equipo editorial" reviewedAt="2026-11-27" nextReview="2027-05-27" />
        <SourceList sources={sources} />
      </Block>
    </Page>
  );
}
