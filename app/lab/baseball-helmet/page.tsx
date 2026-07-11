"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/**
 * LAB — Baseball helmet icon, 5 animation candidates. Full choreography with
 * secondary action everywhere: the glyph splits into three 1:1 parts so each
 * can react on its own —
 *   SHELL — dome + its interior subpaths (even-odd), bill removed from the
 *           boundary.
 *   BILL  — the face guard bar (x200–256, y120–136, rounded tip) so it can
 *           twang on impacts.
 *   EAR   — the ear-pad ring + dot hole (even-odd) so it can rattle & pulse.
 * Balls, dust, stars, and impact ticks are extra actors hidden at rest.
 */
const SHELL =
  "M223.7,120A104,104,0,0,0,16,128v24a72.08,72.08,0,0,0,72,72h40a72.08,72.08,0,0,0,72-72V136h23.7Z" +
  "M184,152a56.06,56.06,0,0,1-50.46,55.72A71.87,71.87,0,0,0,160,152V136h24Z" +
  "M152,120a8,8,0,0,0-8,8v24a56,56,0,0,1-112,0V128a88,88,0,0,1,175.64-8Z";
const BILL = "M200,120h48a8,8,0,0,1,0,16H200Z";
const EAR =
  "M88,128a28,28,0,1,0,28,28A28,28,0,0,0,88,128Zm0,40a12,12,0,1,1,12-12A12,12,0,0,1,88,168Z";

const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});
const BASE = AT(128, 224); // where the helmet sits
const BILL_ROOT = AT(200, 128); // the bill's hinge into the shell
const EAR_EYE = AT(88, 156);

const HIDDEN = { opacity: 0, transition: { duration: 0.1 } };

function Svg({
  size,
  controls,
  children,
}: {
  size: number;
  controls: ReturnType<typeof useHover>["controls"];
  children: React.ReactNode;
}) {
  return (
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
      {children}
    </motion.svg>
  );
}

function Helmet({
  shell,
  bill,
  ear,
}: {
  shell?: Variants;
  bill?: Variants;
  ear?: Variants;
}) {
  return (
    <>
      <motion.path d={SHELL} fillRule="evenodd" variants={shell} />
      <motion.path d={BILL} variants={bill} style={BILL_ROOT} />
      <motion.path d={EAR} fillRule="evenodd" variants={ear} style={EAR_EYE} />
    </>
  );
}

/* ── 1. BEANBALL ─────────────────────────────────────────────────────────────
   A wild pitch bonks the dome: the ball zips in from the corner, ricochets
   off in a burst of impact ticks, the helmet recoils and shakes it off while
   the ear pad rattles — that's what it's for. */
const BB = 1.4;
const bbBall: Variants = {
  normal: { ...HIDDEN, x: 0, y: 0 },
  animate: {
    opacity: [0, 1, 1, 1, 0],
    x: [64, 22, 0, -70, -90],
    y: [-58, -28, 0, -34, -28],
    transition: { duration: 0.55, ease: "easeOut", times: [0, 0.2, 0.42, 0.85, 1] },
  },
};
const bbTick = (angle: number): Variants => {
  const rad = (angle * Math.PI) / 180;
  return {
    normal: { ...HIDDEN, scale: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0, 1.1, 0.3],
      x: [0, Math.cos(rad) * 24],
      y: [0, Math.sin(rad) * -22],
      transition: { duration: 0.35, ease: "easeOut", delay: 0.22 },
    },
  };
};
const bbShell: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 0, 7, -2, 3, 0, 0],
    rotate: [0, 0, -5, 2.5, -3.5, 2, 0],
    transition: { duration: BB, ease: "easeOut", times: [0, 0.16, 0.24, 0.4, 0.56, 0.74, 1] },
  },
};
const bbEar: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 0, -4, 4, -2.5, 1, 0],
    transition: { duration: BB, ease: "easeOut", times: [0, 0.24, 0.34, 0.48, 0.62, 0.8, 1] },
  },
};

const HelmetBeanballIcon = forwardRef<IconHandle, IconProps>(
  function HelmetBeanballIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.circle cx={160} cy={64} r={13} variants={reduced ? undefined : bbBall} />
          {[150, 95, 40].map((a) => (
            <motion.circle key={a} cx={166} cy={58} r={6} variants={reduced ? undefined : bbTick(a)} />
          ))}
          <motion.g variants={reduced ? undefined : bbShell} style={BASE}>
            <Helmet ear={reduced ? undefined : bbEar} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 2. DON ──────────────────────────────────────────────────────────────────
   Batter up: the helmet drops on from above, lands with a heavy squash and a
   double dust kick — then the impact cascades: the bill twangs itself still
   while the ear pad pulses like it took the shock last. */
const DON = 1.4;
const donShell: Variants = {
  normal: { y: 0, scaleY: 1, transition: { duration: 0 } },
  animate: {
    y: [-30, 0, 0, 0],
    scaleY: [1, 0.86, 1.06, 1],
    transition: { duration: DON * 0.45, ease: "easeIn", times: [0, 0.55, 0.8, 1] },
  },
};
const donBill: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, -13, 9, -5, 2, 0],
    transition: { duration: DON, ease: "easeOut", times: [0, 0.24, 0.36, 0.52, 0.68, 0.84, 1] },
  },
};
const donEar: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1, 1.25, 0.92, 1.08, 1],
    transition: { duration: DON, ease: "easeOut", times: [0, 0.3, 0.44, 0.6, 0.78, 1] },
  },
};
const donDust = (dx: number, delay: number): Variants => ({
  normal: { ...HIDDEN, scale: 0 },
  animate: {
    opacity: [0, 1, 0],
    scale: [0, 1.1, 0.3],
    x: [0, dx],
    y: [0, -9],
    transition: { duration: 0.4, ease: "easeOut", delay },
  },
});

const HelmetDonIcon = forwardRef<IconHandle, IconProps>(
  function HelmetDonIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {[[-24, 0.3], [24, 0.3], [-36, 0.36], [36, 0.36]].map(([dx, d], i) => (
            <motion.circle
              key={i}
              cx={128 + (dx as number) * 1.7}
              cy={230}
              r={6}
              variants={reduced ? undefined : donDust(dx as number, d as number)}
            />
          ))}
          <motion.g variants={reduced ? undefined : donShell} style={BASE}>
            <Helmet bill={reduced ? undefined : donBill} ear={reduced ? undefined : donEar} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 3. KNOCK ────────────────────────────────────────────────────────────────
   Two good-luck knocks on the dome: the helmet dips under each rap with tick
   marks popping at the knuckle point, and the ear pad thumps like a speaker
   cone on every hit. */
const KN = 1.2;
const knShell: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 5, 0, 5, -1.5, 0],
    rotate: [0, -2, 0, -2, 1, 0],
    transition: { duration: KN, ease: "easeOut", times: [0, 0.14, 0.34, 0.52, 0.74, 1] },
  },
};
const knEar: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.3, 1, 1.3, 0.95, 1],
    transition: { duration: KN, ease: "easeOut", times: [0, 0.16, 0.36, 0.54, 0.76, 1] },
  },
};
const knTick = (angle: number, delay: number): Variants => {
  const rad = (angle * Math.PI) / 180;
  return {
    normal: { ...HIDDEN, scale: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0, 1, 0.3],
      x: [0, Math.cos(rad) * 20],
      y: [0, Math.sin(rad) * -18],
      transition: { duration: 0.3, ease: "easeOut", delay },
    },
  };
};

const HelmetKnockIcon = forwardRef<IconHandle, IconProps>(
  function HelmetKnockIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {[[120, 0.08], [70, 0.08], [120, 0.54], [70, 0.54]].map(([a, d], i) => (
            <motion.circle
              key={i}
              cx={128}
              cy={26}
              r={6}
              variants={reduced ? undefined : knTick(a as number, d as number)}
            />
          ))}
          <motion.g variants={reduced ? undefined : knShell} style={BASE}>
            <Helmet ear={reduced ? undefined : knEar} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 4. DIZZY ────────────────────────────────────────────────────────────────
   Rung its bell: the helmet wobbles woozily while two stars orbit the dome in
   opposite phases — then it snaps upright and shakes them off. */
const DZ = 1.7;
/** Four-point twinkle star, centered on the origin. */
const STAR = "M0,-10L2.4,-2.4L10,0L2.4,2.4L0,10L-2.4,2.4L-10,0L-2.4,-2.4Z";
const orbit = (phase: number): Variants => {
  const pts = 13;
  const xs: number[] = [];
  const ys: number[] = [];
  const scales: number[] = [];
  const rotates: number[] = [];
  const opacities: number[] = [];
  for (let i = 0; i < pts; i++) {
    const t = i / (pts - 1);
    const a = phase + t * Math.PI * 2;
    xs.push(Math.cos(a) * 52);
    ys.push(Math.sin(a) * -20);
    // depth cue: bigger & brighter at the front of the ellipse (sin > 0 = the
    // near, lower sweep), smaller & dimmer swinging behind the dome
    const front = (Math.sin(a) + 1) / 2;
    scales.push(0.72 + front * 0.55);
    opacities.push(0.45 + front * 0.55);
    // the star itself spins as it orbits — 1.5 turns per lap
    rotates.push(t * 540);
  }
  opacities[0] = 0;
  opacities[pts - 1] = 0;
  scales[0] = 0.3;
  scales[pts - 1] = 0.3;
  return {
    normal: { ...HIDDEN, scale: 0 },
    animate: {
      opacity: opacities,
      scale: scales,
      rotate: rotates,
      x: xs,
      y: ys,
      transition: { duration: DZ * 0.75, ease: "linear", delay: DZ * 0.08 },
    },
  };
};
const dzShell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -7, 6, -5, 4, -2.5, 1, 0],
    transition: { duration: DZ, ease: "easeInOut", times: [0, 0.14, 0.3, 0.46, 0.62, 0.76, 0.88, 1] },
  },
};
// The bill twangs loosely through the wobble (the Don landing twang, stretched
// across the woozy rocking) — flopping opposite each swing, settling last.
const dzBill: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -13, 9, -7, 5, -3, 1.5, 0],
    transition: { duration: DZ, ease: "easeOut", times: [0, 0.18, 0.34, 0.5, 0.65, 0.78, 0.9, 1] },
  },
};

const HelmetDizzyIcon = forwardRef<IconHandle, IconProps>(
  function HelmetDizzyIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {/* origin-centered star paths inside positioning groups: motion's
              x/y orbits them, rotate spins each star about its own center */}
          <g transform="translate(128,40)">
            <motion.path d={STAR} variants={reduced ? undefined : orbit(0)} />
          </g>
          <g transform="translate(128,42) scale(0.8)">
            <motion.path d={STAR} variants={reduced ? undefined : orbit(Math.PI)} />
          </g>
          <motion.g variants={reduced ? undefined : dzShell} style={BASE}>
            <Helmet bill={reduced ? undefined : dzBill} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 5. WALK-OFF ─────────────────────────────────────────────────────────────
   The celebration: the helmet launches off the head spinning slightly, hangs,
   slams back down with a huge squash and dust bursting both sides — then the
   cascade: bill twangs, ear pad rattles, and sparkles pop as it settles. */
const WO = 1.8;
const woShell: Variants = {
  normal: { y: 0, rotate: 0, scaleY: 1, transition: { duration: 0 } },
  animate: {
    y: [0, -22, -26, 0, 0, 0, 0],
    rotate: [0, -8, -10, 0, 0, 0, 0],
    scaleY: [1, 1.05, 1, 0.84, 1.07, 0.97, 1],
    transition: { duration: WO, ease: "easeInOut", times: [0, 0.18, 0.3, 0.44, 0.56, 0.7, 0.84] },
  },
};
const woBill: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, -14, 10, -6, 3, 0],
    transition: { duration: WO, ease: "easeOut", times: [0, 0.44, 0.52, 0.64, 0.76, 0.88, 1] },
  },
};
const woEar: Variants = {
  normal: { x: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 0, -4, 4, -2, 0],
    scale: [1, 1, 1.2, 0.95, 1.05, 1],
    transition: { duration: WO, ease: "easeOut", times: [0, 0.46, 0.56, 0.68, 0.82, 1] },
  },
};
const woDust = (dx: number, delay: number): Variants => ({
  normal: { ...HIDDEN, scale: 0 },
  animate: {
    opacity: [0, 1, 0],
    scale: [0, 1.2, 0.3],
    x: [0, dx],
    y: [0, -12],
    transition: { duration: 0.45, ease: "easeOut", delay },
  },
});
const woSpark = (x: number, y: number, delay: number): Variants => ({
  normal: { ...HIDDEN, scale: 0 },
  animate: {
    opacity: [0, 1, 1, 0],
    scale: [0, 1.3, 1, 0.3],
    transition: { duration: 0.5, ease: ARRIVE, times: [0, 0.4, 0.7, 1], delay },
  },
});

const HelmetWalkoffIcon = forwardRef<IconHandle, IconProps>(
  function HelmetWalkoffIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {[[-28, 0.8], [28, 0.8], [-42, 0.86], [42, 0.86]].map(([dx, d], i) => (
            <motion.circle
              key={i}
              cx={128 + (dx as number) * 1.6}
              cy={232}
              r={6}
              variants={reduced ? undefined : woDust(dx as number, d as number)}
            />
          ))}
          {[[36, 60, 1.15], [220, 48, 1.25], [204, 96, 1.35]].map(([x, y, d]) => (
            <motion.circle
              key={`${x}`}
              cx={x}
              cy={y}
              r={7}
              variants={reduced ? undefined : woSpark(x as number, y as number, d as number)}
              style={AT(x as number, y as number)}
            />
          ))}
          <motion.g variants={reduced ? undefined : woShell} style={BASE}>
            <Helmet bill={reduced ? undefined : woBill} ear={reduced ? undefined : woEar} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 6. FORGE ────────────────────────────────────────────────────────────────
   The helmet manufactures itself: its outline is traced as a drawn stroke,
   the solid shell crossfades in beneath it, the bill SNAPS in from the right
   with overshoot, the ear pad spirals on — and a gleam sweeps across the
   finished shell, clipped so it only lights the metal. */
const FG = 1.9;
const OUTLINE_TRACE =
  "M223.7,128A104,104,0,0,0,16,128v24a72.08,72.08,0,0,0,72,72h40a72.08,72.08,0,0,0,72-72V136";
const fgTrace: Variants = {
  normal: { opacity: 0, pathLength: 1, transition: { duration: 0.1 } },
  animate: {
    opacity: [1, 1, 1, 0, 0],
    pathLength: [0, 1, 1, 1, 1],
    transition: { duration: FG, ease: "easeInOut", times: [0, 0.28, 0.34, 0.44, 1] },
  },
};
const fgShell: Variants = {
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 0, 1, 1],
    transition: { duration: FG, ease: "easeIn", times: [0, 0.26, 0.4, 1] },
  },
};
const fgBill: Variants = {
  normal: { opacity: 1, x: 0, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 0, 1, 1, 1],
    x: [26, 26, -4, 1.5, 0],
    transition: { duration: FG, ease: "easeOut", times: [0, 0.42, 0.52, 0.6, 0.68] },
  },
};
const fgEar: Variants = {
  normal: { opacity: 1, scale: 1, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 0, 1, 1, 1],
    scale: [0, 0, 1.2, 0.95, 1],
    rotate: [-200, -200, 20, -8, 0],
    transition: { duration: FG, ease: "easeOut", times: [0, 0.5, 0.62, 0.72, 0.8] },
  },
};
const fgGleam: Variants = {
  normal: { opacity: 0, x: 0, transition: { duration: 0.1 } },
  animate: {
    opacity: [0, 0, 0.95, 0.95, 0],
    x: [-190, -190, 0, 120, 210],
    transition: { duration: FG, ease: "easeInOut", times: [0, 0.72, 0.82, 0.92, 1] },
  },
};

const HelmetForgeIcon = forwardRef<IconHandle, IconProps>(
  function HelmetForgeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    const clipId = useId();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <clipPath id={clipId} clipRule="evenodd">
            <path d={SHELL} fillRule="evenodd" />
          </clipPath>
          <motion.path d={SHELL} fillRule="evenodd" variants={reduced ? undefined : fgShell} />
          <motion.path d={BILL} variants={reduced ? undefined : fgBill} />
          <motion.path d={EAR} fillRule="evenodd" variants={reduced ? undefined : fgEar} style={EAR_EYE} />
          {/* the tracer stroke that "draws" the silhouette */}
          <motion.path
            d={OUTLINE_TRACE}
            fill="none"
            stroke="currentColor"
            strokeWidth={12}
            strokeLinecap="round"
            variants={reduced ? undefined : fgTrace}
          />
          {/* gleam sweep, visible only over the shell metal */}
          <g clipPath={`url(#${clipId})`}>
            <motion.path
              d="M150,0L100,256"
              fill="none"
              stroke="currentColor"
              strokeWidth={26}
              variants={reduced ? undefined : fgGleam}
            />
          </g>
        </Svg>
      </div>
    );
  },
);

/* ── 7. TURNAROUND ───────────────────────────────────────────────────────────
   A true about-face: the helmet swivels edge-on and comes back around
   MIRRORED — bill facing the other way, genuinely turned around — holds the
   pose, then swivels home. Negative scaleX does the 3D turn. */
const TA = 1.6;
const taSwivel: Variants = {
  normal: { scaleX: 1, y: 0, transition: { duration: 0 } },
  animate: {
    scaleX: [1, 0.06, -1, -1, -0.06, 1],
    y: [0, -6, 0, 0, -6, 0],
    transition: { duration: TA, ease: "easeInOut", times: [0, 0.16, 0.3, 0.62, 0.78, 0.95] },
  },
};

const HelmetTurnaroundIcon = forwardRef<IconHandle, IconProps>(
  function HelmetTurnaroundIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : taSwivel} style={AT(128, 128)}>
            <Helmet />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 8. BALANCING ACT ────────────────────────────────────────────────────────
   Circus bit: a ball drops onto the crown and rolls along the dome's curve —
   the helmet tilting under it to keep the balance — until it rolls off and
   the helmet takes a little bow. */
const BA = 2.0;
const baBall: Variants = {
  normal: { ...HIDDEN, x: 0, y: 0 },
  animate: {
    opacity: [0, 1, 1, 1, 1, 1, 0],
    x: [0, 0, -26, 24, -14, 60, 92],
    y: [-46, 0, 5, 4, 2, 14, 60],
    transition: { duration: BA, ease: "easeInOut", times: [0, 0.12, 0.3, 0.5, 0.66, 0.82, 0.92] },
  },
};
const baShell: Variants = {
  normal: { rotate: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    // counter-tilts under the rolling ball, then a grateful bow
    rotate: [0, 1.5, 4, -3.5, 2, -1, 6, 0],
    y: [0, 2, 0, 0, 0, 0, 3, 0],
    transition: { duration: BA, ease: "easeInOut", times: [0, 0.14, 0.3, 0.5, 0.66, 0.78, 0.9, 1] },
  },
};

const HelmetBalanceIcon = forwardRef<IconHandle, IconProps>(
  function HelmetBalanceIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.circle cx={128} cy={12} r={13} variants={reduced ? undefined : baBall} />
          <motion.g variants={reduced ? undefined : baShell} style={BASE}>
            <Helmet />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 9. HEADBUTT ─────────────────────────────────────────────────────────────
   The duel: a ball bounces impatiently at the left, charges — and the helmet
   HEADBUTTS it clean out of the at-bat, flash at the contact point, then
   dusts itself off with a proud wiggle. */
const HB = 1.7;
const hbBall: Variants = {
  normal: { ...HIDDEN, x: 0, y: 0, scaleY: 1 },
  animate: {
    opacity: [0, 1, 1, 1, 1, 1, 1, 0],
    x: [0, 0, 0, 0, 30, 46, -60, -78],
    y: [-40, 0, -22, 0, -2, 0, -30, -44],
    scaleY: [1, 0.8, 1, 0.8, 1, 1, 1, 1],
    transition: { duration: HB, ease: "easeInOut", times: [0, 0.1, 0.2, 0.3, 0.42, 0.5, 0.66, 0.78] },
  },
};
const hbShell: Variants = {
  normal: { x: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // lean back, LUNGE into the butt, recoil, proud wiggle
    x: [0, 6, 6, -14, 4, 0, 0],
    rotate: [0, 4, 4, -8, 2, -2, 0],
    transition: { duration: HB, ease: "easeInOut", times: [0, 0.3, 0.42, 0.5, 0.62, 0.8, 1] },
  },
};
const hbFlash = (angle: number): Variants => {
  const rad = (angle * Math.PI) / 180;
  return {
    normal: { ...HIDDEN, scale: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0, 1.2, 0.3],
      x: [0, Math.cos(rad) * 26],
      y: [0, Math.sin(rad) * -24],
      transition: { duration: 0.34, ease: "easeOut", delay: HB * 0.48 },
    },
  };
};

const HelmetHeadbuttIcon = forwardRef<IconHandle, IconProps>(
  function HelmetHeadbuttIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.circle cx={40} cy={196} r={13} variants={reduced ? undefined : hbBall} />
          {[210, 150, 90].map((a) => (
            <motion.circle key={a} cx={34} cy={172} r={6} variants={reduced ? undefined : hbFlash(a)} />
          ))}
          <motion.g variants={reduced ? undefined : hbShell} style={BASE}>
            <Helmet />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 10. AERIAL 360 ──────────────────────────────────────────────────────────
   The showoff: the helmet hops off the head and does the full mirror swivel
   MID-AIR — edge-on, backwards, edge-on, home — then sticks the landing with
   a squash while the bill twangs, the ear rattles, and sparkles pop. */
const AE = 2.1;
const aeFlight: Variants = {
  normal: { y: 0, scaleX: 1, transition: { duration: 0 } },
  animate: {
    y: [0, -24, -28, -26, -24, 0, 0, 0],
    scaleX: [1, 1, 0.06, -1, 0.06, 1, 1, 1],
    transition: { duration: AE, ease: "easeInOut", times: [0, 0.16, 0.3, 0.42, 0.56, 0.7, 0.85, 1] },
  },
};
const aeLand: Variants = {
  normal: { scaleY: 1, transition: { duration: 0 } },
  animate: {
    scaleY: [1, 1, 0.85, 1.07, 1],
    transition: { duration: AE, ease: "easeOut", times: [0, 0.68, 0.76, 0.86, 1] },
  },
};
const aeBill: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, -12, 8, -4, 0],
    transition: { duration: AE, ease: "easeOut", times: [0, 0.7, 0.78, 0.86, 0.94, 1] },
  },
};
const aeEar: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 0, -3.5, 3.5, -1.5, 0],
    transition: { duration: AE, ease: "easeOut", times: [0, 0.72, 0.8, 0.88, 0.95, 1] },
  },
};
const aeSpark = (delay: number): Variants => ({
  normal: { ...HIDDEN, scale: 0 },
  animate: {
    opacity: [0, 1, 1, 0],
    scale: [0, 1.3, 1, 0.3],
    transition: { duration: 0.5, ease: ARRIVE, times: [0, 0.4, 0.7, 1], delay },
  },
});

const HelmetAerialIcon = forwardRef<IconHandle, IconProps>(
  function HelmetAerialIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {[[224, 56, 1.55], [36, 44, 1.65], [216, 100, 1.75]].map(([x, y, d]) => (
            <motion.circle key={`${x}`} cx={x} cy={y} r={7} variants={reduced ? undefined : aeSpark(d as number)} />
          ))}
          <motion.g variants={reduced ? undefined : aeFlight} style={AT(128, 128)}>
            <motion.g variants={reduced ? undefined : aeLand} style={BASE}>
              <Helmet bill={reduced ? undefined : aeBill} ear={reduced ? undefined : aeEar} />
            </motion.g>
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof HelmetBeanballIcon }[] = [
  { name: "Beanball", blurb: "Ball bonks the dome & ricochets — ear pad rattles", Component: HelmetBeanballIcon },
  { name: "Don", blurb: "Drops on with a squash; bill twangs, ear pulses", Component: HelmetDonIcon },
  { name: "Knock", blurb: "Two good-luck raps, ear thumps like a speaker", Component: HelmetKnockIcon },
  { name: "Dizzy", blurb: "Woozy wobble with stars orbiting the dome", Component: HelmetDizzyIcon },
  { name: "Walk-off", blurb: "Launch, slam, dust, bill twang, sparkles — celebration", Component: HelmetWalkoffIcon },
  { name: "Forge", blurb: "Outline traces itself, parts snap in, gleam sweeps the shell", Component: HelmetForgeIcon },
  { name: "Turnaround", blurb: "True about-face — swivels edge-on and comes back mirrored", Component: HelmetTurnaroundIcon },
  { name: "Balancing Act", blurb: "Ball rolls along the dome, helmet tilts to keep it up, bows", Component: HelmetBalanceIcon },
  { name: "Headbutt", blurb: "Ball charges, helmet headbutts it out of the at-bat", Component: HelmetHeadbuttIcon },
  { name: "Aerial 360", blurb: "Hop + mid-air mirror swivel + stuck landing cascade", Component: HelmetAerialIcon },
];

export default function BaseballHelmetLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);

  // Auto-play every variant on a loop so the page is lively without hovering.
  // Each remains fully hover/focus-interactive too.
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 2300);
    };
    cycle();
    const id = window.setInterval(cycle, 3600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "64px 24px",
        fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Baseball Helmet — animation candidates</h1>
      <p style={{ opacity: 0.55, fontSize: 14, marginTop: 8, marginBottom: 40 }}>
        Hover or focus any tile. They also auto-cycle. Pick one to promote into the registry.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          width: "100%",
          maxWidth: 900,
        }}
      >
        {VARIANTS.map(({ name, blurb, Component }, i) => (
          <div
            key={name}
            tabIndex={0}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              padding: "32px 16px 22px",
              borderRadius: 16,
              background: "var(--surface)",
              border: "1px solid var(--border-2)",
              outline: "none",
            }}
          >
            <Component
              ref={(el) => {
                refs.current[i] = el;
              }}
              size={56}
              style={{ color: "var(--text-strong)" }}
            />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
              <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>{blurb}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
