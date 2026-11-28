import Link from "next/link";
import { ROUTES } from "../ui/site-data";
import { ToolIcon, type ToolIconName } from "../ui/ToolIcon";
import styles from "./bento.module.css";

type Tool = {
  id: string;
  icon: ToolIconName;
  title: string;
  text: string;
  href?: string;
  soon?: boolean;
  span: "a" | "b" | "c";
};

const TOOLS: Tool[] = [
  {
    id: "encaje",
    icon: "fit",
    title: "Encaje",
    text: "Ordena las seis industrias según tu perfil. Tu CV se analiza en tu navegador y no se sube a ningún sitio.",
    href: ROUTES.fit,
    span: "a",
  },
  {
    id: "candidaturas",
    icon: "tracker",
    title: "Candidaturas",
    text: "Un tablero para seguir cada solicitud, con fechas límite y notas.",
    href: ROUTES.tracker,
    span: "b",
  },
  {
    id: "diagnostico",
    icon: "diagnostic",
    title: "Diagnóstico",
    text: "¿Qué industria encaja contigo? Unas preguntas y una primera idea, sin cuenta.",
    href: ROUTES.diagnostic,
    span: "c",
  },
  {
    id: "ofertas",
    icon: "offers",
    title: "Ofertas",
    text: "Prácticas y puestos junior de fuentes oficiales, con enlace al anuncio.",
    href: ROUTES.offers,
    span: "c",
  },
  {
    id: "alertas",
    icon: "alerts",
    title: "Alertas",
    text: "Un correo cuando se abre una convocatoria de las industrias que sigues.",
    soon: true,
    span: "b",
  },
  {
    id: "practica",
    icon: "practice",
    title: "Práctica con IA",
    text: "Practica entrevistas con tu propia clave de API. La clave no sale de tu navegador.",
    soon: true,
    span: "b",
  },
];

/** Little drawings inside the three live cards. Decorative. */
function Visual({ id }: { id: string }) {
  if (id === "encaje") {
    return (
      <div className={styles.vFit} aria-hidden="true">
        {[92, 81, 66, 54].map((w, i) => (
          <i key={w} style={{ inlineSize: `${w}%` }} data-top={i === 0 || undefined} />
        ))}
      </div>
    );
  }
  if (id === "candidaturas") {
    return (
      <div className={styles.vBoard} aria-hidden="true">
        {[3, 2, 1, 1].map((n, c) => (
          <span key={c}>
            {Array.from({ length: n }, (_, i) => (
              <i key={i} data-hot={c === 3 || undefined} />
            ))}
          </span>
        ))}
      </div>
    );
  }
  if (id === "diagnostico") {
    return (
      <div className={styles.vQuiz} aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} data-on={i === 1 || undefined}>
            <i />
          </span>
        ))}
      </div>
    );
  }
  if (id === "ofertas") {
    return (
      <div className={styles.vList} aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i}>
            <i />
            <b />
          </span>
        ))}
      </div>
    );
  }
  return null;
}

export function ToolsBento() {
  return (
    <ul className={styles.grid}>
      {TOOLS.map((t) => {
        const inner = (
          <>
            <span className={styles.top}>
              <ToolIcon name={t.icon} className={styles.icon} />
              {t.soon ? <span className={styles.soon}>Pronto</span> : null}
            </span>
            <span className={styles.title}>{t.title}</span>
            <span className={styles.text}>{t.text}</span>
            <Visual id={t.id} />
            {t.href ? (
              <span className={styles.go} aria-hidden="true">
                →
              </span>
            ) : null}
          </>
        );
        return (
          <li key={t.id} className={`${styles.cell} ${styles[t.span]}`}>
            {t.href ? (
              <Link href={t.href} className={styles.card}>
                {inner}
              </Link>
            ) : (
              <div className={styles.card} data-soon>
                {inner}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
