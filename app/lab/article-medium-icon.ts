// Phosphor "article-medium" (regular, 256 grid). The shipped glyph is one path: a
// serif "M" drop-cap on the left, two short text lines beside it, and two full-width
// lines below. Here we also expose the M and each line as standalone subpaths so the
// lab variants can choreograph the parts; recombined they're pixel-identical.

/** The serif "M" drop-cap (left). */
export const ARTICLE_MEDIUM_M =
  "M56,136a8,8,0,0,1-8,8H24a8,8,0,0,1,0-16h8V64H24a8,8,0,0,1,0-16H40v0a8,8,0,0,1,6.78,3.74L80,104.91l33.22-53.15A8,8,0,0,1,120,48v0h16a8,8,0,0,1,0,16h-8v64h8a8,8,0,0,1,0,16H112a8,8,0,0,1,0-16V83.89L86.78,124.24a8,8,0,0,1-13.56,0L48,83.89V128A8,8,0,0,1,56,136Z";

/** The four text lines in reading order. `left`/`cy` give each pill's left edge and
 *  vertical center (viewBox units) so variants can anchor a left-edge type-in wipe. */
export const ARTICLE_MEDIUM_LINES = [
  { d: "M168,112h64a8,8,0,0,0,0-16H168a8,8,0,0,0,0,16Z", left: 168, cy: 104 },
  { d: "M232,128H168a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Z", left: 168, cy: 136 },
  { d: "M232,160H80a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16Z", left: 80, cy: 168 },
  { d: "M232,192H80a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16Z", left: 80, cy: 200 },
] as const;

/** The exact shipped glyph — M + all four lines as a single path. */
export const ARTICLE_MEDIUM =
  ARTICLE_MEDIUM_M + ARTICLE_MEDIUM_LINES.map((l) => l.d).join("");
