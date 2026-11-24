import { cn } from "@/lib/cn";

export const STAGES = [
  { id: "awareness", label: "Awareness", desc: "Know what markets are and what can go wrong." },
  { id: "learning", label: "Learning", desc: "Work through the Academy and pass quizzes." },
  { id: "analysis", label: "Analysis", desc: "Study charts and form evidence-based views." },
  { id: "practice", label: "Practice", desc: "Paper trade with a written plan and fixed risk." },
  { id: "review", label: "Review", desc: "Journal every trade and look for patterns." },
  { id: "improvement", label: "Improvement", desc: "Adjust one thing at a time, based on evidence." },
] as const;

/** The learning journey. `current` comes from saved progress (see journeyStage in lib/academy/progress.ts); -1 while loading. */
export function Progression({ current = 0 }: { current?: number }) {
  return (
    <ol className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line sm:grid-cols-6">
      {STAGES.map((s, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li key={s.id} aria-current={state === "current" ? "step" : undefined} className={cn("bg-panel px-3 py-2.5", state === "current" && "bg-raised")} title={s.desc}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "grid size-4 place-items-center rounded-full border text-[9px] tabular",
                  state === "current" ? "border-accent bg-accent text-white" : state === "done" ? "border-accent/50 text-accent-strong" : "border-line-strong text-fg-subtle",
                )}
              >
                {i + 1}
              </span>
              <span className={cn("text-xs font-medium", state === "todo" ? "text-fg-subtle" : "text-fg")}>{s.label}</span>
            </div>
            <p className="mt-1 hidden text-[11px] leading-snug text-fg-subtle lg:block">{s.desc}</p>
          </li>
        );
      })}
    </ol>
  );
}
