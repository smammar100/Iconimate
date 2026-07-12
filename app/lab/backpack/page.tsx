"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, OVERSHOOT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Backpack icon, 5 animation candidates.
 *
 * The Phosphor "backpack" glyph is one path; to move features independently we
 * rebuild it from primitives that match 1:1:
 *   HANDLE — the top carry strap, as a 16-wide stroke (outer r24 / inner r8
 *            ⇒ centerline r16 from y16).
 *   SHELL  — the pack body outline as a 16-wide stroke loop (outer shoulders
 *            r56 / inner r40 ⇒ centerline r48; bottom outer r16).
 *   STRAP  — the small horizontal chest bar (rounded 16-wide stroke).
 *   POCKET — outline stroke (outer r24 / inner r8 ⇒ centerline r16) plus the
 *            glyph's own flap bar and zip-notched pouch subpaths.
 */
const HANDLE = "M96,40V32a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16v8";
const SHELL =
  "M96,48h64a48,48,0,0,1,48,48v120a8,8,0,0,1-8,8H56a8,8,0,0,1-8-8V96a48,48,0,0,1,48-48Z";
const STRAP = "M112,88h32";
/* The pocket is a solid rounded block with two white slots punched out of it
   (the flap piping and the pouch interior with its zip notch) — rendered as
   one even-odd path so it moves as a single part. */
const POCKET =
  "M72,152a24,24,0,0,1,24-24h64a24,24,0,0,1,24,24v64H72Z" +
  "M168,160H88v-8a8,8,0,0,1,8-8h64a8,8,0,0,1,8,8Z" +
  "M88,176h48v8a8,8,0,0,0,16,0v-8h16v40H88Z";

const HOOK = AT(128, 12); // top of the handle — where a hook would hold it
const FLOOR = AT(128, 232); // bottom center — where the pack rests
const CENTER = AT(128, 136);
const POCKET_HEART = AT(128, 176);

/** The full glyph from parts — shared by every variant. */
function Parts() {
  return (
    <>
      <path d={HANDLE} fill="none" stroke="currentColor" strokeWidth={16} />
      <path d={SHELL} fill="none" stroke="currentColor" strokeWidth={16} />
      <path d={STRAP} fill="none" stroke="currentColor" strokeWidth={16} strokeLinecap="round" />
      <path d={POCKET} fillRule="evenodd" />
    </>
  );
}

/* ── 1. HIKE ─────────────────────────────────────────────────────────────────
   The pack bobs on a walker's back — a rhythmic rise and settle with a slight
   alternating tilt, grounded at the floor. */
const hike: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -6, 0, -4, 0],
    rotate: [0, -2.5, 1.5, -1, 0],
    transition: { duration: 0.95, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] },
  },
};

const BackpackHikeIcon = forwardRef<IconHandle, IconProps>(
  function BackpackHikeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : hike} style={FLOOR}>
            <Parts />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 2. SWAY ─────────────────────────────────────────────────────────────────
   The whole pack hangs from its handle and swings like it was just hung on a
   hook — a decaying pendulum about the handle's top. */
const sway: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -9, 7, -4, 2, 0],
    transition: { duration: 1.05, ease: "easeInOut", times: [0, 0.2, 0.45, 0.68, 0.86, 1] },
  },
};

const BackpackSwayIcon = forwardRef<IconHandle, IconProps>(
  function BackpackSwayIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : sway} style={HOOK}>
            <Parts />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 3. CINCH ────────────────────────────────────────────────────────────────
   Straps pulled tight: the chest bar snaps narrow then relaxes while the body
   gives a small squeeze and the handle dips — tightening before the trek. */
const cinchStrap: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 0.5, 1.18, 1],
    transition: { duration: 0.6, ease: OVERSHOOT, times: [0, 0.35, 0.7, 1] },
  },
};
const cinchBody: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 0.96, 1.012, 1],
    transition: { duration: 0.6, ease: "easeOut", times: [0, 0.35, 0.7, 1] },
  },
};
const cinchHandle: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, 4, 0], transition: { duration: 0.6, ease: "easeOut", times: [0, 0.4, 1] } },
};

const BackpackCinchIcon = forwardRef<IconHandle, IconProps>(
  function BackpackCinchIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : cinchBody} style={CENTER}>
            <path d={SHELL} fill="none" stroke="currentColor" strokeWidth={16} />
            <path d={POCKET} fillRule="evenodd" />
          </motion.g>
          <motion.path
            d={HANDLE}
            fill="none"
            stroke="currentColor"
            strokeWidth={16}
            variants={reduced ? undefined : cinchHandle}
          />
          <motion.path
            d={STRAP}
            fill="none"
            stroke="currentColor"
            strokeWidth={16}
            strokeLinecap="round"
            variants={reduced ? undefined : cinchStrap}
            style={AT(128, 88)}
          />
        </Svg>
      </div>
    );
  },
);

/* ── 4. PACK ─────────────────────────────────────────────────────────────────
   Something heavy just went in: the body squashes toward the floor and springs
   back while the handle gets pressed down and rebounds a beat later. */
const packBody: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.92, 1.035, 1],
    transition: { duration: 0.55, ease: OVERSHOOT, times: [0, 0.4, 0.75, 1] },
  },
};
const packHandle: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 8, -3, 0],
    transition: { duration: 0.55, ease: "easeOut", times: [0, 0.4, 0.75, 1] },
  },
};

const BackpackPackIcon = forwardRef<IconHandle, IconProps>(
  function BackpackPackIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : packBody} style={FLOOR}>
            <path d={SHELL} fill="none" stroke="currentColor" strokeWidth={16} />
            <path d={STRAP} fill="none" stroke="currentColor" strokeWidth={16} strokeLinecap="round" />
            <path d={POCKET} fillRule="evenodd" />
          </motion.g>
          <motion.path
            d={HANDLE}
            fill="none"
            stroke="currentColor"
            strokeWidth={16}
            variants={reduced ? undefined : packHandle}
          />
        </Svg>
      </div>
    );
  },
);

/* ── 5. STUFF ────────────────────────────────────────────────────────────────
   The front pouch bulges — something crammed into the pocket — with the shell
   giving the faintest sympathetic swell so the pack feels soft. */
const stuffPocket: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.14, 0.97, 1],
    transition: { duration: DUR.slow, ease: ARRIVE, times: [0, 0.4, 0.75, 1] },
  },
};
const stuffShell: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.015, 1],
    transition: { duration: DUR.slow, ease: "easeOut", times: [0, 0.45, 1] },
  },
};

const BackpackStuffIcon = forwardRef<IconHandle, IconProps>(
  function BackpackStuffIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : stuffShell} style={CENTER}>
            <path d={HANDLE} fill="none" stroke="currentColor" strokeWidth={16} />
            <path d={SHELL} fill="none" stroke="currentColor" strokeWidth={16} />
            <path d={STRAP} fill="none" stroke="currentColor" strokeWidth={16} strokeLinecap="round" />
          </motion.g>
          <motion.g variants={reduced ? undefined : stuffPocket} style={POCKET_HEART}>
            <path d={POCKET} fillRule="evenodd" />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BackpackHikeIcon }[] = [
  { name: "Hike", blurb: "Bobs on a walker's back — rhythmic rise & tilt", Component: BackpackHikeIcon },
  { name: "Sway", blurb: "Hangs from the handle, decaying pendulum", Component: BackpackSwayIcon },
  { name: "Cinch", blurb: "Chest strap snaps tight, body squeezes", Component: BackpackCinchIcon },
  { name: "Pack", blurb: "Heavy drop-in: body squashes, handle rebounds", Component: BackpackPackIcon },
  { name: "Stuff", blurb: "Front pouch bulges — something crammed in", Component: BackpackStuffIcon },
];

export default function BackpackLabPage() {
  return <VariantGrid title="Backpack" variants={VARIANTS} cycleMs={2600} playMs={1400} />;
}
