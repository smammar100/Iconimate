"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Transition, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, OVERSHOOT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Bell candidates on motion/react.
 *
 * The same five gestures as /lab/bell-css, ported to the library the registry actually
 * ships on, so a winner can be promoted without a rewrite. Each is the previous plus a
 * beat — tap → ring → broadcast → alert → grand peal — sharing one spine (same strike,
 * same pivots, same rest) so the comparison is about the layering, not five loose ideas.
 *
 * EVERY NUMBER IS READ OFF THE PATH.
 *
 * The collar's dip (`a40,40,0,0,0,78.38,0`) and the clapper's arcs (r=24) are CONCENTRIC
 * about (128,192) — measured, not assumed — leaving a wall of exactly 40-24 = 16 units,
 * which is Phosphor's stroke weight. From that:
 *
 *   · the clapper's true pivot is (128,192), NOT the collar line at y=200;
 *   · about that centre the dip spans 11.55°..168.45° and the clapper 19.50°..160.50°, so
 *     there is 7.95° of slack per side. STRIKE = 7.95°, the exact angle at which the
 *     clapper's edge meets the wall. Past it the clapper cuts through the outline.
 *   · the shell hangs from its crown (128,24) — the dome is r=80 about (128,104);
 *   · the glyph's box is x32..224, y24..232, and the largest rotation about the crown that
 *     keeps every sampled point on the artboard is 12.20°, so the shells swing 9°;
 *   · the badge sits at (212,44) r=16 — the only spot tried that clears the dome (by 7.2
 *     units) while staying in the box;
 *   · the sound arcs run at r=88 and r=100 about (128,112): the dome's edge at that y is
 *     x=48.4 (r≈79.6), so 88 clears the bell and 100 plus a 5-unit half-stroke stops at 23.
 *
 * The clapper sits inside the shell group, so its angle is measured RELATIVE to the shell —
 * the quantity that decides contact, and the double-pendulum relationship a real bell has,
 * for free.
 *
 * SPLITTING THIS GLYPH IS A TRAP, and the naive split is wrong twice over. Dome = subpaths
 * 1+3 with clapper = subpath 2 each FILLED adds 528px of ink (0.81% of the box), all in
 * y192..223: subpath 2 sits inside the collar dip lobe wound the other way, so under nonzero
 * they cancel and the clapper is negative space. Masking it fixes the rest state but not the
 * motion — slide the hole and the crescent goes lopsided, thickening into a blob. The answer
 * is to give the clapper its OWN outline and take the dip lobe out of the shell.
 *
 * There is no mask here at all: the white inside the clapper is its own hollowness.
 */
/**
 * SHELL — subpath 1 with the collar's dip lobe REMOVED (the collar now runs straight across
 * at y=200) plus subpath 3, the dome's interior. The dip belongs to the clapper, not here.
 */
const SHELL =
  "M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H208a16,16,0,0,0,13.8-24.06Z" +
  "M48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z";

/**
 * CLAPPER_RING — the clapper as a real OUTLINE, which is what it looks like in the source.
 *
 * It is the annular segment between the collar's r=40 dip and the clapper's own r=24 arc,
 * both about (128,192): a U of uniform 16-unit thickness, the icon's stroke weight. Its
 * white middle is its own hollowness, so it reads as outline wherever it travels.
 *
 * This replaces a mask. Punching the clapper as a HOLE in the collar is correct at rest,
 * but the moment the hole slides more than a few units the crescent goes lopsided and one
 * side thickens into a solid mass — which is why it looked filled. An outline that moves as
 * a rigid body cannot do that. Verified: SHELL + CLAPPER_RING against the source glyph is
 * 40 differing pixels, max alpha gap 63 — antialiasing where two fills abut, not geometry.
 */
const CLAPPER_RING = "M88.81,200a40,40,0,0,0,78.38,0L150.62,200A24,24,0,0,1,105.38,200Z";

const WAVES = [
  "M48.25,74.81A88,88,0,0,0,48.25,149.19",
  "M207.75,74.81A88,88,0,0,1,207.75,149.19",
  "M37.37,69.74A100,100,0,0,0,37.37,154.26",
  "M218.63,69.74A100,100,0,0,1,218.63,154.26",
];

const CROWN = AT(128, 24); // where a bell hangs
const YOKE = AT(128, 192); // the arc centre the clapper and the collar share
const CORE = AT(128, 104); // dome circle centre — the axis its metal flexes about
const BADGE = AT(212, 44);

const STRIKE = 7.95; // measured slack: clapper edge to collar wall
const SWING = 9; // shell, inside the 12.2° that keeps the glyph on the artboard

/* ── 1 · TAP ─────────────────────────────────────────────────────────────────
   The clapper falls under gravity (ease-in), lands on the wall, and only then
   does the shell tick the other way. Cause before effect, kept deliberately small. */
const t1Clap: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, STRIKE, -4.2, 1.8, 0],
    transition: {
      duration: 0.62,
      times: [0, 0.32, 0.58, 0.82, 1],
      ease: ["easeIn", "easeOut", "easeOut", "easeOut"],
    },
  },
};
const t1Shell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // holds at 0 through the fall — the shell has not been touched yet
    rotate: [0, 0, -3, 1.6, -0.6, 0],
    transition: {
      duration: 0.62,
      times: [0, 0.32, 0.46, 0.68, 0.86, 1],
      ease: ["linear", "easeOut", "easeOut", "easeOut", "easeOut"],
    },
  },
};

/* ── 2 · RING ────────────────────────────────────────────────────────────────
   The clapper crosses and hits the far wall too — two contacts — and the shell
   now takes its full 9°. */
const t2Clap: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, STRIKE, -STRIKE, 4.6, -2, 0],
    transition: {
      duration: 0.72,
      times: [0, 0.24, 0.48, 0.7, 0.88, 1],
      ease: ["easeIn", "easeIn", "easeOut", "easeOut", "easeOut"],
    },
  },
};
const t2Shell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, -SWING, 6.4, -2.8, 0],
    transition: {
      duration: 0.72,
      times: [0, 0.24, 0.38, 0.62, 0.82, 1],
      ease: ["linear", "easeOut", "easeOut", "easeOut", "easeOut"],
    },
  },
};

/* ── 3 · BROADCAST ───────────────────────────────────────────────────────────
   The ring, and the sound leaves it. The arcs are DRAWN via pathLength — the inner
   pair on the strike, the outer a beat behind — and both are gone before the end.
   They rest at opacity 0, so the resting glyph is untouched. */
const t3Clap: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, STRIKE, -STRIKE, 4.4, -1.9, 0],
    transition: {
      duration: 0.82,
      times: [0, 0.22, 0.45, 0.68, 0.86, 1],
      ease: ["easeIn", "easeIn", "easeOut", "easeOut", "easeOut"],
    },
  },
};
const t3Shell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, -SWING, 6, -2.6, 0],
    transition: {
      duration: 0.82,
      times: [0, 0.22, 0.36, 0.6, 0.8, 1],
      ease: ["linear", "easeOut", "easeOut", "easeOut", "easeOut"],
    },
  },
};
/** A drawn-then-faded sound front. `delay` staggers the outer pair behind the inner. */
const waveOf = (delay: number): Variants => ({
  normal: { pathLength: 0, opacity: 0, transition: { duration: 0.2 } },
  animate: {
    pathLength: [0, 0.7, 1, 1],
    opacity: [0, 0.6, 0.6, 0],
    transition: {
      duration: 0.52,
      times: [0, 0.22, 0.6, 1],
      ease: ["easeOut", "easeOut", "easeIn"],
      delay,
    } satisfies Transition,
  },
});

/* ── 4 · ALERT ───────────────────────────────────────────────────────────────
   Broadcast plus the badge — and it lands ON the strike frame rather than drifting
   in afterwards, so the hit and the notification read as one event. */
const badgeOf = (delay: number): Variants => ({
  normal: { scale: 0, opacity: 0, transition: { duration: 0.2 } },
  animate: {
    scale: [0, 1.25, 1, 1, 0.6],
    opacity: [0, 1, 1, 1, 0],
    transition: {
      duration: 0.56,
      times: [0, 0.34, 0.5, 0.78, 1],
      ease: [OVERSHOOT, "easeOut", "linear", "easeIn"],
      delay,
    } satisfies Transition,
  },
});

/* ── 5 · GRAND PEAL ──────────────────────────────────────────────────────────
   Three countable beats at ~313ms: the shell winds back and HOLDS (20%..34%, long
   enough that the pull reads as deliberate) with the clapper hanging against the high
   side under gravity; the release, where the light arm overtakes the heavy shell and
   strikes; then the ring-out, the dome flexing oval the way struck metal does. */
const t5Clap: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -4.2, -4.2, STRIKE, -5, 2.2, 0],
    transition: {
      duration: 0.94,
      times: [0, 0.2, 0.34, 0.5, 0.7, 0.86, 1],
      ease: ["easeOut", "linear", "easeIn", "easeOut", "easeOut", "easeOut"],
    },
  },
};
const t5Shell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 6.4, 6.4, -SWING, 6.2, -2.6, 0],
    transition: {
      duration: 0.94,
      times: [0, 0.2, 0.34, 0.52, 0.72, 0.88, 1],
      ease: ["easeOut", "linear", "easeIn", "easeOut", "easeOut", "easeOut"],
    },
  },
};
const t5Flex: Variants = {
  normal: { scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // flat until the strike at 0.5, then the fundamental mode decays
    scaleX: [1, 1, 1.045, 0.98, 1.012, 1],
    scaleY: [1, 1, 0.955, 1.02, 0.988, 1],
    transition: {
      duration: 0.94,
      times: [0, 0.5, 0.58, 0.7, 0.84, 1],
      ease: "easeOut",
    },
  },
};

/* ── 7 · RECORDED RING ───────────────────────────────────────────────────────
   Traced off the screen recording rather than authored. 208 frames at 30fps were
   thresholded and, per frame, the horizontal offset between the glyph's upper third
   and its collar band was taken as a lean proxy, with the clapper's offset measured
   against the collar. (Two earlier estimators were discarded: crown-to-collar angle
   drifted because the crown itself moves, and second-moment orientation is
   ill-conditioned on a 59x64 near-square silhouette.)

   What the trace shows, over six consistent repetitions:
     · a dead-still hold, then ~834ms of motion;
     · shell and clapper swinging in OPPOSITION — lean negative while the clapper
       goes positive, every time;
     · the clapper's amplitude ~1.9x the shell's (peaks 18.4px against 9.6px);
     · a decaying oscillation, shell peaks at t = .20 .44 .64 .80 .92 with relative
       amplitudes .92 1.0 .79 .61 .21 — it builds to the second swing, then rings down.

   Both parts pivot at the CROWN, which is what gives the clapper its long radius and
   wide horizontal sweep. Its angle here is relative to the shell, and capped: the
   clapper sits 184 units below the crown and has 16.57 units of clearance to the
   collar wall, so 184*sin(φ) <= 16.57 gives φ <= 5.1° before the hole would cut the
   outline. The recording's 1.9x ratio cannot be reproduced literally on this glyph —
   5° against the shell's 12° is the most it takes without breaking the rest picture. */
const v7Shell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -11, 12, -9.5, 7.4, -2.5, 0],
    transition: {
      duration: 0.85,
      times: [0, 0.2, 0.44, 0.64, 0.8, 0.92, 1],
      ease: "easeInOut",
    },
  },
};
/**
 * The clapper TRANSLATES rather than rotates, and that choice is the whole reason it
 * reaches the edges of its housing.
 *
 * Measured on the three extreme points of the tongue against the dip lobe:
 *   · rotating it about the arc centre it shares with the collar moves the tip 3.32 units
 *     before its edge meets the wall — at icon size that is invisible;
 *   · sliding it horizontally moves the tip 16.57 units before any point leaves the lobe,
 *     five times further, and the tip is still provably inside.
 * Rotation loses because the clapper and the collar are CONCENTRIC: turning it about their
 * shared centre just slides it along the wall it is already parallel to. Translation is
 * what actually crosses the gap.
 *
 * So it swings the full 16 units to each edge — just inside the 16.57 cap — and lags the
 * shell by ~0.04 of the timeline, which is what makes it read as a heavy arm being carried
 * rather than a part rigidly glued to the bell. Same sign as the shell's rotation: a shell
 * that leans bottom-right leaves its clapper trailing to the left.
 */
const v7Clap: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -16, 16, -13, 9, -3.5, 0],
    transition: {
      duration: 0.85,
      times: [0, 0.24, 0.48, 0.68, 0.84, 0.94, 1],
      ease: "easeInOut",
    },
  },
};

/* ── Renderer ────────────────────────────────────────────────────────────── */

type Cfg = {
  shell: Variants;
  clapper: Variants;
  flex?: Variants;
  /** Clapper pivot. Defaults to the arc centre it shares with the collar. */
  clapperAt?: ReturnType<typeof AT>;
  /** [inner, outer] wave delays in seconds. */
  waves?: [number, number];
  badge?: number;
};

function makeBell({ shell, clapper, flex, clapperAt = YOKE, waves, badge }: Cfg) {
  return forwardRef<IconHandle, IconProps>(function LabBell({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {/* Sound and badge sit OUTSIDE the shell group: they are what the bell emits, so
              they must not swing with it — a fixed reference is what makes the swing read. */}
          {!reduced &&
            waves &&
            WAVES.map((d, i) => (
              <motion.path
                key={d}
                d={d}
                pathLength={1}
                fill="none"
                stroke="currentColor"
                strokeWidth={10}
                strokeLinecap="round"
                variants={waveOf(i > 1 ? waves[1] : waves[0])}
              />
            ))}
          {!reduced && badge !== undefined && (
            <motion.circle cx={212} cy={44} r={16} variants={badgeOf(badge)} style={BADGE} />
          )}

          <motion.g variants={reduced ? undefined : shell} style={CROWN}>
            <motion.g variants={reduced ? undefined : flex} style={CORE}>
              <path d={SHELL} />
            </motion.g>
            {/* The clapper is its OWN outline, not a hole — so it stays an outline wherever
                it travels, and its white middle comes from its own hollowness. */}
            <motion.path
              d={CLAPPER_RING}
              variants={reduced ? undefined : clapper}
              style={clapperAt}
            />
          </motion.g>
        </Svg>
      </div>
    );
  });
}

const Tap = makeBell({ shell: t1Shell, clapper: t1Clap });
const Ring = makeBell({ shell: t2Shell, clapper: t2Clap });
const Broadcast = makeBell({ shell: t3Shell, clapper: t3Clap, waves: [0.18, 0.265] });
const Alert = makeBell({ shell: t3Shell, clapper: t3Clap, waves: [0.194, 0.28], badge: 0.194 });
const RecordedRing = makeBell({ shell: v7Shell, clapper: v7Clap });
const GrandPeal = makeBell({
  shell: t5Shell,
  clapper: t5Clap,
  flex: t5Flex,
  waves: [0.47, 0.555],
  badge: 0.47,
});

export default function BellMotionLab() {
  return (
    <VariantGrid
      title="Bell — candidates (motion/react)"
      cycleMs={2600}
      playMs={1500}
      variants={[
        { name: "1 · Tap", blurb: "One precise hit, a 3° counter-tick from the shell", Component: Tap },
        { name: "2 · Ring", blurb: "Strikes both walls; the shell swings its full 9°", Component: Ring },
        {
          name: "3 · Broadcast",
          blurb: "The ring, and sound drawn outward on two fronts",
          Component: Broadcast,
        },
        {
          name: "4 · Alert",
          blurb: "Sound plus a badge that lands on the strike frame",
          Component: Alert,
        },
        {
          name: "5 · Grand peal",
          blurb: "Wind back, hold, release — then the dome rings as struck metal",
          Component: GrandPeal,
        },
        {
          name: "7 · Recorded ring",
          blurb: "Traced from your recording: shell and clapper in opposition, decaying",
          Component: RecordedRing,
        },
      ]}
    />
  );
}
