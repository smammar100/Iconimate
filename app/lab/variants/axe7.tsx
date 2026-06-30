"use client";

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AXE } from "../axe-icon";

// v7 — CHOP + TRAILS + SPARK (random colour). A combination: the wind-up-and-chop
// swing from v3, the teal-style speed trails from v6, and the impact spark starburst
// from v5 — and, like the alien icon, the effects light up a FRESH random colour on
// every hover (never the same hue twice in a row). The trails flash through the
// downswing; the sparks burst from the blade at impact. The expanded viewBox keeps the
// whole swing inside the icon's box.
const VIEW_BOX = "-60 -60 377 377";
// Pivot at the grip (76,181). With transform-box: view-box, origin lengths are from the
// view-box top-left (-60,-60), so (76,181) → "136px 241px".
const PIVOT = { transformBox: "view-box" as const, transformOrigin: "136px 241px" };
const IMPACT = { x: 195, y: 158 }; // where the blade lands on the chop
const SPARK_O = { transformBox: "view-box" as const, transformOrigin: `${IMPACT.x + 60}px ${IMPACT.y + 60}px` };
const SPARK_ANGLES = [-150, -115, -80, -45, -10, 30];

// The palette the effects flash through — one fresh hue per hover.
const COLORS = ["#2BC4C4", "#FF5C39", "#FFB020", "#36C275", "#7A5CFF", "#19B6E6", "#FF4D8D"];

// Chop (from v3): wind back, drive down fast past rest, settle.
const chop: Variants = {
  normal: { rotate: 0, transition: { duration: 0.4, ease: "easeOut" } },
  animate: {
    rotate: [0, -22, 14, 0],
    transition: { duration: 0.7, times: [0, 0.32, 0.6, 1], ease: ["easeOut", "easeIn", "easeOut"] },
  },
};
// Speed trails (from v6): flash through the downswing.
const speed: Variants = {
  normal: { opacity: 0, transition: { duration: 0.15 } },
  animate: { opacity: [0, 0, 1, 0, 0], transition: { duration: 0.7, times: [0, 0.34, 0.5, 0.64, 1], ease: "easeOut" } },
};
// Spark burst (from v5): flash + scale out at impact.
const spark: Variants = {
  normal: { scale: 0.4, opacity: 0, transition: { duration: 0.15 } },
  animate: { scale: [0.4, 0.4, 1.2, 1.5], opacity: [0, 0, 1, 0], transition: { duration: 0.7, times: [0, 0.5, 0.64, 0.85], ease: "easeOut" } },
};

export const Axe7 = forwardRef<IconHandle, IconProps>(function Axe7({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();

  // Pick a fresh effect colour on each hover/focus — never the same hue twice in a row.
  const [color, setColor] = useState(COLORS[0]);
  const colorRef = useRef(COLORS[0]);
  const flashColor = useCallback(() => {
    let next = colorRef.current;
    while (next === colorRef.current) next = COLORS[Math.floor(Math.random() * COLORS.length)];
    colorRef.current = next;
    setColor(next);
  }, []);
  const handleStart = useCallback(() => {
    flashColor();
    start();
  }, [flashColor, start]);
  useImperativeHandle(ref, () => ({ startAnimation: handleStart, stopAnimation: stop }), [handleStart, stop]);

  const sparks = SPARK_ANGLES.map((deg) => {
    const a = (deg * Math.PI) / 180;
    return {
      x1: IMPACT.x + 7 * Math.cos(a),
      y1: IMPACT.y + 7 * Math.sin(a),
      x2: IMPACT.x + 22 * Math.cos(a),
      y2: IMPACT.y + 22 * Math.sin(a),
    };
  });

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox={VIEW_BOX} fill="currentColor">
          <path d={AXE} />
        </svg>
      </div>
    );
  }

  return (
    <div
      {...props}
      {...bind}
      onMouseEnter={handleStart}
      onFocus={handleStart}
      style={{ display: "inline-flex", overflow: "hidden", ...style }}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox={VIEW_BOX}
        fill="currentColor"
        initial="normal"
        animate={controls}
      >
        {/* Speed trails — random colour, flashing through the downswing. */}
        <motion.g variants={speed} stroke={color} strokeWidth={9} strokeLinecap="round" fill="none">
          <path d="M45.2,36.2 A148,148 0 0 1 140.9,48" />
          <path d="M39,67 A120,120 0 0 1 113,67" />
          <path d="M35.7,98.3 A92,92 0 0 1 85.6,89.5" />
        </motion.g>
        {/* The axe, swinging about the grip. */}
        <motion.g variants={chop} style={PIVOT}>
          <path d={AXE} />
        </motion.g>
        {/* Impact sparks — random colour, bursting from the blade. */}
        <motion.g variants={spark} style={SPARK_O} stroke={color} strokeWidth={8} strokeLinecap="round" fill="none">
          {sparks.map((s, i) => (
            <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
          ))}
        </motion.g>
      </motion.svg>
    </div>
  );
});
