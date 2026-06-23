"use client";

import { makeArrowLineWhip } from "./_arrow-line-whip";

// WHIP — arrow folds right into the side line and whips back out.
export const ArrowLineRightIcon = makeArrowLineWhip({
  arrow:
    "M189.66,122.34a8,8,0,0,1,0,11.32l-72,72a8,8,0,0,1-11.32-11.32L164.69,136H32a8,8,0,0,1,0-16H164.69L106.34,61.66a8,8,0,0,1,11.32-11.32Z",
  line: { orient: "v", at: 216, from: 40, to: 216, bow: 40 },
  scale: "scaleX",
  origin: { x: 216 / 256, y: 0.5 },
});
