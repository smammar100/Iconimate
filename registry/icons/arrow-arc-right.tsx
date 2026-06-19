"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DRAW — same motion as arrow-arc-left, mirrored: the arrow is penned in from the
// LEFT (the arc traces first, then the arrowhead at the right). A fat round stroke
// sweeps a spine and is CLIPPED to the real Phosphor "arrow arc right" glyph, so
// the revealed shape is exactly the filled icon; pathLength drives the reveal.

const ARROW =
  "M240,88v64a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h44.6l-22.36-22.21A88,88,0,0,0,40,184a8,8,0,0,1-16,0,104,104,0,0,1,177.54-73.54L224,132.77V88a8,8,0,0,1,16,0Z";
// Reveal spine: left end → along the arc → through the arrowhead's two arms (mirror
// of arrow-arc-left). Draws from the LEFT.
const SPINE = "M32,184A96,96,0,0,1,196,116L232,92L232,152L172,152";

const draw: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { pathLength: [0, 1], opacity: 1, transition: { duration: 0.9, ease: "easeInOut" } },
};

export const ArrowArcRightIcon = forwardRef<IconHandle, IconProps>(
  function ArrowArcRightIcon({ size = 28, style, ...props }, ref) {
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
