/**
 * Version chip beside the wordmark: `v0.1.155`, where the patch is the repo's
 * commit count. Both values are inlined at build time by next.config.ts — see
 * resolveVersion() there for the shallow-clone caveat.
 *
 * Deliberately NOT a link. It reads as a label on the lockup, not a
 * destination, so it carries no href and takes no focus. The commit it was
 * built from stays available in the tooltip.
 *
 * Renders nothing when no version resolved, rather than shipping a "v" with an
 * empty number: a chip that says nothing is worse than no chip.
 */
export function VersionBadge() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;
  const commit = process.env.NEXT_PUBLIC_APP_COMMIT;
  if (!version) return null;

  const label = `v${version}`;

  return (
    <span className="dc-version" title={commit ? `Iconimate ${label} (commit ${commit})` : `Iconimate ${label}`}>
      {label}
    </span>
  );
}
