"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// WHIP — the arrow collapses down into the baseline (scaleY → ~0, anchored on the
// line) and whips back out with an exaggerated overshoot, then elastically bounces
// to rest. As the arrow lands, the line itself recoils: it bows down hard on impact
// like a trampoline, then wobbles back to flat. The vertical echo of a skip-back
// triangle springing out of its bar — now with the bar reacting.
const ARROW =
  "M50.34,117.66a8,8,0,0,1,11.32-11.32L120,164.69V32a8,8,0,0,1,16,0V164.69l58.34-58.35a8,8,0,0,1,11.32,11.32l-72,72a8,8,0,0,1-11.32,0Z";
// The baseline as a stroked line (identical to the filled bar at rest) so its middle
// can flex. The control point's Y is what bows the line.
const LINE_FLAT = "M40,216Q128,216,216,216";
// Anchor on the baseline (y≈216) so the arrow folds into it and springs back out.
const ANCHOR = { transformBox: "view-box" as const, originX: 0.5, originY: 216 / 256 };

const whip: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // rest → collapse into the line → whip out tall (big overshoot) → elastic bounce → settle
    scaleY: [1, 0.02, 1.5, 0.82, 1.16, 0.95, 1.03, 1],
    transition: { duration: 1, ease: "easeInOut", times: [0, 0.16, 0.42, 0.58, 0.72, 0.84, 0.93, 1] },
  },
};

// The line stays flat until the arrow lands (~0.16), then bows down hard and wobbles flat.
const lineWobble: Variants = {
  normal: { d: LINE_FLAT, transition: RETURN_TRANSITION },
  animate: {
    d: [
      "M40,216Q128,216,216,216",
      "M40,216Q128,216,216,216",
      "M40,216Q128,256,216,216",
      "M40,216Q128,194,216,216",
      "M40,216Q128,228,216,216",
      "M40,216Q128,216,216,216",
    ],
    transition: { duration: 1, ease: "easeInOut", times: [0, 0.14, 0.3, 0.5, 0.74, 1] },
  },
};

export const ArrowLineDownIcon = forwardRef<IconHandle, IconProps>(function ArrowLineDownIcon(
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
        style={{ overflow: "visible" }}
      >
        <motion.path d={ARROW} variants={reduced ? undefined : whip} style={ANCHOR} />
        <motion.path
          d={LINE_FLAT}
          variants={reduced ? undefined : lineWobble}
          fill="none"
          stroke="currentColor"
          strokeWidth={16}
          strokeLinecap="round"
        />
      </motion.svg>
    </div>
  );
});
