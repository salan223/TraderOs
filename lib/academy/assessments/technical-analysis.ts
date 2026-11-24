import type { AssessmentQuestion, ChoiceOption, ConceptRemediation, GradedItem, ScenarioItem, TrackAssessment } from "../types";

/*
  Track 7 assessment: Technical Analysis.
  All prices and results are illustrative, made-up numbers, or results
  computed on the simulated series in the lessons. Overfitting and backtest
  validity are safety-critical: every such question must be right, because
  trusting an invalid backtest is how traders risk money on luck.
*/

const T = "technical-analysis";

// Small builders keep the bank readable. They return plain data.
type Opt = [id: string, text: string, explain: string];
const opts = (xs: Opt[]): ChoiceOption[] => xs.map(([id, text, explain]) => ({ id, text, explain }));
const single = (prompt: string, options: Opt[], correct: string): GradedItem => ({ kind: "single", prompt, options: opts(options), correct });
const multi = (prompt: string, options: Opt[], correct: string[]): GradedItem => ({ kind: "multi-select", prompt, options: opts(options), correct });
const tf = (statement: string, answer: boolean, explain: string): GradedItem => ({ kind: "true-false", statement, answer, explain });
const numeric = (prompt: string, unit: string, answer: number, tolerance: number, explain: string): GradedItem => ({ kind: "numeric", prompt, unit, answer, tolerance, explain });
const scenario = (situation: string, question: string, options: [string, string, string, "sound" | "partial" | "unsound"][]): ScenarioItem => ({
  kind: "scenario", situation, question, options: options.map(([id, text, explain, process]) => ({ id, text, explain, process })),
});
const q = (id: string, concept: string, type: AssessmentQuestion["type"], item: GradedItem, explanation: string): AssessmentQuestion => ({ id, concept, type, item, explanation });

const BASE: TrackAssessment = {
  trackId: T,
  intro:
    "Questions on every idea from the twelve lessons: moving averages, RSI, MACD, the stochastic, Bollinger Bands and ATR, VWAP and OBV, divergence, trendlines, chart patterns, Fibonacci, confluence and redundancy, and testable rules, with calculations and applied scenarios. You need 90% or more, a sound decision in the scenario, and every safety-critical question right: overfitting and backtest validity.",
  concepts: [
    {
      id: "ta-ma",
      title: "Moving averages, lag and crossovers",
      lessonIds: ["ta-moving-averages"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Many people expect a crossover to mark the turning point. It cannot: an average is built from past bars, so it turns only after enough new bars outweigh the old ones.",
        altExplanation: "Picture the average as the price of the bar in the middle of its window. A 21-bar average is roughly where price was 10 bars ago. So when price turns, the average carries on in the old direction for a while, and a crossover with a slower average comes later still.",
        altExample: "A market rises for 40 bars and then falls. A 30-bar SMA keeps rising for several bars after the top, and a 10/30 crossover appears only once the fall is well under way.",
        practice: numeric("On a straight-line rise, how many bars does a 31-bar simple moving average trail price by?", "bars", 15, 0, "(31 − 1) ÷ 2 = 15."),
      },
      flashcard: { front: "Moving-average lag", back: "An n-bar SMA trails a straight line by (n − 1) ÷ 2 bars. Crossovers confirm after the turn, never at it." },
    },
    {
      id: "ta-rsi",
      title: "RSI and overbought or oversold",
      lessonIds: ["ta-rsi"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "The words 'overbought' and 'oversold' make RSI sound like a reversal signal. They only describe how lopsided recent gains and losses were.",
        altExplanation: "RSI asks one question: of the recent movement, how much was up and how much was down? 50 means equal. 75 means gains were three times the losses. In a strong trend, gains keep outweighing losses, so RSI stays high while price keeps going. A high reading is a description, not a forecast.",
        altExample: "An average gain of 4 and an average loss of 1 give RS 4 and RSI 80. If the trend continues with similar bars, RSI simply stays near 80.",
        practice: numeric("The average gain is 1.2 and the average loss is 0.4. What is the RSI?", "RSI (0–100)", 75, 0.5, "RS = 1.2 ÷ 0.4 = 3; RSI = 100 − 100 ÷ 4 = 75."),
      },
      flashcard: { front: "RSI", back: "RS = avg gain ÷ avg loss; RSI = 100 − 100 ÷ (1 + RS). 70/30 describe recent moves; they are not reversal signals." },
    },
    {
      id: "ta-macd",
      title: "MACD, its signal line and histogram",
      lessonIds: ["ta-macd"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "MACD is often treated as a separate indicator from moving averages. It is the gap between two of them, so its zero cross is a moving-average crossover.",
        altExplanation: "Draw a fast and a slow EMA. Now plot only the distance between them: that is MACD. Smooth that distance again and you get the signal line; the bars are the difference between the two. Everything in MACD comes from the same two averages of price.",
        altExample: "With EMA(12) at 205 and EMA(26) at 201, MACD is 4. If the signal line is 5, the histogram is −1: momentum has slowed even though MACD is still positive.",
        practice: numeric("EMA(12) is 61.5 and EMA(26) is 60.0. The signal line is 1.0. What is the MACD histogram?", "price units", 0.5, 0.01, "MACD = 1.5; histogram = 1.5 − 1.0 = 0.5."),
      },
      flashcard: { front: "MACD", back: "EMA₁₂ − EMA₂₆; signal = EMA₉ of MACD; histogram = MACD − signal. In price units, so compare only with itself." },
    },
    {
      id: "ta-stoch",
      title: "The stochastic oscillator",
      lessonIds: ["ta-stochastic"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "The stochastic is often read as a measure of momentum strength. It only measures where the close sits in the recent high–low range.",
        altExplanation: "Draw a box from the lowest low to the highest high of the last 14 bars. Put the close inside it. If the close is at the bottom, %K is 0; at the top, 100; halfway, 50. Every new high in a rise puts the close at the top of the box, so high readings are normal in rises.",
        altExample: "A 14-bar range from 200 to 240 with a close at 230 puts the close three-quarters of the way up the box.",
        practice: numeric("The 14-bar range runs from 40 to 50 and the close is 42. What is raw %K?", "%K (0–100)", 20, 0.5, "(42 − 40) ÷ (50 − 40) = 0.2, so 20."),
      },
      flashcard: { front: "Stochastic %K", back: "100 × (C − LLₙ) ÷ (HHₙ − LLₙ): where the close sits in the range. %D smooths it." },
    },
    {
      id: "ta-volatility",
      title: "Bollinger Bands, ATR and volatility",
      lessonIds: ["ta-bands-atr"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "A close outside a Bollinger Band feels like an extreme that must snap back. In trends, closes outside the bands are common, and the bands say nothing about direction.",
        altExplanation: "Bands are a ruler for how spread out recent closes are. Wider bands mean bigger recent swings. ATR is a different ruler: the typical distance price travels in a bar, including gaps. Both measure size. Neither tells you whether the next move is up or down.",
        altExample: "Yesterday closed at 70. Today gaps down, trades from 64 to 66 and closes at 65. The bar's own range is 2, but the true range runs from 70 down to 64.",
        practice: numeric("The 20-bar SMA is 80 and the standard deviation is 2.5. Where is the upper band with k = 2?", "price", 85, 0.01, "80 + 2 × 2.5 = 85."),
      },
      flashcard: { front: "Bands and ATR", back: "Bands = SMA ± k·σ of closes. TR = max(H − L, |H − Cₜ₋₁|, |L − Cₜ₋₁|); ATR is its Wilder average. Size, not direction." },
    },
    {
      id: "ta-volume",
      title: "VWAP, OBV and volume indicators",
      lessonIds: ["ta-volume-indicators"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Volume indicators are often read as counts of buyers and sellers. Every trade has one of each; the indicators only sort volume by price or by the direction of the close.",
        altExplanation: "VWAP is an average where each price counts as many times as it traded: busy prices pull it harder. OBV is a tally that adds a bar's volume when the bar closes up and subtracts it when it closes down. Both are only as good as the volume data they are fed.",
        altExample: "If 900 shares trade at 30 and 100 at 40, VWAP sits much closer to 30 than the plain average of 35, because most of the volume was at 30.",
        practice: numeric("400 shares trade at a typical price of 25 and 100 shares at 30. What is VWAP?", "price", 26, 0.01, "(400 × 25 + 100 × 30) ÷ 500 = 13,000 ÷ 500 = 26."),
      },
      flashcard: { front: "VWAP and OBV", back: "VWAP = Σ(TP × V) ÷ ΣV since the reset. OBV adds volume on up closes, subtracts on down closes." },
    },
    {
      id: "ta-divergence",
      title: "Divergence between price and indicators",
      lessonIds: ["ta-divergence"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Divergence is widely taught as a reversal signal. It only says momentum was weaker at the second swing, and trends often carry on through several divergences.",
        altExplanation: "Pick a fixed swing rule. Compare two consecutive swing highs: if price is higher but the indicator lower, momentum was weaker the second time. That is a fact about two past points. Whether it helps depends on how often a turn followed, compared with how often turns happen anyway.",
        altExample: "In a long rise, price makes highs at 100, 104 and 109 while RSI makes 78, 72 and 69: two bearish divergences, and the rise continued through both.",
        practice: single("Price makes swing lows at 52 then 49; RSI makes lows of 24 then 31. What is this?", [
          ["a", "A bullish divergence", "Right. Lower price low, higher RSI low."],
          ["b", "A bearish divergence", "Bearish divergence compares highs."],
          ["c", "No divergence, because both lows are below 50", "The level does not matter; the directions disagree."],
          ["d", "A crossover", "A crossover is two lines crossing."],
        ], "a"),
      },
      flashcard: { front: "Divergence", back: "Bearish: higher price high, lower indicator high. Bullish: lower low, higher indicator low. Known only after the swing is confirmed." },
    },
    {
      id: "ta-trendlines",
      title: "Trendlines and channels",
      lessonIds: ["ta-trendlines"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Trendlines look objective once drawn, but every one depends on which swings you chose and how much tolerance you allow for a touch.",
        altExplanation: "Two points define a line, and a chart has many swing points. Choose a different pair and you get a different slope and a different break. A regression channel avoids choosing points: it fits a line to every close in a window and reports how well a line fits with r².",
        altExample: "On one up-trend, a line through the first two swing lows breaks 15 bars before a line through the second and third lows. Same chart, two different 'signals'.",
        practice: numeric("A line passes through 200 at bar 0 and 210 at bar 10. What is its value at bar 25?", "price", 225, 0.01, "Slope 1 per bar; 200 + 25 = 225."),
      },
      flashcard: { front: "Trendline", back: "L(i) = P₁ + slope × (i − i₁). Touches and breaks depend on the anchors and tolerance you choose." },
    },
    {
      id: "ta-patterns",
      title: "Chart patterns and their evidence",
      lessonIds: ["ta-chart-patterns"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Textbook pictures make patterns look reliable, and the measured-move target sounds like a forecast. The same shapes appear in random data, and targets are conventions.",
        altExplanation: "Define a pattern by a fixed rule, find every one, and check how often its target was reached. Then check how often the same distance the other way was reached. On a random walk both happen about equally often, so a real pattern has to beat that, after costs.",
        altExample: "A double top with peaks at 88 and 89 and a pullback low of 84 has a height of 5, so its target is 5 below the neckline. A random walk produces shapes like this regularly.",
        practice: numeric("An inverse head and shoulders has its head at 70 and its neckline at 80. What is the measured-move target?", "price", 90, 0.01, "Height = 10; target = 80 + 10 = 90."),
      },
      flashcard: { front: "Measured move", back: "Top: neckline − height. Bottom: neckline + height. A convention; compare hit rates with a mirror target." },
    },
    {
      id: "ta-fib",
      title: "Fibonacci retracements and chance",
      lessonIds: ["ta-fibonacci"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Fibonacci levels feel precise, so a pullback that stops near one seems like evidence. With several levels and some tolerance, many pullbacks land near a level by chance.",
        altExplanation: "Lay the levels with their tolerance bands over the 0–100% range of possible pullbacks. Add up how much of the range the bands cover: that is the chance a random pullback 'respects a level'. Then compare with made-up levels on the same data, by the same rule.",
        altExample: "Five levels each with ±4 points of slack cover 40 points of the 100-point range, so 40% of random pullbacks would count as hits.",
        practice: numeric("A move runs from 300 to 400. Where is the 61.8% retracement level?", "price", 338.2, 0.1, "400 − 100 × 0.618 = 338.2."),
      },
      flashcard: { front: "Fibonacci coverage", back: "Levels × 2 × tolerance (without overlaps) is the chance of a 'hit' by luck: 5 levels at ±3 points cover 30%." },
    },
    {
      id: "ta-confluence",
      title: "Confluence, timeframes and redundancy",
      lessonIds: ["ta-confluence"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Several indicators agreeing feels like several confirmations. When they are built from the same closes, they agree because they measure the same thing.",
        altExplanation: "Sort your evidence by source. Momentum oscillators of the last 14 closes are one source. A higher-timeframe trend from closed bars is another. Volume is a third, a level from structure a fourth. Confluence is agreement between sources, not between indicators.",
        altExample: "RSI, the stochastic and rate of change all rising, plus a MACD cross, is one momentum reading drawn four ways. Adding a weekly trend filter from last week's closed bar adds a second source.",
        practice: tf("A higher-timeframe trend filter built only from closed bars adds information that a second 14-bar oscillator does not.", true, "True. It uses a longer window and different bars, while another 14-bar oscillator repeats the same closes."),
      },
      flashcard: { front: "Confluence", back: "Count sources, not indicators. Oscillators on the same closes are redundant. Higher timeframes: closed bars only." },
    },
    {
      id: "ta-overfitting",
      title: "Overfitting and multiple testing in backtests",
      lessonIds: ["ta-testable-rules"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "A backtest with a high return feels like evidence of an edge. If it is the best of many tries on the same data, much of that return is the luck that selection picked out.",
        altExplanation: "Imagine 100 coins, each flipped 50 times. One will show a long run of heads by chance. Choosing it and calling it a 'good coin' is what optimising a rule on one history does. The more settings you try, the better the best looks, and the less it tells you about the next set of flips.",
        altExample: "On simulated random walks with no edge, the best of 64 moving-average pairs made about +10% in sample, while the same pairs made about 0% on the unseen half.",
        practice: single("A trader tried 200 settings and the best made +45% on the data used to choose it. What should happen next?", [
          ["a", "Trade it with full size, since 200 tries makes it well tested", "More tries make the best result less reliable, not more."],
          ["b", "Test the chosen setting once on data it never saw, with costs, and report the 200 tries", "Right. That is the minimum before trusting it."],
          ["c", "Try 200 more settings on the same data and pick the best again, so the winner is even better tested", "That makes selection bias worse."],
          ["d", "Average the 10 best settings and trade that at once", "Still chosen on the same data and not tested out of sample."],
        ], "b"),
      },
      flashcard: { front: "Overfitting", back: "The best of many backtests on the same data looks good by luck. Count every try; test once on unseen data." },
    },
    {
      id: "ta-backtest-validity",
      title: "Backtest validity: look-ahead, costs and unseen data",
      lessonIds: ["ta-testable-rules", "ta-confluence"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "A backtest feels like a replay of the past. It is a program, and small coding choices, such as acting on a close you could not yet know or leaving out costs, make it report trades nobody could have made.",
        altExplanation: "For every simulated trade ask three questions. Could I have known everything this decision used at that moment? Did I pay the spread, commission and slippage? Was this rule chosen on the data now being used to judge it? A 'no' to any of them makes the result unreliable.",
        altExample: "A rule signals at the daily close and the backtest buys at that same close. Live, the order could only go in after the close, at the next open, often at a different price.",
        practice: numeric("A rule makes 50 round trips. Costs are 0.05% per side. Roughly how much do costs take in total, in percentage points, ignoring compounding?", "percentage points", 5, 0.1, "50 round trips × 2 sides × 0.05% = 5 percentage points."),
      },
      flashcard: { front: "Valid backtest", back: "No look-ahead (act on the next bar), costs on every side, every try counted, and a test on data the rule never saw." },
    },
    {
      id: "ta-applied",
      title: "Applying technical analysis",
      lessonIds: ["ta-rsi", "ta-chart-patterns", "ta-confluence", "ta-testable-rules"],
      critical: true,
      safetyCritical: false,
      applied: true,
      remediation: {
        misconception: "Under pressure it is tempting to treat one indicator reading, one pattern or one great backtest as enough reason to act, and to size up when several readings agree.",
        altExplanation: "A sound decision with indicators has four parts: a written rule, an invalidation point decided before entry, risk sized from that point, and evidence counted by independent sources. If any part is missing, the sound choice is usually to wait or to test, not to trade bigger.",
        altExample: "Price breaks a neckline while RSI is low and a Fibonacci level is near. A sound plan sets a stop where the pattern is wrong, risks the usual amount, and treats the target as a reference.",
        practice: scenario(
          "A trader sees MACD, RSI and the stochastic all turn up together near a Fibonacci level. They call it 'four confirmations' and plan to risk four times their usual amount.",
          "What is the soundest decision?",
          [
            ["a", "Risk four times as much as usual, because four separate signals agreeing is much stronger evidence than one alone", "The three oscillators share inputs, and the level is a convention: this is not four independent reasons.", "unsound"],
            ["b", "Count the oscillators as one momentum reading, keep the usual risk, and set the stop where the idea is wrong", "Sound: evidence counted by source, risk unchanged.", "sound"],
            ["c", "Risk twice as much as a compromise", "Still sizes up on redundant evidence.", "unsound"],
            ["d", "Skip the trade because indicators are useless", "Not unreasonable, but the plan can be made sound instead of abandoned.", "partial"],
          ],
        ),
      },
      flashcard: { front: "Applying indicators", back: "Written rule, invalidation first, normal risk from the stop, evidence counted by independent source." },
    },
  ],
  questions: [
    // ta-ma
    q("taq-ma-1", "ta-ma", "calculation", numeric("The last four closes are 12, 13, 14 and 15. What is the 4-bar simple moving average?", "price", 13.5, 0.01, "(12 + 13 + 14 + 15) ÷ 4 = 54 ÷ 4 = 13.5."), "An SMA is the plain average of the last n closes."),
    q("taq-ma-2", "ta-ma", "calculation", numeric("On a steady straight-line rise, how many bars does a 61-bar SMA trail price by?", "bars", 30, 0, "(61 − 1) ÷ 2 = 30."), "An n-bar SMA's average bar is (n − 1) ÷ 2 bars old, so on a straight line it trails price by that much."),
    q("taq-ma-3", "ta-ma", "knowledge", single("A 20-bar average crosses above a 50-bar average. What does this describe?", [
      ["a", "Recent closes have risen relative to older ones", "Right. It is a description of the past."],
      ["b", "The price low of the move is happening now", "The low came earlier; the crossover follows it."],
      ["c", "Price will keep rising for at least another 50 bars from here", "No indicator promises what comes next."],
      ["d", "More buyers than sellers", "Every trade has a buyer and a seller."],
    ], "a"), "A crossover only says the recent average has moved above the older average. It arrives after the turn."),
    q("taq-ma-4", "ta-ma", "knowledge", tf("A shorter moving average usually removes the lag entirely while staying just as smooth as a long one.", false, "False. Shorter averages lag less but are noisier; no length removes lag."), "Smoothing and lag are the same trade-off: smoother means later."),
    q("taq-ma-5", "ta-ma", "knowledge", tf("A simple moving average gives every one of its n closes exactly the same weight.", true, "True. That is what makes it 'simple'; an EMA weights recent closes more."), "SMA weights are equal; EMA weights fall off geometrically."),
    // ta-rsi
    q("taq-rsi-1", "ta-rsi", "calculation", numeric("The average gain is 2 and the average loss is 1. What is the RSI, to one decimal place?", "RSI (0–100)", 66.7, 0.1, "RS = 2; RSI = 100 − 100 ÷ 3 ≈ 66.7."), "RSI = 100 − 100 ÷ (1 + RS), with RS = average gain ÷ average loss."),
    q("taq-rsi-2", "ta-rsi", "calculation", numeric("The average gain is 0.6 and the average loss is 1.8. What is the RSI?", "RSI (0–100)", 25, 0.1, "RS = 1/3; RSI = 100 − 100 ÷ (4/3) = 25."), "When losses outweigh gains, RS is below 1 and RSI is below 50."),
    q("taq-rsi-3", "ta-rsi", "knowledge", single("RSI(14) has stayed above 70 for three weeks of a strong rise. What is the most accurate reading?", [
      ["a", "The data feed must be broken", "Long stretches above 70 are normal in strong trends."],
      ["b", "A fall must start this week, because RSI cannot stay above 70 for long", "Nothing forces a reversal."],
      ["c", "Sellers have disappeared", "RSI does not count participants."],
      ["d", "Recent gains have been much larger than recent losses", "Right. That is all RSI measures."],
    ], "d"), "Overbought describes lopsided recent gains. In trends it can persist."),
    q("taq-rsi-4", "ta-rsi", "knowledge", tf("An RSI reading above 70 means the price must fall soon.", false, "False. RSI can stay above 70 for a long time in a trend."), "RSI levels are descriptions, not forecasts."),
    q("taq-rsi-5", "ta-rsi", "knowledge", multi("Which statements about RSI are correct? Select all that apply.", [
      ["a", "It is on a 0–100 scale", "Right: this one is correct."],
      ["b", "It is calculated from volume", "RSI uses price changes only."],
      ["c", "Shorter lengths reach 70 and 30 more often", "Right. Short RSI swings more."],
      ["d", "A reading of 50 means average gains equal average losses", "Right. RS = 1 gives 50."],
    ], ["a", "c", "d"]), "RSI compares average gains with average losses on 0–100; length changes how often extremes appear."),
    // ta-macd
    q("taq-macd-1", "ta-macd", "calculation", numeric("EMA(12) is 48.6 and EMA(26) is 47.9. The signal line is 0.4. What is the MACD histogram?", "price units", 0.3, 0.01, "MACD = 0.7; histogram = 0.7 − 0.4 = 0.3."), "Histogram = MACD − signal, where MACD = EMA₁₂ − EMA₂₆."),
    q("taq-macd-2", "ta-macd", "knowledge", single("MACD(12, 26, 9) crosses above zero. What else happens on that bar?", [
      ["a", "Price makes a new high for the move on that same bar", "Not necessarily; averages can cross without a new high."],
      ["b", "Volume rises above its average", "MACD does not use volume."],
      ["c", "The 12-bar EMA crosses above the 26-bar EMA", "Right. MACD is their difference."],
      ["d", "RSI crosses 50", "They often move together, but not by definition."],
    ], "c"), "MACD's zero line is where the two EMAs are equal, so a zero cross is an EMA crossover."),
    q("taq-macd-3", "ta-macd", "knowledge", tf("MACD values can usually be compared directly between a $10 share and a $500 share.", false, "False. MACD is in price units, so it scales with the price level."), "Compare MACD only with its own history, or use a percentage version."),
    q("taq-macd-4", "ta-macd", "knowledge", single("Which pair of readings is really one piece of evidence?", [
      ["a", "MACD rising and ATR rising", "ATR measures size, not direction: a different input."],
      ["b", "MACD rising and a higher-timeframe trend filter", "Different windows carry different information."],
      ["c", "MACD rising and OBV rising", "OBV uses volume, a different input."],
      ["d", "A MACD zero cross and an EMA 12/26 crossover", "Right. They are the same event drawn twice."],
    ], "d"), "MACD is built from two EMAs, so its zero cross repeats their crossover."),
    // ta-stoch
    q("taq-stoch-1", "ta-stoch", "calculation", numeric("Over 14 bars the highest high is 80 and the lowest low is 60. The close is 65. What is raw %K?", "%K (0–100)", 25, 0.5, "(65 − 60) ÷ (80 − 60) = 0.25, so 25."), "Raw %K places the close within the n-bar high–low range."),
    q("taq-stoch-2", "ta-stoch", "knowledge", single("What does the slow stochastic do that the fast one does not?", [
      ["a", "It smooths raw %K with a short average", "Right. That makes it less jumpy."],
      ["b", "It uses a 50-bar range by default", "Range length is a separate setting."],
      ["c", "It adds volume", "Neither version uses volume."],
      ["d", "It uses a scale from −100 to +100 instead of 0 to 100", "Both use 0–100."],
    ], "a"), "The slow stochastic smooths %K, usually with a 3-bar SMA, before %D is taken."),
    q("taq-stoch-3", "ta-stoch", "knowledge", tf("A close at the highest high of the last n bars always gives a raw %K of 100.", true, "True. The close is then at the top of the range: (HH − LL) ÷ (HH − LL) = 1."), "Every new high puts the close at the top of its range, which is why high readings are normal in rises."),
    q("taq-stoch-4", "ta-stoch", "knowledge", single("A stochastic %K of 10 tells you what?", [
      ["a", "Price is about to rise by 10% from the recent low point", "It is not a forecast or a percentage move."],
      ["b", "Only 10% of traders are buying", "It does not count traders."],
      ["c", "The close is near the bottom of the recent range", "Right: this one is correct."],
      ["d", "The trend is strong", "It measures position in a range, not trend strength."],
    ], "c"), "%K is the close's position in the recent range: 10 is near the low."),
    // ta-volatility
    q("taq-vol-1", "ta-volatility", "calculation", numeric("The 20-bar SMA is 40 and the standard deviation of those closes is 1.5. Where is the lower Bollinger Band with k = 2?", "price", 37, 0.01, "40 − 2 × 1.5 = 37."), "Lower band = SMA − k × standard deviation."),
    q("taq-vol-2", "ta-volatility", "calculation", numeric("Yesterday closed at 50. Today gapped down, traded between 46 and 49, and closed at 47. What is today's true range?", "price points", 4, 0.01, "Max of 49 − 46 = 3, |49 − 50| = 1, |46 − 50| = 4: the true range is 4."), "True range extends the bar's range to the previous close, so it includes gaps."),
    q("taq-vol-3", "ta-volatility", "knowledge", tf("On real price charts, closes typically stay inside 2-standard-deviation Bollinger Bands at least 95% of the time.", false, "False. Price changes are not independent bell-curve draws; more closes fall outside, especially in trends."), "The 95% rule is for normal, independent values. Count the share outside on your own market."),
    q("taq-vol-4", "ta-volatility", "knowledge", single("ATR(14) has doubled over the last month. What does that tell you?", [
      ["a", "Bars have been travelling about twice as far as before", "Right. Volatility has risen."],
      ["b", "Price has doubled", "ATR measures movement, not level or direction."],
      ["c", "A breakout upward is due, since volatility has expanded so far", "ATR has no direction."],
      ["d", "Spreads have doubled", "ATR uses prices, not spreads."],
    ], "a"), "ATR is the average size of true ranges. It describes how much price moves, not which way."),
    q("taq-vol-5", "ta-volatility", "knowledge", single("In a strong rise, price closes above the upper band for five bars in a row. What is the best reading?", [
      ["a", "The bands are wrong", "Bands are calculated correctly; trends do this."],
      ["b", "Price must return to the middle band within the next five bars", "Nothing forces that."],
      ["c", "Volume is unusually high", "Bands do not use volume."],
      ["d", "Closes are far from their average, as often happens in trends", "Right. It is a description."],
    ], "d"), "Band touches and closes outside are common in trends; they are not signals by themselves."),
    // ta-volume
    q("taq-volu-1", "ta-volume", "calculation", numeric("200 shares trade at a typical price of 20, then 300 shares at 25. What is VWAP?", "price", 23, 0.01, "(200 × 20 + 300 × 25) ÷ 500 = 11,500 ÷ 500 = 23."), "VWAP weights each price by its volume."),
    q("taq-volu-2", "ta-volume", "calculation", numeric("OBV starts at 1,000. The next three bars close up on 200, down on 150 and unchanged on 100. What is OBV now?", "volume units", 1050, 0.5, "1,000 + 200 − 150 + 0 = 1,050."), "OBV adds volume on up closes, subtracts it on down closes and ignores unchanged closes."),
    q("taq-volu-3", "ta-volume", "knowledge", tf("OBV shows exactly how many buyers and sellers traded on each bar.", false, "False. It only signs total volume by the direction of the close."), "Every trade has a buyer and a seller; volume indicators cannot split them."),
    q("taq-volu-4", "ta-volume", "knowledge", single("On a spot forex chart, the volume bars usually count what?", [
      ["a", "Money traded worldwide in that pair", "There is no central record of that."],
      ["b", "Open positions at the broker", "That would be open interest."],
      ["c", "Price updates in each period (tick volume)", "Right: this one is correct."],
      ["d", "The orders waiting to be filled in the broker's order book", "That is market depth."],
    ], "c"), "Spot forex is decentralised, so charts usually show tick volume, a count of price updates."),
    // ta-divergence
    q("taq-div-1", "ta-divergence", "knowledge", single("Price makes swing highs at 70 then 74. RSI at those highs is 68 then 60. What is this?", [
      ["a", "A bullish divergence", "Bullish divergence is at lows."],
      ["b", "No divergence, because RSI stayed below 70", "The level does not matter; the directions disagree."],
      ["c", "A trend confirmation", "Price and RSI disagree, so it does not confirm."],
      ["d", "A bearish divergence", "Right. Higher price high, lower RSI high."],
    ], "d"), "A bearish divergence is a higher price high with a lower indicator high at the same swings."),
    q("taq-div-2", "ta-divergence", "knowledge", tf("A bearish divergence usually marks the exact bar on which an up-trend ends.", false, "False. It gives no timing, and trends often continue through several divergences."), "Divergence describes weaker momentum at the second swing; it is not a timing signal."),
    q("taq-div-3", "ta-divergence", "knowledge", single("Why can the most recent bar not be the second swing of a confirmed divergence?", [
      ["a", "A swing needs k later bars to confirm it", "Right. The next bar could still make a new extreme."],
      ["b", "Indicators are not calculated on the latest bar", "They are; the swing is the issue."],
      ["c", "Divergences only appear on weekly charts", "They can be found on any timeframe."],
      ["d", "The exchange has not published it", "Swings are found by your own rule."],
    ], "a"), "With a k-bar swing rule, a swing is known only k bars later."),
    q("taq-div-4", "ta-divergence", "applied", multi("You want to test whether bearish divergences help on a market. Which steps make the test fair? Select all that apply.", [
      ["a", "Fix the swing rule and indicator length before looking", "Right. Otherwise the rule fits the chart."],
      ["b", "Compare results with the base rate of falls after any bar", "Right. That is the bar to beat."],
      ["c", "Count only the divergences that were clear in hindsight", "That selects winners after the fact."],
      ["d", "Change the swing rule for each chart so it fits best", "That is fitting, not testing."],
    ], ["a", "b"]), "A fair test fixes the definition in advance and compares with the base rate."),
    // ta-trendlines
    q("taq-tl-1", "ta-trendlines", "calculation", numeric("A trendline passes through 40 at bar 5 and 45 at bar 15. What is its value at bar 35?", "price", 55, 0.01, "Slope = 5 ÷ 10 = 0.5 per bar; 45 + 0.5 × 20 = 55."), "Find the slope per bar, then extend it from one of the anchors."),
    q("taq-tl-2", "ta-trendlines", "knowledge", single("What mostly decides how many 'touches' a trendline gets?", [
      ["a", "The volume on the anchor bars", "Volume is not part of the line."],
      ["b", "The time of day", "Not relevant."],
      ["c", "The anchors you pick and the tolerance you allow", "Right. Both are your choices."],
      ["d", "Nothing; touches are objective facts that every trader sees alike", "They depend on your choices."],
    ], "c"), "Touch counts depend on the line's anchors and on how close counts as a touch."),
    q("taq-tl-3", "ta-trendlines", "knowledge", tf("A regression channel can be fitted without choosing any swing points, only a window of bars.", true, "True. It fits every close in the window by least squares."), "Regression channels replace the choice of anchors with the choice of a window."),
    q("taq-tl-4", "ta-trendlines", "knowledge", single("After a close through your line, you redraw it through the new low. What is wrong?", [
      ["a", "Nothing: lines should always follow price", "A line that always follows price tells you nothing."],
      ["b", "Lines may only ever be redrawn on weekly or monthly charts", "There is no such rule."],
      ["c", "A new line needs four anchors", "Two points define a line."],
      ["d", "A line you redraw after every break can never be broken", "Right. It stops being a test."],
    ], "d"), "Redrawing after each break removes the line's ability to say anything."),
    // ta-patterns
    q("taq-pat-1", "ta-patterns", "calculation", numeric("A double top has peaks at 60 and 61 and a neckline (the low between) at 55. What is the measured-move target, using the higher peak?", "price", 49, 0.01, "Height = 61 − 55 = 6; target = 55 − 6 = 49."), "Measured move for a top: neckline − (peak − neckline)."),
    q("taq-pat-2", "ta-patterns", "calculation", numeric("An inverse head and shoulders has its head at 30 and its neckline at 40. What is the measured-move target?", "price", 50, 0.01, "Height = 10; target = 40 + 10 = 50."), "For a bottom pattern, the height is added above the neckline."),
    q("taq-pat-3", "ta-patterns", "knowledge", single("On a random walk, patterns reach their targets 46% of the time and their mirror targets 47%. What does this show?", [
      ["a", "Hit rates like these are what chance alone produces", "Right. That is the control to beat."],
      ["b", "The pattern works 46% of the time", "It does no better than its mirror."],
      ["c", "The random walk must have been generated incorrectly by the tool", "Random walks are meant to be unpredictable."],
      ["d", "Patterns only work on random data", "There is nothing to predict on a random walk."],
    ], "a"), "A pattern adds information only if it beats its mirror on data it was not designed on."),
    q("taq-pat-4", "ta-patterns", "knowledge", tf("Head-and-shoulders shapes can appear in random walks, where nothing can be predicted.", true, "True. Random data produce all the classic shapes."), "Because shapes appear by chance, finding one is not evidence of an edge."),
    q("taq-pat-5", "ta-patterns", "knowledge", single("What did Chang and Osler (1999) conclude about head-and-shoulders trading in currencies?", [
      ["a", "It never made money", "It was profitable for some currencies."],
      ["b", "It was the best of all the rules they tested, across every currency", "Simpler rules did better."],
      ["c", "Profitable for some currencies, but dominated by simpler rules", "Right. 'Profitable, but not efficient'."],
      ["d", "It worked only on stock indices", "They studied exchange rates."],
    ], "c"), "Chang and Osler found head-and-shoulders profits were dominated by simpler rules such as moving averages."),
    // ta-fib
    q("taq-fib-1", "ta-fib", "calculation", numeric("A move runs from 50 to 150. Where is the 38.2% retracement level?", "price", 111.8, 0.1, "150 − 100 × 0.382 = 111.8."), "Retracement level = high − (high − low) × ratio."),
    q("taq-fib-2", "ta-fib", "calculation", numeric("Four levels, each with ±2 points of tolerance and no overlaps, cover what share of the 0–100% retracement range?", "%", 16, 0.5, "4 × (2 × 2) = 16 points of 100, so 16%."), "Coverage = levels × 2 × tolerance when the bands do not overlap: the chance of a 'hit' by luck."),
    q("taq-fib-3", "ta-fib", "knowledge", tf("Every pullback that stops near 61.8% shows that the golden ratio governs that market.", false, "False. Many pullbacks land near some level by chance."), "A hit on a level is expected often by chance; it is not evidence by itself."),
    q("taq-fib-4", "ta-fib", "knowledge", single("Which of these makes 'hits' on Fibonacci levels more common by chance alone?", [
      ["a", "Measuring every pullback by a fixed swing rule", "That makes the test fairer, not the hit rate higher."],
      ["b", "Using fewer levels", "Fewer levels cover less of the range."],
      ["c", "Allowing a wider tolerance around each level", "Right. Each band covers more of the range."],
      ["d", "Comparing with made-up levels", "That is a control, not a cause of hits."],
    ], "c"), "Wider tolerance and more levels raise the chance hit rate."),
    q("taq-fib-5", "ta-fib", "knowledge", single("What is a fair test of Fibonacci levels on a market?", [
      ["a", "Collect charts where they worked", "That is selection by hindsight."],
      ["b", "Ask several experienced traders", "Opinions are not a test."],
      ["c", "Widen the tolerance band until most of the pullbacks hit a level", "That guarantees hits."],
      ["d", "Compare their hit rate with made-up levels, by fixed rules", "Right. That is a control."],
    ], "d"), "Compare with made-up levels under the same swing rule and tolerance."),
    // ta-confluence
    q("taq-conf-1", "ta-confluence", "knowledge", single("RSI, the stochastic and rate of change all turn up together. How much evidence is that?", [
      ["a", "Mostly one piece: recent momentum of the same closes", "Right. They are redundant."],
      ["b", "Three independent confirmations, one from each indicator", "They share inputs."],
      ["c", "None, because they disagree", "They agree; the point is why."],
      ["d", "Proof that price will rise", "Indicators give no proof."],
    ], "a"), "Indicators built from the same closes agree because they measure the same thing."),
    q("taq-conf-2", "ta-confluence", "knowledge", single("It is Wednesday. Which weekly bar may a backtest use for Wednesday's decision?", [
      ["a", "This week's bar as it stands", "Its close is not known yet."],
      ["b", "This week's bar using Friday's close", "Friday has not happened."],
      ["c", "Any weekly bar, since they are slow", "Speed is not the issue; knowledge is."],
      ["d", "Last week's completed bar", "Right. Only closed bars are known."],
    ], "d"), "Using an unfinished higher-timeframe bar is look-ahead bias."),
    q("taq-conf-3", "ta-confluence", "knowledge", tf("Adding a second oscillator built from the same closes usually doubles the evidence for a trade.", false, "False. Shared inputs make them redundant."), "Count evidence by source, not by the number of indicators."),
    q("taq-conf-4", "ta-confluence", "knowledge", multi("Which of these carry information that RSI(14) does not? Select all that apply.", [
      ["a", "ATR(14)", "Right. It measures size of moves, not direction."],
      ["b", "A higher-timeframe trend filter from closed bars", "Right. A different window."],
      ["c", "Stochastic %K(14)", "Built from the same recent prices; highly correlated with RSI."],
      ["d", "On-balance volume", "Right. It uses volume."],
      ["e", "Rate of change over 14 bars", "Another reading of the same closes."],
    ], ["a", "b", "d"]), "Different inputs or windows add information; other oscillators on the same closes mostly do not."),
    // ta-overfitting (safety-critical)
    q("taq-of-1", "ta-overfitting", "knowledge", single("You try 100 settings and the best returns +40% on the data used to choose it. What is the best estimate of its future return?", [
      ["a", "About +40%", "The best of 100 includes a lot of luck."],
      ["b", "+80%, as more data will help the rule perform better", "There is no basis for that."],
      ["c", "Unknown, and probably far below +40%", "Right. Selection inflates the best result."],
      ["d", "Exactly 0%", "It could have some edge; you just cannot tell from this."],
    ], "c"), "The best of many tries on the same data is biased upwards. Only an unseen-data test can tell."),
    q("taq-of-2", "ta-overfitting", "knowledge", tf("Trying more parameter settings on the same data typically makes the best backtest a more reliable guide to the future.", false, "False. More tries raise the best in-sample result by luck."), "More tries make the winner look better and mean less."),
    q("taq-of-3", "ta-overfitting", "knowledge", tf("Every extra setting you try on the same data raises the chance that the best result is a fluke.", true, "True. That is the multiple-testing problem."), "Each extra try is another chance for luck to produce a winner."),
    q("taq-of-4", "ta-overfitting", "calculation", numeric("You test 20 rules that have no edge. Each has a 5% chance of looking significant by luck. How many would you expect to look significant?", "rules", 1, 0, "20 × 0.05 = 1."), "With many tests, some false positives are expected. Adjust for the number of tests."),
    q("taq-of-5", "ta-overfitting", "knowledge", single("What did Bajgrowicz and Scaillet (2012) find for technical rules on 1897–2011 Dow Jones data?", [
      ["a", "The best rules could not be picked in advance, and even low costs erased their gains", "Right: this one is correct."],
      ["b", "Simple rules beat buy-and-hold in every decade they studied, even after costs were charged", "They did not find that."],
      ["c", "Costs made no difference", "Even low costs offset performance."],
      ["d", "Only Fibonacci rules worked", "Fibonacci rules were not their subject."],
    ], "a"), "Controlling for false discoveries, the best rules were not identifiable in advance and did not survive costs."),
    // ta-backtest-validity (safety-critical)
    q("taq-bv-1", "ta-backtest-validity", "knowledge", single("A backtest buys at the close of the bar whose close triggered the signal. What is the error?", [
      ["a", "Overfitting", "That is about tuning, not timing."],
      ["b", "Survivorship bias", "That is about which assets are in the data."],
      ["c", "No error", "You cannot act on a close before it exists."],
      ["d", "Look-ahead bias", "Right. The close is only known when the bar ends."],
    ], "d"), "A rule can only act after its signal is known: at the next bar's open, not the signal bar's close."),
    q("taq-bv-2", "ta-backtest-validity", "calculation", numeric("A rule makes 40 round trips. Costs are 0.1% per side. Roughly how many percentage points do costs take in total, ignoring compounding?", "percentage points", 8, 0.1, "40 round trips × 2 sides × 0.1% = 8 percentage points."), "Every entry and every exit pays costs; frequent rules pay them often."),
    q("taq-bv-3", "ta-backtest-validity", "knowledge", tf("A backtest with no trading costs gives exactly the result you would have had trading live.", false, "False. Spreads, commissions and slippage reduce live results."), "Leaving out costs makes frequent rules look far better than they would be."),
    q("taq-bv-4", "ta-backtest-validity", "knowledge", single("What is walk-forward testing?", [
      ["a", "Running the backtest twice to check the code", "That checks the program, not the rule."],
      ["b", "Testing only on the most recent month", "One window is not walk-forward."],
      ["c", "Tuning on one window, testing on the next unseen window, then moving both forward", "Right: this one is correct."],
      ["d", "Testing the same tuned settings on a different market, over the same years, all at once", "Useful, but a different idea."],
    ], "c"), "Walk-forward testing repeatedly tunes on past data and judges only the unseen window after it."),
    q("taq-bv-5", "ta-backtest-validity", "knowledge", tf("A rule tuned on all of the data can usually be trusted if its backtest covers many years.", false, "False. A long history does not protect against fitting its noise."), "Length does not replace an unseen-data test."),
    // ta-applied (scenarios only)
    q("taq-app-1", "ta-applied", "applied", scenario(
      "A market has risen steadily for two months. RSI(14) has been above 70 for twelve bars. A trader wants to sell short with double their usual risk because 'it is overbought'. They have no tested rule for this.",
      "What is the soundest decision?",
      [
        ["a", "Short with double risk; overbought markets fall", "RSI can stay high in trends, and doubling risk on an untested idea is reckless.", "unsound"],
        ["b", "Short with normal risk but no stop, since an overbought market like this one must fall back soon", "No stop means no planned risk.", "unsound"],
        ["c", "Treat the reading as a description, and only act on a written, tested rule with a stop", "Sound: no untested signal, risk defined.", "sound"],
        ["d", "Buy with double risk, since the trend is strong", "Also untested, and doubled risk.", "unsound"],
      ],
    ), "Overbought is a description. Acting needs a tested rule and a defined stop, at normal risk."),
    q("taq-app-2", "ta-applied", "applied", scenario(
      "A trader tested 80 moving-average pairs on ten years of one market. The best made +35% a year in the backtest. They plan to trade it tomorrow at three times their usual size.",
      "What is the soundest decision?",
      [
        ["a", "Trade it tomorrow at triple size; ten years of history is long enough to trust the winner", "The result is the best of 80 on the same data and untested elsewhere.", "unsound"],
        ["b", "Trade it at normal size and see what happens", "Better, but it is still untested out of sample.", "partial"],
        ["c", "Trade the second-best pair instead, to be safe", "Still chosen on the same data.", "unsound"],
        ["d", "Test the chosen pair once on held-out data with costs, and report all 80 tries", "Sound: it checks the selection before any money is risked.", "sound"],
      ],
    ), "The best of many backtests must be tested on unseen data, with costs, before it is trusted."),
    q("taq-app-3", "ta-applied", "applied", scenario(
      "A trader sees a head-and-shoulders top confirmed by a close below the neckline. Their book says the target is reached '80% of the time'.",
      "What is the soundest plan?",
      [
        ["a", "Short with no stop, since the target is very likely", "The claim is untested here, and there is no planned loss.", "unsound"],
        ["b", "Short at normal risk with a stop above the right shoulder, treating the target as a reference", "Sound: invalidation first, normal risk.", "sound"],
        ["c", "Short with triple risk, because patterns rarely fail", "Patterns often fail; sizing up on a claim is unsound.", "unsound"],
        ["d", "Wait for a second pattern to confirm the first one", "Reasonable caution, but the risk plan is the real issue.", "partial"],
      ],
    ), "Pattern trades need a stop where the pattern is wrong and normal risk. Targets are conventions."),
    q("taq-app-4", "ta-applied", "applied", scenario(
      "A trader's backtest of an RSI rule acts at the close of the signal bar, ignores costs and uses the current, unfinished weekly bar as a trend filter. It shows strong results.",
      "What should they do first?",
      [
        ["a", "Fix the code: act on the next bar, add costs, use only closed weekly bars, then re-test", "Sound: removes look-ahead and adds costs before judging the rule.", "sound"],
        ["b", "Trade it as it is, since errors like these are small and the backtest result is already very strong", "Look-ahead and missing costs can turn a loser into a winner.", "unsound"],
        ["c", "Add two more indicators to make it stronger", "More indicators do not fix invalid testing.", "unsound"],
        ["d", "Only add costs and leave the rest", "Better, but look-ahead remains.", "partial"],
      ],
    ), "A backtest with look-ahead or no costs reports trades nobody could make. Fix it before judging it."),
  ],
};

/** A second remediation variant per concept, rotated when a concept is missed again. */
const MORE_REMEDIATION: Record<string, ConceptRemediation> = {
  "ta-ma": {
    misconception: "It is tempting to keep shortening an average until it 'stops lagging'. A shorter average does turn sooner, but it also follows every wiggle, so it gives many more false crossovers.",
    altExplanation: "Think of averaging as listening to a crowd instead of one voice. The bigger the crowd, the steadier the message, and the longer it takes to change its mind. A small crowd changes its mind quickly, often for no good reason. You choose between steady and late, or quick and noisy.",
    altExample: "On the same ranging chart, a 5/15 pair crosses a dozen times while a 50/150 pair barely crosses at all: the first reacts to noise, the second reacts very late.",
    practice: single("Which change makes a moving-average crossover rule give fewer false signals in a range, at the cost of later signals?", [
      ["a", "Using longer averages", "Right. Smoother and later."],
      ["b", "Using shorter averages", "Shorter averages cross more often."],
      ["c", "Switching from candles to line charts", "The chart type does not change the averages."],
      ["d", "Adding volume to the chart", "Volume does not change the averages."],
    ], "a"),
  },
  "ta-rsi": {
    misconception: "Some learners think RSI(14) and RSI(2) mean the same thing at the same level. Shorter RSI reaches extremes far more easily, so 70 on RSI(2) is ordinary.",
    altExplanation: "RSI averages gains and losses over its length. Over 2 bars, a couple of up bars give an extreme reading; over 14 bars, it takes a sustained run. Always say which length you mean, and judge extremes against how often that length reaches them.",
    altExample: "On the lab's ranging market, RSI(5) touches 70 many times more often than RSI(25) over the same bars.",
    practice: tf("RSI(2) reaches readings above 70 more often than RSI(14) on the same prices.", true, "True. Short lengths swing to extremes easily."),
  },
  "ta-macd": {
    misconception: "A shrinking MACD histogram is often read as the price top. It shows momentum growing more slowly, which usually happens well before price peaks, or not at all.",
    altExplanation: "The histogram is MACD minus its own average. It shrinks when MACD stops pulling away from its signal line, which happens when the fast EMA stops gaining on the slow one. Price can keep rising while that happens. It is a description of momentum's change, not of price.",
    altExample: "A market rises fast and then rises slowly. The histogram peaks at the end of the fast part and shrinks through the slow part, while price keeps making new highs.",
    practice: single("MACD is positive but the histogram has turned negative. What does this mean?", [
      ["a", "The fast EMA is below the slow EMA", "Positive MACD means fast is above slow."],
      ["b", "MACD is below its signal line: its rise has slowed or reversed", "Right: this one is correct."],
      ["c", "Price itself has started to fall sharply, which MACD then confirms", "Not necessarily."],
      ["d", "Volume has dropped", "MACD does not use volume."],
    ], "b"),
  },
  "ta-stoch": {
    misconception: "Showing RSI and the stochastic together can feel like two opinions. They are built from the same recent prices and are usually highly correlated.",
    altExplanation: "RSI compares the sizes of recent up and down moves; the stochastic places the close in the recent range. When price rises steadily, both go up for the same reason. Pick one, or test what the second one adds before relying on it.",
    altExample: "On a simulated 2,000-bar series, RSI(14) and stochastic %K(14) moved closely together most of the time, with a correlation of about 0.85.",
    practice: single("Why do RSI(14) and the stochastic(14) usually agree?", [
      ["a", "They are calculated by the same exchange", "Charting software calculates them."],
      ["b", "They share inputs: the same recent prices", "Right: this one is correct."],
      ["c", "They use the same formula", "The formulas differ."],
      ["d", "They both use volume", "Neither uses volume."],
    ], "b"),
  },
  "ta-volatility": {
    misconception: "Many learners use the bar's high minus low as its range, even after a gap. That understates movement exactly when stops are most at risk.",
    altExplanation: "True range asks how far price really travelled since the last close. If the market gapped, the travel includes the gap. ATR averages these true ranges with Wilder's method, so it reflects gaps as well as ordinary bars.",
    altExample: "After a close at 120, a bar opens at 126 and trades between 125 and 128. Its own range is 3, but price travelled from 120 to 128.",
    practice: numeric("Yesterday closed at 90. Today gapped up and traded between 94 and 96. What is today's true range?", "price points", 6, 0.01, "Max of 2, |96 − 90| = 6 and |94 − 90| = 4: 6."),
  },
  "ta-volume": {
    misconception: "Volume indicators are only as good as the volume data. On many charts the volume comes from one venue or is tick volume, so the indicators measure something narrower than they seem.",
    altExplanation: "Before using VWAP or OBV, ask where the volume comes from: all venues, one exchange, or a count of price updates. VWAP weighted by tick counts is weighted by activity, not by size. OBV built on one venue can move differently from the whole market.",
    altExample: "A share trades on a dozen venues. A chart that shows only one exchange's volume gives an OBV that can rise while the total market's OBV falls.",
    practice: tf("VWAP calculated from tick volume weights each price by how much money traded there.", false, "False. Tick volume counts price updates, not size."),
  },
  "ta-divergence": {
    misconception: "Divergences are easy to spot after the fact, so people remember the ones that worked and forget the rest. That makes them look far more reliable than they are.",
    altExplanation: "Use a fixed swing rule and list every divergence it finds, including the ones that failed. Then compare: after bearish divergences, how often was price lower 10 bars later, versus after any bar? Only the difference counts as information.",
    altExample: "On the lesson's simulated series, 44% of all bars were followed by a lower close 10 bars later. Bearish divergences need to do clearly better than that 44% to matter.",
    practice: single("After bearish divergences, price was lower 10 bars later 52% of the time. Over all bars it was lower 51% of the time. What does this suggest?", [
      ["a", "Divergence adds almost nothing here", "Right. It barely beats the base rate."],
      ["b", "Divergence works 52% of the time, so trade it", "Without beating the base rate it adds nothing."],
      ["c", "The base rate is irrelevant", "It is the benchmark."],
      ["d", "Divergence works better than chance by a wide margin", "One point is not a wide margin."],
    ], "a"),
  },
  "ta-trendlines": {
    misconception: "More touches are often taken as a sign of a stronger line. A wider tolerance gives more touches on any chart, whatever the market does.",
    altExplanation: "A touch is a bar that comes within your tolerance of the line. Double the tolerance and you roughly double the bars that qualify. Fix the tolerance as a share of price or of ATR before counting, and then compare lines fairly.",
    altExample: "With a tolerance of 0.2% a line has two touches; widen it to 1% and the same line on the same chart has seven.",
    practice: single("Your trendline has 3 touches at ±0.2% tolerance and 8 at ±1%. What has changed?", [
      ["a", "The market has become more respectful of the line", "The prices did not change."],
      ["b", "Only your definition of a touch", "Right: this one is correct."],
      ["c", "The line's slope", "The slope is the same."],
      ["d", "The chart's timeframe", "The timeframe is the same."],
    ], "b"),
  },
  "ta-patterns": {
    misconception: "When a pattern's target is reached, it feels like proof the pattern worked. Price reaches many levels by chance; the question is whether the target was reached more often than an equal distance the other way.",
    altExplanation: "Measure from the bar where the pattern was confirmed. The target is some distance away. Mark the same distance in the opposite direction: the mirror. Count both over many patterns. If they are hit about equally often, the pattern adds nothing beyond normal movement.",
    altExample: "Across about 230 confirmed patterns on a simulated random walk, targets and mirrors were each reached within 20 bars a little under half the time.",
    practice: tf("If a pattern's target and its mirror target are reached about equally often, the pattern adds little information.", true, "True. The mirror is the control for normal movement."),
  },
  "ta-fib": {
    misconception: "It is easy to choose the swing points after seeing where a pullback stopped, which makes almost any pullback 'respect' a Fibonacci level.",
    altExplanation: "A Fibonacci level depends on the move you measure. Shift the swing low or high and every level moves. If you choose the swing afterwards, you can usually find one that puts the pullback on a level. Fix the swing rule first, then measure.",
    altExample: "A pullback stops at 145. Measured from one low it is a 55% retracement; from a slightly earlier low it is 61%: a 'perfect' Fibonacci hit.",
    practice: single("Which practice most inflates the apparent accuracy of Fibonacci levels?", [
      ["a", "Choosing the swing points after seeing where the pullback stopped", "Right. Hindsight fits the levels."],
      ["b", "Using a fixed swing rule", "That makes the test fairer."],
      ["c", "Comparing with made-up levels", "That is a control."],
      ["d", "Counting every pullback, including misses", "That makes the count honest."],
    ], "a"),
  },
  "ta-confluence": {
    misconception: "Switching timeframes until one agrees with your idea feels like doing more analysis. It is choosing the evidence after the conclusion.",
    altExplanation: "Decide each timeframe's job before you look: for example weekly for direction and daily for timing. If you allow yourself to pick whichever timeframe agrees, some timeframe will always agree, and the agreement means nothing.",
    altExample: "A trader wants to buy. The daily trend is down, so they check the 4-hour, then the hourly, until one shows an up-trend, and call that confluence.",
    practice: single("What makes multi-timeframe analysis a test rather than a search for agreement?", [
      ["a", "Looking at as many timeframes as possible", "More timeframes give more chances to find agreement."],
      ["b", "Fixing each timeframe's role before looking at the chart", "Right: this one is correct."],
      ["c", "Using only the lowest timeframe", "That drops the context."],
      ["d", "Using unfinished higher-timeframe bars", "That is look-ahead."],
    ], "b"),
  },
  "ta-overfitting": {
    misconception: "Re-tuning a rule after a poor out-of-sample result feels like improving it. Each time you look at the test data and adjust, the test data become training data.",
    altExplanation: "Out-of-sample data are like an exam paper: you can only sit it once. Once you have seen the questions and changed your answers, the mark no longer measures what you know. If the rule fails, collect new data or accept the result.",
    altExample: "A rule loses on 2021–2023 data held back for testing. The trader changes one setting, re-runs 2021–2023, and now it wins. That second run is no longer a fair test.",
    practice: tf("Once you have tuned a rule after seeing its out-of-sample results, those results can still serve as an unbiased test.", false, "False. They have become in-sample data."),
  },
  "ta-backtest-validity": {
    misconception: "A long, impressive equity curve is easy to trust. If the rule could see a bar's close before acting, or paid no costs, the curve shows trades nobody could have made.",
    altExplanation: "Check timing first: every decision may only use bars that had closed, and orders fill on the next bar. Then check costs: every entry and exit pays the spread and commission, with some slippage. Then check selection: was the rule chosen on the data that now judges it? Only then read the result.",
    altExample: "A daily rule looks excellent until orders are moved from the signal bar's close to the next day's open and a small cost is added on each side; then most of the edge disappears.",
    practice: multi("Which of these make a backtest unreliable? Select all that apply.", [
      ["a", "Acting at the close of the bar that produced the signal", "Right. Look-ahead."],
      ["b", "Leaving out spreads and commissions", "Right. Results are overstated."],
      ["c", "Keeping some data aside until the rule is final", "That is good practice."],
      ["d", "Choosing the rule on the same data that judges it", "Right. Selection bias."],
    ], ["a", "b", "d"]),
  },
  "ta-applied": {
    misconception: "When a backtest looks great, it is tempting to skip straight to live trading at a large size. The sound step is usually a smaller one: test what you have not yet tested.",
    altExplanation: "Ask what you do not know yet. Has the rule seen data it was not tuned on? Are costs in? Is the stop defined? If any answer is no, the next step is a test or a smaller position, not a bigger one. A sound process can still lose; an unsound one is not justified by winning.",
    altExample: "A trader's rule has worked on two years of data it was built on. They paper-trade it for three months with costs before committing money, and keep normal risk when they start.",
    practice: scenario(
      "A trader's divergence rule is defined in writing and was tested out of sample with costs. It was mildly positive. They now want to trade it.",
      "What is the soundest way to start?",
      [
        ["a", "Trade at normal risk with the written stops, and keep recording results", "Sound: tested, defined risk, and monitored.", "sound"],
        ["b", "Start at five times normal risk to make the edge worthwhile", "Sizing up on a mild edge is reckless.", "unsound"],
        ["c", "Tune it again on the out-of-sample data first", "That spoils the test.", "unsound"],
        ["d", "Wait another year before doing anything", "Cautious, but the rule has already been tested properly.", "partial"],
      ],
    ),
  },
};

export const TECHNICAL_ANALYSIS_ASSESSMENT: TrackAssessment = {
  ...BASE,
  concepts: BASE.concepts.map((c) => ({ ...c, moreRemediation: MORE_REMEDIATION[c.id] ? [MORE_REMEDIATION[c.id]] : [] })),
};
