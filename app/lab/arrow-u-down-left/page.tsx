"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type Transition,
  type Variants,
} from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, SNAP_RETURN, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/**
 * LAB — Arrow U Down-Left, 5 animation candidates.
 *
 * A U-turn glyph: the shaft enters at the top-left, sweeps right and curves down a
 * 180° bend, then exits pointing down-left — the arrowhead lands at the bottom-left.
 * Every candidate honours that down-left exit axis and is grounded in one of Disney's
 * 12 principles (called out per variant). "U-Turn" is the candidate to ship.
 */
const ARROW =
  "M232,112a64.07,64.07,0,0,1-64,64H51.31l34.35,34.34a8,8,0,0,1-11.32,11.32l-48-48a8,8,0,0,1,0-11.32l48-48a8,8,0,0,1,11.32,11.32L51.31,160H168a48,48,0,0,0,0-96H80a8,8,0,0,1,0-16h88A64.07,64.07,0,0,1,232,112Z";
// Tail (open top end of the shaft) and centre, in normalized view-box space.
const TAIL = { x: 80 / 256, y: 56 / 256 };
const CENTER = { x: 0.5, y: 0.5 };

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

/* ── 1. U-TURN  (shipped) ───────────────────────────────────────────────────────
   Anticipation + Follow-through + Slow in & out. Winds back up-right toward the
   entry, sweeps down-left through the bend, overshoots past rest, then eases home —
   a single completed reroute. */
const uTurn: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 10, -40, 0],
    y: [0, -8, 14, 0],
    transition: { duration: 0.7, times: [0, 0.22, 0.46, 1], ease: ["easeInOut", "easeOut", ARRIVE] },
  },
};
const UTurnIcon = forwardRef<IconHandle, IconProps>(function UTurnIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={ARROW} variants={reduced ? undefined : uTurn} />
      </Svg>
    </div>
  );
});

/* ── 2. TRACE ───────────────────────────────────────────────────────────────────
   Arcs. The glyph rides its own U: it carries right, dips down through the bend,
   then drifts left on the exit and curves home — travel along a curved path, never
   a straight line. */
const trace: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 9, 3, -16, 0],
    y: [0, 4, 12, 8, 0],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] },
  },
};
const TraceIcon = forwardRef<IconHandle, IconProps>(function TraceIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={ARROW} variants={reduced ? undefined : trace} />
      </Svg>
    </div>
  );
});

/* ── 3. RECOIL ──────────────────────────────────────────────────────────────────
   Exaggeration + Timing (mass). A heavy wind-back up-right, then a snappy release
   down-left — a slow load and a fast fire that reads as weight. */
const recoil: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 24, -30, 0],
    y: [0, -16, 16, 0],
    transition: { duration: 0.8, times: [0, 0.4, 0.62, 1], ease: ["easeOut", "easeIn", ARRIVE] },
  },
};
const RecoilIcon = forwardRef<IconHandle, IconProps>(function RecoilIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={ARROW} variants={reduced ? undefined : recoil} />
      </Svg>
    </div>
  );
});

/* ── 4. STRETCH ─────────────────────────────────────────────────────────────────
   Squash & Stretch. Anchored at the tail (open top end), the glyph compresses, then
   elongates as it whips around the bend, and settles with a small overshoot — the
   reroute felt as elastic length. */
const stretch: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.86, 1.18, 0.96, 1],
    transition: { duration: 0.7, ease: "easeInOut", times: [0, 0.25, 0.5, 0.74, 1] },
  },
};
const StretchIcon = forwardRef<IconHandle, IconProps>(function StretchIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path
          d={ARROW}
          variants={reduced ? undefined : stretch}
          style={{ transformBox: "view-box", originX: TAIL.x, originY: TAIL.y }}
        />
      </Svg>
    </div>
  );
});

/* ── 5. PULSE ───────────────────────────────────────────────────────────────────
   Appeal / Secondary action. A tactile uniform squash-and-pop about the centre —
   a quick tap acknowledgement rather than a full reroute. */
const pulse: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: { scale: [1, 0.86, 1.06, 1], transition: { duration: 0.5, ease: "easeOut", times: [0, 0.3, 0.65, 1] } },
};
const PulseIcon = forwardRef<IconHandle, IconProps>(function PulseIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path
          d={ARROW}
          variants={reduced ? undefined : pulse}
          style={{ transformBox: "view-box", originX: CENTER.x, originY: CENTER.y }}
        />
      </Svg>
    </div>
  );
});

/* ── Traveling-head family (after the reference clip) ────────────────────────────
   These three keep the U-shaft as a stroked "track" and send the arrowhead *along
   the path itself*, banking to the tangent — the same self-draw rig as the
   arrow-bend set: the centerline is dash-drawn while a separate head group rides
   the moving tip (getPointAtLength + atan2). The clip's motion is the head lapping
   the U; these are three takes on that. */
const SPINE = "M80,56L168,56A56,56,0,0,1,168,168L51.31,168";
// Standard Phosphor arrowhead, base-centered at the origin, pointing +x (the travel
// direction). Reused verbatim from the arrow-bend set so the head reads identically.
const HEAD =
  "M24.97,5.66l-48,48a8,8,0,0,1-11.32-11.32L0,8L0,-8L-34.35,-42.34a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,24.97,5.66Z";
const STROKE_W = 16;
// How far past the home tip a spring overshoot extrapolates the head (kept small so
// even the bounciest spring lands near the frame).
const TRAVEL_OVERSHOOT = 0.12;

type TravelMode = "draw" | "retrace" | "travel";
type TravelOpts = {
  duration?: number;
  ease?: "linear" | "easeIn" | "easeInOut" | "easeOut";
  settleOnStop?: boolean;
  /** Optional progress keyframes for the pass (e.g. a hold at the bend). */
  keyframes?: number[];
  times?: number[];
  /** Optional spring for the pass — overshoots past home, then settles. */
  spring?: Transition;
};

function makeTravelIcon(mode: TravelMode, opts: TravelOpts = {}) {
  const { duration = 0.8, ease = "easeInOut", settleOnStop = true, keyframes, times, spring } = opts;
  return forwardRef<IconHandle, IconProps>(function TravelIcon({ size = 28, style, ...props }, ref) {
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
      if (mode === "travel") {
        // The full U stays drawn as a fixed rail; the arrowhead simply translates
        // along it (a separate motion from the self-draws below).
        path.style.strokeDasharray = "none";
        path.style.strokeDashoffset = "0";
      } else {
        // Self-draw: the stroke trails the head, drawn from the tail up to the tip.
        path.style.strokeDasharray = `${total}`;
        path.style.strokeDashoffset = `${total - L}`;
      }
      let px: number;
      let py: number;
      let ang: number;
      if (mode === "travel" && Lraw > total) {
        // Spring overshoot past home — extrapolate the head a little past the tip
        // along the final tangent; it springs back to home as the spring settles.
        const end = path.getPointAtLength(total);
        const before = path.getPointAtLength(total - 1);
        let dx = end.x - before.x;
        let dy = end.y - before.y;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        const ext = (Lraw - total) * TRAVEL_OVERSHOOT;
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
        // Retrace runs backward then forward — flip 180° on the backward phase so the
        // head leads. Forward passes never flip (incl. a spring's settle wobble).
        if (mode === "retrace" && progress.getVelocity() < 0) ang += 180;
      }
      head.setAttribute("transform", `translate(${px} ${py}) rotate(${ang})`);
      if (mode === "travel") {
        // Fade in over the first sliver so the jump to the tail at the start of a
        // pass isn't visible; full opacity through the rest, incl. at home (rest).
        head.style.opacity = String(Math.min(1, p / 0.12));
      } else {
        // On the self-draws, hide the head until the stroke has started.
        head.style.opacity = p > 0.015 ? "1" : "0";
      }
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
      if (mode === "draw") {
        progress.set(0);
        // No spring on the head — a plain decelerate-to-rest so the tip never
        // overshoots past the path end.
        anim.current = animate(progress, 1, { duration: 0.7, ease: ARRIVE });
      } else if (mode === "retrace") {
        progress.set(1);
        anim.current = animate(progress, [1, 0, 1], { duration: 1.1, ease: SWEEP, times: [0, 0.5, 1] });
      } else {
        // Travel: the arrowhead makes ONE pass along the fixed U rail, then rests at
        // home. No loop, no reverse. Fades in at the tail so the start isn't a jump.
        progress.set(0);
        anim.current = spring
          ? animate(progress, 1, spring)
          : keyframes
            ? animate(progress, keyframes, { duration, ease, times })
            : animate(progress, 1, { duration, ease });
      }
    }, [reduced, progress]);

    const stop = useCallback(() => {
      anim.current?.stop();
      if (settleOnStop) {
        animate(progress, 1, SNAP_RETURN);
      } else {
        // Travel one-shot already ends at home; if interrupted, snap there (no glide).
        progress.set(1);
        render();
      }
    }, [progress, render, settleOnStop]);

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
  });
}

const DrawIcon = makeTravelIcon("draw");
const RetraceIcon = makeTravelIcon("retrace");
const TravelIcon = makeTravelIcon("travel", { duration: 0.8, ease: "easeInOut", settleOnStop: false });
const CycleIcon = makeTravelIcon("travel", { duration: 0.6, ease: "linear", settleOnStop: false });
// Three more one-shot passes, each a different timing character.
const GlideIcon = makeTravelIcon("travel", { duration: 0.7, ease: "easeOut", settleOnStop: false });
const SurgeIcon = makeTravelIcon("travel", { duration: 0.7, ease: "easeIn", settleOnStop: false });
const HitchIcon = makeTravelIcon("travel", {
  duration: 0.9,
  ease: "easeInOut",
  settleOnStop: false,
  keyframes: [0, 0.5, 0.5, 1],
  times: [0, 0.38, 0.52, 1],
});
// Spring passes — the head springs along the U and pops into home, overshooting the
// tip then settling. Duration-based springs so speed is controlled directly; slowed
// down so the travel reads. Three bounciness levels via `bounce`.
const SpringIcon = makeTravelIcon("travel", {
  settleOnStop: false,
  spring: { type: "spring", duration: 1.8, bounce: 0.3 },
});
const BounceIcon = makeTravelIcon("travel", {
  settleOnStop: false,
  spring: { type: "spring", duration: 2.1, bounce: 0.45 },
});
const BoingIcon = makeTravelIcon("travel", {
  settleOnStop: false,
  spring: { type: "spring", duration: 2.4, bounce: 0.6 },
});

/* ── Preview grid ──────────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; principle: string; blurb: string; Component: typeof UTurnIcon }[] = [
  {
    name: "U-Turn",
    principle: "Anticipation · Follow-through",
    blurb: "Shipped — winds back up-right, then sweeps down-left and glides home",
    Component: UTurnIcon,
  },
  { name: "Trace", principle: "Arcs", blurb: "Rides its own U — right, down, then left along a curve", Component: TraceIcon },
  {
    name: "Recoil",
    principle: "Exaggeration · Timing",
    blurb: "Heavy wind-back up-right, snappy release down-left",
    Component: RecoilIcon,
  },
  {
    name: "Stretch",
    principle: "Squash & Stretch",
    blurb: "Elongates around the bend from the tail, then settles",
    Component: StretchIcon,
  },
  { name: "Pulse", principle: "Appeal", blurb: "Uniform squash-and-pop tap response about the centre", Component: PulseIcon },
  {
    name: "Draw",
    principle: "Arcs · Slow in & out",
    blurb: "Draws itself from the tail, head banking around the U to rest",
    Component: DrawIcon,
  },
  {
    name: "Retrace",
    principle: "Anticipation · Follow-through",
    blurb: "Head runs back to the tail, then redraws — a there-and-back reroute",
    Component: RetraceIcon,
  },
  {
    name: "Travel",
    principle: "Arcs",
    blurb: "Arrowhead makes one pass along the U track, then rests — no loop",
    Component: TravelIcon,
  },
  {
    name: "Cycle",
    principle: "Arcs",
    blurb: "One fast, constant-speed pass along the U track, then rests — no loop",
    Component: CycleIcon,
  },
  {
    name: "Glide",
    principle: "Slow out",
    blurb: "Launches off the tail and eases into home — one pass",
    Component: GlideIcon,
  },
  {
    name: "Surge",
    principle: "Slow in",
    blurb: "Eases off the tail, then builds speed into home — one pass",
    Component: SurgeIcon,
  },
  {
    name: "Hitch",
    principle: "Staging · Timing",
    blurb: "Holds a beat at the bend, then completes the pass — one pass",
    Component: HitchIcon,
  },
  {
    name: "Spring",
    principle: "Follow-through (spring)",
    blurb: "Springs along the U and pops into home, overshooting the tip — one pass",
    Component: SpringIcon,
  },
  {
    name: "Bounce",
    principle: "Follow-through (spring)",
    blurb: "A looser spring — bigger overshoot at home, then settles — one pass",
    Component: BounceIcon,
  },
  {
    name: "Boing",
    principle: "Exaggeration (spring)",
    blurb: "Very low damping — a wobbly, springy arrival at home — one pass",
    Component: BoingIcon,
  },
];

export default function ArrowUDownLeftLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 3000);
    };
    cycle();
    const id = window.setInterval(cycle, 4400);
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Arrow U Down-Left — animation candidates</h1>
      <p style={{ opacity: 0.55, fontSize: 14, marginTop: 8, marginBottom: 40, textAlign: "center", maxWidth: 640 }}>
        Fifteen takes on the U-turn arrow, each built on a Disney motion principle. The first five move the whole glyph;
        the last ten trace the arrowhead along the path itself (after the reference clip). Hover, focus, or watch them
        auto-cycle. Pick one to promote.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          width: "100%",
          maxWidth: 800,
        }}
      >
        {VARIANTS.map(({ name, principle, blurb, Component }, i) => (
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
              <div style={{ fontSize: 11, opacity: 0.4, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.4 }}>
                {principle}
              </div>
              <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>{blurb}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
