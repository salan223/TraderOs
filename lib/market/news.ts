import "server-only";
import { cached, fetchWithTimeout } from "./cache";
import { tagHeadline } from "./impact";
import { fetchFinnhubNews, finnhubKey } from "./providers/finnhub";
import { parseFeed, type FeedEntry } from "./rss";
import type { NewsItem, NewsResponse, NewsSourceStatus } from "./types";

/**
 * Live market news, merged from several free sources:
 *  - Finnhub's general market news (needs the free FINNHUB_API_KEY)
 *  - Public RSS feeds from CNBC, MarketWatch and Yahoo Finance (no key)
 *  - The Federal Reserve's own press releases (no key)
 *
 * Every source is refreshed at most once a minute by the server, whatever the
 * number of visitors. Headlines link to the original article; Trader OS
 * shows only the headline, a short summary and the source.
 */
export const NEWS_REFRESH_SECONDS = 60;
const MAX_AGE_MS = 3 * 24 * 3600 * 1000;
const MAX_ITEMS = 120;

type Source = { id: string; name: string; needsKey?: () => boolean; load: () => Promise<Array<FeedEntry & { source?: string }>> };

function rss(id: string, name: string, url: string): Source {
  return {
    id,
    name,
    load: async () => {
      const res = await fetchWithTimeout(url, {
        headers: { Accept: "application/rss+xml, application/xml, text/xml", "User-Agent": "Mozilla/5.0 (TraderOS news reader)" },
      });
      if (!res.ok) throw new Error(`${name} answered ${res.status}.`);
      const entries = parseFeed(await res.text());
      if (entries.length === 0) throw new Error(`${name} sent no readable headlines.`);
      return entries;
    },
  };
}

const SOURCES: Source[] = [
  {
    id: "finnhub",
    name: "Finnhub market news",
    needsKey: () => !finnhubKey(),
    load: fetchFinnhubNews,
  },
  rss("cnbc-top", "CNBC", "https://www.cnbc.com/id/100003114/device/rss/rss.html"),
  rss("cnbc-markets", "CNBC Markets", "https://www.cnbc.com/id/20409666/device/rss/rss.html"),
  rss("cnbc-economy", "CNBC Economy", "https://www.cnbc.com/id/20910258/device/rss/rss.html"),
  rss("marketwatch", "MarketWatch", "https://feeds.content.dowjones.io/public/rss/mw_realtimeheadlines"),
  rss("yahoo", "Yahoo Finance", "https://finance.yahoo.com/news/rssindex"),
  rss("fed", "Federal Reserve", "https://www.federalreserve.gov/feeds/press_all.xml"),
];

const normalise = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

function idFor(url: string) {
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (Math.imul(31, h) + url.charCodeAt(i)) | 0;
  return `n${(h >>> 0).toString(36)}`;
}

export async function getNews(): Promise<NewsResponse> {
  const statuses: NewsSourceStatus[] = [];
  const all: NewsItem[] = [];

  await Promise.all(
    SOURCES.map(async (src) => {
      if (src.needsKey?.()) {
        statuses.push({ id: src.id, name: src.name, status: "missing_key", count: 0, message: "Add FINNHUB_API_KEY to include this feed." });
        return;
      }
      const r = await cached(`news:${src.id}`, NEWS_REFRESH_SECONDS * 1000, src.load);
      const entries = r.value ?? [];
      statuses.push({
        id: src.id,
        name: src.name,
        status: r.value ? "ok" : "error",
        count: entries.length,
        message: r.error,
      });
      for (const e of entries) {
        const source = e.source ?? src.name;
        const { tags, impact } = tagHeadline(e.title, e.summary);
        all.push({ id: idFor(e.url), title: e.title, url: e.url, source, publishedAt: e.publishedAt, summary: e.summary, tags, impact });
      }
    }),
  );

  // Newest first, drop old and future-dated items, and remove the same story from two feeds.
  const now = Date.now();
  const seen = new Set<string>();
  const items = all
    .filter((n) => n.publishedAt > now - MAX_AGE_MS && n.publishedAt < now + 10 * 60_000)
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .filter((n) => {
      const k = normalise(n.title);
      if (seen.has(k) || seen.has(n.url)) return false;
      seen.add(k);
      seen.add(n.url);
      return true;
    })
    .slice(0, MAX_ITEMS);

  statuses.sort((a, b) => SOURCES.findIndex((s) => s.id === a.id) - SOURCES.findIndex((s) => s.id === b.id));
  return { generatedAt: now, refreshSeconds: NEWS_REFRESH_SECONDS, items, sources: statuses };
}
