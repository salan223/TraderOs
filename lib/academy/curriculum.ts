import type { Lesson, Track } from "./types";
import { getAssessment } from "./assessments";
import type { TrackDef } from "./mastery";
import { L1_WHAT_IS_A_MARKET, L2_WHY_PRICES_MOVE, L3_PARTICIPANTS, L4_STOCKS, L5_FOREX } from "./content/market-foundations-1";
import { L6_INDICES, L7_COMMODITIES, L8_CRYPTO, L9_TRADING_VS_INVESTING, L10_TERMINOLOGY } from "./content/market-foundations-2";
import { FX1_QUOTES, FX2_PIPS_LOTS, FX3_LEVERAGE_MARGIN, FX4_PAIRS, FX5_SESSIONS, FX6_DRIVERS, FX7_COSTS } from "./content/forex-foundations";
import { SI1_EXCHANGES, SI2_EARNINGS, SI3_SECTORS, SI4_INDEX_CALC, SI5_FUNDS, SI6_DIVIDENDS_ACTIONS } from "./content/stocks-indices";
import { CR1_WHAT_IS_A_CHART, CR2_CHART_TYPES, CR3_CANDLESTICKS, CR4_CANDLE_PATTERNS } from "./content/chart-reading-1";
import { CR5_TIMEFRAMES, CR6_STRUCTURE, CR7_TRENDS, CR8_VOLUME } from "./content/chart-reading-2";
import { CR9_SCALE, CR10_SUPPORT_RESISTANCE, CR11_GAPS, CR12_PRACTICAL_EXAM } from "./content/chart-reading-3";
import { TA1_MOVING_AVERAGES, TA2_RSI, TA3_MACD, TA4_STOCHASTIC, TA5_BANDS_ATR, TA6_VOLUME_INDICATORS } from "./content/technical-analysis-1";
import { TA7_DIVERGENCE, TA8_TRENDLINES, TA9_CHART_PATTERNS, TA10_FIBONACCI, TA11_CONFLUENCE, TA12_TESTABLE_RULES } from "./content/technical-analysis-2";
import { RM1_RISK_PER_TRADE, RM2_POSITION_SIZING, RM3_STOP_PLACEMENT, RM4_RISK_REWARD, RM5_DRAWDOWNS } from "./content/risk-management-1";
import { MS1_VENUES, MS2_MARKET_MAKERS, MS3_ORDER_BOOK, MS4_ORDER_TYPES, MS5_SLIPPAGE_IMPACT, MS6_AUCTIONS } from "./content/market-structure-1";
import { MS7_FRAGMENTATION, MS8_DARK_POOLS, MS9_HFT, MS10_RETAIL_FILLS, MS11_HALTS } from "./content/market-structure-2";
import { RM6_LEVERAGE_MARGIN, RM7_CORRELATION_HEAT, RM8_GAPS_LIMITS, RM9_AVERAGING_DOWN, RM10_RISK_OF_RUIN } from "./content/risk-management-2";
import { PSY1_PROSPECT, PSY2_DISPOSITION, PSY3_OVERCONFIDENCE, PSY4_BIASES, PSY5_RANDOMNESS, PSY6_VARIANCE } from "./content/psychology-1";
import { PSY7_OUTCOME, PSY8_FOMO_REVENGE, PSY9_TILT, PSY10_CHECKLIST, PSY11_EXPECTATIONS, PSY12_PLAN } from "./content/psychology-2";
import { STRAT1_ANATOMY, STRAT2_EDGES, STRAT3_RULES, STRAT4_ARCHETYPES, STRAT5_EXITS, STRAT6_REGIMES } from "./content/strategy-1";
import { STRAT7_OVERFIT, STRAT8_SPEC, STRAT9_FORWARD, STRAT10_KILL, STRAT11_DIVERSIFY, STRAT12_LIFECYCLE } from "./content/strategy-2";
import { BT1_WHAT, BT2_DATA, BT3_BIASES, BT4_COSTS, BT5_METRICS, BT6_ISOOS, BT7_WALKFORWARD } from "./content/backtesting-1";
import { BT8_ROBUST, BT9_MC, BT10_SNOOP, BT11_REGIMES, BT12_FORWARD, BT13_CHECK } from "./content/backtesting-2";
import { MN1_CENTRAL_BANKS, MN2_INFLATION, MN3_LABOUR, MN4_GROWTH, MN5_YIELD_CURVE, MN6_DIFFERENTIALS, MN7_RISK_ON_OFF } from "./content/macro-news-1";
import { MN8_CALENDAR, MN9_NEWS_TRADING, MN10_EARNINGS, MN11_SHOCKS, MN12_STATEMENTS, MN13_SOURCES } from "./content/macro-news-2";

/** Every written lesson, in curriculum order. */
export const LESSONS: readonly Lesson[] = [
  L1_WHAT_IS_A_MARKET,
  L2_WHY_PRICES_MOVE,
  L3_PARTICIPANTS,
  L4_STOCKS,
  L5_FOREX,
  L6_INDICES,
  L7_COMMODITIES,
  L8_CRYPTO,
  L9_TRADING_VS_INVESTING,
  L10_TERMINOLOGY,
  FX1_QUOTES,
  FX2_PIPS_LOTS,
  FX3_LEVERAGE_MARGIN,
  FX4_PAIRS,
  FX5_SESSIONS,
  FX6_DRIVERS,
  FX7_COSTS,
  SI1_EXCHANGES,
  SI2_EARNINGS,
  SI3_SECTORS,
  SI4_INDEX_CALC,
  SI5_FUNDS,
  SI6_DIVIDENDS_ACTIONS,
  CR1_WHAT_IS_A_CHART,
  CR2_CHART_TYPES,
  CR3_CANDLESTICKS,
  CR4_CANDLE_PATTERNS,
  CR5_TIMEFRAMES,
  CR6_STRUCTURE,
  CR7_TRENDS,
  CR8_VOLUME,
  CR9_SCALE,
  CR10_SUPPORT_RESISTANCE,
  CR11_GAPS,
  CR12_PRACTICAL_EXAM,
  TA1_MOVING_AVERAGES,
  TA2_RSI,
  TA3_MACD,
  TA4_STOCHASTIC,
  TA5_BANDS_ATR,
  TA6_VOLUME_INDICATORS,
  TA7_DIVERGENCE,
  TA8_TRENDLINES,
  TA9_CHART_PATTERNS,
  TA10_FIBONACCI,
  TA11_CONFLUENCE,
  TA12_TESTABLE_RULES,
  RM1_RISK_PER_TRADE,
  RM2_POSITION_SIZING,
  RM3_STOP_PLACEMENT,
  RM4_RISK_REWARD,
  RM5_DRAWDOWNS,
  RM6_LEVERAGE_MARGIN,
  RM7_CORRELATION_HEAT,
  RM8_GAPS_LIMITS,
  RM9_AVERAGING_DOWN,
  RM10_RISK_OF_RUIN,
  PSY1_PROSPECT,
  PSY2_DISPOSITION,
  PSY3_OVERCONFIDENCE,
  PSY4_BIASES,
  PSY5_RANDOMNESS,
  PSY6_VARIANCE,
  PSY7_OUTCOME,
  PSY8_FOMO_REVENGE,
  PSY9_TILT,
  PSY10_CHECKLIST,
  PSY11_EXPECTATIONS,
  PSY12_PLAN,
  STRAT1_ANATOMY,
  STRAT2_EDGES,
  STRAT3_RULES,
  STRAT4_ARCHETYPES,
  STRAT5_EXITS,
  STRAT6_REGIMES,
  STRAT7_OVERFIT,
  STRAT8_SPEC,
  STRAT9_FORWARD,
  STRAT10_KILL,
  STRAT11_DIVERSIFY,
  STRAT12_LIFECYCLE,
  BT1_WHAT,
  BT2_DATA,
  BT3_BIASES,
  BT4_COSTS,
  BT5_METRICS,
  BT6_ISOOS,
  BT7_WALKFORWARD,
  BT8_ROBUST,
  BT9_MC,
  BT10_SNOOP,
  BT11_REGIMES,
  BT12_FORWARD,
  BT13_CHECK,
  MN1_CENTRAL_BANKS,
  MN2_INFLATION,
  MN3_LABOUR,
  MN4_GROWTH,
  MN5_YIELD_CURVE,
  MN6_DIFFERENTIALS,
  MN7_RISK_ON_OFF,
  MN8_CALENDAR,
  MN9_NEWS_TRADING,
  MN10_EARNINGS,
  MN11_SHOCKS,
  MN12_STATEMENTS,
  MN13_SOURCES,
  MS1_VENUES,
  MS2_MARKET_MAKERS,
  MS3_ORDER_BOOK,
  MS4_ORDER_TYPES,
  MS5_SLIPPAGE_IMPACT,
  MS6_AUCTIONS,
  MS7_FRAGMENTATION,
  MS8_DARK_POOLS,
  MS9_HFT,
  MS10_RETAIL_FILLS,
  MS11_HALTS,
];

const written = (id: string) => LESSONS.filter((l) => l.trackId === id).sort((a, b) => a.order - b.order).map((l) => l.id);

/**
 * The 14 tracks. Market Foundations, Forex Foundations, Stocks and Indices,
 * Chart Reading and Risk Management are written. The others show their planned outline and are clearly marked
 * "Not written yet" in the UI.
 */
export const TRACKS: readonly Track[] = [
  { id: "market-foundations", order: 1, title: "Market Foundations", summary: "What markets are, who takes part and why prices move.", status: "written", prerequisites: [], lessonIds: written("market-foundations"), planned: [] },
  { id: "forex-foundations", order: 2, title: "Forex Foundations", summary: "Currency quotes, pips and lots, leverage and margin, sessions, what moves currencies and what trading them costs.", status: "written", prerequisites: ["market-foundations"], lessonIds: written("forex-foundations"), planned: [] },
  { id: "stocks-indices", order: 3, title: "Stocks and Indices", summary: "Exchanges and order books, earnings, sectors, how indices are built, funds and futures, and corporate actions.", status: "written", prerequisites: ["market-foundations"], lessonIds: written("stocks-indices"), planned: [] },
  { id: "crypto", order: 4, title: "Cryptocurrency", summary: "Blockchains, exchanges, custody and crypto-specific risks.", status: "planned", prerequisites: ["market-foundations"], lessonIds: [],
    planned: ["Bitcoin and Ethereum basics", "Exchanges and custody", "Stablecoins", "Crypto volatility and 24/7 markets", "Scams and security"] },
  { id: "commodities", order: 5, title: "Commodities", summary: "Gold, oil and other raw materials, and what drives them.", status: "planned", prerequisites: ["market-foundations"], lessonIds: [],
    planned: ["Energy markets", "Precious and industrial metals", "Agricultural commodities", "Futures, expiry and rolling", "Commodities and the US dollar"] },
  { id: "chart-reading", order: 6, title: "Chart Reading", summary: "How charts are built and drawn, candlesticks, timeframes, structure and trends, volume, scale, levels and gaps, and a practical exam.", status: "written", prerequisites: ["market-foundations"], lessonIds: written("chart-reading"), planned: [] },
  { id: "technical-analysis", order: 7, title: "Technical Analysis", summary: "Moving averages, RSI, MACD, the stochastic, Bollinger Bands and ATR, VWAP and OBV, divergence, trendlines, chart patterns, Fibonacci, confluence and testable rules, each with what it does not tell you.", status: "written", prerequisites: ["chart-reading"], lessonIds: written("technical-analysis"), planned: [] },
  { id: "risk-management", order: 8, title: "Risk Management", summary: "Risk per trade, position sizing for shares, forex and futures, stops, expectancy, drawdowns, leverage, portfolio heat, gaps and loss limits, averaging down and risk of ruin.", status: "written", prerequisites: ["market-foundations", "forex-foundations"], lessonIds: written("risk-management"), planned: [] },
  { id: "trading-psychology", order: 9, title: "Trading Psychology", summary: "Loss aversion, the disposition effect, overconfidence, hindsight, confirmation and recency bias, streaks and variance, outcome bias, FOMO and revenge trading, tilt, stress and sleep, checklists and journals, realistic expectations and a personal trading plan.", status: "written", prerequisites: ["risk-management"], lessonIds: written("trading-psychology"), planned: [] },
  { id: "strategy-development", order: 10, title: "Strategy Development", summary: "Turning an idea into exact, testable rules, then testing, sizing, stopping and retiring it.", status: "written", prerequisites: ["technical-analysis", "risk-management", "trading-psychology"], lessonIds: written("strategy-development"), planned: [] },
  { id: "backtesting", order: 11, title: "Backtesting", summary: "What a backtest can and cannot show, data adjustments, lookahead and survivorship bias, costs and fills, metrics, in-sample and out-of-sample splits, walk-forward, parameter robustness, Monte Carlo and the bootstrap, multiple testing, regimes, forward tests and a validity checklist.", status: "written", prerequisites: ["strategy-development"], lessonIds: written("backtesting"), planned: [] },
  { id: "macro-news", order: 12, title: "Macro and News", summary: "Central banks, inflation, jobs, GDP and PMIs, yields and the yield curve, rate differentials, risk-on and risk-off, the economic calendar, trading around news, earnings, shocks, central bank statements and reliable sources.", status: "written", prerequisites: ["forex-foundations", "stocks-indices"], lessonIds: written("macro-news"), planned: [] },
  { id: "market-structure", order: 13, title: "Market Structure", summary: "Exchanges and dealers, market makers and the spread, the order book and priority, order types and their failure modes, slippage, auctions, fragmentation and best execution, dark pools, HFT, payment for order flow and halts.", status: "written", prerequisites: ["stocks-indices"], lessonIds: written("market-structure"), planned: [] },
  { id: "advanced", order: 14, title: "Advanced Trading Concepts", summary: "Correlation, portfolio risk, derivatives and more.", status: "planned", prerequisites: ["backtesting", "macro-news", "market-structure"], lessonIds: [],
    planned: ["Correlation", "Portfolio-level risk", "Options basics", "Futures in depth", "Measuring performance properly"] },
];

const LESSON_BY_ID = new Map(LESSONS.map((l) => [l.id, l]));
const TRACK_BY_ID = new Map(TRACKS.map((t) => [t.id, t]));

export function getTrack(id: string): Track | undefined {
  return TRACK_BY_ID.get(id);
}

export function getLesson(id: string): Lesson | undefined {
  return LESSON_BY_ID.get(id);
}

/** A written lesson that belongs to the given track, or undefined. */
export function getTrackLesson(trackId: string, lessonId: string): Lesson | undefined {
  const l = LESSON_BY_ID.get(lessonId);
  return l && l.trackId === trackId ? l : undefined;
}

export function lessonsOfTrack(trackId: string): Lesson[] {
  const t = TRACK_BY_ID.get(trackId);
  return t ? t.lessonIds.map((id) => LESSON_BY_ID.get(id)!).filter(Boolean) : [];
}

/** Previous and next written lessons in curriculum order (across tracks). */
export function neighbours(lessonId: string): { prev: Lesson | null; next: Lesson | null } {
  const i = LESSONS.findIndex((l) => l.id === lessonId);
  if (i < 0) return { prev: null, next: null };
  return { prev: LESSONS[i - 1] ?? null, next: LESSONS[i + 1] ?? null };
}

export function lessonHref(l: Pick<Lesson, "trackId" | "id">) {
  return `/academy/${l.trackId}/${l.id}`;
}

/** The lesson that introduces each glossary term (first one in curriculum order). */
export const TERM_INTRODUCED_IN: ReadonlyMap<string, Lesson> = (() => {
  const m = new Map<string, Lesson>();
  for (const l of LESSONS) for (const g of l.glossary) if (!m.has(g)) m.set(g, l);
  return m;
})();

export function assessmentHref(trackId: string) {
  return `/academy/${trackId}/assessment`;
}

/** Every track with its lessons and assessment, for the track-level rules in mastery.ts. */
export const TRACK_DEFS: readonly TrackDef[] = TRACKS.map((t) => ({
  id: t.id,
  title: t.title,
  order: t.order,
  status: t.status,
  prerequisites: t.prerequisites,
  lessons: lessonsOfTrack(t.id),
  assessment: getAssessment(t.id) ?? null,
}));

/** Track titles for "unlocked by" messages. */
export function trackTitle(id: string): string {
  return TRACK_BY_ID.get(id)?.title ?? id;
}
