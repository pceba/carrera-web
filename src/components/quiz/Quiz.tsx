"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button, Tag } from "@/components/ui";
import { INDUSTRIES } from "../../../content/catalog";
import { QUESTIONS, QUIZ_INDUSTRIES, type QuizIndustry } from "@/lib/quiz/questions";
import { decodeAnswers, encodeAnswers, rank, reasons } from "@/lib/quiz/score";
import styles from "./quiz.module.css";

const HASH_KEY = "#r=";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const readHash = () => window.location.hash;

/** Moves the URL hash without adding history entries, and tells `useSyncExternalStore`. */
function setHash(value: string) {
  const url = window.location.pathname + window.location.search + value;
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event("hashchange"));
}

const labelOf = (slug: QuizIndustry) => QUIZ_INDUSTRIES.find((i) => i.slug === slug)!;
const isLive = (slug: string) => INDUSTRIES.find((i) => i.slug === slug)?.status === "live";

export function Quiz() {
  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const shared = hash.startsWith(HASH_KEY) ? decodeAnswers(hash.slice(HASH_KEY.length)) : null;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUESTIONS.map(() => null));

  function finish(final: (number | null)[]) {
    setHash(HASH_KEY + encodeAnswers(final));
  }
  function restart() {
    setAnswers(QUESTIONS.map(() => null));
    setStep(0);
    setHash("");
  }

  if (shared) return <Result answers={shared} onRepeat={restart} />;

  const question = QUESTIONS[step]!;
  const last = step === QUESTIONS.length - 1;
  const chosen = answers[step];

  return (
    <QuestionScreen
      key={step}
      step={step}
      focusOnMount={step > 0}
      question={question}
      chosen={chosen ?? null}
      onChoose={(i) => setAnswers((cur) => cur.map((a, q) => (q === step ? i : a)))}
      onBack={step > 0 ? () => setStep(step - 1) : undefined}
      onNext={() => (last ? finish(answers) : setStep(step + 1))}
      last={last}
    />
  );
}

function QuestionScreen({
  step,
  focusOnMount,
  question,
  chosen,
  onChoose,
  onBack,
  onNext,
  last,
}: {
  step: number;
  focusOnMount: boolean;
  question: (typeof QUESTIONS)[number];
  chosen: number | null;
  onChoose: (i: number) => void;
  onBack?: () => void;
  onNext: () => void;
  last: boolean;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusOnMount) titleRef.current?.focus();
  }, [focusOnMount]);

  const total = QUESTIONS.length;
  return (
    <section className={styles.screen} aria-labelledby="q-title">
      <div className={styles.progress}>
        <p className={styles.progressText}>
          {step + 1} de {total}
        </p>
        <div className={styles.track} aria-hidden="true">
          <div className={styles.fill} style={{ inlineSize: `${((step + 1) / total) * 100}%` }} />
        </div>
      </div>
      <form
        className={styles.question}
        onSubmit={(e) => {
          e.preventDefault();
          if (chosen !== null) onNext();
        }}
      >
        <h2 id="q-title" ref={titleRef} tabIndex={-1} className={styles.prompt}>
          {question.prompt}
        </h2>
        <div role="radiogroup" aria-labelledby="q-title" className={styles.options}>
          {question.options.map((option, i) => (
            <label key={option.label} className={styles.option}>
              <input
                type="radio"
                name={question.id}
                value={i}
                checked={chosen === i}
                onChange={() => onChoose(i)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        <div className={styles.nav}>
          {onBack ? (
            <Button variant="secondary" onClick={onBack}>
              Atrás
            </Button>
          ) : null}
          <Button type="submit" disabled={chosen === null}>
            {last ? "Ver resultado" : "Siguiente"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function Result({ answers, onRepeat }: { answers: number[]; onRepeat: () => void }) {
  const ranked = rank(answers);
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
  }

  return (
    <section className={styles.result} aria-labelledby="r-title">
      <h2 id="r-title" ref={titleRef} tabIndex={-1} className={styles.prompt}>
        Tu orientación
      </h2>
      <p className={styles.caveat}>Es una orientación, no un veredicto.</p>

      <ol className={styles.ranking}>
        {ranked.map((r, i) => {
          const meta = labelOf(r.slug);
          const top = i < 2;
          const live = isLive(r.slug);
          return (
            <li
              key={r.slug}
              className={`${styles.rank} ${top ? styles.top : ""}`}
              data-testid="ranked"
            >
              <div className={styles.rankHead}>
                <span className={styles.rankName}>{meta.label}</span>
                {top ? <Tag tone="accent">{i === 0 ? "Más cerca" : "Segunda opción"}</Tag> : null}
              </div>
              <div className={styles.bar} aria-hidden="true">
                <div
                  className={styles.barFill}
                  style={{ inlineSize: `${Math.max(r.percent, 4)}%` }}
                />
              </div>
              {top ? (
                <>
                  <ul className={styles.why}>
                    {reasons(answers, r.slug).map((text) => (
                      <li key={text}>{text}</li>
                    ))}
                  </ul>
                  <p className={styles.guide}>
                    {live ? (
                      <Link href={`/industrias/${r.slug}`}>Leer la guía de {meta.label}</Link>
                    ) : (
                      <>
                        Guía en preparación.{" "}
                        <Link href={`/ofertas?industria=${meta.offersSlug}`}>
                          Ver ofertas de {meta.label}
                        </Link>
                      </>
                    )}
                  </p>
                </>
              ) : live ? (
                <p className={styles.guide}>
                  <Link href={`/industrias/${r.slug}`}>Guía de {meta.label}</Link>
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className={styles.note}>
        Las barras muestran tendencias según tus respuestas, no una medida exacta.
      </p>
      <div className={styles.nav}>
        <Button variant="secondary" onClick={onRepeat}>
          Repetir
        </Button>
        <Button variant="secondary" onClick={copy}>
          Copiar enlace
        </Button>
      </div>
      <p role="status" className={styles.note}>
        {copied === "ok"
          ? "Enlace copiado."
          : copied === "fail"
            ? "No hemos podido copiarlo: copia la dirección de la barra del navegador."
            : ""}
      </p>
    </section>
  );
}
