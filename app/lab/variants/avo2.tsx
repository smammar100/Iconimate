"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN_TRANSITION, springSwing } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AVOCADO_BODY, AVOCADO_PIT, AVOCADO_PIT_CENTER } from "../avocado-icon";

// v2 — PIT DROP. The parts separate: the body fades and scales in first, then the pit
// drops down from above and settles into the middle with a springy bounce. Staging
// turns the stamp into a little assembly — the fruit, then its stone.
const BODY_O = { transformBox: "view-box" as const, originX: 0.5, originY: 0.92 };
const PIT_O = {
  transformBox: "view-box" as const,
  originX: AVOCADO_PIT_CENTER.x / 256,
  originY: AVOCADO_PIT_CENTER.y / 256,
};
const body: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { scale: [0.7, 1], opacity: [0, 1], transition: { duration: DUR.base, ease: ARRIVE } },
};
const pit: Variants = {
  normal: { y: 0, scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { y: [-46, 0], scale: [0.6, 1], opacity: [0, 1], transition: { ...springSwing, delay: 0.22 } },
};

export const Avocado2 = forwardRef<IconHandle, IconProps>(function Avocado2({ size = 28, style, ...props }, ref) {
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
      >
        <motion.path variants={reduced ? undefined : body} style={BODY_O} d={AVOCADO_BODY} />
        <motion.path variants={reduced ? undefined : pit} style={PIT_O} d={AVOCADO_PIT} />
      </motion.svg>
    </div>
  );
});
