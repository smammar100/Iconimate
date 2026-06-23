"use client";

import { makeArrowLineWhip } from "./_arrow-line-whip";

// WHIP — the bottom line wobbles, then the arrow lunges out up-right where it points.
export const ArrowLineUpRightIcon = makeArrowLineWhip({
  arrow:
    "M80,176a8,8,0,0,0,5.66-2.34L184,75.31V152a8,8,0,0,0,16,0V56a8,8,0,0,0-8-8H96a8,8,0,0,0,0,16h76.69L74.34,162.34A8,8,0,0,0,80,176Z",
  line: { orient: "h", at: 216, from: 40, to: 216, bow: 40 },
  dir: { x: 1, y: -1 },
});
