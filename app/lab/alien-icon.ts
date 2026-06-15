/**
 * Phosphor "alien" glyph — a domed head with two big almond eyes and a small
 * mouth. ViewBox 0 0 256 256, fill="currentColor". Split so the eyes can blink
 * and light up independently of the head:
 *   HEAD       — the outer dome outline (outer + inner edge → a ring).
 *   EYES       — the two hollow almond eye outlines (with their cut-outs).
 *   MOUTH      — the little mouth bar.
 *   *_EYE_FILL — solid almonds (no cut-out) for the glow / fill-on-hover effect.
 */

const HEAD_OUTER =
  "M128,16a96.11,96.11,0,0,0-96,96c0,24,12.56,55.06,33.61,83,21.18,28.15,44.5,45,62.39,45s41.21-16.81,62.39-45c21.05-28,33.61-59,33.61-83A96.11,96.11,0,0,0,128,16Z";
const HEAD_INNER =
  "M177.61,185.42C160.24,208.49,140.31,224,128,224s-32.24-15.51-49.61-38.58C59.65,160.5,48,132.37,48,112a80,80,0,0,1,160,0C208,132.37,196.35,160.5,177.61,185.42Z";

const LEFT_EYE_OUTER =
  "M120,136A40,40,0,0,0,80,96a16,16,0,0,0-16,16,40,40,0,0,0,40,40A16,16,0,0,0,120,136Z";
const LEFT_EYE_INNER = "M80,112a24,24,0,0,1,24,24h0A24,24,0,0,1,80,112Z";
const RIGHT_EYE_OUTER =
  "M176,96a40,40,0,0,0-40,40,16,16,0,0,0,16,16,40,40,0,0,0,40-40A16,16,0,0,0,176,96Z";
const RIGHT_EYE_INNER = "M152,136a24,24,0,0,1,24-24A24,24,0,0,1,152,136Z";

/** Head dome outline (a ring). */
export const HEAD = `${HEAD_OUTER}${HEAD_INNER}`;

/** Both eyes as hollow almond outlines. */
export const EYES = `${LEFT_EYE_OUTER}${LEFT_EYE_INNER}${RIGHT_EYE_OUTER}${RIGHT_EYE_INNER}`;

/** Solid (no cut-out) eye almonds — overlaid and lit up for the glow variant. */
export const LEFT_EYE_FILL = LEFT_EYE_OUTER;
export const RIGHT_EYE_FILL = RIGHT_EYE_OUTER;

/** Mouth bar. */
export const MOUTH = "M152,184a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,184Z";

/** Full glyph for static previews. */
export const ALIEN = `${HEAD}${EYES}${MOUTH}`;

/** Head centre as a view-box fraction — pivot for bobs, floats, pops. */
export const ALIEN_PIVOT = { x: 0.5, y: 0.5 };

/** The eye line (shared y-centre of both eyes) — origin for blinks / eye scaling. */
export const EYE_LINE = { x: 0.5, y: 0.484 };

/** Glow colour — a saturated green that reads on both light and dark surfaces. */
export const EYE_GLOW = "#22C55E";
