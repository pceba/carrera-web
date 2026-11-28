"use client";

import { useState } from "react";
import { maskKey, PROVIDER_IDS, PROVIDERS, type ProviderId } from "@/lib/byok";
import { removeKey, storeKey, type StoredKey } from "@/lib/byok/use-key";
import { Button, Checkbox, Field, Input, toast } from "@/components/ui";
import styles from "./practice.module.css";

/**
 * Provider, key and model. The key is typed into a plain input (no <form>, no `name`), so it can
 * never be submitted or end up in a URL: it goes to sessionStorage (or localStorage if the user
 * asks) and later straight to the provider from `fetch`.
 */
export function KeyPanel({
  provider,
  onProvider,
  model,
  onModel,
  stored,
}: {
  provider: ProviderId;
  onProvider: (p: ProviderId) => void;
  model: string;
  onModel: (m: string) => void;
  stored: StoredKey;
}) {
  const info = PROVIDERS[provider];
  const [draft, setDraft] = useState("");
  const [remember, setRemember] = useState(false);

  function save() {
    const key = draft.trim();
    if (!key) return;
    if (storeKey(provider, key, remember)) {
      setDraft("");
      toast(remember ? "Clave guardada en este navegador" : "Clave guardada para esta pestaña");
    } else {
      toast("Tu navegador no deja guardar la clave. Funcionará hasta que recargues.");
    }
  }

  return (
    <section className={styles.card} aria-labelledby="clave-titulo">
      <h2 id="clave-titulo" className={styles.cardTitle}>
        1. Tu clave de IA
      </h2>

      <div role="radiogroup" aria-label="Proveedor" className={styles.providers}>
        {PROVIDER_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={id === provider}
            className={styles.provider}
            onClick={() => onProvider(id)}
          >
            {PROVIDERS[id].label}
          </button>
        ))}
      </div>
      <p className={styles.muted}>{info.blurb}</p>

      {stored ? (
        <div className={styles.keyOk}>
          <p className={styles.keyLine}>
            <span className={styles.dot} aria-hidden="true" />
            Clave guardada <code>{maskKey(stored.key)}</code>
            <span className={styles.muted}>
              {stored.remembered ? " · recordada en este navegador" : " · solo en esta pestaña"}
            </span>
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              removeKey(provider);
              toast("Clave borrada de este navegador");
            }}
          >
            Borrar clave
          </Button>
        </div>
      ) : (
        <div className={styles.keyForm}>
          <Field
            id="api-key"
            label={`Clave de ${info.label}`}
            hint="Se queda en tu navegador. Path no la ve ni la guarda."
          >
            <Input
              id="api-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="off"
              placeholder={info.keyPlaceholder}
              aria-describedby="api-key-hint"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  save();
                }
              }}
            />
          </Field>
          <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)}>
            Recordar en este navegador
          </Checkbox>
          <Button onClick={save} disabled={!draft.trim()}>
            Guardar clave
          </Button>
        </div>
      )}

      <Field id="api-model" label="Modelo" hint="Puedes cambiarlo por otro que tengas activo.">
        <Input
          id="api-model"
          value={model}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => onModel(e.target.value)}
          aria-describedby="api-model-hint"
        />
      </Field>

      <details className={styles.how}>
        <summary>¿Cómo consigo una clave de {info.label}?</summary>
        <ol>
          {info.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p>
          <a href={info.consoleUrl} target="_blank" rel="noopener noreferrer">
            Abrir la consola de {info.label} ↗
          </a>
        </p>
      </details>

      <p className={styles.cost}>
        <strong>Quién paga:</strong> las llamadas las factura tu proveedor a ti, según el modelo y
        el uso. Una sesión son pocas respuestas cortas, pero pon un límite de gasto en la consola y
        borra la clave cuando termines.
      </p>
    </section>
  );
}
