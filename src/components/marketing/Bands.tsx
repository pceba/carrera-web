import { INDUSTRIES } from "../../../content/catalog";
import { ButtonLink } from "../ui/Button";
import { Eyebrow } from "../ui/Typography";
import { ROUTES } from "../ui/site-data";
import styles from "./bands.module.css";

/** Mono label over a big figure, in a thin 1 px grid. Every number is counted from the catalogue. */
export function StatsStrip() {
  const live = INDUSTRIES.filter((i) => i.status === "live");
  const pages = live.reduce((n, i) => n + i.sections.length + i.segments.length, 0);
  const stats = [
    ["Industrias", String(INDUSTRIES.length)],
    ["Guías publicadas", String(live.length)],
    ["Páginas de industria", String(pages)],
    ["Anuncios y rastreadores", "0"],
  ] as const;
  return (
    <dl className={styles.stats}>
      {stats.map(([label, value]) => (
        <div key={label} className={styles.stat}>
          <dt className={styles.statLabel}>{label}</dt>
          <dd className={styles.statValue}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

const TRUST = [
  ["Gratis", "Sin planes de pago ni versión premium."],
  ["Código abierto", "Código MIT y contenidos CC BY-SA 4.0. Mira cómo está hecho."],
  ["Tu CV no sale del navegador", "Se analiza en tu dispositivo. No lo subimos a ningún servidor."],
  ["Sin anuncios ni tracking", "Ni analítica ni cookies de seguimiento."],
] as const;

export function TrustRow() {
  return (
    <ul className={styles.trust}>
      {TRUST.map(([title, text], i) => (
        <li key={title} className={styles.trustItem}>
          <Eyebrow>{String(i + 1).padStart(2, "0")}</Eyebrow>
          <p className={styles.trustTitle}>{title}</p>
          <p className={styles.trustText}>{text}</p>
        </li>
      ))}
    </ul>
  );
}

/** Closing band: an inverse (dark) panel with one headline and the two main actions. */
export function CtaBand() {
  return (
    <section className={`inverse ${styles.band}`} aria-labelledby="cierre-titulo">
      <span className={styles.bandGlow} aria-hidden="true" />
      <Eyebrow>Empieza hoy</Eyebrow>
      <h2 id="cierre-titulo" className={styles.bandTitle}>
        Tu primer paso, sabiendo a dónde llevas el segundo.
      </h2>
      <div className={styles.bandActions}>
        <ButtonLink href={ROUTES.industries} size="lg" arrow>
          Explorar industrias
        </ButtonLink>
        <ButtonLink href={ROUTES.fit} size="lg" variant="secondary">
          Probar Encaje
        </ButtonLink>
      </div>
    </section>
  );
}
