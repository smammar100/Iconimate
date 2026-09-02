"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from "react";
import { animate, motion, useMotionValue, type MotionValue, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, ARRIVE, DUR, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Globe, five takes. 4 and 5 are the real 3D spins.
 *
 * VERB: it TURNS ON ITS AXIS. A globe is the one mark in the set whose subject is
 * a three-dimensional object seen in projection, and the whole opportunity is to
 * animate the PROJECTION rather than the drawing.
 *
 * MATERIAL: rigid, gimballed (§9) — ARRIVE and detented settles, 0-5% overshoot,
 * 1.2x base for the heavy ones. A globe is a weighted sphere on a mount; it does
 * not squash and it does not spring.
 *
 * ── MEASURED (512x512, counting only pixels that flip ink/no-ink) ──────────
 *
 *   ink bbox   x24..231.5, y24..231.5 — the limb (r96) plus its 8-unit half
 *              stroke. LANE: 24 units clear on all four sides, and the mark is
 *              radially symmetric, so there is no direction with more room than
 *              another. Nothing here travels; every gesture happens in place.
 *
 *   rotate 180deg about (128,128) -> 0.0000%      mirror about x=128 -> 0.0000%
 *
 *   THE PARALLELS ARE EXACT CHORDS OF THE LIMB. The circle's half-width at y96 is
 *   sqrt(96^2 - 32^2) = 90.510; the drawn line runs 37.46..218.54, half-width
 *   90.540. They agree to 0.03 units. That is load-bearing for 3 · Scan: move a
 *   parallel vertically without clipping it and its ends immediately jut OUTSIDE
 *   the sphere, because they are currently sitting exactly on it.
 *
 *   THE LIMB IS A CIRCLE, SO IT CANNOT SHOW ROTATION (§3) — 0.00% at any angle,
 *   the `bicycle`-wheel trap. This is not a limitation to work around here: it is
 *   physically correct. A sphere's silhouette does not change when the sphere
 *   turns. So in every variant below the limb holds still, and it is the MERIDIAN
 *   that carries the rotation.
 *
 * ── HOW THE 3D SPIN IS DONE, AND WHY NOT WITH scaleX ──────────────────────
 *
 * The obvious implementation is `scaleX` on the meridian: squeeze it to nothing
 * and let it swell back. It is wrong, and visibly so. A CSS transform scales the
 * STROKE with the geometry, so a meridian at scaleX 0.25 is drawn with a 4-unit
 * pen down its sides while the limb beside it is still 16 — the mark grows a thin
 * spot exactly where the eye is looking. At scaleX 0 it vanishes outright instead
 * of standing edge-on.
 *
 * So the meridian is REBUILT PARAMETRICALLY and its `d` is morphed instead.
 * `lens(w)` regenerates Phosphor's meridian with the equator half-width set to w,
 * keeping the poles pinned at (128,32) and (128,224) and the command structure
 * byte-for-byte identical so the numbers interpolate cleanly. Verified rather than
 * assumed:
 *
 *     lens(40) vs the authored `d`   ->  0 of 27,341 px  =  0.0000%
 *     lens(0)   ->  bbox x120..135.5, y24..231.5  — a full-height vertical line
 *                   carrying the whole 16-unit stroke, i.e. a true edge-on pose.
 *
 * The rotation is then just w = 40*cos(theta), sampled every 30deg with `linear`
 * between samples — linear is correct here because the globe turns at a CONSTANT
 * ANGULAR RATE (§8: linear is for rotation and progress). The cosine does the
 * rest, and it produces the right physics for free: dw/dtheta is zero at
 * theta=0, so the meridian LINGERS while it faces the viewer, and maximal at
 * theta=90, so it SNAPS through the edge-on pose. Ease the width directly and you
 * get the opposite, which reads as a pulsing lens rather than a turning sphere.
 *
 * ── REJECTED (§17) ─────────────────────────────────────────────────────────
 *
 *   · scaleX ON THE MERIDIAN — the stroke thins with it (above). `vector-effect=
 *     "non-scaling-stroke"` does fix the pen width and was the runner-up; the
 *     `d`-morph was taken instead because it needs no per-renderer vector-effect
 *     support and gives exact pole geometry at every frame.
 *   · SPINNING THE WHOLE MARK about its centre. The limb is invariant (0.00%) and
 *     the parallels would tilt — which is a globe TUMBLING, not turning. A sphere
 *     rotating about its polar axis leaves both untouched.
 *   · ADDING A SECOND OR THIRD MERIDIAN to sell the spin, the way most animated
 *     globe icons do. That is §0 gate 1: the mark contains one meridian, so one
 *     meridian moves. The cosine timing carries the read without new geometry.
 *   · MOVING THE PARALLELS UNCLIPPED (3 · Scan) — they are exact chords, so they
 *     immediately overhang the sphere. Clipped to the limb they foreshorten on
 *     their own, which is what a latitude actually does.
 *
 * ── THE STANDING TEST — the failure I was most worried about ───────────────
 *
 * **4 and 5 pass through a pose where the globe has no meridian bulge at all** —
 * for a few frames the icon is a circle, two chords and a vertical bar. At 20px
 * that could read as a different glyph rather than as a sphere edge-on.
 *
 * Resolved by the timing rather than by softening it: because w = 40*cos(theta) at
 * a constant angular rate, the edge-on pose is the FASTEST part of the pass — the
 * meridian is within 20 units of edge-on for only about 1/6 of each half-turn, and
 * dwells at full width. Checked against §0 gate 2: a still frame 60% through 4 has
 * w = 40*cos(216deg) = -32.4, i.e. a lens at 81% of full width — plainly the globe.
 * The degenerate pose is passed through, never held.
 *
 * Second worry, **the fiftieth hover**: 4 runs 1.6s and 5 runs 2.0s, both
 * Expressive tier (§8) and long for a nav icon. 2 · Tilt (0.7s) is the
 * productive-tier pick. Nothing here repeats, loops, or carries an ambient layer,
 * so none of them competes for peripheral attention while idle (standing test 5).
 */

const R = 96;
const CX = 128;
const CY = 128;
/** The parallels, exact chords of the limb at y96 and y160. */
const PAR_X1 = 37.46;
const PAR_X2 = 218.54;
const PARALLELS = [96, 160] as const;
/** Equator half-width of the authored meridian. */
const W = 40;

/**
 * Phosphor's meridian, rebuilt with the equator half-width as a parameter. The
 * command structure is fixed and only the numbers vary, so a keyframe array of
 * these interpolates. lens(40) is pixel-identical to the authored `d` (0.0000%).
 */
const lens = (w: number) =>
  `M${CX + w},128c0,64,${-w},96,${-w},96s${-w},-32,${-w},-96,${w},-96,${w},-96S${CX + w},64,${CX + w},128Z`;

const TAU = Math.PI * 2;

/**
 * THE ROTATION IS DRIVEN BY A MotionValue, NOT BY VARIANT KEYFRAMES, and that is a
 * measured finding rather than a preference.
 *
 * The first build put `d: [lens(40), lens(34.6), ... ]` straight into a variant,
 * on the assumption that motion interpolates the numbers inside a path string
 * whose command structure is identical. IT DOES NOT. Sampled live from the DOM
 * across a full pass, the meridian's half-width never left the neighbourhood of
 * its rest value:
 *
 *     expected   40 -> 20 -> 0 -> -20 -> -40 -> ... -> 40
 *     observed   40, 39.84, 38.63, 40, 38.87, 40, 38.67   (never reaches 0)
 *
 * So `theta` is animated instead — an ordinary numeric MotionValue, which motion
 * animates reliably — and every meridian's `d` is derived from it through
 * `useTransform`. That also makes the phase-offset meridians in 6 · Sweep almost
 * free: they are the same theta read at a different offset.
 *
 * The cost is that these variants cannot use `useHover`'s `bind` verbatim: the
 * numeric driver has to start and stop alongside the variant controls, so they
 * wrap `start`/`stop` and bind their own handlers. `stopAnimation` still works
 * because the imperative handle wraps the same pair.
 */
function useTheta(duration: number) {
  const theta = useMotionValue(0);
  const running = useRef<{ stop: () => void } | null>(null);

  const begin = useCallback(() => {
    running.current?.stop();
    theta.set(0);
    running.current = animate(theta, TAU, { duration, ease: "linear" });
  }, [theta, duration]);

  /**
   * SNAP TO THE NEAREST MULTIPLE OF PI, not back to 0. w = 40*cos(theta), and the
   * meridian lens is mirror-symmetric about x=128 (the whole mark measures
   * 0.0000% under a mirror), so lens(-40) and lens(40) are the SAME PICTURE.
   * Every multiple of pi is therefore a rest-identical pose, and the nearest one
   * is never more than a quarter-turn away — so an interrupt finishes the turn it
   * is closest to instead of unwinding the whole rotation backwards.
   */
  const end = useCallback(() => {
    running.current?.stop();
    const target = Math.round(theta.get() / Math.PI) * Math.PI;
    running.current = animate(theta, target, { duration: DUR.base, ease: "easeOut" });
  }, [theta]);

  return { theta, begin, end };
}

/**
 * A meridian at longitude offset `phase`, writing its own `d` straight to the DOM.
 *
 * WHY NOT `useTransform` INTO `<motion.path d={...}>` — the obvious version, and
 * the second thing that did not work. Sampled per animation frame, `d` flickered
 * between the driven value and the rest value:
 *
 *     40 40 40 40 -28.3 -26.3 40 40 40 ... 40 -27.8 -26.2 -24.3 -22.1 40 40
 *
 * The interpolation was correct where it appeared (-27.8 -> -22.1 is a clean
 * ramp), but a second writer kept resetting the attribute to lens(40) — a React
 * re-render restoring the prop it owns. Two writers on one attribute is a race,
 * and whichever wins last per frame is arbitrary.
 *
 * So `d` has exactly ONE writer here. The element is a plain `<path>` (motion
 * never touches it), the component is `memo`'d on stable props so React never
 * re-renders it and never rewrites the attribute, and the driver's `on("change")`
 * sets it directly. The `d` prop is still supplied for the first paint, so SSR
 * and the pre-hydration frame both render the authored meridian rather than
 * nothing.
 */
const Meridian = memo(function Meridian({
  theta,
  phase = 0,
}: {
  theta: MotionValue<number>;
  phase?: number;
}) {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const apply = (t: number) => ref.current?.setAttribute("d", lens(W * Math.cos(t + phase)));
    apply(theta.get());
    return theta.on("change", apply);
  }, [theta, phase]);
  return <path ref={ref} d={lens(W * Math.cos(phase))} />;
});

function Limb() {
  return <circle cx={CX} cy={CY} r={R} />;
}
function Parallels() {
  return (
    <>
      {PARALLELS.map((y) => (
        <line key={y} x1={PAR_X1} y1={y} x2={PAR_X2} y2={y} />
      ))}
    </>
  );
}
/** The shared stroke shell. Every variant draws through this, so rest is one
 *  definition rather than five copies that can drift. */
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
   The globe renders itself: the limb sweeps round, the meridian follows it, and
   the two parallels land last.

   EVERY ELEMENT IS `fill="none" stroke`, so `pathLength` is native and free —
   the `blueprint` precedent (§5). Do not port this to a filled mark, where a
   "draw" has to be faked with clips.

   THE OPACITY TWEENS ARE NOT DECORATION. Every element here is round-capped, and
   a round-capped stroke at `pathLength: 0` renders a full 16-wide DOT parked at
   its start point — without them the limb shows a blob at (224,128) and both
   parallels sit as dots at x37.46 through the whole stagger. These are LONG
   strokes (the limb is 603 units), so they take the long-stroke remedy: opacity
   gets its own much faster tween, up over the first 5% of that element's pass.
   Fading across the whole draw instead holds the finished part semi-transparent
   for most of a second, which §5 explicitly separates from the short-stroke case.

   THE ORDER IS THE CONTENT: container, then the axis it is built around, then the
   detail on it. The parallels wait for the meridian to land (§11) rather than
   racing it — 0.09 stagger, 270ms total, inside the budget. */
const drawLimb: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: 0.52, ease: ARRIVE },
      opacity: { duration: 0.05, ease: "linear" },
    },
  },
};
const drawMeridian: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: 0.44, delay: 0.3, ease: ARRIVE },
      opacity: { duration: 0.05, delay: 0.3, ease: "linear" },
    },
  },
};
const drawParallel = (i: number): Variants => ({
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: 0.34, delay: 0.6 + staged(i), ease: ARRIVE },
      opacity: { duration: 0.05, delay: 0.6 + staged(i), ease: "linear" },
    },
  },
});

/* == 2. TILT ================================================================
   The globe is knocked on its gimbal and rocks to a stop.

   THE LIMB SHOWING NOTHING IS THE POINT, not a defect. A circle rotated about its
   centre is itself (§3, 0.00%), so the outline holds perfectly still while the
   meridian and parallels swing inside it — which is exactly what a sphere in a
   mount looks like. Rotating the whole mark costs nothing and reads correctly,
   because the only parts that CAN show the rotation are the only parts that
   should.

   DECAYING AND UNEVEN: -14, +9, -4, 0. A globe on a bearing loses energy fast and
   is not a pendulum, so the recoveries shorten rather than halving cleanly (§10).
   Rigid material, so it settles under ARRIVE with no overshoot past home.

   Amplitude (§2): the parallels' ends sit ~96 units from the centre, so 14deg
   moves them 96 * 14 * 0.01745 = 23.5 units — over the 18-unit floor. The 4deg
   final swing is under it and correct as §2's exception, riding a primary that
   clears it. */
const tilt: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -14, 9, -4, 0],
    transition: {
      duration: 0.7,
      times: [0, 0.26, 0.52, 0.76, 1],
      ease: ["easeOut", "easeInOut", "easeInOut", ARRIVE],
    },
  },
};

/* == 3. SCAN ================================================================
   A latitude sweep: both parallels travel down the sphere and back, foreshortening
   as they approach a pole.

   THE CLIP IS THE WHOLE TRICK. The parallels are EXACT CHORDS of the limb
   (90.540 drawn against 90.510 computed), so they are already touching the
   silhouette — translate one a single unit without clipping and its round cap
   pokes out through the edge of the sphere. Clipped to the limb, their visible
   length is computed by the geometry instead of animated: the upper parallel
   passes the equator and LENGTHENS to the full diameter, the lower one heads for
   the pole and SHORTENS. Two lines on identical keyframes doing visibly opposite
   things is what makes it read as latitude on a sphere rather than as two bars
   sliding.

   32 units of travel — half a parallel spacing, over the amplitude floor, and
   short enough that neither line reaches a pole and degenerates to a dot. */
const scan: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 32, 0],
    transition: { duration: 0.9, times: [0, 0.5, 1], ease: "easeInOut" },
  },
};

/* == 4. SPIN — the 3D turn ==================================================
   The globe rotates a full 360deg about its polar axis. The limb holds (a sphere's
   silhouette is rotation-invariant) and the parallels hold (a latitude maps onto
   itself under a polar spin). ONLY THE MERIDIAN MOVES, and it moves by being
   redrawn at w = 40*cos(theta) — the true orthographic projection of a great
   circle through the poles.

   `linear` BETWEEN SAMPLES IS DELIBERATE and is the one place on this page a
   constant rate is right: the sphere turns at constant angular velocity, and the
   cosine supplies all the acceleration the eye should see. It lingers at full
   width facing the viewer and snaps through edge-on — get that backwards by
   easing the width and the globe reads as a lens being squeezed.

   Rest parity (§1): theta opens on 0 and closes on a multiple of pi, and lens(40)
   is the authored meridian to 0.0000%. Every intermediate frame is a valid
   meridian, so there is no pose in the pass that is not a globe. */
const SPIN_DUR = 1.6;

/* == 5. ORBIT — the showpiece ===============================================
   The same 3D turn, but the globe first leans onto its axial tilt and holds it
   there for the whole rotation before coming back upright. 23.4deg is Earth's
   actual obliquity, and using the real number is free.

   WHY IT BEATS 4: a spin on a vertical axis is a diagram. A spin on a tilted axis
   is a PLANET — the same information, read as a body in space rather than as a
   wireframe. It costs one extra transform and no new geometry.

   THE TILT IS A PARENT GROUP AND THE SPIN IS THE CHILD, which is the only
   arrangement that works: both would otherwise want the same element, and the
   meridian's `d` morph has to happen in the already-tilted frame or the axis
   drifts under it. The parallels ride the tilt group — and because they are
   chords, ROTATING A CHORD ABOUT THE CIRCLE'S CENTRE LEAVES IT A CHORD, so they
   stay exactly on the limb at every tilt angle with no clipping needed. That is a
   property of this mark and the reason the tilt is free here.

   THE LEAN LANDS BEFORE THE TURN STARTS (§11): tilt completes at 0.14, the spin
   begins at 0.16. Overlap them and the globe reads as wobbling while it turns
   rather than as settling onto an axis and then rotating about it. */
const ORBIT_DUR = 2.0;
const TILT_DEG = 23.4;
const orbitTilt: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -TILT_DEG, -TILT_DEG, 0],
    transition: {
      duration: ORBIT_DUR,
      times: [0, 0.14, 0.84, 1],
      ease: [ARRIVE, "linear", ARRIVE],
    },
  },
};

/* == 6. SWEEP — traced off the reference clip ===============================
   Measured off the supplied 6.14s / 324x276 recording rather than eyeballed. The
   clip's globe is sampled at its equator-adjacent row and its ink crossings read,
   as a fraction of the limb radius:

       at rest    [-0.90, -0.45, 0, +0.45, +0.90]
       moving     [-0.88, -0.77, -0.32, +0.11, +0.56, +0.88]
                  [-0.88, -0.65, -0.18, +0.24, +0.69, +0.88]

   Two things fall out. The outer pair is the LIMB and never moves. The inner set
   is evenly spaced — successive gaps 0.45, 0.43, 0.45 — and the whole set DRIFTS
   sideways together, with lines entering at one limb and leaving at the other.
   The parallels and the outline are static in every frame.

   SO THE CLIP IS A WIREFRAME TURN WITH SEVERAL MERIDIANS, not the single-meridian
   projection of 4 · Spin. That is the difference this variant exists to capture,
   and it is also the one honest problem with it: OUR MARK HAS ONE MERIDIAN. §0
   gate 1 says the glyph's own parts move and nothing is added, so two extra
   meridians is a real deviation and is declared here rather than smuggled in.
   What keeps it inside the rules is the boundary condition: the extras are at
   opacity 0 at rest and only exist while the globe is turning, so THE RESTING
   PICTURE IS THE AUTHORED PHOSPHOR GLOBE EXACTLY — the same trade `list`'s scroll
   wrap-row makes, and the same one `star`'s rays make (§15: an accent is earned
   when the mark itself already carries the verb, and here the authored meridian
   turns whether or not the extras are drawn).

   THE EXTRAS ARE THE SAME MERIDIAN AT OTHER LONGITUDES — phases of pi/3 and
   2pi/3 on the same driver, so they are one great circle sampled three times, not
   three invented shapes. They coincide in pairs at a few instants (a meridian at
   +phi and one at -phi project to the same lens, which is correct physics for a
   wireframe with no hidden-line removal) and separate again immediately.

   THE CLIP'S EVEN SPACING IS NOT REPRODUCED, DELIBERATELY. Its lines are evenly
   spaced across the face at all times, which means it slides straight vertical
   lines behind a circular clip rather than projecting them — cheap, and it reads
   as a cylinder rather than a sphere. Ours bunch toward the limb because
   w = 40*cos(theta) is the true projection. That is a departure from the
   reference and an improvement on it; the motion matches, the mechanism is
   better. */
const SWEEP_DUR = 2.2;
const SWEEP_PHASES = [0, Math.PI / 3, (2 * Math.PI) / 3];
/** The two added meridians exist only while the globe turns. */
const sweepExtra: Variants = {
  normal: { opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 1, 1, 0],
    transition: { duration: SWEEP_DUR, times: [0, 0.12, 0.88, 1], ease: "linear" },
  },
};

/* == 7. WRAP — traced off the Popicons clip ================================
   Measured off the supplied 2.97s / 848x848 recording, sampled at a row 0.35R
   above the equator, ink crossings as a fraction of the limb radius:

       0.00  [-0.86, -0.31,  0.31, 0.86]          rest: limb + one lens
       0.17  [-0.82, -0.22,  0.38, 0.86]          lens centre +0.08  <- ANTICIPATION
       0.35  [-0.86, -0.61, -0.03, 0.55, 0.86]    lens at -0.32; next lens's edge at +0.55
       0.52  [-0.86, -0.44,  0.16, 0.79]          new lens at -0.14  <- OVERSHOOT past centre
       0.70  [-0.86, -0.34,  0.28, 0.83]          -0.03, settling
       0.87  [-0.86, -0.31,  0.32, 0.84]          rest, and static for the remaining 2.1s

   Read frame by frame it is unambiguous: the meridian nudges RIGHT by ~0.08R,
   sweeps LEFT a full meridian pitch while the next meridian enters from the
   right limb and a third peeks in at the left, overshoots centre by ~0.14R, and
   settles. The lens keeps a constant width throughout (0.60-0.62R at every
   sample), so the clip does NOT project — it slides a repeating texture of
   lenses sideways behind the limb. The equator and the outline never move.

   THAT IS A DIFFERENT MECHANISM FROM 4-6, AND A SIMPLER ONE. No projection, no
   `d` morph, no MotionValue: three copies of the authored lens at a fixed pitch
   ride one `x` translate inside a circular clip. Everything outside the sphere
   is cut by geometry, so:

     · REST IS EXACT WITH NO OPACITY TRICKS. At x=0 the neighbours sit a full pitch
       out and their stroke lies entirely beyond r96 — pitch 148 puts the inner
       stroke edge at 148-40-8 = 100 > 96 — so the clip removes them completely
       and the picture is limb + one lens + two parallels: the Phosphor globe.
     · THE GESTURE LANDS ON REST BY CONSTRUCTION. After a one-pitch sweep the
       right neighbour occupies exactly the slot the authored lens vacated. So
       `normal` parks on x = -PITCH (the same picture as x = 0), which makes a
       hover-out after completion a no-op and a mid-gesture interrupt finish the
       wrap forward — the `gear` arrangement, for the same reason.
     · THE LEFT PEEK IN THE CLIP AT 0.17 COMES FREE. During the +8 anticipation
       the left neighbour's stroke edge reaches -92, four units inside the clip,
       and shows as a sliver at the left limb — which is precisely what the
       reference shows at that frame.

   TIMING IS DELIBERATELY SLOWER THAN THE REFERENCE. Popicons crosses the whole
   pitch in ~0.31s, which at 24px is a blink — you register that the globe
   twitched, not that a line travelled limb to limb. Here the traverse IS the
   content, so the sweep phase gets 1.1s of a 1.6s pass under a plain easeInOut
   (SWEEP's sharp middle rushed the crossing), which keeps the incoming line
   visible for the whole trip from the right limb to centre. The +8 anticipation
   and the 13-unit overshoot (0.14R) are kept from the measurement; ARRIVE onto
   the detent. The reference is a globe on a mount, so the overshoot is the
   swing of a heavy body past its stop and back, not a spring — one pass, no
   bounce.

   HONESTLY, WHAT THIS IS NOT: a sphere. A texture sliding at constant width
   behind a circle is a cylinder, and 4 · Spin's cosine is the correct optics.
   It is here because the reference does it, it reads well at 24px where the
   distinction is invisible, and it is the cheapest of the seven to ship. */
/*   ── SECOND PASS: SPHERE KINEMATICS INSTEAD OF A SLIDING TEXTURE ──────────
   The first build of this variant slid three copies of the lens sideways at
   constant width behind a circular clip. It matched the reference frame for
   frame and it read as a CYLINDER: lines crossed the face at one speed, kept one
   width, and hit the limb at full curvature. A sphere does none of that. On a
   sphere a meridian at longitude phi projects to x = R*sin(phi)*cos(lat): it
   straightens into a vertical line at the centre, bows outward as it approaches
   the limb, moves FASTEST at the centre and SLOWEST into the edge (dx/dphi =
   R*cos(phi)), and merges with the outline rather than sliding under it. That
   is what "natural" means here, and it is the whole of this rebuild.

   EACH MERIDIAN IS ONE POLE-TO-POLE EDGE — half of a great circle, the front
   half, which is hidden-line removal done by construction. Its shape is
   Phosphor's own lens edge for |phi| near the rest longitude, BLENDED toward a
   true elliptical quadrant as it nears the limb (`b` below): a raw lens edge
   scaled out to the limb sat 20 units inside the outline at mid-latitude,
   measured, because the lens bezier is pointier at the poles than a circle. At
   b=1 the curve is the standard 0.5523 circle approximation and lies under the
   limb's stroke. Meridians fade over their last 24 degrees before the limb (24u
   of arc at the equator) — opacity softening something already travelling (§1),
   and physically the place where a foreshortened line merges into the outline.

   THE MERIDIAN SET IS PERIODIC AT 49.2 DEGREES. The authored lens is the pair at
   +-24.6 (96*sin 24.6 = 40, the equator half-width), so the set
   {24.6 + 49.2k} contains it and maps onto itself under a one-pitch turn. The
   gesture turns exactly one pitch: the right edge crosses to become the left,
   the left dissolves into the limb, and the next meridian emerges from the
   right limb to become the new right edge — landing on rest by geometry, and
   parking `normal` there for the same interrupt behaviour as `gear`.

   REST PARITY IS EXACT, NOT APPROXIMATE, AND HERE IS WHY IT NEEDED CARE. Two
   open edges at +-40 differ from the one closed lens by 144 px of 79,608 —
   0.1809% on the whole mark, above the 0.1% gate — at the pole cusps, where a
   closed path's round JOIN and two overlapping round CAPS rasterise differently
   on a degenerate tangent, and the residue extends ~3 units past the limb band.
   So while theta sits ON a detent the authored closed lens is drawn and the two
   slot edges are hidden; the instant theta leaves it, they swap. The swap is a
   sub-pixel change at 24px and happens only on a frame where the mark is
   already moving. Rest is therefore lens(40): 0.0000%.

   TIMING keeps the reference's shape — a 4-degree anticipation the wrong way,
   one pitch of travel, 4 degrees of overshoot, settle — over 1.6s so the crossing
   reads. Constant angular rate through the middle; the cosine supplies the
   slow-in at the limb. */
const LENS_DEG = 24.6; // asin(40/96)
const PITCH_DEG = 2 * LENS_DEG;
const FADE_DEG = 24;
const HIDE_DEG = 73.8; // fully faded here; = LENS_DEG + PITCH_DEG, so the next-but-one is invisible at rest
const WRAP_DUR = 1.6;
const DEG = Math.PI / 180;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** One pole-to-pole meridian edge at equator offset w (signed), blended by b
 *  from Phosphor's lens edge (b=0) to a true elliptical quadrant (b=1). */
function edgePath(w: number, b: number) {
  const cx = (128 + b * 0.5523 * w).toFixed(2);
  const wx = (128 + w).toFixed(2);
  const y1 = (64 + 11 * b).toFixed(2);
  const y2 = (192 - 11 * b).toFixed(2);
  return `M128,32C${cx},32,${wx},${y1},${wx},128C${wx},${y2},${cx},224,128,224`;
}

/** Is theta (degrees) sitting on a detent of the meridian lattice? */
const onDetent = (t: number) => {
  const m = ((t % PITCH_DEG) + PITCH_DEG) % PITCH_DEG;
  return m < 0.02 || m > PITCH_DEG - 0.02;
};

function useTurn() {
  const theta = useMotionValue(0); // degrees
  const running = useRef<{ stop: () => void } | null>(null);
  const begin = useCallback(() => {
    running.current?.stop();
    theta.set(0);
    running.current = animate(theta, [0, 4, -PITCH_DEG - 4, -PITCH_DEG], {
      duration: WRAP_DUR,
      times: [0, 0.12, 0.8, 1],
      ease: ["easeOut", "easeInOut", ARRIVE],
    });
  }, [theta]);
  const end = useCallback(() => {
    running.current?.stop();
    const target = Math.round(theta.get() / PITCH_DEG) * PITCH_DEG;
    running.current = animate(theta, target, { duration: DUR.base, ease: "easeOut" });
  }, [theta]);
  return { theta, begin, end };
}

/** Meridian k of the lattice, writing `d` and `opacity` straight to the DOM
 *  from the driver (single writer — see Meridian above for why). */
const LatticeEdge = memo(function LatticeEdge({
  theta,
  k,
}: {
  theta: MotionValue<number>;
  k: number;
}) {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = (t: number) => {
      const phi = LENS_DEG + k * PITCH_DEG + t;
      const a = Math.abs(phi);
      const w = 96 * Math.sin(phi * DEG);
      const b = clamp01((a - LENS_DEG) / (90 - LENS_DEG));
      const fade = a >= HIDE_DEG ? 0 : clamp01((HIDE_DEG - a) / FADE_DEG);
      el.setAttribute("d", edgePath(w, b));
      el.setAttribute("opacity", String(onDetent(t) ? 0 : fade));
    };
    apply(theta.get());
    return theta.on("change", apply);
  }, [theta, k]);
  return <path ref={ref} d={edgePath(0, 0)} opacity={0} />;
});

/** The authored closed lens, shown only while theta is on a detent. */
const RestLens = memo(function RestLens({ theta }: { theta: MotionValue<number> }) {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const apply = (t: number) => ref.current?.setAttribute("opacity", onDetent(t) ? "1" : "0");
    apply(theta.get());
    return theta.on("change", apply);
  }, [theta]);
  return <path ref={ref} d={lens(W)} />;
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
          <Limb />
          <path d={lens(W)} />
          <Parallels />
        </Ink>
      </svg>
    </div>
  );
}

function shell(
  name: string,
  render: (ids: { clipId: string }) => React.ReactNode,
) {
  const C = forwardRef<IconHandle, IconProps>(function GlobeIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    // Own clip id per instance, or the first tile on the page captures them all.
    const clipId = `globe-${useId()}`;
    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Svg size={size} controls={controls}>
          {render({ clipId })}
        </Svg>
      </div>
    );
  });
  C.displayName = name;
  return C;
}

const DrawIcon = shell("DrawIcon", () => (
  <Ink>
    <motion.circle cx={CX} cy={CY} r={R} variants={drawLimb} />
    <motion.path d={lens(W)} variants={drawMeridian} />
    {PARALLELS.map((y, i) => (
      <motion.line key={y} x1={PAR_X1} y1={y} x2={PAR_X2} y2={y} variants={drawParallel(i)} />
    ))}
  </Ink>
));

const TiltIcon = shell("TiltIcon", () => (
  <motion.g variants={tilt} style={AT(CX, CY)}>
    <Ink>
      <Limb />
      <path d={lens(W)} />
      <Parallels />
    </Ink>
  </motion.g>
));

const ScanIcon = shell("ScanIcon", ({ clipId }) => (
  <>
    <defs>
      <clipPath id={clipId}>
        <circle cx={CX} cy={CY} r={R} />
      </clipPath>
    </defs>
    <Ink>
      <Limb />
      <path d={lens(W)} />
      {/* Clipped to the limb, so the parallels foreshorten instead of overhanging. */}
      <g clipPath={`url(#${clipId})`}>
        {PARALLELS.map((y) => (
          <motion.line key={y} x1={PAR_X1} y1={y} x2={PAR_X2} y2={y} variants={scan} />
        ))}
      </g>
    </Ink>
  </>
));

/** Shell for the theta-driven variants: they need their own bind, because the
 *  numeric driver has to start and stop alongside the variant controls. */
function spinShell(
  name: string,
  duration: number,
  render: (theta: MotionValue<number>) => React.ReactNode,
) {
  const C = forwardRef<IconHandle, IconProps>(function GlobeSpinIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop } = useHover();
    const { theta, begin, end } = useTheta(duration);
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
          {render(theta)}
        </Svg>
      </div>
    );
  });
  C.displayName = name;
  return C;
}

const SpinIcon = spinShell("SpinIcon", SPIN_DUR, (theta) => (
  <Ink>
    <Limb />
    <Meridian theta={theta} />
    <Parallels />
  </Ink>
));

const OrbitIcon = spinShell("OrbitIcon", ORBIT_DUR, (theta) => (
  <motion.g variants={orbitTilt} style={AT(CX, CY)}>
    <Ink>
      <Limb />
      <Meridian theta={theta} />
      <Parallels />
    </Ink>
  </motion.g>
));

const SweepIcon = spinShell("SweepIcon", SWEEP_DUR, (theta) => (
  <Ink>
    <Limb />
    {/* The authored meridian — always present, carries the verb on its own. */}
    <Meridian theta={theta} phase={SWEEP_PHASES[0]} />
    {/* The same great circle at two other longitudes. Opacity lives on the
        wrapper group so that `d` keeps exactly one writer (see Meridian). */}
    <motion.g variants={sweepExtra}>
      <Meridian theta={theta} phase={SWEEP_PHASES[1]} />
    </motion.g>
    <motion.g variants={sweepExtra}>
      <Meridian theta={theta} phase={SWEEP_PHASES[2]} />
    </motion.g>
    <Parallels />
  </Ink>
));

const WrapIcon = forwardRef<IconHandle, IconProps>(function WrapIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop } = useHover();
  const { theta, begin, end } = useTurn();
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
  const bind = { onMouseEnter: startAll, onMouseLeave: stopAll, onFocus: startAll, onBlur: stopAll };
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <Ink>
          {/* Meridians first; limb and parallels draw over them so an edge that
              has merged into the outline is covered by the outline's own ink. */}
          {[-2, -1, 0, 1, 2].map((k) => (
            <LatticeEdge key={k} theta={theta} k={k} />
          ))}
          <RestLens theta={theta} />
          <Limb />
          <Parallels />
        </Ink>
      </Svg>
    </div>
  );
});

const VARIANTS: LabVariant[] = [
  { name: "1 · Draw", blurb: "Limb, then meridian, then the parallels", Component: DrawIcon },
  { name: "2 · Tilt", blurb: "Knocked on its gimbal, rocks to a stop", Component: TiltIcon },
  { name: "3 · Scan", blurb: "Latitudes sweep, foreshortened by the limb", Component: ScanIcon },
  { name: "4 · Spin", blurb: "True 3D: meridian redrawn at 40·cos θ", Component: SpinIcon },
  { name: "5 · Orbit", blurb: "3D spin on Earth's 23.4° axial tilt", Component: OrbitIcon },
  {
    name: "6 · Sweep",
    blurb: "From clip 1 — three meridians turn as a wireframe",
    Component: SweepIcon,
  },
  {
    name: "7 · Wrap",
    blurb: "From Popicons — anticipate, sweep one pitch, settle",
    Component: WrapIcon,
  },
];

export default function GlobeLabPage() {
  // playMs must outlast the LONGEST variant or the auto-cycle truncates it —
  // 6 · Sweep runs 2.2s, so anything under 2400 cuts its meridians' fade-out off.
  return <VariantGrid title="Globe" variants={VARIANTS} cycleMs={4600} playMs={2600} />;
}
