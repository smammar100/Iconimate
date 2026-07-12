"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion, type Transition } from "motion/react";
import { ARRIVE, springSwing } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Arrows Clockwise (refresh / sync), 5 animation candidates.
 *
 * The natural motion is a clockwise rotation about the centre. Each candidate is a
 * different timing/character study on that spin, grounded in a Disney principle.
 * The glyph has 2-fold rotational symmetry, so a 360° turn lands seamlessly.
 */
const GLYPH =
  "M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z";

type SpinSpec = {
  rotate: number | number[];
  transition: Transition;
  scale?: number[];
  scaleTransition?: Transition;
};

function makeSpinIcon(spec: SpinSpec) {
  return forwardRef<IconHandle, IconProps>(function SpinIcon({ size = 28, style, ...props }, ref) {
    const reduced = useReducedMotion() ?? false;
    const rotate = useMotionValue(0);
    const scale = useMotionValue(1);
    const rAnim = useRef<ReturnType<typeof animate> | null>(null);
    const sAnim = useRef<ReturnType<typeof animate> | null>(null);

    const start = () => {
      if (reduced) return;
      rAnim.current?.stop();
      sAnim.current?.stop();
      // Always spin forward from rest; a completed 360° turn lands back at rest.
      rotate.set(0);
      scale.set(1);
      rAnim.current = animate(rotate, spec.rotate, spec.transition);
      if (spec.scale) sAnim.current = animate(scale, spec.scale, spec.scaleTransition);
    };
    const stop = () => {
      rAnim.current?.stop();
      sAnim.current?.stop();
      rotate.set(0);
      scale.set(1);
    };
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), []);

    return (
      <div
        {...props}
        onMouseEnter={start}
        onMouseLeave={stop}
        onFocus={start}
        onBlur={stop}
        style={{ display: "inline-flex", ...style }}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 256 256"
          fill="currentColor"
          style={{ rotate, scale, overflow: "visible" }}
        >
          <path d={GLYPH} />
        </motion.svg>
      </div>
    );
  });
}

/* ── 1. SPIN  (shipped) — one confident clockwise turn that decelerates to rest.
   Slow out / Follow-through. ─────────────────────────────────────────────────── */
const SpinIcon = makeSpinIcon({ rotate: 360, transition: { duration: 0.85, ease: ARRIVE } });

/* ── 2. WIND-UP — Anticipation: a small counter-clockwise wind-back, then the spin
   fires clockwise and settles. ──────────────────────────────────────────────────── */
const WindUpIcon = makeSpinIcon({
  rotate: [0, -28, 360],
  transition: { duration: 1.0, times: [0, 0.16, 1], ease: ["easeOut", ARRIVE] },
});

/* ── 3. SPRING — Follow-through: spins and overshoots a touch past rest, then springs
   back. ─────────────────────────────────────────────────────────────────────────── */
const SpringIcon = makeSpinIcon({ rotate: 360, transition: springSwing });

/* ── 4. LOOP — Arcs (loop): a continuous, constant-speed clockwise spin — a working /
   syncing idle. ────────────────────────────────────────────────────────────────── */
const LoopIcon = makeSpinIcon({ rotate: 360, transition: { duration: 1.0, ease: "linear", repeat: Infinity } });

/* ── 5. PULSE — Secondary action: the spin carries a gentle squash-and-pop, so it
   feels like a tactile refresh tap. ───────────────────────────────────────────────── */
const PulseIcon = makeSpinIcon({
  rotate: 360,
  transition: { duration: 0.85, ease: ARRIVE },
  scale: [1, 0.9, 1.06, 1],
  scaleTransition: { duration: 0.7, ease: "easeOut", times: [0, 0.3, 0.65, 1] },
});

/* ── Preview grid ──────────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; principle: string; blurb: string; Component: typeof SpinIcon }[] = [
  { name: "Spin", principle: "Slow out", blurb: "Shipped — one clockwise turn that decelerates to rest", Component: SpinIcon },
  {
    name: "Wind-up",
    principle: "Anticipation",
    blurb: "Winds back counter-clockwise, then fires the spin clockwise",
    Component: WindUpIcon,
  },
  {
    name: "Spring",
    principle: "Follow-through (spring)",
    blurb: "Spins, overshoots past rest, then springs back",
    Component: SpringIcon,
  },
  { name: "Loop", principle: "Arcs (loop)", blurb: "Continuous constant-speed spin — a syncing idle", Component: LoopIcon },
  {
    name: "Pulse",
    principle: "Secondary action",
    blurb: "Spins with a gentle squash-and-pop — a refresh tap",
    Component: PulseIcon,
  },
];

export default function ArrowsClockwiseLabPage() {
  return <VariantGrid title="Arrows Clockwise" variants={VARIANTS} cycleMs={3000} playMs={1800} />;
}
