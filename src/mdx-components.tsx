import type { MDXComponents } from "mdx/types";

// Required by @next/mdx (App Router). WS-A/WS-B extend this map with custom components.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}
