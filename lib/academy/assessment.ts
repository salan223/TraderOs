import { gradeItem } from "./interactions";
import type { AssessmentAttempt, AssessmentItemResult, StoredAnswer, TrackAssessmentProgress } from "./progress";
import { seededShuffle } from "./shuffle";
import type { AssessmentConcept, AssessmentQuestion, TrackAssessment } from "./types";

/**
 * Track assessments: question selection, scoring and remediation rules.
 * Pure functions; the records themselves are stored by lib/academy/progress.ts.
 *
 * ── Rules ──────────────────────────────────────────────────────────────────
 * One question per concept per attempt, drawn from that concept's pool.
 *
 * An attempt PASSES only when all of these hold:
 *   1. score ≥ 90% (ASSESSMENT_PASS_MARK, integer maths),
 *   2. every safety-critical question is right (100%),
 *   3. every critical concept's question is right ("demonstrated understanding"),
 *   4. the applied scenario is right (judged on the decision process).
 * So 92% with one safety-critical miss is a FAIL.
 *
 * While the track is not yet passed, every concept answered wrongly in the
 * latest attempt needs remediation (why the answer was wrong, a different
 * explanation, a new example, and a practice question answered correctly)
 * before the retest unlocks. Each concept has at least two remediation
 * variants, rotated each time the concept is missed again. A remediation
 * counts for the attempt it was recorded against (order, not clock), and a
 * remediation stamped more than 5 minutes in the future is ignored.
 * After a pass, retakes are practice: misses offer optional remediation and
 * never block further practice or remove the pass.
 *
 * Clock skew: the retest gate follows the latest RECORDED attempt (the highest
 * sequence number, assigned on submit), whatever its date, before and after a
 * reload or a merge, so moving the clock back cannot skip remediation. A pass counts if it
 * is stamped no more than 24 hours ahead of the clock; anything further ahead
 * is ignored for passing and the mastery score. See assessmentState.
 *
 * Every concept has at least four questions. Each attempt draws a fresh one
 * per concept, never-seen first, so the first three retests repeat nothing.
 * When a concept's pool has run out, the question seen longest ago is reused,
 * its options are reshuffled, and the learner is told which concepts are
 * repeats (never silently). The draw is seeded per learner (a random seed
 * stored on the first start) and per attempt number.
 *
 * Displayed percentages are floored, so a fail never reads "90%".
 *
 * No cooldown: the remediation gate already forces a pause to re-learn, and a
 * clock-based wait is easy to dodge by changing the device clock.
 */

export const ASSESSMENT_PASS_MARK = 0.9;
export const ASSESSMENT_PASS_PCT = Math.round(ASSESSMENT_PASS_MARK * 100);

export type AttemptScore = {
  correct: number;
  total: number;
  pct: number;
  /** Score of at least 90%. */
  scoreOk: boolean;
  safetyTotal: number;
  safetyCorrect: number;
  safetyOk: boolean;
  criticalOk: boolean;
  appliedOk: boolean;
  passed: boolean;
  /** Concepts with a wrong answer, in the attempt's order. */
  wrongConcepts: string[];
  /** Plain reasons for a fail (empty when passed). */
  failReasons: string[];
};

export function scoreAttempt(items: readonly AssessmentItemResult[]): AttemptScore {
  const total = items.length;
  const correct = items.filter((i) => i.ok).length;
  const safety = items.filter((i) => i.safety);
  const safetyCorrect = safety.filter((i) => i.ok).length;
  const safetyOk = safetyCorrect === safety.length;
  const criticalOk = items.filter((i) => i.critical).every((i) => i.ok);
  const applied = items.filter((i) => i.applied);
  const appliedOk = applied.length > 0 && applied.every((i) => i.ok);
  const scoreOk = total > 0 && correct * 100 >= total * ASSESSMENT_PASS_PCT;
  const passed = scoreOk && safetyOk && criticalOk && appliedOk;
  const wrongConcepts = [...new Set(items.filter((i) => !i.ok).map((i) => i.c))];
  const failReasons: string[] = [];
  if (!scoreOk) failReasons.push(`The score is below ${ASSESSMENT_PASS_PCT}%.`);
  if (!safetyOk) failReasons.push(`${safety.length - safetyCorrect} safety-critical question${safety.length - safetyCorrect === 1 ? " was" : "s were"} wrong. These must all be right, whatever the total score.`);
  if (safetyOk && !criticalOk) failReasons.push("A question on a critical concept was wrong. Critical concepts must all be right.");
  if (!appliedOk) failReasons.push("The applied scenario was not handled soundly.");
  // Floored, so a score below the pass mark can never be displayed as the pass mark.
  return { correct, total, pct: total ? Math.floor((correct * 100) / total) : 0, scoreOk, safetyTotal: safety.length, safetyCorrect, safetyOk, criticalOk, appliedOk, passed, wrongConcepts, failReasons };
}

// ── Question selection ─────────────────────────────────────────────────────

export type Selection = { questionIds: string[]; /** Concepts whose pool ran out, so a seen question was reused. */ reusedConcepts: string[] };

export function questionsOf(bank: TrackAssessment, conceptId: string): AssessmentQuestion[] {
  return bank.questions.filter((q) => q.concept === conceptId);
}

/** For each question id, the index of the last attempt it appeared in (higher = more recent). */
export function lastSeen(attempts: readonly AssessmentAttempt[]): Map<string, number> {
  const m = new Map<string, number>();
  attempts.forEach((a, i) => a.items.forEach((it) => m.set(it.q, i)));
  return m;
}

// ── Attempt order ──────────────────────────────────────────────────────────

const isSeq = (n: unknown): n is number => typeof n === "number" && Number.isSafeInteger(n) && n > 0;

/** A stable identity for an attempt (its time and graded items), used to dedupe merges and break seq ties. */
export function attemptKey(a: Pick<AssessmentAttempt, "at" | "items">): string {
  return `${a.at}|${a.items.map((i) => `${i.q}:${i.ok ? 1 : 0}`).join(",")}`;
}

/**
 * Give every attempt a sequence number. Attempts already numbered keep theirs; older data
 * without one is numbered in its STORED order (the order the attempts were recorded), never
 * by date, because dates are only as good as the device clock. Deterministic.
 */
export function withSeq(attempts: readonly AssessmentAttempt[]): AssessmentAttempt[] {
  if (attempts.every((a) => isSeq(a.seq))) return [...attempts];
  let next = 1;
  return attempts.map((a) => {
    if (isSeq(a.seq)) { next = Math.max(next, a.seq + 1); return a; }
    return { ...a, seq: next++ };
  });
}

/**
 * Attempts in recorded order: by sequence number (assigned on submit as the highest so far + 1).
 * Two tabs that each submitted attempt N keep both; the tie is broken by time, then by attemptKey,
 * so every device sorts them the same way. The gate always uses the LAST attempt in this order.
 */
export function orderAttempts(attempts: readonly AssessmentAttempt[]): AssessmentAttempt[] {
  return withSeq(attempts).sort((x, y) => x.seq! - y.seq! || Date.parse(x.at) - Date.parse(y.at) || (attemptKey(x) < attemptKey(y) ? -1 : attemptKey(x) > attemptKey(y) ? 1 : 0));
}

/**
 * Pick one question per concept, preferring questions never seen before.
 * Deterministic for a given (seen, seed). If a concept's pool is exhausted,
 * the question seen longest ago is reused and the concept is reported.
 * The applied scenario is placed last; the rest are shuffled.
 */
export function selectQuestions(bank: TrackAssessment, attempts: readonly AssessmentAttempt[], seed: string): Selection {
  const seen = lastSeen(attempts);
  const picked: AssessmentQuestion[] = [];
  const reusedConcepts: string[] = [];
  for (const c of bank.concepts) {
    const pool = questionsOf(bank, c.id);
    if (!pool.length) continue;
    const unseen = pool.filter((q) => !seen.has(q.id));
    if (unseen.length) {
      picked.push(seededShuffle(unseen, `${seed}:${c.id}`)[0]);
    } else {
      const oldest = Math.min(...pool.map((q) => seen.get(q.id)!));
      const candidates = pool.filter((q) => seen.get(q.id) === oldest);
      picked.push(seededShuffle(candidates, `${seed}:${c.id}:reuse`)[0]);
      reusedConcepts.push(c.id);
    }
  }
  const conceptById = new Map(bank.concepts.map((c) => [c.id, c]));
  const applied = picked.filter((q) => conceptById.get(q.concept)?.applied);
  const rest = seededShuffle(picked.filter((q) => !conceptById.get(q.concept)?.applied), `${seed}:order`);
  return { questionIds: [...rest, ...applied].map((q) => q.id), reusedConcepts };
}

// ── Grading ────────────────────────────────────────────────────────────────

/** Grade the answers to a set of questions into stored item results (with the concept flags). */
export function gradeAttempt(bank: TrackAssessment, questionIds: readonly string[], answers: Readonly<Record<string, StoredAnswer>>): AssessmentItemResult[] {
  const qById = new Map(bank.questions.map((q) => [q.id, q]));
  const cById = new Map(bank.concepts.map((c) => [c.id, c]));
  const out: AssessmentItemResult[] = [];
  for (const id of questionIds) {
    const q = qById.get(id);
    const c = q && cById.get(q.concept);
    if (!q || !c) continue;
    const r: AssessmentItemResult = { q: q.id, c: c.id, ok: gradeItem(q.item, answers[id]).correct };
    if (c.safetyCritical) r.safety = true;
    if (c.critical || c.safetyCritical) r.critical = true;
    if (c.applied) r.applied = true;
    out.push(r);
  }
  return out;
}

// ── Remediation ────────────────────────────────────────────────────────────

/** The draw seed for attempt `attemptNo`: the learner's stored seed (if any), the track and the attempt number. */
export function drawSeed(trackId: string, attemptNo: number, learnerSeed?: string): string {
  return `${learnerSeed ? `${learnerSeed}:` : ""}${trackId}:attempt:${attemptNo}`;
}

/** A new random learner seed (client only; falls back to Math.random). */
export function newLearnerSeed(): string {
  try {
    const a = new Uint32Array(2);
    globalThis.crypto.getRandomValues(a);
    return [...a].map((x) => x.toString(36)).join("").slice(0, 16).padEnd(6, "0");
  } catch {
    return Math.random().toString(36).slice(2, 14).padEnd(6, "0");
  }
}

/**
 * Is a stored draft still usable with this bank? It must name exactly one known
 * question for every concept. A draft that fails this (e.g. after a content
 * update removed questions) is discarded rather than patched, so every attempt
 * is a complete, consistent draw.
 */
export function isDraftValid(bank: TrackAssessment, draft: { questionIds: readonly string[] } | null | undefined): boolean {
  if (!draft) return false;
  const qById = new Map(bank.questions.map((q) => [q.id, q]));
  const concepts = new Set<string>();
  for (const id of draft.questionIds) {
    const q = qById.get(id);
    if (!q || concepts.has(q.concept)) return false;
    concepts.add(q.concept);
  }
  return concepts.size === bank.concepts.length && bank.concepts.every((c) => concepts.has(c.id));
}

/** A concept's remediation variants (the first is `remediation`). */
export function remediationVariants(c: AssessmentConcept): AssessmentConcept["remediation"][] {
  return [c.remediation, ...(c.moreRemediation ?? [])];
}

/**
 * Which remediation variant to show for a concept after the attempt at index `upTo`
 * (default: the last one): rotates with the number of attempts in which the concept was missed.
 */
export function remediationVariantIndex(c: AssessmentConcept, attempts: readonly AssessmentAttempt[], upTo = attempts.length - 1): number {
  let misses = 0;
  for (let i = 0; i <= upTo && i < attempts.length; i++) if (attempts[i].items.some((it) => it.c === c.id && !it.ok)) misses++;
  return Math.max(0, misses - 1) % remediationVariants(c).length;
}

/**
 * Was concept `c`'s remediation recorded for the attempt at `attemptAt` (sequence number
 * `attemptSeq`, when known), and not stamped in the future? The link names the attempt by its
 * time and its seq, so two attempts that share one of them (two tabs) are still told apart.
 */
export function remediationDone(p: TrackAssessmentProgress | undefined, c: string, attemptAt: string, now?: Date, attemptSeq?: number): boolean {
  const t = p?.remediation[c];
  if (!t) return false;
  if (now && Date.parse(t) > now.getTime() + FUTURE_GRACE_MS) return false;
  const forAt = p?.remediationFor?.[c];
  if (forAt) {
    if (forAt !== attemptAt) return false;
    const forSeq = p?.remediationForSeq?.[c];
    return forSeq === undefined || attemptSeq === undefined || forSeq === attemptSeq;
  }
  return Date.parse(t) > Date.parse(attemptAt);
}

const FUTURE_GRACE_MS = 5 * 60_000;
/** A passing attempt stamped up to this far ahead of the clock still counts (a clock that ran ahead). */
export const PASS_FUTURE_GRACE_MS = 24 * 3600_000;

export type AssessmentState = {
  attempts: number;
  last: (AttemptScore & { at: string }) | null;
  /** Best score % of any passed attempt (the track mastery score), or null. */
  masteryScore: number | null;
  passed: boolean;
  inProgress: boolean;
  /** Concepts that need remediation before the retest (latest attempt failed). */
  remediationRequired: string[];
  remediationDone: string[];
  remediationPending: string[];
  /** A new attempt may start: no attempt yet, the track already passed (practice), or every required remediation is done. */
  canStart: boolean;
  /** The latest attempt is a practice retake (it came after the first pass). */
  lastIsPractice: boolean;
};

/**
 * The state of one track's assessment. Pass `bank` to ignore concepts the bank no
 * longer has (old or edited data) and to check that a draft is still usable.
 *
 * Clock rules (a device clock can be wrong in either direction):
 * - The remediation GATE is decided from the latest RECORDED attempt (highest seq), whatever its date.
 *   Moving the clock back after a fail makes that attempt look "in the future", but it
 *   still locks the retest until its remediation is done (remediation is linked to the
 *   attempt by order, see remediationDone).
 * - For PASSES and the mastery score, a future-dated attempt counts only if it is a
 *   pass stamped no more than 24 hours ahead (PASS_FUTURE_GRACE_MS): a clock that ran
 *   ahead when you passed does not hide the pass until real time catches up, while
 *   wildly future-dated data (edited, corrupt) is still ignored. A future-dated fail
 *   never matters for passing, since an earlier pass is never removed.
 */
export function assessmentState(p: TrackAssessmentProgress | undefined, now?: Date, bank?: TrackAssessment): AssessmentState {
  // Recorded order (seq), not dates: the gate is the attempt recorded last.
  const stored = orderAttempts(p?.attempts ?? []);
  const lastA = stored.length ? stored[stored.length - 1] : null;
  const last = lastA ? { ...scoreAttempt(lastA.items), at: lastA.at } : null;
  const passLimit = now ? now.getTime() + PASS_FUTURE_GRACE_MS : Infinity;
  let masteryScore: number | null = null;
  let firstPass = -1;
  for (let i = 0; i < stored.length; i++) {
    const s = scoreAttempt(stored[i].items);
    if (s.passed && Date.parse(stored[i].at) <= passLimit) {
      masteryScore = Math.max(masteryScore ?? 0, s.pct);
      if (firstPass < 0) firstPass = i;
    }
  }
  const passed = masteryScore !== null;
  const known = bank ? new Set(bank.concepts.map((c) => c.id)) : null;
  // Remediation is required only while the track is not passed; after a pass, misses are practice.
  const remediationRequired = !passed && last && !last.passed ? last.wrongConcepts.filter((c) => !known || known.has(c)) : [];
  const done = remediationRequired.filter((c) => remediationDone(p, c, last!.at, now, lastA!.seq));
  const remediationPending = remediationRequired.filter((c) => !done.includes(c));
  return {
    attempts: stored.length,
    last,
    masteryScore,
    passed,
    inProgress: bank ? isDraftValid(bank, p?.draft) : !!p?.draft,
    remediationRequired,
    remediationDone: done,
    remediationPending,
    canStart: remediationPending.length === 0,
    lastIsPractice: firstPass >= 0 && stored.length - 1 > firstPass,
  };
}

/** Concepts by id, for UIs. */
export function conceptMap(bank: TrackAssessment): Map<string, AssessmentConcept> {
  return new Map(bank.concepts.map((c) => [c.id, c]));
}
