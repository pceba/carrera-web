"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, Input, Notice } from "@/components/ui";
import { INDUSTRY_LABELS } from "@/lib/postings/types";
import {
  EMPTY_DRAFT,
  INDUSTRY_SLUGS,
  LIMITS,
  STAGES,
  type ApplicationDraft,
} from "@/lib/tracker/types";
import { validateDraft, type DraftErrors } from "@/lib/tracker/validate";
import styles from "./tracker.module.css";

const val = (v: string | null) => v ?? "";

/** Add/edit panel. Validates with the same rules as the server, then hands a clean draft up. */
export function ApplicationForm({
  initial,
  onSubmit,
  onCancel,
  onDelete,
}: {
  initial: ApplicationDraft | null;
  onSubmit: (draft: ApplicationDraft) => Promise<string | null> | string | null;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const editing = initial !== null;
  const start = initial ?? EMPTY_DRAFT;
  const [errors, setErrors] = useState<DraftErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const result = validateDraft(data);
    if (!result.ok) {
      setErrors(result.errors);
      setFormError(null);
      return;
    }
    setErrors({});
    setFormError((await onSubmit(result.value)) ?? null);
  }

  const err = (key: keyof ApplicationDraft) =>
    errors[key] ? (
      <span className={styles.fieldError} role="alert">
        {errors[key]}
      </span>
    ) : null;

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="tracker-form-title"
    >
      <h2 id="tracker-form-title" className={styles.formTitle}>
        {editing ? "Editar candidatura" : "Añadir candidatura"}
      </h2>

      <Field id="f-firm" label="Empresa *" hint={err("firm")}>
        <Input
          id="f-firm"
          name="firm"
          defaultValue={start.firm}
          maxLength={LIMITS.firm}
          required
          autoFocus
          aria-invalid={!!errors.firm}
        />
      </Field>
      <Field id="f-role" label="Puesto o programa" hint={err("role")}>
        <Input id="f-role" name="role" defaultValue={val(start.role)} maxLength={LIMITS.role} />
      </Field>

      <div className={styles.row}>
        <Field id="f-industry" label="Sector">
          <select
            id="f-industry"
            name="industry"
            className={styles.select}
            defaultValue={val(start.industry)}
          >
            <option value="">Sin indicar</option>
            {INDUSTRY_SLUGS.map((slug) => (
              <option key={slug} value={slug}>
                {INDUSTRY_LABELS[slug]}
              </option>
            ))}
          </select>
        </Field>
        <Field id="f-stage" label="Fase">
          <select id="f-stage" name="stage" className={styles.select} defaultValue={start.stage}>
            {STAGES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="f-applied" label="Fecha de envío" hint={err("applied_on")}>
        <Input id="f-applied" name="applied_on" type="date" defaultValue={val(start.applied_on)} />
      </Field>

      <div className={styles.row}>
        <Field id="f-next" label="Próximo paso" hint={err("next_step")}>
          <Input
            id="f-next"
            name="next_step"
            defaultValue={val(start.next_step)}
            maxLength={LIMITS.nextStep}
            placeholder="Ej.: Entrevista con RR. HH."
          />
        </Field>
        <Field id="f-next-on" label="Fecha del paso" hint={err("next_step_on")}>
          <Input
            id="f-next-on"
            name="next_step_on"
            type="date"
            defaultValue={val(start.next_step_on)}
          />
        </Field>
      </div>

      <Field id="f-url" label="Enlace a la oferta" hint={err("url") ?? "Solo https://"}>
        <Input
          id="f-url"
          name="url"
          type="url"
          inputMode="url"
          defaultValue={val(start.url)}
          maxLength={LIMITS.url}
          placeholder="https://"
        />
      </Field>

      <Field id="f-notes" label="Notas" hint={err("notes")}>
        <textarea
          id="f-notes"
          name="notes"
          className={styles.textarea}
          rows={4}
          maxLength={LIMITS.notes}
          defaultValue={val(start.notes)}
        />
      </Field>

      {formError ? <Notice tone="alert">{formError}</Notice> : null}

      <div className={styles.actions}>
        <Button type="submit">{editing ? "Guardar cambios" : "Guardar"}</Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        {editing && onDelete ? (
          confirmDelete ? (
            <Button variant="danger" onClick={onDelete}>
              Sí, eliminar
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
              Eliminar
            </Button>
          )
        ) : null}
      </div>
    </form>
  );
}
