/**
 * Phosphor "angle" glyph — a right-angle gauge: two rays (an L) with a quarter ARC
 * sweeping between them and a small tick on the upper ray. ViewBox 0 0 256 256,
 * fill="currentColor". Split so the rays can be drawn while the arc reveals:
 *   ARC         — the quarter sweep marking the measured angle.
 *   TICK        — the upper-left stub; reads as part of the measurement (moves with ARC).
 *   RAYS_STROKE — centerline of the L, traced as a stroke (width 16 + round caps
 *                 reproduce the filled bars) so the rays draw x-axis → vertex → y-axis.
 */

export const ARC =
  "M96,72a8,8,0,0,1,8-8A104.11,104.11,0,0,1,208,168a8,8,0,0,1-16,0,88.1,88.1,0,0,0-88-88A8,8,0,0,1,96,72Z";

export const TICK = "M64,64H32a8,8,0,0,0,0,16H64Z";

export const RAYS_STROKE = "M232,200H72V40";

/** Inner corner of the L (the vertex) as a view-box fraction — origin for the arc/tick reveal. */
export const VERTEX = { x: 0.281, y: 0.781 };
