import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rewrite barrel imports (e.g. `motion/react`) to direct deep imports so only
  // the used exports are bundled — smaller initial JS, faster parse.
  experimental: {
    optimizePackageImports: ["motion"],
  },
};

export default nextConfig;
