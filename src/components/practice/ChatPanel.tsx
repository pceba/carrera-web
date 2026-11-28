"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { ChatMessage } from "@/lib/byok";
import { START_MESSAGE } from "@/lib/practice/modes";
import { Button } from "@/components/ui";
import styles from "./practice.module.css";

/** The conversation. The `[INICIO]` marker that opens every session is never shown. */
export function Bubbles({ messages, streaming }: { messages: ChatMessage[]; streaming?: string }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length, streaming]);

  const shown = messages.filter((m) => m.content !== START_MESSAGE);
  return (
    <div role="log" aria-live="polite" aria-label="Conversación" className={styles.log}>
      {shown.map((m, i) => (
        <div key={i} className={`${styles.bubble} ${m.role === "user" ? styles.me : styles.them}`}>
          <p className={styles.who}>{m.role === "user" ? "Tú" : "Entrevistador"}</p>
          <p className={styles.said}>{m.content}</p>
        </div>
      ))}
      {streaming ? (
        <div className={`${styles.bubble} ${styles.them}`}>
          <p className={styles.who}>Entrevistador</p>
          <p className={styles.said}>{streaming}</p>
        </div>
      ) : null}
      <div ref={end} />
    </div>
  );
}

export function Composer({
  busy,
  onSend,
  onStop,
}: {
  busy: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}) {
  const [text, setText] = useState("");

  function send() {
    const value = text.trim();
    if (!value || busy) return;
    setText("");
    onSend(value);
  }
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter adds a line. IME composition (accents, dead keys) must not send.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className={styles.composer}>
      <label htmlFor="respuesta" className={styles.composerLabel}>
        Tu respuesta
      </label>
      <textarea
        id="respuesta"
        className={styles.textarea}
        rows={3}
        value={text}
        disabled={busy}
        placeholder="Escribe y pulsa Intro para enviar (Mayús + Intro para una línea nueva)"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <div className={styles.composerActions}>
        {busy ? (
          <Button variant="secondary" onClick={onStop}>
            Detener
          </Button>
        ) : (
          <Button onClick={send} disabled={!text.trim()}>
            Enviar
          </Button>
        )}
      </div>
    </div>
  );
}
