"use client";

import { makeArrowLineWhip } from "./_arrow-line-whip";

// WHIP — the top line wobbles, then the arrow lunges out down-right where it points.
export const ArrowLineDownRightIcon = makeArrowLineWhip({
  arrow:
    "M192,96a8,8,0,0,0-8,8v76.69L85.66,82.34A8,8,0,0,0,74.34,93.66L172.69,192H96a8,8,0,0,0,0,16h96a8,8,0,0,0,8-8V104A8,8,0,0,0,192,96Z",
  line: { orient: "h", at: 40, from: 40, to: 216, bow: -40 },
  dir: { x: 1, y: 1 },
});
