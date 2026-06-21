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
// arrow-bend-right-down: tail enters top-left, bends right, points down.
const SPINE = "M56,32A96,96,0,0,1,152,128L152,204.69";
const HEAD = "M24.97,5.66l-48,48a8,8,0,0,1-11.32-11.32L0,8L0,-8L-34.35,-42.34a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,24.97,5.66Z";
const STROKE_W = 16;
// Fraction of the spring's raw overshoot applied to the head's shoot-past the tip
// — continuous (no hard cap to freeze it) and small enough to stay in the viewBox.
const OVERSHOOT_SCALE = 0.16;

export const ArrowBendRightDownIcon = forwardRef<IconHandle, IconProps>(
  function ArrowBendRightDownIcon({ size = 28, style, ...props }, ref) {
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
