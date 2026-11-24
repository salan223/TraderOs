"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, Flame, Lock } from "lucide-react";
import { LESSONS, TRACKS, TRACK_DEFS, assessmentHref, getLesson, getTrack, lessonHref, lessonsOfTrack } from "@/lib/academy/curriculum";
import {
  RECOMMENDATION_COPY,
  lessonStatus,
  streakFromState,
  summarize,
  type LessonStatus,
} from "@/lib/academy/progress";
import { ASSESSMENT_STEP_COPY, currentTrackId, overallProgressPct, recommendNextStep, trackProgress, type NextStep, type TrackProgress } from "@/lib/academy/mastery";
import { Panel } from "@/components/ui/panel";
import { Stat } from "@/components/ui/stat";
import { Progress } from "@/components/ui/progress";
import { LinkButton } from "@/components/ui/button";
import { Term } from "@/components/ui/term";
import { cn } from "@/lib/cn";
import { useProgress } from "./progress-provider";
import { MasteryBadge, SaveNotice } from "./status";
import { UnlockedBy } from "./track-gate";

/** Shared hook: everything the Academy and dashboard need, or null before progress loads. */
export function useAcademySummary() {
  const { ready, state, clock } = useProgress();
  if (!ready) return null;
  const overall = summarize(LESSONS, state, clock);
  const tracks = trackProgress(TRACK_DEFS, state, clock);
  const step = recommendNextStep(TRACK_DEFS, state, clock);
  const rec = step?.kind === "lesson" ? { lessonId: step.lessonId, reason: step.reason } : null;
  const streak = streakFromState(state, clock);
  const writtenTracks = TRACK_DEFS.filter((d) => tracks.get(d.id)?.written);
  return {
    overall,
    step,
    rec,
    streak,
    state,
    clock,
    tracks,
    currentTrackId: currentTrackId(TRACK_DEFS, tracks),
    overallPct: overallProgressPct(TRACK_DEFS, tracks),
    tracksComplete: writtenTracks.filter((d) => tracks.get(d.id)!.complete).length,
    tracksWritten: writtenTracks.length,
    quizzesPassed: writtenTracks.reduce((n, d) => n + tracks.get(d.id)!.quizzesPassed, 0),
  };
}

/** Recommended next step (a lesson or a track assessment), shared by the Academy page and the dashboard. */
export function NextStepCard({ step, compact }: { step: NextStep; compact?: boolean }) {
  if (step.kind === "assessment") {
    const t = getTrack(step.trackId)!;
    const copy = ASSESSMENT_STEP_COPY[step.reason];
    return (
      <div className="flex h-full flex-col" data-next-step="assessment">
        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
          <ClipboardCheck className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden /> <span className="min-w-0">{t.title} · Track assessment</span>
        </span>
        <span className={cn("mt-1.5 font-medium", compact ? "text-base leading-snug" : "text-base")}>{t.title}: track assessment</span>
        <span className="mt-1 text-[13px] text-fg-muted">{copy.label}. Passing it (90% or more, every safety-critical question right) completes the track and unlocks the next ones.</span>
        <div className="mt-auto pt-3">
          <LinkButton href={assessmentHref(t.id)} variant="primary">{copy.cta} <ArrowRight className="size-3.5" aria-hidden /></LinkButton>
        </div>
      </div>
    );
  }
  const l = getLesson(step.lessonId)!;
  return (
    <div className="flex h-full flex-col" data-next-step="lesson">
      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
        <BookOpen className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden /> <span className="min-w-0">{getTrack(l.trackId)?.title} · Lesson {l.order} · {RECOMMENDATION_COPY[step.reason].label}</span>
      </span>
      <span className="mt-1.5 text-base font-medium">{l.title}</span>
      <span className="mt-1 text-[13px] text-fg-muted">{l.summary}</span>
      <div className="mt-auto pt-3">
        <LinkButton href={lessonHref(l)} variant="primary">
          {RECOMMENDATION_COPY[step.reason].cta} <ArrowRight className="size-3.5" aria-hidden />
        </LinkButton>
      </div>
    </div>
  );
}

export function AcademySummary() {
  const data = useAcademySummary();
  const allDone = data !== null && data.step === null;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Panel title="Your progress" hint="Across every written lesson." source="computed">
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Completed" value={data ? `${data.overall.completed}/${data.overall.total}` : null} sub="Lessons" />
          <Stat label={<Term id="mastery">Mastery</Term>} value={data ? `${data.overall.masteryPct ?? 0}%` : null} sub={data ? `${data.overall.mastered} mastered` : " "} />
          <Stat
            label="Streak"
            value={data ? <span className="inline-flex items-center gap-1"><Flame className={cn("size-4", data.streak.activeToday ? "text-warn" : "text-fg-subtle")} strokeWidth={1.75} aria-hidden />{data.streak.current}</span> : null}
            sub={data ? (data.streak.activeToday ? "Active today" : data.streak.current ? "Learn today to keep it" : "Days in a row") : " "}
          />
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-line pt-3 text-xs" aria-label="More progress">
          <div><dt className="text-fg-subtle">Quizzes passed</dt><dd className="mt-0.5 font-mono tabular text-fg">{data ? `${data.quizzesPassed}/${data.overall.total}` : "—"}</dd></div>
          <div><dt className="text-fg-subtle">Tracks complete</dt><dd className="mt-0.5 font-mono tabular text-fg" data-tracks-complete>{data ? `${data.tracksComplete}/${data.tracksWritten}` : "—"}</dd></div>
          <div><dt className="text-fg-subtle">Overall</dt><dd className="mt-0.5 font-mono tabular text-fg" data-overall-pct>{data ? `${data.overallPct}%` : "—"}</dd></div>
        </dl>
        <SaveNotice className="mt-4" />
      </Panel>
      <Panel title="Recommended next" hint="Chosen from your progress and quiz results.">
        {!data ? (
          <div className="h-24" aria-hidden />
        ) : allDone ? (
          <p className="text-[13px] leading-relaxed text-fg-muted">
            Every written lesson is mastered and every open track is complete. More tracks are planned; until then, retaking quizzes on different days keeps the knowledge fresh.
          </p>
        ) : data.step ? (
          <NextStepCard step={data.step} />
        ) : null}
      </Panel>
    </div>
  );
}

export function TrackList() {
  const data = useAcademySummary();
  const currentTrackId = data?.currentTrackId ?? undefined;
  return (
    <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {TRACKS.map((t) => {
        const written = t.status === "written";
        const s = data && written ? summarize(lessonsOfTrack(t.id), data.state, data.clock) : null;
        const tp = data?.tracks.get(t.id);
        const current = data !== null && t.id === currentTrackId;
        const locked = !!tp && !tp.unlocked;
        return (
          <li key={t.id} className="min-w-0">
            <Link
              href={`/academy/${t.id}`}
              aria-current={current ? "step" : undefined}
              className={cn(
                "flex h-full flex-col rounded-[var(--radius-panel)] border bg-panel px-4 py-3.5 transition-colors hover:bg-raised",
                current ? "border-accent/50" : "border-line",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] tabular text-fg-subtle">Track {t.order}</span>
                {written ? (
                  current ? <span className="rounded-full border border-accent/40 bg-accent-soft px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] text-accent-strong">Current</span>
                  : tp?.complete ? <span className="inline-flex items-center gap-1 rounded-full border border-up/30 bg-up-soft px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] text-up"><CheckCircle2 className="size-2.5" aria-hidden />Complete</span>
                  : locked ? <span className="inline-flex items-center gap-1 rounded-full border border-line-strong px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] text-fg-subtle" data-locked-badge><Lock className="size-2.5" aria-hidden />Locked</span>
                  : null
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-line-strong px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] text-fg-subtle">
                    <Lock className="size-2.5" aria-hidden /> Not written yet
                  </span>
                )}
              </div>
              <span className="mt-1.5 text-sm font-medium">{t.title}</span>
              <span className="mt-1 text-xs leading-relaxed text-fg-muted">{t.summary}</span>
              <div className="mt-auto pt-3">
                {written ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-fg-subtle">
                      <span className="tabular">{s ? `${s.completed}/${s.total} lessons` : `${t.lessonIds.length} lessons`}</span>
                      <span className="tabular">{s ? `Mastery ${s.masteryPct ?? 0}%` : " "}</span>
                    </div>
                    <Progress value={s?.completed ?? 0} max={t.lessonIds.length} label={`${t.title} lessons completed`} />
                    <p className="text-[11px] text-fg-subtle">
                      {locked ? <>Unlocks after {tp!.missing.map((m) => getTrack(m)?.title).join(" and ")}</> : <AssessmentLine tp={tp} />}
                    </p>
                  </div>
                ) : (
                  <span className="text-[11px] text-fg-subtle">
                    {t.planned.length} lessons planned{t.prerequisites.length > 0 && <> · Needs {t.prerequisites.map((m) => getTrack(m)?.title).join(" and ")}</>}
                  </span>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function AssessmentLine({ tp }: { tp: TrackProgress | undefined }) {
  const a = tp?.assessment;
  if (!tp || !a) return <>{" "}</>;
  if (a.passed) return <>Assessment passed · mastery score {a.masteryScore}%</>;
  if (a.inProgress) return <>Assessment in progress</>;
  if (a.remediationPending.length) return <>Assessment: remediation to finish</>;
  if (a.attempts) return <>Assessment: retest ready</>;
  return <>{tp.allLessonsComplete ? "Assessment ready to take" : "Assessment opens when every lesson is complete"}</>;
}

/** The track's five tracked measures, lock state and assessment entry point (track page). */
export function TrackStatusPanel({ trackId }: { trackId: string }) {
  const data = useAcademySummary();
  const t = getTrack(trackId)!;
  const tp = data?.tracks.get(trackId);
  const a = tp?.assessment;
  const label = !tp || !a ? "Track assessment" : a.passed ? "Review assessment" : a.inProgress ? "Resume assessment" : a.remediationPending.length ? "Continue remediation" : a.attempts ? "Start retest" : "Track assessment";
  return (
    <div className="space-y-3" data-track-status>
      {tp && !tp.unlocked && (
        <div className="rounded-[var(--radius-panel)] border border-line-strong bg-raised px-4 py-3 text-[13px]" role="note" data-track-locked>
          <p className="flex items-center gap-1.5 font-medium"><Lock className="size-3.5" aria-hidden /> Locked</p>
          <p className="mt-1 text-fg-muted">
            Unlocks after you complete <UnlockedBy missing={tp.missing} /> (every lesson and the track assessment). You can open any lesson below in Preview mode: you can read and try everything, but nothing is saved or counted.
          </p>
        </div>
      )}
      <dl className="grid grid-cols-2 gap-3 rounded-[var(--radius-panel)] border border-line bg-panel px-4 py-3 text-xs sm:grid-cols-5">
        <Measure label="Lessons complete" value={tp ? `${tp.lessonsComplete}/${tp.lessonsTotal}` : "—"} />
        <Measure label="Lesson quizzes passed" value={tp ? `${tp.quizzesPassed}/${tp.lessonsTotal}` : "—"} />
        <Measure label="Practical competency" value={tp ? (tp.practicalCompetency ? "Shown" : `${tp.exercisesSolved}/${tp.lessonsTotal} exercises`) : "—"} sub={tp && !tp.practicalCompetency ? "+ applied scenario" : undefined} />
        <Measure label="Track mastery" value={!a ? "—" : a.passed ? `${a.masteryScore}%` : a.attempts ? "Not passed" : "Not taken"} sub="Assessment score" />
        <Measure label="Practical write-ups" value={tp ? `${tp.practicalsWritten}/${tp.lessonsTotal}` : "—"} sub="Optional" />
      </dl>
      <div className="flex flex-wrap items-center gap-3">
        {tp?.unlocked ? (
          <LinkButton href={assessmentHref(trackId)} variant={tp.assessmentAvailable && !a?.passed ? "primary" : "secondary"}>
            <ClipboardCheck className="size-3.5" aria-hidden /> {label}
          </LinkButton>
        ) : null}
        <span className="text-xs text-fg-subtle">
          {!tp ? " " : tp.complete ? `${t.title} is complete.` : !tp.unlocked ? "The assessment is disabled while the track is locked." : tp.assessmentAvailable ? "Every lesson is complete: the track assessment is open." : "The track assessment opens once every lesson is complete."}
        </span>
      </div>
    </div>
  );
}

function Measure({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-fg-subtle">{label}</dt>
      <dd className="mt-0.5 font-mono text-sm tabular text-fg">{value}</dd>
      {sub && <dd className="text-[10px] text-fg-subtle">{sub}</dd>}
    </div>
  );
}

export function TrackLessons({ trackId }: { trackId: string }) {
  const { ready, state, clock } = useProgress();
  const lessons = lessonsOfTrack(trackId);
  const statuses: (LessonStatus | null)[] = lessons.map((l) => (ready ? lessonStatus(l, state, clock) : null));
  const step = ready ? recommendNextStep(TRACK_DEFS, state, clock) : null;
  const rec = step?.kind === "lesson" ? step : null;
  const sum = ready ? summarize(lessons, state, clock) : null;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-fg-subtle">
          <span className="tabular">{sum ? `${sum.completed} of ${sum.total} lessons complete` : " "}</span>
          <span className="tabular">{sum ? `Mastery ${sum.masteryPct ?? 0}%` : " "}</span>
        </div>
        <Progress value={sum?.completed ?? 0} max={lessons.length} label="Track lessons completed" />
      </div>
      <ol className="divide-y divide-line overflow-hidden rounded-[var(--radius-panel)] border border-line bg-panel">
        {lessons.map((l, i) => {
          const s = statuses[i];
          const prevIncomplete = i > 0 && statuses[i - 1] !== null && !statuses[i - 1]!.complete;
          const isRec = rec?.lessonId === l.id;
          return (
            <li key={l.id}>
              <Link href={lessonHref(l)} className={cn("flex items-start gap-3 px-4 py-3 hover:bg-raised", isRec && "bg-raised/60")}>
                <span
                  className={cn(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border font-mono text-[11px] tabular",
                    s?.complete ? "border-accent bg-accent text-white" : isRec ? "border-accent text-accent-strong" : "border-line-strong text-fg-subtle",
                  )}
                >
                  {l.order}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-medium">{l.title}</span>
                    {isRec && <span className="rounded-full border border-accent/40 bg-accent-soft px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] text-accent-strong">Recommended</span>}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-fg-muted">{l.summary}</span>
                  <span className="mt-1 block text-[11px] text-fg-subtle tabular">
                    {l.minutes} min
                    {s && s.bestScore !== null && ` · best quiz ${s.bestScore}%`}
                    {s && s.started && !s.complete && ` · ${s.sectionsRead}/${s.sectionsTotal} sections`}
                    {prevIncomplete && !s?.started && ` · best after lesson ${lessons[i - 1].order}`}
                  </span>
                </span>
                <MasteryBadge level={s?.mastery ?? null} className="mt-0.5" />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
