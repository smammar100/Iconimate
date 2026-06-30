"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { DUR, OVERSHOOT_BACK, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ASCLEPIUS_BODY, ASCLEPIUS_HEAD, ASCLEPIUS_HEAD_CENTER } from "../asclepius-icon";

// v5 — AWAKEN. The symbol comes alive. The staff rises from its foot and, as it
// reaches full height, a sinuous slither runs up it (a damping skewX wave, anchored
// at the base) — the serpent stirring on the rod. Then, with the body settled, the
// head strikes in: it winds up below true (anticipation), overshoots, and rocks back
// to rest. Rise + life + strike, choreographed as one gesture. The keeper.
const FOOT = { transformBox: "view-box" as const, originX: 0.5, originY: 0.92 };
const HEAD = {
  transformBox: "view-box" as const,
  originX: ASCLEPIUS_HEAD_CENTER.x / 256,
  originY: ASCLEPIUS_HEAD_CENTER.y / 256,
};

const body: Variants = {
  normal: { scaleY: 1, skewX: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0.36, 0.92, 1.05, 0.99, 1],
    skewX: [0, -5, 3.5, -1.5, 0], // the slither — a wave that damps to rest
    opacity: [0, 1, 1, 1, 1],
    transition: { duration: 0.62, ease: "easeOut", times: [0, 0.32, 0.56, 0.8, 1] },
  },
};
const head: Variants = {
  normal: { scale: 1, rotate: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0, 1.2, 0.95, 1],
    rotate: [-26, 8, -2, 0],
    opacity: [0, 1, 1, 1],
    transition: { duration: DUR.slow, ease: OVERSHOOT_BACK, times: [0, 0.55, 0.8, 1], delay: 0.3 },
  },
};

export const Asclepius5 = forwardRef<IconHandle, IconProps>(function Asclepius5(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
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
        <motion.path variants={reduced ? undefined : body} style={FOOT} d={ASCLEPIUS_BODY} />
        <motion.path variants={reduced ? undefined : head} style={HEAD} d={ASCLEPIUS_HEAD} />
      </motion.svg>
    </div>
  );
});
