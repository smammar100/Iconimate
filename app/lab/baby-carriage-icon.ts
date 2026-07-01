// Phosphor "baby-carriage" (regular, 256 grid) — a pram facing left: a push-handle curling
// off the lower-left, a bassinet bowl on an axle with two wheels, and a big semicircular
// HOOD (right half-disc, centre ≈(160,112), r80) split into segments by two spoke wedges.
//
// The glyph is one compound path whose overlapping windings draw the line-art. For the
// hood-unfurl motion we need the hood to move on its own, so the parts below split it out:
// the carriage BODY (frame + bassinet, no hood) stays put while the HOOD flaps about its
// front hinge at x160. Kept as compound sub-paths (same nonzero winding as the original)
// so each part still renders as line-art, not a solid blob.

/** The whole glyph — used for the rigid-body variants (pop / roll / rock / bump) and reduced-motion. */
export const BABY_CARRIAGE =
  "M160,32h-8a16,16,0,0,0-16,16v56H55.2A40.07,40.07,0,0,0,16,72a8,8,0,0,0,0,16,24,24,0,0,1,24,24,80.09,80.09,0,0,0,80,80h40a80,80,0,0,0,0-160Zm63.48,72H166.81l41.86-33.49A63.73,63.73,0,0,1,223.48,104ZM160,48a63.59,63.59,0,0,1,36.69,11.61L152,95.35V48Zm0,128H120a64.09,64.09,0,0,1-63.5-56h167A64.09,64.09,0,0,1,160,176Zm-56,48a16,16,0,1,1-16-16A16,16,0,0,1,104,224Zm104,0a16,16,0,1,1-16-16A16,16,0,0,1,208,224Z";

/** Carriage without the hood: the handle/frame (closed along the hinge line x160) plus the
 *  bassinet bowl. Wheels are separate so they can be added around it. */
export const BC_BODY =
  "M160,32h-8a16,16,0,0,0-16,16v56H55.2A40.07,40.07,0,0,0,16,72a8,8,0,0,0,0,16a24,24,0,0,1,24,24a80.09,80.09,0,0,0,80,80h40Z" +
  "M160,176H120a64.09,64.09,0,0,1-63.5-56h167A64.09,64.09,0,0,1,160,176Z";

/** Left and right wheels (self-contained ring sub-paths). */
export const BC_WHEEL_L = "M104,224a16,16,0,1,1-16-16A16,16,0,0,1,104,224Z";
export const BC_WHEEL_R = "M208,224a16,16,0,1,1-16-16A16,16,0,0,1,208,224Z";

/** The hood: the right half-disc (drawn from the top, flat edge on the hinge line x160)
 *  plus the two spoke wedges that segment it — nonzero winding cuts the spoke lines. */
export const BC_HOOD =
  "M160,32a80,80,0,0,1,0,160Z" +
  "M223.48,104H166.81l41.86-33.49A63.73,63.73,0,0,1,223.48,104Z" +
  "M160,48a63.59,63.59,0,0,1,36.69,11.61L152,95.35V48Z";

/** The hood's hinge (front edge, vertical centre) — the pivot/anchor for the unfurl. */
export const BC_HOOD_HINGE = { x: 160, y: 112 };

/** Ground contact between the wheels — the pivot for rocking/bump motion. */
export const BC_GROUND = { x: 140, y: 224 };
