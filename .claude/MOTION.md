# Iconimate — motion contract

Read this before authoring or editing any `registry/icons/*.tsx`. `AGENTS.md` owns
the build mechanics (the generator, the lockstep files, the import allow-list).
This file owns the motion. `registry/lib/motion-tokens.ts` points here.

Every rule below exists because something shipped wrong. The numbers are measured
on this repo's glyphs at this repo's ship size — not borrowed from a general UI
motion guide. §14 lists what to actively *reject* from those guides.

---

## The standing test — would a professional product ship this?

**This runs on every icon, every time, before and after the gesture is built. It is
never skipped and never assumed.** It outranks everything below: a motion that is
technically perfect and fails this test does not ship.

These icons are installed into other people's products, where they sit in toolbars
and nav bars and fire on every hover, all day, next to real work. That is a much
harsher room than a gallery tile at 56px.

Audit each icon against all six. Any single failure blocks it.

1. **The fiftieth hover.** It fires dozens of times a day on the same user. Would it
   still be welcome? If it demands attention, congratulates itself, or takes long
   enough to notice waiting, cut amplitude or duration. Delight that survives once
   is not the same as delight that survives repetition.
2. **It is a click target.** The hit area never moves (§13). It never loops on hover.
   It never delays or obscures the action the user came to perform. An animation that
   makes the button harder to press is a defect no matter how good it looks.
3. **At 16–24px, not 56px.** Judge it at ship size. The lab tile flatters everything;
   most craft failures are invisible there and obvious at 20px.
4. **In someone else's product.** Picture it in a fintech dashboard, a medical
   records UI, a build pipeline. Toy bounce, cartoon squash and confetti fail that
   room instantly — and the consumer cannot retune your curve, they can only not
   install it.
5. **Peripheral vision.** While the user reads something else on the page, does it
   pull the eye? Ambient or looping motion that competes with the actual content is a
   liability, not a feature.
6. **It degrades.** Reduced motion, interruption mid-gesture, touch (where `:hover`
   never fires), and keyboard focus all leave a correct, legible pose.

**Write the failure you were most worried about, and how you resolved it, in the
file header.** An icon that claims to pass all six without naming a single tension
has not been audited — it has been asserted.

---

## 0. Name the verb, or do not animate

Write the verb in the file header before writing a keyframe. One word, and it must
be what the object *does*: `aperture` opens its blades. `bird` beats a wing.
`blueprint` gets drawn on. `bicycle` travels.

If the best verb you have is "pulse", "wiggle", "bounce", "shine", or "pop",
**stop — you do not have an animation yet.** Those are amplitude, not meaning, and
they are exactly what makes a set read as machine-generated: 200 icons throbbing
identically because nobody asked what the object does.

Two gates on every icon:

1. **Does the glyph already contain the moving part?** If yes, that part moves and
   nothing else does. `bird`'s wing is the diagonal bar across its belly — already
   drawn. An earlier take that added two new wings to its back was thrown away.
   **Never add geometry a mark already contains.**
2. **Would a still frame 60% through still read as the icon?** If not, the motion
   has replaced the mark rather than acted on it.

---

## 1. Rest-pose parity — the hard gate

**Three poses must be pixel-identical: the untouched Phosphor glyph, the first
explicit keyframe, and the final keyframe.**

Matching `normal` alone is not enough, and this is the most common defect in
animated icon sets. An `animate` array opening on `pathLength: 0` or `scale: 0.5`
*replaces the icon with a different drawing* the instant it is hovered. At 24px in
a toolbar that reads as the icon breaking.

```
animate: { scale: [0.5, 1.2, 1] }      ← WRONG. Frame 0 is not the icon.
animate: { scale: [1, 0.95, 1.16, 1] } ← RIGHT. Opens and closes on rest.
```

Parity includes what is invisible in the editor: generated groups left mounted,
masks still cutting, `pathLength` parked at 0, loop boundaries, parent transforms.

**A looping track must open AND close on rest.** A loop starting on transformed
geometry never returns — it stops wherever it stopped.

### The pixel-diff gate

If you rebuilt the glyph from subpaths, diff the rest state against the authored
`d` before shipping. Nothing in CI catches this. Count only pixels that flip
ink/no-ink, at 512×512, so antialiasing cannot inflate or hide the figure.

| icon | split | diff | verdict |
|---|---|---|---|
| `bird` | body + eye | 3 / 50,248 = **0.006%** | antialiasing only — ship |
| `bird` | body + stroked wing + eye | 31 / 50,248 = **0.062%** | edge AA — ship |
| `bell-simple-slash` | redrawn from `bell-simple` | **5.9%** | a redraw — §7 applies |

**Ship threshold: ≤0.1%.** Above that you are not splitting a glyph, you are
redrawing it.

### Opacity is not an animation

Opacity may *soften* something that already moves, scales, or draws. It may never
be the motion itself, and never hide clipping, a line collision, or a pose you
could not make work. A part that fades in and out without moving is a part you
failed to animate.

---

## 2. Amplitude floor — the fix for "hardly a wiggle"

The grid is 256 units; icons ship at 24px. **1 unit = 0.094px.** That conversion
kills most "subtle" motion outright:

- `translateY(12)` → **1.1px**. Invisible.
- `scale(1.06)` on ink 100 units from the pivot → **0.6px**. Invisible.
- `rotate(5°)` on ink 100 units out → **0.8px**. Invisible.

**Rule: the furthest-travelling ink must move ≥18 units (≥1.7px at 24px).**

One test covering translate, rotate and scale. Compute the travel of the ink
furthest from the pivot:

- rotate θ° at radius r → `r × θ × 0.01745` units
- scale s at radius r → `r × |s − 1|` units

Calibration: `heart`'s beat peaks at 1.16 with ink at r≈120 → 19.2 units, just over
the floor, deliberately. `star` pops to 1.18. `bird`'s wing swings 68°.

If your number is under 18, the user cannot see it, and the fix is **a different
verb — not a bigger number on a weak idea.**

**One exception:** a secondary accent riding a primary that already clears the floor
may go below it; it reads as texture on a motion that is already legible.

---

## 3. Rotation that does not exist

**Check for rotational symmetry about the pivot before spending a rotation.** A
circle rotated about its centre is itself. `bicycle`'s wheels are plain rings and
show no rotation at any speed — spokes would be needed and are not in the mark.
Prototyped and abandoned; do not re-try.

Same trap by degree: `biohazard` maps onto itself at 120° to within 8.67% of its
pixels, which is why its detents land at 120° and 240° and **must never pause at
60° or 180°** (100%+ different — a visibly wrong pose).

---

## 4. Measure the lane before you move

Rasterise the glyph, get the ink bbox, then check the direction you intend to
travel. Icons overflow because nobody measured.

```
bird       x8..240,  y16..224   → 8 left, 16 right. No lateral lane; up is free.
bicycle    x0..255.75           → touches BOTH walls at the equator.
```

Three legitimate outcomes, in order of preference:

1. **Move where there is room.** `bird` takes off up-and-right (−22y against +16x)
   because up is the only direction with space. Its wing sweeps into the empty
   upper-left quadrant; the tail owns the lower-left, so a down-stroke past −10°
   merges into the tail and the arc is capped there.
2. **Open the wrapper.** Keep `overflow: hidden` by default; switch to `visible`
   only when the motion needs the margin and **nothing paints outside at rest** —
   the trade `star`'s rays and `airplane-taxiing` make.
3. **Scale the body — with the compensating box.** Last resort; §7.

**Never let a mark clip mid-gesture.** A stub with a flat cut-off end is the most
obvious tell that nobody looked at the output.

---

## 5. Round caps and `pathLength` — the dot

**A round-capped stroke at `pathLength: 0` renders a full stroke-width DOT parked
at its start point.** Not invisible: on a 16-wide stroke that is a 16-unit blob
sitting on the artboard for the whole hold before the line draws.

This has bitten `bell-simple-slash` and `blueprint`. The remedy depends on how long
the stroke draws, and **the two cases must not be merged**:

- **Short strokes** (grid lines, ticks, slashes) → ramp opacity 0→1 *across* the
  draw. Invisible, because the stroke is short.
- **Long strokes** (a whole outline) → opacity gets its own, much faster tween, up
  over the first 0.05 of the pass. Fading a long outline across its full draw holds
  the finished part semi-transparent for a full second.

Butt caps also kill the dot, at the cost of flat-ending every stroke — only take
that when the source mark has butt caps.

**`pathLength` is only honest on a stroked glyph.** `bird`, `heart` and `star` are
filled compound paths: no stroke to run a dash along, so "drawing" them means
faking it with clips. `blueprint` is `fill="none" stroke` throughout, so its draw is
native. Check which kind of glyph you have before promising a draw.

---

## 6. Splitting a compound path

Most Phosphor glyphs are one compound path. **The subpath's own moveto decides
whether lifting it out is safe:**

- Starts with **absolute `M`** → copy verbatim.
- Starts with **relative `m`** → positioned by whatever precedes it; copied as-is it
  lands somewhere else entirely.

`bird` has all three in one `d`. The eye starts `M176,68` and lifts clean. The other
two start `m64,12` and `m-22.42,0`; copied verbatim the counter renders at x−22.42.
Resolving them needs the rule that **after a `Z` the current point returns to that
subpath's own start** — giving (176+64, 68+12) = (240,80) and (240−22.42, 80) =
(217.58, 80). Those numbers are load-bearing.

**Filled counters are the other trap.** A counter is a *hole*; filled on its own it
becomes a solid shape. `biohazard`'s blades rebuilt as five filled paths differ from
the original by **28.65%** of its ink — which is why every `biohazard` variant
transforms the whole mark.

**Derive, don't guess.** `bird`'s wing restates as a stroke: its two long edges give
a centreline of (61.33,208)→(127.99,128), and the 20.85-unit gap between its bottom
points projected onto the perpendicular is **16.02** — Phosphor's stroke weight
exactly. That is how you know a restatement is right, not by eyeballing it.

---

## 7. Deliberate redraws

Rest may differ from Phosphor **only** when the author decides the icon should rest
as a different picture and says so in the header. The new rest must still be exact —
exact to the new intended picture. Currently three: `ambulance` (0.86), `bicycle`,
`bell-simple-slash`.

**A scaled body need not cost rendered size.** `bicycle`: the body is drawn at 0.824
*inside the viewBox*, the `svg` renders at `size / 0.824`, and a negative margin of
half the difference pulls it back. Layout box stays `size`, the body renders at
identical pixels-per-unit to an unscaled glyph, and the freed 17.6% becomes room
outside the box.

**The three numbers move together or not at all.** Shipping the scale without the
compensating box makes an icon read ~18% too small in a grid. That happened and was
caught in review.

---

## 8. Use the dialect — magic numbers are the defect

`registry/lib/motion-tokens.ts` already defines the signature palette. **The set
reads as inconsistent because icons inline their own numbers, not because the
tokens are missing.** Reach for these first; a bare cubic-bezier or duration in an
icon needs a stated reason in the header.

| need | token |
|---|---|
| travel across the artboard | `SWEEP` `[0.65, 0, 0.35, 1]` |
| landing / arriving at rest | `ARRIVE` `[0.16, 1, 0.3, 1]` |
| hover-out, every `normal` | `RETURN_TRANSITION` (never omit) |
| pop, tap, squash | `springPop` |
| pendulum — bells, hanging things | `springSwing` |
| heavier body settling | `springSettle` |
| overshoot ease | `OVERSHOOT_BACK` |
| wind-up dip | `ANTICIPATE_DIP` (0.92) |
| durations | `DUR` — instant .12 / fast .2 / base .32 / slow .5 |

Ready-made: `popIn()`, `squashStretch()`, `staged(i)`, `scrollLoop(ambient)`,
`SNAP_DRAW_SPRING`.

**Adding a new export to motion-tokens requires updating `TOKEN_DEPS` in the
generator** or its transitive closure will not resolve.

### Tier and duration

| tier | when | budget |
|---|---|---|
| **Productive** | default for an installed icon — feedback, state change | 120–300ms |
| **Expressive** | gallery pieces, a gesture needing a full beat | 300–900ms |
| **Indefinite** | a genuinely ongoing condition only | must close on rest |

Duration follows distance and complexity: frequent small movements are faster than
large or unusual ones.

### Easing

```
Does the element accelerate out of view?
├── Yes → ease-in
└── No
    ├── Constant-rate (progress rotation)? → linear
    ├── Settling into place from a gesture?  → ARRIVE / ease-out
    └── Moving or morphing while on screen   → ease-in-out
```

**Never linear for spatial movement.** Linear is for rotation and progress only.

---

## 9. Character comes from the object, not a mood board

This is the section that stops output being generic. Before picking a curve, name
what the thing is **made of** — material dictates motion far more reliably than an
adjective, and it varies per icon, which is the point.

| material | icons | curve | overshoot | duration |
|---|---|---|---|---|
| **Rigid metal / stone** | bell, anchor, barbell, key, axe | `springSwing` if it hangs, else `ARRIVE` | 0–5% | 1.2× base |
| **Elastic / soft** | balloon, beach-ball, heart, avocado | `springPop`, `squashStretch()` | 15–25% | 0.8× base |
| **Paper / fabric** | blueprint, article, beanie, belt | `ARRIVE` | 3–5% | 1.0× base |
| **Fluid** | beer, bathtub, bottle | `easeInOut` | 5% | 1.5× base |
| **Mechanical / geared** | biohazard, aperture, battery | `linear` or detented steps | **0%** | 1.0× base |
| **Airborne / light** | bird, airplane, balloon | `ARRIVE` + arc | 5–10% | 1.0× base |

**Rigid things do not squash.** A bell that squashes reads as rubber. **Mechanical
things do not overshoot** — a gear that springs past its detent reads as broken,
which is why `biohazard` steps and holds instead of easing.

**Path is language:** angular = tense; curved = friendly; long arc = elegant;
straight diagonal = purposeful; vertical = weight or growth.

---

## 10. Disney at 24px — what survives

Survives, with icon-scale numbers:

- **Anticipation** — dip opposite the main action first, magnitude 10–20% of it.
  `ANTICIPATE_DIP` (0.92) is the canonical value. `heart` and `star` both dip before
  they pop; without it the mark merely changes state. **Skip under 150ms** — there
  is no room for a wind-up.
- **Follow-through / overlapping action** — trailing parts lag the leader by
  0.04–0.10 of the pass. `bird`'s far wing lags 0.04 and beats ~20% shallower; two
  wings on identical keyframes render as one thick wing.
- **Exaggeration** — overshoot 10–30% via `OVERSHOOT_BACK`. Zero for mechanical (§9).
- **Squash and stretch** — `squashStretch()`. Preserve volume and anchor the opposite
  edge with `transformOrigin`, or it reads as scaling rather than squashing.
- **Timing** — decaying repeats, never flat. `bird`'s wing goes 68, 58, 48 with
  recoveries climbing 8, 12, 16. `heart`'s lub-dub is two beats of *unequal* strength
  (1.16 then 1.09, ~0.6 of it) with the gap between them shorter than the rest that
  follows. Even them out and it throbs like a notification badge instead of beating.
- **Arcs** — but see §14 for the number. Not the one a UI guide gives you.

**Does not survive at 24px — do not import:**

- **Staging** ("dim non-hero elements to 40–60%") — an icon is alone in a 24px box.
  There is nothing to dim.
- **A separate ambient layer** ("background life", subtle pulses) — at icon scale this
  becomes the detached-particle anti-pattern in §15.
- **Solid drawing's shadow rules** — there are no shadows; `currentColor` only.

---

## 11. Sequencing

**When a gesture has two phases, the second must not start until the first is
visibly finished.** `blueprint`'s pen lands at 0.50 and the first grid line begins at
0.54 — a 4% beat of stillness. Without it the lines fly toward a sheet still being
drawn and the phases collide.

**The opposite trade is also valid, deliberately.** `heart`'s anticipation dip landed
at 0.411 against a fill topping out at 0.42, so the beat read as *caused* by the
fill. Overlap when one phase causes the other; separate when one hands off to the
other. Decide which you have.

**Removing a phase means retiming what remains.** `heart`'s beat held flat until 0.36
of a 1.8s pass because that stretch was the fill rising; with the fill gone it was
648ms of dead air on hover. It is now 1.2s with a 60ms settle, and every interval
between scale keys is the same number of milliseconds it was before. `star` needed no
retiming, because its fill landed on the same instant the scale peaked rather than
occupying a stretch of its own. **Check which case you are in — never assume.**

**Stagger budget: `staged(i)` at 0.09 default; total under 500ms.** Past that the
last element reads as a straggler rather than part of a cascade.

---

## 12. Colour and weight

**`currentColor` only.** A hardcoded hex ignores the theme and pops out of the set.
`alien`, `axe` and `amazon-logo` carry literal hexes today; add no more. A mask's
internal `#fff`/`#000` is luminance, not colour, and is fine.

**Match the source stroke weight: 16.** Decorative strokes you add (rays, streaks,
wind) inherit the mark's pen unless you state a reason. The set currently carries 6,
8, 9, 10, 11, 12, 16 and 48 — which is why it reads inconsistent at a glance.

---

## 13. Reduced motion, and icons as click targets

Two flags from `useHover()`, not interchangeable:

- **`reduced`** — render the static fallback. Hardcoded `false` deliberately; the
  branch stays wired so it can be switched on in one place.
- **`ambient`** — the real OS preference, gating *unattended* motion.

**Any transition carrying `repeat: Infinity` must gate that `repeat` on `ambient`.**
The hook cannot reach inside a per-icon transition. There is currently **no
`repeat: Infinity` anywhere** in `registry/icons/` — grep for it; an unguarded one is
a bug.

> `custom` does **not** inherit from a parent `motion.*`. Put `custom={ambient}` on
> the same element carrying the dynamic `variants`, or the variant receives
> `undefined`, `repeat` collapses to `0`, and the loop silently plays once — which
> looks like a timing bug, not a wiring bug.

Most icons sit inside buttons:

- **The hit area is fixed and never animates.** A hover animation that moves the
  element out from under the cursor causes hover-exit/re-enter loops.
- **Every exit leaves a valid pose**: re-trigger, hover out, focus out, interrupt
  mid-flight. `RETURN_TRANSITION` on `normal` exists for exactly this.
- **Motion is never the only carrier of meaning.** The state must be legible from the
  still frame.

---

## 14. What does NOT transfer from general UI motion guidance

You will be handed skills and articles written for buttons, modals and page
transitions. Most of their numbers are in **screen pixels at desktop scale** and are
catastrophic when pasted onto a 256-unit grid rendered at 24px. Convert or reject.

| general guidance | why it fails here | use instead |
|---|---|---|
| "Add a 10–20px arc offset at the path midpoint" | 10px = **106 grid units** — nearly half the artboard | 8–20 **units** (0.75–1.9px) |
| "Never exceed 1/3 of the screen without a keyframe" | meaningless for a 24px box | the ink-bbox lane audit, §4 |
| "Always three motion layers: primary + secondary + ambient" | an ambient layer at icon scale is a detached particle | primary + at most one subordinate accent |
| "Dim non-hero elements to 40–60%" | nothing else is on screen | ignore |
| Modal 300–400ms, page 400–600ms | not element types that exist here | the tier table, §8 |
| "Shadow arrives 50ms after the card" | no shadows; `currentColor` only | follow-through on a real part |
| "Entrances 30–50% longer than exits" | icons have no entrance — they are already there | rest→gesture→rest, §1 |

**The load-bearing difference:** a UI element animates *into existence*. An icon is
already on screen and stays there, so every gesture is a round trip that begins and
ends on the resting mark. Guidance built on entrance/exit does not describe this.

---

## 15. Generic is the anti-pattern — not any technique

**The failure is never the technique. It is a technique reached for because nobody
found the verb.** Sparkles, spins, squash and throbs are all legitimate tools that
ship in this set today. They become the thing people mean by "AI slop" only when
they are standing in for an idea that was never had — the same three effects applied
to 200 different objects, because effects are easier than looking at what the object
does.

So there are two lists, and conflating them is how good techniques get banned.

### A. Defects — always wrong, regardless of taste

Reproducible rendering or logic failures. No amount of art direction rescues these.

- **Two adjacent shapes sharing a boundary.** Their antialiased edges do not sum to 1
  in any renderer and a pale thread shows along the join. Bleeding one outward shrinks
  it but never removes it; measuring at 4× supersampling hides it — which is how "0
  seam pixels" and a plainly visible line at ship size are both true. Use one path
  that wholly contains the other. Tried on `star` twice; both visible.
- **Masking out a band and redrawing it.** Round-trips at rest, fails in motion. Tried
  on `bell-simple-slash`: a static cut shows the gaps early, and a cut following the
  stroke leaves the source's own slash visible ahead of it.
- **A parked round-cap dot** at `pathLength: 0` (§5).
- **Duplicating geometry the mark already contains** (§0, `bird`'s wing). Not a taste
  call — the mark now has two of something it has one of.
- **Clipping mid-gesture** (§4), and **opacity standing in for motion** (§1).

### B. Techniques that are only wrong when they cover for a missing verb

Every one of these is good, and every one ships here. Judge the *reason* it is
present, never the technique itself.

| technique | shipped here | fails when |
|---|---|---|
| Whole-mark rotation | `biohazard` spins and detents — the best motion in the set | the mark has an internal part that should have moved instead |
| Detached accents | `star`'s rays, `bicycle`'s streaks, `ambulance`'s speed lines | the mark itself does nothing and the accent carries the whole idea |
| Squash and stretch | elastic subjects (§9) | applied to rigid metal or a mechanism |
| Scale pulse | a real pulse — `heart`'s lub-dub | used as the default gesture for an object that does not pulse |
| Draw-on | `blueprint`, the `arrow-bend-*` family | the glyph is filled, so the draw is faked with clips (§5) |

**The test that separates them — apply it literally:**

> Delete the accent, or freeze the rotation. **Does the icon still express its verb?**
>
> - **Yes** → the accent is subordinate and earned. Keep it.
> - **No, but the mark itself clearly moves** → the accent *is* the verb. Fine —
>   `star`'s rays are the favouriting.
> - **No, and the mark never moved** → the effect was doing the work the mark should
>   have done. **This is the generic failure.** Delete it and start from §0.

The last row is the one that produces a set nobody can use professionally: 200 icons
where the glyph sits still and a generic flourish happens next to it.

---

## 16. Ship gate

Run in order. Each has caught a real defect.

0. **The standing test, all six questions, answered out loud** — not assumed. Any
   single failure blocks the icon regardless of how good the gesture is. Re-run it
   after the gesture is built, not only while planning it.
1. **Verb in the header**, and it is not "pulse"/"wiggle"/"pop" (§0).
2. **Rest = first keyframe = final keyframe**, including mounted groups, masks,
   `pathLength`, loop boundaries (§1).
3. **Pixel-diff ≤0.1%** if the glyph was split (§1), or a header note if it is a
   deliberate redraw (§7).
4. **Furthest ink travels ≥18 units** (§2).
5. **Ink bbox measured**; nothing clips mid-gesture; nothing paints outside at rest (§4).
6. **No parked round-cap dots** at `pathLength: 0` (§5).
7. **Tokens used, not magic numbers** — or a header reason (§8).
8. **Material named** and the curve matches it (§9).
9. **`currentColor` only; stroke weight 16** unless justified (§12).
10. **`repeat: Infinity` gated on `ambient`**; `custom` on the right element (§13).
11. **Viewed at 24px, not just in the lab**, then scrubbed frame-by-frame for the
    poses the timeline hides.
12. **Interrupt tested**: hover out mid-gesture, re-trigger, focus, blur.
13. `pnpm verify` exits 0.

---

## 17. Write down what you rejected

When you try a direction and abandon it, **record it in the header with the reason.**
The notes on `star`'s seam, `bell-simple-slash`'s mask, `bicycle`'s wheels and
`bird`'s drawn wings exist because each was re-attempted at least once. A header that
says only what the icon does invites the next author to spend a day rediscovering why
the obvious approach fails.
