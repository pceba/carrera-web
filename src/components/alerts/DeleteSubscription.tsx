"use client";

import { useState } from "react";
import { Button, Dialog } from "@/components/ui";
import styles from "./alerts.module.css";

/** Delete asks first: a native modal dialog, then a plain form post to the server action. */
export function DeleteSubscription({ action }: { action: () => void | Promise<void> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        Eliminar suscripción
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="¿Eliminar tu suscripción?">
        <p>
          Dejarás de recibir avisos y borraremos tus preferencias. Puedes volver a suscribirte
          cuando quieras.
        </p>
        <form action={action} className={styles.actions}>
          <Button type="submit" variant="danger">
            Sí, eliminar
          </Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </form>
      </Dialog>
    </>
  );
}
