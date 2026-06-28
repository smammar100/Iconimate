"use client";

import { makeArrowsStagger } from "./_arrows-stagger";

// STAGGER — the four cardinal arrows push outward and back, side by side (clockwise:
// top, right, bottom, left) — a cascading expand from the centre.
const TOP = "M90.34,61.66a8,8,0,0,1,0-11.32l32-32a8,8,0,0,1,11.32,0l32,32a8,8,0,0,1-11.32,11.32L136,43.31V96a8,8,0,0,1-16,0V43.31L101.66,61.66A8,8,0,0,1,90.34,61.66Z";
const BOTTOM = "M154.34,194.34L136,212.69V160a8,8,0,0,0-16,0v52.69l-18.34-18.35a8,8,0,0,0-11.32,11.32l32,32a8,8,0,0,0,11.32,0l32-32a8,8,0,0,0-11.32-11.32Z";
const RIGHT = "M237.66,122.34l-32-32a8,8,0,0,0-11.32,11.32L212.69,120H160a8,8,0,0,0,0,16h52.69l-18.35,18.34a8,8,0,0,0,11.32,11.32l32-32A8,8,0,0,0,237.66,122.34Z";
const LEFT = "M43.31,136H96a8,8,0,0,0,0-16H43.31l18.35-18.34A8,8,0,0,0,50.34,90.34l-32,32a8,8,0,0,0,0,11.32l32,32a8,8,0,0,0,11.32-11.32Z";

export const ArrowsOutCardinalIcon = makeArrowsStagger(
  [
    { d: TOP, sx: 0, sy: -1 },
    { d: RIGHT, sx: 1, sy: 0 },
    { d: BOTTOM, sx: 0, sy: 1 },
    { d: LEFT, sx: -1, sy: 0 },
  ],
  1,
);
