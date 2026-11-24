"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, RotateCcw, X } from "lucide-react";
import type {
  AnswerValue,
  ChartAnnotateItem,
  ChoiceOption,
  FindErrorItem,
  FlashcardsItem,
  GradedItem,
  Interaction,
  MultiSelectItem,
  NumericItem,
  RevealItem,
  ScenarioItem,
  SingleChoiceItem,
  StepsItem,
  TrueFalseItem,
} from "@/lib/academy/types";
import { chartScale, correctAnswer, gradeItem, roundTo, type Grade } from "@/lib/academy/interactions";
import { parseTypedNumber, seededShuffle } from "@/lib/academy/shuffle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { RichText } from "./rich-text";

/*
  Generic interactions, shared by lessons, track assessments and remediation.
  Every input works with the keyboard alone, announces feedback through an
  aria-live region, fits 320px screens and respects reduced motion.
*/

export const KIND_LABEL: Record<Interaction["kind"], string> = {
  single: "Multiple choice",
  "true-false": "True or false",
  numeric: "Calculate",
  "multi-select": "Select all that apply",
  scenario: "Scenario decision",
  "find-error": "Find the error",
  "chart-annotate": "Mark the chart",
  flashcards: "Flashcards",
  reveal: "Think, then reveal",
  steps: "Step by step",
};

const PROCESS_LABEL = { sound: "Sound process", partial: "Partly sound", unsound: "Unsound process" } as const;

/** The prompt text of a graded item. */
export function itemPrompt(item: GradedItem): string {
  switch (item.kind) {
    case "true-false": return item.statement;
    case "scenario": return item.question;
    default: return item.prompt;
  }
}

/** A readable version of an answer, for "your answer" lines. */
export function describeAnswer(item: GradedItem, answer: AnswerValue | undefined): string {
  if (answer === undefined) return "No answer";
  switch (item.kind) {
    case "single":
    case "scenario":
      return item.options.find((o) => o.id === answer)?.text ?? "No answer";
    case "true-false":
      return answer ? "True" : "False";
    case "numeric":
      return `${answer} ${item.unit}`;
    case "multi-select": {
      const ids = answer as string[];
      return ids.length ? item.options.filter((o) => ids.includes(o.id)).map((o) => o.text).join("; ") : "Nothing selected";
    }
    case "find-error": {
      const ids = answer as string[];
      if (!ids.length) return "No lines selected";
      return item.lines.map((l, i) => (ids.includes(l.id) ? `line ${i + 1}` : null)).filter(Boolean).join(", ");
    }
    case "chart-annotate":
      return item.target.mode === "level" ? (answer as number).toFixed(item.decimals) : `bar ${(answer as number) + 1}`;
  }
}

// ── Inputs ─────────────────────────────────────────────────────────────────

type InputProps<T extends GradedItem> = {
  item: T;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  disabled?: boolean;
  /** Seed for shuffling options (stable per attempt). */
  seed: string;
  /** Show right and wrong marks on the options. */
  reveal?: boolean;
  labelledBy: string;
};

function optionTone(reveal: boolean | undefined, isRight: boolean, isChosen: boolean) {
  if (reveal && isRight) return "border-up/50 bg-up-soft";
  if (reveal && isChosen && !isRight) return "border-warn/50 bg-warn-soft";
  if (isChosen) return "border-accent bg-accent-soft";
  return "border-line bg-surface hover:bg-raised";
}

function OptionRow({ type, name, checked, disabled, onChange, tone, children, mark, dataId }: {
  type: "radio" | "checkbox"; name: string; checked: boolean; disabled?: boolean; onChange: () => void; tone: string; children: ReactNode; mark?: "right" | "wrong" | null; dataId: string;
}) {
  return (
    <label
      data-option={dataId}
      className={cn(
        "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-[13px] transition-colors motion-reduce:transition-none",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
        tone,
        disabled && "cursor-default",
      )}
    >
      <input type={type} name={name} checked={checked} disabled={disabled} onChange={onChange} value={dataId} className="mt-0.5 accent-[var(--color-accent)]" />
      <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{children}</span>
      {mark === "right" && <Check className="mt-0.5 size-4 shrink-0 text-up" aria-label="Right answer" />}
      {mark === "wrong" && <X className="mt-0.5 size-4 shrink-0 text-warn" aria-label="Your answer, wrong" />}
    </label>
  );
}

function ChoiceInput({ item, value, onChange, disabled, seed, reveal, labelledBy }: InputProps<SingleChoiceItem | ScenarioItem>) {
  const name = useId();
  const options = useMemo(() => seededShuffle(item.options, seed), [item.options, seed]);
  const right = correctAnswer(item);
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="space-y-1.5">
      {options.map((o) => (
        <OptionRow key={o.id} dataId={o.id} type="radio" name={name} checked={value === o.id} disabled={disabled} onChange={() => onChange(o.id)}
          tone={optionTone(reveal, o.id === right, value === o.id)} mark={reveal ? (o.id === right ? "right" : value === o.id ? "wrong" : null) : null}>
          {o.text}
        </OptionRow>
      ))}
    </div>
  );
}

function TrueFalseInput({ item, value, onChange, disabled, reveal, labelledBy }: InputProps<TrueFalseItem>) {
  const name = useId();
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="grid grid-cols-2 gap-1.5">
      {[true, false].map((v) => (
        <OptionRow key={String(v)} dataId={String(v)} type="radio" name={name} checked={value === v} disabled={disabled} onChange={() => onChange(v)}
          tone={optionTone(reveal, item.answer === v, value === v)} mark={reveal ? (item.answer === v ? "right" : value === v ? "wrong" : null) : null}>
          {v ? "True" : "False"}
        </OptionRow>
      ))}
    </div>
  );
}

function MultiInput({ item, value, onChange, disabled, seed, reveal, labelledBy }: InputProps<MultiSelectItem>) {
  const options = useMemo(() => seededShuffle(item.options, seed), [item.options, seed]);
  const chosen = Array.isArray(value) ? value : [];
  const toggle = (id: string) => onChange(chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id]);
  return (
    <div role="group" aria-labelledby={labelledBy} className="space-y-1.5">
      {options.map((o) => {
        const isRight = item.correct.includes(o.id);
        const on = chosen.includes(o.id);
        return (
          <OptionRow key={o.id} dataId={o.id} type="checkbox" name={o.id} checked={on} disabled={disabled} onChange={() => toggle(o.id)}
            tone={reveal ? (isRight ? "border-up/50 bg-up-soft" : on ? "border-warn/50 bg-warn-soft" : "border-line bg-surface") : optionTone(false, false, on)}
            mark={reveal ? (isRight ? "right" : on ? "wrong" : null) : null}>
            {o.text}
          </OptionRow>
        );
      })}
    </div>
  );
}

function FindErrorInput({ item, value, onChange, disabled, reveal, labelledBy }: InputProps<FindErrorItem>) {
  const chosen = Array.isArray(value) ? value : [];
  const toggle = (id: string) => onChange(chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id]);
  return (
    <ol role="group" aria-labelledby={labelledBy} className="space-y-1.5">
      {item.lines.map((l, i) => {
        const on = chosen.includes(l.id);
        const wrongLine = !!l.error;
        return (
          <li key={l.id}>
            <OptionRow dataId={l.id} type="checkbox" name={l.id} checked={on} disabled={disabled} onChange={() => toggle(l.id)}
              tone={reveal ? (wrongLine ? "border-warn/50 bg-warn-soft" : on ? "border-line-strong bg-raised" : "border-line bg-surface") : on ? "border-warn bg-warn-soft" : "border-line bg-surface hover:bg-raised"}
              mark={reveal ? (wrongLine === on ? "right" : "wrong") : null}>
              <span className="mr-1.5 font-mono text-[11px] tabular text-fg-subtle">{i + 1}</span>
              <RichText text={l.text} />
              {reveal && l.error && <span className="mt-1 block text-xs text-warn">Error: <RichText text={l.error} /></span>}
            </OptionRow>
          </li>
        );
      })}
    </ol>
  );
}

function NumericInput({ item, value, onChange, disabled, labelledBy }: InputProps<NumericItem>) {
  const id = useId();
  const [text, setText] = useState(typeof value === "number" ? String(value) : "");
  const [bad, setBad] = useState(false);
  // Follow outside changes (a resumed draft, a reset).
  useEffect(() => {
    const n = parseTypedNumber(text);
    if (typeof value === "number" && n !== value) setText(String(value));
    if (value === undefined && text !== "" && parseTypedNumber(text) !== null) setText("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor={id} className="sr-only">Your answer in {item.unit}</label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-describedby={labelledBy}
        aria-invalid={bad || undefined}
        disabled={disabled}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const n = parseTypedNumber(e.target.value);
          setBad(e.target.value.trim() !== "" && n === null);
          if (n !== null) onChange(n);
        }}
        className="h-9 w-40 max-w-full rounded-lg border border-line-strong bg-surface px-3 font-mono text-sm tabular text-fg disabled:opacity-60"
      />
      <span className="text-xs text-fg-muted">{item.unit}</span>
      {bad && <span className="w-full text-xs text-warn" role="status">Type a number, for example 1200 or −60.</span>}
    </div>
  );
}

const CHART_W = 320, CHART_H = 170, PAD_L = 8, PAD_R = 58;

function ChartInput({ item, value, onChange, disabled, reveal, labelledBy }: InputProps<ChartAnnotateItem>) {
  const s = useMemo(() => chartScale(item, CHART_H, 0.12), [item]);
  const n = item.series.length;
  const plotW = CHART_W - PAD_L - PAD_R;
  const x = (i: number) => PAD_L + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const step = 10 ** -item.decimals;
  const level = item.target.mode === "level";
  const current = typeof value === "number" ? value : null;
  const svgRef = useRef<SVGSVGElement>(null);
  const pts = item.series.map((v, i) => `${x(i)},${s.y(v)}`).join(" ");
  const fmt = (v: number) => v.toFixed(item.decimals);

  const fromPointer = (clientX: number, clientY: number) => {
    const el = svgRef.current;
    if (!el || disabled) return;
    const r = el.getBoundingClientRect();
    const vy = ((clientY - r.top) / r.height) * CHART_H;
    const vx = ((clientX - r.left) / r.width) * CHART_W;
    if (level) onChange(roundTo(Math.min(s.max, Math.max(s.min, s.value(vy))), item.decimals));
    else onChange(Math.max(0, Math.min(n - 1, Math.round(((vx - PAD_L) / plotW) * (n - 1)))));
  };
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (disabled) return;
    const base = current ?? (level ? roundTo(item.series[n - 1], item.decimals) : n - 1);
    const big = level ? 10 : 3;
    let next: number | null = null;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") next = base + (level ? step : 1);
    else if (e.key === "ArrowDown" || e.key === "ArrowLeft") next = base - (level ? step : 1);
    else if (e.key === "PageUp") next = base + (level ? step * big : big);
    else if (e.key === "PageDown") next = base - (level ? step * big : big);
    else if (e.key === "Home") next = level ? s.min : 0;
    else if (e.key === "End") next = level ? s.max : n - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(level ? roundTo(Math.min(s.max, Math.max(s.min, next)), item.decimals) : Math.max(0, Math.min(n - 1, Math.round(next))));
  };
  const target = item.target;
  const markY = current !== null && level ? s.y(current) : null;
  const markX = current !== null && !level ? x(current) : null;
  return (
    <div className="space-y-2">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="h-auto w-full max-w-[520px] touch-none select-none rounded-lg border border-line bg-surface outline-none focus-visible:outline-2 focus-visible:outline-accent"
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-labelledby={labelledBy}
        aria-valuemin={level ? Number(fmt(s.min)) : 1}
        aria-valuemax={level ? Number(fmt(s.max)) : n}
        aria-valuenow={current === null ? undefined : level ? current : current + 1}
        aria-valuetext={current === null ? "Nothing marked yet. Use the arrow keys or click the chart." : level ? `Level ${fmt(current)}` : `Bar ${current + 1} of ${n}, close ${fmt(item.series[current])}`}
        aria-disabled={disabled || undefined}
        data-chart-annotate
        onPointerDown={(e) => fromPointer(e.clientX, e.clientY)}
        onKeyDown={onKey}
      >
        <polyline points={pts} fill="none" className="stroke-fg-muted" strokeWidth="1.5" />
        {item.series.map((v, i) => <circle key={i} cx={x(i)} cy={s.y(v)} r="2" className="fill-fg-muted" />)}
        <text x={CHART_W - PAD_R + 6} y={s.y(item.series[n - 1])} dy="0.35em" className="fill-fg-subtle text-[10px]">{fmt(item.series[n - 1])}</text>
        {reveal && target.mode === "level" && (
          <>
            <rect x={PAD_L} width={plotW} y={s.y(target.value + target.tolerance)} height={Math.max(1, s.y(target.value - target.tolerance) - s.y(target.value + target.tolerance))} className="fill-up-soft" />
            <line x1={PAD_L} x2={PAD_L + plotW} y1={s.y(target.value)} y2={s.y(target.value)} className="stroke-up" strokeDasharray="3 3" strokeWidth="1.5" />
          </>
        )}
        {reveal && target.mode === "point" && <line x1={x(target.value)} x2={x(target.value)} y1={0} y2={CHART_H} className="stroke-up" strokeDasharray="3 3" />}
        {markY !== null && (
          <>
            <line x1={PAD_L} x2={PAD_L + plotW} y1={markY} y2={markY} className="stroke-accent" strokeWidth="2" />
            <text x={CHART_W - PAD_R + 6} y={markY} dy="0.35em" className="fill-accent-strong text-[10px] font-medium">{fmt(current!)}</text>
          </>
        )}
        {markX !== null && <line x1={markX} x2={markX} y1={0} y2={CHART_H} className="stroke-accent" strokeWidth="2" />}
      </svg>
      <p className="text-xs text-fg-muted">
        {current === null ? "Click or tap the chart, or focus it and use the arrow keys." : level ? <>Marked level: <span className="font-mono tabular text-fg">{fmt(current)}</span></> : <>Marked bar {current + 1}</>}
        <span className="text-fg-subtle"> · Illustrative prices, not market data.</span>
      </p>
    </div>
  );
}

/** The answer input for any graded item. */
export function ItemInput(props: InputProps<GradedItem>) {
  const { item } = props;
  switch (item.kind) {
    case "single":
    case "scenario":
      return <ChoiceInput {...props} item={item} />;
    case "true-false":
      return <TrueFalseInput {...props} item={item} />;
    case "multi-select":
      return <MultiInput {...props} item={item} />;
    case "find-error":
      return <FindErrorInput {...props} item={item} />;
    case "numeric":
      return <NumericInput {...props} item={item} />;
    case "chart-annotate":
      return <ChartInput {...props} item={item} />;
  }
}

/** Why the chosen answer was right or wrong, and the right answer. */
export function ItemFeedback({ item, answer, grade }: { item: GradedItem; answer: AnswerValue | undefined; grade: Grade }) {
  const chosenOption: (ChoiceOption & { process?: keyof typeof PROCESS_LABEL }) | undefined =
    item.kind === "single" || item.kind === "scenario" ? item.options.find((o) => o.id === answer) : undefined;
  const right = correctAnswer(item);
  return (
    <div className={cn("rounded-lg border px-3 py-2.5 text-[13px] leading-relaxed", grade.correct ? "border-up/30" : "border-warn/30")}>
      <p className={cn("font-medium", grade.correct ? "text-up" : "text-warn")}>
        {item.kind === "scenario" && chosenOption?.process ? `${PROCESS_LABEL[chosenOption.process]}.` : grade.correct ? "Correct." : "Not quite."}
      </p>
      {chosenOption && <p className="mt-0.5 text-fg-muted"><RichText text={chosenOption.explain} /></p>}
      {item.kind === "multi-select" && (
        <ul className="mt-1 space-y-0.5 text-fg-muted">
          {item.options.map((o) => <li key={o.id}><span className="text-fg">{o.text}:</span> <RichText text={o.explain} /></li>)}
        </ul>
      )}
      {(item.kind === "true-false" || item.kind === "numeric" || item.kind === "find-error" || item.kind === "chart-annotate") && (
        <p className="mt-0.5 text-fg-muted"><RichText text={item.explain} /></p>
      )}
      {!grade.correct && item.kind !== "numeric" && (
        <p className="mt-1.5 text-fg-muted"><span className="text-fg">{item.kind === "scenario" ? "The sound choice: " : "Right answer: "}{describeAnswer(item, right)}.</span></p>
      )}
      {!grade.correct && item.kind === "numeric" && <p className="mt-1.5 text-fg">Right answer: {describeAnswer(item, right)}.</p>}
      {item.kind === "scenario" && item.outcome && <p className="mt-1.5 border-t border-line pt-1.5 text-xs text-fg-subtle"><span className="text-fg-muted">About outcomes:</span> <RichText text={item.outcome} /></p>}
    </div>
  );
}

// ── A self-contained check (lessons, remediation practice, step checks) ─────

export function CheckItem({ item, seed, onCorrect, done, checkLabel = "Check answer" }: {
  item: GradedItem;
  seed: string;
  onCorrect?: () => void;
  /** Already completed earlier (shows a note, still lets the learner practise). */
  done?: boolean;
  checkLabel?: string;
}) {
  const labelId = useId();
  const [value, setValue] = useState<AnswerValue | undefined>(undefined);
  const [checked, setChecked] = useState<Grade | null>(null);
  const [round, setRound] = useState(0);
  const grade = checked;
  return (
    <div className="space-y-3" data-check-item>
      <p id={labelId} className="text-sm font-medium leading-snug">
        {item.kind === "scenario" && <span className="mb-1 block text-[13px] font-normal text-fg-muted"><RichText text={item.situation} /></span>}
        <RichText text={itemPrompt(item)} />
      </p>
      <ItemInput item={item} value={value} onChange={(v) => { setValue(v); setChecked(null); }} disabled={!!grade?.correct} seed={`${seed}:${round}`} reveal={!!grade} labelledBy={labelId} />
      <div aria-live="polite" role="status">{grade && <ItemFeedback item={item} answer={value} grade={grade} />}</div>
      <div className="flex flex-wrap items-center gap-2">
        {!grade?.correct ? (
          <Button
            variant="primary"
            disabled={value === undefined || (Array.isArray(value) && value.length === 0)}
            onClick={() => {
              const g = gradeItem(item, value);
              setChecked(g);
              if (g.correct) onCorrect?.();
            }}
          >
            {checkLabel}
          </Button>
        ) : null}
        {grade && !grade.correct && (
          <Button variant="ghost" onClick={() => { setValue(undefined); setChecked(null); setRound((r) => r + 1); }}>
            <RotateCcw className="size-3.5" aria-hidden /> Try again
          </Button>
        )}
        {done && <span className="inline-flex items-center gap-1 text-xs text-up"><Check className="size-3.5" aria-hidden />Done before</span>}
      </div>
    </div>
  );
}

// ── Learning interactions ──────────────────────────────────────────────────

export function Flashcards({ item, label = "Flashcards" }: { item: FlashcardsItem; label?: string }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = item.cards[i];
  const go = (d: number) => { setI((x) => (x + d + item.cards.length) % item.cards.length); setFlipped(false); };
  return (
    <div className="space-y-2" role="group" aria-roledescription="flashcards" aria-label={label}>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-pressed={flipped}
        className="block min-h-28 w-full rounded-lg border border-line-strong bg-surface px-4 py-4 text-left transition-colors hover:bg-raised motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-accent"
      >
        <span className="block text-[10px] uppercase tracking-[0.06em] text-fg-subtle">{flipped ? "Answer" : "Card"} · {i + 1} of {item.cards.length}</span>
        <span className="mt-1.5 block text-sm font-medium" aria-live="polite"><RichText text={flipped ? card.back : card.front} /></span>
        <span className="mt-2 block text-[11px] text-fg-subtle">{flipped ? "Select to see the question again" : "Think of the answer, then select to flip"}</span>
      </button>
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => go(-1)} disabled={item.cards.length < 2}><ArrowLeft className="size-3.5" aria-hidden />Previous</Button>
        <Button variant="ghost" onClick={() => go(1)} disabled={item.cards.length < 2}>Next<ArrowRight className="size-3.5" aria-hidden /></Button>
      </div>
    </div>
  );
}

export function Reveal({ item }: { item: RevealItem }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="space-y-2">
      <p className="text-sm leading-relaxed text-fg-muted"><RichText text={item.prompt} /></p>
      <Button aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <ChevronDown className={cn("size-3.5 transition-transform motion-reduce:transition-none", open && "rotate-180")} aria-hidden />
        {open ? "Hide" : item.label}
      </Button>
      <div id={id} hidden={!open} className="rounded-lg border border-line bg-surface px-3 py-2.5 text-[13px] leading-relaxed text-fg-muted">
        <RichText text={item.content} />
      </div>
    </div>
  );
}

export function Steps({ item, seed }: { item: StepsItem; seed: string }) {
  const [i, setI] = useState(0);
  const [passed, setPassed] = useState<Record<number, boolean>>({});
  const headRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    headRef.current?.focus();
  }, [i]);
  const step = item.steps[i];
  const blocked = !!step.check && !passed[i];
  return (
    <div className="space-y-3">
      <ol className="flex flex-wrap gap-1" aria-label="Progress">
        {item.steps.map((s, k) => (
          <li key={k} aria-current={k === i ? "step" : undefined} className={cn("h-1.5 w-8 rounded-full", k < i ? "bg-accent" : k === i ? "bg-accent/60" : "bg-line-strong")}>
            <span className="sr-only">Step {k + 1}: {s.title}{k < i ? " (done)" : ""}</span>
          </li>
        ))}
      </ol>
      <div aria-live="polite">
        <h4 ref={headRef} tabIndex={-1} className="text-sm font-medium outline-none">Step {i + 1} of {item.steps.length}: {step.title}</h4>
        <p className="mt-1 text-[13px] leading-relaxed text-fg-muted"><RichText text={step.text} /></p>
      </div>
      {step.check && <CheckItem key={i} item={step.check} seed={`${seed}:${i}`} onCorrect={() => setPassed((p) => ({ ...p, [i]: true }))} checkLabel="Check this step" />}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => setI(i - 1)} disabled={i === 0}><ArrowLeft className="size-3.5" aria-hidden />Back</Button>
        {i < item.steps.length - 1 ? (
          <Button variant="primary" onClick={() => setI(i + 1)} disabled={blocked}>Next step<ArrowRight className="size-3.5" aria-hidden /></Button>
        ) : (
          <span className="text-xs text-fg-subtle">{blocked ? "Answer the check to finish." : "All steps done."}</span>
        )}
      </div>
    </div>
  );
}

/** Any interaction, in its own frame (used by the lesson "interaction" block). */
export function InteractionView({ id, title, interaction }: { id: string; title: string; interaction: Interaction }) {
  return (
    <section aria-labelledby={`${id}-title`} className="rounded-lg border border-line bg-panel px-3.5 py-3" data-interaction={interaction.kind}>
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-line-strong px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] text-fg-subtle">{KIND_LABEL[interaction.kind]}</span>
        <h3 id={`${id}-title`} className="text-[13px] font-medium">{title}</h3>
      </div>
      {interaction.kind === "flashcards" ? (
        <Flashcards item={interaction} label={title} />
      ) : interaction.kind === "reveal" ? (
        <Reveal item={interaction} />
      ) : interaction.kind === "steps" ? (
        <Steps item={interaction} seed={id} />
      ) : (
        <CheckItem item={interaction} seed={id} />
      )}
    </section>
  );
}
