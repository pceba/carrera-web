"use client";

import { useMemo, useSyncExternalStore } from "react";
import { ButtonLink, Tag } from "@/components/ui";
import { loadProfile } from "@/components/match/profile-store";
import { INDUSTRY_LABELS } from "@/lib/postings/types";
import styles from "./account-ui.module.css";

const noop = () => () => {};

/** The Encaje profile lives in this browser only, so the summary is read on the client. */
export function EncajeCard() {
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const profile = useMemo(() => (hydrated ? loadProfile() : null), [hydrated]);

  return (
    <section className={styles.card} aria-labelledby="hub-encaje">
      <h2 id="hub-encaje" className={styles.cardTitle}>
        Encaje
      </h2>
      {profile ? (
        <>
          <p>Tu perfil guardado en este navegador:</p>
          <p className={styles.row}>
            {profile.industries.length > 0 ? (
              profile.industries.map((i) => <Tag key={i}>{INDUSTRY_LABELS[i]}</Tag>)
            ) : (
              <span className={styles.muted}>Sin industrias elegidas</span>
            )}
          </p>
          <p className={styles.muted}>
            {profile.skills.length} habilidades · {profile.locations.length} ciudades
          </p>
          <div>
            <ButtonLink href="/encaje" variant="secondary">
              Ver mis ofertas
            </ButtonLink>
          </div>
        </>
      ) : (
        <>
          <p>
            Sube tu CV (se lee en tu navegador, no sale de él) y te ordenamos las ofertas según lo
            que encaja contigo.
          </p>
          <div>
            <ButtonLink href="/encaje" variant="secondary">
              Crear mi perfil
            </ButtonLink>
          </div>
        </>
      )}
    </section>
  );
}
