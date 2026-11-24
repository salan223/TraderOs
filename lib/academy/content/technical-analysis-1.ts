import type { Lesson } from "../types";

/*
  Technical Analysis (track 7), lessons 1–6.
  Every chart here is simulated by a seeded generator (lib/academy/charts.ts)
  and every indicator is computed by lib/academy/indicators.ts. Numbers in
  the text are made-up examples or results computed on those simulated
  series. Research summaries were checked against the sources linked in each
  item. Nothing here is advice to trade, and no indicator setting is a
  recommendation.
*/

const T = "technical-analysis";

export const TA1_MOVING_AVERAGES: Lesson = {
  id: "ta-moving-averages",
  trackId: T,
  order: 1,
  format: "full",
  title: "Moving averages and crossovers",
  summary: "What a moving average measures, why it always lags, and what a crossover of two averages can and cannot tell you.",
  minutes: 24,
  objectives: [
    "Calculate a simple moving average and explain how an exponential average differs.",
    "Explain why every moving average lags, and estimate the lag of a simple average.",
    "Describe a moving-average crossover and why it always arrives after the turn.",
    "State what a moving average measures and what it does not tell you.",
    "Summarise what long-run studies found about moving-average rules, and their limits.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Moving averages are the most widely used [[technical-indicator|technical indicators]]. Many other indicators in this track, such as MACD and Bollinger Bands, are built from them." },
        { kind: "p", text: "If you understand what an average does to price, and what it costs you in delay, you will read every average-based indicator more calmly." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Moving averages from zero",
      blocks: [
        { kind: "p", text: "A [[moving-average|moving average]] is the average of the last n closing prices, recalculated on every new bar. It draws a smoother line than price." },
        { kind: "defs", items: [
          { term: "[[simple-moving-average|Simple (SMA)]]", text: "Add the last n closes and divide by n. Every bar counts the same." },
          { term: "[[exponential-moving-average|Exponential (EMA)]]", text: "Each new close moves the average by a share α = 2 ÷ (n + 1) of the gap. Recent bars count more, so it turns sooner." },
          { term: "[[crossover|Crossover]]", text: "The bar where a fast average moves above or below a slow one." },
        ] },
        { kind: "interactive", widget: "ta-fig-ma-lag", title: "Why a moving average lags", caption: "A made-up price shape. The average turns after price does, and the crossover comes well after the top." },
        { kind: "defs", items: [
          { term: "What it measures", text: "The average price of the last n bars: a smoothed summary of where price has been." },
          { term: "What it does NOT tell you", text: "Where price goes next. A rising average only says recent prices were higher than older ones." },
        ] },
        { kind: "callout", tone: "key", title: "Key idea", text: "Smoothing and delay are the same thing. A longer average is smoother and later; a shorter one is quicker and noisier. No setting avoids that trade." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Try it in the indicator lab",
      blocks: [
        { kind: "step-list", items: [
          { text: "Pick the trending market and turn on moving averages. Each ▲ or ▼ marks a crossover." },
          { text: "Make the fast average shorter, then longer. Count how many crossovers appear." },
          { text: "Switch to the ranging market. Notice how often the averages cross back and forth." },
          { text: "Drag the chart, or pinch or ctrl-scroll to zoom: the averages move with the candles." },
        ] },
        { kind: "interactive", widget: "ta-lab", title: "Indicator lab: moving averages", caption: "Simulated prices. Toggle indicators, change their lengths and see where crossovers fall. Nothing here is a trading signal." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "An example, worked through",
      blocks: [
        { kind: "p", text: "Price rises in a straight line by 1 per bar. A 21-bar SMA on it sits exactly 10 below price, because its middle bar is 10 bars old. That is the lag: (21 − 1) ÷ 2 = 10 bars." },
        { kind: "p", text: "When the rise stops and price turns down, the SMA keeps rising for a while. It only turns once the falling bars outweigh the old rising ones." },
        { kind: "callout", tone: "example", title: "Example", text: "A 50-bar average crossing a 200-bar average (often called a 'golden cross') confirms a move that has usually been under way for weeks. It describes the past rise; it does not promise more." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: lag, weighting and the evidence",
      blocks: [
        { kind: "concept-card", card: {
          name: "Moving average",
          what: "A running average of the last n closes, drawn on the price chart.",
          whyItExists: "Single bars are noisy. An average makes the direction of recent prices easier to see.",
          problemSolved: "It gives a fixed, repeatable definition of 'recent direction' instead of an impression.",
          mechanics: "SMA: add the last n closes, divide by n, repeat every bar. EMA: start from the SMA, then move by α = 2 ÷ (n + 1) of the gap to each new close.",
          math: "SMAₜ = (Cₜ + … + Cₜ₋ₙ₊₁) ÷ n. EMAₜ = α·Cₜ + (1 − α)·EMAₜ₋₁. On a straight line, an n-bar SMA trails price by (n − 1) ÷ 2 bars.",
          howTradersUseIt: "As a trend filter (only trade longs above the average), as a crossover rule, or as a moving reference for pullbacks.",
          whenUseful: "In long, persistent trends, where the lag costs little compared with the move.",
          whenItFails: "In ranges, where price crosses back and forth and each crossover is a small loss after costs (called whipsaw).",
          limitations: "Lag cannot be removed, only traded against noise. The 'best' length on past data is usually luck (lesson 12).",
          misconceptions: "That price 'respects' a popular average. Price touches every average sometimes; count the misses as well.",
          realExample: "On a steady rise of 1 per bar, a 21-bar SMA is always 10 below price.",
          exercise: "In the lab, find the shortest fast average that still gives fewer than five crossovers on the trending market.",
          practicalTest: "Explain, without numbers, why a 200-bar average turns later than a 20-bar one.",
        } },
        { kind: "research", research: {
          title: "Simple Technical Trading Rules and the Stochastic Properties of Stock Returns",
          authors: "William Brock, Josef Lakonishok and Blake LeBaron",
          year: 1992,
          venue: "Journal of Finance 47(5), 1731–1764",
          peerReviewed: true,
          question: "Did simple moving-average and trading-range-break rules have any predictive power on a long stock-index history?",
          methodology: "Tested 26 rules and used bootstrap simulations of standard return models to judge whether the results could be chance.",
          data: "The Dow Jones Industrial Average, 1897–1986.",
          findings: "The results gave strong support for the rules. Returns after buy signals were higher than after sell signals, and returns after sell signals were negative, which standard models did not explain.",
          limitations: "One index, rules chosen from those already popular, no transaction costs in the main tests. Later work (lesson 12) found the edge faded once many rules and later data were considered.",
          practicalMeaning: "Simple trend rules once showed real patterns in old data. That is a reason to test them carefully, not a reason to expect them to work now.",
          status: "regime-sensitive",
          url: "https://ideas.repec.org/a/bla/jfinan/v47y1992i5p1731-64.html",
          verified: true,
        } },
        { kind: "deeper", title: "SMA versus EMA lag", blocks: [
          { kind: "p", text: "An EMA's weights fall off geometrically. Its average age is (1 − α) ÷ α bars, which is (n − 1) ÷ 2 for α = 2 ÷ (n + 1): the same as an SMA of the same n." },
          { kind: "p", text: "The EMA still feels quicker, because the newest bar has the largest single weight. It also never fully forgets old bars, while an SMA drops them all at once." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Trend followers", view: "Use long averages or crossovers as filters across many markets, accepting many small losses in ranges for occasional long trends." },
          { name: "Discretionary chartists", view: "Use an average as context: is price above or below it, and is it rising? They rarely trade the crossover alone." },
          { name: "Quantitative researchers", view: "Treat a crossover as one rule among many and ask whether it beats a random or buy-and-hold benchmark after costs, on data it was not tuned on." },
          { name: "Sceptics", view: "Point out that any smoothing of past prices describes the past, and that popular settings are popular, not proven." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Expecting a crossover at the turn.", why: "An average can only turn after enough new bars outweigh old ones.", instead: "Expect to give back part of every move before a crossover appears." },
          { mistake: "Searching for the perfect length.", why: "The best length on past data mostly fits that data's noise.", instead: "Pick a common length, write it down and judge it over many trades." },
          { mistake: "Trading every crossover in a range.", why: "Back-and-forth price creates many crossovers that each lose a little, plus costs.", instead: "Check whether the market is trending at all (Chart Reading, lesson 7) before using a trend rule." },
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
            "A moving average is the average of the last n closes; it smooths and lags.",
            "An EMA weights recent closes more; on average it lags about as much as an SMA of the same length.",
            "A crossover confirms a move after it has started; it never marks the turn itself.",
            "Old studies found patterns in simple average rules; later work found them fragile.",
          ],
          equations: [
            { label: "SMA", formula: "SMAₜ = (Cₜ + … + Cₜ₋ₙ₊₁) ÷ n" },
            { label: "EMA", formula: "EMAₜ = α·Cₜ + (1 − α)·EMAₜ₋₁, α = 2 ÷ (n + 1)" },
            { label: "SMA lag on a straight line", formula: "(n − 1) ÷ 2 bars" },
          ],
          implications: [
            "Choose an average's length for the job (context or timing), not for its backtest.",
            "Always ask how much of the move a crossover has already missed.",
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
          "In the lab, count crossovers of a 10/30 pair on each simulated market and note which market gives the most.",
          "Write one sentence explaining the lag of a 50-bar SMA to someone new to charts.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "ta-moving-averages-ex",
    title: "Calculate a simple moving average",
    prompt: "The last five closes are 20, 22, 21, 23 and 24. What is the 5-bar simple moving average?",
    unit: "price",
    answer: 22,
    tolerance: 0.01,
    hint: "Add the five closes, then divide by 5.",
    solution: "20 + 22 + 21 + 23 + 24 = 110, and 110 ÷ 5 = 22.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "Why does every moving average lag price?",
      options: [
        { id: "a", text: "Because brokers delay the data they send to charts", explain: "Data delay is a separate issue; an average lags even on instant data." },
        { id: "b", text: "Because it is built from bars that are already in the past", explain: "Right. Averaging past bars means it reacts after price moves." },
        { id: "c", text: "Because it uses volume", explain: "A plain moving average uses closes only." },
        { id: "d", text: "It does not lag if you choose the right length", explain: "Shorter lengths lag less but never zero." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "On a steady straight-line rise, how many bars does a 41-bar SMA trail price by?",
      options: [
        { id: "a", text: "41 bars", explain: "That is the length, not the lag. The middle bar is what matters." },
        { id: "b", text: "About 4 bars", explain: "That would be a much shorter average." },
        { id: "c", text: "20 bars", explain: "Right. (41 − 1) ÷ 2 = 20." },
        { id: "d", text: "No delay at all, because the line is straight", explain: "A straight line still has an average age; the SMA sits behind it." },
      ],
      correct: "c",
    },
    {
      id: "q3",
      prompt: "A fast average crosses above a slow one. What does this tell you?",
      options: [
        { id: "a", text: "Recent prices have risen relative to older ones", explain: "Right. It describes what has happened." },
        { id: "b", text: "The price will keep rising for at least the length of the slow average", explain: "No indicator promises what happens next." },
        { id: "c", text: "The market has reached its low", explain: "The low came earlier; the crossover arrives after it." },
        { id: "d", text: "Buyers outnumber sellers", explain: "Every trade has one buyer and one seller." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "Where are moving-average crossover rules most likely to give many small losses?",
      options: [
        { id: "a", text: "In long, smooth trends", explain: "Trends are where crossover rules do best." },
        { id: "b", text: "After a gap", explain: "A gap can cause one loss, but the repeated problem is elsewhere." },
        { id: "c", text: "On weekly charts only", explain: "Whipsaw happens on any timeframe." },
        { id: "d", text: "In sideways ranges, where averages cross back and forth", explain: "Right. This is called whipsaw." },
      ],
      correct: "d",
    },
  ],
  practical: {
    title: "Watch the lag",
    instructions: "This is observation only. Do not place any trades.",
    steps: [
      "Open any free chart of a market you know and add a 20-bar and a 50-bar simple moving average.",
      "Find the last three times they crossed. For each, note how far price had already moved from its turning point.",
      "Write down what share of each move came before the crossover.",
    ],
    reflectionPrompt: "Would the moves after the crossovers have been worth the moves you missed before them?",
  },
  glossary: ["technical-indicator", "simple-moving-average", "exponential-moving-average", "crossover", "lagging-indicator"],
  next: "ta-rsi",
};

export const TA2_RSI: Lesson = {
  id: "ta-rsi",
  trackId: T,
  order: 2,
  format: "full",
  title: "RSI (Relative Strength Index)",
  summary: "Wilder's RSI: how it is calculated, what 'overbought' and 'oversold' really mean, and why they are not reversal signals.",
  minutes: 22,
  objectives: [
    "Calculate RSI from an average gain and an average loss.",
    "Explain Wilder's smoothing and why RSI needs a warm-up period.",
    "Explain what 'overbought' and 'oversold' mean and why they are not signals by themselves.",
    "State what RSI measures and what it does not tell you.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "RSI is one of the most quoted [[oscillator|oscillators]]. Beginners often read 'RSI above 70' as 'about to fall'. That reading loses money in exactly the strong trends that matter most." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "RSI from zero",
      blocks: [
        { kind: "p", text: "The [[rsi|Relative Strength Index]] compares the size of recent up-moves with recent down-moves and squeezes the answer onto a 0–100 scale." },
        { kind: "step-list", items: [
          { title: "Split each change", text: "For each of the last 14 bars, a rise counts as a gain and a fall as a loss (both positive numbers)." },
          { title: "Average them", text: "Average gain and average loss, using Wilder's smoothing (below)." },
          { title: "Scale to 0–100", text: "RS = average gain ÷ average loss, then RSI = 100 − 100 ÷ (1 + RS)." },
        ] },
        { kind: "interactive", widget: "ta-fig-rsi", title: "RSI can stay overbought", caption: "A made-up steady rise. RSI stays above 70 for most of it while price keeps going up." },
        { kind: "defs", items: [
          { term: "What it measures", text: "The balance of recent gains and losses. 50 means they were equal; 100 means no losses at all." },
          { term: "What it does NOT tell you", text: "That a move must reverse. [[overbought-oversold|Overbought]] means 'recent gains were large', nothing more." },
        ] },
        { kind: "callout", tone: "warn", title: "Watch out", text: "In a strong trend RSI can sit above 70 (or below 30) for a long time. Selling every 70 in an up-trend is betting against the trend." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Explore RSI in the lab",
      blocks: [
        { kind: "step-list", items: [
          { text: "The lab opens with RSI on the ranging market. Note how often it touches 70 and 30." },
          { text: "Switch to the trending market and watch RSI stay high." },
          { text: "Shorten RSI to 5 bars, then lengthen it to 25. Short RSI hits the extremes far more often." },
        ] },
        { kind: "interactive", widget: "ta-lab-rsi", title: "Indicator lab: RSI", caption: "Simulated prices with RSI in its own pane. Change the length and the upper and lower lines and count the readings beyond them." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "An example, worked through",
      blocks: [
        { kind: "p", text: "Over the last 14 bars the average gain is 1.5 and the average loss is 0.5. RS = 1.5 ÷ 0.5 = 3. RSI = 100 − 100 ÷ (1 + 3) = 75." },
        { kind: "p", text: "Next bar, price falls by 2. Wilder's smoothing gives a new average loss of (0.5 × 13 + 2) ÷ 14 ≈ 0.61 and a new average gain of (1.5 × 13 + 0) ÷ 14 ≈ 1.39. RS ≈ 2.29 and RSI ≈ 70." },
        { kind: "callout", tone: "example", title: "Example", text: "One down bar moved RSI from 75 to about 70. That is momentum cooling a little, not a reversal." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: Wilder's smoothing and the evidence",
      blocks: [
        { kind: "concept-card", card: {
          name: "Relative Strength Index (Wilder)",
          what: "A 0–100 oscillator of the ratio of average gains to average losses over n bars (14 by default).",
          whyItExists: "Wilder wanted a momentum reading on a fixed scale, so readings could be compared over time.",
          problemSolved: "Raw momentum (price change) has no fixed range; RSI puts it on 0–100.",
          mechanics: "Start with simple averages of the first n gains and losses. After that, each average = (previous × (n − 1) + current) ÷ n.",
          math: "RS = avg gain ÷ avg loss; RSI = 100 − 100 ÷ (1 + RS). RSI = 100 when avg loss = 0. Wilder's smoothing is an EMA with α = 1 ÷ n.",
          howTradersUseIt: "Mean-reversion traders fade extremes in ranges; trend traders read RSI holding above 50 as confirmation; some read divergences (lesson 7).",
          whenUseful: "In ranging markets, as a description of stretched short-term moves.",
          whenItFails: "In trends, where extremes persist and fading them loses repeatedly.",
          limitations: "It is built from the same closes as price, so it adds little information; the 70/30 lines are conventions.",
          misconceptions: "That 70 means 'too high'. It means recent gains outweighed losses by about 2.3 to 1.",
          realExample: "Average gain 1.5 and average loss 0.5 give RS 3 and RSI 75.",
          exercise: "In the lab, set RSI to 5 bars and count readings above 70 on the ranging market; then set 25 bars and count again.",
          practicalTest: "Explain why RSI(2) reaches 90 far more often than RSI(14).",
        } },
        { kind: "research", research: {
          title: "Technical analysis and the London stock exchange: testing the MACD and RSI rules using the FT30",
          authors: "Terence Tai-Leung Chong and Wing-Kam Ng",
          year: 2008,
          venue: "Applied Economics Letters 15(14), 1111–1114",
          peerReviewed: true,
          question: "Did standard RSI and MACD rules beat buy-and-hold on a long UK index history?",
          methodology: "Applied common RSI and MACD trading rules to the index and compared their returns with buy-and-hold.",
          data: "About 60 years of the London Stock Exchange FT30 index.",
          findings: "The RSI and MACD rules generated returns higher than buy-and-hold in most cases tested.",
          limitations: "One index, a short letter-format paper, and limited treatment of transaction costs and of how many rules were tried.",
          practicalMeaning: "Some old data show RSI rules doing well. Treat that as a hypothesis to test with costs and fresh data, not as a standing edge.",
          status: "disputed",
          url: "https://ideas.repec.org/a/taf/apeclt/v15y2008i14p1111-1114.html",
          verified: true,
        } },
        { kind: "deeper", title: "Why RSI needs a warm-up", blocks: [
          { kind: "p", text: "Because each average carries part of every earlier value, an RSI started on different first bars gives slightly different numbers for a while. Charting packages that start at different dates can disagree." },
          { kind: "p", text: "After about three to four times n bars the starting point barely matters. That is why the lab computes RSI on the whole series and only then shows the window." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Mean-reversion traders", view: "Use short RSI extremes in markets they have tested as range-bound, with fixed exits and costs counted." },
          { name: "Trend traders", view: "Read RSI holding above 40–50 in an up-trend as momentum support, and ignore 'overbought'." },
          { name: "Regime-first analysts", view: "Decide whether the market is trending or ranging first, then decide whether RSI is useful at all." },
          { name: "Sceptics", view: "Note that RSI is a transformed price change, so stacking it with other momentum tools adds little (lesson 11)." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Selling because RSI is above 70.", why: "In trends, RSI stays high while price keeps rising.", instead: "Treat 70 as a description, and require a tested rule before acting on it." },
          { mistake: "Comparing RSI values across different lengths.", why: "RSI(2) and RSI(14) behave very differently.", instead: "State the length every time you quote an RSI value." },
          { mistake: "Changing the 70/30 lines until past signals look good.", why: "That fits the lines to old noise.", instead: "Fix the lines in advance and test them on new data (lesson 12)." },
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
            "RSI compares average gains with average losses on a 0–100 scale.",
            "Wilder's smoothing is an EMA with α = 1 ÷ n.",
            "Overbought and oversold describe recent moves; they do not predict reversals.",
            "Short RSI lengths reach extremes much more often than long ones.",
          ],
          equations: [
            { label: "Relative strength", formula: "RS = average gain ÷ average loss" },
            { label: "RSI", formula: "RSI = 100 − 100 ÷ (1 + RS)" },
            { label: "Wilder's smoothing", formula: "avgₜ = (avgₜ₋₁ × (n − 1) + currentₜ) ÷ n" },
          ],
          implications: [
            "Decide whether the market is trending before you read RSI extremes.",
            "Always quote RSI with its length.",
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
          "Find a period on any chart where RSI(14) stayed above 70 for ten bars or more. What did price do?",
          "Calculate RSI by hand for an average gain of 2 and an average loss of 1.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "ta-rsi-ex",
    title: "Calculate RSI",
    prompt: "The average gain over 14 bars is 1.5 and the average loss is 0.5. What is the RSI?",
    unit: "RSI (0–100)",
    answer: 75,
    tolerance: 0.5,
    hint: "First RS = average gain ÷ average loss. Then RSI = 100 − 100 ÷ (1 + RS).",
    solution: "RS = 1.5 ÷ 0.5 = 3. RSI = 100 − 100 ÷ 4 = 75.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "RSI(14) has been above 70 for 12 bars in a strong rise. What is the most accurate reading?",
      options: [
        { id: "a", text: "Price must fall soon", explain: "Nothing forces a reversal; trends can keep RSI high." },
        { id: "b", text: "Recent gains have been much larger than recent losses", explain: "Right. That is all RSI says." },
        { id: "c", text: "The data must be wrong", explain: "Long stretches above 70 are normal in trends." },
        { id: "d", text: "Sellers have left the market completely", explain: "Every trade has a seller; RSI does not count participants." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "What is RSI when the average loss is zero?",
      options: [
        { id: "a", text: "0", explain: "That happens when the average gain is zero." },
        { id: "b", text: "50", explain: "50 means gains and losses are equal." },
        { id: "c", text: "It cannot be calculated", explain: "By convention RSI is set to its maximum." },
        { id: "d", text: "100", explain: "Right. With no losses, RS is unbounded and RSI is 100." },
      ],
      correct: "d",
    },
    {
      id: "q3",
      prompt: "Which RSI length reaches 70 and 30 most often?",
      options: [
        { id: "a", text: "RSI(30)", explain: "Longer lengths are smoother and reach extremes less often." },
        { id: "b", text: "RSI(3)", explain: "Right. Short lengths swing to extremes easily." },
        { id: "c", text: "RSI(14), because it is the standard length", explain: "Being standard does not make it reach extremes more." },
        { id: "d", text: "All lengths equally", explain: "Length changes the behaviour a lot." },
      ],
      correct: "b",
    },
    {
      id: "q4",
      prompt: "Wilder's smoothing with n = 14 is the same as which other average?",
      options: [
        { id: "a", text: "An EMA with α = 1 ÷ 14", explain: "Right. It is an exponential average with a slower α than the usual 2 ÷ (n + 1)." },
        { id: "b", text: "A 14-bar simple moving average", explain: "Only the very first value is a simple average." },
        { id: "c", text: "The median of the last 14 changes", explain: "RSI uses averages, not medians." },
        { id: "d", text: "A volume-weighted average", explain: "RSI does not use volume." },
      ],
      correct: "a",
    },
  ],
  practical: {
    title: "RSI in two kinds of market",
    instructions: "Observation only. Do not place any trades.",
    steps: [
      "Pick one chart that looks trending and one that looks sideways.",
      "Add RSI(14) to both and count how many times each crossed above 70 in the last 100 bars.",
      "For each crossing, note whether price was higher or lower 10 bars later.",
    ],
    reflectionPrompt: "Did 'overbought' mean the same thing on both charts?",
  },
  glossary: ["oscillator", "rsi", "overbought-oversold"],
  next: "ta-macd",
};

export const TA3_MACD: Lesson = {
  id: "ta-macd",
  trackId: T,
  order: 3,
  format: "full",
  title: "MACD",
  summary: "How MACD is built from two exponential averages, what its signal line and histogram show, and why it lags.",
  minutes: 20,
  objectives: [
    "Build MACD from a fast and a slow EMA, and its signal line and histogram.",
    "Explain what a MACD zero-line cross and a signal-line cross mean.",
    "Explain why MACD values cannot be compared across markets.",
    "State what MACD measures and what it does not tell you.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "MACD is two moving averages in disguise. Seeing that makes its signals easier to judge: they inherit the averages' lag, plus a little more from the signal line." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "MACD from zero",
      blocks: [
        { kind: "defs", items: [
          { term: "MACD line", text: "EMA(12) − EMA(26) of the closes. Positive when the fast average is above the slow one." },
          { term: "[[signal-line|Signal line]]", text: "A 9-bar EMA of the MACD line." },
          { term: "[[macd-histogram|Histogram]]", text: "MACD − signal. It shrinks when the two lines converge." },
        ] },
        { kind: "interactive", widget: "ta-fig-macd", title: "MACD from two averages", caption: "A made-up price shape. MACD is the gap between the fast and the slow average; the bars show MACD minus its signal line." },
        { kind: "defs", items: [
          { term: "What it measures", text: "How far apart a fast and a slow average are, and whether that gap is growing or shrinking." },
          { term: "What it does NOT tell you", text: "Where price goes next, or how strong a move is compared with another market. Its units are price units." },
        ] },
        { kind: "callout", tone: "key", title: "Key idea", text: "[[macd|MACD]] crossing zero is the same event as the 12 and 26 EMAs crossing. Nothing new is added; it is drawn differently." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Explore MACD in the lab",
      blocks: [
        { kind: "step-list", items: [
          { text: "The lab opens with MACD on the trending market. Find where MACD crosses zero." },
          { text: "Turn on moving averages and set them to EMA 12 and EMA 26. Their crossovers land on the same bars." },
          { text: "Shorten the signal line and watch the histogram flip sign more often." },
        ] },
        { kind: "interactive", widget: "ta-lab-macd", title: "Indicator lab: MACD", caption: "Simulated prices with MACD, its signal line and histogram. Change the three lengths and compare with the moving averages on the chart." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "An example, worked through",
      blocks: [
        { kind: "p", text: "EMA(12) is 105 and EMA(26) is 102, so MACD = 3. The 9-bar EMA of MACD (the signal) is 1, so the histogram is 3 − 1 = 2." },
        { kind: "p", text: "If price then goes flat, the fast EMA catches up with price first. MACD shrinks, the histogram shrinks faster, and the signal line is crossed before MACD reaches zero." },
        { kind: "callout", tone: "example", title: "Example", text: "On a $100 stock and a $10 stock moving by the same percentage, MACD on the $100 stock is ten times larger. Compare MACD only with itself." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: what MACD adds, and the evidence",
      blocks: [
        { kind: "concept-card", card: {
          name: "MACD (moving average convergence divergence)",
          what: "The difference between a fast and a slow EMA of price, with an EMA of that difference as a signal line.",
          whyItExists: "Gerald Appel wanted one line that showed both trend (sign) and momentum (slope).",
          problemSolved: "It shows whether two averages are moving apart (momentum building) or together (momentum fading).",
          mechanics: "Compute EMA(12) and EMA(26) of the closes; subtract; take a 9-bar EMA of the result; subtract again for the histogram.",
          math: "MACD = EMA₁₂(C) − EMA₂₆(C). Signal = EMA₉(MACD). Histogram = MACD − Signal.",
          howTradersUseIt: "Zero-line crosses as trend filters, signal-line crosses as earlier but noisier triggers, and divergences (lesson 7).",
          whenUseful: "In persistent trends, like the averages it is built from.",
          whenItFails: "In ranges (frequent crosses) and after sharp reversals, which it reports late.",
          limitations: "Lags twice (two EMAs, then a signal EMA); unbounded and in price units, so it has no fixed 'extreme'.",
          misconceptions: "That a histogram peak is the price peak. It is a peak in the change of momentum, usually earlier than the price top.",
          realExample: "EMA(12) 105, EMA(26) 102, signal 1: MACD 3, histogram 2.",
          exercise: "In the lab, set fast 5, slow 35 and signal 5, and count how many times the histogram changes sign.",
          practicalTest: "Explain why a MACD of 2 on one market cannot be compared with a MACD of 2 on another.",
        } },
        { kind: "research", research: {
          title: "What Do We Know About The Profitability Of Technical Analysis?",
          authors: "Cheol-Ho Park and Scott H. Irwin",
          year: 2007,
          venue: "Journal of Economic Surveys 21(4), 786–826",
          peerReviewed: true,
          question: "What does the published evidence say about whether technical trading rules are profitable?",
          methodology: "A review of early and modern empirical studies of technical trading rules.",
          data: "95 'modern' studies, among others, across stock, currency and futures markets.",
          findings: "Of the 95 modern studies, 56 found positive results, 20 negative and 19 mixed. The authors highlighted problems in many tests, including data snooping, choosing rules after the fact and difficulties in estimating risk and transaction costs.",
          limitations: "A survey of other studies, which differ in quality and method; publication bias may favour positive results.",
          practicalMeaning: "Results such as the MACD findings in lesson 2 sit inside a mixed body of evidence with known testing problems.",
          status: "disputed",
          url: "https://ideas.repec.org/a/bla/jecsur/v21y2007i4p786-826.html",
          verified: true,
        } },
        { kind: "deeper", title: "A percentage MACD", blocks: [
          { kind: "p", text: "Dividing MACD by the slow EMA gives a percentage version (sometimes called PPO). It can be compared across markets and over long periods with big price changes." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Trend filter users", view: "Only take trades in the direction of MACD's sign, and ignore signal-line crosses." },
          { name: "Momentum traders", view: "Watch the histogram shrink as a sign that a move is slowing, alongside price structure." },
          { name: "Systematic testers", view: "Treat 12/26/9 as one setting among many and test whether it beats a plain EMA crossover after costs." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Using MACD and an EMA 12/26 crossover as two confirmations.", why: "They are the same event drawn twice.", instead: "Count them as one piece of evidence (lesson 11)." },
          { mistake: "Comparing MACD levels across markets.", why: "MACD is in price units, so it scales with the price.", instead: "Use a percentage version, or compare a market only with its own history." },
          { mistake: "Reading the histogram peak as the price top.", why: "It peaks when momentum stops growing, often well before price peaks.", instead: "Treat it as a description of momentum, not a timing tool." },
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
            "MACD is a fast EMA minus a slow EMA; its signal line is an EMA of MACD.",
            "A MACD zero cross is an EMA crossover; a signal cross is earlier and noisier.",
            "MACD is in price units and lags.",
          ],
          equations: [
            { label: "MACD", formula: "EMA₁₂(C) − EMA₂₆(C)" },
            { label: "Signal", formula: "EMA₉(MACD)" },
            { label: "Histogram", formula: "MACD − Signal" },
          ],
          implications: [
            "Do not count MACD and an EMA crossover of the same lengths as two signals.",
            "Compare MACD only with itself, or use a percentage version.",
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
          "On any chart, add MACD(12, 26, 9) and EMAs of 12 and 26. Check that the zero crosses and the EMA crossovers fall on the same bars.",
          "Work out the histogram for MACD 1.4 and signal 1.9, and say what its sign means.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "match",
    id: "ta-macd-ex",
    title: "Match the parts of MACD",
    prompt: "Match each part of MACD with how it is calculated.",
    pairs: [
      { id: "m", left: "MACD line", right: "Fast EMA minus slow EMA of the closes" },
      { id: "s", left: "Signal line", right: "A 9-bar EMA of the MACD line" },
      { id: "h", left: "Histogram", right: "MACD line minus signal line" },
      { id: "z", left: "Zero-line cross", right: "The fast and slow EMAs crossing each other" },
    ],
    explanation: "Every part of MACD comes from two EMAs of price. That is why its signals share the averages' lag.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "EMA(12) is 50.8 and EMA(26) is 50.0. The signal line is 0.5. What is the histogram?",
      options: [
        { id: "a", text: "0.8", explain: "That is the MACD line." },
        { id: "b", text: "1.3", explain: "The signal is subtracted, not added." },
        { id: "c", text: "0.3", explain: "Right. MACD 0.8 − signal 0.5 = 0.3." },
        { id: "d", text: "−0.3", explain: "MACD is above the signal, so the histogram is positive." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "MACD crosses above zero. What else happened on the same bar?",
      options: [
        { id: "a", text: "The 12 EMA crossed above the 26 EMA", explain: "Right. MACD is their difference." },
        { id: "b", text: "Price made a new high", explain: "Not necessarily; the averages can cross without a new high." },
        { id: "c", text: "RSI crossed 50 at exactly the same moment", explain: "They often move together, but not on the same bar by definition." },
        { id: "d", text: "Volume rose", explain: "MACD does not use volume." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      prompt: "Why can't you say a MACD of 3 is 'high' without more information?",
      options: [
        { id: "a", text: "Because MACD only goes from 0 to 1", explain: "MACD has no fixed range." },
        { id: "b", text: "Because MACD is in price units, so it depends on the price level", explain: "Right. Compare it with its own history or use a percentage version." },
        { id: "c", text: "Because MACD is random", explain: "It is calculated exactly from prices." },
        { id: "d", text: "Because 3 is the default", explain: "The defaults are lengths, not values." },
      ],
      correct: "b",
    },
    {
      id: "q4",
      prompt: "The histogram has been shrinking for five bars while price still rises. What does this describe?",
      options: [
        { id: "a", text: "A guaranteed top within five bars", explain: "Momentum can slow and then speed up again." },
        { id: "b", text: "That volume is falling across the whole market", explain: "The histogram uses closes, not volume." },
        { id: "c", text: "A data error", explain: "This is normal behaviour." },
        { id: "d", text: "The fast average is no longer pulling away from the slow one as quickly", explain: "Right. Momentum is growing more slowly." },
      ],
      correct: "d",
    },
  ],
  practical: {
    title: "Two names, one event",
    instructions: "Observation only. Do not place any trades.",
    steps: [
      "Open a chart and add MACD(12, 26, 9).",
      "Add EMA 12 and EMA 26 to the price chart.",
      "Mark three MACD zero crosses and check the EMA crossovers on the same bars.",
    ],
    reflectionPrompt: "If two indicators always agree, how many opinions do they give you?",
  },
  glossary: ["macd", "signal-line", "macd-histogram"],
  next: "ta-stochastic",
};

export const TA4_STOCHASTIC: Lesson = {
  id: "ta-stochastic",
  trackId: T,
  order: 4,
  format: "full",
  title: "The stochastic oscillator",
  summary: "Where the close sits within the recent range: the %K and %D lines, fast and slow versions, and their limits.",
  minutes: 18,
  objectives: [
    "Calculate %K from a close, a highest high and a lowest low.",
    "Explain %D and the difference between the fast and slow stochastic.",
    "Compare the stochastic with RSI and say why they often agree.",
    "State what the stochastic measures and what it does not tell you.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "The stochastic is often shown next to RSI as if it were a second opinion. It measures something slightly different, but on the same closes, so the two usually agree." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "The stochastic from zero",
      blocks: [
        { kind: "p", text: "Take the highest high and the lowest low of the last 14 bars. The [[stochastic-oscillator|stochastic]] asks where today's close sits in that range: 0 at the low, 100 at the high." },
        { kind: "defs", items: [
          { term: "Raw %K", text: "100 × (close − lowest low) ÷ (highest high − lowest low)." },
          { term: "%K (slow)", text: "Raw %K smoothed by a 3-bar average. The 'fast' stochastic skips this step." },
          { term: "%D", text: "A 3-bar average of %K, drawn as a second line." },
        ] },
        { kind: "interactive", widget: "ta-fig-stoch", title: "Where the close sits in the range", caption: "Six made-up candles. The last close sits near the top of the period's range, so %K is about 80." },
        { kind: "defs", items: [
          { term: "What it measures", text: "The close's position in the recent high–low range." },
          { term: "What it does NOT tell you", text: "How strong a trend is, or that a reversal is due. In a rise, closes near the high are normal." },
        ] },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Explore the stochastic in the lab",
      blocks: [
        { kind: "step-list", items: [
          { text: "The lab opens with the stochastic on the ranging market. Note how often %K reaches 20 and 80." },
          { text: "Set smoothing to 1 (the fast stochastic) and compare how jumpy it is." },
          { text: "Switch the pane to RSI and compare the shapes." },
        ] },
        { kind: "interactive", widget: "ta-lab-stoch", title: "Indicator lab: stochastic", caption: "Simulated prices with %K and %D. Change the length and the smoothing and compare with RSI on the same bars." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "An example, worked through",
      blocks: [
        { kind: "p", text: "Over 14 bars the highest high is 120 and the lowest low is 100. The close is 115. Raw %K = 100 × (115 − 100) ÷ (120 − 100) = 75." },
        { kind: "p", text: "If the next bar closes at a new high of 122, the range becomes 100–122 and %K = 100. A close at the very top of the range is what happens on every new high." },
        { kind: "callout", tone: "example", title: "Example", text: "In a steady rise the stochastic can sit above 80 for many bars. 'Overbought' here only says closes are near the top of the range." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: fast, slow and overlap with RSI",
      blocks: [
        { kind: "concept-card", card: {
          name: "Stochastic oscillator",
          what: "A 0–100 measure of where the close sits within the high–low range of the last n bars.",
          whyItExists: "George Lane's idea was that closes tend to sit near the top of the range in rises and near the bottom in falls.",
          problemSolved: "It turns 'is price near the top or bottom of its recent range?' into a number.",
          mechanics: "Find the n-bar highest high and lowest low, place the close in that range, smooth it (%K) and smooth again (%D).",
          math: "Raw %K = 100 × (C − LLₙ) ÷ (HHₙ − LLₙ); %K = SMA₃(raw); %D = SMA₃(%K). If HH = LL, %K is set to 50.",
          howTradersUseIt: "Range traders fade readings above 80 or below 20; others use %K crossing %D as a trigger.",
          whenUseful: "In ranges, to describe where price sits between recent extremes.",
          whenItFails: "In trends, where it pins at the extremes; and in very quiet markets, where a tiny range makes it jumpy.",
          limitations: "Very sensitive to one bar's high or low; usually closely correlated with RSI of the same length.",
          misconceptions: "That it measures momentum strength. It measures position in a range.",
          realExample: "Range 100–120 and close 115: %K = 75.",
          exercise: "In the lab, compare stochastic 14 and RSI 14 on the ranging market and note where they disagree.",
          practicalTest: "Explain why a new high always gives raw %K of 100.",
        } },
        { kind: "callout", tone: "info", title: "Research", text: "We found no peer-reviewed study that tested the stochastic on its own in a way we could verify, so this lesson has no research card. The general evidence on technical rules is in lessons 1–3 and 12." },
        { kind: "deeper", title: "How close is it to RSI?", blocks: [
          { kind: "p", text: "On the simulated series in lesson 11, RSI(14) and the stochastic's %K(14) have a correlation of about 0.85. Most of the time they tell you the same thing in slightly different words." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Range traders", view: "Use stochastic extremes only inside a range they have identified from price structure first." },
          { name: "Trend traders", view: "Read a stochastic that keeps returning above 80 as confirmation of strength, not a warning." },
          { name: "Minimalists", view: "Pick either RSI or the stochastic, not both, because they overlap heavily." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Using RSI and the stochastic as two confirmations.", why: "Both come from the same recent prices and usually agree.", instead: "Treat agreement between them as one piece of evidence." },
          { mistake: "Fading every reading above 80.", why: "In rises, closes near the high are what a rise looks like.", instead: "Check structure first; use extremes only where a range is established." },
          { mistake: "Ignoring the smoothing setting.", why: "Fast and slow stochastics behave very differently.", instead: "State which one you use and keep it fixed." },
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
            "%K places the close within the n-bar high–low range on 0–100.",
            "%D is a short average of %K; the slow version smooths %K first.",
            "The stochastic and RSI usually agree because they share inputs.",
          ],
          equations: [
            { label: "Raw %K", formula: "100 × (C − LLₙ) ÷ (HHₙ − LLₙ)" },
            { label: "%D", formula: "SMA₃(%K)" },
          ],
          implications: [
            "Use one of RSI or the stochastic, not both, unless you have tested what the second adds.",
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
          "Calculate raw %K for a 14-bar range of 50–60 and a close of 52.",
          "On any chart, add RSI(14) and the stochastic(14, 3, 3). Find one place where they clearly disagree.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "ta-stochastic-ex",
    title: "Calculate %K",
    prompt: "Over the last 14 bars the highest high is 120 and the lowest low is 100. The latest close is 115. What is raw %K?",
    unit: "%K (0–100)",
    answer: 75,
    tolerance: 0.5,
    hint: "Divide (close − lowest low) by (highest high − lowest low), then multiply by 100.",
    solution: "(115 − 100) ÷ (120 − 100) = 15 ÷ 20 = 0.75, so %K = 75.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "The close is exactly at the lowest low of the last 14 bars. What is raw %K?",
      options: [
        { id: "a", text: "50", explain: "50 is the middle of the range, or the value used when the range is zero." },
        { id: "b", text: "100", explain: "100 is a close at the highest high." },
        { id: "c", text: "0", explain: "Right. The close is at the bottom of the range." },
        { id: "d", text: "It depends on volume", explain: "The stochastic does not use volume." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "What does the 'slow' stochastic do that the 'fast' one does not?",
      options: [
        { id: "a", text: "It smooths raw %K with a short average before %D is taken", explain: "Right. That makes it less jumpy." },
        { id: "b", text: "It uses a longer range", explain: "Range length is a separate setting." },
        { id: "c", text: "It uses only opening prices", explain: "It uses closes, highs and lows." },
        { id: "d", text: "It moves on a different scale from the fast one", explain: "Both are on 0–100." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      prompt: "Why do RSI(14) and the stochastic(14) often agree?",
      options: [
        { id: "a", text: "They are the same formula", explain: "The formulas differ." },
        { id: "b", text: "Both are built from the same recent prices", explain: "Right. Shared inputs make them move together." },
        { id: "c", text: "Exchanges publish them together", explain: "They are calculated by charting software." },
        { id: "d", text: "Because they confirm each other's forecasts", explain: "Neither forecasts; they describe recent prices." },
      ],
      correct: "b",
    },
    {
      id: "q4",
      prompt: "Which is the best description of the stochastic reading 95?",
      options: [
        { id: "a", text: "Price will fall by 5%", explain: "The reading is not a forecast or a percentage move." },
        { id: "b", text: "A strong trend has ended", explain: "In trends, high readings are common." },
        { id: "c", text: "95% of traders are buying", explain: "It does not count traders." },
        { id: "d", text: "The close is near the top of the recent high–low range", explain: "Right. That is all it says." },
      ],
      correct: "d",
    },
  ],
  practical: {
    title: "Second opinion or echo?",
    instructions: "Observation only. Do not place any trades.",
    steps: [
      "Add RSI(14) and the stochastic(14, 3, 3) to one chart.",
      "Over 100 bars, count how often both were above their upper line at the same time.",
      "Count how often only one of them was.",
    ],
    reflectionPrompt: "Does the second indicator change any decision you would make?",
  },
  glossary: ["stochastic-oscillator"],
  next: "ta-bands-atr",
};

export const TA5_BANDS_ATR: Lesson = {
  id: "ta-bands-atr",
  trackId: T,
  order: 5,
  format: "full",
  title: "Bollinger Bands, ATR and volatility",
  summary: "Two ways to measure how much price moves: bands from the standard deviation of closes, and the average true range.",
  minutes: 22,
  objectives: [
    "Calculate Bollinger Bands from a moving average and a standard deviation.",
    "Calculate true range, including a gap, and explain ATR.",
    "Explain why a band touch is not a signal by itself.",
    "State what bands and ATR measure, and what they do not tell you.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "[[volatility|Volatility]] decides how far a stop must be to avoid ordinary noise and how big a move is 'normal'. Bands and ATR measure it in two different ways." },
        { kind: "p", text: "Neither measure says anything about direction. Keeping that clear avoids the most common band mistake." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Bands and ranges from zero",
      blocks: [
        { kind: "defs", items: [
          { term: "[[standard-deviation|Standard deviation]]", text: "How spread out the last n closes are around their average." },
          { term: "[[bollinger-bands|Bollinger Bands]]", text: "A 20-bar SMA with lines 2 standard deviations above and below it." },
          { term: "[[true-range|True range]]", text: "A bar's range, stretched to the previous close if there was a gap." },
          { term: "ATR", text: "The [[average-true-range|average true range]]: Wilder's average of the true ranges." },
        ] },
        { kind: "interactive", widget: "ta-fig-bands", title: "Squeeze and expansion", caption: "A made-up price line. The bands squeeze together in the quiet stretch and widen when price starts swinging." },
        { kind: "interactive", widget: "ta-fig-true-range", title: "True range counts the gap", caption: "A made-up gap up. The bar's own range is small; the true range runs from the previous close to the high." },
        { kind: "defs", items: [
          { term: "What they measure", text: "How spread out recent closes are (bands) and how far price typically travels in a bar (ATR)." },
          { term: "What they do NOT tell you", text: "Which way price will move. A close outside a band is not 'too far'; in trends it happens often." },
        ] },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Explore bands and ATR in the lab",
      blocks: [
        { kind: "step-list", items: [
          { text: "The lab opens on a random walk with bands and ATR. Count the closes outside the bands." },
          { text: "Change the width from 2 to 1 and back. Note how many closes fall outside each time." },
          { text: "Switch to the trending market and watch price ride the upper band." },
        ] },
        { kind: "interactive", widget: "ta-lab-bands", title: "Indicator lab: Bollinger Bands and ATR", caption: "Simulated prices with Bollinger Bands on the chart and ATR in the pane. The random walk has no trend by construction." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "An example, worked through",
      blocks: [
        { kind: "p", text: "The 20-bar average close is 50 and the standard deviation of those closes is 2. The bands are 50 ± 2 × 2: an upper band of 54 and a lower band of 46." },
        { kind: "p", text: "Yesterday closed at 100. Today opens with a gap up, trades between 104 and 108 and closes at 106. The bar's range is 4, but the true range is 108 − 100 = 8." },
        { kind: "callout", tone: "example", title: "Example", text: "A stop placed one 'day's range' away would be twice as tight as one placed one true range away. ATR counts the gaps that hit stops." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: what '2 standard deviations' really means",
      blocks: [
        { kind: "concept-card", card: {
          name: "Bollinger Bands and ATR",
          what: "Two volatility measures: bands from the standard deviation of closes around an average, and the average true range of bars.",
          whyItExists: "A fixed price distance means different things in quiet and wild markets. Volatility measures scale to the market.",
          problemSolved: "They put 'a big move' and 'a normal move' into numbers that adjust over time.",
          mechanics: "Bands: SMA(20) ± 2 × population standard deviation of the same 20 closes. ATR: true range each bar, smoothed with Wilder's method over 14 bars.",
          math: "Upper = SMA + k·σ; lower = SMA − k·σ; bandwidth = (upper − lower) ÷ SMA; %b = (C − lower) ÷ (upper − lower). TR = max(H − L, |H − Cₜ₋₁|, |L − Cₜ₋₁|); ATRₜ = (ATRₜ₋₁ × (n − 1) + TRₜ) ÷ n.",
          howTradersUseIt: "Bands for squeezes (low bandwidth) and for describing stretched moves; ATR for stop distance and position size.",
          whenUseful: "Whenever you need a sense of normal movement: stops, targets and comparing markets.",
          whenItFails: "Volatility changes suddenly; both measures are averages of the past and react after a shock.",
          limitations: "Price changes are not normally distributed, so '2 sd' does not mean '95% inside'. On the lab's random walk, about 11% of closes fall outside.",
          misconceptions: "That a band touch means a reversal. In trends price can stay at a band for many bars.",
          realExample: "SMA 50 and sd 2 give bands of 46 and 54. A gap from 100 to a 104–108 bar is a true range of 8.",
          exercise: "In the lab, count closes outside 2-sd bands on the random walk, then on the trending market.",
          practicalTest: "Explain why true range is larger than high − low after a gap.",
        } },
        { kind: "callout", tone: "warn", title: "Watch out", text: "The '95% inside 2 standard deviations' rule is for a normal bell curve of independent values. Band edges are built from overlapping, trending closes, so many more closes fall outside." },
        { kind: "deeper", title: "Why the bands use the same closes twice", blocks: [
          { kind: "p", text: "The middle band and the standard deviation come from the same 20 closes. A close far above the average also raises the average and widens the band at once, so the band partly 'chases' the move." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Volatility sizers", view: "Use ATR to size positions and place stops, so each trade risks a similar amount in different markets." },
          { name: "Squeeze traders", view: "Watch for low bandwidth before a breakout, accepting that direction is unknown." },
          { name: "Mean-reversion traders", view: "Fade band touches only in markets tested as range-bound, with fixed exits." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Selling every touch of the upper band.", why: "In trends price can ride the band for a long time.", instead: "Use bands to describe volatility; decide direction from structure." },
          { mistake: "Assuming 95% of closes stay inside the bands.", why: "Prices are not independent, normal draws.", instead: "Count the share outside on your own market." },
          { mistake: "Using high − low instead of true range for stops.", why: "It ignores gaps, which are what jump past stops.", instead: "Use ATR, which includes gaps." },
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
            "Bollinger Bands are an average ± k standard deviations of recent closes.",
            "True range includes gaps; ATR is its Wilder average.",
            "Both measure size of movement, never direction.",
            "Band touches are common in trends and are not signals by themselves.",
          ],
          equations: [
            { label: "Bands", formula: "SMA₂₀ ± 2·σ₂₀" },
            { label: "True range", formula: "max(H − L, |H − Cₜ₋₁|, |L − Cₜ₋₁|)" },
            { label: "ATR", formula: "ATRₜ = (ATRₜ₋₁ × (n − 1) + TRₜ) ÷ n" },
          ],
          implications: [
            "Use volatility to set distances, not to pick direction.",
            "Check how often price leaves the bands on your own market before relying on them.",
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
          "Calculate the bands for an average of 80 and a standard deviation of 1.5.",
          "Find a gap on any chart and work out that bar's true range by hand.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "ta-bands-atr-ex",
    title: "True range after a gap",
    prompt: "Yesterday closed at 100. Today the market gapped up, traded between a low of 104 and a high of 108, and closed at 106. What is today's true range?",
    unit: "price points",
    answer: 8,
    tolerance: 0.01,
    hint: "Compare high − low, high − previous close and previous close − low. Take the largest.",
    solution: "High − low = 4; high − previous close = 108 − 100 = 8; |low − previous close| = 4. The largest is 8.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "The 20-bar SMA is 30 and the standard deviation is 1.5. Where is the upper band with k = 2?",
      options: [
        { id: "a", text: "31.5", explain: "That is one standard deviation." },
        { id: "b", text: "33", explain: "Right. 30 + 2 × 1.5 = 33." },
        { id: "c", text: "32", explain: "That adds 2, not 2 standard deviations." },
        { id: "d", text: "60", explain: "The SMA is not doubled." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "Why is true range larger than high − low on a gap bar?",
      options: [
        { id: "a", text: "It adds the volume", explain: "True range uses prices only." },
        { id: "b", text: "It doubles the range", explain: "It extends the range, it does not double it." },
        { id: "c", text: "It includes the jump from the previous close", explain: "Right. That is what it was designed for." },
        { id: "d", text: "It uses the open instead of the low", explain: "It uses the previous close, the high and the low." },
      ],
      correct: "c",
    },
    {
      id: "q3",
      prompt: "Price closes above the upper band. What does this tell you on its own?",
      options: [
        { id: "a", text: "Price must come back inside the bands within a few bars", explain: "In trends, price can stay outside or ride the band." },
        { id: "b", text: "Volume is high", explain: "Bands do not use volume." },
        { id: "c", text: "The trend has just ended", explain: "Closes beyond a band are common inside trends." },
        { id: "d", text: "The close is far above recent closes compared with their spread", explain: "Right. It is a description of a stretched move." },
      ],
      correct: "d",
    },
    {
      id: "q4",
      prompt: "What does a rising ATR tell you?",
      options: [
        { id: "a", text: "Bars are travelling further on average than before", explain: "Right. Volatility has risen." },
        { id: "b", text: "Price is rising", explain: "ATR rises in falls too; it has no direction." },
        { id: "c", text: "A breakout is about to begin", explain: "ATR describes past bars, not future ones." },
        { id: "d", text: "Spreads are tighter than they were earlier in the day", explain: "ATR measures price movement, not spreads." },
      ],
      correct: "a",
    },
  ],
  practical: {
    title: "How often outside?",
    instructions: "Observation only. Do not place any trades.",
    steps: [
      "Add Bollinger Bands (20, 2) to a daily chart of a market you know.",
      "Count how many of the last 100 closes fell outside the bands.",
      "Compare with the 5% a bell curve would suggest.",
    ],
    reflectionPrompt: "What does your count say about treating a band touch as 'extreme'?",
  },
  glossary: ["standard-deviation", "bollinger-bands", "true-range"],
  next: "ta-volume-indicators",
};

export const TA6_VOLUME_INDICATORS: Lesson = {
  id: "ta-volume-indicators",
  trackId: T,
  order: 6,
  format: "full",
  title: "VWAP, OBV and volume indicators",
  summary: "Indicators that use volume: the volume-weighted average price, on-balance volume and the accumulation/distribution line.",
  minutes: 22,
  objectives: [
    "Calculate VWAP from prices and volumes, and explain why it resets each session.",
    "Build on-balance volume and the accumulation/distribution line.",
    "Explain why volume indicators depend on the quality of the volume data.",
    "State what VWAP and OBV measure and what they do not tell you.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Most indicators use price only. Volume indicators add a second input, which is the main reason to use them at all." },
        { kind: "p", text: "VWAP in particular is widely used by institutions to judge how well they bought or sold during a day." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Volume indicators from zero",
      blocks: [
        { kind: "defs", items: [
          { term: "[[vwap|VWAP]]", text: "The average price paid since the session opened, with each price weighted by how much traded there." },
          { term: "[[typical-price|Typical price]]", text: "(high + low + close) ÷ 3: the single price VWAP uses for a bar." },
          { term: "[[obv|OBV]]", text: "A running total: add the bar's volume on an up close, subtract it on a down close." },
          { term: "[[ad-line|A/D line]]", text: "Like OBV, but each bar adds volume in proportion to where it closed in its range." },
        ] },
        { kind: "interactive", widget: "ta-fig-vwap-obv", title: "VWAP and OBV in one session", caption: "Made-up prices and volumes. VWAP leans toward the prices where most volume traded; OBV steps with each close." },
        { kind: "defs", items: [
          { term: "What they measure", text: "VWAP: the volume-weighted average price so far. OBV and A/D: running totals of volume signed by the close." },
          { term: "What they do NOT tell you", text: "Who was buying or selling. Every trade has both; volume indicators only sort volume by price direction." },
        ] },
        { kind: "callout", tone: "warn", title: "Watch out", text: "In spot forex there is no central volume. Charts show [[tick-volume|tick volume]], a count of price updates, so volume indicators there measure activity, not size.", link: { lessonId: "cr-volume", label: "Revisit volume from Chart Reading" } },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Explore VWAP and OBV in the lab",
      blocks: [
        { kind: "step-list", items: [
          { text: "The lab opens with VWAP on the chart and OBV in the pane." },
          { text: "Set VWAP to reset every 40 bars, then never. A VWAP that never resets drifts far from price." },
          { text: "Compare the direction of OBV with the direction of price over the last 20 bars." },
        ] },
        { kind: "interactive", widget: "ta-lab-volume", title: "Indicator lab: VWAP and OBV", caption: "Simulated prices and volumes. VWAP resets at the start of each simulated session; OBV is a running total from the first bar." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "An example, worked through",
      blocks: [
        { kind: "p", text: "In a session, 300 shares trade at a typical price of 10 and then 100 shares at 14. VWAP = (300 × 10 + 100 × 14) ÷ 400 = 4,400 ÷ 400 = 11." },
        { kind: "p", text: "The plain average of the two prices is 12. VWAP is lower because most of the volume traded at 10." },
        { kind: "callout", tone: "example", title: "Example", text: "A fund that bought during the day at an average of 10.80 can say it 'beat VWAP' of 11. That is a measure of execution, not a forecast." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: volume as information",
      blocks: [
        { kind: "concept-card", card: {
          name: "VWAP and on-balance volume",
          what: "VWAP: the volume-weighted average price since a start point. OBV: a running total of volume signed by the direction of each close.",
          whyItExists: "Volume shows where trading activity was concentrated, which price alone does not.",
          problemSolved: "VWAP gives a fair 'average price paid' benchmark; OBV summarises whether volume came more on up or down closes.",
          mechanics: "VWAP: add typical price × volume and volume from the session start; divide. OBV: add volume on up closes, subtract on down closes, leave unchanged on flat closes.",
          math: "VWAP = Σ(TP × V) ÷ ΣV since the reset, TP = (H + L + C) ÷ 3. OBVₜ = OBVₜ₋₁ ± Vₜ. A/D adds ((C − L) − (H − C)) ÷ (H − L) × V.",
          howTradersUseIt: "VWAP as an execution benchmark and intraday reference; OBV for comparing its direction with price.",
          whenUseful: "VWAP intraday, in markets with real traded volume; OBV where volume data are complete.",
          whenItFails: "VWAP far from the session start drifts; OBV's level depends on its start date and can be dominated by one huge bar.",
          limitations: "Both depend on the volume data: partial volume from one venue, or tick volume in forex, changes them.",
          misconceptions: "That OBV rising means 'buying pressure'. It means volume was larger on up closes.",
          realExample: "300 at 10 and 100 at 14 gives VWAP 11.",
          exercise: "In the lab, set VWAP to never reset and see how far it ends from the last close.",
          practicalTest: "Explain why the plain average of prices and VWAP differ.",
        } },
        { kind: "research", research: {
          title: "Market Statistics and Technical Analysis: The Role of Volume",
          authors: "Lawrence Blume, David Easley and Maureen O'Hara",
          year: 1994,
          venue: "Journal of Finance 49(1), 153–181",
          peerReviewed: true,
          question: "In theory, can volume carry information that prices alone do not?",
          methodology: "A theoretical equilibrium model in which traders receive signals of different quality and learn from prices and volume.",
          data: "None: it is a theory paper, not a test on market data.",
          findings: "In the model, volume carries information about the quality of traders' information that cannot be deduced from price, and traders who use volume do better than those who do not.",
          limitations: "A model, not evidence that any volume indicator is profitable. Its assumptions may not match real markets.",
          practicalMeaning: "There is a reasoned case that volume can add information. Whether a given volume indicator does is a separate, testable question.",
          status: "regime-sensitive",
          url: "https://ideas.repec.org/a/bla/jfinan/v49y1994i1p153-81.html",
          verified: true,
        } },
        { kind: "deeper", title: "Why VWAP resets", blocks: [
          { kind: "p", text: "VWAP is an average of everything since its start. Without a reset, old prices dominate and the line moves less and less. Resetting at each session keeps it about today." },
          { kind: "p", text: "Some traders 'anchor' a VWAP at an event, such as an earnings release, instead of the session open. The start point is then a choice that changes the line." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Execution desks", view: "Measure fills against VWAP to judge how well an order was worked through the day." },
          { name: "Intraday traders", view: "Use VWAP as a reference for whether price is above or below the day's average paid." },
          { name: "Volume analysts", view: "Compare OBV or A/D direction with price, aware that the reading depends on the volume source." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Reading OBV as a count of buyers.", why: "Every trade has a buyer and a seller.", instead: "Read it as 'volume on up closes versus down closes'." },
          { mistake: "Using VWAP across many days without a reset.", why: "It drifts toward old prices and stops being a session benchmark.", instead: "Reset each session or state the anchor clearly." },
          { mistake: "Trusting volume indicators on tick volume.", why: "Tick volume counts updates, not size.", instead: "Know your volume source before reading any volume indicator." },
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
            "VWAP is the volume-weighted average price since a reset, usually the session open.",
            "OBV and A/D are running totals of volume signed by the close.",
            "Volume indicators add a second input, but only as good as the volume data.",
          ],
          equations: [
            { label: "VWAP", formula: "Σ(TP × V) ÷ ΣV, TP = (H + L + C) ÷ 3" },
            { label: "OBV", formula: "OBVₜ = OBVₜ₋₁ + Vₜ (up), − Vₜ (down)" },
          ],
          implications: [
            "Check where your volume comes from before using volume indicators.",
            "Use VWAP as a benchmark, not as a level price must return to.",
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
          "Calculate VWAP for 200 shares at 50 and 200 shares at 52.",
          "Find out whether the volume on your charting platform is consolidated, single-venue or tick volume.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "ta-volume-indicators-ex",
    title: "Calculate VWAP",
    prompt: "In a session, 300 shares trade at a typical price of 10 and then 100 shares at a typical price of 14. What is the VWAP?",
    unit: "price",
    answer: 11,
    tolerance: 0.01,
    hint: "Multiply each price by its volume, add them up, then divide by the total volume.",
    solution: "(300 × 10 + 100 × 14) ÷ (300 + 100) = 4,400 ÷ 400 = 11.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "Why is VWAP usually reset at the start of each session?",
      options: [
        { id: "a", text: "Because exchanges require it", explain: "It is a convention, not a rule." },
        { id: "b", text: "So it describes today's trading instead of drifting toward old prices", explain: "Right. Without a reset, old prices dominate." },
        { id: "c", text: "Because volume is zero overnight", explain: "That is not the reason; some markets trade overnight." },
        { id: "d", text: "To make it lag more", explain: "Resetting makes it more responsive, not less." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "A bar closes up on 5,000 shares. OBV was 20,000. What is OBV now?",
      options: [
        { id: "a", text: "15,000", explain: "Volume is subtracted only on a down close." },
        { id: "b", text: "20,000", explain: "OBV changes on every up or down close." },
        { id: "c", text: "100,000", explain: "OBV adds, it does not multiply." },
        { id: "d", text: "25,000", explain: "Right. Up close: add the volume." },
      ],
      correct: "d",
    },
    {
      id: "q3",
      prompt: "On a spot forex chart, what does the 'volume' usually count?",
      options: [
        { id: "a", text: "Price updates in the period (tick volume)", explain: "Right. Spot forex has no central record of size." },
        { id: "b", text: "The total amount of currency traded worldwide", explain: "No single source records that." },
        { id: "c", text: "The number of open positions", explain: "That would be open interest, in futures." },
        { id: "d", text: "Orders waiting in the order book", explain: "That is depth, not volume." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "OBV has risen while price went sideways. What is the most accurate reading?",
      options: [
        { id: "a", text: "Large buyers are secretly accumulating, so price will rise", explain: "That is a story; OBV cannot show who traded or why." },
        { id: "b", text: "The volume data are wrong", explain: "This can happen with correct data." },
        { id: "c", text: "Volume has been larger on up closes than on down closes", explain: "Right. That is what OBV records." },
        { id: "d", text: "VWAP must be above price", explain: "OBV and VWAP measure different things." },
      ],
      correct: "c",
    },
  ],
  practical: {
    title: "Know your volume",
    instructions: "Research only. Do not place any trades.",
    steps: [
      "Open a chart of a market you follow and find out what its volume figure counts.",
      "Add VWAP to an intraday chart and note where it starts.",
      "Add OBV and compare its direction with price over the last 50 bars.",
    ],
    reflectionPrompt: "Would OBV mean the same thing if the volume came from only one of many venues?",
  },
  glossary: ["vwap", "typical-price", "obv", "ad-line"],
  next: "ta-divergence",
};
