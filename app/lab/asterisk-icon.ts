// Phosphor "asterisk" (regular, 256 grid) — a six-spoke star: three thick, round-
// capped lines crossing at the center (128,128). The shipped glyph is one filled
// outline; parsing its cap centers shows it's exactly three capsules — a vertical bar
// and two diagonals at ±31° — so we rebuild it as three rotatable rounded rects whose
// union is pixel-identical. That lets the lab variants animate each spoke on its own.

/** The exact shipped glyph — for the source chip. */
export const ASTERISK =
  "M214.86,180.12a8,8,0,0,1-11,2.74L136,142.13V216a8,8,0,0,1-16,0V142.13L52.12,182.86a8,8,0,1,1-8.23-13.72L112.45,128,43.89,86.86a8,8,0,1,1,8.23-13.72L120,113.87V40a8,8,0,0,1,16,0v73.87l67.88-40.73a8,8,0,1,1,8.23,13.72L143.55,128l68.56,41.14A8,8,0,0,1,214.86,180.12Z";

/** Spoke width (= stroke width / cap diameter) in viewBox units. */
export const ASTERISK_W = 16;

/**
 * The three crossing lines, each centered on (128,128). `len` is the capsule's full
 * length (cap-center to cap-center, + caps), `angle` its rotation in degrees. Render
 * each as a rounded rect inside `translate(128 128) rotate(angle)`; scaleX about its
 * center grows it along its own length (a spoke shooting out from the middle).
 */
export const ASTERISK_SPOKES = [
  { len: 176, angle: 90 }, // vertical
  { len: 186.59, angle: 30.9638 }, // "\" top-left ↔ bottom-right
  { len: 186.59, angle: -30.9638 }, // "/" top-right ↔ bottom-left
] as const;

export const ASTERISK_CENTER = { x: 128, y: 128 };
