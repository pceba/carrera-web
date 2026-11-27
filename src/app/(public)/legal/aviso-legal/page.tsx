/** DRAFTED WITH AI, TO BE CHECKED BY PABLO. NOT LEGAL ADVICE. */
import type { Metadata } from "next";
import { LegalNoticeBody } from "../../../../../content/legal/legal-notice";
import { LegalDoc } from "../LegalDoc";
import { LEGAL_DATES, OTHER_LEGAL_VERSIONS } from "../versions";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Datos del titular del sitio (LSSI).",
};

export default function Page() {
  return (
    <LegalDoc
      kicker="Legal"
      title="Aviso legal"
      version={OTHER_LEGAL_VERSIONS.legalNotice}
      date={LEGAL_DATES.legalNotice}
    >
      <LegalNoticeBody />
    </LegalDoc>
  );
}
