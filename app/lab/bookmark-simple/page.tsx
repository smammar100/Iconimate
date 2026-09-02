"use client";

import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { animate, motion, useMotionValue, type MotionValue, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, ARRIVE, DUR } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Bookmark Simple, five takes. 5 · Cloth is the fabric one.
 *
 * VERB: it HANGS AND IS PLACED. A bookmark is a strip of ribbon pinned at the top
 * edge of a page with a cut V at the free end — so everything it does is governed
 * by one fact: THE TOP IS FIXED AND THE TAILS ARE FREE. Every candidate here
 * respects that, and it is what stops the set being five ways of scaling a shape.
 *
 * MATERIAL: paper / fabric (§9) — ARRIVE, 3-5% overshoot, 1.0x base. It does not
 * squash and it does not spring like rubber. 3 · Swing is the one exception the
 * table licenses: it HANGS, so it gets a pendulum.
 *
 * ── MEASURED (512x512, counting only pixels that flip ink/no-ink) ──────────
 *
 *   ink bbox   x56..199.5, y32..231.5 — the outline plus its 8-unit half stroke.
 *              LANE: 56 left, 56.5 right, 32 top, 24.5 bottom. The generous side
 *              lanes are what make 5 · Cloth possible without clipping; the thin
 *              bottom lane is why nothing here travels downward more than 6.
 *   mirror about x=128 -> 0.0049% (2 px, antialiasing only)
 *
 *   The mark is one closed stroked path: top edge with two r8 corners, two
 *   vertical edges 48..224, and a V cut to the notch at (128,184).
 *
 * ── THE PARAMETRIC REBUILD, AND WHY IT IS SAFE ─────────────────────────────
 *
 * 4 · Tug and 5 · Cloth change the OUTLINE, not a transform of it, so the mark is
 * regenerated per frame from parameters. That is only allowed if the generator
 * reproduces the authored glyph exactly at rest, and it does — both forms
 * measured against the source `d`:
 *
 *     straight-edge rebuild (Tug at notch 184)      0 of 40,518 px = 0.0000%
 *     sampled + smoothed rebuild (Cloth at A=0)     0 of 40,518 px = 0.0000%
 *
 * The second is the load-bearing one. Cloth samples each vertical edge at 9
 * points and joins them with Catmull-Rom cubics; through COLLINEAR, EVENLY SPACED
 * points that construction yields control points on the same line, so the curve
 * degenerates to the exact straight edge. Rest is therefore not "close to" the
 * glyph, it IS the glyph, and the wave can be dialled to zero with no seam.
 *
 * The V is deliberately NOT smoothed across the notch: running the spline through
 * it would round off the cut, which is the one feature that makes this mark a
 * bookmark rather than a rectangle.
 *
 * ── WHY `d` IS DRIVEN BY A MotionValue, NOT BY VARIANT KEYFRAMES ───────────
 *
 * Established by measurement on `globe` and reused here: path `d` keyframes in a
 * variant DO NOT interpolate, and driving `d` from `useTransform` into a
 * `motion.path` races React re-renders that restore the prop. So 4 and 5 animate
 * an ordinary NUMBER (the notch depth; the wave clock), and a memo'd plain
 * `<path>` with exactly ONE writer sets `d` from the driver's `on("change")`.
 * Those two variants therefore wrap `start`/`stop` and bind their own handlers
 * rather than spreading `useHover`'s `bind`; the imperative handle wraps the same
 * pair, so the lab's auto-cycle still drives them.
 *
 * ── AMPLITUDE (§2) ─────────────────────────────────────────────────────────
 *
 * Floor is 18 units. Drop travels 20; Swing turns 9deg with the tails 180 units
 * out, so 28; Tug moves the notch 32; Cloth swings the tails +-18, i.e. 36
 * peak-to-peak. All clear it. The 6-unit settle overshoots are under it and
 * correct as §2's exception — secondary detail on a primary that already clears.
 *
 * ── REJECTED (§17) ─────────────────────────────────────────────────────────
 *
 *   · A FILL RISING INSIDE THE OUTLINE for the "saved" state — the canonical
 *     bookmark gesture. Not taken: `heart` shipped a fill here and it was later
 *     removed (MOTION.md §11 records the retiming that followed), so the set has
 *     already decided against fill-as-gesture. It would also make rest ambiguous
 *     between saved and unsaved.
 *   · SCALING THE WHOLE MARK for Tug. The top edge is pinned to a page; scaling
 *     moves it, which reads as the bookmark growing rather than the ribbon
 *     flexing. Only the notch moves.
 *   · A UNIFORM SIDE-TO-SIDE SWAY for Cloth. That is a rigid flag on a pole, not
 *     fabric — see 5's note on why the wave has to travel and the amplitude has
 *     to ramp.
 *
 * ── THE STANDING TEST — the failure I was most worried about ───────────────
 *
 * **5 · Cloth deforms the silhouette every frame.** A mark whose outline is being
 * regenerated is one bad envelope away from reading as a wobbling blob, and at
 * 20px the ripple could look like a rendering fault rather than fabric. Resolved
 * three ways, all checked: the top edge and both corners are LITERALLY UNMOVED
 * (the ramp is zero there), so the icon stays anchored where the eye expects;
 * the amplitude envelope returns to 0 before the pass ends, so it settles on the
 * authored glyph rather than being cut off mid-ripple; and the wave is one gust
 * that decays, not a loop, so it never reads as ambient. The still frame at 60%
 * is a bookmark with a slight lean (§0 gate 2).
 *
 * Second worry, the FIFTIETH HOVER: Cloth runs 1.5s, Expressive tier (§8). It is
 * the gallery piece; 1 · Draw and 2 · Drop are the productive-tier picks for a
 * save button. Nothing here repeats or carries an ambient layer, so nothing moves
 * unless the user is pointing at it (test 5), and every gesture is inside the
 * mark's own lane so the hit area never moves under the cursor (test 2).
 */

/* -- geometry ------------------------------------------------------------- */

const HW = 64; // half width
const TOP = 40; // top edge y
const EDGE_TOP = 48; // where the corner arcs end and the vertical edges begin
const NOTCH = 184; // the V apex
const TAIL = 224; // the tail tips
const SAMPLES = 8; // segments per vertical edge for the cloth spline

/** The authored glyph, for the static / reduced-motion render. */
const SRC = "M192,224l-64-40L64,224V48a8,8,0,0,1,8-8H184a8,8,0,0,1,8,8Z";

/** Straight-edge rebuild — 0.0000% against SRC at notchY 184. */
function bookmark(notchY: number) {
  return (
    `M${128 - HW},${EDGE_TOP}a8,8,0,0,1,8,-8H${128 + HW - 8}a8,8,0,0,1,8,8` +
    `L${128 + HW},${TAIL}L128,${notchY.toFixed(2)}L${128 - HW},${TAIL}Z`
  );
}

/** Catmull-Rom through sampled points as cubics. Collinear input -> straight. */
function spline(pts: [number, number][]) {
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(2)},${c1y.toFixed(2)},${c2x.toFixed(2)},${c2y.toFixed(2)},${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return d;
}

/** Sampled/smoothed rebuild with a horizontal displacement dx(y).
 *  dx = 0 reproduces SRC exactly (0.0000%). */
function bookmarkWave(dx: (y: number) => number) {
  const edge = (sign: 1 | -1) => {
    const p: [number, number][] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const y = EDGE_TOP + ((TAIL - EDGE_TOP) * i) / SAMPLES;
      p.push([128 + sign * HW + dx(y), y]);
    }
    return p;
  };
  const right = edge(1);
  const left = edge(-1).reverse();
  return (
    `M${(128 - HW + dx(EDGE_TOP)).toFixed(2)},${EDGE_TOP}a8,8,0,0,1,8,-8` +
    `H${128 + HW - 8}a8,8,0,0,1,8,8` +
    spline(right) +
    `L${(128 + dx(NOTCH)).toFixed(2)},${NOTCH}` +
    `L${left[0][0].toFixed(2)},${left[0][1].toFixed(2)}` +
    spline(left) +
    "Z"
  );
}

function Ink({ children }: { children: React.ReactNode }) {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={16}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </g>
  );
}

/* == 1. DRAW ================================================================
   The bookmark draws itself in one continuous stroke.

   The mark is `fill="none" stroke`, so `pathLength` is native rather than faked
   with clips (§5) — the `blueprint` precedent. It opens on `pathLength: 0`,
   which §1 otherwise forbids, and is licensed only because DRAWING IS THE VERB
   of a mark being placed. It closes on rest.

   THE OPACITY TWEEN IS NOT DECORATION. Every end here is round-capped, and a
   round-capped stroke at `pathLength: 0` renders a full 16-wide DOT parked at the
   start point. This is a LONG stroke — the closed outline runs ~670 units — so it
   takes the long-stroke remedy: opacity gets its own much faster tween, up over
   the first 5% of the pass. Fading it across the whole draw would hold the
   finished part semi-transparent for most of a second, which §5 separates
   explicitly from the short-stroke case. */
const draw: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: 0.7, ease: ARRIVE },
      opacity: { duration: 0.05, ease: "linear" },
    },
  },
};

/* == 2. DROP ================================================================
   The bookmark is placed: it lifts a little, drops into the page, and settles.

   ANTICIPATION IS 14 UNITS AGAINST A 20-UNIT FALL — §10's 10-20% rule scaled to
   an icon, and the reason this reads as being PLACED rather than as sliding. The
   6-unit settle past home is paper's 3-5% overshoot (§9), not a bounce.

   The bottom lane is only 24.5 units, so the overshoot is capped at 6: the tails
   reach y237.5 at the lowest frame, still inside the artboard. Going deeper
   would clip the tail caps, which §4 rejects outright. */
const drop: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -14, 6, 0],
    transition: {
      duration: 0.62,
      times: [0, 0.3, 0.68, 1],
      ease: ["easeOut", "easeIn", ARRIVE],
    },
  },
};

/* == 3. SWING ===============================================================
   It hangs. The ribbon is pinned at the top edge and swings from it, decaying.

   THE PIVOT IS (128, 44) — the middle of the pinned top edge, not the centre of
   the mark. Swinging about the centre is a spinning label; swinging about the
   pin is a ribbon on a page, and that single coordinate is the whole difference.

   DECAYING AND UNEVEN: -9, +6, -3, 0. §9 puts hanging things on a pendulum, and
   §10 requires the recoveries to decay rather than alternate evenly — an even
   oscillation reads as a metronome, which is a mechanism, not fabric.

   9deg with the tails 180 units from the pivot is 28 units of travel, over the
   floor. The far corner reaches x228 at the extreme, inside the 256 wall (§4). */
const swing: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -9, 6, -3, 0],
    transition: {
      duration: 0.9,
      times: [0, 0.24, 0.5, 0.75, 1],
      ease: ["easeOut", "easeInOut", "easeInOut", ARRIVE],
    },
  },
};

/* == 4. TUG =================================================================
   The ribbon is tugged and the cut flexes: the V snaps up, dips past its rest
   depth, and settles.

   ONLY THE NOTCH MOVES. The outline, the pinned top and both tails are untouched,
   so the mark never changes size — which is what separates this from the
   scale-the-whole-thing version that was thrown away. The notch travels 184 ->
   152 (32 units, over the floor) and the pose at the top of the snap differs from
   rest by 32.5% of the mark's ink: unmistakable at 24px, and still obviously a
   bookmark.

   THE OVERSHOOT GOES THE OTHER WAY (to 192, deeper than rest) because a ribbon
   pulled and released does not stop at its rest shape — it passes it. 8 units,
   under the amplitude floor and correct as §2's exception. */
const TUG_DUR = 0.66;

/* == 5. CLOTH ===============================================================
   A gust catches the ribbon: a ripple runs down it from the pinned edge to the
   tails and dies out.

   THREE THINGS MAKE IT FABRIC RATHER THAN A WAGGLE, and dropping any one of them
   collapses it into the flag-on-a-pole version that was rejected:
     1. THE WAVE TRAVELS. Phase advances with time, so a crest starts near the pin
        and moves down the ribbon. A shape that flexes in place is a lever.
     2. THE AMPLITUDE RAMPS AS u^2 from the pinned top to the free tails. Cloth is
        constrained at its seam and freest at its far end; the square makes the
        top genuinely quiet instead of merely smaller.
     3. THE ENVELOPE IS A GUST, NOT A LOOP — it rises over the first 12% and
        decays away to exactly 0 by the end. Fabric that oscillates forever is a
        mechanism, and an unattended loop would fail the peripheral-vision test.
   1.25 wavelengths along the ribbon: less and it is a lean, more and the ripple
   is finer than the 16-unit stroke and reads as noise at ship size.

   The tails swing +-18 units (36 peak-to-peak). Measured at peak the mark spans
   x38..217.5 against an artboard of 0..256, so nothing clips (§4) even though
   the silhouette is being rebuilt every frame. */
const CLOTH_DUR = 1.5;
const CLOTH_AMP = 18;
const CLOTH_WAVES = 1.25;

function clothDx(u: number, amp = CLOTH_AMP) {
  // u is the pass clock, 0..1
  const env = u < 0.12 ? u / 0.12 : Math.pow(1 - (u - 0.12) / 0.88, 1.5);
  const phase = -u * Math.PI * 2 * 1.6; // the crest travels downward
  return (y: number) => {
    const v = (y - TOP) / (TAIL - TOP);
    return amp * env * v * v * Math.sin(2 * Math.PI * CLOTH_WAVES * v + phase);
  };
}

/* == 6. GUST — 3 + 5 ========================================================
   The swing and the ripple are the same event seen at two scales. A ribbon
   knocked at its pin does not choose between rotating and rippling: the whole
   strip swings from the pin (3) while a wave runs down its length (5), and the
   free end trails the pinned end because that is what "free" means.

   THE SWING IS THE PRIMARY AND THE RIPPLE RIDES IT (§10, overlapping action).
   Composed as an outer rigid rotation about (128,44) with the wave morph inside
   it, so the ripple is computed in the swinging frame — a crest that formed on
   the way out is still on the ribbon on the way back, which is what makes it
   read as one body rather than two effects stacked.

   THE RIPPLE LAGS THE SWING. The swing's first extreme lands at 0.16 of the pass;
   the wave's envelope tops out at 0.12 but its crest only reaches the tails after
   travelling the ribbon, so the tails' largest excursion arrives after the body's
   — the follow-through §10 asks for, produced by the physics rather than by a
   delay constant.

   AMPLITUDE IS CUT TO 14 (from 18) because the swing already carries 28 units of
   tail travel; at 18 the two stacked to a far corner at x246 and the tails
   flailed. The swing settles by 0.7 of the pass and the ripple by 1.0, so the
   body is still before the fabric is — a wrong order (fabric still, body moving)
   reads as a stiff card wobbling. */
const GUST_DUR = 1.5;
const GUST_AMP = 14;
const gustSwing: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -9, 6, -3, 0, 0],
    transition: {
      duration: GUST_DUR,
      times: [0, 0.16, 0.34, 0.52, 0.7, 1],
      ease: ["easeOut", "easeInOut", "easeInOut", ARRIVE, "linear"],
    },
  },
};

/* -- driver + single-writer path ------------------------------------------ */

/**
 * Animates one number and hands back start/stop. See the header for why `d`
 * cannot be keyframed in a variant.
 *
 * `endValue` EXISTS BECAUSE INTERRUPTING A GUST BACKWARDS IS A DEFECT, and it was
 * caught by sampling rather than by eye. The wave variants use a 0..1 clock whose
 * envelope is zero at BOTH ends, so both 0 and 1 are the resting glyph. Settling
 * to 0 therefore looked correct in the source and was wrong on screen: from
 * u=0.75 it replayed three quarters of the ripple in reverse at 2x, which
 * measured as the tails snapping +2 -> -9 -> -3 -> +6 in 180ms — fabric does not
 * un-ripple. Wave variants now finish FORWARD to u=1 (the gust dying out, the
 * `gear` argument: a body completes its stroke), while 4 · Tug keeps
 * `endValue === restValue` because its parameter is a position, not a clock, and
 * returning the notch to 184 is exactly right.
 */
function useDriver(
  run: (v: MotionValue<number>) => { stop: () => void },
  restValue: number,
  endValue: number = restValue,
) {
  const value = useMotionValue(restValue);
  const running = useRef<{ stop: () => void } | null>(null);
  const begin = useCallback(() => {
    running.current?.stop();
    running.current = run(value);
  }, [run, value]);
  const end = useCallback(() => {
    running.current?.stop();
    running.current = animate(value, endValue, { duration: DUR.base, ease: "easeOut" });
  }, [value, endValue]);
  useEffect(() => () => running.current?.stop(), []);
  return { value, begin, end };
}

/** The only writer of `d`. `memo` on stable props so React never re-renders it
 *  and never rewrites the attribute. */
const MorphPath = memo(function MorphPath({
  value,
  build,
}: {
  value: MotionValue<number>;
  build: (v: number) => string;
}) {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const apply = (v: number) => ref.current?.setAttribute("d", build(v));
    apply(value.get());
    return value.on("change", apply);
  }, [value, build]);
  return <path ref={ref} d={build(value.get())} />;
});

/* -- assembly ------------------------------------------------------------- */

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
        fill="none"
      >
        <Ink>
          <path d={SRC} />
        </Ink>
      </svg>
    </div>
  );
}

/** 1-3 are variant-driven, so they share the ordinary shell. */
function shell(name: string, variants: Variants, origin?: { x: number; y: number }) {
  const C = forwardRef<IconHandle, IconProps>(function BookmarkIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Svg size={size} controls={controls}>
          <Ink>
            <motion.path
              d={SRC}
              variants={variants}
              style={origin ? AT(origin.x, origin.y) : undefined}
            />
          </Ink>
        </Svg>
      </div>
    );
  });
  C.displayName = name;
  return C;
}

const DrawIcon = shell("DrawIcon", draw);
const DropIcon = shell("DropIcon", drop);
// The pin: the middle of the top edge, not the centre of the mark.
const SwingIcon = shell("SwingIcon", swing, { x: 128, y: 44 });

/** 4 and 5 morph the outline, so they drive a number and own their bind. */
function morphShell(
  name: string,
  restValue: number,
  run: (v: MotionValue<number>) => { stop: () => void },
  build: (v: number) => string,
  /** Optional rigid motion wrapped AROUND the morph (6 · Gust's swing). */
  body?: { variants: Variants; origin: { x: number; y: number } },
  /** Where an interrupt settles; defaults to rest. Wave clocks finish forward. */
  endValue?: number,
) {
  const C = forwardRef<IconHandle, IconProps>(function BookmarkMorphIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop } = useHover();
    const { value, begin, end } = useDriver(run, restValue, endValue);
    const startAll = useCallback(() => {
      start();
      begin();
    }, [start, begin]);
    const stopAll = useCallback(() => {
      stop();
      end();
    }, [stop, end]);
    useImperativeHandle(ref, () => ({ startAnimation: startAll, stopAnimation: stopAll }), [
      startAll,
      stopAll,
    ]);
    const bind = {
      onMouseEnter: startAll,
      onMouseLeave: stopAll,
      onFocus: startAll,
      onBlur: stopAll,
    };
    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Svg size={size} controls={controls}>
          <Ink>
            {body ? (
              <motion.g variants={body.variants} style={AT(body.origin.x, body.origin.y)}>
                <MorphPath value={value} build={build} />
              </motion.g>
            ) : (
              <MorphPath value={value} build={build} />
            )}
          </Ink>
        </Svg>
      </div>
    );
  });
  C.displayName = name;
  return C;
}

const TugIcon = morphShell(
  "TugIcon",
  NOTCH,
  (v) =>
    animate(v, [NOTCH, 152, 192, NOTCH], {
      duration: TUG_DUR,
      times: [0, 0.3, 0.66, 1],
      ease: ["easeOut", "easeInOut", ARRIVE],
    }),
  (notchY) => bookmark(notchY),
);

const ClothIcon = morphShell(
  "ClothIcon",
  0,
  (v) => {
    v.set(0);
    return animate(v, 1, { duration: CLOTH_DUR, ease: "linear" });
  },
  (u) => bookmarkWave(clothDx(u)),
  undefined,
  1, // finish the gust forward; u=1 is rest (envelope 0), u=0 would rewind it
);

const GustIcon = morphShell(
  "GustIcon",
  0,
  (v) => {
    v.set(0);
    return animate(v, 1, { duration: GUST_DUR, ease: "linear" });
  },
  (u) => bookmarkWave(clothDx(u, GUST_AMP)),
  { variants: gustSwing, origin: { x: 128, y: 44 } },
  1, // as 5 · Cloth: the gust dies out forward, it never un-ripples
);

const VARIANTS: LabVariant[] = [
  { name: "1 · Draw", blurb: "Draws itself in one continuous stroke", Component: DrawIcon },
  { name: "2 · Drop", blurb: "Lifts, drops into the page, settles", Component: DropIcon },
  { name: "3 · Swing", blurb: "Hangs from the pinned top edge, decaying", Component: SwingIcon },
  { name: "4 · Tug", blurb: "The V snaps up, dips past rest, settles", Component: TugIcon },
  {
    name: "5 · Cloth",
    blurb: "A gust runs down the ribbon and dies out",
    Component: ClothIcon,
  },
  {
    name: "6 · Gust",
    blurb: "3 + 5 — swings from the pin while the ripple runs down it",
    Component: GustIcon,
  },
];

export default function BookmarkSimpleLabPage() {
  // playMs must outlast the LONGEST variant or the auto-cycle truncates it —
  // 5 · Cloth runs 1.5s, so anything under 1700 cuts its settle off.
  return <VariantGrid title="Bookmark Simple" variants={VARIANTS} cycleMs={3600} playMs={1900} />;
}
