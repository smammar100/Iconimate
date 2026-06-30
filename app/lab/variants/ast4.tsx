"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, OVERSHOOT_BACK, RETURN_TRANSITION, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ASTERISK_SPOKES, ASTERISK_W } from "../asterisk-icon";

// v4 — TWINKLE. Each spoke shoots out from the center and, as it reaches full length,
// flashes briefly thicker (a scaleY pop on the spoke) — a glint of light running down
// each arm as it lands. The whole star eases in from a slight tilt underneath. Now it
// sparkles instead of just assembling.
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const SPOKE_ORIGIN = { transformBox: "fill-box" as const, originX: 0.5, originY: 0.5 };
const settle: Variants = {
  normal: { rotate: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: { rotate: [-45, 0], scale: [0.85, 1], transition: { duration: DUR.slow, ease: ARRIVE } },
};
const twinkle = (i: number): Variants => ({
  normal: { scaleX: 1, scaleY: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [0, 1],
    scaleY: [0.7, 1.5, 1], // the glint — the arm flashes thicker as it lands
    opacity: [0, 1, 1],
    transition: { duration: DUR.base, ease: OVERSHOOT_BACK, delay: staged(i, 0.11), times: [0, 0.7, 1] },
  },
});

export const Asterisk4 = forwardRef<IconHandle, IconProps>(function Asterisk4(
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
        <motion.g variants={reduced ? undefined : settle} style={CENTER}>
          {ASTERISK_SPOKES.map((s, i) => (
            <g key={i} transform={`translate(128 128) rotate(${s.angle})`}>
              <motion.rect
                x={-s.len / 2}
                y={-ASTERISK_W / 2}
                width={s.len}
                height={ASTERISK_W}
                rx={ASTERISK_W / 2}
                variants={reduced ? undefined : twinkle(i)}
                style={SPOKE_ORIGIN}
              />
            </g>
          ))}
        </motion.g>
      </motion.svg>
    </div>
  );
});
