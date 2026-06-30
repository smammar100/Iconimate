"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// WRAP + RISE — the Rod of Asclepius assembles itself. The body is drawn once: it
// rises from the foot with a sinuous slither while a bottom → top clip wipe draws it
// up, so the serpent appears to wind up the rod. Only after the draw does the head
// appear — held fully hidden through the wrap (the hold is baked into the keyframes,
// no delay-blink), then it pops in and wiggles to rest. The glyph is the exact
// Phosphor `asclepius`, split into the staff/coil body and the head curl so the parts
// can be choreographed; at rest they recombine pixel-identical.
const BODY =
  "M216,79v1a40,40,0,0,1-40,40H136v80h8a16,16,0,0,0,10.67-27.93,8,8,0,0,1,10.66-11.92A32,32,0,0,1,144,216h-8v16a8,8,0,0,1-16,0V216H96a8,8,0,0,1,0-16h24V120H96a16,16,0,0,0,0,32,8,8,0,0,1,0,16,32,32,0,0,1,0-64h24V24a8,8,0,0,1,16,0v80h40a24,24,0,0,0,24-24V79a23,23,0,0,0-23-23H160a8,8,0,0,1,0-16h17a39,39,0,0,1,39,39Z";
const HEAD =
  "M56,96H32a8,8,0,0,1-8-8V80A40,40,0,0,1,64,40H96a8,8,0,0,1,0,16A40,40,0,0,1,56,96ZM80,56H64A24,24,0,0,0,40,80H56A24,24,0,0,0,80,56Z";

const FOOT = { transformBox: "view-box" as const, originX: 0.5, originY: 0.92 };
const HEAD_ANCHOR = { transformBox: "view-box" as const, originX: 58 / 256, originY: 66 / 256 };
const DRAW = 0.72; // wrap + rise share one duration
const HEAD_START = 0.5; // head begins appearing a touch before the draw fully finishes
const T = HEAD_START + 0.52; // full head timeline (hidden hold + pop + wiggle)
const HOLD = HEAD_START / T; // fraction of the head timeline spent hidden

// Wrap — smooth bottom → top clip wipe via the rect's y + height attributes (Motion's
// `attrY`, since plain `y` becomes a transform a clip ignores).
const reveal: Variants = {
  normal: { attrY: -8, height: 272, transition: RETURN_TRANSITION },
  animate: { attrY: [264, -8], height: [0, 272], transition: { duration: DRAW, ease: [0.4, 0, 0.2, 1] } },
};
// Rise — the body grows from the foot with a sinuous slither.
const rise: Variants = {
  normal: { scaleY: 1, skewX: 0, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0.36, 0.92, 1.05, 0.99, 1],
    skewX: [0, -5, 3.5, -1.5, 0],
    transition: { duration: DRAW, ease: "easeOut", times: [0, 0.32, 0.56, 0.8, 1] },
  },
};
// Head — hidden through the draw (baked hold, no delay-blink), then pops + wiggles.
const wiggle: Variants = {
  normal: { scale: 1, rotate: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 0, 1],
    scale: [0, 0, 1],
    rotate: [0, 0, -13, 9, -5, 2, 0],
    transition: {
      opacity: { duration: T, times: [0, HOLD, HOLD + 0.18 / T] },
      scale: { duration: T, times: [0, HOLD, HOLD + 0.3 / T], ease: ["linear", [0.34, 1.56, 0.64, 1]] },
      rotate: {
        duration: T,
        times: [0, HOLD, HOLD + 0.084, HOLD + 0.176, HOLD + 0.268, HOLD + 0.344, 1],
        ease: ["linear", "easeOut", "easeOut", "easeOut", "easeOut", "easeOut"],
      },
    },
  },
};

export const AsclepiusIcon = forwardRef<IconHandle, IconProps>(function AsclepiusIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const clipId = useId();

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={BODY} />
          <path d={HEAD} />
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
      >
        <defs>
          <clipPath id={clipId}>
            <motion.rect x={-8} width={272} variants={reveal} />
          </clipPath>
        </defs>

        {/* Single body — rises from the foot while the clip wipe draws it up. */}
        <g clipPath={`url(#${clipId})`}>
          <motion.path variants={rise} style={FOOT} d={BODY} />
        </g>
        {/* Head appears only after the draw, then wiggles. */}
        <motion.path variants={wiggle} style={HEAD_ANCHOR} d={HEAD} />
      </motion.svg>
    </div>
  );
});
