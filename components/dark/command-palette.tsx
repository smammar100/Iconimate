"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { icons, type IconEntry } from "@/registry/icons";
import type { IconHandle } from "@/lib/icon";
import { metaFor } from "./icon-meta";

const RECENT = ["mail", "bolt", "moon", "camera", "trash", "cloud"];

/** Live preview: the active row's icon plays its animation; the rest sit still. */
function RowIcon({ entry, active }: { entry: IconEntry; active: boolean }) {
  const ref = useRef<IconHandle>(null);
  useEffect(() => {
    if (active) ref.current?.startAnimation();
    else ref.current?.stopAnimation();
  }, [active]);
  const { Component } = entry;
  return (
    <span className="dc-cmdk__row-icon">
      <Component ref={ref} size={22} style={{ pointerEvents: "none" }} />
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
  onCopy,
}: {
  open: boolean;
  onClose: () => void;
  onCopy: (slug: string, name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      const recent = RECENT.map((s) => icons.find((i) => i.slug === s)).filter(Boolean) as IconEntry[];
      const rest = icons.filter((i) => !RECENT.includes(i.slug));
      return [
        { label: "Recently added", items: recent },
        { label: "All icons", items: rest },
      ];
    }
    const matches = icons.filter(
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

  if (!open) return null;

  const copyActive = () => {
    const item = flat[active];
    if (!item) return;
    onCopy(item.slug, item.name);
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
      copyActive();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  let idx = -1;
  return (
    <div
      className="dc-cmdk-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search icons"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dc-cmdk" onKeyDown={onKeyDown}>
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
            spellCheck={false}
            autoComplete="off"
          />
          <span className="dc-kbd">esc</span>
        </div>

        <div className="dc-cmdk__list">
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
                      className={`dc-cmdk__row${isActive ? " is-active" : ""}`}
                      onMouseMove={() => setActive(i)}
                      onClick={() => {
                        onCopy(entry.slug, entry.name);
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
            <span>esc close</span>
          </span>
          <span>
            {flat.length} icon{flat.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
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
