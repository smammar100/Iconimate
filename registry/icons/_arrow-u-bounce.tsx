"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion, type Transition } from "motion/react";
import type { IconHandle, IconProps } from "@/lib/icon";

// Shared BOUNCE engine for the arrow-u (U-turn) family. The U shaft is a static
// stroked "rail"; a separate arrowhead rides along it (getPointAtLength + atan2), so
// it banks around the 180° bend, then springs into home overshooting the tip before
// it settles. One pass on hover, then rest — no loop, no reverse.
//
// Each icon passes its own `rail` centerline (tail → bend → arrowhead base); the head
// orients to the rail's end tangent, so a single engine serves all eight orientations.
// Principles: FOLLOW-THROUGH (the overshoot + settle), ARCS (the head banks around the
// bend), SLOW IN (the spring's ease). Reduced-motion: start() early-returns.

// The real Phosphor arrowhead, base-centered at the origin, pointing +x (travel dir);
// rendered filled so it matches Phosphor exactly.
const HEAD =
  "M24.97,5.66l-48,48a8,8,0,0,1-11.32-11.32L0,8L0,-8L-34.35,-42.34a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,24.97,5.66Z";
const STROKE_W = 16;
// How far past the home tip the spring overshoot carries the head along the final
// tangent — small, so even the bounce stays near the frame.
const OVERSHOOT = 0.12;
// A looser duration-based spring: a clear overshoot at home, then it settles.
const BOUNCE_SPRING: Transition = { type: "spring", duration: 2.1, bounce: 0.45 };

export function makeArrowUBounce(rail: string) {
  return forwardRef<IconHandle, IconProps>(function ArrowUBounceIcon({ size = 28, style, ...props }, ref) {
    const reduced = useReducedMotion() ?? false;
    const pathRef = useRef<SVGPathElement>(null);
    const headRef = useRef<SVGGElement>(null);
    const totalRef = useRef(0);
    const progress = useMotionValue(1);
    const anim = useRef<ReturnType<typeof animate> | null>(null);

    const render = useCallback(() => {
      const path = pathRef.current;
      const head = headRef.current;
      if (!path || !head) return;
      // getTotalLength forces layout and never changes — measure once, reuse.
      const total = totalRef.current || (totalRef.current = path.getTotalLength());
      if (!total) return;

      const p = progress.get();
      const Lraw = p * total;
      let px: number;
      let py: number;
      let ang: number;
      if (Lraw > total) {
        // Spring overshoot past home — extrapolate the head a little past the tip
        // along the final tangent; it springs back to home as the spring settles.
        const end = path.getPointAtLength(total);
        const before = path.getPointAtLength(total - 1);
        let dx = end.x - before.x;
        let dy = end.y - before.y;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        const ext = (Lraw - total) * OVERSHOOT;
        px = end.x + dx * ext;
        py = end.y + dy * ext;
        ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      } else {
        const L = Math.max(0, Lraw);
        const tip = path.getPointAtLength(L);
        const a = path.getPointAtLength(Math.max(0, L - 1));
        const b = path.getPointAtLength(Math.min(total, L + 1));
        px = tip.x;
        py = tip.y;
        ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      }
      head.setAttribute("transform", `translate(${px} ${py}) rotate(${ang})`);
      // Fade in over the first sliver so the jump to the tail at the start isn't visible.
      head.style.opacity = `${Math.min(1, p / 0.12)}`;
    }, [progress]);

    useMotionValueEvent(progress, "change", render);
    // Paint the resting (full rail, head at home) state after mount.
    useEffect(() => {
      progress.set(1);
      render();
    }, [progress, render]);

    const start = useCallback(() => {
      if (reduced) return;
      anim.current?.stop();
      progress.set(0);
      anim.current = animate(progress, 1, BOUNCE_SPRING);
    }, [reduced, progress]);

    const stop = useCallback(() => {
      // One pass only — no reverse, no settle glide. Snap home if interrupted mid-pass.
      anim.current?.stop();
      progress.set(1);
      render();
    }, [progress, render]);

    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    return (
      <div
        {...props}
        onMouseEnter={start}
        onMouseLeave={stop}
        onFocus={start}
        onBlur={stop}
        style={{ display: "inline-flex", overflow: "hidden", ...style }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 256 256"
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_W}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ overflow: "visible" }}
        >
          <path ref={pathRef} d={rail} />
          <g ref={headRef}>
            <path d={HEAD} fill="currentColor" stroke="none" />
          </g>
        </svg>
      </div>
    );
  });
}
