"use client";

import { makeArrowsLineWhip } from "./_arrows-line-whip";

// WHIP — the two outward arrows whoosh out to the edges and snap back; the vertical
// centre line jiggles a beat after and settles. Same interaction as the in-line pair.
const LEFT =
  "M96,120H35.31l18.35-18.34A8,8,0,0,0,42.34,90.34l-32,32a8,8,0,0,0,0,11.32l32,32a8,8,0,0,0,11.32-11.32L35.31,136H96a8,8,0,0,0,0-16Z";
const RIGHT =
  "M245.66,122.34l-32-32a8,8,0,0,0-11.32,11.32L220.69,120H160a8,8,0,0,0,0,16h60.69l-18.35,18.34a8,8,0,0,0,11.32,11.32l32-32A8,8,0,0,0,245.66,122.34Z";

export const ArrowsOutLineHorizontalIcon = makeArrowsLineWhip("x", LEFT, RIGHT, { at: 128, from: 40, to: 216 });
