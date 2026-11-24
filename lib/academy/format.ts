import type { Block, Lesson, LessonPartId } from "./types";

/**
 * Checks a lesson that declares `format: "full"` against the full lesson
 * format (A–L). Returns a list of problems; empty means it conforms.
 * A, I, J and L are the lesson's objectives, exercise, quiz and practical;
 * the other parts are sections tagged with `part`.
 */
export const SECTION_PARTS: readonly LessonPartId[] = ["why", "beginner", "visual", "example", "deep-dive", "professionals", "mistakes", "summary"];

const has = (blocks: Block[], kinds: Block["kind"][]) => blocks.some((b) => kinds.includes(b.kind));

export function fullFormatProblems(l: Lesson): string[] {
  const out: string[] = [];
  const byPart = new Map<LessonPartId, Block[]>();
  for (const s of l.sections) if (s.part) byPart.set(s.part, [...(byPart.get(s.part) ?? []), ...s.blocks]);
  if (l.objectives.length === 0) out.push("A: no learning objectives");
  for (const p of SECTION_PARTS) if (!byPart.has(p)) out.push(`missing part: ${p}`);
  const visual = byPart.get("visual");
  if (visual && !has(visual, ["interactive", "interaction", "visual"])) out.push("D: the visual explanation needs a diagram, widget or interaction");
  const pros = byPart.get("professionals");
  if (pros && !pros.some((b) => b.kind === "methodologies" && b.items.length >= 2)) out.push("G: needs at least two methodologies");
  const mistakes = byPart.get("mistakes");
  if (mistakes && !has(mistakes, ["mistakes"])) out.push("H: needs a mistakes block");
  const summary = byPart.get("summary");
  if (summary && !has(summary, ["summary"])) out.push("K: needs a summary block");
  if (!l.exercise) out.push("I: no interactive exercise");
  if (l.quiz.length === 0) out.push("J: no knowledge checkpoint");
  if (!l.practical || l.practical.steps.length === 0) out.push("L: no practical homework");
  for (const s of l.sections) for (const b of s.blocks) if (b.kind === "research" && !b.research.verified && b.research.url === undefined) {
    // Allowed (it renders as Unverified), but an unverified item should at least point at its source.
    out.push(`research "${b.research.title}" is unverified and has no source link`);
  }
  return out;
}
