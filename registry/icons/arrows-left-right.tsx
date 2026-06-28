"use client";

import { makeArrowsBounce } from "./_arrows-bounce";

// BOUNCE — both arrows fly out of frame and bounce back: the right-pointing (bottom)
// arrow exits/returns through the left, the left-pointing (top) through the right.
const RIGHT =
  "M213.66,181.66l-32,32a8,8,0,0,1-11.32-11.32L188.69,184H48a8,8,0,0,1,0-16H188.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,213.66,181.66Z";
const LEFT =
  "M74.34,117.66a8,8,0,0,0,11.32-11.32L67.31,88H208a8,8,0,0,0,0-16H67.31L85.66,53.66A8,8,0,0,0,74.34,42.34l-32,32a8,8,0,0,0,0,11.32Z";

export const ArrowsLeftRightIcon = makeArrowsBounce(RIGHT, LEFT, "x");
