"use client";

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";

// CHOP + TRAILS + SPARK — a wind-up-and-chop swing, with speed trails through the
// downswing and a spark starburst off the blade at impact. Like the alien icon, the
// effects light up a FRESH random colour on every hover (never the same hue twice in a
// row). The axe stays currentColor; only the trails and sparks are tinted. The whole
// glyph swings about the grip (76,181); the viewBox is widened to the swing's union
// bounding box so the arc never leaves the icon's box.
const AXE =
  "M255.15,97.72A16,16,0,0,0,242,86.94a136.46,136.46,0,0,1-51.65-18l10.31-10.3a25,25,0,0,0-35.32-35.32l-13.2,13.21c-2.33-2.8-3.81-4.84-4.41-5.69a16,16,0,0,0-24.41-2.15L84.68,67.36a16,16,0,0,0,2.14,24.4c.86.6,2.9,2.08,5.7,4.41L7.31,181.37a25,25,0,0,0,35.32,35.32l82.3-82.31a136.63,136.63,0,0,1,18,51.65,16,16,0,0,0,10.77,13.12,16.21,16.21,0,0,0,5.15.85,15.88,15.88,0,0,0,11.26-4.69l81.18-81.19A15.86,15.86,0,0,0,255.15,97.72ZM176.69,34.63a9,9,0,1,1,12.68,12.68L176.82,59.86A152.5,152.5,0,0,1,163.1,48.21ZM31.31,205.37a9,9,0,1,1-12.68-12.68l85.58-85.58a150.89,150.89,0,0,1,11.65,13.71ZM158.8,183.92C150,118.29,101.52,82.52,96,78.67L134.66,40c3.86,5.5,39.63,54,105.25,62.78Z";

const VIEW_BOX = "-60 -60 377 377";
// Pivot at the grip (76,181). With transform-box: view-box, origin lengths are from the
// view-box top-left (-60,-60), so (76,181) → "136px 241px".
const PIVOT = { transformBox: "view-box" as const, transformOrigin: "136px 241px" };
const IMPACT = { x: 195, y: 158 }; // where the blade lands on the chop
const SPARK_O = { transformBox: "view-box" as const, transformOrigin: `${IMPACT.x + 60}px ${IMPACT.y + 60}px` };
const SPARK_ANGLES = [-150, -115, -80, -45, -10, 30];

// The palette the effects flash through — one fresh hue per hover.
const COLORS = ["#2BC4C4", "#FF5C39", "#FFB020", "#36C275", "#7A5CFF", "#19B6E6", "#FF4D8D"];

const chop: Variants = {
  normal: { rotate: 0, transition: { duration: 0.4, ease: "easeOut" } },
  animate: {
    rotate: [0, -22, 14, 0],
    transition: { duration: 0.7, times: [0, 0.32, 0.6, 1], ease: ["easeOut", "easeIn", "easeOut"] },
  },
};
const speed: Variants = {
  normal: { opacity: 0, transition: { duration: 0.15 } },
  animate: { opacity: [0, 0, 1, 0, 0], transition: { duration: 0.7, times: [0, 0.34, 0.5, 0.64, 1], ease: "easeOut" } },
};
const spark: Variants = {
  normal: { scale: 0.4, opacity: 0, transition: { duration: 0.15 } },
  animate: {
    scale: [0.4, 0.4, 1.2, 1.5],
    opacity: [0, 0, 1, 0],
    transition: { duration: 0.7, times: [0, 0.5, 0.64, 0.85], ease: "easeOut" },
  },
};

export const AxeIcon = forwardRef<IconHandle, IconProps>(function AxeIcon({ size = 28, style, ...props }, ref) {
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
        <motion.g variants={speed} stroke={color} strokeWidth={9} strokeLinecap="round" fill="none">
          <path d="M45.2,36.2 A148,148 0 0 1 140.9,48" />
          <path d="M39,67 A120,120 0 0 1 113,67" />
          <path d="M35.7,98.3 A92,92 0 0 1 85.6,89.5" />
        </motion.g>
        <motion.g variants={chop} style={PIVOT}>
          <path d={AXE} />
        </motion.g>
        <motion.g variants={spark} style={SPARK_O} stroke={color} strokeWidth={8} strokeLinecap="round" fill="none">
          {sparks.map((s, i) => (
            <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
          ))}
        </motion.g>
      </motion.svg>
    </div>
  );
});
