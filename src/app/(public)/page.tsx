import Link from "next/link";
import { ButtonLink, Page, ROUTES } from "@/components/ui";
import { INDUSTRIES, industryHref } from "../../../content/catalog";
import styles from "./home.module.css";

/** How the site works. Advice only, no facts, so no sources needed. */
const STEPS = [
  {
    title: "Elige una industria",
    text: "Cada guía cuenta cómo funciona el sector, cómo es el trabajo y quién contrata.",
  },
  {
    title: "Prepara el proceso",
    text: "Entrevistas, pruebas y CV, con la preparación que comparten varias industrias.",
  },
  {
    title: "Busca ofertas",
    text: "Prácticas y puestos junior que enlazan al anuncio original, donde te apuntas.",
  },
] as const;

export default function Home() {
  return (
    <Page>
      <section className={styles.hero} aria-labelledby="titular">
        <h1 id="titular" className={styles.title}>
          Entra en la industria que quieres sabiendo lo que te espera.
        </h1>
        <p className={styles.lead}>
          Una guía por industria, escrita a mano y con fuentes. Gratis y sin rastreo.
        </p>
        <div className={styles.actions}>
          <ButtonLink href={ROUTES.consulting} arrow>
            Empieza por consultoría
          </ButtonLink>
          <ButtonLink href={ROUTES.industries} variant="ghost">
            Ver el mapa de industrias
          </ButtonLink>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="industrias-titulo">
        <h2 id="industrias-titulo" className={styles.h2}>
          Seis industrias
        </h2>
        <ul className={styles.industries}>
          {INDUSTRIES.map((i) => (
            <li key={i.slug}>
              <Link href={industryHref(i.slug)} className={styles.industry}>
                <span className={styles.industryName}>{i.title}</span>
                <span className={styles.industryLine}>{i.line}</span>
                {i.status === "preparing" ? (
                  <span className={styles.industryStatus}>En preparación</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="pasos-titulo">
        <h2 id="pasos-titulo" className={styles.h2}>
          Cómo funciona
        </h2>
        <ol className={styles.steps}>
          {STEPS.map((s, idx) => (
            <li key={s.title} className={styles.step}>
              <span className={styles.stepN} aria-hidden="true">
                {idx + 1}
              </span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepText}>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className={styles.trust}>
        Cada dato cita su fuente y la fecha de revisión. Sin rastreo ni analítica. Código MIT y
        contenidos CC BY-SA 4.0.
      </p>
    </Page>
  );
}
