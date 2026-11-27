import type { Metadata } from "next";
import {
  Heading,
  Kicker,
  Page,
  ReviewedBy,
  SourceList,
  Text,
  uiMdxComponents,
} from "@/components/ui";
import { CaseSimulator } from "@/components/industries/consulting/CaseSimulator";
import { FirmsTable } from "@/components/industries/consulting/FirmsTable";
import { firms } from "../../../../../content/industrias/consultoria/firms";
import { meta, sources } from "../../../../../content/industrias/consultoria/meta";
import Funcionamiento from "../../../../../content/industrias/consultoria/funcionamiento.mdx";
import Mapa from "../../../../../content/industrias/consultoria/mapa.mdx";
import Personas from "../../../../../content/industrias/consultoria/personas.mdx";
import Seleccion from "../../../../../content/industrias/consultoria/seleccion.mdx";
import Trabajo from "../../../../../content/industrias/consultoria/trabajo.mdx";

export const metadata: Metadata = {
  title: "Consultoría",
  description:
    "Guía de consultoría en España: tipos de firma, cómo funciona, el trabajo real, empresas, procesos de selección y un caso práctico sin IA.",
};

const SECTIONS = [
  { id: "mapa", n: "01", title: "El mapa", Body: Mapa },
  { id: "funcionamiento", n: "02", title: "Cómo funciona", Body: Funcionamiento },
  { id: "trabajo", n: "03", title: "El trabajo real", Body: Trabajo },
] as const;

export default function ConsultingPage() {
  return (
    <Page>
      <header>
        <Kicker>Industria</Kicker>
        <Heading level="display">Consultoría</Heading>
        <Text variant="lead">
          Qué es, quién contrata en España y cómo prepararte, con fuentes. Incluye un caso práctico
          que funciona sin IA.
        </Text>
        <ReviewedBy
          reviewer={meta.reviewer}
          reviewedAt={meta.reviewed_at}
          nextReview={meta.next_review}
        />
        <nav aria-label="En esta guía">
          <ul>
            <li>
              <a href="#mapa">El mapa</a>
            </li>
            <li>
              <a href="#funcionamiento">Cómo funciona</a>
            </li>
            <li>
              <a href="#trabajo">El trabajo real</a>
            </li>
            <li>
              <a href="#empresas">Empresas en España</a>
            </li>
            <li>
              <a href="#seleccion">Los procesos</a>
            </li>
            <li>
              <a href="#caso">Caso práctico</a>
            </li>
            <li>
              <a href="#personas">Personas</a>
            </li>
          </ul>
        </nav>
      </header>

      {SECTIONS.map(({ id, n, title, Body }) => (
        <section key={id} id={id} aria-labelledby={`${id}-h`}>
          <Kicker>{n}</Kicker>
          <Heading level="h2" id={`${id}-h`}>
            {title}
          </Heading>
          <Body components={uiMdxComponents} />
        </section>
      ))}

      <section id="empresas" aria-labelledby="empresas-h">
        <Kicker>04</Kicker>
        <Heading level="h2" id="empresas-h">
          Empresas en España
        </Heading>
        <Text>
          Solo fuentes oficiales. «Por verificar» significa que todavía no hemos confirmado el dato.
        </Text>
        <FirmsTable firms={firms} />
      </section>

      <section id="seleccion" aria-labelledby="seleccion-h">
        <Kicker>05</Kicker>
        <Heading level="h2" id="seleccion-h">
          Los procesos de selección
        </Heading>
        <Seleccion components={uiMdxComponents} />
      </section>

      <section id="caso" aria-labelledby="caso-h">
        <Heading level="h2" id="caso-h">
          Caso práctico
        </Heading>
        <CaseSimulator />
      </section>

      <section id="personas" aria-labelledby="personas-h">
        <Kicker>06</Kicker>
        <Heading level="h2" id="personas-h">
          Personas
        </Heading>
        <Personas components={uiMdxComponents} />
      </section>

      <SourceList sources={sources} />
    </Page>
  );
}
