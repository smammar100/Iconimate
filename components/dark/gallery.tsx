"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { IconView } from "@/lib/sanity/icons";
import { DarkIconCard, type IconAction } from "@/components/dark/dark-icon-card";
import { CommandPalette } from "@/components/dark/command-palette";
import { HeroTiles } from "@/components/dark/hero-tiles";
import { CtaFooter } from "@/components/dark/cta-footer";
import { ThemeToggle } from "@/components/dark/theme-toggle";
import { Logo } from "@/components/dark/logo";
import { VersionBadge } from "@/components/dark/version-badge";
import { GithubStarButton, GithubGlyph, REPO_URL } from "@/components/dark/github-star-button";
import {
  fetchIconPrompt,
  fetchIconSource,
  installCommand,
  type PackageManager,
} from "@/components/dark/icon-meta";
import { captureIconCopied } from "@/lib/analytics";

/* Desktop column count of .dc-grid — used to stagger each row's reveal from
   its center. Narrower breakpoints use fewer columns; the center-out rhythm
   there is approximate, which reads fine. */
const GRID_COLUMNS = 5;

/* Intro sequencing: the hero's own entrance (title rise + tile ripple in
   HeroTiles) runs first; grid cards that are in view at load wait this long
   before revealing. Rows revealed later by scrolling get no extra delay.
   Kept short — at 1.1s the set read as stalled rather than sequenced, since the
   cards are painted (position-only reveal, never opacity) and so sit visibly
   frozen mid-offset for the whole hold. Must match the delay on
   `.dc-section--intro` and `[data-intro] [data-reveal]` in globals.css. */
const HERO_INTRO_SECONDS = 0.45;

/* When to drop the data-intro hold. It must outlast the reveals it gates: the
   rule sets `transition-delay: stagger + HERO_INTRO_SECONDS`, so removing the
   attribute mid-delay re-resolves the delay to a value that has already elapsed
   and the held cards jump to their end state instead of gliding. Cover the hold,
   the 0.45s transition, and the widest --stagger (2 columns out at 0.05s). */
const INTRO_HOLD_CLEAR_SECONDS = HERO_INTRO_SECONDS + 0.45 + 0.1 + 0.05;

/**
 * The interactive gallery. Everything here is client-side — the ⌘K palette,
 * toast, hero-intro sequencing, reveal observer and deep-link scroll all need
 * browser APIs.
 *
 * The icon list arrives as a prop rather than being imported: app/page.tsx is a
 * server component that resolves it from Sanity (falling back to the repo), so
 * the names and motion labels are server-rendered and editable in the Studio.
 * The repo still supplies the glyphs via LAZY_ICONS in DarkIconCard.
 */
export function Gallery({ icons }: { icons: IconView[] }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  // True while the hero entrance is playing; adds a hold to the grid reveal
  // so the intro reads hero-first, grid-second.
  const [heroIntro, setHeroIntro] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setHeroIntro(false), INTRO_HOLD_CLEAR_SECONDS * 1000);
    return () => window.clearTimeout(t);
  }, []);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  // Deep link: /?icon=<slug> scrolls to the named card and plays it once the
  // grid has revealed. The JSON-LD ItemList and /llms.txt advertise these URLs
  // to crawlers/AI assistants; canonical stays `/` (no redirect, no new route).
  // An unknown slug is a clean no-op, so the page behaves like plain `/`.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("icon");
    if (!slug || !icons.some((e) => e.slug === slug)) return;
    // Two-pass scroll: the grid cards use content-visibility:auto (a 140px
    // height estimate until rendered), so the first jump toward a far-down icon
    // lands short as intervening cards resolve to their real heights. Scroll,
    // let layout settle, then correct + focus (focus runs the hover play path).
    const t1 = window.setTimeout(() => {
      const cell = document.getElementById(`icon-${slug}`);
      if (!cell) return;
      cell.scrollIntoView({ block: "center", behavior: "instant" });
      const t2 = window.setTimeout(() => {
        cell.scrollIntoView({ block: "center", behavior: "instant" });
        cell.querySelector<HTMLElement>(".dc-card")?.focus({ preventScroll: true });
      }, 200);
      timers.push(t2);
    }, HERO_INTRO_SECONDS * 1000 + 600);
    const timers = [t1];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  // One shared IntersectionObserver drives every card's scroll reveal (replaces
  // ~150 per-card Motion whileInView wrappers + their observers — the main
  // mobile-hydration cost). It toggles data-revealed once; CSS animates the
  // rise + swing (see globals.css). Reveal is position-only — never opacity —
  // to keep the LCP guard: opacity:0 would hide SSR text until hydration.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-revealed", "");
            obs.unobserve(e.target);
          }
        }
      },
      /* The bottom margin must never be negative. This reveal animates position
         only — never opacity, to protect LCP — so an unrevealed card is fully
         painted and merely sits 12px low. A negative margin therefore carves a
         band at the bottom of the viewport where visible cards are frozen
         mid-offset, misaligned against the settled row above them, until the
         user happens to scroll. A small positive margin instead arms each row
         just before it appears, so the rise still reads on scroll but is never
         caught static and out of position. */
      { rootMargin: "0px 0px 64px 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

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
  // standalone .tsx source fetched from the registry item we serve at /r/;
  // "copy-prompt" copies the icon's AI prompt, the one thing we read from Sanity.
  const action = useCallback(
    async (kind: IconAction, slug: string, name: string, pm: PackageManager = "npm") => {
      let text: string;
      let message: string;
      try {
        if (kind === "copy-code") {
          text = await fetchIconSource(slug);
          message = `Copied ${name} code`;
        } else if (kind === "copy-prompt") {
          text = await fetchIconPrompt(slug);
          message = `Copied ${name} AI prompt`;
        } else {
          text = installCommand(slug, pm);
          // Names the thing copied, like its two siblings above — a bare
          // "Copied Acorn" doesn't say which of the three actions fired.
          message = `Copied ${name} install command`;
        }
        await navigator.clipboard.writeText(text);
        // After the write resolves, never before. writeText rejects on a denied
        // permission or an insecure context, and capturing ahead of it would count
        // those failures as copies — the one number this site actually cares about.
        // pm is only meaningful for the CLI line; the other two ignore it.
        captureIconCopied(slug, kind, kind === "copy-cli" ? pm : undefined);
      } catch {
        message = `Couldn’t copy ${name}`;
      }
      setToast(message);
      window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(null), 1900);
    },
    [],
  );

  return (
    <main className="dc">
      {/* The MODIFIER carries the sticky, not `.dc-nav`. A sticky element only
          travels within its own parent's box, and this shell wraps the nav and
          nothing else — sticking the nav itself would pin it to a 60px-tall
          parent, i.e. it would scroll away instantly. The shell is a direct
          child of <main>, so it has the whole page to stick through. */}
      <div className="dc-shell dc-shell--nav">
        {/* nav */}
        <nav className="dc-nav">
          {/* Logo and badge share a wrapper because .dc-nav is space-between:
              a third direct child would spread three ways and pull the badge
              into the middle of the bar instead of sitting by the wordmark. */}
          <div className="dc-nav-brand">
            <Logo />
            <VersionBadge />
          </div>
          <div className="dc-nav-links">
            {/* PHONE-ONLY NAV ACTIONS. Below 600 the nav already drops every <a>,
                which takes the rainbow star CTA with it, and search lived down
                in the section head describing a keyboard shortcut. Both jobs
                come back here as icons: tap to search, tap to open the repo.

                These carry aria-label because they have NO visible text — the
                label-in-name rule that keeps aria-label off the ⌘K control does
                not apply when there is no visible string to contradict. */}
            <button
              type="button"
              className="dc-nav-icon"
              aria-label="Search icons"
              onClick={() => setPaletteOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <a
              className="dc-nav-icon"
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Iconimate on GitHub"
            >
              <GithubGlyph />
            </a>
            <ThemeToggle />
            <GithubStarButton />
          </div>
        </nav>
      </div>

      {/* hero — tile scatter (Fintech Web Template), icons animate on hover */}
      <HeroTiles onCopyInstall={(pm, slug, name) => action("copy-cli", slug, name, pm)} />

      <div className="dc-shell">
        {/* the set */}
        {/* dc-section--intro fades the whole set in once the hero entrance has
            played (pure CSS, see globals.css) — without it the grid is painted
            from the first frame and only the hero appears to animate.
            data-intro applies the same hero-intro hold to whatever reveals
            while the hero is still playing; it clears after, so rows scrolled
            to later reveal with no hold. The reveal itself is CSS-driven (see
            the single IntersectionObserver above + the reveal rules in
            globals.css) — no per-card Motion wrapper / observer. */}
        <section
          id="icons"
          className="dc-section dc-section--intro"
          style={{ scrollMarginTop: 20 }}
          data-intro={heroIntro ? "" : undefined}
        >
          {/* Reveals animate position only (no opacity): opacity:0 would be
              inlined in the SSR HTML and keep this text invisible until
              hydration, tanking LCP. Painted-but-offset is invisible to LCP. */}
          <div className="dc-section__head" data-reveal>
            <div className="dc-section__title">
              All Icons <span className="dc-section__count">{icons.length}</span>
            </div>
            {/* The visible text is the accessible name, so no aria-label — the
                previous bar read "Open search" to AT while showing "Search the
                set…", which is a WCAG 2.5.3 label-in-name mismatch. */}
            {/* TWO LABELS, ONE BUTTON, SWAPPED IN CSS. "Press ⌘K to search" is
                unreadable advice on a device with no keyboard — the control was
                always tappable, but it described a shortcut nobody on a phone
                can use. Below 900 it becomes a plain search affordance instead.

                Swapping with `display: none` rather than a matchMedia branch
                keeps this a server-renderable component (no hydration mismatch,
                no flash of the wrong label) AND keeps the accessible name
                correct: a display:none label is out of the a11y tree, so the
                name always matches what is actually on screen. That is the same
                reason there is no aria-label here — see WCAG 2.5.3. */}
            <button type="button" className="dc-kbd-hint" onClick={() => setPaletteOpen(true)}>
              <span className="dc-kbd-hint__keys">
                Press <span className="dc-kbd">⌘K</span> to search
              </span>
              <span className="dc-kbd-hint__tap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="m16 16 4 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                Search
              </span>
            </button>
          </div>

          {/* Staggered reveal: each card rises as it enters view, delayed
              outward from the center of its row (the --stagger var) so every
              row blooms from the middle. */}
          <div className="dc-grid">
            {icons.map((entry, i) => (
              <div
                key={entry.slug}
                /* stable target for ?icon=<slug> deep links — crawlers/AI
                   assistants are handed these URLs in the JSON-LD + /llms.txt. */
                id={`icon-${entry.slug}`}
                data-reveal
                /* single-track grid so the card stretches to the row height;
                   --stagger = center-out delay for this column. */
                style={
                  {
                    display: "grid",
                    "--stagger": `${Math.abs((i % GRID_COLUMNS) - (GRID_COLUMNS - 1) / 2) * 0.05}s`,
                  } as CSSProperties
                }
              >
                <DarkIconCard entry={entry} onAction={action} />
              </div>
            ))}
          </div>
        </section>

        {/* closing slab — CTA merged into the footer */}
        <CtaFooter count={icons.length} />

        {/* minimal site footer — copyright left, follow links right */}
        <footer className="dc-footer">
          <span className="dc-footer__copy">© {new Date().getFullYear()} Iconimate</span>
          {/* Attribution: the two projects Iconimate is built on. Middle child of
              the space-between row, so it sits centered between copy and links. */}
          <span className="dc-footer__credit">
            Crafted with{" "}
            <span className="dc-footer__credit-heart" aria-label="love" role="img">❤️</span>{" "}
            using{" "}
            <a className="dc-footer__credit-link" href="https://github.com/motiondivision/motion" target="_blank" rel="noopener noreferrer">
              Motion
            </a>{" "}
            and{" "}
            <a className="dc-footer__credit-link" href="https://github.com/phosphor-icons/core" target="_blank" rel="noopener noreferrer">
              Phosphor Icons
            </a>
          </span>
          <nav className="dc-footer__links" aria-label="Social links">
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

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onAction={action}
        icons={icons}
      />

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

function CheckGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
