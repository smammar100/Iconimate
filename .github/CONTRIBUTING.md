# Contributing to Iconimate

Thanks for your interest in contributing. Iconimate is a set of hand built
animated React icons, and new icons, fixes, and improvements are all welcome.
This guide explains how to get set up and what we look for in a contribution.

## Code of Conduct

This project follows a [Code of Conduct](CODE_OF_CONDUCT.md). By taking part in
this project you agree to uphold it. Please report unacceptable behavior to
syed.m.ammar@hotmail.com.

## Getting started

You need Node.js 20 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000 to browse the gallery. Press Cmd/Ctrl + K to
search the set.

Note: this project builds with webpack, not Turbopack. The `dev` and `build`
scripts already pass `--webpack` for you, so run them as written.

## Project layout

- `registry/icons/` holds one file per icon. This is where the glyph and its
  motion live.
- `registry/hooks/use-hover.ts` is the shared hover controller every icon runs
  through.
- `scripts/build-registry.mjs` generates the self contained distribution files
  under `public/r/` on each build.
- `app/` is the Next.js gallery site.

## Adding a new icon

Match the pattern the existing icons use so the whole set stays consistent:

1. Draw the glyph on the Phosphor 256 grid as a filled path. Split the path
   into parts only when pieces need to move independently.
2. Pick a motion that suits the object and keep it legible at 24px, since that
   is the size most of these icons render at.
3. Reuse the shared `useHover` controller and the motion tokens rather than
   introducing new springs or easing curves.
4. Define `normal` and `animate` variants for the resting and active states.
5. Register the icon in the registry index and add its metadata entry.
6. Run the gallery locally and confirm the icon reads clearly and animates on
   both hover and keyboard focus.

## Making changes

1. Fork the repository and create a branch from `main`.
2. Make your change in a focused commit or set of commits.
3. Run the checks below before opening a pull request.
4. Open a pull request using the template and describe what changed and why.

## Checks before you submit

```bash
pnpm lint
pnpm build
```

Both should pass with no errors. If you changed or added an icon, include a
short note or a screen recording of the animation in your pull request so
reviewers can see the motion.

## Reporting bugs and requesting icons

Use the issue templates when you open an issue. Provide clear steps to
reproduce for bugs, and a reference or description for new icon requests.

## Questions

If anything here is unclear, open an issue or email syed.m.ammar@hotmail.com.
