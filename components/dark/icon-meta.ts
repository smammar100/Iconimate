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
  "arrow-right": { motion: "glide", glow: "#1FC7B6" },
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
};

export const META_FALLBACK: IconMeta = { motion: "spring", glow: "#6E56F7" };

export function metaFor(slug: string): IconMeta {
  return ICON_META[slug] ?? META_FALLBACK;
}

/** The install line shown/copied for a given icon. */
export function installCommand(slug: string): string {
  return `npx shadcn@latest add iconimate.dev/r/${slug}.json`;
}
