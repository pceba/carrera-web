"use client";

import { useId, useState } from "react";
import { Cite, Tag } from "@/components/ui";
import type { Firm } from "../../../../content/industrias/consultoria/firms";
import styles from "./firms.module.css";

const ALL = "Todas";
const yesNo = (v: boolean | null) => (v === null ? "Sin confirmar" : v ? "Sí" : "No");

/** Filterable firm list (type + city). Cards instead of a wide table so it works at 375 px. */
export function FirmsTable({ firms }: { firms: Firm[] }) {
  const uid = useId();
  const types = [ALL, ...Array.from(new Set(firms.map((f) => f.type)))];
  const [type, setType] = useState<string>(ALL);
  const [city, setCity] = useState<string>(ALL);

  const rows = firms.filter(
    (f) =>
      (type === ALL || f.type === type) &&
      (city === ALL ||
        (city === "Madrid" && f.madrid === true) ||
        (city === "Barcelona" && f.barcelona === true)),
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.filters}>
        <div>
          <label htmlFor={`${uid}-type`}>Tipo</label>
          <select id={`${uid}-type`} value={type} onChange={(e) => setType(e.target.value)}>
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${uid}-city`}>Oficina confirmada en</label>
          <select id={`${uid}-city`} value={city} onChange={(e) => setCity(e.target.value)}>
            {[ALL, "Madrid", "Barcelona"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <p role="status" className={styles.count}>
        {rows.length} {rows.length === 1 ? "empresa" : "empresas"}
      </p>
      <ul className={styles.list}>
        {rows.map((f) => (
          <li key={f.name} className={styles.row}>
            <h3 className={styles.name}>
              {f.name} <Tag tone="muted">{f.type}</Tag>
              {f.cite?.map((n) => (
                <Cite key={n} n={n} />
              ))}
            </h3>
            <dl className={styles.dl}>
              <dt>Madrid</dt>
              <dd>{yesNo(f.madrid)}</dd>
              <dt>Barcelona</dt>
              <dd>{yesNo(f.barcelona)}</dd>
              <dt>Entrada</dt>
              <dd>{f.entry}</dd>
            </dl>
            <a href={f.careersUrl} rel="noopener noreferrer" target="_blank">
              Web oficial de carreras<span className={styles.sr}> de {f.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
