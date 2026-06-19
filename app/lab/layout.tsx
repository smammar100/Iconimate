import { notFound } from "next/navigation";

/**
 * /lab is an internal prototyping surface (icon animation candidates). Gate the
 * whole subtree out of production deployments — it stays available in local
 * `next dev` and on preview builds, but 404s in prod.
 */
export default function LabLayout({ children }: { children: React.ReactNode }) {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <>{children}</>;
}
