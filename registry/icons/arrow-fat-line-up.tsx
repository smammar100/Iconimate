"use client";

import { makeArrowTravel } from "./_arrow-travel";

// TRAVEL — the arrow goes where it points: it accelerates off the top edge, and
// while it is genuinely off-frame it is repositioned past the bottom and eases back in
// to rest. Replaces an in-place elastic stretch, which moved the arrow nowhere.
//
// Exact Phosphor arrow-fat-line-up; the artwork is untouched and the rest state is the original
// glyph. Measured box y16..224 — the travel vectors live in the shared engine.
const ARROW =
  "M229.66,114.34l-96-96a8,8,0,0,0-11.32,0l-96,96A8,8,0,0,0,32,128H72v56a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8V128h40a8,8,0,0,0,5.66-13.66ZM176,112a8,8,0,0,0-8,8v56H88V120a8,8,0,0,0-8-8H51.31L128,35.31,204.69,112Zm8,104a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,216Z";

export const ArrowFatLineUpIcon = makeArrowTravel(ARROW, "up");
