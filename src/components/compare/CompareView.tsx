"use client";

import Link from "next/link";
import { useState } from "react";
import {
  getIndustry,
  industryHref,
  INDUSTRIES,
  pageHref,
  type Industry,
  type IndustrySlug,
} from "../../../content/catalog";
import { COMPARE, DIMENSIONS, type Cell } from "@/lib/compare/data";
import styles from "./compare.module.css";

const MAX = 3;
const MIN = 2;

/** Live guides first, so the default pair is always two real guides. */
const ORDER = [...INDUSTRIES].sort(
  (a, b) => Number(b.status === "live") - Number(a.status === "live"),
);

/** Link text for the page that backs a value, e.g. "Sueldos". */
function sourceLabel(source: string): string {
  const [slug = "", page = ""] = source.split("/");
  return getIndustry(slug)?.sections.find((s) => s.slug === page)?.title ?? page;
}

/** "Ver la guía" lands on the first read, so the map's own hub links stay unique on the page. */
function guideHref(i: Industry): string {
  const first = i.startHere ?? i.sections[0]?.slug;
  return first ? pageHref(i.slug, first) : industryHref(i.slug);
}

function Value({ cell }: { cell: Cell }) {
  if (cell.value === null) {
    return (
      <>
        <span aria-label="Sin dato" className={styles.dash}>
          —
        </span>
        <span className={styles.reason}>{cell.reason}</span>
      </>
    );
  }
  return (
    <>
      <span>{cell.value}</span>
      <Link href={`/industrias/${cell.source}`} className={styles.source}>
        Fuente: {sourceLabel(cell.source)}
      </Link>
    </>
  );
}

/**
 * Pick 2 or 3 industries (toggle chips), compare them side by side. Desktop: a table with a sticky
 * header row. At 375 px: swipeable cards (scroll-snap). Both read the same data; CSS shows one.
 */
export function CompareView({ initial }: { initial?: IndustrySlug[] }) {
  const [selected, setSelected] = useState<IndustrySlug[]>(
    initial && initial.length >= MIN
      ? initial.slice(0, MAX)
      : ORDER.filter((i) => i.status === "live")
          .slice(0, 2)
          .map((i) => i.slug),
  );
  const full = selected.length >= MAX;
  const toggle = (slug: IndustrySlug) =>
    setSelected((cur) =>
      cur.includes(slug) ? cur.filter((s) => s !== slug) : cur.length >= MAX ? cur : [...cur, slug],
    );
  const picked = ORDER.filter((i) => selected.includes(i.slug));

  return (
    <div className={styles.root}>
      <div role="group" aria-label="Elige de 2 a 3 industrias" className={styles.chips}>
        {ORDER.map((i) => {
          const on = selected.includes(i.slug);
          return (
            <button
              key={i.slug}
              type="button"
              className={styles.chip}
              aria-pressed={on}
              disabled={!on && full}
              onClick={() => toggle(i.slug)}
            >
              {i.title}
            </button>
          );
        })}
      </div>
      <p className={styles.status} role="status">
        {selected.length < MIN
          ? `Elige al menos ${MIN} industrias para compararlas.`
          : `Comparando ${selected.length} de ${MAX} posibles.`}
      </p>

      {picked.length >= MIN ? (
        <>
          <div className={styles.tableWrap} data-testid="compare-table">
            <table className={styles.table}>
              <caption className={styles.srOnly}>Comparación de industrias</caption>
              <thead>
                <tr>
                  <td />
                  {picked.map((i) => (
                    <th key={i.slug} scope="col" className={styles.colHead}>
                      <span>{i.title}</span>
                      <span className={styles.headNote}>
                        {i.status === "live" ? (
                          <Link href={guideHref(i)}>Ver la guía</Link>
                        ) : (
                          "Guía en preparación"
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DIMENSIONS.map((d) => (
                  <tr key={d.id}>
                    <th scope="row" className={styles.rowHead}>
                      {d.label}
                    </th>
                    {picked.map((i) => (
                      <td key={i.slug} className={styles.cell}>
                        <Value cell={COMPARE[i.slug][d.id]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul
            className={styles.cards}
            aria-label="Comparación en tarjetas"
            data-testid="compare-cards"
          >
            {picked.map((i) => (
              <li key={i.slug} className={styles.card}>
                <p className={styles.cardTitle}>{i.title}</p>
                <dl className={styles.dl}>
                  {DIMENSIONS.map((d) => (
                    <div key={d.id}>
                      <dt>{d.label}</dt>
                      <dd>
                        <Value cell={COMPARE[i.slug][d.id]} />
                      </dd>
                    </div>
                  ))}
                </dl>
                {i.status === "live" ? (
                  <Link href={guideHref(i)} className={styles.guide}>
                    Ver la guía
                  </Link>
                ) : (
                  <span className={styles.headNote}>Guía en preparación</span>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <p className={styles.foot}>
        Solo mostramos lo que la guía ya cita; el resto es «—». El sueldo es siempre por nivel y de
        un estudio con nombre, nunca de una firma concreta.
      </p>
    </div>
  );
}
