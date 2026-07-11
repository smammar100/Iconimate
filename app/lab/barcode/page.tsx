"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/**
 * LAB — Barcode icon, 5 animation candidates (escalating).
 *
 * The Phosphor "barcode" glyph is four corner brackets framing four bars.
 * Split for motion, all from the glyph's own subpaths:
 *   CORNERS — the four L-brackets, untouched.
 *   BARS    — the four bars as 16-wide round-capped strokes (x80/112/144/176,
 *             y88–168) — identical to the filled originals, but drawable.
 * A scan line (hidden at rest) is the extra actor for the scanner variants.
 */
const CORNER_TL = "M32,96a8,8,0,0,0,8-8V56H72a8,8,0,0,0,0-16H32a8,8,0,0,0-8,8V88A8,8,0,0,0,32,96Z";
const CORNER_TR = "M232,48V88a8,8,0,0,1-16,0V56H184a8,8,0,0,1,0-16h40A8,8,0,0,1,232,48Z";
const CORNER_BL = "M72,200H40V168a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16Z";
const CORNER_BR = "M224,160a8,8,0,0,0-8,8v32H184a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V168A8,8,0,0,0,224,160Z";
const CORNERS = [CORNER_TL, CORNER_TR, CORNER_BL, CORNER_BR];
const BAR_X = [80, 112, 144, 176];
const bar = (x: number) => `M${x},88V168`;
const SCANLINE = "M64,78V178";

/* Transform origins (view-box fractions of 256). */
const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});

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

function Bars({ variants }: { variants?: (i: number) => Variants }) {
  return (
    <>
      {BAR_X.map((x, i) => (
        <motion.path
          key={x}
          d={bar(x)}
          fill="none"
          stroke="currentColor"
          strokeWidth={16}
          strokeLinecap="round"
          variants={variants ? variants(i) : undefined}
          style={AT(x, 128)}
        />
      ))}
    </>
  );
}

function Corners({ variants }: { variants?: (i: number) => Variants }) {
  return (
    <>
      {CORNERS.map((d, i) => (
        <motion.path key={d} d={d} variants={variants ? variants(i) : undefined} />
      ))}
    </>
  );
}

/* ── 1. SCAN ─────────────────────────────────────────────────────────────────
   A scanner line sweeps across the code; each bar gives a little acknowledging
   pulse as the beam passes over it. */
const scanLine: Variants = {
  normal: { opacity: 0, x: 0, transition: { duration: 0.1 } },
  animate: {
    opacity: [0, 1, 1, 0],
    x: [0, 0, 128, 128],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.12, 0.85, 1] },
  },
};
const scanBar = (i: number): Variants => ({
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1.12, 1],
    transition: { duration: 0.25, ease: "easeOut", delay: 0.2 + i * 0.16 },
  },
});

const BarcodeScanIcon = forwardRef<IconHandle, IconProps>(
  function BarcodeScanIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <Corners />
          <Bars variants={reduced ? undefined : scanBar} />
          <motion.path
            d={SCANLINE}
            fill="none"
            stroke="currentColor"
            strokeWidth={6}
            strokeLinecap="round"
            variants={reduced ? undefined : scanLine}
          />
        </Svg>
      </div>
    );
  },
);

/* ── 2. EQUALIZER ────────────────────────────────────────────────────────────
   The bars dance like an audio EQ — each on its own phase, all decaying back
   to full height in sync. */
const eqBar = (i: number): Variants => {
  const seq = [
    [1, 0.55, 1.1, 0.75, 1],
    [1, 1.1, 0.6, 1.05, 1],
    [1, 0.7, 1.05, 0.6, 1],
    [1, 1.05, 0.7, 1.1, 1],
  ][i];
  return {
    normal: { scaleY: 1, transition: RETURN_TRANSITION },
    animate: {
      scaleY: seq,
      transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.28, 0.55, 0.8, 1] },
    },
  };
};

const BarcodeEqIcon = forwardRef<IconHandle, IconProps>(
  function BarcodeEqIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <Corners />
          <Bars variants={reduced ? undefined : eqBar} />
        </Svg>
      </div>
    );
  },
);

/* ── 3. PRINT ────────────────────────────────────────────────────────────────
   Fresh off the label printer: the brackets stamp in first, then each bar
   prints top-to-bottom in quick succession. */
const printCorner = (i: number): Variants => ({
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0.7, 1.08, 1],
    opacity: [0, 1, 1],
    transition: { duration: 0.3, ease: "easeOut", times: [0, 0.7, 1], delay: i * 0.05 },
  },
});
const printBar = (i: number): Variants => ({
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: { duration: 0.28, ease: SWEEP, delay: 0.3 + i * 0.12 },
  },
});

const BarcodePrintIcon = forwardRef<IconHandle, IconProps>(
  function BarcodePrintIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <Corners variants={reduced ? undefined : printCorner} />
          <Bars variants={reduced ? undefined : printBar} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. RE-ENCODE ────────────────────────────────────────────────────────────
   The data rewrites itself: the bars collapse toward the middle, hold as a
   compressed blip, then redistribute back into place with a snap. */
const reBar = (i: number): Variants => {
  const toCenter = 128 - BAR_X[i];
  return {
    normal: { x: 0, scaleY: 1, transition: RETURN_TRANSITION },
    animate: {
      x: [0, toCenter * 0.85, toCenter * 0.85, 0],
      scaleY: [1, 0.55, 0.55, 1],
      transition: { duration: 1.0, ease: "easeInOut", times: [0, 0.3, 0.5, 0.85] },
    },
  };
};

const BarcodeReencodeIcon = forwardRef<IconHandle, IconProps>(
  function BarcodeReencodeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <Corners />
          <Bars variants={reduced ? undefined : reBar} />
        </Svg>
      </div>
    );
  },
);

/* ── 5. BEEP ─────────────────────────────────────────────────────────────────
   The full checkout moment: the beam sweeps the code, every bar pulses as
   it's read, and on the "beep" the brackets pop outward and snap back —
   scanned. */
const BEEP = 1.15;
const beepLine: Variants = {
  normal: { opacity: 0, x: 0, transition: { duration: 0.1 } },
  animate: {
    opacity: [0, 1, 1, 0, 0],
    x: [0, 0, 128, 128, 128],
    transition: { duration: BEEP, ease: "easeInOut", times: [0, 0.08, 0.55, 0.62, 1] },
  },
};
const beepBar = (i: number): Variants => ({
  normal: { scaleY: 1, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1.12, 1, 1.08, 1],
    scaleX: [1, 1.25, 1, 1.2, 1],
    transition: {
      duration: BEEP,
      ease: "easeOut",
      times: [0, 0.12, 0.2, 0.68, 0.8],
      delay: 0.1 + i * 0.1,
    },
  },
});
const beepCorner = (i: number): Variants => {
  const dx = i % 2 === 0 ? -5 : 5;
  const dy = i < 2 ? -5 : 5;
  return {
    normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
    animate: {
      x: [0, 0, dx, 0],
      y: [0, 0, dy, 0],
      transition: { duration: BEEP, ease: "easeOut", times: [0, 0.6, 0.72, 0.9] },
    },
  };
};

const BarcodeBeepIcon = forwardRef<IconHandle, IconProps>(
  function BarcodeBeepIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <Corners variants={reduced ? undefined : beepCorner} />
          <Bars variants={reduced ? undefined : beepBar} />
          <motion.path
            d={SCANLINE}
            fill="none"
            stroke="currentColor"
            strokeWidth={6}
            strokeLinecap="round"
            variants={reduced ? undefined : beepLine}
          />
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BarcodeScanIcon }[] = [
  { name: "Scan", blurb: "A beam sweeps; bars pulse as it passes", Component: BarcodeScanIcon },
  { name: "Equalizer", blurb: "Bars dance on their own phases, settle in sync", Component: BarcodeEqIcon },
  { name: "Print", blurb: "Brackets stamp in, bars print top-to-bottom", Component: BarcodePrintIcon },
  { name: "Re-encode", blurb: "Bars collapse to a blip, redistribute with a snap", Component: BarcodeReencodeIcon },
  { name: "Beep", blurb: "Sweep + bar pulses + brackets pop — scanned!", Component: BarcodeBeepIcon },
];

export default function BarcodeLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);

  // Auto-play every variant on a loop so the page is lively without hovering.
  // Each remains fully hover/focus-interactive too.
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 1500);
    };
    cycle();
    const id = window.setInterval(cycle, 2800);
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Barcode — animation candidates</h1>
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
