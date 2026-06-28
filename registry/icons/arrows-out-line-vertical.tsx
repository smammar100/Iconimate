"use client";

import { makeArrowsLineWhip } from "./_arrows-line-whip";

// WHIP — the two outward arrows whoosh out top and bottom and snap back; the horizontal
// centre line jiggles a beat after and settles.
const TOP =
  "M101.66,53.66,120,35.31V96a8,8,0,0,0,16,0V35.31l18.34,18.35a8,8,0,0,0,11.32-11.32l-32-32a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32Z";
const BOTTOM =
  "M154.34,202.34L136,220.69V160a8,8,0,0,0-16,0v60.69l-18.34-18.35a8,8,0,0,0-11.32,11.32l32,32a8,8,0,0,0,11.32,0l32-32a8,8,0,0,0-11.32-11.32Z";

export const ArrowsOutLineVerticalIcon = makeArrowsLineWhip("y", TOP, BOTTOM, { at: 128, from: 40, to: 216 });
