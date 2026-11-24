import "server-only";

/**
 * A small RSS 2.0 / Atom reader for news headlines. It only pulls out the
 * title, link, date and a short description, so no XML library is needed.
 */
export type FeedEntry = { title: string; url: string; publishedAt: number; summary?: string };

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n: string) => ENTITIES[n.toLowerCase()] ?? m);
}

const stripTags = (s: string) => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

function tag(block: string, name: string) {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? m[1] : undefined;
}

export function parseFeed(xml: string): FeedEntry[] {
  const out: FeedEntry[] = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  for (const b of blocks) {
    const rawTitle = tag(b, "title");
    if (!rawTitle) continue;
    const title = stripTags(decode(decode(rawTitle)));
    let url = tag(b, "link");
    url = url ? decode(url).trim() : undefined;
    if (!url) url = b.match(/<link[^>]*href="([^"]+)"/i)?.[1];
    if (!url) url = tag(b, "guid") ? decode(tag(b, "guid")!).trim() : undefined;
    const date = tag(b, "pubDate") ?? tag(b, "published") ?? tag(b, "updated") ?? tag(b, "dc:date");
    const publishedAt = date ? Date.parse(decode(date).trim()) : NaN;
    if (!title || !url || !/^https?:\/\//i.test(url) || !Number.isFinite(publishedAt)) continue;
    const desc = tag(b, "description") ?? tag(b, "summary");
    const summary = desc ? stripTags(decode(decode(desc))).slice(0, 280) : undefined;
    out.push({ title, url, publishedAt, summary: summary || undefined });
  }
  return out;
}
