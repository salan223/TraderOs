import type { Lesson } from "../types";

/*
  Chart Reading (track 6), lessons 9–12. Simulated data only; see chart-reading-1.ts.
  The practical exam's charts are illustrative, made-up series.
*/

const T = "chart-reading";

export const CR9_SCALE: Lesson = {
  id: "cr-scale",
  trackId: T,
  order: 9,
  format: "full",
  title: "Chart scale",
  summary: "Linear versus logarithmic price scales, percentage versus absolute change, and how the axis can distort what you see.",
  minutes: 20,
  objectives: [
    "Explain the difference between a linear and a logarithmic price scale.",
    "Distinguish absolute change from percentage change, and explain why percentage changes are asymmetric.",
    "Recognise how scale choices and cropped axes distort charts.",
    "Explain why a log scale usually suits long-term charts with large price changes.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "A chart's vertical axis decides how big each move looks. On a long chart, the choice between linear and log can make the early history look flat or the recent moves look like a bubble, from exactly the same prices. Cropping the axis can make a small wobble look like a crash." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Two ways to space prices",
      blocks: [
        { kind: "p", text: "On a [[linear-scale|linear scale]], equal distances are equal amounts: 10 to 20 takes the same height as 100 to 110. On a [[log-scale|logarithmic (log) scale]], equal distances are equal percentage changes: 10 to 20 (+100%) takes the same height as 100 to 200 (+100%)." },
        { kind: "illustration", illustration: "linear-vs-log", caption: "The same four prices, each double the last. A linear scale makes every later doubling look bigger; a log scale gives every doubling the same height." },
        { kind: "p", text: "Absolute change is the difference in price (+10). [[percentage-change|Percentage change]] is the difference divided by the starting price (+10 on 100 is +10%). Percentages are asymmetric: a fall of 50% needs a rise of 100% to get back." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Switch the scale",
      blocks: [
        { kind: "p", text: "The two marked moves are both doublings. Switch between linear and log and compare their heights on screen." },
        { kind: "interactive", widget: "cr-scale", title: "Linear and log scales on one long series", caption: "A simulated long-term series that grows over time. Change the growth rate to see how strongly the linear scale distorts early history." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "A real-world example, described",
      blocks: [
        { kind: "p", text: "Long-run charts of major stock indices over many decades are usually published on a log scale. On a linear scale, the crashes of the distant past barely show, because the index was a small fraction of today's level, while recent ordinary moves look enormous. On a log scale the old crashes appear as the large percentage falls they were." },
        { kind: "p", text: "Short-term, crop distortion is more common: an intraday chart whose axis spans only 0.5% of the price makes every wiggle fill the screen. Always check the axis numbers, not just the shape." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: logarithms on a chart",
      blocks: [
        { kind: "concept-card", card: {
          name: "Logarithmic price scale",
          what: "A vertical axis on which the position of a price is proportional to its logarithm.",
          whyItExists: "Investors experience moves as percentages: a 10% gain matters the same at any price level.",
          problemSolved: "It makes equal percentage moves equally visible across long periods with large price changes.",
          mechanics: "Instead of plotting price p, plot ln(p). The distance between two prices is then ln(b) − ln(a) = ln(b ÷ a), which depends only on their ratio.",
          math: "Height ∝ ln(b ÷ a). Log return r = ln(Pₜ ÷ Pₜ₋₁); log returns add over time: ln(P₂ ÷ P₀) = ln(P₁ ÷ P₀) + ln(P₂ ÷ P₁). Percentage change = (b − a) ÷ a × 100.",
          howTradersUseIt: "For long-term charts, for comparing moves at different price levels, and for drawing trend lines on assets that grew a lot.",
          whenUseful: "Whenever the price range on the chart is large (for example more than doubling).",
          whenItFails: "For prices near zero or negative (log is undefined), and for very narrow ranges, where linear and log look almost identical.",
          limitations: "Lines drawn on a log chart and on a linear chart are not the same lines: a straight line on log is constant percentage growth.",
          misconceptions: "That log scale 'hides' crashes. It shows them as their percentage size.",
          realExample: "From 10 to 1,000, each tenfold step (10 → 100, 100 → 1,000) takes the same height on a log scale.",
          exercise: "In the illustration, set growth to the maximum and compare the two doublings on each scale.",
          practicalTest: "Explain why a fall from 200 to 100 and a fall from 20 to 10 look the same height on a log chart.",
        } },
        { kind: "deeper", title: "Other distortions of the vertical axis", blocks: [
          { kind: "p", text: "Other distortions: a truncated axis (not starting at zero is normal for prices, but very tight ranges exaggerate moves); different chart widths (squeezing time makes slopes look steep); and comparing two assets on one axis when their prices differ greatly. Comparing percentage performance from a common start (rebasing both to 100) avoids the last one." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Long-term analysts", view: "Use log scales by default for multi-year charts so that growth and declines are shown in proportion." },
          { name: "Short-term traders", view: "Often use linear scales, where the range is small and linear and log hardly differ, and focus on price units for stops and targets." },
          { name: "Performance reporting", view: "Rebases series to 100 at a common start and reports percentage or log returns, not price differences." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Judging a long-term move on a linear chart.", why: "Recent moves look far bigger than equal percentage moves in the past.", instead: "Use a log scale for long ranges." },
          { mistake: "Ignoring the axis numbers.", why: "A cropped axis exaggerates small moves.", instead: "Read the axis range before judging a move's size." },
          { mistake: "Adding percentages over time.", why: "+50% then −50% is −25%, not zero.", instead: "Multiply growth factors, or add log returns." },
          { mistake: "Comparing assets by price level.", why: "A $10 move means different things at $20 and $2,000.", instead: "Compare percentage changes or rebase to 100." },
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
            "Linear: equal distance = equal amount. Log: equal distance = equal percentage.",
            "Percentage changes are asymmetric; log returns add up.",
            "Axis choices can exaggerate or hide moves.",
            "Use log for long ranges; check the axis always.",
          ],
          equations: [
            { label: "Percentage change", formula: "(b − a) ÷ a × 100" },
            { label: "Log return", formula: "r = ln(b ÷ a)" },
            { label: "Recovery after a fall of x%", formula: "needed gain = x ÷ (100 − x) × 100%" },
          ],
          implications: [
            "Switch to log before judging any long-term chart.",
            "Describe moves in percent when comparing across time or assets.",
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
          "Open a 20-year chart of a major index. View it on linear, then log scale. Note one period that looks very different.",
          "Compute the gain needed to recover from falls of 10%, 30% and 50%.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "cr-scale-ex",
    title: "Recovering from a fall",
    prompt: "A price falls by 50%. What percentage rise is needed to get back to where it started?",
    unit: "%",
    answer: 100,
    tolerance: 0.1,
    hint: "After a 50% fall, 100 becomes 50. What rise takes 50 back to 100?",
    solution: "100 falls to 50. To return to 100 needs +50 on 50: 50 ÷ 50 = 1, so a rise of 100%.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "On a log scale, which move takes the same height as 50 → 100?",
      options: [
        { id: "a", text: "100 → 150", explain: "That is +50%, not +100%." },
        { id: "b", text: "50 → 150", explain: "That is +200%." },
        { id: "c", text: "400 → 800", explain: "Right. Both are doublings." },
        { id: "d", text: "100 → 50", explain: "Same distance, but downward. The question is about the same move upward." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "A share rises 50% and then falls 50%. Where does it end, relative to the start?",
      options: [
        { id: "a", text: "25% lower", explain: "Right. 100 → 150 → 75." },
        { id: "b", text: "Back where it started", explain: "Percentages apply to different bases." },
        { id: "c", text: "50% lower", explain: "Check: 150 × 0.5 = 75." },
        { id: "d", text: "25% higher", explain: "It ends below the start." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      prompt: "When does a log scale matter most?",
      options: [
        { id: "a", text: "On a five-minute chart covering just one hour of a quiet day", explain: "The range is tiny; linear and log look the same." },
        { id: "b", text: "On a chart where price went from 5 to 500", explain: "Right. Large ranges are where scales differ most." },
        { id: "c", text: "When price is negative", explain: "Log is undefined for negative prices." },
        { id: "d", text: "Only for crypto", explain: "It applies to any asset with large ranges." },
      ],
      correct: "b",
    },
    {
      id: "q4",
      prompt: "An intraday chart's axis runs from 100.00 to 100.40, and price fell from 100.35 to 100.05. How big is that fall?",
      options: [
        { id: "a", text: "A crash: it fills the whole chart", explain: "The axis is cropped tightly." },
        { id: "b", text: "About 3%", explain: "Check: 0.30 ÷ 100.35." },
        { id: "c", text: "Impossible to know", explain: "The numbers are on the axis." },
        { id: "d", text: "About 0.3%, despite how it looks", explain: "Right. 0.30 ÷ 100.35 ≈ 0.3%." },
      ],
      correct: "d",
    },
    {
      id: "q5",
      prompt: "Why do log returns add up over time while percentage changes do not?",
      options: [
        { id: "a", text: "Because ln(c ÷ a) = ln(b ÷ a) + ln(c ÷ b)", explain: "Right." },
        { id: "b", text: "Because log returns are always smaller", explain: "Size is not the reason." },
        { id: "c", text: "Because percentages are rounded", explain: "Rounding has nothing to do with it." },
        { id: "d", text: "Because log returns ignore losses", explain: "Losses are negative log returns." },
      ],
      correct: "a",
    },
  ],
  practical: {
    title: "Scale check",
    instructions: "Use a free charting site. Observe only.",
    steps: [
      "Choose an asset that has risen more than fivefold over its history.",
      "View its full history on linear, then on log scale.",
      "Pick two large falls and compute each as a percentage.",
      "Write which scale gave the fairer impression of each fall.",
    ],
    reflectionPrompt: "Had you ever judged a long-term chart without checking its scale?",
  },
  glossary: ["linear-scale", "log-scale", "percentage-change"],
  next: "cr-support-resistance",
};

export const CR10_SUPPORT_RESISTANCE: Lesson = {
  id: "cr-support-resistance",
  trackId: T,
  order: 10,
  format: "full",
  title: "Support and resistance",
  summary: "Levels as zones, prior swings and round numbers, role reversal, touches and invalidation, and why lines on a chart are not magic.",
  minutes: 28,
  objectives: [
    "Define support and resistance and explain why they are better treated as zones than exact levels.",
    "Find candidate levels from swings, prior highs and lows and round numbers.",
    "Explain role reversal and what multiple touches can and cannot mean.",
    "Define invalidation for a level, and recognise false precision.",
    "Summarise evidence on whether such levels matter.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Support and resistance lines are probably the most-drawn objects in trading. Sometimes price does pause near them, partly because many people watch the same places and leave orders there. But lines are drawn after the fact, can be placed almost anywhere, and break regularly. Using them well means treating them as areas of interest with clear conditions for being wrong." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Floors and ceilings, roughly",
      blocks: [
        { kind: "p", text: "[[support|Support]] is a price area where falls have tended to pause or reverse before. [[resistance|Resistance]] is an area where rises have tended to pause or reverse. Common sources:" },
        { kind: "list", items: [
          "Swing-based levels: prior swing highs and lows (lesson 6).",
          "Prior highs and lows: yesterday's, last week's, the all-time high.",
          "Round numbers such as 100 or 1.2000, where many people place orders.",
        ] },
        { kind: "illustration", illustration: "support-resistance", caption: "Support and resistance as bands. Price turned at slightly different prices each time, so a zone describes the area better than a single line." },
        { kind: "p", text: "[[role-reversal|Role reversal]]: after price breaks above resistance, that area is often watched as support, and the reverse. Multiple touches: an area that price has turned at several times is watched by more people, but each touch can also use up waiting orders. Neither is a law." },
        { kind: "p", text: "Treat a level as a [[price-zone|zone]], a band of prices, not a line drawn to the cent. And decide its [[invalidation]]: what would show the level no longer matters, for example a daily close well beyond the zone." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Lines versus zones",
      blocks: [
        { kind: "p", text: "Move the level and change the zone width. Watch how fragile the touch count of a single line is, compared with a zone." },
        { kind: "interactive", widget: "cr-levels", title: "Draw a level, count the touches", caption: "Simulated range-bound prices. Highlighted bars touched the zone. Counts depend entirely on where and how wide you draw." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "A real-world example, described",
      blocks: [
        { kind: "p", text: "Before the Swiss National Bank removed its minimum exchange rate of 1.20 francs per euro in January 2015, the 1.20 level had been defended for over three years and looked like the most reliable support in currency markets. When the policy ended, the rate fell straight through it in moments, and many stop orders filled far below their levels. A level can matter for a long time, for a reason, and still stop mattering at once." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: why levels sometimes matter",
      blocks: [
        { kind: "concept-card", card: {
          name: "Support and resistance zones",
          what: "Bands of price where reversals or pauses have happened before and may be watched again.",
          whyItExists: "Traders and investors remember prices: where they bought, where losses started, round numbers. Orders cluster there.",
          problemSolved: "It gives a way to plan where to watch for a reaction and where an idea is wrong.",
          mechanics: "Clusters of resting limit orders, stop orders and take-profit orders at popular prices can slow price down, or speed it up once they are triggered.",
          math: "Zone = centre ± half-width, with the half-width often set from volatility (for example a fraction of the average true range).",
          howTradersUseIt: "As places to watch for a reaction, to set stops beyond the zone, and to judge risk against reward.",
          whenUseful: "When the zone is visible to many participants (obvious swings, round numbers, prior highs).",
          whenItFails: "When new information arrives, when the orders there are used up, or when it was drawn to fit the past.",
          limitations: "There are always many candidate levels; picking the 'right' one after the fact is easy and before it is hard.",
          misconceptions: "That more touches always make a level stronger. Repeated tests can also weaken it.",
          realExample: "The EUR/CHF 1.20 floor in 2011–2015 held while the central bank defended it, then failed instantly when it stopped.",
          exercise: "In the illustration, set the width to zero and nudge the level; then set a zone and compare.",
          practicalTest: "For a level you draw, write in advance what would invalidate it.",
        } },
        { kind: "p", text: "False precision is drawing a level to the cent and expecting price to respect it exactly. Prices overshoot and undershoot levels all the time; if your plan breaks when price goes a few ticks past your line, the plan is too fragile. Zones, and invalidation set beyond them, are more honest about the uncertainty." },
        { kind: "research", research: {
          title: "Support for Resistance: Technical Analysis and Intraday Exchange Rates",
          authors: "Carol L. Osler",
          year: 2000,
          venue: "Federal Reserve Bank of New York, Economic Policy Review 6(2), 53–68",
          peerReviewed: false,
          question: "Do the support and resistance levels published by currency firms help predict where intraday trends stop?",
          methodology: "Compared how often intraday exchange-rate trends were interrupted at published levels with how often they were interrupted at arbitrary levels.",
          data: "Support and resistance levels published by six firms for major currency pairs, with intraday exchange rates, in the 1990s.",
          findings: "The published levels helped predict intraday trend interruptions better than chance, but predictive power varied across currencies and across the firms publishing the levels.",
          limitations: "A central bank publication rather than a peer-reviewed journal; one market and period; predicting interruptions is not the same as profitable trading.",
          practicalMeaning: "Widely watched levels can matter somewhat, but unevenly. That supports treating them as areas to watch, not as walls.",
          status: "regime-sensitive",
          url: "https://ideas.repec.org/a/fip/fednep/y2000ijulp53-68nv.6no.2.html",
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
          { name: "Swing-based zones", view: "Mark a few obvious swing highs and lows on the higher timeframe as zones and ignore minor ones." },
          { name: "Order-flow and liquidity", view: "Think of levels as places where orders cluster, and watch how price behaves there rather than assuming a bounce." },
          { name: "Volatility-scaled", view: "Set zone widths and stops from volatility (for example the average true range) rather than fixed amounts." },
          { name: "Sceptical/systematic", view: "Test whether price reacts more at a level than at random levels before relying on it." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Drawing levels to the cent.", why: "False precision; price overshoots.", instead: "Use zones and set invalidation beyond them." },
          { mistake: "Drawing so many lines that one is always nearby.", why: "Then every move 'respects a level'.", instead: "Keep only a few obvious levels." },
          { mistake: "Treating a level as a guarantee.", why: "Levels fail, sometimes violently.", instead: "Plan for the break." },
          { mistake: "Redrawing after the break.", why: "It makes your analysis unfalsifiable.", instead: "Record levels in advance and keep the record." },
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
            "Support and resistance are areas where moves have paused before.",
            "Sources: swings, prior highs and lows, round numbers.",
            "Role reversal and multiple touches are tendencies, not laws.",
            "Use zones, set invalidation, avoid false precision.",
            "Evidence suggests widely watched levels can matter somewhat, unevenly.",
          ],
          equations: [
            { label: "Zone", formula: "centre ± half-width (e.g. half-width = 0.5 × ATR)" },
          ],
          implications: [
            "Write levels and their invalidation before price gets there.",
            "Size positions so that a level breaking is affordable.",
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
          "Mark at most three support or resistance zones on a daily chart, with invalidation for each.",
          "Return in two weeks and record whether price reacted at each, passed through, or never came near.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "cr-support-resistance-ex",
    title: "Sound or fragile?",
    prompt: "Sort each plan about a level.",
    categories: [
      { id: "sound", label: "Sound use of a level" },
      { id: "fragile", label: "Fragile or misleading" },
    ],
    items: [
      { id: "a", text: "Support zone 48.50–49.20; idea is wrong on a daily close below 48.30.", category: "sound", explain: "A zone with invalidation beyond it." },
      { id: "b", text: "Support exactly at 48.87, because price bounced there twice.", category: "fragile", explain: "False precision drawn to fit two points." },
      { id: "c", text: "Twelve lines drawn so that every bounce matches one.", category: "fragile", explain: "With enough lines, everything 'respects a level'." },
      { id: "d", text: "Former resistance near 100 watched as possible support after the break, with a plan if it fails.", category: "sound", explain: "Role reversal as a possibility, with a plan." },
      { id: "e", text: "This level has held for three years, so it cannot break.", category: "fragile", explain: "Levels can stop mattering at once." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "Why are support and resistance better treated as zones?",
      options: [
        { id: "a", text: "Because charts and data feeds are not accurate enough for exact lines", explain: "The data is accurate; behaviour around levels is fuzzy." },
        { id: "b", text: "Because price often overshoots or undershoots a level", explain: "Right. Exact lines imply false precision." },
        { id: "c", text: "Because zones always hold", explain: "Zones break too." },
        { id: "d", text: "Because regulators require it", explain: "There is no such rule." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "Price breaks above resistance at 50 and later falls back to 50. What might traders watch for?",
      options: [
        { id: "a", text: "A guaranteed bounce", explain: "Nothing is guaranteed." },
        { id: "b", text: "Nothing: the level no longer exists", explain: "Former levels are often still watched." },
        { id: "c", text: "Role reversal: 50 acting as support, or failing", explain: "Right." },
        { id: "d", text: "A gap", explain: "A gap is unrelated to this." },
      ],
      correct: "c",
    },
    {
      id: "q3",
      prompt: "What did Osler (2000) report about support and resistance levels published by currency firms?",
      options: [
        { id: "a", text: "They predicted trend interruptions better than chance, unevenly", explain: "Right." },
        { id: "b", text: "They had no predictive value at all", explain: "She found some predictive power." },
        { id: "c", text: "They made traders guaranteed profits", explain: "She studied interruptions, not guaranteed profits." },
        { id: "d", text: "They worked equally well for every currency and for every firm that published them", explain: "Power varied across currencies and firms." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "Which is the best invalidation for a support zone at 70–72?",
      options: [
        { id: "a", text: "Any trade below 72", explain: "That is inside the zone; normal noise." },
        { id: "b", text: "A daily close clearly below the zone, say under 69.50", explain: "Right. Beyond the zone, on a chosen basis." },
        { id: "c", text: "One red candle", explain: "Not related to the zone." },
        { id: "d", text: "None: support zones do not fail", explain: "They do." },
      ],
      correct: "b",
    },
    {
      id: "q5",
      prompt: "A level has been touched six times. What is the most careful reading?",
      options: [
        { id: "a", text: "It is now unbreakable", explain: "Levels can break after many touches." },
        { id: "b", text: "It must break on the next touch, because six touches have worn it down", explain: "Nothing must happen." },
        { id: "c", text: "Touches have no meaning at all", explain: "They show the area has been relevant." },
        { id: "d", text: "Many people may watch it; repeated tests may also weaken it", explain: "Right. Both effects are possible." },
      ],
      correct: "d",
    },
  ],
  practical: {
    title: "Zones in advance",
    instructions: "Use free daily charts. Observe only; record in a notebook.",
    steps: [
      "On one market, mark up to three zones from obvious swings or round numbers.",
      "For each, write its range and its invalidation.",
      "Record the date. Do not redraw them.",
      "After two weeks, record what happened at each.",
    ],
    reflectionPrompt: "Were you tempted to redraw a zone after price moved? What would that have hidden?",
  },
  glossary: ["support", "resistance", "role-reversal", "price-zone", "invalidation"],
  next: "cr-gaps",
};

export const CR11_GAPS: Lesson = {
  id: "cr-gaps",
  trackId: T,
  order: 11,
  format: "full",
  title: "Gaps and discontinuities",
  summary: "Overnight, earnings, news, weekend and liquidity gaps; gap fills and why gaps may not fill; and how a gap can carry price straight through your stop.",
  minutes: 26,
  objectives: [
    "Explain what a price gap is and name its common causes.",
    "Distinguish an opening gap from a full gap (window).",
    "Explain gap fills and why 'gaps always fill' is not a rule.",
    "Explain how a stop order behaves when price gaps through it, and estimate the extra loss.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "A gap is a jump in price with no trading in between. For chart reading, gaps break the smooth picture of price moving step by step. For risk, they matter even more: a stop order cannot fill at a price that never traded, so a gap can turn a planned small loss into a large one." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "What a gap is",
      blocks: [
        { kind: "p", text: "A [[market-gap|gap]] appears when one bar opens well away from the previous bar's close. An [[opening-gap|opening gap]] compares the open with the previous close. A full gap, sometimes called a window, means the whole new bar is beyond the previous bar's range." },
        { kind: "list", items: [
          "Overnight gaps: markets that close overnight reopen at a new price after news, other markets' moves or orders collected before the open.",
          "Earnings gaps: results are usually published outside regular hours.",
          "News gaps: unexpected announcements (policy decisions, legal rulings).",
          "Weekend gaps: two days of news arrive at once on Monday.",
          "Liquidity gaps: in thin markets, even during trading hours, the next trade can be far from the last because few orders are waiting.",
        ] },
        { kind: "illustration", illustration: "gaps", caption: "A gap up and a gap down. The shaded band is the price range where no trades happened; when later prices trade back to the previous close, the gap is filled." },
        { kind: "p", text: "A [[gap-fill|gap fill]] happens when price later trades back to the previous close. Some gaps fill within minutes; others never do, because the information that caused them was lasting." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "A stop meets a gap",
      blocks: [
        { kind: "illustration", illustration: "gap-stop", caption: "A stop jumped by a gap. Nothing traded between the close and the open, so the first price available to the stop order is the open, beyond the stop." },
        { kind: "step-list", items: [
          { text: "Choose what happens overnight and move the stop." },
          { text: "Then look at how many gaps in a simulated series filled within the window you choose." },
        ] },
        { kind: "interactive", widget: "cr-gaps", title: "Gaps, fills and stop orders", caption: "Scenarios and the gap series are simulated. The stop logic follows how a standard stop order works: once triggered it becomes a market order and fills at the next available price." },
        { kind: "callout", tone: "warn", title: "Stops are not guarantees", text: "A standard [[stop-loss]] becomes a [[market-order|market order]] when triggered. If the market opens beyond it, the fill is at or near the open, not at the stop. That extra loss is [[slippage]], and it can be large." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "A real-world example, described",
      blocks: [
        { kind: "p", text: "When the Swiss National Bank removed the 1.20 EUR/CHF floor in January 2015, the exchange rate moved so far, so fast, that many stop orders were filled far below their stop prices; some traders' losses exceeded their account balances, and several brokers reported serious losses. Gaps after company results are a more everyday version: a share closes at 50, results disappoint after hours, and it opens at 42, through every stop between 50 and 42." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: gap risk",
      blocks: [
        { kind: "concept-card", card: {
          name: "Gap risk (slippage through a stop)",
          what: "The risk that price jumps past a stop order, so the fill is worse than the stop price.",
          whyItExists: "Markets close, news arrives at any time, and liquidity can vanish; trading is not always continuous.",
          problemSolved: "Understanding it prevents treating a stop as a guaranteed maximum loss.",
          mechanics: "A sell stop triggers when price trades at or below it. If the first trade after a gap is below the stop, that trade (or the next available) sets the fill.",
          math: "Sell stop: fill = open if open ≤ stop, else stop (if the low reaches it). Extra loss = (stop − fill) × size. Planned loss = (entry − stop) × size.",
          howTradersUseIt: "Reduce size into known events (earnings), avoid holding through them, use guaranteed stops where offered (at a cost), or use options to cap losses.",
          whenUseful: "Before holding any position overnight, over a weekend or through scheduled news.",
          whenItFails: "Event dates are not always known; even liquid markets can gap on surprises.",
          limitations: "The size of a future gap cannot be known; history gives only a rough range.",
          misconceptions: "That a stop-loss caps your loss at the stop price.",
          realExample: "Entry 50, stop 47.50, 100 shares: planned loss $250. Opens at 43: fill near 43, loss about $700.",
          exercise: "In the illustration, choose the earnings scenario and compare planned and actual losses at several stop distances.",
          practicalTest: "Find the next earnings date for a share you follow and write what you would do with a position before it.",
        } },
        { kind: "deeper", title: "Why gaps may not fill", blocks: [
          { kind: "p", text: "Why gaps may not fill: a gap that reflects lasting new information (a profit warning, a takeover) can mark a new price level. 'Gaps always fill' is a saying that ignores the gaps that did not, and says nothing about when. In the illustration's simulated series, some gaps fill within a bar and others not at all." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Event risk management", view: "Track earnings dates, central-bank meetings and data releases, and reduce or hedge positions ahead of them." },
          { name: "Gap traders", view: "Study how gaps of different sizes and causes behave after the open, with tested rules, not sayings." },
          { name: "Position sizing for gaps", view: "Size positions on the assumption that the stop may slip, using historical gap sizes as a rough guide." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Assuming a stop caps the loss.", why: "Gaps skip past stops.", instead: "Assume the stop can slip and size for it." },
          { mistake: "Holding through earnings without noticing.", why: "Earnings gaps are common and can be large.", instead: "Check event dates before holding overnight." },
          { mistake: "Trading on 'gaps always fill'.", why: "Many gaps do not fill, or fill much later.", instead: "Treat fills as uncertain and test any rule." },
          { mistake: "Ignoring weekend risk in markets that close.", why: "Two days of news can arrive at once.", instead: "Consider position size before the weekend." },
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
            "A gap is a jump with no trading in between.",
            "Causes: overnight, earnings, news, weekends, thin liquidity.",
            "Gap fills are common but not guaranteed.",
            "A triggered stop fills at the next available price, which after a gap can be far beyond it.",
          ],
          equations: [
            { label: "Opening gap", formula: "gap % = (open − previous close) ÷ previous close × 100" },
            { label: "Sell-stop fill after a gap", formula: "fill = open if open ≤ stop" },
            { label: "Extra loss", formula: "(stop − fill) × size" },
          ],
          implications: [
            "Check the calendar for events before holding positions over them.",
            "Size positions so that a slipped stop is still survivable.",
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
          "Find three recent earnings gaps on daily charts of large shares. Record the gap size and whether it filled within 10 days.",
          "For a hypothetical position, compute planned and actual loss if a stop 4% away was gapped through by 10%.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "cr-gaps-ex",
    title: "Planned versus actual loss",
    prompt: "You bought 200 shares at $30.00 with a sell stop at $28.50. After bad news the share opens at $25.00. Assuming the stop fills at the open, what is your loss in dollars?",
    unit: "US dollars",
    answer: 1000,
    tolerance: 0.5,
    hint: "The fill is the open, not the stop. Loss = (entry − fill) × shares.",
    solution: "Fill = $25.00. Loss = (30.00 − 25.00) × 200 = 5.00 × 200 = 1000 dollars, against a planned (30.00 − 28.50) × 200 = 300.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "A share closed at 80. Your sell stop is at 76. It opens at 70. Where does your stop most likely fill?",
      options: [
        { id: "a", text: "At 76, the stop price", explain: "No trade happened at 76." },
        { id: "b", text: "At 80, the previous close", explain: "The previous close is not available any more." },
        { id: "c", text: "It does not trigger", explain: "Price is below the stop, so it triggers." },
        { id: "d", text: "At or near 70, the open", explain: "Right. The next available price." },
      ],
      correct: "d",
    },
    {
      id: "q2",
      prompt: "What is a gap fill?",
      options: [
        { id: "a", text: "Price later trading back to the previous close", explain: "Right." },
        { id: "b", text: "A broker filling an order at a price inside the gap, between the two bars", explain: "No trades happen inside the gap." },
        { id: "c", text: "The exchange closing the market", explain: "Unrelated." },
        { id: "d", text: "Price moving further away from the gap", explain: "That is the opposite." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      prompt: "Why might a gap never fill?",
      options: [
        { id: "a", text: "Because gaps are always data errors that the provider corrects later", explain: "Most gaps are real." },
        { id: "b", text: "Because the news behind it changed the price lastingly", explain: "Right." },
        { id: "c", text: "Because exchanges forbid it", explain: "No such rule." },
        { id: "d", text: "Because gap fills only happen on weekends", explain: "Fills can happen any time." },
      ],
      correct: "b",
    },
    {
      id: "q4",
      prompt: "Which of these is NOT a usual cause of a gap?",
      options: [
        { id: "a", text: "Company results released after the close", explain: "A common cause." },
        { id: "b", text: "News over a weekend", explain: "A common cause." },
        { id: "c", text: "Switching the chart from linear to log scale", explain: "Right. A display change does not create gaps." },
        { id: "d", text: "Very thin trading in an illiquid market", explain: "A liquidity gap." },
      ],
      correct: "c",
    },
    {
      id: "q5",
      prompt: "Which response to gap risk is sound?",
      options: [
        { id: "a", text: "Moving the stop much further away the night before the results are released", explain: "It does not stop a gap from going past it." },
        { id: "b", text: "Trusting the stop to cap the loss exactly", explain: "That is the misconception this lesson addresses." },
        { id: "c", text: "Doubling the position because gaps always fill", explain: "They do not always fill." },
        { id: "d", text: "Reducing size before a known event so a gap is survivable", explain: "Right." },
      ],
      correct: "d",
    },
  ],
  practical: {
    title: "Gap audit",
    instructions: "Use free daily charts. Observe only.",
    steps: [
      "Pick one share and find its last four earnings dates.",
      "Record the opening gap on each following day, as a percentage.",
      "For a hypothetical stop 3% below the previous close, compute whether it would have slipped and by how much.",
      "Write a rule you would follow for holding a position through results.",
    ],
    reflectionPrompt: "How large was the largest gap compared with a typical day's range?",
  },
  glossary: ["opening-gap", "gap-fill"],
  next: "cr-practical-exam",
};

export const CR12_PRACTICAL_EXAM: Lesson = {
  id: "cr-practical-exam",
  trackId: T,
  order: 12,
  format: "full",
  title: "Practical examination",
  summary: "Read unseen simulated charts: trend, structure, candles, timeframes, volume, levels, volatility, context and what would prove you wrong, with your reasoning in your own words.",
  minutes: 40,
  objectives: [
    "Read an unseen chart from scratch using a fixed checklist.",
    "Mark a support zone and swing points on a chart, within a stated tolerance.",
    "Choose the structure, volume condition and invalidation that fit the chart, and justify them.",
    "Write a short chart reading that separates data, interpretation and uncertainty, and assess it against a model answer.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Knowing the vocabulary is not the same as reading a chart you have never seen, under the pressure of wanting a particular answer. This lesson is a practical test: you answer before you see any model answer, and you explain your reasoning, because the process is what you can control." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "The checklist",
      blocks: [
        { kind: "list", ordered: true, items: [
          "Context: which asset type, timeframe, scale and data source? Is the latest bar finished?",
          "Structure: mark the confirmed swings; up-trend, down-trend or range by your rule?",
          "Trend and volatility: what does your trend method say, and how large are typical bars (ATR)?",
          "Candles: anything unusual about the latest candles compared with recent ones (size, wicks)?",
          "Volume: is recent activity higher or lower than normal, and what does the volume actually count?",
          "Levels: the nearest support and resistance zones.",
          "Invalidation: what would prove your reading wrong?",
          "Uncertainty: what can this chart not tell you (news, other venues, the future)?",
        ] },
        { kind: "callout", tone: "info", title: "Scored on process", text: "A sound reading can be followed by a move against it. The exam scores whether your reading fits the evidence shown, not what happened next." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Exam part 1: three unseen charts",
      blocks: [
        { kind: "p", text: "For each scenario, mark support, answer the three questions and write your explanation. The model answer appears only after you submit; then tick honestly which points your own explanation covered." },
        { kind: "interactive", widget: "cr-exam", title: "Practical exam: read an unseen chart", caption: "Simulated daily charts made for this exam, not real assets. The model answer uses stated rules (3-bar swings, a 14-day ATR tolerance, 5-day versus 20-day volume); other reasonable rules can differ slightly." },
      ],
    },
    {
      id: "part-2",
      heading: "Exam part 2: marked questions",
      blocks: [
        { kind: "interaction", id: "cr-exam-mark-high", title: "Mark the swing high", interaction: {
          kind: "chart-annotate",
          prompt: "On this illustrative, made-up chart of closing prices, mark the bar that is the highest swing high.",
          series: [40.2, 40.8, 41.5, 42.1, 41.6, 41.0, 41.4, 42.6, 43.4, 44.1, 43.2, 42.5, 42.0, 42.7, 43.1, 42.4, 41.8, 41.2, 41.6, 41.0],
          decimals: 2,
          target: { mode: "point", value: 9, tolerance: 0 },
          explain: "Bar 10 (44.10) is above every close around it and above the earlier peak at bar 4. Later peaks (43.10) are lower: a lower high.",
        } },
        { kind: "interaction", id: "cr-exam-mark-support", title: "Mark the support zone", interaction: {
          kind: "chart-annotate",
          prompt: "On this illustrative, made-up chart of closing prices, mark the level of the support that price has turned up from three times.",
          series: [52.0, 51.1, 50.3, 50.1, 50.9, 51.8, 52.4, 51.5, 50.6, 50.2, 50.8, 51.6, 52.2, 52.6, 51.7, 50.9, 50.3, 50.7, 51.4, 51.9],
          decimals: 2,
          target: { mode: "level", value: 50.2, tolerance: 0.3 },
          explain: "Lows at 50.10, 50.20 and 50.30 form a zone around 50.2. Anywhere from about 49.9 to 50.5 is accepted, because support is a zone, not a line.",
        } },
        { kind: "interaction", id: "cr-exam-scenario", title: "Context and uncertainty", interaction: {
          kind: "scenario",
          situation: "A daily chart shows higher highs and higher lows for two months. Today's candle is a large bearish candle on 3× relative volume, closing just above the last higher low. Results are due tomorrow morning.",
          question: "What is the soundest reading?",
          options: [
            { id: "a", text: "The up-trend is over; the big red candle proves sellers took control", explain: "One candle does not prove control, and the structure has not broken yet.", process: "unsound" },
            { id: "b", text: "The structure is still up but under test; a close below the last higher low would break it, and tomorrow's results add gap risk", explain: "Sound: it separates data, interpretation, invalidation and event risk.", process: "sound" },
            { id: "c", text: "Nothing has changed; trends continue, so ignore the candle", explain: "It ignores the unusual activity and the event.", process: "partial" },
            { id: "d", text: "The pattern guarantees a bounce off the higher low", explain: "Nothing guarantees a bounce.", process: "unsound" },
          ],
          outcome: "In this made-up example the share gapped down after the results. That does not change which reading was sound the evening before.",
        } },
        { kind: "interaction", id: "cr-exam-multi", title: "What the chart cannot tell you", interaction: {
          kind: "multi-select",
          prompt: "Which of these can a daily candlestick chart with volume NOT tell you? Select all that apply.",
          options: [
            { id: "a", text: "Why the large move happened", explain: "Motives and news are not in the data." },
            { id: "b", text: "The highest traded price of each day", explain: "It shows that: the high." },
            { id: "c", text: "Trades on venues the feed does not include", explain: "Partial data cannot show the rest." },
            { id: "d", text: "What happens tomorrow", explain: "No chart shows the future." },
            { id: "e", text: "How much traded each day in that feed", explain: "It shows that: the volume." },
          ],
          correct: ["a", "c", "d"],
        } },
        { kind: "interaction", id: "cr-exam-reveal", title: "Model reading", interaction: {
          kind: "reveal",
          prompt: "Write your own reading of the scenario above in four sentences (structure, volume, invalidation, uncertainty), then compare.",
          label: "Show the model reading",
          content: "Structure: two months of higher highs and higher lows, so an up-trend by swing rules, now testing the last higher low. Volume: today's activity was three times normal, so the fall was unusual, though volume cannot say who was 'in control'. Invalidation: a daily close below the last higher low would break the structure. Uncertainty: the results tomorrow can gap price beyond any level, so position size matters more than the chart reading.",
        } },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "A worked reading, described",
      blocks: [
        { kind: "p", text: "A good written reading is short and separates kinds of statement: 'Data: price has made three higher lows since March; the last is at 41.20; volume over the last week is about 1.3× the month before. Interpretation: up-trend structure, recent activity above normal. Invalidation: a daily close below 40.80, beyond the zone. Uncertainty: results are due next week; this feed shows one exchange's volume.'" },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: grading a reading",
      blocks: [
        { kind: "concept-card", card: {
          name: "Process-based assessment",
          what: "Judging a decision or reading by whether it fitted the evidence available at the time, not by what happened afterwards.",
          whyItExists: "Outcomes in markets are noisy: good reasoning loses sometimes and bad reasoning wins sometimes.",
          problemSolved: "It stops you learning the wrong lessons from lucky or unlucky results.",
          mechanics: "Fix the checklist, answer before seeing outcomes, compare with a model answer built from stated rules, and score each element.",
          math: "Over many decisions, average outcome ≈ quality of process; for one decision, outcome = process + luck.",
          howTradersUseIt: "Journals that record the reasoning before a trade and review it afterwards against the plan, not just the profit.",
          whenUseful: "Every review of a trade or an analysis.",
          whenItFails: "If the model answer's rules are poor, matching it is not much of an achievement; question the rules too.",
          limitations: "Self-assessment depends on honesty.",
          misconceptions: "That a profitable trade proves the reasoning was right.",
          realExample: "In the exam, the 'what happened next' bars are shown only after you submit, and do not change your score.",
          exercise: "Complete all three exam scenarios and record your process scores.",
          practicalTest: "Write a reading of a real chart today and review it in a week against what you wrote, not against the price.",
        } },
        { kind: "p", text: "Tolerances: chart marks are accepted within a stated tolerance (here about three quarters of the average daily range for levels, or an exact bar for a clear swing), because reasonable analysts place levels slightly differently. Being outside the tolerance usually means you picked a different swing, not that you were a few cents off." },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Discretionary analysts", view: "Use a consistent checklist and write the reading before trading, including invalidation." },
          { name: "Systematic traders", view: "Turn each checklist item into a rule so that the reading is reproducible, then test it." },
          { name: "Risk managers", view: "Care most about the invalidation and the event risk, because those decide the worst case." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Starting with a conclusion.", why: "Everything afterwards becomes justification.", instead: "Work through the checklist in order." },
          { mistake: "Leaving out invalidation.", why: "Then no outcome can prove you wrong.", instead: "Always name the price action that would." },
          { mistake: "Grading yourself by what happened next.", why: "Outcomes include luck.", instead: "Grade the reasoning against the evidence shown." },
          { mistake: "Ignoring what the chart cannot show.", why: "News and missing data often matter most.", instead: "Add an 'uncertainty' line to every reading." },
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
            "Read charts with a fixed checklist: context, structure, trend and volatility, candles, volume, levels, invalidation, uncertainty.",
            "Mark levels as zones within a tolerance.",
            "Write readings that separate data, interpretation and uncertainty.",
            "Assess the process, not the outcome.",
          ],
          equations: [
            { label: "Level tolerance used here", formula: "|your level − model level| ≤ 0.75 × ATR(14)" },
            { label: "Relative volume used here", formula: "average V (last 5) ÷ average V (previous 20)" },
          ],
          implications: [
            "Use the checklist on every chart you read from now on.",
            "Keep written readings so you can review them later.",
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
          "Choose two real charts. Write a full checklist reading of each, dated.",
          "Review them in a week: grade the reasoning, then note separately what happened.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "order",
    id: "cr-practical-exam-ex",
    title: "Put the checklist in order",
    prompt: "Order the steps of a chart reading.",
    items: [
      { id: "context", text: "Context: asset, timeframe, scale, data source" },
      { id: "structure", text: "Structure: confirmed swings and their labels" },
      { id: "trend", text: "Trend and volatility by your fixed method" },
      { id: "volume", text: "Volume compared with normal, and what it counts" },
      { id: "levels", text: "Nearest support and resistance zones" },
      { id: "invalid", text: "Invalidation: what would prove the reading wrong" },
      { id: "uncertain", text: "Uncertainty: what the chart cannot tell you" },
    ],
    explanation: "Context first, then structure, trend, volume and levels, and finally the conditions that would prove you wrong and the limits of the chart.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "You submitted a careful reading; the next day price moved against it. How should you grade your reading?",
      options: [
        { id: "a", text: "As wrong, because the outcome was bad", explain: "Outcomes include luck." },
        { id: "b", text: "As right, because careful readings are always right", explain: "Careful readings can still be wrong." },
        { id: "c", text: "Against the evidence available when you made it", explain: "Right. Grade the process." },
        { id: "d", text: "By how far price moved", explain: "That measures the outcome, not the reasoning." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "Which item is missing from this reading? \"Up-trend, higher lows since May, support zone 41–42, volume normal.\"",
      options: [
        { id: "a", text: "The colour of the last candle", explain: "Not essential." },
        { id: "b", text: "What would prove the reading wrong", explain: "Right. No invalidation is stated." },
        { id: "c", text: "A price target", explain: "Targets are optional; invalidation is not." },
        { id: "d", text: "A forecast of where the price will be by the end of next week", explain: "A reading does not need a forecast." },
      ],
      correct: "b",
    },
    {
      id: "q3",
      prompt: "Why does the exam accept support marks within a tolerance?",
      options: [
        { id: "a", text: "Because support is a zone and analysts place it slightly differently", explain: "Right." },
        { id: "b", text: "To make the exam easier", explain: "It reflects how levels work." },
        { id: "c", text: "Because the simulated charts are not accurate enough to mark exactly", explain: "The simulated data is exact." },
        { id: "d", text: "Because any answer is fine", explain: "Marks outside the tolerance are wrong." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "Which sentence is an interpretation, not data?",
      options: [
        { id: "a", text: "The last swing low is at 41.20", explain: "A marked price (given your rule)." },
        { id: "b", text: "Volume this week averaged 1.3× last month's", explain: "A measurement." },
        { id: "c", text: "The 14-day ATR is 0.85", explain: "A computation." },
        { id: "d", text: "Buyers are defending this level", explain: "Right. That is a story about intentions." },
      ],
      correct: "d",
    },
  ],
  practical: {
    title: "Your first written readings",
    instructions: "Use free charts. Observe only; keep your notes.",
    steps: [
      "Pick two charts you have not studied before.",
      "Write a full checklist reading for each, including invalidation and uncertainty.",
      "Date your notes.",
      "Review after one week, grading the reasoning first and the outcome second.",
    ],
    reflectionPrompt: "Which checklist step was hardest to do honestly?",
  },
  glossary: [],
  next: "ta-moving-averages",
};
