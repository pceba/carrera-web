"use client";

import { Button } from "@/components/ui";
import { INDUSTRY_LABELS } from "@/lib/postings/types";
import { nextStepsIcs, toCsv } from "@/lib/tracker/insights";
import type { Application } from "@/lib/tracker/types";

function download(name: string, mime: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${mime};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Everything is generated in the browser from the entries on screen; nothing is uploaded. */
export function ExportBar({ items }: { items: Application[] }) {
  const hasDated = nextStepsIcs(items) !== null;
  return (
    <>
      <Button
        variant="secondary"
        onClick={() =>
          download("candidaturas.csv", "text/csv", `﻿${toCsv(items, (i) => INDUSTRY_LABELS[i])}`)
        }
      >
        Exportar CSV
      </Button>
      <Button
        variant="secondary"
        disabled={!hasDated}
        title={hasDated ? undefined : "Añade fechas a tus próximos pasos"}
        onClick={() => {
          const ics = nextStepsIcs(items);
          if (ics) download("proximos-pasos.ics", "text/calendar", ics);
        }}
      >
        Añadir pasos al calendario (.ics)
      </Button>
    </>
  );
}
