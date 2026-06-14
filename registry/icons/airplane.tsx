"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// THERMAL — the craft rides a column of warm air: it floats up slowly (buoyant,
// decelerating climb), then slips off the top and sinks quicker, the way a real
// thermal lifts gently and lets go fast. The bank trails the lift by half a
// second — a wing answering altitude a beat late — and a whisper of scale reads
// as drifting toward the light. Filled Phosphor airplane glyph (currentColor).
const PLANE =
  "M235.58,128.84,160,91.06V48a32,32,0,0,0-64,0V91.06L20.42,128.84A8,8,0,0,0,16,136v32a8,8,0,0,0,9.57,7.84L96,161.76v18.93L82.34,194.34A8,8,0,0,0,80,200v32a8,8,0,0,0,11,7.43l37-14.81,37,14.81A8,8,0,0,0,176,232V200a8,8,0,0,0-2.34-5.66L160,180.69V161.76l70.43,14.08A8,8,0,0,0,240,168V136A8,8,0,0,0,235.58,128.84ZM224,158.24l-70.43-14.08A8,8,0,0,0,144,152v32a8,8,0,0,0,2.34,5.66L160,203.31v16.87l-29-11.61a8,8,0,0,0-5.94,0L96,220.18V203.31l13.66-13.65A8,8,0,0,0,112,184V152a8,8,0,0,0-9.57-7.84L32,158.24v-17.3l75.58-37.78A8,8,0,0,0,112,96V48a16,16,0,0,1,32,0V96a8,8,0,0,0,4.42,7.16L224,140.94Z";

const thermal: Variants = {
  normal: { y: 0, rotate: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -13, 0],
    rotate: [0, 3, 0, -2, 0],
    scale: [1, 1.03, 1],
    transition: {
      y: {
        duration: 4.2,
        times: [0, 0.62, 1],
        ease: [
          [0.25, 0.6, 0.3, 1], // slow, buoyant climb
          [0.6, 0, 0.75, 0.35], // quicker sink
        ],
        repeat: Infinity,
        repeatType: "loop",
      },
      rotate: { duration: 4.2, ease: "easeInOut", repeat: Infinity, repeatType: "loop", delay: 0.5 },
      scale: { duration: 4.2, times: [0, 0.62, 1], ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
    },
  },
};

export const AirplaneIcon = forwardRef<IconHandle, IconProps>(function AirplaneIcon(
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
        <motion.path
          variants={reduced ? undefined : thermal}
          style={{ transformBox: "view-box", originX: 0.5, originY: 0.54 }}
          d={PLANE}
        />
      </motion.svg>
    </div>
  );
});
