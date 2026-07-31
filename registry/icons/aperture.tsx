"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { OVERSHOOT_BACK, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// IRIS — the blades ratchet one notch and swell a touch, the way an aperture turns when
// it stops down. Phosphor "aperture" glyph (currentColor): kept as ONE path — its blades
// and the thin gaps between them come from fill-rule winding, so it must not be split.
//
// The 60° notch is MEASURED, not counted off the six blades. Sampling 1873 points off the
// rendered outline and taking each rotated point's distance to the nearest original gives
// 60° → 0.218, 120° → 0.277, 180° → 0.250 user units, against a sampling noise floor of
// ~0.2. So the drawing really is exact at one blade and the turn lands free. (Worth
// re-measuring if the path is ever touched: Phosphor optically adjusts radial shapes, and
// its GearSix is six-lobed but only two-fold — lobe count is not symmetry order.)
//
// Because 60° is exact, ending the turn there is safe: the hover replay loop snaps back to
// `normal` between passes and that snap is invisible. The SCALE is the part that must come
// home inside the animation — a hold at 1.06 would snap to 1 on every replay, which reads
// as a 6% pop. Hence scale swells and returns while rotate ends on the notch.
const APERTURE =
  "M201.54,54.46A104,104,0,0,0,54.46,201.54,104,104,0,0,0,201.54,54.46ZM190.23,65.78a88.18,88.18,0,0,1,11,13.48L167.55,119,139.63,40.78A87.34,87.34,0,0,1,190.23,65.78ZM155.59,133l-18.16,21.37-27.59-5L100.41,123l18.16-21.37,27.59,5ZM65.77,65.78a87.34,87.34,0,0,1,56.66-25.59l17.51,49L58.3,74.32A88,88,0,0,1,65.77,65.78ZM46.65,161.54a88.41,88.41,0,0,1,2.53-72.62l51.21,9.35ZM65.77,190.22a88.18,88.18,0,0,1-11-13.48L88.45,137l27.92,78.18A87.34,87.34,0,0,1,65.77,190.22Zm124.46,0a87.34,87.34,0,0,1-56.66,25.59l-17.51-49,81.64,14.91A88,88,0,0,1,190.23,190.22Zm-34.62-32.49,53.74-63.27a88.41,88.41,0,0,1-2.53,72.62Z";

// Aperture centre as a view-box fraction — the pivot for the turn.
const ORIGIN = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

const iris: Variants = {
  normal: { rotate: 0, scale: 1, transition: RETURN_TRANSITION },
  // Back-out overshoot (shared OVERSHOOT_BACK) — a spring-like snap onto the notch.
  animate: {
    rotate: 60,
    scale: [1, 1.06, 1],
    transition: {
      rotate: { duration: 0.6, ease: OVERSHOOT_BACK },
      scale: { duration: 0.6, times: [0, 0.55, 1], ease: "easeOut" },
    },
  },
};

export const ApertureIcon = forwardRef<IconHandle, IconProps>(function ApertureIcon(
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
        <motion.path d={APERTURE} variants={reduced ? undefined : iris} style={ORIGIN} />
      </motion.svg>
    </div>
  );
});
