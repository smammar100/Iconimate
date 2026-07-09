import type { Metadata } from "next";
import { DocShell } from "@/components/seo/doc-shell";
import { ICON_COUNT } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Install and use Iconimate animated React icons: the shadcn registry flow, Open in v0, " +
    "controlling animation with a ref, TypeScript usage, and reduced-motion.",
  alternates: { canonical: "/docs" },
};

export default function DocsPage() {
  return (
    <DocShell>
      <h1>Docs</h1>
      <p className="doc-lead">
        Iconimate is a set of {ICON_COUNT} animated React icons drawn on the Phosphor 256 grid.
        Every icon is a self-contained component whose only runtime dependency is{" "}
        <a href="https://motion.dev" target="_blank" rel="noreferrer">
          motion
        </a>
        . Add just the icons you need through the shadcn registry.
      </p>

      <h2>Install an icon</h2>
      <p>
        Each icon is published as a shadcn registry item at{" "}
        <code>https://iconimate.app/r/&lt;slug&gt;.json</code>. Add one with the shadcn CLI:
      </p>
      <pre>
        <code>npx shadcn@latest add https://iconimate.app/r/bell.json</code>
      </pre>
      <p>
        That copies a single component into your project. The hover controller and motion tokens are
        inlined, so there is nothing else to wire up. The same command works with{" "}
        <code>pnpm dlx</code>, <code>yarn dlx</code>, and <code>bunx --bun</code>; the gallery shows the
        exact line for your package manager.
      </p>

      <h2>Use an icon</h2>
      <pre>
        <code>{`import { BellIcon } from "@/components/ui/bell";

export function Example() {
  return <BellIcon size={24} />;
}`}</code>
      </pre>
      <p>
        Hover or keyboard-focus the icon and it animates. Every icon accepts a <code>size</code> prop
        (default 28, calibrated to read at 24) plus any standard <code>div</code> attributes.
      </p>

      <h2>Control the animation yourself</h2>
      <p>
        On touch devices <code>:hover</code> never fires, and sometimes you want a parent element to
        drive the motion. Each icon forwards a ref exposing <code>startAnimation</code> and{" "}
        <code>stopAnimation</code>:
      </p>
      <pre>
        <code>{`import { useRef } from "react";
import { BellIcon } from "@/components/ui/bell";
import type { IconHandle } from "@/lib/icon";

export function Example() {
  const ref = useRef<IconHandle>(null);

  return (
    <button
      onPointerEnter={() => ref.current?.startAnimation()}
      onPointerLeave={() => ref.current?.stopAnimation()}
    >
      <BellIcon ref={ref} size={24} />
    </button>
  );
}`}</code>
      </pre>

      <h2>Open in v0</h2>
      <p>
        Every icon in the gallery has an <strong>Open in v0</strong> action that hands the registry
        item to <a href="https://v0.dev" target="_blank" rel="noreferrer">v0</a>, so you can drop it
        into a v0 chat and keep building.
      </p>

      <h2>TypeScript</h2>
      <p>
        Iconimate is written in TypeScript. Icons are typed as{" "}
        <code>ForwardRefExoticComponent</code> with an <code>IconProps</code> surface (<code>size</code>{" "}
        plus <code>div</code> attributes) and an <code>IconHandle</code> ref, so autocomplete and type
        checking work out of the box.
      </p>

      <h2>Reduced motion</h2>
      <p>
        Iconimate icon motions are small and triggered only by hover or focus, so they play for all
        users by default. If you want to gate them behind the{" "}
        <code>prefers-reduced-motion</code> setting in your own app, wrap your tree in a motion
        <code> MotionConfig reducedMotion=&quot;user&quot;</code> boundary, or branch on the{" "}
        <code>useReducedMotion</code> hook where you render the icons.
      </p>

      <h2>License</h2>
      <p>
        MIT. Use the icons anywhere, in personal and commercial projects, for free.
      </p>
    </DocShell>
  );
}
