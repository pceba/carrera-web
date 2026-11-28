import type { Feedback } from "@/lib/practice/feedback";
import styles from "./practice.module.css";

/** Feedback as cards: summary, one card per rubric criterion, three next steps. */
export function FeedbackCards({ feedback }: { feedback: Feedback }) {
  return (
    <section aria-labelledby="feedback-titulo" className={styles.feedback}>
      <h2 id="feedback-titulo" className={styles.feedbackTitle}>
        Feedback de la sesión
      </h2>
      {feedback.summary ? <p className={styles.summary}>{feedback.summary}</p> : null}
      <ul className={styles.criteria}>
        {feedback.criteria.map((c) => (
          <li key={c.id} className={styles.criterion}>
            <p className={styles.criterionLabel}>{c.label}</p>
            <p className={styles.score}>
              {c.score ? (
                <>
                  <span className={styles.srOnly}>Puntuación: </span>
                  {c.score}
                  <span className={styles.scoreMax}>/5</span>
                </>
              ) : (
                <span className={styles.scoreMax}>Sin evaluar</span>
              )}
            </p>
            <span className={styles.pips} aria-hidden="true">
              {[1, 2, 3, 4, 5].map((n) => (
                <i key={n} data-on={n <= c.score || undefined} />
              ))}
            </span>
            {c.comment ? <p className={styles.criterionText}>{c.comment}</p> : null}
          </li>
        ))}
      </ul>
      {feedback.nextSteps.length ? (
        <div className={styles.steps}>
          <h3 className={styles.stepsTitle}>Siguientes pasos</h3>
          <ol>
            {feedback.nextSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      ) : null}
      <p className={styles.muted}>
        Este feedback lo escribe una IA a partir de la transcripción: úsalo como pista, no como
        veredicto.
      </p>
    </section>
  );
}
