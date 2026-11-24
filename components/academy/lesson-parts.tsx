"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Check, Circle } from "lucide-react";
import type { Lesson } from "@/lib/academy/types";
import { getLessonProgress, lessonStatus, markSectionRead, nextStepHint, MASTERY_META } from "@/lib/academy/progress";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/cn";
import { useProgress } from "./progress-provider";
import { MasteryBadge, SaveNotice } from "./status";

const DWELL_MS = 500;

/**
 * Invisible marker at the end of a section. When it has been on screen for a
 * moment, the section counts as read.
 */
export function SectionSeen({ lessonId, sectionId }: { lessonId: string; sectionId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { ready, update } = useProgress();

  useEffect(() => {
    const el = ref.current;
    if (!ready || !el || typeof IntersectionObserver === "undefined") return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer ??= setTimeout(() => {
            update((s, now) => markSectionRead(s, lessonId, sectionId, now));
            obs.disconnect();
          }, DWELL_MS);
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: 0 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [ready, update, lessonId, sectionId]);

  return <div ref={ref} aria-hidden className="h-px" />;
}

/** Small read/unread tick next to a section heading. */
export function SectionTick({ lessonId, sectionId }: { lessonId: string; sectionId: string }) {
  const { ready, state } = useProgress();
  const read = ready && !!getLessonProgress(state, lessonId)?.sectionsRead[sectionId];
  return (
    <span
      className={cn(
        "grid size-4 shrink-0 place-items-center rounded-full border",
        read ? "border-accent bg-accent text-white" : "border-line-strong text-transparent",
      )}
      title={read ? "Section read" : "Not read yet"}
    >
      <Check className="size-2.5" strokeWidth={3} aria-hidden />
      <span className="sr-only">{read ? "Read" : "Not read yet"}</span>
    </span>
  );
}

function Item({ done, children, optional }: { done: boolean | null; children: ReactNode; optional?: boolean }) {
  return (
    <li className="flex items-start gap-2 text-[13px]">
      {done ? (
        <Check className="mt-0.5 size-3.5 shrink-0 text-up" strokeWidth={2.25} aria-hidden />
      ) : (
        <Circle className="mt-0.5 size-3.5 shrink-0 text-fg-subtle" strokeWidth={1.75} aria-hidden />
      )}
      <span className={cn(done ? "text-fg" : "text-fg-muted")}>
        {children}
        {optional && <span className="text-fg-subtle"> (optional)</span>}
        <span className="sr-only">{done ? " — done" : " — not done"}</span>
      </span>
    </li>
  );
}

/** Completion requirements and mastery for one lesson. */
export function LessonChecklist({ lesson }: { lesson: Lesson }) {
  const { ready, state, clock } = useProgress();
  const s = ready ? lessonStatus(lesson, state, clock) : null;
  const reflection = ready ? !!getLessonProgress(state, lesson.id)?.reflection : false;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-[0.06em] text-fg-subtle">Mastery</span>
        <MasteryBadge level={s?.mastery ?? null} />
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-fg-subtle">
          <span>Sections read</span>
          <span className="tabular">{s ? `${s.sectionsRead}/${s.sectionsTotal}` : "—"}</span>
        </div>
        <Progress value={s?.sectionsRead ?? 0} max={lesson.sections.length} label="Sections read" />
      </div>
      <ul className="space-y-1.5" aria-label="Completion requirements">
        <Item done={s ? s.allSectionsRead : null}>Read every section</Item>
        <Item done={s ? s.exerciseDone : null}>Solve the exercise</Item>
        <Item done={s ? s.passed : null}>
          Score 80% or more on the quiz
          {s?.bestScore != null && <span className="text-fg-subtle"> · best {s.bestScore}%</span>}
        </Item>
        <Item done={reflection} optional>Write a practical reflection</Item>
      </ul>
      <p className="text-xs leading-relaxed text-fg-muted" aria-live="polite">
        {s ? nextStepHint(s, clock) : " "}
      </p>
      {s && s.mastery !== "not-started" && (
        <p className="text-[11px] text-fg-subtle">{MASTERY_META[s.mastery].description}</p>
      )}
      <SaveNotice />
    </div>
  );
}

/** Compact progress line under the lesson title (useful on phones, where the checklist is further down). */
export function LessonTopStatus({ lesson }: { lesson: Lesson }) {
  const { ready, state, clock } = useProgress();
  const s = ready ? lessonStatus(lesson, state, clock) : null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-fg-subtle">
      <MasteryBadge level={s?.mastery ?? null} />
      <span className="tabular">{s ? `${s.sectionsRead}/${s.sectionsTotal} sections` : " "}</span>
      {s && <span>{s.exerciseDone ? "Exercise solved" : "Exercise to do"}</span>}
      {s && <span className="tabular">{s.bestScore == null ? "Quiz not taken" : `Best quiz ${s.bestScore}%`}</span>}
    </div>
  );
}
