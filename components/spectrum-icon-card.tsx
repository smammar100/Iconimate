"use client";

import { useRef, useState } from "react";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import { Badge } from "@react-spectrum/s2/Badge";
import type { IconEntry } from "@/registry/icons";
import type { IconHandle } from "@/lib/icon";

/** The Adobe Spectrum hues we color-code categories with — each maps to a Badge variant. */
export type Hue =
  | "magenta"
  | "fuchsia"
  | "yellow"
  | "indigo"
  | "orange"
  | "seafoam"
  | "celery"
  | "blue"
  | "chartreuse"
  | "purple"
  | "cyan"
  | "red"
  | "turquoise";

/**
 * Layout shared by every tile. Kept free of color/background/border-color so it
 * can be concatenated with a per-hue style() result without property collisions.
 */
const tileBase = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "start",
  gap: 16,
  width: "full",
  padding: 20,
  borderRadius: "xl",
  borderWidth: 2,
  borderStyle: "solid",
});

/** Per-hue surface. `color` drives both the title text and the icon's `currentColor` stroke. */
const tileHue: Record<Hue, string> = {
  magenta: style({ backgroundColor: "magenta-100", borderColor: "magenta-200", color: "magenta-1100" }),
  fuchsia: style({ backgroundColor: "fuchsia-100", borderColor: "fuchsia-200", color: "fuchsia-1100" }),
  yellow: style({ backgroundColor: "yellow-100", borderColor: "yellow-300", color: "yellow-1300" }),
  indigo: style({ backgroundColor: "indigo-100", borderColor: "indigo-200", color: "indigo-1100" }),
  orange: style({ backgroundColor: "orange-100", borderColor: "orange-200", color: "orange-1200" }),
  seafoam: style({ backgroundColor: "seafoam-100", borderColor: "seafoam-200", color: "seafoam-1200" }),
  celery: style({ backgroundColor: "celery-100", borderColor: "celery-300", color: "celery-1300" }),
  blue: style({ backgroundColor: "blue-100", borderColor: "blue-200", color: "blue-1100" }),
  chartreuse: style({ backgroundColor: "chartreuse-100", borderColor: "chartreuse-300", color: "chartreuse-1300" }),
  purple: style({ backgroundColor: "purple-100", borderColor: "purple-200", color: "purple-1100" }),
  cyan: style({ backgroundColor: "cyan-100", borderColor: "cyan-300", color: "cyan-1200" }),
  red: style({ backgroundColor: "red-100", borderColor: "red-200", color: "red-1100" }),
  turquoise: style({ backgroundColor: "turquoise-100", borderColor: "turquoise-300", color: "turquoise-1200" }),
};

const titleStyle = style({ font: "title" });
const metaStyle = style({ font: "body-sm" });

/**
 * A hue-coded gallery cell. The whole tile is the trigger — pointer, keyboard
 * focus, and tap all drive the icon through its imperative handle (`:hover`
 * never fires on touch). The icon is `pointer-events-none` so its own internal
 * hover wiring can't fight the tile on partial leaves.
 */
export function SpectrumIconCard({
  entry,
  hue,
  motion,
}: {
  entry: IconEntry;
  hue: Hue;
  motion: string;
}) {
  const ref = useRef<IconHandle>(null);
  const [hovered, setHovered] = useState(false);
  const { Component, name } = entry;

  const play = () => ref.current?.startAnimation();
  const rest = () => ref.current?.stopAnimation();

  return (
    <button
      type="button"
      aria-label={`${name} — ${motion} animation`}
      onMouseEnter={() => {
        setHovered(true);
        play();
      }}
      onMouseLeave={() => {
        setHovered(false);
        rest();
      }}
      onFocus={() => {
        setHovered(true);
        play();
      }}
      onBlur={() => {
        setHovered(false);
        rest();
      }}
      onClick={play}
      className={`${tileBase} ${tileHue[hue]}`}
      style={{
        appearance: "none",
        textAlign: "left",
        cursor: "pointer",
        transform: hovered ? "translateY(-4px)" : "none",
        transition: "transform 220ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <span style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
        <Component ref={ref} size={32} style={{ pointerEvents: "none" }} />
        <Badge variant={hue} size="S">
          {hue}
        </Badge>
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span className={titleStyle}>{name}</span>
        <span className={metaStyle} style={{ opacity: 0.72 }}>
          {motion} · spring
        </span>
      </span>
    </button>
  );
}
