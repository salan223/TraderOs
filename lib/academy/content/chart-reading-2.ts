import type { Lesson } from "../types";

/*
  Chart Reading (track 6), lessons 5–8. Simulated data only; see chart-reading-1.ts.
*/

const T = "chart-reading";

export const CR5_TIMEFRAMES: Lesson = {
  id: "cr-timeframes",
  trackId: T,
  order: 5,
  format: "full",
  title: "Timeframes",
  summary: "From seconds to months: how bars are built from smaller bars, why timeframes disagree, and the danger of switching timeframe to justify a trade.",
  minutes: 24,
  objectives: [
    "Explain what a timeframe is and name the common ones, from seconds to monthly.",
    "Build a higher-timeframe bar from smaller bars (aggregation).",
    "Relate timeframes to intraday, swing and position trading.",
    "Describe multi-timeframe analysis and why timeframes can disagree.",
    "Recognise the danger of switching timeframes until one agrees with you.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "The same market can look like it is rising on a daily chart, falling on an hourly chart and going nowhere on a five-minute chart, all at the same moment. None of those views is wrong; they answer different questions. Knowing how timeframes relate lets you choose one deliberately instead of drifting to whichever supports what you already wanted to do." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "One bar per period",
      blocks: [
        { kind: "p", text: "A [[timeframe]] is the length of time each bar covers: one second, one minute, five minutes, one hour, one day, one week, one month. A daily candle is simply the whole day's trading summarised as four prices." },
        { kind: "p", text: "Bars of a longer timeframe are made by [[aggregation|aggregating]] shorter ones: the open is the first small bar's open, the high is the highest high, the low is the lowest low, the close is the last small bar's close, and the volume is the sum." },
        { kind: "illustration", illustration: "timeframe-aggregation", caption: "Six shorter bars become one longer bar: the first open, the highest high, the lowest low and the last close. What happened inside the period is no longer visible." },
        { kind: "list", items: [
          "[[intraday|Intraday]] traders (including [[day-trading|day traders]]) open and close positions within a day and often use second-to-hourly charts.",
          "[[swing-trading|Swing traders]] hold for days to weeks and often use hourly to daily charts.",
          "[[position-trading|Position traders]] and investors hold for weeks to years and often use daily, weekly or monthly charts.",
        ] },
        { kind: "callout", tone: "info", title: "Matching timeframe to horizon", text: "Your chart's timeframe should fit how long you intend to hold. A daily-chart reason for a trade you will hold for ten minutes does not fit.", link: { lessonId: "trading-vs-investing", label: "Revisit time horizons" } },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Re-aggregate a chart, and build a daily candle",
      blocks: [
        { kind: "p", text: "Switch the timeframe of the same simulated ten days. Then drag the time-of-day slider to watch the last daily candle being built from its 5-minute bars: its open is fixed at the first bar, its high and low can change until the close." },
        { kind: "interactive", widget: "cr-timeframes", title: "Timeframes from the same trades", caption: "Ten simulated trading days of 5-minute bars (6.5-hour sessions). Hourly bars end with a half-hour bar because the session is 6.5 hours long." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "A real-world example, described",
      blocks: [
        { kind: "p", text: "Session boundaries matter. A daily candle for a US share usually covers regular hours only, so it starts with the opening auction. A daily candle for spot [[forex]] has no single official open; providers choose a cut-off time, often 5 pm New York time. Two providers using different cut-offs will draw different daily candles for the same currency pair, with different highs, lows and closes." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: aggregation and inconsistency",
      blocks: [
        { kind: "concept-card", card: {
          name: "Aggregation (resampling) of bars",
          what: "Combining shorter bars into longer ones by taking the first open, highest high, lowest low, last close and total volume.",
          whyItExists: "Markets trade continuously, but people analyse them in chunks of chosen sizes.",
          problemSolved: "It gives a consistent way to view the same trades at different scales.",
          mechanics: "Group bars by period boundaries (for example each trading day), then combine each group. The last group is incomplete until its period ends.",
          math: "O = O₁; H = max(Hᵢ); L = min(Lᵢ); C = Cₙ; V = ΣVᵢ.",
          howTradersUseIt: "To view higher-timeframe context, and to check that a lower-timeframe signal is not fighting a larger move.",
          whenUseful: "Whenever you compare timeframes or build your own bars from data.",
          whenItFails: "When period boundaries differ (time zones, session cut-offs) or data has gaps, two aggregations of the 'same' period disagree.",
          limitations: "Aggregated bars lose the order of events inside them: you cannot tell whether the high came before the low.",
          misconceptions: "That a higher timeframe is 'truer'. It is the same data, summarised more coarsely.",
          realExample: "Seventy-eight 5-minute bars make one 6.5-hour US trading day.",
          exercise: "In the illustration, compare the last daily candle with the 5-minute bars of that day.",
          practicalTest: "Given four hourly bars, write down the four-hour bar they make.",
        } },
        { kind: "p", text: "[[multi-timeframe-analysis|Multi-timeframe analysis]] uses a higher timeframe for context and a lower one for detail. It helps only if the roles are fixed in advance. Because each timeframe summarises over a different window, disagreement between them is normal, not a contradiction." },
        { kind: "p", text: "The danger is timeframe shopping: looking at one chart, not liking it, and switching until one agrees with the trade you wanted. With many timeframes to choose from, one will almost always agree. Decide your timeframes, and what each is for, before you look." },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Top-down analysis", view: "Start on a higher timeframe for context (trend, major levels), then use a lower one for timing, with rules for what happens if they disagree." },
          { name: "Single-timeframe systems", view: "Many systematic strategies use one timeframe consistently, which avoids discretion in switching." },
          { name: "Execution desks", view: "Care about intraday patterns of liquidity (open, close, news times) rather than chart patterns." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Switching timeframes until one agrees with you.", why: "Some timeframe nearly always will.", instead: "Write down your timeframes and their roles before looking." },
          { mistake: "Treating an unfinished bar as final.", why: "The current bar's high, low and close can still change.", instead: "Wait for the bar to close, or say clearly that it is unfinished." },
          { mistake: "Mixing a short holding period with a long-timeframe reason.", why: "The reason and the trade work on different scales.", instead: "Match the chart to the holding period." },
          { mistake: "Ignoring session cut-offs.", why: "Different providers draw different daily bars.", instead: "Check how your provider defines a day." },
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
            "A timeframe is the time each bar covers.",
            "Higher-timeframe bars are aggregations of lower ones.",
            "Timeframes summarise over different windows, so they often disagree.",
            "Fix your timeframes and their roles before looking at a chart.",
          ],
          equations: [
            { label: "Aggregated bar", formula: "O = first O; H = max H; L = min L; C = last C; V = sum V" },
          ],
          implications: [
            "Say which timeframe every observation comes from.",
            "Treat timeframe disagreement as information about scale, not as a choice of answers.",
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
          "Pick one market. Write down the direction you see on the weekly, daily and hourly charts, in that order, without switching back.",
          "Find out at what time your charting provider starts and ends a 'day' for forex or crypto.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "cr-timeframes-ex",
    title: "Build the hourly bar",
    prompt: "Four 15-minute bars: (O 100, H 104, L 99, C 103), (O 103, H 108, L 102, C 106), (O 106, H 107, L 97, C 98), (O 98, H 101, L 97.5, C 100). What is the HIGH minus the LOW of the hourly bar they make?",
    unit: "price units",
    answer: 11,
    tolerance: 0.001,
    hint: "The hourly high is the highest of the four highs; the low is the lowest of the four lows.",
    solution: "High = max(104, 108, 107, 101) = 108. Low = min(99, 102, 97, 97.5) = 97. Range = 108 − 97 = 11.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "What is the open of a daily bar built from 5-minute bars?",
      options: [
        { id: "a", text: "The average of all the 5-minute opens during that trading day", explain: "Aggregation does not average." },
        { id: "b", text: "The open of the first 5-minute bar of the day", explain: "Right." },
        { id: "c", text: "The previous day's close", explain: "It may differ because of a gap." },
        { id: "d", text: "The lowest 5-minute open of the day", explain: "No: the first one." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "The daily chart looks like it is rising, the hourly like it is falling. What is the best reading?",
      options: [
        { id: "a", text: "One of the charts must be wrong", explain: "Both summarise the same trades over different windows." },
        { id: "b", text: "The hourly is more accurate because it has more bars", explain: "More bars is more detail, not more truth." },
        { id: "c", text: "Prices fell recently within a longer rise; scale matters", explain: "Right. Disagreement reflects different windows." },
        { id: "d", text: "The daily is right, because the higher timeframe always wins", explain: "Neither is 'right'; they answer different questions." },
      ],
      correct: "c",
    },
    {
      id: "q3",
      prompt: "A trader wants to buy. The daily chart looks weak, so she checks the 4-hour, then the 1-hour, and buys when the 15-minute looks strong. What went wrong?",
      options: [
        { id: "a", text: "Nothing: she used multi-timeframe analysis", explain: "Real multi-timeframe analysis fixes roles in advance." },
        { id: "b", text: "She should have started with the 15-minute chart and worked upwards", explain: "The order is not the problem; the switching is." },
        { id: "c", text: "She used too few timeframes", explain: "More timeframes would make shopping easier, not better." },
        { id: "d", text: "She kept switching until a chart agreed with her plan", explain: "Right. That is timeframe shopping." },
      ],
      correct: "d",
    },
    {
      id: "q4",
      prompt: "Which timeframes does a swing trader most often use?",
      options: [
        { id: "a", text: "Hourly to daily charts, for holds of days to weeks", explain: "Right." },
        { id: "b", text: "Tick charts only", explain: "That is more typical of very short-term trading." },
        { id: "c", text: "Monthly charts only", explain: "That suits long-term investing." },
        { id: "d", text: "Charts with no time axis only", explain: "Some may use them, but they are not typical." },
      ],
      correct: "a",
    },
    {
      id: "q5",
      prompt: "It is 11:00 and the market closes at 16:00. Which part of today's daily candle is already final?",
      options: [
        { id: "a", text: "The high", explain: "A higher price can still trade later." },
        { id: "b", text: "The close", explain: "The close is the last trade of the day, not known yet." },
        { id: "c", text: "The open", explain: "Right. Only the open is fixed once the first trade prints." },
        { id: "d", text: "All four prices", explain: "Three of them can still change." },
      ],
      correct: "c",
    },
  ],
  practical: {
    title: "Fix your timeframes first",
    instructions: "Use any free chart. Observe only.",
    steps: [
      "Choose a holding period you are interested in (for example a few days).",
      "Write down one context timeframe and one detail timeframe that fit it, and what each is for.",
      "Look at both, and write what each shows, without opening any other timeframe.",
      "Note one way the two disagree, and what that disagreement means.",
    ],
    reflectionPrompt: "Did you feel the urge to check another timeframe? What were you hoping it would show?",
  },
  glossary: ["timeframe", "aggregation", "intraday", "swing-trading", "position-trading", "multi-timeframe-analysis"],
  next: "cr-structure",
};

export const CR6_STRUCTURE: Lesson = {
  id: "cr-structure",
  trackId: T,
  order: 6,
  format: "full",
  title: "Price movement and structure",
  summary: "Swing highs and lows, higher highs and lower lows, trends, ranges, breakouts and pullbacks, identified by you before anything is labelled.",
  minutes: 30,
  objectives: [
    "Identify swing highs and swing lows on a chart, using an explicit rule.",
    "Classify swings as higher highs, higher lows, lower highs and lower lows.",
    "Describe trends, ranges and consolidation in terms of swing structure.",
    "Explain breakouts, failed breakouts, reversals, pullbacks, retracements, impulses and corrections.",
    "Explain why swings are only confirmed after the fact.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Most chart-reading vocabulary (trend, range, breakout, pullback) is built on one idea: the turning points of price, called swings. If you can identify swings consistently, and say exactly how you did it, you can describe a chart precisely instead of vaguely. If you cannot, every later idea rests on sand." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Turning points",
      blocks: [
        { kind: "p", text: "A [[swing-high|swing high]] is a peak: a bar whose high is above the highs of the bars around it. A [[swing-low|swing low]] is a trough. Compare each swing with the previous swing of the same kind:" },
        { kind: "list", items: [
          "[[higher-high|Higher high]] (HH) and [[higher-low|higher low]] (HL): each peak and each trough above the last. This is what most people mean by an up-trend.",
          "[[lower-high|Lower high]] (LH) and [[lower-low|lower low]] (LL): each peak and trough below the last: a down-trend.",
          "A mix (for example higher lows with lower highs, or peaks and troughs at similar levels) is a [[trading-range|range]] or a transition.",
        ] },
        { kind: "illustration", illustration: "swing-structure", caption: "Swing labels. Each high is compared with the previous high, and each low with the previous low: HH and HL in an up-trend, LH and LL in a down-trend." },
        { kind: "list", items: [
          "[[consolidation|Consolidation]]: a period of smaller, overlapping bars, often after a large move.",
          "[[breakout|Breakout]]: price moving beyond the edge of a range or beyond a prior swing. A [[false-breakout|failed (false) breakout]] moves beyond it and then returns inside.",
          "Reversal: the structure changes direction, for example from HH/HL to LH/LL.",
          "[[pullback|Pullback]] (or [[retracement|retracement]]): a move against the trend that does not break its structure, often measured as a percentage of the prior move.",
          "[[impulse-move|Impulse]]: a strong move in the trend's direction. Correction: the slower move against it that follows.",
        ] },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Mark the structure yourself",
      blocks: [
        { kind: "p", text: "Before anything is labelled, mark the swing highs and lows you see. Then check, and compare with what one explicit rule produces. Change the rule's setting to see how much the 'answer' depends on it." },
        { kind: "interactive", widget: "cr-structure", title: "Mark the swings, then check", caption: "Simulated daily prices. The answer uses one common rule (a bar beats the highs or lows of N bars on each side); other reasonable rules give other answers." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "A real-world example, described",
      blocks: [
        { kind: "p", text: "After a long rise in a major stock index, a sharp one-week fall takes price below the most recent higher low. Some analysts call it a reversal of structure; others, looking at weekly bars, call it a pullback within a larger up-trend. Both apply consistent rules, at different scales. What they should not do is change their rule after the fact to keep their view." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: defining a swing",
      blocks: [
        { kind: "concept-card", card: {
          name: "Swing (pivot) detection",
          what: "A rule that decides which bars are turning points, for example 'a bar whose high is above the highs of the k bars on each side'.",
          whyItExists: "Eyeballing swings is inconsistent; a rule lets you and a computer get the same answer.",
          problemSolved: "It makes words like trend, range and breakout testable.",
          mechanics: "For each bar, compare its high with the k bars before and after. If it is the highest, it is a swing high (likewise for lows). Merge consecutive swings of the same kind, keeping the more extreme one.",
          math: "Swing high at i if Hᵢ > Hⱼ for all j in [i − k, i + k], j ≠ i. Retracement % = (move against the trend) ÷ (prior impulse) × 100.",
          howTradersUseIt: "To label structure, place stops beyond swings, and define when a trend view is wrong.",
          whenUseful: "Whenever you describe a chart's structure or write rules about it.",
          whenItFails: "In choppy markets many small swings appear; in fast markets swings can be skipped by gaps.",
          limitations: "A swing at bar i is only confirmed k bars later. Anything that uses swings in real time is working with a delay.",
          misconceptions: "That swing points are objective facts. They depend entirely on the rule and the timeframe.",
          realExample: "With k = 2, a peak needs two lower highs on each side; with k = 5, small peaks disappear and the structure can change from 'mixed' to 'up-trend'.",
          exercise: "In the illustration, mark swings, check, then change the rule from 2 to 5 bars.",
          practicalTest: "Write your swing rule in one sentence that someone else could apply exactly.",
        } },
        { kind: "p", text: "Because a swing needs bars after it, the most recent part of any chart is unlabelled. Charts that seem to label swings 'in real time' are often redrawing their labels as new bars arrive. In a test, using a swing before it was confirmed is a form of look-ahead: it uses information that did not yet exist." },
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
          practicalMeaning: "Swing-based shapes can be defined objectively, which is the first step to testing them; that is different from proving they make money.",
          status: "disputed",
          url: "https://web.mit.edu/~alo/www/Papers/techanal.html",
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
          { name: "Dow-theory style analysis", view: "Reads trends from successive highs and lows and treats a change in that sequence as the main signal of a change in trend." },
          { name: "Price-action traders", view: "Mark key swings, watch for breakouts and failed breakouts, and place stops beyond the swing that would prove them wrong." },
          { name: "Quantitative analysts", view: "Use explicit pivot or smoothing rules, and are careful to use only swings that were confirmed at the time." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Marking swings with hindsight.", why: "The last swing is never confirmed when you need it.", instead: "Only use swings that were confirmed by later bars at the time." },
          { mistake: "Changing the swing rule to fit a view.", why: "Any view can be supported by some rule.", instead: "Fix the rule first." },
          { mistake: "Calling every dip a pullback.", why: "Some dips are the start of a reversal.", instead: "Decide in advance which swing, if broken, ends your trend view." },
          { mistake: "Treating a breakout as a certainty.", why: "Failed breakouts are common.", instead: "Plan for the breakout failing." },
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
            "Swings are turning points defined by a rule.",
            "HH + HL: up-trend structure. LH + LL: down-trend. Mixed: range or transition.",
            "Breakouts can fail; pullbacks can become reversals.",
            "Swings are confirmed only after the fact.",
          ],
          equations: [
            { label: "Swing high (k bars)", formula: "Hᵢ > every H in the k bars before and after i" },
            { label: "Retracement", formula: "retracement % = pullback size ÷ prior impulse × 100" },
          ],
          implications: [
            "State your swing rule and timeframe whenever you describe structure.",
            "Know which swing would prove your reading wrong.",
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
          "Print or screenshot 60 daily bars of any market. Mark swing highs and lows with a rule of 3 bars on each side.",
          "Label each swing HH, LH, HL or LL and write down the structure.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "order",
    id: "cr-structure-ex",
    title: "Read a structure in order",
    prompt: "Put these steps for describing a chart's structure in a sensible order.",
    items: [
      { id: "rule", text: "Choose the timeframe and write the swing rule" },
      { id: "mark", text: "Mark the confirmed swing highs and lows" },
      { id: "label", text: "Label each swing against the previous one (HH, LH, HL, LL)" },
      { id: "name", text: "Name the structure: up-trend, down-trend or range" },
      { id: "invalid", text: "Write down which swing, if broken, would change that reading" },
    ],
    explanation: "Rule first, then marks, then labels, then the conclusion, then what would prove it wrong.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "Peaks at 50, 54, 58 and troughs at 46, 49, 52. What is the structure?",
      options: [
        { id: "a", text: "Down-trend: lower highs and lower lows", explain: "Both peaks and troughs are rising." },
        { id: "b", text: "Range: highs and lows at similar levels", explain: "They are clearly rising." },
        { id: "c", text: "Up-trend: higher highs and higher lows", explain: "Right." },
        { id: "d", text: "Reversal: the trend just changed", explain: "Nothing changed direction." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "Price rises above the top of a two-month range, then closes back inside it two days later. What is this called?",
      options: [
        { id: "a", text: "A failed (false) breakout", explain: "Right." },
        { id: "b", text: "A confirmed breakout", explain: "It did not hold." },
        { id: "c", text: "A higher low", explain: "That is a trough, not a move beyond a range." },
        { id: "d", text: "An impulse move", explain: "The return inside is the key feature." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      prompt: "Why can't the most recent bars of a chart be labelled as swings yet?",
      options: [
        { id: "a", text: "Because charting software hides them", explain: "Software can show them; the problem is logical." },
        { id: "b", text: "Because the bars that would confirm them have not happened", explain: "Right. A swing needs later bars." },
        { id: "c", text: "Because recent bars are less accurate", explain: "They are just as accurate." },
        { id: "d", text: "Because swings only appear on weekly charts, not on daily ones", explain: "Swings exist on every timeframe." },
      ],
      correct: "b",
    },
    {
      id: "q4",
      prompt: "A rally runs from 100 to 120, then price falls to 112. What retracement is that?",
      options: [
        { id: "a", text: "8%", explain: "That is the fall as a share of 100, not of the move." },
        { id: "b", text: "60%", explain: "Check: 8 ÷ 20." },
        { id: "c", text: "12%", explain: "The fall is 8, not 12." },
        { id: "d", text: "40% of the prior move", explain: "Right. 8 ÷ 20 = 40%." },
      ],
      correct: "d",
    },
    {
      id: "q5",
      prompt: "Two analysts disagree: one sees an up-trend, the other a range, on the same chart. What is most likely?",
      options: [
        { id: "a", text: "One of them simply does not know how to read a chart properly", explain: "Both can be consistent with different rules." },
        { id: "b", text: "They use different swing rules or timeframes", explain: "Right. Structure depends on definitions." },
        { id: "c", text: "The chart data must differ", explain: "Possible, but rules are the usual cause." },
        { id: "d", text: "The market must be about to reverse", explain: "Disagreement is not a forecast." },
      ],
      correct: "b",
    },
  ],
  practical: {
    title: "Label a real chart",
    instructions: "Use any free daily chart. Observe only.",
    steps: [
      "Write your swing rule (for example 3 bars each side) and timeframe.",
      "Mark the last six confirmed swings and label them.",
      "Name the structure and write which swing would change your reading.",
      "Check again in a week: did new swings confirm or change it?",
    ],
    reflectionPrompt: "Where were you most tempted to mark a swing that your rule did not allow?",
  },
  glossary: ["swing-high", "swing-low", "higher-high", "higher-low", "lower-high", "lower-low", "trading-range", "consolidation", "breakout", "false-breakout", "pullback", "retracement", "impulse-move"],
  next: "cr-trends",
};

export const CR7_TRENDS: Lesson = {
  id: "cr-trends",
  trackId: T,
  order: 7,
  format: "full",
  title: "Trend identification",
  summary: "Five ways to judge a trend, how they disagree, the difference between trend, momentum and volatility, and how to make trend calls less subjective.",
  minutes: 30,
  objectives: [
    "Identify trends visually, by swing structure, by moving averages and by regression slope.",
    "Explain directional movement (ADX) and the efficiency ratio as measures of trend strength or persistence.",
    "Distinguish trend from momentum and from volatility.",
    "Explain why trend identification is subjective and name methods that reduce subjectivity.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "'The trend is up' is probably the most common sentence in chart analysis, and one of the vaguest. Up over what window, measured how, and how strongly? Different methods give different answers on the same chart. Choosing a method and sticking to it makes your trend calls consistent and testable." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Five ways to call a trend",
      blocks: [
        { kind: "list", items: [
          "Visual: looking at the chart. Fast, but easily swayed by scale, timeframe and what you hope to see.",
          "Swing structure: HH and HL for up, LH and LL for down (previous lesson).",
          "[[moving-average|Moving averages]]: the average close over the last n bars. Price above a rising average, or a shorter average above a longer one, is a common definition of an up-trend.",
          "[[linear-regression|Regression slope]]: the slope of the best-fitting straight line through the last n closes, with r² showing how well a straight line fits.",
          "Directional movement ([[adx|ADX]]) and the [[efficiency-ratio|efficiency ratio]]: measures of how directional recent movement has been, not of which way.",
        ] },
        { kind: "illustration", illustration: "trend-vs-range", caption: "A trend makes net progress one way; a range moves back and forth between a ceiling and a floor. Which one you see also depends on the window you look at." },
        { kind: "p", text: "A [[trend]] is a persistent direction over a chosen window. [[momentum|Momentum]] is the speed of recent change, such as the percentage change over the last 10 bars; it can turn before a longer trend does. [[volatility|Volatility]] is how big the swings are; a market can be very volatile with no trend, or trend quietly. The [[average-true-range|average true range]] is a common volatility measure." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Compare the methods",
      blocks: [
        { kind: "p", text: "Move through time with the first slider and change the lookback with the second. Watch the methods agree, then disagree." },
        { kind: "interactive", widget: "cr-trend-tools", title: "Five trend methods on one chart", caption: "Simulated prices with changing regimes. Every method only uses bars up to the chosen end bar, as it would in real time." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "A real-world example, described",
      blocks: [
        { kind: "p", text: "Financial media often report that an index has crossed above or below its 200-day moving average as if it were news about the trend. It is one definition applied to one window. Over the same weeks, a 50-day average, a regression slope or the swing structure can say something different, and the 200-day average itself reacts slowly because it includes almost a year of prices." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: measuring trend and strength",
      blocks: [
        { kind: "concept-card", card: {
          name: "ADX (average directional index)",
          what: "A 0–100 measure, from J. Welles Wilder, of how directional recent price movement has been, in either direction.",
          whyItExists: "Traders wanted a number for 'is this market trending or going sideways?', separate from direction.",
          problemSolved: "It separates strongly directional periods from back-and-forth ones.",
          mechanics: "Compare each bar's high and low with the previous bar's to get upward and downward movement (+DM, −DM). Smooth them and divide by the average true range to get +DI and −DI. DX = |+DI − −DI| ÷ (+DI + −DI) × 100; ADX is a smoothed DX.",
          math: "+DM = H − H₋₁ if larger than L₋₁ − L and positive, else 0 (and the mirror for −DM). DX = 100 × |+DI − −DI| ÷ (+DI + −DI). ADX = Wilder-smoothed DX over n bars (often 14).",
          howTradersUseIt: "Some treat ADX above about 25 as 'trending' and below about 20 as 'not trending', and use +DI vs −DI for direction. These thresholds are conventions.",
          whenUseful: "To decide whether trend-following or range-based ideas fit current conditions, as one input.",
          whenItFails: "It lags: by the time ADX is high, much of the move may be over. It can stay low in slow, steady trends.",
          limitations: "No direction by itself; sensitive to the smoothing length; describes the past.",
          misconceptions: "That a high ADX means 'up'. It means directional, either way.",
          realExample: "In the illustration, a steady rise gives a high ADX with +DI leading; a sideways period gives a low ADX.",
          exercise: "Find a point in the illustration where ADX is high while the moving averages say 'mixed'.",
          practicalTest: "Explain why a falling market can have a rising ADX.",
        } },
        { kind: "deeper", title: "Regression slope and reducing subjectivity", blocks: [
          { kind: "p", text: "Regression slope: fit y = a + b·x through the last n closes (x = 0, 1, 2…). The slope b is the average change per bar; dividing by the price gives a percentage per bar. r² (0–1) says how much of the variation a straight line explains; a slope with a low r² is a weak description. The efficiency ratio (from Perry Kaufman) is the net move over n bars divided by the total distance travelled: 1 for a straight line, near 0 for pure back-and-forth." },
          { kind: "p", text: "Reducing subjectivity: fix one or two methods, their lookback and their thresholds in advance; write them down; apply them the same way every time; and check them on data you did not use to choose them." },
        ] },
        { kind: "research", research: {
          title: "What Do We Know About The Profitability Of Technical Analysis?",
          authors: "Cheol-Ho Park and Scott H. Irwin",
          year: 2007,
          venue: "Journal of Economic Surveys 21(4), 786–826",
          peerReviewed: true,
          question: "What does the published evidence say about whether technical trading rules (including trend-following rules) are profitable?",
          methodology: "A review of early and modern empirical studies of technical trading rules.",
          data: "95 'modern' studies, among others, across stock, currency and futures markets.",
          findings: "Of the 95 modern studies, 56 found positive results, 20 negative and 19 mixed. The authors highlighted problems in many tests, including data snooping, choosing rules after the fact and difficulties in estimating risk and transaction costs.",
          limitations: "A survey of other studies, which differ in quality and method; publication bias may favour positive results.",
          practicalMeaning: "The evidence is mixed and often weakened by testing problems. Treat any trend rule as a hypothesis to test carefully.",
          status: "disputed",
          url: "https://ideas.repec.org/a/bla/jecsur/v21y2007i4p786-826.html",
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
          { name: "Trend followers", view: "Use simple, fixed rules (for example moving-average crossovers or breakouts) across many markets, accept many small losses and rely on occasional large trends." },
          { name: "Swing-structure readers", view: "Define trend by highs and lows and invalidate it when a key swing breaks." },
          { name: "Statistical approaches", view: "Measure slope and fit, or time-series momentum (past returns over a fixed window), and test across markets and periods." },
          { name: "Discretionary macro", view: "Use trends as context but care more about what is driving them." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Calling a trend without naming the window.", why: "Every market trends on some window.", instead: "Say 'up over the last 50 daily bars, by price above a rising 50-day average'." },
          { mistake: "Confusing volatility with trend.", why: "Big swings can go nowhere.", instead: "Measure direction and volatility separately." },
          { mistake: "Reading ADX as direction.", why: "It measures directionality only.", instead: "Pair it with +DI/−DI or another direction measure." },
          { mistake: "Trying methods until one agrees.", why: "That is the timeframe-shopping trap again.", instead: "Fix your method in advance." },
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
            "Trend is direction over a chosen window, measured by a chosen method.",
            "Methods (visual, swings, averages, regression, ADX, efficiency) often disagree.",
            "Momentum is speed of change; volatility is size of swings; both differ from trend.",
            "Fixed, written rules reduce subjectivity.",
          ],
          equations: [
            { label: "Simple moving average", formula: "SMAₙ = (C₁ + … + Cₙ) ÷ n" },
            { label: "Regression line", formula: "C ≈ a + b·x; slope b per bar; r² from 0 to 1" },
            { label: "Efficiency ratio", formula: "ER = |Cₜ − Cₜ₋ₙ| ÷ Σ|Cᵢ − Cᵢ₋₁|" },
            { label: "Directional index", formula: "DX = 100 × |+DI − −DI| ÷ (+DI + −DI)" },
          ],
          implications: [
            "Write your trend definition before looking at a chart.",
            "Report direction, strength and volatility as separate facts.",
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
          "Write a one-sentence trend rule using a moving average and a lookback.",
          "Apply it to three markets on daily charts and record the answer, then apply the swing-structure rule and compare.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "match",
    id: "cr-trends-ex",
    title: "What does each measure tell you?",
    prompt: "Match each measure with the question it answers.",
    pairs: [
      { id: "ma", left: "Price vs a rising moving average", right: "Has price been above its recent average, and is that average rising?" },
      { id: "reg", left: "Regression slope and r²", right: "What is the average change per bar, and how straight was the path?" },
      { id: "adx", left: "ADX", right: "How directional has recent movement been, in either direction?" },
      { id: "atr", left: "Average true range", right: "How large are typical bar-to-bar moves?" },
      { id: "roc", left: "10-bar percentage change", right: "How fast has price moved recently (momentum)?" },
    ],
    explanation: "Direction, straightness, directionality, volatility and momentum are different questions with different measures.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "ADX has risen from 15 to 35 while price fell steadily. What does that suggest?",
      options: [
        { id: "a", text: "An up-trend is starting", explain: "ADX has no direction; price fell." },
        { id: "b", text: "Volatility has collapsed", explain: "ADX is not a volatility measure." },
        { id: "c", text: "The market is going sideways, because ADX does not show direction", explain: "A rising ADX suggests the opposite." },
        { id: "d", text: "Movement has become more directional, here downward", explain: "Right." },
      ],
      correct: "d",
    },
    {
      id: "q2",
      prompt: "A regression line over 40 bars has a positive slope but r² of 0.05. What is the fairest description?",
      options: [
        { id: "a", text: "A slight average rise, but a straight line describes the path poorly", explain: "Right." },
        { id: "b", text: "A strong, clean up-trend", explain: "A low r² means the path was far from straight." },
        { id: "c", text: "A down-trend", explain: "The slope is positive." },
        { id: "d", text: "A prediction that price will keep rising", explain: "A fitted line describes the past." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      prompt: "Which pair is most clearly different concepts?",
      options: [
        { id: "a", text: "Higher highs and higher lows, and an up-trend", explain: "These describe the same idea." },
        { id: "b", text: "Volatility and trend", explain: "Right. Big swings can go nowhere; quiet markets can trend." },
        { id: "c", text: "A rising moving average and recent gains", explain: "These are closely linked." },
        { id: "d", text: "Swing low and trough", explain: "Two names for the same thing." },
      ],
      correct: "b",
    },
    {
      id: "q4",
      prompt: "Closes over 4 bars: 10, 11, 10, 11, 12. What is the efficiency ratio over those 4 bar-to-bar steps?",
      options: [
        { id: "a", text: "1.0", explain: "The path was not straight." },
        { id: "b", text: "0.25", explain: "Net move is 2, not 1." },
        { id: "c", text: "0.5", explain: "Right. Net move 2 ÷ total distance 4." },
        { id: "d", text: "2.0", explain: "The ratio cannot exceed 1." },
      ],
      correct: "c",
    },
    {
      id: "q5",
      prompt: "What best reduces subjectivity in trend calls?",
      options: [
        { id: "a", text: "Looking at more and more indicators until most of them agree with each other", explain: "That invites cherry-picking." },
        { id: "b", text: "Trusting your first visual impression", explain: "Visual impressions depend on scale and hope." },
        { id: "c", text: "Writing down a fixed method, window and threshold in advance", explain: "Right." },
        { id: "d", text: "Following what a popular account says", explain: "That replaces your judgement with someone else's." },
      ],
      correct: "c",
    },
  ],
  practical: {
    title: "One rule, three markets",
    instructions: "Use free daily charts. Observe only.",
    steps: [
      "Write a trend rule: method, lookback and thresholds.",
      "Apply it to three different markets and record each answer.",
      "Apply a second method (for example swing structure) and record where it disagrees.",
      "Note which market had high volatility but no clear trend.",
    ],
    reflectionPrompt: "How often did your two methods agree, and what did the disagreements have in common?",
  },
  glossary: ["trend", "moving-average", "linear-regression", "adx", "efficiency-ratio", "momentum", "average-true-range"],
  next: "cr-volume",
};

export const CR8_VOLUME: Lesson = {
  id: "cr-volume",
  trackId: T,
  order: 8,
  format: "full",
  title: "Volume",
  summary: "What volume measures in stocks, futures, crypto and forex, relative volume and spikes, and why one venue's volume may not represent the market.",
  minutes: 26,
  objectives: [
    "Explain what volume represents and why it cannot show who was 'in control'.",
    "Describe how volume is reported for stocks, futures, crypto and spot forex (tick volume).",
    "Compute relative volume and use it to identify unusual activity.",
    "Explain the limits of volume data in fragmented or decentralised markets, including fake volume.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Volume is the second most common thing on a chart after price, and it is often misread. A volume bar can come from one exchange or all of them, can count units or just price updates, and in some markets can include trades that were not genuine. Knowing what your volume bar actually counts decides whether it means anything." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "What volume is",
      blocks: [
        { kind: "p", text: "[[volume|Volume]] is the amount traded in a period: shares for stocks, contracts for [[futures]], coins for crypto. Every unit bought was sold by someone, so volume measures activity, not buying or selling pressure on its own." },
        { kind: "list", items: [
          "Stocks: in the US, trades from many venues are combined into [[consolidated-volume|consolidated volume]]. Some charts show only one exchange's volume, which is a fraction of the total.",
          "Futures: trade on one main exchange per contract, so volume is fairly complete for that contract (but split across expiry months).",
          "Crypto: each [[crypto-exchange|crypto exchange]] reports its own volume. A chart usually shows one exchange's spot volume, while trading happens on many exchanges and in derivatives.",
          "Spot forex: there is no central exchange, so most retail charts show [[tick-volume|tick volume]], the number of price updates from one provider, not the amount traded.",
        ] },
        { kind: "p", text: "[[relative-volume|Relative volume]] compares a bar's volume with recent normal volume: 3× means three times the recent average. A spike is a bar with unusually high relative volume, often on news, at the open or close, or around a large move." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Relative volume and venues",
      blocks: [
        { kind: "p", text: "Spikes are highlighted on the chart. Switch between the all-venue total, one venue at a time, and a tick count, and see how the spikes move." },
        { kind: "interactive", widget: "cr-volume", title: "Volume, venues and spikes", caption: "Simulated prices and volumes. Venue shares and tick counts are made up to show how a partial view can differ from the whole." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "A real-world example, described",
      blocks: [
        { kind: "p", text: "Crypto exchange rankings by reported volume have been questioned repeatedly, because some exchanges were found to report trading that was not genuine. A chart's volume bar on such an exchange can show activity that never reflected real buyers and sellers. Even on genuine exchanges, one venue shows only its own share of a market traded across many venues." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: relative volume and fragmentation",
      blocks: [
        { kind: "concept-card", card: {
          name: "Relative volume",
          what: "A bar's volume divided by the average volume of the previous n bars.",
          whyItExists: "Raw volume differs hugely between assets and times of day; a ratio shows what is unusual for this market.",
          problemSolved: "It makes 'high volume' a measurable, comparable statement.",
          mechanics: "Average the last n bars' volumes (not including the current one) and divide. Intraday, compare with the same time of day on previous days, because the open and close are normally busier.",
          math: "RVOL = Vₜ ÷ ((Vₜ₋₁ + … + Vₜ₋ₙ) ÷ n).",
          howTradersUseIt: "To spot unusual interest, to judge whether a breakout came with more activity than normal, and to avoid thin, illiquid periods.",
          whenUseful: "When comparing activity across days or assets.",
          whenItFails: "When the volume data is partial (one venue), fake, or tick-based.",
          limitations: "High volume says activity rose, not why or in which direction anyone was 'pushing'.",
          misconceptions: "That high volume on a green candle means buyers 'won'. Every unit had a seller too.",
          realExample: "Volumes 10, 10, 10, then 30: relative volume of the last bar over 3 bars is 3×.",
          exercise: "In the illustration, find a spike in venue A that is not a spike in the total.",
          practicalTest: "For one stock, compare the volume on your chart with the consolidated daily volume published elsewhere.",
        } },
        { kind: "deeper", title: "Fragmentation across venues", blocks: [
          { kind: "p", text: "Fragmentation: when the same asset trades on many venues, each venue's volume is a slice of the total, and slices can move differently as traders shift between venues. In decentralised markets (spot forex, much of crypto) there may be no complete record at all. Volume bars: some traders sample by volume itself (lesson 2), which turns volume into the clock rather than a measurement." },
        ] },
        { kind: "research", research: {
          title: "Crypto Wash Trading",
          authors: "Lin William Cong, Xi Li, Ke Tang and Yang Yang",
          year: 2023,
          venue: "Management Science 69(11), 6427–6454",
          peerReviewed: true,
          question: "How much of the trading volume reported by crypto exchanges is fake (wash trading)?",
          methodology: "Statistical and behavioural tests based on regularities of genuine trading (for example first-digit distributions and the rounding of trade sizes).",
          data: "29 centralised crypto exchanges.",
          findings: "Regulated exchanges showed patterns consistent with genuine trading. Unregulated exchanges showed anomalies, and the authors estimated that wash trades averaged over 70% of reported volume on unregulated exchanges.",
          limitations: "Indirect statistical detection; one period; exchanges and rules have changed since.",
          practicalMeaning: "Reported volume on some venues may not reflect real trading. Check where volume comes from before reading anything into it.",
          status: "regime-sensitive",
          url: "https://econpapers.repec.org/RePEc:inm:ormnsc:v:69:y:2023:i:11:p:6427-6454",
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
          { name: "Volume confirmation", view: "Some traders want breakouts to come with higher-than-normal relative volume, as a sign of broad participation." },
          { name: "Liquidity focus", view: "Execution traders use volume profiles by time of day to decide when large orders can be done with less impact." },
          { name: "Data scepticism", view: "Analysts check whether volume is consolidated, single-venue or tick-based, and in crypto whether the exchange is regulated, before using it." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Reading volume as buying or selling pressure.", why: "Every unit has a buyer and a seller.", instead: "Read volume as activity, alongside price." },
          { mistake: "Treating one venue as the whole market.", why: "Venue shares change.", instead: "Find out what your volume covers." },
          { mistake: "Comparing tick volume with real volume.", why: "Tick volume counts updates, not size.", instead: "Use tick volume only for relative comparisons within one feed." },
          { mistake: "Comparing an intraday bar with the daily average.", why: "Activity varies by time of day.", instead: "Compare with the same time on previous days." },
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
            "Volume is the amount traded; it measures activity, not who 'won'.",
            "Stocks may show consolidated or single-venue volume; futures are fairly complete; crypto is per exchange; spot forex is usually tick volume.",
            "Relative volume compares a bar with recent normal.",
            "Fragmented and decentralised markets, and fake volume, limit what volume can tell you.",
          ],
          equations: [
            { label: "Relative volume", formula: "RVOL = Vₜ ÷ average(V over previous n bars)" },
          ],
          implications: [
            "Check the source of volume data before using it.",
            "Use relative, not absolute, volume when judging what is unusual.",
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
          "Find out whether your charting app shows consolidated or single-exchange volume for US shares.",
          "For one crypto asset, compare the 24-hour volume shown on two different exchanges.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "cr-volume-ex",
    title: "Relative volume",
    prompt: "The last five days' volumes were 2.0m, 2.4m, 1.6m, 2.2m and 1.8m shares. Today's volume is 6.0m. What is today's relative volume over those five days?",
    unit: "times average",
    answer: 3,
    tolerance: 0.01,
    hint: "Average the five previous days, then divide today's volume by that average.",
    solution: "Average = (2.0 + 2.4 + 1.6 + 2.2 + 1.8) ÷ 5 = 10.0 ÷ 5 = 2.0m. 6.0 ÷ 2.0 = 3, so today is 3 times the recent average.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "A spot forex chart shows a 'volume' pane. What is it most likely counting?",
      options: [
        { id: "a", text: "Every euro and every dollar traded worldwide by all banks and brokers", explain: "There is no central record of that." },
        { id: "b", text: "Price updates from one provider (tick volume)", explain: "Right." },
        { id: "c", text: "Futures contracts traded on an exchange", explain: "That is futures volume, not spot." },
        { id: "d", text: "The number of open positions", explain: "That would be open interest, a different figure." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "A large green candle comes with record volume. What does the volume alone tell you?",
      options: [
        { id: "a", text: "That buyers outnumbered sellers", explain: "Every unit had a buyer and a seller." },
        { id: "b", text: "That the rise will continue, because volume confirms it", explain: "Volume is not a forecast." },
        { id: "c", text: "That trading activity was unusually high", explain: "Right. That is what volume measures." },
        { id: "d", text: "That institutions were buying", explain: "Volume does not show identities." },
      ],
      correct: "c",
    },
    {
      id: "q3",
      prompt: "Why might one crypto exchange's volume chart misrepresent the market?",
      options: [
        { id: "a", text: "Trading is spread across many venues and some report fake volume", explain: "Right." },
        { id: "b", text: "Crypto has no volume", explain: "It has plenty; it is just fragmented." },
        { id: "c", text: "Crypto volume is always reported weekly", explain: "Exchanges report continuously." },
        { id: "d", text: "Exchanges are not allowed to publish volume", explain: "They do publish it." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "At 09:35 a share has traded 400,000 shares; its average full day is 2 million. Is that unusual?",
      options: [
        { id: "a", text: "No: it is only 20% of a day", explain: "The comparison should be with the same time on other days." },
        { id: "b", text: "Yes: 400,000 is a large number", explain: "Size alone does not say what is normal." },
        { id: "c", text: "It cannot be known at all without also knowing the share's price", explain: "Price is not needed to compare volumes." },
        { id: "d", text: "Compare it with volume by 09:35 on previous days", explain: "Right. The open is normally busy." },
      ],
      correct: "d",
    },
    {
      id: "q5",
      prompt: "What did Cong, Li, Tang and Yang (2023) estimate about unregulated crypto exchanges?",
      options: [
        { id: "a", text: "Their volumes were almost entirely genuine", explain: "They reported the opposite." },
        { id: "b", text: "Wash trades averaged over 70% of reported volume", explain: "Right, by their statistical tests." },
        { id: "c", text: "They had more genuine volume than regulated exchanges", explain: "Regulated exchanges looked genuine; unregulated ones did not." },
        { id: "d", text: "Fake volume was impossible to estimate", explain: "They estimated it with statistical tests." },
      ],
      correct: "b",
    },
  ],
  practical: {
    title: "Where does your volume come from?",
    instructions: "Use your usual charting app. Observe only.",
    steps: [
      "Open a share, a crypto asset and a currency pair.",
      "For each, find out what the volume pane counts: consolidated, one venue, or ticks.",
      "Note one recent spike in each and compute its relative volume roughly.",
      "Write which of the three volume readings you trust most, and why.",
    ],
    reflectionPrompt: "Had you assumed volume meant the same thing on every chart?",
  },
  glossary: ["consolidated-volume", "tick-volume", "relative-volume"],
  next: "cr-scale",
};
