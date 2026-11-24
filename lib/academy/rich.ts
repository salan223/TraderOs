import { getGlossaryEntry, inlineLabel } from "./glossary";

/**
 * Tiny inline markup for lesson text: [[term-id]] or [[term-id|shown text]]
 * becomes a glossary tooltip. Everything else is plain text.
 */
export type RichPart = { type: "text"; text: string } | { type: "term"; id: string; text: string | null };

const RE = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;

export function parseRich(input: string): RichPart[] {
  const parts: RichPart[] = [];
  let last = 0;
  for (const m of input.matchAll(RE)) {
    const i = m.index ?? 0;
    if (i > last) parts.push({ type: "text", text: input.slice(last, i) });
    parts.push({ type: "term", id: m[1], text: m[2] ?? null });
    last = i + m[0].length;
  }
  if (last < input.length) parts.push({ type: "text", text: input.slice(last) });
  return parts;
}

export function termIdsIn(input: string): string[] {
  return parseRich(input).flatMap((p) => (p.type === "term" ? [p.id] : []));
}

/** Plain text with markup removed (for search, metadata, aria labels). */
export function plainText(input: string): string {
  return input.replace(/\*\*/g, "").replace(RE, (_, id: string, shown?: string) => {
    if (shown) return shown;
    const e = getGlossaryEntry(id);
    return e ? inlineLabel(e) : id.replace(/-/g, " ");
  });
}
