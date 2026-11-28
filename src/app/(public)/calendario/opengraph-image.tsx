import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard } from "@/components/ui/og-template";
import { SITE } from "@/lib/site";

export const alt = "Calendario de procesos de selección";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard kicker="Calendario" title="Calendario de procesos de selección" siteName={SITE.name} />,
    size,
  );
}
