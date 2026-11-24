/** Independent tester's content-integrity checks for the Academy. */
import { describe, expect, it } from "vitest";
import { LESSONS, TRACKS, getTrackLesson, lessonHref, neighbours, lessonsOfTrack, TERM_INTRODUCED_IN } from "@/lib/academy/curriculum";
import { GLOSSARY_LIST, getGlossaryEntry } from "@/lib/academy/glossary";
import { termIdsIn, plainText } from "@/lib/academy/rich";
import { deterministicShuffle, parseTypedNumber } from "@/lib/academy/shuffle";
import type { Lesson } from "@/lib/academy/types";
import { blockTexts } from "@/lib/academy/text";

function texts(l: Lesson): string[] {
  const out: string[] = [l.title, l.summary, ...l.objectives];
  for (const s of l.sections) {
    out.push(s.heading);
    for (const b of s.blocks) {
      if (b.kind === "p") out.push(b.text);
      else if (b.kind === "list") out.push(...b.items);
      else if (b.kind === "callout") out.push(b.title, b.text);
      // Phase 2 step 1 added block kinds without a caption; blockTexts covers every kind.
      else out.push(...blockTexts(b));
    }
  }
  const e = l.exercise;
  out.push(e.title, e.prompt);
  if (e.kind === "order") out.push(e.explanation, ...e.items.map((i) => i.text));
  if (e.kind === "classify") out.push(...e.items.flatMap((i) => [i.text, i.explain]));
  if (e.kind === "match") out.push(e.explanation, ...e.pairs.flatMap((p) => [p.left, p.right]));
  if (e.kind === "calculate") out.push(e.hint, e.solution);
  for (const q of l.quiz) out.push(q.prompt, ...q.options.flatMap((o) => [o.text, o.explain]));
  out.push(l.practical.title, l.practical.instructions, l.practical.reflectionPrompt, ...l.practical.steps);
  return out;
}

describe("tester: content integrity", () => {
  it("every quiz question: exactly one correct option, unique option ids, explanations everywhere", () => {
    for (const l of LESSONS) {
      const qids = new Set<string>();
      for (const q of l.quiz) {
        expect(qids.has(q.id), `${l.id}/${q.id} dup`).toBe(false);
        qids.add(q.id);
        const ids = q.options.map((o) => o.id);
        expect(new Set(ids).size, `${l.id}/${q.id}`).toBe(ids.length);
        expect(ids.filter((i) => i === q.correct)).toHaveLength(1);
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        for (const o of q.options) expect(o.explain.trim().length, `${l.id}/${q.id}/${o.id}`).toBeGreaterThan(5);
        const texts = q.options.map((o) => o.text.trim().toLowerCase());
        expect(new Set(texts).size, `${l.id}/${q.id} duplicate option text`).toBe(texts.length);
      }
    }
  });

  it("section ids are unique per lesson and do not clash with page anchors", () => {
    const reserved = new Set(["exercise", "quiz", "practical", "main", "content"]);
    for (const l of LESSONS) {
      const ids = l.sections.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) {
        expect(reserved.has(id), `${l.id}: section id "${id}" clashes with a page anchor`).toBe(false);
        expect(/^[a-z0-9][a-z0-9-]{0,79}$/.test(id)).toBe(true);
      }
      expect(/^[a-z0-9][a-z0-9-]{0,79}$/.test(l.id)).toBe(true);
    }
  });

  it("every written lesson is reachable from its track and by URL; next/prev chain covers all", () => {
    const seen = new Set<string>();
    let cur: Lesson | null = LESSONS[0];
    while (cur) {
      expect(seen.has(cur.id)).toBe(false);
      seen.add(cur.id);
      expect(getTrackLesson(cur.trackId, cur.id)).toBe(cur);
      expect(lessonHref(cur)).toBe(`/academy/${cur.trackId}/${cur.id}`);
      cur = neighbours(cur.id).next;
    }
    expect(seen.size).toBe(LESSONS.length);
    for (const t of TRACKS) for (const l of lessonsOfTrack(t.id)) expect(seen.has(l.id)).toBe(true);
    // lesson.next agrees with neighbours().next
    for (const l of LESSONS) expect(l.next).toBe(neighbours(l.id).next?.id ?? null);
  });

  it("wrong track id does not resolve a lesson", () => {
    expect(getTrackLesson("forex-foundations", "forex")).toBeUndefined();
    expect(getTrackLesson("market-foundations", "__proto__")).toBeUndefined();
    expect(getTrackLesson("market-foundations", "constructor")).toBeUndefined();
  });

  it("planned tracks expose no lessons", () => {
    for (const t of TRACKS.filter((t) => t.status === "planned")) {
      expect(t.lessonIds).toHaveLength(0);
      expect(lessonsOfTrack(t.id)).toHaveLength(0);
      expect(t.planned.length).toBeGreaterThan(0);
    }
  });

  it("every glossary reference resolves, and every glossary term is used somewhere", () => {
    for (const l of LESSONS) {
      for (const t of texts(l)) for (const id of termIdsIn(t)) expect(getGlossaryEntry(id), `${l.id}: [[${id}]]`).toBeDefined();
      for (const g of l.glossary) expect(getGlossaryEntry(g), `${l.id} glossary ${g}`).toBeDefined();
    }
  });

  it("no markup is left after plainText and no [[ ]] typos", () => {
    for (const l of LESSONS) for (const t of texts(l)) {
      const p = plainText(t);
      expect(p.includes("[["), `${l.id}: ${t}`).toBe(false);
      expect(p.includes("]]"), `${l.id}: ${t}`).toBe(false);
    }
  });

  it("calculate exercises accept the answer typed in common forms", () => {
    for (const l of LESSONS) {
      if (l.exercise.kind !== "calculate") continue;
      const ex = l.exercise;
      const forms = [String(ex.answer), Number.isInteger(ex.answer) ? `${ex.answer}.00` : ex.answer.toFixed(2), ` ${ex.answer} `];
      if (ex.unit.includes("dollar")) forms.push(`$${ex.answer}`);
      if (ex.unit === "%") forms.push(`${ex.answer}%`, `+${ex.answer}%`);
      for (const f of forms) {
        const n = parseTypedNumber(f);
        expect(n, `${l.id}: "${f}"`).not.toBeNull();
        expect(Math.abs(n! - ex.answer) <= ex.tolerance).toBe(true);
      }
    }
  });

  it("parseTypedNumber rejects ambiguous inputs", () => {
    for (const s of ["", "abc", "1e2", "1,2", "--5", "1.2.3", "Infinity", "NaN", "0x10"]) expect(parseTypedNumber(s), s).toBeNull();
    expect(parseTypedNumber("1,200")).toBe(1200);
    expect(parseTypedNumber("−1")).toBe(-1);
  });

  it("order exercises always start scrambled, and shuffle is stable (no hydration drift)", () => {
    for (const l of LESSONS) {
      if (l.exercise.kind !== "order") continue;
      const a = deterministicShuffle(l.exercise.items, l.exercise.id);
      const b = deterministicShuffle(l.exercise.items, l.exercise.id);
      expect(a).toEqual(b);
      expect(a.map((x) => x.id)).not.toEqual(l.exercise.items.map((x) => x.id));
    }
  });

  it("glossary: every term introduced by some lesson or explicitly app-wide", () => {
    const appWide = new Set(["mastery", "equity", "drawdown", "exposure", "pnl", "price-change"]);
    for (const e of GLOSSARY_LIST) expect(TERM_INTRODUCED_IN.has(e.id) || appWide.has(e.id), e.id).toBe(true);
  });

  // Quality check (not a hard rule from the spec): beginners learn to "pick the longest answer".
  it("REPORT: correct quiz answer is not usually the longest option", () => {
    let longest = 0, total = 0;
    const pos: Record<string, number> = {};
    for (const l of LESSONS) for (const q of l.quiz) {
      total++;
      pos[q.correct] = (pos[q.correct] ?? 0) + 1;
      const max = Math.max(...q.options.map((o) => o.text.length));
      const c = q.options.find((o) => o.id === q.correct)!;
      if (c.text.length === max) longest++;
    }
    console.log(`[tester] correct answer is the longest option in ${longest}/${total} questions; positions`, pos);
    expect(longest / total).toBeLessThan(0.6);
  });
});
