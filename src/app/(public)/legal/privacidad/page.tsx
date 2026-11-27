/** DRAFTED WITH AI, TO BE CHECKED BY PABLO. NOT LEGAL ADVICE. */
import type { Metadata } from "next";
import { PrivacyBody } from "../../../../../content/legal/privacy";
import { LegalDoc } from "../LegalDoc";
import { LEGAL_DATES, LEGAL_VERSIONS } from "../versions";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Qué datos tratamos, para qué, con quién y cómo ejercer tus derechos.",
};

export default function Page() {
  return (
    <LegalDoc
      kicker="Legal"
      title="Política de privacidad"
      version={LEGAL_VERSIONS.privacy}
      date={LEGAL_DATES.privacy}
    >
      <PrivacyBody />
    </LegalDoc>
  );
}
