import type { Metadata } from "next";
import type { MDXComponents } from "mdx/types";
import {
  ButtonLink,
  formatDate,
  Heading,
  Kicker,
  Page,
  Prose,
  ReviewedBy,
  SourceList,
  uiMdxComponents,
} from "@/components/ui";
import { CaseSimulator } from "@/components/industries/consulting/CaseSimulator";
import { FirmsTable } from "@/components/industries/consulting/FirmsTable";
import { GuideNav, type GuideSection } from "@/components/industries/consulting/GuideNav";
import {
  CareerLadder,
  RecruitingCalendar,
  WeekPlan,
} from "@/components/industries/consulting/GuideVisuals";
import { MessageTemplate } from "@/components/industries/consulting/MessageTemplate";
import { firms } from "../../../../../content/industrias/consultoria/firms";
import { meta, sources } from "../../../../../content/industrias/consultoria/meta";
import Funcionamiento from "../../../../../content/industrias/consultoria/funcionamiento.mdx";
import Mapa from "../../../../../content/industrias/consultoria/mapa.mdx";
import Personas from "../../../../../content/industrias/consultoria/personas.mdx";
import Seleccion from "../../../../../content/industrias/consultoria/seleccion.mdx";
import Trabajo from "../../../../../content/industrias/consultoria/trabajo.mdx";
import styles from "./consultoria.module.css";

export const metadata: Metadata = {
  title: "Consultoría",
  description:
    "Guía de consultoría en España: tipos de firma, cómo funciona, el trabajo real, empresas, procesos de selección y un caso práctico sin IA.",
};

const SECTIONS: GuideSection[] = [
  { id: "mapa", n: "01", title: "El mapa" },
  { id: "funcionamiento", n: "02", title: "Cómo funciona" },
  { id: "trabajo", n: "03", title: "El trabajo real" },
  { id: "empresas", n: "04", title: "Empresas en España" },
  { id: "seleccion", n: "05", title: "Los procesos" },
  { id: "caso", n: "★", title: "Caso práctico" },
  { id: "personas", n: "06", title: "Personas" },
];

/** MDX headings sit under each section's h2, so they move one level down. */
const base: MDXComponents = {
  ...uiMdxComponents,
  h2: (p) => (
    <Heading level="h3" as="h3" id={p.id}>
      {p.children}
    </Heading>
  ),
  h3: (p) => <h4 className={styles.h4}>{p.children}</h4>,
};
const funcionamiento: MDXComponents = { ...base, Timeline: CareerLadder };
const trabajo: MDXComponents = { ...base, Timeline: WeekPlan };
const seleccion: MDXComponents = { ...base, RecruitingCalendar };
const personas: MDXComponents = { ...base, blockquote: MessageTemplate };

function SectionHead({ id, n, title, intro }: GuideSection & { intro?: string }) {
  return (
    <header className={styles.sectionHead}>
      <p className={styles.sectionN} aria-hidden="true">
        {n}
      </p>
      <Heading level="h1" as="h2" id={`${id}-h`}>
        {title}
      </Heading>
      {intro ? <p className={styles.sectionIntro}>{intro}</p> : null}
    </header>
  );
}

const byId = (id: string) => SECTIONS.find((s) => s.id === id)!;

export default function ConsultingPage() {
  return (
    <Page>
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <Kicker>Industria · guía 01</Kicker>
          <Heading level="display">Consultoría</Heading>
          <p className={styles.lead}>
            Qué es, quién contrata en España y cómo prepararte, con fuentes. Incluye un caso
            práctico que funciona sin IA.
          </p>
          <div className={styles.heroActions}>
            <ButtonLink href="#mapa" arrow>
              Empezar a leer
            </ButtonLink>
            <ButtonLink href="#caso" variant="ghost">
              Ir directo al caso práctico
            </ButtonLink>
          </div>
        </div>
        <dl className={styles.facts}>
          <div>
            <dt>Firmas</dt>
            <dd>{firms.length}</dd>
          </div>
          <div>
            <dt>Fuentes</dt>
            <dd>{sources.length}</dd>
          </div>
          <div>
            <dt>Próxima revisión</dt>
            <dd className={styles.factDate}>{formatDate(meta.next_review)}</dd>
          </div>
          <div className={styles.factWide}>
            <ReviewedBy reviewer={meta.reviewer} reviewedAt={meta.reviewed_at} />
          </div>
        </dl>
      </header>

      <div className={styles.layout}>
        <GuideNav sections={SECTIONS} />

        <div className={styles.content}>
          <section id="mapa" aria-labelledby="mapa-h" className={styles.section}>
            <SectionHead {...byId("mapa")} />
            <Prose>
              <Mapa components={base} />
            </Prose>
          </section>

          <section
            id="funcionamiento"
            aria-labelledby="funcionamiento-h"
            className={styles.section}
          >
            <SectionHead {...byId("funcionamiento")} />
            <Prose>
              <Funcionamiento components={funcionamiento} />
            </Prose>
          </section>

          <section id="trabajo" aria-labelledby="trabajo-h" className={styles.section}>
            <SectionHead {...byId("trabajo")} />
            <Prose>
              <Trabajo components={trabajo} />
            </Prose>
          </section>

          <section id="empresas" aria-labelledby="empresas-h" className={styles.section}>
            <SectionHead
              {...byId("empresas")}
              intro="Solo fuentes oficiales. «Sin confirmar» significa que todavía no tenemos una fuente fiable para ese dato."
            />
            <FirmsTable firms={firms} />
          </section>

          <section id="seleccion" aria-labelledby="seleccion-h" className={styles.section}>
            <SectionHead {...byId("seleccion")} title="Los procesos de selección" />
            <Prose>
              <Seleccion components={seleccion} />
            </Prose>
          </section>

          <section
            id="caso"
            aria-labelledby="caso-h"
            className={`inverse ${styles.section} ${styles.case}`}
          >
            <header className={styles.caseHead}>
              <p className={styles.caseKicker}>Tu turno</p>
              <Heading level="h1" as="h2" id="caso-h">
                Caso práctico
              </Heading>
              <p className={styles.sectionIntro}>
                Una estimación de mercado, paso a paso, con pistas en cada decisión. Los datos son
                inventados para practicar.
              </p>
            </header>
            <CaseSimulator />
          </section>

          <section id="personas" aria-labelledby="personas-h" className={styles.section}>
            <SectionHead {...byId("personas")} />
            <Prose>
              <Personas components={personas} />
            </Prose>
          </section>

          <div className={styles.section}>
            <SourceList sources={sources} />
          </div>
        </div>
      </div>
    </Page>
  );
}
