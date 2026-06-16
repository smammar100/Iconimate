/**
 * Phosphor "align-center-horizontal-simple" glyph — the real, unmodified path.
 * ViewBox 0 0 256 256, fill="currentColor". A single fused outline: a vertical
 * center guide with one hollow block fused to it, plus a clean rectangular cut-out
 * for the block interior.
 *
 * It is ONE path on purpose — the block carries connector notches where it meets
 * the guide, so it can't be split into a clean rectangle without altering the
 * artwork. The animations transform the whole glyph, never its pieces, so the
 * drawing stays pixel-identical to Phosphor.
 */
export const ALIGN_CENTER_HORIZONTAL =
  "M208,80H136V48a8,8,0,0,0-16,0V80H48A16,16,0,0,0,32,96v64a16,16,0,0,0,16,16h72v32a8,8,0,0,0,16,0V176h72a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm0,80H48V96H208v64Z";
