import Link from "next/link";
import { ButtonLink, formatDate, INDUSTRIES, Kicker, Page, PILLARS, ROUTES } from "@/components/ui";
import { firms } from "../../../content/industrias/consultoria/firms";
import { meta, sources } from "../../../content/industrias/consultoria/meta";
import styles from "./home.module.css";

/** Where each pillar lives inside the consulting guide (the reference industry). */
const PILLAR_ANCHORS = ["mapa", "funcionamiento", "trabajo", "empresas", "seleccion", "personas"];

/** Entry by year of degree. Advice only: no facts, so no sources needed. */
const STAGES = [
  {
    id: "c1-2",
    year: "1.º–2.º",
    note: null,
    title: "Explora sin prisa",
    text: "Descubre qué industrias existen y cómo es el trabajo de verdad antes de elegir.",
    href: ROUTES.industries,
    cta: "Ver el mapa de industrias",
  },
  {
    id: "c3",
    year: "3.º",
    note: null,
    title: "Toca buscar prácticas",
    text: "Mira qué empresas ofrecen prácticas de verano o curriculares y cuándo abren plazo.",
    href: `${ROUTES.consulting}#c3`,
    cta: "Ruta de 3.º en consultoría",
  },
  {
    id: "c4",
    year: "4.º",
    note: "o recién graduado",
    title: "Prepara los procesos",
    text: "Candidaturas a programas de jornada completa y práctica de entrevistas y casos.",
    href: `${ROUTES.consulting}#c4`,
    cta: "Ruta de 4.º en consultoría",
  },
] as const;

const OFFER_SHORTCUTS = [
  { label: "Prácticas", href: `${ROUTES.offers}?nivel=intern` },
  { label: "Consultoría", href: `${ROUTES.offers}?industria=consulting` },
  { label: "Madrid", href: `${ROUTES.offers}?ciudad=Madrid` },
  { label: "Barcelona", href: `${ROUTES.offers}?ciudad=Barcelona` },
  { label: "En remoto", href: `${ROUTES.offers}?remoto=1` },
] as const;

export default function Home() {
  const live = INDUSTRIES.filter((i) => i.status === "live");
  const soon = INDUSTRIES.filter((i) => i.status === "soon");

  return (
    <>
      <Page>
        {/* Hero: the promise on the left, a real contents page of a guide on the right. */}
        <section className={styles.hero} aria-labelledby="titular">
          <div className={styles.heroText}>
            <Kicker>Guía abierta para empezar tu carrera en España</Kicker>
            <h1 id="titular" className={styles.title}>
              Entra en la industria que quieres <em>sabiendo</em> lo que te espera.
            </h1>
            <p className={styles.lead}>
              Una guía por industria, escrita a mano y con fuentes: cómo funciona el sector, cómo es
              el trabajo, quién contrata y cómo preparar cada proceso. Gratis y sin rastreo.
            </p>
            <div className={styles.actions}>
              <ButtonLink href={ROUTES.consulting} arrow>
                Empieza por consultoría
              </ButtonLink>
              <ButtonLink href={ROUTES.industries} variant="ghost">
                Ver todas las industrias
              </ButtonLink>
            </div>
          </div>

          <aside className={styles.contents} aria-labelledby="indice-titulo">
            <div className={styles.contentsHead}>
              <p className={styles.contentsKicker}>Así es una guía</p>
              <h2 id="indice-titulo" className={styles.contentsTitle}>
                Consultoría
              </h2>
              <p className={styles.contentsMeta}>
                {sources.length} fuentes · revisada el {formatDate(meta.reviewed_at)}
              </p>
            </div>
            <ol className={styles.contentsList}>
              {PILLARS.map((p, i) => (
                <li key={p.n}>
                  <Link href={`${ROUTES.consulting}#${PILLAR_ANCHORS[i]}`}>
                    <span className={styles.contentsN} aria-hidden="true">
                      {p.n}
                    </span>
                    <span className={styles.contentsName}>{p.title}</span>
                    <span className={styles.contentsText}>{p.text}</span>
                  </Link>
                </li>
              ))}
            </ol>
            <p className={styles.contentsFoot}>
              Más un caso práctico interactivo que funciona sin IA y sin cuenta.
            </p>
          </aside>
        </section>

        {/* Where are you? */}
        <section className={styles.section} aria-labelledby="curso-titulo">
          <header className={styles.sectionHead}>
            <Kicker>Por dónde empezar</Kicker>
            <h2 id="curso-titulo" className={styles.h2}>
              ¿En qué curso estás?
            </h2>
            <p className={styles.sectionLead}>
              No hace falta leerlo todo. Empieza por lo que te toca ahora.
            </p>
          </header>
          <ol className={styles.stages}>
            {STAGES.map((s) => (
              <li key={s.id} className={styles.stage}>
                <p className={styles.stageYear}>
                  {s.year}
                  {s.note ? <span className={styles.stageNote}> {s.note}</span> : null}
                </p>
                <h3 className={styles.stageTitle}>
                  <Link href={s.href}>{s.title}</Link>
                </h3>
                <p className={styles.stageText}>{s.text}</p>
                <p className={styles.stageCta} aria-hidden="true">
                  {s.cta} <span className={styles.arrow}>→</span>
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Industry map teaser */}
        <section className={styles.section} aria-labelledby="mapa-titulo">
          <header className={styles.sectionHead}>
            <Kicker>El mapa</Kicker>
            <h2 id="mapa-titulo" className={styles.h2}>
              {INDUSTRIES.length} industrias, una a una
            </h2>
            <p className={styles.sectionLead}>
              Cada guía se escribe a medida de su sector, no con una plantilla. Por eso salen de una
              en una.
            </p>
          </header>
          <div className={styles.map}>
            {live.map((i) => (
              <Link key={i.slug} href={`/industrias/${i.slug}`} className={styles.mapLive}>
                <span className={styles.mapStatus}>Disponible</span>
                <span className={styles.mapName}>{i.name}</span>
                <span className={styles.mapBlurb}>{i.blurb}</span>
                <span className={styles.mapFacts}>
                  {firms.length} firmas · {sources.length} fuentes · 1 caso práctico
                </span>
                <span className={styles.mapGo} aria-hidden="true">
                  Abrir la guía →
                </span>
              </Link>
            ))}
            <div className={styles.mapSoon}>
              <p className={styles.mapSoonLabel}>Próximamente</p>
              <ul className={styles.mapSoonList}>
                {soon.map((i) => (
                  <li key={i.slug}>{i.name}</li>
                ))}
              </ul>
              <Link href={ROUTES.industries} className={styles.textLink}>
                Ver el mapa completo
              </Link>
            </div>
          </div>
        </section>

        {/* Jobs teaser */}
        <section className={`${styles.section} ${styles.offers}`} aria-labelledby="ofertas-titulo">
          <header className={styles.sectionHead}>
            <Kicker>Ofertas</Kicker>
            <h2 id="ofertas-titulo" className={styles.h2}>
              Prácticas y puestos junior, cada mañana
            </h2>
            <p className={styles.sectionLead}>
              Las recogemos de las APIs oficiales de webs de empleo y portales que lo permiten. Cada
              oferta enlaza al anuncio original, que es donde te apuntas.
            </p>
          </header>
          <div className={styles.offerBox}>
            <p className={styles.offerLabel} id="atajos">
              Atajos
            </p>
            <ul className={styles.chips} aria-labelledby="atajos">
              {OFFER_SHORTCUTS.map((o) => (
                <li key={o.href}>
                  <Link href={o.href} className={styles.chip}>
                    {o.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ButtonLink href={ROUTES.offers} variant="secondary" arrow>
              Ver todas las ofertas
            </ButtonLink>
          </div>
        </section>

        {/* Trust */}
        <section className={styles.section} aria-labelledby="confianza-titulo">
          <header className={styles.sectionHead}>
            <Kicker>Por qué fiarte</Kicker>
            <h2 id="confianza-titulo" className={styles.h2}>
              Sin humo, sin letra pequeña
            </h2>
          </header>
          <dl className={styles.trust}>
            <div>
              <dt>Cada dato, con su fuente</dt>
              <dd>
                Si no podemos citarlo, no lo publicamos. La guía de consultoría enlaza{" "}
                {sources.length} fuentes oficiales.
              </dd>
            </div>
            <div>
              <dt>Revisado y con fecha</dt>
              <dd>
                Cada guía dice quién la revisó y cuándo toca revisarla otra vez (consultoría:{" "}
                {formatDate(meta.next_review)}).
              </dd>
            </div>
            <div>
              <dt>Código abierto</dt>
              <dd>Código MIT y contenidos CC BY-SA 4.0. Puedes ver cómo está hecho y mejorarlo.</dd>
            </div>
            <div>
              <dt>Sin rastreo</dt>
              <dd>
                Ni cookies de seguimiento ni analítica. Si usas IA, va con tu propia clave y no sale
                de tu navegador.
              </dd>
            </div>
          </dl>
        </section>
      </Page>

      {/* Account band: full-bleed, inverse panel that stays dark-on-dark in dark mode. */}
      <section className={`inverse ${styles.band}`} aria-labelledby="cuenta-titulo">
        <div className={styles.bandInner}>
          <h2 id="cuenta-titulo" className={styles.bandTitle}>
            Todo el contenido es público.
          </h2>
          <p className={styles.bandText}>
            Crea una cuenta (desde los 16 años) solo si quieres guardar tu progreso, recibir alertas
            de ofertas o practicar con tu propia clave de IA. Sin contraseñas: te enviamos un
            enlace.
          </p>
          <div>
            <ButtonLink href={ROUTES.signIn} variant="accent" arrow>
              Crear cuenta gratis
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
