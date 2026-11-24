"use client";

import { ArrowRight, BookOpen, Flame } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { Stat } from "@/components/ui/stat";
import { Progress } from "@/components/ui/progress";
import { LinkButton } from "@/components/ui/button";
import { Term } from "@/components/ui/term";
import { TRACKS, getLesson, getTrack, lessonHref, lessonsOfTrack } from "@/lib/academy/curriculum";
import { RECOMMENDATION_COPY, summarize } from "@/lib/academy/progress";
import { ASSESSMENT_STEP_COPY } from "@/lib/academy/mastery";
import { assessmentHref } from "@/lib/academy/curriculum";
import { useAcademySummary } from "@/components/academy/overview";
import { SaveNotice } from "@/components/academy/status";
import { cn } from "@/lib/cn";

/*
  Reads your saved Academy progress (this browser, for now). Until it has
  loaded on the client, values render as "—" so the server HTML and the first
  client render match.
*/

const WRITTEN_TRACKS = TRACKS.filter((t) => t.status === "written");

/** The track the learner is working through: the first unlocked written track that is not complete. */
function useCurrentTrack() {
  const data = useAcademySummary();
  if (!data) return { data, track: WRITTEN_TRACKS[0], summary: null };
  const track = WRITTEN_TRACKS.find((t) => t.id === data.currentTrackId) ?? WRITTEN_TRACKS[0];
  return { data, track, summary: summarize(lessonsOfTrack(track.id), data.state, data.clock) };
}

export function LearningProgress() {
  const { data, track, summary } = useCurrentTrack();
  const total = track.lessonIds.length;
  return (
    <Panel title="Learning progress" hint="Mastery is measured by quizzes and exercises, not just pages read." source="computed">
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Lessons" value={summary ? `${summary.completed}/${total}` : null} sub={track.title} />
        <Stat label={<Term id="mastery">Mastery</Term>} value={summary ? `${summary.masteryPct ?? 0}%` : null} sub={data ? `This track · ${data.overall.masteryPct ?? 0}% overall` : "This track"} />
        <Stat
          label="Streak"
          value={
            data ? (
              <span className="inline-flex items-center gap-1">
                <Flame className={cn("size-4", data.streak.activeToday ? "text-warn" : "text-fg-subtle")} strokeWidth={1.75} aria-hidden />
                {data.streak.current}
              </span>
            ) : null
          }
          sub={data ? (data.streak.activeToday ? "Active today" : data.streak.current > 0 ? "Learn today to keep it" : "Days in a row") : "Days in a row"}
        />
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between gap-2 text-xs text-fg-subtle">
          <span>Track {track.order} of {TRACKS.length}</span>
          <span className="tabular">{summary ? `${summary.completed} of ${total} lessons` : " "}</span>
        </div>
        <Progress value={summary?.completed ?? 0} max={total} label={`${track.title} progress`} />
      </div>
      <SaveNotice className="mt-3" />
    </Panel>
  );
}

export function NextLesson() {
  const data = useAcademySummary();
  const lesson = data?.rec ? getLesson(data.rec.lessonId) : undefined;
  const track = lesson ? getTrack(lesson.trackId) : undefined;
  const copy = data?.rec ? RECOMMENDATION_COPY[data.rec.reason] : null;
  const allDone = data !== null && data.step === null;
  const exam = data?.step?.kind === "assessment" ? data.step : null;
  const examTrack = exam ? getTrack(exam.trackId) : undefined;

  return (
    <Panel title="Recommended next lesson" hint="Chosen from your progress and quiz results. Later, also from mistakes in your journal.">
      {allDone ? (
        <div className="flex h-full flex-col">
          <h3 className="text-base font-medium leading-snug">Every written lesson is mastered</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
            Every open track is complete. The next tracks are planned but not written yet. Retake a quiz on a new day to keep the knowledge fresh.
          </p>
          <div className="mt-auto pt-4">
            <LinkButton href="/academy" variant="secondary">Open the Academy <ArrowRight className="size-3.5" /></LinkButton>
          </div>
        </div>
      ) : exam && examTrack ? (
        <div className="flex h-full flex-col" data-next-step="assessment">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
            <BookOpen className="size-3.5" strokeWidth={1.75} />
            {examTrack.title} · Track assessment
          </div>
          <h3 className="mt-2 text-base font-medium leading-snug">{examTrack.title}: track assessment</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
            {ASSESSMENT_STEP_COPY[exam.reason].label}. Passing it (90% or more, every safety-critical question right) completes the track and unlocks the next ones.
          </p>
          <div className="mt-auto pt-4">
            <LinkButton href={assessmentHref(examTrack.id)} variant="primary">
              {ASSESSMENT_STEP_COPY[exam.reason].cta} <ArrowRight className="size-3.5" />
            </LinkButton>
          </div>
        </div>
      ) : lesson && track ? (
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
            <BookOpen className="size-3.5" strokeWidth={1.75} />
            {track.title} · Lesson {lesson.order}
          </div>
          <h3 className="mt-2 text-base font-medium leading-snug">{lesson.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{lesson.summary}</p>
          <p className="mt-1.5 min-h-4 text-xs text-fg-subtle">{copy && data?.rec?.reason !== "start" ? copy.label : " "}</p>
          <div className="mt-auto pt-4">
            <LinkButton href={lessonHref(lesson)} variant="primary">
              {copy?.cta ?? "Start lesson"} <ArrowRight className="size-3.5" />
            </LinkButton>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5" aria-busy="true" aria-label="Loading your progress">
          <div className="h-3 w-40 rounded bg-raised" />
          <div className="h-4 w-56 max-w-full rounded bg-raised" />
          <div className="h-3 w-full rounded bg-raised" />
          <div className="h-8 w-32 rounded-lg bg-raised" />
        </div>
      )}
    </Panel>
  );
}
