import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard } from "@/components/ui/og-template";
import { SITE } from "@/lib/site";

export const alt = "Mis candidaturas: no pierdas el hilo";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard
      kicker="Herramienta"
      title="Mis candidaturas: no pierdas el hilo"
      siteName={SITE.name}
    />,
    size,
  );
}
