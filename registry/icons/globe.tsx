"use client";

import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { animate, motion, useMotionValue, type MotionValue } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// TURN — the globe rotates one meridian pitch about its polar axis, as a sphere
// and not as a sliding texture. A small anticipation the wrong way, one pitch of
// travel, a few degrees of overshoot, settle. Promoted from
// `app/lab/globe/page.tsx` (variant 7 of 7); the six rejected takes and the
// reference-clip measurements live there.
//
// VERB: it TURNS ON ITS AXIS. A globe is the one mark in the set whose subject is
// a three-dimensional object seen in projection, and the whole opportunity is to
// animate the PROJECTION rather than the drawing.
//
// MATERIAL: rigid, gimballed (§9) — a weighted sphere on a mount. Constant angular
// rate through the middle, ARRIVE onto the detent, a single heavy overshoot and no
// bounce. It does not squash and it does not spring.
//
// ── MEASURED (512x512 / 1024x1024, counting only pixels that flip ink/no-ink) ─
//
//   ink bbox   x24..231.5, y24..231.5 — the limb (r96) plus its half stroke.
//              LANE: 24 units all round, and nothing here travels: every part of
//              the gesture happens inside the sphere.
//
//   rotate 180deg about (128,128) -> 0.0000%      mirror about x=128 -> 0.0000%
//
//   THE PARALLELS ARE EXACT CHORDS OF THE LIMB (90.540 drawn against 90.510
//   computed at y96). Under a polar spin a latitude maps onto itself, so they
//   hold still, as does the limb — a sphere's silhouette does not change when the
//   sphere turns (§3: a circle rotated about its centre is itself, 0.00%).
//   ONLY THE MERIDIANS MOVE.
//
//   THE AUTHORED MERIDIAN IS A POINTED LENS, NOT AN ELLIPSE — an ellipse of the
//   same extents differs from it by 37.95%. And it is 96*sin(24.6deg) = 40 units
//   wide at the equator, i.e. its two edges are the front halves of the meridians
//   at longitude +-24.6deg. That fixes the lattice: meridians at 24.6 + 49.2k
//   contain the authored pair and map onto themselves under a one-pitch turn,
//   which is what lets the gesture LAND ON REST BY GEOMETRY.
//
// ── SPHERE KINEMATICS, and why a sliding texture was thrown away ───────────
//
// The first build (and the reference clip it was traced from) slid copies of the
// lens sideways at constant width behind a circular clip. It read as a CYLINDER:
// lines crossed the face at one speed, kept one shape, and hit the edge at full
// curvature. On a sphere a meridian at longitude phi projects to
// x = R*sin(phi)*cos(lat): it straightens into a vertical bar at the centre,
// bows outward as it nears the limb, moves FASTEST at the centre and SLOWEST
// into the edge (dx/dphi = R*cos(phi)), and merges with the outline. Measured
// live off the DOM at 70ms steps, the entering edge goes 93, 92, 90, 85, 79, 71,
// 62, 55, 46, 40 and the leaving edge -40, -47, -56, -66, -74, -81, -86, -90,
// -92 — creeping at the limb, ~12 units a step across the centre.
//
// EACH MERIDIAN IS ONE POLE-TO-POLE EDGE — the front half of a great circle,
// which is hidden-line removal by construction. Its shape is Phosphor's own lens
// edge near the rest longitude, BLENDED toward a true elliptical quadrant as it
// nears the limb (`b` below): a lens edge merely scaled out to the limb sat 20
// units inside the outline at mid-latitude, because the lens bezier is pointier
// at the poles than a circle. Meridians fade over their last 24deg before the
// limb — opacity softening something already travelling (§1), and physically the
// place a foreshortened line merges into the outline.
//
// ── REST PARITY IS EXACT, AND HERE IS WHY IT NEEDED CARE ───────────────────
//
// Two open edges at +-40 differ from the one closed lens by 144 px of 79,608 —
// 0.1809% on the whole mark, above the 0.1% gate — at the pole cusps, where a
// closed path's round JOIN and two overlapping round CAPS rasterise differently
// on a degenerate tangent, and the residue extends ~3 units past the limb band.
// Pairing the edges into one closed path was tried and cannot survive a full
// pitch: the slot handoff at the centre is discontinuous and pops. So while
// theta sits ON a detent the authored closed lens is drawn and the edges are
// hidden; the instant it leaves, they swap. The swap is sub-pixel at 24px and
// happens only on a frame where the mark is already moving. Rest is lens(40),
// which is the authored `d` to 0.0000%.
//
// ── WHY `d` IS WRITTEN FROM A MotionValue, NOT FROM VARIANTS ───────────────
//
// Measured, not assumed. Path `d` keyframes in a variant do NOT interpolate —
// sampled across a pass the half-width never left ~40. Driving `d` from
// `useTransform` into `<motion.path>` then raced a React re-render restoring the
// prop (the attribute flickered 40 <-> -28 frame to frame). So every edge here
// is a plain `<path>` in a `memo`'d component with EXACTLY ONE WRITER for `d`
// and `opacity`: the driver's `on("change")`. The cost is that `useHover`'s
// `bind` cannot be spread verbatim — the driver must start and stop alongside
// the variant controls — so the handlers are wrapped; the imperative handle
// wraps the same pair, so `startAnimation` / `stopAnimation` still work.
//
// `normal` PARKS ON THE FINAL DETENT: every multiple of the pitch is the same
// picture, so hover-out after completion is a no-op and a mid-gesture interrupt
// snaps to the NEAREST detent (never more than half a pitch away) rather than
// unwinding the turn — the `gear` arrangement, for the same reason.
//
// ── REJECTED (§17) ─────────────────────────────────────────────────────────
//
//   · scaleX ON THE MERIDIAN. A CSS transform scales the pen with the geometry:
//     at scaleX 0.25 the stroke measured 4.5 units against the limb's 16-18, and
//     at scaleX 0 the meridian vanished instead of standing edge-on.
//     `vector-effect="non-scaling-stroke"` only half-fixed it (8 units).
//   · SWAPPING THE LENS FOR AN `<ellipse>` and tweening `rx` — 37.95% off the
//     authored mark at rest.
//   · SPINNING THE WHOLE MARK about its centre — the limb is invariant and the
//     parallels would tilt, which is a globe TUMBLING, not turning.
//   · A SINGLE MERIDIAN BREATHING (w = 40*cos theta) — correct optics, but with
//     one meridian the sphere never shows a line crossing the face; it reads as
//     a lens being squeezed. It survives in the lab as `4 · Spin`.
//   · THE SLIDING TEXTURE (above) — flat.
//
// ── THE STANDING TEST — the failure I was most worried about ───────────────
//
// THIS ADDS MERIDIANS THE MARK DOES NOT HAVE. §0 gate 1 says the glyph's own
// parts move and nothing is added; a turn that shows the NEXT meridian entering
// cannot obey that literally. It is declared rather than smuggled: the extra
// edges are the same great circle at other longitudes on the same driver, they
// are opacity 0 at rest, and the authored lens — the mark's own part — carries
// the turn on its own (delete the extras and it still crosses the face). That is
// §15's earned-accent case, the trade `star`'s rays make.
//
// Second worry, THE FIFTIETH HOVER: 1.6s is Expressive tier (§8) and `globe` is
// a nav/locale icon that may fire all day. It survives that room because it is
// one closed round trip with no repeat, no ambient layer and no accent that
// outlives the gesture — nothing moves unless the user is pointing at it, so it
// cannot compete for peripheral attention (test 5). The hit area is fixed: every
// part of the motion is inside the limb, so the silhouette never changes and
// never moves out from under the cursor. Every exit lands on a detent, which is
// the resting picture.

const R = 96;
const CX = 128;
const CY = 128;
const PAR_X1 = 37.46;
const PAR_X2 = 218.54;
const PARALLELS = [96, 160] as const;
/** Equator half-width of the authored meridian. */
const W = 40;

/** Phosphor's meridian, rebuilt with the equator half-width as a parameter.
 *  lens(40) is pixel-identical to the authored `d` (0.0000%). */
const lens = (w: number) =>
  `M${CX + w},128c0,64,${-w},96,${-w},96s${-w},-32,${-w},-96,${w},-96,${w},-96S${CX + w},64,${CX + w},128Z`;

const LENS_DEG = 24.6; // asin(40/96)
const PITCH_DEG = 2 * LENS_DEG;
const FADE_DEG = 24;
const HIDE_DEG = LENS_DEG + PITCH_DEG; // 73.8 — the next-but-one meridian is invisible at rest
const TURN_DUR = 1.6;
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
    // 4deg anticipation the wrong way, one pitch plus 4deg over, settle.
    running.current = animate(theta, [0, 4, -PITCH_DEG - 4, -PITCH_DEG], {
      duration: TURN_DUR,
      times: [0, 0.12, 0.8, 1],
      ease: ["easeOut", "easeInOut", ARRIVE],
    });
  }, [theta]);
  const end = useCallback(() => {
    running.current?.stop();
    const target = Math.round(theta.get() / PITCH_DEG) * PITCH_DEG;
    running.current = animate(theta, target, { duration: DUR.base, ease: "easeOut" });
  }, [theta]);
  useEffect(() => () => running.current?.stop(), []);
  return { theta, begin, end };
}

/** Meridian k of the lattice. Writes `d` and `opacity` straight to the DOM from
 *  the driver — the single writer. */
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
      const w = R * Math.sin(phi * DEG);
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

const LATTICE = [-2, -1, 0, 1, 2] as const;

export const GlobeIcon = forwardRef<IconHandle, IconProps>(function GlobeIcon(
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

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 256 256"
          fill="none"
          stroke="currentColor"
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx={CX} cy={CY} r={R} />
          <path d={lens(W)} />
          {PARALLELS.map((y) => (
            <line key={y} x1={PAR_X1} y1={y} x2={PAR_X2} y2={y} />
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial="normal"
        animate={controls}
      >
        {/* Meridians first; limb and parallels draw over them so an edge that
            has merged into the outline is covered by the outline's own ink. */}
        {LATTICE.map((k) => (
          <LatticeEdge key={k} theta={theta} k={k} />
        ))}
        <RestLens theta={theta} />
        <circle cx={CX} cy={CY} r={R} />
        {PARALLELS.map((y) => (
          <line key={y} x1={PAR_X1} y1={y} x2={PAR_X2} y2={y} />
        ))}
      </motion.svg>
    </div>
  );
});
