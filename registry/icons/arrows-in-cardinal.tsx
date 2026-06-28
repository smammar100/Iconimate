"use client";

import { makeArrowsStagger } from "./_arrows-stagger";

// STAGGER — the four cardinal arrows pull in toward the centre and back, side by side
// (clockwise: top, right, bottom, left).
const TOP = "M90.34,69.66a8,8,0,0,1,11.32-11.32L120,76.69V24a8,8,0,0,1,16,0V76.69l18.34-18.35a8,8,0,0,1,11.32,11.32l-32,32a8,8,0,0,1-11.32,0Z";
const BOTTOM = "M133.66,154.34a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32L120,179.31V232a8,8,0,0,0,16,0V179.31l18.34,18.35a8,8,0,0,0,11.32-11.32Z";
const RIGHT = "M232,120H179.31l18.35-18.34a8,8,0,0,0-11.32-11.32l-32,32a8,8,0,0,0,0,11.32l32,32a8,8,0,0,0,11.32-11.32L179.31,136H232a8,8,0,0,0,0-16Z";
const LEFT = "M101.66,122.34l-32-32a8,8,0,0,0-11.32,11.32L76.69,120H24a8,8,0,0,0,0,16H76.69L58.34,154.34a8,8,0,0,0,11.32,11.32l32-32A8,8,0,0,0,101.66,122.34Z";

export const ArrowsInCardinalIcon = makeArrowsStagger(
  [
    { d: TOP, sx: 0, sy: -1 },
    { d: RIGHT, sx: 1, sy: 0 },
    { d: BOTTOM, sx: 0, sy: 1 },
    { d: LEFT, sx: -1, sy: 0 },
  ],
  -1,
);
