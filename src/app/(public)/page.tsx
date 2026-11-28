import { INDUSTRIES } from "../../../content/catalog";
import { CtaBand, StatsStrip, TrustRow } from "@/components/marketing/Bands";
import { IndustryCard } from "@/components/marketing/IndustryCard";
import { LogoWall } from "@/components/marketing/LogoWall";
import { ProductShowcase } from "@/components/marketing/ProductShowcase";
import { SectionHead } from "@/components/marketing/SectionHead";
import { ToolsBento } from "@/components/marketing/ToolsBento";
import { ButtonLink, Reveal, ROUTES } from "@/components/ui";
import styles from "./home.module.css";

export default function Home() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="titular">
        <div className={styles.heroText}>
          <h1 id="titular" className={styles.title}>
            Empieza tu carrera sabiendo lo que te espera.
          </h1>
          <p className={styles.lead}>
            Una guía escrita a mano para seis industrias, y las herramientas para entrar: encaje,
            candidaturas y ofertas.
          </p>
          <div className={styles.actions}>
            <ButtonLink href={ROUTES.industries} size="lg" arrow>
              Explorar industrias
            </ButtonLink>
            <ButtonLink href={ROUTES.fit} size="lg" variant="secondary">
              Probar Encaje
            </ButtonLink>
          </div>
          <p className={styles.mono}>Gratis · Código abierto · Sin rastreo</p>
        </div>
        <div className={styles.showcase}>
          <ProductShowcase />
        </div>
      </section>

      <div className={styles.wrap}>
        <div className={styles.block}>
          <Reveal>
            <StatsStrip />
          </Reveal>
        </div>

        <div className={styles.block}>
          <LogoWall />
        </div>

        <section className={styles.block} aria-labelledby="industrias-titulo">
          <Reveal>
            <SectionHead
              eyebrow="Seis industrias"
              id="industrias-titulo"
              title="Una guía para cada puerta de entrada."
              link={{ href: ROUTES.industries, label: "Ver el mapa" }}
            />
          </Reveal>
          <ul className={styles.cards}>
            {[...INDUSTRIES]
              .sort((a, b) => Number(b.status === "live") - Number(a.status === "live"))
              .map((i, n) => (
                <Reveal as="li" key={i.slug} delay={(n % 3) * 70}>
                  <IndustryCard industry={i} />
                </Reveal>
              ))}
          </ul>
        </section>

        <section className={styles.block} aria-labelledby="herramientas-titulo">
          <Reveal>
            <SectionHead
              eyebrow="Herramientas"
              id="herramientas-titulo"
              title="Todo lo que necesitas para entrar, en un sitio."
              lead="La guía te dice cómo funciona cada industria. Las herramientas te ayudan a moverte."
            />
          </Reveal>
          <Reveal>
            <ToolsBento />
          </Reveal>
        </section>

        <section className={styles.block} aria-labelledby="confianza-titulo">
          <Reveal>
            <SectionHead
              eyebrow="Cómo lo hacemos"
              id="confianza-titulo"
              title="Hecho para ti, no para venderte nada."
            />
          </Reveal>
          <Reveal>
            <TrustRow />
          </Reveal>
        </section>

        <div className={styles.block}>
          <Reveal>
            <CtaBand />
          </Reveal>
        </div>
      </div>
    </>
  );
}
