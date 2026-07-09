<div align="center">

# Iconimate

**A hand-built set of animated icons. Spring motion, hover magic.**

Open source React icons, hand drawn on the Phosphor 256 grid and tuned to read at 24px.
Hover any glyph and watch it come alive.

`30 icons` &middot; `MIT licensed` &middot; `React 19` &middot; `Next.js 16` &middot; `motion`

</div>

---

## Why Iconimate

Most icon sets hand you a static SVG and call it a day. Iconimate ships icons that **move with intent**. Every glyph carries its own little performance: a bell that swings, an anchor that sways on its ring, an ambulance that races past with blinking lights, a tiny Android that hops and waggles its antennae.

Each icon is:

- **Drawn on the Phosphor 256 grid** so the whole set shares one visual language.
- **Animated with [motion](https://motion.dev)** using a shared dialect of springs and easing curves, so nothing feels out of place.
- **Hover and focus aware** out of the box, with an imperative handle for touch devices where `:hover` never fires.
- **Small and legible**, with hover and focus motions kept short and subtle so they read at 24px.

## Quick start

Run the gallery locally:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000), browse the set, and hit `Cmd/Ctrl + K` to search.

> Note: this project builds with webpack, not Turbopack. The `dev` and `build` scripts already pass `--webpack` for you.

## Install an icon

Every icon is distributed through a [shadcn](https://ui.shadcn.com) style registry. Grab just the ones you need:

```bash
npx shadcn@latest add https://iconimate.app/r/android-logo.json
```

That drops one self-contained component into your project — the hover controller and motion tokens are inlined, so the only dependency is `motion`.

## Usage

```tsx
import { AndroidLogoIcon } from "@/registry/icons/android-logo";

export function Example() {
  return <AndroidLogoIcon size={24} />;
}
```

Hover or focus the icon and it animates. Need to drive it yourself (for example on a touch tap or a parent hover)? Reach for the ref:

```tsx
import { useRef } from "react";
import { AndroidLogoIcon } from "@/registry/icons/android-logo";
import type { IconHandle } from "@/lib/icon";

export function Example() {
  const ref = useRef<IconHandle>(null);

  return (
    <button
      onPointerEnter={() => ref.current?.startAnimation()}
      onPointerLeave={() => ref.current?.stopAnimation()}
    >
      <AndroidLogoIcon ref={ref} size={24} />
    </button>
  );
}
```

Every icon accepts a `size` prop (defaults to 28, calibrated to read at 24) plus any standard `div` attributes.

## The set

Thirty icons and counting, including:

| Icon | Motion |
| --- | --- |
| Acorn | rocks like a fall from the branch |
| Address Book | nods open |
| Alarm | rattles on its base |
| Alien | eyes glow |
| Airplane family | thermal, climb, arrival, departure, taxi, and bank |
| Align tools | blocks drop and settle into place |
| Amazon Logo | wobbles on its base |
| Ambulance | drives with a blinking cross and trailing speed streaks |
| Anchor and Anchor Simple | sway from the top ring |
| Android Logo | hops, blinks, and waggles its antennae |

Browse the live gallery for the full roster and to preview every animation.

## How an icon is built

The anatomy is deliberately small so a single file is easy to read, copy, and tweak:

- A **filled Phosphor path** as the glyph (sometimes split into parts so pieces can move on their own).
- A set of **motion variants** (`normal` and `animate`) describing the resting and active states.
- The shared **`useHover`** controller that gates the animation through one source of truth and wires up enter, leave, focus, and blur.
- A shared **motion token** module (`SWEEP`, `ARRIVE`, springs, durations) so the whole set speaks one language.

```tsx
const sway: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 11, 0, -11, 0],
    transition: { duration: 2.4, ease: "easeInOut", repeat: Infinity },
  },
};
```

## Tech stack

- [Next.js 16](https://nextjs.org) with the App Router
- [React 19](https://react.dev)
- [motion](https://motion.dev) for animation
- [Tailwind CSS v4](https://tailwindcss.com)
- TypeScript end to end

## Contributing

New icons are welcome. Match the existing pattern: draw on the 256 grid, pick a motion that suits the object, reuse the shared hook and tokens, and add an entry to the registry index plus its metadata. Keep the animation legible at 24px, because that is where most of these icons live.

## License

MIT. Use them anywhere, animate everything.
