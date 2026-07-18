/**
 * Declares the one Vite feature this Studio uses: import.meta.glob, in
 * components/IconPreview.tsx.
 *
 * Written by hand rather than via `"types": ["vite/client"]` because vite is only
 * a transitive dependency of sanity (so the reference wouldn't resolve), and
 * because setting `types` at all would narrow type resolution and break the
 * node: imports in sanity.cli.ts.
 */
interface ImportMeta {
  glob: (pattern: string) => Record<string, () => Promise<unknown>>
}
