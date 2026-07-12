# Plan 010: Replace 147 `whileInView` wrappers with one observer + CSS reveal

> **Executor instructions**: Follow step by step, verify each step, honor STOP conditions, update the
> row in `plans/README.md` when done. The mobile-perf and no-regression checks are load-bearing.
>
> **Drift check (run first)**: `git diff --stat fe790ed..HEAD -- app/page.tsx app/globals.css`
> On any mismatch with the excerpts below, treat as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: 001 (verify gate)
- **Category**: perf
- **Planned at**: commit `fe790ed`, 2026-07-11

## Why this matters

The homepage wraps **every** icon card (~150) in a `motion.div` with `whileInView` — each mounts its
own IntersectionObserver plus Motion's per-element spring state. On mobile (the stated ~59 Lighthouse
ceiling), hydrating ~150 observers + ~150 JS springs is a large main-thread cost stacked on top of
the ~150 lazy card chunks. Driving the reveal with **one shared IntersectionObserver + CSS** removes
~150 observers and ~150 JS animations from the hydration path, targeting the mobile TBT directly,
while keeping the same center-out staggered reveal.

## Current state (`app/page.tsx:99-156`)

The section head reveal:
```tsx
{/* Reveals animate position only (no opacity): opacity:0 would be
    inlined in the SSR HTML and keep this text invisible until
    hydration, tanking LCP. Painted-but-offset is invisible to LCP. */}
<motion.div className="dc-section__head" initial={{ y: 12 }} whileInView={{ y: 0 }}
  viewport={{ once: true, margin: "0px 0px -8% 0px" }}
  transition={{ type: "spring", visualDuration: 0.35, bounce: 0.2,
    delay: heroIntro ? HERO_INTRO_SECONDS : 0 }}>
```

The grid:
```tsx
<div className="dc-grid">
  {visibleIconMeta.map((entry, i) => (
    <motion.div key={entry.slug} style={{ display: "grid" }}
      initial={{ y: 12, rotate: -2 }} whileInView={{ y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ type: "spring", visualDuration: 0.35, bounce: 0.2,
        delay: (heroIntro ? HERO_INTRO_SECONDS : 0) +
               Math.abs((i % GRID_COLUMNS) - (GRID_COLUMNS - 1) / 2) * 0.05 }}>
      <DarkIconCard entry={entry} onAction={action} />
    </motion.div>
  ))}
</div>
```

Key invariants to preserve:
- **No `opacity` in the reveal** — the comment at `:100-102` is a deliberate LCP guard: `opacity:0`
  would be inlined into SSR HTML and hide text until hydration. Keep reveals **position-only** (`y` +
  `rotate`).
- **Center-out row stagger**: `Math.abs((i % GRID_COLUMNS) - (GRID_COLUMNS - 1) / 2) * 0.05` — each
  card's delay grows with its distance from the row center. `GRID_COLUMNS` is a constant in
  `app/page.tsx`.
- **Hero-intro hold**: cards visible at load wait `HERO_INTRO_SECONDS` before revealing; rows scrolled
  to later get no extra hold. `heroIntro` is a state flag flipped by a timeout in `app/page.tsx`.
- `.dc-grid` cards already use `content-visibility: auto` (in `globals.css`).

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Dev | `pnpm dev` | serves; watch the reveal |
| Build | `pnpm build` | exit 0 |
| Verify | `pnpm verify` | exit 0 |
| Lighthouse (mobile) | run against the deployed/preview build | TBT lower than baseline |

## Scope

**In scope**:
- `app/page.tsx` — replace the per-card `motion.div` wrappers (grid + section head) with plain
  elements carrying a `data-reveal` attribute + a `--stagger` custom property; add one shared
  IntersectionObserver (a small `useEffect` or a tiny hook) that sets `data-revealed` when a card
  enters view.
- `app/globals.css` — add the `@keyframes`/`transition` that animate the rise + swing off
  `[data-revealed]`, using `--stagger` for the per-card delay and honoring the hero-intro hold.

**Out of scope**:
- `DarkIconCard` internals and the icon animations themselves (the hover motion stays Motion-driven).
- The hero (`HeroTiles`) — its entrance is separate and already CSS/handled.
- Adding `opacity` to the reveal (forbidden by the LCP guard).

## Git workflow

- Branch: `advisor/010-css-driven-grid-reveal`
- Imperative commit subject.

## Steps

### Step 1: Emit stagger + reveal hooks in the markup

Replace each grid `motion.div` with a plain `div` (keep `style={{ display: "grid" }}`) that carries:
- `data-reveal` (initial, un-revealed state — position offset applied via CSS),
- `style={{ "--stagger": \`${Math.abs((i % GRID_COLUMNS) - (GRID_COLUMNS - 1) / 2) * 0.05}s\` }}` (the
  center-out delay as a CSS variable),
- and the shared observer toggles `data-revealed` on it.

Do the same for `.dc-section__head` (position-only `y`).

**Verify**: SSR HTML (view source) shows the cards **without** `opacity:0` inline (LCP guard intact),
and with the `--stagger` values.

### Step 2: One shared IntersectionObserver

Add a single `IntersectionObserver` (in a `useEffect`) that observes all `[data-reveal]` elements and,
on intersection, sets `data-revealed` (then unobserves — `once` semantics). Preserve the hero-intro
hold: while `heroIntro` is true, add the `HERO_INTRO_SECONDS` delay (e.g. via a CSS class on the grid
container that adds to the `transition-delay`, or by delaying the observer's activation). Use the same
`margin: "0px 0px -8%"` root margin as the old `viewport`.

**Verify**: scrolling reveals cards; only one observer exists (DevTools → Performance/Memory shows a
single observer, not ~150). `pnpm exec tsc --noEmit` exits 0.

### Step 3: CSS reveal animation

In `globals.css`, animate off `[data-revealed]`:
```css
[data-reveal] { transform: translateY(12px) rotate(-2deg); }
[data-reveal][data-revealed] {
  transform: none;
  transition: transform 0.45s cubic-bezier(...) var(--stagger, 0s);
}
```
Match the old spring feel (`visualDuration: 0.35, bounce: 0.2`) with an equivalent easing curve. The
section head uses `translateY(12px)` only (no rotate). Respect `prefers-reduced-motion: reduce` — snap
to final position without the transition. **No `opacity`.**

**Verify**: the reveal still blooms center-out per row, hero-intro hold still applies to the first
screen, and later rows reveal on scroll with no hold.

### Step 4: Measure

- `pnpm build` + serve; run mobile Lighthouse against it. Compare **Total Blocking Time** and the
  perf score to the pre-change baseline (~59). Expect TBT to drop (fewer JS springs/observers).

**Verify**: mobile Lighthouse TBT lower than baseline; perf score ≥ baseline; `pnpm verify` green.

## Test plan

- No unit tests (visual/perf). Gates: `pnpm verify`; visual parity of the reveal (center-out stagger,
  hero hold, scroll reveal) via `pnpm dev`; mobile Lighthouse TBT improvement.
- If a Playwright harness exists post-001, add a spec asserting a below-the-fold card gains
  `data-revealed` after scrolling to it.

## Done criteria

- [ ] `app/page.tsx` grid no longer wraps cards in `motion.div`; a single IntersectionObserver drives
      reveals.
- [ ] Reveal is position-only (no `opacity`); SSR HTML has no `opacity:0` on cards (LCP guard intact).
- [ ] Center-out row stagger + hero-intro hold preserved (visual check).
- [ ] Mobile Lighthouse TBT is lower than the pre-change baseline (numbers recorded in the PR).
- [ ] `pnpm verify` and `pnpm build` exit 0.
- [ ] `plans/README.md` row for 010 updated.

## STOP conditions

- The reveal can't reproduce the center-out stagger + hero-intro hold with CSS alone in a way that
  matches the current feel — report; do not ship a visibly worse reveal.
- Mobile Lighthouse TBT does **not** improve (or regresses) — report the numbers; the change's whole
  justification is the TBT win, so a null result needs a rethink before merging.
- Removing the Motion wrappers breaks the `display:grid` row-height stretch (cards no longer fill the
  row) — the wrapper's `style={{ display: "grid" }}` must be preserved on the replacement element.

## Maintenance notes

- If the grid column count (`GRID_COLUMNS`) or breakpoints change, the `--stagger` math must stay in
  sync with the CSS `grid-template-columns`.
- This is the highest-leverage remaining mobile lever; if TBT is still high after this, the next
  suspect is the ~150 lazy card chunks hydrating — a separate investigation.
