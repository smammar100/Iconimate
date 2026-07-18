"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, OVERSHOOT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Basketball icon (Phosphor "basketball"), 5 animation candidates.
 *
 * The glyph is a ball whose 8 seam panels are part of the single compound path,
 * so the whole ball moves as one — and rotation is the star: unlike most
 * glyphs, you can SEE a basketball spin because the seams travel.
 *
 * Bounds: the circle spans y 24..232 and x 24..232, leaving 24 grid units of
 * margin all round. Lifts and rolls below stay inside that budget (wrapper
 * divs clip via overflow:hidden).
 */
const BALL =
  "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM60,72.17A87.2,87.2,0,0,1,79.63,120H40.37A87.54,87.54,0,0,1,60,72.17ZM136,120V40.37a87.59,87.59,0,0,1,48.68,20.37A103.06,103.06,0,0,0,160.3,120Zm-16,0H95.7A103.06,103.06,0,0,0,71.32,60.74,87.59,87.59,0,0,1,120,40.37ZM79.63,136A87.2,87.2,0,0,1,60,183.83,87.54,87.54,0,0,1,40.37,136Zm16.07,0H120v79.63a87.59,87.59,0,0,1-48.68-20.37A103.09,103.09,0,0,0,95.7,136Zm40.3,0h24.3a103.09,103.09,0,0,0,24.38,59.26A87.59,87.59,0,0,1,136,215.63Zm40.37,0h39.26A87.54,87.54,0,0,1,196,183.83,87.2,87.2,0,0,1,176.37,136Zm0-16A87.2,87.2,0,0,1,196,72.17,87.54,87.54,0,0,1,215.63,120Z";

const CENTER = AT(128, 128); // ball center — spin pivot
const FLOOR = AT(128, 232); //  bottom of the ball — bounce/squash pivot

/* ── 1. BOUNCE ───────────────────────────────────────────────────────────────
   One real dribble: the ball lifts, drops, squashes hard on the floor, pops
   back up smaller, and settles — decaying like a live ball. */
const bounce: Variants = {
  normal: { y: 0, scaleY: 1, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -18, 0, -8, 0, 0],
    scaleY: [1, 1.02, 0.85, 1.01, 0.94, 1],
    scaleX: [1, 0.99, 1.1, 1, 1.04, 1],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.2, 0.42, 0.62, 0.8, 1] },
  },
};

const BasketballBounceIcon = forwardRef<IconHandle, IconProps>(
  function BasketballBounceIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BALL} variants={reduced ? undefined : bounce} style={FLOOR} />
        </Svg>
      </div>
    );
  },
);

/* ── 2. DRIBBLE ──────────────────────────────────────────────────────────────
   Two quick low taps — the hand keeping the ball alive. Faster rhythm and
   smaller travel than BOUNCE, each contact a light squash. */
const dribble: Variants = {
  normal: { y: 0, scaleY: 1, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -10, 0, -10, 0, 0],
    scaleY: [1, 1, 0.92, 1, 0.92, 1],
    scaleX: [1, 1, 1.05, 1, 1.05, 1],
    transition: { duration: 0.75, ease: "easeInOut", times: [0, 0.18, 0.36, 0.58, 0.78, 1] },
  },
};

const BasketballDribbleIcon = forwardRef<IconHandle, IconProps>(
  function BasketballDribbleIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BALL} variants={reduced ? undefined : dribble} style={FLOOR} />
        </Svg>
      </div>
    );
  },
);

/* ── 3. SPIN ─────────────────────────────────────────────────────────────────
   On the fingertip: a full revolution with a fast launch that drains to a
   stop — the seams do all the talking. */
const spin: Variants = {
  normal: { rotate: 0, transition: { duration: 0 } },
  animate: {
    rotate: [0, 360],
    transition: { duration: 0.9, ease: [0.2, 0.6, 0.3, 1] },
  },
};

const BasketballSpinIcon = forwardRef<IconHandle, IconProps>(
  function BasketballSpinIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BALL} variants={reduced ? undefined : spin} style={CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. SHOT ─────────────────────────────────────────────────────────────────
   The jump shot: the ball rises with backspin (opposite the arc, like a real
   release), hangs at the top of the arc, and drops back to the set point. */
const shot: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // y keeps its keyframes (the hang at the top of the arc is intentional);
    // rotation is ONE segment with its own curve — per-segment easing would
    // stall the backspin at every keyframe boundary.
    y: [0, -18, -20, -4, 0],
    rotate: [0, -360],
    transition: {
      duration: 0.95,
      y: { ease: "easeInOut", times: [0, 0.32, 0.5, 0.85, 1] },
      rotate: { ease: [0.4, 0.12, 0.3, 1] },
    },
  },
};

const BasketballShotIcon = forwardRef<IconHandle, IconProps>(
  function BasketballShotIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BALL} variants={reduced ? undefined : shot} style={CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 5. ROLL ─────────────────────────────────────────────────────────────────
   Rolls away and back along the floor, rotation matched to travel so the
   seams grip the ground instead of sliding (x = rθ: 14 units ≈ 8° on r104). */
const roll: Variants = {
  normal: { x: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -14, 10, -4, 0],
    rotate: [0, -8, 5.5, -2, 0],
    transition: { duration: 1.0, ease: "easeInOut", times: [0, 0.28, 0.56, 0.8, 1] },
  },
};

const BasketballRollIcon = forwardRef<IconHandle, IconProps>(
  function BasketballRollIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {/* CENTER, not FLOOR: a rolling ball rotates about its own center
              while translating. A floor pivot adds lateral drift on top of the
              x-travel and pushes the ball out of the viewBox. */}
          <motion.path d={BALL} variants={reduced ? undefined : roll} style={CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 6. SPLAT (from basketball.mp4) ──────────────────────────────────────────
   The video's motion, frame-studied: a slight lean of anticipation, then the
   ball squashes down HARD — seams crumpling toward the floor — springs back up
   through a tall stretch, and settles with a decaying seam-sway. The seams are
   negative space in the compound path (they can't crumple independently), so
   the crumple reads through the deep floor-pivot squash and the sway through a
   rotate wobble about the center — two nested groups, each on its own pivot.
   Bounds: scaleX 1.18 keeps edges at x 5.3/250.7; scaleY 1.08 about the floor
   puts the top at 7.4 — all inside the 0..256 box. */
const SPLAT_DUR = 1.15;
const splatSquash: Variants = {
  normal: { x: 0, scaleY: 1, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -3, 0, 0, 0, 0, 0],
    scaleY: [1, 0.98, 0.72, 1.08, 0.95, 1.02, 1],
    scaleX: [1, 1.01, 1.18, 0.94, 1.04, 0.99, 1],
    transition: { duration: SPLAT_DUR, ease: "easeInOut", times: [0, 0.13, 0.3, 0.5, 0.68, 0.85, 1] },
  },
};
const splatSway: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // The seams settling after the recovery — still through the squash, then a
    // decaying wobble once the ball is round again.
    rotate: [0, 0, 3.5, -2.5, 1, 0],
    transition: { duration: SPLAT_DUR, ease: "easeInOut", times: [0, 0.42, 0.58, 0.74, 0.88, 1] },
  },
};

const BasketballSplatIcon = forwardRef<IconHandle, IconProps>(
  function BasketballSplatIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : splatSquash} style={FLOOR}>
            <motion.g variants={reduced ? undefined : splatSway} style={CENTER}>
              <path d={BALL} />
            </motion.g>
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 7. SPIN + BOUNCE (from basketball.mp4, frame-studied) ───────────────────
   The video layers two synchronized motions plus a flourish:
     bounce — pure deformation: tall stretch at 0.16s (wind-up), wide squash at
              0.44s (contact), counter-stretch recovery, breathing settle.
     spin   — the seams travel once around the sphere, launching after the
              wind-up and crossing the equator EXACTLY at max squash.
     whips  — elastic seam-tails lash around the outside of the ball during the
              fast part of the spin, trailing behind and fading as it drains.
   The ball's spin nests INSIDE the deformation (mid-spin seams pass through
   squashed space and bow — the video's "waffle" moment). The whip-tails are
   NEW INK: two arc streaks at r114 orbiting with a rotation that lags the
   ball (elastic trail), visible only mid-spin, gone at rest.
   Bounds: ball — scaleY 1.08 about y232 → top 7.4; scaleX 1.12 → x 11.5/244.5.
   Streaks sit OUTSIDE the squash group on purpose: squashed, their r120 outer
   edge would cross x=0; undeformed they orbit at 8..248. All inside the box. */
const SB_DUR = 1.25;
const sbBounce: Variants = {
  normal: { scaleY: 1, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1.08, 1, 0.85, 1.04, 0.98, 1],
    scaleX: [1, 0.94, 1, 1.12, 0.97, 1.01, 1],
    transition: { duration: SB_DUR, ease: "easeInOut", times: [0, 0.14, 0.3, 0.44, 0.62, 0.8, 1] },
  },
};
const sbSpin: Variants = {
  normal: { rotate: 0, transition: { duration: 0 } },
  animate: {
    // ONE segment, one bezier — multiple keyframes would apply the easing per
    // segment and halt the rotation at every boundary (visible stutter). The
    // curve itself does the sync: slow launch out of the wind-up, fastest
    // through the middle (≈180° lands near the squash at t≈0.44), long drain.
    rotate: [0, 360],
    transition: { duration: SB_DUR, ease: [0.55, 0.08, 0.25, 1] },
  },
};
/* Trail frame: same single-segment rule, on a lazier curve — it falls behind
   the ball through the fast phase (the elastic tails trailing the spin) and
   converges by the end. */
const sbTrail: Variants = {
  normal: { rotate: 0, transition: { duration: 0 } },
  animate: {
    rotate: [0, 360],
    transition: { duration: SB_DUR, ease: [0.72, 0.05, 0.22, 1] },
  },
};
const sbStreak: Variants = {
  normal: { opacity: 0, pathLength: 0.3, transition: { duration: 0 } },
  animate: {
    // Whips exist only while the spin is fast: grow in, stretch long, snap out.
    opacity: [0, 0, 1, 1, 0.6, 0],
    pathLength: [0.15, 0.15, 1, 1, 0.4, 0.15],
    transition: { duration: SB_DUR, ease: "easeInOut", times: [0, 0.18, 0.32, 0.55, 0.72, 0.85] },
  },
};
// Arcs of the r114 circle about (128,128): lower-left 100°→150°, upper-right
// 280°→330° (θ increasing = clockwise in y-down coords, hence sweep=1).
const STREAK_A = "M108.2,240.3 A114,114 0 0 1 29.3,185";
const STREAK_B = "M147.8,15.7 A114,114 0 0 1 226.7,71";

const BasketballSpinBounceIcon = forwardRef<IconHandle, IconProps>(
  function BasketballSpinBounceIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : sbBounce} style={FLOOR}>
            <motion.g variants={reduced ? undefined : sbSpin} style={CENTER}>
              <path d={BALL} />
            </motion.g>
          </motion.g>
          {!reduced && (
            <motion.g variants={sbTrail} style={CENTER}>
              <motion.path d={STREAK_A} variants={sbStreak} fill="none" stroke="currentColor" strokeWidth={12} strokeLinecap="round" />
              <motion.path d={STREAK_B} variants={sbStreak} fill="none" stroke="currentColor" strokeWidth={12} strokeLinecap="round" />
            </motion.g>
          )}
        </Svg>
      </div>
    );
  },
);

/* ── 8. WHIP (from basketball.mp4 — the 3D seam-tails, circled frames) ───────
   Same synchronized motion as SPIN + BOUNCE, but the tails are drawn the way
   the video draws them: as SEAM CONTINUATIONS, not orbit arcs. Each starts
   INSIDE the ball hugging a latitude curve, crosses the rim, and flicks off
   tangentially with the tip bowing the opposite way — that S-curve against the
   sphere's curvature is what makes it read as 3D. Placed at the video's two
   positions (right of the equator, lower-right); the lagging trail group
   sweeps them around the ball. pathLength draws inner→tip, so each whip grows
   off the surface in the direction of travel and retracts as the spin drains.
   Bounds: tips reach r≈110–115 (+6 stroke ≈ 121) → rotating extremes 7..249,
   inside the box; the tails sit outside the squash group like v7's streaks. */
const WHIP_A = "M136,148 C176,164 206,160 238,130";
const WHIP_B = "M112,204 C156,220 196,216 224,192";

const BasketballWhipIcon = forwardRef<IconHandle, IconProps>(
  function BasketballWhipIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : sbBounce} style={FLOOR}>
            <motion.g variants={reduced ? undefined : sbSpin} style={CENTER}>
              <path d={BALL} />
            </motion.g>
          </motion.g>
          {!reduced && (
            <motion.g variants={sbTrail} style={CENTER}>
              <motion.path d={WHIP_A} variants={sbStreak} fill="none" stroke="currentColor" strokeWidth={12} strokeLinecap="round" />
              <motion.path d={WHIP_B} variants={sbStreak} fill="none" stroke="currentColor" strokeWidth={12} strokeLinecap="round" />
            </motion.g>
          )}
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BasketballBounceIcon }[] = [
  { name: "Bounce", blurb: "One real dribble — hard squash, decaying pop-up", Component: BasketballBounceIcon },
  { name: "Dribble", blurb: "Two quick low taps, light squash on each contact", Component: BasketballDribbleIcon },
  { name: "Spin", blurb: "Fingertip spin — a full turn, seams do the talking", Component: BasketballSpinIcon },
  { name: "Shot", blurb: "Jump shot — rises with backspin, hangs, drops home", Component: BasketballShotIcon },
  { name: "Roll", blurb: "Rolls away and back, rotation matched to travel", Component: BasketballRollIcon },
  { name: "Splat", blurb: "Hard squash, tall recovery, seams sway to rest (basketball.mp4)", Component: BasketballSplatIcon },
  { name: "Spin + Bounce", blurb: "Full turn through the squash, whip-tails lash & fade (basketball.mp4)", Component: BasketballSpinBounceIcon },
  { name: "Whip", blurb: "Seam-tails wrap the sphere and flick off — the 3D read (basketball.mp4)", Component: BasketballWhipIcon },
];

export default function BasketballLabPage() {
  return <VariantGrid title="Basketball" variants={VARIANTS} cycleMs={2800} playMs={1500} />;
}
