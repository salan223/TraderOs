import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full flex-col items-start justify-center gap-2 py-2", className)}>
      {Icon && (
        <span className="grid size-8 place-items-center rounded-lg border border-line bg-surface text-fg-subtle">
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
      )}
      <p className="text-sm font-medium text-fg">{title}</p>
      {children && <div className="max-w-prose text-xs leading-relaxed text-fg-muted">{children}</div>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
