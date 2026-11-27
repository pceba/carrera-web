import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Accordion } from "./Accordion";
import { Callout } from "./Callout";
import { Card } from "./Card";
import { PILLARS, INDUSTRIES } from "./site-data";
import { formatDate, ReviewedBy, SourceList } from "./Sources";
import { Tabs } from "./Tabs";
import { Timeline } from "./Timeline";
import { Heading } from "./Typography";

const html = (el: React.ReactElement) => renderToStaticMarkup(el);

describe("formatDate", () => {
  it("formats ISO dates in Spanish without Intl", () => {
    expect(formatDate("2026-11-27")).toBe("27 nov 2026");
    expect(formatDate("2027-01-05")).toBe("5 ene 2027");
  });
  it("returns the input when it is not an ISO date", () => {
    expect(formatDate("pronto")).toBe("pronto");
  });
});

describe("primitives", () => {
  it("Heading uses the semantic tag independently of the visual level", () => {
    expect(html(<Heading level="display">Hola</Heading>)).toMatch(/^<h1 /);
    expect(
      html(
        <Heading level="h1" as="h2">
          Hola
        </Heading>,
      ),
    ).toMatch(/^<h2 /);
  });

  it("Card renders one link when href is set and none otherwise", () => {
    expect(html(<Card title="A" href="/a" />)).toContain('href="/a"');
    expect(html(<Card title="B" />)).not.toContain("<a ");
  });

  it("Callout falls back to a Spanish label", () => {
    expect(html(<Callout tone="warning">x</Callout>)).toContain("Ojo");
  });

  it("Tabs wires roles, selection and roving tabindex", () => {
    const out = html(
      <Tabs
        label="t"
        items={[
          { id: "a", label: "A", content: "pa" },
          { id: "b", label: "B", content: "pb" },
        ]}
      />,
    );
    expect(out).toContain('role="tablist"');
    expect(out.match(/role="tab"/g)).toHaveLength(2);
    expect(out).toContain('aria-selected="true"');
    expect(out).toContain('tabindex="-1"');
    expect(out.match(/hidden/g)).toHaveLength(1);
  });

  it("Accordion uses native details and honours open", () => {
    const out = html(<Accordion items={[{ id: "a", title: "T", content: "c", open: true }]} />);
    expect(out).toContain("<details");
    expect(out).toContain("open");
  });

  it("Timeline is an ordered list", () => {
    expect(html(<Timeline steps={[{ label: "1", title: "A" }]} />)).toContain("<ol");
  });

  it("SourceList numbers sources with anchors that Cite links to", () => {
    const out = html(<SourceList sources={[{ title: "S", url: "https://example.org" }]} />);
    expect(out).toContain('id="fuente-1"');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it("ReviewedBy exposes machine-readable dates", () => {
    const out = html(<ReviewedBy reviewer="Ana" reviewedAt="2026-11-27" />);
    expect(out).toContain('dateTime="2026-11-27"');
    expect(out).toContain("Ana");
  });
});

describe("site data", () => {
  it("has six pillars and consulting is the only live industry", () => {
    expect(PILLARS).toHaveLength(6);
    expect(INDUSTRIES.filter((i) => i.status === "live").map((i) => i.slug)).toEqual([
      "consultoria",
    ]);
  });
});
