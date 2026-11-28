import styles from "./mockups.module.css";

/**
 * Product mockups for the home window: plain HTML/CSS with invented example data. The real tools
 * are Encaje, Candidaturas and Ofertas; these are drawings of them, so the parent marks them
 * `aria-hidden` and the window says "Datos de ejemplo". No firm names: an example is not an
 * endorsement.
 */

const PROFILE = [
  ["Grado", "ADE"],
  ["Habilidades", "Excel, SQL"],
  ["Idiomas", "Inglés C1"],
  ["Ciudad", "Madrid"],
] as const;

const FIT = [
  ["Consultoría", 92],
  ["Banca de inversión", 81],
  ["Private equity", 66],
  ["Data science", 54],
  ["Roles de IA", 43],
  ["Big Law", 28],
] as const;

export function FitMock() {
  return (
    <div className={styles.fit}>
      <div className={styles.profile}>
        <p className={styles.label}>Tu perfil</p>
        <dl className={styles.facts}>
          {PROFILE.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.chip}>CV analizado en tu navegador</p>
      </div>
      <div className={styles.rank}>
        <p className={styles.label}>Industrias, de más a menos afín</p>
        <ol className={styles.rows}>
          {FIT.map(([name, pct], i) => (
            <li key={name} className={styles.row}>
              <span className={styles.n}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.rowName}>{name}</span>
              <span className={styles.meter}>
                <i style={{ inlineSize: `${pct}%` }} data-top={i === 0 || undefined} />
              </span>
            </li>
          ))}
        </ol>
        <p className={styles.note}>Un orden orientativo, no un veredicto.</p>
      </div>
    </div>
  );
}

const COLUMNS = [
  {
    name: "Guardadas",
    cards: [
      ["Prácticas de verano", "Banca de inversión", "Cierra 14 feb"],
      ["Graduate programme", "Consultoría", "Cierra 2 mar"],
      ["Prácticas de máster", "Big Law", "Abierta"],
    ],
  },
  {
    name: "Aplicadas",
    cards: [
      ["Business analyst intern", "Consultoría", "Enviada 3 feb"],
      ["Analista junior", "Banca de inversión", "Enviada 30 ene"],
    ],
  },
  { name: "Entrevista", cards: [["Prácticas de datos", "Data science", "Jue 20 feb"]] },
  { name: "Oferta", cards: [["Prácticas de verano", "Consultoría", "Responder antes del 1 mar"]] },
] as const;

export function TrackerMock() {
  return (
    <div className={styles.board}>
      {COLUMNS.map((c) => (
        <div key={c.name} className={styles.col}>
          <p className={styles.colHead}>
            <span>{c.name}</span>
            <span className={styles.count}>{c.cards.length}</span>
          </p>
          {c.cards.map(([title, industry, meta]) => (
            <div key={title + industry} className={styles.card} data-col={c.name}>
              <p className={styles.cardTitle}>{title}</p>
              <p className={styles.cardMeta}>{industry}</p>
              <p className={styles.cardDate}>{meta}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const CHIPS = ["Todas", "Consultoría", "Banca de inversión", "Big Law"] as const;
const OFFERS = [
  ["Business analyst intern", "Madrid · Prácticas", "Hace 2 d", "Consultoría"],
  ["Analista de M&A junior", "Madrid · Jornada completa", "Hace 3 d", "Banca de inversión"],
  ["Prácticas curriculares de Derecho", "Barcelona · Prácticas", "Hace 5 d", "Big Law"],
  ["Data analyst junior", "Remoto · Jornada completa", "Hace 6 d", "Data science"],
  ["Graduate programme", "Madrid · Programa", "Hace 1 sem", "Consultoría"],
] as const;

export function OffersMock() {
  return (
    <div className={styles.offers}>
      <div className={styles.chips}>
        {CHIPS.map((c, i) => (
          <span key={c} className={styles.fchip} data-on={i === 0 || undefined}>
            {c}
          </span>
        ))}
      </div>
      <ul className={styles.list}>
        {OFFERS.map(([title, meta, when, industry]) => (
          <li key={title} className={styles.offer}>
            <span className={styles.offerMain}>
              <span className={styles.offerTitle}>{title}</span>
              <span className={styles.offerMeta}>
                {meta} · {when}
              </span>
            </span>
            <span className={styles.tag}>{industry}</span>
            <span className={styles.open}>Ver anuncio ↗</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
