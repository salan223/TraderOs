/**
 * Academy progress and mastery engine.
 *
 * Everything here is a PURE function: no storage, no React, no global clock.
 * Callers pass `now` (and optionally a time zone) explicitly, which keeps the
 * rules easy to test and identical on every device.
 *
 * ── Rules ──────────────────────────────────────────────────────────────────
 * Quiz pass mark: 80% (PASS_MARK). With 5 questions that is 4 correct; with
 * 6 questions, 5 correct; with 4 questions, all 4.
 *
 * A lesson is COMPLETE when all three are true:
 *   1. every section has been read (scrolled to its end),
 *   2. the interactive exercise has been solved correctly,
 *   3. the best quiz score is at least 80%.
 * The practical exercise and reflection are encouraged but optional.
 *
 * Mastery level per lesson:
 *   Not started  nothing recorded for the lesson yet.
 *   Learning     started, but not complete.
 *   Practising   complete, but not yet mastered.
 *   Mastered     complete, AND passed the quiz (≥80%) on at least two
 *                different calendar days (your local time), AND the most
 *                recent attempt was a pass. Recall on a later day is what
 *                shows the knowledge has stuck. If a later attempt fails,
 *                the lesson drops back to Practising and is flagged for review.
 *
 * Mastery % (track or overall) is the average over written lessons, where
 * Not started and Learning count 0, Practising counts 50% and Mastered 100%.
 * Reading pages alone never raises mastery.
 *
 * Learning streak: consecutive local calendar days with any Academy activity
 * (reading a section, solving an exercise, taking a quiz, saving a
 * reflection). Several activities on one day count once. The streak stays
 * alive until the end of the day after your last active day. Timestamps more
 * than 5 minutes in the future (a wrong clock or corrupt data) are ignored
 * for streaks, scores, completion and mastery (they stay in storage).
 *
 * Track assessments (added in Phase 2, step 1) are stored under the optional
 * `assessments` field, keyed by track id. Like `resetAt` before it, the field
 * is additive: stored version-1 data without it is read unchanged, so earlier
 * lesson progress still shows. The track-level rules (90% pass mark,
 * safety-critical questions, remediation before a retest, unlocking) live in
 * lib/academy/mastery.ts; this file only stores and merges the records.
 * Attempts are kept in RECORDED order: each has a sequence number (`seq`),
 * assigned on submit as the highest so far + 1, and loading and merging sort
 * by it, never by date (older data is numbered in stored order). At most 30
 * attempts are kept per track (the latest ones), but the best passing attempt
 * (one dated no more than 24 h ahead) is always kept, so practice retakes can
 * never lose a pass.
 */

import { PASS_FUTURE_GRACE_MS, attemptKey, orderAttempts, scoreAttempt } from "./assessment";

export const PROGRESS_SCHEMA_VERSION = 1 as const;
export const PASS_MARK = 0.8;
export const MAX_ATTEMPTS_PER_LESSON = 50;
export const MAX_REFLECTION_LENGTH = 4000;
export const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;
export const MASTERY_DAYS_REQUIRED = 2;
export const MAX_ASSESSMENT_ATTEMPTS = 30;
export const MAX_ASSESSMENT_ITEMS = 40;

// ── Types ──────────────────────────────────────────────────────────────────

export type QuizAttempt = { at: string; correct: number; total: number };

export type LessonProgress = {
  /** sectionId → ISO time it was first read. */
  sectionsRead: Record<string, string>;
  exerciseCompletedAt: string | null;
  /** Oldest first. */
  quizAttempts: QuizAttempt[];
  reflection: { text: string; updatedAt: string } | null;
  /**
   * When the reflection was last deliberately cleared (a tombstone), so a merge with
   * an older copy that still has the text does not bring it back. Absent in old data.
   */
  reflectionClearedAt?: string | null;
};

/** One answered question in a submitted assessment. Flags are copied from the bank at submit time. */
export type AssessmentItemResult = {
  /** Question id. */
  q: string;
  /** Concept id. */
  c: string;
  ok: boolean;
  /** The concept is safety-critical. */
  safety?: boolean;
  /** The concept is critical (must be right to pass). */
  critical?: boolean;
  /** The question is the applied scenario. */
  applied?: boolean;
};

/** Stored answer to one question (string, boolean, number or list of option ids). */
export type StoredAnswer = string | boolean | number | string[];

export type AssessmentAttempt = {
  at: string;
  /**
   * Recording order: 1 for the first attempt, then the highest so far + 1 on each submit.
   * Attempts are ordered by this, never by date, so a device clock moved back cannot make an
   * older attempt look like the latest. Older data without it is numbered in stored order on load.
   */
  seq?: number;
  items: AssessmentItemResult[];
  /** The answers given, kept for the error analysis. Absent if they could not be read. */
  answers?: Record<string, StoredAnswer>;
};

/** An assessment in progress, kept so a refresh resumes it with the same questions. */
export type AssessmentDraft = {
  startedAt: string;
  questionIds: string[];
  answers: Record<string, StoredAnswer>;
  /** Concepts whose question pool had run out, so a question was reused (with the options reshuffled). */
  reusedConcepts: string[];
};

export type TrackAssessmentProgress = {
  /** Oldest first. */
  attempts: AssessmentAttempt[];
  /** conceptId → when its remediation was last finished (practice question answered correctly). */
  remediation: Record<string, string>;
  /**
   * conceptId → the `at` of the attempt that remediation was done for. Gating uses this
   * order (remediation recorded after THAT attempt), not a wall-clock comparison, so a clock
   * moved backwards cannot lock the retest. Absent in older data (then the times are compared).
   */
  remediationFor?: Record<string, string>;
  /** conceptId → the `seq` of the attempt that remediation was done for (with remediationFor). Absent in older data. */
  remediationForSeq?: Record<string, number>;
  /** This learner's random seed for drawing questions, set on the first start (so first attempts differ between learners). */
  seed?: string;
  draft: AssessmentDraft | null;
  /** When a draft was last submitted or discarded (a tombstone, so a merge cannot bring it back). */
  draftClearedAt?: string | null;
};

export type ProgressState = {
  version: typeof PROGRESS_SCHEMA_VERSION;
  lessons: Record<string, LessonProgress>;
  updatedAt: string | null;
  /** Track assessments, keyed by track id. Absent in older data. */
  assessments?: Record<string, TrackAssessmentProgress>;
  /**
   * When progress was last reset (a tombstone for everything before it). Anything
   * recorded at or before this time is discarded when merging. Absent in old data.
   */
  resetAt?: string | null;
};

/** The minimum a lesson needs for progress maths (real lessons satisfy it). */
export type LessonRef = { id: string; sections: readonly { id: string }[] };

export type Clock = { now: Date; timeZone?: string };

export type MasteryLevel = "not-started" | "learning" | "practising" | "mastered";

export const MASTERY_LEVELS: readonly MasteryLevel[] = ["not-started", "learning", "practising", "mastered"];

export const MASTERY_META: Record<MasteryLevel, { label: string; value: number; description: string }> = {
  "not-started": { label: "Not started", value: 0, description: "Nothing recorded for this lesson yet." },
  learning: { label: "Learning", value: 0, description: "Started, but the sections, exercise and a passing quiz are not all done." },
  practising: { label: "Practising", value: 0.5, description: "Lesson complete. Pass the quiz again on another day to show it has stuck." },
  mastered: { label: "Mastered", value: 1, description: "Passed on at least two different days, and your latest attempt passed." },
};

// ── Small helpers ──────────────────────────────────────────────────────────

const has = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const ID_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;

export function isValidIsoTime(v: unknown): v is string {
  return typeof v === "string" && v.length <= 40 && Number.isFinite(Date.parse(v));
}

export function isPass(correct: number, total: number) {
  // Integer comparison avoids floating point surprises (4/5 must equal 80%).
  return total > 0 && correct * 100 >= total * Math.round(PASS_MARK * 100);
}

export function scorePct(a: Pick<QuizAttempt, "correct" | "total">) {
  return a.total > 0 ? Math.round((a.correct / a.total) * 100) : 0;
}

const notFuture = (iso: string, now: Date) => Date.parse(iso) <= now.getTime() + FUTURE_TOLERANCE_MS;

export function emptyProgress(): ProgressState {
  return { version: PROGRESS_SCHEMA_VERSION, lessons: {}, updatedAt: null };
}

export function emptyLessonProgress(): LessonProgress {
  return { sectionsRead: {}, exerciseCompletedAt: null, quizAttempts: [], reflection: null };
}

export function getLessonProgress(state: ProgressState, lessonId: string): LessonProgress | undefined {
  return has(state.lessons, lessonId) ? state.lessons[lessonId] : undefined;
}

// ── Calendar days ──────────────────────────────────────────────────────────

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string | undefined): Intl.DateTimeFormat {
  const key = timeZone ?? "";
  let f = formatters.get(key);
  if (!f) {
    try {
      f = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
    } catch {
      // Unknown time zone: fall back to the device's own.
      f = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
    }
    formatters.set(key, f);
  }
  return f;
}

/** Local calendar day for an instant, as "YYYY-MM-DD", in `timeZone` (default: device zone). */
export function dayKey(instant: Date | number | string, timeZone?: string): string {
  const d = new Date(instant);
  const p: Record<string, string> = {};
  for (const { type, value } of formatterFor(timeZone).formatToParts(d)) p[type] = value;
  return `${p.year}-${p.month}-${p.day}`;
}

/** Whole days since 1970-01-01 for a "YYYY-MM-DD" key. Calendar maths, so DST cannot skew it. */
export function dayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

// ── Validation and repair ──────────────────────────────────────────────────

export type ParseResult = {
  state: ProgressState;
  /** True when anything had to be dropped or fixed. */
  repaired: boolean;
  issues: string[];
};

function sanitizeLesson(raw: unknown, issues: string[], id: string): LessonProgress | null {
  if (!isObj(raw)) {
    issues.push(`lesson ${id}: not an object`);
    return null;
  }
  const out = emptyLessonProgress();

  if (isObj(raw.sectionsRead)) {
    for (const [k, v] of Object.entries(raw.sectionsRead)) {
      if (ID_RE.test(k) && isValidIsoTime(v)) out.sectionsRead[k] = v;
      else issues.push(`lesson ${id}: dropped section entry`);
    }
  } else if (raw.sectionsRead !== undefined) issues.push(`lesson ${id}: sectionsRead invalid`);

  if (isValidIsoTime(raw.exerciseCompletedAt)) out.exerciseCompletedAt = raw.exerciseCompletedAt;
  else if (raw.exerciseCompletedAt != null) issues.push(`lesson ${id}: exerciseCompletedAt invalid`);

  if (Array.isArray(raw.quizAttempts)) {
    for (const a of raw.quizAttempts) {
      if (
        isObj(a) &&
        isValidIsoTime(a.at) &&
        Number.isInteger(a.correct) &&
        Number.isInteger(a.total) &&
        (a.total as number) > 0 &&
        (a.total as number) <= 100 &&
        (a.correct as number) >= 0 &&
        (a.correct as number) <= (a.total as number)
      ) {
        out.quizAttempts.push({ at: a.at, correct: a.correct as number, total: a.total as number });
      } else issues.push(`lesson ${id}: dropped quiz attempt`);
    }
    out.quizAttempts.sort((x, y) => Date.parse(x.at) - Date.parse(y.at));
    if (out.quizAttempts.length > MAX_ATTEMPTS_PER_LESSON) {
      out.quizAttempts = out.quizAttempts.slice(-MAX_ATTEMPTS_PER_LESSON);
      issues.push(`lesson ${id}: trimmed old quiz attempts`);
    }
  } else if (raw.quizAttempts !== undefined) issues.push(`lesson ${id}: quizAttempts invalid`);

  if (isObj(raw.reflection) && typeof raw.reflection.text === "string" && isValidIsoTime(raw.reflection.updatedAt)) {
    const text = raw.reflection.text.slice(0, MAX_REFLECTION_LENGTH);
    if (text !== raw.reflection.text) issues.push(`lesson ${id}: reflection trimmed`);
    if (text.trim()) out.reflection = { text, updatedAt: raw.reflection.updatedAt };
  } else if (raw.reflection != null) issues.push(`lesson ${id}: reflection invalid`);

  if (isValidIsoTime(raw.reflectionClearedAt)) out.reflectionClearedAt = raw.reflectionClearedAt;
  else if (raw.reflectionClearedAt != null) issues.push(`lesson ${id}: reflectionClearedAt invalid`);

  return out;
}

const SEED_RE = /^[a-z0-9]{4,32}$/i;

function emptyAssessmentProgress(): TrackAssessmentProgress {
  return { attempts: [], remediation: {}, draft: null };
}

function isStoredAnswer(v: unknown): v is StoredAnswer {
  if (typeof v === "string") return v.length <= 80;
  if (typeof v === "boolean") return true;
  if (typeof v === "number") return Number.isFinite(v) && Math.abs(v) < 1e12;
  return Array.isArray(v) && v.length <= 20 && v.every((x) => typeof x === "string" && x.length <= 80);
}

function sanitizeAssessment(raw: unknown, issues: string[], id: string): TrackAssessmentProgress | null {
  if (!isObj(raw)) {
    issues.push(`assessment ${id}: not an object`);
    return null;
  }
  const out = emptyAssessmentProgress();
  if (Array.isArray(raw.attempts)) {
    for (const a of raw.attempts) {
      if (!isObj(a) || !isValidIsoTime(a.at) || !Array.isArray(a.items) || a.items.length === 0 || a.items.length > MAX_ASSESSMENT_ITEMS) {
        issues.push(`assessment ${id}: dropped an attempt`);
        continue;
      }
      const items: AssessmentItemResult[] = [];
      let bad = false;
      for (const it of a.items) {
        if (!isObj(it) || typeof it.q !== "string" || !ID_RE.test(it.q) || typeof it.c !== "string" || !ID_RE.test(it.c) || typeof it.ok !== "boolean") {
          bad = true;
          break;
        }
        const r: AssessmentItemResult = { q: it.q, c: it.c, ok: it.ok };
        if (it.safety === true) r.safety = true;
        if (it.critical === true) r.critical = true;
        if (it.applied === true) r.applied = true;
        items.push(r);
      }
      if (bad) {
        issues.push(`assessment ${id}: dropped an attempt with invalid answers`);
        continue;
      }
      const attempt: AssessmentAttempt = { at: a.at, items };
      if (typeof a.seq === "number" && Number.isSafeInteger(a.seq) && a.seq > 0 && a.seq <= 1e9) attempt.seq = a.seq;
      else if (a.seq !== undefined) issues.push(`assessment ${id}: dropped an invalid attempt seq`);
      if (isObj(a.answers)) {
        const qs = new Set(items.map((i) => i.q));
        const answers: Record<string, StoredAnswer> = {};
        for (const [k, v] of Object.entries(a.answers)) if (qs.has(k) && isStoredAnswer(v)) answers[k] = v;
        attempt.answers = answers;
      }
      out.attempts.push(attempt);
    }
    // Recorded order (seq; stored order for older data), never by date. capAttempts orders and trims.
    out.attempts = capAttempts(out.attempts);
  } else if (raw.attempts !== undefined) issues.push(`assessment ${id}: attempts invalid`);

  if (isObj(raw.remediation)) {
    for (const [k, v] of Object.entries(raw.remediation)) {
      if (ID_RE.test(k) && isValidIsoTime(v)) out.remediation[k] = v;
      else issues.push(`assessment ${id}: dropped a remediation entry`);
    }
  } else if (raw.remediation !== undefined) issues.push(`assessment ${id}: remediation invalid`);

  if (isObj(raw.remediationFor)) {
    const rf: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw.remediationFor)) {
      if (ID_RE.test(k) && isValidIsoTime(v) && has(out.remediation, k)) rf[k] = v;
      else issues.push(`assessment ${id}: dropped a remediationFor entry`);
    }
    if (Object.keys(rf).length) out.remediationFor = rf;
  } else if (raw.remediationFor !== undefined) issues.push(`assessment ${id}: remediationFor invalid`);
  if (isObj(raw.remediationForSeq)) {
    const rs: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw.remediationForSeq)) {
      if (ID_RE.test(k) && typeof v === "number" && Number.isSafeInteger(v) && v > 0 && out.remediationFor && has(out.remediationFor, k)) rs[k] = v;
      else issues.push(`assessment ${id}: dropped a remediationForSeq entry`);
    }
    if (Object.keys(rs).length) out.remediationForSeq = rs;
  } else if (raw.remediationForSeq !== undefined) issues.push(`assessment ${id}: remediationForSeq invalid`);
  if (typeof raw.seed === "string" && SEED_RE.test(raw.seed)) out.seed = raw.seed;
  else if (raw.seed !== undefined) issues.push(`assessment ${id}: seed invalid`);

  const d = raw.draft;
  if (isObj(d) && isValidIsoTime(d.startedAt) && Array.isArray(d.questionIds) && d.questionIds.length > 0 && d.questionIds.length <= MAX_ASSESSMENT_ITEMS
    && d.questionIds.every((q) => typeof q === "string" && ID_RE.test(q))) {
    const qs = d.questionIds as string[];
    const answers: Record<string, StoredAnswer> = {};
    if (isObj(d.answers)) for (const [k, v] of Object.entries(d.answers)) if (qs.includes(k) && isStoredAnswer(v)) answers[k] = v;
    const reused = Array.isArray(d.reusedConcepts) ? d.reusedConcepts.filter((c): c is string => typeof c === "string" && ID_RE.test(c)) : [];
    out.draft = { startedAt: d.startedAt, questionIds: [...new Set(qs)], answers, reusedConcepts: reused };
  } else if (d != null) issues.push(`assessment ${id}: draft invalid`);

  if (isValidIsoTime(raw.draftClearedAt)) out.draftClearedAt = raw.draftClearedAt;
  else if (raw.draftClearedAt != null) issues.push(`assessment ${id}: draftClearedAt invalid`);
  return out;
}

/**
 * Turn anything read from storage (a JSON string, an object, garbage) into a
 * valid ProgressState. Never throws. Unknown or broken parts are dropped and
 * reported in `issues`; everything still valid is kept.
 */
export function parseProgress(input: unknown): ParseResult {
  const issues: string[] = [];
  let raw: unknown = input;

  if (raw === null || raw === undefined || raw === "") return { state: emptyProgress(), repaired: false, issues };

  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return { state: emptyProgress(), repaired: true, issues: ["stored data is not valid JSON"] };
    }
  }

  if (!isObj(raw)) return { state: emptyProgress(), repaired: true, issues: ["stored data is not an object"] };

  const version = raw.version;
  if (version !== PROGRESS_SCHEMA_VERSION) {
    if (typeof version === "number" && version > PROGRESS_SCHEMA_VERSION) {
      issues.push(`stored data is from a newer version (${version}); kept what this version understands`);
    } else {
      issues.push("stored data had no recognised version; migrated to version 1");
    }
  }

  const state = emptyProgress();
  if (isObj(raw.lessons)) {
    for (const [id, value] of Object.entries(raw.lessons)) {
      if (!ID_RE.test(id)) {
        issues.push("dropped a lesson with an invalid id");
        continue;
      }
      const l = sanitizeLesson(value, issues, id);
      if (l) state.lessons[id] = l;
    }
  } else if (raw.lessons !== undefined) issues.push("lessons field invalid");

  if (isObj(raw.assessments)) {
    const assessments: Record<string, TrackAssessmentProgress> = {};
    for (const [id, value] of Object.entries(raw.assessments)) {
      if (!ID_RE.test(id)) {
        issues.push("dropped an assessment with an invalid track id");
        continue;
      }
      const a = sanitizeAssessment(value, issues, id);
      if (a) assessments[id] = a;
    }
    if (Object.keys(assessments).length) state.assessments = assessments;
  } else if (raw.assessments != null) issues.push("assessments field invalid");

  state.updatedAt = isValidIsoTime(raw.updatedAt) ? raw.updatedAt : null;
  if (isValidIsoTime(raw.resetAt)) state.resetAt = raw.resetAt;
  else if (raw.resetAt != null) issues.push("resetAt invalid");
  return { state, repaired: issues.length > 0, issues };
}

// ── Updates (return a new state; return the SAME object when nothing changes) ──

function withLesson(state: ProgressState, lessonId: string, now: Date, fn: (l: LessonProgress) => LessonProgress | null): ProgressState {
  if (!ID_RE.test(lessonId)) return state;
  const current = getLessonProgress(state, lessonId) ?? emptyLessonProgress();
  const next = fn(current);
  if (next === null || next === current) return state;
  return { ...state, lessons: { ...state.lessons, [lessonId]: next }, updatedAt: now.toISOString() };
}

export function markSectionRead(state: ProgressState, lessonId: string, sectionId: string, now: Date): ProgressState {
  if (!ID_RE.test(sectionId)) return state;
  return withLesson(state, lessonId, now, (l) =>
    has(l.sectionsRead, sectionId) ? null : { ...l, sectionsRead: { ...l.sectionsRead, [sectionId]: now.toISOString() } },
  );
}

export function completeExercise(state: ProgressState, lessonId: string, now: Date): ProgressState {
  return withLesson(state, lessonId, now, (l) => (l.exerciseCompletedAt ? null : { ...l, exerciseCompletedAt: now.toISOString() }));
}

export function recordQuizAttempt(state: ProgressState, lessonId: string, correct: number, total: number, now: Date): ProgressState {
  if (!Number.isInteger(correct) || !Number.isInteger(total) || total <= 0 || total > 100 || correct < 0 || correct > total) return state;
  return withLesson(state, lessonId, now, (l) => ({
    ...l,
    quizAttempts: [...l.quizAttempts, { at: now.toISOString(), correct, total }].slice(-MAX_ATTEMPTS_PER_LESSON),
  }));
}

export function saveReflection(state: ProgressState, lessonId: string, text: string, now: Date): ProgressState {
  const clean = text.slice(0, MAX_REFLECTION_LENGTH);
  return withLesson(state, lessonId, now, (l) => {
    // Clearing leaves a tombstone so merges cannot resurrect the old text.
    if (!clean.trim()) return l.reflection ? { ...l, reflection: null, reflectionClearedAt: now.toISOString() } : null;
    if (l.reflection?.text === clean) return null;
    return { ...l, reflection: { text: clean, updatedAt: now.toISOString() } };
  });
}

// ── Assessment records ─────────────────────────────────────────────────────

export function getAssessmentProgress(state: ProgressState, trackId: string): TrackAssessmentProgress | undefined {
  return state.assessments && has(state.assessments, trackId) ? state.assessments[trackId] : undefined;
}

function withAssessment(state: ProgressState, trackId: string, now: Date, fn: (a: TrackAssessmentProgress) => TrackAssessmentProgress | null): ProgressState {
  if (!ID_RE.test(trackId)) return state;
  const current = getAssessmentProgress(state, trackId) ?? emptyAssessmentProgress();
  const next = fn(current);
  if (next === null || next === current) return state;
  return { ...state, assessments: { ...(state.assessments ?? {}), [trackId]: next }, updatedAt: now.toISOString() };
}

/**
 * Start an assessment with the given questions. Does nothing if one is already in progress (a refresh resumes it).
 * `seed` (the learner's draw seed) is stored the first time and kept after that.
 */
export function startAssessment(state: ProgressState, trackId: string, questionIds: string[], reusedConcepts: string[], now: Date, seed?: string): ProgressState {
  if (!questionIds.length || questionIds.length > MAX_ASSESSMENT_ITEMS || !questionIds.every((q) => ID_RE.test(q))) return state;
  return withAssessment(state, trackId, now, (a) => {
    if (a.draft) return null;
    const next: TrackAssessmentProgress = { ...a, draft: { startedAt: now.toISOString(), questionIds: [...new Set(questionIds)], answers: {}, reusedConcepts: reusedConcepts.filter((c) => ID_RE.test(c)) } };
    if (!a.seed && seed && SEED_RE.test(seed)) next.seed = seed;
    return next;
  });
}

/** Store the learner's draw seed if none is stored yet (no-op otherwise). */
export function ensureAssessmentSeed(state: ProgressState, trackId: string, seed: string, now: Date): ProgressState {
  if (!SEED_RE.test(seed)) return state;
  return withAssessment(state, trackId, now, (a) => (a.seed ? null : { ...a, seed }));
}

/** Throw away the draft (e.g. it no longer matches the question bank after a content update). */
export function discardAssessmentDraft(state: ProgressState, trackId: string, now: Date): ProgressState {
  return withAssessment(state, trackId, now, (a) => (a.draft ? { ...a, draft: null, draftClearedAt: now.toISOString() } : null));
}

export function saveAssessmentAnswer(state: ProgressState, trackId: string, questionId: string, answer: StoredAnswer, now: Date): ProgressState {
  if (!isStoredAnswer(answer)) return state;
  return withAssessment(state, trackId, now, (a) => {
    if (!a.draft || !a.draft.questionIds.includes(questionId)) return null;
    if (JSON.stringify(a.draft.answers[questionId]) === JSON.stringify(answer)) return null;
    return { ...a, draft: { ...a.draft, answers: { ...a.draft.answers, [questionId]: answer } } };
  });
}

/**
 * Put attempts in recorded order (seq, see orderAttempts) and keep at most MAX_ASSESSMENT_ATTEMPTS:
 * the most recent ones, plus the best passing attempt (highest score; the earliest on a tie), which
 * is always kept so many practice retakes can never push the pass out of the history. Only a pass
 * that counts is chosen: one dated no more than 24 hours after `now` (PASS_FUTURE_GRACE_MS), so a
 * corrupt far-future "pass" cannot evict the real one. `now` defaults to the current time (loading
 * and merging happen now). Remediation links need no special care: they only matter for the latest
 * attempt, which is always kept.
 */
export function capAttempts(attempts: readonly AssessmentAttempt[], now: Date = new Date()): AssessmentAttempt[] {
  const ordered = orderAttempts(attempts);
  if (ordered.length <= MAX_ASSESSMENT_ATTEMPTS) return ordered;
  const limit = now.getTime() + PASS_FUTURE_GRACE_MS;
  let best = -1, bestPct = -1;
  ordered.forEach((a, i) => {
    const sc = scoreAttempt(a.items);
    if (sc.passed && Date.parse(a.at) <= limit && sc.pct > bestPct) { best = i; bestPct = sc.pct; }
  });
  const recent = ordered.length - MAX_ASSESSMENT_ATTEMPTS;
  if (best < 0 || best >= recent) return ordered.slice(recent);
  // The best pass is older than the recent window: keep it and the latest MAX - 1.
  return [ordered[best], ...ordered.slice(recent + 1)];
}

/** Record a graded attempt (with the answers given) and close the draft. `items` must not be empty. */
export function submitAssessment(state: ProgressState, trackId: string, items: AssessmentItemResult[], now: Date, answers?: Record<string, StoredAnswer>): ProgressState {
  if (!items.length || items.length > MAX_ASSESSMENT_ITEMS || !items.every((i) => ID_RE.test(i.q) && ID_RE.test(i.c))) return state;
  const at = now.toISOString();
  const attempt: AssessmentAttempt = { at, seq: 0, items: items.map((i) => ({ ...i })) };
  if (answers) {
    const qs = new Set(items.map((i) => i.q));
    attempt.answers = Object.fromEntries(Object.entries(answers).filter(([k, v]) => qs.has(k) && isStoredAnswer(v)));
  }
  return withAssessment(state, trackId, now, (a) => {
    const prior = orderAttempts(a.attempts);
    attempt.seq = prior.reduce((m, x) => Math.max(m, x.seq!), 0) + 1;
    return {
    ...a,
    attempts: capAttempts([...prior, attempt], now),
    draft: null,
    draftClearedAt: at,
    };
  });
}

/**
 * Mark one concept's remediation as finished (the practice question was answered correctly).
 * It is recorded against the latest attempt, so the retest gate depends on order, not on the clock.
 */
export function completeRemediation(state: ProgressState, trackId: string, conceptId: string, now: Date): ProgressState {
  if (!ID_RE.test(conceptId)) return state;
  return withAssessment(state, trackId, now, (a) => {
    const ordered = orderAttempts(a.attempts);
    const last = ordered.length ? ordered[ordered.length - 1] : null;
    const remediationFor = { ...(a.remediationFor ?? {}) };
    const remediationForSeq = { ...(a.remediationForSeq ?? {}) };
    if (last) { remediationFor[conceptId] = last.at; remediationForSeq[conceptId] = last.seq!; }
    else { delete remediationFor[conceptId]; delete remediationForSeq[conceptId]; }
    const next: TrackAssessmentProgress = { ...a, remediation: { ...a.remediation, [conceptId]: now.toISOString() } };
    if (Object.keys(remediationFor).length) next.remediationFor = remediationFor;
    else delete next.remediationFor;
    if (Object.keys(remediationForSeq).length) next.remediationForSeq = remediationForSeq;
    else delete next.remediationForSeq;
    return next;
  });
}

export function resetLesson(state: ProgressState, lessonId: string, now: Date): ProgressState {
  if (!has(state.lessons, lessonId)) return state;
  const lessons = { ...state.lessons };
  delete lessons[lessonId];
  return { ...state, lessons, updatedAt: now.toISOString() };
}

// ── Merging (two tabs, or recovering after failed saves) ───────────────────

const laterIso = (a: string | null, b: string | null) => (!a ? b : !b ? a : Date.parse(a) >= Date.parse(b) ? a : b);
const earlierIso = (a: string | null, b: string | null) => (!a ? b : !b ? a : Date.parse(a) <= Date.parse(b) ? a : b);

const after = (iso: string | null | undefined, cutoff: number) => !!iso && Date.parse(iso) > cutoff;

/** Drop everything recorded at or before `cutoffIso` (a reset). Returns null if nothing is left. */
function dropBefore(l: LessonProgress, cutoffIso: string): LessonProgress | null {
  const cut = Date.parse(cutoffIso);
  const out: LessonProgress = {
    sectionsRead: Object.fromEntries(Object.entries(l.sectionsRead).filter(([, t]) => after(t, cut))),
    exerciseCompletedAt: after(l.exerciseCompletedAt, cut) ? l.exerciseCompletedAt : null,
    quizAttempts: l.quizAttempts.filter((q) => after(q.at, cut)),
    reflection: l.reflection && after(l.reflection.updatedAt, cut) ? l.reflection : null,
  };
  if (after(l.reflectionClearedAt, cut)) out.reflectionClearedAt = l.reflectionClearedAt;
  const empty = !Object.keys(out.sectionsRead).length && !out.exerciseCompletedAt && !out.quizAttempts.length && !out.reflection && !out.reflectionClearedAt;
  return empty ? null : out;
}

function dropAssessmentBefore(a: TrackAssessmentProgress, cutoffIso: string): TrackAssessmentProgress | null {
  const cut = Date.parse(cutoffIso);
  const out: TrackAssessmentProgress = {
    attempts: a.attempts.filter((x) => after(x.at, cut)),
    remediation: Object.fromEntries(Object.entries(a.remediation).filter(([, t]) => after(t, cut))),
    draft: a.draft && after(a.draft.startedAt, cut) ? a.draft : null,
  };
  if (a.remediationFor) {
    const rf = Object.fromEntries(Object.entries(a.remediationFor).filter(([k, t]) => has(out.remediation, k) && after(t, cut)));
    if (Object.keys(rf).length) out.remediationFor = rf;
    if (a.remediationForSeq) {
      const rs = Object.fromEntries(Object.entries(a.remediationForSeq).filter(([k]) => has(rf, k)));
      if (Object.keys(rs).length) out.remediationForSeq = rs;
    }
  }
  if (after(a.draftClearedAt, cut)) out.draftClearedAt = a.draftClearedAt;
  const empty = !out.attempts.length && !Object.keys(out.remediation).length && !out.draft && !out.draftClearedAt;
  // The draw seed survives a reset only together with activity recorded after it.
  if (!empty && a.seed) out.seed = a.seed;
  return empty ? null : out;
}

function mergeAssessment(a: TrackAssessmentProgress, b: TrackAssessmentProgress): TrackAssessmentProgress {
  // Each side is numbered first (older data in stored order). The same attempt on both sides is
  // kept once (the higher seq, if they differ). Two different attempts with the same seq (two tabs
  // submitting at once) are BOTH kept; orderAttempts breaks the tie deterministically.
  const byKey = new Map<string, AssessmentAttempt>();
  for (const x of [...orderAttempts(a.attempts), ...orderAttempts(b.attempts)]) {
    const k = attemptKey(x);
    const prev = byKey.get(k);
    if (!prev || x.seq! > prev.seq!) byKey.set(k, x);
  }
  const attemptsKept = capAttempts([...byKey.values()]);
  const remediation: Record<string, string> = { ...a.remediation };
  const remediationFor: Record<string, string> = { ...(a.remediationFor ?? {}) };
  const remediationForSeq: Record<string, number> = { ...(a.remediationForSeq ?? {}) };
  for (const [k, v] of Object.entries(b.remediation)) {
    const prev = has(remediation, k) ? remediation[k] : null;
    remediation[k] = laterIso(prev, v)!;
    // remediationFor (and its seq) follow the side whose remediation is the later one.
    if (remediation[k] === v && v !== prev) {
      if (b.remediationFor && has(b.remediationFor, k)) remediationFor[k] = b.remediationFor[k];
      else delete remediationFor[k];
      if (b.remediationForSeq && has(b.remediationForSeq, k)) remediationForSeq[k] = b.remediationForSeq[k];
      else delete remediationForSeq[k];
    }
  }
  // Draft: the newest one wins; on the same start time the answers are combined.
  let draft = a.draft ?? b.draft;
  if (a.draft && b.draft) {
    const ta = Date.parse(a.draft.startedAt), tb = Date.parse(b.draft.startedAt);
    draft = ta === tb ? { ...a.draft, answers: { ...a.draft.answers, ...b.draft.answers } } : tb > ta ? b.draft : a.draft;
  }
  const clearedAt = laterIso(a.draftClearedAt ?? null, b.draftClearedAt ?? null);
  // A draft started at or before the last submit/discard is closed.
  if (draft && clearedAt && Date.parse(clearedAt) >= Date.parse(draft.startedAt)) draft = null;
  const out: TrackAssessmentProgress = { attempts: attemptsKept, remediation, draft };
  if (Object.keys(remediationFor).length) out.remediationFor = remediationFor;
  for (const k of Object.keys(remediationForSeq)) if (!has(remediationFor, k)) delete remediationForSeq[k];
  if (Object.keys(remediationForSeq).length) out.remediationForSeq = remediationForSeq;
  // Two tabs that each chose a seed converge on the same one.
  const seed = a.seed && b.seed ? (a.seed < b.seed ? a.seed : b.seed) : a.seed ?? b.seed;
  if (seed) out.seed = seed;
  if (clearedAt) out.draftClearedAt = clearedAt;
  return out;
}

function mergeLesson(a: LessonProgress, b: LessonProgress): LessonProgress {
  const sectionsRead: Record<string, string> = { ...a.sectionsRead };
  for (const [k, v] of Object.entries(b.sectionsRead)) sectionsRead[k] = earlierIso(has(sectionsRead, k) ? sectionsRead[k] : null, v)!;
  const seen = new Set<string>();
  const quizAttempts = [...a.quizAttempts, ...b.quizAttempts]
    .filter((q) => {
      const key = `${q.at}|${q.correct}|${q.total}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((x, y) => Date.parse(x.at) - Date.parse(y.at))
    .slice(-MAX_ATTEMPTS_PER_LESSON);
  // Reflection: the newest event wins, and a clear (tombstone) counts as an event.
  let reflection = a.reflection ?? b.reflection;
  if (a.reflection && b.reflection) reflection = Date.parse(b.reflection.updatedAt) > Date.parse(a.reflection.updatedAt) ? b.reflection : a.reflection;
  const clearedAt = laterIso(a.reflectionClearedAt ?? null, b.reflectionClearedAt ?? null);
  if (reflection && clearedAt && Date.parse(clearedAt) >= Date.parse(reflection.updatedAt)) reflection = null;
  const out: LessonProgress = { sectionsRead, exerciseCompletedAt: earlierIso(a.exerciseCompletedAt, b.exerciseCompletedAt), quizAttempts, reflection };
  if (clearedAt) out.reflectionClearedAt = clearedAt;
  return out;
}

/** Remove everything recorded at or before a reset time. */
function trimToEpoch(s: ProgressState, resetAt: string | null): ProgressState {
  if (!resetAt || s.resetAt === resetAt) return s;
  const lessons: Record<string, LessonProgress> = {};
  for (const [id, l] of Object.entries(s.lessons)) {
    const kept = dropBefore(l, resetAt);
    if (kept) lessons[id] = kept;
  }
  const out: ProgressState = { ...s, lessons, resetAt };
  delete out.assessments;
  if (s.assessments) {
    const assessments: Record<string, TrackAssessmentProgress> = {};
    for (const [id, a] of Object.entries(s.assessments)) {
      const kept = dropAssessmentBefore(a, resetAt);
      if (kept) assessments[id] = kept;
    }
    if (Object.keys(assessments).length) out.assessments = assessments;
  }
  return out;
}

/**
 * Merge two progress states (two tabs, or a tab recovering after failed saves).
 * - Resets win: anything recorded at or before the newest resetAt is discarded.
 * - Otherwise a union: sections read and solved exercises from either side (earliest
 *   time kept), quiz attempts from both with duplicates removed.
 * - Reflections: the newest event wins, where clearing it is an event too.
 */
export function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  const resetAt = laterIso(a.resetAt ?? null, b.resetAt ?? null);
  const x = trimToEpoch(a, resetAt);
  const y = trimToEpoch(b, resetAt);
  const lessons: Record<string, LessonProgress> = { ...x.lessons };
  for (const [id, l] of Object.entries(y.lessons)) lessons[id] = has(lessons, id) ? mergeLesson(lessons[id], l) : l;
  const out: ProgressState = { version: PROGRESS_SCHEMA_VERSION, lessons, updatedAt: laterIso(x.updatedAt, y.updatedAt) };
  if (x.assessments || y.assessments) {
    const assessments: Record<string, TrackAssessmentProgress> = { ...(x.assessments ?? {}) };
    for (const [id, a] of Object.entries(y.assessments ?? {})) assessments[id] = has(assessments, id) ? mergeAssessment(assessments[id], a) : a;
    out.assessments = assessments;
  }
  if (resetAt) out.resetAt = resetAt;
  return out;
}

/** A fresh, empty state that remembers it was reset at `now`. */
export function resetProgress(now: Date): ProgressState {
  return { ...emptyProgress(), updatedAt: now.toISOString(), resetAt: now.toISOString() };
}

// ── Per-lesson status ──────────────────────────────────────────────────────

export type LessonStatus = {
  lessonId: string;
  sectionsRead: number;
  sectionsTotal: number;
  allSectionsRead: boolean;
  exerciseDone: boolean;
  attempts: number;
  /** 0–100, or null if never attempted. */
  bestScore: number | null;
  lastScore: number | null;
  passed: boolean;
  lastPassed: boolean | null;
  complete: boolean;
  started: boolean;
  /** Distinct local days (not in the future) with a passing attempt. */
  passDays: number;
  /** Day key of the most recent passing attempt, or null. */
  lastPassDay: string | null;
  mastery: MasteryLevel;
  /** Complete, but the most recent quiz attempt failed. */
  needsReview: boolean;
};

export function lessonStatus(lesson: LessonRef, state: ProgressState, clock: Clock): LessonStatus {
  const p = getLessonProgress(state, lesson.id);
  const sectionsTotal = lesson.sections.length;
  const sectionsRead = p ? lesson.sections.filter((s) => has(p.sectionsRead, s.id)).length : 0;
  // Attempts dated more than 5 minutes in the future (wrong clock, corrupt data) are ignored
  // for every derived value. They stay in storage, so nothing is lost if the clock was wrong.
  const attempts = (p?.quizAttempts ?? []).filter((a) => notFuture(a.at, clock.now));
  const last = attempts.length ? attempts[attempts.length - 1] : null;

  let best: QuizAttempt | null = null;
  for (const a of attempts) if (!best || a.correct / a.total > best.correct / best.total) best = a;

  const passDayKeys = new Set<string>();
  let lastPassDay: string | null = null;
  let lastPassTime = -Infinity;
  for (const a of attempts) {
    if (!isPass(a.correct, a.total)) continue;
    const k = dayKey(a.at, clock.timeZone);
    passDayKeys.add(k);
    const t = Date.parse(a.at);
    if (t > lastPassTime) {
      lastPassTime = t;
      lastPassDay = k;
    }
  }

  const allSectionsRead = sectionsTotal > 0 && sectionsRead === sectionsTotal;
  const exerciseDone = !!p?.exerciseCompletedAt;
  const passed = best ? isPass(best.correct, best.total) : false;
  const lastPassed = last ? isPass(last.correct, last.total) : null;
  const complete = allSectionsRead && exerciseDone && passed;
  const started = !!p && (Object.keys(p.sectionsRead).length > 0 || exerciseDone || attempts.length > 0 || !!p.reflection);

  let mastery: MasteryLevel;
  if (!started) mastery = "not-started";
  else if (!complete) mastery = "learning";
  else if (passDayKeys.size >= MASTERY_DAYS_REQUIRED && lastPassed) mastery = "mastered";
  else mastery = "practising";

  return {
    lessonId: lesson.id,
    sectionsRead,
    sectionsTotal,
    allSectionsRead,
    exerciseDone,
    attempts: attempts.length,
    bestScore: best ? scorePct(best) : null,
    lastScore: last ? scorePct(last) : null,
    passed,
    lastPassed,
    complete,
    started,
    passDays: passDayKeys.size,
    lastPassDay,
    mastery,
    needsReview: complete && lastPassed === false,
  };
}

/** What the learner should do next to move this lesson up a level. */
export function nextStepHint(s: LessonStatus, clock: Clock): string {
  if (s.mastery === "mastered") return "Mastered. Retake the quiz any time to keep it fresh.";
  if (s.needsReview) return "Your latest quiz attempt was below 80%. Review the lesson and retake the quiz.";
  if (s.mastery === "practising") {
    return s.lastPassDay === dayKey(clock.now, clock.timeZone)
      ? "Come back on another day and pass the quiz again to reach Mastered."
      : "Pass the quiz again today to reach Mastered.";
  }
  const todo: string[] = [];
  if (!s.allSectionsRead) todo.push(`read ${s.sectionsTotal - s.sectionsRead} more section${s.sectionsTotal - s.sectionsRead === 1 ? "" : "s"}`);
  if (!s.exerciseDone) todo.push("solve the exercise");
  if (!s.passed) todo.push("score at least 80% on the quiz");
  return `To complete this lesson: ${todo.join(", ")}.`;
}

// ── Track and overall summaries ────────────────────────────────────────────

export type Summary = {
  total: number;
  started: number;
  completed: number;
  mastered: number;
  /** 0–100, or null when there are no written lessons. */
  masteryPct: number | null;
};

export function summarize(lessons: readonly LessonRef[], state: ProgressState, clock: Clock): Summary {
  if (lessons.length === 0) return { total: 0, started: 0, completed: 0, mastered: 0, masteryPct: null };
  let started = 0, completed = 0, mastered = 0, value = 0;
  for (const l of lessons) {
    const s = lessonStatus(l, state, clock);
    if (s.started) started++;
    if (s.complete) completed++;
    if (s.mastery === "mastered") mastered++;
    value += MASTERY_META[s.mastery].value;
  }
  return { total: lessons.length, started, completed, mastered, masteryPct: Math.round((value / lessons.length) * 100) };
}

// ── Recommended next lesson ────────────────────────────────────────────────

export type RecommendationReason =
  | "start"          // first lesson not yet started, in order
  | "continue"       // started, not complete
  | "retry-quiz"     // started, quiz attempted but never passed
  | "review"         // was complete, but the latest quiz attempt failed
  | "consolidate"    // complete; pass again on a new day to master it
  | "consolidate-later"; // complete and passed today; come back another day

export type Recommendation = { lessonId: string; reason: RecommendationReason };

export const RECOMMENDATION_COPY: Record<RecommendationReason, { label: string; cta: string }> = {
  start: { label: "Next in order", cta: "Start lesson" },
  continue: { label: "Pick up where you left off", cta: "Continue lesson" },
  "retry-quiz": { label: "Quiz not passed yet", cta: "Review and retake" },
  review: { label: "Your last quiz score dropped below 80%", cta: "Review lesson" },
  consolidate: { label: "Pass the quiz again to master it", cta: "Retake quiz" },
  "consolidate-later": { label: "Passed today. Retake on another day to master it", cta: "Open lesson" },
};

/**
 * Priority:
 *   1. a completed lesson whose latest quiz attempt failed (fix gaps first),
 *   2. the first incomplete lesson in curriculum order,
 *   3. a Practising lesson that can be mastered today,
 *   4. a Practising lesson that was passed today (come back tomorrow),
 *   5. null: everything written is mastered.
 */
export function recommendNext(lessons: readonly LessonRef[], state: ProgressState, clock: Clock): Recommendation | null {
  const statuses = lessons.map((l) => lessonStatus(l, state, clock));
  const review = statuses.find((s) => s.needsReview);
  if (review) return { lessonId: review.lessonId, reason: "review" };

  const incomplete = statuses.find((s) => !s.complete);
  if (incomplete) {
    const reason: RecommendationReason = !incomplete.started
      ? "start"
      : incomplete.attempts > 0 && !incomplete.passed
        ? "retry-quiz"
        : "continue";
    return { lessonId: incomplete.lessonId, reason };
  }

  const today = dayKey(clock.now, clock.timeZone);
  const practising = statuses.filter((s) => s.mastery === "practising");
  const dueToday = practising.find((s) => s.lastPassDay !== today);
  if (dueToday) return { lessonId: dueToday.lessonId, reason: "consolidate" };
  if (practising.length) return { lessonId: practising[0].lessonId, reason: "consolidate-later" };
  return null;
}

// ── Streak ─────────────────────────────────────────────────────────────────

export type Streak = {
  /** Consecutive active days ending today or yesterday. */
  current: number;
  longest: number;
  activeToday: boolean;
  activeDays: number;
};

/** All activity timestamps in the state (unvalidated order). */
export function activityTimes(state: ProgressState): string[] {
  const out: string[] = [];
  for (const l of Object.values(state.lessons)) {
    out.push(...Object.values(l.sectionsRead));
    if (l.exerciseCompletedAt) out.push(l.exerciseCompletedAt);
    for (const a of l.quizAttempts) out.push(a.at);
    if (l.reflection) out.push(l.reflection.updatedAt);
  }
  for (const a of Object.values(state.assessments ?? {})) {
    for (const x of a.attempts) out.push(x.at);
    out.push(...Object.values(a.remediation));
    if (a.draft) out.push(a.draft.startedAt);
  }
  return out;
}

export function computeStreak(times: readonly string[], clock: Clock): Streak {
  const days = new Set<number>();
  for (const t of times) {
    if (!isValidIsoTime(t) || !notFuture(t, clock.now)) continue;
    days.add(dayNumber(dayKey(t, clock.timeZone)));
  }
  if (days.size === 0) return { current: 0, longest: 0, activeToday: false, activeDays: 0 };

  const sorted = [...days].sort((a, b) => a - b);
  let longest = 1, run = 1;
  for (let i = 1; i < sorted.length; i++) {
    run = sorted[i] === sorted[i - 1] + 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  const today = dayNumber(dayKey(clock.now, clock.timeZone));
  const activeToday = days.has(today);
  let current = 0;
  let d = activeToday ? today : days.has(today - 1) ? today - 1 : null;
  while (d !== null && days.has(d)) {
    current++;
    d--;
  }
  return { current, longest, activeToday, activeDays: days.size };
}

export function streakFromState(state: ProgressState, clock: Clock): Streak {
  return computeStreak(activityTimes(state), clock);
}

// ── Current track (dashboard) ──────────────────────────────────────────────

/**
 * The track a learner is working through: the first written track that is
 * not fully complete, in curriculum order. When every written track is
 * complete, the last one. Returns -1 when there are no written tracks.
 * Deliberately independent of the "review" recommendation, so the dashboard
 * does not jump back to track 1 just because an old quiz needs a retake.
 */
export function currentTrackIndex(tracks: readonly (readonly LessonRef[])[], state: ProgressState, clock: Clock): number {
  const written = tracks.map((t, i) => [t, i] as const).filter(([t]) => t.length > 0);
  if (written.length === 0) return -1;
  for (const [t, i] of written) {
    const s = summarize(t, state, clock);
    if (s.completed < s.total) return i;
  }
  return written[written.length - 1][1];
}

// ── Journey stage (dashboard strip) ────────────────────────────────────────

export type JourneyStage = {
  /** Index into the dashboard STAGES list (0 = Awareness, 1 = Learning, ...). */
  index: number;
  headline: string;
  detail: string;
};

/** Where the learner is in the written tracks, for the journey detail line. */
export type TrackPosition = {
  title: string;
  completed: number;
  total: number;
  /** Every lesson is complete but the track assessment is not passed yet. */
  assessmentPending?: boolean;
};

/**
 * Journey stage rules (also explained on the Academy page under "How mastery works"):
 *
 * - Stage 0 Awareness lasts until every Market Foundations lesson is complete.
 * - Stage 1 Learning starts then and covers the rest of the Academy,
 *   including Forex Foundations and Stocks and Indices. Finishing those
 *   tracks does NOT advance the stage: Analysis (stage 2) is about reading
 *   charts and forming evidence-based views, which needs the Chart Reading
 *   track and Market Desk; Practice, Review and Improvement need paper
 *   trading and the journal. Those arrive in later phases, so the Academy
 *   alone never moves you past stage 1.
 *
 * `current` (optional) is the track the learner is working through now; it
 * only changes the wording of the detail line, never the stage.
 *
 * `gate` (optional, used by the dashboard since track assessments arrived):
 * when given, Awareness also lasts until the Market Foundations track
 * assessment is passed, because finishing the lessons alone no longer
 * completes a track. Without it, the original lesson-only rule applies.
 */
export function journeyStage(foundations: Summary, current?: TrackPosition | null, gate?: { foundationsAssessmentPassed: boolean }): JourneyStage {
  const lessonsDone = foundations.total > 0 && foundations.completed >= foundations.total;
  if (lessonsDone && gate && !gate.foundationsAssessmentPassed) {
    return {
      index: 0,
      headline: "Start with understanding, not with trading.",
      detail: "You are at stage 1. Every Market Foundations lesson is complete. Pass the track assessment (90% or more, with every safety-critical question right) to reach the Learning stage.",
    };
  }
  if (lessonsDone && current?.assessmentPending && current.title !== "Market Foundations") {
    return {
      index: 1,
      headline: "Foundations done. Keep building understanding.",
      detail: `You have completed Market Foundations. Now working through ${current.title}: all ${current.total} lessons complete. Pass its track assessment to complete the track.`,
    };
  }
  if (lessonsDone) {
    const inTrack = current && current.total > 0 && current.completed < current.total && current.title !== "Market Foundations";
    return {
      index: 1,
      headline: "Foundations done. Keep building understanding.",
      detail: inTrack
        ? `You have completed Market Foundations. Now working through ${current.title}: ${current.completed} of ${current.total} lessons complete. Keep your mastery up by retaking quizzes on different days.`
        : current && current.total > 0 && current.completed >= current.total
          ? "Every written Academy lesson is complete. More tracks are on the way; keep your mastery up by retaking quizzes on different days."
          : "You have completed Market Foundations. More Academy tracks are on the way; keep your mastery up by retaking quizzes on different days.",
    };
  }
  if (foundations.started === 0) {
    return {
      index: 0,
      headline: "Start with understanding, not with trading.",
      detail: "You are at stage 1. Work through Market Foundations before you open your first paper trade.",
    };
  }
  const left = foundations.total - foundations.completed;
  return {
    index: 0,
    headline: "Start with understanding, not with trading.",
    detail: `You are at stage 1. ${left} Market Foundations lesson${left === 1 ? "" : "s"} left before the Learning stage.`,
  };
}
