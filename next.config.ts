import type { NextConfig } from "next";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

/**
 * Site version, resolved once at build time and inlined into the bundle.
 *
 * Shape: `<major>.<minor>.<commits>` — major/minor come from package.json, the
 * patch is the total commit count, so it advances by exactly one per commit
 * with nothing to remember to bump.
 *
 * WHY THIS ISN'T A GENERATED FILE. The obvious move is to emit version.gen.ts
 * from the registry generator like icon-meta.gen.ts. It doesn't work: a tracked
 * file recording the commit count has to be committed, which creates the next
 * commit, so it is permanently one behind and dirties every single diff. Held
 * in config and inlined at build, the number is always exactly right and no
 * file churns.
 *
 * SHALLOW CLONES. `git rev-list --count` on a shallow clone returns the depth,
 * not the history — a plausible, wrong, silently-too-low number. CI platforms
 * clone shallow by default often enough that this is a real risk, so a shallow
 * repo (or no git at all) falls back to the commit SHA rather than publish a
 * figure that looks authoritative and isn't. Vercel exposes the SHA as
 * VERCEL_GIT_COMMIT_SHA even where .git is unhelpful.
 */
function resolveVersion(): { version: string; commit: string } {
  const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
  const [major = "0", minor = "0"] = String(pkg.version ?? "0.0.0").split(".");
  const base = `${major}.${minor}`;

  const git = (args: string[]) =>
    execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

  const envSha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "";

  try {
    const sha = envSha || git(["rev-parse", "--short=7", "HEAD"]);
    if (git(["rev-parse", "--is-shallow-repository"]) === "true") {
      return { version: `${base}.0+${sha}`, commit: sha };
    }
    return { version: `${base}.${git(["rev-list", "--count", "HEAD"])}`, commit: sha };
  } catch {
    // No git in the build image (tarball deploy, some sandboxes).
    return { version: envSha ? `${base}.0+${envSha}` : base, commit: envSha };
  }
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
