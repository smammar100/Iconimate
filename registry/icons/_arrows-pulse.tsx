"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { ARRIVE } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// Shared PULSE engine for the arrows refresh/sync pair. One spin about the centre
// carrying a squash-and-pop scale as secondary action — a tactile refresh tap. `spin`
// is the signed turn in degrees: +360 (clockwise) or -360 (counter-clockwise); the
// glyph's 2-fold rotational symmetry lands the full turn seamlessly back at rest.
// Principles: SLOW OUT (the spin decelerates), SECONDARY ACTION (the scale pulse rides
// the spin), APPEAL (the pop). Reduced-motion: start() early-returns.

export function makeArrowsPulse(glyph: string, spin: number) {
  return forwardRef<IconHandle, IconProps>(function ArrowsPulseIcon({ size = 28, style, ...props }, ref) {
    const reduced = useReducedMotion() ?? false;
    const rotate = useMotionValue(0);
    const scale = useMotionValue(1);
    const rAnim = useRef<ReturnType<typeof animate> | null>(null);
    const sAnim = useRef<ReturnType<typeof animate> | null>(null);

    const start = () => {
      if (reduced) return;
      rAnim.current?.stop();
      sAnim.current?.stop();
      // Always spin from rest; a completed turn lands back at rest.
      rotate.set(0);
      scale.set(1);
      rAnim.current = animate(rotate, spin, { duration: 0.85, ease: ARRIVE });
      sAnim.current = animate(scale, [1, 0.9, 1.06, 1], { duration: 0.7, ease: "easeOut", times: [0, 0.3, 0.65, 1] });
    };

    const stop = () => {
      rAnim.current?.stop();
      sAnim.current?.stop();
      rotate.set(0);
      scale.set(1);
    };

    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), []);

    return (
      <div
        {...props}
        onMouseEnter={start}
        onMouseLeave={stop}
        onFocus={start}
        onBlur={stop}
        style={{ display: "inline-flex", ...style }}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 256 256"
          fill="currentColor"
          style={{ rotate, scale, overflow: "visible" }}
        >
          <path d={glyph} />
        </motion.svg>
      </div>
    );
  });
}
