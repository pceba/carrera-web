"use client";

import { useState, type ReactNode } from "react";
import { Button, Notice, Tag } from "@/components/ui";
import { groupByStage, localDate, upcomingSteps } from "@/lib/tracker/derive";
import { INDUSTRY_LABELS } from "@/lib/postings/types";
import {
  STAGES,
  STAGE_LABELS,
  type Application,
  type ApplicationDraft,
  type Stage,
} from "@/lib/tracker/types";
import { ApplicationForm } from "./ApplicationForm";
import styles from "./tracker.module.css";

/** Where the data lives and how to change it. Returns an error message, or null on success. */
export interface TrackerActions {
  add(draft: ApplicationDraft): Promise<string | null>;
  update(id: string, draft: ApplicationDraft): Promise<string | null>;
  move(id: string, stage: Stage): Promise<string | null>;
  remove(id: string): Promise<string | null>;
}

const dateFmt = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" });
function formatDay(iso: string): string {
  return dateFmt.format(new Date(`${iso}T00:00:00`));
}

type Panel = null | "new" | string;

export function TrackerView({
  items,
  actions,
  storageNote,
  persisted = true,
  banner,
}: {
  /** `null` while the browser has not loaded yet. */
  items: Application[] | null;
  actions: TrackerActions;
  /** Where entries are stored, said in plain words at the top. */
  storageNote: ReactNode;
  persisted?: boolean;
  banner?: ReactNode;
}) {
  const [panel, setPanel] = useState<Panel>(null);
  const [error, setError] = useState<string | null>(null);

  if (items === null) {
    return (
      <p className={styles.note} aria-live="polite">
        Cargando…
      </p>
    );
  }

  const editing = panel && panel !== "new" ? items.find((a) => a.id === panel) : undefined;
  const grouped = groupByStage(items);
  const upcoming = upcomingSteps(items, localDate());

  async function run(job: Promise<string | null>) {
    const message = await job;
    setError(message);
    return message;
  }

  const form =
    panel === "new" || editing ? (
      <ApplicationForm
        key={panel}
        initial={editing ?? null}
        onCancel={() => setPanel(null)}
        onSubmit={async (draft) => {
          const message = await run(
            editing ? actions.update(editing.id, draft) : actions.add(draft),
          );
          if (!message) setPanel(null);
          return message;
        }}
        onDelete={
          editing
            ? async () => {
                if (!(await run(actions.remove(editing.id)))) setPanel(null);
              }
            : undefined
        }
      />
    ) : null;

  return (
    <div className={styles.tracker}>
      <p className={styles.note}>{storageNote}</p>
      {!persisted ? (
        <Notice tone="alert">
          Tu navegador no deja guardar datos: las candidaturas se perderán al cerrar o recargar la
          página.
        </Notice>
      ) : null}
      {banner}
      {error ? <Notice tone="alert">{error}</Notice> : null}

      {items.length === 0 && !form ? (
        <section className={styles.empty} aria-labelledby="tracker-empty">
          <h2 id="tracker-empty" className={styles.emptyTitle}>
            Aún no has añadido ninguna candidatura
          </h2>
          <p>
            Apunta a qué empresas te presentas y en qué fase está cada una. Así ves de un vistazo
            qué toca hacer esta semana.
          </p>
          <div>
            <Button onClick={() => setPanel("new")}>Añadir la primera</Button>
          </div>
        </section>
      ) : (
        <>
          <div className={styles.toolbar}>
            <Button onClick={() => setPanel("new")} disabled={panel === "new"}>
              Añadir candidatura
            </Button>
          </div>

          {form}

          {upcoming.length > 0 ? (
            <section className={styles.upcoming} aria-labelledby="tracker-upcoming">
              <h2 id="tracker-upcoming" className={styles.upcomingTitle}>
                Próximos 14 días
              </h2>
              <ul className={styles.upcomingList}>
                {upcoming.map((a) => (
                  <li key={a.id}>
                    <span className={styles.mono}>{formatDay(a.next_step_on!)}</span>{" "}
                    <strong>{a.firm}</strong>: {a.next_step ?? "Próximo paso"}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className={styles.board}>
            {STAGES.map(({ slug, label }) => {
              const column = grouped[slug];
              return (
                <section
                  key={slug}
                  className={`${styles.column} ${column.length === 0 ? styles.columnEmpty : ""}`}
                  aria-labelledby={`stage-${slug}`}
                >
                  <h2 id={`stage-${slug}`} className={styles.columnTitle}>
                    {label} <span className={styles.count}>{column.length}</span>
                  </h2>
                  <ul className={styles.cards}>
                    {column.map((a) => (
                      <li key={a.id} className={styles.card} data-testid="application">
                        <p className={styles.firm}>{a.firm}</p>
                        {a.role ? <p className={styles.role}>{a.role}</p> : null}
                        {a.industry ? (
                          <p>
                            <Tag tone="muted">{INDUSTRY_LABELS[a.industry]}</Tag>
                          </p>
                        ) : null}
                        {a.next_step || a.next_step_on ? (
                          <p className={styles.next}>
                            <span className={styles.mono}>
                              {a.next_step_on ? formatDay(a.next_step_on) : ""}
                            </span>{" "}
                            {a.next_step ?? ""}
                          </p>
                        ) : null}
                        {a.url ? (
                          <p>
                            <a href={a.url} target="_blank" rel="noopener noreferrer">
                              Ver oferta
                            </a>
                          </p>
                        ) : null}
                        <div className={styles.cardActions}>
                          <label className={styles.stageLabel}>
                            <span className={styles.srOnly}>Fase de {a.firm}</span>
                            <select
                              className={styles.select}
                              value={a.stage}
                              onChange={(e) =>
                                void run(actions.move(a.id, e.target.value as Stage))
                              }
                            >
                              {STAGES.map((s) => (
                                <option key={s.slug} value={s.slug}>
                                  {STAGE_LABELS[s.slug]}
                                </option>
                              ))}
                            </select>
                          </label>
                          <Button
                            variant="secondary"
                            onClick={() => setPanel(a.id)}
                            aria-label={`Editar ${a.firm}`}
                          >
                            Editar
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
