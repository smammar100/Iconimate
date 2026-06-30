"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN_TRANSITION, springPop } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ASCLEPIUS_BODY, ASCLEPIUS_HEAD, ASCLEPIUS_HEAD_CENTER } from "../asclepius-icon";

// v4 — STRIKE. Now the parts are separated. The staff rises from its foot, and only
// once it's standing does the serpent's head snap in — a spring pop with a quick
// rotation, like the head striking onto the rod. Staging makes the head the accent
// instead of one more pixel in the blob.
const FOOT = { transformBox: "view-box" as const, originX: 0.5, originY: 0.92 };
const HEAD = {
  transformBox: "view-box" as const,
  originX: ASCLEPIUS_HEAD_CENTER.x / 256,
  originY: ASCLEPIUS_HEAD_CENTER.y / 256,
};

const body: Variants = {
  normal: { scaleY: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0.36, 1.04, 1],
    opacity: [0, 1, 1],
    transition: { duration: DUR.base, ease: ARRIVE, times: [0, 0.75, 1] },
  },
};
const head: Variants = {
  normal: { scale: 1, rotate: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0, 1],
    rotate: [-22, 0],
    opacity: [0, 1],
    transition: { ...springPop, delay: 0.24 },
  },
};

export const Asclepius4 = forwardRef<IconHandle, IconProps>(function Asclepius4(
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
