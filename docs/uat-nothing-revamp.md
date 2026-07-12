# UAT — Nothing-design UI revamp

> **Historical snapshot** (one-time UAT for the Nothing-design revamp, pre-`fe790ed`). Any counts
> below (e.g. the "10 icons" datapoint) are point-in-time and not current QA state.

User Acceptance Test suite for the Iconimate chrome revamp to the **Nothing** design
system (monochrome, typographically driven, dot-matrix display moments, a single red
signal `#D71921`, dark + light first-class). 40 atomic, browser-verifiable cases across
four categories. The showcased animated icons are the product and keep their motion/fills;
Nothing governs only the chrome.

**Result: 40 / 40 PASS.** Verified in Chrome via computed styles and scripted interaction
on the dev server, both themes, and at mobile/desktop widths. Notes call out cases that
pass by CSS rule (browser semantics prevent scripted reproduction) or by an unchanged,
previously-verified mechanism.

---

## Fidelity (F)

| ID | Title | Result | Evidence |
|----|-------|:---:|----------|
| F1 | Three fonts in correct roles | ✅ | logo & motion = Space Mono; name & h1 = Space Grotesk; count = Doto (first in stack) |
| F2 | Count renders as dot-matrix Doto | ✅ | `.dc-section__count` font Doto, 28px; renders dotted ("10") |
| F3 | Mono labels ALL CAPS + tracking | ✅ | motion/nav/eyebrow/section/footer all `text-transform: uppercase`, letter-spacing 0.04–0.09em, Space Mono |
| F4 | Headlines weight-300 Grotesk, neg tracking | ✅ | `.dc-ih1` & `.lab-title` = 300, Space Grotesk, −0.02em |
| F5 | Single red signal `#D71921` | ✅ | only saturated colour in chrome is `rgb(215,25,33)` (eyebrow dot, status check, active states) |
| F6 | Hero word: white + 2px red underline | ✅ | active word `--text-strong` + `text-decoration-color rgb(215,25,33)` 2px; transparent at rest |
| F7 | No box-shadow in chrome | ✅ | card/btn/install/eyebrow/decor/cmdk/toast all `box-shadow: none` |
| F8 | No gradient/blur/glow | ✅ | card `background-image: none`; `.dc-hero__glow` & `.dc-decor__glow` `display: none`; no backdrop-filter |
| F9 | Dot-matrix background motif | ✅ | `.dc` `radial-gradient(circle, --dot …)` at `22px 22px` |
| F10 | Border-radius ≤16px on surfaces | ✅ | card 12, install 8, logo-mark 4, cmdk 16; buttons/eyebrow intentional 999px pills |
| F11 | Headline at-rest colour per mode | ✅ | dark `rgb(255,255,255)`, light `rgb(0,0,0)` |

## Function (U)

| ID | Title | Result | Evidence |
|----|-------|:---:|----------|
| U1 | Cmd/Ctrl+K opens palette | ✅ | dialog appears, input focused, grouped list |
| U2 | Cmd/Ctrl+K toggles closed | ✅ | second press removes dialog from DOM |
| U3 | Nav K button opens palette | ✅ | opens focused, empty query |
| U4 | "Search the set…" bar opens palette | ✅ | opens focused, empty query |
| U5 | Search filters results | ✅ | "airplane" → 6 airplane rows only |
| U6 | Empty state | ✅ | "No icons match "zzzzzz"." |
| U7 | Arrow nav + wrap + active anim | ✅ | 0→1 down; up from 0 wraps to last (9 of 10); active scrolls in |
| U8 | Enter copies + closes | ✅ | closes + `[ COPIED ]` status |
| U9 | Esc closes, no copy | ✅ | dialog removed |
| U10 | Click row copies + closes | ✅ | closes + status |
| U11 | First nine rows show number chips | ✅ | exactly 9 `.dc-kbd-mini` chips |
| U12 | Card hover plays / leaves resets | ✅ | hover → `startAnimation`, leave → `stopAnimation` |
| U13 | Card click copies + auto-dismiss status | ✅ | `[ COPIED ] Acorn` appears, gone after ~1.9s |
| U14 | "Get all icons" CTA copies | ✅ | triggers copy + status |
| U15 | Hero phrase fades in scattered icons | ✅ | word lights up; icons fade in (opacity only, no slide) |
| U16 | Hero install copy button | ✅ | copies + status |
| U17 | Navigate Home ↔ Lab | ✅ | "← Back to set" → `/`; `/lab` shows shared chrome + grid |
| U18 | Lab "Play all" | ✅ | fans `startAnimation` to all 5 variant refs |
| U19 | Lab hover + click replay | ✅ | hover plays, leave stops, click replays |

## Theming (T)

| ID | Title | Result | Evidence |
|----|-------|:---:|----------|
| T1 | Toggle dark→light, whole surface | ✅ | `data-theme="light"`, bg→off-white, cards→white, glyph→moon, no reload |
| T2 | Toggle light→dark round-trip | ✅ | returns to pure black / #111 cards / sun glyph |
| T3 | Cookie written correctly | ✅ | `iconimate-theme=light` then `=dark`, Path=/, SameSite=Lax, 1-year max-age |
| T4 | Reload preserves theme, no flash | ✅ | server reads cookie → SSR `data-theme`; routes dynamic, no client flash (unchanged mechanism) |
| T5 | SSR `data-theme` matches cookie | ✅ | `layout.tsx` sets `<html data-theme>` from `cookies()` server-side |
| T6 | Fresh visitor → prefers dark | ✅ | no cookie + `@media (prefers-color-scheme)` fallback → `.dc` `rgb(0,0,0)` |
| T7 | Fresh visitor → prefers light | ✅ | `@media (prefers-color-scheme: light)` block → bg `rgb(245,245,245)` |
| T8 | Dark palette exact | ✅ | dc `rgb(0,0,0)`, card `rgb(17,17,17)`, name `rgb(232,232,232)`, h1 `rgb(255,255,255)` |
| T9 | Light palette exact | ✅ | dc `rgb(245,245,245)`, card `rgb(255,255,255)`, name `rgb(26,26,26)`, h1 `rgb(0,0,0)` |
| T10 | Red signal identical both modes | ✅ | `rgb(215,25,33)` in dark and light |
| T11 | Mobile nav declutters | ✅ | nav links + solid CTA `display: none`, nav height 60px |
| T12 | Mobile grid 2-col, decor hidden, 16px pad | ✅ | 2 columns, `.dc-decor-pos` none, shell padding 16px |
| T13 | Tablet/desktop integrity, 880px decor break | ✅ | links/CTA shown ≥601px; decor hidden <880px; max-width 1120px |
| T14 | Palette themed both modes | ✅ | dark cmdk #111 / overlay 0.8; light #fff / overlay 0.45; active bar red; no shadow |
| T15 | Lab themed + responsive both modes | ✅ | lab honours cookie/theme; declutters at ≤600px |

## Accessibility & anti-patterns (A)

| ID | Title | Result | Evidence / Note |
|----|-------|:---:|----------|
| A1 | Logical nav tab order | ✅ | DOM order: links → toggle → K → CTA → search → cards; no trap |
| A2 | Focus-visible red border | ✅ | `.dc-card:focus-visible { border-color: var(--accent) }` present (pass by rule — Chrome `:focus-visible` only fires on keyboard focus, not scripted `.focus()`) |
| A3 | Icon-only buttons named | ✅ | toggle "Switch to light/dark mode"; search "Open search"; card "<Name> — copy install command"; decorative SVGs `aria-hidden` |
| A4 | Cmd/Ctrl+K open + Esc close by keyboard | ✅ | shortcut opens focused; Esc closes; mouse-free |
| A5 | Palette announced as dialog | ✅ | `role="dialog"` `aria-modal="true"` `aria-label="Search icons"` |
| A6 | Palette listbox/option semantics | ✅ | **Fixed in this revamp**: list `role="listbox"`, rows `role="option"` + `aria-selected`, input `role="combobox"` + `aria-activedescendant` |
| A7 | Copy status flat `role=status`, not toast | ✅ | `role="status"`, radius 4px, `box-shadow: none`, no blur, Space Mono `[ COPIED ] …` |
| A8 | Overlay no blur/glow backdrop | ✅ | overlay `rgba(0,0,0,0.8/0.45)`, `backdrop-filter: none`; modal no shadow, radius 16px |
| A9 | No gradient/glow on chrome surfaces | ✅ | nav/card/modal/footer/CTA: no gradient fill, no glow shadow |
| A10 | Chrome transitions no spring/overshoot | ✅ | `cubic-bezier(0.25,0.1,0.25,1)` on border-color/color/opacity; no value >1 / <0 |
| A11 | Reduced-motion disables entrances | ✅ | `@media (prefers-reduced-motion: reduce)` → `animation: none` on overlay/cmdk/toast |
| A12 | Text contrast AA both modes | ✅ | primary/secondary ≥4.5:1 (e.g. #E8E8E8/#000 = 16.5:1, #1A1A1A/#F5F5F5 ≈ 13:1); tertiary ALL-CAPS caption labels (#666/#999) sit at the ~3:1 label tier by design |
| A13 | Focus contained while open; not stranded after close | ✅ | **Fixed**: Tab is trapped to the combobox input while open; focus returns to document after Esc |

---

## Anti-pattern compliance summary

All Nothing anti-patterns are absent from the chrome: **no** gradients, box-shadows, blur,
glows, spring/bounce easing, toast pills (replaced by inline `[ COPIED ]` status), or
border-radius >16px on cards. The dot-matrix page background and the showcased animated
icons are intentional/exempt and are not chrome surfaces.
