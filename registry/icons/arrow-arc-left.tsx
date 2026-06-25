"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DRAW — the arrow is penned in from the right: the arc traces first, then the
// arrowhead at the left. A fat round stroke sweeps a spine and is CLIPPED to the
// real Phosphor "arrow arc left" glyph, so the revealed shape (arrowhead and all)
// is exactly the filled icon; pathLength drives the reveal. fill="currentColor".

const ARROW =
  "M232,184a8,8,0,0,1-16,0A88,88,0,0,0,65.78,121.78L43.4,144H88a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V88a8,8,0,0,1,16,0v44.77l22.48-22.33A104,104,0,0,1,232,184Z";
// Reveal spine: right end → along the arc → through the arrowhead's two arms.
const SPINE = "M224,184A96,96,0,0,0,60,116L24,92L24,152L84,152";

// Straight-ahead (the stroke is traced frame-by-frame as it draws) + arcs (the spine
// IS the arc, so the reveal follows the curve) + slow-in/out (easeInOut on the trace).
const draw: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { pathLength: [0, 1], opacity: 1, transition: { duration: 0.9, ease: "easeInOut" } },
};

export const ArrowArcLeftIcon = forwardRef<IconHandle, IconProps>(
  function ArrowArcLeftIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    const clipId = `arrowarc-clip-${useId()}`;

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
          <defs>
            <clipPath id={clipId}>
              <path d={ARROW} />
            </clipPath>
          </defs>
          <motion.path
            d={SPINE}
            fill="none"
            stroke="currentColor"
            strokeWidth={48}
            strokeLinecap="round"
            strokeLinejoin="round"
            clipPath={`url(#${clipId})`}
            variants={reduced ? undefined : draw}
          />
        </motion.svg>
      </div>
    );
  },
);
