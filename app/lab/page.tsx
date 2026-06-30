"use client";

import { useRef } from "react";
import type { IconHandle } from "@/lib/icon";
import { ThemeToggle } from "@/components/dark/theme-toggle";
import { AXE } from "./axe-icon";
import { Axe1 } from "./variants/axe1";
import { Axe2 } from "./variants/axe2";
import { Axe3 } from "./variants/axe3";
import { Axe4 } from "./variants/axe4";
import { Axe5 } from "./variants/axe5";
import { Axe6 } from "./variants/axe6";
import { Axe7 } from "./variants/axe7";
import { Axe8 } from "./variants/axe8";

const VARIANTS = [
  { n: 1, name: "Pop (spring)", C: Axe1 },
  { n: 2, name: "Swing in (from wound back)", C: Axe2 },
  { n: 3, name: "Chop (wind-up + swing)", C: Axe3 },
  { n: 4, name: "Chop + recoil (impact bounce)", C: Axe4 },
  { n: 5, name: "Chop + spark (impact burst)", C: Axe5 },
  { n: 6, name: "Chop loop + speed lines (from video)", C: Axe6 },
  { n: 7, name: "Chop + trails + spark (random colour)", C: Axe7 },
  { n: 8, name: "Chop, contained (v3 motion, in bounds)", C: Axe8 },
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
            Prototype · axe · 8 candidates
          </span>
          <h1 className="lab-title">Take a swing.</h1>
          <p className="lab-sub">
            Five takes on axe, each one better than the last — a springy pop, then a swing
            into place from wound back, then a real chop with an anticipation wind-up, then
            the chop with an impact recoil as the blade bites, and finally the full hit: a
            chop with a starburst of sparks flying off the blade on contact. The whole
            glyph swings as a rigid body, pivoting on the grip. Hover any card to preview,
            or click to replay.
          </p>
          <div className="lab-toolbar">
            <button type="button" className="dc-btn" onClick={playAll}>
              Play all
            </button>
            <div className="lab-source">
              <span className="lab-source__icon">
                <svg width="22" height="22" viewBox="0 0 256 256" fill="currentColor" aria-hidden>
                  <path d={AXE} />
                </svg>
              </span>
              <span className="dc-mono" style={{ fontSize: 12.5 }}>
                Phosphor axe · 256 grid
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
