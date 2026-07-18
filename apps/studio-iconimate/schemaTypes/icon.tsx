import {defineType, defineField, defineArrayMember} from 'sanity'
// @sanity/icons v5 exports each icon from its own subpath; the root entry only
// carries {Icon, icons}. Importing from '@sanity/icons' typechecks (the barrel
// .d.ts still declares every icon) but fails at runtime in the browser.
import {SparklesIcon} from '@sanity/icons/Sparkles'
import {IconPreview} from '../components/IconPreview'

/**
 * An Iconimate icon.
 *
 * Direction of truth: the REPO owns the code, Sanity owns the content.
 * `registry/icons/<slug>.tsx` is the real icon — an executable React component
 * compiled into the bundle at build time. Nothing here is ever executed, and no
 * build step reads this document. The code-bearing fields are mirrors, kept
 * `readOnly` so that stays true by construction rather than by convention.
 *
 * `aiPrompt` is the exception, and the only field Sanity is authoritative for:
 * it exists nowhere in the repo. The import script never writes it, so a re-sync
 * can't destroy it.
 */
export const iconType = defineType({
  name: 'icon',
  title: 'Icon',
  type: 'document',
  icon: SparklesIcon,
  groups: [
    {name: 'identity', title: 'Identity', default: true},
    {name: 'ai', title: 'AI'},
    {name: 'source', title: 'Source'},
    {name: 'lab', title: 'Lab'},
  ],
  fields: [
    // ── Identity ────────────────────────────────────────────────────────────
    defineField({
      name: 'slug',
      title: 'Slug',
      description:
        'Mirrors registry/icons/<slug>.tsx. The repo owns this value and it is the key the import script upserts on — editing it here renames nothing and will orphan the document.',
      // A plain string, not Sanity's `slug` type: that type wraps values as
      // {_type:'slug', current:'bell'}, which forces `slug.current == $slug` into
      // every query and buys nothing here — there is no generate-from-title
      // workflow, the value is dictated by a filename.
      type: 'string',
      group: 'identity',
      readOnly: true,
      validation: (rule) =>
        rule.required().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {name: 'kebab-case slug'}),
    }),
    defineField({
      name: 'name',
      title: 'Display name',
      type: 'string',
      group: 'identity',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'keywords',
      title: 'Search keywords',
      description: 'Drives the ⌘K palette search in the app.',
      type: 'array',
      group: 'identity',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'motion',
      title: 'Motion label',
      description:
        'One word for the animation, e.g. "swing", "plunge". Shown on the card and used in the registry item description. Mirrored from components/dark/icon-meta.ts — the repo owns it, so edits here are overwritten on the next sync.',
      // A validated string, not a reference to a motionType document. Motion is
      // repo-owned and mirrored, so a reference would normalise a field nobody
      // can meaningfully edit — and the distribution is a long tail (70 distinct
      // across 174, ~40 used once), which is prose per icon, not a taxonomy.
      // If motion ever becomes Sanity-authored, add motionType docs alongside.
      type: 'string',
      group: 'identity',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'glow',
      title: 'Glow colour',
      description: 'Identity hex bloomed behind the glyph on the dark card, e.g. #E34BA0.',
      type: 'string',
      group: 'identity',
      validation: (rule) =>
        rule.required().regex(/^#[0-9A-Fa-f]{6}$/, {name: '6-digit hex colour'}),
    }),
    defineField({
      name: 'homeVisibility',
      title: 'Homepage visibility',
      description:
        '"Hidden" mirrors HOME_HIDDEN_SLUGS in registry/icons/index.ts — the showcase icons already featured in the hero. Hidden icons are still installable.',
      // A list rather than a boolean: visibility rules tend to grow a third case.
      type: 'string',
      group: 'identity',
      initialValue: 'visible',
      options: {
        list: [
          {title: 'Visible in grid', value: 'visible'},
          {title: 'Hidden (featured in hero)', value: 'hidden'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),

    // ── AI ──────────────────────────────────────────────────────────────────
    defineField({
      name: 'aiPrompt',
      title: 'AI prompt',
      description:
        'Prompt an LLM can use to author this icon. Sanity is the source of truth for this field — it exists nowhere in the repo, and the import script never overwrites it.',
      type: 'text',
      rows: 8,
      group: 'ai',
    }),

    // ── Source (mirror) ─────────────────────────────────────────────────────
    defineField({
      name: 'tsxSource',
      title: 'Standalone TSX (mirror)',
      description:
        'Snapshot of public/r/<slug>.json → files[0].content — exactly what `shadcn add` installs. Read-only mirror: the repo is the source of truth and nothing reads this back into a build.',
      type: 'text',
      rows: 20,
      group: 'source',
      readOnly: true,
    }),
    defineField({
      name: 'sourceSyncedAt',
      title: 'Source snapshot taken',
      description: 'When the import script last mirrored tsxSource.',
      type: 'datetime',
      group: 'source',
      readOnly: true,
    }),

    // ── Lab ─────────────────────────────────────────────────────────────────
    defineField({
      name: 'labVariants',
      title: 'Lab variants',
      description:
        'Animation candidates explored in app/lab/<slug>/page.tsx. Only ~38 of 173 icons have any.',
      type: 'array',
      group: 'lab',
      of: [defineArrayMember({type: 'labVariant'})],
    }),
    defineField({
      name: 'labPageSource',
      title: 'Lab page source (mirror)',
      description:
        'Full text of app/lab/<slug>/page.tsx. Kept whole because the variant components share module-level path constants and cannot be sliced apart reliably. Read-only mirror; never executed.',
      type: 'text',
      rows: 20,
      group: 'lab',
      readOnly: true,
    }),
  ],
  preview: {
    select: {title: 'name', motion: 'motion', slug: 'slug'},
    prepare({title, motion, slug}) {
      return {
        title: title ?? slug,
        subtitle: motion ? `${slug} · ${motion}` : slug,
        // The real animated icon, looping — 173 icons are far easier to tell
        // apart by their motion than by name. Renders in the document list and
        // the document header.
        media: <IconPreview slug={slug} />,
      }
    },
  },
  orderings: [
    {title: 'Slug A→Z', name: 'slugAsc', by: [{field: 'slug', direction: 'asc'}]},
    {title: 'Motion', name: 'motionAsc', by: [{field: 'motion', direction: 'asc'}]},
  ],
})
