/**
 * Phosphor address-book icon — the ORIGINAL glyph, untouched.
 * ViewBox 0 0 256 256. The three page tabs are white NOTCHES (holes) cut into the
 * solid right-hand spine, so they cannot be animated as separate solid shapes
 * without changing the book. Instead we keep the book exactly original and animate
 * the notches as an SVG mask cutout (see the variant files).
 */

/** The full original compound path — render with fill="currentColor". */
export const BOOK =
  "M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm-16,72h16v48H192Zm16-16H192V48h16ZM48,48H176V208H48ZM208,208H192V168h16v40Zm-56.25-42a39.76,39.76,0,0,0-17.19-23.34,32,32,0,1,0-45.12,0A39.84,39.84,0,0,0,72.25,166a8,8,0,0,0,15.5,4c2.64-10.25,13.06-18,24.25-18s21.62,7.73,24.25,18a8,8,0,1,0,15.5-4ZM96,120a16,16,0,1,1,16,16A16,16,0,0,1,96,120Z";

/**
 * The original glyph with the three tab notches FILLED IN (solid spine, no notches).
 * This is the mask base: the notches are re-cut by the animated mask rects below,
 * so BODY + mask renders pixel-identical to BOOK at rest. fill="currentColor".
 */
export const BODY =
  "M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Z" +
  "M48,48H176V208H48Z" +
  "M151.75,166a39.76,39.76,0,0,0-17.19-23.34,32,32,0,1,0-45.12,0A39.84,39.84,0,0,0,72.25,166a8,8,0,0,0,15.5,4c2.64-10.25,13.06-18,24.25-18s21.62,7.73,24.25,18a8,8,0,1,0,15.5-4Z" +
  "M96,120a16,16,0,1,1,16,16A16,16,0,0,1,96,120Z";

/**
 * The three page-tab notches (exactly as in the original), drawn black inside a
 * white mask so they cut transparent windows into BODY's spine. Animating these
 * moves the tabs while the book stays 100% original.
 */
export const NOTCHES = [
  "M192,48H208V88H192Z",   // top    y 48–88
  "M192,104H208V152H192Z", // middle y 104–152
  "M192,168H208V208H192Z", // bottom y 168–208
];

/** Each notch's centre as a view-box fraction. Spine hinge (left edge x=192) = 0.75. */
export const NOTCH_ORIGINS = [
  { x: 0.75, y: 0.266 }, // top    centre y=68
  { x: 0.75, y: 0.5 },   // middle centre y=128
  { x: 0.75, y: 0.734 }, // bottom centre y=188
];
