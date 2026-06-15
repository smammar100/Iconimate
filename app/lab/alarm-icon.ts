/**
 * Phosphor "alarm" glyph — a round clock with two splayed feet and a pair of
 * hands. ViewBox 0 0 256 256, fill="currentColor". Split into its natural bodies
 * so the hands can sweep and the feet can rattle independently of the dial:
 *   FACE  — the outer ring (clock face).
 *   EARS  — the two angled feet / bells at the top.
 *   HANDS — the hour + minute hands, meeting at the dial centre.
 */

/** Clock face — the outer ring. */
export const FACE =
  "M128,40a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,40Zm0,176a80,80,0,1,1,80-80A80.09,80.09,0,0,1,128,216Z";

/** Left foot / bell. */
export const LEFT_EAR =
  "M61.66,37.66l-32,32A8,8,0,0,1,18.34,58.34l32-32A8,8,0,0,1,61.66,37.66Z";

/** Right foot / bell. */
export const RIGHT_EAR =
  "M237.66,69.66a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,237.66,69.66Z";

/** Both feet as one body. */
export const EARS = `${LEFT_EAR}${RIGHT_EAR}`;

/** Clock hands — hour + minute, hinged at the dial centre. */
export const HANDS =
  "M184,128a8,8,0,0,1,0,16H128a8,8,0,0,1-8-8V80a8,8,0,0,1,16,0v48Z";

/** Full glyph for static previews. */
export const ALARM = `${FACE}${EARS}${HANDS}`;

/** Dial centre as a view-box fraction — pivot for shakes, sweeps, and spins. */
export const ALARM_PIVOT = { x: 0.5, y: 0.531 };
