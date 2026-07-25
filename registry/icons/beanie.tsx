"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DROP-IN TILT — the beanie pops on and lands jaunty. It arrives small and
// slightly raised, grows into place, lands with a knit squash at the brim,
// then does a full decaying tilt — cocking 9° to one side and rocking back.
//
// The glyph is one compound path (pom, dome, ribbed brim) with the pom bulge
// spliced into the outer silhouette, so it animates as a single knitted body;
// the pom/brim read comes from pivoting everything at the brim's bottom edge
// (y=224), which keeps the hat seated like it's on a head.
//
// Everything is capped to the 256 box (glyph x24..232, y8..224 — only 8px of
// headroom, hence pop-on instead of a drop from above): arrival scale 0.75
// keeps it well inside, the impact is squash-ONLY (scaleY ≤ 1 keeps the pom
// low; scaleX 1.11 → brim edge 243 < 256), the rebound tops out at 1.02
// (pom top ≈ y4), and at ±9° about the brim the far bottom corner swings
// ~16px below rest — inside the 32px bottom margin. Two layers: outer carries
// the arrival + squash, inner carries the tilt, delayed past impact so the
// rock reads as a consequence of the landing.
const BEANIE =
  "M224,162.16V144a96.18,96.18,0,0,0-72.34-93,28,28,0,1,0-47.32,0A96.18,96.18,0,0,0,32,144v18.16A16,16,0,0,0,24,176v32a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V176A16,16,0,0,0,224,162.16ZM116,36a12,12,0,1,1,12,12A12,12,0,0,1,116,36Zm12,28a80.09,80.09,0,0,1,80,80v16H48V144A80.09,80.09,0,0,1,128,64Zm-8,112v32H80V176Zm16,0h40v32H136Zm-96,0H64v32H40Zm176,32H192V176h24v32Z";

const BRIM = { transformBox: "view-box" as const, originX: 0.5, originY: 224 / 256 };

// Outer: pops on small and raised, grows into place, lands with a squash-only
// knit impact and a capped rebound.
const arrive: Variants = {
  normal: { y: 0, scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [-10, 0, 0, 0, 0, 0],
    scaleX: [0.75, 1, 1.11, 0.98, 1.02, 1],
    scaleY: [0.75, 1, 0.84, 1.02, 0.98, 1],
    transition: { duration: 1.6, ease: "easeOut", times: [0, 0.22, 0.32, 0.46, 0.58, 1] },
  },
};
// Inner: still through the landing, then the full decaying tilt.
const rock: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, -9, 6, -2.5, 0],
    transition: { duration: 1.6, ease: "easeInOut", times: [0, 0.36, 0.56, 0.74, 0.88, 1] },
  },
};

export const BeanieIcon = forwardRef<IconHandle, IconProps>(
  function BeanieIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    if (reduced) {
      return (
        <div {...props} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
            <path d={BEANIE} />
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
          <motion.g variants={arrive} style={BRIM}>
            <motion.g variants={rock} style={BRIM}>
              <path d={BEANIE} />
            </motion.g>
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
