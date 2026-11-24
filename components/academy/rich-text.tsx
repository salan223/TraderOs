import { Fragment } from "react";
import { parseRich } from "@/lib/academy/rich";
import { Term } from "@/components/ui/term";

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseRich(text).map((p, i) =>
        p.type === "text" ? <Fragment key={i}>{p.text}</Fragment> : <Term key={i} id={p.id}>{p.text ?? undefined}</Term>,
      )}
    </>
  );
}

const BOLD = /\*\*(.+?)\*\*/g;

/**
 * Renders lesson text: [[term-id|text]] becomes a glossary tooltip and
 * **text** a highlighted key term or number.
 */
export function RichText({ text }: { text: string }) {
  if (!text.includes("**")) return <Inline text={text} />;
  const out = [];
  let last = 0, k = 0;
  for (const m of text.matchAll(BOLD)) {
    const i = m.index ?? 0;
    if (i > last) out.push(<Inline key={k++} text={text.slice(last, i)} />);
    out.push(<strong key={k++} className="font-semibold text-fg" data-key-term><Inline text={m[1]} /></strong>);
    last = i + m[0].length;
  }
  if (last < text.length) out.push(<Inline key={k++} text={text.slice(last)} />);
  return <>{out}</>;
}

/**
 * Splits "Label: explanation" into its parts when the label is short and
 * plain (no glossary markup, at most six words). Renderers use it to show
 * such paragraphs and list items as definition rows.
 */
export function splitLead(text: string): { lead: string; rest: string } | null {
  const m = /^([A-Z][^:.?!\[\]*]{1,48}):\s+(\S[\s\S]*)$/.exec(text);
  if (!m) return null;
  const words = m[1].trim().split(/\s+/).length;
  if (words > 6) return null;
  return { lead: m[1].trim(), rest: m[2] };
}

/**
 * Splits a long paragraph into short ones (about two sentences, at most
 * ~`target` characters each) at sentence ends, never inside [[...]] markup.
 * Short paragraphs come back unchanged as a single chunk.
 */
export function chunkParagraph(text: string, target = 230): string[] {
  if (text.length <= target * 1.25) return [text];
  const sentences: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text.startsWith("[[", i)) depth++;
    else if (text.startsWith("]]", i)) depth = Math.max(0, depth - 1);
    const ch = text[i];
    if (depth === 0 && (ch === "." || ch === "?" || ch === "!")) {
      let j = i + 1;
      while (j < text.length && /['’")]/.test(text[j])) j++;
      if (text[j] === " " && /[A-Z[']/.test(text[j + 1] ?? "")) {
        sentences.push(text.slice(start, j));
        start = j + 1;
        i = j;
      }
    }
  }
  sentences.push(text.slice(start));
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if (cur && cur.length + s.length + 1 > target) { out.push(cur); cur = s; }
    else cur = cur ? `${cur} ${s}` : s;
  }
  if (cur) out.push(cur);
  // Never leave a tiny last chunk on its own.
  if (out.length > 1 && out[out.length - 1].length < 60) { const last = out.pop()!; out[out.length - 1] += ` ${last}`; }
  return out;
}
