import {defineType, defineField} from 'sanity'

/**
 * One explored animation candidate from `app/lab/<slug>/page.tsx`.
 *
 * Nested object rather than a document: a variant belongs to exactly one icon,
 * is never shared between icons, and is never queried on its own — so there is
 * nothing to reference and nothing to orphan.
 *
 * `code` is a best-effort excerpt, not a runnable file. Lab pages are hand-written
 * and share module-level path constants between their variants, so a variant's
 * source has no clean boundary. The whole page is mirrored on the parent icon's
 * `labPageSource` for anyone who needs the real thing.
 */
export const labVariantType = defineType({
  name: 'labVariant',
  title: 'Lab variant',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'blurb',
      title: 'Blurb',
      description: 'One line on what the motion does.',
      type: 'string',
    }),
    defineField({
      name: 'componentName',
      title: 'Component identifier',
      description:
        'The component symbol in the lab page, e.g. BarnSettleIcon. A pointer into the source, not runnable code.',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'code',
      title: 'Variant code (best-effort excerpt)',
      description:
        'Extracted component body. May be incomplete — variants share module-level path constants that live outside this excerpt. Reference only; never executed.',
      type: 'text',
      rows: 16,
      readOnly: true,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      // A list rather than a boolean: "was this shipped" is not binary, and the
      // set of outcomes can grow.
      type: 'string',
      initialValue: 'explored',
      options: {
        list: [
          {title: 'Explored', value: 'explored'},
          {title: 'Shortlisted', value: 'shortlisted'},
          {title: 'Shipped', value: 'shipped'},
          {title: 'Rejected', value: 'rejected'},
        ],
        layout: 'radio',
      },
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'blurb'},
  },
})
