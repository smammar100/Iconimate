"use client";

import { makeArrowsStagger } from "./_arrows-stagger";

// STAGGER — the four corner arrows push outward toward their corners and back, corner by
// corner (a cascading expand / enter-fullscreen).
const TR = "M216,48V96a8,8,0,0,1-16,0V67.31l-42.34,42.35a8,8,0,0,1-11.32-11.32L188.69,56H160a8,8,0,0,1,0-16h48A8,8,0,0,1,216,48Z";
const BL = "M98.34,146.34,56,188.69V160a8,8,0,0,0-16,0v48a8,8,0,0,0,8,8H96a8,8,0,0,0,0-16H67.31l42.35-42.34a8,8,0,0,0-11.32-11.32Z";
const BR = "M208,152a8,8,0,0,0-8,8v28.69l-42.34-42.35a8,8,0,0,0-11.32,11.32L188.69,200H160a8,8,0,0,0,0,16h48a8,8,0,0,0,8-8V160A8,8,0,0,0,208,152Z";
const TL = "M67.31,56H96a8,8,0,0,0,0-16H48a8,8,0,0,0-8,8V96a8,8,0,0,0,16,0V67.31l42.34,42.35a8,8,0,0,0,11.32-11.32Z";

export const ArrowsOutIcon = makeArrowsStagger(
  [
    { d: TR, sx: 1, sy: -1 },
    { d: BR, sx: 1, sy: 1 },
    { d: BL, sx: -1, sy: 1 },
    { d: TL, sx: -1, sy: -1 },
  ],
  1,
);
