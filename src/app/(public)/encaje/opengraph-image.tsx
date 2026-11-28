import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard } from "@/components/ui/og-template";
import { SITE } from "@/lib/site";

export const alt = "Sube tu CV y mira qué ofertas encajan";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard kicker="Encaje" title="Sube tu CV y mira qué ofertas encajan" siteName={SITE.name} />,
    size,
  );
}
