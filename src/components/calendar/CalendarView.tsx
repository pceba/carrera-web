"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Button, Tag, toast } from "@/components/ui";
import { buildIcs } from "@/lib/calendar/ics";
import {
  formatDate,
  groupByMonth,
  MONTHS_ES,
  statusLabel,
  statusOf,
  todayIso,
} from "@/lib/calendar/status";
import { addToLocalTracker } from "@/lib/calendar/tracker";
import { PROGRAMME_LABELS, type Programme, type Status } from "@/lib/calendar/types";
import { INDUSTRIES, type IndustrySlug } from "../../../content/catalog";
import styles from "./calendar.module.css";

const TONE: Record<Status, "success" | "accent" | "muted" | "neutral"> = {
  open: "success",
  soon: "accent",
  closed: "muted",
  nodates: "neutral",
};

const noop = () => () => {};

function downloadIcs(p: Programme) {
  const ics = buildIcs(p);
  if (!ics) return;
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${p.firm.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${p.programme}.ics`;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function addToTracker(p: Programme) {
  const result = addToLocalTracker(p);
  if (result === "added") toast(`${p.firm} añadida a tus candidaturas.`);
  else if (result === "exists") toast(`${p.firm} ya estaba en tus candidaturas.`);
  else toast("Tu navegador no deja guardar datos. No hemos podido añadirla.");
}

function Row({ p, status }: { p: Programme; status: Status }) {
  const dated = p.opens !== null || p.closes !== null;
  return (
    <li className={styles.row}>
      <div className={styles.rowHead}>
        <h3 className={styles.firm}>{p.firm}</h3>
        <Tag tone={TONE[status]}>{statusLabel(status)}</Tag>
        <Tag tone="muted">{PROGRAMME_LABELS[p.programme]}</Tag>
      </div>
      <p className={styles.dates}>
        {dated ? (
          <>
            {p.opens ? `Abre el ${formatDate(p.opens)}` : "Apertura sin fecha"}
            {" · "}
            {p.closes ? `cierra el ${formatDate(p.closes)}` : "cierre sin fecha"}
          </>
        ) : (
          "Fechas aún no publicadas · ver la web oficial"
        )}
      </p>
      <p className={styles.note}>{p.status_note}</p>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => addToTracker(p)}>
          Añadir a candidaturas
        </Button>
        <Button variant="ghost" disabled={!dated} onClick={() => downloadIcs(p)}>
          Añadir al calendario
        </Button>
        <a className={styles.source} href={p.source_url} target="_blank" rel="noopener noreferrer">
          Web oficial
          <span className={styles.sr}> de {p.firm} (se abre en una pestaña nueva)</span>
        </a>
      </div>
      <p className={styles.checked}>Comprobado el {formatDate(p.checked_at)}.</p>
    </li>
  );
}

/** Position of an ISO date inside the 12-month window as a 1-based month column. */
function column(iso: string, start: { y: number; m: number }): number {
  const [y, m] = iso.split("-").map(Number);
  return (y! - start.y) * 12 + (m! - 1 - start.m) + 1;
}

function Timeline({ rows, today }: { rows: Programme[]; today: string }) {
  const [ty, tm] = today.split("-").map(Number);
  const start = { y: ty!, m: tm! - 1 };
  const months = Array.from({ length: 12 }, (_, i) => {
    const idx = start.m + i;
    return { label: MONTHS_ES[idx % 12]!.slice(0, 3), year: start.y + Math.floor(idx / 12) };
  });
  return (
    <div className={styles.timeline} role="table" aria-label="Calendario de 12 meses">
      <div className={styles.tlHead} role="row">
        <span role="columnheader">Programa</span>
        {months.map((m) => (
          <span key={`${m.year}-${m.label}`} role="columnheader" className={styles.tlMonth}>
            {m.label}
          </span>
        ))}
      </div>
      {rows.map((p) => {
        const a = Math.max(1, column((p.opens ?? p.closes)!, start));
        const b = Math.min(12, column((p.closes ?? p.opens)!, start));
        const visible = b >= 1 && a <= 12 && a <= b;
        return (
          <div key={`${p.firm}-${p.programme}`} className={styles.tlRow} role="row">
            <span role="rowheader" className={styles.tlLabel}>
              {p.firm} · {PROGRAMME_LABELS[p.programme]}
            </span>
            <span role="cell" className={styles.tlTrack}>
              {visible ? (
                <span
                  className={styles.bar}
                  style={{ gridColumn: `${a} / ${b + 1}` }}
                  title={`${p.opens ?? "?"} → ${p.closes ?? "?"}`}
                />
              ) : (
                <span className={styles.outside}>Fuera de los próximos 12 meses</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function CalendarView({ programmes }: { programmes: Programme[] }) {
  const today = useSyncExternalStore(
    noop,
    () => todayIso(),
    () => null,
  );
  const [industry, setIndustry] = useState<IndustrySlug | null>(null);

  const rows = useMemo(
    () => programmes.filter((p) => industry === null || p.industry === industry),
    [programmes, industry],
  );
  const dated = rows.filter((p) => p.opens || p.closes);
  const undated = rows.filter((p) => !p.opens && !p.closes);
  const statusFor = (p: Programme): Status => (today ? statusOf(p, today) : "nodates");

  return (
    <div className={styles.view}>
      <div role="group" aria-label="Filtrar por industria" className={styles.chips}>
        <button
          type="button"
          className={styles.chip}
          aria-pressed={industry === null}
          onClick={() => setIndustry(null)}
        >
          Todas
        </button>
        {INDUSTRIES.map((i) => (
          <button
            key={i.slug}
            type="button"
            className={styles.chip}
            aria-pressed={industry === i.slug}
            onClick={() => setIndustry(i.slug)}
          >
            {i.title}
          </button>
        ))}
      </div>

      {dated.length > 0 && today ? (
        <section aria-labelledby="cal-fechas">
          <h2 id="cal-fechas" className={styles.h2}>
            Con fechas publicadas
          </h2>
          <div className={styles.desktopOnly}>
            <Timeline rows={dated} today={today} />
          </div>
          <div className={styles.mobileOnly}>
            {groupByMonth(dated).map((g) => (
              <div key={g.key}>
                <h3 className={styles.month}>{g.label}</h3>
                <ul className={styles.list}>
                  {g.rows.map((p) => (
                    <Row key={`${p.firm}-${p.programme}`} p={p} status={statusFor(p)} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <ul className={`${styles.list} ${styles.desktopOnly}`}>
            {dated.map((p) => (
              <Row key={`${p.firm}-${p.programme}`} p={p} status={statusFor(p)} />
            ))}
          </ul>
        </section>
      ) : (
        <p className={styles.empty}>
          Ninguna de las webs oficiales que hemos revisado publica todavía fechas de apertura o
          cierre para esta selección. Cuando lo hagan, aparecerán aquí en la línea de tiempo.
        </p>
      )}

      {undated.length > 0 && (
        <section aria-labelledby="cal-sin-fechas">
          <h2 id="cal-sin-fechas" className={styles.h2}>
            Fechas aún no publicadas
          </h2>
          <ul className={styles.list}>
            {undated.map((p) => (
              <Row key={`${p.firm}-${p.programme}`} p={p} status="nodates" />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
