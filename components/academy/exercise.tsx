"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, CheckCircle2, RotateCcw, X } from "lucide-react";
import type { CalculateExercise, ClassifyExercise, Exercise, MatchExercise, OrderExercise } from "@/lib/academy/types";
import { completeExercise, getLessonProgress } from "@/lib/academy/progress";
import { deterministicShuffle, parseTypedNumber } from "@/lib/academy/shuffle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { RichText } from "./rich-text";
import { useProgress } from "./progress-provider";

const KIND_LABEL: Record<Exercise["kind"], string> = {
  order: "Put in order",
  classify: "Sort into groups",
  match: "Match pairs",
  calculate: "Calculate",
};

type Feedback = { tone: "good" | "bad" | "info"; text: ReactNode } | null;

function FeedbackLine({ feedback }: { feedback: Feedback }) {
  return (
    <div aria-live="polite" role="status" className="min-h-5">
      {feedback && (
        <p
          className={cn(
            "flex items-start gap-1.5 text-[13px] leading-relaxed",
            feedback.tone === "good" ? "text-up" : feedback.tone === "bad" ? "text-warn" : "text-fg-muted",
          )}
        >
          {feedback.tone === "good" && <CheckCircle2 className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />}
          <span>{feedback.text}</span>
        </p>
      )}
    </div>
  );
}

function Mark({ ok }: { ok: boolean | undefined }) {
  if (ok === undefined) return null;
  return ok ? (
    <span className="inline-flex items-center gap-1 text-[11px] text-up"><Check className="size-3.5" strokeWidth={2.5} aria-hidden />Right</span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] text-warn"><X className="size-3.5" strokeWidth={2.5} aria-hidden />Not yet</span>
  );
}

/** Shared frame: title, prompt, body and the "completed" state. */
export function ExerciseView({ lessonId, exercise }: { lessonId: string; exercise: Exercise }) {
  const { ready, state, update } = useProgress();
  const completedAt = ready ? getLessonProgress(state, lessonId)?.exerciseCompletedAt ?? null : null;
  const [attempt, setAttempt] = useState(0);
  const onSolved = () => update((s, now) => completeExercise(s, lessonId, now));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-line-strong px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] text-fg-subtle">
            {KIND_LABEL[exercise.kind]}
          </span>
          <h3 className="text-sm font-medium">{exercise.title}</h3>
        </div>
        {completedAt && (
          <span className="inline-flex items-center gap-1 text-xs text-up">
            <CheckCircle2 className="size-3.5" strokeWidth={1.75} aria-hidden /> Solved
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-fg-muted"><RichText text={exercise.prompt} /></p>
      <div key={attempt}>
        {exercise.kind === "order" && <OrderBody ex={exercise} onSolved={onSolved} />}
        {exercise.kind === "classify" && <ClassifyBody ex={exercise} onSolved={onSolved} />}
        {exercise.kind === "match" && <MatchBody ex={exercise} onSolved={onSolved} />}
        {exercise.kind === "calculate" && <CalculateBody ex={exercise} onSolved={onSolved} />}
      </div>
      {completedAt && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <p className="text-xs text-fg-subtle">Solved on {new Date(completedAt).toLocaleDateString()}. Practising again does not change that.</p>
          <Button variant="ghost" onClick={() => setAttempt((a) => a + 1)}>
            <RotateCcw className="size-3.5" aria-hidden /> Practise again
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Order ──────────────────────────────────────────────────────────────────

function OrderBody({ ex, onSolved }: { ex: OrderExercise; onSolved: () => void }) {
  const [items, setItems] = useState(() => deterministicShuffle(ex.items, ex.id));
  const [results, setResults] = useState<Record<string, boolean> | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  // Focus follows the moved item. If its button became disabled (top or bottom), use the other one.
  const buttons = useRef(new Map<string, HTMLButtonElement | null>());
  const [pendingFocus, setPendingFocus] = useState<{ id: string; dir: -1 | 1 } | null>(null);
  useEffect(() => {
    if (!pendingFocus) return;
    const same = buttons.current.get(`${pendingFocus.id}:${pendingFocus.dir}`);
    const other = buttons.current.get(`${pendingFocus.id}:${-pendingFocus.dir}`);
    (same && !same.disabled ? same : other)?.focus();
    setPendingFocus(null);
  }, [pendingFocus, items]);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    setPendingFocus({ id: items[i].id, dir });
    setResults(null);
    setFeedback({ tone: "info", text: `Moved "${items[i].text}" to position ${j + 1}.` });
  };

  const check = () => {
    const r: Record<string, boolean> = {};
    items.forEach((it, i) => (r[it.id] = ex.items[i].id === it.id));
    const right = Object.values(r).filter(Boolean).length;
    setResults(r);
    if (right === items.length) {
      setFeedback({ tone: "good", text: <><strong className="font-medium">All in the right order.</strong> {ex.explanation}</> });
      onSolved();
    } else {
      setFeedback({ tone: "bad", text: `${right} of ${items.length} are in the right place. Move the others and check again.` });
    }
  };

  return (
    <div className="space-y-3">
      <ol className="space-y-1.5">
        {items.map((it, i) => (
          <li
            key={it.id}
            className={cn(
              "flex items-center gap-2 rounded-lg border bg-surface px-2.5 py-2",
              results ? (results[it.id] ? "border-up/40" : "border-warn/40") : "border-line",
            )}
          >
            <span className="w-5 shrink-0 text-center font-mono text-xs tabular text-fg-subtle">{i + 1}</span>
            <span className="min-w-0 flex-1 text-[13px]">{it.text}</span>
            <Mark ok={results?.[it.id]} />
            <span className="flex shrink-0 gap-1">
              <button
                ref={(el) => {
                  buttons.current.set(`${it.id}:-1`, el);
                }}
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`Move "${it.text}" up`}
                className="grid size-8 place-items-center rounded-md border border-line-strong text-fg-muted hover:bg-raised hover:text-fg disabled:opacity-30"
              >
                <ArrowUp className="size-3.5" aria-hidden />
              </button>
              <button
                ref={(el) => {
                  buttons.current.set(`${it.id}:1`, el);
                }}
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                aria-label={`Move "${it.text}" down`}
                className="grid size-8 place-items-center rounded-md border border-line-strong text-fg-muted hover:bg-raised hover:text-fg disabled:opacity-30"
              >
                <ArrowDown className="size-3.5" aria-hidden />
              </button>
            </span>
          </li>
        ))}
      </ol>
      <Button variant="primary" onClick={check}>Check order</Button>
      <FeedbackLine feedback={feedback} />
    </div>
  );
}

// ── Classify ───────────────────────────────────────────────────────────────

function ClassifyBody({ ex, onSolved }: { ex: ClassifyExercise; onSolved: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean> | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const allAnswered = ex.items.every((it) => answers[it.id]);

  const check = () => {
    if (!allAnswered) {
      setFeedback({ tone: "bad", text: "Choose a group for every item first." });
      return;
    }
    const r: Record<string, boolean> = {};
    for (const it of ex.items) r[it.id] = answers[it.id] === it.category;
    const right = Object.values(r).filter(Boolean).length;
    setResults(r);
    if (right === ex.items.length) {
      setFeedback({ tone: "good", text: <strong className="font-medium">All correct.</strong> });
      onSolved();
    } else {
      setFeedback({ tone: "bad", text: `${right} of ${ex.items.length} correct. Read the notes under the ones marked "Not yet", change them and check again.` });
    }
  };

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {ex.items.map((it) => (
          <li key={it.id}>
            <fieldset
              className={cn(
                "rounded-lg border bg-surface px-3 py-2.5",
                results ? (results[it.id] ? "border-up/40" : "border-warn/40") : "border-line",
              )}
            >
              <legend className="sr-only">{it.text}</legend>
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] leading-snug" aria-hidden>{it.text}</p>
                <Mark ok={results?.[it.id]} />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ex.categories.map((c) => (
                  <label
                    key={c.id}
                    className={cn(
                      "cursor-pointer rounded-md border px-2.5 py-1 text-xs transition-colors",
                      "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                      answers[it.id] === c.id ? "border-accent bg-accent-soft text-fg" : "border-line-strong text-fg-muted hover:bg-raised",
                    )}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name={`${ex.id}-${it.id}`}
                      value={c.id}
                      checked={answers[it.id] === c.id}
                      onChange={() => {
                        setAnswers((a) => ({ ...a, [it.id]: c.id }));
                        setResults(null);
                        setFeedback(null);
                      }}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
              {results && (
                <p className={cn("mt-2 text-xs leading-relaxed", results[it.id] ? "text-fg-muted" : "text-warn")}>
                  {results[it.id] ? it.explain : "Think again about this one."}
                </p>
              )}
            </fieldset>
          </li>
        ))}
      </ul>
      <Button variant="primary" onClick={check}>Check answers</Button>
      <FeedbackLine feedback={feedback} />
    </div>
  );
}

// ── Match ──────────────────────────────────────────────────────────────────

function MatchBody({ ex, onSolved }: { ex: MatchExercise; onSolved: () => void }) {
  const options = useMemo(() => deterministicShuffle(ex.pairs, ex.id + ":right"), [ex]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean> | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const check = () => {
    if (!ex.pairs.every((p) => answers[p.id])) {
      setFeedback({ tone: "bad", text: "Choose a match for every item first." });
      return;
    }
    const r: Record<string, boolean> = {};
    for (const p of ex.pairs) r[p.id] = answers[p.id] === p.id;
    const right = Object.values(r).filter(Boolean).length;
    setResults(r);
    if (right === ex.pairs.length) {
      setFeedback({ tone: "good", text: <><strong className="font-medium">All matched.</strong> {ex.explanation}</> });
      onSolved();
    } else {
      setFeedback({ tone: "bad", text: `${right} of ${ex.pairs.length} matched correctly. Change the ones marked "Not yet" and check again.` });
    }
  };

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {ex.pairs.map((p) => {
          const selectId = `${ex.id}-${p.id}`;
          return (
            <li
              key={p.id}
              className={cn(
                "grid gap-1.5 rounded-lg border bg-surface px-3 py-2.5 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_auto] sm:items-center sm:gap-3",
                results ? (results[p.id] ? "border-up/40" : "border-warn/40") : "border-line",
              )}
            >
              <label htmlFor={selectId} className="text-[13px] font-medium">{p.left}</label>
              <select
                id={selectId}
                value={answers[p.id] ?? ""}
                onChange={(e) => {
                  setAnswers((a) => ({ ...a, [p.id]: e.target.value }));
                  setResults(null);
                  setFeedback(null);
                }}
                className="h-9 w-full min-w-0 rounded-md border border-line-strong bg-raised px-2 text-[13px] text-fg"
              >
                <option value="" disabled>Choose a meaning…</option>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>{o.right}</option>
                ))}
              </select>
              <Mark ok={results?.[p.id]} />
            </li>
          );
        })}
      </ul>
      <Button variant="primary" onClick={check}>Check matches</Button>
      <FeedbackLine feedback={feedback} />
    </div>
  );
}

// ── Calculate ──────────────────────────────────────────────────────────────

function CalculateBody({ ex, onSolved }: { ex: CalculateExercise; onSolved: () => void }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const inputId = `${ex.id}-input`;

  const check = () => {
    const n = parseTypedNumber(value);
    if (n === null) {
      setFeedback({ tone: "bad", text: "Enter a number, for example 120 or -1.5." });
      return;
    }
    if (Math.abs(n - ex.answer) <= ex.tolerance + 1e-9) {
      setSolved(true);
      setFeedback({ tone: "good", text: <><strong className="font-medium">Correct.</strong> {ex.solution}</> });
      onSolved();
    } else {
      setWrong((w) => w + 1);
      setFeedback({ tone: "bad", text: <>Not quite. Hint: {ex.hint}</> });
    }
  };

  return (
    <div className="space-y-3">
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          check();
        }}
      >
        <div className="min-w-0">
          <label htmlFor={inputId} className="block text-xs text-fg-subtle">Your answer ({ex.unit})</label>
          <input
            id={inputId}
            inputMode="decimal"
            autoComplete="off"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (!solved) setFeedback(null);
            }}
            className="mt-1 h-9 w-40 max-w-full rounded-md border border-line-strong bg-raised px-2.5 font-mono text-sm tabular text-fg"
          />
        </div>
        <Button type="submit" variant="primary" className="h-9">Check</Button>
      </form>
      <FeedbackLine feedback={feedback} />
      {!solved && wrong >= 2 && (
        <div className="text-[13px]">
          {showSolution ? (
            <p className="rounded-lg border border-line bg-surface px-3 py-2 text-fg-muted">
              Worked solution: {ex.solution} Type the answer above to finish the exercise.
            </p>
          ) : (
            <Button variant="ghost" className="-ml-3" onClick={() => setShowSolution(true)}>Show the worked solution</Button>
          )}
        </div>
      )}
    </div>
  );
}
