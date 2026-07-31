"use client";

import { makeArrowTravel } from "./_arrow-travel";

// TRAVEL — the arrow goes where it points: it accelerates off the left edge, and
// while it is genuinely off-frame it is repositioned past the right and eases back in
// to rest. Replaces an in-place elastic stretch, which moved the arrow nowhere.
//
// Exact Phosphor arrow-fat-left; the artwork is untouched and the rest state is the original
// glyph. Measured box x16..224 — the travel vectors live in the shared engine.
const ARROW =
  "M208,72H128V32a8,8,0,0,0-13.66-5.66l-96,96a8,8,0,0,0,0,11.32l96,96A8,8,0,0,0,128,224V184h80a16,16,0,0,0,16-16V88A16,16,0,0,0,208,72Zm0,96H120a8,8,0,0,0-8,8v28.69L35.31,128,112,51.31V80a8,8,0,0,0,8,8h88Z";

export const ArrowFatLeftIcon = makeArrowTravel(ARROW, "left");
