"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ASCLEPIUS_BODY, ASCLEPIUS_HEAD, ASCLEPIUS_HEAD_CENTER } from "../asclepius-icon";

// v6 — WIND. The serpent wraps up the staff. The body is revealed bottom → top
// through a clip that scales up from the foot, so the coils appear winding their way
// up the rod, with a gentle slither riding along as they form. The head sits at the
// top, so it lands last — and once the body has settled, the leaf-like head wiggles
// to rest (a damping rotation), like the serpent flicking into place.
const FOOT = { transformBox: "view-box" as const, originX: 0.5, originY: 0.92 };
const HEAD = {
  transformBox: "view-box" as const,
  originX: ASCLEPIUS_HEAD_CENTER.x / 256,
  originY: ASCLEPIUS_HEAD_CENTER.y / 256,
};

// Clip rect grows upward from the foot to reveal the coil. We animate the rect's y +
// height *attributes* (its bottom edge stays pinned at y=264) rather than a CSS
// transform — clip geometry honours geometry attributes, but ignores CSS transforms
// on a clip child. Motion maps `y` to translateY (a transform), so we use `attrY` to
// write the real SVG `y` attribute. Result: the body is unveiled bottom → top, like
// the snake winding up the staff.
const reveal: Variants = {
  normal: { attrY: -8, height: 272, transition: RETURN_TRANSITION },
  animate: { attrY: [264, -8], height: [0, 272], transition: { duration: 0.72, ease: [0.4, 0, 0.2, 1] } },
};
// The body slithers as it winds up — a small skew wave that damps out.
const wind: Variants = {
  normal: { skewX: 0, transition: RETURN_TRANSITION },
  animate: {
    skewX: [0, -4, 3, -1.5, 0],
    transition: { duration: 0.72, ease: "easeOut", times: [0, 0.3, 0.55, 0.8, 1] },
  },
};
// The head holds still while the body winds, then wiggles to rest.
const wiggle: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -13, 9, -5, 2, 0],
    transition: { duration: 0.5, ease: "easeOut", delay: 0.6, times: [0, 0.2, 0.42, 0.64, 0.82, 1] },
  },
};

export const Asclepius6 = forwardRef<IconHandle, IconProps>(function Asclepius6(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const clipId = useId();

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
        {reduced ? (
          <>
            <path d={ASCLEPIUS_BODY} />
            <path d={ASCLEPIUS_HEAD} />
          </>
        ) : (
          <>
            <defs>
              <clipPath id={clipId}>
                <motion.rect x={-8} width={272} variants={reveal} />
              </clipPath>
            </defs>
            <g clipPath={`url(#${clipId})`}>
              <motion.path variants={wind} style={FOOT} d={ASCLEPIUS_BODY} />
              <motion.path variants={wiggle} style={HEAD} d={ASCLEPIUS_HEAD} />
            </g>
          </>
        )}
      </motion.svg>
    </div>
  );
});
