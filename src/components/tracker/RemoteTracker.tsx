"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui";
import {
  addApplication,
  deleteApplication,
  importApplications,
  moveApplication,
  updateApplication,
} from "@/lib/tracker/actions";
import type { Application } from "@/lib/tracker/types";
import { TrackerView, type TrackerActions } from "./TrackerView";
import { useLocalApplications } from "./useLocalApplications";
import styles from "./tracker.module.css";

const byCreated = (a: Application, b: Application) => (a.created_at < b.created_at ? -1 : 1);

/** Tracker for a signed-in user: Supabase is the source of truth, the server re-validates. */
export function RemoteTracker({ initial }: { initial: Application[] }) {
  const [items, setItems] = useState(initial);
  const local = useLocalApplications();
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const actions = useMemo<TrackerActions>(
    () => ({
      async add(draft) {
        const r = await addApplication(draft);
        if (r.item) setItems((cur) => [...cur, r.item!].sort(byCreated));
        return r.error;
      },
      async update(id, draft) {
        const r = await updateApplication(id, draft);
        if (r.item) setItems((cur) => cur.map((a) => (a.id === id ? r.item! : a)));
        return r.error;
      },
      async move(id, stage) {
        const r = await moveApplication(id, stage);
        if (r.item) setItems((cur) => cur.map((a) => (a.id === id ? r.item! : a)));
        return r.error;
      },
      async remove(id) {
        const r = await deleteApplication(id);
        if (!r.error) setItems((cur) => cur.filter((a) => a.id !== id));
        return r.error;
      },
    }),
    [],
  );

  const pending = local.items?.length ?? 0;

  async function importLocal() {
    setImporting(true);
    setImportError(null);
    const r = await importApplications(local.items ?? []);
    setImporting(false);
    if (r.error || !r.items) {
      setImportError(r.error ?? "No hemos podido importarlas.");
      return;
    }
    setItems((cur) => [...cur, ...r.items!].sort(byCreated));
    local.clear();
  }

  const banner =
    pending > 0 ? (
      <div className={styles.banner} role="region" aria-label="Importar candidaturas">
        <p>
          Tienes {pending} {pending === 1 ? "candidatura guardada" : "candidaturas guardadas"} en
          este navegador.
          {importError ? ` ${importError}` : ""}
        </p>
        <Button variant="secondary" onClick={importLocal} disabled={importing}>
          {importing ? "Importando…" : "Importarlas a mi cuenta"}
        </Button>
      </div>
    ) : null;

  return (
    <TrackerView
      items={items}
      actions={actions}
      banner={banner}
      storageNote="Con tu cuenta, se guardan en ella y las ves desde cualquier dispositivo."
    />
  );
}
