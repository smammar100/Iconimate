"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SPIN + PULSE — the rings spin up and overshoot past true on an elastic settle, while
// the nucleus pops in past its size and pulses down to rest at the core. The three
// orbital rings are drawn as one union outline (it bulges where the ellipses cross, so
// a clean per-ellipse split isn't faithful) — they're kept whole and the nucleus, a
// solid dot, is peeled off so the core can pulse on its own.
const ORBITS =
  "M196.12,128c24.65-34.61,37.22-70.38,19.74-87.86S162.61,35.23,128,59.88C93.39,35.23,57.62,22.66,40.14,40.14S35.23,93.39,59.88,128c-24.65,34.61-37.22,70.38-19.74,87.86h0c5.63,5.63,13.15,8.14,21.91,8.14,18.48,0,42.48-11.17,66-27.88C151.47,212.83,175.47,224,194,224c8.76,0,16.29-2.52,21.91-8.14h0C233.34,198.38,220.77,162.61,196.12,128Zm8.43-76.55c7.64,7.64,2.48,32.4-18.52,63.28a300.33,300.33,0,0,0-21.19-23.57A300.33,300.33,0,0,0,141.27,70C172.15,49,196.91,43.8,204.55,51.45ZM176.29,128a289.14,289.14,0,0,1-22.76,25.53A289.14,289.14,0,0,1,128,176.29a289.14,289.14,0,0,1-25.53-22.76A289.14,289.14,0,0,1,79.71,128,298.62,298.62,0,0,1,128,79.71a289.14,289.14,0,0,1,25.53,22.76A289.14,289.14,0,0,1,176.29,128ZM51.45,51.45c2.2-2.21,5.83-3.35,10.62-3.35C73.89,48.1,92.76,55,114.72,70A304,304,0,0,0,91.16,91.16,300.33,300.33,0,0,0,70,114.73C49,83.85,43.81,59.09,51.45,51.45Zm0,153.1C43.81,196.91,49,172.15,70,141.27a300.33,300.33,0,0,0,21.19,23.57A304.18,304.18,0,0,0,114.73,186C83.85,207,59.09,212.2,51.45,204.55Zm153.1,0c-7.64,7.65-32.4,2.48-63.28-18.52a304.18,304.18,0,0,0,23.57-21.19A300.33,300.33,0,0,0,186,141.27C207,172.15,212.19,196.91,204.55,204.55Z";
const NUCLEUS = "M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Z";

const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const ELASTIC: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

const orbits: Variants = {
  normal: { rotate: 0, scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { rotate: [-340, 0], scale: [0.5, 1], opacity: [0, 1], transition: { duration: 0.8, ease: ELASTIC } },
};
const nucleus: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0, 1.35, 1],
    opacity: [0, 1, 1],
    transition: { duration: 0.5, ease: ELASTIC, delay: 0.34, times: [0, 0.6, 1] },
  },
};

export const AtomIcon = forwardRef<IconHandle, IconProps>(function AtomIcon({ size = 28, style, ...props }, ref) {
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
        <motion.path variants={reduced ? undefined : orbits} style={CENTER} d={ORBITS} />
        <motion.path variants={reduced ? undefined : nucleus} style={CENTER} d={NUCLEUS} />
      </motion.svg>
    </div>
  );
});
