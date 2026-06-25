"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/**
 * LAB — Arrow Square Down, 5 takes on a "download" motion.
 *
 * The glyph splits into two exact Phosphor sub-paths — the rounded square frame and
 * the inner down-arrow — so the arrow can move independently inside the box. The
 * arrow's bbox is y=80..176 and the box interior is 48..208, leaving ~32u of room
 * above and below, so every motion stays inside the frame.
 */
const SQUARE =
  "M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z";
const ARROW =
  "M165.66,130.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L120,148.69V88a8,8,0,0,1,16,0v60.69l18.34-18.35A8,8,0,0,1,165.66,130.34Z";

// Anchor at the arrow's top edge (y=80) so a stretch elongates the tip downward;
// peak 1.28 lands the tip at ~203, just inside the box interior (208).
const ARROW_TOP = { transformBox: "view-box" as const, originX: 0.5, originY: 80 / 256 };
// Centroid anchor for translate / uniform motions (origin is irrelevant to translate).
const ARROW_CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
// The box scales about its own centre for the button-press.
const SQUARE_CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

type Opts = { arrowStyle?: typeof ARROW_CENTER; square?: Variants; clip?: boolean };

function makeIcon(arrowVariants: Variants, opts: Opts = {}) {
  const { arrowStyle = ARROW_CENTER, square, clip } = opts;
  return forwardRef<IconHandle, IconProps>(function SquareDownIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    const clipId = useId();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    const arrow = <motion.path d={ARROW} variants={reduced ? undefined : arrowVariants} style={arrowStyle} />;

    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
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
          {clip && (
            <clipPath id={clipId}>
              <rect x={48} y={48} width={160} height={160} rx={6} />
            </clipPath>
          )}
          <motion.path d={SQUARE} fillRule="evenodd" variants={reduced ? undefined : square} style={SQUARE_CENTER} />
          {clip ? <g clipPath={`url(#${clipId})`}>{arrow}</g> : arrow}
        </motion.svg>
      </div>
    );
  });
}

/* ── 1. DROP — the arrow lifts, then drops past rest and bounces to a stop. ───────── */
const drop: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -7, 11, -2, 0],
    transition: { duration: 0.72, ease: ARRIVE, times: [0, 0.22, 0.58, 0.8, 1] },
  },
};
const DropIcon = makeIcon(drop);

/* ── 2. BOB — continuous "ready to download" float. ──────────────────────────────── */
const bob: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, 8, 0], transition: { duration: 1.4, ease: "easeInOut", repeat: Infinity } },
};
const BobIcon = makeIcon(bob);

/* ── 3. PLUNGE — the arrow elongates downward, tip leading, bounded by the box. ───── */
const plunge: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.9, 1.28, 0.96, 1.03, 1],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.16, 0.46, 0.66, 0.84, 1] },
  },
};
const PlungeIcon = makeIcon(plunge, { arrowStyle: ARROW_TOP });

/* ── 4. PRESS — the box depresses like a button while the arrow dips, then releases. ─ */
const pressSquare: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: { scale: [1, 0.9, 1.02, 1], transition: { duration: 0.5, ease: ARRIVE, times: [0, 0.4, 0.7, 1] } },
};
const pressArrow: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, 7, 0], transition: { duration: 0.5, ease: ARRIVE, times: [0, 0.45, 1] } },
};
const PressIcon = makeIcon(pressArrow, { square: pressSquare });

/* ════ CYCLE FAMILY — continuous "downloading" loops, all clipped to the box ════════ */

/* ── 5a. SCROLL — the arrow-circle "wheel": fades in small at top, full at centre,
   shrinks + fades out the bottom, looping downward. (Same dialect as arrow-circle-up.) */
const scroll: Variants = {
  normal: { y: 0, scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [-46, 0, 46],
    scale: [0.4, 1, 0.4],
    opacity: [0, 1, 0],
    transition: { duration: 1.15, ease: "easeInOut", times: [0, 0.5, 1], repeat: Infinity, repeatDelay: 0.05 },
  },
};
const ScrollIcon = makeIcon(scroll, { clip: true });

/* ── 5b. DRIP — a single arrow falls in from the top under gravity, fades out the
   bottom, pauses, repeats — a paced "downloading…" tick. */
const drip: Variants = {
  normal: { y: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [-42, -18, 14, 42],
    opacity: [0, 1, 1, 0],
    transition: { duration: 0.95, ease: "easeIn", times: [0, 0.2, 0.8, 1], repeat: Infinity, repeatDelay: 0.35 },
  },
};
const DripIcon = makeIcon(drip, { clip: true });

/* ── 5c. CONVEYOR — a seamless belt of arrows streaming down. Two arrows spaced one
   box-height apart ride a group that travels exactly that distance and loops, so the
   flow never breaks. At rest only the centred arrow shows (the second is above the clip). */
const belt: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, 160], transition: { duration: 2.2, ease: "linear", repeat: Infinity } },
};
const ConveyorIcon = forwardRef<IconHandle, IconProps>(function ConveyorIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  const clipId = useId();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
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
        <clipPath id={clipId}>
          <rect x={48} y={48} width={160} height={160} rx={6} />
        </clipPath>
        <path d={SQUARE} fillRule="evenodd" />
        <g clipPath={`url(#${clipId})`}>
          <motion.g variants={reduced ? undefined : belt} style={{ transformBox: "view-box" }}>
            <path d={ARROW} />
            <path d={ARROW} transform="translate(0,-160)" />
          </motion.g>
        </g>
      </motion.svg>
    </div>
  );
});

/* ── Preview grid ──────────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; blurb: string; Component: typeof DropIcon }[] = [
  { name: "Drop", blurb: "Arrow lifts, drops past rest, and bounces to a stop", Component: DropIcon },
  { name: "Bob", blurb: "Continuous ready-to-download float (loop)", Component: BobIcon },
  { name: "Plunge", blurb: "Arrow elongates downward, tip leading, bounded by the box", Component: PlungeIcon },
  { name: "Press", blurb: "The box depresses like a button while the arrow dips", Component: PressIcon },
  { name: "Cycle · Scroll", blurb: "Shipped — wheel loop, fades in at top, full at centre, out the bottom", Component: ScrollIcon },
  { name: "Cycle · Conveyor", blurb: "Seamless belt of arrows streaming down the box", Component: ConveyorIcon },
  { name: "Cycle · Drip", blurb: "Paced gravity drip — falls in, fades out, repeats", Component: DripIcon },
];

export default function ArrowSquareDownLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);
  useEffect(() => {
    const cycleAll = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 1900);
    };
    cycleAll();
    const id = window.setInterval(cycleAll, 3000);
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Arrow Square Down — download motion</h1>
      <p style={{ opacity: 0.55, fontSize: 14, marginTop: 8, marginBottom: 40, textAlign: "center", maxWidth: 640 }}>
        Takes on the boxed down-arrow — a bounce drop, a ready float, a bounded plunge, a button press, and a
        family of continuous downloading cycles (a scroll wheel, a seamless conveyor, and a paced drip). The arrow
        animates inside the frame; hover, focus, or watch them auto-cycle. Pick one to promote.
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
