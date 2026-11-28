"use client";

import { useSyncExternalStore } from "react";
import { ButtonLink, Heading, Text } from "@/components/ui";
import { loadProfile } from "@/components/match/profile-store";
import { loadLocal } from "@/lib/tracker/store";
import {
  currentStep,
  doneSteps,
  loadState,
  saveState,
  STEP_IDS,
  toggleStep,
  type OnboardingState,
  type StepId,
} from "@/lib/onboarding/state";
import styles from "./onboarding.module.css";

const STEPS: Record<StepId, { title: string; body: string; href: string; cta: string }> = {
  diagnostico: {
    title: "Haz el diagnóstico",
    body: "Ocho preguntas, un minuto. Te dice qué industria te queda más cerca, sin guardar tus respuestas.",
    href: "/diagnostico",
    cta: "Hacer el diagnóstico",
  },
  guia: {
    title: "Lee la guía de tu industria",
    body: "Cómo se entra, qué hacen en el día a día y cómo es el proceso de selección, con fuentes.",
    href: "/industrias",
    cta: "Elegir una guía",
  },
  encaje: {
    title: "Prueba Encaje",
    body: "Pega tu CV y compáralo con lo que piden las industrias. Se procesa en tu navegador.",
    href: "/encaje",
    cta: "Probar Encaje",
  },
  candidatura: {
    title: "Añade tu primera candidatura",
    body: "Apunta una oferta o proceso real en tu tablero para no perder el hilo.",
    href: "/candidaturas",
    cta: "Abrir candidaturas",
  },
};

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** One string snapshot of every browser-only input, so React can compare it by value. */
function getSnapshot(): string {
  const detected: OnboardingState = {};
  if (loadProfile()) detected.encaje = true;
  if (loadLocal().length > 0) detected.candidatura = true;
  return JSON.stringify({ state: loadState(), detected });
}

export function Onboarding() {
  // Server and first client render see "" (not ready); the real state arrives after hydration.
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "");
  const ready = snapshot !== "";
  const parsed = ready
    ? (JSON.parse(snapshot) as { state: OnboardingState; detected: OnboardingState })
    : { state: {}, detected: {} };
  const { state, detected } = parsed;

  const done = doneSteps(state, detected);
  const current = currentStep(done);
  const finished = ready && current === null;

  function toggle(id: StepId) {
    const next = toggleStep(state, id);
    saveState(next);
    listeners.forEach((cb) => cb());
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.count} aria-live="polite">
        {ready ? `${done.size} de ${STEP_IDS.length} pasos hechos` : " "}
      </p>
      <ol className={styles.rail}>
        {STEP_IDS.map((id, i) => {
          const step = STEPS[id];
          const isDone = done.has(id);
          const auto = Boolean(detected[id]);
          const isCurrent = ready && id === current;
          return (
            <li
              key={id}
              className={`${styles.step} ${isDone ? styles.done : ""} ${isCurrent ? styles.current : ""}`}
              aria-current={isCurrent ? "step" : undefined}
              data-testid={`step-${id}`}
            >
              <span className={styles.marker} aria-hidden="true">
                {isDone ? "✓" : i + 1}
              </span>
              <div className={styles.body}>
                <Heading level="h3">{step.title}</Heading>
                <Text>{step.body}</Text>
                <div className={styles.actions}>
                  <ButtonLink href={step.href} variant={isCurrent ? "accent" : "secondary"} arrow>
                    {step.cta}
                  </ButtonLink>
                  {auto ? (
                    <span className={styles.auto}>Detectado en este navegador</span>
                  ) : (
                    <label className={styles.check}>
                      <input
                        type="checkbox"
                        checked={Boolean(state[id])}
                        onChange={() => toggle(id)}
                      />
                      Hecho
                    </label>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {finished ? (
        <section className={styles.finish} aria-labelledby="finish-title">
          <Heading level="h2" id="finish-title">
            Ya tienes tu camino en marcha
          </Heading>
          <Text>
            Has recorrido los cuatro pasos. Ahora toca lo constante: revisar ofertas, preparar el
            proceso y mover tus candidaturas.
          </Text>
          <div className={styles.actions}>
            <ButtonLink href="/ofertas" variant="accent" arrow>
              Ver ofertas
            </ButtonLink>
            <ButtonLink href="/practica" variant="secondary">
              Practicar entrevistas
            </ButtonLink>
          </div>
        </section>
      ) : null}
    </div>
  );
}
