import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard } from "@/components/ui/og-template";
import { SITE } from "@/lib/site";

export const alt = "Ofertas de prácticas y primer empleo";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard kicker="Ofertas" title="Ofertas de prácticas y primer empleo" siteName={SITE.name} />,
    size,
  );
}
