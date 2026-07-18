/**
 * Mirrors the icon registry into Sanity.
 *
 * Direction of truth: the REPO owns the code, Sanity owns the content. This
 * script only ever pushes repo → Sanity. Nothing here is read back into a build,
 * and `build-registry.mjs` never imports this file — a Sanity outage must not be
 * able to break `next dev`.
 *
 * It reuses the generator's own parsers rather than re-deriving anything:
 * `loadEntries()` and `loadMotionNames()` are exported from build-registry.mjs,
 * whose `main()` self-guards, so importing it regenerates nothing.
 *
 * Re-runnable by design. `aiPrompt` is never written (Sanity is authoritative for
 * it — it exists nowhere in the repo), and `labVariants` uses setIfMissing so a
 * re-sync can't clobber human-curated `status` values.
 *
 * Usage:
 *   node scripts/import-to-sanity.mjs              # dry run (default)
 *   node scripts/import-to-sanity.mjs --commit     # write metadata + tsxSource
 *   node scripts/import-to-sanity.mjs --commit --lab   # also mirror lab pages
 *
 * Requires SANITY_IMPORT_TOKEN (Editor). Unprefixed and server-only — never
 * imported by app code.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { loadEntries, loadMotionNames, ROOT, OUT_DIR } from "./build-registry.mjs";

const PROJECT_ID = "0gny1aq3";
const DATASET = "production";
const API = "2025-02-19";

const args = new Set(process.argv.slice(2));
const COMMIT = args.has("--commit");
const WITH_LAB = args.has("--lab");
// Normally labVariants is setIfMissing, so a re-sync can't wipe curated `status`
// values. --reset-lab overwrites them from source instead. Destructive to
// curation; only for repairing a bad import.
const RESET_LAB = args.has("--reset-lab");

// ── Parsers the generator doesn't already expose ─────────────────────────────

/**
 * loadMotionNames() deliberately stops at `motion:` — widening its regex would
 * touch a load-bearing generator path, so glow gets its own reader here.
 */
function loadGlows() {
  const src = readFileSync(join(ROOT, "components", "dark", "icon-meta.ts"), "utf8");
  const re = /^\s*"?([a-z0-9-]+)"?:\s*\{\s*motion:\s*"[^"]+",\s*glow:\s*"(#[0-9A-Fa-f]{6})"/gm;
  return new Map([...src.matchAll(re)].map((m) => [m[1], m[2]]));
}

/** HOME_HIDDEN_SLUGS is parsed inside the generator's main(), not exported. */
function loadHiddenSlugs() {
  const src = readFileSync(join(ROOT, "registry", "icons", "index.ts"), "utf8");
  const block = src.match(/HOME_HIDDEN_SLUGS = new Set<string>\(\[([\s\S]*?)\]\)/);
  if (!block) throw new Error("HOME_HIDDEN_SLUGS not found in registry/icons/index.ts");
  return new Set([...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]));
}

/**
 * Lab pages are hand-written and outside the generator's closed import
 * allow-list, so there is no buildStandalone equivalent for them. {name, blurb}
 * parse reliably (same brace-free-body shape as index.ts entries); per-variant
 * code does not — variants share module-level path consts. So we mirror the whole
 * page and take the excerpt on a best-effort basis.
 */
function parseLabPage(slug) {
  const file = join(ROOT, "app", "lab", slug, "page.tsx");
  if (!existsSync(file)) return null;
  const src = readFileSync(file, "utf8");

  const variants = [];
  for (const block of src.matchAll(/\{[^{}]*Component:\s*\w+[^{}]*\}/g)) {
    const text = block[0];
    const name = text.match(/name:\s*"([^"]*)"/)?.[1];
    const componentName = text.match(/Component:\s*(\w+)/)?.[1];
    if (!name || !componentName) continue;
    variants.push({
      _type: "labVariant",
      // The Studio generates _key automatically, but the raw mutation API does
      // not — without it React reconciliation and Studio array reordering break.
      // componentName is unique within a lab page and stable across re-runs, so
      // it keys the item deterministically rather than randomly.
      _key: componentName,
      name,
      blurb: text.match(/blurb:\s*"([^"]*)"/)?.[1] ?? "",
      componentName,
      code: excerptComponent(src, componentName),
      status: "explored",
    });
  }
  return { source: src, variants };
}

/** Best-effort slice from `const <Name> = forwardRef(` to its balanced close. */
function excerptComponent(src, componentName) {
  const start = src.indexOf(`const ${componentName} =`);
  if (start === -1) return "";
  let depth = 0;
  let seen = false;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === "(") { depth++; seen = true; }
    else if (c === ")") {
      depth--;
      if (seen && depth === 0) return src.slice(start, i + 1);
    }
  }
  return "";
}

// ── Sanity HTTP ──────────────────────────────────────────────────────────────

/**
 * Reads SANITY_IMPORT_TOKEN from the environment, falling back to .env.local
 * (gitignored via `.env*`). Node doesn't load dotenv files for plain scripts, and
 * the repo has no dotenv dependency, so this is a deliberately tiny reader —
 * enough for `KEY=value`, quoted or not.
 */
function token() {
  if (process.env.SANITY_IMPORT_TOKEN) return process.env.SANITY_IMPORT_TOKEN;

  const envFile = join(ROOT, ".env.local");
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, "utf8").split("\n")) {
      const m = line.match(/^\s*SANITY_IMPORT_TOKEN\s*=\s*(.*)$/);
      if (!m) continue;
      const v = m[1].trim().replace(/^["']|["']$/g, "");
      if (v) return v;
    }
  }
  throw new Error(
    "SANITY_IMPORT_TOKEN is not set.\n" +
      "  Create a token with Editor permissions at\n" +
      "    https://www.sanity.io/manage/project/0gny1aq3/api#tokens\n" +
      "  then add it to .env.local (gitignored) as:\n" +
      "    SANITY_IMPORT_TOKEN=sk...",
  );
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
  const motion = loadMotionNames();
  const glows = loadGlows();
  const hidden = loadHiddenSlugs();

  // Fail loud, mirroring the generator's own posture: a partial import is worse
  // than none, because it looks complete.
  if (!existsSync(join(OUT_DIR, "registry.json"))) {
    throw new Error("public/r/registry.json missing — run `pnpm build:registry` first");
  }
  for (const slug of entries.keys()) {
    if (!motion.has(slug)) throw new Error(`no motion entry for "${slug}"`);
    if (!glows.has(slug)) throw new Error(`no glow entry for "${slug}"`);
    if (!existsSync(join(OUT_DIR, `${slug}.json`))) {
      throw new Error(`missing public/r/${slug}.json for "${slug}" — run \`pnpm build:registry\``);
    }
  }

  const labSlugs = new Set(
    existsSync(join(ROOT, "app", "lab"))
      ? readdirSync(join(ROOT, "app", "lab"), { withFileTypes: true })
          .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
          .map((d) => d.name)
          .filter((s) => existsSync(join(ROOT, "app", "lab", s, "page.tsx")))
      : [],
  );

  const syncedAt = new Date().toISOString();
  const docs = [];
  let labPages = 0;
  let labVariants = 0;

  for (const [slug, { name, keywords }] of [...entries].sort(([a], [b]) => a.localeCompare(b))) {
    const item = JSON.parse(readFileSync(join(OUT_DIR, `${slug}.json`), "utf8"));
    const doc = {
      _type: "icon",
      slug,
      name,
      keywords,
      motion: motion.get(slug),
      glow: glows.get(slug),
      homeVisibility: hidden.has(slug) ? "hidden" : "visible",
      tsxSource: item.files?.[0]?.content ?? "",
      sourceSyncedAt: syncedAt,
      // aiPrompt intentionally absent — Sanity owns it.
    };

    let lab = null;
    if (WITH_LAB && labSlugs.has(slug)) {
      lab = parseLabPage(slug);
      // Fail soft here: lab pages are exploratory tooling, not a contract.
      if (lab && lab.variants.length === 0) {
        console.warn(`  ! ${slug}: lab page found but no VARIANTS parsed — mirroring source only`);
      }
      if (lab) {
        labPages++;
        labVariants += lab.variants.length;
      }
    }
    docs.push({ doc, lab });
  }

  console.log(`icons:      ${docs.length}`);
  console.log(`  visible:  ${docs.filter((d) => d.doc.homeVisibility === "visible").length}`);
  console.log(`  hidden:   ${docs.filter((d) => d.doc.homeVisibility === "hidden").length}`);
  if (WITH_LAB) {
    console.log(`lab pages:  ${labPages}/${labSlugs.size} parsed, ${labVariants} variants`);
    const orphans = [...labSlugs].filter((s) => !entries.has(s));
    if (orphans.length) console.log(`  skipped (no registry icon): ${orphans.join(", ")}`);
  }

  if (!COMMIT) {
    console.log("\nDRY RUN — nothing written. Re-run with --commit to push.");
    return;
  }

  const existing = await query('*[_type == "icon"]{_id, slug}');
  const idBySlug = new Map((existing ?? []).map((d) => [d.slug, d._id]));
  console.log(`\nexisting docs in Sanity: ${idBySlug.size}`);

  const mutations = [];
  for (const { doc, lab } of docs) {
    const id = idBySlug.get(doc.slug);
    const withLab = lab ? { ...doc, labPageSource: lab.source } : doc;

    if (id) {
      // Patch the mirrored fields; never touch aiPrompt. labVariants is
      // setIfMissing so curated `status` survives a re-sync — unless --reset-lab
      // explicitly asks to overwrite it from source.
      const patch = { id, set: { ...withLab } };
      if (lab?.variants.length) {
        if (RESET_LAB) patch.set.labVariants = lab.variants;
        else patch.setIfMissing = { labVariants: lab.variants };
      }
      mutations.push({ patch });
    } else {
      // No _id — Sanity assigns one. Slug is content, not identity.
      const create = { ...withLab };
      if (lab?.variants.length) create.labVariants = lab.variants;
      mutations.push({ create });
    }
  }

  for (let i = 0; i < mutations.length; i += 50) {
    const batch = mutations.slice(i, i + 50);
    await mutate(batch);
    console.log(`  committed ${Math.min(i + 50, mutations.length)}/${mutations.length}`);
  }
  console.log("done.");
}

main().catch((err) => {
  console.error(`\nFAILED: ${err.message}`);
  process.exit(1);
});
