import { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { visibleIconMeta } from "../registry/icon-meta.gen";
import { Bell, BELL_FULL, RING_DUR, bellRot, clapX } from "./Bell";
import { Glyph } from "./Glyph";
import { GLYPHS } from "./glyphs";
import { MOTION, clamp, cyclePhase, easeInOutCubic, easeInOutSine, kf, tween } from "./motion";
import { ACCENT, BG, DIM, FAINT, GH_PATH, GLOW, MONO, RAINBOW, SANS, SCRIPT, STAR_PATH, SURFACE, TEXT } from "./tokens";
import { WALL_KEYS, wakeUp, wallMotion } from "./wall";

/**
 * Iconimate launch promo — 30s, 1920×1080, dark.
 *
 * ONE ELEMENT TREE, ONE CLOCK. Every visual is a pure function of T, the
 * authored second. Scenes are cue labels on that clock, not components that
 * mount and unmount — which is what lets one bell travel from a grid tile to the
 * selection, the comparison, the inspector, the terminal and the wall as a single
 * element rather than a chain of dissolves.
 *
 * The soundtrack (remotion/public/soundtrack.wav) was cut to these boundaries:
 *   0.1 sub boom (first cell) · 3.0 kick (cursor) · 4.5 bell hit · 6.0 hats
 *   10.6/11.6/12.6 bell accents (inspector swings) · 14.0 breakdown (terminal)
 *   16.55 riser · 18.0 the drop (Wall cut) · 26.0 chord + crash (logo) · 27.8 CTA
 */
export const PROMO = { fps: 30, seconds: 30 };

const CUES = { Rest: 0, Hover: 3, Identical: 6, Geometry: 9, Install: 14, Wall: 18, Sign: 26 } as const;
const TOTAL = PROMO.seconds;

/* ── the opening grid: the site's cards, 200×160 with 12px gutters, 9×7, full bleed ── */
const CARD_W = 200, CARD_H = 160, GUT = 12;
const GRID_COLS = 9, GRID_ROWS = 7;
const GX0 = (1920 - (GRID_COLS * CARD_W + (GRID_COLS - 1) * GUT)) / 2;
const GY0 = (1080 - (GRID_ROWS * CARD_H + (GRID_ROWS - 1) * GUT)) / 2;
const COL_X = (i: number) => GX0 + i * (CARD_W + GUT);
const ROW_Y = (j: number) => GY0 + j * (CARD_H + GUT);
const HERO_COL = 4, HERO_ROW = 3;
/** Where the hero card's glyph sits: 16px in, glyph 30 tall over a 14px gap and the label. */
const HERO_GLYPH = { x: COL_X(HERO_COL) + 16 + 15, y: ROW_Y(HERO_ROW) + (CARD_H - 64) / 2 + 16 };
const title = (k: string) => k.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

/** Every glyph but the two the opening stages by hand; a stride coprime with the
 *  pool walks every entry before repeating, so no labelled card shows twice. */
const GRID_POOL = Object.keys(GLYPHS).filter((k) => k !== "bell" && k !== "android-logo");
const GRID_STRIDE = (() => {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  return [7, 11, 13, 5, 1].find((s) => gcd(GRID_POOL.length, s) === 1) ?? 1;
})();
const GRID_CELLS = (() => {
  const cells: string[] = [];
  let c = 0;
  for (let idx = 0; idx < GRID_COLS * GRID_ROWS; idx++) {
    const i = idx % GRID_COLS, j = Math.floor(idx / GRID_COLS);
    if (i === HERO_COL && j === HERO_ROW) cells.push("__bell");
    else if (i === HERO_COL + 1 && j === HERO_ROW) cells.push("__android");
    else cells.push(GRID_POOL[(c++ * GRID_STRIDE) % GRID_POOL.length]);
  }
  return cells;
})();

/* ── the wall: every motion-verified glyph once, 8×4, with the bell taking its own tile ── */
const WALL_COLS = 8;
const WALL_X0 = 260, WALL_Y0 = 345, WALL_DX = 200, WALL_DY = 130;
const BELL_TILE = 11;
const WALL_TILES: string[] = [...WALL_KEYS.slice(0, BELL_TILE), "__bell", ...WALL_KEYS.slice(BELL_TILE)];
const wallPos = (idx: number) => {
  const i = idx % WALL_COLS, j = Math.floor(idx / WALL_COLS);
  return { i, j, x: WALL_X0 + i * WALL_DX, y: WALL_Y0 + j * WALL_DY, at: CUES.Wall + j * 0.3 + i * 0.055 };
};
const BELL_WALL = wallPos(BELL_TILE);

/* ── secondary parts the registry animates independently, over the resting glyph ── */
const ANDROID_HOP_T = [0, 0.15, 0.45, 0.72, 1];
const hopY = (p: number) => kf(p, ANDROID_HOP_T, [0, 0, -12, 0, 0], easeInOutSine);
const hopSY = (p: number) => kf(p, ANDROID_HOP_T, [1, 0.9, 1.05, 0.92, 1], easeInOutSine);
const hopSX = (p: number) => kf(p, ANDROID_HOP_T, [1, 1.05, 0.97, 1.04, 1], easeInOutSine);
const ALIEN = GLYPHS.alien;
const ALIEN_EYE_L = "M120,136A40,40,0,0,0,80,96a16,16,0,0,0-16,16,40,40,0,0,0,40,40A16,16,0,0,0,120,136Z";
const ALIEN_EYE_R = "M176,96a40,40,0,0,0-40,40,16,16,0,0,0,16,16,40,40,0,0,0,40-40A16,16,0,0,0,176,96Z";
const AMB_CROSS = "M80,120a8,8,0,0,1,8-8h16V96a8,8,0,0,1,16,0v16h16a8,8,0,0,1,0,16H120v16a8,8,0,0,1-16,0V128H88A8,8,0,0,1,80,120Z";
const BC_BOLT = "M138.81,123.79a8,8,0,0,1,.35,7.79l-16,32a8,8,0,0,1-14.32-7.16L119.06,136H100a8,8,0,0,1-7.16-11.58l16-32a8,8,0,1,1,14.32,7.16L112.94,120H132A8,8,0,0,1,138.81,123.79Z";

function WallExtras({ k, T, off, size }: { k: string; T: number; off: number; size: number }) {
  const abs = { position: "absolute" as const, left: 0, top: 0, overflow: "visible" as const };
  if (k === "ambulance") {
    const p = cyclePhase(T, off, 1.0, 1.22);
    const blink = kf(p, [0, 0.25, 0.4, 0.75, 1], [1, 1, 0.12, 0.12, 1]);
    return (
      <svg width={size} height={size} viewBox="0 0 256 256" style={abs}>
        {[{ y: 98, d: 0 }, { y: 128, d: 0.12 }, { y: 158, d: 0.24 }].map((st, i) => {
          const sp = cyclePhase(T, off - st.d, 0.55, 1.22);
          return (
            <line key={i} x1={6} y1={st.y} x2={30} y2={st.y} stroke={TEXT} strokeWidth={10} strokeLinecap="round"
              transform={`translate(${10 - 26 * sp} 0)`} opacity={sp < 0.5 ? sp * 1.8 : (1 - sp) * 1.8} />
          );
        })}
        <path d={AMB_CROSS} fill={BG} opacity={blink} transform="translate(128 128) scale(0.86) translate(-128 -128)" />
      </svg>
    );
  }
  if (k === "battery-charging") {
    const p = cyclePhase(T, off, 1.3, 1.52);
    const opa = kf(p, [0, 0.34, 0.39, 0.49, 0.54, 0.64, 0.69, 0.8, 1], [1, 1, 0.4, 1, 0.45, 1, 0.35, 1, 1]);
    const sc = kf(p, [0, 0.34, 0.4, 0.5, 0.55, 0.65, 0.71, 0.85, 1], [1, 1, 1.05, 1, 1.06, 1, 1.1, 1.02, 1]);
    return (
      <svg width={size} height={size} viewBox="0 0 256 256" fill={TEXT} style={abs}>
        <path d={BC_BOLT} opacity={opa} transform={`translate(116 126) scale(${sc}) translate(-116 -126)`} />
        {[{ y: 108, d: 0 }, { y: 128, d: 0.22 }, { y: 148, d: 0.44 }].map((dd, i) => {
          const dp = cyclePhase(T, off - dd.d, 0.5, 1.52);
          return (
            <path key={i} d="M0,0 l14,0" fill="none" stroke={TEXT} strokeWidth={10} strokeLinecap="round"
              transform={`translate(${36 + 52 * dp} ${dd.y})`} opacity={dp < 0.15 ? dp / 0.15 : dp > 0.8 ? (1 - dp) / 0.2 : 1} />
          );
        })}
      </svg>
    );
  }
  if (k === "beer-stein") {
    const bubbles = [{ x: 72, y: 196, r: 8, d: 0 }, { x: 120, y: 198, r: 10, d: 0.42 }, { x: 168, y: 196, r: 7, d: 0.78 }, { x: 119, y: 200, r: 6, d: 1.1 }];
    return (
      <svg width={size} height={size} viewBox="0 0 256 256" fill={TEXT} style={abs}>
        {bubbles.map((b, i) => {
          const bp = cyclePhase(T, off - b.d, 1.3, 1.52);
          return <circle key={i} cx={b.x} cy={b.y - 92 * bp} r={b.r * (0.35 + 0.65 * Math.min(1, bp * 3))}
            opacity={bp < 0.12 ? bp / 0.12 : bp > 0.75 ? (1 - bp) / 0.25 : 0.9} />;
        })}
      </svg>
    );
  }
  return null;
}

const CMD = "npx shadcn@latest add https://iconimate.app/r/bell.json";
const formatStars = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n));

/**
 * `withAudio` defaults on, so Studio plays the soundtrack. Rendering with it off
 * skips Remotion's ffprobe of the WAV — needed on machines where Smart App Control
 * blocks the unsigned ffmpeg/ffprobe Remotion bundles; see remotion/README.md.
 */
export type PromoProps = { withAudio: boolean };

export function Promo({ withAudio }: PromoProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const { Hover: H, Identical: I, Geometry: GE, Install: IN, Wall: WA, Sign: SI } = CUES;

  /* the live star count, the same endpoint as the site's button; hidden if it fails */
  const [stars, setStars] = useState<number | null>(null);
  const [handle] = useState(() => delayRender("GitHub star count"));
  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    fetch("https://api.github.com/repos/smammar100/Iconimate", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (typeof d?.stargazers_count === "number") setStars(d.stargazers_count); })
      .catch(() => {})
      .finally(() => { clearTimeout(timer); continueRender(handle); });
    return () => ctrl.abort();
  }, [handle]);

  /* ── camera: one restrained push during selection, otherwise still ─────── */
  const camS = kf(T, [0, H, H + 1.6, H + 2.7, I - 0.2, TOTAL], [1, 1.015, 1.13, 1.13, 1, 1.008], easeInOutCubic);
  const camY = 4 * Math.sin(T * 0.28);

  /* ── grid: assembles cell by cell from the bell outward, settles, dims, leaves ── */
  const gridScale = MOTION.glide(0.98, 1, 0.3, 3.6)(T) * MOTION.glide(1, 0.968, H + 2.7, 1.1)(T);
  const gridY = MOTION.glide(10, 0, 0.3, 3.2)(T);
  const gridOp = kf(T, [H + 2.7, I - 0.2], [1, 0]);
  const dimOthers = kf(T, [H + 0.6, H + 1.15], [1, 0.34], easeInOutCubic);
  const tileHi = kf(T, [H + 0.65, H + 1.0], [0, 1]);

  /* ── the bell: one element, carried from its tile to the wall ─────────────
     Every leg is a glide on the same curve; each keyframe is where the bell
     rests for the beat that follows. */
  const legs = [0, I - 0.2, I, I + 1.2, GE - 0.2, GE + 1.2, IN + 0.15, IN + 0.85, WA - 0.1, BELL_WALL.at];
  const bellX = kf(T, legs, [HERO_GLYPH.x, HERO_GLYPH.x, 960, 1160, 1160, 960, 960, 960, 960, BELL_WALL.x], easeInOutCubic);
  const bellY = kf(T, legs, [HERO_GLYPH.y, HERO_GLYPH.y, 470, 470, 470, 452, 452, 268, 268, BELL_WALL.y], easeInOutCubic);
  const bellSize = kf(T, legs, [30, 30, 130, 150, 150, 400, 400, 110, 110, 60], easeInOutCubic);
  const bellOp = kf(T, [0.1, 0.5], [0, 1]);

  /* the ring: three passes in the first half, then the wall's own loop.
     The first peak lands on the 4.5s bell hit, the inspector's three on 10.6 / 11.6 / 12.6. */
  const RING1 = H + 1.4, RING2 = I + 2.45, RING3 = GE + 1.43;
  const env = (a: number, b: number, c: number, d: number) => kf(T, [a, b, c, d], [0, 1, 1, 0]);
  const a1 = env(RING1 - 0.05, RING1, I - 0.4, I - 0.1);
  const a2 = env(RING2 - 0.05, RING2, GE - 0.3, GE - 0.05);
  const a3 = env(RING3 - 0.05, RING3, IN - 0.7, IN - 0.3);
  const ph1 = cyclePhase(T - RING1, 0, RING_DUR, 1.55);
  const ph2 = cyclePhase(T - RING2, 0, RING_DUR, 1.55);
  const ph3 = cyclePhase(T - RING3, 0, RING_DUR, 1.0);
  const wallLife = wakeUp(T, BELL_WALL.at) * (1 - kf(T, [SI - 0.75, SI + 0.15], [0, 1]));
  const phW = cyclePhase(T, 0, RING_DUR, RING_DUR + 0.22);
  const rot = bellRot(ph1) * a1 + bellRot(ph2) * a2 + bellRot(ph3) * a3 + bellRot(phW) * wallLife;
  const clap = clapX(ph1) * a1 + clapX(ph2) * a2 + clapX(ph3) * a3 + clapX(phW) * wallLife;

  /* ── cursor: enters on the kick, selects the bell, glances at the android ── */
  const curOp = kf(T, [H + 0.15, H + 0.5, H + 2.4, H + 2.7], [0, 1, 1, 0]);
  const curX = kf(T, [H + 0.15, H + 0.95, H + 1.7, H + 2.1], [1480, 992, 992, 1130], easeInOutCubic);
  const curY = kf(T, [H + 0.15, H + 0.95, H + 1.7, H + 2.1], [960, 552, 552, 540], easeInOutCubic);
  const curPress = MOTION.pop(1, 0.88, H + 1.25, 0.14)(T) / MOTION.pop(1, 0.88, H + 1.42, 0.14)(T);
  /* the android's one small hop, as the cursor passes it */
  const andPh = clamp((T - (H + 2.0)) / 0.55, 0, 1);

  /* ── comparison: one icon becomes two states ──────────────────────────── */
  const gone = (at: number) => kf(T, [at - 0.35, at + 0.25], [1, 0]);
  const twinOp = MOTION.enter(0, 1, I + 1.25, 0.65)(T) * gone(GE);
  const twinX = MOTION.glide(798, 760, I + 1.25, 0.7)(T);
  const lblOp = MOTION.enter(0, 1, I + 1.95, 0.4)(T) * gone(GE);
  const senOp = MOTION.enter(0, 1, I + 2.4, 0.45)(T) * gone(GE);
  const senY = MOTION.enter(10, 0, I + 2.4, 0.45)(T);

  /* ── geometry overlays: after the bell is in place, gone before it leaves ── */
  const geoOp = kf(T, [GE + 0.55, GE + 1.25, IN - 0.6, IN - 0.1], [0, 1, 1, 0]);
  const noteOp = kf(T, [GE + 2.0, GE + 2.5, IN - 0.6, IN - 0.1], [0, 1, 1, 0]);
  const noteDraw = tween(0, 1, GE + 2.0, GE + 2.9)(T);

  /* ── terminal: rises beneath the bell, types on the breakdown, hands off ── */
  const termOp = MOTION.enter(0, 1, IN + 0.55, 0.6)(T) * kf(T, [WA - 0.35, WA + 0.1], [1, 0]);
  const termY = MOTION.enter(26, 0, IN + 0.55, 0.7)(T) + kf(T, [WA - 0.35, WA + 0.1], [0, 22], easeInOutCubic);
  const typedN = Math.round(tween(0, CMD.length, IN + 0.5, IN + 2.5, easeInOutSine)(T));
  const typed = CMD.slice(0, typedN);
  const done = T > IN + 2.55;
  const caretOn = Math.floor(T * 2.2) % 2 === 0;
  const supOp = MOTION.enter(0, 1, IN + 2.7, 0.45)(T) * kf(T, [WA - 0.35, WA + 0.1], [1, 0]);

  /* ── wall: rows build on the drop, every tile carrying its own motion ────── */
  const cv = kf(T, [SI - 0.75, SI + 0.15], [0, 1], easeInOutCubic);
  const wallHeadOp = MOTION.enter(0, 1, WA + 0.6, 0.5)(T) * (1 - cv);
  const alienOp = MOTION.enter(0, 1, WA + 1.7, 0.5)(T) * (1 - cv);
  const alienS = MOTION.pop(0.9, 1, WA + 1.7, 0.6)(T);
  const wallPush = kf(T, [WA + 4.5, SI], [1, 1.04], easeInOutSine); // the 22.5s filter breakdown: a slow lean in

  /* ── sign-off: fractions of the scene, so trimming it keeps the CTA readable ── */
  const signDur = Math.max(1.2, TOTAL - SI);
  const SG = (f: number) => SI + f * signDur;
  const lockOp = kf(T, [SG(-0.02), SG(0.03)], [0, 1]);
  const drawA = MOTION.glide(1, 0, SG(0.01), 0.85)(T);
  const drawB = MOTION.glide(1, 0, SG(0.07), 0.85)(T);
  const drawC = MOTION.glide(1, 0, SG(0.12), 0.85)(T);
  const markS = MOTION.glide(0.96, 1, SG(0.01), 1.1)(T);
  const nameOp = MOTION.enter(0, 1, SG(0.2), 0.5)(T);
  const btnOp = MOTION.enter(0, 1, SG(0.45), 0.55)(T);
  const btnY = MOTION.glide(14, 0, SG(0.45), 0.75)(T);
  const rbPos = ((T % 2.5) / 2.5) * 200;

  /* ── background: two drifting blooms whose energy breathes with the cut ────── */
  const bgEnergy = kf(T, [0, 3, IN, WA - 0.4, WA + 1.6, SI - 0.3, SI + 1.2], [0.34, 0.42, 0.3, 0.34, 0.78, 0.6, 0.46], easeInOutCubic);
  const bgAx = Math.sin(T * 0.17) * 320 - 180, bgAy = Math.cos(T * 0.13) * 190 - 60;
  const bgBx = Math.cos(T * 0.11 + 1.7) * 380 + 200, bgBy = Math.sin(T * 0.15 + 0.6) * 210 + 90;
  const haloOp = kf(T, [SI - 1, SI + 1], [0, 1], easeInOutCubic);
  const grain = useMemo(() => <Grain />, []);

  const iconCount = visibleIconMeta.length;

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden", fontFamily: SANS, color: TEXT }}>
      {withAudio && <Audio src={staticFile("soundtrack.wav")} />}

      {/* atmosphere */}
      <div style={{ position: "absolute", inset: "-20%", transform: `translate(${bgAx.toFixed(1)}px,${bgAy.toFixed(1)}px)`,
        background: `radial-gradient(38% 42% at 50% 50%, rgba(110,86,247,${(0.22 * bgEnergy).toFixed(3)}), rgba(0,0,0,0) 70%)` }} />
      <div style={{ position: "absolute", inset: "-20%", transform: `translate(${bgBx.toFixed(1)}px,${bgBy.toFixed(1)}px)`,
        background: `radial-gradient(34% 40% at 50% 50%, rgba(10,133,255,${(0.16 * bgEnergy).toFixed(3)}), rgba(0,0,0,0) 72%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 42%, rgba(110,86,247,0.075), rgba(0,0,0,0) 64%)" }} />
      <div style={{ position: "absolute", inset: 0, opacity: haloOp, background: "radial-gradient(60% 50% at 50% 48%, rgba(110,86,247,0.16), rgba(0,0,0,0) 70%)" }} />
      {grain}

      <div style={{ position: "absolute", inset: 0, transform: `translateY(${camY}px) scale(${camS})`, transformOrigin: "960px 540px" }}>

        {/* ── 01 · the library assembles ──────────────────────────────── */}
        <div style={{ position: "absolute", inset: 0, opacity: gridOp, transform: `translateY(${gridY}px) scale(${gridScale})`, transformOrigin: "960px 540px" }}>
          {gridOp > 0 && GRID_CELLS.map((n, k) => {
            const i = k % GRID_COLS, j = Math.floor(k / GRID_COLS);
            const isHero = n === "__bell", isAnd = n === "__android";
            const dist = Math.max(Math.abs(i - HERO_COL), Math.abs(j - HERO_ROW));
            const at = 0.1 + dist * 0.22;
            const reveal = MOTION.enter(0, 1, at, 0.6)(T);
            const rise = MOTION.enter(8, 0, at, 0.6)(T);
            const hi = isHero ? tileHi : 0;
            return (
              <div key={k} style={{
                position: "absolute", left: COL_X(i), top: ROW_Y(j), width: CARD_W, height: CARD_H, boxSizing: "border-box",
                borderRadius: 8, background: `rgba(255,255,255,${(0.065 * hi).toFixed(3)})`, border: `1px solid rgba(255,255,255,${(0.17 * hi).toFixed(3)})`,
                padding: "0 16px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 14,
                opacity: reveal * (isHero ? 1 : dimOthers), transform: `translateY(${rise}px)`,
              }}>
                <div style={{ height: 32 }}>
                  {isHero ? null : isAnd ? (
                    <div style={{ transformOrigin: "50% 88%", transform: `translateY(${(hopY(andPh) * 0.7 * 30) / 256}px) scale(${hopSX(andPh)}, ${hopSY(andPh)})` }}>
                      <Glyph name="android-logo" size={30} />
                    </div>
                  ) : (
                    <Glyph name={n} size={30} />
                  )}
                </div>
                <span style={{ display: "block", fontSize: 14, color: FAINT, letterSpacing: "0.01em" }}>{title(isHero ? "bell" : isAnd ? "android-logo" : n)}</span>
              </div>
            );
          })}
        </div>

        {/* ── 03 · one icon, two states ───────────────────────────────── */}
        {twinOp > 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: twinX - 75, top: 470 - 75, width: 150, height: 150, display: "grid", placeItems: "center", opacity: twinOp }}>
              <svg width={150} height={150} viewBox="0 0 256 256" fill={TEXT}><path d={BELL_FULL} /></svg>
            </div>
            <div style={{ position: "absolute", left: 760 - 120, top: 588, width: 240, textAlign: "center", fontFamily: MONO, fontSize: 24, color: FAINT, opacity: lblOp }}>Phosphor</div>
            <div style={{ position: "absolute", left: 1160 - 120, top: 588, width: 240, textAlign: "center", fontFamily: MONO, fontSize: 24, color: TEXT, opacity: lblOp }}>Iconimate</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 680, textAlign: "center", fontSize: 28, color: DIM, letterSpacing: "-0.01em", opacity: senOp, transform: `translateY(${senY}px)` }}>
              Pixel-identical at rest. The motion is the only difference.
            </div>
          </div>
        )}

        {/* ── 04 · the motion, inspected ──────────────────────────────── */}
        {geoOp > 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: geoOp }}>
            <svg width={400} height={400} viewBox="0 0 256 256" style={{ position: "absolute", left: 960 - 200, top: 452 - 200, overflow: "visible" }}>
              <circle cx={128} cy={24} r={5} fill={ACCENT} />
              <circle cx={128} cy={24} r={12} fill="none" stroke={ACCENT} strokeWidth={1.4} opacity={0.5} />
              <path d="M128,24 L128,232" stroke={ACCENT} strokeWidth={1} strokeDasharray="4 5" opacity={0.45} />
              <path d="M83,222 A 208 208 0 0 1 173,222" fill="none" stroke={ACCENT} strokeWidth={1.4} opacity={0.6} />
              <path d={`M128,24 L${128 + 208 * Math.sin((rot * Math.PI) / 180)},${24 + 208 * Math.cos((rot * Math.PI) / 180)}`} stroke={ACCENT} strokeWidth={1.2} opacity={0.85} />
              {/* the one handwritten note: an arrow to the pivot, drawn on */}
              <path d="M52,-12 C 80,-6 104,4 120,18" fill="none" stroke={TEXT} strokeWidth={1.6} strokeLinecap="round" opacity={noteOp}
                pathLength={1} strokeDasharray={1} strokeDashoffset={1 - noteDraw} />
            </svg>
            <div style={{ position: "absolute", left: 960 - 200 - 150, top: 452 - 200 - 60, fontFamily: SCRIPT, fontSize: 36, color: TEXT, opacity: noteOp, transform: "rotate(-4deg)" }}>
              hangs from its crown
            </div>
            <div style={{ position: "absolute", left: 1240, top: 388, fontFamily: MONO, whiteSpace: "nowrap", lineHeight: 1.8, fontVariantNumeric: "tabular-nums" }}>
              <div style={{ fontSize: 23, color: TEXT }}>pivot · crown (128, 24)</div>
              <div style={{ fontSize: 21, color: FAINT }}>dome · r=80 @ (128, 104)</div>
              <div style={{ fontSize: 21, color: FAINT }}>max on-artboard swing · 12.20°</div>
              <div style={{ fontSize: 26, color: ACCENT, marginTop: 10 }}>swing = {Math.abs(rot).toFixed(1)}°</div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 812, textAlign: "center", fontSize: 26, color: FAINT }}>
              Every angle measured off the glyph’s own path.
            </div>
          </div>
        )}

        {/* ── 05 · packaged as a component ────────────────────────────── */}
        {termOp > 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: termOp, transform: `translateY(${termY}px)` }}>
            <div style={{ position: "absolute", left: 510, top: 420, width: 900, borderRadius: 12, background: "#141414",
              border: `1px solid rgba(255,255,255,${done ? 0.16 : 0.09})`, boxShadow: "0 24px 60px rgba(0,0,0,0.45)", overflow: "hidden" }}>
              <div style={{ height: 42, borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
                {[0, 1, 2].map((i) => <span key={i} style={{ width: 10, height: 10, borderRadius: 999, background: "#333" }} />)}
              </div>
              <div style={{ padding: "30px 30px 36px", fontFamily: MONO, fontSize: 27, color: TEXT, whiteSpace: "pre" }}>
                <span style={{ color: GLOW }}>$ </span>{typed}<span style={{ color: ACCENT, opacity: caretOn ? 1 : 0 }}>▍</span>
              </div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 638, textAlign: "center", fontSize: 24, color: FAINT, opacity: supOp }}>
              One component. One dependency. MIT.
            </div>
          </div>
        )}

        {/* ── 06 · the whole library, alive ───────────────────────────── */}
        {T > WA - 1 && cv < 1 && (
          <div style={{ position: "absolute", inset: 0, transform: `scale(${wallPush})`, transformOrigin: "960px 540px" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 186, textAlign: "center", fontFamily: MONO, fontSize: 28, color: DIM, letterSpacing: "0.02em", opacity: wallHeadOp }}>
              {iconCount}* · New icon animations added weekly
            </div>
            {WALL_TILES.map((k, idx) => {
              if (k === "__bell") return null;
              const { x: x0, y: y0, at } = wallPos(idx);
              const rv = MOTION.enter(0, 1, at, 0.45)(T);
              const rise = MOTION.enter(12, 0, at, 0.45)(T);
              const life = wakeUp(T, at) * (1 - cv);
              const m = wallMotion(k, T, idx * 0.53, 60);
              const cxv = (960 - x0) * 0.11 * cv, cyv = (540 - y0) * 0.11 * cv;
              return (
                <div key={k} style={{ position: "absolute", left: x0 - 52, top: y0 - 52, width: 104, height: 104, display: "grid", placeItems: "center",
                  opacity: rv * (1 - cv), transform: `translate(${cxv}px,${rise + cyv}px)` }}>
                  <div style={{ transformOrigin: m.origin,
                    transform: `translate(${m.x * life}px,${m.y * life}px) rotate(${m.r * life}deg) scale(${1 + (m.sx - 1) * life},${1 + (m.sy - 1) * life})` }}>
                    <div style={{ position: "relative", width: 60, height: 60 }}>
                      {/* Clipped to the box, as the site's cards are: barricade's stripes
                          are authored past the viewBox and paint as a scribble otherwise. */}
                      <Glyph name={k} size={60} />
                      <WallExtras k={k} T={T} off={idx * 0.53} size={60} />
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ position: "absolute", left: 960 - 46, top: 812, width: 92, height: 92, opacity: alienOp, transform: `scale(${alienS})` }}>
              <svg width={92} height={92} viewBox="0 0 256 256" fill={TEXT} style={{ overflow: "visible" }}>
                <defs><filter id="alienglow" x="-75%" y="-75%" width="250%" height="250%"><feGaussianBlur stdDeviation="11" /></filter></defs>
                {ALIEN.map((p, i) => <path key={i} d={p.d} />)}
                <g fill={GLOW} filter="url(#alienglow)" opacity={0.4 + 0.45 * (0.5 + 0.5 * Math.sin(T * 4.2))} transform="translate(128 124) scale(1.45) translate(-128 -124)">
                  <path d={ALIEN_EYE_L} /><path d={ALIEN_EYE_R} />
                </g>
                <g fill={GLOW} filter="url(#alienglow)" opacity={0.55 + 0.35 * (0.5 + 0.5 * Math.sin(T * 4.2))}><path d={ALIEN_EYE_L} /><path d={ALIEN_EYE_R} /></g>
                <g fill={GLOW}><path d={ALIEN_EYE_L} /><path d={ALIEN_EYE_R} /></g>
              </svg>
            </div>
          </div>
        )}

        {/* ── 07 · Iconimate ──────────────────────────────────────────── */}
        {lockOp > 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: lockOp }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 376, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
              <div style={{ width: 148, height: 148, flex: "0 0 auto", transform: `scale(${markS})` }}>
                <svg width={148} height={148} viewBox="0 0 64 64" fill="none" style={{ overflow: "visible" }}>
                  {/* the logo mark, drawing itself: script I, thick swash, thin swash (components/dark/logo-mark.tsx) */}
                  <path d="M18 16 C 26 9.5, 39 8.5, 47 13" stroke={TEXT} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={drawA} />
                  <path d="M43 11 C 38 21, 31 32, 26.5 41 C 25.5 43.5, 26.5 45.5, 29.5 44.5" stroke={TEXT} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={drawA} />
                  <path d="M14 50 C 26 56.5, 41 56.5, 51 48" stroke={TEXT} strokeWidth={3.2} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={drawB} />
                  <path d="M20 57.5 C 29 62, 39 62, 46.5 56.5" stroke={TEXT} strokeWidth={1.7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={drawC} />
                </svg>
              </div>
              <div style={{ fontFamily: SCRIPT, fontWeight: 600, fontSize: 100, lineHeight: "1em", color: TEXT, letterSpacing: "0.01em", opacity: nameOp, paddingBottom: 10 }}>Iconimate</div>
            </div>
            {/* Star on GitHub — .dc-btn--rainbow, scaled 2× for the 1920 canvas */}
            <div style={{ position: "absolute", left: 0, right: 0, top: 624, display: "flex", justifyContent: "center", opacity: btnOp, transform: `translateY(${btnY}px)` }}>
              <div style={{ position: "relative", display: "inline-flex" }}>
                <div style={{ position: "absolute", left: "50%", bottom: "-14%", width: "37%", height: "21%", transform: "translateX(-50%)", borderRadius: 999,
                  background: RAINBOW, backgroundSize: "200% 100%", backgroundPosition: `${rbPos}% 0`, filter: "blur(30px) saturate(1.4)", opacity: 0.85 }} />
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 15, height: 76, padding: "0 24px", borderRadius: 15,
                  border: "2.4px solid transparent",
                  background: `linear-gradient(${SURFACE}, ${SURFACE}) padding-box, ${RAINBOW} border-box`,
                  backgroundSize: "100% 100%, 200% 100%", backgroundPosition: `0 0, ${rbPos}% 0`,
                  fontFamily: SANS, fontWeight: 500, fontSize: 26, color: TEXT, whiteSpace: "nowrap" }}>
                  <svg width={28} height={28} viewBox="0 0 24 24" fill={TEXT}><path d={GH_PATH} /></svg>
                  <span>Star on GitHub</span>
                  {stars !== null && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, marginLeft: 8, paddingLeft: 16, borderLeft: "1px solid rgba(255,255,255,0.18)",
                      fontFamily: MONO, fontSize: 24, fontVariantNumeric: "tabular-nums" }}>
                      <svg width={22} height={22} viewBox="0 0 24 24" fill={TEXT}><path d={STAR_PATH} /></svg>
                      {formatStars(stars)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── the bell, one element across every beat ─────────────────── */}
        <div style={{ position: "absolute", left: bellX - bellSize / 2, top: bellY - bellSize / 2, width: bellSize, height: bellSize,
          opacity: bellOp * (T > WA ? 1 - cv : 1), transform: T > WA ? `translate(${(960 - BELL_WALL.x) * 0.11 * cv}px,${(540 - BELL_WALL.y) * 0.11 * cv}px)` : undefined }}>
          <Bell size={bellSize} rot={rot} clap={clap} color={TEXT} />
        </div>

        {/* ── cursor ─────────────────────────────────────────────────── */}
        {curOp > 0 && (
          <div style={{ position: "absolute", left: curX, top: curY, opacity: curOp, transform: `scale(${curPress})`, transformOrigin: "4px 4px" }}>
            <svg width={30} height={30} viewBox="0 0 24 24" fill="#fff" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))" }}>
              <path d="M5 3l14 8.5-6.2 1.2L10 20 5 3z" stroke={BG} strokeWidth={1} strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

/** Fine static grain over the blooms, so the gradients read as atmosphere rather than banding. */
function Grain() {
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.045, mixBlendMode: "screen" }}>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}
