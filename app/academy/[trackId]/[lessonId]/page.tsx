import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight, Clock } from "lucide-react";
import { LESSONS, assessmentHref, getTrack, getTrackLesson, lessonHref, neighbours, getLesson } from "@/lib/academy/curriculum";
import { getGlossaryEntry } from "@/lib/academy/glossary";
import { Panel } from "@/components/ui/panel";
import { LessonSection } from "@/components/academy/blocks";
import { ExerciseView } from "@/components/academy/exercise";
import { Quiz } from "@/components/academy/quiz";
import { PracticalView } from "@/components/academy/practical";
import { LessonChecklist, LessonTopStatus } from "@/components/academy/lesson-parts";
import { RichText } from "@/components/academy/rich-text";
import { TrackGate } from "@/components/academy/track-gate";

type Params = { trackId: string; lessonId: string };


export function generateStaticParams(): Params[] {
  return LESSONS.map((l) => ({ trackId: l.trackId, lessonId: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { trackId, lessonId } = await params;
  const lesson = getTrackLesson(trackId, lessonId);
  return lesson ? { title: lesson.title, description: lesson.summary } : {};
}

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const { trackId, lessonId } = await params;
  const track = getTrack(trackId);
  const lesson = getTrackLesson(trackId, lessonId);
  if (!track || !lesson) notFound();

  const { prev, next } = neighbours(lesson.id);
  const recommended = lesson.next ? getLesson(lesson.next) : undefined;
  const terms = lesson.glossary.map((id) => getGlossaryEntry(id)).filter((e) => e !== undefined);
  const lastInTrack = track.lessonIds[track.lessonIds.length - 1] === lesson.id;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-fg-subtle">
        <Link href="/academy" className="hover:text-fg">Academy</Link>
        <ChevronRight className="size-3" aria-hidden />
        <Link href={`/academy/${track.id}`} className="hover:text-fg">{track.title}</Link>
        <ChevronRight className="size-3" aria-hidden />
        <span className="text-fg-muted" aria-current="page">Lesson {lesson.order}</span>
      </nav>

      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle">
          Track {track.order} · Lesson {lesson.order} of {track.lessonIds.length}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">{lesson.title}</h2>
        <p className="t-body">{lesson.summary}</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1 text-xs text-fg-subtle">
            <Clock className="size-3.5" strokeWidth={1.75} aria-hidden /> About {lesson.minutes} minutes
          </span>
          <LessonTopStatus lesson={lesson} />
        </div>
      </header>

      <TrackGate trackId={track.id}>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-5">
          <Panel title="What you will learn" hint="Learning objectives for this lesson.">
            <ul className="space-y-1.5">
              {lesson.objectives.map((o) => (
                <li key={o} className="t-body flex gap-2.5">
                  <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  {o}
                </li>
              ))}
            </ul>
          </Panel>

          <article className="space-y-8 rounded-[var(--radius-panel)] border border-line bg-panel px-4 py-5 sm:px-6" aria-label="Lesson content">
            {lesson.sections.map((s, i) => (
              <LessonSection key={s.id} lessonId={lesson.id} section={s} index={i} />
            ))}
          </article>

          <div id="exercise" className="scroll-mt-20">
            <Panel title="Interactive exercise" hint="Get every answer right to complete it. You can try as many times as you need.">
              <ExerciseView lessonId={lesson.id} exercise={lesson.exercise} />
            </Panel>
          </div>

          <div id="quiz" className="scroll-mt-20">
            <Panel title="Quiz" hint="Checks understanding. 80% or more counts toward completion and mastery.">
              <Quiz lessonId={lesson.id} questions={lesson.quiz} />
            </Panel>
          </div>

          <div id="practical" className="scroll-mt-20">
            <Panel title="Practical exercise" hint="Something to go and do or observe. No trading, no sign-ups.">
              <PracticalView lessonId={lesson.id} practical={lesson.practical} />
            </Panel>
          </div>

          <Panel title="Terms in this lesson" hint="Also in the glossary, with every other term.">
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {terms.map((t) => (
                <div key={t.id} className="min-w-0">
                  <dt className="text-[13px] font-medium">{t.term}</dt>
                  <dd className="mt-0.5 text-xs leading-relaxed text-fg-muted">{t.def}</dd>
                </div>
              ))}
            </dl>
            <Link href="/academy/glossary" className="mt-4 inline-flex items-center gap-1 text-xs text-accent-strong hover:underline">
              Open the full glossary <ArrowRight className="size-3" aria-hidden />
            </Link>
          </Panel>

          <nav aria-label="Lesson navigation" className="grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={lessonHref(prev)} className="rounded-[var(--radius-panel)] border border-line bg-panel px-4 py-3 hover:bg-raised">
                <span className="flex items-center gap-1 text-[11px] uppercase tracking-[0.06em] text-fg-subtle"><ArrowLeft className="size-3" aria-hidden />Previous</span>
                <span className="mt-1 block text-[13px] font-medium">{prev.title}</span>
              </Link>
            ) : <span className="hidden sm:block" />}
            {next ? (
              <Link href={lessonHref(next)} className="rounded-[var(--radius-panel)] border border-line bg-panel px-4 py-3 text-right hover:bg-raised">
                <span className="flex items-center justify-end gap-1 text-[11px] uppercase tracking-[0.06em] text-fg-subtle">Next<ArrowRight className="size-3" aria-hidden /></span>
                <span className="mt-1 block text-[13px] font-medium">{next.title}</span>
              </Link>
            ) : (
              <Link href={`/academy/${track.id}`} className="rounded-[var(--radius-panel)] border border-line bg-panel px-4 py-3 text-right hover:bg-raised">
                <span className="text-[11px] uppercase tracking-[0.06em] text-fg-subtle">End of written lessons</span>
                <span className="mt-1 block text-[13px] font-medium">Back to {track.title}</span>
              </Link>
            )}
          </nav>
        </div>

        <aside className="min-w-0 space-y-5 lg:sticky lg:top-20">
          <Panel title="Your progress" hint="Completion needs all three requirements.">
            <LessonChecklist lesson={lesson} />
          </Panel>
          <Panel title="Recommended next" hint={lastInTrack ? "This is the last lesson of the track." : "The next lesson in order."}>
            {lastInTrack ? (
              <Link href={assessmentHref(track.id)} className="group block" data-assessment-link>
                <span className="text-[11px] uppercase tracking-[0.06em] text-fg-subtle">Track {track.order} assessment</span>
                <span className="mt-0.5 block text-[13px] font-medium group-hover:text-accent-strong">{track.title}: track assessment</span>
                <span className="mt-1 block text-xs leading-relaxed text-fg-muted">
                  Once every lesson in this track is complete, pass the assessment (90% or more, every safety-critical question right) to complete the track and unlock the next ones.
                </span>
              </Link>
            ) : recommended ? (
              <Link href={lessonHref(recommended)} className="group block">
                <span className="text-[11px] uppercase tracking-[0.06em] text-fg-subtle">Lesson {recommended.order}</span>
                <span className="mt-0.5 block text-[13px] font-medium group-hover:text-accent-strong">{recommended.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-fg-muted"><RichText text={recommended.summary} /></span>
              </Link>
            ) : (
              <p className="text-[13px] text-fg-muted">
                This is the last written lesson. The next tracks are planned but not written yet.
              </p>
            )}
          </Panel>
        </aside>
      </div>
      </TrackGate>
    </div>
  );
}
