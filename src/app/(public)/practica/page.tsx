import type { Metadata } from "next";
import { PracticeApp } from "@/components/practice/PracticeApp";
import { Eyebrow, Page } from "@/components/ui";
import styles from "./practica.module.css";

export const metadata: Metadata = {
  title: "Práctica de entrevistas",
  description:
    "Practica un caso de consultoría, preguntas técnicas de finanzas o una entrevista de comportamiento con tu propia clave de IA. La clave no sale de tu navegador.",
};

export default function PracticePage() {
  return (
    <Page>
      <header className={styles.head}>
        <Eyebrow>Práctica con IA</Eyebrow>
        <h1 className={styles.title}>Practica la entrevista antes de la entrevista.</h1>
        <p className={styles.lead}>
          Un entrevistador de IA te lleva un caso, te hace preguntas técnicas o de comportamiento y
          al final te da feedback con una rúbrica. Usas tu propia clave de API: nosotros no la
          vemos.
        </p>
        <ul className={styles.points}>
          <li>
            <strong>Tu clave no sale de tu navegador.</strong> Las llamadas van directas de tu
            pestaña al proveedor, sin pasar por Path.
          </li>
          <li>
            <strong>La sesión no se guarda.</strong> La transcripción vive en la página; puedes
            descargarla tú.
          </li>
          <li>
            <strong>Paga tu proveedor, no nosotros.</strong> Gemini tiene nivel gratuito; con
            Anthropic u OpenAI pagas por uso.
          </li>
        </ul>
      </header>
      <PracticeApp />
      <section className={styles.fine} aria-label="Límites">
        <p>
          El entrevistador es una IA: puede equivocarse y no conoce los procesos reales de ninguna
          firma. Los casos y las cifras son inventados. Úsalo para ganar soltura, no como fuente de
          datos del sector.
        </p>
      </section>
    </Page>
  );
}
