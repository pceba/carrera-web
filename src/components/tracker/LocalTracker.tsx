"use client";

import { useMemo } from "react";
import { newId } from "@/lib/tracker/store";
import type { Application } from "@/lib/tracker/types";
import { TrackerView, type TrackerActions } from "./TrackerView";
import { useLocalApplications } from "./useLocalApplications";

/** Tracker for visitors without an account: everything stays in this browser. */
export function LocalTracker() {
  const { items, save, persisted } = useLocalApplications();

  const actions = useMemo<TrackerActions>(() => {
    const current = () => items ?? [];
    const touch = (a: Application): Application => ({ ...a, updated_at: new Date().toISOString() });
    return {
      async add(draft) {
        const now = new Date().toISOString();
        save([...current(), { ...draft, id: newId(), created_at: now, updated_at: now }]);
        return null;
      },
      async update(id, draft) {
        save(current().map((a) => (a.id === id ? touch({ ...a, ...draft }) : a)));
        return null;
      },
      async move(id, stage) {
        save(current().map((a) => (a.id === id ? touch({ ...a, stage }) : a)));
        return null;
      },
      async remove(id) {
        save(current().filter((a) => a.id !== id));
        return null;
      },
    };
  }, [items, save]);

  return (
    <TrackerView
      items={items}
      actions={actions}
      persisted={persisted}
      storageNote="Sin cuenta, se guarda solo en este navegador."
    />
  );
}
