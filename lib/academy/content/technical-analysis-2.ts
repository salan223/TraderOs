import type { Lesson } from "../types";

/*
  Technical Analysis (track 7), lessons 7–12. Simulated data only; see
  technical-analysis-1.ts. Figures quoted from the widgets (pattern hit
  rates, Fibonacci shares, overfitting results) are computed on seeded
  simulated series by lib/academy/indicators.ts, and say so.
*/

const T = "technical-analysis";

export const TA7_DIVERGENCE: Lesson = {
  id: "ta-divergence",
  trackId: T,
  order: 7,
  format: "full",
  title: "Divergence",
  summary: "When price and an indicator disagree at two swing points: regular divergences, how to define them objectively, and how often they mislead.",
  minutes: 20,
  objectives: [
    "Define bearish and bullish regular divergence using swing points.",
    "Explain why a divergence can only be known after the second swing is confirmed.",
    "Compare a divergence's track record with the base rate.",
    "State what a divergence measures and what it does not tell you.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Divergence is one of the most popular 'reversal' readings. It is also easy to see after the fact and hard to use in advance." },
        { kind: "p", text: "Defining it exactly, and counting how often it is followed by a turn, is a good first lesson in testing an idea." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Divergence from zero",
      blocks: [
        { kind: "defs", items: [
          { term: "Bearish divergence", text: "Price makes a [[higher-high|higher high]], but the indicator makes a lower high at the same two swings." },
          { term: "Bullish divergence", text: "Price makes a [[lower-low|lower low]], but the indicator makes a higher low." },
          { term: "Swing point", text: "A [[swing-high|swing high]] or [[swing-low|low]] found by a fixed rule, such as 'higher than the 3 bars each side'." },
        ] },
        { kind: "interactive", widget: "ta-fig-divergence", title: "A bearish divergence", caption: "A made-up example. Price makes a higher high while momentum makes a lower high." },
        { kind: "defs", items: [
          { term: "What it measures", text: "That momentum was weaker at the second swing than at the first." },
          { term: "What it does NOT tell you", text: "When or whether price will turn. Divergences often repeat several times while a trend carries on." },
        ] },
        { kind: "callout", tone: "warn", title: "Watch out", text: "A swing high is only confirmed k bars after it happens. A [[divergence|divergence]] that 'appears' on the latest bar may vanish when the next bar makes a higher high." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Find divergences on a simulated chart",
      blocks: [
        { kind: "step-list", items: [
          { text: "Drag through the chart. Each line joins two swings where price and the indicator disagree." },
          { text: "Read the counts: how often price was lower (or higher) 10 bars after the divergence was confirmed." },
          { text: "Compare each share with the base rate for any bar." },
          { text: "Change the swing strength and switch to MACD. The divergences change with your definition." },
        ] },
        { kind: "interactive", widget: "ta-divergence", title: "Divergence finder with a base rate", caption: "A simulated series with regular divergences found by a fixed swing rule. Counts cover the whole series and are compared with the base rate." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "An example, worked through",
      blocks: [
        { kind: "p", text: "Price makes swing highs at 50 and then 52. RSI at those bars was 72 and then 64. Higher price high, lower RSI high: a bearish divergence." },
        { kind: "p", text: "With a 3-bar swing rule, the second high is only confirmed three bars later. By then price may already be lower, or may have made another higher high." },
        { kind: "callout", tone: "key", title: "Key idea", text: "A divergence is a statement about momentum at two past points. To be useful it must be followed by a turn more often than the [[base-rate|base rate]], on data you did not use to define it." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: making divergence testable",
      blocks: [
        { kind: "concept-card", card: {
          name: "Regular divergence",
          what: "Disagreement between the direction of two consecutive price swings and the indicator values at the same bars.",
          whyItExists: "Momentum often slows before a trend ends, so traders look for slowing momentum at new extremes.",
          problemSolved: "It gives a rule for spotting 'a new high with less push behind it'.",
          mechanics: "Find swings with a fixed rule. For each pair of consecutive swing highs, compare price and indicator. Do the same for lows.",
          math: "Bearish: Pₕ₂ > Pₕ₁ and Iₕ₂ < Iₕ₁. Bullish: Pₗ₂ < Pₗ₁ and Iₗ₂ > Iₗ₁. Known only k bars after the second swing.",
          howTradersUseIt: "As a warning to tighten stops or avoid new entries, usually combined with a break of structure.",
          whenUseful: "As a description of slowing momentum, alongside structure.",
          whenItFails: "In strong trends, where several divergences in a row precede further gains.",
          limitations: "Depends on the swing rule, the indicator and its length; easy to see in hindsight.",
          misconceptions: "That a divergence is a reversal signal. It says momentum slowed, nothing about timing.",
          realExample: "Highs at 50 then 52, RSI 72 then 64: bearish divergence.",
          exercise: "In the tool, compare the bearish 'worked' share with the base rate at swing strengths 2 and 5.",
          practicalTest: "Explain why the latest swing on a chart cannot yet be part of a confirmed divergence.",
        } },
        { kind: "callout", tone: "info", title: "Research", text: "We found no peer-reviewed test of divergence on its own that we could verify, so there is no research card here. The pattern evidence in lesson 9 and the testing evidence in lesson 12 apply." },
        { kind: "deeper", title: "Hidden divergence", blocks: [
          { kind: "p", text: "Some traders also use 'hidden' divergence: a higher price low with a lower indicator low, read as trend continuation. It has the same definitional problems and the same need for testing." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Structure-first traders", view: "Ignore divergence until price breaks structure, such as a lower low after a bearish divergence." },
          { name: "Risk managers", view: "Treat divergence as a reason to reduce exposure, not to reverse a position." },
          { name: "Systematic testers", view: "Code the swing rule, the indicator and the exit, then compare the results with random entries." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Acting on a divergence at the latest bar.", why: "The second swing is not confirmed yet.", instead: "Wait for the swing rule's confirmation bars." },
          { mistake: "Remembering only the divergences that worked.", why: "Failed ones are forgotten, so the idea looks better than it is.", instead: "Count every divergence by a fixed rule, including failures." },
          { mistake: "Changing the swing rule to fit the chart.", why: "Any chart shows divergences under some rule.", instead: "Fix the rule first and keep it." },
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
            "Divergence compares two price swings with the indicator at the same bars.",
            "It is only known after the second swing is confirmed.",
            "It must beat the base rate to add information.",
          ],
          equations: [
            { label: "Bearish", formula: "Pₕ₂ > Pₕ₁ and Iₕ₂ < Iₕ₁" },
            { label: "Bullish", formula: "Pₗ₂ < Pₗ₁ and Iₗ₂ > Iₗ₁" },
          ],
          implications: [
            "Treat divergence as a description of slowing momentum.",
            "Count all divergences under one rule before trusting any of them.",
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
          "On any chart with RSI(14), mark every bearish divergence over 200 bars using a 3-bar swing rule.",
          "Note what price did 10 bars after each, and compare with how often price fell over any 10 bars.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "ta-divergence-ex",
    title: "Which divergence is it?",
    prompt: "Classify each pair of swings.",
    categories: [
      { id: "bear", label: "Bearish divergence" },
      { id: "bull", label: "Bullish divergence" },
      { id: "none", label: "No divergence" },
    ],
    items: [
      { id: "1", text: "Swing highs at 40 then 43; RSI 70 then 61.", category: "bear", explain: "Higher price high, lower RSI high." },
      { id: "2", text: "Swing lows at 30 then 28; RSI 25 then 33.", category: "bull", explain: "Lower price low, higher RSI low." },
      { id: "3", text: "Swing highs at 40 then 43; RSI 62 then 71.", category: "none", explain: "Both rose: they agree." },
      { id: "4", text: "Swing lows at 30 then 27; MACD −1.2 then −0.6.", category: "bull", explain: "Lower price low, higher MACD low." },
      { id: "5", text: "Swing highs at 55 then 58; MACD 1.8 then 1.1.", category: "bear", explain: "Higher price high, lower MACD high." },
      { id: "6", text: "Swing lows at 30 then 32; RSI 28 then 35.", category: "none", explain: "Both rose: a higher low with a higher indicator low." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "Price makes a lower low; RSI makes a higher low. What is this called?",
      options: [
        { id: "a", text: "A bearish divergence", explain: "Bearish divergence is at highs." },
        { id: "b", text: "A bullish divergence", explain: "Right. Lower price low, higher indicator low." },
        { id: "c", text: "A crossover", explain: "A crossover is two lines crossing." },
        { id: "d", text: "A confirmation of the down-trend", explain: "They disagree, so it is not confirmation." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "Why can't the latest bar be the second swing of a confirmed divergence?",
      options: [
        { id: "a", text: "Indicators are not calculated on the latest bar", explain: "They are; the swing is the issue." },
        { id: "b", text: "Because the market is closed", explain: "This has nothing to do with market hours." },
        { id: "c", text: "Because divergences only happen on weekly charts", explain: "They can be found on any timeframe." },
        { id: "d", text: "A swing needs k later bars to confirm it", explain: "Right. Until then the next bar may make a new extreme." },
      ],
      correct: "d",
    },
    {
      id: "q3",
      prompt: "60% of bearish divergences on a series were followed by lower prices 10 bars later. What else do you need to know?",
      options: [
        { id: "a", text: "How often prices were lower 10 bars later at any bar", explain: "Right. That is the base rate to beat." },
        { id: "b", text: "Nothing: 60% is above half, so it works", explain: "If the market fell 60% of the time anyway, it adds nothing." },
        { id: "c", text: "The colour of the candles", explain: "Colour does not help judge the result." },
        { id: "d", text: "The value of RSI on the latest bar of the chart", explain: "That does not tell you whether divergence adds information." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "What does a bearish divergence actually describe?",
      options: [
        { id: "a", text: "The exact bar on which the trend will reverse", explain: "It gives no timing." },
        { id: "b", text: "Lower volume at the second high", explain: "Unless the indicator is volume-based, it says nothing about volume." },
        { id: "c", text: "Weaker momentum at the second high than at the first", explain: "Right. That is all it records." },
        { id: "d", text: "That large funds are selling", explain: "No indicator shows who traded." },
      ],
      correct: "c",
    },
  ],
  practical: {
    title: "Count them all",
    instructions: "Observation only. Do not place any trades.",
    steps: [
      "Choose a swing rule (for example, 3 bars each side) and write it down.",
      "On a chart with RSI(14), mark every bearish and bullish divergence in the last 200 bars.",
      "Record what price did 10 bars after each one's confirmation.",
    ],
    reflectionPrompt: "How many of them would you have remembered without counting?",
  },
  glossary: ["divergence"],
  next: "ta-trendlines",
};

export const TA8_TRENDLINES: Lesson = {
  id: "ta-trendlines",
  trackId: T,
  order: 8,
  format: "full",
  title: "Trendlines and channels",
  summary: "Drawing lines through swing points, why every line is a choice, and regression channels as a less subjective alternative.",
  minutes: 20,
  objectives: [
    "Draw a trendline through two swing points and extend it.",
    "Explain why touches and breaks depend on the anchors and tolerance you choose.",
    "Build a regression channel and read its slope and r².",
    "State what a trendline measures and what it does not tell you.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Trendlines are the simplest drawing tool and the most subjective. Two people can draw different lines on the same chart and both call their break 'the signal'." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Trendlines from zero",
      blocks: [
        { kind: "defs", items: [
          { term: "[[trendline|Trendline]]", text: "A straight line through two swing lows (in a rise) or two swing highs (in a fall), extended to the right." },
          { term: "Touch", text: "A later bar whose low (or high) comes within a chosen tolerance of the line." },
          { term: "Break", text: "A close beyond the line by more than the tolerance." },
          { term: "[[price-channel|Channel]]", text: "Two parallel lines that contain price, such as a regression line with a band either side." },
        ] },
        { kind: "interactive", widget: "ta-fig-trendline", title: "Two lines, one chart", caption: "A made-up up-trend. Lines through different swing lows have different slopes and 'break' at different places." },
        { kind: "defs", items: [
          { term: "What it measures", text: "The slope between two chosen points, extended forward." },
          { term: "What it does NOT tell you", text: "Where price must bounce. A line is a choice of points, not a property of the market." },
        ] },
        { kind: "illustration", illustration: "support-resistance", caption: "From Chart Reading: turns happen at slightly different prices, which is why tolerance and zones matter for lines too." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Draw your own lines",
      blocks: [
        { kind: "step-list", items: [
          { text: "Pick two swing lows as anchors. The tool counts later touches and finds the first close through the line." },
          { text: "Move one anchor and see the slope, the touches and the break change." },
          { text: "Widen the tolerance and watch the touch count rise." },
          { text: "Turn on the regression channel, which uses every close instead of two points." },
        ] },
        { kind: "interactive", widget: "ta-trendlines", title: "Trendline and channel tool", caption: "A simulated up-trend. Choose the anchors and the tolerance; the regression channel fits every close from the first anchor." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "An example, worked through",
      blocks: [
        { kind: "p", text: "A line passes through a swing low of 50 at bar 10 and a swing low of 60 at bar 20. Its slope is (60 − 50) ÷ (20 − 10) = 1 per bar. At bar 30 the line is at 70." },
        { kind: "p", text: "If bar 30 closes at 68 and your tolerance is 1, that is a break. With a tolerance of 3 it is a touch. The same bar gives two different readings." },
        { kind: "callout", tone: "key", title: "Key idea", text: "Write the rule down before you look: which swings, what tolerance, what counts as a break. Only then is a trendline something you can test." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: from lines to regression",
      blocks: [
        { kind: "concept-card", card: {
          name: "Trendlines and regression channels",
          what: "A line through two chosen swing points, or a least-squares line through all closes with parallel bands.",
          whyItExists: "To describe the slope of a trend and a boundary that recent swings respected.",
          problemSolved: "It turns 'the trend looks up' into a line with a slope you can extend.",
          mechanics: "Trendline: slope = (P₂ − P₁) ÷ (i₂ − i₁); value at bar i = P₁ + slope × (i − i₁). Regression: fit a line to all closes; bands at ± k standard deviations of the residuals.",
          math: "Line(i) = P₁ + (P₂ − P₁) ÷ (i₂ − i₁) × (i − i₁). Regression slope b = Σ(x − x̄)(y − ȳ) ÷ Σ(x − x̄)²; r² = share of variation explained.",
          howTradersUseIt: "As a boundary for pullback entries, a break as an exit, or a channel for describing a trend's range.",
          whenUseful: "In clear, steady trends with several well-spaced swings.",
          whenItFails: "When anchors are chosen after the fact to fit, or the trend accelerates or flattens.",
          limitations: "Very sensitive to the anchors and the tolerance; a channel's edges are statistics of the past.",
          misconceptions: "That more touches make a line stronger. More touches can just mean a wider tolerance.",
          realExample: "Lows of 50 at bar 10 and 60 at bar 20 give a line at 70 at bar 30.",
          exercise: "In the tool, find two anchor pairs that give breaks more than 20 bars apart.",
          practicalTest: "Explain why the touch count depends on the tolerance.",
        } },
        { kind: "callout", tone: "info", title: "Research", text: "Lesson 1's Brock, Lakonishok and LeBaron study also tested trading-range breaks, a close relative of line breaks, with the same caveats about later data.", link: { lessonId: "ta-moving-averages", label: "Revisit the evidence in lesson 1" } },
        { kind: "deeper", title: "Log scale and lines", blocks: [
          { kind: "p", text: "On a log scale a straight line is constant percentage growth; on a linear scale it is constant price growth. For a long trend, the same two anchors give different lines on the two scales." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Discretionary chartists", view: "Use lines for context and invalidation, and prefer zones to exact lines." },
          { name: "Quantitative analysts", view: "Prefer regression slopes or moving averages, which do not depend on choosing anchors." },
          { name: "Structure traders", view: "Watch swing highs and lows themselves rather than lines between them." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Redrawing the line after each break.", why: "A line you redraw can never be broken, so it never tells you anything.", instead: "Fix the anchors; if price breaks the line, record the break." },
          { mistake: "Counting touches with a loose tolerance.", why: "Wider tolerance means more touches, whatever the market does.", instead: "Set the tolerance as a share of price or ATR before counting." },
          { mistake: "Mixing linear and log charts.", why: "The same anchors give different lines on each.", instead: "State which scale you used." },
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
            "A trendline is a line through two chosen swings, extended forward.",
            "Touches and breaks depend on the anchors and the tolerance.",
            "A regression channel uses every close and reports how well a line fits (r²).",
          ],
          equations: [
            { label: "Line through two points", formula: "L(i) = P₁ + (P₂ − P₁) ÷ (i₂ − i₁) × (i − i₁)" },
            { label: "Channel", formula: "regression line ± k × sd of residuals" },
          ],
          implications: [
            "Write your anchor rule and tolerance down before you draw.",
            "Treat a channel's edges as descriptions, not barriers.",
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
          "On one chart, draw three different trendlines through different swing lows. Note where each 'breaks'.",
          "Calculate the line's value at bar 40 for anchors (10, 100) and (20, 105).",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "ta-trendlines-ex",
    title: "Extend a trendline",
    prompt: "A trendline passes through a swing low of 50 at bar 10 and a swing low of 60 at bar 20. What is the line's value at bar 30?",
    unit: "price",
    answer: 70,
    tolerance: 0.01,
    hint: "Find the slope per bar first, then add it for each bar after bar 20.",
    solution: "Slope = (60 − 50) ÷ (20 − 10) = 1 per bar. At bar 30: 60 + 1 × 10 = 70.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "What most changes how many 'touches' a trendline gets?",
      options: [
        { id: "a", text: "The colour you draw it in", explain: "Colour has no effect." },
        { id: "b", text: "The tolerance you allow and the anchors you pick", explain: "Right. Both are your choices." },
        { id: "c", text: "The day of the week", explain: "Not relevant here." },
        { id: "d", text: "Nothing: touches are objective", explain: "Touches depend on choices." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "A line goes through (bar 0, price 20) and (bar 5, price 30). What is its slope?",
      options: [
        { id: "a", text: "10 per bar", explain: "That is the total change, not per bar." },
        { id: "b", text: "5 per bar", explain: "That divides 10 by 2, not by 5." },
        { id: "c", text: "1.5 per bar", explain: "That divides 30 by 20." },
        { id: "d", text: "2 per bar", explain: "Right. (30 − 20) ÷ 5 = 2." },
      ],
      correct: "d",
    },
    {
      id: "q3",
      prompt: "Why is a regression channel less subjective than a hand-drawn trendline?",
      options: [
        { id: "a", text: "It fits every close in the window instead of two chosen points", explain: "Right. Only the window is chosen." },
        { id: "b", text: "It is drawn by the exchange", explain: "It is calculated by your software." },
        { id: "c", text: "Its edges can never be broken", explain: "Price crosses channel edges often." },
        { id: "d", text: "It uses volume", explain: "A regression of closes uses prices only." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "Price closes through your trendline, so you redraw it through the new low. What is the problem?",
      options: [
        { id: "a", text: "There is no problem; lines should follow price", explain: "Then the line can never give information." },
        { id: "b", text: "A new line needs three anchors before it can be drawn", explain: "Two points define a line; that is not the issue." },
        { id: "c", text: "A line you redraw after every break can never be broken", explain: "Right. It stops being a test of anything." },
        { id: "d", text: "Redrawing is only allowed on weekly charts", explain: "There is no such rule." },
      ],
      correct: "c",
    },
  ],
  practical: {
    title: "One chart, three lines",
    instructions: "Observation only. Do not place any trades.",
    steps: [
      "Pick a chart with a clear up-trend.",
      "Draw three trendlines through different pairs of swing lows.",
      "Write down where each would have 'broken', and what price did next.",
    ],
    reflectionPrompt: "Which line would you have drawn if you did not know what happened next?",
  },
  glossary: ["trendline", "price-channel"],
  next: "ta-chart-patterns",
};

export const TA9_CHART_PATTERNS: Lesson = {
  id: "ta-chart-patterns",
  trackId: T,
  order: 9,
  format: "full",
  title: "Chart patterns and their evidence",
  summary: "Head and shoulders, double tops and bottoms, triangles and flags: how they are defined, how targets are set, and what the evidence says.",
  minutes: 26,
  objectives: [
    "Describe head and shoulders, double tops and bottoms, triangles and flags.",
    "Calculate a measured-move target from a neckline and a pattern height.",
    "Explain why patterns must be compared with a control, such as a random walk or a mirror target.",
    "Summarise what peer-reviewed studies found about chart patterns.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Chart patterns are taught with neat textbook pictures. Real charts are messy, and the same shapes appear in random data." },
        { kind: "p", text: "This lesson shows the patterns, then counts them on simulated series where nothing can be predicted." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "The main patterns",
      blocks: [
        { kind: "interactive", widget: "ta-fig-head-shoulders", title: "Head and shoulders and its measured move", caption: "A textbook drawing, not data. The target is the head's height projected below the neckline." },
        { kind: "cards", items: [
          { title: "[[head-and-shoulders|Head and shoulders]]", rows: [
            { label: "Shape", text: "Three peaks, the middle highest; the [[neckline|neckline]] joins the lows between them." },
            { label: "Usual reading", text: "A possible top. The inverse version is a possible bottom." },
            { label: "Fails when", text: "Price closes back above the neckline, or never reaches the target." },
          ] },
          { title: "[[double-top|Double top and bottom]]", rows: [
            { label: "Shape", text: "Two peaks (or troughs) at about the same price with a pullback between." },
            { label: "Usual reading", text: "Confirmed by a close beyond the pullback's low (or high)." },
            { label: "Fails when", text: "Price makes a third push beyond the peaks." },
          ] },
          { title: "[[triangle-pattern|Triangles]]", rows: [
            { label: "Shape", text: "Highs and lows converging between two lines." },
            { label: "Usual reading", text: "A [[breakout|breakout]] direction is often read from the triangle type, with low reliability." },
            { label: "Fails when", text: "Breaks out and reverses: a [[false-breakout|false breakout]]." },
          ] },
          { title: "[[flag-pattern|Flags]]", rows: [
            { label: "Shape", text: "A small sloping pause after a sharp move." },
            { label: "Usual reading", text: "Continuation of the earlier move." },
            { label: "Fails when", text: "The pause turns into a reversal or a range." },
          ] },
        ] },
        { kind: "interactive", widget: "ta-fig-triangles", title: "Triangle types", caption: "Textbook shapes, not data. Each triangle is named from the slopes of its two boundary lines." },
        { kind: "defs", items: [
          { term: "What patterns measure", text: "A sequence of swings with a particular shape." },
          { term: "What they do NOT tell you", text: "That the [[measured-move|measured-move]] target will be reached. Shapes also appear by chance in random data." },
        ] },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Count patterns honestly",
      blocks: [
        { kind: "step-list", items: [
          { text: "The tool finds double tops, double bottoms and head-and-shoulders patterns mechanically, by a fixed swing rule." },
          { text: "For each confirmed pattern it checks whether the target was reached, and whether the same distance the other way (the mirror) was reached." },
          { text: "Start on a random walk. Then try the other walk and the trending series." },
        ] },
        { kind: "interactive", widget: "ta-patterns", title: "Pattern counter with a control", caption: "Simulated series of 3,000 bars, two of them random walks. Patterns are found by a fixed rule; target and mirror hits are counted the same way." },
        { kind: "callout", tone: "key", title: "Key idea", text: "On a random walk, patterns appear and reach their targets about as often as their mirrors. That is the bar a real pattern has to clear." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "An example, worked through",
      blocks: [
        { kind: "p", text: "A head and shoulders has its head at 120 and a neckline at 100. Its height is 20. The measured-move target after a close below the neckline is 100 − 20 = 80." },
        { kind: "p", text: "That target is a convention. It is not a level the market knows about, and the same rule applied to a random walk 'works' some of the time too." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: the evidence on patterns",
      blocks: [
        { kind: "concept-card", card: {
          name: "Chart patterns",
          what: "Named shapes made of several swings, with a confirmation rule and a measured-move target.",
          whyItExists: "Traders noticed recurring shapes near turns and continuations and gave them names.",
          problemSolved: "They give a vocabulary and a plan: where the pattern is confirmed, where it fails, where a target is.",
          mechanics: "Find swings by a fixed rule; check their relative heights; confirm on a close through the neckline; project the height for a target.",
          math: "Double top: |H₁ − H₂| ≤ tolerance; neckline N = the low between; target = N − (max(H₁, H₂) − N). Head and shoulders: H₂ > H₁, H₂ > H₃, |H₁ − H₃| ≤ tolerance.",
          howTradersUseIt: "As setups with a defined invalidation (back through the neckline) and a target.",
          whenUseful: "As a structured way to describe swings and plan risk.",
          whenItFails: "When patterns are seen after the fact, or targets are treated as forecasts.",
          limitations: "Definitions vary widely; a mechanical rule may not match what a chartist would draw.",
          misconceptions: "That the target is likely to be reached because 'the pattern says so'.",
          realExample: "Head 120, neckline 100: target 80.",
          exercise: "In the counter, compare target and mirror hit rates on random walk A at two different tolerances.",
          practicalTest: "Explain why a pattern found on a random walk is a useful control.",
        } },
        { kind: "research", research: {
          title: "Foundations of Technical Analysis: Computational Algorithms, Statistical Inference, and Empirical Implementation",
          authors: "Andrew W. Lo, Harry Mamaysky and Jiang Wang",
          year: 2000,
          venue: "Journal of Finance 55(4), 1705–1765",
          peerReviewed: true,
          question: "Can chart patterns be defined objectively by a computer, and do they carry information?",
          methodology: "Smoothed prices with kernel regression, detected extrema (peaks and troughs) automatically, defined patterns from them and compared returns after patterns with unconditional returns.",
          data: "US stocks over a 31-year period.",
          findings: "The authors concluded that several technical indicators do provide incremental information and may have some practical value. They also noted that patterns are often 'in the eyes of the beholder' without objective definitions.",
          limitations: "Information is not the same as profit after costs; specific markets and period; later studies have argued about methods.",
          practicalMeaning: "Patterns can be defined objectively, which is the first step to testing them; that is different from showing they make money.",
          status: "disputed",
          url: "https://web.mit.edu/~alo/www/Papers/techanal.html",
          verified: true,
        } },
        { kind: "research", research: {
          title: "Methodical Madness: Technical Analysis and the Irrationality of Exchange-Rate Forecasts",
          authors: "P. H. Kevin Chang and Carol L. Osler",
          year: 1999,
          venue: "Economic Journal 109(458), 636–661",
          peerReviewed: true,
          question: "Does the head-and-shoulders pattern have predictive power in currency markets?",
          methodology: "Identified head-and-shoulders patterns with an objective algorithm and evaluated trading on them against simpler rules and bootstrap simulations.",
          data: "Daily dollar exchange rates for six major currencies, 1973–1994.",
          findings: "Head-and-shoulders trading was profitable for some currencies but, in the authors' words, 'not efficient': it was dominated by simpler trading rules such as moving-average rules.",
          limitations: "Currencies only, an older period; profits depended on the currency; the definition is one of many.",
          practicalMeaning: "Even where a pattern made money, a simpler rule did better. Ask what a pattern adds beyond a basic trend rule.",
          status: "disputed",
          url: "https://ideas.repec.org/a/ecj/econjl/v109y1999i458p636-61.html",
          verified: true,
        } },
        { kind: "deeper", title: "Why the mirror target is the right control", blocks: [
          { kind: "p", text: "At confirmation price has just closed beyond the neckline, so the target is already closer than it was. Comparing with the neckline would flatter the pattern." },
          { kind: "p", text: "The counter measures both distances from the confirming close: d to the target, and the same d the other way. On a random walk both are hit about equally often." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Classical chartists", view: "Use patterns as trade plans with clear invalidation, and accept that many fail." },
          { name: "Quantitative researchers", view: "Define patterns by algorithm and compare them with random entries and simple trend rules." },
          { name: "Risk-first traders", view: "Care less about the target than about where the pattern is proven wrong." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Seeing patterns after the fact.", why: "Hindsight makes every completed shape look obvious.", instead: "Use a fixed definition and judge only what was known at confirmation." },
          { mistake: "Treating the target as a forecast.", why: "It is a geometric convention.", instead: "Plan exits around invalidation and risk, not only the target." },
          { mistake: "Ignoring the control.", why: "Random data produce the same shapes and similar hit rates.", instead: "Compare hit rates with a mirror target or random entries." },
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
            "Patterns are named sequences of swings with a neckline and a measured-move target.",
            "The same shapes appear in random walks, with similar hit rates for targets and mirrors.",
            "Studies found patterns can be defined objectively; profits were limited and often beaten by simpler rules.",
          ],
          equations: [
            { label: "Measured move (top)", formula: "target = neckline − (peak − neckline)" },
          ],
          implications: [
            "Use a written pattern definition and always compare with a control.",
            "Plan around where the pattern fails, not where it should go.",
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
          "Find two head-and-shoulders patterns on any charts. Calculate each target and check whether it was reached.",
          "Write a one-paragraph mechanical definition of a double top that a computer could follow.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "ta-chart-patterns-ex",
    title: "Measured-move target",
    prompt: "A head-and-shoulders pattern has its head at 120 and its neckline at 100. What is the measured-move target after a close below the neckline?",
    unit: "price",
    answer: 80,
    tolerance: 0.01,
    hint: "The height is head minus neckline. Subtract the height from the neckline.",
    solution: "Height = 120 − 100 = 20. Target = 100 − 20 = 80.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "In a head and shoulders, what is the neckline?",
      options: [
        { id: "a", text: "A line through the top of the head", explain: "The neckline is below the peaks." },
        { id: "b", text: "The line through the lows between the peaks", explain: "Right. A close through it confirms the pattern." },
        { id: "c", text: "A 200-bar moving average", explain: "Moving averages are not part of the pattern." },
        { id: "d", text: "The highest volume bar", explain: "Volume is not used in its definition." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "A pattern finder on a random walk reaches targets 45% of the time and mirror targets 44% of the time. What does this show?",
      options: [
        { id: "a", text: "The pattern works 45% of the time", explain: "It does no better than its mirror, so it adds nothing here." },
        { id: "b", text: "The random walk was badly made", explain: "Random walks are meant to have no predictable patterns." },
        { id: "c", text: "Hit rates like these can come from chance alone", explain: "Right. That is the control a real pattern must beat." },
        { id: "d", text: "Patterns only work on random walks", explain: "There is nothing to predict on a random walk." },
      ],
      correct: "c",
    },
    {
      id: "q3",
      prompt: "What did Chang and Osler (1999) find about head-and-shoulders trading in currencies?",
      options: [
        { id: "a", text: "It never made money in any currency", explain: "It was profitable for some currencies." },
        { id: "b", text: "It was the best rule they tested", explain: "Simpler rules did better." },
        { id: "c", text: "It only worked on stocks", explain: "They studied currencies." },
        { id: "d", text: "It could be profitable but was dominated by simpler rules", explain: "Right. In their words, 'profitable, but not efficient'." },
      ],
      correct: "d",
    },
    {
      id: "q4",
      prompt: "Which triangle has a flat upper line and rising lows?",
      options: [
        { id: "a", text: "Ascending", explain: "Right. Named for the rising lows." },
        { id: "b", text: "Descending", explain: "That has falling highs and a flat lower line." },
        { id: "c", text: "Symmetrical", explain: "That has falling highs and rising lows." },
        { id: "d", text: "Expanding, because the range grows over time", explain: "An expanding shape has diverging lines." },
      ],
      correct: "a",
    },
  ],
  practical: {
    title: "Write it down first",
    instructions: "Observation only. Do not place any trades.",
    steps: [
      "Write a mechanical definition of a double top: swing rule, how equal the peaks must be, and confirmation.",
      "Apply it to 300 bars of any chart and list every pattern it finds.",
      "For each, note whether the target or the mirror was reached first.",
    ],
    reflectionPrompt: "Did your rule find patterns you would not have called patterns by eye?",
  },
  glossary: ["chart-pattern", "head-and-shoulders", "double-top", "neckline", "measured-move", "triangle-pattern", "flag-pattern"],
  next: "ta-fibonacci",
};

export const TA10_FIBONACCI: Lesson = {
  id: "ta-fibonacci",
  trackId: T,
  order: 10,
  format: "full",
  title: "Fibonacci retracements, with an honest caveat",
  summary: "How Fibonacci retracement levels are drawn, why so many pullbacks seem to 'respect' them, and what a fair test looks like.",
  minutes: 18,
  objectives: [
    "Calculate Fibonacci retracement levels for a move.",
    "Calculate how much of the retracement range a set of levels covers.",
    "Explain why hits on Fibonacci levels are expected by chance.",
    "State what Fibonacci levels are and what they do not tell you.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Fibonacci levels are drawn on millions of charts. They feel precise, but we found no peer-reviewed evidence that they work better than other levels." },
        { kind: "p", text: "This lesson shows how to draw them, and how to check whether a 'hit' is more than chance." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Fibonacci levels from zero",
      blocks: [
        { kind: "p", text: "Take a move from a swing low to a swing high. [[fibonacci-retracement|Fibonacci retracement]] levels are drawn at fixed shares of that move, measured back from the high." },
        { kind: "defs", items: [
          { term: "The ratios", text: "23.6%, 38.2%, 50%, 61.8% and 78.6%. 61.8% comes from the golden ratio; 50% is not a Fibonacci ratio at all." },
          { term: "A level", text: "high − (high − low) × ratio, for a pullback in a rise." },
        ] },
        { kind: "interactive", widget: "ta-fig-fibonacci", title: "Levels and how much they cover", caption: "A made-up move with the five levels. Shaded bands of ±3 points around them cover 30% of all possible pullbacks." },
        { kind: "defs", items: [
          { term: "What they are", text: "Fixed fractions of a chosen move. The move's start and end are your choice." },
          { term: "What they do NOT tell you", text: "Where a pullback will stop. Many pullbacks land near some level by chance." },
        ] },
        { kind: "callout", tone: "warn", title: "Honest caveat", text: "Five levels with ±3 points of slack cover 30% of the range. Add 'near enough' and the choice of swing, and almost any pullback can be said to have respected a level." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Test the levels against chance",
      blocks: [
        { kind: "step-list", items: [
          { text: "Read the first number: the chance a random pullback lands 'at a level' with your tolerance." },
          { text: "Read the second: the share of pullbacks on a long random walk that landed near the levels." },
          { text: "Switch to made-up ratios and compare. Then change the tolerance." },
        ] },
        { kind: "interactive", widget: "ta-fibonacci", title: "Fibonacci levels against a control", caption: "Simulated series. Pullback ratios come from swings on a 6,000-bar random walk; made-up ratios are the control." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "An example, worked through",
      blocks: [
        { kind: "p", text: "A move runs from 1,000 to 2,000. The 61.8% retracement level is 2,000 − 1,000 × 0.618 = 1,382. The 50% level is 1,500." },
        { kind: "p", text: "A pullback that stops at 1,400 is 1.8 points from the 61.8% level, so it 'respects' it with ±3 points of tolerance. A pullback to 1,450 is 5 points from 50%, and would 'respect' it with ±5." },
        { kind: "callout", tone: "example", title: "Example", text: "On the simulated random walk, roughly two in five pullbacks land within ±3 points of a Fibonacci level, and about a third land near a set of made-up ratios. The levels do no better than chance there." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: coverage and a fair test",
      blocks: [
        { kind: "concept-card", card: {
          name: "Fibonacci retracement",
          what: "Horizontal levels at fixed fractions (23.6% to 78.6%) of a chosen prior move.",
          whyItExists: "The Fibonacci sequence and golden ratio appear in nature, and traders hoped markets share them.",
          problemSolved: "It gives a quick, repeatable set of levels for where a pullback might pause.",
          mechanics: "Choose a swing low and high; draw lines at high − (high − low) × r for each ratio r.",
          math: "Level(r) = H − (H − L) × r. Coverage with tolerance t: the union of the intervals [r − t, r + t]; five ratios at t = 0.03 cover 0.30 of the 0–1 range.",
          howTradersUseIt: "As areas to watch for pullback entries, often combined with other levels.",
          whenUseful: "As a consistent way to talk about the depth of a pullback, for example 'about a 60% retracement'.",
          whenItFails: "When treated as levels the market must respect: chance alone produces many 'hits'.",
          limitations: "The swing points and the tolerance are chosen by the user, often after the fact.",
          misconceptions: "That markets follow the golden ratio. No peer-reviewed study we found shows that.",
          realExample: "From 1,000 to 2,000, the 61.8% level is 1,382.",
          exercise: "In the tool, find the tolerance at which the levels cover half of all possible pullbacks.",
          practicalTest: "Explain why a hit on a Fibonacci level is not evidence by itself.",
        } },
        { kind: "callout", tone: "info", title: "Research", text: "We searched for peer-reviewed tests of Fibonacci retracements and found none we could verify. Popular claims are untested or rest on hand-picked examples, so there is no research card here." },
        { kind: "deeper", title: "A fair test", blocks: [
          { kind: "step-list", items: [
            { text: "Fix the swing rule and the tolerance before looking." },
            { text: "Measure every pullback, not only the ones you remember." },
            { text: "Compare the share near Fibonacci levels with the share near made-up levels, on data you did not choose." },
          ] },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Fibonacci users", view: "Treat levels as areas of interest, not as stops or entries on their own." },
          { name: "Structure traders", view: "Prefer prior swing highs and lows, which are levels where trading actually happened." },
          { name: "Sceptics", view: "Point to coverage: with enough levels and tolerance, hits are guaranteed to be common." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Choosing the swing after seeing the pullback.", why: "You can usually find a swing that makes the stop land on a level.", instead: "Fix the swing rule in advance." },
          { mistake: "Counting near misses as hits.", why: "Each extra point of tolerance raises the hit rate by chance.", instead: "Set the tolerance before counting." },
          { mistake: "Believing the golden ratio governs markets.", why: "No verified evidence supports it.", instead: "Treat the levels as a convention, and test them." },
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
            "Fibonacci levels are fixed fractions of a chosen move.",
            "Five levels with ±3 points of tolerance cover 30% of all possible pullbacks.",
            "On a random walk, made-up levels catch a similar share: the hits are chance.",
            "We found no peer-reviewed evidence that the levels have special power.",
          ],
          equations: [
            { label: "Level", formula: "H − (H − L) × r" },
            { label: "Coverage (no overlaps)", formula: "number of levels × 2 × tolerance" },
          ],
          implications: [
            "Use Fibonacci levels, if at all, as a way to describe depth, not as a reason to trade.",
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
          "Calculate the 38.2% and 61.8% levels for a move from 40 to 60.",
          "Draw Fibonacci levels on five pullbacks you choose in advance by a rule, and count hits with ±2 points.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "ta-fibonacci-ex",
    title: "Calculate a retracement level",
    prompt: "A move runs from a swing low of 1,000 to a swing high of 2,000. Where is the 61.8% retracement level?",
    unit: "price",
    answer: 1382,
    tolerance: 0.5,
    hint: "Take 61.8% of the move and subtract it from the high.",
    solution: "The move is 1,000. 61.8% of it is 618. 2,000 − 618 = 1382.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "Which of these is NOT a Fibonacci ratio, although it is usually drawn with them?",
      options: [
        { id: "a", text: "61.8%", explain: "61.8% comes from the golden ratio." },
        { id: "b", text: "38.2%", explain: "38.2% is 1 − 0.618." },
        { id: "c", text: "50%", explain: "Right. 50% is added by convention." },
        { id: "d", text: "23.6%", explain: "23.6% is 0.382 × 0.618." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "With five levels and ±3 points of tolerance, what share of all possible pullbacks counts as 'at a level'?",
      options: [
        { id: "a", text: "About 3%", explain: "That is one level's half-width." },
        { id: "b", text: "About 30%", explain: "Right. 5 × 6 points = 30 points of 100." },
        { id: "c", text: "About 60%", explain: "That would need ±6 points." },
        { id: "d", text: "About 5%, one share per level", explain: "Each level covers 6 points, not 1." },
      ],
      correct: "b",
    },
    {
      id: "q3",
      prompt: "A pullback stops near the 61.8% level. What is the most accurate conclusion?",
      options: [
        { id: "a", text: "The level caused buyers to step in", explain: "One hit cannot show cause." },
        { id: "b", text: "The golden ratio governs this market", explain: "No verified evidence supports that." },
        { id: "c", text: "The pullback had to stop somewhere, and levels cover much of the range", explain: "Right. A single hit is expected often by chance." },
        { id: "d", text: "The next pullback in this market will stop at the same ratio", explain: "There is no basis for that." },
      ],
      correct: "c",
    },
    {
      id: "q4",
      prompt: "What is a fair test of Fibonacci levels?",
      options: [
        { id: "a", text: "Look at charts where they worked", explain: "That is selection by hindsight." },
        { id: "b", text: "Ask experienced traders", explain: "Opinions are not a test." },
        { id: "c", text: "Change the tolerance until most pullbacks hit", explain: "That guarantees hits." },
        { id: "d", text: "Compare their hit rate with made-up levels, by fixed rules", explain: "Right. That is a control." },
      ],
      correct: "d",
    },
  ],
  practical: {
    title: "Fibonacci with a control",
    instructions: "Observation only. Do not place any trades.",
    steps: [
      "Choose a swing rule and a tolerance (for example ±2 points) and write them down.",
      "Measure ten pullbacks on any chart by that rule.",
      "Count hits on the Fibonacci levels and on levels at 20%, 35%, 50%, 65% and 80%.",
    ],
    reflectionPrompt: "Was there a real difference between the two sets of levels?",
  },
  glossary: ["fibonacci-retracement"],
  next: "ta-confluence",
};

export const TA11_CONFLUENCE: Lesson = {
  id: "ta-confluence",
  trackId: T,
  order: 11,
  format: "full",
  title: "Multi-timeframe confluence and indicator redundancy",
  summary: "Using a higher timeframe for context without look-ahead, and why several indicators agreeing is often one opinion counted several times.",
  minutes: 22,
  objectives: [
    "Explain how to use a higher timeframe without using bars that have not closed.",
    "Define confluence and the condition that makes it meaningful: independence.",
    "Recognise indicators that are redundant because they share inputs.",
    "Read a correlation between two indicators.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "'Three indicators agree' sounds convincing. If all three are built from the same last 14 closes, it is one piece of evidence with three names." },
        { kind: "p", text: "Real [[confluence|confluence]] needs evidence that could disagree: a different timeframe, a different input such as volume, or a level from structure." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Confluence from zero",
      blocks: [
        { kind: "interactive", widget: "ta-fig-timeframes", title: "Each timeframe has a job", caption: "A drawing of one market on three bar lengths: context from the higher, the setup from the middle, timing from the lower." },
        { kind: "defs", items: [
          { term: "Higher timeframe", text: "Longer bars built from the same prices, used for context. Only closed bars may be used." },
          { term: "[[indicator-redundancy|Redundancy]]", text: "Indicators that agree because they are built from the same inputs." },
          { term: "[[correlation|Correlation]]", text: "A number from −1 to +1 for how closely two series move together." },
        ] },
        { kind: "interactive", widget: "ta-fig-redundancy", title: "Three indicators, one input", caption: "A drawing. RSI, the stochastic and rate of change all come from the same recent closes, so their agreement is one opinion." },
        { kind: "defs", items: [
          { term: "What agreement measures", text: "That several readings point the same way at the same time." },
          { term: "What it does NOT tell you", text: "That the odds have multiplied. Readings built from the same closes count as one opinion." },
        ] },
        { kind: "callout", tone: "warn", title: "Watch out", text: "A daily bar is not finished until the day closes. Using today's unfinished daily bar in a backtest is [[look-ahead-bias|look-ahead bias]]." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "See timeframes and redundancy",
      blocks: [
        { kind: "step-list", items: [
          { text: "The strip shows trend state (above or below a moving average) on the base and the higher timeframe." },
          { text: "Change the higher timeframe. The longer it is, the less often its state changes." },
          { text: "Read the correlations: high values mean the indicators mostly say the same thing." },
        ] },
        { kind: "interactive", widget: "ta-confluence", title: "Timeframe agreement and indicator correlations", caption: "Simulated series. The higher timeframe uses only closed higher bars; correlations are measured over 2,000 simulated bars." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "An example, worked through",
      blocks: [
        { kind: "p", text: "A trader wants long trades only when the daily close is above its 20-day average, with entries on the hourly chart. At 11:00 the daily bar is still open, so she uses yesterday's close against its average." },
        { kind: "p", text: "She also sees RSI, the stochastic and rate of change all rising. On the lab's simulated data these three correlate at about 0.8 or more, so she counts them as one momentum reading, not three." },
        { kind: "callout", tone: "key", title: "Key idea", text: "Count evidence by its sources, not by its indicators. Price momentum, a higher-timeframe trend and a level from structure are three sources; three momentum oscillators are one." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: independence and look-ahead",
      blocks: [
        { kind: "concept-card", card: {
          name: "Confluence and redundancy",
          what: "Confluence is agreement between independent pieces of evidence; redundancy is agreement that comes from shared inputs.",
          whyItExists: "Traders want more than one reason before acting.",
          problemSolved: "It separates 'more indicators' from 'more evidence'.",
          mechanics: "Group indicators by input (closes, highs and lows, volume) and by window; measure their correlation; keep one per group.",
          math: "Correlation r = Σ(x − x̄)(y − ȳ) ÷ √(Σ(x − x̄)² Σ(y − ȳ)²). Higher timeframe at base bar i uses the higher bar that closed at or before i.",
          howTradersUseIt: "A higher timeframe for direction, one momentum tool for timing, a structural level for invalidation.",
          whenUseful: "Whenever several indicators are on one chart.",
          whenItFails: "When correlations change between calm and wild markets, or when 'independent' sources share a hidden input.",
          limitations: "Correlation measures linear co-movement over a window; it is an estimate and can change.",
          misconceptions: "That five agreeing indicators are five times as reliable as one.",
          realExample: "RSI(14) and rate of change(14) correlate at about 0.9 on the lab's simulated 2,000 bars.",
          exercise: "In the tool, find the indicator pair with the lowest correlation to RSI and say why.",
          practicalTest: "Explain why using today's unfinished daily bar in a backtest is look-ahead bias.",
        } },
        { kind: "callout", tone: "info", title: "Research", text: "We did not find a peer-reviewed study of multi-timeframe confluence that we could verify. Lesson 12's research on testing many rules applies directly to adding indicators.", link: { lessonId: "cr-timeframes", label: "Revisit timeframes from Chart Reading" } },
        { kind: "illustration", illustration: "timeframe-aggregation", caption: "From Chart Reading: a higher-timeframe bar combines shorter bars. It is only complete when its last shorter bar has closed." },
        { kind: "deeper", title: "Why ATR is different", blocks: [
          { kind: "p", text: "ATR measures size of movement, not direction, so its correlation with RSI is low. Low correlation alone does not make it useful; it only means it carries different information." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Top-down traders", view: "Fix each timeframe's job in advance: direction from the highest, setup from the middle, timing from the lowest." },
          { name: "Systematic researchers", view: "Measure correlation between candidate signals and drop those that add little." },
          { name: "Minimalists", view: "Use one indicator per kind of information: trend, momentum, volatility, volume." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Stacking oscillators as confirmation.", why: "They share inputs and mostly agree.", instead: "Use one, and add evidence from a different source." },
          { mistake: "Using an unfinished higher-timeframe bar.", why: "Its close is not known yet.", instead: "Use the last closed higher bar only." },
          { mistake: "Switching timeframes until one agrees.", why: "That chooses the evidence after the conclusion.", instead: "Fix the timeframes before you look." },
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
            "Confluence counts only if the pieces of evidence are independent.",
            "Oscillators built from the same closes are highly correlated: redundant.",
            "A higher timeframe may only use bars that have closed.",
          ],
          equations: [
            { label: "Correlation", formula: "r = Σ(x − x̄)(y − ȳ) ÷ √(Σ(x − x̄)² · Σ(y − ȳ)²)" },
          ],
          implications: [
            "Count sources, not indicators.",
            "Fix each timeframe's role before you look at the chart.",
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
          "List the indicators you like to use and group them by input. How many groups are there?",
          "Write down which timeframe gives direction and which gives timing in your plan.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "ta-confluence-ex",
    title: "Sort indicators by what they measure",
    prompt: "Put each indicator in the group of information it mainly carries. Indicators in the same group are largely redundant.",
    categories: [
      { id: "mom", label: "Momentum of closes" },
      { id: "vol", label: "Volatility (size of moves)" },
      { id: "volu", label: "Volume" },
      { id: "trend", label: "Trend (smoothed direction)" },
    ],
    items: [
      { id: "1", text: "RSI(14)", category: "mom", explain: "Average gains versus losses of recent closes." },
      { id: "2", text: "Stochastic %K(14)", category: "mom", explain: "Close in the recent range: closely tied to momentum." },
      { id: "3", text: "Rate of change (14)", category: "mom", explain: "Percentage change of the close over 14 bars." },
      { id: "4", text: "ATR(14)", category: "vol", explain: "Average true range: size, not direction." },
      { id: "5", text: "Bollinger bandwidth", category: "vol", explain: "Spread of closes around their average." },
      { id: "6", text: "On-balance volume", category: "volu", explain: "Running total of signed volume." },
      { id: "7", text: "50-bar moving average slope", category: "trend", explain: "Smoothed direction over a longer window." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "RSI, the stochastic and rate of change all turn up together. How much evidence is this?",
      options: [
        { id: "a", text: "Three independent confirmations", explain: "They share inputs, so they are not independent." },
        { id: "b", text: "Mostly one piece: recent momentum of closes", explain: "Right. They are redundant." },
        { id: "c", text: "None, because indicators never agree", explain: "They often agree, which is the point." },
        { id: "d", text: "Proof that price will rise", explain: "No indicator gives proof." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "It is Wednesday at noon. Which weekly bar can a backtest use without look-ahead?",
      options: [
        { id: "a", text: "This week's bar, as it stands now", explain: "Its close is not known yet." },
        { id: "b", text: "This week's bar, using Friday's close", explain: "Friday has not happened yet." },
        { id: "c", text: "Any bar, since weekly bars are slow", explain: "Speed does not matter; knowledge does." },
        { id: "d", text: "Last week's completed bar", explain: "Right. Only closed bars are known." },
      ],
      correct: "d",
    },
    {
      id: "q3",
      prompt: "Two indicators have a correlation of 0.9. What does that mean?",
      options: [
        { id: "a", text: "They have tended to move closely together", explain: "Right. High positive correlation." },
        { id: "b", text: "One causes the other", explain: "Correlation does not show cause." },
        { id: "c", text: "They are right 90% of the time", explain: "Correlation says nothing about being right." },
        { id: "d", text: "They are unrelated, as long as their formulas differ", explain: "Different formulas can still be highly correlated." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "Which addition to an RSI-based plan brings the most new information?",
      options: [
        { id: "a", text: "The stochastic of the same length", explain: "It shares inputs with RSI." },
        { id: "b", text: "Rate of change over 14 bars", explain: "Also built from the same closes." },
        { id: "c", text: "A higher-timeframe trend filter from closed bars", explain: "Right. Different window, different information." },
        { id: "d", text: "RSI with a length of 15 instead of 14", explain: "Almost identical to RSI(14)." },
      ],
      correct: "c",
    },
  ],
  practical: {
    title: "Count your sources",
    instructions: "Planning only. Do not place any trades.",
    steps: [
      "Write down every indicator on your favourite chart setup.",
      "Group them by input and window.",
      "Remove all but one from each group and note what information you lost.",
    ],
    reflectionPrompt: "How many independent sources of evidence does your setup really have?",
  },
  glossary: ["confluence", "indicator-redundancy", "correlation", "look-ahead-bias"],
  next: "ta-testable-rules",
};

export const TA12_TESTABLE_RULES: Lesson = {
  id: "ta-testable-rules",
  trackId: T,
  order: 12,
  format: "full",
  title: "Testable rules, backtests and overfitting",
  summary: "Turning indicator ideas into exact rules, testing them without fooling yourself, and why the best of many backtests is usually luck.",
  minutes: 28,
  objectives: [
    "Write a trading rule precise enough to test: entry, exit, costs and size.",
    "Explain in-sample and out-of-sample data, and walk-forward testing.",
    "Explain overfitting and multiple testing, and why the best backtest overstates the future.",
    "List common backtest errors, including look-ahead bias and ignored costs.",
    "Summarise what research says about data snooping and backtest overfitting.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Every indicator in this track can be turned into a [[trading-rule|rule]] and [[backtest|backtested]]. Backtests are the main way traders fool themselves." },
        { kind: "p", text: "Try enough settings and one will look excellent on past data, even when nothing can be predicted. Knowing this is a safety skill, not a technicality." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Rules and tests from zero",
      blocks: [
        { kind: "interactive", widget: "ta-fig-rule", title: "What makes a rule testable", caption: "A drawing. A rule is testable only when entry, exit, costs and size are written down before the test, and it is then checked on unseen data." },
        { kind: "defs", items: [
          { term: "[[in-sample|In-sample]]", text: "The data you used to build or tune the rule." },
          { term: "[[out-of-sample|Out-of-sample]]", text: "Data you kept aside, used once to check the rule." },
          { term: "[[overfitting|Overfitting]]", text: "Tuning a rule to fit the past's noise, so it fails on new data." },
          { term: "[[multiple-testing|Multiple testing]]", text: "Trying many rules and keeping the best: the best looks good by luck." },
        ] },
        { kind: "interactive", widget: "ta-fig-overfit", title: "In sample versus out of sample", caption: "A drawing, not data. The best of many tried settings rises in sample, then goes sideways on new data." },
        { kind: "defs", items: [
          { term: "What a backtest measures", text: "How a fixed rule would have done on one stretch of past data, with the costs you included." },
          { term: "What it does NOT tell you", text: "How the rule will do next. A tuned result also contains luck from every setting you tried." },
        ] },
        { kind: "callout", tone: "warn", title: "Safety-critical", text: "A backtest that was tuned on the same data it reports is not evidence. Before risking money on any rule, it must be tested on data it never saw, with costs included." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Watch overfitting happen",
      blocks: [
        { kind: "step-list", items: [
          { text: "Each of 40 random walks is split in half. Nothing on them can be predicted." },
          { text: "Move the slider to try more moving-average pairs. The best in-sample result is picked each time." },
          { text: "Watch the in-sample line rise while the out-of-sample line stays near zero." },
          { text: "Add costs and switch batches. The pattern stays the same." },
        ] },
        { kind: "interactive", widget: "ta-overfitting", title: "The best of many tries", caption: "Simulated driftless random walks, so no rule has a real edge. The in-sample winner is re-run on the unseen second half of each path." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "An example, worked through",
      blocks: [
        { kind: "p", text: "On 100 simulated random walks (seed 1), trying one moving-average pair gave a median in-sample return of about −2%. Trying 64 pairs and keeping the best gave about +10% in sample." },
        { kind: "p", text: "Out of sample, the same 'best' pairs had a median of about 0%, and about half of them gained. The +10% was selection, not skill." },
        { kind: "callout", tone: "key", title: "Key idea", text: "The more you try, the better the best in-sample result looks, and the less it tells you. Always report how many things you tried." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: valid backtests",
      blocks: [
        { kind: "concept-card", card: {
          name: "Backtest overfitting",
          what: "When a rule's settings are chosen because they did best on past data, so the reported result includes luck that will not repeat.",
          whyItExists: "Any search over many settings on a finite, noisy history finds some that fit the noise.",
          problemSolved: "Recognising it stops you from mistaking a lucky backtest for an edge.",
          mechanics: "Split data; tune only on the first part; test once on the second; or walk forward through time. Count every variant tried.",
          math: "With N independent tries of a rule with no edge, the best in-sample result grows with N while its expected out-of-sample result stays at zero minus costs.",
          howTradersUseIt: "Out-of-sample holds, walk-forward tests, fewer parameters, and adjusting for the number of rules tried.",
          whenUseful: "Before trusting any backtest, your own or someone else's.",
          whenItFails: "When the 'out-of-sample' data are looked at repeatedly and the rule is tuned again: they become in-sample.",
          limitations: "Even a clean test describes one past path; markets change.",
          misconceptions: "That a long backtest with a high return must be robust. A long search can make any history look good.",
          realExample: "On 100 simulated random walks, the best of 64 pairs made about +10% in sample and about 0% out of sample.",
          exercise: "In the tool, find how many pairs it takes before the in-sample median clearly beats the out-of-sample median.",
          practicalTest: "List four ways a backtest can use information it would not have had.",
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
          limitations: "Tests trading rules on one index; ignores some real-world frictions.",
          practicalMeaning: "Something that worked historically can stop working; testing on fresh data is essential.",
          status: "regime-sensitive",
          url: "https://econpapers.repec.org/RePEc:bla:jfinan:v:54:y:1999:i:5:p:1647-1691",
          verified: true,
        } },
        { kind: "research", research: {
          title: "Technical trading revisited: False discoveries, persistence tests, and transaction costs",
          authors: "Pierre Bajgrowicz and Olivier Scaillet",
          year: 2012,
          venue: "Journal of Financial Economics 106(3), 473–491",
          peerReviewed: true,
          question: "After controlling for the share of false discoveries among many rules, could an investor have picked profitable technical rules in advance?",
          methodology: "Applied a false discovery rate approach to a large universe of technical rules, tested whether good performance persisted, and added transaction costs.",
          data: "The Dow Jones Industrial Average, 1897–2011.",
          findings: "Investors could not have selected the best-performing rules in advance, and even low transaction costs were enough to offset the rules' performance.",
          limitations: "One index; the rule universe is large but not every possible rule.",
          practicalMeaning: "Past winners among many technical rules were hard to identify in advance and did not survive costs. Expect the same of rules you find yourself.",
          status: "replicated",
          url: "https://ideas.repec.org/a/eee/jfinec/v106y2012i3p473-491.html",
          verified: true,
        } },
        { kind: "research", research: {
          title: "Pseudo-Mathematics and Financial Charlatanism: The Effects of Backtest Overfitting on Out-of-Sample Performance",
          authors: "David H. Bailey, Jonathan M. Borwein, Marcos López de Prado and Qiji Jim Zhu",
          year: 2014,
          venue: "Notices of the American Mathematical Society 61(5), 458–471",
          peerReviewed: true,
          question: "How does trying many strategy configurations affect the reliability of a backtest?",
          methodology: "Mathematical analysis and examples of how the number of configurations tried relates to the chance of overfitting.",
          data: "Theoretical results with simulated examples.",
          findings: "The more configurations are tried, the more likely a backtest is overfit, and many published results do not report how many were tried. With memory effects in the data, overfitting can lead to negative out-of-sample performance.",
          limitations: "A mathematical argument with stylised examples rather than a survey of real strategies.",
          practicalMeaning: "Always record how many variants you tried, and be sceptical of any backtest that does not say.",
          status: "replicated",
          url: "https://scholarworks.wmich.edu/math_pubs/40/",
          verified: true,
        } },
        { kind: "deeper", title: "A checklist for a valid backtest", blocks: [
          { kind: "step-list", items: [
            { title: "No look-ahead", text: "Every decision uses only bars that had closed. The rule acts on the next bar." },
            { title: "Costs", text: "Include [[spread|spreads]], [[commission|commissions]] and [[slippage|slippage]] on every entry and exit." },
            { title: "Count the tries", text: "Record every setting and rule tested, not just the winner." },
            { title: "Hold data back", text: "Keep out-of-sample data untouched, or use [[walk-forward|walk-forward]] testing." },
            { title: "Compare", text: "Beat buy-and-hold and random entries, not just zero." },
          ] },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Quantitative researchers", view: "Pre-register hypotheses, count trials and adjust for multiple testing before believing a result." },
          { name: "Walk-forward testers", view: "Tune on a rolling window and judge only the unseen windows that follow." },
          { name: "Simplicity advocates", view: "Prefer rules with few parameters, because they have less room to fit noise." },
          { name: "Sceptical allocators", view: "Discount any backtest heavily, and trust live, out-of-sample records more." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Reporting the best of many backtests.", why: "Selection makes it look good by luck.", instead: "Report how many were tried and test the chosen one on unseen data." },
          { mistake: "Re-tuning after a bad out-of-sample result.", why: "The out-of-sample data then become in-sample.", instead: "Treat the first out-of-sample test as final, or collect new data." },
          { mistake: "Ignoring costs.", why: "Many rules that win before costs lose after them.", instead: "Include realistic costs on every trade." },
          { mistake: "Acting on a bar's close at that bar's close.", why: "In real life you can only trade after the close is known.", instead: "Act on the next bar." },
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
            "A testable rule states entry, exit, costs and size exactly, before the test.",
            "In-sample results flatter; out-of-sample and walk-forward tests are the check.",
            "The best of many tries looks good by luck; count every try.",
            "Research on long histories found that the best technical rules were hard to pick in advance and did not survive costs.",
          ],
          equations: [
            { label: "Out of sample", formula: "tune on [0, t); test once on [t, T)" },
            { label: "Net return", formula: "gross return − costs on every entry and exit" },
          ],
          implications: [
            "Never risk money on a rule that has only been tested on the data used to build it.",
            "Write down the number of variants you tried next to every backtest result.",
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
          "Write one complete rule from an indicator in this track: entry, exit, costs, size.",
          "Decide in writing which data are in sample and which are out of sample, before you look at any results.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "order",
    id: "ta-testable-rules-ex",
    title: "Put a valid test in order",
    prompt: "Put these steps of a valid rule test in the right order.",
    items: [
      { id: "idea", text: "State the idea as an exact rule: entry, exit, costs and size" },
      { id: "split", text: "Set aside out-of-sample data before looking at results" },
      { id: "tune", text: "Tune and test only on the in-sample data, counting every variant" },
      { id: "test", text: "Run the chosen rule once on the out-of-sample data, with costs" },
      { id: "judge", text: "Compare with buy-and-hold and random entries before drawing conclusions" },
    ],
    explanation: "The rule and the data split come first, so nothing is chosen after seeing results. The out-of-sample run happens once, and the result is judged against a benchmark.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "You try 50 settings and the best returns +30% in sample. What is the best estimate of its future return?",
      options: [
        { id: "a", text: "About +30%", explain: "The best of 50 includes a lot of luck." },
        { id: "b", text: "Unknown, and probably much less than +30%", explain: "Right. Selection inflates the best result." },
        { id: "c", text: "Exactly zero, because all backtests are useless", explain: "Backtests are informative when done properly." },
        { id: "d", text: "+60%, because more data will help", explain: "There is no basis for that." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "After a poor out-of-sample result, you change a setting and test on the same out-of-sample data again. What has happened?",
      options: [
        { id: "a", text: "Nothing: this is normal tuning", explain: "Tuning on test data spoils the test." },
        { id: "b", text: "The rule is now more robust", explain: "It is now fitted to the test data too." },
        { id: "c", text: "The test data have become in-sample data", explain: "Right. They no longer give an unbiased check." },
        { id: "d", text: "You have done a walk-forward test", explain: "Walk-forward uses new, unseen windows each time." },
      ],
      correct: "c",
    },
    {
      id: "q3",
      prompt: "A backtest buys at the close of the bar whose close triggered the signal. What error is this?",
      options: [
        { id: "a", text: "Look-ahead bias", explain: "Right. The close is only known when the bar ends." },
        { id: "b", text: "Overfitting", explain: "That is about tuning, not timing." },
        { id: "c", text: "Survivorship bias", explain: "That is about which assets are in the data." },
        { id: "d", text: "No error, because closes are final", explain: "You cannot act on a close before it exists." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "What did Bajgrowicz and Scaillet (2012) find about technical rules on the Dow Jones?",
      options: [
        { id: "a", text: "The best rules were easy to pick in advance", explain: "They found the opposite." },
        { id: "b", text: "All rules lost money before costs", explain: "Some performed well before costs." },
        { id: "c", text: "Only Fibonacci rules survived", explain: "Fibonacci rules were not the subject." },
        { id: "d", text: "The best could not be picked in advance, and low costs offset performance", explain: "Right. That was their conclusion." },
      ],
      correct: "d",
    },
    {
      id: "q5",
      prompt: "Which rule is testable as written?",
      options: [
        { id: "a", text: "Buy when the trend looks strong", explain: "'Looks strong' cannot be coded." },
        { id: "b", text: "Buy next open when SMA 20 closes above SMA 50; sell next open on the reverse; 0.05% cost per side", explain: "Right. Entry, exit and costs are exact." },
        { id: "c", text: "Buy dips in a bull market", explain: "Neither 'dip' nor 'bull market' is defined." },
        { id: "d", text: "Sell when RSI is overbought, unless the trend is strong", explain: "The exception is not defined." },
      ],
      correct: "b",
    },
  ],
  practical: {
    title: "Write and split",
    instructions: "Planning only. Do not place any trades, and do not run the test yet.",
    steps: [
      "Write one complete rule: entry, exit, cost per side, position size.",
      "Choose and write down the in-sample and out-of-sample periods.",
      "Write how many settings you will allow yourself to try in sample.",
    ],
    reflectionPrompt: "What result on the out-of-sample data would make you abandon the rule?",
  },
  glossary: ["trading-rule", "backtest", "in-sample", "out-of-sample", "overfitting", "multiple-testing", "walk-forward"],
  next: "rm-risk-per-trade",
};
