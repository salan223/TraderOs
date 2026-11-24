import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A labelled number. Pass value={null} when there is no data: it renders an em dash, never a fake number. */
export function Stat({
  label,
  value,
  sub,
  tone = "neutral",
  className,
}: {
  label: ReactNode;
  value: ReactNode | null;
  sub?: ReactNode;
  tone?: "neutral" | "up" | "down";
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="text-[11px] uppercase tracking-[0.06em] text-fg-subtle">{label}</div>
      <div
        className={cn(
          "mt-1 font-mono text-lg tabular leading-tight",
          value === null ? "text-fg-subtle" : tone === "up" ? "text-up" : tone === "down" ? "text-down" : "text-fg",
        )}
      >
        {value === null ? "—" : value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-fg-subtle">{sub}</div>}
    </div>
  );
}
