/** DRAFTED WITH AI, TO BE CHECKED BY PABLO. NOT LEGAL ADVICE. */
import type { Metadata } from "next";
import { TermsBody } from "../../../../../content/legal/terms";
import { LegalDoc } from "../LegalDoc";
import { LEGAL_DATES, LEGAL_VERSIONS } from "../versions";

export const metadata: Metadata = {
  title: "Términos de uso",
  description: "Las reglas de uso de este servicio gratuito y abierto.",
};

export default function Page() {
  return (
    <LegalDoc
      kicker="Legal"
      title="Términos de uso"
      version={LEGAL_VERSIONS.terms}
      date={LEGAL_DATES.terms}
    >
      <TermsBody />
    </LegalDoc>
  );
}
