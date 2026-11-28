"use client";

/**
 * Last resort when the root layout itself fails: no shell, no tokens, so plain inline styles
 * (AA contrast: #0b0d10 on #eceef1).
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          padding: "4rem 1.25rem",
          background: "#eceef1",
          color: "#0b0d10",
          fontFamily: "system-ui, sans-serif",
          lineHeight: 1.5,
        }}
      >
        <main style={{ maxWidth: "40rem", margin: "0 auto" }}>
          <h1>Algo ha fallado</h1>
          <p>La web no ha podido cargar. Vuelve a intentarlo en unos segundos.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              font: "inherit",
              padding: "0.75rem 1.5rem",
              minHeight: 44,
              borderRadius: 999,
              border: 0,
              background: "#0b0d10",
              color: "#eceef1",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
