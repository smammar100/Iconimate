"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// FLIP — the badge flips a full turn on its Y axis, like a spinning coin, and
// glides flat on hover-out.
// Phosphor "angular-logo" glyph (currentColor): the SHIELD ring + the LETTER_A
// mark, flipped together about the badge centre with a little perspective.
const SHIELD =
  "M227.08,64.62l-96-40a7.93,7.93,0,0,0-6.16,0l-96,40a8,8,0,0,0-4.85,8.44l16,120a8,8,0,0,0,4.35,6.1l80,40a8,8,0,0,0,7.16,0l80-40a8,8,0,0,0,4.35-6.1l16-120A8,8,0,0,0,227.08,64.62ZM200.63,186.74,128,223.06,55.37,186.74,40.74,77,128,40.67,215.26,77Z";
const LETTER_A =
  "M121,84.12l-40,72a8,8,0,1,0,14,7.76L106,144H150l11,19.88a8,8,0,1,0,14-7.76l-40-72a8,8,0,0,0-14,0ZM141.07,128H114.93L128,104.47Z";

// Badge centre as a view-box fraction, with perspective for the 3-D flip.
const ORIGIN = {
  transformBox: "view-box" as const,
  originX: 0.5,
  originY: 0.5,
  transformPerspective: 620,
};

const flip: Variants = {
  normal: { rotateY: 0, transition: RETURN_TRANSITION },
  animate: { rotateY: [0, 360], transition: { duration: 0.85, ease: SWEEP } },
};

export const AngularIcon = forwardRef<IconHandle, IconProps>(function AngularIcon(
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
        <motion.g variants={reduced ? undefined : flip} style={ORIGIN}>
          <path d={SHIELD} />
          <path d={LETTER_A} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
