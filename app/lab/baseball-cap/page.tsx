"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/**
 * LAB — Baseball cap icon, 5 animation candidates. Full choreography: hidden
 * actors (speed arcs, sparkles, dust, a ball), squash & stretch, multi-beat
 * timelines. The cap itself is the original Phosphor path, untouched; every
 * extra actor is hidden at rest so the resting glyph stays exact.
 */
const CAP =
  "M128,24h0A104.12,104.12,0,0,0,24,128v56a24,24,0,0,0,24,24,24.11,24.11,0,0,0,14.18-4.64C74.33,194.53,95.6,184,128,184s53.67,10.52,65.81,19.35A24,24,0,0,0,232,184V128A104.12,104.12,0,0,0,128,24Zm88,104v8.87a166,166,0,0,0-40.94-18.22A167,167,0,0,0,146.19,41.9,88.14,88.14,0,0,1,216,128ZM128,44.27a152.47,152.47,0,0,1,30.4,70.46,170.85,170.85,0,0,0-60.84,0A153.31,153.31,0,0,1,128,44.27ZM109.81,41.9a167,167,0,0,0-28.87,76.76A166,166,0,0,0,40,136.88V128A88.14,88.14,0,0,1,109.81,41.9ZM211.66,191.11a8,8,0,0,1-8.44-.69C189.16,180.2,164.7,168,128,168S66.84,180.2,52.78,190.42a8,8,0,0,1-8.44.69A7.77,7.77,0,0,1,40,184V156.07a152,152,0,0,1,176,0V184A7.77,7.77,0,0,1,211.66,191.11Z";

const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});
const CENTER = AT(128, 128);
const HEAD = AT(128, 208);
const BACK_RIM = AT(52, 196);

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

const HIDDEN = { opacity: 0, transition: { duration: 0.1 } };

/* ── 1. SWOOSH TIP ───────────────────────────────────────────────────────────
   The hat tip with flair: the cap lifts and tilts back off the head while two
   speed arcs sketch its path and three sparkles pop above — howdy. */
const stCap: Variants = {
  normal: { rotate: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -16, -13, -14, 0],
    y: [0, -16, -13, -14, 0],
    transition: { duration: 1.2, ease: "easeInOut", times: [0, 0.22, 0.38, 0.6, 0.92] },
  },
};
const stArc = (delay: number): Variants => ({
  normal: HIDDEN,
  animate: {
    opacity: [0, 1, 1, 0],
    pathLength: [0.1, 1, 1, 1],
    transition: { duration: 0.7, ease: SWEEP, times: [0, 0.35, 0.7, 1], delay },
  },
});
const stSpark = (delay: number): Variants => ({
  normal: { ...HIDDEN, scale: 0 },
  animate: {
    opacity: [0, 1, 1, 0],
    scale: [0, 1.3, 1, 0.4],
    transition: { duration: 0.5, ease: ARRIVE, times: [0, 0.4, 0.7, 1], delay },
  },
});

const CapSwooshTipIcon = forwardRef<IconHandle, IconProps>(
  function CapSwooshTipIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {/* speed arcs trailing the tip */}
          <motion.path
            d="M36,150A120,120,0,0,1,84,54"
            fill="none" stroke="currentColor" strokeWidth={10} strokeLinecap="round"
            variants={reduced ? undefined : stArc(0.15)}
          />
          <motion.path
            d="M18,120A96,96,0,0,1,52,52"
            fill="none" stroke="currentColor" strokeWidth={8} strokeLinecap="round"
            variants={reduced ? undefined : stArc(0.28)}
          />
          {/* sparkles above the lifted cap */}
          {[[196, 34, 0.3], [224, 60, 0.42], [206, 90, 0.54]].map(([x, y, d]) => (
            <motion.circle key={`${x}`} cx={x} cy={y} r={7} variants={reduced ? undefined : stSpark(d as number)} style={AT(x as number, y as number)} />
          ))}
          <motion.path d={CAP} variants={reduced ? undefined : stCap} style={BACK_RIM} />
        </Svg>
      </div>
    );
  },
);

/* ── 2. GUST AWAY ────────────────────────────────────────────────────────────
   The wind steals it: the cap flutters, rips up and away spinning, hangs
   flapping at the corner — then gets yanked back on elastically and slams
   down in a puff of dust. */
// Flight pivots at center + scales down slightly so every frame stays inside
// the viewBox; the landing squash is a separate grounded group.
const gaFlight: Variants = {
  normal: { x: 0, y: 0, rotate: 0, scale: 1, transition: { duration: 0 } },
  animate: {
    x: [0, 2, 12, 16, 14, 0, 0, 0],
    y: [0, -3, -14, -18, -16, 0, 0, 0],
    rotate: [0, -5, 12, 9, 14, 0, 0, 0],
    scale: [1, 1, 0.9, 0.88, 0.9, 1, 1, 1],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      times: [0, 0.1, 0.28, 0.4, 0.52, 0.72, 0.85, 1],
    },
  },
};
const gaLand: Variants = {
  normal: { scaleY: 1, transition: { duration: 0 } },
  animate: {
    scaleY: [1, 1, 0.88, 1.05, 1],
    transition: { duration: 1.5, ease: "easeOut", times: [0, 0.68, 0.76, 0.86, 1] },
  },
};
const gaWind = (delay: number): Variants => ({
  normal: HIDDEN,
  animate: {
    opacity: [0, 1, 0],
    x: [-16, 26],
    transition: { duration: 0.45, ease: "easeOut", times: [0, 0.4, 1], delay },
  },
});
const gaDust = (dx: number, delay: number): Variants => ({
  normal: { ...HIDDEN, scale: 0 },
  animate: {
    opacity: [0, 1, 0],
    scale: [0, 1, 0.3],
    x: [0, dx],
    y: [0, -10],
    transition: { duration: 0.4, ease: "easeOut", delay },
  },
});

const CapGustIcon = forwardRef<IconHandle, IconProps>(
  function CapGustIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {/* wind streaks */}
          {[[70, 0.02], [96, 0.12], [122, 0.22]].map(([y, d], i) => (
            <motion.path
              key={i}
              d={`M24,${y}h40`}
              fill="none" stroke="currentColor" strokeWidth={9} strokeLinecap="round"
              variants={reduced ? undefined : gaWind(d as number)}
            />
          ))}
          {/* landing dust */}
          {[[-26, 1.06], [26, 1.06], [-16, 1.12], [16, 1.12]].map(([dx, d], i) => (
            <motion.circle
              key={i}
              cx={128 + (dx as number) * 2.4}
              cy={212}
              r={6}
              variants={reduced ? undefined : gaDust(dx as number, d as number)}
            />
          ))}
          <motion.g variants={reduced ? undefined : gaFlight} style={CENTER}>
            <motion.g variants={reduced ? undefined : gaLand} style={HEAD}>
              <path d={CAP} />
            </motion.g>
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 3. DOUBLE FLIP ──────────────────────────────────────────────────────────
   Trick toss: the cap stretches as it launches, rips through 720° at the top
   of its arc, and lands in a squash with dust kicking out both sides. */
const dfCap: Variants = {
  normal: { y: 0, rotate: 0, scaleY: 1, scaleX: 1, transition: { duration: 0 } },
  animate: {
    y: [0, -30, -34, 0, 0, 0],
    rotate: [0, 380, 720, 720, 720, 720],
    scaleY: [1, 1.12, 1, 0.85, 1.06, 1],
    scaleX: [1, 0.94, 1, 1.12, 0.98, 1],
    transition: { duration: 1.35, ease: "easeInOut", times: [0, 0.28, 0.5, 0.72, 0.87, 1] },
  },
};
const dfDust = (dx: number, delay: number): Variants => ({
  normal: { ...HIDDEN, scale: 0 },
  animate: {
    opacity: [0, 1, 0],
    scale: [0, 1.1, 0.3],
    x: [0, dx],
    y: [0, -8],
    transition: { duration: 0.42, ease: "easeOut", delay },
  },
});

const CapDoubleFlipIcon = forwardRef<IconHandle, IconProps>(
  function CapDoubleFlipIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {[[-30, 0.95], [30, 0.95], [-42, 1.0], [42, 1.0]].map(([dx, d], i) => (
            <motion.circle
              key={i}
              cx={128 + (dx as number) * 1.6}
              cy={214}
              r={6}
              variants={reduced ? undefined : dfDust(dx as number, d as number)}
            />
          ))}
          <motion.path d={CAP} variants={reduced ? undefined : dfCap} style={HEAD} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. CATCH ────────────────────────────────────────────────────────────────
   Cap as glove: a ball zips in from the left, the cap rears up, slams down on
   it — impact ticks burst at the trap — and gives a smug seating wiggle. */
const ctCap: Variants = {
  normal: { y: 0, rotate: 0, scaleY: 1, transition: { duration: 0 } },
  animate: {
    y: [0, -26, -26, 0, 0, 0, 0],
    rotate: [0, -10, -10, 0, 0, -4, 0],
    scaleY: [1, 1, 1, 0.86, 1.05, 1, 1],
    transition: { duration: 1.25, ease: "easeInOut", times: [0, 0.18, 0.34, 0.46, 0.6, 0.78, 1] },
  },
};
const ctBall: Variants = {
  normal: { ...HIDDEN, x: 0 },
  animate: {
    opacity: [0, 1, 1, 0],
    x: [-96, -30, 0, 0],
    transition: { duration: 0.62, ease: "easeOut", times: [0, 0.45, 0.9, 1] },
  },
};
const ctTick = (angle: number): Variants => {
  const rad = (angle * Math.PI) / 180;
  return {
    normal: { ...HIDDEN, scale: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0, 1, 0.4],
      x: [0, Math.cos(rad) * 26],
      y: [0, Math.sin(rad) * -20],
      transition: { duration: 0.38, ease: "easeOut", delay: 0.56 },
    },
  };
};

const CapCatchIcon = forwardRef<IconHandle, IconProps>(
  function CapCatchIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {/* the incoming ball */}
          <motion.circle cx={128} cy={196} r={13} variants={reduced ? undefined : ctBall} />
          {/* impact ticks bursting from the trap */}
          {[150, 90, 30].map((a) => (
            <motion.circle key={a} cx={128} cy={196} r={6} variants={reduced ? undefined : ctTick(a)} />
          ))}
          <motion.path d={CAP} variants={reduced ? undefined : ctCap} style={HEAD} />
        </Svg>
      </div>
    );
  },
);

/* ── 5. SHOWTIME ─────────────────────────────────────────────────────────────
   The walk-out: the cap tips up off the head, twirls a full turn while raised
   as a ring of sparkles pops around it, then pulls on snug with a squash and
   a final seating wiggle. */
const SHOW = 1.7;
const showCap: Variants = {
  normal: { y: 0, rotate: 0, scaleY: 1, transition: { duration: 0 } },
  animate: {
    y: [0, -26, -30, -26, 0, 0, 0, 0],
    rotate: [0, -12, 180, 360, 360, 360, 357, 360],
    scaleY: [1, 1, 1, 1, 0.88, 1.05, 1, 1],
    transition: {
      duration: SHOW,
      ease: "easeInOut",
      times: [0, 0.16, 0.34, 0.5, 0.64, 0.76, 0.88, 1],
    },
  },
};
const showSpark = (angle: number, delay: number): Variants => {
  const rad = (angle * Math.PI) / 180;
  return {
    normal: { ...HIDDEN, scale: 0 },
    animate: {
      opacity: [0, 1, 1, 0],
      scale: [0, 1.25, 1, 0.3],
      x: [0, Math.cos(rad) * 30],
      y: [0, Math.sin(rad) * -30],
      transition: { duration: 0.55, ease: ARRIVE, times: [0, 0.4, 0.7, 1], delay },
    },
  };
};

const CapShowtimeIcon = forwardRef<IconHandle, IconProps>(
  function CapShowtimeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {/* sparkle ring around the twirl */}
          {[
            [45, 0.4], [110, 0.48], [170, 0.56], [230, 0.64], [300, 0.72],
          ].map(([a, d]) => (
            <motion.circle
              key={a}
              cx={128 + Math.cos(((a as number) * Math.PI) / 180) * 74}
              cy={92 - Math.sin(((a as number) * Math.PI) / 180) * 60}
              r={7}
              variants={reduced ? undefined : showSpark(a as number, d as number)}
            />
          ))}
          <motion.path d={CAP} variants={reduced ? undefined : showCap} style={HEAD} />
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof CapSwooshTipIcon }[] = [
  { name: "Swoosh Tip", blurb: "Hat tip with speed arcs + sparkles — howdy", Component: CapSwooshTipIcon },
  { name: "Gust Away", blurb: "Wind steals it, elastic yank back, dust on landing", Component: CapGustIcon },
  { name: "Double Flip", blurb: "720° trick toss, stretch up, squash + dust on landing", Component: CapDoubleFlipIcon },
  { name: "Catch", blurb: "Ball zips in, cap traps it — impact burst + smug wiggle", Component: CapCatchIcon },
  { name: "Showtime", blurb: "Tips up, full twirl in a sparkle ring, pulls on snug", Component: CapShowtimeIcon },
];

export default function BaseballCapLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);

  // Auto-play every variant on a loop so the page is lively without hovering.
  // Each remains fully hover/focus-interactive too.
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 2000);
    };
    cycle();
    const id = window.setInterval(cycle, 3300);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "64px 24px",
        fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Baseball Cap — animation candidates</h1>
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
              background: "var(--surface)",
              border: "1px solid var(--border-2)",
              outline: "none",
            }}
          >
            <Component
              ref={(el) => {
                refs.current[i] = el;
              }}
              size={56}
              style={{ color: "var(--text-strong)" }}
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
