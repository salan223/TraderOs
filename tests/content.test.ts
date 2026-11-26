import { describe, expect, it } from "vitest";
import { LESSONS, TRACKS, TERM_INTRODUCED_IN, getLesson, lessonsOfTrack, neighbours } from "@/lib/academy/curriculum";
import { GLOSSARY, GLOSSARY_IDS_IN_ORDER, GLOSSARY_LIST, getGlossaryEntry, inlineLabel } from "@/lib/academy/glossary";
import { parseRich, plainText, termIdsIn } from "@/lib/academy/rich";
import { deterministicShuffle, parseTypedNumber } from "@/lib/academy/shuffle";
import type { Block, Exercise, Lesson } from "@/lib/academy/types";
import { blockTexts } from "@/lib/academy/text";

const ALL_WIDGETS = [
  "fx-rate-converter", "fx-spread", "fx-pip-calculator", "fx-position-size", "fx-margin-sim", "fx-pair-explorer",
  "fx-session-clock", "fx-drivers", "fx-cost-calculator", "si-order-book", "si-earnings", "si-cap-bubbles",
  "si-index-builder", "si-etf-basket", "si-futures", "si-corporate-actions",
  // Track 6, Chart Reading
  "cr-trade-tape", "cr-chart-types", "cr-candle-builder", "cr-pattern-lab", "cr-timeframes", "cr-structure",
  "cr-trend-tools", "cr-volume", "cr-scale", "cr-levels", "cr-gaps", "cr-exam",
  // Track 8, Risk Management
  "rm-risk-budget", "rm-position-size", "rm-stop-placement", "rm-expectancy", "rm-drawdown",
  "rm-leverage", "rm-heat", "rm-gap-limits", "rm-averaging-down", "rm-monte-carlo",
  // Track 8 static diagrams (registered as widgets, rendered as plain figures)
  "rm-fig-r-ladder", "rm-fig-stop-size", "rm-fig-stop-methods", "rm-fig-breakeven", "rm-fig-recovery", "rm-fig-margin-ladder", "rm-fig-heat-stack", "rm-fig-gap", "rm-fig-averaging", "rm-fig-sizing-paths",
  // Track 7, Technical Analysis
  "ta-lab", "ta-lab-rsi", "ta-lab-macd", "ta-lab-stoch", "ta-lab-bands", "ta-lab-volume",
  "ta-divergence", "ta-trendlines", "ta-patterns", "ta-fibonacci", "ta-confluence", "ta-overfitting",
  // Track 7 static diagrams (registered as widgets, rendered as plain figures)
  "ta-fig-ma-lag", "ta-fig-rsi", "ta-fig-macd", "ta-fig-stoch", "ta-fig-bands", "ta-fig-true-range", "ta-fig-vwap-obv", "ta-fig-divergence",
  "ta-fig-trendline", "ta-fig-head-shoulders", "ta-fig-triangles", "ta-fig-fibonacci", "ta-fig-timeframes", "ta-fig-redundancy", "ta-fig-rule", "ta-fig-overfit",
  // Track 13, Market Structure
  "ms-book", "ms-book-types", "ms-book-slippage", "ms-book-thin", "ms-venues", "ms-spread", "ms-impact-curve", "ms-auction",
  "ms-nbbo", "ms-dark-pool", "ms-latency", "ms-retail", "ms-halts",
  // Track 13 static diagrams (registered as widgets, rendered as plain figures)
  "ms-fig-venues", "ms-fig-spread", "ms-fig-ladder", "ms-fig-queue", "ms-fig-stop-gap", "ms-fig-walk", "ms-fig-auction",
  "ms-fig-nbbo", "ms-fig-dark", "ms-fig-latency", "ms-fig-retail-route", "ms-fig-luld",
  // Track 9, Trading Psychology
  "psy-prospect", "psy-disposition", "psy-overtrading", "psy-bias-trainer", "psy-streaks", "psy-edge-sim",
  "psy-outcome-sorter", "psy-revenge", "psy-tilt-check", "psy-checklist", "psy-expectations", "psy-plan",
  // Track 9 static diagrams (registered as widgets, rendered as plain figures)
  "psy-fig-value", "psy-fig-disposition", "psy-fig-overconfidence", "psy-fig-biases", "psy-fig-gamblers", "psy-fig-streaks",
  "psy-fig-outcome", "psy-fig-revenge", "psy-fig-tilt", "psy-fig-checklist", "psy-fig-expectations", "psy-fig-plan",
  // Track 10, Strategy Development
  "strat-rule-builder", "strat-edge-sorter", "strat-playground", "strat-exit-entry", "strat-regime-filter", "strat-overfit",
  "strat-spec", "strat-sample-size", "strat-kill", "strat-diversify", "strat-decay",
  // Track 10 static diagrams (registered as widgets, rendered as plain figures)
  "strat-fig-anatomy", "strat-fig-edges", "strat-fig-rules", "strat-fig-archetypes", "strat-fig-exits", "strat-fig-regimes",
  "strat-fig-overfit", "strat-fig-spec", "strat-fig-pipeline", "strat-fig-kill", "strat-fig-diversify", "strat-fig-lifecycle",
  // Track 11, Backtesting
  "bt-lab", "bt-adjust", "bt-lookahead", "bt-survivorship", "bt-costs", "bt-metrics", "bt-sweep",
  "bt-walk-forward", "bt-monte-carlo", "bt-snooping", "bt-regimes", "bt-forward", "bt-checklist",
  // Track 11 static diagrams (registered as widgets, rendered as plain figures)
  "bt-fig-what", "bt-fig-data", "bt-fig-bias", "bt-fig-costs", "bt-fig-metrics", "bt-fig-split", "bt-fig-walkforward",
  "bt-fig-plateau", "bt-fig-montecarlo", "bt-fig-snooping", "bt-fig-regimes", "bt-fig-forward", "bt-fig-checklist",
  // Track 12, Macro and News
  "macro-surprise", "macro-carry", "macro-yield-curve", "macro-news-spike", "macro-tone", "macro-sources",
  "macro-inflation", "macro-pmi", "macro-correlation", "macro-earnings-gap",
  // Track 12 static diagrams (registered as widgets, rendered as plain figures)
  "macro-fig-central-bank", "macro-fig-inflation", "macro-fig-labour", "macro-fig-growth", "macro-fig-yield-curve",
  "macro-fig-differential", "macro-fig-risk-on-off", "macro-fig-calendar", "macro-fig-news-spike", "macro-fig-earnings",
  "macro-fig-shocks", "macro-fig-statement", "macro-fig-sources",
  // Tracks 4, 5 and 14
  "cy-hash-chain", "cy-custody", "cy-stablecoin-run", "cy-volatility", "cy-scam-check",
  "co-crack-spread", "co-metals", "co-stocks-to-use", "co-roll-yield", "co-dollar",
  "adv-correlation", "adv-portfolio-risk", "adv-option-payoff", "adv-futures-margin", "adv-performance",
];
const WRITTEN = ["market-foundations", "forex-foundations", "stocks-indices", "chart-reading", "technical-analysis", "risk-management", "trading-psychology", "strategy-development", "backtesting", "macro-news", "market-structure", "crypto", "commodities", "advanced"];

const ALL_VISUALS = [
  "market-meeting", "supply-demand", "participants-map", "share-ownership", "currency-pair",
  "index-basket", "commodity-groups", "blockchain-chain", "time-horizons", "bid-ask-spread",
];

function exerciseTexts(e: Exercise): string[] {
  const base = [e.title, e.prompt];
  switch (e.kind) {
    case "order": return [...base, e.explanation, ...e.items.map((i) => i.text)];
    case "classify": return [...base, ...e.items.flatMap((i) => [i.text, i.explain]), ...e.categories.map((c) => c.label)];
    case "match": return [...base, e.explanation, ...e.pairs.flatMap((p) => [p.left, p.right])];
    case "calculate": return [...base, e.hint, e.solution];
  }
}

function allTexts(l: Lesson): string[] {
  return [
    l.title, l.summary, ...l.objectives,
    ...l.sections.flatMap((s) => [s.heading, ...s.blocks.flatMap(blockTexts)]),
    ...exerciseTexts(l.exercise),
    ...l.quiz.flatMap((q) => [q.prompt, ...q.options.flatMap((o) => [o.text, o.explain])]),
    l.practical.title, l.practical.instructions, l.practical.reflectionPrompt, ...l.practical.steps,
  ];
}

const unique = (xs: string[]) => new Set(xs).size === xs.length;

describe("curriculum structure", () => {
  it("has 14 tracks with unique ids and orders 1..14", () => {
    expect(TRACKS).toHaveLength(14);
    expect(unique(TRACKS.map((t) => t.id))).toBe(true);
    expect(TRACKS.map((t) => t.order)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
    expect(TRACKS.find((t) => t.id === "glossary")).toBeUndefined(); // would clash with /academy/glossary
  });

  it("all 14 tracks are written with the expected lesson counts (any planned track would need an outline and no lessons)", () => {
    const sizes: Record<string, number> = { "market-foundations": 10, "forex-foundations": 7, "stocks-indices": 6, "chart-reading": 12, "technical-analysis": 12, "risk-management": 10, "trading-psychology": 12, "strategy-development": 12, "backtesting": 13, "macro-news": 13, "market-structure": 11, "crypto": 5, "commodities": 5, "advanced": 5 };
    for (const t of TRACKS) {
      if (WRITTEN.includes(t.id)) {
        expect(t.status).toBe("written");
        expect(t.lessonIds).toHaveLength(sizes[t.id]);
        expect(t.planned).toHaveLength(0);
      } else {
        expect(t.status).toBe("planned");
        expect(t.lessonIds).toHaveLength(0);
        expect(t.planned.length).toBeGreaterThan(0);
      }
    }
  });

  it("has the 10 Market Foundations lessons in the required order", () => {
    expect(lessonsOfTrack("market-foundations").map((l) => l.title)).toEqual([
      "What is a financial market?",
      "Why do prices move?",
      "Buyers, sellers and market participants",
      "Stocks",
      "Forex",
      "Indices",
      "Commodities",
      "Cryptocurrency",
      "Trading versus investing",
      "Market terminology",
    ]);
    expect(lessonsOfTrack("market-foundations").map((l) => l.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("has the Forex Foundations and Stocks and Indices lessons in order", () => {
    expect(lessonsOfTrack("forex-foundations").map((l) => l.id)).toEqual([
      "fx-quotes", "fx-pips-lots", "fx-leverage-margin", "fx-pairs", "fx-sessions", "fx-drivers", "fx-costs",
    ]);
    expect(lessonsOfTrack("stocks-indices").map((l) => l.id)).toEqual([
      "si-exchanges", "si-earnings", "si-sectors", "si-index-calc", "si-funds", "si-dividends-actions",
    ]);
    expect(lessonsOfTrack("chart-reading").map((l) => l.id)).toEqual([
      "cr-what-is-a-chart", "cr-chart-types", "cr-candlesticks", "cr-candle-patterns", "cr-timeframes", "cr-structure",
      "cr-trends", "cr-volume", "cr-scale", "cr-support-resistance", "cr-gaps", "cr-practical-exam",
    ]);
    expect(lessonsOfTrack("risk-management").map((l) => l.id)).toEqual([
      "rm-risk-per-trade", "rm-position-sizing", "rm-stop-placement", "rm-risk-reward", "rm-drawdowns",
      "rm-leverage-margin", "rm-correlation-heat", "rm-gaps-limits", "rm-averaging-down", "rm-risk-of-ruin",
    ]);
    expect(lessonsOfTrack("technical-analysis").map((l) => l.id)).toEqual([
      "ta-moving-averages", "ta-rsi", "ta-macd", "ta-stochastic", "ta-bands-atr", "ta-volume-indicators",
      "ta-divergence", "ta-trendlines", "ta-chart-patterns", "ta-fibonacci", "ta-confluence", "ta-testable-rules",
    ]);
    expect(lessonsOfTrack("market-structure").map((l) => l.id)).toEqual([
      "ms-venues", "ms-market-makers", "ms-order-book", "ms-order-types", "ms-slippage-impact", "ms-auctions",
      "ms-fragmentation", "ms-dark-pools", "ms-hft", "ms-retail-fills", "ms-halts",
    ]);
    expect(lessonsOfTrack("trading-psychology").map((l) => l.id)).toEqual([
      "psy-prospect-theory", "psy-disposition", "psy-overconfidence", "psy-biases", "psy-randomness", "psy-variance",
      "psy-outcome-bias", "psy-fomo-revenge", "psy-tilt-stress", "psy-checklists-journal", "psy-expectations", "psy-trading-plan",
    ]);
    expect(lessonsOfTrack("strategy-development").map((l) => l.id)).toEqual([
      "strat-anatomy", "strat-edge-sources", "strat-testable-rules", "strat-archetypes", "strat-exits-entries", "strat-filters-regimes",
      "strat-curve-fitting", "strat-spec-doc", "strat-forward-testing", "strat-kill-criteria", "strat-diversification", "strat-lifecycle",
    ]);
    expect(lessonsOfTrack("backtesting").map((l) => l.id)).toEqual([
      "bt-what-it-tells", "bt-data-quality", "bt-biases", "bt-costs-fills", "bt-metrics", "bt-is-oos", "bt-walk-forward",
      "bt-robustness", "bt-monte-carlo", "bt-multiple-testing", "bt-regimes", "bt-forward-vs-backtest", "bt-checklist",
    ]);
    expect(lessonsOfTrack("macro-news").map((l) => l.id)).toEqual([
      "mn-central-banks", "mn-inflation", "mn-labour", "mn-growth", "mn-yield-curve", "mn-rate-differentials", "mn-risk-on-off",
      "mn-calendar", "mn-news-trading", "mn-earnings", "mn-shocks", "mn-statements", "mn-sources",
    ]);
    for (const t of ["forex-foundations", "stocks-indices", "chart-reading", "technical-analysis", "risk-management", "trading-psychology", "strategy-development", "backtesting", "macro-news", "market-structure"]) {
      expect(lessonsOfTrack(t).map((l) => l.order)).toEqual(lessonsOfTrack(t).map((_, i) => i + 1));
    }
  });

  it("curriculum order is track by track, and the chain runs MF → forex → stocks → chart reading → technical analysis → risk management → trading psychology → strategy development → backtesting → macro and news → market structure", () => {
    const trackOrder = LESSONS.map((l) => TRACKS.find((t) => t.id === l.trackId)!.order);
    expect([...trackOrder].sort((a, b) => a - b)).toEqual(trackOrder);
    expect(getLesson("terminology")!.next).toBe("fx-quotes");
    expect(getLesson("fx-costs")!.next).toBe("si-exchanges");
    // Tracks 4 (Cryptocurrency) and 5 (Commodities) sit between Stocks and Indices (3) and Chart Reading (6).
    expect(getLesson("si-dividends-actions")!.next).toBe("cy-blockchains");
    expect(getLesson("cy-scams")!.next).toBe("co-energy");
    expect(getLesson("co-dollar")!.next).toBe("cr-what-is-a-chart");
    // Track 7 (Technical Analysis, order 7) sits between Chart Reading (6) and Risk Management (8).
    expect(getLesson("cr-practical-exam")!.next).toBe("ta-moving-averages");
    expect(getLesson("ta-testable-rules")!.next).toBe("rm-risk-per-trade");
    // Track 9 (Trading Psychology) follows Risk Management, then Track 10 (Strategy Development) and Track 11 (Backtesting); Track 12 (Macro and News) then Track 13 (Market Structure) follow.
    expect(getLesson("rm-risk-of-ruin")!.next).toBe("psy-prospect-theory");
    expect(getLesson("psy-trading-plan")!.next).toBe("strat-anatomy");
    expect(getLesson("strat-lifecycle")!.next).toBe("bt-what-it-tells");
    expect(getLesson("bt-checklist")!.next).toBe("mn-central-banks");
    expect(getLesson("mn-sources")!.next).toBe("ms-venues");
    // Track 14 (Advanced Trading Concepts) closes the curriculum.
    expect(getLesson("ms-halts")!.next).toBe("adv-correlation");
    expect(LESSONS[LESSONS.length - 1].next).toBeNull();
  });

  it("has unique lesson ids, and every track lesson id resolves", () => {
    expect(unique(LESSONS.map((l) => l.id))).toBe(true);
    for (const t of TRACKS) for (const id of t.lessonIds) expect(getLesson(id)?.trackId).toBe(t.id);
  });

  it("next-lesson links are valid and follow curriculum order", () => {
    for (const l of LESSONS) {
      if (l.next === null) {
        expect(neighbours(l.id).next).toBeNull();
      } else {
        expect(getLesson(l.next), `${l.id} → ${l.next}`).toBeDefined();
        expect(neighbours(l.id).next?.id).toBe(l.next);
      }
    }
  });
});

describe.each(LESSONS.map((l) => [l.id, l] as const))("lesson %s", (_id, l) => {
  it("has objectives, sections and a practical exercise", () => {
    expect(l.objectives.length).toBeGreaterThanOrEqual(3);
    expect(l.sections.length).toBeGreaterThanOrEqual(3);
    expect(unique(l.sections.map((s) => s.id))).toBe(true);
    for (const s of l.sections) expect(s.blocks.length).toBeGreaterThan(0);
    expect(l.practical.steps.length).toBeGreaterThan(0);
    expect(l.practical.reflectionPrompt.length).toBeGreaterThan(0);
    expect(l.minutes).toBeGreaterThan(0);
  });

  it("has at least one known visual or interactive illustration", () => {
    const blocks = l.sections.flatMap((s) => s.blocks);
    const visuals = blocks.filter((b) => b.kind === "visual");
    const widgets = blocks.filter((b) => b.kind === "interactive");
    expect(visuals.length + widgets.length).toBeGreaterThanOrEqual(1);
    for (const v of visuals) expect(ALL_VISUALS).toContain(v.kind === "visual" && v.visual);
    for (const w of widgets) {
      expect(ALL_WIDGETS).toContain(w.kind === "interactive" && w.widget);
      if (w.kind === "interactive") {
        expect(w.title.trim().length).toBeGreaterThan(3);
        expect(w.caption.trim().length).toBeGreaterThan(20);
      }
    }
    // Tracks 2, 3, 6 and 8 were written around live illustrations: at least one per lesson.
    if (l.trackId !== "market-foundations") expect(widgets.length).toBeGreaterThanOrEqual(1);
  });

  it("cross-links only to lessons that exist and come earlier", () => {
    const idx = LESSONS.indexOf(l);
    for (const s of l.sections) for (const b of s.blocks) if (b.kind === "callout" && b.link) {
      const target = getLesson(b.link.lessonId);
      expect(target, `${l.id} links to ${b.link.lessonId}`).toBeDefined();
      expect(LESSONS.indexOf(target!)).toBeLessThan(idx);
      expect(b.link.label.trim().length).toBeGreaterThan(5);
    }
  });

  it("has a quiz of 4–6 questions with exactly one correct answer each", () => {
    expect(l.quiz.length).toBeGreaterThanOrEqual(4);
    expect(l.quiz.length).toBeLessThanOrEqual(6);
    expect(unique(l.quiz.map((q) => q.id))).toBe(true);
    for (const q of l.quiz) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(unique(q.options.map((o) => o.id))).toBe(true);
      expect(q.options.filter((o) => o.id === q.correct)).toHaveLength(1);
      for (const o of q.options) expect(o.explain.trim().length, `${q.id}/${o.id} explanation`).toBeGreaterThan(0);
    }
  });

  it("has a well-formed exercise", () => {
    const e = l.exercise;
    switch (e.kind) {
      case "order":
        expect(e.items.length).toBeGreaterThanOrEqual(3);
        expect(unique(e.items.map((i) => i.id))).toBe(true);
        break;
      case "classify": {
        const cats = e.categories.map((c) => c.id);
        expect(unique(cats)).toBe(true);
        expect(e.items.length).toBeGreaterThanOrEqual(3);
        expect(unique(e.items.map((i) => i.id))).toBe(true);
        for (const it of e.items) expect(cats).toContain(it.category);
        // every category is used at least once, so no option is a pure decoy
        for (const c of cats) expect(e.items.some((i) => i.category === c)).toBe(true);
        break;
      }
      case "match":
        expect(e.pairs.length).toBeGreaterThanOrEqual(3);
        expect(unique(e.pairs.map((p) => p.id))).toBe(true);
        expect(unique(e.pairs.map((p) => p.right))).toBe(true);
        break;
      case "calculate":
        expect(Number.isFinite(e.answer)).toBe(true);
        expect(e.tolerance).toBeGreaterThanOrEqual(0);
        break;
    }
  });

  it("only references glossary terms that exist", () => {
    for (const id of l.glossary) expect(getGlossaryEntry(id), `glossary id ${id}`).toBeDefined();
    for (const t of allTexts(l)) for (const id of termIdsIn(t)) expect(getGlossaryEntry(id), `[[${id}]] in ${l.id}`).toBeDefined();
  });

  it("introduces every term it marks up inline (or an earlier lesson did)", () => {
    const idx = LESSONS.indexOf(l);
    const known = new Set(LESSONS.slice(0, idx + 1).flatMap((x) => x.glossary));
    for (const s of l.sections) for (const b of s.blocks) for (const t of blockTexts(b)) for (const id of termIdsIn(t)) {
      expect(known.has(id), `${l.id} uses [[${id}]] before it is introduced`).toBe(true);
    }
  });

  it("has no leftover markup in rendered text", () => {
    for (const t of allTexts(l)) expect(plainText(t)).not.toMatch(/\[\[|\]\]/);
  });
});

describe("exercise variety", () => {
  it("uses at least 3 different exercise types across the lessons", () => {
    expect(new Set(LESSONS.map((l) => l.exercise.kind)).size).toBeGreaterThanOrEqual(3);
  });

  it("uses every interactive illustration at least once", () => {
    const used = new Set(LESSONS.flatMap((l) => l.sections.flatMap((s) => s.blocks)).flatMap((b) => (b.kind === "interactive" ? [b.widget] : [])));
    expect([...used].sort()).toEqual([...ALL_WIDGETS].sort());
  });

  it("does not reward picking the longest (or shortest) option, across ALL quizzes", () => {
    let longest = 0, shortest = 0, total = 0;
    for (const l of LESSONS) for (const q of l.quiz) {
      total++;
      const lens = q.options.map((o) => o.text.length);
      const c = q.options.find((o) => o.id === q.correct)!.text.length;
      if (c === Math.max(...lens)) longest++;
      if (c === Math.min(...lens)) shortest++;
    }
    expect(longest / total).toBeLessThanOrEqual(0.3);
    expect(shortest / total).toBeLessThanOrEqual(0.3);
  });

  it("every quiz question has exactly 4 options (the shuffle-position checks assume 4)", () => {
    for (const l of LESSONS) for (const q of l.quiz) expect(q.options, `${l.id}/${q.id}`).toHaveLength(4);
  });

  it("varies the position of correct quiz answers", () => {
    const positions = LESSONS.flatMap((l) => l.quiz.map((q) => q.options.findIndex((o) => o.id === q.correct)));
    expect(new Set(positions).size).toBeGreaterThanOrEqual(3);
  });
});

describe("glossary", () => {
  it("has unique ids and non-empty definitions", () => {
    expect(unique([...GLOSSARY_IDS_IN_ORDER])).toBe(true);
    for (const e of GLOSSARY_LIST) {
      expect(e.term.trim()).not.toBe("");
      expect(e.def.trim().length).toBeGreaterThan(20);
    }
  });

  it("is sorted A–Z for the glossary page", () => {
    const terms = GLOSSARY_LIST.map((e) => e.term);
    expect([...terms].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }))).toEqual(terms);
  });

  it("maps each lesson-introduced term to the first lesson that lists it", () => {
    for (const [id, lesson] of TERM_INTRODUCED_IN) {
      expect(GLOSSARY[id]).toBeDefined();
      expect(lesson.glossary).toContain(id);
    }
  });

  it("reads naturally inline", () => {
    expect(inlineLabel(GLOSSARY["ask"])).toBe("ask");
    expect(inlineLabel(GLOSSARY["currency-pair"])).toBe("currency pair");
    expect(inlineLabel(GLOSSARY["etf"])).toBe("ETF");
  });
});

describe("helpers", () => {
  it("parses rich text markup", () => {
    expect(parseRich("A [[bid]] and the [[ask|offer]].")).toEqual([
      { type: "text", text: "A " },
      { type: "term", id: "bid", text: null },
      { type: "text", text: " and the " },
      { type: "term", id: "ask", text: "offer" },
      { type: "text", text: "." },
    ]);
    expect(plainText("A [[bid]] and the [[ask|offer]].")).toBe("A bid and the offer.");
  });

  it("shuffles deterministically and never returns the solved order", () => {
    const items = [1, 2, 3, 4, 5];
    expect(deterministicShuffle(items, "x")).toEqual(deterministicShuffle(items, "x"));
    for (const l of LESSONS) if (l.exercise.kind === "order") {
      expect(deterministicShuffle(l.exercise.items, l.exercise.id)).not.toEqual(l.exercise.items);
    }
    expect(deterministicShuffle([1], "x")).toEqual([1]);
  });

  it("parses numbers the way people type them", () => {
    expect(parseTypedNumber("120")).toBe(120);
    expect(parseTypedNumber(" $1,200 ")).toBe(1200);
    expect(parseTypedNumber("−1")).toBe(-1);
    expect(parseTypedNumber("+2%")).toBe(2);
    expect(parseTypedNumber("2.5")).toBe(2.5);
    expect(parseTypedNumber(".5")).toBe(0.5);
    expect(parseTypedNumber("abc")).toBeNull();
    expect(parseTypedNumber("")).toBeNull();
    expect(parseTypedNumber("1e5")).toBeNull();
  });

  it("calculate answers match their worked solutions", () => {
    for (const l of LESSONS) if (l.exercise.kind === "calculate") {
      expect(l.exercise.solution).toContain(String(l.exercise.answer));
    }
  });
});
