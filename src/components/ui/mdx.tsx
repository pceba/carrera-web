import type { MDXComponents } from "mdx/types";
import { Accordion } from "./Accordion";
import { Callout } from "./Callout";
import { ButtonLink } from "./Button";
import { Cite, ReviewedBy, SourceList } from "./Sources";
import { Stat } from "./Stat";
import { Tabs } from "./Tabs";
import { Tag } from "./Tag";
import { Timeline } from "./Timeline";
import { Heading, Prose } from "./Typography";

/**
 * Component map for MDX guides. `src/mdx-components.tsx` (WS0) should spread this in:
 * `return { ...uiMdxComponents, ...components }`. Plain markdown headings map to the system's.
 */
export const uiMdxComponents: MDXComponents = {
  h1: (p) => (
    <Heading level="h1" as="h1">
      {p.children}
    </Heading>
  ),
  h2: (p) => (
    <Heading level="h2" as="h2" id={p.id}>
      {p.children}
    </Heading>
  ),
  h3: (p) => (
    <Heading level="h3" as="h3" id={p.id}>
      {p.children}
    </Heading>
  ),
  Accordion,
  Button: ButtonLink,
  Callout,
  Cite,
  Prose,
  ReviewedBy,
  SourceList,
  Stat,
  Tabs,
  Tag,
  Timeline,
};
