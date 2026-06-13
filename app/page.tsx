"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { icons } from "@/registry/icons";
import { DarkIconCard } from "@/components/dark/dark-icon-card";
import { CommandPalette } from "@/components/dark/command-palette";
import { FeaturedShowcase } from "@/components/dark/featured-showcase";
import { installCommand } from "@/components/dark/icon-meta";

export default function Home() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  // ⌘K / Ctrl+K opens the command palette from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const copy = useCallback(async (slug: string, name: string) => {
    try {
      await navigator.clipboard.writeText(installCommand(slug));
    } catch {
      /* clipboard unavailable */
    }
    setToast(name);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1900);
  }, []);

  return (
    <main className="dc">
      <div className="dc-hero__glow" aria-hidden />

      <div className="dc-shell">
        {/* nav */}
        <nav className="dc-nav">
          <div className="dc-logo">
            <span className="dc-logo-mark">I</span>
            <span>Iconimate</span>
          </div>
          <div className="dc-nav-links">
            <a href="#icons">Icons</a>
            <a href="https://github.com" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <button type="button" className="dc-btn dc-btn--ghost" onClick={() => setPaletteOpen(true)}>
              <span className="dc-mono" style={{ fontSize: 12 }}>⌘K</span>
            </button>
            <button type="button" className="dc-btn" onClick={() => copy("bell", "Bell")}>
              Get all icons
            </button>
          </div>
        </nav>

        {/* hero */}
        <header className="dc-hero">
          <div className="dc-hero__grid">
            <div>
              <span className="dc-eyebrow">
                <span className="dc-eyebrow__dot" />
                Open source · MIT · {icons.length} animated icons
              </span>
              <h1 className="dc-h1">
                Icons that
                <br />
                earn their motion.
              </h1>
              <p className="dc-sub">
                A hand-built set of animated SVG icons for React — spring physics, anticipation, and
                settle frames, calibrated to read at 24px.
              </p>

              <div className="dc-cta">
                <span className="dc-install dc-mono">
                  <span className="dc-install__dollar">$</span>
                  shadcn add iconimate/bell
                  <button
                    type="button"
                    className="dc-install__copy"
                    aria-label="Copy install command"
                    onClick={() => copy("bell", "Bell")}
                  >
                    <CopyGlyph />
                  </button>
                </span>
              </div>

              <button
                type="button"
                className="dc-kbd-hint"
                onClick={() => setPaletteOpen(true)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
              >
                Press <span className="dc-kbd">⌘K</span> to search the set
              </button>
            </div>

            <FeaturedShowcase />
          </div>
        </header>

        {/* the set */}
        <section id="icons" className="dc-section" style={{ scrollMarginTop: 20 }}>
          <div className="dc-section__head">
            <div className="dc-section__title">
              All icons <span className="dc-section__count">{icons.length}</span>
            </div>
            <button
              type="button"
              className="dc-searchbar"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open search"
            >
              <SearchGlyph />
              <span>Search the set…</span>
              <span className="dc-searchbar__spacer" />
              <span className="dc-kbd">⌘K</span>
            </button>
          </div>

          <div className="dc-grid">
            {icons.map((entry) => (
              <DarkIconCard key={entry.slug} entry={entry} onCopy={copy} />
            ))}
          </div>
        </section>

        {/* footer */}
        <footer className="dc-footer">
          <span>iconimate · v0.1.0 · {icons.length} icons</span>
          <span>⌘K search · ↵ install · drawn on the Phosphor 256 grid</span>
        </footer>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onCopy={copy} />

      {toast && (
        <div className="dc-toast" role="status">
          <span className="dc-toast__check">
            <CheckGlyph />
          </span>
          Copied install for {toast}
        </div>
      )}
    </main>
  );
}

function CopyGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2" />
    </svg>
  );
}
function SearchGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function CheckGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
