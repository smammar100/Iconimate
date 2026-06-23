"use client";

import { makeArrowLineWhip } from "./_arrow-line-whip";

// WHIP — the bottom line wobbles, then the arrow lunges out up-left where it points.
export const ArrowLineUpLeftIcon = makeArrowLineWhip({
  arrow:
    "M72,152a8,8,0,0,0,8-8V67.31l98.34,98.35a8,8,0,0,0,11.32-11.32L91.31,56H168a8,8,0,0,0,0-16H72a8,8,0,0,0-8,8v96A8,8,0,0,0,72,152Z",
  line: { orient: "h", at: 208, from: 48, to: 224, bow: 40 },
  dir: { x: -1, y: -1 },
});
