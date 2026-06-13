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
};

export const META_FALLBACK: IconMeta = { motion: "spring", glow: "#6E56F7" };

export function metaFor(slug: string): IconMeta {
  return ICON_META[slug] ?? META_FALLBACK;
}

/** The install line shown/copied for a given icon. */
export function installCommand(slug: string): string {
  return `npx shadcn@latest add iconimate.dev/r/${slug}.json`;
}
