"use client";

import { makeArrowLineWhip } from "./_arrow-line-whip";

// WHIP — the top line wobbles, then the arrow lunges out down-left where it points.
export const ArrowLineDownLeftIcon = makeArrowLineWhip({
  arrow:
    "M178.34,90.34,80,188.69V112a8,8,0,0,0-16,0v96a8,8,0,0,0,8,8h96a8,8,0,0,0,0-16H91.31l98.35-98.34a8,8,0,0,0-11.32-11.32Z",
  line: { orient: "h", at: 48, from: 48, to: 224, bow: -40 },
  dir: { x: -1, y: 1 },
});
