// Characterization tests for the registry generator (scripts/build-registry.mjs).
//
// These pin the CURRENT behavior of the regex-parsing generator so a later
// rewrite (or an accidental drift) can't silently ship broken/degraded icon
// JSON to `npx shadcn add` consumers. They do not assert what the generator
// SHOULD do — only what it does today. Run: `node --test scripts/` or `pnpm test`.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import {
  parseSource,
  buildStandalone,
  loadEntries,
  loadMotionNames,
  splitTokenDeclarations,
  ICONS_DIR,
  OUT_DIR,
  ROOT,
} from "./build-registry.mjs";

const read = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");

/* ── parseSource: happy paths ─────────────────────────────────────────────── */

test("parseSource: plain-hover icon (bell) captures react/motion imports + useHover", () => {
  const { imports, body } = parseSource(read(join(ICONS_DIR, "bell.tsx")), "bell.tsx");
  assert.equal(imports.useHover, true, "bell imports the useHover hook");
  assert.equal(imports.factory, null, "bell is not factory-based");
  assert.ok(imports.motion.size > 0, "bell imports from motion/react");
  assert.ok(imports.react.size > 0, "bell imports from react");
  assert.doesNotMatch(body, /^"use client"/, "body strips the use-client directive");
  assert.doesNotMatch(body, /^import\s/m, "body strips all import lines");
});

test("parseSource: factory-based icon records the factory module", () => {
  const { imports } = parseSource(
    read(join(ICONS_DIR, "arrow-elbow-down-left.tsx")),
    "arrow-elbow-down-left.tsx",
  );
  assert.ok(imports.factory, "an icon importing from ./_ sets imports.factory");
  assert.match(imports.factory, /^_/, "factory name keeps its leading underscore");
});

test("parseSource: token-importing icon (avocado) records motion tokens", () => {
  const { imports } = parseSource(read(join(ICONS_DIR, "avocado.tsx")), "avocado.tsx");
  assert.ok(imports.tokens.size > 0, "avocado imports at least one motion token");
  assert.ok(imports.tokens.has("RETURN_TRANSITION"), "avocado imports RETURN_TRANSITION");
});

/* ── parseSource: throw paths ─────────────────────────────────────────────── */

test("parseSource: throws on an unexpected import module (named import)", () => {
  assert.throws(
    () => parseSource('import { x } from "node:fs";\n', "fake.tsx"),
    /unexpected import module/,
  );
});

test("parseSource: throws on an unrecognized import shape (default import)", () => {
  assert.throws(
    () => parseSource('import fs from "node:fs";\n', "fake.tsx"),
    /unrecognized import shape/,
  );
});

/* ── Token collision rename ───────────────────────────────────────────────── */

test("buildStandalone: renames a token that collides with a local body const (avocado DUR)", () => {
  const out = buildStandalone("avocado");
  // avocado's body declares `const DUR = 0.95`; a pulled-in token also named DUR
  // must be renamed to DUR_TOKEN in the inlined snippet so the two don't clash.
  assert.match(out, /DUR_TOKEN/, "the colliding token is renamed to DUR_TOKEN");
  assert.match(out, /const DUR = 0\.95/, "the icon's own local DUR is preserved verbatim");
});

test("splitTokenDeclarations: parses the motion-tokens module into named snippets", () => {
  const src = read(join(ROOT, "registry", "lib", "motion-tokens.ts"));
  const decls = splitTokenDeclarations(src);
  assert.ok(decls.size > 0, "at least one token declaration is parsed");
  assert.ok(decls.has("RETURN_TRANSITION"), "RETURN_TRANSITION is among the parsed tokens");
  assert.match(decls.get("RETURN_TRANSITION"), /RETURN_TRANSITION/, "snippet contains its own name");
});

/* ── Metadata parity ──────────────────────────────────────────────────────── */

test("loadEntries: every icon .tsx file is registered in index.ts", () => {
  const entries = loadEntries();
  const slugs = readdirSync(ICONS_DIR)
    .filter((f) => f.endsWith(".tsx") && !f.startsWith("_"))
    .map((f) => basename(f, ".tsx"));
  assert.ok(entries.size > 100, `expected a populated index (got ${entries.size})`);
  const missing = slugs.filter((s) => !entries.has(s));
  assert.deepEqual(missing, [], `these icon files are missing from index.ts: ${missing.join(", ")}`);
});

test("loadMotionNames: motion map covers every registered icon (no silent gaps)", () => {
  const entries = loadEntries();
  const motion = loadMotionNames();
  const missing = [...entries.keys()].filter((s) => !motion.has(s));
  // Not a generator error today (the description just loses its "(motion)" suffix),
  // but a parity gap is worth surfacing — this asserts the two stay in sync.
  assert.deepEqual(missing, [], `slugs missing from icon-meta.ts motion map: ${missing.join(", ")}`);
});

/* ── SEO count parity (plan 002) ──────────────────────────────────────────── */

test("lib/seo.ts ICON_COUNT derives from the live visible-icon list (no stale literal)", () => {
  const seoSrc = read(join(ROOT, "lib", "seo.ts"));
  assert.doesNotMatch(seoSrc, /ICON_COUNT\s*=\s*\d+/, "ICON_COUNT must not be a hardcoded number");
  assert.match(
    seoSrc,
    /ICON_COUNT\s*=\s*visibleIconMeta\.length/,
    "ICON_COUNT derives from visibleIconMeta.length",
  );
});

/* ── Golden inlining contract ─────────────────────────────────────────────── */

for (const slug of ["bell", "avocado", "arrow-elbow-down-left"]) {
  test(`golden: public/r/${slug}.json is fully inlined and non-empty`, () => {
    const item = JSON.parse(read(join(OUT_DIR, `${slug}.json`)));
    const content = item.files?.[0]?.content;
    assert.ok(content && content.length > 200, `${slug} has substantial emitted content`);
    assert.match(content, /export const \w+Icon/, `${slug} exports its icon component`);
    // The inlining contract: no internal (@/, ./, ../) imports survive.
    assert.doesNotMatch(
      content,
      /from\s+"(@\/|\.\/|\.\.\/)/,
      `${slug} has an un-inlined internal import — the generator's inlining is broken`,
    );
    assert.doesNotMatch(content, /\bcn\(/, `${slug} must not reference cn()`);
  });
}
