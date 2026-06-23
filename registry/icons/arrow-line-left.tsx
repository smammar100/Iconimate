"use client";

import { makeArrowLineWhip } from "./_arrow-line-whip";

// WHIP — arrow folds left into the side line and whips back out.
export const ArrowLineLeftIcon = makeArrowLineWhip({
  arrow:
    "M232,128a8,8,0,0,1-8,8H91.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L91.31,120H224A8,8,0,0,1,232,128Z",
  line: { orient: "v", at: 40, from: 40, to: 216, bow: -40 },
  scale: "scaleX",
  origin: { x: 40 / 256, y: 0.5 },
});
