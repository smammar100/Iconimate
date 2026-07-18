import {defineCliConfig} from 'sanity/cli'
import {fileURLToPath} from 'node:url'
import {dirname, resolve} from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
// This Studio lives at apps/studio-iconimate/, so the repo root is two up.
const repo = resolve(here, '../..')

export default defineCliConfig({
  api: {
    projectId: '0gny1aq3',
    dataset: 'production',
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },

  /**
   * Lets the Studio render the real icon components from the app, so an editor
   * sees the actual motion instead of a name.
   *
   * The icons live in the repo's registry/icons and import from a closed set of four
   * module specifiers (the same allow-list the registry generator enforces).
   * They're plain React + motion — nothing Next-specific — so aliasing those
   * four specifiers to the repo's real files is all it takes to run them here.
   *
   * This is the Studio importing the repo's own components, exactly as the
   * website does. It does NOT make Sanity a code source: nothing executes the
   * mirrored `tsxSource` field, which stays inert text.
   */
  vite: (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias as Record<string, string> | undefined),
        '@/lib/icon': resolve(repo, 'registry/lib/icon.ts'),
        '@/lib/motion-tokens': resolve(repo, 'registry/lib/motion-tokens.ts'),
        '@/hooks/use-hover': resolve(repo, 'registry/hooks/use-hover.ts'),
      },
    },
    server: {
      ...config.server,
      fs: {
        ...config.server?.fs,
        // The icon sources sit outside the Studio root; Vite blocks that by default.
        allow: [...(config.server?.fs?.allow ?? []), repo],
      },
    },
  }),
})
