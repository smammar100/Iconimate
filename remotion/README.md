# Launch promo

A 30-second, 1920×1080 product film for Iconimate, built with [Remotion](https://remotion.dev) so
every frame is a pure function of time and the render is deterministic.

```bash
pnpm promo           # open Remotion Studio to scrub and tweak
pnpm promo:render    # render out/iconimate-promo.mp4 (H.264, with the soundtrack)
pnpm promo:still -- out/frame.png --frame=135   # one frame, for a quick look
```

The first render downloads Chrome Headless Shell (~150 MB) into Remotion's cache.

**Windows with Smart App Control on:** Windows blocks the unsigned `ffmpeg.exe`/`ffprobe.exe` that
Remotion ships, so `promo:render` fails with `EPIPE`, and so does `<Audio>` in any render. Frames
still render if you turn audio off and ask for an image sequence; mux them with any encoder you have:

```bash
pnpm remotion render remotion/index.ts Promo out/frames --sequence --image-format=jpeg --props='{"withAudio":false}'
```

## What is where

| File | Holds |
| --- | --- |
| `Promo.tsx` | The film: seven cue labels on one clock, a bell carried through all of them |
| `Bell.tsx` | The bell's shell and clapper, verbatim from `registry/icons/bell.tsx`, with its traced ring |
| `wall.ts` | Per-icon wall motion, copied from each icon's registry variants |
| `glyphs.ts` | 78 resting glyphs extracted from `registry/icons/*.tsx` (auto-ported; regenerate, don't edit) |
| `Glyph.tsx` | Draws a glyph, keeping stroked subpaths as strokes and knockouts as real holes |
| `motion.ts` | The three motion helpers and the global `SNAP` that tightens every duration |
| `tokens.ts` | Colours from `app/globals.css` dark theme; Geist, Geist Mono and Caveat via `@remotion/google-fonts` |
| `public/soundtrack.wav` | 30 s soundtrack, cut to the scene boundaries listed at the top of `Promo.tsx` |

The icon count in the wall header is read live from `registry/icon-meta.gen.ts`, and the star
count on the CTA from the GitHub API at render time (hidden if the request fails, like the site's
own button).

`remotion.config.ts` points Remotion's public dir at `remotion/public`, so nothing here ships with
the Next site. Renders land in `out/`, which is git-ignored.
