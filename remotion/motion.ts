/**
 * The film's motion dialect. Three helpers and one global scale; nothing eases
 * outside them. Everything is a pure function of authored seconds `T`, so every
 * frame Remotion renders is exactly the frame the studio previewed.
 */

export type Ease = (t: number) => number;

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const linear: Ease = (t) => t;
export const easeOutQuad: Ease = (t) => 1 - (1 - t) * (1 - t);
export const easeInOutSine: Ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
export const easeInOutCubic: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic: Ease = (t) => 1 - Math.pow(1 - t, 3);
export const easeOutQuart: Ease = (t) => 1 - Math.pow(1 - t, 4);
export const easeInOutQuart: Ease = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
export const easeOutBack: Ease = (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
export const easeOutExpo: Ease = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Piecewise keyframes, eased PER SEGMENT — the registry's snap lives in the
 *  attack of each hop, and one curve across the whole array averages it away. */
export function kf(t: number, times: number[], values: number[], ease: Ease = linear): number {
  if (t <= times[0]) return values[0];
  const last = times.length - 1;
  if (t >= times[last]) return values[last];
  let i = 0;
  while (i < last - 1 && t >= times[i + 1]) i++;
  const span = times[i + 1] - times[i];
  const p = span > 0 ? (t - times[i]) / span : 1;
  return values[i] + (values[i + 1] - values[i]) * ease(clamp(p, 0, 1));
}

/** One tween: `from` until `start`, eased to `to` by `end`, held after. */
export const tween = (from: number, to: number, start: number, end: number, ease: Ease = easeOutQuart) => (T: number) =>
  from + (to - from) * ease(clamp((T - start) / Math.max(1e-6, end - start), 0, 1));

/** Tightens every duration in the film from one place. */
export const SNAP = 0.62;
export const MOTION = {
  enter: (from: number, to: number, start: number, dur = 0.6) => tween(from, to, start, start + dur * SNAP, easeOutQuart),
  glide: (from: number, to: number, start: number, dur = 1.0) => tween(from, to, start, start + dur * SNAP, easeInOutQuart),
  pop: (from: number, to: number, start: number, dur = 0.5) => tween(from, to, start, start + dur * SNAP, easeOutBack),
};

/** Where a looping registry motion is in its cycle: 0..1 over `dur`, resting for the breath after. */
export const cyclePhase = (T: number, off: number, dur: number, cyc: number) =>
  clamp(((((T + off) % cyc) + cyc) % cyc) / dur, 0, 1);
