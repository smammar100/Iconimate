/**
 * Generates the per-icon `aiPrompt` field in Sanity.
 *
 * This is the one field Sanity is authoritative for — it exists nowhere in the
 * repo — which is why `import-to-sanity.mjs` deliberately never writes it. This
 * script is the only writer, and it is separate on purpose so a routine registry
 * re-sync can never touch prompts.
 *
 * The prompt is assembled from what the repo already knows about an icon: the
 * motion prose in its header comment, its glyph subpaths, its motion label and
 * keywords, and (where one exists) the alternatives explored in its lab page.
 * The Iconimate authoring contract is inlined so the field is self-contained —
 * paste it into any LLM and it has everything needed to author the icon.
 *
 * Safe by default: writes only where aiPrompt is empty. --overwrite replaces
 * existing prompts, including any a human has since edited.
 *
 * Usage:
 *   node scripts/generate-ai-prompts.mjs                 # dry run, prints one sample
 *   node scripts/generate-ai-prompts.mjs --only bandaids # print one prompt in full
 *   node scripts/generate-ai-prompts.mjs --commit        # fill empty prompts
 *   node scripts/generate-ai-prompts.mjs --commit --overwrite
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadEntries, loadMotionNames, ROOT } from "./build-registry.mjs";

const PROJECT_ID = "0gny1aq3";
const DATASET = "production";
const API = "2025-02-19";

const argv = process.argv.slice(2);
const args = new Set(argv);
const COMMIT = args.has("--commit");
const OVERWRITE = args.has("--overwrite");
const ONLY = argv.includes("--only") ? argv[argv.indexOf("--only") + 1] : null;

/** The house rules every icon obeys. Sourced from .claude/AGENTS.md. */
const CONTRACT = `CONTRACT (non-negotiable)
  - "use client" at the top.
  - forwardRef<IconHandle, IconProps>, exposing an imperative handle via
    useImperativeHandle(ref, () => ({ startAnimation, stopAnimation }), [...]).
    This is required: :hover never fires on touch, so the parent must be able to
    drive the animation directly.
  - useHover() from @/hooks/use-hover drives the shared hover/focus + replay loop.
  - Motion \`variants\` with exactly two states: \`normal\` (rest) and \`animate\` (playing).
  - A reduced-motion static fallback that renders the plain, unanimated glyph.
  - REST-STATE FIDELITY: the \`normal\` variant must render pixel-identical to the
    original Phosphor glyph. If you rebuild the glyph from subpaths to move parts
    independently, the resting composition must still match the original exactly —
    a resting icon that drifts reads as broken at 24px.
  - Tuned to read at 24px, drawn on the Phosphor 256 grid (viewBox "0 0 256 256").
  - Import ONLY from: react, motion/react, @/lib/motion-tokens, @/lib/icon,
    @/hooks/use-hover. No other import is permitted — the build inlines these and
    rejects everything else.
  - The only runtime dependency is \`motion\`.`;

/** The descriptive block the authors leave above the motion code. */
function motionProse(src) {
  const m = src.match(/^\/\/ [A-Z][\s\S]*?(?=\nconst |\nexport |\ntype )/m);
  if (!m) return "";
  return m[0]
    .split("\n")
    .map((l) => l.replace(/^\/\/ ?/, "").trimEnd())
    .join("\n")
    .trim();
}

/**
 * Glyph paths. Most icons name their subpaths as consts; some keep a single path
 * inline in the JSX, so fall back to reading `d="..."` attributes.
 */
function glyphPaths(src) {
  const named = [...src.matchAll(/^const ([A-Z_0-9]+)\s*=\s*\n?\s*"(M[^"]{20,})"/gm)].map((m) => ({
    name: m[1],
    d: m[2],
  }));
  if (named.length) return named;
  const inline = [...src.matchAll(/\bd="(M[^"]{20,})"/g)].map((m, i) => ({
    name: `PATH_${i + 1}`,
    d: m[1],
  }));
  return inline;
}

/** Lab alternatives, if this icon was prototyped. The shipped one is marked. */
function labAlternatives(slug, motion) {
  const file = join(ROOT, "app", "lab", slug, "page.tsx");
  if (!existsSync(file)) return "";
  const src = readFileSync(file, "utf8");
  const rows = [];
  for (const block of src.matchAll(/\{[^{}]*Component:\s*\w+[^{}]*\}/g)) {
    const name = block[0].match(/name:\s*"([^"]*)"/)?.[1];
    if (!name) continue;
    const blurb = block[0].match(/blurb:\s*"([^"]*)"/)?.[1] ?? "";
    const shipped = name.toLowerCase() === String(motion).toLowerCase();
    rows.push(`  - ${name}${shipped ? " [SHIPPED]" : ""}${blurb ? ` — ${blurb}` : ""}`);
  }
  if (!rows.length) return "";
  return `\nALTERNATIVES EXPLORED (from this icon's lab page; the shipped one won)\n${rows.join("\n")}\n`;
}

function buildPrompt({ slug, name, keywords, motion, src }) {
  const prose = motionProse(src);
  const paths = glyphPaths(src);

  const glyphBlock = paths.length
    ? `Phosphor "${slug}" on the 256 grid. Subpaths, which must recompose to the\noriginal glyph exactly:\n${paths
        .map((p) => `  ${p.name} = "${p.d}"`)
        .join("\n")}`
    : `Phosphor "${slug}" on the 256 grid. Use the original Phosphor glyph geometry\nunaltered at rest.`;

  return `Create the "${name}" animated icon for Iconimate: a React component with
hand-tuned motion, drawn on the Phosphor 256 grid and tuned to read at 24px.

GLYPH
${glyphBlock}

MOTION — "${motion}"
${prose || `A "${motion}" gesture, played on hover and keyboard focus.`}
${labAlternatives(slug, motion)}
KEYWORDS (what users search for this icon)
  ${keywords.join(", ")}

${CONTRACT}`;
}

// ── Sanity ───────────────────────────────────────────────────────────────────

function token() {
  if (process.env.SANITY_IMPORT_TOKEN) return process.env.SANITY_IMPORT_TOKEN;
  const envFile = join(ROOT, ".env.local");
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, "utf8").split("\n")) {
      const m = line.match(/^\s*SANITY_IMPORT_TOKEN\s*=\s*(.*)$/);
      if (m) return m[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  throw new Error("SANITY_IMPORT_TOKEN is not set (see .env.local)");
}

async function query(groq) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token()}` } });
  if (!res.ok) throw new Error(`query failed: ${res.status} ${await res.text()}`);
  return (await res.json()).result;
}

async function mutate(mutations) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API}/data/mutate/${DATASET}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) throw new Error(`mutate failed: ${res.status} ${await res.text()}`);
  return res.json();
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const entries = loadEntries();
  const motions = loadMotionNames();

  const prompts = new Map();
  const thin = [];
  for (const [slug, { name, keywords }] of entries) {
    const file = join(ROOT, "registry", "icons", `${slug}.tsx`);
    const src = readFileSync(file, "utf8");
    const motion = motions.get(slug);
    if (!motion) throw new Error(`no motion label for "${slug}"`);
    const prompt = buildPrompt({ slug, name, keywords, motion, src });
    prompts.set(slug, prompt);
    // "Thin" = no authored prose to draw on, so the brief is just the label.
    if (!motionProse(src)) thin.push(slug);
  }

  if (ONLY) {
    const p = prompts.get(ONLY);
    if (!p) throw new Error(`unknown slug "${ONLY}"`);
    console.log(p);
    return;
  }

  const lens = [...prompts.values()].map((p) => p.length);
  console.log(`prompts built : ${prompts.size}`);
  console.log(`  length      : min ${Math.min(...lens)}, max ${Math.max(...lens)}, avg ${Math.round(lens.reduce((a, b) => a + b, 0) / lens.length)}`);
  console.log(`  with lab     : ${[...prompts.values()].filter((p) => p.includes("ALTERNATIVES EXPLORED")).length}`);
  console.log(`  THIN (no authored prose): ${thin.length}${thin.length ? ` -> ${thin.join(", ")}` : ""}`);

  if (!COMMIT) {
    console.log("\nDRY RUN — nothing written. --commit to write, --only <slug> to print one.");
    return;
  }

  const docs = await query('*[_type == "icon"]{_id, slug, "hasPrompt": length(aiPrompt) > 0}');
  const mutations = [];
  let skipped = 0;
  for (const d of docs) {
    const prompt = prompts.get(d.slug);
    if (!prompt) continue;
    if (d.hasPrompt && !OVERWRITE) {
      skipped++;
      continue;
    }
    mutations.push({ patch: { id: d._id, set: { aiPrompt: prompt } } });
  }
  if (skipped) console.log(`skipping ${skipped} with an existing prompt (--overwrite to replace)`);

  for (let i = 0; i < mutations.length; i += 50) {
    await mutate(mutations.slice(i, i + 50));
    console.log(`  committed ${Math.min(i + 50, mutations.length)}/${mutations.length}`);
  }
  console.log("done.");
}

main().catch((err) => {
  console.error(`\nFAILED: ${err.message}`);
  process.exit(1);
});
