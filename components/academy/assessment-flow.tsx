"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle2, ClipboardCheck, RotateCcw, ShieldAlert, X, XCircle } from "lucide-react";
import { getAssessment } from "@/lib/academy/assessments";
import {
  ASSESSMENT_PASS_PCT, assessmentState, conceptMap, drawSeed, gradeAttempt, isDraftValid, newLearnerSeed,
  orderAttempts, remediationDone, remediationVariantIndex, remediationVariants, scoreAttempt, selectQuestions,
} from "@/lib/academy/assessment";
import { getLesson, getTrack, lessonHref } from "@/lib/academy/curriculum";
import { gradeItem } from "@/lib/academy/interactions";
import {
  completeRemediation,
  discardAssessmentDraft,
  getAssessmentProgress,
  saveAssessmentAnswer,
  startAssessment,
  submitAssessment,
  type AssessmentAttempt,
  type AssessmentDraft,
  type StoredAnswer,
} from "@/lib/academy/progress";
import type { AnswerValue, AssessmentQuestion, TrackAssessment } from "@/lib/academy/types";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { CheckItem, Flashcards, ItemFeedback, ItemInput, KIND_LABEL, describeAnswer, itemPrompt } from "./interactions";
import { useProgress } from "./progress-provider";
import { RichText } from "./rich-text";
import { SaveNotice } from "./status";
import { LockedPanel, useTrackProgress } from "./track-gate";

export function AssessmentFlow({ trackId }: { trackId: string }) {
  const { ready, state, update, readOnly, clock } = useProgress();
  const tp = useTrackProgress();
  const bank = getAssessment(trackId)!;
  const track = getTrack(trackId)!;
  const [view, setView] = useState<"auto" | "results">("auto");
  const [staleNotice, setStaleNotice] = useState(false);
  const resultsRef = useRef<HTMLHeadingElement>(null);
  const p = ready ? getAssessmentProgress(state, trackId) : undefined;
  const stale = !!p?.draft && !isDraftValid(bank, p.draft);

  useEffect(() => {
    if (view === "results") resultsRef.current?.focus();
  }, [view]);
  // A draft that no longer matches the bank (content update, edited data) is discarded, never patched.
  useEffect(() => {
    if (!stale) return;
    setStaleNotice(true);
    update((s, now) => {
      const d = getAssessmentProgress(s, trackId)?.draft;
      return d && !isDraftValid(bank, d) ? discardAssessmentDraft(s, trackId, now) : s;
    });
  }, [stale, update, trackId, bank]);

  if (!ready || !tp) return <div className="h-48 rounded-[var(--radius-panel)] border border-line bg-panel" aria-busy="true" aria-label="Loading your progress" />;
  const t = tp.get(trackId)!;
  if (!t.unlocked) return <LockedPanel trackId={trackId} missing={t.missing} what="assessment" />;
  if (readOnly) return <p className="text-sm text-fg-muted">Assessments are not available in Preview mode.</p>;

  const a = t.assessment!;

  if (!t.allLessonsComplete) {
    const todo = t.statuses.filter((s) => !s.complete);
    return (
      <Panel title="Not available yet" hint="The assessment opens once every lesson in the track is complete.">
        <p className="text-sm text-fg-muted" data-assessment-gated>
          {todo.length} of {t.lessonsTotal} lesson{t.lessonsTotal === 1 ? "" : "s"} still to complete. A lesson is complete when every section is read, the exercise is solved and the lesson quiz is passed.
        </p>
        <ul className="mt-3 space-y-1.5">
          {todo.map((s) => {
            const l = getLesson(s.lessonId)!;
            return (
              <li key={l.id}>
                <Link href={lessonHref(l)} className="text-[13px] font-medium text-accent-strong hover:underline">Lesson {l.order}: {l.title}</Link>
              </li>
            );
          })}
        </ul>
      </Panel>
    );
  }

  const start = () => {
    const freshSeed = newLearnerSeed();
    update((s, now) => {
      let cur = getAssessmentProgress(s, trackId);
      if (cur?.draft && isDraftValid(bank, cur.draft)) return s;
      // The gate is checked here too, on the state as stored now, not only by hiding the button.
      if (!assessmentState(cur, now, bank).canStart) return s;
      let base = s;
      if (cur?.draft) { base = discardAssessmentDraft(s, trackId, now); cur = getAssessmentProgress(base, trackId); }
      const seed = cur?.seed ?? freshSeed;
      const sel = selectQuestions(bank, orderAttempts(cur?.attempts ?? []), drawSeed(trackId, (cur?.attempts.length ?? 0) + 1, seed));
      return startAssessment(base, trackId, sel.questionIds, sel.reusedConcepts, now, seed);
    });
    setStaleNotice(false);
    setView("auto");
  };

  if (p?.draft && !stale) {
    return (
      <Runner
        bank={bank}
        draft={p.draft}
        onAnswer={(q, v) => update((s, now) => saveAssessmentAnswer(s, trackId, q, v as StoredAnswer, now))}
        onSubmit={() => {
          update((s, now) => {
            const d = getAssessmentProgress(s, trackId)?.draft;
            if (!d || !isDraftValid(bank, d)) return s;
            return submitAssessment(s, trackId, gradeAttempt(bank, d.questionIds, d.answers), now, d.answers);
          });
          setView("results");
        }}
      />
    );
  }

  // Recorded order (seq), never by date: the attempt shown is the one the gate uses.
  const attempts = orderAttempts(p?.attempts ?? []);
  const lastAttempt = attempts.length ? attempts[attempts.length - 1] : null;
  const nextSel = selectQuestions(bank, attempts, drawSeed(trackId, attempts.length + 1, p?.seed));
  const staleNote = staleNotice && (
    <p className="flex items-start gap-1.5 rounded-lg border border-warn/30 bg-warn-soft px-3 py-2 text-[13px] text-fg" role="status" data-stale-draft>
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warn" aria-hidden />
      <span>This attempt is out of date. Start again. (The questions changed since it was started, so it was set aside unscored.)</span>
    </p>
  );
  const reuseNote = nextSel.reusedConcepts.length > 0 && (
    <p className="flex items-start gap-1.5 text-xs text-warn" role="note" data-reuse-notice>
      <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
      <span>
        You have now seen every question for {nextSel.reusedConcepts.length === bank.concepts.length ? "every concept" : nextSel.reusedConcepts.map((c) => conceptMap(bank).get(c)?.title).join("; ")}.
        Those concepts will repeat a question you have answered before, with its options in a new order.
      </span>
    </p>
  );

  if (!lastAttempt) {
    return (
      <div className="space-y-5">
        {staleNote}
        <Panel title="Before you start" hint={`${bank.concepts.length} questions · ${ASSESSMENT_PASS_PCT}% to pass · every safety-critical question must be right`}>
          <div className="space-y-3 text-sm leading-relaxed text-fg-muted">
            <p><RichText text={bank.intro} /></p>
            <ul className="list-disc space-y-1 pl-5 text-[13px]">
              <li>One question at a time. Your answers are saved as you go, so you can close the page and resume.</li>
              <li>You see the results and explanations only after you submit.</li>
              <li>Safety-critical questions are marked. Missing any of them means a retest, whatever your total score.</li>
              <li>If you do not pass, you will see which concepts you missed, work through each one, and then retest with different questions.</li>
            </ul>
            {reuseNote}
            <Button variant="primary" onClick={start} data-start-assessment>
              <ClipboardCheck className="size-3.5" aria-hidden /> Start assessment
            </Button>
          </div>
        </Panel>
        <Panel title="Revise first (optional)" hint="Flashcards for the key ideas. Nothing here is recorded.">
          <Flashcards item={{ kind: "flashcards", cards: bank.concepts.map((c) => c.flashcard) }} label={`${track.title} revision cards`} />
        </Panel>
        <SaveNotice />
      </div>
    );
  }

  const score = scoreAttempt(lastAttempt.items);
  const known = conceptMap(bank);
  const missed = score.wrongConcepts.filter((c) => known.has(c));
  const practice = a.lastIsPractice;
  return (
    <div className="space-y-5">
      {staleNote}
      <ResultsSummary ref={resultsRef} bank={bank} attempt={lastAttempt} practice={practice} trackPassed={a.passed ? { masteryScore: a.masteryScore ?? 0, complete: t.complete } : undefined} />
      {a.passed ? (
        <Panel title={t.complete ? "Track complete" : "Assessment passed"} hint="The track's mastery score is your best passing score.">
          <div className="space-y-3 text-sm text-fg-muted" data-assessment-passed>
            <p>
              <span className="text-fg">Mastery score: {a.masteryScore}%.</span>{" "}
              {t.complete ? `${track.title} is complete, and the tracks that depend on it are unlocked.` : "Finish every lesson to complete the track."}
            </p>
            {practice && (
              <p className="text-xs" data-practice-result>
                Your latest attempt was a practice retake ({score.correct} of {score.total}, {score.pct}%{score.passed ? ", a pass" : ", not a pass"}). Practice results never remove your pass or your best score.
              </p>
            )}
            {missed.length > 0 && (
              <p className="text-xs">
                {practice ? `This practice retake had ${missed.length} miss${missed.length === 1 ? "" : "es"}.` : `You passed with ${missed.length} non-critical miss${missed.length === 1 ? "" : "es"}.`} Reviewing {missed.length === 1 ? "it" : "them"} below is optional.
              </p>
            )}
            {missed.length > 0 && <RemediationList bank={bank} trackId={trackId} concepts={missed} attemptAt={lastAttempt.at} attemptSeq={lastAttempt.seq} attempts={attempts} now={clock.now} optional />}
            {reuseNote}
            <Button onClick={start}><RotateCcw className="size-3.5" aria-hidden /> Practice retake</Button>
            <p className="text-xs text-fg-subtle">A practice retake is recorded, but it cannot remove a pass you already have, and its misses never lock further practice.</p>
          </div>
        </Panel>
      ) : (
        <Panel title="Remediation" hint="Required before the retest: one card for each concept you missed.">
          <div className="space-y-4">
            <RemediationList bank={bank} trackId={trackId} concepts={missed} attemptAt={lastAttempt.at} attemptSeq={lastAttempt.seq} attempts={attempts} now={clock.now} />
            <div className="space-y-2 border-t border-line pt-3" aria-live="polite">
              {a.canStart ? (
                <>
                  <p className="text-[13px] text-fg">Remediation complete. The retest draws a new question for every concept, ones you have not seen first.</p>
                  {reuseNote}
                  <Button variant="primary" onClick={start} data-start-retest><RotateCcw className="size-3.5" aria-hidden /> Start retest</Button>
                </>
              ) : (
                <p className="text-[13px] text-fg-muted" data-retest-locked>
                  Retest locked: {a.remediationPending.length} of {a.remediationRequired.length} concept{a.remediationRequired.length === 1 ? "" : "s"} still to work through. Answer each practice question correctly to finish it.
                </p>
              )}
            </div>
          </div>
        </Panel>
      )}
      <ResultsReview bank={bank} attempt={lastAttempt} />
      <SaveNotice />
    </div>
  );
}

// ── Taking the assessment ──────────────────────────────────────────────────

function Runner({ bank, draft, onAnswer, onSubmit }: { bank: TrackAssessment; draft: AssessmentDraft; onAnswer: (q: string, v: AnswerValue) => void; onSubmit: () => void }) {
  const qById = useMemo(() => new Map(bank.questions.map((q) => [q.id, q])), [bank]);
  const cById = useMemo(() => conceptMap(bank), [bank]);
  const questions = draft.questionIds.map((id) => qById.get(id)).filter((q): q is AssessmentQuestion => !!q);
  const firstOpen = questions.findIndex((q) => draft.answers[q.id] === undefined);
  const [i, setI] = useState(firstOpen < 0 ? questions.length - 1 : firstOpen);
  const [confirming, setConfirming] = useState(false);
  const legendRef = useRef<HTMLParagraphElement>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    legendRef.current?.focus();
  }, [i]);

  const q = questions[Math.min(i, questions.length - 1)];
  const c = q ? cById.get(q.concept) : undefined;
  // The flow only renders a validated draft; this guard keeps a bad one from ever crashing the page.
  if (!q || !c) return <p className="text-sm text-fg-muted" data-stale-draft>This attempt is out of date. Start again.</p>;
  const answered = questions.filter((x) => isAnswered(draft.answers[x.id])).length;
  const reused = draft.reusedConcepts.includes(q.concept);
  const labelId = `aq-${q.id}`;

  return (
    <div className="space-y-4" data-assessment-runner>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-fg-subtle">
        <span className="tabular" data-progress>Question {i + 1} of {questions.length} · {answered} answered</span>
        <span aria-hidden className="flex flex-wrap gap-1">
          {questions.map((x, k) => (
            <span key={x.id} className={cn("inline-block size-1.5 rounded-full", k === i ? "bg-accent" : isAnswered(draft.answers[x.id]) ? "bg-fg-muted" : "bg-line-strong")} />
          ))}
        </span>
      </div>
      <section className="rounded-[var(--radius-panel)] border border-line bg-panel px-4 py-4 sm:px-5" data-question-id={q.id} data-question-kind={q.item.kind} aria-labelledby={labelId}>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-line-strong px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] text-fg-subtle">{KIND_LABEL[q.item.kind]}</span>
          <span className="text-[11px] text-fg-subtle">{c.title}</span>
          {c.safetyCritical && (
            <span className="inline-flex items-center gap-1 rounded-full border border-warn/40 bg-warn-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-warn" data-safety-badge>
              <ShieldAlert className="size-3" aria-hidden /> Safety-critical
            </span>
          )}
        </div>
        {reused && <p className="mt-2 text-xs text-warn" role="note">You have seen this question before: the pool for this concept has run out. The options are in a new order.</p>}
        {q.item.kind === "scenario" && <p className="mt-3 text-[13px] leading-relaxed text-fg-muted"><RichText text={q.item.situation} /></p>}
        <p id={labelId} ref={legendRef} tabIndex={-1} className="mt-3 text-sm font-medium leading-snug outline-none"><RichText text={itemPrompt(q.item)} /></p>
        <div className="mt-3">
          <ItemInput key={q.id} item={q.item} value={draft.answers[q.id]} onChange={(v) => onAnswer(q.id, v)} seed={`${q.id}:${draft.startedAt}`} labelledBy={labelId} />
        </div>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => setI(i - 1)} disabled={i === 0}><ArrowLeft className="size-3.5" aria-hidden />Previous</Button>
        {i < questions.length - 1 ? (
          <Button variant="primary" onClick={() => setI(i + 1)} data-next-question>Next<ArrowRight className="size-3.5" aria-hidden /></Button>
        ) : !confirming ? (
          <Button variant="primary" onClick={() => setConfirming(true)} disabled={answered < questions.length} data-review-submit>Submit answers</Button>
        ) : null}
      </div>
      <div aria-live="polite">
        {i === questions.length - 1 && answered < questions.length && (
          <p className="text-xs text-fg-muted">{questions.length - answered} question{questions.length - answered === 1 ? "" : "s"} unanswered. Use Previous to go back to {questions.length - answered === 1 ? "it" : "them"}.</p>
        )}
        {confirming && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line-strong bg-raised px-3 py-2.5">
            <span className="text-[13px] text-fg">Submit all {questions.length} answers? You cannot change them afterwards.</span>
            <Button variant="primary" onClick={onSubmit} data-confirm-submit>Yes, submit</Button>
            <Button variant="ghost" onClick={() => setConfirming(false)}>Keep checking</Button>
          </div>
        )}
      </div>
      <p className="text-[11px] text-fg-subtle">Answers are saved in this browser as you go. If you leave or refresh, you will come back to the same questions.</p>
    </div>
  );
}

const isAnswered = (v: StoredAnswer | undefined) => v !== undefined && !(Array.isArray(v) && v.length === 0);

// ── Results and error analysis ─────────────────────────────────────────────

function ResultsSummary({ bank, attempt, practice, trackPassed, ref }: { bank: TrackAssessment; attempt: AssessmentAttempt; practice?: boolean; trackPassed?: { masteryScore: number; complete: boolean }; ref: React.Ref<HTMLHeadingElement> }) {
  const s = scoreAttempt(attempt.items);
  const cById = conceptMap(bank);
  const missed = s.wrongConcepts.map((c) => cById.get(c)).filter(Boolean);
  const label = practice ? (s.passed ? "Practice retake passed" : "Practice retake not passed") : s.passed ? "Passed" : "Not passed yet";
  return (
    <section className="space-y-4" aria-labelledby="results-h" data-results data-passed={s.passed ? "true" : "false"} data-practice={practice ? "true" : "false"}>
      <div className={cn("rounded-[var(--radius-panel)] border px-4 py-3.5", s.passed ? "border-up/30 bg-up-soft" : practice ? "border-line bg-panel" : "border-warn/30 bg-warn-soft")}>
        <h2 id="results-h" ref={ref} tabIndex={-1} className="flex items-center gap-2 text-base font-semibold outline-none">
          {s.passed ? <CheckCircle2 className="size-5 text-up" aria-hidden /> : <XCircle className="size-5 text-warn" aria-hidden />}
          {label}: {s.correct} of {s.total} ({s.pct}%)
        </h2>
        <ul className="mt-2 grid gap-1 text-[13px] sm:grid-cols-3" aria-label="Pass requirements">
          <Req ok={s.scoreOk}>Score {s.pct}% (need {ASSESSMENT_PASS_PCT}%)</Req>
          <Req ok={s.safetyOk}>Safety-critical {s.safetyCorrect}/{s.safetyTotal} (need all)</Req>
          <Req ok={s.appliedOk && s.criticalOk}>Applied scenario and critical concepts {s.appliedOk && s.criticalOk ? "right" : "missed"}</Req>
        </ul>
        {!s.passed && (
          <ul className="mt-2 space-y-0.5 text-[13px] text-fg" data-fail-reasons>
            {s.failReasons.map((r) => <li key={r}>{r}</li>)}
          </ul>
        )}
        <p className="mt-1 text-[11px] text-fg-subtle">Submitted {new Date(attempt.at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.</p>
      </div>

      {/* The track's standing comes before the list of misses, so on a phone it is not pushed below a long list. */}
      {trackPassed && (
        <p className="flex items-start gap-1.5 rounded-[var(--radius-panel)] border border-up/30 bg-up-soft px-4 py-2.5 text-[13px] text-fg" data-pass-status>
          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-up" aria-hidden />
          <span>
            {trackPassed.complete ? "Track complete" : "Assessment passed"} · Mastery score: {trackPassed.masteryScore}% (your best passing score).
            {practice ? " This practice retake cannot remove it." : ""}
          </span>
        </p>
      )}

      {missed.length > 0 && (
        <div className="rounded-[var(--radius-panel)] border border-line bg-panel px-4 py-3" data-error-analysis>
          <h3 className="text-[13px] font-medium">Error analysis: concepts you missed</h3>
          <ul className="mt-1.5 space-y-1 text-[13px] text-fg-muted">
            {missed.map((c) => (
              <li key={c!.id} data-missed-concept={c!.id} className="flex flex-wrap items-center gap-1.5">
                <X className="size-3.5 text-warn" aria-hidden /> <span className="text-fg">{c!.title}</span>
                {c!.safetyCritical && <span className="rounded-full border border-warn/40 px-1.5 text-[10px] uppercase tracking-[0.06em] text-warn">Safety-critical</span>}
                <span className="text-xs">· taught in {c!.lessonIds.map((id) => getLesson(id)).filter(Boolean).map((l, k) => (
                  <span key={l!.id}>{k > 0 && ", "}<Link href={lessonHref(l!)} className="text-accent-strong hover:underline">{l!.title}</Link></span>
                ))}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-fg-subtle">Why each answer was wrong is in the review of every question, below the remediation.</p>
        </div>
      )}
    </section>
  );
}

/** Every question with the answer given and why: collapsed by default, after the remediation. */
function ResultsReview({ bank, attempt }: { bank: TrackAssessment; attempt: AssessmentAttempt }) {
  const qById = new Map(bank.questions.map((q) => [q.id, q]));
  const cById = conceptMap(bank);
  const wrong = attempt.items.filter((it) => !it.ok && qById.has(it.q)).length;
  return (
    <details className="group rounded-[var(--radius-panel)] border border-line bg-panel" data-results-review>
      <summary className="cursor-pointer list-none px-4 py-3 text-[13px] font-medium marker:hidden">
        Every question, your answer and why{wrong ? ` (${wrong} wrong)` : ""} <span className="text-fg-subtle group-open:hidden">(show)</span>
      </summary>
      <ol className="space-y-3 border-t border-line px-4 py-3">
        {attempt.items.map((it, k) => {
          const q = qById.get(it.q);
          if (!q) return null;
          const answer = attempt.answers?.[it.q] as AnswerValue | undefined;
          const c = cById.get(q.concept);
          return (
            <li key={it.q} className="rounded-lg border border-line bg-surface p-3" data-result-item={it.q} data-ok={it.ok ? "true" : "false"}>
              <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-fg-subtle">
                {it.ok ? <Check className="size-3.5 text-up" aria-hidden /> : <X className="size-3.5 text-warn" aria-hidden />}
                <span className="sr-only">{it.ok ? "Right." : "Wrong."}</span>
                {k + 1}. {c?.title}{c?.safetyCritical ? " · safety-critical" : ""}
              </p>
              {q.item.kind === "scenario" && <p className="mt-1 text-xs text-fg-muted"><RichText text={q.item.situation} /></p>}
              <p className="mt-1 text-[13px] font-medium"><RichText text={itemPrompt(q.item)} /></p>
              <p className="mt-1 text-xs text-fg-muted"><span className="text-fg">Your answer:</span> {describeAnswer(q.item, answer)}</p>
              <div className="mt-2"><ItemFeedback item={q.item} answer={answer} grade={gradeItem(q.item, answer)} /></div>
              <p className="mt-1.5 text-xs leading-relaxed text-fg-muted"><span className="text-fg">Why: </span><RichText text={q.explanation} /></p>
            </li>
          );
        })}
      </ol>
    </details>
  );
}

function Req({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={cn("flex items-start gap-1.5", ok ? "text-fg" : "text-warn")}>
      {ok ? <Check className="mt-0.5 size-3.5 shrink-0 text-up" aria-hidden /> : <X className="mt-0.5 size-3.5 shrink-0" aria-hidden />}
      <span>{children}<span className="sr-only">{ok ? " (met)" : " (not met)"}</span></span>
    </li>
  );
}

// ── Remediation ────────────────────────────────────────────────────────────

function RemediationList({ bank, trackId, concepts, attemptAt, attemptSeq, attempts, now, optional }: { bank: TrackAssessment; trackId: string; concepts: string[]; attemptAt: string; attemptSeq?: number; attempts: readonly AssessmentAttempt[]; now: Date; optional?: boolean }) {
  const { state, update } = useProgress();
  const cById = conceptMap(bank);
  const p = getAssessmentProgress(state, trackId);
  return (
    <ol className="space-y-4">
      {concepts.map((id, k) => {
        const c = cById.get(id);
        if (!c) return null;
        const isDone = remediationDone(p, id, attemptAt, now, attemptSeq);
        const variants = remediationVariants(c);
        const vi = remediationVariantIndex(c, attempts);
        const r = variants[vi];
        return (
          <li key={id} className="rounded-lg border border-line bg-surface p-3.5" data-remediation={id} data-remediation-variant={vi} data-done={isDone ? "true" : "false"}>
            <h3 className="flex flex-wrap items-center gap-2 text-sm font-medium">
              <span className="font-mono text-xs tabular text-fg-subtle">{k + 1}</span> {c.title}
              {isDone ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-up/30 bg-up-soft px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] text-up"><Check className="size-3" aria-hidden />Done</span>
              ) : !optional ? (
                <span className="rounded-full border border-line-strong px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] text-fg-subtle">To do</span>
              ) : null}
              {vi > 0 && <span className="text-[11px] font-normal text-fg-subtle">· a new angle ({vi + 1} of {variants.length}), because this concept was missed before</span>}
            </h3>
            <dl className="mt-2 space-y-2 text-[13px] leading-relaxed">
              <div>
                <dt className="text-xs font-medium text-fg">Why this goes wrong</dt>
                <dd className="text-fg-muted"><RichText text={r.misconception} /></dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-fg">Another way to see it</dt>
                <dd className="text-fg-muted"><RichText text={r.altExplanation} /></dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-fg">A different example</dt>
                <dd className="text-fg-muted"><RichText text={r.altExample} /></dd>
              </div>
            </dl>
            <div className="mt-3 rounded-lg border border-line bg-panel p-3">
              <p className="mb-2 text-[11px] uppercase tracking-[0.06em] text-fg-subtle">Practice question{optional ? "" : " · answer correctly to finish this concept"}</p>
              <CheckItem key={`${id}:${vi}:${attemptAt}`} item={r.practice} seed={`${id}:${attemptAt}`} done={isDone} onCorrect={() => update((s, at) => completeRemediation(s, trackId, id, at))} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
