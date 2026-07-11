"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/** Back-out overshoot — spring-like snap on multi-keyframe tweens. */
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

/**
 * LAB — Barn icon, 5 animation candidates (escalating).
 *
 * The Phosphor "barn" glyph is a gambrel barn with a crossbuck door and a
 * loft vent. Rebuilt into three parts that reproduce it 1:1:
 *   SHELL — outer silhouette + a FULL interior hole (the original excludes
 *           the door area from its interior; here the interior is open so
 *           the door can move independently).
 *   DOOR  — the crossbuck door: rounded-top rect with the glyph's own four
 *           white triangles punched even-odd.
 *   VENT  — the loft vent bar, the glyph's own subpath untouched.
 */
const SHELL =
  "M240,192h-8V130.57l1.49,2.08a8,8,0,1,0,13-9.3l-40-56a8,8,0,0,0-2-1.94L137,18.77l-.1-.07a16,16,0,0,0-17.76,0l-.1.07L51.45,65.42a8,8,0,0,0-2,1.94l-40,56a8,8,0,1,0,13,9.3L24,130.57V192H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM40,108.17,61.7,77.79,128,32l66.3,45.78L216,108.17V192H40Z";
const DOOR =
  "M64,120a8,8,0,0,1,8-8H184a8,8,0,0,1,8,8v72H64ZM128,150.17,97,128H159ZM176,135.55v48.91L141.76,160ZM114.24,160,80,184.46V135.55ZM128,169.83,159,192H97Z";
const VENT = "M104,88a8,8,0,0,1,8-8h32a8,8,0,1,1,0,16H112A8,8,0,0,1,104,88Z";

/* Transform origins (view-box fractions of 256). */
const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});
const FOUNDATION = AT(128, 200); // barn sits on its ground line
const DOOR_LEFT = AT(64, 152); // left jamb — sliding-door track
const VENT_EYE = AT(128, 88);

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

/* ── 1. SETTLE ───────────────────────────────────────────────────────────────
   A cozy grounded squash: the barn presses into its foundation and springs
   back tall — sturdy, lived-in. */
const settle: Variants = {
  normal: { scaleY: 1, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.93, 1.03, 1],
    scaleX: [1, 1.04, 0.99, 1],
    transition: { duration: 0.55, ease: OVERSHOOT, times: [0, 0.4, 0.75, 1] },
  },
};

const BarnSettleIcon = forwardRef<IconHandle, IconProps>(
  function BarnSettleIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : settle} style={FOUNDATION}>
            <path d={SHELL} fillRule="evenodd" />
            <path d={DOOR} fillRule="evenodd" />
            <path d={VENT} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 2. WINK ─────────────────────────────────────────────────────────────────
   The loft vent is the barn's eye: it blinks twice while the door gives the
   faintest proud swell — a friendly barn saying hello. */
const wink: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.12, 1, 1, 0.12, 1],
    transition: { duration: 0.8, ease: "easeInOut", times: [0, 0.14, 0.28, 0.5, 0.64, 0.78] },
  },
};
const winkDoor: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.03, 1],
    transition: { duration: 0.8, ease: "easeInOut", times: [0, 0.4, 1] },
  },
};

const BarnWinkIcon = forwardRef<IconHandle, IconProps>(
  function BarnWinkIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={SHELL} fillRule="evenodd" />
          <motion.path d={DOOR} fillRule="evenodd" variants={reduced ? undefined : winkDoor} style={AT(128, 192)} />
          <motion.path d={VENT} variants={reduced ? undefined : wink} style={VENT_EYE} />
        </Svg>
      </div>
    );
  },
);

/* ── 3. SLIDE ────────────────────────────────────────────────────────────────
   The sliding barn door: it rolls open along its track, holds — come on in —
   then rolls shut. */
const slide: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 0.12, 0.12, 1],
    transition: { duration: 1.1, ease: "easeInOut", times: [0, 0.3, 0.62, 1] },
  },
};

const BarnSlideIcon = forwardRef<IconHandle, IconProps>(
  function BarnSlideIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={SHELL} fillRule="evenodd" />
          <motion.path d={DOOR} fillRule="evenodd" variants={reduced ? undefined : slide} style={DOOR_LEFT} />
          <path d={VENT} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. HOEDOWN ──────────────────────────────────────────────────────────────
   Dance in the barn: it bounces on its foundation with alternating tilts,
   the vent sliding side to side like it's keeping the beat. */
const hoedown: Variants = {
  normal: { y: 0, rotate: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -8, 0, -6, 0],
    rotate: [0, -2.5, 0, 2.5, 0],
    scaleY: [1, 1.03, 0.95, 1.02, 1],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.22, 0.45, 0.7, 1] },
  },
};
const hoedownVent: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -7, 7, -5, 0],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.25, 0.55, 0.8, 1] },
  },
};

const BarnHoedownIcon = forwardRef<IconHandle, IconProps>(
  function BarnHoedownIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : hoedown} style={FOUNDATION}>
            <path d={SHELL} fillRule="evenodd" />
            <path d={DOOR} fillRule="evenodd" />
            <motion.path d={VENT} variants={reduced ? undefined : hoedownVent} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 5. OPEN HOUSE ───────────────────────────────────────────────────────────
   The full welcome: the door rolls open, the vent blinks hello while it's
   open, the barn gives a happy little bounce, and the door rolls shut. */
const OH = 1.6;
const ohDoor: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 0.12, 0.12, 0.12, 1],
    transition: { duration: OH, ease: "easeInOut", times: [0, 0.22, 0.5, 0.72, 1] },
  },
};
const ohVent: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1, 0.12, 1, 0.12, 1, 1],
    transition: { duration: OH, ease: "easeInOut", times: [0, 0.26, 0.34, 0.42, 0.5, 0.58, 1] },
  },
};
const ohBarn: Variants = {
  normal: { y: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 0, -6, 0, 0],
    scaleY: [1, 1, 1.02, 0.97, 1],
    transition: { duration: OH, ease: "easeInOut", times: [0, 0.5, 0.62, 0.74, 0.88] },
  },
};

const BarnOpenHouseIcon = forwardRef<IconHandle, IconProps>(
  function BarnOpenHouseIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : ohBarn} style={FOUNDATION}>
            <path d={SHELL} fillRule="evenodd" />
            <motion.path d={DOOR} fillRule="evenodd" variants={reduced ? undefined : ohDoor} style={DOOR_LEFT} />
            <motion.path d={VENT} variants={reduced ? undefined : ohVent} style={VENT_EYE} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 6. BARN DANCE ───────────────────────────────────────────────────────────
   Hoedown meets Open House: the door rolls open, the party spills out — the
   whole barn bounces with alternating tilts while the vent slides to the
   beat — then the door rolls shut on the last step. */
const BD = 2.0;
const bdDoor: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 0.12, 0.12, 0.12, 1],
    transition: { duration: BD, ease: "easeInOut", times: [0, 0.16, 0.5, 0.78, 1] },
  },
};
const bdBarn: Variants = {
  normal: { y: 0, rotate: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // dance only while the door is open (16%–78% of the timeline)
    y: [0, 0, -8, 0, -6, 0, 0],
    rotate: [0, 0, -2.5, 0, 2.5, 0, 0],
    scaleY: [1, 1, 1.03, 0.95, 1.02, 1, 1],
    transition: { duration: BD, ease: "easeInOut", times: [0, 0.16, 0.3, 0.46, 0.62, 0.78, 1] },
  },
};
const bdVent: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 0, -7, 7, -5, 0, 0],
    transition: { duration: BD, ease: "easeInOut", times: [0, 0.16, 0.32, 0.5, 0.66, 0.78, 1] },
  },
};

const BarnDanceIcon = forwardRef<IconHandle, IconProps>(
  function BarnDanceIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : bdBarn} style={FOUNDATION}>
            <path d={SHELL} fillRule="evenodd" />
            <motion.path d={DOOR} fillRule="evenodd" variants={reduced ? undefined : bdDoor} style={DOOR_LEFT} />
            <motion.path d={VENT} variants={reduced ? undefined : bdVent} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BarnSettleIcon }[] = [
  { name: "Settle", blurb: "Grounded squash into the foundation, springs back", Component: BarnSettleIcon },
  { name: "Wink", blurb: "The loft vent blinks twice — a friendly hello", Component: BarnWinkIcon },
  { name: "Slide", blurb: "The crossbuck door rolls open, holds, rolls shut", Component: BarnSlideIcon },
  { name: "Hoedown", blurb: "Bounces with alternating tilts, vent keeps the beat", Component: BarnHoedownIcon },
  { name: "Open House", blurb: "Door opens, vent blinks hello, happy bounce, shut", Component: BarnOpenHouseIcon },
  { name: "Barn Dance", blurb: "Door opens, the barn dances while it's open, door shuts", Component: BarnDanceIcon },
];

export default function BarnLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);

  // Auto-play every variant on a loop so the page is lively without hovering.
  // Each remains fully hover/focus-interactive too.
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 2200);
    };
    cycle();
    const id = window.setInterval(cycle, 3500);
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Barn — animation candidates</h1>
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
