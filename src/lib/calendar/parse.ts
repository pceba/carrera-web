import type { ProgrammeFile } from "./types";

/**
 * Parser for the restricted YAML of `content/calendario/programas.yaml`: top-level scalars, one
 * list of strings and one list of flat maps with scalar values (double-quoted strings, `null`,
 * bare words). It exists so the repo needs no extra dependency; anything else throws.
 */
function scalar(raw: string, line: number): string | null {
  const v = raw.trim();
  if (v === "null" || v === "~" || v === "") return null;
  if (v.startsWith('"')) {
    try {
      const out: unknown = JSON.parse(v);
      if (typeof out === "string") return out;
    } catch {
      /* fall through */
    }
    throw new Error(`Line ${line}: invalid quoted string`);
  }
  return v;
}

export function parseProgrammes(text: string): ProgrammeFile {
  const root: Record<string, unknown> = {};
  let listKey: string | null = null;
  let row: Record<string, string | null> | null = null;
  const lines = text.split(/\r?\n/);
  lines.forEach((full, i) => {
    const n = i + 1;
    if (/^\s*(#.*)?$/.test(full)) return;
    const top = /^([a-z_]+):(.*)$/.exec(full);
    if (top) {
      row = null;
      const rest = top[2]!.trim();
      if (rest === "") {
        listKey = top[1]!;
        root[listKey] = [];
      } else {
        listKey = null;
        root[top[1]!] = scalar(rest, n);
      }
      return;
    }
    if (!listKey) throw new Error(`Line ${n}: unexpected indentation`);
    const list = root[listKey] as unknown[];
    const item = /^ {2}- (.*)$/.exec(full);
    if (item) {
      const kv = /^([a-z_]+):(.*)$/.exec(item[1]!);
      if (kv) {
        row = {};
        row[kv[1]!] = scalar(kv[2]!, n);
        list.push(row);
      } else {
        row = null;
        list.push(scalar(item[1]!, n));
      }
      return;
    }
    const cont = /^ {4}([a-z_]+):(.*)$/.exec(full);
    if (cont && row) {
      row[cont[1]!] = scalar(cont[2]!, n);
      return;
    }
    throw new Error(`Line ${n}: unsupported syntax`);
  });
  return root as unknown as ProgrammeFile;
}
