import type { ConceptRemediation, TrackAssessment } from "../types";

/*
  Track 6 assessment: Chart Reading.
  All prices and charts are illustrative, made-up numbers, not market data.
  Gap risk to stop orders is safety-critical.
*/

const T = "chart-reading";

const BASE: TrackAssessment = {
  trackId: T,
  intro:
    "One question for each key idea from the twelve lessons: reading candles, structure, trends, volume, scale, levels and gaps, with calculations, a chart to mark and an applied scenario. You need 90% or more, every critical question right (including the safety-critical one on stops and gaps) and a sound decision in the scenario.",
  concepts: [
    {
      id: "cr-basics",
      title: "What a chart records: bid, ask, last price, data versus interpretation",
      lessonIds: ["cr-what-is-a-chart"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "It is easy to read a chart as if it showed the market's intentions. It shows trades that already happened, usually the last traded price, and nothing about why.",
        altExplanation: "Think of a chart as a receipt book. Each receipt says when something was sold, for how much and how many. It cannot tell you why the customer bought, what other customers were thinking, or what will be sold tomorrow. Sentences about 'control' or 'defending' are guesses written on top of the receipts.",
        altExample: "A market shop's till roll shows apples sold at 1.00, 1.00, 1.10. That is data. 'Shoppers are panicking about an apple shortage' is an interpretation; maybe a bigger customer just arrived.",
        practice: {
          kind: "single",
          prompt: "Which statement is market data rather than interpretation?",
          options: [
            { id: "a", text: "Sellers are exhausted after the fall", explain: "A guess about intentions." },
            { id: "b", text: "Big funds are quietly buying", explain: "Identities are not on the chart." },
            { id: "c", text: "500 shares traded at 31.20 at 10:02", explain: "Right. A recorded trade." },
            { id: "d", text: "This price is too low for the company", explain: "An opinion about value." },
          ],
          correct: "c",
        },
      },
      flashcard: { front: "What does a chart record?", back: "Past trades (usually the last traded price), times and often volume. Not motives, waiting orders or the future." },
    },
    {
      id: "cr-types",
      title: "Chart types and what each hides",
      lessonIds: ["cr-chart-types"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Many people assume every chart type shows real prices. Heikin-Ashi values are averages, and Renko and point-and-figure drop time and small moves entirely.",
        altExplanation: "Sort chart types into three families. Real-price, real-time charts: line, OHLC, candlestick. Averaged charts: Heikin-Ashi, whose open and close are calculations. Re-clocked or timeless charts: tick, volume and range bars change what a bar means, and Renko and point-and-figure print only when price moves a box.",
        altExample: "A real candle opens at 20 and closes at 19 after trading 18.5–21. Its Heikin-Ashi close is (20 + 21 + 18.5 + 19) ÷ 4 = 19.625, a price that may never have traded.",
        practice: {
          kind: "numeric",
          prompt: "A real candle has open 50, high 54, low 48 and close 52. What is its Heikin-Ashi close?",
          unit: "price units",
          answer: 51,
          tolerance: 0.01,
          explain: "(50 + 54 + 48 + 52) ÷ 4 = 204 ÷ 4 = 51.",
        },
      },
      flashcard: { front: "Heikin-Ashi close", back: "(O + H + L + C) ÷ 4. An average, not a traded price." },
    },
    {
      id: "cr-candles",
      title: "Reading and measuring a candle",
      lessonIds: ["cr-candlesticks"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "People often mix up the body and the range, or measure a wick from the wrong end of the body. Wicks start at the top or bottom of the body, whichever is closer.",
        altExplanation: "Draw the candle in three slices. The top slice runs from the high down to the higher of open and close: the upper wick. The middle slice is the body, from open to close. The bottom slice runs from the lower of open and close down to the low: the lower wick. The three slices add up to the range.",
        altExample: "Open 30, high 33, low 29, close 31: upper wick 33 − 31 = 2, body 1, lower wick 30 − 29 = 1, range 4 = 2 + 1 + 1.",
        practice: {
          kind: "numeric",
          prompt: "A candle has open 12.0, high 12.8, low 11.0 and close 11.4. How long is its lower wick?",
          unit: "price units",
          answer: 0.4,
          tolerance: 0.001,
          explain: "Lower wick = min(open, close) − low = 11.4 − 11.0 = 0.4.",
        },
      },
      flashcard: { front: "Upper and lower wick", back: "Upper = H − max(O, C). Lower = min(O, C) − L. Body + wicks = range." },
    },
    {
      id: "cr-patterns",
      title: "Candlestick patterns and the evidence they need",
      lessonIds: ["cr-candle-patterns"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "A common belief is that a named pattern is a signal. It is a shape; whether it adds anything has to be shown against a base rate with many cases, costs and fresh data.",
        altExplanation: "Ask four questions of any pattern claim. How many cases? Compared with what happened after every bar? After costs? On data that was not used to find it? A pattern that cannot answer all four is a story, however good its name.",
        altExample: "A forum post says a pattern 'worked 8 times out of 12'. If the market rose 8 days in 12 anyway, and only 12 cases exist, the pattern has shown nothing.",
        practice: {
          kind: "true-false",
          statement: "A pattern that was followed by a rise 70% of the time has shown an edge, whatever the base rate.",
          answer: false,
          explain: "False. If prices rose 70% of the time anyway, the pattern added nothing. Compare with the base rate.",
        },
      },
      flashcard: { front: "Evidence a pattern needs", back: "Fixed definition, every occurrence, base rate, enough cases, costs, out-of-sample test, correction for many tries." },
    },
    {
      id: "cr-timeframes",
      title: "Timeframes and aggregation",
      lessonIds: ["cr-timeframes"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Some learners think a higher timeframe is a different, truer data set. It is the same trades combined into bigger bars, so disagreement between timeframes is about scale, not truth.",
        altExplanation: "Aggregation is mechanical: the first open, the highest high, the lowest low, the last close, the total volume. Because each timeframe summarises a different window, a short fall inside a long rise shows as 'down' on the short chart and 'up' on the long one. Choose which window matters before you look.",
        altExample: "Over a month a share rises from 40 to 46; over the last two days it falls from 47 to 46. The daily chart shows a rise, the hourly a fall. Both are right.",
        practice: {
          kind: "single",
          prompt: "Three hourly bars have closes 10.2, 10.5 and 10.1. What is the close of the three-hour bar they make?",
          options: [
            { id: "a", text: "10.5, the highest close", explain: "Aggregation uses the last close." },
            { id: "b", text: "10.27, the average close", explain: "Aggregation does not average." },
            { id: "c", text: "10.2, the first close", explain: "That would be close to the open, not the close." },
            { id: "d", text: "10.1, the last close", explain: "Right: the last close." },
          ],
          correct: "d",
        },
      },
      flashcard: { front: "Aggregating bars", back: "O = first open, H = max high, L = min low, C = last close, V = sum." },
    },
    {
      id: "cr-structure",
      title: "Swings, structure, breakouts and pullbacks",
      lessonIds: ["cr-structure"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Many people label the latest bars as swing highs or lows. A swing can only be confirmed by later bars, so the right-hand edge of a chart is always unlabelled.",
        altExplanation: "Use a written rule, for example 'a swing high beats the highs of three bars on each side'. Mark only swings that rule confirms, compare each with the previous swing of the same kind, and read the structure from the last two highs and lows: HH and HL is up, LH and LL is down, anything else is mixed.",
        altExample: "Highs 20, 23, 22 and lows 18, 19, 17. The last high is lower (LH) and the last low is lower (LL): a down-trend structure by these swings, even though the first move was up.",
        practice: {
          kind: "single",
          prompt: "Peaks: 60, 64, 62. Troughs: 55, 58, 59. What is the latest structure?",
          options: [
            { id: "a", text: "Up-trend: higher high and higher low", explain: "The last peak (62) is below 64." },
            { id: "b", text: "Mixed: a lower high with a higher low", explain: "Right. That is a narrowing, not a clean trend." },
            { id: "c", text: "Down-trend: lower highs and lower lows", explain: "The lows are rising." },
            { id: "d", text: "Impossible to say from swings", explain: "Swings are exactly what you use." },
          ],
          correct: "b",
        },
      },
      flashcard: { front: "HH/HL and LH/LL", back: "Higher high + higher low = up-trend structure. Lower high + lower low = down-trend. Swings are confirmed only after the fact." },
    },
    {
      id: "cr-trend",
      title: "Trend, momentum and volatility",
      lessonIds: ["cr-trends"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "People often read a big, volatile market as a trending one, or read ADX as up or down. Direction, directionality and volatility are three different measurements.",
        altExplanation: "Direction: is price higher than it was over your window (moving averages, regression slope, swings)? Directionality: has the path been mostly one way (ADX, efficiency ratio)? Volatility: how big are the bars (ATR)? Momentum: how fast has it moved recently? Report each separately.",
        altExample: "A share swings 4% a day up and down for a month and ends where it began: high volatility, efficiency ratio near 0, no trend.",
        practice: {
          kind: "numeric",
          prompt: "Closes: 20, 22, 21, 23, 24. What is the efficiency ratio over those four steps? Give two decimal places.",
          unit: "ratio",
          answer: 0.67,
          tolerance: 0.01,
          explain: "Net move = 24 − 20 = 4. Path = 2 + 1 + 2 + 1 = 6. 4 ÷ 6 = 0.67.",
        },
      },
      flashcard: { front: "ADX", back: "How directional recent movement was (0–100), in either direction. Not up or down by itself." },
    },
    {
      id: "cr-volume",
      title: "Volume, relative volume and venue coverage",
      lessonIds: ["cr-volume"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A frequent mistake is reading volume as buying or selling pressure, or trusting one venue's figure as the market's total.",
        altExplanation: "Every unit bought was sold, so volume measures activity, not who pushed. Before reading it, ask what it counts: all venues (consolidated), one exchange, or price updates (tick volume). Then judge it relative to normal for that market and time of day.",
        altExample: "A crypto chart on one exchange shows record volume; across ten other exchanges the day was ordinary. The chart showed one venue's busy day, not the market's.",
        practice: {
          kind: "numeric",
          prompt: "The previous four bars had volumes 300, 500, 400 and 400. This bar has 1,000. What is its relative volume over those four bars?",
          unit: "times average",
          answer: 2.5,
          tolerance: 0.01,
          explain: "Average = 1,600 ÷ 4 = 400. 1,000 ÷ 400 = 2.5.",
        },
      },
      flashcard: { front: "Relative volume", back: "This bar's volume ÷ the average of recent bars. Check what the volume counts first." },
    },
    {
      id: "cr-scale",
      title: "Linear and logarithmic scales",
      lessonIds: ["cr-scale"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "On long charts, people judge moves by their height on a linear scale, which makes recent moves look huge and old crashes look tiny.",
        altExplanation: "A linear axis spaces equal amounts equally; a log axis spaces equal percentages equally. When price has changed a lot over the chart, only the log axis shows moves in proportion to what an investor gained or lost. Percentages also compound: −50% needs +100% to recover.",
        altExample: "A fall from 2,000 to 1,500 (−25%) looks enormous next to an earlier fall from 200 to 100 (−50%) on a linear chart. On a log chart the older fall is drawn larger, as it should be.",
        practice: {
          kind: "numeric",
          prompt: "A price falls by 20%. What percentage rise brings it back to where it started?",
          unit: "%",
          answer: 25,
          tolerance: 0.1,
          explain: "100 → 80. To get back to 100 needs +20 on 80, which is 25%.",
        },
      },
      flashcard: { front: "Log scale", back: "Equal distances are equal percentage moves. Use it for long ranges." },
    },
    {
      id: "cr-levels",
      title: "Support and resistance as zones with invalidation",
      lessonIds: ["cr-support-resistance"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Lines drawn to the cent feel precise, which leads people to expect price to stop exactly there. Prices overshoot levels all the time, and levels can stop mattering at once.",
        altExplanation: "Draw a level as a band where reactions happened before, and write its invalidation beyond the band, such as a daily close outside it. That makes your plan robust to normal overshoots and honest about when the idea is wrong.",
        altExample: "Swing lows at 71.80, 72.10 and 72.30 suggest a zone of about 71.8–72.3, invalidated on a daily close below 71.5, rather than a line at 72.07.",
        practice: {
          kind: "single",
          prompt: "Which plan treats a support level most soundly?",
          options: [
            { id: "a", text: "Support at exactly 72.07; act the moment it is touched", explain: "False precision." },
            { id: "b", text: "Support near 72 has held, so it will hold again", explain: "Levels can break." },
            { id: "c", text: "Zone 71.8–72.3; wrong on a daily close below 71.5", explain: "Right. A zone with invalidation beyond it." },
            { id: "d", text: "Draw new lines after each bounce so one always fits", explain: "That makes the analysis unfalsifiable." },
          ],
          correct: "c",
        },
      },
      flashcard: { front: "Support and resistance", back: "Zones where moves paused before. Set invalidation beyond the zone; avoid false precision." },
    },
    {
      id: "cr-gap-stops",
      title: "Gaps and stop-order risk",
      lessonIds: ["cr-gaps"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "The most dangerous belief here is that a stop-loss caps the loss at the stop price. A triggered stop becomes a market order and fills at the next available price, which after a gap can be far beyond it.",
        altExplanation: "A stop is an instruction that wakes up when price trades at or through it. If the market opens below a sell stop, there was never a trade at the stop; the first available price is the open. So the loss is set by the gap, not by the stop. Before holding through known events, size the position for a gap.",
        altExample: "Entry 60, stop 57, 50 shares: planned loss $150. Results disappoint and the share opens at 51: the stop fills near 51, and the loss is about $450.",
        practice: {
          kind: "numeric",
          prompt: "You hold 100 shares bought at $40.00 with a sell stop at $38.00. The share opens at $33.00 after news. If the stop fills at the open, what is the loss in dollars?",
          unit: "US dollars",
          answer: 700,
          tolerance: 0.5,
          explain: "Fill at $33.00. Loss = (40.00 − 33.00) × 100 = $700, against a planned $200.",
        },
      },
      flashcard: { front: "Stop through a gap", back: "A triggered stop fills at the next available price. After a gap that can be far beyond the stop." },
    },
    {
      id: "cr-applied",
      title: "Applied scenario: reading a chart before acting",
      lessonIds: ["cr-practical-exam", "cr-gaps", "cr-candle-patterns"],
      critical: true,
      safetyCritical: false,
      applied: true,
      remediation: {
        misconception: "Under pressure, people grab one striking feature of a chart (a big candle, a pattern name) and act on it. A sound reading works through context, structure, volume, levels, invalidation and event risk first.",
        altExplanation: "Use the checklist even when one feature shouts at you: context, structure, trend and volatility, candles, volume, levels, invalidation, uncertainty. The sound answer is usually the one that names what would prove it wrong and what the chart cannot show, not the most confident one.",
        altExample: "A huge green candle appears just before the weekend. The checklist asks: is it at a level, what is volume relative to normal, what would prove the move wrong, and is there news ahead? 'Buy now before it runs' answers none of these.",
        practice: {
          kind: "scenario",
          situation: "On an illustrative daily chart, a share has been in a range between 30 and 34 for three months. Today it closes at 34.40 on 2.5× relative volume. The company reports results in two days.",
          question: "What is the soundest reading?",
          options: [
            { id: "a", text: "A confirmed breakout; buy as much as possible", explain: "One close beyond a range is not confirmation, and sizing ignores the event.", process: "unsound" },
            { id: "b", text: "A possible breakout on high activity; wrong on a close back inside the range, and results in two days add gap risk", explain: "Sound: possibility, invalidation and event risk.", process: "sound" },
            { id: "c", text: "A breakout, so the old range top at 34 is now guaranteed to act as support on any pullback before the results", explain: "Role reversal is a possibility, not a guarantee.", process: "unsound" },
            { id: "d", text: "Ignore it; ranges always continue", explain: "It dismisses the evidence without a reason.", process: "partial" },
          ],
        },
      },
      flashcard: { front: "Chart-reading checklist", back: "Context, structure, trend and volatility, candles, volume, levels, invalidation, uncertainty." },
    },
  ],
  questions: [
    // cr-basics
    {
      id: "crq-basics-1", concept: "cr-basics", type: "knowledge",
      item: {
        kind: "single",
        prompt: "The bid is 15.00 and the ask is 15.06. A seller sends a small market order. Where does it most likely trade?",
        options: [
          { id: "a", text: "At 15.06, the ask", explain: "That is where sellers wait; a market sell takes the buyers' price." },
          { id: "b", text: "At 15.00, the bid", explain: "Right. A market sell accepts the best bid." },
          { id: "c", text: "At 15.03, the mid price", explain: "The mid is not on offer." },
          { id: "d", text: "At the previous trade's price", explain: "The order meets the current quotes." },
        ],
        correct: "b",
      },
      explanation: "A market sell accepts the best bid, so it prints at 15.00. The last price on the chart then jumps down by the spread even if nothing else changed.",
    },
    {
      id: "crq-basics-2", concept: "cr-basics", type: "knowledge",
      item: {
        kind: "multi-select",
        prompt: "Which of these does an ordinary price chart NOT show? Select all that apply.",
        options: [
          { id: "a", text: "The orders waiting in the book that have not traded", explain: "Right: only trades are plotted." },
          { id: "b", text: "The time of each bar", explain: "It does show this: the time axis." },
          { id: "c", text: "Why traders bought or sold", explain: "Right: motives are not data." },
          { id: "d", text: "The highest traded price of each bar", explain: "It does show this: the high." },
        ],
        correct: ["a", "c"],
      },
      explanation: "A chart records traded prices and times (and often volume). It does not show orders that never traded, or anyone's reasons.",
    },
    {
      id: "crq-basics-3", concept: "cr-basics", type: "calculation",
      item: {
        kind: "numeric",
        prompt: "The bid is 99.96 and the ask is 100.04. What is the mid price?",
        unit: "price units",
        answer: 100,
        tolerance: 0.001,
        explain: "(99.96 + 100.04) ÷ 2 = 200.00 ÷ 2 = 100.00.",
      },
      explanation: "The mid is the average of the bid and the ask. It is a reference point, not a price you can usually trade at.",
    },
    {
      id: "crq-basics-4", concept: "cr-basics", type: "knowledge",
      item: {
        kind: "true-false",
        statement: "Two charts of the same share from different data providers can show different highs for the same day.",
        answer: true,
        explain: "True. Providers can include different venues or trading hours, so their bars can differ.",
      },
      explanation: "Charts depend on their data source: which venues, which hours. Check the source before comparing.",
    },
    // cr-types
    {
      id: "crq-types-1", concept: "cr-types", type: "knowledge",
      item: {
        kind: "true-false",
        statement: "Heikin-Ashi candles show exactly the prices that traded at each period's open and close.",
        answer: false,
        explain: "False. HA open and close are averages, not traded prices.",
      },
      explanation: "HA close = (O + H + L + C) ÷ 4 and HA open = (previous HA open + previous HA close) ÷ 2. Neither is necessarily a traded price.",
    },
    {
      id: "crq-types-2", concept: "cr-types", type: "knowledge",
      item: {
        kind: "single",
        prompt: "Which chart type removes time entirely?",
        options: [
          { id: "a", text: "OHLC bars", explain: "They keep a fixed period per bar." },
          { id: "b", text: "Line chart of closes", explain: "One point per period: time is kept." },
          { id: "c", text: "Renko", explain: "Right. Bricks print only on box-size moves." },
          { id: "d", text: "Heikin-Ashi", explain: "It averages prices but keeps one candle per period." },
        ],
        correct: "c",
      },
      explanation: "Renko and point-and-figure print only when price moves a box, so a quiet week can print nothing.",
    },
    {
      id: "crq-types-3", concept: "cr-types", type: "calculation",
      item: {
        kind: "numeric",
        prompt: "On a Renko chart with a box size of 2, the last brick is an up brick from 100 to 102. What is the lowest price that would print a DOWN brick?",
        unit: "price units",
        answer: 98,
        tolerance: 0.001,
        explain: "A reversal needs two boxes from the top: a down brick from 100 to 98 needs price at or below 98.",
      },
      explanation: "Using the far edge of the last brick, a reversal needs a move of two boxes: from 102 down to 98.",
    },
    {
      id: "crq-types-4", concept: "cr-types", type: "applied",
      item: {
        kind: "single",
        prompt: "A friend backtests a rule that buys at each Heikin-Ashi close. What is the main problem?",
        options: [
          { id: "a", text: "HA closes are averages, so the test assumes fills at prices that may not have traded", explain: "Right: averaged values are not fills." },
          { id: "b", text: "HA charts are not available for most markets, so the test cannot be repeated", explain: "They are widely available." },
          { id: "c", text: "HA closes are always higher than real closes, so the test overstates every profit it reports", explain: "They can be higher or lower." },
          { id: "d", text: "Nothing: HA closes are a fair price", explain: "They are calculations, not fills." },
        ],
        correct: "a",
      },
      explanation: "Results computed at averaged prices can look better than any real fill. Tests must use real traded prices.",
    },
    // cr-candles (critical)
    {
      id: "crq-candles-1", concept: "cr-candles", type: "calculation",
      item: {
        kind: "numeric",
        prompt: "A candle has open 25.00, high 27.00, low 24.00 and close 26.50. What is its body-to-range ratio, in percent?",
        unit: "%",
        answer: 50,
        tolerance: 0.5,
        explain: "Body = 1.50. Range = 3.00. 1.50 ÷ 3.00 = 50%.",
      },
      explanation: "Body = |C − O| and range = H − L. The ratio says how much of the period's travel ended as net movement.",
    },
    {
      id: "crq-candles-2", concept: "cr-candles", type: "knowledge",
      item: {
        kind: "true-false",
        statement: "A real candle's high must be at least as high as both its open and its close.",
        answer: true,
        explain: "True. The high is the highest traded price, and the open and close are traded prices too.",
      },
      explanation: "Validity: H ≥ max(O, C) and L ≤ min(O, C). Data that breaks this has an error.",
    },
    {
      id: "crq-candles-3", concept: "cr-candles", type: "knowledge",
      item: {
        kind: "single",
        prompt: "A candle opens at 80, trades up to 86, down to 79 and closes at 80.2. Which description is most accurate?",
        options: [
          { id: "a", text: "A bearish marubozu", explain: "It is almost all wick, and closed above its open." },
          { id: "b", text: "An impossible candle", explain: "The prices are valid." },
          { id: "c", text: "A strong bullish candle with a large body", explain: "The body is 0.2 on a range of 7." },
          { id: "d", text: "Close to a doji, with a long upper wick", explain: "Right. Tiny body, long upper wick." },
        ],
        correct: "d",
      },
      explanation: "Body 0.2 on a range of 7 is under 3%: a doji-like candle. The upper wick (86 − 80.2) is much longer than the lower (80 − 79).",
    },
    {
      id: "crq-candles-4", concept: "cr-candles", type: "knowledge",
      item: {
        kind: "find-error",
        prompt: "A learner measured the candle O 40, H 44, L 38, C 43. Select every line with a mistake.",
        lines: [
          { id: "1", text: "Body = 43 − 40 = 3" },
          { id: "2", text: "Range = 44 − 38 = 6" },
          { id: "3", text: "Upper wick = 44 − 40 = 4", error: "The upper wick starts at the top of the body, here the close: 44 − 43 = 1." },
          { id: "4", text: "Lower wick = 40 − 38 = 2" },
          { id: "5", text: "It is bearish because it has a lower wick", error: "Direction comes from close versus open: 43 > 40, so it is bullish." },
        ],
        explain: "Upper wick = H − max(O, C) = 1. Direction: close above open, so bullish.",
      },
      explanation: "Measure wicks from the body's nearer edge, and judge direction only from close versus open.",
    },
    // cr-patterns (critical)
    {
      id: "crq-patterns-1", concept: "cr-patterns", type: "knowledge",
      item: {
        kind: "single",
        prompt: "What separates a hammer from a hanging man?",
        options: [
          { id: "a", text: "Whether it comes after a fall or after a rise", explain: "Right. Same shape, different context." },
          { id: "b", text: "The colour of its body", explain: "Either colour is allowed in most definitions." },
          { id: "c", text: "Its volume", explain: "Volume is context, but not the definition." },
          { id: "d", text: "The length of its upper wick, which must be at least twice the body for a hanging man", explain: "Both have little or no upper wick." },
        ],
        correct: "a",
      },
      explanation: "A hammer appears after a decline and a hanging man after a rise; the candle itself looks the same.",
    },
    {
      id: "crq-patterns-2", concept: "cr-patterns", type: "applied",
      item: {
        kind: "single",
        prompt: "In 300 bars, a pattern appears 12 times and is followed by a rise over 5 bars 9 times (75%). Over all bars, rises over 5 bars happened 70% of the time. What is the fairest conclusion?",
        options: [
          { id: "a", text: "A strong edge: 75% is high", explain: "Compare with the base rate, and note the tiny sample." },
          { id: "b", text: "Almost no evidence: close to the base rate, with only 12 cases", explain: "Right: tiny sample, near the base rate." },
          { id: "c", text: "The pattern makes prices rise", explain: "Correlation in 12 cases is not cause." },
          { id: "d", text: "The pattern is useless in every market and on every timeframe", explain: "This data cannot show that either." },
        ],
        correct: "b",
      },
      explanation: "75% versus a 70% base rate on 12 cases is well within what chance produces. It neither proves nor disproves the pattern.",
    },
    {
      id: "crq-patterns-3", concept: "cr-patterns", type: "knowledge",
      item: {
        kind: "multi-select",
        prompt: "Which of these are needed before a candlestick pattern counts as evidence? Select all that apply.",
        options: [
          { id: "a", text: "A definition fixed before looking at the data", explain: "Right: otherwise you can fit any result." },
          { id: "b", text: "A few clear examples from a textbook", explain: "Selected examples are not a test." },
          { id: "c", text: "Comparison with the base rate", explain: "Right: the pattern must beat what happens anyway." },
          { id: "d", text: "Testing on data not used to design the rule", explain: "Right: fresh data guards against snooping." },
          { id: "e", text: "A memorable name", explain: "A name is not evidence." },
        ],
        correct: ["a", "c", "d"],
      },
      explanation: "Fixed definitions, base rates, out-of-sample testing, costs and enough cases are the minimum; examples and names are not evidence.",
    },
    {
      id: "crq-patterns-4", concept: "cr-patterns", type: "knowledge",
      item: {
        kind: "true-false",
        statement: "Shapes such as hammers and engulfing patterns also appear in purely random simulated prices.",
        answer: true,
        explain: "True. Random data produces every shape by chance, which is why base rates matter.",
      },
      explanation: "If a shape appears in coin-flip prices, its appearance alone cannot prove anything about the future.",
    },
    // cr-timeframes
    {
      id: "crq-tf-1", concept: "cr-timeframes", type: "calculation",
      item: {
        kind: "numeric",
        prompt: "Three hourly bars: (O 50, H 51, L 49.5, C 50.8), (O 50.8, H 52.2, L 50.6, C 51.9), (O 51.9, H 52.0, L 50.1, C 50.4). What is the LOW of the three-hour bar?",
        unit: "price units",
        answer: 49.5,
        tolerance: 0.001,
        explain: "Low = min(49.5, 50.6, 50.1) = 49.5.",
      },
      explanation: "An aggregated bar's low is the lowest low of its parts; its high is the highest high.",
    },
    {
      id: "crq-tf-2", concept: "cr-timeframes", type: "applied",
      item: {
        kind: "single",
        prompt: "A trader plans to hold for about two weeks. Which pair of timeframes best fits, with roles fixed in advance?",
        options: [
          { id: "a", text: "1-minute for context, tick chart for timing", explain: "Far too short for a two-week hold." },
          { id: "b", text: "Monthly only", explain: "Too coarse to time a two-week hold." },
          { id: "c", text: "Weekly for context, daily for timing", explain: "Right. It matches the horizon." },
          { id: "d", text: "Whichever timeframe looks best that day", explain: "That is timeframe shopping." },
        ],
        correct: "c",
      },
      explanation: "Timeframes should match the holding period, with a higher one for context and a lower one for detail, chosen before looking.",
    },
    {
      id: "crq-tf-3", concept: "cr-timeframes", type: "knowledge",
      item: {
        kind: "true-false",
        statement: "Timeframes often disagree about direction because they summarise different windows of the same trades.",
        answer: true,
        explain: "True. A short fall inside a long rise looks 'down' short-term and 'up' long-term.",
      },
      explanation: "Disagreement is a matter of scale, not a sign that one chart is wrong.",
    },
    {
      id: "crq-tf-4", concept: "cr-timeframes", type: "knowledge",
      item: {
        kind: "single",
        prompt: "At 13:00, which part of today's daily candle is already final?",
        options: [
          { id: "a", text: "The open", explain: "Right. It was the day's first trade." },
          { id: "b", text: "The high", explain: "A higher trade can still happen." },
          { id: "c", text: "The close", explain: "The close is the day's last trade." },
          { id: "d", text: "The volume", explain: "Volume keeps adding up until the close." },
        ],
        correct: "a",
      },
      explanation: "An unfinished bar's high, low, close and volume can all still change. Only its open is fixed.",
    },
    // cr-structure (critical)
    {
      id: "crq-struct-1", concept: "cr-structure", type: "knowledge",
      item: {
        kind: "single",
        prompt: "Swing highs 102, 99, 96 and swing lows 95, 92, 90. What is the structure?",
        options: [
          { id: "a", text: "Up-trend", explain: "Both highs and lows are falling." },
          { id: "b", text: "Range", explain: "The swings are moving steadily lower." },
          { id: "c", text: "A failed breakout, because price broke above the range and then returned inside it", explain: "Nothing broke out and returned." },
          { id: "d", text: "Down-trend: lower highs and lower lows", explain: "Right: LH and LL." },
        ],
        correct: "d",
      },
      explanation: "Each high and each low is below the previous one: LH and LL, a down-trend structure.",
    },
    {
      id: "crq-struct-2", concept: "cr-structure", type: "applied",
      item: {
        kind: "chart-annotate",
        prompt: "On this illustrative, made-up chart of closing prices, mark the bar of the most recent confirmed swing low.",
        series: [30.0, 30.8, 31.6, 31.0, 30.4, 30.9, 31.8, 32.5, 31.9, 31.2, 30.9, 31.5, 32.2, 33.0, 33.4, 33.1, 33.6],
        decimals: 2,
        target: { mode: "point", value: 10, tolerance: 0 },
        explain: "Bar 11 (30.90) is the lowest point between the peaks at bars 8 and 15, with higher closes on both sides. It is above the earlier low at bar 5 (30.40): a higher low.",
      },
      explanation: "The latest confirmed trough is bar 11 at 30.90. It is a higher low than bar 5 at 30.40.",
    },
    {
      id: "crq-struct-3", concept: "cr-structure", type: "calculation",
      item: {
        kind: "numeric",
        prompt: "Price rallies from 80 to 100, then pulls back to 92.5. What percentage of the rally has been retraced?",
        unit: "%",
        answer: 37.5,
        tolerance: 0.1,
        explain: "Pullback = 100 − 92.5 = 7.5. Rally = 20. 7.5 ÷ 20 = 37.5%.",
      },
      explanation: "Retracement % = pullback ÷ prior move × 100.",
    },
    {
      id: "crq-struct-4", concept: "cr-structure", type: "knowledge",
      item: {
        kind: "true-false",
        statement: "A swing high can only be confirmed after the bars that follow it have formed.",
        answer: true,
        explain: "True. A peak needs later, lower highs to confirm it.",
      },
      explanation: "Any swing rule needs bars after the swing. Using an unconfirmed swing in a test is look-ahead.",
    },
    // cr-trend
    {
      id: "crq-trend-1", concept: "cr-trend", type: "knowledge",
      item: {
        kind: "single",
        prompt: "ADX has risen from 18 to 34 while price fell. What does that tell you?",
        options: [
          { id: "a", text: "Price is about to rise", explain: "ADX is not a forecast or a direction." },
          { id: "b", text: "Movement has become more directional, here downward", explain: "Right: directional, in this case down." },
          { id: "c", text: "Volatility has fallen", explain: "ADX does not measure volatility." },
          { id: "d", text: "The market has moved into a range, because ADX ignores direction", explain: "A rising ADX suggests the opposite." },
        ],
        correct: "b",
      },
      explanation: "ADX measures how directional movement has been, in either direction. Pair it with price or ±DI for which way.",
    },
    {
      id: "crq-trend-2", concept: "cr-trend", type: "calculation",
      item: {
        kind: "numeric",
        prompt: "Closes over the last five bars: 40, 41, 42, 43, 44. What is the 5-bar simple moving average?",
        unit: "price units",
        answer: 42,
        tolerance: 0.001,
        explain: "(40 + 41 + 42 + 43 + 44) ÷ 5 = 210 ÷ 5 = 42.",
      },
      explanation: "A simple moving average is the plain average of the last n closes; it lags behind a rising price.",
    },
    {
      id: "crq-trend-3", concept: "cr-trend", type: "applied",
      item: {
        kind: "single",
        prompt: "A share has moved 3–4% a day for a month and ends where it started. How should you describe it?",
        options: [
          { id: "a", text: "Highly volatile, with no trend", explain: "Right. Big swings, no net direction." },
          { id: "b", text: "A strong up-trend, because the moves were large", explain: "It ended where it began." },
          { id: "c", text: "A strong down-trend", explain: "It ended where it began." },
          { id: "d", text: "Low volatility", explain: "3–4% a day is large." },
        ],
        correct: "a",
      },
      explanation: "Volatility and trend are separate: large daily moves with no net change mean high volatility and an efficiency ratio near zero.",
    },
    {
      id: "crq-trend-4", concept: "cr-trend", type: "knowledge",
      item: {
        kind: "true-false",
        statement: "A rising regression slope always means a clean up-trend, whatever the r².",
        answer: false,
        explain: "False. A low r² means a straight line describes the path poorly, even if its slope is positive.",
      },
      explanation: "Slope gives the average change per bar; r² says how well a line fits. A positive slope with a tiny r² is a weak description.",
    },
    // cr-volume
    {
      id: "crq-vol-1", concept: "cr-volume", type: "knowledge",
      item: {
        kind: "true-false",
        statement: "Tick volume in spot forex typically measures the amount of currency traded.",
        answer: false,
        explain: "False. It counts price updates from one provider; there is no central record of traded size.",
      },
      explanation: "Use tick volume only to compare activity within the same feed, not as traded amounts.",
    },
    {
      id: "crq-vol-2", concept: "cr-volume", type: "calculation",
      item: {
        kind: "numeric",
        prompt: "The previous five days traded 1.0m, 1.2m, 0.8m, 1.0m and 1.0m shares. Today traded 3.5m. What is today's relative volume?",
        unit: "times average",
        answer: 3.5,
        tolerance: 0.01,
        explain: "Average = 5.0 ÷ 5 = 1.0m. 3.5 ÷ 1.0 = 3.5.",
      },
      explanation: "Relative volume = today's volume ÷ the recent average.",
    },
    {
      id: "crq-vol-3", concept: "cr-volume", type: "knowledge",
      item: {
        kind: "single",
        prompt: "A large red candle has record volume. What can you conclude from the volume alone?",
        options: [
          { id: "a", text: "Sellers outnumbered buyers during that candle", explain: "Every unit sold was bought." },
          { id: "b", text: "Institutions were selling", explain: "Identities are not shown." },
          { id: "c", text: "Activity was unusually high", explain: "Right: volume measures activity." },
          { id: "d", text: "The fall will continue", explain: "Volume is not a forecast." },
        ],
        correct: "c",
      },
      explanation: "Volume measures activity. Stories about who 'won' are interpretations.",
    },
    {
      id: "crq-vol-4", concept: "cr-volume", type: "applied",
      item: {
        kind: "single",
        prompt: "A crypto chart from one unregulated exchange shows huge volume. What is the most careful next step?",
        options: [
          { id: "a", text: "Treat it as proof of strong demand, because record volume means many buyers arrived", explain: "It may be one venue, and some reported volume may not be genuine." },
          { id: "b", text: "Compare with other venues and check how reliable the exchange's reporting is", explain: "Right: check coverage and reliability." },
          { id: "c", text: "Ignore volume in all markets from now on", explain: "Volume can be useful once you know what it counts." },
          { id: "d", text: "Assume all other exchanges show the same", explain: "Venues differ." },
        ],
        correct: "b",
      },
      explanation: "Single-venue and possibly fake volume can misrepresent a market. Check coverage and reliability first.",
    },
    // cr-scale
    {
      id: "crq-scale-1", concept: "cr-scale", type: "knowledge",
      item: {
        kind: "true-false",
        statement: "On a logarithmic price scale, every doubling of price is drawn the same height.",
        answer: true,
        explain: "True. Equal percentage moves take equal distance on a log scale.",
      },
      explanation: "Log scale height depends on ln(b ÷ a); every doubling has the same ratio.",
    },
    {
      id: "crq-scale-2", concept: "cr-scale", type: "calculation",
      item: {
        kind: "numeric",
        prompt: "A price rises 25% and then falls 20%. What is the overall change, in percent?",
        unit: "%",
        answer: 0,
        tolerance: 0.01,
        explain: "100 × 1.25 = 125; 125 × 0.80 = 100. Overall 0%.",
      },
      explanation: "Percentage changes compound: multiply the factors (1.25 × 0.80 = 1.00) rather than adding the percentages.",
    },
    {
      id: "crq-scale-3", concept: "cr-scale", type: "applied",
      item: {
        kind: "single",
        prompt: "On a 30-year linear chart of an index, the last few years look far more volatile than the early decades. What should you check first?",
        options: [
          { id: "a", text: "Whether a log scale shows the same picture", explain: "Right. Linear scales exaggerate moves at high price levels." },
          { id: "b", text: "Whether the index itself has become a much riskier investment", explain: "Possibly, but scale is the first suspect." },
          { id: "c", text: "Whether old data was faked", explain: "No reason to assume that." },
          { id: "d", text: "The colour settings", explain: "Colour does not change move sizes." },
        ],
        correct: "a",
      },
      explanation: "Equal percentage moves are drawn far larger at high price levels on a linear scale. Switch to log before judging.",
    },
    {
      id: "crq-scale-4", concept: "cr-scale", type: "knowledge",
      item: {
        kind: "single",
        prompt: "Which pair of moves looks the same height on a log scale?",
        options: [
          { id: "a", text: "10 → 15 and 100 → 105", explain: "+50% versus +5%." },
          { id: "b", text: "20 → 30 and 200 → 300", explain: "Right. Both +50%." },
          { id: "c", text: "50 → 60 and 60 → 70", explain: "+20% versus about +16.7%." },
          { id: "d", text: "5 → 10 and 10 → 15, because both moves add 5 points", explain: "+100% versus +50%." },
        ],
        correct: "b",
      },
      explanation: "Log scales space equal ratios equally: 30 ÷ 20 = 300 ÷ 200 = 1.5.",
    },
    // cr-levels
    {
      id: "crq-levels-1", concept: "cr-levels", type: "knowledge",
      item: {
        kind: "true-false",
        statement: "A level that has been touched many times tends to become unbreakable.",
        answer: false,
        explain: "False. Many touches may mean many people watch it, but repeated tests can also use up the orders there; levels break.",
      },
      explanation: "Touch counts are not guarantees. Plan for any level breaking.",
    },
    {
      id: "crq-levels-2", concept: "cr-levels", type: "applied",
      item: {
        kind: "chart-annotate",
        prompt: "On this illustrative, made-up chart of closing prices, mark the resistance level that price has turned down from three times.",
        series: [61.0, 62.2, 63.4, 64.0, 63.1, 62.0, 62.8, 63.7, 64.1, 63.2, 62.4, 61.8, 62.9, 63.9, 63.0, 62.1],
        decimals: 2,
        target: { mode: "level", value: 64.0, tolerance: 0.3 },
        explain: "Peaks at 64.00, 64.10 and 63.90 form a resistance zone around 64. Anything from about 63.70 to 64.30 is accepted.",
      },
      explanation: "Three turns near 64 make it a resistance zone; the tolerance reflects that a level is a band, not a line.",
    },
    {
      id: "crq-levels-3", concept: "cr-levels", type: "knowledge",
      item: {
        kind: "single",
        prompt: "What is role reversal?",
        options: [
          { id: "a", text: "Buyers and sellers swapping brokers", explain: "Not a chart concept at all." },
          { id: "b", text: "A candle changing colour", explain: "That is just the candle's direction." },
          { id: "c", text: "Switching a chart from a linear to a logarithmic scale so that old levels show up", explain: "Unrelated to levels." },
          { id: "d", text: "A broken resistance later being watched as support, or the reverse", explain: "Right: a former ceiling watched as a floor." },
        ],
        correct: "d",
      },
      explanation: "After a break, a former ceiling is often watched as a floor. It is a tendency, not a rule.",
    },
    {
      id: "crq-levels-4", concept: "cr-levels", type: "calculation",
      item: {
        kind: "numeric",
        prompt: "You draw a support zone centred on 50.00 with a half-width of 0.5 × ATR. The ATR is 1.20. What is the bottom of the zone?",
        unit: "price units",
        answer: 49.4,
        tolerance: 0.001,
        explain: "Half-width = 0.5 × 1.20 = 0.60. Bottom = 50.00 − 0.60 = 49.40.",
      },
      explanation: "Scaling zone width by volatility keeps it sensible for quiet and busy markets alike.",
    },
    // cr-gap-stops (safety-critical)
    {
      id: "crq-gap-1", concept: "cr-gap-stops", type: "calculation",
      item: {
        kind: "numeric",
        prompt: "You hold 150 shares bought at $20.00 with a sell stop at $19.00. The share opens at $16.00 after results. If the stop fills at the open, what is the loss in dollars?",
        unit: "US dollars",
        answer: 600,
        tolerance: 0.5,
        explain: "Fill $16.00. Loss = (20.00 − 16.00) × 150 = $600, against a planned (20.00 − 19.00) × 150 = $150.",
      },
      explanation: "A triggered stop fills at the next available price. After a gap that is the open, so the loss is set by the gap, not the stop.",
    },
    {
      id: "crq-gap-2", concept: "cr-gap-stops", type: "knowledge",
      item: {
        kind: "true-false",
        statement: "A standard stop-loss order always fills at exactly its stop price.",
        answer: false,
        explain: "False. Once triggered it becomes a market order and fills at the next available price, which can be worse after a gap.",
      },
      explanation: "Stops limit risk only while the market trades continuously through them. Gaps skip past them.",
    },
    {
      id: "crq-gap-3", concept: "cr-gap-stops", type: "applied",
      item: {
        kind: "scenario",
        situation: "You hold a position sized so that a hit stop would lose 1% of your account. The company reports results tonight, and its shares have gapped 8–15% after several past reports. Your stop is 3% below the price.",
        question: "What is the soundest decision?",
        options: [
          { id: "a", text: "Keep the full position; the stop limits the loss to 1%", explain: "A gap can carry price far beyond the stop.", process: "unsound" },
          { id: "b", text: "Reduce or close the position so that a gap of the size seen before is still affordable", explain: "Sound: it sizes for the known gap risk.", process: "sound" },
          { id: "c", text: "Move the stop much further away so that an ordinary dip after the results does not stop you out", explain: "It does not stop a gap; it may add loss.", process: "unsound" },
          { id: "d", text: "Keep the position but watch the price closely tonight", explain: "Watching cannot help if the market is closed when the news arrives.", process: "partial" },
        ],
      },
      explanation: "Stops do not protect against gaps. Sizing for event risk, or not holding through it, is the sound response.",
    },
    {
      id: "crq-gap-4", concept: "cr-gap-stops", type: "knowledge",
      item: {
        kind: "true-false",
        statement: "Gaps always fill within a few days, so a gap against your position will soon reverse.",
        answer: false,
        explain: "False. Many gaps fill, but some never do, especially when they reflect lasting news.",
      },
      explanation: "'Gaps always fill' is a saying. Planning on it can turn a gap loss into a larger one.",
    },
    // cr-applied (scenarios)
    {
      id: "crq-applied-1", concept: "cr-applied", type: "applied",
      item: {
        kind: "scenario",
        situation: "On an illustrative daily chart, a share has made higher highs and higher lows for six weeks. Today a hammer-shaped candle forms right at the last higher low, on ordinary volume.",
        question: "What is the soundest reading?",
        options: [
          { id: "a", text: "The hammer guarantees the up-trend continues", explain: "No pattern guarantees anything.", process: "unsound" },
          { id: "b", text: "The structure is intact; the candle is weak evidence on its own, and a close below the higher low would break the structure", explain: "Sound: structure, modest weight on the candle, invalidation.", process: "sound" },
          { id: "c", text: "The hammer means big buyers defended the level", explain: "A story about intentions the chart cannot show.", process: "unsound" },
          { id: "d", text: "The up-trend is intact, so there is no need to think about what would change that reading or about how big the position should be", explain: "It omits invalidation.", process: "partial" },
        ],
      },
      explanation: "A sound reading leads with structure, treats a single candle as weak evidence and states what would prove it wrong.",
    },
    {
      id: "crq-applied-2", concept: "cr-applied", type: "applied",
      item: {
        kind: "scenario",
        situation: "A learner wants to buy. The daily chart shows a down-trend. The 4-hour chart is mixed. The 15-minute chart shows three green candles, and the learner says: 'The 15-minute confirms it.'",
        question: "What is the soundest response?",
        options: [
          { id: "a", text: "Agree: lower timeframes react first", explain: "This is timeframe shopping, not a fixed plan.", process: "unsound" },
          { id: "b", text: "Point out that the timeframes were checked until one agreed, and ask which timeframe the plan was based on", explain: "Sound: it names the bias and returns to a fixed plan.", process: "sound" },
          { id: "c", text: "Suggest checking the 1-minute chart too", explain: "More shopping.", process: "unsound" },
          { id: "d", text: "Say that the daily chart is always right, so the learner should ignore every lower timeframe they looked at", explain: "No timeframe is always right; but it does at least question the switching.", process: "partial" },
        ],
      },
      explanation: "Switching timeframes until one agrees is a bias. Timeframes and their roles should be fixed before looking.",
    },
    {
      id: "crq-applied-3", concept: "cr-applied", type: "applied",
      item: {
        kind: "scenario",
        situation: "On an illustrative chart, price breaks above a long range on one crypto exchange, with record volume on that exchange. Other exchanges show only a small rise and normal volume.",
        question: "What is the soundest reading?",
        options: [
          { id: "a", text: "A confirmed breakout with huge demand", explain: "One venue's volume may not represent the market.", process: "unsound" },
          { id: "b", text: "A possible breakout seen mainly on one venue; check whether the volume is genuine and wait for wider confirmation", explain: "Sound: it questions the data before the pattern.", process: "sound" },
          { id: "c", text: "Ignore all other exchanges, because the chart you use is the one that matters for your trades and your fills", explain: "It ignores most of the market.", process: "unsound" },
          { id: "d", text: "Call it a breakout but use a small size", explain: "Smaller size helps, but it does not question the data.", process: "partial" },
        ],
      },
      explanation: "Fragmented and possibly fake volume can make a move look bigger than it is. Check the data before reading the pattern.",
    },
    {
      id: "crq-applied-4", concept: "cr-applied", type: "applied",
      item: {
        kind: "scenario",
        situation: "On an illustrative 20-year linear chart, an index's latest 15% fall looks like the biggest crash in its history. Earlier falls of 40–50% look small.",
        question: "What is the soundest reading?",
        options: [
          { id: "a", text: "The latest fall is historically the worst the index has ever had, so expect a much deeper crash to follow soon", explain: "Scale exaggerates recent moves.", process: "unsound" },
          { id: "b", text: "Linear scale exaggerates moves at high prices; on a log scale the earlier falls are larger", explain: "Sound: it corrects for scale.", process: "sound" },
          { id: "c", text: "Earlier falls do not matter because they are old", explain: "Old falls show what the index can do.", process: "unsound" },
          { id: "d", text: "Compare the falls in points instead", explain: "Points have the same distortion; percentages are needed.", process: "partial" },
        ],
      },
      explanation: "Long charts must be read on a log scale or in percentages; a 15% fall is smaller than a 40% one.",
    },
  ],
};

const MORE_QUESTIONS: TrackAssessment["questions"] = [];

const MORE_REMEDIATION: Record<string, ConceptRemediation> = {
  "cr-basics": {
    misconception: "Another trap is treating the last traded price as the price you can trade at now. You buy at the ask and sell at the bid, and the last price may be either, or out of date.",
    altExplanation: "Keep three numbers apart. The bid is the best price someone will pay right now; the ask is the best price someone will sell at right now; the last price is simply where the most recent trade happened. A chart of last prices bounces between bid and ask as buyers and sellers take turns crossing the spread.",
    altExample: "Bid 9.98, ask 10.02. Trades print at 10.02, 9.98, 10.02. The chart zig-zags by four cents although the quotes never changed.",
    practice: {
      kind: "true-false",
      statement: "A chart of last traded prices can move up and down even when the bid and the ask stay exactly the same.",
      answer: true,
      explain: "True. Trades alternate between the bid and the ask as buyers and sellers cross the spread.",
    },
  },
  "cr-types": {
    misconception: "It is easy to forget that box size decides what a Renko or point-and-figure chart shows. A different box size gives a different chart, and different 'patterns', from the same prices.",
    altExplanation: "A box size is a filter: any move smaller than it is invisible. Set it small and the chart fills with bricks and noise; set it large and only big moves appear. When someone shows you a Renko pattern, the first question is what box size they used, and whether the pattern survives another one.",
    altExample: "Price drifts 100.0 → 100.8 → 100.2 → 101.4. With a box of 1, one brick prints. With a box of 0.5, three bricks print and a reversal appears.",
    practice: {
      kind: "single",
      prompt: "Which chart type depends most directly on a 'box size' setting?",
      options: [
        { id: "a", text: "Line chart", explain: "A line chart has no box size." },
        { id: "b", text: "Point and figure", explain: "Right. Box and reversal sizes decide every column." },
        { id: "c", text: "OHLC bars", explain: "OHLC bars use a time period, not a box." },
        { id: "d", text: "Candlesticks", explain: "Candles use a time period." },
      ],
      correct: "b",
    },
  },
  "cr-candles": {
    misconception: "Some people judge a candle by colour alone and call every green candle strong. Colour gives only the direction from open to close; the body, wicks and size relative to recent candles tell much more.",
    altExplanation: "Describe a candle with three numbers before any adjective: its range compared with recent ranges, its body-to-range ratio, and where the close sits in the range. A green candle with a tiny body near the low of a large range is a very different period from a green candle that closed at its high.",
    altExample: "Two green candles: O 10, H 12, L 9.9, C 11.9 (ratio 0.90, close near the high) and O 10, H 12, L 8, C 10.1 (ratio 0.03, close mid-range). Same colour, opposite shapes.",
    practice: {
      kind: "single",
      prompt: "Which set of prices is NOT a valid candle?",
      options: [
        { id: "a", text: "O 5.0, H 5.4, L 4.9, C 5.3", explain: "Valid: every rule is met." },
        { id: "b", text: "O 5.0, H 5.0, L 4.6, C 4.7", explain: "Valid: the open can be the high." },
        { id: "c", text: "O 5.0, H 5.2, L 5.1, C 5.15", explain: "Right. The low (5.1) is above the open (5.0)." },
        { id: "d", text: "O 5.0, H 5.5, L 4.5, C 5.0", explain: "Valid: a doji." },
      ],
      correct: "c",
    },
  },
  "cr-patterns": {
    misconception: "Another common error is remembering only the times a pattern worked. Selection makes any pattern look reliable; only counting every occurrence with a fixed definition is fair.",
    altExplanation: "Imagine writing the pattern's definition on a card before opening the chart, then marking every match, good or bad, and recording what happened next. That list, compared with what happened after every other bar, is the evidence. Screenshots of perfect examples are not.",
    altExample: "A textbook shows five beautiful morning stars at market bottoms. On the same charts there were twenty more morning stars that were followed by further falls; they were not printed.",
    practice: {
      kind: "single",
      prompt: "Which is the fairest way to judge a pattern?",
      options: [
        { id: "a", text: "Collect the clearest examples you can find", explain: "That is selection." },
        { id: "b", text: "Count every match of a fixed definition and compare with all bars", explain: "Right: all occurrences, against the base rate." },
        { id: "c", text: "Try many definitions and keep whichever did best", explain: "Data snooping unless re-tested on fresh data." },
        { id: "d", text: "Ask experienced traders", explain: "Opinions are not tests." },
      ],
      correct: "b",
    },
  },
  "cr-timeframes": {
    misconception: "A tempting habit is to keep changing timeframe until one supports the trade you already wanted. With enough timeframes, one nearly always will.",
    altExplanation: "Decide before you look: one timeframe for context, one for detail, and what each one is allowed to decide. Write it down. If the context timeframe says no, the answer is no, however good the detail chart looks.",
    altExample: "A learner's plan says 'daily for direction, hourly for entry'. The daily is down; the 5-minute looks up. The plan says no trade, and the 5-minute was never part of it.",
    practice: {
      kind: "true-false",
      statement: "Checking more timeframes until one agrees with your idea makes the idea more reliable.",
      answer: false,
      explain: "False. It is timeframe shopping: you are choosing the evidence, not testing the idea.",
    },
  },
  "cr-structure": {
    misconception: "People sometimes change their swing rule after the fact so that the structure matches their view. Any view can be supported by some rule.",
    altExplanation: "Write the rule first, for example three bars on each side on daily bars. Apply it, label the swings and accept the result. If you want to see a different scale, apply a different rule openly and treat it as a different question, not a better answer.",
    altExample: "With a 2-bar rule a chart shows a lower high, so 'mixed'. A trader switches to a 5-bar rule, the lower high disappears and it becomes 'up-trend'. The chart did not change; the rule did.",
    practice: {
      kind: "true-false",
      statement: "Different swing rules can give different answers about the structure of the same chart.",
      answer: true,
      explain: "True. That is why you fix the rule before reading the structure.",
    },
  },
  "cr-trend": {
    misconception: "Momentum and trend are often treated as the same thing. Momentum is the recent speed of change and can turn before a longer trend does.",
    altExplanation: "Picture a car going up a long hill. The trend is the hill: up. Momentum is the speed: it can slow down, even go briefly backwards on a dip, while the road still climbs. Measure them separately, for example a 10-bar percentage change for momentum and a 50-bar average for trend.",
    altExample: "An index is above its rising 200-day average (trend up) but has fallen 4% in ten days (momentum down). Both statements are true at once.",
    practice: {
      kind: "single",
      prompt: "Price is above its rising 100-day average, but has fallen 5% in the last 10 days. Which description fits?",
      options: [
        { id: "a", text: "Trend up by that rule, momentum down", explain: "Right: they measure different things." },
        { id: "b", text: "Trend down, momentum up", explain: "The reverse of what the figures say." },
        { id: "c", text: "Low volatility", explain: "Not described here." },
        { id: "d", text: "A contradiction: one figure must be wrong", explain: "Both can be true at once." },
      ],
      correct: "a",
    },
  },
  "cr-volume": {
    misconception: "It is easy to compare intraday volume with a full day's average and conclude that early trading is quiet, or that the open is unusually busy.",
    altExplanation: "Activity has a daily rhythm: busy at the open and close, quieter at midday. Compare a bar's volume with the same time of day on previous days, not with the whole-day average, before calling it high or low.",
    altExample: "By 10:00 a share usually trades 25% of its daily volume. Today it has traded 30%: slightly busy, not the 'tiny' figure that comparing with the whole day would suggest.",
    practice: {
      kind: "true-false",
      statement: "One exchange's crypto volume may differ a lot from the market's total activity in that coin.",
      answer: true,
      explain: "True. Trading is spread across many exchanges, and some report volume that is not genuine.",
    },
  },
  "cr-scale": {
    misconception: "People often add percentages over time, expecting +50% then −50% to return to the start. Percentages compound, so the result is a loss.",
    altExplanation: "Turn every percentage into a growth factor: +50% is ×1.5, −50% is ×0.5. Multiply the factors to combine moves: 1.5 × 0.5 = 0.75, a 25% loss. Log returns are the other way round: they can be added, because ln(1.5) + ln(0.5) = ln(0.75).",
    altExample: "A fund rises 10% one year and falls 10% the next: 1.10 × 0.90 = 0.99, a 1% loss, not zero.",
    practice: {
      kind: "single",
      prompt: "A price rises 10% and then falls 10%. Where does it end, relative to the start?",
      options: [
        { id: "a", text: "Back where it started", explain: "The 10% fall is on a larger base." },
        { id: "b", text: "1% higher", explain: "Check: 1.10 × 0.90." },
        { id: "c", text: "1% lower", explain: "Right. 1.10 × 0.90 = 0.99." },
        { id: "d", text: "10% lower", explain: "Too large: the loss is 1%." },
      ],
      correct: "c",
    },
  },
  "cr-levels": {
    misconception: "A common reaction to a broken level is to redraw it so that the analysis still looks right. That makes the analysis impossible to prove wrong, and useless.",
    altExplanation: "Record levels and their invalidation before price arrives, with a date. When a level breaks by your rule, the reading was wrong; note it and move on. A record that is never wrong is a record that has been edited.",
    altExample: "A trader's notes say 'support 48–49, wrong below 47.5'. Price closes at 47.0. The honest note is 'invalidated', not a new line at 46.8.",
    practice: {
      kind: "true-false",
      statement: "If price breaks your support zone, the honest response is to redraw the zone lower so it still fits.",
      answer: false,
      explain: "False. Redrawing after the break hides the fact that the reading was wrong.",
    },
  },
  "cr-gap-stops": {
    misconception: "Some believe a stop placed further away is safer through earnings. A wider stop does not stop a gap; it only changes where the order would trigger, and can enlarge the loss.",
    altExplanation: "Gap risk is about whether the market trades through your stop at all. Before a known event, the main tools are position size, not holding through the event, or instruments that cap losses (such as guaranteed stops, which usually cost extra, or options). Moving the stop is not one of them.",
    altExample: "A share that has gapped 10% after past results: with a 3% stop, a 10% gap gives roughly a 10% loss; with a 6% stop, still roughly 10%. Only a smaller position makes the gap affordable.",
    practice: {
      kind: "single",
      prompt: "Which action best limits the damage from a possible earnings gap?",
      options: [
        { id: "a", text: "Moving the stop much further away", explain: "A gap can still go past it." },
        { id: "b", text: "Reducing the position size before the report", explain: "Right. Size decides how much a gap costs." },
        { id: "c", text: "Adding to the position so the average price improves", explain: "That increases the exposure." },
        { id: "d", text: "Relying on the gap filling afterwards", explain: "Gaps may not fill." },
      ],
      correct: "b",
    },
  },
  "cr-applied": {
    misconception: "A second trap in applied questions is picking the most confident-sounding answer. Sound readings are usually the ones that name their own limits: what would prove them wrong and what the chart cannot show.",
    altExplanation: "When choosing between readings, look for three things: does it describe what the data shows without inventing motives, does it state an invalidation, and does it mention a relevant risk the chart cannot show (news, events, missing data)? An answer with all three is usually the sound one.",
    altExample: "'This is a confirmed bottom' sounds strong. 'The fall has paused at the prior low; a close below 41 would undo that; results are due Thursday' is less exciting and far more useful.",
    practice: {
      kind: "scenario",
      situation: "On an illustrative weekly chart, a share fell 30% in three months, then formed two small candles at a prior support zone. A commentator calls it 'a confirmed bottom'.",
      question: "What is the soundest response?",
      options: [
        { id: "a", text: "Agree and buy, since the bottom is confirmed", explain: "Two small candles confirm nothing.", process: "unsound" },
        { id: "b", text: "Note the pause at support, set what would prove it wrong (a close below the zone) and check for coming news", explain: "Sound: data, invalidation, event risk.", process: "sound" },
        { id: "c", text: "Assume it will fall another 30% because it fell 30%", explain: "Past moves do not oblige repeats.", process: "unsound" },
        { id: "d", text: "Wait for a better-known pattern to appear first, because 'confirmed bottom' calls are usually made too early in a fall", explain: "It avoids overconfidence but adds nothing useful.", process: "partial" },
      ],
    },
  },
};

export const CHART_READING_ASSESSMENT: TrackAssessment = {
  ...BASE,
  concepts: BASE.concepts.map((c) => ({ ...c, moreRemediation: MORE_REMEDIATION[c.id] ? [MORE_REMEDIATION[c.id]] : [] })),
  questions: [...BASE.questions, ...MORE_QUESTIONS],
};
