"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Heart, eight takes. 1-5 are original, 6 is from the supplied reference
 * clip, and 7-8 are compositions (7 = 4 + 2, 8 = 7 + 6).
 *
 * NOTE: the registry already ships a `heart`, and it is a DIFFERENT GLYPH — a
 * hand-simplified centreline heart (`M128 216C112 204 40 160...`) rendered as an
 * 18-wide stroke, running a double-thump beat. This lab is built against the real
 * Phosphor outline instead, so promoting anything here REPLACES that icon rather
 * than adding beside it — and it also closes a rest-state fidelity gap, because
 * the shipped stroke is an approximation of the Phosphor mark, not the mark.
 *
 * THE GLYPH IS A RING, which is the whole opportunity — the same structure the
 * star lab exploits. One compound path: a solid heart silhouette with a smaller
 * heart punched out. A heart that FILLS IN is the single most useful thing this
 * mark can do (every like button in the world), and the silhouette is already
 * sitting there as the path's first subpath, needing no reconstruction.
 *
 * THE FILL IS THAT SILHOUETTE, PAINTED OVER THE RING (see `SOLID`). Filling by
 * dropping the counter back into its hole is the obvious alternative and it is
 * what produced the hairline the star lab hit twice: two adjacent shapes sharing
 * a boundary give two antialiased edges that do not sum to 1 in any renderer, so
 * a pale thread shows along the join. `SOLID` wholly contains the ring, so the
 * filled state has one edge and nothing to seam.
 *
 * GEOMETRY, measured off the path:
 *   ink bbox   x16..240, y40..231 — the mark TOUCHES BOTH SIDE WALLS at its
 *              equator (y~102), so there is no lateral lane. Anything radiating
 *              sideways leaves the artboard.
 *   hollow     the counter is the only free interior: ~x32..224 at y102,
 *              tapering to ~x70..186 by y160. That is where the ECG trace fits.
 *   centre     (128, 132) — bbox centre is y135.5, nudged up because a heart's
 *              visual mass sits in the lobes.
 *
 * CONSEQUENCE OF NO LATERAL LANE: every pop here is kept to ~1.08 rather than the
 * 1.14-1.18 the star can afford, and `3 · Echo` deliberately overflows the
 * viewBox. The lab `Svg` sets overflow:visible so that reads correctly here, but
 * the SHIPPED heart wraps its svg in `overflow: hidden` — so Echo needs that
 * wrapper opened up (or a negative-margin box, the `bicycle` trick) before it can
 * be promoted. Flagging rather than silently designing something that clips.
 */

/** The Phosphor mark: silhouette + counter, as authored. Rest is exactly this. */
const HEART =
  "M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40ZM128,214.8C109.74,204.16,32,155.69,32,102A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,155.61,146.24,204.15,128,214.8Z";

/** The mark's FIRST SUBPATH alone — the hole simply absent. One path, one edge. */
const SOLID =
  "M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40Z";

const CX = 128;
const CY = 132;

/* ══ 1. FILL ═════════════════════════════════════════════════════════════════
   Outline becomes solid. The ring dips, pops, and the fill SNAPS ON at the top of
   that pop, so the energy of the toggle is carried by the ring and the fill only
   confirms it.

   THE FILL NEVER GROWS. A partly-grown fill is a smaller heart floating inside
   the ring with a gap all the way round — it reads as a detached blob, and every
   intermediate frame has it. Fading a full-size fill in is the same flaw milder:
   a half-opaque fill is grey, which is not what a filled heart looks like. So the
   fill is always full size and its opacity steps over ~80ms; there is no
   intermediate state to get wrong. */
const fill: Variants = {
  normal: { opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 0, 1, 1, 0, 0],
    transition: { duration: 1.05, times: [0, 0.28, 0.36, 0.74, 0.84, 1], ease: "linear" },
  },
};
const fillBody: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.95, 1.07, 1, 1],
    transition: {
      duration: 1.05,
      times: [0, 0.22, 0.42, 0.6, 1],
      ease: ["easeIn", "easeOut", "easeInOut", "linear"],
    },
  },
};

/* ══ 2. THUMP ════════════════════════════════════════════════════════════════
   Lub-dub. A real heartbeat is TWO beats of unequal strength separated by a short
   gap, then a long pause — not an even pulse, which is what most "beating heart"
   icons animate and why they read as a throb rather than a heart.

   The systolic beat peaks at 1.16 and the diastolic echo at 1.09, roughly 0.6 of
   it, with the gap between them (0.28 -> 0.52) shorter than the rest that follows
   (0.66 -> 1). That ratio is the whole character; even it out and the mark starts
   pulsing like a notification badge.

   The dip to 0.95 first is anticipation — it is what makes the beat read as
   something the heart DOES rather than something applied to it. */
const thump: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.95, 1.16, 1.01, 1.09, 1],
    transition: {
      duration: 0.92,
      times: [0, 0.1, 0.28, 0.52, 0.66, 1],
      ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeInOut"],
    },
  },
};

/* ══ 3. ECHO ═════════════════════════════════════════════════════════════════
   The beat throws off a shockwave. A ghost copy of the silhouette scales out from
   the centre and fades — secondary action, the visual of a pulse leaving the body.

   THE GHOST IS THE SILHOUETTE, NOT THE RING. A ring expanding outward reads as a
   second heart chasing the first, because you can see its hole. A solid shape at
   low opacity reads as pressure. It also starts at scale 1 exactly, so the wave
   appears to separate FROM the mark rather than materialise around it.

   This is the one that leaves the artboard: the mark already touches x16 and x240,
   so a ghost at 1.5 reaches x~40 outside the box on each side. Intentional, and
   the reason the promotion note above exists. */
const echoBody: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.95, 1.14, 1, 1],
    transition: {
      duration: 1.1,
      times: [0, 0.12, 0.3, 0.52, 1],
      ease: ["easeIn", "easeOut", "easeInOut", "linear"],
    },
  },
};
const echoWave: Variants = {
  normal: { scale: 1, opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1, 1.5],
    opacity: [0, 0.3, 0],
    // Out fast then coast: a wave that decelerates reads as expanding gas, one
    // that starts fast and thins out reads as a pulse.
    transition: { duration: 1.1, times: [0, 0.3, 0.85], ease: ["linear", "easeOut"] },
  },
};

/* ══ 4. RISE ═════════════════════════════════════════════════════════════════
   The heart FILLS UP, bottom to top, like a vessel — then pops when it tops out.
   Of the five this is the only one that shows a partial state on purpose, and it
   works precisely because the boundary is horizontal: a level reads as a level,
   where `1 · Fill`'s partial state read as a smaller heart.

   THE CLIP IS A TRANSLATED FULL-BLEED RECT, not a rect whose height animates.
   Height would interpolate an attribute; translating a box that already covers the
   artboard is cheaper and exact at both ends. y231 puts its top edge on the point
   of the heart (nothing revealed); y30 clears the top of the lobes (all revealed).

   The pop lands at 0.66, just after the level tops out at 0.6 — the fill arriving
   is what causes the pop, so it has to come second or the two read as unrelated. */
const riseLevel: Variants = {
  normal: { y: 231, transition: RETURN_TRANSITION },
  animate: {
    y: [231, 30, 30, 231],
    transition: { duration: 1.4, times: [0, 0.6, 0.82, 1], ease: ["easeInOut", "linear", "easeIn"] },
  },
};
const riseBody: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1, 1.09, 1, 1],
    transition: {
      duration: 1.4,
      times: [0, 0.58, 0.66, 0.8, 1],
      ease: ["linear", "easeOut", "easeInOut", "linear"],
    },
  },
};

/* ══ 5. ECG ══════════════════════════════════════════════════════════════════
   A cardiac trace draws across the hollow, and the heart thumps ON THE SPIKE.

   THE TRACE LIVES IN THE COUNTER, which is the only free space this mark has (see
   the geometry note). It runs y132, the widest line through the hollow, from x60
   to x196 — inside the ~x32..224 the counter offers there, with margin for the
   14-wide stroke's round caps.

   THE BEAT IS TIMED TO THE R-SPIKE, not to the start of the draw. The trace
   reaches the tall peak at ~0.42 of its sweep and the scale peaks at 0.46. That
   single coincidence is what makes the line read as MEASURING the heart instead of
   decorating it; slide them apart and it becomes two animations sharing a tile.

   The trace draws, holds a beat, then fades in place rather than retracting —
   retracting reads as an undo, and an ECG does not run backwards. */
const ECG = "M60,132 H96 L110,104 L124,164 L138,116 L150,132 H196";
const ecgTrace: Variants = {
  normal: { pathLength: 0, opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1, 1, 1],
    opacity: [1, 1, 1, 0],
    transition: {
      duration: 1.5,
      times: [0, 0.62, 0.82, 1],
      ease: ["easeInOut", "linear", "linear"],
    },
  },
};
const ecgBody: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1, 1.13, 1.0, 1.05, 1],
    transition: {
      duration: 1.5,
      times: [0, 0.38, 0.46, 0.58, 0.66, 0.86],
      ease: ["linear", "easeOut", "easeIn", "easeOut", "easeInOut"],
    },
  },
};

/* ══ 6. EMIT ═════════════════════════════════════════════════════════════════
   From the reference clip: the mark holds still and SMALL HEARTS BUBBLE OFF IT,
   rising and drifting outward as they fade. Three of them, staggered, on
   diverging arcs — bottom-left up the left flank, lower-right up the right, then
   one off the top-right lobe.

   THE SATELLITES ARE SOLID, NOT RINGS, and that is a legibility decision rather
   than a stylistic one. The reference is a stroked heart whose satellites keep the
   parent's stroke weight, which a stroke-based mark gets for free. Ours is a
   filled ring, so a scaled copy scales its outline too: at the 0.20 these sit at,
   the ring wall lands around 1.4 units — under half a pixel once a 24px icon is
   rasterised. It would render as grey mush or drop out entirely. A solid mini
   heart holds its shape all the way down, which is the whole point of a satellite.

   THEY DRIFT, THEY DO NOT FLY. Velocity here would read as a burst — that is
   `3 · Echo`'s job. These ease out and slow as they fade, which is what makes them
   read as buoyant.

   NOT LOOPED. The clip is a 2s loop, but a registry icon plays once per hover and
   `useHover` owns the replay; a `repeat: Infinity` here would also have to be
   gated on `ambient` per the house rule. One pass, and the hook decides.

   OVERFLOW: same caveat as Echo. The mark touches x16 and x240 already, so every
   satellite lives outside the artboard for most of its life. Fine in the lab
   (`Svg` sets overflow:visible); needs the shipped wrapper's `overflow: hidden`
   opened before promotion. */
/**
 * All three are born at the SAME POINT — the centre of the hollow, (128, 128) —
 * and diverge from there. Spawning them around the perimeter (the first cut of
 * this) read as hearts drifting past the mark; born from the counter and growing
 * out through the ring, they read as coming FROM the heart, which is the whole
 * idea. The counter is the only interior space available for it: ~x32..224 at
 * y102, so a 0.2-scale satellite sits comfortably inside at birth.
 *
 * Divergence is deliberately uneven — up-left, up-right, and one straight up
 * through the notch between the lobes. Three evenly-spaced directions read as a
 * mechanical fan; uneven ones read as drift.
 */
const HOLLOW_X = 128;
const HOLLOW_Y = 128;
const SATELLITES = [
  // scale, drift from the hollow centre, and the stagger delay in SECONDS.
  { s: 0.2, dx: -62, dy: -78, at: 0 },
  { s: 0.16, dx: 68, dy: -62, at: 0.26 },
  { s: 0.13, dx: 6, dy: -104, at: 0.5 },
] as const;

/** Stagger is a `delay`, not shifted keyframe times.
 *
 *  Offsetting times inside one shared tween is the obvious way to stagger and it
 *  is wrong here: the offsets have to be clamped into 0..1, which collapses the
 *  first satellite's leading pair to [0, 0] and the last one's trailing pair to
 *  [1, 1]. Motion needs strictly ascending times and silently drops the tween when
 *  they are not — satellites 2 and 3 never appeared at all, and 1 drifted 2 units
 *  instead of 86. Each satellite now owns a plain 1.05s tween and is simply
 *  started late. */
const SAT_DURATION = 1.05;
function satellite(delay: number): Variants {
  return {
    normal: { opacity: 0, scale: 0.5, transition: RETURN_TRANSITION },
    animate: {
      opacity: [0, 0.95, 0.95, 0],
      scale: [0.5, 1, 1, 0.92],
      transition: { duration: SAT_DURATION, delay, times: [0, 0.28, 0.62, 1], ease: "easeOut" },
    },
  };
}
/** Drift is its own tween so it runs the full life on one long ease-out while
 *  opacity does its in/out — one shared keyframe array would force the drift to
 *  stall wherever the fade holds. */
function satelliteDrift(delay: number, dx: number, dy: number): Variants {
  return {
    normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
    animate: {
      x: dx,
      y: dy,
      transition: { duration: SAT_DURATION, delay, ease: "easeOut" },
    },
  };
}
/** The parent barely moves — the clip's heart is static. A 1.03 swell on the
 *  first emission is enough to make the satellites read as CAUSED by it rather
 *  than as decoration floating past. */
const emitBody: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.03, 1, 1.02, 1],
    transition: { duration: 1.55, times: [0, 0.1, 0.32, 0.55, 1], ease: "easeInOut" },
  },
};

/* ══ 7. CHARGE — 4 + 2 ═══════════════════════════════════════════════════════
   `4 · Rise` fills the heart; `2 · Thump` makes it beat. Run in that order they
   become cause and effect: the mark charges, and the instant it tops out it comes
   alive with the lub-dub. Fill, then life.

   THE ORDER IS THE WHOLE POINT, AND SO IS THE OVERLAP. The anticipation dip lands
   at 0.411 and the level tops out at 0.42 — the heart is already winding up on the
   last few frames of the fill, so the first beat reads as CAUSED by the fill
   completing. Put the dip after the fill and the two read as a sequence of two
   animations; put the beat during the fill and the level stops being legible.

   THE BEAT IS 2's KEYFRAMES UNCHANGED, remapped from its own 0.92s onto the
   0.36..0.87 slice of this 1.8s pass (0.92 / 1.8 = 0.511 of the span). Retiming
   the ratios rather than reusing them would lose the unequal lub-dub that makes 2
   read as a heartbeat instead of a throb.

   IT DRAINS RATHER THAN FADING. Dropping the level back down is 4's own exit and
   it keeps the boundary horizontal to the end; fading a full fill out would put
   the mark through the grey half-opaque state that `1 · Fill` exists to avoid. */
const chargeLevel: Variants = {
  normal: { y: 231, transition: RETURN_TRANSITION },
  animate: {
    y: [231, 30, 30, 231],
    transition: { duration: 1.8, times: [0, 0.42, 0.8, 1], ease: ["easeInOut", "linear", "easeIn"] },
  },
};
const chargeBody: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1, 0.95, 1.16, 1.01, 1.09, 1, 1],
    transition: {
      duration: 1.8,
      times: [0, 0.36, 0.411, 0.503, 0.626, 0.697, 0.871, 1],
      ease: ["linear", "easeIn", "easeOut", "easeIn", "easeOut", "easeInOut", "linear"],
    },
  },
};

/* ══ 8. GIVE — 7 + 6 ═════════════════════════════════════════════════════════
   The whole arc: the heart CHARGES (7's rising fill), BEATS (2's lub-dub, carried
   through 7), and then GIVES (6's satellites leaving the hollow). Fill, life,
   release.

   THE DRAIN IS LOAD-BEARING, NOT AN EXIT. Stacking 6 straight onto 7 does not
   work, and the reason is colour: 6's satellites are born at the centre of the
   hollow, but at the end of 7 the heart is SOLID — same fill, so a satellite
   inside it is invisible. It would have to clear the silhouette to be seen, and
   the silhouette reaches ~142 units from centre along the diagonals while the
   satellites only travel 62-104. They would never appear at all.
   So the fill drains ON the beat rather than after it, and the satellites are
   released into the hollow it reopens. That turns a rendering problem into the
   actual story: the heart spends what it charged.

   TIMING: fill 0..0.26, beat 0.22..0.6 (2's ratios again, remapped), drain
   0.38..0.52, satellites from 1.2s — after the hollow is back, so every one of
   them is visible for its whole life. The beat overlaps both the fill topping out
   and the drain starting, which is what keeps three phases reading as one gesture
   instead of a queue. */
const giveLevel: Variants = {
  normal: { y: 231, transition: RETURN_TRANSITION },
  animate: {
    y: [231, 30, 30, 231, 231],
    transition: {
      duration: 2.4,
      times: [0, 0.26, 0.38, 0.52, 1],
      ease: ["easeInOut", "linear", "easeIn", "linear"],
    },
  },
};
const giveBody: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1, 0.95, 1.16, 1.01, 1.09, 1, 1],
    transition: {
      duration: 2.4,
      times: [0, 0.22, 0.258, 0.326, 0.418, 0.471, 0.6, 1],
      ease: ["linear", "easeIn", "easeOut", "easeIn", "easeOut", "easeInOut", "linear"],
    },
  },
};
/** Satellites start once the drain has finished, so they are never painted the
 *  same colour as the ground they sit on. Seconds, matching `satellite()`. */
const GIVE_RELEASE = 1.2;

/* ── variants ────────────────────────────────────────────────────────────── */

const FillIcon = forwardRef<IconHandle, IconProps>(function FillIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={fillBody} style={AT(CX, CY)}>
          <path d={HEART} />
          <motion.path d={SOLID} variants={fill} />
        </motion.g>
      </Svg>
    </div>
  );
});

const ThumpIcon = forwardRef<IconHandle, IconProps>(function ThumpIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={HEART} variants={thump} style={AT(CX, CY)} />
      </Svg>
    </div>
  );
});

const EchoIcon = forwardRef<IconHandle, IconProps>(function EchoIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        {/* Wave first so it paints behind the mark and never washes it out. */}
        <motion.path d={SOLID} variants={echoWave} style={AT(CX, CY)} />
        <motion.path d={HEART} variants={echoBody} style={AT(CX, CY)} />
      </Svg>
    </div>
  );
});

const RiseIcon = forwardRef<IconHandle, IconProps>(function RiseIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  // Every instance on the page needs its own clip id, or the first one on the DOM
  // captures all of them and only one tile animates.
  const clipId = `heart-rise-${useId()}`;
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <defs>
          <clipPath id={clipId}>
            <motion.rect x={-20} y={0} width={296} height={280} variants={riseLevel} />
          </clipPath>
        </defs>
        <motion.g variants={riseBody} style={AT(CX, CY)}>
          <path d={HEART} />
          <g clipPath={`url(#${clipId})`}>
            <path d={SOLID} />
          </g>
        </motion.g>
      </Svg>
    </div>
  );
});

const EcgIcon = forwardRef<IconHandle, IconProps>(function EcgIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={ecgBody} style={AT(CX, CY)}>
          <path d={HEART} />
          <motion.path
            d={ECG}
            variants={ecgTrace}
            fill="none"
            stroke="currentColor"
            strokeWidth={14}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>
      </Svg>
    </div>
  );
});

const EmitIcon = forwardRef<IconHandle, IconProps>(function EmitIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        {SATELLITES.map((s) => (
          // Drift on the outer g, fade/scale on the inner: two tweens, one origin.
          // Origin is the hollow centre so `scale` grows each satellite out of the
          // spawn point rather than out of its own drifted position.
          <motion.g key={`${s.dx},${s.dy}`} variants={satelliteDrift(s.at, s.dx, s.dy)}>
            <motion.g variants={satellite(s.at)} style={AT(HOLLOW_X, HOLLOW_Y)}>
              <g
                transform={`translate(${HOLLOW_X} ${HOLLOW_Y}) scale(${s.s}) translate(-128 -136)`}
              >
                <path d={SOLID} />
              </g>
            </motion.g>
          </motion.g>
        ))}
        {/* Mark last so the ring paints over a satellite still inside the hollow —
            it emerges from behind the outline instead of sitting on top of it. */}
        <motion.path d={HEART} variants={emitBody} style={AT(CX, CY)} />
      </Svg>
    </div>
  );
});

const ChargeIcon = forwardRef<IconHandle, IconProps>(function ChargeIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const clipId = `heart-charge-${useId()}`;
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <defs>
          <clipPath id={clipId}>
            <motion.rect x={-20} y={0} width={296} height={280} variants={chargeLevel} />
          </clipPath>
        </defs>
        {/* The clip sits inside the scaled group, so the level rides the beat with
            the mark instead of shearing against it. */}
        <motion.g variants={chargeBody} style={AT(CX, CY)}>
          <path d={HEART} />
          <g clipPath={`url(#${clipId})`}>
            <path d={SOLID} />
          </g>
        </motion.g>
      </Svg>
    </div>
  );
});

const GiveIcon = forwardRef<IconHandle, IconProps>(function GiveIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const clipId = `heart-give-${useId()}`;
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <defs>
          <clipPath id={clipId}>
            <motion.rect x={-20} y={0} width={296} height={280} variants={giveLevel} />
          </clipPath>
        </defs>
        {/* Satellites sit OUTSIDE the beating group: 6's drift is measured from a
            still hollow, and riding the 1.16 beat would scale their travel too. */}
        {SATELLITES.map((s) => (
          <motion.g
            key={`give-${s.dx},${s.dy}`}
            variants={satelliteDrift(GIVE_RELEASE + s.at, s.dx, s.dy)}
          >
            <motion.g variants={satellite(GIVE_RELEASE + s.at)} style={AT(HOLLOW_X, HOLLOW_Y)}>
              <g
                transform={`translate(${HOLLOW_X} ${HOLLOW_Y}) scale(${s.s}) translate(-128 -136)`}
              >
                <path d={SOLID} />
              </g>
            </motion.g>
          </motion.g>
        ))}
        <motion.g variants={giveBody} style={AT(CX, CY)}>
          <path d={HEART} />
          <g clipPath={`url(#${clipId})`}>
            <path d={SOLID} />
          </g>
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── assembly ────────────────────────────────────────────────────────────── */

function Static({
  size,
  style,
  bind,
  ...props
}: IconProps & { bind: ReturnType<typeof useHover>["bind"] }) {
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="currentColor"
      >
        <path d={HEART} />
      </svg>
    </div>
  );
}

const VARIANTS: LabVariant[] = [
  { name: "1 · Fill", blurb: "Outline snaps solid at the top of a pop", Component: FillIcon },
  { name: "2 · Thump", blurb: "Lub-dub — two beats of unequal strength", Component: ThumpIcon },
  { name: "3 · Echo", blurb: "Beat throws off a shockwave (overflows)", Component: EchoIcon },
  { name: "4 · Rise", blurb: "Fills bottom to top, pops when it tops out", Component: RiseIcon },
  { name: "5 · ECG", blurb: "Cardiac trace draws, heart beats on the spike", Component: EcgIcon },
  { name: "6 · Emit", blurb: "Small hearts bubble off and drift away", Component: EmitIcon },
  { name: "7 · Charge", blurb: "4 + 2 — fills up, then beats when it tops out", Component: ChargeIcon },
  { name: "8 · Give", blurb: "7 + 6 — charges, beats, releases hearts", Component: GiveIcon },
];

export default function HeartLabPage() {
  return <VariantGrid title="Heart" variants={VARIANTS} cycleMs={3200} playMs={2000} />;
}
