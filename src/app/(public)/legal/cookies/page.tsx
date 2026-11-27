/** DRAFTED WITH AI, TO BE CHECKED BY PABLO. NOT LEGAL ADVICE. */
import type { Metadata } from "next";
import { CookiesBody } from "../../../../../content/legal/cookies";
import { LegalDoc } from "../LegalDoc";
import { LEGAL_DATES, OTHER_LEGAL_VERSIONS } from "../versions";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Qué cookies usamos y por qué no hay banner.",
};

export default function Page() {
  return (
    <LegalDoc
      kicker="Legal"
      title="Política de cookies"
      version={OTHER_LEGAL_VERSIONS.cookies}
      date={LEGAL_DATES.cookies}
    >
      <CookiesBody />
    </LegalDoc>
  );
}
