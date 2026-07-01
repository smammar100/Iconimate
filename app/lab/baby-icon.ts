// Phosphor "baby" (regular, 256 grid) — a round face with two dot eyes, a soft smile,
// and a single curl of hair rising off the crown. It's one filled path, so we treat it
// as a rigid body and move / squash the whole glyph (no separable eyes or mouth).
//
// The face circle is r≈104 centred at (128,128), so the head spans y≈24→232; the curl
// pushes up to y≈40 at the crown. That leaves ~24px of margin top and bottom inside the
// 256 box — enough head-room for a small lift without clipping.
export const BABY =
  "M92,140a12,12,0,1,1,12-12A12,12,0,0,1,92,140Zm72-24a12,12,0,1,0,12,12A12,12,0,0,0,164,116Zm-12.27,45.23a45,45,0,0,1-47.46,0,8,8,0,0,0-8.54,13.54,61,61,0,0,0,64.54,0,8,8,0,0,0-8.54-13.54ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88.11,88.11,0,0,0-84.09-87.91C120.32,56.38,120,71.88,120,72a8,8,0,0,0,16,0,8,8,0,0,1,16,0,24,24,0,0,1-48,0c0-.73.13-14.3,8.46-30.63A88,88,0,1,0,216,128Z";

/** Bottom-of-head anchor (viewBox units) — the ground a squash settles onto. */
export const BABY_FLOOR = { x: 128, y: 232 };
