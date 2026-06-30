"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";
import { ATOM_NUCLEUS, ATOM_ORBITS } from "../atom-icon";

// v6 — ORBIT (3D tumble loop). Recreated from the reference video: the rings turn
// continuously about the center (rotateZ, a steady in-plane spin) while a slower 3D
// tilt rolls through them (rotateX/Y on a perspective), so they swell open and
// foreshorten into wide ovals and back — never collapsing to a line. The three
// rotations run at different periods, so the tumble never quite repeats. The nucleus
// is left out of the 3D group, so the core stays fixed and crisp while the orbits
// revolve around it — exactly as in the video. A continuous loop, not a one-shot.
const RINGS = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5, transformPerspective: 520 };
const NUCLEUS = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

const tumble: Variants = {
  normal: { rotateX: 0, rotateY: 0, rotateZ: 0, transition: { duration: 0.6, ease: "easeOut" } },
  animate: {
    rotateZ: [0, 360],
    rotateX: [0, 64, 0, -64, 0],
    rotateY: [0, -28, 0, 28, 0],
    transition: {
      rotateZ: { duration: 6, ease: "linear", repeat: Infinity },
      rotateX: { duration: 4.6, ease: "easeInOut", repeat: Infinity },
      rotateY: { duration: 5.4, ease: "easeInOut", repeat: Infinity },
    },
  },
};
// The nucleus breathes very gently — a subtle energy at the core while the rings spin.
const core: Variants = {
  normal: { scale: 1, transition: { duration: 0.4 } },
  animate: { scale: [1, 1.18, 1], transition: { duration: 2.2, ease: "easeInOut", repeat: Infinity } },
};

export const Atom6 = forwardRef<IconHandle, IconProps>(function Atom6({ size = 28, style, ...props }, ref) {
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
        <motion.path variants={reduced ? undefined : tumble} style={RINGS} d={ATOM_ORBITS} />
        <motion.path variants={reduced ? undefined : core} style={NUCLEUS} d={ATOM_NUCLEUS} />
      </motion.svg>
    </div>
  );
});
