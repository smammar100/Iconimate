"use client";

import { useRef } from "react";
import type { IconEntry } from "@/registry/icons";
import type { IconHandle } from "@/lib/icon";
import { cn } from "@/lib/utils";

/**
 * A gallery cell. The whole card is the trigger: pointer, keyboard focus, and tap all drive the
 * icon through its imperative handle. The icon itself is `pointer-events-none` so its own internal
 * hover wiring can't fight the card on partial leaves.
 */
export function IconCard({ entry, size = 40 }: { entry: IconEntry; size?: number }) {
  const ref = useRef<IconHandle>(null);
  const { Component, name } = entry;

  const play = () => ref.current?.startAnimation();
  const rest = () => ref.current?.stopAnimation();

  return (
    <button
      type="button"
      aria-label={name}
      onMouseEnter={play}
      onMouseLeave={rest}
      onFocus={play}
      onBlur={rest}
      onClick={play}
      className={cn(
        "group relative flex aspect-square flex-col items-center justify-center gap-4 rounded-2xl",
        "border border-border bg-card/40 text-card-foreground",
        "transition-[transform,border-color,background-color,box-shadow] duration-300 ease-out",
        "hover:-translate-y-1 hover:border-accent/40 hover:bg-card hover:shadow-[0_18px_40px_-20px] hover:shadow-accent/40",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
      )}
    >
      <Component
        ref={ref}
        size={size}
        className="pointer-events-none text-foreground/85 transition-colors group-hover:text-foreground"
      />
      <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground/70">
        {name}
      </span>
    </button>
  );
}
