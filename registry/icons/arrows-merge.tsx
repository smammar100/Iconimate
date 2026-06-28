"use client";

import { makeArrowsPlunge } from "./_arrows-plunge";

// PLUNGE — anchored at the funnel mouth, the glyph squashes then stretches down the stem
// and recoils, like something pouring through and merging into the arrow.
const GLYPH =
  "M192,40v64a8,8,0,0,1-2.34,5.66L136,163.31v49.38l18.34-18.35a8,8,0,0,1,11.32,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L120,212.69V163.31L66.34,109.66A8,8,0,0,1,64,104V40a8,8,0,0,1,16,0v60.69l48,48,48-48V40a8,8,0,0,1,16,0Z";

export const ArrowsMergeIcon = makeArrowsPlunge(GLYPH, 40 / 256);
