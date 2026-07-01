"use client";

import { useRef } from "react";
import type { IconHandle } from "@/lib/icon";
import { ThemeToggle } from "@/components/dark/theme-toggle";
import { BABY_CARRIAGE } from "./baby-carriage-icon";
import { Bc1 } from "./variants/bc1";
import { Bc2 } from "./variants/bc2";
import { Bc3 } from "./variants/bc3";
import { Bc4 } from "./variants/bc4";
import { Bc5 } from "./variants/bc5";
import { Bc6 } from "./variants/bc6";
import { Bc7 } from "./variants/bc7";

const VARIANTS = [
  { n: 1, name: "Pop (spring)", C: Bc1 },
  { n: 2, name: "Roll in (push + settle)", C: Bc2 },
  { n: 3, name: "Rock (soothe)", C: Bc3 },
  { n: 4, name: "Bump ride (bounce + tilt)", C: Bc4 },
  { n: 5, name: "Hood unfurl + bounce (from baby-stroller.mp4)", C: Bc5 },
  { n: 6, name: "Hood breathe (from Stroller Lottie)", C: Bc6 },
  { n: 7, name: "Suspension bounce (body drop + canopy pivot)", C: Bc7 },
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
            Prototype · baby-carriage · 7 candidates
          </span>
          <h1 className="lab-title">Push along.</h1>
          <p className="lab-sub">
            Six takes on baby-carriage — a plain springy pop, a roll-in that arrives with
            momentum, a soothing rock on the wheels, a bumpy ride that bounces and tilts on
            its suspension, then the showpiece: the hood furling and unfurling as the pram
            springs on its suspension (measured from baby-stroller.mp4). Last is the quiet
            one: the body dead still while only the hood breathes — a subtle furl flutter
            traced from the Stroller Lottie. Hover any card to preview, or click to replay.
          </p>
          <div className="lab-toolbar">
            <button type="button" className="dc-btn" onClick={playAll}>
              Play all
            </button>
            <div className="lab-source">
              <span className="lab-source__icon">
                <svg width="22" height="22" viewBox="0 0 256 256" fill="currentColor" aria-hidden>
                  <path d={BABY_CARRIAGE} />
                </svg>
              </span>
              <span className="dc-mono" style={{ fontSize: 12.5 }}>
                Phosphor baby-carriage · 256 grid
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
