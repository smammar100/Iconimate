"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// NUDGE + STRIKE — delete-and-erase. The key lunges left as if swallowing a
// character; the X wipes out instantly at the start of the lunge, then the two
// slashes re-carve themselves one after the other while the key glides back to
// rest — the strike landing just as everything settles.
//
// The body is the glyph's own outer + inner subpaths rendered even-odd (the
// original carries a degenerate sliver subpath, dropped here). The X arms are
// redrawn as 16-wide round-capped strokes — (112,104)→(160,152) and
// (160,104)→(112,152) — which reproduce the filled cross exactly (0.00% pixel
// diff) while letting each slash draw directionally.
const BODY =
  "M216,40H68.53a16.08,16.08,0,0,0-13.72,7.77L9.14,123.88a8,8,0,0,0,0,8.24l45.67,76.11A16.08,16.08,0,0,0,68.53,216H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM216,200H68.53l-43.2-72,43.2-72H216Z";
const ARM_A = "M112,104L160,152";
const ARM_B = "M160,104L112,152";
// Full original glyph, for the reduced-motion static render.
const BACKSPACE =
  "M216,40H68.53a16.08,16.08,0,0,0-13.72,7.77L9.14,123.88a8,8,0,0,0,0,8.24l45.67,76.11A16.08,16.08,0,0,0,68.53,216H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM216,200H68.53l-43.2-72,43.2-72H216ZM106.34,146.34,124.69,128l-18.35-18.34a8,8,0,0,1,11.32-11.32L136,116.69l18.34-18.35a8,8,0,0,1,11.32,11.32L147.31,128l18.35,18.34a8,8,0,0,1-11.32,11.32L136,139.31l-18.34,18.35a8,8,0,0,1-11.32-11.32Z";

const key: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -14, 2, 0],
    transition: { duration: 0.6, ease: SWEEP, times: [0, 0.4, 0.8, 1] },
  },
};
// Arms vanish at the start of the lunge, then redraw one after the other while
// the key returns.
const ARM_DUR = 0.22;
const armA: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 0, 1],
    opacity: [0, 0, 1],
    transition: { duration: 0.24 + ARM_DUR, ease: SWEEP, times: [0, 0.24 / (0.24 + ARM_DUR), 1] },
  },
};
const armB: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 0, 1],
    opacity: [0, 0, 1],
    transition: {
      duration: 0.24 + ARM_DUR * 2,
      ease: SWEEP,
      times: [0, (0.24 + ARM_DUR) / (0.24 + ARM_DUR * 2), 1],
    },
  },
};

export const BackspaceIcon = forwardRef<IconHandle, IconProps>(function BackspaceIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={BACKSPACE} />
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
        style={{ overflow: "visible" }}
      >
        <motion.g variants={key}>
          <path d={BODY} fillRule="evenodd" />
          <motion.path
            d={ARM_A}
            fill="none"
            stroke="currentColor"
            strokeWidth={16}
            strokeLinecap="round"
            variants={armA}
          />
          <motion.path
            d={ARM_B}
            fill="none"
            stroke="currentColor"
            strokeWidth={16}
            strokeLinecap="round"
            variants={armB}
          />
        </motion.g>
      </motion.svg>
    </div>
  );
});
