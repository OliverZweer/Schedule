import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  /* config options here */
  // Desktop builds use the standalone server. Static export is used for
  // anonymous / static hosting of the PWA (no server functions required).
  output: isStaticExport ? "export" : "standalone",
  trailingSlash: isStaticExport,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
