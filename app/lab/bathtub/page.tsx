"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Bathtub icon (Phosphor "bathtub"), 6 animation candidates.
 *
 * Rules for this set (per direction): the original glyph is NEVER altered — it
 * renders pixel-identical in every variant — and NOTHING is filled. Every added
 * element (water surface, drops, bubbles, steam, shower, towel) is thin
 * line-art STROKE, matching the glyph's line style. The glyph's own basin is
 * empty space, so the water elements live inside it and are clipped to it.
 *
 * Measured geometry (256 grid): basin interior x 24..232, y 112..184 (rounded
 * bottom, r40); faucet spout head x 144..192, y 104..136; rim top ~y112.
 * Everything stays inside the 0..256 box (the wrapper clips via overflow:hidden).
 */
const BATH =
  "M240,96H208a8,8,0,0,0-8-8H136a8,8,0,0,0-8,8H64V52A12,12,0,0,1,76,40a12.44,12.44,0,0,1,12.16,9.59,8,8,0,0,0,15.68-3.18A28.32,28.32,0,0,0,76,24,28,28,0,0,0,48,52V96H16a8,8,0,0,0-8,8v40a56.06,56.06,0,0,0,56,56v16a8,8,0,0,0,16,0V200h96v16a8,8,0,0,0,16,0V200a56.06,56.06,0,0,0,56-56V104A8,8,0,0,0,240,96Zm-48,8v32H144V104Zm40,40a40,40,0,0,1-40,40H64a40,40,0,0,1-40-40V112H128v32a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V112h24Z";

// The tub basin, used only to CLIP water strokes so they never cross the tub
// walls. Clipping is not a fill.
const BASIN = "M232,144a40,40,0,0,1-40,40H64a40,40,0,0,1-40-40V112H232Z";

// A wavy water-surface line spanning the basin width (x28..236). Rendered as a
// stroke — the line-art way to show a water level, no fill.
const WAVE = "M28,0 q26,-7 52,0 t52,0 t52,0 t52,0";
const WATER_W = 9;

/* ── 1. FILL ──────────────────────────────────────────────────────────────────
   The water level rises: the wavy surface line climbs from the tub floor to
   two-thirds and settles with a soft bob. */
const fill: Variants = {
  normal: { y: 46, transition: RETURN_TRANSITION },
  animate: {
    y: [46, -8, 2, -2, 0],
    transition: { duration: 1.4, ease: "easeOut", times: [0, 0.7, 0.85, 0.94, 1] },
  },
};

const BathtubFillIcon = forwardRef<IconHandle, IconProps>(
  function BathtubFillIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    const clip = useId().replace(/:/g, "");
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <defs>
            <clipPath id={clip}>
              <path d={BASIN} />
            </clipPath>
          </defs>
          {!reduced && (
            <g clipPath={`url(#${clip})`}>
              {/* Surface line sits high (y132) at full; the variant offsets it
                  down by 46 at rest, so it rises into place. */}
              {/* Static placement lives on a plain <g>: Motion writes
                  style.transform, which OVERRIDES an svg transform attribute
                  on the same element and teleports the shape to the origin. */}
              <g transform="translate(0 132)">
                <motion.path
                  d={WAVE}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={WATER_W}
                  strokeLinecap="round"
                  variants={fill}
                />
              </g>
            </g>
          )}
          <path d={BATH} />
        </Svg>
      </div>
    );
  },
);

/* ── 2. DRIP ──────────────────────────────────────────────────────────────────
   A bead of water falls from the faucet head and rings a ripple on the surface.
   The drop is a short rounded stroke; the ripple a stroked arc. */
const drop: Variants = {
  normal: { y: 0, opacity: 0, transition: { duration: 0 } },
  animate: {
    y: [0, 0, 22, 22],
    opacity: [0, 1, 1, 0],
    transition: { duration: 1.4, ease: "easeIn", times: [0, 0.22, 0.5, 0.53] },
  },
};
const ripple: Variants = {
  normal: { scaleX: 0, opacity: 0, transition: { duration: 0 } },
  animate: {
    scaleX: [0, 0, 1],
    opacity: [0, 0.8, 0],
    transition: { duration: 1.4, ease: "easeOut", times: [0.5, 0.54, 0.82] },
  },
};

const BathtubDripIcon = forwardRef<IconHandle, IconProps>(
  function BathtubDripIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    const clip = useId().replace(/:/g, "");
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <defs>
            <clipPath id={clip}>
              <path d={BASIN} />
            </clipPath>
          </defs>
          {/* Static surface line for the drop to strike. */}
          <g clipPath={`url(#${clip})`}>
            <path d={WAVE} transform="translate(0 160)" fill="none" stroke="currentColor" strokeWidth={WATER_W} strokeLinecap="round" opacity={0.85} />
          </g>
          <path d={BATH} />
          {!reduced && (
            <>
              {/* Drop: a short rounded bead below the faucet head (x168, y138). */}
              <motion.path
                d="M168,138 v13"
                fill="none"
                stroke="currentColor"
                strokeWidth={9}
                strokeLinecap="round"
                variants={drop}
              />
              {/* Ripple: a stroked arc widening at the impact point. */}
              <motion.path
                d="M152,160 q16,10 32,0"
                fill="none"
                stroke="currentColor"
                strokeWidth={6}
                strokeLinecap="round"
                variants={ripple}
                style={{ transformBox: "view-box", originX: 168 / 256, originY: 162 / 256 }}
              />
            </>
          )}
        </Svg>
      </div>
    );
  },
);

/* ── 3. BUBBLES ───────────────────────────────────────────────────────────────
   Soap bubbles (stroked rings) drift up off the bath and pop near the rim.
   Three rise on staggered loops. */
const BUBBLES = [
  { cx: 96, r: 8, delay: 0 },
  { cx: 148, r: 6, delay: 0.35 },
  { cx: 120, r: 5, delay: 0.7 },
];
const bubble = (delay: number): Variants => ({
  normal: { y: 0, scale: 0, opacity: 0, transition: { duration: 0 } },
  animate: {
    y: [0, -48],
    scale: [0, 1, 1, 0.9],
    opacity: [0, 0.9, 0.9, 0],
    transition: { duration: 1.6, ease: "easeOut", delay, times: [0, 0.2, 0.8, 1] },
  },
});

const BathtubBubblesIcon = forwardRef<IconHandle, IconProps>(
  function BathtubBubblesIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={BATH} />
          {!reduced &&
            BUBBLES.map((b, i) => (
              <motion.circle
                key={i}
                cx={b.cx}
                cy={160}
                r={b.r}
                fill="none"
                stroke="currentColor"
                strokeWidth={4}
                variants={bubble(b.delay)}
                style={{ transformBox: "view-box", originX: b.cx / 256, originY: 160 / 256 }}
              />
            ))}
        </Svg>
      </div>
    );
  },
);

/* ── 4. STEAM ─────────────────────────────────────────────────────────────────
   A hot, relaxing bath: two steam wisps (stroked S-curves) waver up off the
   water and fade, swaying as they rise. */
const STEAM = [
  { x: 104, delay: 0 },
  { x: 152, delay: 0.5 },
];
const WISP = "M0,0 C-8,-14 8,-26 0,-40 C-8,-54 6,-64 0,-76";
const steam = (delay: number): Variants => ({
  normal: { y: 0, x: 0, opacity: 0, transition: { duration: 0 } },
  animate: {
    y: [6, -6],
    x: [0, 4, -3, 2],
    opacity: [0, 0.6, 0.6, 0],
    transition: { duration: 1.9, ease: "easeOut", delay, times: [0, 0.25, 0.7, 1] },
  },
});

const BathtubSteamIcon = forwardRef<IconHandle, IconProps>(
  function BathtubSteamIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={BATH} />
          {!reduced &&
            STEAM.map((s, i) => (
              <g key={i} transform={`translate(${s.x} 148)`}>
                {/* Wrapper <g> carries placement; Motion's style.transform on
                    the path would override a transform attribute there. */}
                <motion.path
                  d={WISP}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={5}
                  strokeLinecap="round"
                  variants={steam(s.delay)}
                />
              </g>
            ))}
        </Svg>
      </div>
    );
  },
);

/* ── 5. SLOSH ─────────────────────────────────────────────────────────────────
   The bathwater sways: the stroked surface line tilts and shifts side to side,
   rocking to rest. Clipped to the basin so it never crosses the walls. */
const slosh: Variants = {
  normal: { rotate: 0, x: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 7, -5, 3, -1.5, 0],
    x: [0, 7, -6, 3, -1, 0],
    transition: { duration: 1.6, ease: "easeInOut", times: [0, 0.24, 0.46, 0.66, 0.84, 1] },
  },
};

const BathtubSloshIcon = forwardRef<IconHandle, IconProps>(
  function BathtubSloshIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    const clip = useId().replace(/:/g, "");
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <defs>
            <clipPath id={clip}>
              <path d={BASIN} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clip})`}>
            {/* Wider wave than the basin so tilting never reveals a free end. */}
            {/* Placement on a wrapper <g> — Motion's style.transform would
                override a transform attribute on the same element. */}
            <g transform="translate(0 152)">
              <motion.path
                d="M-20,0 q26,-7 52,0 t52,0 t52,0 t52,0 t52,0 t52,0"
                fill="none"
                stroke="currentColor"
                strokeWidth={WATER_W}
                strokeLinecap="round"
                variants={reduced ? undefined : slosh}
                style={{ transformBox: "view-box", originX: 0.5, originY: 152 / 256 }}
              />
            </g>
          </g>
          <path d={BATH} />
        </Svg>
      </div>
    );
  },
);

/* ── 6. RINSE (the glyph's own shower head comes alive) ──────────────────────
   No added ink. The glyph already contains a detachable hand-shower head
   resting on the rim (x128..208, y88..152) and a curved pipe (left). The
   compound path fuses them, so the three actors are carved out by CLIP-
   PARTITIONING the original path: three clipped renders whose regions tile the
   plane — at rest their union is byte-identical to the glyph.
     head — lifts off the rim, tilts toward the tub, gives two sprinkle-shakes
            in the air, then drops back home.
     tub  — takes the landing with a tiny squash on its feet (t≈0.82).
     pipe — wobbles in sympathy while the head shakes.
   Bounds: head lift −26 puts its top at y58; rotations stay well inside.
   The pipe pivots exactly on its clip seam (y93) so the slice never opens
   more than a hairline during its ±2.5° wobble. */
const HEAD_BOX = { x: 122, y: 82, w: 92, h: 76 };
const PIPE_BOX = { x: 36, y: 12, w: 86, h: 81 };
// Everything-else region: full canvas with the two boxes as even-odd holes.
// Holes are inset 1 unit so the partitions OVERLAP slightly — abutting clip
// edges antialias into a visible hairline seam through the ink; overlapping
// same-colour ink double-draws invisibly. The pieces pivot on/near the seams,
// so the sliver mismatch while animating stays subpixel.
const REST_CLIP =
  `M0,0H256V256H0Z ` +
  `M${HEAD_BOX.x + 1},${HEAD_BOX.y + 1}h${HEAD_BOX.w - 2}v${HEAD_BOX.h - 2}h-${HEAD_BOX.w - 2}Z ` +
  `M${PIPE_BOX.x + 1},${PIPE_BOX.y + 1}h${PIPE_BOX.w - 2}v${PIPE_BOX.h - 2}h-${PIPE_BOX.w - 2}Z`;

const RINSE_DUR = 1.7;
const rinseHead: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // Lift & tilt, two sprinkle-shakes while airborne, drop home at 0.82.
    y: [0, -26, -22, -25, -21, -24, 0, 0],
    rotate: [0, -14, -8, -15, -8, -12, 0, 0],
    transition: { duration: RINSE_DUR, ease: "easeInOut", times: [0, 0.2, 0.32, 0.44, 0.56, 0.68, 0.84, 1] },
  },
};
const rinseTub: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // Holds still until the head lands, then a small thud-squash on the feet.
    scaleY: [1, 1, 0.98, 1.006, 1],
    transition: { duration: RINSE_DUR, ease: "easeOut", times: [0, 0.84, 0.9, 0.96, 1] },
  },
};
const rinsePipe: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // Sympathetic wobble while the head shakes overhead.
    rotate: [0, 0, 2.5, -2, 1.5, -0.5, 0],
    transition: { duration: RINSE_DUR, ease: "easeInOut", times: [0, 0.24, 0.38, 0.52, 0.66, 0.8, 1] },
  },
};
/* Sprinkle: beads fall from the lifted head into the basin — short round-cap
   capsule strokes (line-art, no fill), staggered through the shake window
   (head is airborne t≈0.2..0.68 of RINSE_DUR ≈ 0.34..1.16s). Sized to READ at
   tile scale: strokeWidth 9 was a ~2px dot at 56px — technically rendering,
   practically invisible. Capsules (l0,7) at width 12 with slower falls fix it. */
const RINSE_DROPS = [
  { x: 164, delay: 0.3 },
  { x: 148, delay: 0.42 },
  { x: 158, delay: 0.55 },
  { x: 142, delay: 0.68 },
  { x: 154, delay: 0.82 },
];
const rinseDrop = (delay: number): Variants => ({
  normal: { y: 0, x: 0, opacity: 0, transition: { duration: 0 } },
  animate: {
    // From under the lifted head (~y126) down into the basin (~y178), with a
    // slight leftward drift matching the head's tilt.
    y: [0, 52],
    x: [0, -6],
    opacity: [0, 1, 1, 0],
    transition: { duration: 0.55, ease: "easeIn", delay, times: [0, 0.12, 0.82, 1] },
  },
});

const BathtubRinseIcon = forwardRef<IconHandle, IconProps>(
  function BathtubRinseIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    const id = useId().replace(/:/g, "");
    const headClip = `${id}h`, pipeClip = `${id}p`, restClip = `${id}r`;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <defs>
            <clipPath id={headClip}>
              <rect x={HEAD_BOX.x} y={HEAD_BOX.y} width={HEAD_BOX.w} height={HEAD_BOX.h} />
            </clipPath>
            <clipPath id={pipeClip}>
              <rect x={PIPE_BOX.x} y={PIPE_BOX.y} width={PIPE_BOX.w} height={PIPE_BOX.h} />
            </clipPath>
            <clipPath id={restClip}>
              <path d={REST_CLIP} clipRule="evenodd" />
            </clipPath>
          </defs>
          {/* Tub + feet + rim (everything but head & pipe), thud on landing. */}
          <motion.g variants={reduced ? undefined : rinseTub} style={{ transformBox: "view-box", originX: 0.5, originY: 216 / 256 }}>
            <g clipPath={`url(#${restClip})`}>
              <path d={BATH} />
            </g>
          </motion.g>
          {/* The pipe, wobbling about its base on the clip seam. */}
          <motion.g variants={reduced ? undefined : rinsePipe} style={{ transformBox: "view-box", originX: 56 / 256, originY: 93 / 256 }}>
            <g clipPath={`url(#${pipeClip})`}>
              <path d={BATH} />
            </g>
          </motion.g>
          {/* The hand-shower head, lifted, shaken, set back down. */}
          <motion.g variants={reduced ? undefined : rinseHead} style={{ transformBox: "view-box", originX: 168 / 256, originY: 120 / 256 }}>
            <g clipPath={`url(#${headClip})`}>
              <path d={BATH} />
            </g>
          </motion.g>
        </Svg>
      </div>
    );
  },
);



/* ── 7. SPRINKLE (Rinse + the dotted spray from the sketch) ──────────────────
   The same three clip-partitioned actors as RINSE — head lifts and shakes,
   pipe wobbles, tub takes the landing thud — plus the sprinkle: dotted beads
   (round-cap zero-length strokes, line-art dots, no fill) falling from the
   lifted head into the basin through the shake window, drifting slightly left
   with the head's tilt. */
const BathtubSprinkleIcon = forwardRef<IconHandle, IconProps>(
  function BathtubSprinkleIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    const id = useId().replace(/:/g, "");
    const headClip = `${id}h`, pipeClip = `${id}p`, restClip = `${id}r`;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <defs>
            <clipPath id={headClip}>
              <rect x={HEAD_BOX.x} y={HEAD_BOX.y} width={HEAD_BOX.w} height={HEAD_BOX.h} />
            </clipPath>
            <clipPath id={pipeClip}>
              <rect x={PIPE_BOX.x} y={PIPE_BOX.y} width={PIPE_BOX.w} height={PIPE_BOX.h} />
            </clipPath>
            <clipPath id={restClip}>
              <path d={REST_CLIP} clipRule="evenodd" />
            </clipPath>
          </defs>
          <motion.g variants={reduced ? undefined : rinseTub} style={{ transformBox: "view-box", originX: 0.5, originY: 216 / 256 }}>
            <g clipPath={`url(#${restClip})`}>
              <path d={BATH} />
            </g>
          </motion.g>
          <motion.g variants={reduced ? undefined : rinsePipe} style={{ transformBox: "view-box", originX: 56 / 256, originY: 93 / 256 }}>
            <g clipPath={`url(#${pipeClip})`}>
              <path d={BATH} />
            </g>
          </motion.g>
          <motion.g variants={reduced ? undefined : rinseHead} style={{ transformBox: "view-box", originX: 168 / 256, originY: 120 / 256 }}>
            <g clipPath={`url(#${headClip})`}>
              <path d={BATH} />
            </g>
          </motion.g>
          {/* The sprinkle: dotted beads falling from the lifted head. */}
          {!reduced &&
            RINSE_DROPS.map((d, i) => (
              <g key={i} transform={`translate(${d.x} 126)`}>
                {/* Placement on a wrapper <g>; Motion's style.transform would
                    override a transform attribute on the same element. */}
                <motion.path
                  d="M0,0 l0,7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={12}
                  strokeLinecap="round"
                  variants={rinseDrop(d.delay)}
                />
              </g>
            ))}
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BathtubFillIcon }[] = [
  { name: "Fill", blurb: "The water level rises and settles with a bob", Component: BathtubFillIcon },
  { name: "Drip", blurb: "A bead falls from the faucet and rings a ripple", Component: BathtubDripIcon },
  { name: "Bubbles", blurb: "Soap bubbles drift up and pop near the rim", Component: BathtubBubblesIcon },
  { name: "Steam", blurb: "Hot bath — steam wisps waver up and fade", Component: BathtubSteamIcon },
  { name: "Slosh", blurb: "The surface line sways side to side and settles", Component: BathtubSloshIcon },
  { name: "Rinse", blurb: "The glyph's own shower head lifts, shakes, sets back", Component: BathtubRinseIcon },
  { name: "Sprinkle", blurb: "Rinse + dotted spray falling from the lifted head", Component: BathtubSprinkleIcon },
];

export default function BathtubLabPage() {
  return <VariantGrid title="Bathtub" variants={VARIANTS} cycleMs={3200} playMs={2200} />;
}
