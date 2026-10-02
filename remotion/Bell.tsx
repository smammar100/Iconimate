import type { CSSProperties } from "react";
import { kf, easeInOutSine } from "./motion";

/**
 * The bell, as registry/icons/bell.tsx draws it: the shell as one outline with
 * the collar's dip lobe taken out, and the clapper as its own annular U, so the
 * clapper can travel without the negative space going lopsided. Both paths are
 * verbatim from the registry.
 */
export const BELL_SHELL =
  "M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H208a16,16,0,0,0,13.8-24.06Z" +
  "M48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z";
export const BELL_CLAPPER = "M88.81,200a40,40,0,0,0,78.38,0L150.62,200A24,24,0,0,1,105.38,200Z";
/** Phosphor's single filled glyph — the static twin in the comparison beat. */
export const BELL_FULL =
  "M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z";

/** The ring, traced in bell.tsx: 0.85s, shell and clapper on separate curves. */
export const RING_DUR = 0.85;
export const bellRot = (p: number) =>
  kf(p, [0, 0.2, 0.44, 0.64, 0.8, 0.92, 1], [0, -11, 12, -9.5, 7.4, -2.5, 0], easeInOutSine);
export const clapX = (p: number) =>
  kf(p, [0, 0.24, 0.48, 0.68, 0.84, 0.94, 1], [0, -16, 16, -13, 9, -3.5, 0], easeInOutSine);

export function Bell({
  size,
  rot,
  clap,
  color,
  style,
}: {
  size: number;
  rot: number;
  clap: number;
  color: string;
  style?: CSSProperties;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill={color} style={{ overflow: "visible", ...style }}>
      {/* Rotate about the crown (128,24), the point the shell hangs from — the
          clapper rides inside the shell's group, so its travel is relative. */}
      <g transform={`rotate(${rot.toFixed(3)} 128 24)`}>
        <path d={BELL_SHELL} />
        <path d={BELL_CLAPPER} transform={`translate(${clap.toFixed(3)} 0)`} />
      </g>
    </svg>
  );
}
