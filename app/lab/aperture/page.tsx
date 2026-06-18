"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/**
 * LAB — Aperture icon, 5 animation candidates.
 *
 * The Phosphor "aperture" glyph is ONE path: the blades and the thin gaps between
 * them are formed by fill-rule winding across its subpaths, so it must stay a
 * single <path> (splitting it turns the ring into a solid disc). Its six-fold
 * symmetry means a rotation reads as a true iris turn. Everything pivots about
 * the centre (128, 128).
 */
const APERTURE =
  "M201.54,54.46A104,104,0,0,0,54.46,201.54,104,104,0,0,0,201.54,54.46ZM190.23,65.78a88.18,88.18,0,0,1,11,13.48L167.55,119,139.63,40.78A87.34,87.34,0,0,1,190.23,65.78ZM155.59,133l-18.16,21.37-27.59-5L100.41,123l18.16-21.37,27.59,5ZM65.77,65.78a87.34,87.34,0,0,1,56.66-25.59l17.51,49L58.3,74.32A88,88,0,0,1,65.77,65.78ZM46.65,161.54a88.41,88.41,0,0,1,2.53-72.62l51.21,9.35ZM65.77,190.22a88.18,88.18,0,0,1-11-13.48L88.45,137l27.92,78.18A87.34,87.34,0,0,1,65.77,190.22Zm124.46,0a87.34,87.34,0,0,1-56.66,25.59l-17.51-49,81.64,14.91A88,88,0,0,1,190.23,190.22Zm-34.62-32.49,53.74-63.27a88.41,88.41,0,0,1-2.53,72.62Z";

/** Aperture centre as a view-box fraction — the pivot for every transform. */
const ORIGIN = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

/** Back-out overshoot — spring-like snap on tween transitions. */
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

function Variant({
  size,
  style,
  variants,
  forwardedRef,
  ...props
}: IconProps & {
  variants: Variants;
  forwardedRef: React.Ref<IconHandle>;
}) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(forwardedRef, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
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
        <motion.path d={APERTURE} variants={reduced ? undefined : variants} style={ORIGIN} />
      </motion.svg>
    </div>
  );
}

/* ── 1. IRIS — blades ratchet one notch (60°) and settle. ──────────────────── */
const iris: Variants = {
  normal: { rotate: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: { rotate: 60, scale: 1.06, transition: { duration: 0.6, ease: OVERSHOOT } },
};

/* ── 2. SPIN — the whole aperture rotates evenly, like a lens barrel (loops). ─ */
const spin: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: 360, transition: { duration: 4, ease: "linear", repeat: Infinity } },
};

/* ── 3. PULSE — slow breathing scale, a "live / capturing" lens (loops). ───── */
const pulse: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: { scale: [1, 1.07, 1], transition: { duration: 1.6, ease: "easeInOut", repeat: Infinity } },
};

/* ── 4. SNAP — quick squash-and-pop, a shutter click. ──────────────────────── */
const snap: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.85, 1.06, 1],
    transition: { duration: 0.5, ease: "easeOut", times: [0, 0.3, 0.65, 1] },
  },
};

/* ── 5. OPEN — irises open from nothing: rotate in while scaling up. ────────── */
const open: Variants = {
  normal: { rotate: 0, scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    rotate: [-120, 0],
    scale: [0, 1],
    opacity: [0, 1],
    transition: { duration: DUR.slow, ease: ARRIVE },
  },
};

/* ── 6. SHUTTER — the iris closes fully, then snaps back open. ──────────────── */
const shutter: Variants = {
  normal: { rotate: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 45, 0],
    scale: [1, 0.06, 1],
    transition: { duration: 0.75, ease: "easeInOut", times: [0, 0.5, 1] },
  },
};

const make = (variants: Variants) =>
  forwardRef<IconHandle, IconProps>(function ApertureVariant(props, ref) {
    return <Variant {...props} variants={variants} forwardedRef={ref} />;
  });

export const ApertureIrisIcon = make(iris);
export const ApertureSpinIcon = make(spin);
export const AperturePulseIcon = make(pulse);
export const ApertureSnapIcon = make(snap);
export const ApertureOpenIcon = make(open);
export const ApertureShutterIcon = make(shutter);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof ApertureIrisIcon }[] = [
  { name: "Iris", blurb: "Blades ratchet one notch & settle", Component: ApertureIrisIcon },
  { name: "Spin", blurb: "Whole aperture rotates evenly (loops)", Component: ApertureSpinIcon },
  { name: "Pulse", blurb: "Slow breathing scale (loops)", Component: AperturePulseIcon },
  { name: "Snap", blurb: "Quick squash-pop shutter click", Component: ApertureSnapIcon },
  { name: "Open", blurb: "Irises open from nothing", Component: ApertureOpenIcon },
  { name: "Shutter", blurb: "Iris closes fully, then snaps open", Component: ApertureShutterIcon },
];

export default function ApertureLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);

  // Auto-play every variant on a loop so the page is lively without hovering.
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 1500);
    };
    cycle();
    const id = window.setInterval(cycle, 2700);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0c",
        color: "#ededed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "64px 24px",
        fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Aperture — animation candidates</h1>
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
              background: "#161618",
              border: "1px solid #232326",
              outline: "none",
            }}
          >
            <Component
              ref={(el) => {
                refs.current[i] = el;
              }}
              size={56}
              style={{ color: "#fafafa" }}
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
