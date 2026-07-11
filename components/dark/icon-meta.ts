/**
 * Per-icon metadata for the Dark Command theme. The hue is no longer painted on
 * the card surface (as in the old Spectrum build) — it survives only as `glow`,
 * a faint identity color bloomed behind the glyph on a dark card.
 */
export interface IconMeta {
  motion: string;
  glow: string;
}

export const ICON_META: Record<string, IconMeta> = {
  bell: { motion: "swing", glow: "#E34BA0" },
  heart: { motion: "pop", glow: "#C457E0" },
  star: { motion: "twinkle", glow: "#E6C100" },
  bookmark: { motion: "yoyo", glow: "#6E72F0" },
  sun: { motion: "spin", glow: "#F0973A" },
  "arrow-right": { motion: "spring", glow: "#2DD4BF" },
  acorn: { motion: "rock", glow: "#5CC24E" },
  mail: { motion: "open", glow: "#4F8FF7" },
  bolt: { motion: "strike", glow: "#A8D43A" },
  moon: { motion: "doze", glow: "#9A6CF0" },
  camera: { motion: "snap", glow: "#2CC6E0" },
  trash: { motion: "toss", glow: "#F0584F" },
  cloud: { motion: "drift", glow: "#23C4D6" },
  "address-book": { motion: "nod", glow: "#F56EB3" },
  "control-tower": { motion: "flip", glow: "#3B82F6" },
  "phone-book": { motion: "page flip", glow: "#E0A23C" },
  airplane: { motion: "thermal", glow: "#46B0E6" },
  "airplane-in-flight": { motion: "climb", glow: "#2BB3A3" },
  "airplane-landing": { motion: "arrival", glow: "#EC6A5E" },
  "airplane-takeoff": { motion: "departure", glow: "#9D7BF4" },
  "airplane-taxiing": { motion: "taxi-in", glow: "#5FB97A" },
  "airplane-tilt": { motion: "bank", glow: "#C77DF0" },
  presentation: { motion: "tap", glow: "#E6A23C" },
  alarm: { motion: "ring", glow: "#F0584F" },
  alien: { motion: "glow eyes", glow: "#22C55E" },
  "align-bottom": { motion: "drop", glow: "#5B8DEF" },
  "align-bottom-simple": { motion: "drop", glow: "#5B8DEF" },
  "align-center-horizontal": { motion: "drop", glow: "#5B8DEF" },
  "align-center-horizontal-simple": { motion: "drop", glow: "#5B8DEF" },
  "align-center-vertical": { motion: "drop", glow: "#5B8DEF" },
  "align-center-vertical-simple": { motion: "drop", glow: "#5B8DEF" },
  "align-left": { motion: "drop", glow: "#5B8DEF" },
  "align-left-simple": { motion: "drop", glow: "#5B8DEF" },
  "align-right": { motion: "drop", glow: "#5B8DEF" },
  "align-right-simple": { motion: "drop", glow: "#5B8DEF" },
  "align-top": { motion: "drop", glow: "#5B8DEF" },
  "align-top-simple": { motion: "drop", glow: "#5B8DEF" },
  "amazon-logo": { motion: "wobble", glow: "#FF9900" },
  ambulance: { motion: "drive", glow: "#F0584F" },
  anchor: { motion: "sway", glow: "#3B82F6" },
  "anchor-simple": { motion: "sway", glow: "#3B82F6" },
  "android-logo": { motion: "hop", glow: "#3DDC84" },
  angle: { motion: "draw", glow: "#14B8A6" },
  angular: { motion: "flip", glow: "#DD0031" },
  aperture: { motion: "iris", glow: "#22D3EE" },
  "app-store-logo": { motion: "draw", glow: "#0D96F6" },
  "app-window": { motion: "blink", glow: "#8B5CF6" },
  "apple-logo": { motion: "flick", glow: "#A3AAAE" },
  "apple-podcasts-logo": { motion: "wave", glow: "#A855F7" },
  "approximate-equals": { motion: "nudge", glow: "#2DD4BF" },
  archive: { motion: "stash", glow: "#F59E0B" },
  armchair: { motion: "puff", glow: "#14B8A6" },
  article: { motion: "write", glow: "#6E72F0" },
  "article-medium": { motion: "publish", glow: "#3CB46E" },
  "article-ny-times": { motion: "publish", glow: "#8A8F98" },
  "arrow-arc-left": { motion: "draw", glow: "#3B82F6" },
  "arrow-arc-right": { motion: "draw", glow: "#6366F1" },
  "arrow-bend-double-up-left": { motion: "snap", glow: "#2DD4BF" },
  "arrow-bend-double-up-right": { motion: "snap", glow: "#2DD4BF" },
  "arrow-bend-down-left": { motion: "snap", glow: "#2DD4BF" },
  "arrow-bend-down-right": { motion: "snap", glow: "#2DD4BF" },
  "arrow-bend-left-down": { motion: "snap", glow: "#2DD4BF" },
  "arrow-bend-left-up": { motion: "snap", glow: "#2DD4BF" },
  "arrow-bend-right-down": { motion: "snap", glow: "#2DD4BF" },
  "arrow-bend-right-up": { motion: "snap", glow: "#2DD4BF" },
  "arrow-bend-up-left": { motion: "snap", glow: "#2DD4BF" },
  "arrow-bend-up-right": { motion: "snap", glow: "#2DD4BF" },
  "arrow-circle-down": { motion: "scroll", glow: "#2DD4BF" },
  "arrow-circle-down-left": { motion: "scroll", glow: "#2DD4BF" },
  "arrow-circle-down-right": { motion: "scroll", glow: "#2DD4BF" },
  "arrow-circle-left": { motion: "scroll", glow: "#2DD4BF" },
  "arrow-circle-right": { motion: "scroll", glow: "#2DD4BF" },
  "arrow-circle-up": { motion: "scroll", glow: "#2DD4BF" },
  "arrow-circle-up-left": { motion: "scroll", glow: "#2DD4BF" },
  "arrow-circle-up-right": { motion: "scroll", glow: "#2DD4BF" },
  "arrow-clockwise": { motion: "wind", glow: "#2DD4BF" },
  "arrow-counter-clockwise": { motion: "wind", glow: "#2DD4BF" },
  "arrow-down": { motion: "spring", glow: "#2DD4BF" },
  "arrow-down-left": { motion: "spring", glow: "#2DD4BF" },
  "arrow-down-right": { motion: "spring", glow: "#2DD4BF" },
  "arrow-fat-down": { motion: "plunge", glow: "#2DD4BF" },
  "arrow-fat-left": { motion: "plunge", glow: "#2DD4BF" },
  "arrow-fat-line-down": { motion: "plunge", glow: "#2DD4BF" },
  "arrow-fat-line-left": { motion: "plunge", glow: "#2DD4BF" },
  "arrow-fat-line-right": { motion: "plunge", glow: "#2DD4BF" },
  "arrow-fat-line-up": { motion: "plunge", glow: "#2DD4BF" },
  "arrow-fat-lines-down": { motion: "plunge", glow: "#2DD4BF" },
  "arrow-fat-lines-left": { motion: "plunge", glow: "#2DD4BF" },
  "arrow-fat-lines-right": { motion: "plunge", glow: "#2DD4BF" },
  "arrow-fat-lines-up": { motion: "plunge", glow: "#2DD4BF" },
  "arrow-fat-right": { motion: "plunge", glow: "#2DD4BF" },
  "arrow-fat-up": { motion: "plunge", glow: "#2DD4BF" },
  "arrow-left": { motion: "spring", glow: "#2DD4BF" },
  "arrow-line-down": { motion: "whip", glow: "#2DD4BF" },
  "arrow-line-down-left": { motion: "whip", glow: "#2DD4BF" },
  "arrow-line-down-right": { motion: "whip", glow: "#2DD4BF" },
  "arrow-line-left": { motion: "whip", glow: "#2DD4BF" },
  "arrow-line-right": { motion: "whip", glow: "#2DD4BF" },
  "arrow-line-up": { motion: "whip", glow: "#2DD4BF" },
  "arrow-line-up-left": { motion: "whip", glow: "#2DD4BF" },
  "arrow-line-up-right": { motion: "whip", glow: "#2DD4BF" },
  "arrow-square-down": { motion: "scroll", glow: "#2DD4BF" },
  "arrow-square-down-left": { motion: "scroll", glow: "#2DD4BF" },
  "arrow-square-down-right": { motion: "scroll", glow: "#2DD4BF" },
  "arrow-square-in": { motion: "tuck", glow: "#2DD4BF" },
  "arrow-square-left": { motion: "scroll", glow: "#2DD4BF" },
  "arrow-square-out": { motion: "tuck out", glow: "#2DD4BF" },
  "arrow-square-right": { motion: "scroll", glow: "#2DD4BF" },
  "arrow-square-up": { motion: "scroll", glow: "#2DD4BF" },
  "arrow-square-up-left": { motion: "scroll", glow: "#2DD4BF" },
  "arrow-square-up-right": { motion: "scroll", glow: "#2DD4BF" },
  "arrow-u-down-left": { motion: "bounce", glow: "#2DD4BF" },
  "arrow-u-down-right": { motion: "bounce", glow: "#2DD4BF" },
  "arrow-u-left-down": { motion: "bounce", glow: "#2DD4BF" },
  "arrow-u-left-up": { motion: "bounce", glow: "#2DD4BF" },
  "arrow-u-right-down": { motion: "bounce", glow: "#2DD4BF" },
  "arrow-u-right-up": { motion: "bounce", glow: "#2DD4BF" },
  "arrow-u-up-left": { motion: "bounce", glow: "#2DD4BF" },
  "arrow-u-up-right": { motion: "bounce", glow: "#2DD4BF" },
  "arrow-up": { motion: "spring", glow: "#2DD4BF" },
  "arrow-up-left": { motion: "spring", glow: "#2DD4BF" },
  "arrow-up-right": { motion: "spring", glow: "#2DD4BF" },
  "arrows-clockwise": { motion: "pulse", glow: "#2DD4BF" },
  "arrows-counter-clockwise": { motion: "pulse", glow: "#2DD4BF" },
  "arrows-down-up": { motion: "bounce", glow: "#2DD4BF" },
  "arrows-horizontal": { motion: "rubber band", glow: "#2DD4BF" },
  "arrows-in": { motion: "stagger", glow: "#2DD4BF" },
  "arrows-in-cardinal": { motion: "stagger", glow: "#2DD4BF" },
  "arrows-in-line-horizontal": { motion: "whip", glow: "#2DD4BF" },
  "arrows-in-line-vertical": { motion: "whip", glow: "#2DD4BF" },
  "arrows-in-simple": { motion: "stagger", glow: "#2DD4BF" },
  "arrows-merge": { motion: "plunge", glow: "#2DD4BF" },
  "arrows-out": { motion: "stagger", glow: "#2DD4BF" },
  "arrows-out-cardinal": { motion: "stagger", glow: "#2DD4BF" },
  "arrows-out-line-horizontal": { motion: "whip", glow: "#2DD4BF" },
  "arrows-out-line-vertical": { motion: "whip", glow: "#2DD4BF" },
  "arrows-out-simple": { motion: "stagger", glow: "#2DD4BF" },
  "arrows-split": { motion: "plunge", glow: "#2DD4BF" },
  "arrows-vertical": { motion: "rubber band", glow: "#2DD4BF" },
  asclepius: { motion: "wrap", glow: "#22C3A6" },
  asterisk: { motion: "supernova", glow: "#F5C04A" },
  "asterisk-simple": { motion: "supernova", glow: "#F5A33A" },
  at: { motion: "spin in", glow: "#4F8FF7" },
  atom: { motion: "spin + pulse", glow: "#2DD4BF" },
  avocado: { motion: "drop & sway", glow: "#7CB342" },
  axe: { motion: "chop", glow: "#FF5C39" },
  baby: { motion: "giggle", glow: "#2BC4C4" },
  "baby-carriage": { motion: "suspension", glow: "#2BC4C4" },
  backpack: { motion: "sway", glow: "#FF9F1C" },
  backspace: { motion: "nudge + strike", glow: "#F43F5E" },
  bag: { motion: "lift + swing", glow: "#F472B6" },
  "bag-simple": { motion: "lift + swing", glow: "#F472B6" },
  balloon: { motion: "ascend + float", glow: "#38BDF8" },
  bandaids: { motion: "check-up", glow: "#FB7185" },
  bank: { motion: "construct + $", glow: "#EAB308" },
  barbell: { motion: "rubber drop", glow: "#A3E635" },
  barcode: { motion: "beep", glow: "#818CF8" },
  "arrows-left-right": { motion: "bounce", glow: "#2DD4BF" },
  "arrow-elbow-down-left": { motion: "draw", glow: "#34D399" },
  "arrow-elbow-down-right": { motion: "draw", glow: "#34D399" },
  "arrow-elbow-left": { motion: "draw", glow: "#34D399" },
  "arrow-elbow-left-down": { motion: "draw", glow: "#34D399" },
  "arrow-elbow-left-up": { motion: "draw", glow: "#34D399" },
  "arrow-elbow-right": { motion: "draw", glow: "#34D399" },
  "arrow-elbow-right-down": { motion: "draw", glow: "#34D399" },
  "arrow-elbow-right-up": { motion: "draw", glow: "#34D399" },
  "arrow-elbow-up-left": { motion: "draw", glow: "#34D399" },
  "arrow-elbow-up-right": { motion: "draw", glow: "#34D399" },
};

export const META_FALLBACK: IconMeta = { motion: "spring", glow: "#6E56F7" };

export function metaFor(slug: string): IconMeta {
  return ICON_META[slug] ?? META_FALLBACK;
}

/* ── Distribution ─────────────────────────────────────────────────────────
 * Every icon ships as a shadcn registry item at /r/<slug>.json (generated by
 * scripts/build-registry.mjs into public/r). Copied commands use the canonical
 * production domain; in-app fetches use the relative path so previews work on
 * any deploy URL.
 */

export const SITE = "https://iconimate.app";

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

export const PACKAGE_MANAGERS: PackageManager[] = ["pnpm", "npm", "yarn", "bun"];

const PM_RUNNER: Record<PackageManager, string> = {
  pnpm: "pnpm dlx",
  npm: "npx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
};

/** Absolute URL of an icon's registry item (for copied commands + v0). */
export function registryUrl(slug: string): string {
  return `${SITE}/r/${slug}.json`;
}

/** The install line shown/copied for a given icon. */
export function installCommand(slug: string, pm: PackageManager = "npm"): string {
  return `${PM_RUNNER[pm]} shadcn@latest add ${registryUrl(slug)}`;
}

/** "Open in v0" deep link — hands the registry item to v0.dev. */
export function v0Url(slug: string): string {
  return `https://v0.dev/chat/api/open?url=${encodeURIComponent(registryUrl(slug))}`;
}

/** The icon's standalone .tsx source, fetched from the registry item we serve.
 *  Relative fetch so it works on localhost/previews; single source of truth. */
export async function fetchIconSource(slug: string): Promise<string> {
  const res = await fetch(`/r/${slug}.json`);
  if (!res.ok) throw new Error(`registry item ${slug} not found (${res.status})`);
  const item = (await res.json()) as { files?: { content?: string }[] };
  const content = item.files?.[0]?.content;
  if (!content) throw new Error(`registry item ${slug} has no file content`);
  return content;
}
