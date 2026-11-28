import createMDX from "@next/mdx";

// MDX lets guides mix Markdown with React components (case simulators, calendars).
// remark/rehype plugins are added later by WS-B (content), not here.
const withMDX = createMDX({});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  reactStrictMode: true,
  async redirects() {
    // Encaje is public; the old account URL must not hit the sign-in wall first.
    return [{ source: "/cuenta/encaje", destination: "/encaje", permanent: true }];
  },
};

export default withMDX(nextConfig);
