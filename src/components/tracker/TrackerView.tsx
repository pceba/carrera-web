"use client";

import { useCallback, useState, type DragEvent, type ReactNode } from "react";
import { Button, Notice, Tag } from "@/components/ui";
import { groupByStage, localDate, upcomingSteps } from "@/lib/tracker/derive";
import {
  computeStats,
  deadlineStatus,
  filterBySector,
  type SectorFilter,
} from "@/lib/tracker/insights";
import { INDUSTRY_LABELS } from "@/lib/postings/types";
import {
  INDUSTRY_SLUGS,
  STAGES,
  STAGE_LABELS,
  type Application,
  type ApplicationDraft,
  type Stage,
} from "@/lib/tracker/types";
import { ApplicationForm } from "./ApplicationForm";
import { ExportBar } from "./ExportBar";
import { UndoBar } from "./UndoBar";
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

/** The editable part of an entry, to put it back after "Deshacer". */
function toDraft(a: Application): ApplicationDraft {
  return {
    firm: a.firm,
    industry: a.industry,
    role: a.role,
    stage: a.stage,
    applied_on: a.applied_on,
    next_step: a.next_step,
    next_step_on: a.next_step_on,
    url: a.url,
    notes: a.notes,
  };
}

type Panel = null | "new" | string;
const DRAG_TYPE = "text/x-path-application";

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
  const [sector, setSector] = useState<SectorFilter>("all");
  const [announce, setAnnounce] = useState("");
  const [dragOver, setDragOver] = useState<Stage | null>(null);
  const [deleted, setDeleted] = useState<Application | null>(null);
  const dismissUndo = useCallback(() => setDeleted(null), []);

  if (items === null) {
    return (
      <p className={styles.note} aria-live="polite">
        Cargando…
      </p>
    );
  }

  const today = localDate();
  const editing = panel && panel !== "new" ? items.find((a) => a.id === panel) : undefined;
  const visible = filterBySector(items, sector);
  const grouped = groupByStage(visible);
  const upcoming = upcomingSteps(items, today);
  const stats = computeStats(items);

  async function run(job: Promise<string | null>) {
    const message = await job;
    setError(message);
    return message;
  }

  /** One path for the select, the keyboard and the pointer drag, so all three announce the move. */
  async function moveTo(a: Application, stage: Stage) {
    if (a.stage === stage) return;
    const message = await run(actions.move(a.id, stage));
    if (!message) setAnnounce(`${a.firm} movida a ${STAGE_LABELS[stage]}.`);
  }

  function onDragStart(e: DragEvent, a: Application) {
    e.dataTransfer.setData(DRAG_TYPE, a.id);
    e.dataTransfer.effectAllowed = "move";
  }
  function onDrop(e: DragEvent, stage: Stage) {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData(DRAG_TYPE);
    const a = items?.find((x) => x.id === id);
    if (a) void moveTo(a, stage);
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
                const gone = editing;
                if (!(await run(actions.remove(gone.id)))) {
                  setPanel(null);
                  setDeleted(gone);
                }
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
      <p role="status" aria-live="polite" className={styles.srOnly}>
        {announce}
      </p>

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
            <ExportBar items={items} />
          </div>

          {form}

          {items.length > 0 ? (
            <dl className={styles.stats} aria-label="Resumen">
              <div>
                <dt>Total</dt>
                <dd data-testid="stat-total">{stats.total}</dd>
              </div>
              <div>
                <dt>En proceso</dt>
                <dd data-testid="stat-progress">{stats.inProgress}</dd>
              </div>
              <div>
                <dt>Tasa de respuesta</dt>
                <dd data-testid="stat-rate">
                  {stats.responseRate === null ? "—" : `${stats.responseRate}%`}
                </dd>
              </div>
            </dl>
          ) : null}

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

          {items.length > 0 ? (
            <div className={styles.filter}>
              <label htmlFor="tracker-sector">Filtrar por sector</label>
              <select
                id="tracker-sector"
                className={styles.select}
                value={sector}
                onChange={(e) => setSector(e.target.value as SectorFilter)}
              >
                <option value="all">Todos</option>
                {INDUSTRY_SLUGS.map((slug) => (
                  <option key={slug} value={slug}>
                    {INDUSTRY_LABELS[slug]}
                  </option>
                ))}
                <option value="none">Sin sector</option>
              </select>
              {sector !== "all" ? (
                <span className={styles.note}>
                  {visible.length} de {items.length}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className={styles.board}>
            {STAGES.map(({ slug, label }) => {
              const column = grouped[slug];
              return (
                <section
                  key={slug}
                  className={`${styles.column} ${column.length === 0 ? styles.columnEmpty : ""} ${
                    dragOver === slug ? styles.dropTarget : ""
                  }`}
                  aria-labelledby={`stage-${slug}`}
                  onDragOver={(e) => {
                    if (e.dataTransfer.types.includes(DRAG_TYPE)) {
                      e.preventDefault();
                      setDragOver(slug);
                    }
                  }}
                  onDragLeave={() => setDragOver((cur) => (cur === slug ? null : cur))}
                  onDrop={(e) => onDrop(e, slug)}
                >
                  <h2 id={`stage-${slug}`} className={styles.columnTitle}>
                    {label} <span className={styles.count}>{column.length}</span>
                  </h2>
                  <ul className={styles.cards}>
                    {column.map((a) => {
                      const deadline = deadlineStatus(a, today);
                      return (
                        <li
                          key={a.id}
                          className={`${styles.card} ${deadline ? styles[deadline] : ""}`}
                          data-testid="application"
                          draggable
                          onDragStart={(e) => onDragStart(e, a)}
                        >
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
                              {deadline ? (
                                <span className={styles.deadlineTag} data-deadline={deadline}>
                                  {deadline === "overdue" ? "Vencido" : "Esta semana"}
                                </span>
                              ) : null}
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
                              <span className={styles.moveLabel}>Mover a…</span>
                              <span className={styles.srOnly}> Fase de {a.firm}</span>
                              <select
                                className={styles.select}
                                value={a.stage}
                                onChange={(e) => void moveTo(a, e.target.value as Stage)}
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
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      )}

      <UndoBar
        message={deleted ? `Has eliminado ${deleted.firm}.` : null}
        onDismiss={dismissUndo}
        onUndo={() => {
          const gone = deleted;
          setDeleted(null);
          if (gone) void run(actions.add(toDraft(gone)));
        }}
      />
    </div>
  );
}
