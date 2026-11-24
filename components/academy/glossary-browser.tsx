"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { GLOSSARY_LIST } from "@/lib/academy/glossary";
import { TERM_INTRODUCED_IN, lessonHref } from "@/lib/academy/curriculum";
import { lessonStatus } from "@/lib/academy/progress";
import { cn } from "@/lib/cn";
import { useProgress } from "./progress-provider";

type Filter = "all" | "learned" | "not-learned";

const normalise = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

export function GlossaryBrowser() {
  const { ready, state, clock } = useProgress();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const learned = useMemo(() => {
    const set = new Set<string>();
    if (!ready) return set;
    for (const [termId, lesson] of TERM_INTRODUCED_IN) if (lessonStatus(lesson, state, clock).complete) set.add(termId);
    return set;
  }, [ready, state, clock]);

  const q = normalise(query.trim());
  const shown = GLOSSARY_LIST.filter((e) => {
    if (filter === "learned" && !learned.has(e.id)) return false;
    if (filter === "not-learned" && learned.has(e.id)) return false;
    return !q || normalise(e.term).includes(q) || normalise(e.def).includes(q);
  });

  const groups = new Map<string, typeof shown>();
  for (const e of shown) {
    const letter = /[a-z]/i.test(e.term[0]) ? e.term[0].toUpperCase() : "#";
    groups.set(letter, [...(groups.get(letter) ?? []), e]);
  }
  const letters = [...groups.keys()];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Search the glossary</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms and definitions"
            className="h-9 w-full rounded-lg border border-line-strong bg-surface pl-8 pr-3 text-[13px] text-fg placeholder:text-fg-subtle"
          />
        </label>
        <div role="group" aria-label="Filter terms" className="flex shrink-0 gap-1 rounded-lg border border-line bg-surface p-0.5">
          {(["all", "learned", "not-learned"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn("h-7 rounded-md px-2.5 text-xs", filter === f ? "bg-raised text-fg" : "text-fg-subtle hover:text-fg")}
            >
              {f === "all" ? "All" : f === "learned" ? `Learned${ready ? ` (${learned.size})` : ""}` : "Not yet"}
            </button>
          ))}
        </div>
      </div>

      {letters.length > 1 && (
        <nav aria-label="Jump to letter" className="flex flex-wrap gap-1">
          {letters.map((l) => (
            <a key={l} href={`#letter-${l}`} className="grid size-7 place-items-center rounded-md border border-line font-mono text-xs text-fg-muted hover:bg-raised hover:text-fg">
              {l}
            </a>
          ))}
        </nav>
      )}

      <p className="text-xs text-fg-subtle" aria-live="polite">
        {shown.length} term{shown.length === 1 ? "" : "s"}{q ? ` matching "${query.trim()}"` : ""}
      </p>

      {shown.length === 0 ? (
        <p className="rounded-[var(--radius-panel)] border border-line bg-panel px-4 py-6 text-center text-[13px] text-fg-muted">
          No terms match. Try a shorter search.
        </p>
      ) : (
        <div className="space-y-5">
          {letters.map((l) => (
            <section key={l} id={`letter-${l}`} aria-labelledby={`letter-${l}-h`} className="scroll-mt-20">
              <h3 id={`letter-${l}-h`} className="mb-2 font-mono text-xs text-fg-subtle">{l}</h3>
              <dl className="divide-y divide-line overflow-hidden rounded-[var(--radius-panel)] border border-line bg-panel">
                {groups.get(l)!.map((e) => {
                  const lesson = TERM_INTRODUCED_IN.get(e.id);
                  const isLearned = learned.has(e.id);
                  return (
                    <div key={e.id} id={`term-${e.id}`} className="px-4 py-3">
                      <dt className="flex flex-wrap items-center gap-2 text-[13px] font-medium">
                        {e.term}
                        {isLearned && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-up/30 bg-up-soft px-1.5 py-px text-[10px] uppercase tracking-[0.06em] text-up">
                            <Check className="size-2.5" strokeWidth={3} aria-hidden /> Learned
                          </span>
                        )}
                      </dt>
                      <dd className="mt-1 text-xs leading-relaxed text-fg-muted">{e.def}</dd>
                      <dd className="mt-1 text-[11px] text-fg-subtle">
                        {lesson ? (
                          <>Introduced in <Link href={lessonHref(lesson)} className="text-accent-strong hover:underline">Lesson {lesson.order}: {lesson.title}</Link></>
                        ) : (
                          "Used across the app (dashboard and practice tools)."
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
