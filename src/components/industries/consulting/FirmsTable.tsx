"use client";

import { useId, useState } from "react";
import { Cite } from "@/components/ui";
import type { Firm } from "../../../../content/industrias/consultoria/firms";
import styles from "./firms.module.css";

const ALL = "Todas";
const CITIES = [ALL, "Madrid", "Barcelona"] as const;

function Office({ city, value }: { city: string; value: boolean | null }) {
  const state = value === null ? "unknown" : value ? "yes" : "no";
  const text = value === null ? "Sin confirmar" : value ? "Sí" : "No";
  return (
    <span className={styles.office} data-state={state}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.city}>{city}</span>
      <span className={styles.officeText}>{text}</span>
    </span>
  );
}

function Chips({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className={styles.chips}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.chipRow}>
        {options.map((o) => (
          <label key={o} className={styles.chip}>
            <input
              type="radio"
              name={name}
              value={o}
              checked={value === o}
              onChange={() => onChange(o)}
            />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Filterable firm list (type + confirmed office). A real table from 56rem up; cards on phones.
 * Both views render the same filtered rows; CSS shows one of them.
 */
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

  const cites = (f: Firm) => f.cite?.map((n) => <Cite key={n} n={n} />);

  return (
    <div className={styles.wrap}>
      <div className={styles.filters}>
        <Chips name={`${uid}-type`} legend="Tipo" options={types} value={type} onChange={setType} />
        <Chips
          name={`${uid}-city`}
          legend="Oficina confirmada en"
          options={CITIES}
          value={city}
          onChange={setCity}
        />
      </div>
      <p role="status" className={styles.count}>
        {rows.length} {rows.length === 1 ? "empresa" : "empresas"}
      </p>

      {/* Phones: cards */}
      <ul className={styles.cards}>
        {rows.map((f) => (
          <li key={f.name} className={styles.card}>
            <p className={styles.type}>{f.type}</p>
            <h3 className={styles.name}>
              {f.name}
              {cites(f)}
            </h3>
            <div className={styles.offices}>
              <Office city="Madrid" value={f.madrid} />
              <Office city="Barcelona" value={f.barcelona} />
            </div>
            <p className={styles.entry}>{f.entry}</p>
            <a href={f.careersUrl} rel="noopener noreferrer" target="_blank" className={styles.out}>
              Web oficial de carreras<span className={styles.sr}> de {f.name}</span>
              <span aria-hidden="true"> ↗</span>
            </a>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.sr}>Firmas de consultoría en España</caption>
          <thead>
            <tr>
              <th scope="col">Firma</th>
              <th scope="col">Madrid</th>
              <th scope="col">Barcelona</th>
              <th scope="col">Vía de entrada</th>
              <th scope="col">
                <span className={styles.sr}>Enlace</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.name}>
                <th scope="row">
                  <span className={styles.type}>{f.type}</span>
                  <span className={styles.name}>
                    {f.name}
                    {cites(f)}
                  </span>
                </th>
                <td>
                  <Office city="Madrid" value={f.madrid} />
                </td>
                <td>
                  <Office city="Barcelona" value={f.barcelona} />
                </td>
                <td className={styles.entry}>{f.entry}</td>
                <td>
                  <a
                    href={f.careersUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                    className={styles.out}
                  >
                    Web<span className={styles.sr}> oficial de carreras de {f.name}</span>
                    <span aria-hidden="true"> ↗</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
