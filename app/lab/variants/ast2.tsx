"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { DUR, OVERSHOOT_BACK, RETURN_TRANSITION, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ASTERISK_SPOKES, ASTERISK_W } from "../asterisk-icon";

// v2 — STAGGER GROW. The spokes are separated: each line shoots out from the center
// along its own length (scaleX about the middle), one after another, with a touch of
// overshoot. Now the star assembles itself instead of arriving whole.
const SPOKE_ORIGIN = { transformBox: "fill-box" as const, originX: 0.5, originY: 0.5 };
const grow = (i: number): Variants => ({
  normal: { scaleX: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [0, 1],
    opacity: [0, 1],
    transition: { duration: DUR.base, ease: OVERSHOOT_BACK, delay: staged(i, 0.09) },
  },
});

export const Asterisk2 = forwardRef<IconHandle, IconProps>(function Asterisk2(
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
        {ASTERISK_SPOKES.map((s, i) => (
          <g key={i} transform={`translate(128 128) rotate(${s.angle})`}>
            <motion.rect
              x={-s.len / 2}
              y={-ASTERISK_W / 2}
              width={s.len}
              height={ASTERISK_W}
              rx={ASTERISK_W / 2}
              variants={reduced ? undefined : grow(i)}
              style={SPOKE_ORIGIN}
            />
          </g>
        ))}
      </motion.svg>
    </div>
  );
});
