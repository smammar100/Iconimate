"use client";

import { Suspense, useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion as m } from "motion/react";
import { visibleIconMeta, type IconMetaEntry } from "@/registry/icon-meta.gen";
import { LAZY_ICONS } from "@/registry/lazy-icons.gen";
import type { IconHandle } from "@/lib/icon";
import { metaFor } from "./icon-meta";
import type { IconAction } from "./dark-icon-card";

const RECENT = [
  "airplane-tilt",
  "airplane-taxiing",
  "airplane-takeoff",
  "airplane-landing",
  "airplane-in-flight",
  "airplane",
];

/** Live preview: the active row's icon plays its animation; the rest sit still. */
function RowIcon({ entry, active }: { entry: IconMetaEntry; active: boolean }) {
  const ref = useRef<IconHandle>(null);
  useEffect(() => {
    if (active) ref.current?.startAnimation();
    else ref.current?.stopAnimation();
  }, [active]);
  const Component = LAZY_ICONS[entry.slug];
  return (
    <span className="dc-cmdk__row-icon">
      <Suspense fallback={<span style={{ width: 22, height: 22, display: "inline-block" }} />}>
        <Component ref={ref} size={22} style={{ pointerEvents: "none" }} />
      </Suspense>
    </span>
  );
}

/**
 * The ⌘K command palette — the signature surface of the Dark Command direction.
 * Grouped results, arrow-key navigation, a live animation preview in the active
 * row, and ↵ to copy the install line.
 */
export function CommandPalette({
  open,
  onClose,
  onAction,
}: {
  open: boolean;
  onClose: () => void;
  onAction: (kind: IconAction, slug: string, name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (i: number) => `${baseId}-opt-${i}`;

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      const recent = RECENT.map((s) => visibleIconMeta.find((i) => i.slug === s)).filter(Boolean) as IconMetaEntry[];
      const rest = visibleIconMeta.filter((i) => !RECENT.includes(i.slug));
      return [
        { label: "Recently Added", items: recent },
        { label: "All Icons", items: rest },
      ];
    }
    const matches = visibleIconMeta.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.slug.includes(q) ||
        i.keywords.some((k) => k.includes(q)),
    );
    return [{ label: "Results", items: matches }];
  }, [query]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  // Reset when opened; refocus the input.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Keep the active index in range and scrolled into view.
  useEffect(() => {
    if (active > flat.length - 1) setActive(flat.length ? flat.length - 1 : 0);
  }, [flat.length, active]);
  useEffect(() => {
    rowRefs.current[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const copyActive = (kind: IconAction) => {
    const item = flat[active];
    if (!item) return;
    onAction(kind, item.slug, item.name);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (flat.length ? (a + 1) % flat.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (flat.length ? (a - 1 + flat.length) % flat.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      // ⌘/Ctrl+Enter copies the standalone .tsx source; plain Enter the CLI line.
      copyActive(e.metaKey || e.ctrlKey ? "copy-code" : "copy-cli");
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      // keep focus within the dialog (combobox stays on the input)
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  /* ─────────────────────────────────────────────────────────
   * PALETTE STORYBOARD
   *
   *   open    overlay fades in (140ms) while the panel drops in
   *           from -8px at 97% scale and spring-settles to rest
   *   close   panel shrinks back toward its origin as the
   *           overlay fades — fast (120ms), no bounce
   * ───────────────────────────────────────────────────────── */
  let idx = -1;
  return (
    <AnimatePresence>
      {open && (
    <m.div
      className="dc-cmdk-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search icons"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12, ease: "easeOut" } }}
      transition={{ duration: 0.14, ease: "easeOut" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <m.div
        className="dc-cmdk"
        initial={{ opacity: 0, scale: 0.97, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.12, ease: "easeOut" } }}
        transition={{ type: "spring", visualDuration: 0.25, bounce: 0.15 }}
        onKeyDown={onKeyDown}
      >
        <div className="dc-cmdk__input-row">
          <SearchGlyph />
          <input
            ref={inputRef}
            className="dc-cmdk__input"
            placeholder="Search icons, categories, motions…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            aria-label="Search icons"
            role="combobox"
            aria-expanded={flat.length > 0}
            aria-controls={listId}
            aria-activedescendant={flat[active] ? optionId(active) : undefined}
            spellCheck={false}
            autoComplete="off"
          />
          <span className="dc-kbd">esc</span>
        </div>

        <div className="dc-cmdk__list" role="listbox" id={listId} aria-label="Icons">
          {flat.length === 0 && <div className="dc-cmdk__empty">No icons match “{query}”.</div>}
          {groups.map((group) =>
            group.items.length === 0 ? null : (
              <div key={group.label}>
                <div className="dc-cmdk__group">{group.label}</div>
                {group.items.map((entry) => {
                  idx += 1;
                  const i = idx;
                  const isActive = i === active;
                  const { motion } = metaFor(entry.slug);
                  return (
                    <div
                      key={entry.slug}
                      ref={(el) => {
                        rowRefs.current[i] = el;
                      }}
                      id={optionId(i)}
                      role="option"
                      aria-selected={isActive}
                      className={`dc-cmdk__row${isActive ? " is-active" : ""}`}
                      onMouseMove={() => setActive(i)}
                      onClick={() => {
                        onAction("copy-cli", entry.slug, entry.name);
                        onClose();
                      }}
                    >
                      <RowIcon entry={entry} active={isActive} />
                      <span className="dc-cmdk__row-name">{entry.name}</span>
                      <span className="dc-cmdk__row-motion dc-mono">{motion}</span>
                      <span className="dc-cmdk__row-right">
                        <span className="dc-cmdk__enter dc-mono">↵ install</span>
                        {i < 9 && <span className="dc-kbd-mini">{i + 1}</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            ),
          )}
        </div>

        <div className="dc-cmdk__footer dc-mono">
          <span className="dc-cmdk__legend">
            <span>↑↓ navigate</span>
            <span>↵ copy install</span>
            <span>⌘↵ copy code</span>
            <span>esc close</span>
          </span>
          <span>
            {flat.length} icon{flat.length === 1 ? "" : "s"}
          </span>
        </div>
      </m.div>
    </m.div>
      )}
    </AnimatePresence>
  );
}

function SearchGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
