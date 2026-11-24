import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="font-mono text-xs text-fg-subtle">404</p>
      <h2 className="mt-2 text-lg font-semibold">This page doesn&apos;t exist</h2>
      <p className="mt-1 text-sm text-fg-muted">Use the sidebar to find your way, or go back to the dashboard.</p>
      <div className="mt-5"><LinkButton href="/dashboard" variant="secondary">Back to dashboard</LinkButton></div>
    </div>
  );
}
