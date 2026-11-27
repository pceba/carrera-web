/**
 * DRAFTED WITH AI, TO BE CHECKED BY PABLO. NOT LEGAL ADVICE.
 * Shared frame for the legal pages: title, version/date line, prose body.
 */
import type { ReactNode } from "react";
import styles from "./legal.module.css";
import { Callout, Heading, Kicker, Page, Prose, Text } from "@/components/ui";

export function LegalDoc({
  kicker,
  title,
  version,
  date,
  children,
}: {
  kicker: string;
  title: string;
  version: string;
  date: string;
  children: ReactNode;
}) {
  return (
    <Page>
      <header>
        <Kicker>{kicker}</Kicker>
        <Heading level="display">{title}</Heading>
        <Text variant="muted">
          Versión {version} · Última actualización: {date}
        </Text>
      </header>
      <Callout tone="warning" title="Borrador">
        Este texto está en revisión. Los datos del responsable aparecen entre llaves hasta que se
        completen.
      </Callout>
      <div className={styles.doc}>
        <Prose>{children}</Prose>
      </div>
    </Page>
  );
}
