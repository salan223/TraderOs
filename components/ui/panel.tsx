import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { DataSource } from "@/lib/data-source";
import { DataBadge } from "./data-badge";

type PanelProps = {
  title: string;
  /** Short explanation of what this panel shows and why it matters. */
  hint?: string;
  source?: DataSource;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

export function Panel({ title, hint, source, action, className, bodyClassName, children }: PanelProps) {
  return (
    <section
      className={cn(
        "flex h-full min-w-0 flex-col rounded-[var(--radius-panel)] border border-line bg-panel animate-fade-in",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-[13px] font-medium text-fg [overflow-wrap:anywhere]">{title}</h2>
          {hint && <p className="mt-0.5 text-xs leading-snug text-fg-subtle">{hint}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          {source && <DataBadge source={source} />}
        </div>
      </header>
      <div className={cn("flex-1 p-4", bodyClassName)}>{children}</div>
    </section>
  );
}
