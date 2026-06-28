"use client";

import { makeArrowsBounce } from "./_arrows-bounce";

// BOUNCE — both arrows fly out of frame and bounce back: the down-pointing (left) arrow
// exits/returns through the top, the up-pointing (right) through the bottom.
const DOWN =
  "M117.66,170.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L72,188.69V48a8,8,0,0,1,16,0V188.69l18.34-18.35A8,8,0,0,1,117.66,170.34Z";
const UP =
  "M213.66,74.34l-32-32a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32L168,67.31V208a8,8,0,0,0,16,0V67.31l18.34,18.35a8,8,0,0,0,11.32-11.32Z";

export const ArrowsDownUpIcon = makeArrowsBounce(DOWN, UP, "y");
