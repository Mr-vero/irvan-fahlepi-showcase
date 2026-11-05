import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: { root: __dirname },
  // Inline the (small) stylesheets into the HTML so first paint doesn't wait on separate CSS requests.
  experimental: { inlineCss: true },
};

export default nextConfig;
