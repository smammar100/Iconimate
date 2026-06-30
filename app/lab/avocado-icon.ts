// Phosphor "avocado" (regular, 256 grid) — a pear-shaped skin outline with a round pit
// in the lower middle. It splits cleanly: the BODY is the avocado outline (a ring: skin
// + inner flesh edge), the PIT is the stone (a ring centred at (128,160)). Keeping them
// apart lets the pit settle / bounce on its own. The body sits on its base at ~y232.

/** The pit (stone) — a ring centred at (128,160). */
export const AVOCADO_PIT =
  "M128,112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,112Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,192Z";

/** The avocado body — skin outline + inner flesh edge. */
export const AVOCADO_BODY =
  "M211,130.66L181.2,46.47a56,56,0,0,0-106-1.14h0l-29.51,83.5A88,88,0,1,0,211,130.66ZM128,232a72.05,72.05,0,0,1-67.33-97.57,1.34,1.34,0,0,1,.07-.18L90.28,50.66h0a40,40,0,0,1,75.74.88l.06.18L195.9,136A72.05,72.05,0,0,1,128,232Z";

/** Approx. centre of the pit, in viewBox units. */
export const AVOCADO_PIT_CENTER = { x: 128, y: 160 };

/** The exact shipped glyph — pit + body. */
export const AVOCADO = AVOCADO_PIT + AVOCADO_BODY;
