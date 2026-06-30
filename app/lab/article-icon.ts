// Phosphor "article" (regular weight, 256 grid). The shipped glyph is one path;
// here we also expose the frame and the three text lines as separate subpaths so
// the lab variants can choreograph the parts (type the lines in, draw the frame,
// etc.) while staying pixel-identical to the original when recombined.

/** The rounded card frame (outer border with the inner cut-out). */
export const ARTICLE_FRAME =
  "M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200Z";

/** The three text lines, top → bottom. Each is its own filled pill. */
export const ARTICLE_LINES = [
  "M184,96a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,96Z",
  "M184,128a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,128Z",
  "M184,160a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,160Z",
] as const;

/** The exact shipped glyph — frame + all three lines as a single path. */
export const ARTICLE = ARTICLE_FRAME + ARTICLE_LINES.join("");
