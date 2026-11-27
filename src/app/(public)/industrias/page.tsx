import type { Metadata } from "next";
import { Card, Heading, INDUSTRIES, Kicker, Page, Tag, Text } from "@/components/ui";
import styles from "../home.module.css";

export const metadata: Metadata = {
  title: "Industrias",
  description: "El mapa de industrias: cuáles tienen guía ya y cuáles llegan pronto.",
};

export default function IndustriesPage() {
  return (
    <Page>
      <header className={styles.hero}>
        <Kicker>El mapa</Kicker>
        <Heading level="display">Industrias</Heading>
        <Text variant="lead">
          Cada industria tiene su propia guía, diseñada a medida. Empezamos por consultoría; el
          resto llega una a una.
        </Text>
      </header>

      <section className={styles.section} aria-label="Lista de industrias">
        <ul className={styles.industryGrid}>
          {INDUSTRIES.map((i) => {
            const live = i.status === "live";
            return (
              <li key={i.slug}>
                <Card
                  title={i.name}
                  href={live ? `/industrias/${i.slug}` : undefined}
                  muted={!live}
                  eyebrow={
                    <Tag tone={live ? "success" : "muted"}>
                      {live ? "Disponible" : "Próximamente"}
                    </Tag>
                  }
                  headingLevel="h2"
                >
                  {i.blurb}
                </Card>
              </li>
            );
          })}
        </ul>
      </section>
    </Page>
  );
}
