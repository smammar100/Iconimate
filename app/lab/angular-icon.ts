/**
 * Phosphor "angular-logo" glyph — the Angular shield badge with an "A" inside.
 * ViewBox 0 0 256 256, fill="currentColor". Split so the parts can animate:
 *   SHIELD   — the badge ring (outer outline + inner cut-out).
 *   LETTER_A — the "A" mark and its triangular counter.
 *
 * Both pivot about the badge centre (0.5, 0.5).
 */

export const SHIELD =
  "M227.08,64.62l-96-40a7.93,7.93,0,0,0-6.16,0l-96,40a8,8,0,0,0-4.85,8.44l16,120a8,8,0,0,0,4.35,6.1l80,40a8,8,0,0,0,7.16,0l80-40a8,8,0,0,0,4.35-6.1l16-120A8,8,0,0,0,227.08,64.62ZM200.63,186.74,128,223.06,55.37,186.74,40.74,77,128,40.67,215.26,77Z";

export const LETTER_A =
  "M121,84.12l-40,72a8,8,0,1,0,14,7.76L106,144H150l11,19.88a8,8,0,1,0,14-7.76l-40-72a8,8,0,0,0-14,0ZM141.07,128H114.93L128,104.47Z";

/** Full glyph for static previews. */
export const ANGULAR = `${SHIELD}${LETTER_A}`;
