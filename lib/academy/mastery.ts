import { assessmentState, type AssessmentState } from "./assessment";
import {
  dayKey,
  getAssessmentProgress,
  getLessonProgress,
  lessonStatus,
  type Clock,
  type LessonRef,
  type LessonStatus,
  type ProgressState,
  type RecommendationReason,
} from "./progress";
import type { TrackAssessment } from "./types";

/**
 * Track-level progress: what is complete, what is unlocked, and what to do next.
 *
 * ── Five things are tracked separately ─────────────────────────────────────
 *   Lesson completion    sections read + exercise solved + lesson quiz ≥ 80%
 *   Quiz completion      lesson quizzes passed (≥ 80%)
 *   Track mastery        the track assessment passed; mastery score = best passing %
 *   Practical competency every lesson's interactive exercise solved correctly AND
 *                        the assessment's applied scenario passed
 *   Overall progress     (lessons complete + assessments passed) ÷
 *                        (written lessons + written tracks' assessments)
 *   Practical write-ups (reflections) are counted and shown, but they cannot be
 *   marked right or wrong, so they are encouraged rather than required.
 *
 * ── A track is COMPLETE when ───────────────────────────────────────────────
 *   it is unlocked, every lesson is complete, practical competency is shown and
 *   the track assessment is passed (see lib/academy/assessment.ts: ≥ 90%, every
 *   safety-critical question right, every critical concept right, the applied
 *   scenario right, and remediation done before any retest). Opening or
 *   clicking through lessons never completes a track.
 *
 * ── Unlocking ──────────────────────────────────────────────────────────────
 *   Each track lists prerequisite tracks (a DAG, checked by tests). A track is
 *   unlocked when every prerequisite is complete. Locked tracks can be read in
 *   Preview mode, which records nothing and disables the assessment.
 */

export type TrackDef = {
  id: string;
  title: string;
  order: number;
  status: "written" | "planned";
  prerequisites: readonly string[];
  lessons: readonly LessonRef[];
  assessment: TrackAssessment | null;
};

export type TrackProgress = {
  id: string;
  written: boolean;
  unlocked: boolean;
  /** Prerequisite tracks that are not complete yet. */
  missing: string[];
  lessonsTotal: number;
  lessonsComplete: number;
  allLessonsComplete: boolean;
  quizzesPassed: number;
  exercisesSolved: number;
  /** Lessons with a saved practical reflection. */
  practicalsWritten: number;
  /** null when the track has no assessment yet (planned tracks). */
  assessment: AssessmentState | null;
  /** The assessment can be taken now: unlocked and every lesson complete. */
  assessmentAvailable: boolean;
  practicalCompetency: boolean;
  complete: boolean;
  statuses: LessonStatus[];
};

/** Order tracks so that every prerequisite comes first. Throws on a cycle or an unknown id. */
export function topoOrder(defs: readonly Pick<TrackDef, "id" | "prerequisites">[]): string[] {
  const byId = new Map(defs.map((d) => [d.id, d]));
  const out: string[] = [];
  const state = new Map<string, 1 | 2>();
  const visit = (id: string, path: string[]) => {
    const d = byId.get(id);
    if (!d) throw new Error(`unknown prerequisite track "${id}" (from ${path.join(" → ")})`);
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) throw new Error(`prerequisite cycle: ${[...path, id].join(" → ")}`);
    state.set(id, 1);
    for (const p of d.prerequisites) visit(p, [...path, id]);
    state.set(id, 2);
    out.push(id);
  };
  for (const d of defs) visit(d.id, []);
  return out;
}

export function trackProgress(defs: readonly TrackDef[], state: ProgressState, clock: Clock): Map<string, TrackProgress> {
  const byId = new Map(defs.map((d) => [d.id, d]));
  const out = new Map<string, TrackProgress>();
  for (const id of topoOrder(defs)) {
    const d = byId.get(id)!;
    const missing = d.prerequisites.filter((p) => !out.get(p)?.complete);
    const unlocked = missing.length === 0;
    const statuses = d.lessons.map((l) => lessonStatus(l, state, clock));
    const written = d.status === "written" && d.lessons.length > 0;
    const lessonsComplete = statuses.filter((s) => s.complete).length;
    const allLessonsComplete = written && lessonsComplete === d.lessons.length;
    const exercisesSolved = statuses.filter((s) => s.exerciseDone).length;
    const assessment = d.assessment ? assessmentState(getAssessmentProgress(state, d.id), clock.now, d.assessment) : null;
    const passed = !!assessment?.passed;
    const practicalCompetency = written && exercisesSolved === d.lessons.length && passed;
    out.set(id, {
      id,
      written,
      unlocked,
      missing,
      lessonsTotal: d.lessons.length,
      lessonsComplete,
      allLessonsComplete,
      quizzesPassed: statuses.filter((s) => s.passed).length,
      exercisesSolved,
      practicalsWritten: d.lessons.filter((l) => !!getLessonProgress(state, l.id)?.reflection).length,
      assessment,
      assessmentAvailable: unlocked && allLessonsComplete && !!d.assessment,
      practicalCompetency,
      complete: unlocked && allLessonsComplete && passed && practicalCompetency,
      statuses,
    });
  }
  return out;
}

/** Overall progress %: (lessons complete + assessments passed) ÷ (lessons + assessments), over written tracks. */
export function overallProgressPct(defs: readonly TrackDef[], tp: ReadonlyMap<string, TrackProgress>): number {
  let done = 0, total = 0;
  for (const d of defs) {
    const t = tp.get(d.id);
    if (!t?.written) continue;
    total += t.lessonsTotal + (d.assessment ? 1 : 0);
    done += t.lessonsComplete + (t.assessment?.passed ? 1 : 0);
  }
  return total ? Math.round((done / total) * 100) : 0;
}

// ── What to do next ────────────────────────────────────────────────────────

export type AssessmentReason = "take" | "resume" | "remediate" | "retest";

export type NextStep =
  | { kind: "lesson"; lessonId: string; trackId: string; reason: RecommendationReason }
  | { kind: "assessment"; trackId: string; reason: AssessmentReason };

export const ASSESSMENT_STEP_COPY: Record<AssessmentReason, { label: string; cta: string }> = {
  take: { label: "Every lesson complete: take the track assessment", cta: "Start assessment" },
  resume: { label: "Assessment in progress", cta: "Resume assessment" },
  remediate: { label: "Work through the concepts you missed before the retest", cta: "Continue remediation" },
  retest: { label: "Remediation done: the retest is ready, with different questions", cta: "Start retest" },
};

/**
 * The next step, respecting locks. Only UNLOCKED written tracks are considered.
 *   1. a completed lesson whose latest quiz failed (fix gaps first),
 *   2. in the first unlocked track that is not complete: its first incomplete
 *      lesson, otherwise its assessment (resume, remediate, retest or take),
 *   3. a Practising lesson that can be mastered today, then one passed today,
 *   4. null: nothing left in the unlocked, written tracks.
 */
export function recommendNextStep(defs: readonly TrackDef[], state: ProgressState, clock: Clock): NextStep | null {
  const tp = trackProgress(defs, state, clock);
  const open = [...defs].sort((a, b) => a.order - b.order).filter((d) => tp.get(d.id)?.unlocked && tp.get(d.id)?.written);
  for (const d of open) {
    const review = tp.get(d.id)!.statuses.find((s) => s.needsReview);
    if (review) return { kind: "lesson", lessonId: review.lessonId, trackId: d.id, reason: "review" };
  }
  for (const d of open) {
    const t = tp.get(d.id)!;
    if (t.complete) continue;
    const incomplete = t.statuses.find((s) => !s.complete);
    if (incomplete) {
      const reason: RecommendationReason = !incomplete.started ? "start" : incomplete.attempts > 0 && !incomplete.passed ? "retry-quiz" : "continue";
      return { kind: "lesson", lessonId: incomplete.lessonId, trackId: d.id, reason };
    }
    const a = t.assessment;
    if (a && !a.passed) {
      const reason: AssessmentReason = a.inProgress ? "resume" : a.remediationPending.length ? "remediate" : a.attempts > 0 ? "retest" : "take";
      return { kind: "assessment", trackId: d.id, reason };
    }
  }
  const today = dayKey(clock.now, clock.timeZone);
  const practising = open.flatMap((d) => tp.get(d.id)!.statuses.map((s) => ({ s, trackId: d.id }))).filter((x) => x.s.mastery === "practising");
  const due = practising.find((x) => x.s.lastPassDay !== today);
  if (due) return { kind: "lesson", lessonId: due.s.lessonId, trackId: due.trackId, reason: "consolidate" };
  if (practising.length) return { kind: "lesson", lessonId: practising[0].s.lessonId, trackId: practising[0].trackId, reason: "consolidate-later" };
  return null;
}

/**
 * The track the learner is working through: the first unlocked written track
 * (in curriculum order) that is not complete. When all unlocked written
 * tracks are complete, the last of them. Null if nothing is written.
 */
export function currentTrackId(defs: readonly TrackDef[], tp: ReadonlyMap<string, TrackProgress>): string | null {
  const open = [...defs].sort((a, b) => a.order - b.order).filter((d) => tp.get(d.id)?.written && tp.get(d.id)?.unlocked);
  if (!open.length) return null;
  return (open.find((d) => !tp.get(d.id)!.complete) ?? open[open.length - 1]).id;
}
