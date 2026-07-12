# Plan 003: Add `.gitattributes` to kill CRLF/LF churn

> **Executor instructions**: Follow step by step, verify each step, honor STOP conditions, update
> this plan's row in `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat fe790ed..HEAD -- .gitattributes .editorconfig`
> (both are expected to not exist yet). If `.gitattributes` now exists, STOP and report.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `fe790ed`, 2026-07-11

## Why this matters

`git config core.autocrlf` is `true` on the primary checkout and there is no `.gitattributes`. Every
commit emits `warning: in the working copy of '<file>', LF will be replaced by CRLF the next time Git
touches it` and can produce spurious whole-file diffs — especially on the generated `registry/*.gen.*`
and `public/r/*.json` files, where line-ending churn hides real changes in review. A single
`.gitattributes` normalizing to LF fixes it permanently and makes diffs deterministic across
Windows/macOS/Linux contributors.

## Current state

- No `.gitattributes` (confirm: `git check-attr text -- README.md` returns `unspecified`).
- `core.autocrlf=true` (confirm: `git config core.autocrlf`).
- The generator already defends against CRLF on read: `scripts/build-registry.mjs:27` does
  `const read = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");` — evidence the author
  already hit this pain.
- Binary asset present: `public/*.webm` (recorded animation clips) — must be marked binary so Git
  never touches its bytes.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| See what attrs apply | `git check-attr -a -- README.md` | after: `text: auto`, `eol: lf` |
| Renormalize | `git add --renormalize .` | stages a one-time normalization diff |
| Confirm no CRLF warnings | commit a trivial change | no "LF will be replaced by CRLF" warning |

## Scope

**In scope** (create):
- `.gitattributes`
- `.editorconfig` (optional but recommended, for editor-side consistency)

**Out of scope**:
- Bulk reformatting file contents — the renormalization is Git-driven, not a manual edit.
- Changing `core.autocrlf` (leave the user's global/local Git config alone; `.gitattributes`
  overrides it per-repo).

## Git workflow

- Branch: `advisor/003-gitattributes`
- The renormalization commit will touch many files' stored line endings once. Keep it as its own
  commit with a clear subject like "Normalize line endings to LF via .gitattributes" so reviewers
  understand the large one-time diff.

## Steps

### Step 1: Create `.gitattributes`

```gitattributes
# Normalize all text files to LF in the repo; check out native on Windows.
* text=auto eol=lf

# Binary assets — never touch bytes / never normalize.
*.webm binary
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.woff binary
*.woff2 binary
*.ico binary
```

Adjust the binary list to the actual asset types present (`ls public` and any `assets/` dir).

**Verify**: `git check-attr -a -- README.md` shows `text: auto` and `eol: lf`;
`git check-attr binary -- public/last-row-animation.webm` shows `binary: set` (if that file exists).

### Step 2: (Optional) Create `.editorconfig`

```editorconfig
root = true

[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

### Step 3: Renormalize the working tree once

Run `git add --renormalize .` and commit the result. This rewrites stored line endings to LF for all
tracked text files in one deliberate commit.

**Verify**: after committing, make any trivial one-character edit to a `.ts` file and `git add` it —
**no** "LF will be replaced by CRLF" warning appears. Revert the trivial edit.

## Test plan

- Not code — no unit tests. Verification is the absence of the CRLF warning (Step 3) and the
  `git check-attr` outputs (Steps 1–2).

## Done criteria

- [ ] `.gitattributes` exists with `* text=auto eol=lf` and `*.webm binary`.
- [ ] `git check-attr -a -- README.md` reports `text: auto`, `eol: lf`.
- [ ] A trivial staged edit produces no CRLF warning.
- [ ] The renormalization is a single, self-contained commit.
- [ ] `plans/README.md` row for 003 updated.

## STOP conditions

- `git add --renormalize .` produces a diff that changes **content** (not just line endings) — that
  would indicate an encoding problem; STOP and report.

## Maintenance notes

- New binary asset types must be added to `.gitattributes` or Git may corrupt them via EOL
  conversion.
- This should land early (it's independent) so subsequent plans' diffs are clean.
