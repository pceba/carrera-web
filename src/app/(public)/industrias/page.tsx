import type { Metadata } from "next";
import Link from "next/link";
import { Heading, INDUSTRIES, Kicker, Page, PILLARS, Tag, Text } from "@/components/ui";
import styles from "./industrias.module.css";

export const metadata: Metadata = {
  title: "Industrias",
  description: "El mapa de industrias: cuáles tienen guía ya y cuáles llegan pronto.",
};

export default function IndustriesPage() {
  const live = INDUSTRIES.filter((i) => i.status === "live");
  const soon = INDUSTRIES.filter((i) => i.status === "soon");

  return (
    <Page>
      <header className={styles.hero}>
        <Kicker>El mapa</Kicker>
        <Heading level="display">Industrias</Heading>
        <Text variant="lead">
          Cada industria tiene su propia guía, diseñada a medida de cómo se entra en ese sector.
          Empezamos por consultoría; el resto llega una a una.
        </Text>
      </header>

      <section aria-labelledby="disponibles" className={styles.section}>
        <h2 id="disponibles" className={styles.label}>
          Disponible ahora
        </h2>
        <ul className={styles.liveList}>
          {live.map((i, idx) => (
            <li key={i.slug} className={styles.live}>
              <span className={styles.index} aria-hidden="true">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className={styles.liveBody}>
                <Tag tone="success">Disponible</Tag>
                <h3 className={styles.liveName}>
                  <Link href={`/industrias/${i.slug}`}>{i.name}</Link>
                </h3>
                <p className={styles.blurb}>{i.blurb}</p>
              </div>
              <ol className={styles.pillars} aria-label={`Qué incluye la guía de ${i.name}`}>
                {PILLARS.map((p) => (
                  <li key={p.n}>
                    <span aria-hidden="true">{p.n}</span> {p.title}
                  </li>
                ))}
              </ol>
              <span className={styles.go} aria-hidden="true">
                Abrir la guía →
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pronto" className={styles.section}>
        <h2 id="pronto" className={styles.label}>
          Próximamente
        </h2>
        <ul className={styles.soonList}>
          {soon.map((i, idx) => (
            <li key={i.slug} className={styles.soon}>
              <span className={styles.index} aria-hidden="true">
                {String(live.length + idx + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className={styles.soonName}>{i.name}</h3>
                <p className={styles.blurb}>{i.blurb}</p>
              </div>
              <Tag tone="muted">Próximamente</Tag>
            </li>
          ))}
        </ul>
      </section>
    </Page>
  );
}
