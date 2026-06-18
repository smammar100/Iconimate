/**
 * Phosphor "app-window" glyph — a rounded-rect window with two title-bar dots.
 * ViewBox 0 0 256 256, fill="currentColor". Split so the dots can animate alone:
 *   FRAME — the window border (outer + inner subpaths form the ring).
 *   DOT1 / DOT2 — the two title-bar dots.
 *
 * The dots blink about their own line (y≈84 → 0.328 of the view box).
 */
export const FRAME =
  "M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200Z";

export const DOT1 = "M80,84A12,12,0,1,1,68,72,12,12,0,0,1,80,84Z";
export const DOT2 = "M120,84a12,12,0,1,1-12-12A12,12,0,0,1,120,84Z";

/** Full glyph for static previews. */
export const APP_WINDOW = `${FRAME}${DOT1}${DOT2}`;
