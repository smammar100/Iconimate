"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { visibleIcons } from "@/registry/icons";
import { DarkIconCard, type IconAction } from "@/components/dark/dark-icon-card";
import { CommandPalette } from "@/components/dark/command-palette";
import { HeroTiles } from "@/components/dark/hero-tiles";
import { CtaFooter } from "@/components/dark/cta-footer";
import { ThemeToggle } from "@/components/dark/theme-toggle";
import { fetchIconSource, installCommand, type PackageManager } from "@/components/dark/icon-meta";

const REPO_URL = "https://github.com/smammar100/Iconimate";

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

  // One dispatcher for every distribution surface: cards, palette, hero tabs.
  // "copy-cli" copies the shadcn install line; "copy-code" copies the icon's
  // standalone .tsx source fetched from the registry item we serve at /r/.
  const action = useCallback(
    async (kind: IconAction, slug: string, name: string, pm: PackageManager = "npm") => {
      let text: string;
      let message: string;
      try {
        if (kind === "copy-code") {
          text = await fetchIconSource(slug);
          message = `Copied ${name} code`;
        } else {
          text = installCommand(slug, pm);
          message = `Copied ${name}`;
        }
        await navigator.clipboard.writeText(text);
      } catch {
        message = `Couldn't copy ${name}`;
      }
      setToast(message);
      window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(null), 1900);
    },
    [],
  );

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
            <ThemeToggle />
            <a className="dc-btn" href={REPO_URL} target="_blank" rel="noreferrer">
              Star on GitHub
            </a>
          </div>
        </nav>
      </div>

      {/* hero — tile scatter (Fintech Web Template), icons animate on hover */}
      <HeroTiles
        onCopyInstall={(pm) => action("copy-cli", "bell", "Bell", pm)}
        onOpenSearch={() => setPaletteOpen(true)}
      />

      <div className="dc-shell">
        {/* the set */}
        <section id="icons" className="dc-section" style={{ scrollMarginTop: 20 }}>
          <div className="dc-section__head">
            <div className="dc-section__title">
              All Icons <span className="dc-section__count">{visibleIcons.length}</span>
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
              <DarkIconCard key={entry.slug} entry={entry} onAction={action} />
            ))}
          </div>
        </section>

        {/* closing slab — CTA merged into the footer */}
        <CtaFooter count={visibleIcons.length} />
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onAction={action} />

      {/* Toast: rises 10px with a light spring settle; sinks + fades on dismiss.
          x: "-50%" replaces the CSS translateX(-50%) centering, which Motion
          would otherwise overwrite when it drives transform. */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            className="dc-toast"
            role="status"
            initial={{ opacity: 0, x: "-50%", y: 10, scale: 0.97 }}
            animate={{ opacity: 1, x: "-50%", y: 0, scale: 1 }}
            exit={{ opacity: 0, x: "-50%", y: 6, scale: 0.98, transition: { duration: 0.16, ease: "easeOut" } }}
            transition={{ type: "spring", visualDuration: 0.3, bounce: 0.25 }}
          >
            <span className="dc-toast__check">
              <CheckGlyph />
            </span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
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
