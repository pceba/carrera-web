import createMDX from "@next/mdx";

// MDX lets guides mix Markdown with React components (case simulators, calendars).
// remark/rehype plugins are added later by WS-B (content), not here.
const withMDX = createMDX({});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  reactStrictMode: true,
};

export default withMDX(nextConfig);
