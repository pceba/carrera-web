"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Dialog, Tag, toast } from "@/components/ui";
import { loadProfile } from "@/components/match/profile-store";
import { loadLocal, saveLocal } from "@/lib/tracker/store";
import {
  CITIES,
  INDUSTRY_LABELS,
  LEVELS,
  sourceLabel,
  type Filters,
  type Industry,
  type Level,
  type Posting,
} from "@/lib/postings/types";
import {
  buildHref,
  isCompanyBoard,
  isNew,
  orderByRanking,
  postingToApplication,
  searchPostings,
  type SortMode,
} from "./logic";
import styles from "./postings.module.css";

function formatPosted(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function Wordmark({ name }: { name: string }) {
  return (
    <span className={styles.wordmark}>
      <span className={styles.monogram} aria-hidden="true">
        {name.trim().charAt(0).toUpperCase()}
      </span>
      <span className={styles.firm}>{name}</span>
    </span>
  );
}

function Chips<T extends string>({
  label,
  items,
  active,
  hrefFor,
}: {
  label: string;
  items: { value: T; label: string }[];
  active?: T;
  hrefFor: (value: T | undefined) => string;
}) {
  return (
    <div className={styles.group} role="group" aria-label={label}>
      <span className={styles.groupLabel}>{label}</span>
      <div className={styles.chips}>
        <Link
          href={hrefFor(undefined)}
          scroll={false}
          className={styles.chip}
          aria-current={active ? undefined : "true"}
        >
          Todas
        </Link>
        {items.map((i) => (
          <Link
            key={i.value}
            href={hrefFor(i.value)}
            scroll={false}
            className={styles.chip}
            aria-current={active === i.value ? "true" : undefined}
          >
            {i.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function PostingsBrowser({
  postings,
  filters,
  initialQuery,
  initialSort,
  pageSize,
}: {
  postings: Posting[];
  filters: Filters;
  initialQuery: string;
  initialSort: SortMode;
  pageSize: number;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortMode>(initialSort);
  const [hasProfile, setHasProfile] = useState(false);
  const [ranking, setRanking] = useState<{ index: number }[] | null>(null);
  const [rankError, setRankError] = useState(false);
  const [open, setOpen] = useState<Posting | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  // Browser-only state: the profile (localStorage) and the clock, read after hydration.
  useEffect(() => {
    void Promise.resolve().then(() => {
      setHasProfile(loadProfile() !== null);
      setNow(Date.now());
    });
  }, []);

  // Keep search and sort in the URL without a server round trip.
  useEffect(() => {
    const href = buildHref({ ...filters, q: query, sort });
    if (href !== window.location.pathname + window.location.search) {
      window.history.replaceState(window.history.state, "", href);
    }
  }, [filters, query, sort]);

  const effectiveSort: SortMode = sort === "encaje" && hasProfile ? "encaje" : "recientes";

  useEffect(() => {
    if (effectiveSort !== "encaje") return;
    const profile = loadProfile();
    if (!profile) return;
    let cancelled = false;
    import("@/components/match/engine")
      .then((m) => m.rankPostings(profile, postings))
      .then((r) => {
        if (cancelled) return;
        setRankError(false);
        setRanking(r);
      })
      .catch(() => {
        if (!cancelled) setRankError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [effectiveSort, postings]);

  const shown = useMemo(() => {
    const ordered =
      effectiveSort === "encaje" && ranking && !rankError
        ? orderByRanking(postings, ranking)
        : postings;
    return searchPostings(ordered, query);
  }, [postings, ranking, rankError, effectiveSort, query]);

  const hrefWith = (patch: Partial<Filters>) => buildHref({ ...filters, ...patch, q: query, sort });
  const filtered = Boolean(filters.industry || filters.level || filters.city || filters.remote);
  const searching = query.trim() !== "";

  function addToTracker(p: Posting) {
    const items = loadLocal();
    if (items.some((a) => a.url === p.source_url)) {
      toast("Ya está en tus candidaturas.");
      return;
    }
    const ok = saveLocal([postingToApplication(p), ...items]);
    toast(
      ok
        ? `${p.company} añadida a tus candidaturas.`
        : "Tu navegador no deja guardar: no se ha añadido.",
    );
  }

  const openSrc = open ? sourceLabel(open) : null;
  const openPosted = open ? formatPosted(open.posted_at) : null;

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.tools}>
          <label className={styles.search}>
            <span>Buscar</span>
            <input
              type="search"
              value={query}
              maxLength={80}
              placeholder="Empresa, puesto o ciudad"
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className={styles.sort}>
            <span>Ordenar</span>
            <select
              value={effectiveSort}
              onChange={(e) => setSort(e.target.value === "encaje" ? "encaje" : "recientes")}
            >
              <option value="recientes">Más recientes</option>
              {hasProfile ? <option value="encaje">Encaje con tu perfil</option> : null}
            </select>
          </label>
        </div>
        <Chips<Industry>
          label="Industria"
          items={Object.entries(INDUSTRY_LABELS).map(([value, label]) => ({
            value: value as Industry,
            label,
          }))}
          active={filters.industry}
          hrefFor={(v) => hrefWith({ industry: v })}
        />
        <Chips<Level>
          label="Nivel"
          items={Object.entries(LEVELS).map(([value, label]) => ({
            value: value as Level,
            label,
          }))}
          active={filters.level}
          hrefFor={(v) => hrefWith({ level: v })}
        />
        <Chips<string>
          label="Ciudad"
          items={CITIES}
          active={filters.city}
          hrefFor={(v) => hrefWith({ city: v })}
        />
        <div className={styles.group} role="group" aria-label="Modalidad">
          <span className={styles.groupLabel}>Modalidad</span>
          <div className={styles.chips}>
            <Link
              href={hrefWith({ remote: filters.remote ? undefined : true })}
              scroll={false}
              className={styles.chip}
              aria-current={filters.remote ? "true" : undefined}
            >
              Solo remoto
            </Link>
          </div>
        </div>
      </div>

      <section className={styles.results} aria-label="Resultados" aria-live="polite">
        {effectiveSort === "encaje" && ranking && !rankError ? (
          <p className={styles.note}>
            Orden según tu perfil, solo por los títulos: es un orden, no un veredicto.
          </p>
        ) : null}
        {rankError ? (
          <p className={styles.note}>
            No se ha podido calcular el encaje; se muestran las recientes.
          </p>
        ) : null}

        {shown.length === 0 ? (
          <Card
            title={
              searching
                ? "Nada coincide con tu búsqueda"
                : filtered
                  ? "Ninguna oferta con esos filtros"
                  : "Aún no hay ofertas"
            }
            headingLevel="h2"
            muted
          >
            {searching
              ? "Prueba con otra palabra o borra la búsqueda."
              : filtered
                ? "Prueba con menos filtros o quita la ciudad. Algunas industrias tienen pocas ofertas públicas."
                : "Estamos conectando las fuentes. Vuelve en unos días: la lista se rellena sola cada mañana."}
            {filtered || searching ? (
              <>
                {" "}
                <Link href="/ofertas" className={styles.reset} onClick={() => setQuery("")}>
                  Quitar filtros
                </Link>
              </>
            ) : null}
          </Card>
        ) : (
          <>
            <p className={styles.count}>
              {postings.length >= pageSize && !searching
                ? `Las ${pageSize} más recientes`
                : `${shown.length} ${shown.length === 1 ? "oferta" : "ofertas"}`}
            </p>
            <ul className={styles.list}>
              {shown.map((p) => {
                const src = sourceLabel(p);
                const posted = formatPosted(p.posted_at);
                const where = [
                  p.city ?? p.location,
                  p.remote && !p.location?.toLowerCase().includes("remot") ? "Remoto" : null,
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <li key={p.id} className={styles.card} data-testid="posting">
                    <div className={styles.cardTop}>
                      <Wordmark name={p.company} />
                      {now !== null && isNew(p, now) ? <Tag tone="success">Nueva</Tag> : null}
                    </div>
                    <h2 className={styles.title}>
                      <button
                        type="button"
                        className={styles.titleButton}
                        onClick={(e) => {
                          opener.current = e.currentTarget;
                          setOpen(p);
                        }}
                      >
                        {p.title}
                      </button>
                    </h2>
                    <p className={styles.chipsRow}>
                      <Tag tone="accent">{LEVELS[p.level] ?? p.level}</Tag>
                      <Tag>{INDUSTRY_LABELS[p.industry] ?? INDUSTRY_LABELS.other}</Tag>
                    </p>
                    {where ? <p className={styles.where}>{where}</p> : null}
                    <p className={styles.meta}>
                      Fuente: {src.name}
                      {posted ? ` · ${posted}` : ""}
                    </p>
                    <div className={styles.actions}>
                      <Button variant="secondary" onClick={() => addToTracker(p)}>
                        Añadir a candidaturas
                        <span className={styles.sr}>
                          {" "}
                          ({p.title}, {p.company})
                        </span>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      <Dialog
        open={open !== null}
        onClose={() => {
          setOpen(null);
          opener.current?.focus();
        }}
        title={open?.title ?? "Oferta"}
      >
        {open && openSrc ? (
          <div className={styles.detail}>
            <Wordmark name={open.company} />
            <p className={styles.chipsRow}>
              <Tag tone="accent">{LEVELS[open.level] ?? open.level}</Tag>
              <Tag>{INDUSTRY_LABELS[open.industry] ?? INDUSTRY_LABELS.other}</Tag>
              {open.remote ? <Tag tone="muted">Remoto</Tag> : null}
            </p>
            {open.location ? <p className={styles.where}>{open.location}</p> : null}
            <p className={styles.meta}>
              Fuente:{" "}
              {openSrc.url ? (
                <a
                  className={open.source === "adzuna" ? styles.adzuna : undefined}
                  href={openSrc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {openSrc.name}
                </a>
              ) : (
                openSrc.name
              )}
              {openPosted ? ` · ${openPosted}` : ""}
            </p>
            <p className={styles.meta}>
              Solo mostramos el título y los datos básicos. Confirma en el anuncio que sigue
              abierto.
            </p>
            <div className={styles.dialogActions}>
              <a
                className={styles.primaryLink}
                href={open.source_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                {isCompanyBoard(open)
                  ? "Solicitar en la web de la empresa"
                  : "Ver el anuncio original"}
                <span className={styles.sr}> (se abre en otra pestaña)</span>
              </a>
              <Button variant="secondary" onClick={() => addToTracker(open)}>
                Añadir a candidaturas
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
