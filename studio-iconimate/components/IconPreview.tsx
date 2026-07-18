import {Suspense, lazy, useEffect, useRef, type ComponentType} from 'react'

/**
 * Renders the real animated icon from the app, looping, so an editor recognises
 * an icon instantly instead of reading its name.
 *
 * The icon components are imported straight from ../registry/icons — the same
 * modules the website renders. Their four allowed import specifiers are aliased
 * to the repo in sanity.cli.ts, and they are plain React + motion, so they run
 * here unmodified. The mirrored `tsxSource` field is NOT used: it stays inert
 * text, and Sanity never becomes a code path.
 */

/** Mirrors IconHandle in registry/lib/icon.ts. Inlined to keep the Studio's
 *  tsconfig free of app path mappings — it's two fields and it never changes. */
interface IconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

type IconComponent = ComponentType<{size?: number; ref?: React.Ref<IconHandle>}>

// Vite needs a statically analysable glob; the modules resolve lazily per icon.
const ICON_MODULES = import.meta.glob('../../registry/icons/*.tsx')

const cache = new Map<string, IconComponent>()

function iconFor(slug: string): IconComponent | null {
  if (cache.has(slug)) return cache.get(slug)!
  const load = ICON_MODULES[`../../registry/icons/${slug}.tsx`]
  if (!load) return null
  const Comp = lazy(async () => {
    const mod = (await load()) as Record<string, unknown>
    // Each icon file exports exactly one PascalCase *Icon symbol.
    const name = Object.keys(mod).find((k) => k.endsWith('Icon'))
    if (!name) throw new Error(`registry/icons/${slug}.tsx exports no *Icon symbol`)
    return {default: mod[name] as IconComponent}
  }) as unknown as IconComponent
  cache.set(slug, Comp)
  return Comp
}

/**
 * Timings match the lab harness (app/lab/_shared/harness.tsx): play for 1.5s,
 * repeat every 2.8s. Icons animate on hover, which never fires in a list, so the
 * loop drives the imperative handle directly — the same reason the handle exists.
 */
const PLAY_MS = 1500
const CYCLE_MS = 2800

function Looping({Icon, size}: {Icon: IconComponent; size: number}) {
  const ref = useRef<IconHandle | null>(null)

  useEffect(() => {
    let stopTimer: number | undefined
    const cycle = () => {
      ref.current?.startAnimation()
      stopTimer = window.setTimeout(() => ref.current?.stopAnimation(), PLAY_MS)
    }
    cycle()
    const id = window.setInterval(cycle, CYCLE_MS)
    return () => {
      window.clearInterval(id)
      window.clearTimeout(stopTimer)
    }
  }, [Icon])

  return <Icon size={size} ref={ref} />
}

export function IconPreview({slug, size = 28}: {slug?: string; size?: number}) {
  if (!slug) return null
  const Icon = iconFor(slug)
  // A slug with no module means the doc outlived its icon — show nothing rather
  // than crash the list.
  if (!Icon) return null

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
      }}
    >
      {/* Fixed-size fallback so the row doesn't reflow when the chunk lands. */}
      <Suspense fallback={<div style={{width: size, height: size}} />}>
        <Looping Icon={Icon} size={size} />
      </Suspense>
    </div>
  )
}

export default IconPreview
