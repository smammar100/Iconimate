"use client";

import { makeArrowTravel } from "./_arrow-travel";

// TRAVEL — the arrow goes where it points: it accelerates off the bottom edge, and
// while it is genuinely off-frame it is repositioned past the top and eases back in
// to rest. Replaces an in-place elastic stretch, which moved the arrow nowhere.
//
// Exact Phosphor arrow-fat-lines-down; the artwork is untouched and the rest state is the original
// glyph. Measured box y32..240 — the travel vectors live in the shared engine.
const ARROW =
  "M231.39,132.94A8,8,0,0,0,224,128H184V104a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8v24H32a8,8,0,0,0-5.66,13.66l96,96a8,8,0,0,0,11.32,0l96-96A8,8,0,0,0,231.39,132.94ZM128,220.69,51.31,144H80a8,8,0,0,0,8-8V112h80v24a8,8,0,0,0,8,8h28.69ZM72,40a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,40Zm0,32a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,72Z";

export const ArrowFatLinesDownIcon = makeArrowTravel(ARROW, "down");
