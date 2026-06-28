"use client";

import { makeArrowsLineWhip } from "./_arrows-line-whip";

// WHIP — the two arrows fly out to both edges, rush back in and strike the vertical
// centre line, which jiggles a beat after impact and settles.
const LEFT =
  "M69.66,90.34a8,8,0,0,0-11.32,11.32L76.69,120H16a8,8,0,0,0,0,16H76.69L58.34,154.34a8,8,0,0,0,11.32,11.32l32-32a8,8,0,0,0,0-11.32Z";
const RIGHT =
  "M240,120H179.31l18.35-18.34a8,8,0,0,0-11.32-11.32l-32,32a8,8,0,0,0,0,11.32l32,32a8,8,0,0,0,11.32-11.32L179.31,136H240a8,8,0,0,0,0-16Z";

export const ArrowsInLineHorizontalIcon = makeArrowsLineWhip("x", LEFT, RIGHT, { at: 128, from: 40, to: 216 });
