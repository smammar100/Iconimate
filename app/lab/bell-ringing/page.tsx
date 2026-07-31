"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Bell Ringing, 5 candidates.
 *
 * All five are built on the RING motion now shipping in registry/icons/bell.tsx — shell
 * rocks about the crown, clapper trails it and travels the full width of its housing — and
 * differ in what the glyph's two sound arcs do on top. That keeps the family coherent: the
 * ringing bell should read as the same bell, louder.
 *
 * THE SPLIT IS THE SAME TRAP AS THE PLAIN BELL, AND IT SPRINGS THE SAME WAY.
 * The source draws the clapper as NEGATIVE SPACE: the collar's dip (r=40, x88.8..167.2) and
 * the clapper's tongue (r=24, x105.38..150.62) are CONCENTRIC about (128,192) — measured at
 * 192.04 and 191.98 — leaving a wall of exactly 40-24 = 16 units, the icon's stroke weight.
 * Under nonzero the two cancel, so filling the tongue on its own produces a solid blob and
 * masking it out survives rest but not motion. So the dip comes OUT of the shell and the
 * clapper is its own outline: an annular segment whose white middle is its own hollowness.
 * Verified — ARC_R + ARC_L + SHELL + CLAPPER against the source is 51 differing pixels at a
 * max alpha gap of 63, which is antialiasing where fills abut, not geometry.
 *
 * EVERY NUMBER IS MEASURED OFF THE PATH.
 *   · shell spans x32..224 y32..200; the largest rotation about its crown (128,32) that
 *     keeps every sampled point on the artboard is 12.90°, so the shells swing 12°;
 *   · the clapper has 16.58 units of clearance to the wall, so it travels 16. It TRANSLATES
 *     rather than rotates: it and the collar are concentric, so turning it about their
 *     shared centre only slides it along a wall it is already parallel to;
 *   · the arcs span x27.7..228.3 y16..72 and scale about the dome centre (128,112); the cap
 *     before they leave the box is 1.165, so they peak at 1.14.
 *
 * ONE DIFFERENCE FROM THE PLAIN BELL WORTH NOTING. There, the sound arcs were ink I added,
 * so they rested at opacity 0. Here they are PART OF THE SOURCE GLYPH, so they must rest at
 * scale 1 and opacity 1 — the rest state is the untouched icon, arcs included.
 */
const ARC_R =
  "M224,71.1a8,8,0,0,1-10.78-3.42,94.13,94.13,0,0,0-33.46-36.91,8,8,0,1,1,8.54-13.54,111.46,111.46,0,0,1,39.12,43.09A8,8,0,0,1,224,71.1Z";
const ARC_L =
  "M35.71,72a8,8,0,0,0,7.1-4.32A94.13,94.13,0,0,1,76.27,30.77a8,8,0,1,0-8.54-13.54A111.46,111.46,0,0,0,28.61,60.32,8,8,0,0,0,35.71,72Z";
/** Body with the collar's dip removed (it belongs to the clapper) + the dome's interior. */
const SHELL =
  "M221.81,175.94A16,16,0,0,1,208,200H48a16,16,0,0,1-13.79-24.06C43.22,160.39,48,138.28,48,112a80,80,0,0,1,160,0C208,138.27,212.78,160.38,221.81,175.94Z" +
  "M208,184c-10.64-18.27-16-42.49-16-72a64,64,0,0,0-128,0c0,29.52-5.38,53.74-16,72Z";
/** The clapper as a real outline: the annulus between the r=40 dip and the r=24 tongue. */
const CLAPPER = "M167.2,200a40,40,0,0,1-78.4,0L105.38,200a24,24,0,0,0,45.24,0Z";

const CROWN = AT(128, 32); // where the bell hangs
const DOME = AT(128, 112); // the arcs are concentric here — the emitter

const SWING = 12; // inside the measured 12.90° cap
const TRAVEL = 16; // inside the measured 16.58 clearance
const LOUD = 1.14; // inside the measured 1.165 scale cap

/* ── The RING spine, shared by all five ─────────────────────────────────────
   Shell rocks, clapper trails by ~0.04 of the timeline and swings the full width
   of its housing. Same keyframes as the shipped bell, so a winner here stays a
   sibling of that icon rather than a second, unrelated gesture. */
const ringShell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -11, SWING, -9.5, 7.4, -2.5, 0],
    transition: { duration: 0.85, times: [0, 0.2, 0.44, 0.64, 0.8, 0.92, 1], ease: "easeInOut" },
  },
};
const ringClapper: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -TRAVEL, TRAVEL, -13, 9, -3.5, 0],
    transition: { duration: 0.85, times: [0, 0.24, 0.48, 0.68, 0.84, 0.94, 1], ease: "easeInOut" },
  },
};

/* ── 1 · RING — the arcs hold still and the bell does the work. The baseline. */
const arcsHold: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { scale: 1, opacity: 1 },
};

/* ── 2 · PEAL — the arcs swell on every strike, so the sound is tied to the hits
   rather than running on its own clock. Peaks sit on the shell's extremes. */
const arcsPeal: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, LOUD, 1, 1.09, 1, 1.04, 1],
    opacity: [1, 0.75, 1, 0.82, 1, 0.92, 1],
    transition: { duration: 0.85, times: [0, 0.2, 0.32, 0.44, 0.58, 0.8, 1], ease: "easeOut" },
  },
};

/* ── 3 · ALTERNATING — sound leaves the side the bell is swinging TOWARD, so the
   two arcs fire in turn instead of together. The most legible of the five at
   small size, because only one thing brightens at a time. */
const arcLeadLeft: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, LOUD, 1, 1, 1],
    opacity: [1, 1, 0.55, 0.9, 1],
    transition: { duration: 0.85, times: [0, 0.2, 0.42, 0.66, 1], ease: "easeOut" },
  },
};
const arcLeadRight: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1, LOUD, 1, 1],
    opacity: [1, 0.55, 1, 0.9, 1],
    transition: { duration: 0.85, times: [0, 0.22, 0.44, 0.68, 1], ease: "easeOut" },
  },
};

/* ── 4 · EMIT — the arcs travel outward from the dome centre and fade back twice,
   like two wavefronts leaving. They are concentric on (128,112), so scaling about
   that point moves them along their own radius rather than merely enlarging them. */
const arcsEmit: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, LOUD, 1, LOUD, 1],
    opacity: [1, 0.25, 1, 0.35, 1],
    transition: { duration: 0.85, times: [0, 0.22, 0.44, 0.66, 1], ease: "easeInOut" },
  },
};

/* ── 5 · WIND & RING — the bell is drawn back and HELD (20%..34%, a real beat, so
   the pull reads as deliberate), then released into its biggest swing, and the
   arcs burst once on the release rather than pulsing throughout. */
const windShell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 6.4, 6.4, -SWING, 8.4, -3, 0],
    transition: {
      duration: 0.95,
      times: [0, 0.2, 0.34, 0.52, 0.72, 0.88, 1],
      ease: ["easeOut", "linear", "easeIn", "easeOut", "easeOut", "easeOut"],
    },
  },
};
const windClapper: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    // hangs against the high side through the hold, then overtakes on release
    x: [0, 7, 7, -TRAVEL, 11, -4, 0],
    transition: {
      duration: 0.95,
      times: [0, 0.2, 0.34, 0.56, 0.76, 0.9, 1],
      ease: ["easeOut", "linear", "easeIn", "easeOut", "easeOut", "easeOut"],
    },
  },
};
const arcsBurst: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    // flat through the wind-up, one burst on the release, then settle
    scale: [1, 1, LOUD, 1.05, 1],
    opacity: [1, 0.6, 1, 0.95, 1],
    transition: { duration: 0.95, times: [0, 0.34, 0.54, 0.74, 1], ease: "easeOut" },
  },
};

/* ── Renderer ────────────────────────────────────────────────────────────── */

type Cfg = {
  shell: Variants;
  clapper: Variants;
  /** Applied to both arcs together. */
  arcs?: Variants;
  /** Or per-side, for the alternating candidate. */
  arcL?: Variants;
  arcR?: Variants;
};

function makeBellRinging({ shell, clapper, arcs, arcL, arcR }: Cfg) {
  return forwardRef<IconHandle, IconProps>(function LabBellRinging(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    const split = Boolean(arcL && arcR);

    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {/* The arcs are part of the glyph and sit OUTSIDE the shell group: sound does not
              swing with the thing emitting it, and a fixed reference is what makes the
              shell's rock readable. */}
          {split ? (
            <>
              <motion.path d={ARC_L} variants={reduced ? undefined : arcL} style={DOME} />
              <motion.path d={ARC_R} variants={reduced ? undefined : arcR} style={DOME} />
            </>
          ) : (
            <motion.g variants={reduced ? undefined : arcs} style={DOME}>
              <path d={ARC_L} />
              <path d={ARC_R} />
            </motion.g>
          )}

          <motion.g variants={reduced ? undefined : shell} style={CROWN}>
            <path d={SHELL} />
            {/* Its own outline, so it stays an outline wherever it travels. */}
            <motion.path d={CLAPPER} variants={reduced ? undefined : clapper} />
          </motion.g>
        </Svg>
      </div>
    );
  });
}

const Ring = makeBellRinging({ shell: ringShell, clapper: ringClapper, arcs: arcsHold });
const Peal = makeBellRinging({ shell: ringShell, clapper: ringClapper, arcs: arcsPeal });
const Alternating = makeBellRinging({
  shell: ringShell,
  clapper: ringClapper,
  arcL: arcLeadLeft,
  arcR: arcLeadRight,
});
const Emit = makeBellRinging({ shell: ringShell, clapper: ringClapper, arcs: arcsEmit });
const WindAndRing = makeBellRinging({
  shell: windShell,
  clapper: windClapper,
  arcs: arcsBurst,
});

export default function BellRingingLab() {
  return (
    <VariantGrid
      title="Bell Ringing"
      cycleMs={2600}
      playMs={1500}
      variants={[
        {
          name: "1 · Ring",
          blurb: "The shipped bell motion; the arcs hold still",
          Component: Ring,
        },
        {
          name: "2 · Peal",
          blurb: "Arcs swell on every strike, tied to the hits",
          Component: Peal,
        },
        {
          name: "3 · Alternating",
          blurb: "Sound leaves the side the bell swings toward",
          Component: Alternating,
        },
        {
          name: "4 · Emit",
          blurb: "Two wavefronts travel out along their own radius",
          Component: Emit,
        },
        {
          name: "5 · Wind & ring",
          blurb: "Drawn back, held, released — arcs burst on release",
          Component: WindAndRing,
        },
      ]}
    />
  );
}
