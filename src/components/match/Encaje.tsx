"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Industry } from "@/lib/generated/Industry";
import type { Profile } from "@/lib/generated/Profile";
import type { Ranked } from "@/lib/generated/Ranked";
import { INDUSTRY_LABELS, LEVELS, type Posting } from "@/lib/postings/types";
import { Button, Checkbox, Field, Fieldset, Input, Notice, Panel, Tag } from "@/components/ui";
import { cvKind, parseCv, rankPostings } from "./engine";
import {
  clearProfile,
  EMPTY_PROFILE,
  INDUSTRIES,
  loadProfile,
  parseList,
  saveProfile,
} from "./profile-store";
import styles from "./encaje.module.css";

const MAX_CV_BYTES = 5 * 1024 * 1024;
const SHOWN = 20;

const REMOTE_OPTIONS: { value: Profile["remote"]; label: string }[] = [
  { value: "any", label: "Me da igual" },
  { value: "remote", label: "Prefiero remoto" },
  { value: "onsite", label: "Prefiero presencial" },
];

type ListKey = "roles" | "skills" | "languages" | "locations";

const LIST_FIELDS: { key: ListKey; label: string; hint: string }[] = [
  {
    key: "roles",
    label: "Puestos que buscas",
    hint: "Separados por comas: analista, data scientist…",
  },
  { key: "skills", label: "Habilidades", hint: "Separadas por comas. Puedes añadir o quitar." },
  { key: "languages", label: "Idiomas", hint: "Separados por comas." },
  { key: "locations", label: "Ciudades", hint: "Separadas por comas." },
];

/**
 * CV -> profile -> ordered postings, all in the browser. The CV is read by the Rust engine
 * compiled to WebAssembly; nothing is uploaded. Only the structured profile is kept, in
 * `localStorage`.
 */
export function Encaje({ postings }: { postings: Posting[] }) {
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState<{ tone: "status" | "alert"; text: string } | null>(null);
  const [ranked, setRanked] = useState<Ranked[]>([]);
  const [engineError, setEngineError] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const fileId = useId();

  // Read the saved profile after mount (localStorage does not exist on the server).
  useEffect(() => {
    const saved = loadProfile();
    // Syncing from an external store (the browser's storage) once on mount is what effects are for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setProfile(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveProfile(profile);
  }, [profile, hydrated]);

  // Re-rank whenever the profile changes. The `cancelled` flag drops results of a stale run.
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    rankPostings(profile, postings)
      .then((result) => {
        if (!cancelled) {
          setRanked(result);
          setEngineError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setEngineError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [profile, postings, hydrated]);

  const update = useCallback((patch: Partial<Profile>) => {
    setProfile((p) => ({ ...p, ...patch }));
  }, []);

  async function onFile(file: File | undefined) {
    if (!file) return;
    const kind = cvKind(file.name);
    if (!kind) {
      setStatus({ tone: "alert", text: "Solo leemos archivos PDF, DOCX o TXT." });
      return;
    }
    if (file.size > MAX_CV_BYTES) {
      setStatus({ tone: "alert", text: "El archivo pesa más de 5 MB." });
      return;
    }
    try {
      const detected = await parseCv(new Uint8Array(await file.arrayBuffer()), kind);
      // Detected lists replace the old ones only when something was found; roles and the remote
      // preference are never detected, so they are kept.
      setProfile((p) => ({
        ...p,
        industries: detected.industries.length ? detected.industries : p.industries,
        skills: detected.skills.length ? detected.skills : p.skills,
        languages: detected.languages.length ? detected.languages : p.languages,
        locations: detected.locations.length ? detected.locations : p.locations,
        education: detected.education.length ? detected.education : p.education,
      }));
      const found = detected.skills.length + detected.languages.length + detected.locations.length;
      setStatus({
        tone: "status",
        text: found
          ? "Hemos leído tu CV en este navegador. Revisa lo detectado y corrígelo."
          : "No hemos detectado nada en el CV. Si es un PDF escaneado, prueba con un DOCX o TXT, o rellena los campos a mano.",
      });
    } catch (error) {
      setStatus({
        tone: "alert",
        text: error instanceof Error ? error.message : "No se ha podido leer el archivo.",
      });
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  function toggleIndustry(industry: Industry, on: boolean) {
    // The array order is the preference order, so a newly ticked industry goes last.
    update({
      industries: on
        ? [...profile.industries, industry]
        : profile.industries.filter((i) => i !== industry),
    });
  }

  function forget() {
    clearProfile();
    setProfile(EMPTY_PROFILE);
    setStatus({ tone: "status", text: "Hemos borrado tu perfil de este navegador." });
  }

  return (
    <div className={styles.stack}>
      <Panel title="1. Sube tu CV (opcional)">
        <p className={styles.privacy}>
          <strong>Tu CV no sale de tu navegador.</strong> Lo leemos aquí mismo, en tu dispositivo, y
          no se envía ni se guarda en ningún servidor. Solo guardamos en este navegador los datos
          del perfil que ves abajo, y puedes borrarlos cuando quieras.
        </p>
        <Field id={fileId} label="Archivo PDF, DOCX o TXT" hint="Máximo 5 MB.">
          <input
            id={fileId}
            ref={fileInput}
            type="file"
            accept=".pdf,.docx,.txt"
            aria-describedby={`${fileId}-hint`}
            className={styles.file}
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
        </Field>
        {status ? <Notice tone={status.tone}>{status.text}</Notice> : null}
      </Panel>

      <Panel title="2. Revisa tu perfil">
        <p className={styles.help}>
          Lo detectado es una sugerencia. Corrígelo: es lo que usamos para ordenar las ofertas.
        </p>
        <Fieldset legend="Sectores que te interesan">
          <p className={styles.help}>Marca los que quieras; el primero que marques pesa más.</p>
          <div className={styles.checks}>
            {INDUSTRIES.map((industry) => (
              <Checkbox
                key={industry}
                checked={profile.industries.includes(industry)}
                onChange={(e) => toggleIndustry(industry, e.target.checked)}
              >
                {INDUSTRY_LABELS[industry]}
              </Checkbox>
            ))}
          </div>
        </Fieldset>

        {LIST_FIELDS.map(({ key, label, hint }) => (
          <ListField
            key={key}
            id={`encaje-${key}`}
            label={label}
            hint={hint}
            values={profile[key]}
            onChange={(values) => update({ [key]: values })}
          />
        ))}

        <Fieldset legend="Trabajo en remoto">
          <div className={styles.checks}>
            {REMOTE_OPTIONS.map((option) => (
              <label key={option.value} className={styles.radio}>
                <input
                  type="radio"
                  name="remote"
                  value={option.value}
                  checked={profile.remote === option.value}
                  onChange={() => update({ remote: option.value })}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </Fieldset>

        {profile.education.length ? (
          <p className={styles.help}>
            Estudios detectados: {profile.education.join(" · ")}. No cambian el orden de las
            ofertas.
          </p>
        ) : null}

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={forget}>
            Borrar mi perfil de este navegador
          </Button>
        </div>
      </Panel>

      <section aria-labelledby="encaje-orden" className={styles.results}>
        <h2 id="encaje-orden" className={styles.resultsTitle}>
          3. Ofertas, ordenadas para ti
        </h2>
        <p className={styles.help}>
          Es un orden orientativo, no un veredicto: las ofertas solo traen el título, la empresa y
          el lugar, así que no podemos saber si encajas de verdad. Úsalo para decidir por dónde
          empezar a mirar.
        </p>
        {engineError ? (
          <Notice tone="alert">
            No hemos podido cargar el motor de ordenación. Recarga la página.
          </Notice>
        ) : null}
        {!engineError && postings.length === 0 ? (
          <p>Ahora mismo no hay ofertas publicadas.</p>
        ) : null}
        <ol className={styles.list} aria-live="polite">
          {ranked.slice(0, SHOWN).map((item) => {
            const posting = postings[item.index];
            if (!posting) return null;
            return (
              <li key={posting.id} className={styles.item}>
                <div className={styles.itemHead}>
                  <a href={posting.source_url} target="_blank" rel="noopener noreferrer">
                    {posting.title}
                  </a>
                  <p className={styles.meta}>
                    {posting.company} · {posting.city ?? posting.location ?? "Sin ubicación"}
                    {posting.remote ? " · remoto" : ""}
                  </p>
                </div>
                <div className={styles.tags}>
                  <Tag tone="muted">{INDUSTRY_LABELS[posting.industry]}</Tag>
                  <Tag tone="muted">{LEVELS[posting.level]}</Tag>
                </div>
                {item.reasons.length ? (
                  <ul className={styles.reasons} aria-label="Por qué aparece aquí">
                    {item.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.meta}>Sin coincidencias claras con tu perfil.</p>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

/**
 * A comma-separated text field backed by a string list. The draft text is local state so that
 * typing "SQL, " keeps the trailing comma and space; the list is parsed when the field changes.
 */
function ListField({
  id,
  label,
  hint,
  values,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [draft, setDraft] = useState(values.join(", "));
  const lastEmitted = useRef(values);

  // Follow outside changes (CV detected, profile loaded or cleared) but not our own edits.
  useEffect(() => {
    if (values !== lastEmitted.current) {
      lastEmitted.current = values;
      setDraft(values.join(", "));
    }
  }, [values]);

  return (
    <Field id={id} label={label} hint={hint}>
      <Input
        id={id}
        value={draft}
        aria-describedby={`${id}-hint`}
        onChange={(e) => {
          setDraft(e.target.value);
          const next = parseList(e.target.value);
          lastEmitted.current = next;
          onChange(next);
        }}
      />
    </Field>
  );
}
