import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, BookOpen, ChevronRight, Info, Lightbulb, type LucideIcon } from "lucide-react";
import { getLesson, lessonHref } from "@/lib/academy/curriculum";
import type { Block, Section } from "@/lib/academy/types";
import { cn } from "@/lib/cn";
import { RichText, chunkParagraph, splitLead } from "./rich-text";
import { Visual } from "./visuals";
import { Illustration, IllustrationArt } from "./illustrations";
import { Widget } from "./widgets";
import { SectionSeen, SectionTick } from "./lesson-parts";
import { InteractionView } from "./interactions";
import { ConceptCardView, Homework, Methodologies, Mistakes, PartLabel, ResearchCard, SummaryBlock } from "./lesson-format";

function CalloutLink({ lessonId, label }: { lessonId: string; label: string }) {
  const l = getLesson(lessonId);
  if (!l) return null;
  return (
    <Link href={lessonHref(l)} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent-strong underline-offset-2 hover:underline">
      {label} <ArrowRight className="size-3.5 shrink-0" aria-hidden />
    </Link>
  );
}

const CALLOUT: Record<Extract<Block, { kind: "callout" }>["tone"], { name: string; icon: LucideIcon; box: string; ink: string }> = {
  key: { name: "Key idea", icon: Lightbulb, box: "border-accent/40 bg-accent-soft", ink: "text-accent-strong" },
  warn: { name: "Watch out", icon: AlertTriangle, box: "border-warn/35 bg-warn-soft", ink: "text-warn" },
  example: { name: "Example", icon: BookOpen, box: "border-line-strong bg-raised/60", ink: "text-fg-muted" },
  info: { name: "Note", icon: Info, box: "border-info/30 bg-info-soft", ink: "text-info" },
};

/** "Label: explanation" shown as a definition row. */
function DefRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="border-l-2 border-accent/50 pl-3.5" data-def-row>
      <p className="t-subheading"><RichText text={term} /></p>
      <div className="t-body">{children}</div>
    </div>
  );
}

function ListItem({ text }: { text: string }) {
  const lead = splitLead(text);
  if (!lead) return <li><RichText text={text} /></li>;
  return <li><strong className="font-semibold text-fg">{lead.lead}:</strong> <RichText text={lead.rest} /></li>;
}

export function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "p": {
      const lead = splitLead(block.text);
      if (lead) {
        const parts = chunkParagraph(lead.rest.charAt(0).toUpperCase() + lead.rest.slice(1));
        return <DefRow term={lead.lead}>{parts.map((t, i) => <p key={i} className={cn(i > 0 && "mt-2")}><RichText text={t} /></p>)}</DefRow>;
      }
      const parts = chunkParagraph(block.text);
      if (parts.length === 1) return <p className="t-body"><RichText text={block.text} /></p>;
      return <div className="space-y-2.5" data-split>{parts.map((t, i) => <p key={i} className="t-body"><RichText text={t} /></p>)}</div>;
    }
    case "list": {
      const L = block.ordered ? "ol" : "ul";
      return (
        <L className={cn("t-body space-y-2 pl-5 marker:text-fg-subtle", block.ordered ? "list-decimal" : "list-disc")}>
          {block.items.map((it) => <ListItem key={it} text={it} />)}
        </L>
      );
    }
    case "callout": {
      const c = CALLOUT[block.tone];
      const Icon = c.icon;
      const showName = block.title.trim().toLowerCase() !== c.name.toLowerCase();
      return (
        <aside className={cn("max-w-[74ch] rounded-lg border px-4 py-3.5", c.box)} data-callout={block.tone}>
          {showName && <p className={cn("t-label flex items-center gap-1.5", c.ink)}><Icon className="size-3.5" strokeWidth={1.75} aria-hidden />{c.name}</p>}
          <p className={cn("t-subheading flex items-center gap-1.5", showName && "mt-1")}>
            {!showName && <Icon className={cn("size-4 shrink-0", c.ink)} strokeWidth={1.75} aria-hidden />}
            <RichText text={block.title} />
          </p>
          <p className="t-body mt-1"><RichText text={block.text} /></p>
          {block.link && <CalloutLink lessonId={block.link.lessonId} label={block.link.label} />}
        </aside>
      );
    }
    case "defs":
      return (
        <dl className="max-w-[74ch] divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface" data-defs>
          {block.items.map((d) => (
            <div key={d.term} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
              <dt className="t-subheading"><RichText text={d.term} /></dt>
              <dd className="t-body"><RichText text={d.text} /></dd>
            </div>
          ))}
        </dl>
      );
    case "step-list":
      return (
        <ol className="max-w-[74ch] space-y-3" data-step-list>
          {block.items.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full border border-accent/50 bg-accent-soft font-mono text-[13px] font-semibold text-accent-strong tabular" aria-hidden>{i + 1}</span>
              <div className="min-w-0 pt-0.5">
                {s.title && <p className="t-subheading"><RichText text={s.title} /></p>}
                <p className="t-body"><RichText text={s.text} /></p>
              </div>
            </li>
          ))}
        </ol>
      );
    case "cards":
      return (
        <div className="grid gap-3 md:grid-cols-2" data-cards>
          {block.items.map((c) => (
            <article key={c.title} className="flex min-w-0 flex-col rounded-lg border border-line bg-surface px-4 py-3.5" data-card>
              {c.illustration && (
                <div className="relative mb-3 rounded-md border border-line bg-panel px-3 py-2">
                  <span className="t-label absolute left-2 top-1.5 text-[9px]">Illustration</span>
                  <div className="mx-auto w-full max-w-[190px]"><IllustrationArt id={c.illustration} /></div>
                </div>
              )}
              <h3 className="t-subheading"><RichText text={c.title} /></h3>
              <dl className="mt-3 space-y-2">
                {c.rows.map((r) => (
                  <div key={r.label}>
                    <dt className="t-label">{r.label}</dt>
                    <dd className="t-body"><RichText text={r.text} /></dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      );
    case "deeper":
      return (
        <details className="group max-w-[74ch] rounded-lg border border-line bg-surface" data-deeper>
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 [&::-webkit-details-marker]:hidden">
            <ChevronRight className="size-4 shrink-0 text-accent-strong transition-transform group-open:rotate-90" aria-hidden />
            <span className="t-label text-accent-strong">Go deeper</span>
            <span className="t-subheading"><RichText text={block.title} /></span>
          </summary>
          <div className="space-y-4 border-t border-line px-4 py-4">
            {block.blocks.map((b, i) => <BlockView key={i} block={b} />)}
          </div>
        </details>
      );
    case "visual":
      return <Visual id={block.visual} caption={block.caption} />;
    case "illustration":
      return <Illustration id={block.illustration} caption={block.caption} />;
    case "interactive":
      return <Widget id={block.widget} title={block.title} caption={block.caption} />;
    case "interaction":
      return <InteractionView id={block.id} title={block.title} interaction={block.interaction} />;
    case "research":
      return <ResearchCard r={block.research} />;
    case "concept-card":
      return <ConceptCardView card={block.card} />;
    case "methodologies":
      return <Methodologies items={block.items} />;
    case "mistakes":
      return <Mistakes items={block.items} />;
    case "summary":
      return <SummaryBlock keyConcepts={block.keyConcepts} equations={block.equations} implications={block.implications} />;
    case "homework":
      return <Homework tasks={block.tasks} />;
  }
}

export function LessonSection({ lessonId, section, index }: { lessonId: string; section: Section; index: number }) {
  return (
    <section id={section.id} aria-labelledby={`${section.id}-h`} className="scroll-mt-20">
      {section.part && <PartLabel part={section.part} className="mb-1.5 block" />}
      <h2 id={`${section.id}-h`} className="t-heading flex items-center gap-2.5">
        <SectionTick lessonId={lessonId} sectionId={section.id} />
        <span className="font-mono text-sm font-normal tabular text-fg-subtle">{index + 1}</span>
        {section.heading}
      </h2>
      <div className="mt-4 space-y-4">
        {section.blocks.map((b, i) => (
          <BlockView key={i} block={b} />
        ))}
      </div>
      <SectionSeen lessonId={lessonId} sectionId={section.id} />
    </section>
  );
}
