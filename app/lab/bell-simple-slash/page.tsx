"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Bell Simple Slash, 5 candidates.
 *
 * The verb here is the opposite of the rest of the family: this bell is MUTED. So the five
 * split into two readings — the bell tries to ring and the slash tells you it cannot
 * (1, 2), or the slash arrives and silences it (3, 4, 5). The ring spine is the same one
 * shipping in bell.tsx so the muted bell stays a sibling of the live one.
 *
 * THE SLASH CANNOT BE LIFTED OUT OF THE SOURCE, so the draw-on candidates rebuild instead.
 * Phosphor does not overlay the slash on a whole bell — it REDRAWS the bell with the dome's
 * upper-left and the collar's right omitted where the slash crosses, so the outline stops
 * against the slash rather than passing behind it. Overlaying is therefore wrong by 832
 * pixels, and no clearance band recovers it (widths 16..44 bottom out at 849, against 851).
 * Masking the band out was tried twice and abandoned — see the note on WHOLE_SHELL.
 *
 * EVERY NUMBER IS MEASURED OFF THE PATH.
 *   · the slash is a 16-wide round-capped stroke whose caps centre on (48,40) and (208,216)
 *     — read off the two cap arcs in the source — and is 237.9 units long;
 *   · the bell underneath is bell-simple: dome r=80 about (128,104), so it hangs from its
 *     crown (128,24), collar straight across at y=200, bar at x88..168 y216..232;
 *   · BODY + BAR reproduces the source at 14 differing pixels, so the bar is cleanly
 *     separable and can travel on its own;
 *   · the bar travels 17 — the shipped bell's 4.99° angular swing at this bar's radius —
 *     and at full travel its right edge reaches 185, clear of the slash band's near edge at
 *     200, so the two never collide.
 *
 * The slash lives INSIDE the rotating group so it stays registered with the bell.
 */
const BODY =
  "M53.92,34.62A8,8,0,1,0,42.08,45.38L58.82,63.8A79.59,79.59,0,0,0,48,104c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H182.64l19.44,21.38a8,8,0,1,0,11.84-10.76Z" +
  "M48,184c7.7-13.24,16-43.92,16-80a63.65,63.65,0,0,1,6.26-27.62L168.09,184Z" +
  "M214,179.25a8.13,8.13,0,0,1-2.93.55,8,8,0,0,1-7.44-5.08C196.35,156.19,192,129.75,192,104A64,64,0,0,0,96.43,48.31a8,8,0,0,1-7.9-13.91A80,80,0,0,1,208,104c0,35.35,8.05,58.59,10.52,64.88A8,8,0,0,1,214,179.25Z";
const BAR = "M168,224a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z";
const SLASH = "M48,40L208,216";

/**
 * WHOLE bell — bell-simple's own geometry, with no slash and no gaps. The draw-on candidates
 * use this and simply stroke the slash over the top, which is the simplest thing that works.
 *
 * Masking was a dead end and both attempts are recorded so they are not retried. Cutting the
 * slash band out of the source glyph statically does remove the slash, but it also leaves the
 * bell carrying the gaps Phosphor drew around it, which read as a ghost outline before the
 * ink arrives. Animating that cut so it follows the stroke is worse: the source's own slash
 * then stays visible ahead of the cut, so the slash looks fully drawn from frame one.
 *
 * The trade is explicit. At rest this is 832 pixels (1.3%) different from the source glyph:
 * Phosphor truncates the dome's upper-left and the collar's right where the slash crosses,
 * and here the outline simply runs continuously beneath it instead. That is a visible-only-
 * on-inspection difference, and it buys a slash that actually draws.
 */
const WHOLE_SHELL =
  "M221.85,192A15.8,15.8,0,0,1,208,200H48a16,16,0,0,1-13.8-24.06C39.75,166.38,48,139.34,48,104a80,80,0,1,1,160,0c0,35.33,8.26,62.38,13.81,71.94A15.89,15.89,0,0,1,221.84,192Z" +
  "M208,184c-7.73-13.27-16-43.95-16-80a64,64,0,1,0-128,0c0,36.06-8.28,66.74-16,80Z";

const CROWN = AT(128, 24);

const SWING = 12;
const TRAVEL = 17;

/* Slash held fully drawn — for the candidates where the bell rings and the slash is simply
   part of the picture. Rest is pathLength 1 either way. */
const slashHeld: Variants = {
  normal: { pathLength: 1, transition: RETURN_TRANSITION },
  animate: { pathLength: 1 },
};

/* ── 1 · MUTED RING — the full ring spine from bell.tsx, slash just sitting there. The
   bell rocks exactly as its unmuted sibling does; the joke is that nothing comes out. */
const ringShell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -11, SWING, -9.5, 7.4, -2.5, 0],
    transition: { duration: 0.85, times: [0, 0.2, 0.44, 0.64, 0.8, 0.92, 1], ease: "easeInOut" },
  },
};
const ringBar: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -TRAVEL, TRAVEL, -14, 9.5, -3.7, 0],
    transition: { duration: 0.85, times: [0, 0.24, 0.48, 0.68, 0.84, 0.94, 1], ease: "easeInOut" },
  },
};

/* ── 2 · DAMPED — the same swing smothered. One real move, then it gives up almost at once
   instead of ringing down through five. Muted is a property of the DECAY, not the amplitude,
   which is why this reads more "off" than simply making it smaller would. */
const dampedShell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -9, 3.4, -0.9, 0],
    transition: { duration: 0.62, times: [0, 0.28, 0.56, 0.8, 1], ease: "easeOut" },
  },
};
const dampedBar: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -13, 5, -1.4, 0],
    transition: { duration: 0.62, times: [0, 0.34, 0.62, 0.84, 1], ease: "easeOut" },
  },
};

/* ── 3 · CUT — the bell holds perfectly still and the slash draws itself on, top-left to
   bottom-right across the whole glyph. Nothing else moves, so the stroke is the entire event. */
const slashDraw: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    // The cap is why opacity is here. A round-capped stroke at zero length draws as a full
    // 16-wide DOT sitting at the start point, which pops before the line exists. Fading in
    // over the first 80ms hides it while the stroke gains length, and keeps the caps round —
    // switching to butt caps would kill the dot but leave the finished slash flat-ended,
    // which the source is not.
    opacity: [0, 1],
    transition: {
      // a pen leaves fast and eases into its stop; linear would read as a progress bar
      pathLength: { duration: 0.6, ease: [0.45, 0, 0.15, 1] },
      opacity: { duration: 0.08, ease: "linear" },
    },
  },
};
const stillShell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: 0 },
};
const stillBar: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: { x: 0 },
};

/* ── 4 · SILENCED — cause and effect. The bell rings freely, then the slash sweeps across
   and the swing dies as it lands: the two amplitudes after the slash completes are a
   fraction of the two before it. The mute is something that HAPPENS, not a starting state. */
const silencedShell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -11, 10, -3.2, 1.1, 0],
    transition: { duration: 0.95, times: [0, 0.16, 0.36, 0.62, 0.82, 1], ease: "easeOut" },
  },
};
const silencedBar: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -TRAVEL, 15, -4.4, 1.5, 0],
    transition: { duration: 0.95, times: [0, 0.2, 0.4, 0.66, 0.86, 1], ease: "easeOut" },
  },
};
const slashSweep: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    // holds at nothing while the bell rings, then sweeps across from 0.42 to 0.66
    pathLength: [0, 0, 1, 1],
    // stays invisible through the hold, so the round cap never sits there as a dot
    opacity: [0, 0, 1, 1],
    transition: {
      pathLength: { duration: 0.95, times: [0, 0.42, 0.66, 1], ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.95, times: [0, 0.43, 0.48, 1], ease: "linear" },
    },
  },
};

/* ── 5 · STRUCK OUT — the slash arrives as a blow rather than a stroke: on in a quarter of
   a second, and the bell recoils from the impact afterwards. The recoil starts AFTER the
   slash lands, which is what makes it read as a consequence. */
const strikeSlash: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1, 1],
    opacity: [0, 1, 1],
    transition: {
      pathLength: { duration: 0.8, times: [0, 0.3, 1], ease: [0.5, 0, 0.4, 1] },
      opacity: { duration: 0.8, times: [0, 0.04, 1], ease: "linear" },
    },
  },
};
const struckShell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // dead still until the slash lands at 0.3, then knocked and settling
    rotate: [0, 0, 7.5, -4.6, 2, -0.7, 0],
    transition: {
      duration: 0.8,
      times: [0, 0.3, 0.46, 0.62, 0.78, 0.9, 1],
      ease: ["linear", "easeOut", "easeOut", "easeOut", "easeOut", "easeOut"],
    },
  },
};
const struckBar: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 0, 12, -7, 3, -1, 0],
    transition: {
      duration: 0.8,
      times: [0, 0.34, 0.5, 0.66, 0.82, 0.92, 1],
      ease: ["linear", "easeOut", "easeOut", "easeOut", "easeOut", "easeOut"],
    },
  },
};

/* ── Renderer ────────────────────────────────────────────────────────────── */

const SLASH_W = 16; // the source slash's own width

type Cfg = { shell: Variants; bar: Variants; slash: Variants; cut?: boolean };

/**
 * `cut: false` renders the source subpaths verbatim — the slash is already in them and never
 * moves, so rest is pixel-exact and there is nothing to composite.
 *
 * `cut: true` swaps in the WHOLE bell and strokes the slash over it, so the slash can draw.
 * No mask: see the note on WHOLE_SHELL for why both masking approaches were abandoned.
 */
function makeSlashBell({ shell, bar, slash, cut = true }: Cfg) {
  return forwardRef<IconHandle, IconProps>(function LabSlashBell(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    const drawable = cut && !reduced;

    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {/* The slash lives inside the rotating group so it stays registered with the bell. */}
          <motion.g variants={reduced ? undefined : shell} style={CROWN}>
            <path d={drawable ? WHOLE_SHELL : BODY} />
            <motion.path d={BAR} variants={reduced ? undefined : bar} />
            {drawable && (
              <motion.path
                d={SLASH}
                pathLength={1}
                fill="none"
                stroke="currentColor"
                strokeWidth={SLASH_W}
                strokeLinecap="round"
                variants={slash}
              />
            )}
          </motion.g>
        </Svg>
      </div>
    );
  });
}

const MutedRing = makeSlashBell({ shell: ringShell, bar: ringBar, slash: slashHeld, cut: false });
const Damped = makeSlashBell({ shell: dampedShell, bar: dampedBar, slash: slashHeld, cut: false });
const Cut = makeSlashBell({ shell: stillShell, bar: stillBar, slash: slashDraw });
const Silenced = makeSlashBell({ shell: silencedShell, bar: silencedBar, slash: slashSweep });
const StruckOut = makeSlashBell({ shell: struckShell, bar: struckBar, slash: strikeSlash });

export default function BellSimpleSlashLab() {
  return (
    <VariantGrid
      title="Bell Simple Slash"
      cycleMs={2800}
      playMs={1600}
      variants={[
        {
          name: "1 · Muted ring",
          blurb: "The full ring spine — it rocks, but nothing comes out",
          Component: MutedRing,
        },
        {
          name: "2 · Damped",
          blurb: "One move, then it gives up — muted is about the decay",
          Component: Damped,
        },
        {
          name: "3 · Cut",
          blurb: "Bell holds still; the slash draws through it",
          Component: Cut,
        },
        {
          name: "4 · Silenced",
          blurb: "Rings freely, then the slash lands and the swing dies",
          Component: Silenced,
        },
        {
          name: "5 · Struck out",
          blurb: "The slash arrives as a blow; the bell recoils after",
          Component: StruckOut,
        },
      ]}
    />
  );
}
