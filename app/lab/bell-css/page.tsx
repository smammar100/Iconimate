"use client";

import { useCallback, useId, useRef, useState } from "react";

/**
 * LAB — Bell, 5 candidates that escalate.
 *
 * Each one is the previous one plus a beat: tap → ring → broadcast → alert → grand peal.
 * They share one spine so the comparison is fair — the same strike, the same pivots, the
 * same rest — and differ only in how much is layered on top.
 *
 * CSS keyframes only. Transform, opacity and stroke-dashoffset, nothing else. Every unit
 * lives inside the <svg>, so the whole thing scales with the viewBox for free. Played once
 * on hover after a 130ms dwell and guaranteed to finish: leaving never cancels a run.
 *
 * THE VERB: a bell rings because the clapper crosses and strikes the wall — not because
 * something waggled it. The clapper drives; the shell answers the impact.
 *
 * EVERY NUMBER IS READ OFF THE PATH.
 *
 * The collar's dip (`a40,40,0,0,0,78.38,0`) and the clapper's arcs (r=24) are CONCENTRIC
 * about (128,192) — measured, not assumed — leaving a wall of exactly 40-24 = 16 units,
 * which is Phosphor's stroke weight. From that:
 *
 *   · the clapper's true pivot is (128,192), NOT the collar line at y=200;
 *   · about that centre the dip spans 11.55°..168.45° and the clapper 19.50°..160.50°,
 *     so there is 7.95° of slack per side. STRIKE = 7.95°, the exact angle at which the
 *     clapper's edge meets the wall. Past it the clapper would cut through the outline.
 *   · the shell hangs from its crown (128,24) — the dome is r=80 about (128,104);
 *   · the glyph's box is x32..224, y24..232, and the largest rotation about the crown
 *     that keeps every sampled point on the artboard is 12.20°, so the shells swing 9°;
 *   · the badge sits at (212,44) r=16 — the only spot tried that clears the dome (by 7.2
 *     units) while staying inside the box;
 *   · the sound arcs run at r=88 and r=100 about (128,112): the dome's edge at that y is
 *     x=48.4 (r≈79.6), so 88 clears the bell and 100 plus a 5-unit half-stroke stops at 23.
 *
 * The clapper lives in the mask, which lives in the shell's group, so its CSS angle is
 * measured RELATIVE to the shell — the quantity that actually decides contact, and the
 * double-pendulum relationship a real bell has, for free.
 *
 * SPLITTING THIS GLYPH IS A TRAP. Dome = subpaths 1+3 and clapper = subpath 2 each FILLED
 * adds 528px of ink (0.81% of the box), all in y192..223: subpath 2 sits inside the collar's
 * dip lobe wound the other way, so under nonzero they cancel and the clapper is a HOLE, not
 * ink. A hole that has to move is a mask.
 */
const DOME =
  "M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06Z" +
  "M48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z";
const CLAPPER = "M128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216Z";

const WAVES = [
  "M48.25,74.81A88,88,0,0,0,48.25,149.19",
  "M207.75,74.81A88,88,0,0,1,207.75,149.19",
  "M37.37,69.74A100,100,0,0,0,37.37,154.26",
  "M218.63,69.74A100,100,0,0,1,218.63,154.26",
];

type Variant = {
  id: string;
  name: string;
  blurb: string;
  adds: string;
  ms: number;
  waves?: boolean;
  badge?: boolean;
};

const VARIANTS: Variant[] = [
  {
    id: "t1",
    name: "1 · Tap",
    blurb: "One precise hit, a 3° counter-tick from the shell",
    adds: "the baseline: strike + answer, nothing else",
    ms: 620,
  },
  {
    id: "t2",
    name: "2 · Ring",
    blurb: "Strikes both walls; the shell swings its full 9°",
    adds: "+ a second strike and a real shell swing",
    ms: 720,
  },
  {
    id: "t3",
    name: "3 · Broadcast",
    blurb: "The ring, and sound drawn outward on two fronts",
    adds: "+ arcs drawn with stroke-dashoffset, staggered",
    ms: 820,
    waves: true,
  },
  {
    id: "t4",
    name: "4 · Alert",
    blurb: "Sound plus a badge that lands on the beat",
    adds: "+ a notification dot, popped on the strike frame",
    ms: 880,
    waves: true,
    badge: true,
  },
  {
    id: "t5",
    name: "5 · Grand peal",
    blurb: "Wind back, hold, release — then everything at once",
    adds: "+ anticipation hold and the dome flexing as struck metal",
    ms: 940,
    waves: true,
    badge: true,
  },
];

/* Rest lives in the BASE rules, never only in a 0% keyframe — so an unplayed, paused or
   interrupted icon is always the untouched glyph. */
const CSS = `
.bl-svg { overflow: visible; }
.bl-shell { transform-box: view-box; transform-origin: 128px 24px; transform: rotate(0deg); }
.bl-flex  { transform-box: view-box; transform-origin: 128px 104px; transform: scale(1,1); }
.bl-clap  { transform-box: view-box; transform-origin: 128px 192px; transform: rotate(0deg); }
.bl-wave  { opacity: 0; stroke-dasharray: 1; stroke-dashoffset: 1; }
.bl-badge { transform-box: view-box; transform-origin: 212px 44px; transform: scale(0); opacity: 0; }

/* ─ 1 · TAP — the clapper falls under gravity (ease-in), lands on the wall at 7.95°,
   and only then does the shell tick the other way. Small on purpose. */
.bl-play-t1 .bl-shell { animation: bl-t1-shell 620ms both; }
.bl-play-t1 .bl-clap  { animation: bl-t1-clap  620ms both; }
@keyframes bl-t1-clap {
  0%   { transform: rotate(0deg);    animation-timing-function: cubic-bezier(.55,0,.85,.4); }
  32%  { transform: rotate(7.95deg); animation-timing-function: cubic-bezier(.2,0,.25,1); }
  58%  { transform: rotate(-4.2deg); animation-timing-function: cubic-bezier(.3,0,.3,1); }
  82%  { transform: rotate(1.8deg);  animation-timing-function: cubic-bezier(.3,0,.3,1); }
  100% { transform: rotate(0deg); }
}
@keyframes bl-t1-shell {
  0%,32% { transform: rotate(0deg);    animation-timing-function: cubic-bezier(.15,0,.2,1); }
  46%    { transform: rotate(-3deg);   animation-timing-function: cubic-bezier(.4,0,.3,1); }
  68%    { transform: rotate(1.6deg);  animation-timing-function: cubic-bezier(.4,0,.3,1); }
  86%    { transform: rotate(-0.6deg); animation-timing-function: cubic-bezier(.4,0,.3,1); }
  100%   { transform: rotate(0deg); }
}

/* ─ 2 · RING — the clapper crosses and hits the far wall too, so there are two contacts,
   and the shell now takes its full 9°. */
.bl-play-t2 .bl-shell { animation: bl-t2-shell 720ms both; }
.bl-play-t2 .bl-clap  { animation: bl-t2-clap  720ms both; }
@keyframes bl-t2-clap {
  0%   { transform: rotate(0deg);     animation-timing-function: cubic-bezier(.55,0,.85,.4); }
  24%  { transform: rotate(7.95deg);  animation-timing-function: cubic-bezier(.5,0,.85,.45); }
  48%  { transform: rotate(-7.95deg); animation-timing-function: cubic-bezier(.3,0,.3,1); }
  70%  { transform: rotate(4.6deg);   animation-timing-function: cubic-bezier(.3,0,.3,1); }
  88%  { transform: rotate(-2deg);    animation-timing-function: cubic-bezier(.3,0,.3,1); }
  100% { transform: rotate(0deg); }
}
@keyframes bl-t2-shell {
  0%,24% { transform: rotate(0deg);    animation-timing-function: cubic-bezier(.15,0,.2,1); }
  38%    { transform: rotate(-9deg);   animation-timing-function: cubic-bezier(.4,0,.35,1); }
  62%    { transform: rotate(6.4deg);  animation-timing-function: cubic-bezier(.4,0,.35,1); }
  82%    { transform: rotate(-2.8deg); animation-timing-function: cubic-bezier(.4,0,.3,1); }
  100%   { transform: rotate(0deg); }
}

/* ─ 3 · BROADCAST — the ring, and the sound leaves it. The arcs are DRAWN (dashoffset,
   pathLength=1 so the CSS talks in 0..1 whatever the arc length), inner pair on the strike,
   outer pair a beat behind, both gone before the end. They rest at opacity 0. */
.bl-play-t3 .bl-shell { animation: bl-t3-shell 820ms both; }
.bl-play-t3 .bl-clap  { animation: bl-t3-clap  820ms both; }
.bl-play-t3 .bl-wave  { animation: bl-wave-out 520ms both 180ms; }
.bl-play-t3 .bl-wave-far { animation-delay: 265ms; }
@keyframes bl-t3-clap {
  0%   { transform: rotate(0deg);     animation-timing-function: cubic-bezier(.55,0,.85,.4); }
  22%  { transform: rotate(7.95deg);  animation-timing-function: cubic-bezier(.5,0,.85,.45); }
  45%  { transform: rotate(-7.95deg); animation-timing-function: cubic-bezier(.3,0,.3,1); }
  68%  { transform: rotate(4.4deg);   animation-timing-function: cubic-bezier(.3,0,.3,1); }
  86%  { transform: rotate(-1.9deg);  animation-timing-function: cubic-bezier(.3,0,.3,1); }
  100% { transform: rotate(0deg); }
}
@keyframes bl-t3-shell {
  0%,22% { transform: rotate(0deg);    animation-timing-function: cubic-bezier(.15,0,.2,1); }
  36%    { transform: rotate(-9deg);   animation-timing-function: cubic-bezier(.4,0,.35,1); }
  60%    { transform: rotate(6deg);    animation-timing-function: cubic-bezier(.4,0,.35,1); }
  80%    { transform: rotate(-2.6deg); animation-timing-function: cubic-bezier(.4,0,.3,1); }
  100%   { transform: rotate(0deg); }
}
@keyframes bl-wave-out {
  0%   { opacity: 0;   stroke-dashoffset: 1; animation-timing-function: cubic-bezier(.45,0,.15,1); }
  22%  { opacity: .6; }
  64%  { opacity: .6;  stroke-dashoffset: 0; }
  100% { opacity: 0;   stroke-dashoffset: 0; }
}

/* ─ 4 · ALERT — broadcast plus the badge, which lands ON the strike frame rather than
   drifting in afterwards, so the hit and the notification are one event. */
.bl-play-t4 .bl-shell { animation: bl-t4-shell 880ms both; }
.bl-play-t4 .bl-clap  { animation: bl-t4-clap  880ms both; }
.bl-play-t4 .bl-wave  { animation: bl-wave-out 520ms both 194ms; }
.bl-play-t4 .bl-wave-far { animation-delay: 280ms; }
.bl-play-t4 .bl-badge { animation: bl-badge-pop 560ms both 194ms; }
@keyframes bl-t4-clap {
  0%   { transform: rotate(0deg);     animation-timing-function: cubic-bezier(.55,0,.85,.4); }
  22%  { transform: rotate(7.95deg);  animation-timing-function: cubic-bezier(.5,0,.85,.45); }
  45%  { transform: rotate(-7.95deg); animation-timing-function: cubic-bezier(.3,0,.3,1); }
  68%  { transform: rotate(4.4deg);   animation-timing-function: cubic-bezier(.3,0,.3,1); }
  86%  { transform: rotate(-1.9deg);  animation-timing-function: cubic-bezier(.3,0,.3,1); }
  100% { transform: rotate(0deg); }
}
@keyframes bl-t4-shell {
  0%,22% { transform: rotate(0deg);    animation-timing-function: cubic-bezier(.15,0,.2,1); }
  36%    { transform: rotate(-9deg);   animation-timing-function: cubic-bezier(.4,0,.35,1); }
  60%    { transform: rotate(6deg);    animation-timing-function: cubic-bezier(.4,0,.35,1); }
  80%    { transform: rotate(-2.6deg); animation-timing-function: cubic-bezier(.4,0,.3,1); }
  100%   { transform: rotate(0deg); }
}
@keyframes bl-badge-pop {
  0%   { transform: scale(0);    opacity: 0; animation-timing-function: cubic-bezier(.34,1.56,.64,1); }
  34%  { transform: scale(1.25); opacity: 1; animation-timing-function: cubic-bezier(.3,0,.3,1); }
  50%  { transform: scale(1);    opacity: 1; }
  78%  { transform: scale(1);    opacity: 1; animation-timing-function: cubic-bezier(.5,0,.9,.4); }
  100% { transform: scale(.6);   opacity: 0; }
}

/* ─ 5 · GRAND PEAL — three countable beats at ~313ms each: the shell winds back and HOLDS
   (20%..34%, long enough that the pull reads as deliberate) with the clapper hanging
   against the high side under gravity; the release, where the light arm overtakes the heavy
   shell and strikes; then the ring-out, with the dome flexing oval as struck metal does. */
.bl-play-t5 .bl-shell { animation: bl-t5-shell 940ms both; }
.bl-play-t5 .bl-clap  { animation: bl-t5-clap  940ms both; }
.bl-play-t5 .bl-flex  { animation: bl-t5-flex  940ms both; }
.bl-play-t5 .bl-wave  { animation: bl-wave-out 520ms both 470ms; }
.bl-play-t5 .bl-wave-far { animation-delay: 555ms; }
.bl-play-t5 .bl-badge { animation: bl-badge-pop 470ms both 470ms; }
@keyframes bl-t5-clap {
  0%      { transform: rotate(0deg);     animation-timing-function: cubic-bezier(.3,0,.4,1); }
  20%,34% { transform: rotate(-4.2deg);  animation-timing-function: cubic-bezier(.6,0,.85,.4); }
  50%     { transform: rotate(7.95deg);  animation-timing-function: cubic-bezier(.25,0,.3,1); }
  70%     { transform: rotate(-5deg);    animation-timing-function: cubic-bezier(.3,0,.3,1); }
  86%     { transform: rotate(2.2deg);   animation-timing-function: cubic-bezier(.3,0,.3,1); }
  100%    { transform: rotate(0deg); }
}
@keyframes bl-t5-shell {
  0%      { transform: rotate(0deg);     animation-timing-function: cubic-bezier(.25,0,.3,1); }
  20%,34% { transform: rotate(6.4deg);   animation-timing-function: cubic-bezier(.6,0,.8,.45); }
  52%     { transform: rotate(-9deg);    animation-timing-function: cubic-bezier(.4,0,.35,1); }
  72%     { transform: rotate(6.2deg);   animation-timing-function: cubic-bezier(.4,0,.35,1); }
  88%     { transform: rotate(-2.6deg);  animation-timing-function: cubic-bezier(.4,0,.3,1); }
  100%    { transform: rotate(0deg); }
}
@keyframes bl-t5-flex {
  0%,50% { transform: scale(1,1);         animation-timing-function: cubic-bezier(.3,0,.3,1); }
  58%    { transform: scale(1.045,.955);  animation-timing-function: cubic-bezier(.3,0,.3,1); }
  70%    { transform: scale(.98,1.02);    animation-timing-function: cubic-bezier(.3,0,.3,1); }
  84%    { transform: scale(1.012,.988);  animation-timing-function: cubic-bezier(.3,0,.3,1); }
  100%   { transform: scale(1,1); }
}

/* Frame strip: the same keyframes, frozen. A negative delay seeks to the offset and
   animation-play-state:paused holds it, so the strip samples the real animation. */
.bl-frame .bl-shell, .bl-frame .bl-clap, .bl-frame .bl-flex,
.bl-frame .bl-wave, .bl-frame .bl-badge { animation-play-state: paused !important; }
`;

function Bell({
  v,
  size,
  playing,
  seek,
  onEnd,
}: {
  v: Variant;
  size: number;
  playing: boolean;
  seek?: number;
  onEnd?: (name: string) => void;
}) {
  const maskId = `bl-mask-${v.id}-${useId()}`;
  const frozen = seek !== undefined;
  const delay = frozen ? { animationDelay: `-${Math.round(seek * v.ms)}ms` } : undefined;

  return (
    <svg
      className={`bl-svg ${playing || frozen ? `bl-play-${v.id}` : ""} ${frozen ? "bl-frame" : ""}`}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      onAnimationEnd={(e) => onEnd?.(e.animationName)}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          {/* white keeps, black cuts — the clapper subtracts itself from the collar */}
          <rect x="0" y="0" width="256" height="256" fill="#fff" />
          <path className="bl-clap" style={delay} d={CLAPPER} fill="#000" />
        </mask>
      </defs>

      {/* Sound and badge sit OUTSIDE the shell group: they are what the bell emits, so they
          must not swing with it — a fixed reference is what makes the swing readable. */}
      {v.waves &&
        WAVES.map((d, i) => (
          <path
            key={d}
            className={`bl-wave ${i > 1 ? "bl-wave-far" : ""}`}
            style={delay}
            d={d}
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth={10}
            strokeLinecap="round"
          />
        ))}
      {v.badge && <circle className="bl-badge" style={delay} cx={212} cy={44} r={16} />}

      <g className="bl-shell" style={delay}>
        <g className="bl-flex" style={delay}>
          <path d={DOME} mask={`url(#${maskId})`} />
        </g>
      </g>
    </svg>
  );
}

/** Dwell 130ms before starting; once started, always run to completion. */
function Tile({ v }: { v: Variant }) {
  const [playing, setPlaying] = useState(false);
  const dwell = useRef<number | undefined>(undefined);

  const enter = useCallback(() => {
    window.clearTimeout(dwell.current);
    dwell.current = window.setTimeout(() => setPlaying(true), 130);
  }, []);
  // Leaving cancels only a pending START. A run in flight is never interrupted.
  const leave = useCallback(() => window.clearTimeout(dwell.current), []);
  const onEnd = useCallback(
    (name: string) => {
      if (name === `bl-${v.id}-shell`) setPlaying(false);
    },
    [v.id],
  );

  return (
    <div
      tabIndex={0}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={leave}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "30px 16px 20px",
        borderRadius: 16,
        background: "var(--surface)",
        border: "1px solid var(--border-2)",
        outline: "none",
      }}
    >
      <Bell v={v} size={76} playing={playing} onEnd={onEnd} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{v.name}</div>
        <div style={{ fontSize: 11, opacity: 0.55, marginTop: 4 }}>{v.blurb}</div>
        <div style={{ fontSize: 10, opacity: 0.4, marginTop: 6, fontStyle: "italic" }}>{v.adds}</div>
        <div style={{ fontSize: 10, opacity: 0.3, marginTop: 4 }}>{v.ms}ms</div>
      </div>
    </div>
  );
}

const FRAMES = [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84, 1];

export default function BellCssLab() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        padding: "56px 24px 96px",
        fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Bell — 5 escalating candidates (CSS keyframes)</h1>
        <p style={{ opacity: 0.55, fontSize: 14, marginTop: 8, maxWidth: 640 }}>
          Each is the previous plus a beat. Same strike, same pivots, same rest — so what you
          are comparing is the layering, not five unrelated ideas. Hover a tile: 130ms dwell,
          then it plays once and always finishes. Strike 7.95°, the measured slack between the
          clapper and the collar wall; shell 9°, inside the 12.2° that keeps it in frame.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 14,
            marginTop: 28,
          }}
        >
          {VARIANTS.map((v) => (
            <Tile key={v.id} v={v} />
          ))}
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 48 }}>Frame strips</h2>
        <p style={{ opacity: 0.55, fontSize: 13, marginTop: 6 }}>
          The real animation, paused and seeked — not a redraw. First and last frame must be
          the untouched glyph; nothing in between should read as loose parts.
        </p>
        {VARIANTS.map((v) => (
          <div key={v.id} style={{ marginTop: 22 }}>
            <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 6 }}>
              {v.name} · {v.ms}ms
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FRAMES.map((f) => (
                <div
                  key={f}
                  style={{
                    border: "1px solid var(--border-2)",
                    borderRadius: 8,
                    padding: 4,
                    background: "var(--surface)",
                    textAlign: "center",
                  }}
                >
                  <Bell v={v} size={62} playing={false} seek={f} />
                  <div style={{ fontSize: 9, opacity: 0.4 }}>{Math.round(f * 100)}%</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
