"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import type { IconHandle, IconProps } from "@/lib/icon";

// SNAP — the arrow draws itself in a single fast, bouncy stroke. The centerline
// is traced (stroke-dasharray / dashoffset off getTotalLength) while a separate
// arrowhead group rides the growing tip — positioned with getPointAtLength and
// rotated to the path's tangent (atan2) so it banks around the bend. On an
// underdamped spring the tip overshoots just past the head, then springs to rest.
//
// arrow-bend-down-left: tail enters top-right, bends down, points left.

// Centerline: tail (224,56) → quarter-bend (centered 128,56, r≈96) → shaft to the
// arrowhead base (51.31,152). Shaft length 76.69, matching the Phosphor glyph.
const SPINE = "M224,56A96,96,0,0,1,128,152L51.31,152";
// The real Phosphor arrowhead, base-centered at the origin, pointing +x (travel
// direction); rendered filled so it matches Phosphor exactly.
const HEAD = "M24.97,5.66l-48,48a8,8,0,0,1-11.32-11.32L0,8L0,-8L-34.35,-42.34a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,24.97,5.66Z";
const STROKE_W = 16;
// The head's shoot-past the tip is a small FRACTION of the spring's raw overshoot,
// not a hard cap — so it tracks the spring continuously (a hard ceiling would
// freeze the head at the cap, reading as a pause/lag). Kept low enough that even
// the spring's peak overshoot keeps the head — and its stroke — inside the
// viewBox (the tip sits near the frame's left edge).
const OVERSHOOT_SCALE = 0.16;

export const ArrowBendDownLeftIcon = forwardRef<IconHandle, IconProps>(
  function ArrowBendDownLeftIcon({ size = 28, style, ...props }, ref) {
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
      const L = Math.max(0, Math.min(total, Lraw));

      path.style.strokeDasharray = `${total}`;
      path.style.strokeDashoffset = `${total - L}`;

      let px: number;
      let py: number;
      let ang: number;
      if (Lraw > total) {
        // Overshoot: extrapolate the tip along the final tangent (a fraction of it).
        const end = path.getPointAtLength(total);
        const before = path.getPointAtLength(total - 1);
        let dx = end.x - before.x;
        let dy = end.y - before.y;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        const ext = (Lraw - total) * OVERSHOOT_SCALE;
        px = end.x + dx * ext;
        py = end.y + dy * ext;
        ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      } else {
        const tip = path.getPointAtLength(L);
        const a = path.getPointAtLength(Math.max(0, L - 1));
        const b = path.getPointAtLength(Math.min(total, L + 1));
        px = tip.x;
        py = tip.y;
        ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      }
      head.setAttribute("transform", `translate(${px} ${py}) rotate(${ang})`);
      head.style.opacity = p > 0.015 ? "1" : "0";
    }, [progress]);

    useMotionValueEvent(progress, "change", render);
    // Paint the resting (fully drawn) state after mount.
    useEffect(() => {
      progress.set(1);
      render();
    }, [progress, render]);

    const start = useCallback(() => {
      if (reduced) return;
      anim.current?.stop();
      progress.set(0);
      anim.current = animate(progress, 1, { type: "spring", stiffness: 70, damping: 7, mass: 1 });
    }, [reduced, progress]);

    const stop = useCallback(() => {
      anim.current?.stop();
      animate(progress, 1, { duration: 0.3, ease: "easeOut" });
    }, [progress]);

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
          <path ref={pathRef} d={SPINE} />
          <g ref={headRef}>
            <path d={HEAD} fill="currentColor" stroke="none" />
          </g>
        </svg>
      </div>
    );
  },
);
