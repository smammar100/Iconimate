import { GLYPHS } from "./glyphs";
import { clamp, cyclePhase, easeOutQuad, kf } from "./motion";

/**
 * Per-icon wall motion — keyframes copied from each icon's registry variants
 * (registry/icons/*.tsx), applied to the whole glyph, times spread evenly.
 *   d  registry duration (s)      o  transform-origin
 *   r  rotate (deg)                x/y  translate (glyph units, scaled to render size)
 *   s / sx / sy  scale
 * Do not invent generic sways: an icon without a traced motion does not go on the wall.
 */
type WallMotion = { d: number; o?: string; r?: number[]; x?: number[]; y?: number[]; s?: number[]; sx?: number[]; sy?: number[] };

export const WALL_REAL: Record<string, WallMotion> = {
  acorn: { d: 0.95, o: "50% 91%", r: [0, -2, 6, -4.5, 2.5, -1, 0] },
  "address-book": { d: 0.85, o: "53% 59%", r: [0, 3, -9, 7, -3, 0] },
  "airplane-tilt": { d: 2.6, r: [0, 11, -11, 0], y: [0, -7, 0, 5, 0] },
  airplane: { d: 4.2, y: [0, -13, 0], r: [0, 3, 0, -2, 0] },
  alarm: { d: 0.72, o: "50% 53%", r: [0, 4, -12, 12, -9, 9, -5, 5, 0] },
  "amazon-logo": { d: 0.72, o: "50% 90%", r: [0, -8, 6, -3.5, 1.5, 0] },
  ambulance: { d: 1.0, y: [0, -2.5, 0, -1.5, 0], r: [0, -1.2, 0, 1, 0] },
  anchor: { d: 2.4, o: "50% 22%", r: [0, 11, 0, -11, 0] },
  aperture: { d: 0.6, s: [1, 1.06, 1] },
  "baby-carriage": { d: 0.85, o: "59% 41%", y: [0, 8, 0], r: [0, 6, 0] },
  baby: { d: 0.9, o: "50% 87%", r: [0, -9, 7, -5, 3, 0] },
  backpack: { d: 1.05, o: "50% 5%", r: [0, -9, 7, -4, 2, 0] },
  backspace: { d: 0.6, x: [0, -14, 2, 0] },
  bag: { d: 1.2, o: "50% 8%", r: [0, 0, -7, 5.5, -3, 1.5, 0], y: [0, -12, -10, -10, 0] },
  balloon: { d: 1.9, o: "50% 41%", y: [0, -16, -11, -15, -11, 0], r: [0, 2.5, -1.5, 1.5, -1, 0] },
  bandaids: { d: 0.9, sx: [1, 1, 1.09, 0.96, 1], sy: [1, 1, 0.92, 1.05, 1] },
  barbell: { d: 1.0, o: "50% 88%", y: [0, -14, 0, -7, 0, -2.5, 0], sy: [1, 1.04, 0.88, 1.03, 0.94, 1.01, 1] },
  barn: { d: 1.2, x: [0, 0, -7, 7, -5, 0, 0], y: [0, 0, -8, 0, -6, 0, 0], r: [0, 0, -2.5, 0, 2.5, 0, 0] },
  barricade: { d: 0.9, o: "50% 81%", r: [0, -4, 3.2, -2, 1, 0] },
  "baseball-cap": { d: 1.2, o: "50% 81%", sy: [1, 1, 0.88, 1.05, 1], r: [0, -5, 4, -2, 0] },
  baseball: { d: 1.25, r: [0, -25, 335, 360, 360], x: [0, -8, 6, 0, 0] },
  basket: { d: 0.9, o: "50% 81%", y: [0, -12, -11, -11, 0, 0], r: [0, 0, -9, 7, -3.5, 0, 0] },
  basketball: { d: 1.2, o: "50% 91%", sy: [1, 1.08, 1, 0.85, 1.04, 0.98, 1], sx: [1, 0.94, 1, 1.12, 0.97, 1.01, 1] },
  "battery-charging": { d: 1.3, r: [0, 0, -1.2, 0.9, 0, -1.2, 0.9, 0, -1.5, 1, -0.4, 0], y: [0, 0, 1.6, -1.2, 0, 1.6, -1.2, 0, 2, -1.4, 0.5, 0] },
  "battery-full": { d: 1.6, s: [1, 1.05, 1] },
  "beach-ball": { d: 2.0, o: "50% 91%", y: [0, -22, 0, -11, 0, 0, 0, 0], sx: [1, 1, 1.22, 1, 1.12, 1, 1], sy: [1, 1, 0.7, 1, 0.86, 1, 1] },
  beanie: { d: 1.6, o: "50% 88%", r: [0, 0, -9, 6, -2.5, 0], sx: [1, 1, 1.11, 0.98, 1.02, 1], sy: [1, 1, 0.84, 1.02, 0.98, 1] },
  "beer-bottle": { d: 1.1, x: [0, -8, 2, -1, 0], y: [0, 8, -2, 1, 0], r: [0, -2.5, 1.5, -0.5, 0] },
  "beer-stein": { d: 1.7, x: [0, -6, -6, -6, -6, 0, 0, 0, 0], y: [0, -6, -6, -6, -6, 0, 0, 0, 0], r: [0, 0, -7, -2, -7, 0, 4.5, -2, 0] },
  // heart's lub-dub: two beats of unequal strength (registry/icons/heart.tsx, MOTION.md §10)
  heart: { d: 1.2, s: [1, 0.92, 1.16, 1, 1.09, 1, 1] },
  star: { d: 1.15, s: [1, 0.92, 1.18, 0.96, 1.06, 0.99, 1, 1] },
};

/** The wall shows every motion-verified glyph once — no cycling, no repeats. */
export const WALL_KEYS = Object.keys(WALL_REAL).filter((k) => GLYPHS[k]);

export type WallPose = { r: number; x: number; y: number; sx: number; sy: number; origin: string };

/** The icon's pose at authored time T, phase-shifted by `off` so the wall shimmers rather than pulses. */
export function wallMotion(k: string, T: number, off: number, renderPx: number): WallPose {
  const m = WALL_REAL[k];
  const w: WallPose = { r: 0, x: 0, y: 0, sx: 1, sy: 1, origin: m?.o ?? "50% 50%" };
  if (!m) return w;
  // Loop with a short breath, not a long pause: at 0.9s of rest each icon spent
  // more time dead than moving and the wall read as sluggish at source speed.
  const cyc = m.d + 0.22;
  const p = cyclePhase(T, off, m.d, cyc);
  const ev = (arr: number[]) => kf(p, arr.map((_, i) => i / (arr.length - 1)), arr, easeOutQuad);
  const SC = renderPx / 256;
  if (m.r) w.r = ev(m.r);
  if (m.x) w.x = ev(m.x) * SC;
  if (m.y) w.y = ev(m.y) * SC;
  if (m.s) {
    const v = ev(m.s);
    w.sx = v;
    w.sy = v;
  }
  if (m.sx) w.sx = ev(m.sx);
  if (m.sy) w.sy = ev(m.sy);
  return w;
}

/** How far a tile's motion has "woken up" after its reveal: 0 = still, 1 = full. */
export const wakeUp = (T: number, revealAt: number) => clamp((T - revealAt - 0.45) / 0.6, 0, 1);
