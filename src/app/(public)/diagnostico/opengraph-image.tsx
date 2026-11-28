import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard } from "@/components/ui/og-template";
import { SITE } from "@/lib/site";

export const alt = "¿Qué industria encaja contigo?";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard kicker="Diagnóstico" title="¿Qué industria encaja contigo?" siteName={SITE.name} />,
    size,
  );
}
