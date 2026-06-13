export type ClassValue = string | number | false | null | undefined;

/** Minimal, dependency-free className combiner. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
