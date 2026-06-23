"use client";

import { makeArrowLineWhip } from "./_arrow-line-whip";

// WHIP — arrow folds up into the top line and whips back out.
export const ArrowLineUpIcon = makeArrowLineWhip({
  arrow:
    "M205.66,138.34a8,8,0,0,1-11.32,11.32L136,91.31V224a8,8,0,0,1-16,0V91.31L61.66,149.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0Z",
  line: { orient: "h", at: 40, from: 40, to: 216, bow: -40 },
  scale: "scaleY",
  origin: { x: 0.5, y: 40 / 256 },
});
