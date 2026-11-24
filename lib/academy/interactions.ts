import type { AnswerValue, ChartAnnotateItem, GradedItem } from "./types";

/**
 * Pure graders for the generic interactions. Every graded kind returns the
 * same shape, so lessons, assessments and remediation share one scorer.
 *
 * Scenario items are scored on the PROCESS: only a "sound" decision counts as
 * correct. "partial" earns half credit in `score` (shown as feedback), but
 * never counts as correct in an assessment.
 */
export type Grade = { correct: boolean; /** 0–1 */ score: number; answered: boolean };

const NOT_ANSWERED: Grade = { correct: false, score: 0, answered: false };

const sameSet = (a: readonly string[], b: readonly string[]) => {
  const A = new Set(a), B = new Set(b);
  return A.size === B.size && [...A].every((x) => B.has(x));
};

/** True if `answer` has the right shape for this item (used to validate stored drafts). */
export function isAnswerShape(item: GradedItem, answer: unknown): answer is AnswerValue {
  switch (item.kind) {
    case "single":
    case "scenario":
      return typeof answer === "string";
    case "true-false":
      return typeof answer === "boolean";
    case "numeric":
    case "chart-annotate":
      return typeof answer === "number" && Number.isFinite(answer);
    case "multi-select":
    case "find-error":
      return Array.isArray(answer) && answer.every((x) => typeof x === "string");
  }
}

export function gradeItem(item: GradedItem, answer: AnswerValue | undefined | null): Grade {
  if (answer === undefined || answer === null || !isAnswerShape(item, answer)) return NOT_ANSWERED;
  switch (item.kind) {
    case "single": {
      const ok = answer === item.correct;
      return { correct: ok, score: ok ? 1 : 0, answered: true };
    }
    case "true-false": {
      const ok = answer === item.answer;
      return { correct: ok, score: ok ? 1 : 0, answered: true };
    }
    case "numeric": {
      // A tiny epsilon so 0.1 + 0.2 style rounding never rejects a right answer.
      const ok = Math.abs((answer as number) - item.answer) <= item.tolerance + 1e-9;
      return { correct: ok, score: ok ? 1 : 0, answered: true };
    }
    case "multi-select": {
      const ok = sameSet(answer as string[], item.correct);
      return { correct: ok, score: ok ? 1 : 0, answered: true };
    }
    case "find-error": {
      const wrong = item.lines.filter((l) => l.error).map((l) => l.id);
      const ok = sameSet(answer as string[], wrong);
      return { correct: ok, score: ok ? 1 : 0, answered: true };
    }
    case "scenario": {
      const o = item.options.find((x) => x.id === answer);
      if (!o) return NOT_ANSWERED;
      return { correct: o.process === "sound", score: o.process === "sound" ? 1 : o.process === "partial" ? 0.5 : 0, answered: true };
    }
    case "chart-annotate": {
      const ok = Math.abs((answer as number) - item.target.value) <= item.target.tolerance + 1e-9;
      return { correct: ok, score: ok ? 1 : 0, answered: true };
    }
  }
}

/** The correct answer for an item, in AnswerValue form (used by tests and the "show answer" text). */
export function correctAnswer(item: GradedItem): AnswerValue {
  switch (item.kind) {
    case "single": return item.correct;
    case "true-false": return item.answer;
    case "numeric": return item.answer;
    case "multi-select": return [...item.correct];
    case "find-error": return item.lines.filter((l) => l.error).map((l) => l.id);
    case "scenario": return item.options.find((o) => o.process === "sound")!.id;
    case "chart-annotate": return item.target.value;
  }
}

/** Chart geometry shared by the chart-annotation component and its tests. */
export function chartScale(item: Pick<ChartAnnotateItem, "series">, height: number, pad = 0.08) {
  const lo = Math.min(...item.series), hi = Math.max(...item.series);
  const span = hi - lo || 1;
  const min = lo - span * pad, max = hi + span * pad;
  return {
    min,
    max,
    /** value → y (0 at top) */
    y: (v: number) => ((max - v) / (max - min)) * height,
    /** y → value */
    value: (y: number) => max - (y / height) * (max - min),
  };
}

/** Round a value to an item's tick (10^-decimals), avoiding float noise. */
export function roundTo(v: number, decimals: number) {
  const f = 10 ** decimals;
  return Math.round(v * f) / f;
}
