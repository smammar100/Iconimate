"use client";

import { useRef } from "react";
import type { IconHandle } from "@/lib/icon";
import { ThemeToggle } from "@/components/dark/theme-toggle";
import { TOWER } from "./control-tower-icon";
import { BannerV1 } from "./variants/b1";
import { BannerV2 } from "./variants/b2";
import { BannerV3 } from "./variants/b3";
import { BannerV4 } from "./variants/b4";
import { BannerV5 } from "./variants/b5";

const VARIANTS = [
  { n: 1, name: "Swing", C: BannerV1 },
  { n: 2, name: "Wind wave", C: BannerV2 },
  { n: 3, name: "Hoist", C: BannerV3 },
  { n: 4, name: "Antenna flip", C: BannerV4 },
  { n: 5, name: "Gust", C: BannerV5 },
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
            Prototype · control tower · 5 candidates
          </span>
          <h1 className="lab-title">Pick the animation for Control tower.</h1>
          <p className="lab-sub">
            Five takes on the same glyph. Hover any card to preview, or click to replay. Tell me the
            number you want and I’ll promote it into the main set.
          </p>
          <div className="lab-toolbar">
            <button type="button" className="dc-btn" onClick={playAll}>
              Play all
            </button>
            <div className="lab-source">
              <span className="lab-source__icon">
                <svg width="22" height="22" viewBox="0 0 256 256" fill="currentColor" aria-hidden>
                  <path d={TOWER} />
                </svg>
              </span>
              <span className="dc-mono" style={{ fontSize: 12.5 }}>
                Phosphor control tower, filled · 256 grid
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
