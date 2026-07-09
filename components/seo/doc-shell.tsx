import Link from "next/link";

/** Minimal page frame for standalone content routes: a back link plus prose. */
export function DocShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="dc doc-page">
      <Link href="/" className="doc-back">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m15 18-6-6 6-6" />
        </svg>
        Iconimate
      </Link>
      <article className="doc-prose">{children}</article>
    </main>
  );
}
