"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// Shared STAGGER engine for the four-arrow in/out icons. Each arrow nudges along its
// own axis and back, one after another, so expand/collapse reads as a cascade. Each
// entry carries its outward direction (sx, sy); `dir` flips the whole set: -1 pulls the
// arrows IN (toward centre), +1 pushes them OUT (toward their corners/edges).
// Principles: STAGING / OVERLAPPING ACTION, SLOW IN & OUT. Reduced-motion: static.
const A = 16; // nudge distance

type Arrow = { d: string; sx: number; sy: number };

export function makeArrowsStagger(arrows: Arrow[], dir: 1 | -1) {
  return forwardRef<IconHandle, IconProps>(function ArrowsStaggerIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 256 256"
          fill="currentColor"
          initial="normal"
          animate={controls}
          style={{ overflow: "visible" }}
        >
          {arrows.map(({ d, sx, sy }, i) => {
            const v: Variants = {
              normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
              animate: {
                x: [0, dir * sx * A, 0],
                y: [0, dir * sy * A, 0],
                transition: { duration: 0.6, ease: ARRIVE, times: [0, 0.45, 1], delay: i * 0.1 },
              },
            };
            return <motion.path key={i} d={d} variants={reduced ? undefined : v} />;
          })}
        </motion.svg>
      </div>
    );
  });
}
