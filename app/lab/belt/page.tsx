"use client";

import { forwardRef, useId, useImperativeHandle, type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Belt, 5 takes on "it is buckled", each a rung above the last.
 *
 * THE GLYPH IS ONE COMPOUND PATH, so nothing here is rebuilt from sub-paths.
 * Every moving part is the WHOLE original path drawn again and clipped to a
 * box, which makes gate 2 free: the clips tile the plane, so all the layers
 * together are the untouched Phosphor mark, pixel for pixel, at rest and after.
 * (Same trick baby-carriage uses. Rebuilding sub-paths is how rest states drift.)
 *
 * ANATOMY, measured off the rendered fill with isPointInFill — not read off the
 * `d` string, which is a single self-crossing outline and lies about structure:
 *
 *   strap      hollow band, x0..248, y80..176, walls 16 thick, round caps
 *   buckle     frame x96..192, y72..184; interior hole x112..176, y88..168
 *   prong      x136..176, y120..136 — rooted in the buckle's RIGHT wall,
 *              pointing LEFT, tip rounded (r8 about 144,128)
 *   keeper     the loop at x48..64, crossing the strap, nubs at y72..80 / y176..184
 *   belt hole  the empty compartment x64..96, y96..160
 *
 * EVERY ANGLE AND DISTANCE BELOW IS DERIVED FROM THAT, not tasted.
 */
const BELT =
  "M248,160H192V96h56a8,8,0,0,0,0-16H189.83A16,16,0,0,0,176,72H112a16,16,0,0,0-13.83,8H64a8,8,0,0,0-16,0H8A8,8,0,0,0,8,96H48v64H8a8,8,0,0,0,0,16H48a8,8,0,0,0,16,0H98.17A16,16,0,0,0,112,184h64a16,16,0,0,0,13.83-8H248a8,8,0,0,0,0-16ZM64,96H96v64H64Zm48,72V88h64v32H144a8,8,0,0,0,0,16h32v31.8c0,.07,0,.13,0,.2Z";

type Box = { x: number; y: number; w: number; h: number };
const rect = (b: Box) => `M${b.x},${b.y}H${b.x + b.w}V${b.y + b.h}H${b.x}Z`;
const FULL = "M0,0H256V256H0Z";

/** The prong, clipped short of the wall it is rooted in so the wall stays put.
 *  The clip lives INSIDE the transformed group, so it is applied in unscaled
 *  local coords and the extension is never cut off by its own box. */
const PRONG: Box = { x: 132, y: 114, w: 44, h: 28 };
/** The keeper's crossbar and its two nubs — NOT the strap wall it rides on,
 *  which has to stay continuous while the loop slides along it. */
const KEEPER: Box[] = [
  { x: 48, y: 68, w: 16, h: 12 },
  { x: 48, y: 96, w: 16, h: 64 },
  { x: 48, y: 176, w: 16, h: 12 },
];
/** The two free ends. They cinch INWARD together — a belt taking up slack
 *  shortens from both sides at once, and moving only one end reads at icon
 *  size as the glyph being clipped rather than the strap being pulled. */
const TAIL_L: Box = { x: -8, y: 56, w: 104, h: 144 }; // x-8..96, up to the buckle
const TAIL_R: Box = { x: 192, y: 56, w: 72, h: 144 }; // x192..264, from the buckle out

/** The prong is anchored where it meets the buckle's right wall, and it grows
 *  FORWARD from there — along the axis it already points down. */
const ROOT = { transformBox: "view-box" as const, originX: 176 / 256, originY: 128 / 256 };

/**
 * THE TWO REACHES. A tongue does not wave; it reaches out and engages. The
 * prong is 40 long from its root at x176, so extending the tip to x costs a
 * scaleX of (176 − x)/40:
 *  · REACH — the tip goes 16 further, one leather thickness (the glyph's own
 *    stroke weight): the throw it takes to enter a hole.
 *  · SPAN  — the tip lands on x112.5, the far wall of the buckle window,
 *    measured off the rendered fill. That is the whole reach the frame allows,
 *    so the tongue spans its buckle and stops exactly at the far side rather
 *    than crossing it.
 */
const REACH = 1.4; // (40 + 16) / 40
const SPAN = 1.5875; // (176 − 112.5) / 40
/** A seat, not a bounce: the tongue recoils ~1.5 units off the far wall. */
const SEAT = 0.962; // (40 − 1.5) / 40
/** The keeper's crossbar (x48..64) has 32 of runway before it meets the buckle
 *  wall at x96. It travels 24 and stops one half-thickness short, so it stays a
 *  separate loop instead of merging into the buckle. */
const SLIDE = 24;
/** Each free end draws in by 16 — one wall thickness, the glyph's own stroke
 *  weight — so the belt takes up exactly one thickness of slack per side. */
const CINCH = 16;

/** One clipped copy of the untouched glyph. */
function Layer({ clip }: { clip: string }) {
  return (
    <g clipPath={`url(#${clip})`}>
      <path d={BELT} />
    </g>
  );
}

function Shell({
  size,
  style,
  bind,
  controls,
  defs,
  children,
  ...props
}: IconProps & {
  bind: ReturnType<typeof useHover>["bind"];
  controls: ReturnType<typeof useHover>["controls"];
  defs: ReactNode;
  children: ReactNode;
}) {
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
        <defs>{defs}</defs>
        {children}
      </motion.svg>
    </div>
  );
}

/* ══ 1. REACH ════════════════════════════════════════════════════════════════
   The smallest honest thing the object does: the tongue extends forward by one
   leather thickness — the exact throw that puts it through a hole — and draws
   back. It grows along the axis it points; it never waves. 0.62s. ────────── */
const reach: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, REACH, 1],
    transition: { duration: 0.62, times: [0, 0.42, 1], ease: ["easeOut", "easeInOut"] },
  },
};

/* ══ 2. ENGAGE ═══════════════════════════════════════════════════════════════
   The same reach becomes an ACTION: the tongue extends its full travel until
   it meets the far wall of its own buckle, HOLDS there so the engaged state
   registers, then recoils off the wall and settles. The hold and the recoil
   are the difference between a twitch and a latch. 0.9s. ─────────────────── */
const engage: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, SPAN, SPAN, SEAT, 1],
    transition: {
      duration: 0.9,
      times: [0, 0.28, 0.5, 0.82, 1],
      // out fast and easing into the wall; back is a release, not a push
      ease: ["easeOut", "linear", "easeIn", "easeOut"],
    },
  },
};

/* ══ 3. CINCH ════════════════════════════════════════════════════════════════
   Two parts on one clock, and the second one explains the first: the tongue
   reaches out only as far as it must, and WHILE IT IS EXTENDED the keeper loop
   slides 24 down the strap toward the buckle. The tongue draws back the moment
   the keeper lands. Now the gesture has cause and effect, not just a moving
   part. 1.06s. ──────────────────────────────────────────────────────────── */
const cinchProng: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, REACH, REACH, SEAT, 1],
    transition: {
      duration: 1.06,
      times: [0, 0.18, 0.6, 0.78, 0.9],
      ease: ["easeOut", "linear", "easeIn", "easeOut"],
    },
  },
};
const cinchKeeper: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    // waits for the tongue to clear, slides, holds, then relaxes back
    x: [0, 0, SLIDE, SLIDE, 0],
    transition: {
      duration: 1.06,
      times: [0, 0.18, 0.5, 0.72, 1],
      ease: ["linear", "easeInOut", "linear", "easeInOut"],
    },
  },
};

/* ══ 4. NOTCH ════════════════════════════════════════════════════════════════
   Now the BELT moves, not an ornament on it. The tongue reaches its full span
   and both free ends draw in by one wall thickness while it is extended — the
   strap taking up slack — then the tongue seats on the tightened belt.
   Both ends, not one: pulling only the left tail shortens the glyph off-centre
   and reads at 24px as a clipping bug. Symmetric, it reads as tightening.
   1.28s, three countable beats. ─────────────────────────────────────────── */
const notchProng: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, SPAN, SPAN, SEAT, 1],
    transition: {
      duration: 1.28,
      times: [0, 0.16, 0.62, 0.76, 0.86],
      ease: ["easeOut", "linear", "easeIn", "easeOut"],
    },
  },
};
const notchLeft: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 0, CINCH, CINCH, 0],
    transition: {
      duration: 1.28,
      times: [0, 0.16, 0.52, 0.78, 1],
      ease: ["linear", "easeInOut", "linear", "easeInOut"],
    },
  },
};
const notchRight: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 0, -CINCH, -CINCH, 0],
    transition: {
      duration: 1.28,
      times: [0, 0.16, 0.52, 0.78, 1],
      ease: ["linear", "easeInOut", "linear", "easeInOut"],
    },
  },
};

/* ══ 5. FASTEN ═══════════════════════════════════════════════════════════════
   The whole mechanism, with the two things the others are missing.
   ANTICIPATION: the tongue draws BACK to 0.94 before it shoots forward — a
   thing that is about to extend loads first, and the pull-back is what makes
   the reach read as caused rather than as a value changing.
   AN ESCAPEMENT, not a slide: coming home it goes recoil → impulse → seat →
   hold, so the return has a minimum speed of zero and actually clicks.
   And it LANDS HONESTLY: the belt does not rewind the way it came. Once the
   tongue is home the leather RELAXES out — slower, ease-out, a different
   character from the pull — so the return is the belt being let out rather
   than the animation being played backwards. 1.5s. ───────────────────────── */
const fastenProng: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 0.94, SPAN, SPAN, SPAN, SEAT, 1.018, 1, 1],
    transition: {
      duration: 1.5,
      times: [0, 0.06, 0.24, 0.4, 0.62, 0.72, 0.78, 0.84, 1],
      ease: [
        "easeIn", //   load — the tongue draws back
        "easeOut", //  shoot forward to the far wall
        "linear", //   held, engaged
        "linear", //   still engaged while the belt is pulled
        "easeIn", //   impulse home, past rest
        "easeOut", //  recoil off the seat
        "easeInOut", // settle
        "linear", //   held, done
      ],
    },
  },
};
const fastenCinch = (dir: 1 | -1): Variants => ({
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 0, dir * CINCH, dir * CINCH, dir * CINCH, 0],
    transition: {
      duration: 1.5,
      times: [0, 0.24, 0.56, 0.62, 0.84, 1],
      ease: [
        "linear",
        "easeInOut", // the pull
        "linear", //    held tight at the notch
        "linear", //    the tongue drops onto it
        "easeOut", //   let out again — slower, and not the pull reversed
      ],
    },
  },
});
const fastenLeft = fastenCinch(1);
const fastenRight = fastenCinch(-1);

/* ── assembly ────────────────────────────────────────────────────────────── */

/** Variants 1 & 2: only the prong moves. */
function makeProngIcon(prong: Variants) {
  return forwardRef<IconHandle, IconProps>(function BeltIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    const uid = useId().replace(/:/g, "");
    const body = `belt-body-${uid}`;
    const prongClip = `belt-prong-${uid}`;

    if (reduced) {
      return (
        <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
            <path d={BELT} />
          </svg>
        </div>
      );
    }

    return (
      <Shell
        size={size}
        style={style}
        bind={bind}
        controls={controls}
        {...props}
        defs={
          <>
            <clipPath id={body} clipPathUnits="userSpaceOnUse">
              <path clipRule="evenodd" d={`${FULL} ${rect(PRONG)}`} />
            </clipPath>
            <clipPath id={prongClip} clipPathUnits="userSpaceOnUse">
              <path d={rect(PRONG)} />
            </clipPath>
          </>
        }
      >
        <Layer clip={body} />
        <motion.g variants={prong} style={ROOT}>
          <Layer clip={prongClip} />
        </motion.g>
      </Shell>
    );
  });
}

/** Variant 3: prong + the keeper loop sliding along the strap. */
function makeKeeperIcon(prong: Variants, keeper: Variants) {
  return forwardRef<IconHandle, IconProps>(function BeltIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    const uid = useId().replace(/:/g, "");
    const body = `belt-body-${uid}`;
    const prongClip = `belt-prong-${uid}`;
    const keeperClip = `belt-keeper-${uid}`;
    const keeperRects = KEEPER.map(rect).join(" ");

    if (reduced) {
      return (
        <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
            <path d={BELT} />
          </svg>
        </div>
      );
    }

    return (
      <Shell
        size={size}
        style={style}
        bind={bind}
        controls={controls}
        {...props}
        defs={
          <>
            <clipPath id={body} clipPathUnits="userSpaceOnUse">
              <path clipRule="evenodd" d={`${FULL} ${rect(PRONG)} ${keeperRects}`} />
            </clipPath>
            <clipPath id={prongClip} clipPathUnits="userSpaceOnUse">
              <path d={rect(PRONG)} />
            </clipPath>
            <clipPath id={keeperClip} clipPathUnits="userSpaceOnUse">
              <path d={keeperRects} />
            </clipPath>
          </>
        }
      >
        <Layer clip={body} />
        <motion.g variants={keeper}>
          <Layer clip={keeperClip} />
        </motion.g>
        <motion.g variants={prong} style={ROOT}>
          <Layer clip={prongClip} />
        </motion.g>
      </Shell>
    );
  });
}

/** Variants 4 & 5: prong + both free ends cinching inward. */
function makeCinchIcon(prong: Variants, left: Variants, right: Variants) {
  return forwardRef<IconHandle, IconProps>(function BeltIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    const uid = useId().replace(/:/g, "");
    const body = `belt-body-${uid}`;
    const prongClip = `belt-prong-${uid}`;
    const leftClip = `belt-left-${uid}`;
    const rightClip = `belt-right-${uid}`;

    if (reduced) {
      return (
        <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
            <path d={BELT} />
          </svg>
        </div>
      );
    }

    return (
      <Shell
        size={size}
        style={style}
        bind={bind}
        controls={controls}
        {...props}
        defs={
          <>
            <clipPath id={body} clipPathUnits="userSpaceOnUse">
              <path clipRule="evenodd" d={`${FULL} ${rect(PRONG)} ${rect(TAIL_L)} ${rect(TAIL_R)}`} />
            </clipPath>
            <clipPath id={prongClip} clipPathUnits="userSpaceOnUse">
              <path d={rect(PRONG)} />
            </clipPath>
            <clipPath id={leftClip} clipPathUnits="userSpaceOnUse">
              <path d={rect(TAIL_L)} />
            </clipPath>
            <clipPath id={rightClip} clipPathUnits="userSpaceOnUse">
              <path d={rect(TAIL_R)} />
            </clipPath>
          </>
        }
      >
        {/* the ends slide UNDER the buckle: the body is painted over them */}
        <motion.g variants={left}>
          <Layer clip={leftClip} />
        </motion.g>
        <motion.g variants={right}>
          <Layer clip={rightClip} />
        </motion.g>
        <Layer clip={body} />
        <motion.g variants={prong} style={ROOT}>
          <Layer clip={prongClip} />
        </motion.g>
      </Shell>
    );
  });
}

const VARIANTS: LabVariant[] = [
  {
    name: "1 · Reach",
    blurb: "The tongue extends forward one leather thickness, and draws back.",
    Component: makeProngIcon(reach),
  },
  {
    name: "2 · Engage",
    blurb: "Reaches its full span to the buckle's far wall, holds, recoils, seats.",
    Component: makeProngIcon(engage),
  },
  {
    name: "3 · Cinch",
    blurb: "Tongue reaches; the keeper loop slides 24 down the strap and back.",
    Component: makeKeeperIcon(cinchProng, cinchKeeper),
  },
  {
    name: "4 · Notch",
    blurb: "Both free ends draw in one wall thickness — the strap takes up slack.",
    Component: makeCinchIcon(notchProng, notchLeft, notchRight),
  },
  {
    name: "5 · Fasten",
    blurb: "Anticipation, a real escapement on the seat, and the leather relaxes home.",
    Component: makeCinchIcon(fastenProng, fastenLeft, fastenRight),
  },
];

export default function BeltLab() {
  return <VariantGrid title="Belt" variants={VARIANTS} cycleMs={3400} playMs={2000} />;
}
