/**
 * Phosphor "align-bottom" glyph — a baseline bar with two outlined blocks (a tall
 * left one, a shorter right one) resting their bottoms on it. ViewBox 0 0 256 256,
 * fill="currentColor". Split so the blocks can move while the baseline holds:
 *   BASELINE    — the horizontal alignment bar.
 *   BLOCK_LEFT  — the tall block (outline + cut-out).
 *   BLOCK_RIGHT — the short block (outline + cut-out).
 *
 * Nothing about the artwork changes — these are the icon's own paths, only animated.
 */

/** The bottom alignment bar. */
export const BASELINE = "M224,216a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,216Z";

/** Tall left block (outline with cut-out). Outer bottom edge ≈ y192. */
export const BLOCK_LEFT =
  "M48,176V40A16,16,0,0,1,64,24h40a16,16,0,0,1,16,16V176a16,16,0,0,1-16,16H64A16,16,0,0,1,48,176ZM64,176h40V40H64Z";

/** Short right block (outline with cut-out). Outer bottom edge ≈ y192. */
export const BLOCK_RIGHT =
  "M136,176V80a16,16,0,0,1,16-16h40a16,16,0,0,1,16,16v96a16,16,0,0,1-16,16H152A16,16,0,0,1,136,176ZM152,176h40V80H152Z";

/** Full glyph for static previews. */
export const ALIGN_BOTTOM = `${BASELINE}${BLOCK_LEFT}${BLOCK_RIGHT}`;

/**
 * The blocks' shared bottom edge as a view-box fraction (y≈192/256). Use as the
 * transform origin so scaling keeps every bottom planted on the alignment line.
 */
export const BLOCKS_BASE = 0.75;
