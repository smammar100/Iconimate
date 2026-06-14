"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { visibleIcons } from "@/registry/icons";
import { DarkIconCard } from "@/components/dark/dark-icon-card";
import { CommandPalette } from "@/components/dark/command-palette";
import { InteractiveHero } from "@/components/dark/interactive-hero";
import { ThemeToggle } from "@/components/dark/theme-toggle";
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
            <ThemeToggle />
            <button type="button" className="dc-btn dc-btn--ghost" onClick={() => setPaletteOpen(true)}>
              <span className="dc-mono" style={{ fontSize: 12 }}>⌘K</span>
            </button>
            <button type="button" className="dc-btn" onClick={() => copy("bell", "Bell")}>
              Get all icons
            </button>
          </div>
        </nav>

        {/* hero — Figma Community-style hover interaction */}
        <InteractiveHero onCopy={copy} onOpenSearch={() => setPaletteOpen(true)} />

        {/* the set */}
        <section id="icons" className="dc-section" style={{ scrollMarginTop: 20 }}>
          <div className="dc-section__head">
            <div className="dc-section__title">
              All icons <span className="dc-section__count">{visibleIcons.length}</span>
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
            {visibleIcons.map((entry) => (
              <DarkIconCard key={entry.slug} entry={entry} onCopy={copy} />
            ))}
          </div>
        </section>

        {/* footer */}
        <footer className="dc-footer">
          <span>iconimate · v0.1.0 · {visibleIcons.length} icons</span>
          <span>⌘K search · ↵ install · drawn on the Phosphor 256 grid</span>
        </footer>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onCopy={copy} />

      {toast && (
        <div className="dc-toast" role="status">
          <span className="dc-toast__check">
            <CheckGlyph />
          </span>
          [ COPIED ] {toast}
        </div>
      )}
    </main>
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
