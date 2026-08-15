/**
 * Audits registry/icons/*.tsx against the mechanically checkable rules in
 * .claude/MOTION.md. Reports; it does not fix.
 *
 * WHAT THIS CAN AND CANNOT SEE, stated up front so the output is not mistaken for
 * a clean bill of health. It checks the rules that are decidable from source:
 * rest-pose parity (§1), parked round-cap dots (§5), ungated infinite repeats
 * (§13), hardcoded colour and off-weight strokes (§12), and opacity-only motion
 * (§1). It CANNOT check the standing test, whether the verb is real (§0), the
 * 18-unit amplitude floor (§2 — needs the pivot-to-ink radius, which depends on
 * rendered geometry), lane/clipping (§4), or material fit (§9). Those need eyes.
 *
 * Every icon is accounted for as analysed or skipped. A variant this parser cannot
 * read statically is reported as UNREADABLE, never silently passed — a checker that
 * quietly skips what it cannot handle is worse than no checker.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ICON_DIR = join(ROOT, "registry", "icons");

/** Motion's implicit rest value when a property is absent from `normal`. */
const REST_DEFAULT = {
  scale: 1, scaleX: 1, scaleY: 1, opacity: 1, pathLength: 1,
  rotate: 0, x: 0, y: 0, translateX: 0, translateY: 0, skewX: 0, skewY: 0,
};
const ANIMATABLE = Object.keys(REST_DEFAULT);

/** Index of the brace/bracket matching the one at `open`, respecting strings. */
function matchBrace(src, open) {
  const pairs = { "{": "}", "[": "]", "(": ")" };
  const close = pairs[src[open]];
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      i++;
      while (i < src.length && src[i] !== quote) i += src[i] === "\\" ? 2 : 1;
      continue;
    }
    if (c === src[open]) depth++;
    else if (c === close && --depth === 0) return i;
  }
  return -1;
}

/** Split an object/array body into top-level segments, ignoring nested depth. */
function splitTop(body) {
  const out = [];
  let depth = 0, start = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '"' || c === "'" || c === "`") {
      const q = c; i++;
      while (i < body.length && body[i] !== q) i += body[i] === "\\" ? 2 : 1;
      continue;
    }
    if ("{[(".includes(c)) depth++;
    else if ("}])".includes(c)) depth--;
    else if (c === "," && depth === 0) { out.push(body.slice(start, i)); start = i + 1; }
  }
  const tail = body.slice(start);
  if (tail.trim()) out.push(tail);
  return out;
}

/** Shallow `key: value` map of an object literal body. */
function objectPairs(body) {
  const map = new Map();
  for (const seg of splitTop(body)) {
    const m = seg.match(/^\s*(?:\/\*[\s\S]*?\*\/\s*)?["']?([A-Za-z_$][\w$]*)["']?\s*:/);
    if (!m) continue;
    map.set(m[1], seg.slice(seg.indexOf(":", m.index ?? 0) + 1).trim());
  }
  return map;
}

const num = (raw) => {
  const t = String(raw).trim();
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null;
};

/** Extract every `{ normal: {...}, animate: {...} }` variant object in a file. */
function findVariants(src) {
  const found = [];
  const re = /(?:const\s+([A-Za-z_$][\w$]*)\s*(?::\s*Variants)?\s*=\s*)\{/g;
  let m;
  while ((m = re.exec(src))) {
    const open = src.indexOf("{", m.index + m[0].length - 1);
    const close = matchBrace(src, open);
    if (close < 0) continue;
    const body = src.slice(open + 1, close);
    if (!/\bnormal\s*:/.test(body) || !/\banimate\s*:/.test(body)) continue;
    found.push({ name: m[1], body });
  }
  return found;
}

function parseState(raw) {
  if (!raw) return null;
  const t = raw.trim();
  if (!t.startsWith("{")) return "UNREADABLE";
  const close = matchBrace(t, 0);
  if (close < 0) return "UNREADABLE";
  return objectPairs(t.slice(1, close));
}

const all = readdirSync(ICON_DIR).filter((f) => f.endsWith(".tsx")).sort();
// `_*` are private factories inlined into icons, not shipped items. Audit them too
// (their defects reach every consumer) but count them separately so the icon total
// matches the registry.
const files = all;
const factories = all.filter((f) => f.startsWith("_"));
const findings = [];
const add = (rule, slug, detail) => findings.push({ rule, slug, detail });

let analysedVariants = 0, unreadableVariants = 0;
const iconsWithVariants = new Set();

for (const file of files) {
  const slug = file.replace(/\.tsx$/, "");
  const src = readFileSync(join(ICON_DIR, file), "utf8");

  // §12 — hardcoded colour. A mask's #fff/#000 is luminance, not colour.
  for (const hex of src.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []) {
    const isMaskLuminance = /mask/i.test(src) && /^#(fff|000)(fff|000)?$/i.test(hex);
    if (!isMaskLuminance) add("§12 hardcoded-colour", slug, hex);
  }

  // §12 — stroke weight. 16 is Phosphor's pen.
  for (const m of src.matchAll(/strokeWidth=\{([\d.]+)\}/g)) {
    if (Number(m[1]) !== 16) add("§12 stroke-weight", slug, `strokeWidth={${m[1]}}`);
  }

  // §13 — an infinite repeat must be gated on `ambient`.
  if (/repeat:\s*Infinity/.test(src) && !/ambient/.test(src)) {
    add("§13 ungated-repeat", slug, "repeat: Infinity with no `ambient`");
  }

  const roundCap = /strokeLinecap=["{]?["']?round/.test(src);
  const variants = findVariants(src);
  if (variants.length) iconsWithVariants.add(slug);

  for (const { name, body } of variants) {
    const pairs = objectPairs(body);
    const normal = parseState(pairs.get("normal"));
    const animate = parseState(pairs.get("animate"));
    if (normal === "UNREADABLE" || animate === "UNREADABLE" || !normal || !animate) {
      unreadableVariants++;
      add("UNREADABLE", slug, `variant \`${name}\` not statically analysable`);
      continue;
    }
    analysedVariants++;

    // AN ELEMENT INVISIBLE AT REST CANNOT BREAK THE REST PICTURE. Accents (rays,
    // streaks, echoes) legitimately sit at opacity 0 in `normal` and are absent from
    // the authored glyph, so their scale/rotate/pathLength at frame 0 is unobservable.
    // Only their opacity track has to open and close at 0. Without this the report is
    // dominated by non-defects and stops being read.
    const restOpacity = normal.has("opacity") ? num(normal.get("opacity")) : 1;
    const invisibleAtRest = restOpacity === 0;

    const animatedProps = [...animate.keys()].filter((k) => ANIMATABLE.includes(k));
    if (animatedProps.length === 1 && animatedProps[0] === "opacity") {
      add("§1 opacity-only", slug, `variant \`${name}\` animates opacity and nothing else`);
    }

    for (const prop of animatedProps) {
      if (invisibleAtRest && prop !== "opacity") continue;
      const raw = animate.get(prop);
      if (!raw.startsWith("[")) continue; // single target, not a keyframe track
      const close = matchBrace(raw, 0);
      if (close < 0) continue;
      const frames = splitTop(raw.slice(1, close)).map((s) => s.trim());
      if (frames.length < 2) continue;

      const restRaw = normal.has(prop) ? normal.get(prop) : String(REST_DEFAULT[prop]);
      const rest = num(restRaw);
      const first = num(frames[0]);
      const last = num(frames[frames.length - 1]);
      if (rest === null) continue; // rest is an expression — cannot decide

      // A full turn is the rest pose. `rotate: 360` is visually identical to 0, so
      // parity on rotation is modulo 360 — otherwise every honest full-turn icon
      // (biohazard, basketball) is reported as broken.
      const isRotation = prop.startsWith("rotate");
      const differs = (v) =>
        isRotation
          ? Math.abs((((v - rest) % 360) + 360) % 360) > 1e-6 &&
            Math.abs((((v - rest) % 360) + 360) % 360 - 360) > 1e-6
          : Math.abs(v - rest) > 1e-6;

      if (first !== null && differs(first)) {
        add("§1 first-keyframe", slug, `${name}.${prop} opens at ${first}, rest is ${rest}`);
      }
      if (last !== null && differs(last)) {
        add("§1 final-keyframe", slug, `${name}.${prop} closes at ${last}, rest is ${rest}`);
      }

      // §5 — a round-capped stroke parked at pathLength 0 renders a full-width dot.
      if (prop === "pathLength" && roundCap && frames.some((f) => num(f) === 0)) {
        const guarded = animate.has("opacity");
        if (!guarded) {
          add("§5 round-cap-dot", slug, `${name} holds pathLength 0 with round caps and no opacity guard`);
        }
      }
    }
  }
}

const order = [
  "§1 first-keyframe", "§1 final-keyframe", "§1 opacity-only", "§5 round-cap-dot",
  "§13 ungated-repeat", "§12 hardcoded-colour", "§12 stroke-weight", "UNREADABLE",
];
const grouped = new Map(order.map((r) => [r, []]));
for (const f of findings) (grouped.get(f.rule) ?? grouped.set(f.rule, []).get(f.rule)).push(f);

console.log(`files scanned          : ${files.length} (${files.length - factories.length} icons + ${factories.length} private factories)`);
console.log(`icons with variants    : ${iconsWithVariants.size}`);
console.log(`variants analysed      : ${analysedVariants}`);
console.log(`variants unreadable    : ${unreadableVariants}`);
console.log("");

let total = 0;
for (const [rule, list] of grouped) {
  if (!list.length) continue;
  total += list.length;
  const slugs = new Set(list.map((f) => f.slug));
  console.log(`${rule} — ${list.length} finding(s) across ${slugs.size} icon(s)`);
  for (const f of list) console.log(`  ${f.slug.padEnd(28)} ${f.detail}`);
  console.log("");
}
console.log(`TOTAL FINDINGS: ${total}`);
console.log("\nNot checked here (needs eyes): the standing test, §0 verb, §2 amplitude");
console.log("floor, §4 lane/clipping, §9 material fit, §11 sequencing.");
process.exit(total ? 1 : 0);
