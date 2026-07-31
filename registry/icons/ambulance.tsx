"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Transition, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// DRIVE — the van bobs on its suspension while three speed streaks tear off the back
// and the red cross blinks like a flasher, so the whole thing reads as racing past.
// Filled Phosphor ambulance glyph, split into body + cross so the cross can blink.
//
// DELIBERATE REDRAW — this icon does NOT rest on the untouched Phosphor glyph, and that
// is a design decision rather than a tolerance. The source van spans x16..256: it touches
// the right edge and leaves no lane for the speed streaks, which are the thing that makes
// the icon read as racing rather than idling. So the vehicle is scaled to 0.86 about the
// artboard centre and the streaks occupy the margin that frees up.
//
// The consequence is real and worth knowing before "fixing" it: a consumer who swaps the
// static Phosphor ambulance for this one gets a glyph ~14% smaller. The rest state is
// still exact — it is exactly the *intended* picture, deterministic and identical every
// frame — it is simply a different picture from the original. Restoring full size means
// dropping the streaks; the two cannot both fit. See AGENTS.md, rest-state fidelity rule.
const AMBULANCE_BODY =
  "M256,120v64a16,16,0,0,1-16,16H223a32,32,0,0,1-62,0H111a32,32,0,0,1-62,0H32a16,16,0,0,1-16-16V72A16,16,0,0,1,32,56H184a8,8,0,0,1,8,8v8h34.58a15.93,15.93,0,0,1,14.86,10.06l14,35A7.92,7.92,0,0,1,256,120ZM192,88v24h44.18l-9.6-24ZM32,184H49a32,32,0,0,1,62,0h50a32.11,32.11,0,0,1,15-19.69V72H32Zm64,8a16,16,0,1,0-16,16A16,16,0,0,0,96,192Zm112,0a16,16,0,1,0-16,16A16,16,0,0,0,208,192Zm32-8V128H192v32a32.06,32.06,0,0,1,31,24Z";
const AMBULANCE_CROSS =
  "M80,120a8,8,0,0,1,8-8h16V96a8,8,0,0,1,16,0v16h16a8,8,0,0,1,0,16H120v16a8,8,0,0,1-16,0V128H88A8,8,0,0,1,80,120Z";

// Bob + nose-to-tail rock, applied to the whole vehicle group.
// Every track here is ambient (the drive bob, the flasher, the speed streaks), so each
// `repeat` is gated on `ambient` from useHover(), threaded in as motion's `custom`. Under
// reduced motion the van bobs once, the cross blinks once and one streak passes, then rest.
const drive: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: (ambient: boolean) => ({
    y: [0, -2.5, 0, -1.5, 0],
    rotate: [0, -1.2, 0, 1, 0],
    transition: { duration: 1, ease: "easeInOut", repeat: ambient ? Infinity : 0 },
  }),
};

// The cross flashes on and off like an emergency light.
const blink: Variants = {
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: (ambient: boolean) => ({
    opacity: [1, 1, 0.12, 0.12, 1],
    transition: { duration: 0.8, ease: "easeInOut", repeat: ambient ? Infinity : 0 },
  }),
};

// Each speed streak shoots leftward off the back of the van and fades, staggered so
// they read as a continuous stream of motion lines.
const streak = (delay: number): Variants => ({
  normal: { opacity: 0, x: 0, transition: RETURN_TRANSITION },
  animate: (ambient: boolean) => ({
    x: [10, -16],
    opacity: [0, 0.9, 0],
    transition: {
      duration: 0.55,
      ease: "easeIn",
      repeat: ambient ? Infinity : 0,
      repeatDelay: 0.15,
      delay,
    } satisfies Transition,
  }),
});

// Three streaks sit in the lane freed by the 0.86 vehicle scale (see the redraw note above).
const STREAKS = [
  { y: 98, x1: 6, x2: 30, delay: 0 },
  { y: 128, x1: 2, x2: 32, delay: 0.12 },
  { y: 158, x1: 6, x2: 30, delay: 0.24 },
];

export const AmbulanceIcon = forwardRef<IconHandle, IconProps>(function AmbulanceIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, ambient, start, stop, bind } = useHover();
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
        {!reduced &&
          STREAKS.map((s, i) => (
            <motion.line
              key={i}
              x1={s.x1}
              y1={s.y}
              x2={s.x2}
              y2={s.y}
              stroke="currentColor"
              strokeWidth={10}
              strokeLinecap="round"
              variants={streak(s.delay)}
              custom={ambient}
              style={{ transformBox: "view-box" }}
            />
          ))}

        {/* Vehicle scaled to 0.86 about the artboard centre — the declared redraw, not a tweak. */}
        <g transform="translate(128 128) scale(0.86) translate(-128 -128)">
          <motion.g
            variants={reduced ? undefined : drive}
            custom={ambient}
            style={{ transformBox: "view-box", originX: 0.5, originY: 0.5 }}
          >
            <path d={AMBULANCE_BODY} />
            <motion.path variants={reduced ? undefined : blink} custom={ambient} d={AMBULANCE_CROSS} />
          </motion.g>
        </g>
      </motion.svg>
    </div>
  );
});
