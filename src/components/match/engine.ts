/**
 * Loads the Rust engine (`cw-wasm`) on first use. The dynamic `import()` is what keeps the
 * ~835 KB bundle out of every page except the ones that call this: the bundler splits it into
 * its own chunk. The promise is cached so the module is fetched and compiled only once.
 */
import type { Posting } from "@/lib/generated/Posting";
import type { Profile } from "@/lib/generated/Profile";
import type { Ranked } from "@/lib/generated/Ranked";

type Engine = typeof import("@/lib/wasm/cw_wasm");

let loading: Promise<Engine> | null = null;

function loadEngine(): Promise<Engine> {
  loading ??= import("@/lib/wasm/cw_wasm")
    .then(async (engine) => {
      await engine.default();
      return engine;
    })
    .catch((error: unknown) => {
      loading = null; // let the next call retry (e.g. after a network blip)
      throw error;
    });
  return loading;
}

export type CvKind = "txt" | "docx" | "pdf";

/** File kind from the name, or null when it is not one we read. */
export function cvKind(fileName: string): CvKind | null {
  const ext = fileName.toLowerCase().split(".").pop();
  return ext === "txt" || ext === "docx" || ext === "pdf" ? ext : null;
}

/** Draft profile from a CV. Throws an Error with the engine's message if the file is unreadable. */
export async function parseCv(bytes: Uint8Array, kind: CvKind): Promise<Profile> {
  const engine = await loadEngine();
  try {
    return JSON.parse(engine.parse_cv(bytes, kind)) as Profile;
  } catch (error) {
    // wasm-bindgen throws the Rust `String` itself, not an Error.
    throw new Error(typeof error === "string" ? error : "No se ha podido leer el archivo.");
  }
}

export async function rankPostings(profile: Profile, postings: Posting[]): Promise<Ranked[]> {
  const engine = await loadEngine();
  return JSON.parse(engine.rank(JSON.stringify(profile), JSON.stringify(postings))) as Ranked[];
}
