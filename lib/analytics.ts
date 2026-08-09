/**
 * The one place the app talks to PostHog.
 *
 * A wrapper rather than importing `posthog-js` at each call site, for two reasons:
 * the "is it configured" test lives once instead of in every component, and call
 * sites stay readable as product events instead of SDK plumbing.
 *
 * Every capture is fire-and-forget and swallows its own failures. An analytics
 * error must never surface in a copy-to-clipboard flow the user is mid-way through.
 */
import posthog from "posthog-js";

/** Mirrors the guard in components/posthog-init.tsx — unconfigured means silent.
 *  Both token names are accepted; see the note there for why. */
const ENABLED = Boolean(
  (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || process.env.NEXT_PUBLIC_POSTHOG_KEY) &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

/** What the visitor copied. Matches the three actions the gallery dispatches. */
export type CopyType = "copy-cli" | "copy-code" | "copy-prompt";

/**
 * A visitor successfully copied an icon out of the gallery — the site's one
 * conversion. Fired from the single dispatcher that serves cards, the command
 * palette and the hero, so all three surfaces are counted identically.
 *
 * No PII: a slug, which of the three actions ran, and for CLI copies the package
 * manager tab that was active.
 */
export function captureIconCopied(
  slug: string,
  copyType: CopyType,
  packageManager?: string,
): void {
  if (!ENABLED) return;
  try {
    posthog.capture("icon_copied", {
      icon_slug: slug,
      copy_type: copyType,
      ...(packageManager ? { package_manager: packageManager } : {}),
    });
  } catch {
    // Never let a metric break a copy.
  }
}

/** Which of the two "Star on GitHub" controls was used. */
export type StarLocation = "nav" | "footer";

/**
 * A visitor clicked through to the GitHub repo.
 *
 * `location` is the whole point of the event: the same label appears in the nav
 * and again in the closing CTA, and one number covering both cannot tell you
 * whether people leave from the header before reading anything or convert at the
 * bottom after scrolling the gallery. Those imply opposite page changes.
 *
 * Both controls are plain links opening in a new tab, so the page stays mounted
 * and the event is not racing an unload.
 */
export function captureStarClicked(location: StarLocation): void {
  if (!ENABLED) return;
  try {
    posthog.capture("star_clicked", { location });
  } catch {
    // Never block the navigation.
  }
}

/**
 * The visitor switched the package-manager tab in the hero.
 *
 * Separate from the `package_manager` property on `icon_copied` because the two
 * answer different questions. That property is preference AMONG PEOPLE WHO
 * COPIED; this is preference among everyone who expressed one, including the
 * majority who never copy. Reading tab preference off copies alone would be
 * survivorship bias — npm is the default tab, so it inherits every visitor who
 * never touched the control.
 *
 * `from` is included so a switch reads as a real choice rather than a page state.
 */
export function capturePackageManagerSelected(to: string, from: string): void {
  if (!ENABLED || to === from) return;
  try {
    posthog.capture("package_manager_selected", {
      package_manager: to,
      previous_package_manager: from,
    });
  } catch {
    // Never block the tab switch.
  }
}
