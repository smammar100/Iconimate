"use client";

import { useRef } from "react";
import type { IconHandle } from "@/lib/icon";
import { ThemeToggle } from "@/components/dark/theme-toggle";
import { PLANE } from "./tilt-icon";
import { TiltV1 } from "./variants/b1";
import { TiltV2 } from "./variants/b2";
import { TiltV3 } from "./variants/b3";
import { TiltV4 } from "./variants/b4";
import { TiltV5 } from "./variants/b5";

const VARIANTS = [
  { n: 1, name: "Loop (cw)", C: TiltV1 },
  { n: 2, name: "Bank (loop)", C: TiltV2 },
  { n: 3, name: "Zoom", C: TiltV3 },
  { n: 4, name: "Float (loop)", C: TiltV4 },
  { n: 5, name: "Buzz", C: TiltV5 },
];

export default function Lab() {
  const refs = useRef<(IconHandle | null)[]>([]);
  const playAll = () => refs.current.forEach((r) => r?.startAnimation());

  return (
    <main className="dc">
      <div className="dc-hero__glow" aria-hidden />
      <div className="dc-shell">
        <nav className="dc-nav">
          <div className="dc-logo">
            <span className="dc-logo-mark">I</span>
            <span>Iconimate</span>
            <span className="dc-mono" style={{ marginLeft: 6, color: "var(--text-faint)", fontSize: 12 }}>
              / lab
            </span>
          </div>
          <div className="dc-nav-links">
            <a href="/">← Back to set</a>
            <ThemeToggle />
          </div>
        </nav>

        <header className="lab-head">
          <span className="lab-eyebrow">
            <span className="dc-eyebrow__dot" />
            Prototype · airplane tilt · 5 candidates
          </span>
          <h1 className="lab-title">Give it a spin.</h1>
          <p className="lab-sub">
            Five takes on the banked craft — a full clockwise barrel-roll loop, a back-and-forth
            wing-rock bank, a quick zoom along its heading, a weightless float, and an excitable
            buzz. Hover any card to preview, or click to replay. Tell me the number you want.
          </p>
          <div className="lab-toolbar">
            <button type="button" className="dc-btn" onClick={playAll}>
              Play all
            </button>
            <div className="lab-source">
              <span className="lab-source__icon">
                <svg width="22" height="22" viewBox="0 0 256 256" fill="currentColor" aria-hidden>
                  <path d={PLANE} />
                </svg>
              </span>
              <span className="dc-mono" style={{ fontSize: 12.5 }}>
                Phosphor airplane tilt · 256 grid
              </span>
            </div>
          </div>
        </header>

        <div className="lab-grid">
          {VARIANTS.map((v, i) => {
            const C = v.C;
            return (
              <button
                key={v.n}
                type="button"
                className="lab-card"
                aria-label={`Variant ${v.n}: ${v.name}`}
                onMouseEnter={() => refs.current[i]?.startAnimation()}
                onMouseLeave={() => refs.current[i]?.stopAnimation()}
                onClick={() => refs.current[i]?.startAnimation()}
              >
                <span className="lab-card__num dc-mono">v{v.n}</span>
                <span className="lab-card__icon">
                  <C
                    ref={(el) => {
                      refs.current[i] = el;
                    }}
                    size={72}
                  />
                </span>
                <span className="lab-card__name">{v.name}</span>
                <span className="lab-card__hint dc-mono">hover · click to replay</span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
