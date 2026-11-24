import { AlertTriangle, BadgeCheck, ExternalLink, FlaskConical, ListChecks, Sigma } from "lucide-react";
import type { ConceptCard, LessonPartId, ResearchItem, ResearchStatus } from "@/lib/academy/types";
import { cn } from "@/lib/cn";
import { RichText } from "./rich-text";

/** The full lesson format (A–L). Sections that declare a part show its letter and name. */
export const LESSON_PARTS: readonly { id: LessonPartId; letter: string; label: string }[] = [
  { id: "objective", letter: "A", label: "Learning objective" },
  { id: "why", letter: "B", label: "Why it matters" },
  { id: "beginner", letter: "C", label: "Beginner explanation" },
  { id: "visual", letter: "D", label: "Visual explanation" },
  { id: "example", letter: "E", label: "Real-world example" },
  { id: "deep-dive", letter: "F", label: "Technical deep dive" },
  { id: "professionals", letter: "G", label: "What professionals look for" },
  { id: "mistakes", letter: "H", label: "Common mistakes" },
  { id: "exercise", letter: "I", label: "Interactive exercise" },
  { id: "checkpoint", letter: "J", label: "Knowledge checkpoint" },
  { id: "summary", letter: "K", label: "Summary" },
  { id: "homework", letter: "L", label: "Practical homework" },
];
export const PART_BY_ID = new Map(LESSON_PARTS.map((p) => [p.id, p]));

export function PartLabel({ part, className }: { part: LessonPartId; className?: string }) {
  const p = PART_BY_ID.get(part)!;
  return (
    <span className={cn("t-label", className)} data-part={part}>
      {p.letter} · {p.label}
    </span>
  );
}

const STATUS_COPY: Record<ResearchStatus, { label: string; tone: string; note: string }> = {
  replicated: { label: "Replicated", tone: "border-up/30 bg-up-soft text-up", note: "Independent studies have found similar results." },
  disputed: { label: "Disputed", tone: "border-warn/30 bg-warn-soft text-warn", note: "Other researchers have challenged the method or the result." },
  outdated: { label: "Outdated", tone: "border-line-strong text-fg-subtle", note: "Markets or methods have changed since; treat it as history." },
  "regime-sensitive": { label: "Regime-sensitive", tone: "border-info/30 bg-info-soft text-info", note: "The result held in some periods or markets but not others." },
};

/** A research summary. Anything not checked against the source is labelled Unverified. */
export function ResearchCard({ r }: { r: ResearchItem }) {
  const s = STATUS_COPY[r.status];
  const rows: [string, string][] = [
    ["Research question", r.question],
    ["Method", r.methodology],
    ["Data", r.data],
    ["Main findings", r.findings],
    ["Limitations", r.limitations],
    ["What it means in practice", r.practicalMeaning],
  ];
  return (
    <aside className="max-w-[74ch] rounded-lg border border-line bg-surface px-4 py-3.5" aria-label={`Research: ${r.title}`} data-research data-verified={r.verified ? "true" : "false"}>
      <p className="t-label flex items-center gap-1.5">
        <FlaskConical className="size-3.5" strokeWidth={1.75} aria-hidden /> Research
      </p>
      <h4 className="t-subheading mt-1">{r.title}</h4>
      <p className="t-small mt-0.5">
        {r.authors} ({r.year}). {r.venue}. {r.peerReviewed ? "Peer-reviewed." : "Working paper (not peer-reviewed)."}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {r.verified ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-up/30 bg-up-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-up">
            <BadgeCheck className="size-3" aria-hidden /> Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-warn/40 bg-warn-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-warn" data-unverified>
            <AlertTriangle className="size-3" aria-hidden /> Unverified
          </span>
        )}
        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em]", s.tone)} title={s.note}>{s.label}</span>
      </div>
      {!r.verified && <p className="t-small mt-1.5 text-warn">This summary has not yet been checked against the original source. Do not rely on its details.</p>}
      <dl className="mt-3 divide-y divide-line border-t border-line">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-0.5 py-2.5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
            <dt className="t-label pt-1">{k}</dt>
            <dd className="t-body"><RichText text={v} /></dd>
          </div>
        ))}
      </dl>
      <p className="t-small mt-2">Status: {s.note}</p>
      {r.url && (
        <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-sm text-accent-strong hover:underline">
          Source <ExternalLink className="size-3" aria-hidden /><span className="sr-only">(opens in a new tab)</span>
        </a>
      )}
    </aside>
  );
}

/** The 13 concept-card fields, grouped so the card reads top to bottom in four short parts. */
const CARD_GROUPS: { title: string; rows: [keyof ConceptCard, string][] }[] = [
  { title: "The idea", rows: [["what", "What it is"], ["whyItExists", "Why it exists"], ["problemSolved", "The problem it solves"], ["mechanics", "How it works"], ["math", "The maths"]] },
  { title: "Using it", rows: [["howTradersUseIt", "How traders use it"], ["whenUseful", "When it is useful"], ["realExample", "A real example"]] },
  { title: "Its limits", rows: [["whenItFails", "When it fails"], ["limitations", "Limitations"], ["misconceptions", "Common misconceptions"]] },
  { title: "Try it", rows: [["exercise", "Exercise"], ["practicalTest", "Practical test"]] },
];

export function ConceptCardView({ card }: { card: ConceptCard }) {
  return (
    <section className="max-w-[74ch] overflow-hidden rounded-lg border border-accent/30 bg-surface" aria-label={`Concept card: ${card.name}`} data-concept-card>
      <header className="border-b border-line bg-accent-soft px-4 py-3">
        <p className="t-label text-accent-strong">Concept card</p>
        <h3 className="t-heading mt-0.5 text-[1.125rem]">{card.name}</h3>
      </header>
      {CARD_GROUPS.map((g) => (
        <div key={g.title} className="border-b border-line px-4 py-3 last:border-b-0" data-card-group>
          <p className="t-label">{g.title}</p>
          <dl className="mt-1.5 space-y-3">
            {g.rows.map(([k, label]) => (
              <div key={k} className="grid gap-0.5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
                <dt className="t-subheading text-[0.9375rem]">{label}</dt>
                <dd className={cn("t-body [overflow-wrap:anywhere]", k === "math" && "rounded-md border border-line bg-panel px-3 py-2 font-mono text-[0.9375rem]")}><RichText text={card[k]} /></dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </section>
  );
}

export function Methodologies({ items }: { items: { name: string; view: string }[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((m) => (
        <div key={m.name} className="rounded-lg border border-line bg-surface px-4 py-3.5">
          <p className="t-subheading">{m.name}</p>
          <p className="t-body mt-1"><RichText text={m.view} /></p>
        </div>
      ))}
      <p className="t-small md:col-span-2">There is no single approach that all professionals agree on. These are different schools of thought.</p>
    </div>
  );
}

export function Mistakes({ items }: { items: { mistake: string; why: string; instead: string }[] }) {
  return (
    <ul className="max-w-[74ch] space-y-3">
      {items.map((m) => (
        <li key={m.mistake} className="rounded-lg border border-warn/30 bg-warn-soft/40 px-4 py-3.5">
          <p className="t-subheading flex items-start gap-2"><AlertTriangle className="mt-1 size-4 shrink-0 text-warn" aria-hidden /><RichText text={m.mistake} /></p>
          <dl className="mt-2 grid gap-x-4 gap-y-1.5 sm:grid-cols-[7rem_minmax(0,1fr)]">
            <dt className="t-label pt-1 text-warn">Why it hurts</dt>
            <dd className="t-body"><RichText text={m.why} /></dd>
            <dt className="t-label pt-1 text-up">Instead</dt>
            <dd className="t-body"><RichText text={m.instead} /></dd>
          </dl>
        </li>
      ))}
    </ul>
  );
}

export function SummaryBlock({ keyConcepts, equations, implications }: { keyConcepts: string[]; equations?: { label: string; formula: string }[]; implications: string[] }) {
  return (
    <div className="max-w-[74ch] divide-y divide-line rounded-lg border border-line bg-surface">
      <div className="px-4 py-3.5">
        <p className="t-label flex items-center gap-1.5"><ListChecks className="size-3.5" aria-hidden />Key concepts</p>
        <ul className="t-body mt-1.5 list-disc space-y-1.5 pl-5 marker:text-fg-subtle">{keyConcepts.map((k) => <li key={k}><RichText text={k} /></li>)}</ul>
      </div>
      {equations && equations.length > 0 && (
        <div className="px-4 py-3.5">
          <p className="t-label flex items-center gap-1.5"><Sigma className="size-3.5" aria-hidden />Equations</p>
          <dl className="mt-1.5 space-y-2">{equations.map((e) => (
            <div key={e.label} className="grid gap-0.5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
              <dt className="t-subheading text-[0.9375rem]">{e.label}</dt>
              <dd className="font-mono text-[0.9375rem] leading-relaxed text-fg-body [overflow-wrap:anywhere]">{e.formula}</dd>
            </div>
          ))}</dl>
        </div>
      )}
      <div className="px-4 py-3.5">
        <p className="t-label">What it means for you</p>
        <ul className="t-body mt-1.5 list-disc space-y-1.5 pl-5 marker:text-fg-subtle">{implications.map((k) => <li key={k}><RichText text={k} /></li>)}</ul>
      </div>
    </div>
  );
}

export function Homework({ tasks }: { tasks: string[] }) {
  return (
    <ol className="t-body list-decimal space-y-2 pl-5 marker:text-fg-subtle">
      {tasks.map((t) => <li key={t}><RichText text={t} /></li>)}
    </ol>
  );
}
