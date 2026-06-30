"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ASCLEPIUS_BODY, ASCLEPIUS_HEAD, ASCLEPIUS_HEAD_CENTER } from "../asclepius-icon";

// v9 — WRAP + RISE. The body is drawn ONCE (no static-rod overlay — that double-drew
// the stem and ghosted during the rise). The single body carries both motions at
// once: it rises from the foot with a slither (the rise, from v8) while a bottom → top
// clip wipe draws it up (the wrap, from v7). Only after that finishes does the head
// appear — it stays fully hidden through the whole draw (the hold is baked into the
// keyframes so there's no delay-blink), then pops in and wiggles to rest.
const FOOT = { transformBox: "view-box" as const, originX: 0.5, originY: 0.92 };
const HEAD = {
  transformBox: "view-box" as const,
  originX: ASCLEPIUS_HEAD_CENTER.x / 256,
  originY: ASCLEPIUS_HEAD_CENTER.y / 256,
};
const DRAW = 0.72; // wrap + rise share one duration
const HEAD_START = 0.5; // head begins appearing a touch before the draw fully finishes
const T = HEAD_START + 0.52; // full head timeline (hidden hold + pop + wiggle)
const HOLD = HEAD_START / T; // fraction of the head timeline spent hidden

// Wrap (from v7) — smooth bottom → top clip wipe via the rect's y + height attributes.
const reveal: Variants = {
  normal: { attrY: -8, height: 272, transition: RETURN_TRANSITION },
  animate: { attrY: [264, -8], height: [0, 272], transition: { duration: DRAW, ease: [0.4, 0, 0.2, 1] } },
};
// Rise (from v8) — the body grows from the foot with a sinuous slither.
const rise: Variants = {
  normal: { scaleY: 1, skewX: 0, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0.36, 0.92, 1.05, 0.99, 1],
    skewX: [0, -5, 3.5, -1.5, 0],
    transition: { duration: DRAW, ease: "easeOut", times: [0, 0.32, 0.56, 0.8, 1] },
  },
};
// Head — hidden through the draw (baked hold, no delay-blink), then pops + wiggles.
const wiggle: Variants = {
  normal: { scale: 1, rotate: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 0, 1],
    scale: [0, 0, 1],
    rotate: [0, 0, -13, 9, -5, 2, 0],
    transition: {
      opacity: { duration: T, times: [0, HOLD, HOLD + 0.18 / T] },
      scale: { duration: T, times: [0, HOLD, HOLD + 0.3 / T], ease: ["linear", [0.34, 1.56, 0.64, 1]] },
      rotate: {
        duration: T,
        times: [0, HOLD, HOLD + 0.084, HOLD + 0.176, HOLD + 0.268, HOLD + 0.344, 1],
        ease: ["linear", "easeOut", "easeOut", "easeOut", "easeOut", "easeOut"],
      },
    },
  },
};

export const Asclepius9 = forwardRef<IconHandle, IconProps>(function Asclepius9(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const clipId = useId();

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={ASCLEPIUS_BODY} />
          <path d={ASCLEPIUS_HEAD} />
        </svg>
      </div>
    );
  }

  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="currentColor"
        initial="normal"
        animate={controls}
      >
        <defs>
          <clipPath id={clipId}>
            <motion.rect x={-8} width={272} variants={reveal} />
          </clipPath>
        </defs>

        {/* Single body — rises from the foot while the clip wipe draws it up. */}
        <g clipPath={`url(#${clipId})`}>
          <motion.path variants={rise} style={FOOT} d={ASCLEPIUS_BODY} />
        </g>
        {/* Head appears only after the draw, then wiggles. */}
        <motion.path variants={wiggle} style={HEAD} d={ASCLEPIUS_HEAD} />
      </motion.svg>
    </div>
  );
});
