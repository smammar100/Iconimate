"use client";

import { makeArrowsStagger } from "./_arrows-stagger";

// STAGGER — the four corner arrows pull in toward the centre and back, corner by corner.
const TR = "M144,104V64a8,8,0,0,1,16,0V84.69l42.34-42.35a8,8,0,0,1,11.32,11.32L171.31,96H192a8,8,0,0,1,0,16H152A8,8,0,0,1,144,104Z";
const BL = "M104,144H64a8,8,0,0,0,0,16H84.69L42.34,202.34a8,8,0,0,0,11.32,11.32L96,171.31V192a8,8,0,0,0,16,0V152A8,8,0,0,0,104,144Z";
const BR = "M171.31,160H192a8,8,0,0,0,0-16H152a8,8,0,0,0-8,8v40a8,8,0,0,0,16,0V171.31l42.34,42.35a8,8,0,0,0,11.32-11.32Z";
const TL = "M104,56a8,8,0,0,0-8,8V84.69L53.66,42.34A8,8,0,0,0,42.34,53.66L84.69,96H64a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V64A8,8,0,0,0,104,56Z";

export const ArrowsInIcon = makeArrowsStagger(
  [
    { d: TR, sx: 1, sy: -1 },
    { d: BR, sx: 1, sy: 1 },
    { d: BL, sx: -1, sy: 1 },
    { d: TL, sx: -1, sy: -1 },
  ],
  -1,
);
