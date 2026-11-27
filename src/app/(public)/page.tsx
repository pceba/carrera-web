import { ButtonLink, Heading, Kicker, Page, PILLARS, ROUTES, Text } from "@/components/ui";
import styles from "./home.module.css";

export default function Home() {
  return (
    <Page>
      <section className={styles.hero} aria-labelledby="titular">
        <Kicker>Guía abierta para empezar tu carrera en España</Kicker>
        <Heading level="display" id="titular">
          Entra en la industria que quieres, <span className={styles.accentWord}>sabiendo</span> lo
          que te espera.
        </Heading>
        <Text variant="lead">
          Una guía por industria, escrita a mano y con fuentes: cómo funciona el sector, cómo es el
          trabajo de verdad, qué empresas contratan y cómo preparar cada proceso de selección.
          Gratis, de código abierto y sin rastreo.
        </Text>
        <div className={styles.heroActions}>
          <ButtonLink href={ROUTES.consulting}>Empieza por consultoría</ButtonLink>
          <ButtonLink href={ROUTES.industries} variant="secondary">
            Ver todas las industrias
          </ButtonLink>
        </div>
      </section>

      <section className={styles.section} id="pilares" aria-labelledby="pilares-titulo">
        <Kicker>Qué encontrarás en cada industria</Kicker>
        <Heading level="h1" as="h2" id="pilares-titulo">
          Seis piezas, siempre las mismas
        </Heading>
        <ol className={styles.pillars}>
          {PILLARS.map((p) => (
            <li key={p.n} className={styles.pillar}>
              <span className={styles.pillarN} aria-hidden="true">
                {p.n}
              </span>
              <div>
                <h3 className={styles.pillarTitle}>{p.title}</h3>
                <p className={styles.pillarText}>{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="cuenta-titulo">
        <div className={styles.cta}>
          <Heading level="h1" as="h2" id="cuenta-titulo">
            Todo el contenido es público
          </Heading>
          <p className={styles.ctaText}>
            Crea una cuenta (a partir de 16 años) solo si quieres guardar tu progreso, recibir
            alertas de ofertas o practicar con tu propia clave de IA.
          </p>
          <div>
            <ButtonLink href={ROUTES.signUp} variant="secondary">
              Crear cuenta gratis
            </ButtonLink>
          </div>
        </div>
      </section>
    </Page>
  );
}
