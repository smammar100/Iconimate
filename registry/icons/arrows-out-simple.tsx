"use client";

import { makeArrowsStagger } from "./_arrows-stagger";

// STAGGER — the two corner arrows (top-right, bottom-left) push outward toward their
// corners and back, one after the other (a simple expand).
const TR = "M216,48V96a8,8,0,0,1-16,0V67.31l-50.34,50.35a8,8,0,0,1-11.32-11.32L188.69,56H160a8,8,0,0,1,0-16h48A8,8,0,0,1,216,48Z";
const BL = "M106.34,138.34,56,188.69V160a8,8,0,0,0-16,0v48a8,8,0,0,0,8,8H96a8,8,0,0,0,0-16H67.31l50.35-50.34a8,8,0,0,0-11.32-11.32Z";

export const ArrowsOutSimpleIcon = makeArrowsStagger(
  [
    { d: TR, sx: 1, sy: -1 },
    { d: BL, sx: -1, sy: 1 },
  ],
  1,
);
