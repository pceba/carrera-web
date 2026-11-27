"use client";

import { useId, useState } from "react";
import { Callout } from "@/components/ui";
import {
  CHECKLIST,
  CLARIFYING,
  EXPECTED_COFFEES,
  PASSENGERS_PER_DAY,
  PROMPT,
  SHARE_BUY_DRINK,
  SHARE_CAPTURE,
  SHARE_COFFEE,
  STRUCTURES,
  SYNTHESES,
} from "./case-data";
import { checkAnswer, checklistScore, choiceScore, type Choice } from "./case-logic";
import styles from "./case.module.css";

const STEPS = [
  "Enunciado",
  "Preguntas",
  "Estructura",
  "Datos",
  "Cálculo",
  "Síntesis",
  "Resultado",
] as const;

/** es-ES locale skips the dot for 4-digit numbers; always group so it matches the copy. */
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const pct = (n: number) => `${Math.round(n * 100)} %`;

function SingleChoice({
  name,
  legend,
  choices,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  choices: Choice[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  const picked = choices.find((c) => c.id === value);
  return (
    <fieldset className={styles.fieldset}>
      <legend>{legend}</legend>
      {choices.map((c) => (
        <label
          key={c.id}
          className={styles.option}
          data-verdict={value === c.id ? (c.good ? "good" : "bad") : undefined}
        >
          <input
            type="radio"
            name={name}
            checked={value === c.id}
            onChange={() => onChange(c.id)}
          />
          <span>{c.label}</span>
        </label>
      ))}
      <p
        role="status"
        className={styles.feedback}
        data-verdict={picked ? (picked.good ? "good" : "bad") : undefined}
      >
        {picked ? picked.feedback : ""}
      </p>
    </fieldset>
  );
}

/** The demand funnel of the model answer, drawn to scale (same fictional numbers as the exhibit). */
function Funnel() {
  const stages = [
    { label: "Viajeros al día", value: PASSENGERS_PER_DAY, share: null },
    {
      label: "Compran alguna bebida",
      value: PASSENGERS_PER_DAY * SHARE_BUY_DRINK,
      share: SHARE_BUY_DRINK,
    },
    {
      label: "Esa bebida es café",
      value: PASSENGERS_PER_DAY * SHARE_BUY_DRINK * SHARE_COFFEE,
      share: SHARE_COFFEE,
    },
    { label: "Eligen nuestro local", value: EXPECTED_COFFEES, share: SHARE_CAPTURE },
  ];
  return (
    <ol className={styles.funnel} aria-label="Embudo de demanda">
      {stages.map((st, i) => (
        <li key={st.label} className={styles.funnelRow}>
          <span className={styles.funnelLabel}>
            {st.share !== null ? (
              <span className={styles.funnelShare}>× {pct(st.share)}</span>
            ) : null}
            {st.label}
          </span>
          <span className={styles.funnelTrack} aria-hidden="true">
            <span
              className={styles.funnelBar}
              data-last={i === stages.length - 1}
              style={{ inlineSize: `${(st.value / PASSENGERS_PER_DAY) * 100}%` }}
            />
          </span>
          <span className={styles.funnelValue}>{fmt(Math.round(st.value))}</span>
        </li>
      ))}
    </ol>
  );
}

/** Step-by-step market-sizing case. Plain React state, no server, no AI. */
export function CaseSimulator() {
  const uid = useId();
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [structure, setStructure] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [ticks, setTicks] = useState<boolean[]>(CHECKLIST.map(() => false));

  const result = checked ? checkAnswer(answer, EXPECTED_COFFEES) : null;
  const passed = result?.status === "correct" || result?.status === "close";
  const canNext =
    step === 1
      ? questions.length > 0
      : step === 2
        ? structure !== null
        : step === 4
          ? passed
          : step === 5
            ? synthesis !== null
            : true;

  function reset() {
    setStep(0);
    setQuestions([]);
    setStructure(null);
    setAnswer("");
    setChecked(false);
    setSynthesis(null);
    setTicks(CHECKLIST.map(() => false));
  }

  const qScore = choiceScore(questions, CLARIFYING);
  const goodTotal = CLARIFYING.filter((c) => c.good).length;
  const selfScore = checklistScore(ticks.filter(Boolean).length, CHECKLIST.length);

  return (
    <section className={styles.case} aria-label="Caso interactivo de estimación de mercado">
      <div className={styles.head}>
        <p className={styles.stepLabel}>
          <span className={styles.stepCount}>
            Paso {step + 1} de {STEPS.length}
          </span>
          <span className={styles.stepName}>{STEPS[step]}</span>
        </p>
        <ol className={styles.progress} aria-label="Progreso del caso">
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === step ? "step" : undefined} data-done={i < step}>
              <span className={styles.progressText}>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.body}>
        {step === 0 && (
          <>
            <p className={styles.prompt}>{PROMPT}</p>
            <Callout tone="info" title="Cómo funciona">
              Sin IA, sin cuenta y sin enviar nada: todo ocurre en tu navegador. Cada paso te da
              pistas inmediatas.
            </Callout>
          </>
        )}

        {step === 1 && (
          <fieldset className={styles.fieldset}>
            <legend>Marca las preguntas que harías al entrevistador (algunas no sirven)</legend>
            {CLARIFYING.map((c) => (
              <label
                key={c.id}
                className={styles.option}
                data-verdict={questions.includes(c.id) ? (c.good ? "good" : "bad") : undefined}
              >
                <input
                  type="checkbox"
                  checked={questions.includes(c.id)}
                  onChange={(e) =>
                    setQuestions((q) =>
                      e.target.checked ? [...q, c.id] : q.filter((x) => x !== c.id),
                    )
                  }
                />
                <span>
                  {c.label}
                  {questions.includes(c.id) ? (
                    <em className={styles.inline}>{c.feedback}</em>
                  ) : null}
                </span>
              </label>
            ))}
          </fieldset>
        )}

        {step === 2 && (
          <SingleChoice
            name={`${uid}-structure`}
            legend="¿Cómo abordarías la estimación?"
            choices={STRUCTURES}
            value={structure}
            onChange={setStructure}
          />
        )}

        {step === 3 && (
          <table className={styles.table}>
            <caption>
              <span className={styles.exhibitN}>Exhibit 1</span> Datos de la estación (ficticios)
            </caption>
            <thead>
              <tr>
                <th scope="col">Dato</th>
                <th scope="col">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Viajeros por día laborable</th>
                <td>{fmt(PASSENGERS_PER_DAY)}</td>
              </tr>
              <tr>
                <th scope="row">Viajeros que compran alguna bebida en la estación</th>
                <td>{pct(SHARE_BUY_DRINK)}</td>
              </tr>
              <tr>
                <th scope="row">De esas bebidas, porcentaje que es café</th>
                <td>{pct(SHARE_COFFEE)}</td>
              </tr>
              <tr>
                <th scope="row">Cuota que captaría nuestro local frente a los demás</th>
                <td>{pct(SHARE_CAPTURE)}</td>
              </tr>
            </tbody>
          </table>
        )}

        {step === 4 && (
          <>
            <label htmlFor={`${uid}-answer`} className={styles.label}>
              ¿Cuántos cafés al día vendería el local? Escribe el número.
            </label>
            <div className={styles.row}>
              <input
                id={`${uid}-answer`}
                className={styles.input}
                inputMode="decimal"
                autoComplete="off"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setChecked(false);
                }}
              />
              <button type="button" className={styles.btn} onClick={() => setChecked(true)}>
                Comprobar
              </button>
            </div>
            <p
              role="status"
              className={styles.feedback}
              data-verdict={
                result
                  ? passed
                    ? "good"
                    : result.status === "invalid"
                      ? undefined
                      : "bad"
                  : undefined
              }
            >
              {result?.status === "invalid" && "Escribe solo un número, por ejemplo 1080."}
              {result?.status === "correct" && "Correcto."}
              {result?.status === "close" &&
                "Muy cerca: se acepta, pero revisa el redondeo en cada paso."}
              {result?.status === "wrong" &&
                "No coincide. Pista: multiplica los cuatro datos del exhibit, en orden."}
            </p>
          </>
        )}

        {step === 5 && (
          <SingleChoice
            name={`${uid}-synthesis`}
            legend="¿Cómo cierras la conversación con el cliente?"
            choices={SYNTHESES}
            value={synthesis}
            onChange={setSynthesis}
          />
        )}

        {step === 6 && (
          <>
            <h3 className={styles.h}>Respuesta modelo</h3>
            <Funnel />
            <p>
              {fmt(PASSENGERS_PER_DAY)} × {pct(SHARE_BUY_DRINK)} × {pct(SHARE_COFFEE)} ×{" "}
              {pct(SHARE_CAPTURE)} = <strong>{fmt(EXPECTED_COFFEES)} cafés al día</strong>.
              Comprobación de sensatez: repartidos en unas 16 horas abiertas son unos 68 cafés por
              hora, un ritmo plausible para un local pequeño.
            </p>
            <p>
              Preguntas útiles que marcaste: <strong>{qScore}</strong> de {goodTotal}.
            </p>
            <fieldset className={styles.fieldset}>
              <legend>Autoevaluación: marca lo que hiciste de verdad</legend>
              {CHECKLIST.map((item, i) => (
                <label key={item} className={styles.option}>
                  <input
                    type="checkbox"
                    checked={ticks[i] ?? false}
                    onChange={(e) =>
                      setTicks((t) => t.map((v, j) => (j === i ? e.target.checked : v)))
                    }
                  />
                  <span>{item}</span>
                </label>
              ))}
            </fieldset>
            <p role="status" className={styles.feedback}>
              Autoevaluación: {pct(selfScore)}. Lo que no marcaste es lo que conviene practicar en
              voz alta.
            </p>
          </>
        )}
      </div>

      <div className={styles.nav}>
        {step > 0 && (
          <button type="button" className={styles.btnGhost} onClick={() => setStep(step - 1)}>
            Atrás
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            className={styles.btn}
            disabled={!canNext}
            onClick={() => setStep(step + 1)}
          >
            Siguiente
          </button>
        ) : (
          <button type="button" className={styles.btnGhost} onClick={reset}>
            Empezar de nuevo
          </button>
        )}
      </div>
    </section>
  );
}
