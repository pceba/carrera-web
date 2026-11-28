import fs from "node:fs";
import path from "node:path";

/** Raw MDX of a guide page, for the table of contents and the reading time. Server-only. */
export function readGuideSource(industry: string, page: string): string {
  const file = path.join(process.cwd(), "content", "industrias", industry, `${page}.mdx`);
  return fs.readFileSync(file, "utf8");
}
