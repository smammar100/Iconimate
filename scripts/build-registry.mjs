// Build the shadcn registry: one self-contained .tsx per icon, embedded in a
// registry-item JSON at public/r/<slug>.json, plus a registry.json index.
//
// Strategy: module INLINING, not pattern rewriting. Every icon's internal
// imports come from a closed set — @/lib/icon (types), @/lib/motion-tokens
// (consts/pure fns), @/hooks/use-hover (hook), ./_* (private factories). We
// strip those import lines and splice the referenced source into the file, so
// the emitted component imports only "react" and "motion/react". The imperative
// handle API (startAnimation/stopAnimation) and reduced-motion support survive
// untouched because the real source ships inside the file.
//
// Run: node scripts/build-registry.mjs   (wired into prebuild + dev)

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ICONS_DIR = join(ROOT, "registry", "icons");
const OUT_DIR = join(ROOT, "public", "r");
const TSX_OUT_DIR = join(ROOT, "generated", "registry"); // for tsc verification only (gitignored)

const SITE = "https://iconimate.app";

/* ── Load shared module sources ─────────────────────────────────────────── */

const read = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");

const MOTION_TOKENS_SRC = read(join(ROOT, "registry", "lib", "motion-tokens.ts"));
const USE_HOVER_SRC = read(join(ROOT, "registry", "hooks", "use-hover.ts"));

/* ── motion-tokens: split into per-declaration snippets ─────────────────── */

// Every export in motion-tokens.ts is a top-level `export const|function|type NAME`.
// Split the file at export boundaries (line-wise — regex over the whole text can
// backtrack across code), attaching each declaration's contiguous leading comment
// block. Section-divider comment blocks separated by a blank line are dropped.
function splitTokenDeclarations(src) {
  const lines = src.replace(/^import[^\n]*\n/gm, "").split("\n");
  const isComment = (l) => /^\s*(\/\/|\/\*|\*)/.test(l);
  const declLine = /^export (?:const|function|type) ([A-Za-z0-9_]+)/;

  // Locate each export declaration line and its comment-block start.
  const marks = []; // { name, start (incl. comment), declStart }
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(declLine);
    if (!m) continue;
    let start = i;
    while (start > 0 && lines[start - 1].trim() !== "" && isComment(lines[start - 1])) start--;
    marks.push({ name: m[1], start, declStart: i });
  }

  const decls = new Map(); // name -> source text
  for (let i = 0; i < marks.length; i++) {
    const end = i + 1 < marks.length ? marks[i + 1].start : lines.length;
    const text = lines.slice(marks[i].start, end).join("\n").trim();
    if (!text.includes(marks[i].name)) throw new Error(`token split failed for "${marks[i].name}"`);
    decls.set(marks[i].name, text);
  }
  return decls;
}

const TOKEN_DECLS = splitTokenDeclarations(MOTION_TOKENS_SRC);
// Declaration order in the source file (already dependency-ordered).
const TOKEN_ORDER = [...TOKEN_DECLS.keys()];

// Intra-module dependencies (which other tokens a token's source references).
const TOKEN_DEPS = {
  Bezier: [],
  SWEEP: ["Bezier"],
  ARRIVE: ["Bezier"],
  RETURN: ["Bezier"],
  springPop: [],
  springSwing: [],
  springSettle: [],
  springSoft: [],
  DUR: [],
  RETURN_TRANSITION: ["DUR", "RETURN"],
  OVERSHOOT_BACK: ["Bezier"],
  ANTICIPATE_DIP: [],
  SQUASH_TIMES: [],
  squashStretch: [],
  popIn: ["ANTICIPATE_DIP", "DUR", "ARRIVE"],
  staged: [],
  SCROLL_LOOP: [],
  PLUNGE_KEYS: [],
  PLUNGE_TRANSITION: [],
  SNAP_DRAW_SPRING: [],
  SNAP_RETURN: [],
};

// Fail loudly if motion-tokens gains an export the dep map doesn't know about.
for (const name of TOKEN_ORDER) {
  if (!(name in TOKEN_DEPS)) {
    throw new Error(`motion-tokens export "${name}" missing from TOKEN_DEPS map in build-registry.mjs`);
  }
}

/* ── Static inlined sections ────────────────────────────────────────────── */

const ICON_TYPES_SNIPPET = `/** Imperative handle every icon exposes — lets consumers trigger motion on touch, where \`:hover\` never fires. */
export interface IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export interface IconProps extends HTMLAttributes<HTMLDivElement> {
  /** Rendered width & height in px. Defaults to 28; the set is calibrated to read at 24 (ship size). */
  size?: number;
}`;

// use-hover with its "use client" + imports stripped (they're merged into the header).
const USE_HOVER_SNIPPET = USE_HOVER_SRC
  .replace(/^"use client";\n+/, "")
  .replace(/^import[^\n]*\n/gm, "")
  .trim();

// Extra external imports each inlined section needs.
const ICON_TYPES_IMPORTS = { react: [], reactType: ["HTMLAttributes"], motion: [], motionType: [] };
const USE_HOVER_IMPORTS = {
  react: ["useCallback"],
  reactType: ["DOMAttributes"],
  motion: ["useAnimation", "useReducedMotion"],
  motionType: [],
};

/* ── Import-line parsing ────────────────────────────────────────────────── */

const IMPORT_RE = /^import\s+(type\s+)?\{([^}]*)\}\s+from\s+"([^"]+)";?\s*$/;

/**
 * Parse a source file into { imports, body }.
 * imports: { react:Set, reactType:Set, motion:Set, motionType:Set, tokens:Set, useHover:bool, factory:string|null }
 * body: the source minus "use client" and all import lines.
 */
function parseSource(src, file) {
  const imports = {
    react: new Set(),
    reactType: new Set(),
    motion: new Set(),
    motionType: new Set(),
    tokens: new Set(),
    useHover: false,
    factory: null,
  };
  const bodyLines = [];
  for (const line of src.split("\n")) {
    if (/^"use client";?\s*$/.test(line)) continue;
    const m = line.match(IMPORT_RE);
    if (!m) {
      if (/^import\s/.test(line)) throw new Error(`${file}: unrecognized import shape: ${line}`);
      bodyLines.push(line);
      continue;
    }
    const wholeType = Boolean(m[1]);
    const specs = m[2].split(",").map((s) => s.trim()).filter(Boolean);
    const mod = m[3];
    const addSpec = (valueSet, typeSet) => {
      for (const s of specs) {
        if (wholeType || s.startsWith("type ")) typeSet.add(s.replace(/^type\s+/, ""));
        else valueSet.add(s);
      }
    };
    if (mod === "react") addSpec(imports.react, imports.reactType);
    else if (mod === "motion/react") addSpec(imports.motion, imports.motionType);
    else if (mod === "@/lib/motion-tokens") specs.forEach((s) => imports.tokens.add(s));
    else if (mod === "@/lib/icon") { /* always inlined */ }
    else if (mod === "@/hooks/use-hover") imports.useHover = true;
    else if (mod.startsWith("./_")) imports.factory = mod.slice(2); // e.g. "_arrow-u-bounce"
    else throw new Error(`${file}: unexpected import module "${mod}"`);
  }
  return { imports, body: bodyLines.join("\n").replace(/^\n+/, "").trimEnd() };
}

function mergeImports(target, extra) {
  extra.react?.forEach((s) => target.react.add(s));
  extra.reactType?.forEach((s) => target.reactType.add(s));
  extra.motion?.forEach((s) => target.motion.add(s));
  extra.motionType?.forEach((s) => target.motionType.add(s));
}

/* ── Assemble one standalone icon file ──────────────────────────────────── */

function buildStandalone(slug) {
  const iconSrc = read(join(ICONS_DIR, `${slug}.tsx`));
  const icon = parseSource(iconSrc, `${slug}.tsx`);

  const imports = {
    react: new Set(icon.imports.react),
    reactType: new Set(icon.imports.reactType),
    motion: new Set(icon.imports.motion),
    motionType: new Set(icon.imports.motionType),
  };
  const tokens = new Set(icon.imports.tokens);
  let needsHover = icon.imports.useHover;

  // Inline the factory (one level deep — factories never import factories).
  let factoryBody = null;
  if (icon.imports.factory) {
    const fac = parseSource(read(join(ICONS_DIR, `${icon.imports.factory}.tsx`)), icon.imports.factory);
    if (fac.imports.factory) throw new Error(`${icon.imports.factory}: nested factory import unsupported`);
    mergeImports(imports, fac.imports);
    fac.imports.tokens.forEach((t) => tokens.add(t));
    needsHover = needsHover || fac.imports.useHover;
    factoryBody = fac.body;
  }

  // Resolve token transitive closure, emit in source-file order.
  const needed = new Set();
  const visit = (name) => {
    if (needed.has(name)) return;
    if (!TOKEN_DECLS.has(name)) throw new Error(`${slug}: unknown motion-token "${name}"`);
    needed.add(name);
    TOKEN_DEPS[name].forEach(visit);
  };
  tokens.forEach(visit);
  let tokenSnippets = TOKEN_ORDER.filter((n) => needed.has(n)).map((n) => TOKEN_DECLS.get(n));

  // Collision guard: a dependency-only token (pulled in transitively, never
  // imported by the icon itself) may share a name with a local declaration in
  // the icon body (e.g. avocado's own `const DUR`). Rename the token inside the
  // inlined snippets; the body keeps its local meaning.
  const bodies = (factoryBody ?? "") + "\n" + icon.body;
  for (const name of needed) {
    if (tokens.has(name)) continue; // explicitly imported — body reference is the token itself
    if (!new RegExp(`\\b${name}\\b`).test(bodies)) continue;
    const renamed = `${name}_TOKEN`;
    if (new RegExp(`\\b${renamed}\\b`).test(bodies) || tokenSnippets.some((s) => s.includes(renamed))) {
      throw new Error(`${slug}: cannot rename colliding token "${name}" — "${renamed}" already in use`);
    }
    tokenSnippets = tokenSnippets.map((s) => s.replace(new RegExp(`\\b${name}\\b`, "g"), renamed));
  }

  // Token declarations reference motion's Transition type.
  if (tokenSnippets.some((s) => s.includes("Transition"))) imports.motionType.add("Transition");

  mergeImports(imports, ICON_TYPES_IMPORTS);
  if (needsHover) mergeImports(imports, USE_HOVER_IMPORTS);

  const importLine = (specs, mod, isType) =>
    specs.size ? `import ${isType ? "type " : ""}{ ${[...specs].sort().join(", ")} } from "${mod}";` : null;

  const sections = [
    '"use client";',
    "",
    [
      importLine(imports.react, "react", false),
      importLine(imports.reactType, "react", true),
      importLine(imports.motion, "motion/react", false),
      importLine(imports.motionType, "motion/react", true),
    ]
      .filter(Boolean)
      .join("\n"),
    "",
    ICON_TYPES_SNIPPET,
    ...(tokenSnippets.length ? ["", tokenSnippets.join("\n\n")] : []),
    ...(needsHover ? ["", USE_HOVER_SNIPPET] : []),
    ...(factoryBody ? ["", factoryBody] : []),
    "",
    icon.body,
    "",
  ];
  const out = sections.join("\n").replace(/\n{3,}/g, "\n\n");

  // Fail-loud sanity checks: fully standalone, no internal imports, no cn().
  if (/from\s+"(@\/|\.\/|\.\.\/)/.test(out)) throw new Error(`${slug}: emitted file still has internal imports`);
  if (/\bcn\(/.test(out)) throw new Error(`${slug}: emitted file references cn()`);
  return out;
}

/* ── Metadata (names/keywords from the icons index, motion from icon-meta) ─ */

function loadEntries() {
  const indexSrc = read(join(ICONS_DIR, "index.ts"));
  const entries = new Map(); // slug -> { name, keywords }
  const re = /\{\s*slug:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*keywords:\s*\[([^\]]*)\]/g;
  for (const m of indexSrc.matchAll(re)) {
    entries.set(m[1], {
      name: m[2],
      keywords: [...m[3].matchAll(/"([^"]+)"/g)].map((k) => k[1]),
    });
  }
  return entries;
}

function loadMotionNames() {
  const metaSrc = read(join(ROOT, "components", "dark", "icon-meta.ts"));
  const map = new Map();
  const re = /^\s*"?([a-z0-9-]+)"?:\s*\{\s*motion:\s*"([^"]+)"/gm;
  for (const m of metaSrc.matchAll(re)) map.set(m[1], m[2]);
  return map;
}

/* ── Main ───────────────────────────────────────────────────────────────── */

const slugs = readdirSync(ICONS_DIR)
  .filter((f) => f.endsWith(".tsx") && !f.startsWith("_"))
  .map((f) => basename(f, ".tsx"))
  .sort();

const entries = loadEntries();
const motionNames = loadMotionNames();

// Cross-check: every icon file should be registered in the index.
const missing = slugs.filter((s) => !entries.has(s));
if (missing.length) {
  throw new Error(`icons missing from registry/icons/index.ts: ${missing.join(", ")}`);
}

rmSync(OUT_DIR, { recursive: true, force: true });
rmSync(TSX_OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(TSX_OUT_DIR, { recursive: true });

const items = [];
for (const slug of slugs) {
  const content = buildStandalone(slug);
  const name = entries.get(slug)?.name ?? slug;
  const motion = motionNames.get(slug);
  const description = `Animated ${name} icon${motion ? ` (${motion})` : ""}. Hover to play; imperative startAnimation/stopAnimation handle for touch.`;
  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: slug,
    type: "registry:ui",
    title: name,
    description,
    dependencies: ["motion"],
    files: [
      {
        path: `components/ui/icons/${slug}.tsx`,
        type: "registry:ui",
        content,
      },
    ],
  };
  writeFileSync(join(OUT_DIR, `${slug}.json`), JSON.stringify(item, null, 2) + "\n");
  writeFileSync(join(TSX_OUT_DIR, `${slug}.tsx`), content);
  items.push({ name: slug, type: "registry:ui", title: name, description });
}

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "iconimate",
  homepage: SITE,
  items,
};
writeFileSync(join(OUT_DIR, "registry.json"), JSON.stringify(registry, null, 2) + "\n");

console.log(`registry: ${items.length} icons -> public/r/ (+ registry.json)`);
