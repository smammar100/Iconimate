"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SCROLL — the right arrow rides a wheel inside the static box: it fades in
// small behind, reaches full size at the centre, then shrinks and fades out ahead,
// looping in the pointing direction (right) — a continuous cycle. The arrow is
// clipped to the box interior so it only ever shows inside the frame. Two exact
// Phosphor sub-paths (the rounded square + the inner arrow), animated whole so the
// artwork is pixel-identical.
const SQUARE =
  "M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208Z";
const ARROW =
  "M80,128a8,8,0,0,1,8-8h60.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32-11.32L148.69,136H88A8,8,0,0,1,80,128Z";

const scroll: Variants = {
  normal: { x: 0, scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    x: [-46, 0, 46],
    scale: [0.4, 1, 0.4],
    opacity: [0, 1, 0],
    transition: { duration: 1.15, ease: "easeInOut", times: [0, 0.5, 1], repeat: Infinity, repeatDelay: 0.05 },
  },
};

export const ArrowSquareRightIcon = forwardRef<IconHandle, IconProps>(function ArrowSquareRightIcon(
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
