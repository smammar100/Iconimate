"use client";

import { makeArrowTravel } from "./_arrow-travel";

// TRAVEL — the arrow goes where it points: it accelerates off the right edge, and
// while it is genuinely off-frame it is repositioned past the left and eases back in
// to rest. Replaces an in-place elastic stretch, which moved the arrow nowhere.
//
// Exact Phosphor arrow-fat-line-right; the artwork is untouched and the rest state is the original
// glyph. Measured box x32..240 — the travel vectors live in the shared engine.
const ARROW =
  "M237.66,122.34l-96-96A8,8,0,0,0,128,32V72H72a8,8,0,0,0-8,8v96a8,8,0,0,0,8,8h56v40a8,8,0,0,0,13.66,5.66l96-96A8,8,0,0,0,237.66,122.34ZM144,204.69V176a8,8,0,0,0-8-8H80V88h56a8,8,0,0,0,8-8V51.31L220.69,128ZM48,80v96a8,8,0,0,1-16,0V80a8,8,0,0,1,16,0Z";

export const ArrowFatLineRightIcon = makeArrowTravel(ARROW, "right");
