"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SCROLL_LOOP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SCROLL — the arrow rides a wheel inside the static box, looping toward where it
// points (down-left). Principles: ARCS (travel) + SECONDARY ACTION (scale & opacity track
// the travel — small/faint behind, full at centre, small/faint ahead) + TIMING
// (symmetric easeInOut cadence via the shared SCROLL_LOOP token). The arrow is clipped
// to the box interior so it only ever shows inside the frame. Two exact Phosphor
// sub-paths (the rounded square + the inner arrow), animated whole so artwork is frozen.
const SQUARE =
  "M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208Z";
const ARROW =
  "M88,160V112a8,8,0,0,1,16,0v28.69l50.34-50.35a8,8,0,0,1,11.32,11.32L115.31,152H144a8,8,0,0,1,0,16H96A8,8,0,0,1,88,160Z";

const scroll: Variants = {
  normal: { x: 0, y: 0, scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    x: [32, 0, -32],
    y: [-32, 0, 32],
    scale: [0.4, 1, 0.4],
    opacity: [0, 1, 0],
    transition: SCROLL_LOOP,
  },
};

export const ArrowSquareDownLeftIcon = forwardRef<IconHandle, IconProps>(function ArrowSquareDownLeftIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  const clipId = useId();
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
        <clipPath id={clipId}>
          <rect x={48} y={48} width={160} height={160} rx={6} />
        </clipPath>
        <path d={SQUARE} fillRule="evenodd" />
        <g clipPath={`url(#${clipId})`}>
          <motion.path
            d={ARROW}
            variants={reduced ? undefined : scroll}
            style={{ transformBox: "view-box", originX: 0.5, originY: 0.5 }}
          />
        </g>
      </motion.svg>
    </div>
  );
});
