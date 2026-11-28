import { describe, expect, it } from "vitest";
import { extractHeadings, makeSlugger, readingMinutes, slugify, textOf } from "./headings";

describe("slugify and slugger", () => {
  it("drops accents and punctuation", () => {
    expect(slugify("Cómo se entra: ¿y el máster?")).toBe("como-se-entra-y-el-master");
    expect(slugify("???")).toBe("seccion");
  });
  it("numbers repeated headings in order", () => {
    const s = makeSlugger();
    expect([s("Resumen"), s("Otro"), s("Resumen"), s("Resumen")]).toEqual([
      "resumen",
      "otro",
      "resumen-2",
      "resumen-3",
    ]);
  });
});

describe("extractHeadings", () => {
  const src = [
    "Intro sin título.",
    "## Cuatro puertas",
    "texto",
    "### Subtítulo que no entra",
    "## **Quién** contrata <Cite n={2} /> en [España](/x)",
    "```",
    "## esto es código",
    "```",
    "## Cuatro puertas",
  ].join("\n");

  it("takes the ## lines outside code, cleaned, with unique ids", () => {
    expect(extractHeadings(src)).toEqual([
      { id: "cuatro-puertas", title: "Cuatro puertas" },
      { id: "quien-contrata-en-espana", title: "Quién contrata en España" },
      { id: "cuatro-puertas-2", title: "Cuatro puertas" },
    ]);
  });

  it("gives the same id as the rendered heading text", () => {
    expect(textOf(["Quién contrata ", null, "en España"])).toBe("Quién contrata en España");
    expect(slugify(textOf(["Quién contrata ", "en España"]))).toBe("quien-contrata-en-espana");
  });
});

describe("readingMinutes", () => {
  it("is at least one minute and grows with the words", () => {
    expect(readingMinutes("Hola mundo")).toBe(1);
    expect(readingMinutes(Array(660).fill("palabra").join(" "))).toBe(3);
  });
  it("ignores imports, tags and link targets", () => {
    const text = 'import X from "y";\n<Cite n={1} /> [texto](https://ejemplo.es/muy/largo) fin';
    expect(readingMinutes(text)).toBe(1);
  });
});
