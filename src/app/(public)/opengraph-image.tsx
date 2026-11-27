import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard } from "@/components/ui/og-template";
import { SITE } from "@/lib/site";

export const alt = SITE.description;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard
      kicker="Guía abierta"
      title="Empieza tu carrera sabiendo lo que te espera"
      siteName={SITE.name}
    />,
    size,
  );
}
