import type { NextConfig } from "next";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const git = (args: string[]) =>
  execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

/**
 * The repo's commit count.
 *
 * READ FROM A COMMITTED FILE, NOT FROM GIT. Vercel builds from a source
 * snapshot with no .git directory, so `git rev-list --count` throws there — an
 * earlier version of this fell back to a SHA and shipped "v0.1.0+00075dd" to
 * production instead of a number. lib/commit-count.json is written and staged
 * by .githooks/pre-commit, so the count travels with the code as data and needs
 * no git, no network and no clone depth at build time.
 *
 * Git is still consulted where it exists (local dev, full checkouts) and the
 * HIGHER of the two wins. That self-heals a commit made without the hook — a
 * merge commit, a GitHub web edit, a clone that never ran `pnpm install` — on
 * the next build, instead of leaving the badge stuck.
 */
function commitCount(): number {
  let stored = 0;
  try {
    const file = JSON.parse(readFileSync(new URL("./lib/commit-count.json", import.meta.url), "utf8"));
    stored = Number(file.count) || 0;
  } catch {
    /* first run before the hook has ever fired */
  }

  let live = 0;
  try {
    // A shallow clone's count is the clone depth, not the history — ignore it
    // rather than let a too-low number win the Math.max below.
    if (git(["rev-parse", "--is-shallow-repository"]) !== "true") {
      live = Number(git(["rev-list", "--count", "HEAD"])) || 0;
    }
  } catch {
    /* no .git — the committed count is the answer */
  }

  return Math.max(stored, live);
}

/**
 * Site version, resolved once at build time and inlined into the bundle.
 *
 * Shape: `<major>.<minor>.<commits>` — nothing else, in every environment. The
 * major/minor come from package.json; the patch advances by exactly one per
 * commit with nothing to remember to bump.
 */
function resolveVersion(): { version: string; commit: string } {
  const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
  const [major = "0", minor = "0"] = String(pkg.version ?? "0.0.0").split(".");

  let commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "";
  if (!commit) {
    try {
      commit = git(["rev-parse", "--short=7", "HEAD"]);
    } catch {
      commit = "";
    }
  }

  return { version: `${major}.${minor}.${commitCount()}`, commit };
}

const { version, commit } = resolveVersion();

const nextConfig: NextConfig = {
  // Rewrite barrel imports (e.g. `motion/react`) to direct deep imports so only
  // the used exports are bundled — smaller initial JS, faster parse.
  experimental: {
    optimizePackageImports: ["motion"],
  },
  // Inlined at build so the nav badge needs no request-time work.
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
    NEXT_PUBLIC_APP_COMMIT: commit,
  },
};

export default nextConfig;
