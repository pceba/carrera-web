import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard } from "@/components/ui/og-template";
import { SITE } from "@/lib/site";

export const alt = "Practica entrevistas con tu propia clave de IA";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard
      kicker="Práctica"
      title="Practica entrevistas con tu propia clave de IA"
      siteName={SITE.name}
    />,
    size,
  );
}
