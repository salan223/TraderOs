import type { NewsImpact } from "./types";

/**
 * Topic tags for headlines, matched by keywords. This is a simple word
 * match, not a judgement by AI or by a person, and the app says so. It is
 * there to help a beginner spot the kinds of news that usually move markets:
 * central banks, inflation, jobs and growth data, big earnings, and shocks.
 */
type TopicRule = { tag: string; high: boolean; re: RegExp };

const RULES: TopicRule[] = [
  { tag: "Fed & rates", high: true,
    re: /\b(fed|fomc|federal reserve|powell|rate (cut|hike|decision)s?|interest rates?|central bank|ecb|lagarde|bank of (england|japan|canada)|boj|boe|treasury yields?|bond yields?|10-year)\b/i },
  { tag: "Inflation", high: true, re: /\b(inflation|cpi|pce|ppi|consumer prices?|producer prices?|deflation)\b/i },
  { tag: "Jobs", high: true,
    re: /\b(payrolls?|jobs report|jobless claims|unemployment|labor market|labour market|hiring|layoffs?)\b/i },
  { tag: "Economy", high: true,
    re: /\b(gdp|recession|retail sales|ism|pmi|consumer (confidence|sentiment)|economic data|housing starts|durable goods)\b/i },
  { tag: "Earnings", high: false,
    re: /\b(earnings|quarterly (results|profit|revenue)|revenue|guidance|profit warning|beats? estimates|miss(es)? estimates|eps)\b/i },
  { tag: "Trade & politics", high: true,
    re: /\b(tariffs?|sanctions?|trade (war|deal)|white house|congress|government shutdown|debt ceiling|election|war|invasion|missile|ceasefire)\b/i },
  { tag: "Oil & energy", high: false, re: /\b(oil|crude|opec|brent|wti|natural gas|gasoline)\b/i },
  { tag: "Crypto", high: false, re: /\b(bitcoin|crypto(currency|currencies)?|ether(eum)?|stablecoin|sec .*crypto)\b/i },
  { tag: "Big move", high: true,
    re: /\b(plunges?|plummets?|tumbles?|crash(es)?|sell-?off|surges?|soars?|skyrockets?|record (high|low)|worst day|best day|circuit breaker|halted)\b/i },
  { tag: "Markets", high: false, re: /\b(stocks?|s&p 500|s&p|dow|nasdaq|wall street|futures|shares)\b/i },
];

export function tagHeadline(title: string, summary = ""): { tags: string[]; impact: NewsImpact } {
  const text = `${title} ${summary.slice(0, 300)}`;
  const matched = RULES.filter((r) => r.re.test(text));
  // "Big move" only counts as high impact when it is about markets.
  const isMarket = matched.some((r) => r.tag === "Markets" || r.tag === "Crypto" || r.tag === "Oil & energy");
  const high = matched.some((r) => r.high && (r.tag !== "Big move" || isMarket));
  return { tags: matched.map((r) => r.tag).slice(0, 3), impact: high ? "high" : "normal" };
}

export const IMPACT_NOTE =
  "\"Likely market-moving\" is a keyword match on topics that usually move prices (central banks, inflation, jobs, growth data, trade and big swings). It is not a prediction.";
