import type { Lesson } from "../types";

/*
  Chart Reading (track 6), lessons 1–4.
  Every chart in this track is drawn from SIMULATED prices made by a seeded
  random generator (lib/academy/charts.ts) and is labelled "Simulated".
  Real events are described only qualitatively. Research summaries were
  checked against the sources linked in each item. Nothing here is advice.
*/

const T = "chart-reading";

export const CR1_WHAT_IS_A_CHART: Lesson = {
  id: "cr-what-is-a-chart",
  trackId: T,
  order: 1,
  format: "full",
  title: "What is a financial chart?",
  summary: "Where the prices on a chart come from, what a chart shows, and everything it leaves out.",
  minutes: 22,
  objectives: [
    "Explain what one price on a chart represents: an agreed trade between a buyer and a seller.",
    "Tell apart the bid, the ask and the last traded price, and say which one a chart usually plots.",
    "Describe price discovery: how a stream of orders and trades produces a price.",
    "List what a chart shows and, just as important, what it does not show.",
    "Separate market data (what traded) from interpretation (what someone thinks it means), and price from value.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Almost every trading decision you will see online starts with a chart. People draw lines on it, name shapes on it and argue about it. Before any of that, you need to know what the chart actually is: a record of past trades, drawn in a particular way. Everything else is somebody's reading of that record." },
        { kind: "p", text: "Beginners often treat a chart as if it were the market itself, or as if it predicted the future. It is neither. Knowing exactly what it records, and what it leaves out, protects you from most of the confident nonsense you will meet later." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "A chart from absolute zero",
      blocks: [
        { kind: "p", text: "A market is a place where people send [[order|orders]] to buy and sell. Buyers say the most they will pay: that is the [[bid]]. Sellers say the least they will accept: that is the [[ask]]. The gap between them is the [[spread]]. While the bid stays below the ask, nothing trades; orders simply wait in the [[order-book|order book]]." },
        { kind: "p", text: "A trade happens when someone accepts the other side's price: a buyer pays the ask, or a seller accepts the bid. The exchange then publishes a [[trade-print|trade print]]: the time, the price and the size. The most recent one is the [[last-traded-price|last traded price]], and that is the number most charts plot." },
        { kind: "visual", visual: "bid-ask-spread", caption: "Buyers' best price (the bid) sits below sellers' best price (the ask). A trade prints when one side accepts the other's price; the gap between them is the spread." },
        { kind: "p", text: "A [[price-chart|price chart]] lines those prints up over time. The simplest chart joins up one price per period; others summarise each period with four prices (open, high, low, close). Everything you will learn in this track is a different way of drawing, summarising or reading that same stream of trades." },
        { kind: "list", items: [
          "Historical price: every price on the chart is in the past. Even the newest bar is a summary of what has already happened.",
          "Why prices change: a new trade prints at a different price when buyers become willing to pay more, or sellers willing to accept less, often because of new information or simply a large order arriving.",
          "[[price-discovery|Price discovery]]: the continual process by which orders and trades find a price at which buying and selling balance for now.",
        ] },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Watch a chart being built",
      blocks: [
        { kind: "p", text: "Below, simulated trades print one at a time. Each trade happens at the bid or at the ask. Watch the newest bar: its open is its first trade, its high and low move as trades print, and its close is just the latest trade until its time is up." },
        { kind: "interactive", widget: "cr-trade-tape", title: "Trades print, the chart builds", caption: "Simulated trades from a seeded random model, not real market data. A real busy market can print thousands of trades a second across several venues." },
        { kind: "callout", tone: "info", title: "Bid, ask and last", text: "Notice that the last price jumps between the bid and the ask depending on who crossed the spread, even when nothing about the market has changed. On a chart of last prices this looks like movement; it is partly just the spread.", link: { lessonId: "what-is-a-market", label: "Revisit what a market is" } },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "A real-world example, described",
      blocks: [
        { kind: "p", text: "When a company publishes its [[earnings]] after the market closes, the chart for that evening shows little or nothing: the main market is shut. The next morning, the first trade may be far from the previous close. The chart shows the jump, but not the reasons: the report, the analyst calls, the orders that were waiting overnight. Two people can look at the same jump and draw opposite conclusions, because the chart records the outcome of the reaction, not its cause." },
        { kind: "p", text: "The same applies to a quiet day. A flat line does not mean nobody cared. It can mean buyers and sellers were well matched, or that the market was closed, or that trading was thin and few trades printed at all." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: what a chart contains, and what it omits",
      blocks: [
        { kind: "concept-card", card: {
          name: "Price discovery",
          what: "The process by which a market arrives at a price, trade by trade, as buyers and sellers react to orders and information.",
          whyItExists: "No one announces the 'right' price of an asset. A price only exists when someone actually trades at it.",
          problemSolved: "It turns many different opinions and needs into one observable number at which the last trade happened.",
          mechanics: "Orders wait at the bid and ask. When a buyer accepts the ask (or a seller the bid), a trade prints. If more buyers than sellers are willing to cross, the ask levels are used up and the price moves up, and the reverse.",
          math: "Mid price = (bid + ask) ÷ 2. Spread = ask − bid. A trade at the ask prints spread ÷ 2 above the mid; at the bid, spread ÷ 2 below.",
          howTradersUseIt: "Traders watch where trades print relative to the bid and ask, and how fast the price moves when news arrives, to judge how liquid and how informed the market is.",
          whenUseful: "When judging whether a price move reflects real interest or just a few small trades in a thin market.",
          whenItFails: "In very thin or halted markets prices can be stale, jump, or be set by a handful of trades. On fragmented markets, one venue's price may differ briefly from another's.",
          limitations: "A chart shows the results of price discovery (trades), not the orders that did not trade, the intentions behind them, or orders on other venues.",
          misconceptions: "That a price is 'fair' because it traded. It is only the price at which two parties agreed at that moment.",
          realExample: "Before a market opens, many exchanges run an auction that collects orders and sets one opening price where the most volume can trade.",
          exercise: "In the trade-tape illustration, count how many of the last ten prints were at the ask and how many at the bid.",
          practicalTest: "Explain to someone why a last price can change while the bid and ask stay exactly the same.",
        } },
        { kind: "deeper", title: "What a chart shows, and price versus value", blocks: [
          { kind: "p", text: "What a chart displays: times, prices of trades (or summaries of them), and often [[volume]]. What it usually leaves out: the waiting orders in the book; who traded and why; trades on other venues; news; and of course anything about the future. Some data feeds also exclude trades from outside regular hours, so two charts of the same asset can differ." },
          { kind: "p", text: "Price versus value: price is what was last paid. [[fundamental-value|Value]] is what someone believes an asset is worth, from cash flows, use or scarcity. They can differ for long periods, and a chart shows only the first. Market data versus interpretation: 'a trade printed at 50.02' is data; 'buyers are in control' is an interpretation, which may or may not be right." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Market microstructure", view: "Looks beneath the chart: the order book, the spread, where trades print and how quickly liquidity returns after a large trade." },
          { name: "Technical analysis", view: "Treats the chart as a summary of how participants have behaved and looks for recurring behaviour, while (in its careful forms) testing whether it repeats often enough to matter." },
          { name: "Fundamental analysis", view: "Uses the chart mainly to see how the market has priced information so far, and compares price with an estimate of value." },
          { name: "Data quality first", view: "Quantitative teams check the data source before anything else: which venues, which hours, how corporate actions and errors are handled." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Treating the last price as the price you can trade at.", why: "You buy at the ask and sell at the bid; the last price may be either, or stale.", instead: "Check the current bid and ask before judging what a trade would cost." },
          { mistake: "Reading a chart as a forecast.", why: "Every bar is history. Patterns in the past do not oblige the future.", instead: "Treat what you see as evidence about the past, to be weighed with other evidence." },
          { mistake: "Confusing data with interpretation.", why: "Phrases like 'sellers are exhausted' sound like facts but are guesses about intentions.", instead: "Say what the chart shows first (prices, times, volume), then label your interpretation as one." },
          { mistake: "Assuming every chart of an asset is identical.", why: "Data sources differ in venues, hours and adjustments.", instead: "Note the data source and session before comparing charts." },
        ] },
      ],
    },
    {
      id: "summary",
      part: "summary",
      heading: "Summary",
      blocks: [
        { kind: "summary",
          keyConcepts: [
            "A chart is a drawing of past trades, usually of the last traded price.",
            "Buyers wait at the bid, sellers at the ask; a trade prints when one side crosses the spread.",
            "Price discovery is the ongoing process that produces those prices.",
            "A chart omits waiting orders, motives, other venues, news and the future.",
            "Price is what was paid; value is an estimate. Data is what printed; interpretation is a reading of it.",
          ],
          equations: [
            { label: "Spread", formula: "spread = ask − bid" },
            { label: "Mid price", formula: "mid = (bid + ask) ÷ 2" },
          ],
          implications: [
            "Before reading any chart, ask: whose data, which hours, which price (last, bid, ask or mid)?",
            "Keep facts and interpretations in separate sentences in your notes.",
          ],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Open any free chart of a large share or index. Find where it says which exchange or data source it uses, and whether it includes extended hours.",
          "Write three facts the chart shows and three things it cannot show about the last day.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "cr-what-is-a-chart-ex",
    title: "Data or interpretation?",
    prompt: "Sort each statement: is it market data the chart records, or an interpretation of it?",
    categories: [
      { id: "data", label: "Market data" },
      { id: "interp", label: "Interpretation" },
    ],
    items: [
      { id: "a", text: "The last trade printed at 50.02 for 300 shares.", category: "data", explain: "A recorded trade: time, price and size." },
      { id: "b", text: "Buyers are in control of this market.", category: "interp", explain: "Every share bought was also sold. 'In control' is a reading of the prices, not a recorded fact." },
      { id: "c", text: "Today's high so far is 51.10.", category: "data", explain: "The highest traded price so far is a recorded fact (for this data source)." },
      { id: "d", text: "This price is too cheap for such a good company.", category: "interp", explain: "That compares price with an estimate of value, which is an opinion." },
      { id: "e", text: "Volume in the last hour was 1.2 million shares.", category: "data", explain: "Counted traded volume, though it depends on which venues the feed includes." },
      { id: "f", text: "The drop means big funds are selling.", category: "interp", explain: "A guess about who traded and why. The chart does not show identities." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "Most price charts plot which price by default?",
      options: [
        { id: "a", text: "The bid, the price buyers are offering", explain: "Some charts can plot bids, but the default is usually trades." },
        { id: "b", text: "The last traded price of each trade or period", explain: "Right. Charts are usually built from trade prints." },
        { id: "c", text: "An analyst's estimate of fair value for the asset", explain: "A chart records market prices, not estimates of value." },
        { id: "d", text: "The ask, the price sellers want", explain: "Not by default; the last traded price is the usual input." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "The bid is 20.00 and the ask is 20.04. A buyer sends a market order for a small amount. Where does it most likely trade?",
      options: [
        { id: "a", text: "At 20.00", explain: "That is where buyers wait; a market buy takes the sellers' price." },
        { id: "b", text: "At 20.02, the mid price", explain: "The mid is a reference point, not a price on offer." },
        { id: "c", text: "At 20.04", explain: "Right. A market buy accepts the best ask." },
        { id: "d", text: "Wherever the last trade printed, whatever the current quotes", explain: "The last trade is history; the order meets the current ask." },
      ],
      correct: "c",
    },
    {
      id: "q3",
      prompt: "Which of these can a normal price chart NOT show you?",
      options: [
        { id: "a", text: "Why the people who traded chose to trade", explain: "Right. Motives and identities are not in the data." },
        { id: "b", text: "The highest price that traded in each period on the chart", explain: "The high is part of the OHLC data." },
        { id: "c", text: "How much traded in a period", explain: "Volume is often shown under the chart." },
        { id: "d", text: "When the trades happened", explain: "Time is the chart's horizontal axis." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "What is the best description of price discovery?",
      options: [
        { id: "a", text: "The exchange deciding each morning what every listed asset should be worth today", explain: "Exchanges run the rules and auctions; they do not decide value." },
        { id: "b", text: "Finding a cheap asset before others notice it", explain: "That is a trading aim, not what the term means." },
        { id: "c", text: "Analysts publishing their target prices for a share", explain: "Targets are opinions; discovery happens through trading." },
        { id: "d", text: "Orders and trades continually finding a price that balances buying and selling", explain: "Right. It is an ongoing process, trade by trade." },
      ],
      correct: "d",
    },
    {
      id: "q5",
      prompt: "A share's chart has been flat all afternoon. What can you safely conclude?",
      options: [
        { id: "a", text: "That nobody was interested in trading the share that afternoon", explain: "Flat can also mean buyers and sellers were well matched, with plenty of trading." },
        { id: "b", text: "Only that the traded price did not change much in that data", explain: "Right. Anything more needs other evidence, such as volume or the book." },
        { id: "c", text: "A big move is guaranteed to come next", explain: "Nothing is guaranteed; quiet periods can stay quiet." },
        { id: "d", text: "Its value has stayed exactly the same", explain: "Price is not value, and estimates of value are not on the chart." },
      ],
      correct: "b",
    },
  ],
  practical: {
    title: "Read a chart for what it is",
    instructions: "Use any free charting site or app. You are only observing; do not trade.",
    steps: [
      "Choose one liquid share or index and open a one-day chart with one-minute bars.",
      "Find the data source and the session it covers (regular hours only, or extended hours too).",
      "Write down the last price, and if your app shows them, the current bid and ask. Work out the spread and the mid.",
      "Write three sentences of pure data about the day, then one sentence of interpretation, clearly labelled.",
    ],
    reflectionPrompt: "Which of your sentences sounded like facts but were really interpretations?",
  },
  glossary: ["trade-print", "last-traded-price", "price-chart", "price-discovery", "fundamental-value"],
  next: "cr-chart-types",
};

export const CR2_CHART_TYPES: Lesson = {
  id: "cr-chart-types",
  trackId: T,
  order: 2,
  format: "full",
  title: "Chart types",
  summary: "Line, bar, candlestick, Heikin-Ashi, Renko, point and figure, tick, volume and range charts: what each keeps and what each throws away.",
  minutes: 28,
  objectives: [
    "Describe nine chart types and how each is built from the same trades.",
    "For each type, say what it preserves, what it transforms and what it hides or removes.",
    "Explain why Heikin-Ashi candles do not show the real open or close.",
    "Explain how removing time (Renko, point and figure) or changing the clock (tick, volume, range bars) changes the picture.",
    "Choose a chart type for a purpose and state its costs.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "The same trades can be drawn in very different ways, and each way makes some things easy to see while hiding others. A smooth-looking trend on one chart can look choppy on another, with no change in the underlying trades. If you do not know what your chart type has thrown away, you can mistake a drawing choice for a market fact." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Nine ways to draw the same trades",
      blocks: [
        { kind: "list", items: [
          "[[line-chart|Line chart]]: one dot per period, usually the close, joined up. Clean, but it hides the high, the low and the open.",
          "[[ohlc-bar|OHLC bar]]: a vertical line from the low to the high, with a tick on the left for the open and on the right for the close.",
          "[[candlestick]]: the same four prices, with a thick body between the open and the close, coloured by direction, and thin wicks to the high and low.",
          "[[heikin-ashi|Heikin-Ashi]]: candles built from averages of the real prices, which smooth the picture. The values are not real trades.",
          "[[renko]]: equal-sized bricks. A new brick appears only after price moves a fixed amount, the box size. Time is removed.",
          "[[point-and-figure|Point and figure]]: columns of X (rising) and O (falling), one symbol per box, with a new column only after a reversal of several boxes. Time is removed.",
          "[[tick-chart|Tick chart]]: each bar holds the same number of trades instead of the same amount of time.",
          "Volume chart (volume bars): each bar holds the same traded volume.",
          "[[range-bar|Range bars]]: each bar covers the same price range; a bar closes when its range is used up.",
        ] },
        { kind: "illustration", illustration: "ohlc-to-candle", caption: "An OHLC bar and a candle carry the same four prices. The bar marks the open and close with small ticks; the candle fills the space between them as a body." },
        { kind: "callout", tone: "key", title: "Key idea", text: "Line, OHLC and candlestick charts **keep the clock**: one bar per minute, hour or day. The others either average the prices or replace the clock with something else." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Compare them on one series",
      blocks: [
        { kind: "p", text: "The illustration builds every chart type from the same simulated trades. Keep the reference candles on the left in view and change the type and its setting on the right." },
        { kind: "interactive", widget: "cr-chart-types", title: "One series, nine chart types", caption: "All charts are built from the same simulated trades. Box sizes and bar sizes are settings: change them and the picture changes while the trades do not." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "A real-world example, described",
      blocks: [
        { kind: "p", text: "Charting platforms commonly offer Heikin-Ashi candles, and people share screenshots of them showing long runs of same-coloured candles. Those runs are partly the smoothing at work: an average changes direction more slowly than the price itself. If someone backtests a rule on Heikin-Ashi 'closes' as if they were tradable prices, the results can look better than any real fill could have been. The same care applies to Renko: a brick appears only once the box is complete, which a test must respect." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: transformed charts",
      blocks: [
        { kind: "concept-card", card: {
          name: "Heikin-Ashi candles",
          what: "Candles whose open, high, low and close are averages computed from real candles, used to smooth the picture of direction.",
          whyItExists: "Ordinary candles flip colour often in noisy markets; averaging reduces that flicker.",
          problemSolved: "It makes sustained direction easier to see at a glance.",
          mechanics: "Each HA close averages the real bar's four prices. Each HA open is the midpoint of the previous HA candle, so every candle carries memory of the ones before. The HA high and low are widened to include the HA open and close.",
          math: "HA close = (O + H + L + C) ÷ 4. HA open = (previous HA open + previous HA close) ÷ 2. HA high = max(H, HA open, HA close). HA low = min(L, HA open, HA close).",
          howTradersUseIt: "Some use it as a visual filter for direction, checking real candles before acting.",
          whenUseful: "For a quick view of whether moves have been mostly one way.",
          whenItFails: "Near turning points it lags, and in fast moves the HA close can be far from the last real price.",
          limitations: "Its open and close are not prices that traded. Gaps are smoothed away. It cannot be used to work out fills, stops or profit.",
          misconceptions: "That the HA close is 'the close'. It is an average of four prices.",
          realExample: "A real candle opens at 100 and closes at 98 after a range of 97–101. Its HA close is 99, and its HA open depends on the earlier candles: possibly a 'green' HA candle on a falling bar.",
          exercise: "In the illustration, choose Heikin-Ashi and compare the last HA close with the last real trade.",
          practicalTest: "Explain why a stop placed at an HA low might never correspond to a real traded price.",
        } },
        { kind: "deeper", title: "Removing time and changing the clock", blocks: [
          { kind: "p", text: "Removing time: Renko and point and figure ignore how long a move took. Quiet periods vanish, and a move of exactly one box looks the same whether it took a minute or a month. Both depend heavily on the box size (and, for point and figure, on the reversal size); change those settings and the 'patterns' change." },
          { kind: "p", text: "Changing the clock: tick, volume and range bars sample the market by activity instead of by time. Busy periods get many bars and quiet ones few, which some traders find more even. The cost is that you can no longer read time from the chart: one bar may last seconds or hours." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Time-based OHLC by default", view: "Many analysts keep candlesticks or OHLC bars as the primary view because every value is a real traded price and time is preserved." },
          { name: "Activity-based bars", view: "Some short-term traders prefer tick or volume bars, arguing that markets move in trades, not minutes. Some quantitative researchers also study sampling by activity rather than by time." },
          { name: "Noise filters", view: "Point-and-figure and Renko users accept losing time and detail in exchange for a cleaner view of larger moves, and state their box size openly." },
          { name: "Verification", view: "Whatever they view, careful traders check decisions and tests against real traded prices, never against averaged or reconstructed values." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Treating Heikin-Ashi values as real prices.", why: "They are averages; real fills happen at real prices.", instead: "Use real candles for entries, stops and results." },
          { mistake: "Ignoring the box size on Renko or point-and-figure charts.", why: "A different box size gives a different chart and different signals.", instead: "Write down the box size and check whether your reading survives a different one." },
          { mistake: "Reading time from tick, volume or range bars.", why: "Bars are not equal in time.", instead: "Check the timestamps when time matters (news, session opens)." },
          { mistake: "Choosing the chart type that shows what you hoped to see.", why: "A smoother chart makes trends look cleaner without changing the trades.", instead: "Pick the chart type for your purpose before you look at the asset." },
        ] },
      ],
    },
    {
      id: "summary",
      part: "summary",
      heading: "Summary",
      blocks: [
        { kind: "summary",
          keyConcepts: [
            "Line, OHLC and candlestick charts keep the clock and use real traded prices.",
            "Heikin-Ashi averages prices; its open and close are not trades.",
            "Renko and point and figure remove time and small moves, and depend on box size.",
            "Tick, volume and range bars replace the clock with activity.",
          ],
          equations: [
            { label: "Heikin-Ashi close", formula: "HA close = (O + H + L + C) ÷ 4" },
            { label: "Heikin-Ashi open", formula: "HA open = (prev HA open + prev HA close) ÷ 2" },
            { label: "Renko", formula: "new brick when |price − last brick edge| ≥ box (two boxes to reverse)" },
          ],
          implications: [
            "State the chart type and its settings whenever you describe a chart.",
            "Base any calculation of cost or risk on real traded prices.",
          ],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "On a free charting site, view the same asset and period as candles, then as Heikin-Ashi. Note one place where they disagree about direction.",
          "If your site offers Renko, try two box sizes and describe how the picture changes.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "match",
    id: "cr-chart-types-ex",
    title: "What does each chart throw away?",
    prompt: "Match each chart type with what it hides or removes.",
    pairs: [
      { id: "line", left: "Line chart of closes", right: "The open, high and low of each period" },
      { id: "ha", left: "Heikin-Ashi", right: "The real open and close (they are replaced by averages)" },
      { id: "renko", left: "Renko", right: "Time, and every move smaller than one box" },
      { id: "tick", left: "Tick chart", right: "Equal clock time per bar" },
      { id: "candle", left: "Candlestick", right: "The order of trades inside each period" },
    ],
    explanation: "Every chart type is a summary. Line charts keep only one price per period; Heikin-Ashi averages; Renko drops time; tick charts drop the fixed clock; even candles cannot tell you whether the high or the low came first.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "A Heikin-Ashi candle 'closes' at 99.20. What is that number?",
      options: [
        { id: "a", text: "The last price traded in that period", explain: "No: the HA close is an average of the real open, high, low and close." },
        { id: "b", text: "The average of that period's open, high, low and close", explain: "Right. HA close = (O + H + L + C) ÷ 4." },
        { id: "c", text: "The midpoint of the bid and the ask at the close", explain: "That would be a mid price, not the HA formula." },
        { id: "d", text: "The price at which a stop at that level would have filled", explain: "Fills happen at real prices, which HA does not show." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "On a Renko chart with a box size of 1.00, the price wanders between 100.20 and 100.80 for three hours. What appears?",
      options: [
        { id: "a", text: "Many small bricks, one for each wiggle", explain: "Bricks only print after a full one-box move." },
        { id: "b", text: "Three bricks, one per hour", explain: "Renko ignores time completely." },
        { id: "c", text: "One brick showing the average price", explain: "Renko bricks are not averages." },
        { id: "d", text: "Nothing at all", explain: "Right. No move reached a full box, so no brick prints." },
      ],
      correct: "d",
    },
    {
      id: "q3",
      prompt: "What does an OHLC bar show that a line chart of closes does not?",
      options: [
        { id: "a", text: "The open, the high and the low", explain: "Right. A line of closes keeps only one price per period." },
        { id: "b", text: "The reasons the price moved", explain: "No chart shows motives." },
        { id: "c", text: "Which side was in control", explain: "That is an interpretation, not data either chart holds." },
        { id: "d", text: "The future direction of the price", explain: "Neither chart shows the future." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "Why might two traders with different box sizes see different point-and-figure 'patterns' in the same market?",
      options: [
        { id: "a", text: "Because they must be using data from two different exchanges or feeds", explain: "Possible, but the box size alone is enough to change the chart." },
        { id: "b", text: "Because point-and-figure charts are random", explain: "They are deterministic given the prices and the settings." },
        { id: "c", text: "Because the box and reversal sizes decide which moves are drawn at all", explain: "Right. Settings decide what counts as a move." },
        { id: "d", text: "Because one of them must have made a drawing error", explain: "Both can be correct for their settings." },
      ],
      correct: "c",
    },
    {
      id: "q5",
      prompt: "A volume-bar chart shows ten bars in the first half hour of the day and two bars in the next three hours. What does that tell you?",
      options: [
        { id: "a", text: "The price moved further in the first half hour than in the next three hours", explain: "Volume bars measure traded amount, not price movement." },
        { id: "b", text: "Trading was much busier at the start than later", explain: "Right. Each bar holds the same volume, so more bars means more trading." },
        { id: "c", text: "The chart has a data error in the afternoon", explain: "Fewer bars in quiet periods is how volume bars work." },
        { id: "d", text: "The market closed after half an hour", explain: "It may have stayed open with little trading." },
      ],
      correct: "b",
    },
  ],
  practical: {
    title: "Two views, one market",
    instructions: "Use a free charting site. Observe only.",
    steps: [
      "Open a daily candlestick chart of an index for the last six months.",
      "Switch to a line chart. Note one large daily range that the line chart hides.",
      "Switch to Heikin-Ashi if available. Find a day where the HA colour differs from the real candle's colour.",
      "Write one sentence on which view you would use for which purpose, and why.",
    ],
    reflectionPrompt: "Which chart type made the market look most 'trendy', and what had it removed to do that?",
  },
  glossary: ["line-chart", "ohlc-bar", "candlestick", "heikin-ashi", "renko", "point-and-figure", "tick-chart", "range-bar"],
  next: "cr-candlesticks",
};

export const CR3_CANDLESTICKS: Lesson = {
  id: "cr-candlesticks",
  trackId: T,
  order: 3,
  format: "full",
  title: "Candlesticks from absolute zero",
  summary: "Open, high, low and close; bodies and wicks; bullish, bearish and doji candles; and how to measure a candle instead of eyeballing it.",
  minutes: 22,
  objectives: [
    "Name the four prices in a candle and draw a candle from them.",
    "Identify the body, the upper wick and the lower wick, and compute each.",
    "Say whether a candle is bullish, bearish or a doji, and what that does and does not mean.",
    "Compute the range and the body-to-range ratio, and compare a candle's size with its neighbours.",
    "Check that a set of prices is a possible candle: high ≥ max(open, close) and low ≤ min(open, close).",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Candlesticks are the most common chart in trading apps. Most later material assumes you can read one instantly and measure it precisely. Measuring, rather than eyeballing, also protects you from seeing shapes that are not really there." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Four prices make a candle",
      blocks: [
        { kind: "list", items: [
          "Open: the first traded price of the period.",
          "High: the highest traded price of the period.",
          "Low: the lowest traded price of the period.",
          "Close: the last traded price of the period.",
        ] },
        { kind: "illustration", illustration: "candle-anatomy", caption: "The parts of a candle. The body runs from the open to the close; the wicks run out to the high and the low. In a bullish candle the open is at the bottom of the body, in a bearish candle at the top." },
        { kind: "p", text: "The [[candle-body|body]] is the box between the open and the close. The [[wick|wicks]] (also called shadows) are the thin lines from the body up to the high and down to the low." },
        { kind: "p", text: "A [[bullish]] candle closed **above** its open (often drawn green or hollow). A [[bearish]] candle closed **below** its open (often red or filled). Colours are a convention of your app, not a law." },
        { kind: "illustration", illustration: "candle-types", caption: "Bullish, bearish and doji side by side. Only the open and close decide which one a candle is; the wicks can be any length." },
        { kind: "defs", items: [
          { term: "[[doji|Doji]]", text: "Open and close almost equal, so the body is a thin line." },
          { term: "[[candle-range|Range]]", text: "**High − low**: the whole distance travelled." },
          { term: "[[body-to-range-ratio|Body-to-range ratio]]", text: "How much of that distance ended up as net movement." },
        ] },
        { kind: "callout", tone: "warn", title: "Bullish describes the past period only", text: "A green candle means the price closed above where it opened in that period. It does not mean the next period will rise, and it does not mean buyers outnumbered sellers: every trade has both." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Build a candle yourself",
      blocks: [
        { kind: "step-list", items: [
          { title: "Type four prices", text: "Enter an open, high, low and close." },
          { title: "Check it is possible", text: "The builder rejects impossible candles, for example a high below the close." },
          { title: "Read the measurements", text: "It measures the candle you made. Then try the challenges." },
        ] },
        { kind: "interactive", widget: "cr-candle-builder", title: "Candle builder", caption: "Prices are made up for practice. The shape names describe the candle only; whether a shape means anything is the subject of the next lesson." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "A real-world example, described",
      blocks: [
        { kind: "p", text: "Two daily candles of the same share can both be green while telling different stories." },
        { kind: "defs", items: [
          { term: "Candle one", text: "Opens near the low and closes near the high with small wicks: most of the day's travel ended as net gain." },
          { term: "Candle two", text: "Opens, falls a long way, and recovers to close just above the open: a long lower wick and a tiny body." },
        ] },
        { kind: "callout", tone: "key", title: "Key idea", text: "Both are 'bullish' by colour; their ranges and body-to-range ratios are very different. Comparing candles by these measures, and against recent candles, is more informative than colour alone." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: measuring candles",
      blocks: [
        { kind: "concept-card", card: {
          name: "Body-to-range ratio",
          what: "The size of the body divided by the full range of the candle, from 0 (a doji) to 1 (no wicks).",
          whyItExists: "Words like 'strong' or 'indecisive' candle are vague; a ratio makes them measurable.",
          problemSolved: "It lets you define shapes precisely and compare candles consistently, which any test of a rule needs.",
          mechanics: "Measure body = |close − open| and range = high − low, then divide. Pair it with wick sizes to describe where in the range the period ended.",
          math: "body ÷ range, where body = |C − O| and range = H − L. Upper wick = H − max(O, C). Lower wick = min(O, C) − L.",
          howTradersUseIt: "Some define a doji as a ratio under about 0.1 and a marubozu as over about 0.9. Thresholds are choices, not standards.",
          whenUseful: "When writing rules that a computer or another person must apply the same way you do.",
          whenItFails: "On very small ranges, a tick or two of noise swings the ratio wildly.",
          limitations: "It ignores the candle's size relative to its neighbours, volume and context.",
          misconceptions: "That a high ratio shows 'conviction'. It shows that the period ended far from where it started, nothing about intentions.",
          realExample: "O 100, H 104, L 98, C 103: body 3, range 6, ratio 0.5.",
          exercise: "In the builder, make a candle with a ratio of exactly 25%.",
          practicalTest: "Write a definition of 'long lower wick' that someone else could apply without asking you.",
        } },
        { kind: "p", text: "Relative size: a candle with a range of **2** is large if the last twenty candles averaged **0.5**, and small if they averaged **6**. Compare a candle's range with a recent average range (later lessons use the average true range for this) before calling it big or small." },
        { kind: "callout", tone: "warn", title: "Validity check", text: "Because the high is the highest trade and the low the lowest, any real candle must satisfy **high ≥ max(open, close)** and **low ≤ min(open, close)**. Data that breaks this rule has an error in it, which is worth knowing when you use free data." },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Discretionary chart readers", view: "Look at where the close sits within the range and how a candle compares with recent ones, always together with the surrounding structure." },
          { name: "Systematic traders", view: "Turn shapes into exact numeric definitions (ratios, wick multiples, thresholds) so that they can be tested on many examples." },
          { name: "Data engineers", view: "Check OHLC data for impossible bars, missing periods and session boundaries before anyone analyses it." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Judging a candle by colour alone.", why: "Two green candles can have very different shapes.", instead: "Look at the body, the wicks and the range, and compare with recent candles." },
          { mistake: "Reading 'bullish' as a forecast.", why: "It describes one finished period.", instead: "Treat it as one small piece of evidence." },
          { mistake: "Using vague definitions.", why: "You will see the shape when you want to and not otherwise.", instead: "Write numeric definitions." },
          { mistake: "Ignoring the period.", why: "A one-minute candle and a monthly candle with the same shape describe completely different things.", instead: "Always say which timeframe a candle is on." },
        ] },
      ],
    },
    {
      id: "summary",
      part: "summary",
      heading: "Summary",
      blocks: [
        { kind: "summary",
          keyConcepts: [
            "A candle is four prices: open, high, low and close.",
            "Body between open and close; wicks to the high and low.",
            "Bullish and bearish describe the finished period, not the future.",
            "Measure: body, range, wicks and body-to-range ratio; compare with recent candles.",
          ],
          equations: [
            { label: "Body", formula: "|C − O|" },
            { label: "Range", formula: "H − L" },
            { label: "Upper and lower wick", formula: "H − max(O, C); min(O, C) − L" },
            { label: "Validity", formula: "H ≥ max(O, C) and L ≤ min(O, C)" },
          ],
          implications: [
            "Write shape definitions as numbers before using them.",
            "Check free data for impossible candles.",
          ],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Copy the OHLC of five recent daily candles of any index into a notebook or spreadsheet and compute body, range, wicks and ratio for each.",
          "Which of the five had the largest range? Was it also the largest body?",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "cr-candlesticks-ex",
    title: "Measure a candle",
    prompt: "A candle has open 40.00, high 42.50, low 39.00 and close 41.40. What is its body-to-range ratio, in percent?",
    unit: "%",
    answer: 40,
    tolerance: 0.5,
    hint: "Body = |close − open|. Range = high − low. Divide, then multiply by 100.",
    solution: "Body = 41.40 − 40.00 = 1.40. Range = 42.50 − 39.00 = 3.50. 1.40 ÷ 3.50 = 0.40, so the ratio is 40%.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "Which set of prices is NOT a possible candle?",
      options: [
        { id: "a", text: "Open 10, high 12, low 9, close 11", explain: "Valid: the high is above both, the low below both." },
        { id: "b", text: "Open 10, high 10, low 8, close 9", explain: "Valid: the open can be the high." },
        { id: "c", text: "Open 10, high 11, low 9, close 11.5", explain: "Right. The close is above the high, which is impossible." },
        { id: "d", text: "Open 10, high 10, low 10, close 10", explain: "Valid, if dull: one price all period." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "A candle opens at 50, rises to 55, falls to 49 and closes at 50.1. What is it closest to?",
      options: [
        { id: "a", text: "A marubozu, because it moved a lot", explain: "A marubozu is almost all body; this is almost all wick." },
        { id: "b", text: "A doji, because open and close are almost equal", explain: "Right. Body 0.1 on a range of 6." },
        { id: "c", text: "A bearish candle, because it fell a long way from its high to close", explain: "It closed above its open, so it is (barely) bullish." },
        { id: "d", text: "An impossible candle, because of the wicks", explain: "The prices satisfy the validity rules." },
      ],
      correct: "b",
    },
    {
      id: "q3",
      prompt: "What is the upper wick of a candle with open 20, high 23, low 18, close 21?",
      options: [
        { id: "a", text: "3, the high minus the open", explain: "The upper wick starts at the top of the body, here the close." },
        { id: "b", text: "5, the whole range", explain: "That is the range." },
        { id: "c", text: "1, the body", explain: "The body is close − open = 1, but the question asks for the wick." },
        { id: "d", text: "2, the high minus the close", explain: "Right. H − max(O, C) = 23 − 21." },
      ],
      correct: "d",
    },
    {
      id: "q4",
      prompt: "A green (bullish) daily candle tells you that…",
      options: [
        { id: "a", text: "the price closed above where it opened that day", explain: "Right. That is all the colour says." },
        { id: "b", text: "more people bought than sold that day", explain: "Every share bought was sold; the counts are always equal." },
        { id: "c", text: "tomorrow is more likely to be an up day than a down day", explain: "One candle is not a forecast." },
        { id: "d", text: "the day ended at its high", explain: "Only if there is no upper wick." },
      ],
      correct: "a",
    },
    {
      id: "q5",
      prompt: "A candle has a range of 4. The last 20 candles averaged a range of 1. How should you describe it?",
      options: [
        { id: "a", text: "Ordinary, because a range of 4 is a small number in itself", explain: "Size only means something relative to what is normal for this market." },
        { id: "b", text: "Unusually large compared with recent candles", explain: "Right. Four times the recent average range." },
        { id: "c", text: "Bullish, because it is large", explain: "Size says nothing about direction." },
        { id: "d", text: "A data error, because it is too big", explain: "Large candles happen, for example on news." },
      ],
      correct: "b",
    },
  ],
  practical: {
    title: "A candle diary",
    instructions: "Use any free daily chart. Observe only.",
    steps: [
      "Pick one share or index and note the OHLC of the latest daily candle.",
      "Compute its body, wicks, range and body-to-range ratio.",
      "Compare its range with your estimate of the average of the last 10 candles.",
      "Describe the candle in one sentence that uses only measured facts.",
    ],
    reflectionPrompt: "Did measuring the candle change the impression you had from looking at it?",
  },
  glossary: ["candle-body", "wick", "bullish", "bearish", "doji", "candle-range", "body-to-range-ratio"],
  next: "cr-candle-patterns",
};

export const CR4_CANDLE_PATTERNS: Lesson = {
  id: "cr-candle-patterns",
  trackId: T,
  order: 4,
  format: "full",
  title: "Candlestick interpretation",
  summary: "What candles can and cannot tell you, sixteen named patterns described honestly, and what evidence a pattern would need before it counts.",
  minutes: 35,
  objectives: [
    "Explain what a single candle can and cannot say, and why it does not prove that buyers or sellers 'dominated'.",
    "Describe the formation, a possible interpretation, the context and a failure scenario for common candlestick patterns.",
    "Explain why the same shape gets different names (hammer and hanging man) depending on what came before.",
    "Explain why isolated patterns are unreliable, and what a base rate is.",
    "List the evidence needed before a pattern could be called statistically useful, and summarise what research has found.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Candlestick patterns are among the most widely taught ideas in retail trading, often with names that sound like predictions: 'morning star', 'three black crows'." },
        { kind: "p", text: "This lesson teaches the names so you can understand what people mean, and teaches the evidence so you are not misled by them." },
        { kind: "callout", tone: "key", title: "A pattern is a shape", text: "Whether a shape tells you anything useful about the future is an empirical question with mixed answers." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "What a candle can and cannot say",
      blocks: [
        { kind: "defs", items: [
          { term: "A candle records", text: "Where price started, its extremes and where it finished in one period." },
          { term: "It cannot tell you", text: "Who traded, why, how many orders were waiting, or what happens next." },
        ] },
        { kind: "illustration", illustration: "pattern-hammer", caption: "A long lower wick after a fall (faded candles are context). It shows only that price traded low and then traded back up before the period ended." },
        { kind: "callout", tone: "example", title: "Example: a long lower wick", text: "A long lower wick means price traded low and then traded back up before the period ended. People often read that as 'buyers stepped in', but every trade had a buyer and a seller; the wick shows only that later trades happened at higher prices." },
        { kind: "p", text: "Price, [[volume]], [[liquidity]] and context interact. The same shape on heavy volume after a long fall, on a liquid share, is a different event from the same shape on a handful of trades in a thin market, or on a day with major news." },
        { kind: "p", text: "Patterns are only ever a **small part** of the picture." },
        { kind: "callout", tone: "warn", title: "No pattern is a guaranteed signal", text: "Every pattern below fails often. The descriptions say what people commonly read into a pattern, not what it will do." },
      ],
    },
    {
      id: "patterns-single",
      heading: "Single-candle patterns",
      blocks: [
        { kind: "p", text: "Each card shows the shape (highlighted; faded candles are the context before it), then the formation, a possible reading and how it fails." },
        { kind: "cards", items: [
          { title: "[[hammer|Hammer]]", illustration: "pattern-hammer", rows: [
            { label: "Formation", text: "Small body near the top of the range, lower wick at least about **twice the body**, little or no upper wick, after a fall." },
            { label: "Possible reading", text: "Lower prices were tried and then left." },
            { label: "Context", text: "Matters only after a clear decline and near an area that has mattered before." },
            { label: "Failure", text: "The next candles keep falling and take out the hammer's low." },
          ] },
          { title: "Hanging man", illustration: "pattern-hanging-man", rows: [
            { label: "Formation", text: "The same shape as a hammer, but after a rise." },
            { label: "Possible reading", text: "A warning that lower prices were tried." },
            { label: "Failure", text: "Very common; the rise simply continues." },
          ] },
          { title: "Inverted hammer", illustration: "pattern-inverted-hammer", rows: [
            { label: "Formation", text: "Small body near the bottom, long upper wick, after a fall." },
            { label: "Possible reading", text: "Higher prices were tried." },
            { label: "Failure", text: "Price keeps falling." },
          ] },
          { title: "[[shooting-star|Shooting star]]", illustration: "pattern-shooting-star", rows: [
            { label: "Formation", text: "The inverted-hammer shape after a rise." },
            { label: "Possible reading", text: "Higher prices were tried and rejected by the close." },
            { label: "Failure", text: "The next candle breaks above the wick." },
          ] },
          { title: "Doji", illustration: "pattern-doji", rows: [
            { label: "Formation", text: "Open and close almost equal." },
            { label: "Possible reading", text: "The period ended about where it began." },
            { label: "Context", text: "Dojis are very common in quiet markets, where they mean little." },
            { label: "Failure", text: "No follow-through either way." },
          ] },
          { title: "[[marubozu|Marubozu]]", illustration: "pattern-marubozu", rows: [
            { label: "Formation", text: "Almost all body, tiny or no wicks." },
            { label: "Possible reading", text: "The period moved steadily one way." },
            { label: "Failure", text: "The next period reverses fully." },
          ] },
          { title: "[[pin-bar|Pin bar]]", illustration: "pattern-pin-bar", rows: [
            { label: "What it is", text: "A trader's name for any candle with one very long wick and a small body at the other end; hammers and shooting stars are pin bars." },
            { label: "Failure", text: "As for those." },
          ] },
        ] },
      ],
    },
    {
      id: "patterns-multi",
      heading: "Two- and three-candle patterns",
      blocks: [
        { kind: "cards", items: [
          { title: "[[engulfing-pattern|Engulfing]]", illustration: "pattern-engulfing", rows: [
            { label: "Formation", text: "A candle whose body completely covers the previous candle's body, in the opposite colour (bullish engulfing: green covers red)." },
            { label: "Possible reading", text: "A change in short-term direction." },
            { label: "Failure", text: "Price returns through the engulfing candle within a few bars." },
          ] },
          { title: "[[harami|Harami]]", illustration: "pattern-harami", rows: [
            { label: "Formation", text: "A small body inside the previous candle's larger body, opposite colour." },
            { label: "Possible reading", text: "The move has paused." },
            { label: "Failure", text: "The earlier move resumes." },
          ] },
          { title: "[[inside-bar|Inside bar]]", illustration: "pattern-inside-bar", rows: [
            { label: "Formation", text: "The whole range (high and low) inside the previous candle's range." },
            { label: "Possible reading", text: "A pause; some traders watch for a break of the mother bar." },
            { label: "Failure", text: "A break one way that immediately reverses." },
          ] },
          { title: "[[outside-bar|Outside bar]]", illustration: "pattern-outside-bar", rows: [
            { label: "Formation", text: "A **higher high AND a lower low** than the previous candle." },
            { label: "Possible reading", text: "A wider-ranging period." },
            { label: "Failure", text: "Its 'direction' tells you little; it covered both sides." },
          ] },
          { title: "[[morning-star|Morning star]] and evening star", illustration: "pattern-morning-star", rows: [
            { label: "Formation", text: "A large candle in the direction of the move, a small-bodied candle, then a large candle the other way that closes past the middle of the first. (Drawn: the morning star; the evening star is its mirror image after a rise.)" },
            { label: "Possible reading", text: "A turn." },
            { label: "Failure", text: "The third candle is followed by a continuation of the original move." },
          ] },
          { title: "Three white soldiers and three black crows", illustration: "pattern-three-soldiers", rows: [
            { label: "Formation", text: "Three large candles in a row the same way, each opening inside the previous body and closing further on. (Drawn: three white soldiers; three black crows are the falling version.)" },
            { label: "Possible reading", text: "A persistent move." },
            { label: "Failure", text: "The move is already stretched and reverses; the pattern often appears after the move has happened." },
          ] },
        ] },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Find patterns in pure noise",
      blocks: [
        { kind: "p", text: "The lab below is a **simulated random walk**: each candle is built from random numbers, with no memory and no edge at all." },
        { kind: "step-list", items: [
          { text: "Choose a pattern and see how often it appears." },
          { text: "Compare what happened after it with what happened after every candle." },
          { text: "Press 'New random series' several times." },
        ] },
        { kind: "interactive", widget: "cr-pattern-lab", title: "Pattern lab: shapes in a random walk", caption: "Simulated random-walk prices. Pattern definitions follow common descriptions but exact thresholds vary between books and software, which also changes the counts." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "A real-world example, described",
      blocks: [
        { kind: "p", text: "Screenshots of a perfect hammer at the exact bottom of a decline are easy to find after the fact. What screenshots do not show is the many hammers in the same decline that were followed by more selling." },
        { kind: "callout", tone: "key", title: "This is selection", text: "You remember and share the hits. A fair test counts **every occurrence**, using a definition fixed in advance." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: evidence, base rates and data snooping",
      blocks: [
        { kind: "concept-card", card: {
          name: "Base rate and data snooping",
          what: "The base rate is how often an outcome happens anyway, without the pattern. Data snooping is finding something that worked in past data only because many things were tried.",
          whyItExists: "Without a base rate you cannot tell if a pattern adds anything; without guarding against snooping you will find 'patterns' in noise.",
          problemSolved: "It separates a pattern that adds information from one that merely coincided with what usually happens.",
          mechanics: "Count every occurrence of a pattern (fixed definition, fixed horizon). Compare the forward return with the forward return after all bars. Repeat on data not used to design the rule, include costs, and adjust for how many rules were tried.",
          math: "Edge = mean return after the pattern − mean return after all bars. With n cases, the uncertainty of a mean shrinks roughly with 1 ÷ √n, so a handful of cases tells you very little.",
          howTradersUseIt: "Careful traders treat a new pattern as a hypothesis and look for out-of-sample evidence before risking money on it.",
          whenUseful: "Every time someone claims a pattern 'works'.",
          whenItFails: "Markets change; a rule that held in one period or market may not hold in another.",
          limitations: "Even sound statistics on past data cannot guarantee future behaviour.",
          misconceptions: "That 'it worked 7 times out of 10' is strong evidence. If the market rose 6 times in 10 anyway, and only 10 cases were seen, it is barely evidence at all.",
          realExample: "In the pattern lab, a random walk produces hammers that are 'followed by gains' 60% of the time in one series and 40% in the next.",
          exercise: "In the lab, record the 'after pattern' and 'after any bar' figures for five different random series.",
          practicalTest: "Before believing a pattern claim, ask: how many cases, compared with what base rate, after costs, and on which data?",
        } },
        { kind: "p", text: "Evidence a pattern would need:" },
        { kind: "step-list", items: [
          { text: "A definition fixed in advance." },
          { text: "Every occurrence counted." },
          { text: "A comparison with the base rate." },
          { text: "Enough cases." },
          { text: "Transaction costs included." },
          { text: "Testing on data not used to build the rule (out-of-sample)." },
          { text: "A correction for the number of patterns and settings tried." },
        ] },
        { kind: "callout", tone: "info", title: "What research found", text: "Research on candlesticks has produced **mixed results**. Three studies are summarised below." },
        { kind: "research", research: {
          title: "Candlestick technical trading strategies: Can they create value for investors?",
          authors: "Ben R. Marshall, Martin R. Young and Lawrence C. Rose",
          year: 2006,
          venue: "Journal of Banking & Finance 30(8), 2303–2323",
          peerReviewed: true,
          question: "Do common candlestick signals predict returns for large US stocks?",
          methodology: "Tested 28 candlestick signals with a fixed holding period, using bootstrap methods to judge whether results beat chance.",
          data: "Daily prices of the stocks in the Dow Jones Industrial Average, 1992–2002.",
          findings: "The authors found no evidence that the candlestick signals tested predicted returns or added value for investors in that sample.",
          limitations: "One market and one period; specific definitions and holding periods; other markets have produced different results.",
          practicalMeaning: "Widely taught patterns did not add value in a large, liquid market when tested carefully. Treat pattern claims with caution.",
          status: "disputed",
          url: "https://ideas.repec.org/a/eee/jbfina/v30y2006i8p2303-2323.html",
          verified: true,
        } },
        { kind: "research", research: {
          title: "The profitability of candlestick charting in the Taiwan stock market",
          authors: "Tsung-Hsun Lu",
          year: 2014,
          venue: "Pacific-Basin Finance Journal 26, 65–78",
          peerReviewed: true,
          question: "Are candlestick patterns profitable in the Taiwan stock market?",
          methodology: "Classified patterns by the relative position of four price levels and tested them with bootstrap and out-of-sample methods, after transaction costs.",
          data: "Taiwan stocks, 1992–2009.",
          findings: "The study reported that four patterns were profitable after transaction costs in that market and period.",
          limitations: "One market; a different classification of patterns from the US study; results may not carry over to other markets or later years.",
          practicalMeaning: "Results differ by market and method. That is a reason to test for yourself, not a reason to trust any pattern.",
          status: "regime-sensitive",
          url: "https://ideas.repec.org/a/eee/pacfin/v26y2014icp65-78.html",
          verified: true,
        } },
        { kind: "research", research: {
          title: "Data-Snooping, Technical Trading Rule Performance, and the Bootstrap",
          authors: "Ryan Sullivan, Allan Timmermann and Halbert White",
          year: 1999,
          venue: "Journal of Finance 54(5), 1647–1691",
          peerReviewed: true,
          question: "Do technical trading rules still look profitable once you account for how many rules were searched?",
          methodology: "White's bootstrap 'Reality Check', applied across a universe of several thousand rules, with an out-of-sample period.",
          data: "About 100 years of daily Dow Jones Industrial Average data.",
          findings: "The best rule looked significant over the full sample even after the adjustment, but its superior performance was not repeated in the later out-of-sample period (1987–1996).",
          limitations: "Tests trading rules on one index, not candlestick patterns specifically; ignores some real-world frictions.",
          practicalMeaning: "Something that worked historically can stop working; testing on fresh data is essential.",
          status: "regime-sensitive",
          url: "https://econpapers.repec.org/RePEc:bla:jfinan:v:54:y:1999:i:5:p:1647-1691",
          verified: true,
        } },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Discretionary price-action traders", view: "Use candle shapes, if at all, only at places they already care about (prior levels, after extended moves) and with a defined invalidation point." },
          { name: "Systematic researchers", view: "Code exact definitions and test them across many markets with costs and out-of-sample data, and expect most to fail." },
          { name: "Fundamental investors", view: "Mostly ignore candle patterns and look at what information caused the move." },
          { name: "Risk managers", view: "Ask what happens when the pattern fails, because it will, and size positions so that a failure is affordable." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Trading a pattern in isolation.", why: "Out of context, most patterns are close to random.", instead: "Require context (structure, level, volume) and a planned exit if wrong." },
          { mistake: "Believing a candle shows who 'won'.", why: "Each trade has a buyer and a seller.", instead: "Describe what the price did; label any story about intentions as a guess." },
          { mistake: "Remembering only the hits.", why: "Selection makes patterns look better than they are.", instead: "Count every occurrence with a fixed definition." },
          { mistake: "Ignoring the base rate.", why: "In a rising market, most things are 'followed by a rise'.", instead: "Compare with what happened after all bars." },
        ] },
      ],
    },
    {
      id: "summary",
      part: "summary",
      heading: "Summary",
      blocks: [
        { kind: "summary",
          keyConcepts: [
            "A candle shows what price did in one period, not who dominated or what comes next.",
            "Patterns are named shapes; context changes their names and meanings.",
            "Every pattern fails often; isolated patterns are unreliable.",
            "Evidence needs fixed definitions, all occurrences, base rates, costs, out-of-sample tests and correction for many tries.",
            "Published research on candlesticks has found mixed results.",
          ],
          equations: [
            { label: "Edge over base rate", formula: "mean return after pattern − mean return after all bars" },
            { label: "Uncertainty of a mean", formula: "standard error ≈ standard deviation ÷ √n" },
          ],
          implications: [
            "Treat any pattern as a hypothesis to test, not a signal to obey.",
            "Plan what you will do when a pattern fails before you act on it.",
          ],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Write an exact numeric definition of a hammer (body ratio, wick multiples, what counts as 'after a fall').",
          "On a daily chart of any index, find every candle in the last 100 days that meets it, and note what happened 5 days later. Compare with the 5-day change after all 100 days.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "cr-candle-patterns-ex",
    title: "Name the shape in its context",
    prompt: "Each description gives a candle shape and what came before. Which name fits?",
    categories: [
      { id: "hammer", label: "Hammer" },
      { id: "hanging", label: "Hanging man" },
      { id: "star", label: "Shooting star" },
      { id: "inside", label: "Inside bar" },
    ],
    items: [
      { id: "a", text: "Small body at the top, lower wick three times the body, after ten days of falling prices.", category: "hammer", explain: "The hammer shape after a decline." },
      { id: "b", text: "Small body at the top, long lower wick, after a steady three-week rise.", category: "hanging", explain: "The same shape after a rise is called a hanging man." },
      { id: "c", text: "Small body at the bottom, long upper wick, after a strong rally.", category: "star", explain: "A long upper wick after a rise: a shooting star." },
      { id: "d", text: "A candle whose high and low are both within the previous candle's range.", category: "inside", explain: "The whole range inside the previous one." },
      { id: "e", text: "Long lower wick, tiny body near the high, following a sharp sell-off.", category: "hammer", explain: "Hammer shape, after a fall." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "A hammer and a hanging man have the same shape. What makes them different?",
      options: [
        { id: "a", text: "The colour of the body", explain: "Both can be either colour in most definitions." },
        { id: "b", text: "The volume on the day", explain: "Volume is context, but it is not what separates the names." },
        { id: "c", text: "Whether it appears after a fall or after a rise", explain: "Right. Hammer after a fall, hanging man after a rise." },
        { id: "d", text: "The length of the upper wick compared with the lower wick", explain: "Both have little or no upper wick." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "Someone says: \"This bullish engulfing pattern worked 7 of the last 10 times.\" What is the most important question to ask first?",
      options: [
        { id: "a", text: "Which colour were the candles drawn in?", explain: "Colour is a display setting." },
        { id: "b", text: "How often did price rise over the same horizon after ANY candle?", explain: "Right. Without the base rate, 7 out of 10 means little." },
        { id: "c", text: "Was the engulfing candle larger than the candles around it that week?", explain: "Useful detail, but the base rate comes first." },
        { id: "d", text: "Did a famous trader recommend it?", explain: "Authority is not evidence." },
      ],
      correct: "b",
    },
    {
      id: "q3",
      prompt: "In a simulated random walk, the pattern lab finds 14 hammers, followed by a rise 64% of the time. What does that show?",
      options: [
        { id: "a", text: "Hammers predict rises even in random data", explain: "Random data has no memory; the figure is chance." },
        { id: "b", text: "That 64% is the true long-run success rate of hammers in any market", explain: "With 14 cases, chance can easily produce that figure." },
        { id: "c", text: "That the simulation must be faulty", explain: "Shapes appear in noise by construction; that is expected." },
        { id: "d", text: "That small samples of patterns can look good by luck alone", explain: "Right. That is why you need many cases and fresh data." },
      ],
      correct: "d",
    },
    {
      id: "q4",
      prompt: "What did Marshall, Young and Rose (2006) report about candlestick signals for Dow Jones stocks in 1992–2002?",
      options: [
        { id: "a", text: "They found no evidence the signals tested predicted returns", explain: "Right, in that market and period." },
        { id: "b", text: "Most of the signals were reliably profitable even after trading costs", explain: "That is not what they reported." },
        { id: "c", text: "Bearish signals worked but bullish ones did not", explain: "They did not report that split." },
        { id: "d", text: "Candlesticks worked only on weekly charts", explain: "Not a finding of that study." },
      ],
      correct: "a",
    },
    {
      id: "q5",
      prompt: "A candle has a long lower wick. Which statement is a fact rather than an interpretation?",
      options: [
        { id: "a", text: "Buyers overwhelmed sellers at the lows", explain: "That is a story about intentions; every trade has both." },
        { id: "b", text: "Big institutions defended this price", explain: "The chart does not show identities." },
        { id: "c", text: "Price traded well below the body and later traded higher", explain: "Right. That is what the wick records." },
        { id: "d", text: "The bottom is now in", explain: "That is a forecast." },
      ],
      correct: "c",
    },
    {
      id: "q6",
      prompt: "Which test design gives the most honest evidence about a pattern?",
      options: [
        { id: "a", text: "Looking at a few clear examples on a chart", explain: "Selection bias: clear examples are the memorable hits." },
        { id: "b", text: "Fixed definition, all occurrences, base rate, costs and fresh data", explain: "Right. That is the minimum for evidence." },
        { id: "c", text: "Testing many definitions and settings, then keeping whichever did best", explain: "That is data snooping unless corrected and re-tested." },
        { id: "d", text: "Asking other traders whether it works", explain: "Opinions are not tests." },
      ],
      correct: "b",
    },
  ],
  practical: {
    title: "Test a pattern honestly",
    instructions: "Use a spreadsheet and free daily data you can download, or record by hand from a chart. This is research, not trading.",
    steps: [
      "Fix one pattern definition in writing before looking at the data.",
      "Find every occurrence in at least 200 daily bars of one market.",
      "Record the change over a fixed horizon (for example 5 bars) after each, and after every bar.",
      "Compare the two averages and the share of rises, and note how many cases you had.",
    ],
    reflectionPrompt: "Would you have believed the pattern before counting? What does your count suggest?",
  },
  glossary: ["hammer", "shooting-star", "marubozu", "pin-bar", "engulfing-pattern", "harami", "inside-bar", "outside-bar", "morning-star", "base-rate", "data-snooping"],
  next: "cr-timeframes",
};
