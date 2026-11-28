"use client";

import { useState } from "react";
import { Button, Dialog } from "@/components/ui";
import { INDUSTRIES, type IndustrySlug } from "../../../content/catalog";
import { CompareView } from "./CompareView";

/** "Comparar" on an industry card: opens the comparison with that industry already picked. */
export function CompareButton({ slug, title }: { slug: IndustrySlug; title: string }) {
  const [open, setOpen] = useState(false);
  // Pair it with the first live guide that is not itself.
  const other = INDUSTRIES.find((i) => i.status === "live" && i.slug !== slug);
  const initial = other ? [slug, other.slug] : [slug];
  return (
    <>
      <Button variant="secondary" aria-label={`Comparar ${title}`} onClick={() => setOpen(true)}>
        Comparar
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={`Comparar ${title}`}>
        {open ? <CompareView initial={initial} /> : null}
      </Dialog>
    </>
  );
}
