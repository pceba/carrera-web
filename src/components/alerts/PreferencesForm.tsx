"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Button, Checkbox, Field, Fieldset, Input } from "@/components/ui";
import { loadProfile } from "@/components/match/profile-store";
import { ALERT_INDUSTRIES, toUiIndustry } from "@/lib/alerts/industries";
import { LIMITS } from "@/lib/alerts/validate";
import styles from "./alerts.module.css";

export interface FormValues {
  industries: string[]; // UI slugs
  roles: string;
  skills: string;
  locations: string;
  remote: "any" | "remote" | "onsite";
}

const noop = () => () => {};

/**
 * Preferences form. For a new subscription it starts from the Encaje profile saved in this browser
 * (if any); the form remounts once when that profile is read, so the fields stay uncontrolled.
 */
export function PreferencesForm({
  action,
  initial,
  prefillFromProfile,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial: FormValues;
  prefillFromProfile: boolean;
  submitLabel: string;
}) {
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const profile = useMemo(
    () => (hydrated && prefillFromProfile ? loadProfile() : null),
    [hydrated, prefillFromProfile],
  );

  const values: FormValues = profile
    ? {
        industries: profile.industries.flatMap((i) => toUiIndustry(i) ?? []),
        roles: profile.roles.join(", "),
        skills: profile.skills.join(", "),
        locations: profile.locations.join(", "),
        remote: profile.remote,
      }
    : initial;

  return (
    <form key={profile ? "from-profile" : "base"} action={action} className={styles.form}>
      {profile ? (
        <p className={styles.note}>
          Hemos rellenado esto con tu perfil de Encaje. Puedes cambiarlo.
        </p>
      ) : null}
      <Fieldset legend="Industrias">
        <div className={styles.checks}>
          {ALERT_INDUSTRIES.map((i) => (
            <Checkbox
              key={i.ui}
              name="industries"
              value={i.ui}
              defaultChecked={values.industries.includes(i.ui)}
            >
              {i.label}
            </Checkbox>
          ))}
        </div>
      </Fieldset>
      <Field
        id="al-roles"
        label="Puestos"
        hint={`Separados por comas, hasta ${LIMITS.roles}. Ej.: analista, becario`}
      >
        <Input id="al-roles" name="roles" defaultValue={values.roles} />
      </Field>
      <Field
        id="al-skills"
        label="Habilidades"
        hint={`Separadas por comas, hasta ${LIMITS.skills}. Ej.: SQL, Excel`}
      >
        <Input id="al-skills" name="skills" defaultValue={values.skills} />
      </Field>
      <Field
        id="al-locations"
        label="Ciudades"
        hint={`Separadas por comas, hasta ${LIMITS.locations}. Ej.: Madrid, Barcelona`}
      >
        <Input id="al-locations" name="locations" defaultValue={values.locations} />
      </Field>
      <Field id="al-remote" label="Trabajo remoto">
        <select id="al-remote" name="remote" className={styles.select} defaultValue={values.remote}>
          <option value="any">Me da igual</option>
          <option value="remote">Solo remoto</option>
          <option value="onsite">Solo presencial</option>
        </select>
      </Field>
      <div className={styles.actions}>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
