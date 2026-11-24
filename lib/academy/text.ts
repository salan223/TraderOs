import type { AssessmentConcept, AssessmentQuestion, Block, ConceptCard, Interaction, ResearchItem } from "./types";

/**
 * Every human-readable string inside a piece of content. Used by the content
 * tests (glossary links, banned words, spelling) so new block and interaction
 * kinds can never slip past them.
 */
export function interactionTexts(i: Interaction): string[] {
  switch (i.kind) {
    case "single": return [i.prompt, ...i.options.flatMap((o) => [o.text, o.explain])];
    case "true-false": return [i.statement, i.explain];
    case "numeric": return [i.prompt, i.unit, i.explain];
    case "multi-select": return [i.prompt, ...i.options.flatMap((o) => [o.text, o.explain])];
    case "scenario": return [i.situation, i.question, ...(i.outcome ? [i.outcome] : []), ...i.options.flatMap((o) => [o.text, o.explain])];
    case "find-error": return [i.prompt, i.explain, ...i.lines.flatMap((l) => [l.text, ...(l.error ? [l.error] : [])])];
    case "chart-annotate": return [i.prompt, i.explain];
    case "flashcards": return i.cards.flatMap((c) => [c.front, c.back]);
    case "reveal": return [i.prompt, i.label, i.content];
    case "steps": return i.steps.flatMap((s) => [s.title, s.text, ...(s.check ? interactionTexts(s.check) : [])]);
  }
}

export function researchTexts(r: ResearchItem): string[] {
  return [r.title, r.authors, r.venue, r.question, r.methodology, r.data, r.findings, r.limitations, r.practicalMeaning];
}

export function conceptCardTexts(c: ConceptCard): string[] {
  return [c.name, c.what, c.whyItExists, c.problemSolved, c.mechanics, c.math, c.howTradersUseIt, c.whenUseful, c.whenItFails, c.limitations, c.misconceptions, c.realExample, c.exercise, c.practicalTest];
}

export function blockTexts(b: Block): string[] {
  switch (b.kind) {
    case "p": return [b.text];
    case "list": return b.items;
    case "callout": return [b.title, b.text];
    case "visual": return [b.caption];
    case "illustration": return [b.caption];
    case "defs": return b.items.flatMap((d) => [d.term, d.text]);
    case "step-list": return b.items.flatMap((s) => [...(s.title ? [s.title] : []), s.text]);
    case "cards": return b.items.flatMap((c) => [c.title, ...c.rows.flatMap((r) => [r.label, r.text])]);
    case "deeper": return [b.title, ...b.blocks.flatMap(blockTexts)];
    case "interactive": return [b.title, b.caption];
    case "interaction": return [b.title, ...interactionTexts(b.interaction)];
    case "research": return researchTexts(b.research);
    case "concept-card": return conceptCardTexts(b.card);
    case "methodologies": return b.items.flatMap((m) => [m.name, m.view]);
    case "mistakes": return b.items.flatMap((m) => [m.mistake, m.why, m.instead]);
    case "summary": return [...b.keyConcepts, ...(b.equations ?? []).flatMap((e) => [e.label, e.formula]), ...b.implications];
    case "homework": return b.tasks;
  }
}

export function conceptTexts(c: AssessmentConcept): string[] {
  const variants = [c.remediation, ...(c.moreRemediation ?? [])];
  return [c.title, ...variants.flatMap((r) => [r.misconception, r.altExplanation, r.altExample, ...interactionTexts(r.practice)]), c.flashcard.front, c.flashcard.back];
}

export function questionTexts(q: AssessmentQuestion): string[] {
  return [q.explanation, ...interactionTexts(q.item)];
}
