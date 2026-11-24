"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, CheckCircle2, RotateCcw, X, XCircle } from "lucide-react";
import type { QuizQuestion } from "@/lib/academy/types";
import { PASS_MARK, getLessonProgress, isPass, recordQuizAttempt, scorePct } from "@/lib/academy/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { seededShuffle } from "@/lib/academy/shuffle";
import { RichText } from "./rich-text";
import { useProgress } from "./progress-provider";

type Phase = "intro" | "question" | "results";

const PASS_PCT = Math.round(PASS_MARK * 100);

export function Quiz({ lessonId, questions }: { lessonId: string; questions: QuizQuestion[] }) {
  const { ready, state, update, readOnly } = useProgress();
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Options are shuffled for each attempt (seeded by the attempt number), so answer
  // position can't be memorised. Option ids stay the same, so feedback maps correctly.
  const [seed, setSeed] = useState(0);
  const shuffled = useMemo(
    () => questions.map((qq) => ({ ...qq, options: seededShuffle(qq.options, `${lessonId}:${qq.id}:${seed}`) })),
    [questions, lessonId, seed],
  );
  const questionRef = useRef<HTMLLegendElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const resultsRef = useRef<HTMLHeadingElement>(null);

  const attempts = ready ? getLessonProgress(state, lessonId)?.quizAttempts ?? [] : [];
  const best = attempts.reduce<number | null>((b, a) => Math.max(b ?? 0, scorePct(a)), null);
  const q = shuffled[idx];

  useEffect(() => {
    if (phase === "question" && !checked) questionRef.current?.focus();
  }, [phase, idx, checked]);
  useEffect(() => {
    if (checked) nextRef.current?.focus();
  }, [checked]);
  useEffect(() => {
    if (phase === "results") resultsRef.current?.focus();
  }, [phase]);

  const start = () => {
    setSeed(attempts.length + 1);
    setAnswers({});
    setIdx(0);
    setSelected(null);
    setChecked(false);
    setPhase("question");
  };

  const checkAnswer = () => {
    if (!selected) return;
    setAnswers((a) => ({ ...a, [q.id]: selected }));
    setChecked(true);
  };

  const next = () => {
    if (idx < questions.length - 1) {
      setIdx(idx + 1);
      setSelected(null);
      setChecked(false);
      return;
    }
    const final = { ...answers };
    const correct = questions.filter((qq) => final[qq.id] === qq.correct).length;
    update((s, now) => recordQuizAttempt(s, lessonId, correct, questions.length, now));
    setPhase("results");
  };

  if (phase === "intro") {
    return (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-fg-muted">
          {questions.length} multiple-choice questions, one at a time. You see why each answer is right or wrong as you go.
          Score {PASS_PCT}% or more to pass. You can retake it as often as you like; your best score counts toward completion.
        </p>
        <AttemptHistory attempts={attempts} best={best} />
        <Button variant="primary" onClick={start}>
          {attempts.length ? "Retake quiz" : "Start quiz"} <ArrowRight className="size-3.5" aria-hidden />
        </Button>
      </div>
    );
  }

  if (phase === "results") {
    const correct = questions.filter((qq) => answers[qq.id] === qq.correct).length;
    const pct = scorePct({ correct, total: questions.length });
    const passed = isPass(correct, questions.length);
    return (
      <div className="space-y-4">
        <div className={cn("rounded-lg border px-4 py-3", passed ? "border-up/30 bg-up-soft" : "border-warn/30 bg-warn-soft")}>
          <h3 ref={resultsRef} tabIndex={-1} className="flex items-center gap-2 text-sm font-medium outline-none">
            {passed ? <CheckCircle2 className="size-4 text-up" aria-hidden /> : <XCircle className="size-4 text-warn" aria-hidden />}
            You scored {correct} of {questions.length} ({pct}%)
          </h3>
          <p className="mt-1 text-[13px] text-fg-muted">
            {readOnly
              ? `Preview mode: this attempt was not saved and does not count. ${passed ? "That would be a pass." : `The pass mark is ${PASS_PCT}%.`}`
              : passed
              ? `That is a pass (${PASS_PCT}% or more). This attempt has been saved.`
              : `The pass mark is ${PASS_PCT}%. Read the explanations below, revisit the sections they point to, and try again.`}
          </p>
        </div>
        <ol className="space-y-3">
          {shuffled.map((qq, i) => (
            <li key={qq.id} className="rounded-lg border border-line bg-surface p-3">
              <p className="text-[13px] font-medium">
                {i + 1}. <RichText text={qq.prompt} />
              </p>
              <ul className="mt-2 space-y-1.5">
                {qq.options.map((o) => {
                  const isCorrect = o.id === qq.correct;
                  const yours = answers[qq.id] === o.id;
                  return (
                    <li key={o.id} className="text-xs leading-relaxed">
                      <div className="flex items-start gap-1.5">
                        {isCorrect ? (
                          <Check className="mt-0.5 size-3.5 shrink-0 text-up" strokeWidth={2.5} aria-hidden />
                        ) : (
                          <X className={cn("mt-0.5 size-3.5 shrink-0", yours ? "text-warn" : "text-fg-subtle")} strokeWidth={2.5} aria-hidden />
                        )}
                        <span className={cn(isCorrect ? "text-fg" : "text-fg-muted")}>
                          {o.text}
                          {yours && <span className="ml-1 rounded border border-line-strong px-1 text-[10px] text-fg-subtle">your answer</span>}
                          {isCorrect && <span className="sr-only"> (correct answer)</span>}
                          <span className="block text-fg-subtle"><RichText text={o.explain} /></span>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
        <AttemptHistory attempts={attempts} best={best} />
        <Button variant="secondary" onClick={start}>
          <RotateCcw className="size-3.5" aria-hidden /> Retake quiz
        </Button>
      </div>
    );
  }

  const chosen = q.options.find((o) => o.id === answers[q.id]);
  const right = q.options.find((o) => o.id === q.correct)!;
  const gotIt = checked && answers[q.id] === q.correct;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-fg-subtle">
        <span className="tabular">Question {idx + 1} of {questions.length}</span>
        <span className="tabular" aria-hidden>
          {questions.map((qq, i) => (
            <span
              key={qq.id}
              className={cn(
                "ml-1 inline-block size-1.5 rounded-full",
                i < idx ? (answers[qq.id] === qq.correct ? "bg-up" : "bg-warn") : i === idx ? "bg-accent" : "bg-line-strong",
              )}
            />
          ))}
        </span>
      </div>
      <fieldset>
        <legend ref={questionRef} tabIndex={-1} className="text-sm font-medium leading-snug outline-none">
          <RichText text={q.prompt} />
        </legend>
        <div className="mt-3 space-y-1.5">
          {q.options.map((o) => {
            const isSel = (checked ? answers[q.id] : selected) === o.id;
            const showRight = checked && o.id === q.correct;
            const showWrong = checked && isSel && o.id !== q.correct;
            return (
              <label
                key={o.id}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-[13px] transition-colors",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                  showRight ? "border-up/50 bg-up-soft" : showWrong ? "border-warn/50 bg-warn-soft" : isSel ? "border-accent bg-accent-soft" : "border-line bg-surface hover:bg-raised",
                  checked && "cursor-default",
                )}
              >
                <input
                  type="radio"
                  name={`${lessonId}-${q.id}`}
                  value={o.id}
                  checked={isSel}
                  disabled={checked}
                  onChange={() => setSelected(o.id)}
                  className="mt-0.5 accent-[var(--color-accent)]"
                />
                <span className="flex-1">{o.text}</span>
                {showRight && <Check className="mt-0.5 size-4 shrink-0 text-up" aria-hidden />}
                {showWrong && <X className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden />}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div aria-live="polite" role="status">
        {checked && chosen && (
          <div className={cn("rounded-lg border px-3 py-2.5 text-[13px] leading-relaxed", gotIt ? "border-up/30" : "border-warn/30")}>
            <p className={cn("font-medium", gotIt ? "text-up" : "text-warn")}>{gotIt ? "Correct." : "Not quite."}</p>
            <p className="mt-0.5 text-fg-muted"><RichText text={chosen.explain} /></p>
            {!gotIt && (
              <p className="mt-1.5 text-fg-muted">
                <span className="text-fg">Right answer: {right.text}.</span> <RichText text={right.explain} />
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!checked ? (
          <Button variant="primary" onClick={checkAnswer} disabled={!selected}>Check answer</Button>
        ) : (
          <Button ref={nextRef} variant="primary" onClick={next}>
            {idx < questions.length - 1 ? "Next question" : "See results"} <ArrowRight className="size-3.5" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}

function AttemptHistory({ attempts, best }: { attempts: { at: string; correct: number; total: number }[]; best: number | null }) {
  if (!attempts.length) return null;
  const recent = attempts.slice(-5).reverse();
  return (
    <div className="text-xs text-fg-subtle">
      <p>
        Best score: <span className="font-mono tabular text-fg">{best}%</span> · {attempts.length} attempt{attempts.length === 1 ? "" : "s"}
      </p>
      <ul className="mt-1 space-y-0.5">
        {recent.map((a) => (
          <li key={a.at} className="tabular">
            {new Date(a.at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · {a.correct}/{a.total} ({scorePct(a)}%)
            {isPass(a.correct, a.total) ? " · pass" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
