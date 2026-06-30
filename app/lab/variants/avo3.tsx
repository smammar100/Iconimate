"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AVOCADO_BODY, AVOCADO_PIT, AVOCADO_PIT_CENTER } from "../avocado-icon";

// v3 — SLICE. The avocado is revealed top → bottom through a clip wipe — its outline
// draws on as if a knife runs down it — and the pit pops in at the core once the cut
// reaches the middle. The reveal is a real edge moving, not a fade.
const PIT_O = {
  transformBox: "view-box" as const,
  originX: AVOCADO_PIT_CENTER.x / 256,
  originY: AVOCADO_PIT_CENTER.y / 256,
};
// Top → bottom wipe: the rect's top stays at y=-8 while its height grows downward.
const reveal: Variants = {
  normal: { height: 272, transition: RETURN_TRANSITION },
  animate: { height: [0, 272], transition: { duration: 0.66, ease: SWEEP } },
};
const pit: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0, 1.25, 1],
    opacity: [0, 1, 1],
    transition: { duration: 0.42, ease: [0.34, 1.56, 0.64, 1], delay: 0.4, times: [0, 0.6, 1] },
  },
};

export const Avocado3 = forwardRef<IconHandle, IconProps>(function Avocado3({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const clipId = useId();

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={AVOCADO_BODY} />
          <path d={AVOCADO_PIT} />
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
            <motion.rect x={-8} y={-8} width={272} variants={reveal} />
          </clipPath>
        </defs>
        <path d={AVOCADO_BODY} clipPath={`url(#${clipId})`} />
        <motion.path variants={pit} style={PIT_O} d={AVOCADO_PIT} />
      </motion.svg>
    </div>
  );
});
