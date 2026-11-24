import { cn } from "@/lib/cn";
import { DATA_SOURCE_META, type DataSource } from "@/lib/data-source";

const STYLES: Record<DataSource, { box: string; dot: string }> = {
  live: { box: "text-up bg-up-soft border-up/25", dot: "bg-up animate-pulse" },
  delayed: { box: "text-warn bg-warn-soft border-warn/25", dot: "bg-warn" },
  simulated: { box: "text-accent-strong bg-accent-soft border-accent/30", dot: "bg-accent" },
  sample: { box: "text-info bg-info-soft border-info/25", dot: "bg-info" },
  computed: { box: "text-fg-muted bg-raised border-line-strong", dot: "bg-fg-muted" },
  none: { box: "text-fg-subtle bg-transparent border-line-strong border-dashed", dot: "bg-fg-subtle" },
};

/** Shows where a piece of data comes from. Required next to every data display. */
export function DataBadge({ source, className }: { source: DataSource; className?: string }) {
  const meta = DATA_SOURCE_META[source];
  const s = STYLES[source];
  return (
    <span
      title={meta.description}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] leading-4",
        s.box,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} aria-hidden />
      {meta.label}
      <span className="sr-only">: {meta.description}</span>
    </span>
  );
}
