"use client";

import {
  useEffect,
  useRef,
  type ForwardRefExoticComponent,
  type ReactNode,
  type RefAttributes,
} from "react";
import { motion } from "motion/react";
import type { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";

// Shared harness for the /lab/<icon> prototype pages. These are internal
// prototyping tooling (never distributed through the registry), so a shared
// module is safe here — unlike registry/icons/* which are subject to the
// generator's inlining contract. A change to the preview UX happens once here
// instead of across ~38 near-identical pages.

/** The spring-like back-out overshoot the lab variants reach for. Canonical
 *  copy lives in motion-tokens as OVERSHOOT_BACK; re-exported so lab pages stop
 *  inlining the literal. */
export { OVERSHOOT_BACK as OVERSHOOT } from "@/lib/motion-tokens";

/** View-box transform-origin helper: (x, y) in 256-grid units → motion style. */
export const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});

/** The 256-grid motion.svg wrapper every lab variant renders its paths into. */
export function Svg({
  size,
  controls,
  children,
}: {
  size: number;
  controls: ReturnType<typeof useHover>["controls"];
  children: ReactNode;
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

type LabIcon = ForwardRefExoticComponent<IconProps & RefAttributes<IconHandle>>;
export type LabVariant = { name: string; blurb: string; Component: LabIcon };

/**
 * The lab preview page: title, a hint line, the auto-cycle loop (play all →
 * pause → repeat), and the responsive candidate grid. Each tile hover/focuses
 * independently. `cycleMs` is the interval between plays; `playMs` is how long
 * each play runs before pausing.
 */
export function VariantGrid({
  title,
  variants,
  cycleMs = 2800,
  playMs = 1500,
}: {
  title: string;
  variants: LabVariant[];
  cycleMs?: number;
  playMs?: number;
}) {
  const refs = useRef<(IconHandle | null)[]>([]);

  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), playMs);
    };
    cycle();
    const id = window.setInterval(cycle, cycleMs);
    return () => window.clearInterval(id);
  }, [cycleMs, playMs]);

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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{title} — animation candidates</h1>
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
        {variants.map(({ name, blurb, Component }, i) => (
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
