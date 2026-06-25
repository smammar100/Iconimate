"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// PLUNGE — anchored at the arrowhead tip, the fat arrow coils then rears its body
// up tall and snaps back down to rest, settling with an elastic recoil. The tip
// stays planted at the bottom, so the stretch grows into the empty space *above*
// the glyph and never crosses the bounding box (the tip already sits at y≈221 of
// the 256 artboard, leaving no room below). The exact Phosphor arrow-fat-down,
// animated whole so the artwork stays pixel-identical.
const ARROW =
  "M231.39,132.94A8,8,0,0,0,224,128H184V48a16,16,0,0,0-16-16H88A16,16,0,0,0,72,48v80H32a8,8,0,0,0-5.66,13.66l96,96a8,8,0,0,0,11.32,0l96-96A8,8,0,0,0,231.39,132.94ZM128,220.69,51.31,144H80a8,8,0,0,0,8-8V48h80v88a8,8,0,0,0,8,8h28.69Z";
// Anchor at the top edge (~y=32) so the body elongates DOWNWARD — the tip leads the
// plunge while the tail stays pinned. The glyph's bbox is y=32..240 (it nearly fills
// the 256 artboard), so a top-anchored downward stretch tops out at scaleY ≈ 1.077
// before the tip crosses y=256. The peak below lands the tip right at that edge; a
// deeper anticipation coil keeps the downward snap reading despite the tight ceiling.
const ANCHOR = { transformBox: "view-box" as const, originX: 0.5, originY: 32 / 256 };

const plunge: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // rest → coil up (anticipation) → plunge down (peak 1.07, tip at the bottom edge) → recoil → settle
    scaleY: [1, 0.86, 1.07, 0.97, 1.02, 1],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.18, 0.48, 0.68, 0.84, 1] },
  },
};

export const ArrowFatDownIcon = forwardRef<IconHandle, IconProps>(function ArrowFatDownIcon(
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
        <motion.path d={ARROW} variants={reduced ? undefined : plunge} style={ANCHOR} />
      </motion.svg>
    </div>
  );
});
