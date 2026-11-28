"use client";

import { useEffect, useRef, useState } from "react";
import { ByokError, PROVIDERS, streamChat, type ChatMessage, type ProviderId } from "@/lib/byok";
import { useStoredKey } from "@/lib/byok/use-key";
import { DEMO } from "@/lib/practice/demo";
import { feedbackRequest, parseFeedback, type Feedback } from "@/lib/practice/feedback";
import { getMode, START_MESSAGE, type ModeId } from "@/lib/practice/modes";
import { transcriptText } from "@/lib/practice/transcript";
import { Button, Notice, WindowFrame, toast } from "@/components/ui";
import { Bubbles, Composer } from "./ChatPanel";
import { FeedbackCards } from "./FeedbackCards";
import { KeyPanel } from "./KeyPanel";
import { ModePicker } from "./ModePicker";
import styles from "./practice.module.css";

type Phase = "setup" | "chat" | "feedback";

/**
 * The practice workspace. Everything lives in this component's memory: the transcript is never
 * stored, and the only thing that leaves the tab is the request to the provider the user chose.
 */
export function PracticeApp() {
  const [provider, setProvider] = useState<ProviderId>("gemini");
  const [models, setModels] = useState<Record<ProviderId, string>>({
    gemini: PROVIDERS.gemini.defaultModel,
    anthropic: PROVIDERS.anthropic.defaultModel,
    openai: PROVIDERS.openai.defaultModel,
  });
  const [mode, setMode] = useState<ModeId>("consultoria");
  const [phase, setPhase] = useState<Phase>("setup");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [rawFeedback, setRawFeedback] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  const stored = useStoredKey(provider);
  const model = models[provider].trim() || PROVIDERS[provider].defaultModel;
  const modeInfo = getMode(mode);

  // Leaving the page cancels any reply in flight.
  useEffect(() => () => abort.current?.abort(), []);

  function describe(e: unknown): string {
    if (e instanceof ByokError) return e.message;
    return "Algo falló al hablar con el proveedor. Inténtalo de nuevo.";
  }

  /** Asks the model for the next reply to `history` and appends it. */
  async function run(history: ChatMessage[]) {
    if (!stored) return;
    setError(null);
    setBusy(true);
    setStreaming("");
    const controller = new AbortController();
    abort.current = controller;
    let partial = "";
    try {
      const reply = await streamChat(
        { provider, key: stored.key, model, system: modeInfo.system, messages: history },
        {
          signal: controller.signal,
          onText: (t) => {
            partial = t;
            setStreaming(t);
          },
        },
      );
      setMessages([...history, { role: "assistant", content: reply }]);
    } catch (e) {
      if (controller.signal.aborted) {
        // The user pressed "Detener": keep what had arrived so far.
        if (partial.trim()) setMessages([...history, { role: "assistant", content: partial }]);
      } else {
        setError(describe(e));
      }
    } finally {
      setStreaming("");
      setBusy(false);
      abort.current = null;
    }
  }

  function start() {
    const first: ChatMessage[] = [{ role: "user", content: START_MESSAGE }];
    setMessages(first);
    setFeedback(null);
    setRawFeedback(null);
    setPhase("chat");
    void run(first);
  }

  function send(text: string) {
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    void run(next);
  }

  async function finish() {
    if (!stored) return;
    setError(null);
    setBusy(true);
    const controller = new AbortController();
    abort.current = controller;
    try {
      const req = feedbackRequest(modeInfo, messages);
      const text = await streamChat(
        { provider, key: stored.key, model, maxTokens: 1500, ...req },
        { signal: controller.signal },
      );
      const parsed = parseFeedback(text, modeInfo);
      setFeedback(parsed);
      setRawFeedback(parsed ? null : text);
      setPhase("feedback");
    } catch (e) {
      if (!controller.signal.aborted) setError(describe(e));
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }

  function reset() {
    abort.current?.abort();
    setPhase("setup");
    setMessages([]);
    setFeedback(null);
    setRawFeedback(null);
    setError(null);
  }

  function download() {
    const text = transcriptText(modeInfo, messages, feedback);
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `practica-${mode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Transcripción descargada");
  }

  const userTurns = messages.filter((m) => m.role === "user" && m.content !== START_MESSAGE).length;
  const lastIsUser = messages.at(-1)?.role === "user";

  return (
    <div className={styles.layout}>
      <div className={styles.side}>
        <KeyPanel
          provider={provider}
          onProvider={setProvider}
          model={models[provider]}
          onModel={(m) => setModels((s) => ({ ...s, [provider]: m }))}
          stored={stored}
        />
        <ModePicker value={mode} onChange={setMode} disabled={phase !== "setup"} />
      </div>

      <div className={styles.stage}>
        <WindowFrame address={`path.app/practica · ${modeInfo.title.toLowerCase()}`}>
          <div className={styles.stageBody}>
            {phase === "setup" ? (
              <>
                <div className={styles.demoHead}>
                  <p className={styles.tag}>Ejemplo</p>
                  <p className={styles.muted}>
                    Así suena una sesión de «{modeInfo.title}». Datos inventados.
                  </p>
                </div>
                <Bubbles messages={DEMO[mode]} />
                <div className={styles.startRow}>
                  <Button size="lg" onClick={start} disabled={!stored}>
                    Empezar la práctica
                  </Button>
                  {!stored ? (
                    <p className={styles.muted}>
                      Guarda una clave de {PROVIDERS[provider].label} para empezar.
                    </p>
                  ) : (
                    <p className={styles.muted}>
                      Usaré {PROVIDERS[provider].label} con el modelo <code>{model}</code>.
                    </p>
                  )}
                </div>
              </>
            ) : null}

            {phase === "chat" ? (
              <>
                <Bubbles messages={messages} streaming={streaming} />
                {busy && !streaming ? (
                  <p className={styles.muted} role="status">
                    El entrevistador está pensando…
                  </p>
                ) : null}
                {error ? (
                  <div className={styles.errorBox}>
                    <Notice tone="alert">{error}</Notice>
                    {lastIsUser ? (
                      <Button variant="secondary" onClick={() => void run(messages)}>
                        Reintentar
                      </Button>
                    ) : null}
                  </div>
                ) : null}
                <Composer busy={busy} onSend={send} onStop={() => abort.current?.abort()} />
                <div className={styles.toolbar}>
                  <Button
                    variant="secondary"
                    onClick={() => void finish()}
                    disabled={busy || userTurns < 1}
                  >
                    Terminar y pedir feedback
                  </Button>
                  <Button variant="ghost" onClick={download} disabled={userTurns < 1}>
                    Descargar transcripción
                  </Button>
                  <Button variant="ghost" onClick={reset}>
                    Empezar de nuevo
                  </Button>
                </div>
              </>
            ) : null}

            {phase === "feedback" ? (
              <>
                {feedback ? (
                  <FeedbackCards feedback={feedback} />
                ) : (
                  <div className={styles.rawFeedback}>
                    <Notice tone="alert">
                      No pude convertir el feedback en tarjetas. Aquí tienes el texto tal cual.
                    </Notice>
                    <p className={styles.said}>{rawFeedback}</p>
                  </div>
                )}
                <div className={styles.toolbar}>
                  <Button onClick={download}>Descargar transcripción</Button>
                  <Button variant="secondary" onClick={reset}>
                    Nueva sesión
                  </Button>
                </div>
              </>
            ) : null}
            {phase !== "chat" && error ? <Notice tone="alert">{error}</Notice> : null}
          </div>
        </WindowFrame>
      </div>
    </div>
  );
}
