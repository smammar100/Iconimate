import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated build artifacts (git-ignored) — the standalone icon files the
    // registry generator emits for tsc verification, not source to lint.
    "generated/**",
    // Standalone sub-projects under apps/ (the eve SEO agent and the Sanity
    // Studio) each carry their own toolchain, eslint config, and tsconfig — lint
    // them from inside their own folder, not with the Next app's rules.
    "apps/**",
  ]),
  // Verification-baseline posture (see plans/001): the newer, stricter
  // eslint-plugin-react-hooks rules flag pre-existing, tolerated patterns in
  // shipped components (command-palette, theme-toggle, the unused
  // interactive-hero). Keep them VISIBLE as warnings — tracked, not hidden —
  // so `pnpm verify` gates on real regressions instead of legacy debt. Revisit
  // and fix these properly in the component-cleanup plans, then restore "error".
  {
    rules: {
      // Pre-existing tolerated patterns in shipped components (command-palette,
      // theme-toggle). Kept visible-as-warnings; restore to "error" when the
      // component-cleanup plans fix them. (static-components was cleared by
      // plan 004's deletion of interactive-hero, so it stays a hard error.)
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  // The `<a href="/">` in the internal lab index is prototyping tooling, not a
  // shipped route — warn here only; the real app keeps this rule as an error.
  {
    files: ["app/lab/**"],
    rules: {
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
]);

export default eslintConfig;
