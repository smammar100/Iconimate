import { notFound } from "next/navigation";

/**
 * /capture holds recording-only stages (e.g. the video export fixture). Gate it
 * out of production deployments — available in local `next dev` and on preview
 * builds, but 404s in prod.
 */
export default function CaptureLayout({ children }: { children: React.ReactNode }) {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <>{children}</>;
}
