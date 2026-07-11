"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/** Back-out overshoot — spring-like snap on multi-keyframe tweens. */
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

/**
 * LAB — Bag icon, 5 animation candidates.
 *
 * The Phosphor "bag" glyph is a rounded satchel with an arched handle whose
 * ends dip inside the body as two rounded tabs. Split for motion:
 *   BODY   — the satchel outline (outer r16 / sharp inner corners), rendered
 *            even-odd from the glyph's own boundary shapes, with an unbroken
 *            top bar.
 *   HANDLE — the arch plus its two in-body tabs as one 16-wide round-capped
 *            stroke (centerline r40 ⇒ outer r48 / inner r32; the round caps
 *            at y96 reproduce the tabs' rounded ends).
 * The handle overlaps the top bar where it passes through — same fill, so the
 * union is pixel-identical to the original glyph.
 */
const BODY =
  "M216,64H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM216,200H40V80H216Z";
const HANDLE = "M88,96V64a40,40,0,0,1,80,0V96";
// Full original glyph, for reduced-motion static renders.
const BAG =
  "M216,64H176a48,48,0,0,0-96,0H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM128,32a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm88,168H40V80H80V96a8,8,0,0,0,16,0V80h64V96a8,8,0,0,0,16,0V80h40Z";

/* Transform origins (view-box fractions of 256). */
const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});
const GRIP = AT(128, 20); // top of the handle arch — where a hand would hold it
const FLOOR = AT(128, 216); // bottom of the satchel
const TAB_LINE = AT(128, 96); // where the handle's tabs end inside the body

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

function HandleStroke(props: React.ComponentProps<typeof motion.path>) {
  return (
    <motion.path
      d={HANDLE}
      fill="none"
      stroke="currentColor"
      strokeWidth={16}
      strokeLinecap="round"
      {...props}
    />
  );
}

/* ── 1. LIFT ─────────────────────────────────────────────────────────────────
   Picked up by the handle: the handle rises first, the body follows a beat
   later — hanging its weight — then both settle back down. */
const liftHandle: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -10, -8, 0],
    transition: { duration: 0.7, ease: "easeInOut", times: [0, 0.3, 0.55, 1] },
  },
};
const liftBody: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -7, -8, 0],
    transition: { duration: 0.7, ease: "easeInOut", times: [0, 0.4, 0.6, 1] },
  },
};

const BagLiftIcon = forwardRef<IconHandle, IconProps>(
  function BagLiftIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BODY} fillRule="evenodd" variants={reduced ? undefined : liftBody} />
          <HandleStroke variants={reduced ? undefined : liftHandle} />
        </Svg>
      </div>
    );
  },
);

/* ── 2. SWING ────────────────────────────────────────────────────────────────
   Carried while walking: the whole bag swings as a decaying pendulum about
   the top of the handle. */
const swing: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -8, 6.5, -4, 2, 0],
    transition: { duration: 1.05, ease: "easeInOut", times: [0, 0.2, 0.45, 0.68, 0.86, 1] },
  },
};

const BagSwingIcon = forwardRef<IconHandle, IconProps>(
  function BagSwingIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : swing} style={GRIP}>
            <path d={BODY} fillRule="evenodd" />
            <HandleStroke />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 3. DROP ─────────────────────────────────────────────────────────────────
   A purchase lands inside: the body squashes toward the floor and springs
   back while the handle gets knocked down and rebounds. */
const dropBody: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.92, 1.04, 1],
    transition: { duration: 0.55, ease: OVERSHOOT, times: [0, 0.4, 0.75, 1] },
  },
};
const dropHandle: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 9, -3, 0],
    transition: { duration: 0.55, ease: "easeOut", times: [0, 0.4, 0.75, 1] },
  },
};

const BagDropIcon = forwardRef<IconHandle, IconProps>(
  function BagDropIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BODY} fillRule="evenodd" variants={reduced ? undefined : dropBody} style={FLOOR} />
          <HandleStroke variants={reduced ? undefined : dropHandle} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. FLOP ─────────────────────────────────────────────────────────────────
   A soft tote handle: the arch flops side to side about the line where its
   tabs anchor inside the body, while the satchel holds still. */
const flop: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -13, 10, -6, 3, 0],
    transition: { duration: 0.85, ease: "easeOut", times: [0, 0.2, 0.42, 0.64, 0.84, 1] },
  },
};

const BagFlopIcon = forwardRef<IconHandle, IconProps>(
  function BagFlopIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={BODY} fillRule="evenodd" />
          <HandleStroke variants={reduced ? undefined : flop} style={TAB_LINE} />
        </Svg>
      </div>
    );
  },
);

/* ── 5. HOP ──────────────────────────────────────────────────────────────────
   A happy little jump: stretch on the way up, squash on the landing, settle —
   the bag excited about what's inside. */
const hop: Variants = {
  normal: { y: 0, scaleY: 1, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -14, 0, 0],
    scaleY: [1, 1.06, 0.92, 1],
    scaleX: [1, 0.97, 1.05, 1],
    transition: { duration: 0.6, ease: SWEEP, times: [0, 0.35, 0.7, 1] },
  },
};

const BagHopIcon = forwardRef<IconHandle, IconProps>(
  function BagHopIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : hop} style={FLOOR}>
            <path d={BODY} fillRule="evenodd" />
            <HandleStroke />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 6. HEART (from hand-bag.mp4) ────────────────────────────────────────────
   Love the purchase: the bag gives a soft squeeze and a little heart pops out
   of the opening, floats up beside the handle, and fades away. */
const HEART =
  "M0,6C-6,-4,-22,-1,-22,10c0,9,11,16,22,24C11,26,22,19,22,10,22,-1,6,-4,0,6Z";
const heartPop: Variants = {
  normal: { scale: 0, opacity: 0, y: 0, transition: { duration: 0.15 } },
  animate: {
    scale: [0, 1.15, 1, 0.9],
    opacity: [0, 1, 1, 0],
    y: [0, -18, -30, -44],
    transition: { duration: 1.0, ease: "easeOut", times: [0, 0.3, 0.7, 1], delay: 0.18 },
  },
};
const heartBag: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.94, 1.03, 1],
    transition: { duration: 0.5, ease: OVERSHOOT, times: [0, 0.35, 0.7, 1] },
  },
};

const BagHeartIcon = forwardRef<IconHandle, IconProps>(
  function BagHeartIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : heartBag} style={FLOOR}>
            <path d={BODY} fillRule="evenodd" />
            <HandleStroke />
          </motion.g>
          {/* Heart rises from the bag mouth, next to the handle. Hidden at rest. */}
          <motion.g variants={reduced ? undefined : heartPop} style={{ ...AT(176, 56), opacity: 0 }}>
            <path d={HEART} transform="translate(176,56) scale(0.75)" />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 7. WOBBLE (from shopping-bag.mp4) ───────────────────────────────────────
   A jaunty rock: the whole bag tips side to side on its base corners while
   the soft handle counter-flops a beat behind. */
const wobbleBag: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 10, -8, 5, -2.5, 0],
    transition: { duration: 1.0, ease: "easeInOut", times: [0, 0.22, 0.46, 0.68, 0.86, 1] },
  },
};
const wobbleHandle: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -7, 6, -3.5, 1.5, 0],
    transition: { duration: 1.0, ease: "easeInOut", times: [0, 0.28, 0.52, 0.73, 0.89, 1] },
  },
};

const BagWobbleIcon = forwardRef<IconHandle, IconProps>(
  function BagWobbleIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : wobbleBag} style={FLOOR}>
            <path d={BODY} fillRule="evenodd" />
            <HandleStroke variants={reduced ? undefined : wobbleHandle} style={TAB_LINE} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 8. LIFT + SWING ─────────────────────────────────────────────────────────
   The full pick-up: the handle rises first with the body hanging a beat
   behind, the airborne bag swings twice about the grip, then it lowers and
   settles — one continuous carry gesture. */
const LS_DUR = 1.5;
const lsSwing: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // Swing only while airborne (the middle of the timeline), settle by landing.
    rotate: [0, 0, -7, 5.5, -3, 1.5, 0],
    transition: { duration: LS_DUR, ease: "easeInOut", times: [0, 0.18, 0.34, 0.52, 0.7, 0.85, 1] },
  },
};
const lsHandle: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -12, -10, -10, 0],
    transition: { duration: LS_DUR, ease: "easeInOut", times: [0, 0.16, 0.3, 0.78, 1] },
  },
};
const lsBody: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -9, -10, -10, 0],
    transition: { duration: LS_DUR, ease: "easeInOut", times: [0, 0.22, 0.34, 0.78, 1] },
  },
};

const BagLiftSwingIcon = forwardRef<IconHandle, IconProps>(
  function BagLiftSwingIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : lsSwing} style={GRIP}>
            <motion.path d={BODY} fillRule="evenodd" variants={reduced ? undefined : lsBody} />
            <HandleStroke variants={reduced ? undefined : lsHandle} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BagLiftIcon }[] = [
  { name: "Lift", blurb: "Handle rises first, body hangs a beat behind", Component: BagLiftIcon },
  { name: "Swing", blurb: "Carried while walking — decaying pendulum", Component: BagSwingIcon },
  { name: "Drop", blurb: "Purchase lands: body squashes, handle rebounds", Component: BagDropIcon },
  { name: "Flop", blurb: "Soft tote handle flops side to side", Component: BagFlopIcon },
  { name: "Hop", blurb: "Happy jump — stretch up, squash on landing", Component: BagHopIcon },
  { name: "Heart", blurb: "Soft squeeze, a heart floats out (hand-bag.mp4)", Component: BagHeartIcon },
  { name: "Wobble", blurb: "Rocks on its base, handle counter-flops (shopping-bag.mp4)", Component: BagWobbleIcon },
  { name: "Lift + Swing", blurb: "Picked up, swings while airborne, lowers & settles", Component: BagLiftSwingIcon },
];

export default function BagLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);

  // Auto-play every variant on a loop so the page is lively without hovering.
  // Each remains fully hover/focus-interactive too.
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 1400);
    };
    cycle();
    const id = window.setInterval(cycle, 2600);
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Bag — animation candidates</h1>
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
