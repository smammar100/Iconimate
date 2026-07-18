import { defineSandbox, defaultBackend } from "eve/sandbox";

export default defineSandbox({
  backend: defaultBackend({
    // The auditor must reach any site it is pointed at, so it keeps an
    // open network policy rather than an allowlist.
    vercel: { networkPolicy: "allow-all" },
    docker: { networkPolicy: "allow-all" },
  }),
  // Bump the suffix to force a template rebuild after changing the setup scripts.
  revalidationKey: () => "seo-improver-agent-browser-gh-v1",
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({ command: "bash setup-agent-browser.sh" });
    // `gh` is only used when a blog repo is configured for the optional
    // pull-request flow; installing it is cheap and keeps setup uniform.
    await sandbox.run({ command: "bash setup-gh.sh seo-improver" });
  },
});
