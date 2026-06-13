import type { NextConfig } from "next";
import macros from "unplugin-parcel-macros";

/**
 * React Spectrum S2 authors its styles with a Parcel macro that is evaluated in
 * the consumer's bundler (the published components ship the macro calls, not
 * pre-compiled CSS). So we register the macro plugin and transpile the package.
 *
 * The macro plugin is Webpack-only. Next 16 defaults to Turbopack for both
 * `dev` and `build`, and a custom `webpack` config makes a Turbopack build
 * fail by design — so the npm scripts pin `--webpack` (see package.json).
 */
const nextConfig: NextConfig = {
  transpilePackages: ["@react-spectrum/s2"],
  webpack(config) {
    config.plugins.push(macros.webpack());
    return config;
  },
};

export default nextConfig;
