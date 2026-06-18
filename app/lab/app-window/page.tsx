"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/**
 * LAB — App Window icon, 5 animation candidates.
 *
 * The Phosphor "app-window" glyph = a FRAME (rounded-rect border) plus two title-bar
 * DOTS. Splitting them lets the dots blink / load independently of the frame.
 */
const FRAME =
  "M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200Z";
const DOT1 = "M80,84A12,12,0,1,1,68,72,12,12,0,0,1,80,84Z";
const DOT2 = "M120,84a12,12,0,1,1-12-12A12,12,0,0,1,120,84Z";
const DOTS = [DOT1, DOT2];

const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const CENTER_3D = { ...CENTER, transformPerspective: 620 };
/** Pivot on the dots' own line (y≈84) so they blink in place. */
const DOTS_ORIGIN = { transformBox: "view-box" as const, originX: 0.5, originY: 0.328 };

/** Back-out overshoot — spring-like snap on tween transitions. */
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

function Svg({
  size,
  controls,
  children,
}: {
  size: number;
  controls: ReturnType<typeof useHover>["controls"];
  children: React.ReactNode;
}) {
  return (
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
      {children}
    </motion.svg>
  );
}

/* ── 1. BLINK — the two dots blink shut and open, like a pair of eyes. ──────── */
const blink: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.12, 1, 0.12, 1],
    transition: { duration: 0.8, ease: "easeInOut", times: [0, 0.12, 0.3, 0.42, 0.6] },
  },
};

export const AppWindowBlinkIcon = forwardRef<IconHandle, IconProps>(
  function AppWindowBlinkIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={FRAME} />
          <motion.g variants={reduced ? undefined : blink} style={DOTS_ORIGIN}>
            {DOTS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 2. OPEN — the window scales up out of the centre, an app launching. ────── */
const open: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0.3, 1],
    opacity: [0, 1],
    transition: { duration: DUR.slow, ease: ARRIVE },
  },
};

export const AppWindowOpenIcon = forwardRef<IconHandle, IconProps>(
  function AppWindowOpenIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : open} style={CENTER}>
            <path d={FRAME} />
            {DOTS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 3. LOAD — the dots pulse one after another, a loading indicator (loops). ─ */
const loadDot: Variants = {
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: (i: number) => ({
    opacity: [1, 0.2, 1],
    transition: { duration: 0.9, ease: "easeInOut", repeat: Infinity, delay: i * 0.2 },
  }),
};

export const AppWindowLoadIcon = forwardRef<IconHandle, IconProps>(
  function AppWindowLoadIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={FRAME} />
          {DOTS.map((d, i) => (
            <motion.path key={i} d={d} custom={i} variants={reduced ? undefined : loadDot} />
          ))}
        </Svg>
      </div>
    );
  },
);

/* ── 4. POP — a tactile squash-and-pop tap of the whole window. ────────────── */
const pop: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.92, 1.05, 1],
    transition: { duration: DUR.base, ease: OVERSHOOT, times: [0, 0.3, 0.65, 1] },
  },
};

export const AppWindowPopIcon = forwardRef<IconHandle, IconProps>(
  function AppWindowPopIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : pop} style={CENTER}>
            <path d={FRAME} />
            {DOTS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 5. TILT — a playful 3-D parallax tilt that wheels around and settles. ──── */
const tilt: Variants = {
  normal: { rotateX: 0, rotateY: 0, transition: RETURN_TRANSITION },
  animate: {
    rotateX: [0, -16, 10, 0],
    rotateY: [0, 18, -12, 0],
    transition: { duration: 1.1, ease: "easeInOut" },
  },
};

export const AppWindowTiltIcon = forwardRef<IconHandle, IconProps>(
  function AppWindowTiltIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : tilt} style={CENTER_3D}>
            <path d={FRAME} />
            {DOTS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof AppWindowBlinkIcon }[] = [
  { name: "Blink", blurb: "The dots blink like eyes", Component: AppWindowBlinkIcon },
  { name: "Open", blurb: "Window scales up, app launching", Component: AppWindowOpenIcon },
  { name: "Load", blurb: "Dots pulse in sequence (loops)", Component: AppWindowLoadIcon },
  { name: "Pop", blurb: "Squash-and-pop tap", Component: AppWindowPopIcon },
  { name: "Tilt", blurb: "3-D parallax tilt & settle", Component: AppWindowTiltIcon },
];

export default function AppWindowLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);

  // Auto-play every variant on a loop so the page is lively without hovering.
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 1600);
    };
    cycle();
    const id = window.setInterval(cycle, 2800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0c",
        color: "#ededed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "64px 24px",
        fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>App Window — animation candidates</h1>
      <p style={{ opacity: 0.55, fontSize: 14, marginTop: 8, marginBottom: 40 }}>
        Hover or focus any tile. They also auto-cycle. Pick one to promote into the registry.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          width: "100%",
          maxWidth: 900,
        }}
      >
        {VARIANTS.map(({ name, blurb, Component }, i) => (
          <div
            key={name}
            tabIndex={0}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              padding: "32px 16px 22px",
              borderRadius: 16,
              background: "#161618",
              border: "1px solid #232326",
              outline: "none",
            }}
          >
            <Component
              ref={(el) => {
                refs.current[i] = el;
              }}
              size={56}
              style={{ color: "#fafafa" }}
            />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
              <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>{blurb}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
