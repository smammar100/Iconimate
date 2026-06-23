"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import type { IconHandle, IconProps } from "@/lib/icon";

// Shared DRAW engine for the angular arrow-elbow family. The glyph's centerline
// (a stroked polyline: tail → corner/vertex → tip) is traced via stroke-dashoffset
// while a chevron head rides the growing tip, rotated to the path tangent — so at
// each sharp bend the head snaps a hard turn instead of banking around a curve.
// One crisp, bounce-free easeInOut pass.
const HEAD =
  "M24.97,5.66l-48,48a8,8,0,0,1-11.32-11.32L0,8L0,-8L-34.35,-42.34a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,24.97,5.66Z";
const STROKE_W = 16;

/** Build an arrow-elbow icon that draws itself along `spine` (a polyline path). */
export function makeDrawElbow(spine: string) {
  return forwardRef<IconHandle, IconProps>(function DrawElbowIcon({ size = 28, style, ...props }, ref) {
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
      const L = Math.max(0, Math.min(total, p * total));
      path.style.strokeDasharray = `${total}`;
      path.style.strokeDashoffset = `${total - L}`;

      const tip = path.getPointAtLength(L);
      const a = path.getPointAtLength(Math.max(0, L - 1));
      const b = path.getPointAtLength(Math.min(total, L + 1));
      const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      head.setAttribute("transform", `translate(${tip.x} ${tip.y}) rotate(${ang})`);
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
      anim.current = animate(progress, 1, { duration: 0.62, ease: "easeInOut" });
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
          <path ref={pathRef} d={spine} />
          <g ref={headRef}>
            <path d={HEAD} fill="currentColor" stroke="none" />
          </g>
        </svg>
      </div>
    );
  });
}
