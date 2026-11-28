import { readFileSync } from "node:fs";
import path from "node:path";
import { parseProgrammes } from "./parse";
import type { ProgrammeFile } from "./types";

/** Server only: reads the YAML at build time. */
export function loadProgrammes(): ProgrammeFile {
  const file = path.join(process.cwd(), "content", "calendario", "programas.yaml");
  return parseProgrammes(readFileSync(file, "utf8"));
}
