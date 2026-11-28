import { permanentRedirect } from "next/navigation";

/** Encaje is public now; the old account URL keeps working. */
export default function CuentaEncajePage() {
  permanentRedirect("/encaje");
}
