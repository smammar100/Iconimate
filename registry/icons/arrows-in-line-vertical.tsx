"use client";

import { makeArrowsLineWhip } from "./_arrows-line-whip";

// WHIP — the two arrows fly out top and bottom, rush back in and strike the horizontal
// centre line, which jiggles a beat after impact and settles.
const TOP =
  "M122.34,101.66a8,8,0,0,0,11.32,0l32-32a8,8,0,0,0-11.32-11.32L136,76.69V16a8,8,0,0,0-16,0V76.69L101.66,58.34A8,8,0,0,0,90.34,69.66Z";
const BOTTOM =
  "M133.66,154.34a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32L120,179.31V240a8,8,0,0,0,16,0V179.31l18.34,18.35a8,8,0,0,0,11.32-11.32Z";

export const ArrowsInLineVerticalIcon = makeArrowsLineWhip("y", TOP, BOTTOM, { at: 128, from: 40, to: 216 });
