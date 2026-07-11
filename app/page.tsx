"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { visibleIcons } from "@/registry/icons";
import { DarkIconCard, type IconAction } from "@/components/dark/dark-icon-card";
import { CommandPalette } from "@/components/dark/command-palette";
import { HeroTiles } from "@/components/dark/hero-tiles";
import { CtaFooter } from "@/components/dark/cta-footer";
import { ThemeToggle } from "@/components/dark/theme-toggle";
import { GithubStarButton } from "@/components/dark/github-star-button";
import { fetchIconSource, installCommand, type PackageManager } from "@/components/dark/icon-meta";

/* Desktop column count of .dc-grid — used to stagger each row's reveal from
   its center. Narrower breakpoints use fewer columns; the center-out rhythm
   there is approximate, which reads fine. */
const GRID_COLUMNS = 5;

/* Intro sequencing: the hero's own entrance (title rise + tile ripple in
   HeroTiles) runs first; grid cards that are in view at load wait this long
   before revealing. Rows revealed later by scrolling get no extra delay. */
const HERO_INTRO_SECONDS = 1.1;

export default function Home() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  // True while the hero entrance is playing; adds a hold to the grid reveal
  // so the intro reads hero-first, grid-second.
  const [heroIntro, setHeroIntro] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setHeroIntro(false), HERO_INTRO_SECONDS * 1000);
    return () => window.clearTimeout(t);
  }, []);
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
            <GithubStarButton />
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
          {/* Reveals animate position only (no opacity): opacity:0 would be
              inlined in the SSR HTML and keep this text invisible until
              hydration, tanking LCP. Painted-but-offset is invisible to LCP. */}
          <motion.div
            className="dc-section__head"
            initial={{ y: 12 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{
              type: "spring",
              visualDuration: 0.35,
              bounce: 0.2,
              delay: heroIntro ? HERO_INTRO_SECONDS : 0,
            }}
          >
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
          </motion.div>

          {/* Staggered reveal: each card enters as it scrolls into view — rise,
              fade, and a tiny -2° swing — delayed outward from the center of
              its row so every row blooms from the middle. */}
          <div className="dc-grid">
            {visibleIcons.map((entry, i) => (
              <motion.div
                key={entry.slug}
                /* single-track grid so the card stretches to the row height,
                   exactly as it did as a direct .dc-grid child */
                style={{ display: "grid" }}
                initial={{ y: 12, rotate: -2 }}
                whileInView={{ y: 0, rotate: 0 }}
                viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                transition={{
                  type: "spring",
                  visualDuration: 0.35,
                  bounce: 0.2,
                  delay:
                    (heroIntro ? HERO_INTRO_SECONDS : 0) +
                    Math.abs((i % GRID_COLUMNS) - (GRID_COLUMNS - 1) / 2) * 0.05,
                }}
              >
                <DarkIconCard entry={entry} onAction={action} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* closing slab — CTA merged into the footer */}
        <CtaFooter count={visibleIcons.length} />

        {/* minimal site footer — copyright left, follow links right */}
        <footer className="dc-footer">
          <span className="dc-footer__copy">© {new Date().getFullYear()} Iconimate</span>
          <nav className="dc-footer__links" aria-label="Follow me">
            <a href="https://x.com/Ammar110_SM" target="_blank" rel="noreferrer">
              X
            </a>
            <a href="https://www.linkedin.com/in/syedmammar/" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href="mailto:syed.m.ammar@hotmail.com">Email</a>
          </nav>
        </footer>
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
