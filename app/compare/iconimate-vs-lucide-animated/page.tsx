import type { Metadata } from "next";
import { DocShell } from "@/components/seo/doc-shell";
import { ICON_COUNT } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Iconimate vs Lucide-based animated icons",
  description:
    "An honest comparison of Iconimate and Lucide-based animated React icon sets: Phosphor 256 " +
    "grid vs the Lucide 24px grid, hand-tuned per-icon motion vs uniform transforms, and how each " +
    "is distributed.",
  alternates: { canonical: "/compare/iconimate-vs-lucide-animated" },
};

export default function ComparePage() {
  return (
    <DocShell>
      <h1>Iconimate vs Lucide-based animated icons</h1>
      <p className="doc-lead">
        Both give you animated React icons you can drop into a project. The real difference is the
        drawing grid and how the motion is authored. This page lays out the trade-offs honestly so
        you can pick the right one for your project.
      </p>

      <h2>At a glance</h2>
      <div className="doc-table-wrap">
        <table>
          <thead>
            <tr>
              <th>&nbsp;</th>
              <th>Iconimate</th>
              <th>Lucide-based animated sets</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Drawing grid</td>
              <td>Phosphor 256 grid</td>
              <td>Lucide 24px grid</td>
            </tr>
            <tr>
              <td>Motion</td>
              <td>Hand-tuned per icon (spring physics, anticipation, settle)</td>
              <td>Often a uniform transform applied across the set</td>
            </tr>
            <tr>
              <td>Weight / style</td>
              <td>Filled Phosphor glyphs</td>
              <td>Stroked, thin-line glyphs</td>
            </tr>
            <tr>
              <td>Distribution</td>
              <td>shadcn registry, per-icon AI prompt</td>
              <td>Varies (npm package or copy-paste)</td>
            </tr>
            <tr>
              <td>Runtime dependency</td>
              <td>motion only</td>
              <td>Varies</td>
            </tr>
            <tr>
              <td>License</td>
              <td>MIT</td>
              <td>Usually MIT</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>The grid is the real difference</h2>
      <p>
        Lucide icons are drawn on a 24px grid with a consistent stroke, which is why they read as a
        thin, uniform line set. Iconimate is drawn on{" "}
        <a href="https://phosphoricons.com" target="_blank" rel="noreferrer">
          Phosphor&apos;s
        </a>{" "}
        256 grid with filled glyphs, so it shares a visual language with the Phosphor ecosystem. If
        your interface already uses Phosphor, Iconimate pairs naturally; if it uses Lucide, a
        Lucide-based set will match your existing icons more closely.
      </p>

      <h2>Motion authored per icon, not applied uniformly</h2>
      <p>
        Many animated icon sets take a static icon library and apply the same handful of transforms
        (rotate, scale, translate) to every glyph. Iconimate instead gives each icon its own motion
        chosen to suit the object: an acorn rocks like it fell from the branch, an anchor sways from
        its ring, an ambulance drives past with a blinking cross. The motions use a shared dialect of
        springs and easing so the set still feels cohesive, but no two icons move the same way just
        because they were run through the same filter.
      </p>

      <h2>How each is distributed</h2>
      <p>
        Iconimate ships every icon as a shadcn registry item, so you add exactly the {ICON_COUNT}{" "}
        icons you need as self-contained components rather than installing a whole package. The only
        runtime dependency is <strong>motion</strong>. Lucide-based sets are distributed in a few
        different ways depending on the project, from an npm package to copy-paste snippets.
      </p>

      <h2>Which should you choose?</h2>
      <ul>
        <li>
          <strong>Choose Iconimate</strong> if you want filled Phosphor-style icons, motion that is
          hand-tuned per icon, and shadcn-registry distribution.
        </li>
        <li>
          <strong>Choose a Lucide-based set</strong> if your product already uses Lucide&apos;s
          thin-line style and you want animated icons that match it exactly.
        </li>
      </ul>
      <p>
        Both are open-source and MIT licensed, so trying Iconimate costs nothing: add a single icon
        with <code>npx shadcn@latest add https://iconimate.app/r/bell.json</code> and see how the
        motion feels in your interface.
      </p>
    </DocShell>
  );
}
