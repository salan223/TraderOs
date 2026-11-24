import type { Lesson } from "../types";

/*
  Track 12: Macro and News, lessons 1–7. Central banks, inflation, the labour
  market, GDP and PMIs, yields and the yield curve, rate differentials and
  FX, and risk-on/risk-off. Every number in the tools is made up or drawn
  from a seeded model (lib/academy/macro.ts); none is a real release, rate or
  reaction. Real events are described in words only. Unchecked claims carry
  "Unverified".
*/

const T = "macro-news";

export const MN1_CENTRAL_BANKS: Lesson = {
  id: "mn-central-banks",
  trackId: T,
  order: 1,
  format: "full",
  title: "How central banks work",
  summary: "Central banks steer the economy with a policy rate, with words about the future, and by buying or selling bonds. Markets react to changes in what they expect.",
  minutes: 20,
  objectives: [
    "Explain what a policy rate is and how it passes into other interest rates.",
    "Describe forward guidance and why words can move markets before any action.",
    "Explain quantitative easing and quantitative tightening in plain terms.",
    "Say why markets react to surprises in policy, not to the decision itself.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Interest rates set the price of money. When a [[central-bank|central bank]] changes them, or hints it will, currencies, bonds and shares can all move." },
        { kind: "p", text: "You do not need to forecast central banks to trade. You do need to know when they speak, what they control, and why the same decision can move prices up one day and down another." },
        { kind: "callout", tone: "info", title: "Linked lesson", text: "Forex Foundations introduced interest rates as a driver of currencies. This track goes deeper.", link: { lessonId: "fx-drivers", label: "What moves currencies" } },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Three tools",
      blocks: [
        { kind: "interactive", widget: "macro-fig-central-bank", title: "How policy reaches the economy", caption: "A drawing of the three main tools feeding into market interest rates, and from there into borrowing, spending and the currency. It shows the idea, not real data." },
        { kind: "defs", items: [
          { term: "[[policy-rate|Policy rate]]", text: "The short-term rate the central bank sets. Banks' own rates tend to follow it." },
          { term: "[[forward-guidance|Forward guidance]]", text: "What the bank says about its likely next steps." },
          { term: "[[quantitative-easing|QE]]", text: "Buying bonds with new money to push longer-term rates down." },
          { term: "[[quantitative-tightening|QT]]", text: "Shrinking those bond holdings again." },
        ] },
        { kind: "p", text: "Raising rates is called tightening: borrowing costs more, which tends to cool spending and inflation. Cutting is easing. Talk that leans toward tightening is called [[hawkish]]; talk that leans toward easing is [[dovish]]." },
        { kind: "callout", tone: "key", title: "Key idea", text: "Markets price what they expect a central bank to do. A widely expected decision often moves prices little; a surprise, in the action or the words, moves them." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Follow a rate decision",
      blocks: [
        { kind: "interaction", id: "mn-central-banks-steps", title: "One decision, step by step", interaction: { kind: "steps", steps: [
          { title: "Before", text: "Markets expect the bank to hold its policy rate. That expectation is already in prices.", check: { kind: "true-false", statement: "If everyone expects a hold, a hold is likely to move prices a lot.", answer: false, explain: "False. An expected hold is already priced in." } },
          { title: "The decision", text: "The bank holds, as expected, but its statement drops a line saying rates will stay where they are for some time." },
          { title: "The reaction", text: "Traders now expect a rise sooner. Short-term yields rise and the currency strengthens, though the rate did not change.", check: { kind: "single", prompt: "What moved the market here?", options: [
            { id: "a", text: "The rate change", explain: "The rate did not change." },
            { id: "b", text: "The change in guidance about future rates", explain: "Right. Words changed expectations." },
            { id: "c", text: "Nothing; markets moved randomly", explain: "The guidance change explains it." },
            { id: "d", text: "QE purchases announced that day", explain: "None were announced." },
          ], correct: "b" } },
        ] } },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "Same decision, different reaction",
      blocks: [
        { kind: "p", text: "Two made-up meetings: at both, the bank raises its rate by a quarter point. At the first, markets expected a half point. At the second, they expected no change." },
        { kind: "p", text: "After the first, the currency falls: the rise was smaller than priced. After the second, it jumps: the rise was a surprise." },
        { kind: "callout", tone: "example", title: "Example", text: "The decision was the same. The surprise was opposite. That is why \"rates went up, so buy the currency\" is not a reliable rule." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: how policy passes through",
      blocks: [
        { kind: "concept-card", card: {
          name: "Monetary policy transmission",
          what: "The chain from a central bank's tools to market rates, then to borrowing, spending, prices and the currency.",
          whyItExists: "Central banks cannot set inflation directly. They change the cost and availability of money and let that work through the economy.",
          problemSolved: "It explains why a rate change in one place moves mortgage rates, bond yields and exchange rates elsewhere.",
          mechanics: "The policy rate anchors overnight rates. Expectations of future policy rates, plus a term premium, shape longer yields. QE buys long bonds, which can lower long yields directly.",
          math: "A long yield ≈ average expected short rate over its life + a term premium. Guidance moves the first part; QE mainly the second.",
          howTradersUseIt: "They watch market pricing of future rates and compare each decision and statement with it.",
          whenUseful: "Around scheduled policy meetings, speeches and minutes.",
          whenItFails: "When other forces, such as a crisis or a fiscal shock, swamp the policy signal.",
          limitations: "The effects arrive with long, variable delays, and how much QE does is still debated.",
          misconceptions: "That a rate rise always strengthens a currency. It depends on what was expected.",
          realExample: "In the made-up example above, the same quarter-point rise moved the currency down at one meeting and up at another.",
          exercise: "Pick a central bank and find, on its own website, the date of its next policy decision.",
          practicalTest: "Before the next decision, write down what markets expect, then compare it with the outcome.",
        } },
        { kind: "research", research: {
          title: "The Financial Market Effects of the Federal Reserve's Large-Scale Asset Purchases",
          authors: "Joseph Gagnon, Matthew Raskin, Julie Remache and Brian Sack",
          year: 2011,
          venue: "International Journal of Central Banking 7(1)",
          peerReviewed: true,
          question: "Did the Federal Reserve's bond purchases lower longer-term interest rates, and how?",
          methodology: "Event studies of announcement days and time-series estimates of the effect on yields.",
          data: "US financial market data around the Federal Reserve's purchase programmes after 2008.",
          findings: "The purchases led to economically meaningful and long-lasting reductions in longer-term rates, mainly by lowering risk premiums, including term premiums, rather than expected short rates.",
          limitations: "One central bank in one unusual period; later studies disagree about how large and lasting the effects are.",
          practicalMeaning: "Bond buying and selling can move long yields on their own, apart from the policy rate.",
          status: "regime-sensitive",
          url: "https://www.ijcb.org/journal/v7n1/financial-market-effects-federal-reserves-large-scale-asset-purchases",
          verified: true,
        } },
        { kind: "deeper", title: "Mandates differ", blocks: [
          { kind: "p", text: "Some central banks have a single goal of stable prices; others, like the US Federal Reserve, also aim for maximum employment. The goal shapes how they react to the same data." },
          { kind: "p", text: "Many publish an inflation target. The US Federal Reserve states its goal as 2% inflation measured by the PCE price index, on its own website." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Rates traders", view: "Compare every decision and statement with what futures and short-term yields had priced in." },
          { name: "FX traders", view: "Watch the change in expected rates in one country relative to another, not the level of rates alone." },
          { name: "Long-term investors", view: "Mostly ignore single meetings and focus on the direction of policy over months." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Trading the headline decision.", why: "Expected decisions are already priced.", instead: "Compare the decision and the words with expectations." },
          { mistake: "Ignoring the statement and press conference.", why: "Guidance often moves markets more than the rate.", instead: "Read what changed in the words." },
          { mistake: "Assuming a rise always lifts the currency.", why: "A smaller rise than expected can sink it.", instead: "Ask what was priced in first." },
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
            "Central banks use a policy rate, forward guidance and QE or QT.",
            "Long yields reflect expected future short rates plus a term premium.",
            "Markets react to surprises against expectations, in actions and in words.",
          ],
          equations: [{ label: "Long yield", formula: "≈ average expected short rate + term premium" }],
          implications: ["Know the dates of policy decisions.", "Read the change in the words, not only the rate.", "Do not assume direction from the decision alone."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Find the next policy decision date of two central banks on their own websites.",
          "Write one sentence on what each bank's last statement said about the future.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "match",
    id: "mn-central-banks-ex",
    title: "Tools and what they do",
    prompt: "Match each tool with what it mainly does.",
    pairs: [
      { id: "1", left: "Policy rate", right: "Sets the cost of overnight money" },
      { id: "2", left: "Forward guidance", right: "Shapes expectations of future rates" },
      { id: "3", left: "QE", right: "Buys bonds to push long yields down" },
      { id: "4", left: "QT", right: "Shrinks bond holdings" },
    ],
    explanation: "Each tool works on a different part of the yield curve or on expectations; together they set financial conditions.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "What is forward guidance?",
      options: [
        { id: "a", text: "A forecast made by private banks", explain: "It comes from the central bank." },
        { id: "b", text: "The central bank's own signals about its likely next steps", explain: "Right. Words about the future." },
        { id: "c", text: "A rule that forces the bank to raise rates every quarter, whatever the data say", explain: "No such rule." },
        { id: "d", text: "Bond buying", explain: "That is QE." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "A rate rise that everyone expected is announced. What usually happens?",
      options: [
        { id: "a", text: "Prices often move little, because it was priced in", explain: "Right. Expectations were already in prices." },
        { id: "b", text: "The currency always jumps", explain: "Not if it was expected." },
        { id: "c", text: "Bond yields must fall", explain: "No such rule." },
        { id: "d", text: "Markets close for the rest of the day while traders work out what it means for them", explain: "They do not close." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      prompt: "What does quantitative easing mainly aim to do?",
      options: [
        { id: "a", text: "Raise the policy rate", explain: "QE is used when the rate is already low." },
        { id: "b", text: "Print banknotes for shops", explain: "It works through bond markets." },
        { id: "c", text: "Strengthen the currency at any cost, even if that pushes long-term borrowing costs up", explain: "Not its aim." },
        { id: "d", text: "Lower longer-term interest rates by buying bonds", explain: "Right." },
      ],
      correct: "d",
    },
    {
      id: "q4",
      prompt: "A bank raises rates by less than markets expected. What might its currency do?",
      options: [
        { id: "a", text: "Rise, because rates rose", explain: "Less than expected is a dovish surprise." },
        { id: "b", text: "Nothing at all", explain: "Surprises tend to move prices." },
        { id: "c", text: "Fall, because the rise was smaller than priced", explain: "Right. The surprise matters." },
        { id: "d", text: "It cannot be traded for a week", explain: "No such rule." },
      ],
      correct: "c",
    },
  ],
  practical: {
    title: "A policy calendar",
    instructions: "Research only. Do not place any trades.",
    steps: [
      "List the next decision dates of two central banks from their own websites.",
      "For each, write what you think markets expect, and where you found that.",
      "After the decision, note what was different from the expectation.",
    ],
    reflectionPrompt: "Have you ever assumed a rate change meant a certain price move? What was missing?",
  },
  glossary: ["policy-rate", "forward-guidance", "quantitative-easing", "quantitative-tightening"],
  next: "mn-inflation",
};

export const MN2_INFLATION: Lesson = {
  id: "mn-inflation",
  trackId: T,
  order: 2,
  format: "full",
  title: "Inflation: CPI, PCE, headline and core",
  summary: "Inflation measures how fast prices rise. Headline includes everything; core leaves out food and energy. Central banks watch both, and markets react to surprises in either.",
  minutes: 18,
  objectives: [
    "Explain what CPI and the PCE price index measure.",
    "Tell headline inflation from core inflation, and why both are watched.",
    "Compute headline and core from a simple weighted basket.",
    "Say why monthly and yearly figures can tell different stories.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Most central banks aim for low, stable [[inflation]]. Inflation data therefore feed straight into expectations of interest rates, and from there into currencies and bonds." },
        { kind: "p", text: "Inflation releases are among the busiest moments on the economic calendar. Knowing what is measured helps you read why a number surprised." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "A basket of prices",
      blocks: [
        { kind: "interactive", widget: "macro-fig-inflation", title: "Headline and core", caption: "A drawing of a basket split into made-up shares. Headline inflation uses the whole basket; core leaves out food and energy." },
        { kind: "defs", items: [
          { term: "[[cpi|CPI]]", text: "The consumer price index: prices households pay for a fixed basket." },
          { term: "[[pce-price-index|PCE price index]]", text: "A wider US price measure based on what is consumed, including on households' behalf." },
          { term: "[[headline-inflation|Headline]]", text: "Inflation on the whole basket." },
          { term: "[[core-inflation|Core]]", text: "Inflation without food and energy." },
        ] },
        { kind: "p", text: "Inflation is usually quoted as the change over 12 months. Many releases also give the change from the previous month, which shows turns sooner but is noisier." },
        { kind: "callout", tone: "key", title: "Key idea", text: "Food and energy prices swing most. Core strips them out to show the slower trend, which is closer to what central banks can influence." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Build your own basket",
      blocks: [
        { kind: "step-list", items: [
          { text: "Raise energy prices sharply and leave the rest. Watch headline rise while core stays put." },
          { text: "Now raise housing and services. Watch core rise too." },
          { text: "Set energy negative: headline can fall below core." },
        ] },
        { kind: "interactive", widget: "macro-inflation", title: "Headline and core calculator", caption: "A made-up basket with made-up weights. Each slider sets one item's yearly price change; the tool computes the weighted averages." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "When headline and core part ways",
      blocks: [
        { kind: "p", text: "In a made-up month, energy prices jump. Headline inflation rises well above the consensus, while core matches it exactly." },
        { kind: "p", text: "A trader who reads only the headline expects a hawkish reaction. A trader who reads core sees that the underlying trend did not change." },
        { kind: "callout", tone: "example", title: "Example", text: "Always check which measure surprised. Markets often care more about core, because central banks do." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: weights and base effects",
      blocks: [
        { kind: "concept-card", card: {
          name: "Price index",
          what: "A weighted average of price changes for a basket of goods and services, scaled to a base period.",
          whyItExists: "No single price tells you about inflation; an index combines many.",
          problemSolved: "It turns thousands of price quotes into one comparable number.",
          mechanics: "Statistical agencies collect prices, weight them by spending shares and publish the index monthly with notes on method.",
          math: "Inflation = Σ (weight × price change) ÷ Σ weights. Core repeats the sum without food and energy.",
          howTradersUseIt: "They compare each measure with its consensus, and watch monthly changes for turns.",
          whenUseful: "Around release days and central bank meetings.",
          whenItFails: "When one volatile item, or a one-off change, dominates a month.",
          limitations: "Baskets and methods differ between countries and between CPI and PCE, so the numbers are not directly comparable.",
          misconceptions: "That core is the \"real\" inflation. Households still pay for food and energy.",
          realExample: "In the calculator, an energy jump alone can lift headline several points above core.",
          exercise: "In the calculator, find settings where headline and core differ by more than 2 points.",
          practicalTest: "On a statistics agency's website, find the latest headline and core figures and their release date.",
        } },
        { kind: "deeper", title: "Base effects", blocks: [
          { kind: "p", text: "A yearly rate compares today's price level with the level 12 months ago. If prices jumped a year ago, this year's yearly rate can fall even if prices are still rising: that is a base effect." },
          { kind: "p", text: "The monthly change avoids base effects but is noisier. Professionals read both." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Rates traders", view: "Focus on core monthly changes against consensus, often to one decimal place." },
          { name: "Economists", view: "Break the index into goods, services and housing to see what is driving it." },
          { name: "Cautious retail traders", view: "Stand aside around the release and read the details afterwards." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Reading only the headline.", why: "Core may tell a different story.", instead: "Check headline and core, monthly and yearly." },
          { mistake: "Comparing CPI in one country with PCE in another.", why: "Different baskets and methods.", instead: "Compare like with like." },
          { mistake: "Treating the level as the news.", why: "Markets react to the gap from consensus.", instead: "Compare with the consensus first." },
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
            "CPI and the PCE price index measure consumer prices with different baskets.",
            "Headline includes food and energy; core leaves them out.",
            "Yearly rates suffer base effects; monthly rates are noisier.",
          ],
          equations: [{ label: "Weighted inflation", formula: "Σ (weight × price change) ÷ Σ weights" }],
          implications: ["Check which measure surprised.", "Read monthly and yearly together.", "Compare with consensus, not with last month."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Find the most recent CPI release on the statistics agency's own website and note headline and core.",
          "Write down the next release date.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "mn-inflation-ex",
    title: "Weighted headline inflation",
    prompt: "A made-up basket: food and energy together weigh 20% and rose 10% this year; everything else weighs 80% and rose 2%. What is headline inflation, in %?",
    unit: "%",
    answer: 3.6,
    tolerance: 0.05,
    hint: "Multiply each weight by its price change and add.",
    solution: "0.2 × 10 + 0.8 × 2 = 2 + 1.6 = 3.6%. Core, without food and energy, is 2%.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "What does core inflation leave out?",
      options: [
        { id: "a", text: "Housing", explain: "Housing is in core." },
        { id: "b", text: "Services and anything bought online, because those prices are hard to measure", explain: "Not what core removes." },
        { id: "c", text: "Food and energy", explain: "Right. Their prices swing most." },
        { id: "d", text: "Nothing", explain: "It removes food and energy." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "Energy prices jump while everything else is steady. What happens?",
      options: [
        { id: "a", text: "Headline rises; core barely moves", explain: "Right." },
        { id: "b", text: "Core rises; headline barely moves", explain: "The reverse." },
        { id: "c", text: "Both fall", explain: "Prices rose." },
        { id: "d", text: "Neither changes, because energy is not part of any inflation measure that is published", explain: "It is in headline." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      prompt: "In which measure does the US Federal Reserve state its 2% goal?",
      options: [
        { id: "a", text: "CPI", explain: "It uses PCE." },
        { id: "b", text: "GDP growth", explain: "GDP is output, not prices." },
        { id: "c", text: "The unemployment rate, which it tries to keep at exactly 2% at all times", explain: "Not an inflation measure." },
        { id: "d", text: "The PCE price index", explain: "Right, as its own statement says." },
      ],
      correct: "d",
    },
    {
      id: "q4",
      prompt: "Prices jumped a year ago and rose only a little since. What happens to the yearly rate?",
      options: [
        { id: "a", text: "It must rise", explain: "The jump drops out of the comparison." },
        { id: "b", text: "It can fall, a base effect", explain: "Right." },
        { id: "c", text: "It stays exactly the same for another twelve months", explain: "The base changes." },
        { id: "d", text: "It turns negative", explain: "Not if prices still rose." },
      ],
      correct: "b",
    },
  ],
  practical: {
    title: "Read an inflation release",
    instructions: "Research only. Do not place any trades.",
    steps: [
      "Open the latest inflation release on the statistics agency's website.",
      "Write the headline and core rates, monthly and yearly.",
      "Find the consensus from a reputable calendar and note which measure differed most.",
    ],
    reflectionPrompt: "Which inflation number have you heard quoted most, and which was it?",
  },
  glossary: ["cpi", "pce-price-index", "headline-inflation", "core-inflation"],
  next: "mn-labour",
};

export const MN3_LABOUR: Lesson = {
  id: "mn-labour",
  trackId: T,
  order: 3,
  format: "full",
  title: "The labour market: payrolls and unemployment",
  summary: "Jobs reports combine a survey of employers and a survey of households. The headline numbers are noisy, revised later, and read against consensus.",
  minutes: 18,
  objectives: [
    "Explain nonfarm payrolls and the unemployment rate, and where each comes from.",
    "Explain why first estimates are revised.",
    "Say why the same jobs surprise can move markets differently at different times.",
    "Use the surprise simulator to see how noise mixes with the surprise.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Jobs data tell central banks how strong the economy is. Strong hiring can mean higher rates for longer; weak hiring can mean cuts." },
        { kind: "p", text: "The monthly US jobs report is one of the most watched releases. Spreads and price swings around it can be large, which matters for anyone holding a position." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Two surveys, one report",
      blocks: [
        { kind: "interactive", widget: "macro-fig-labour", title: "Where the numbers come from", caption: "A drawing of an employer survey and a household survey feeding one jobs report, both revised later. It shows the idea, not real data." },
        { kind: "defs", items: [
          { term: "[[nonfarm-payrolls|Nonfarm payrolls]]", text: "The monthly change in US jobs outside farming, from employers." },
          { term: "[[unemployment-rate|Unemployment rate]]", text: "The share of the labour force without a job and looking, from households." },
          { term: "[[data-revision|Revision]]", text: "A later correction as fuller data arrive." },
        ] },
        { kind: "p", text: "The two surveys can disagree in a given month. Both are estimates from samples, so a small change can be noise." },
        { kind: "callout", tone: "warn", title: "Watch out", text: "Last month's figure is often revised in the same report. A strong new number with a large downward revision can be weaker news than it looks." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "A simulated jobs surprise",
      blocks: [
        { kind: "step-list", items: [
          { text: "Choose \"Payrolls\". Set actual equal to consensus: the average simulated move is about zero." },
          { text: "Raise actual above consensus. The average move rises, but some moves still go the other way." },
          { text: "Press \"New simulated draws\" to see the spread change from run to run." },
        ] },
        { kind: "interactive", widget: "macro-surprise", title: "Surprise simulator", caption: "Made-up release values. Each run draws a simulated price move: a fixed response to the surprise plus random noise. It is a model, not a forecast of any market." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "Good news, bad reaction",
      blocks: [
        { kind: "p", text: "In a made-up month, payrolls beat consensus. Shares fall. Why? Traders read the strong number as making rate cuts less likely, and higher rates for longer weigh on share prices." },
        { kind: "p", text: "In another made-up month, the same beat lifts shares, because growth worries were the main concern." },
        { kind: "callout", tone: "example", title: "Example", text: "The same surprise can be read as \"good for growth\" or \"bad for rates\". Which reading wins depends on what the market is worried about." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: noise and state dependence",
      blocks: [
        { kind: "concept-card", card: {
          name: "Labour market release",
          what: "A report of jobs added or lost and the unemployment rate, estimated from surveys and revised later.",
          whyItExists: "Employment is part of many central banks' goals and a broad gauge of the economy.",
          problemSolved: "It gives a timely, if rough, read on hiring and slack.",
          mechanics: "Sample surveys are scaled up to the whole economy, seasonally adjusted and published on a fixed schedule.",
          math: "Surprise = actual − consensus. Sampling error means a small surprise can be within the noise of the estimate.",
          howTradersUseIt: "They compare the headline, the revisions and wages with consensus.",
          whenUseful: "To understand big moves on release mornings.",
          whenItFails: "When revisions or one-off effects, such as strikes or weather, distort a month.",
          limitations: "First estimates can be revised substantially; one month says little.",
          misconceptions: "That a strong jobs number is always good for shares.",
          realExample: "In the simulator, the same surprise gives a spread of moves, some in the opposite direction.",
          exercise: "In the simulator, find the smallest surprise where at least 90% of moves go one way.",
          practicalTest: "Note the next jobs report date and plan to have no open position at the release.",
        } },
        { kind: "research", research: {
          title: "Real-time price discovery in global stock, bond and foreign exchange markets",
          authors: "Torben G. Andersen, Tim Bollerslev, Francis X. Diebold and Clara Vega",
          year: 2007,
          venue: "Journal of International Economics 73(2), 251–277",
          peerReviewed: true,
          question: "How do US, German and British stock, bond and currency markets respond to US macroeconomic news?",
          methodology: "High-frequency futures prices around scheduled US releases, comparing the releases with survey expectations.",
          data: "Intraday futures data for stock, bond and currency markets in three countries.",
          findings: "News surprises produce jumps in prices. Stock markets react differently depending on the phase of the business cycle, which helps explain why stock and bond returns are only weakly correlated over a full cycle.",
          limitations: "US releases only, and an older sample; markets and the most-watched releases change.",
          practicalMeaning: "The same surprise can move shares one way in one phase of the cycle and the other way in another.",
          status: "regime-sensitive",
          url: "https://econpapers.repec.org/RePEc:eee:inecon:v:73:y:2007:i:2:p:251-277",
          verified: true,
        } },
        { kind: "deeper", title: "Wages and participation", blocks: [
          { kind: "p", text: "Jobs reports also include average earnings and the share of people in the labour force. Fast wage growth can worry central banks about inflation even when hiring is modest." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Macro traders", view: "Read the headline, the revisions and wages together before deciding what the surprise was." },
          { name: "Economists", view: "Use averages over several months to look through noise." },
          { name: "Risk managers", view: "Treat release mornings as event risk and limit positions held through them." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Ignoring revisions.", why: "They can change the picture.", instead: "Read the revision to the previous month too." },
          { mistake: "Assuming strong jobs means shares up.", why: "It can mean higher rates.", instead: "Ask what the market is worried about." },
          { mistake: "Trading the first second.", why: "Spreads and noise are largest then.", instead: "Wait, or stand aside." },
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
            "Payrolls come from employers; unemployment from households.",
            "First estimates are revised, sometimes a lot.",
            "The same surprise can be read differently in different conditions.",
          ],
          equations: [{ label: "Surprise", formula: "actual − consensus" }],
          implications: ["Read the revisions.", "Know the release date.", "Expect noise around the surprise."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Find the latest US jobs report on the statistics agency's website and note payrolls, unemployment and the revision.",
          "Write one sentence on whether the release was a surprise, and against which consensus.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "mn-labour-ex",
    title: "Which survey?",
    prompt: "Sort each figure by the survey it comes from in the US jobs report.",
    categories: [
      { id: "emp", label: "Employer survey" },
      { id: "hh", label: "Household survey" },
    ],
    items: [
      { id: "1", text: "Nonfarm payrolls change", category: "emp", explain: "Counted from employers' payrolls." },
      { id: "2", text: "Unemployment rate", category: "hh", explain: "Asked of households." },
      { id: "3", text: "Average hourly earnings", category: "emp", explain: "From employers' payroll records." },
      { id: "4", text: "Labour force participation", category: "hh", explain: "From the household survey." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "Where does the US unemployment rate come from?",
      options: [
        { id: "a", text: "A survey of households", explain: "Right." },
        { id: "b", text: "Company tax returns", explain: "Not the source." },
        { id: "c", text: "A survey of employers that counts every job in the country, including farms", explain: "That is payrolls, and it excludes farms." },
        { id: "d", text: "The central bank", explain: "It is a statistics release." },
      ],
      correct: "a",
    },
    {
      id: "q2",
      prompt: "Payrolls beat consensus, but last month is revised down a lot. Which reading is fairest?",
      options: [
        { id: "a", text: "Clearly strong", explain: "The revision offsets part of it." },
        { id: "b", text: "Weaker than the headline alone suggests", explain: "Right. Read both." },
        { id: "c", text: "Revisions never matter", explain: "They can matter a lot." },
        { id: "d", text: "The release must be wrong and will be cancelled by the agency within the week", explain: "Revisions are normal." },
      ],
      correct: "b",
    },
    {
      id: "q3",
      prompt: "Why might a strong jobs report push shares down?",
      options: [
        { id: "a", text: "Jobs reports never affect shares", explain: "They often do." },
        { id: "b", text: "Strong jobs always mean a recession", explain: "Not what it means." },
        { id: "c", text: "Traders expect rates to stay higher for longer", explain: "Right." },
        { id: "d", text: "Shares always fall on releases, whatever the release says and whatever was expected", explain: "No such rule." },
      ],
      correct: "c",
    },
    {
      id: "q4",
      prompt: "In the simulator, actual equals consensus. What is the average simulated move?",
      options: [
        { id: "a", text: "Large and positive", explain: "No surprise, no expected move." },
        { id: "b", text: "Large and negative", explain: "No surprise, no expected move." },
        { id: "c", text: "It depends only on how high the number is", explain: "The level does not enter the model." },
        { id: "d", text: "About zero", explain: "Right. Only noise remains." },
      ],
      correct: "d",
    },
  ],
  practical: {
    title: "Watch a jobs report from the side",
    instructions: "Observation only. Do not place any trades.",
    steps: [
      "Write the consensus for the next jobs report before it comes out.",
      "After the release, note the actual, the revision and how one market moved in the first hour.",
      "Write whether the move matched the direction of the surprise.",
    ],
    reflectionPrompt: "Would you have been comfortable holding a position through that release? Why?",
  },
  glossary: ["nonfarm-payrolls", "unemployment-rate", "data-revision"],
  next: "mn-growth",
};

export const MN4_GROWTH: Lesson = {
  id: "mn-growth",
  trackId: T,
  order: 4,
  format: "full",
  title: "Growth data: GDP and PMIs",
  summary: "GDP measures output but arrives late. PMIs are quick surveys that show how widespread change is. Both are read against consensus.",
  minutes: 16,
  objectives: [
    "Explain what GDP measures and why it is revised.",
    "Explain how a PMI is built as a diffusion index, and what 50 means.",
    "Compute a diffusion index from survey shares.",
    "Say what a PMI cannot tell you.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Growth data tell markets whether the economy is speeding up or slowing down. That feeds into expected rates, company profits and risk appetite." },
        { kind: "p", text: "GDP is the broadest measure but comes late. PMIs come early. Knowing the trade-off helps you judge how much a release should matter." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Late and full, early and rough",
      blocks: [
        { kind: "interactive", widget: "macro-fig-growth", title: "When growth data arrive", caption: "A drawing of the order in which surveys and GDP estimates arrive, and a gauge with 50 marked between contracting and expanding." },
        { kind: "defs", items: [
          { term: "[[gdp|GDP]]", text: "The value of everything an economy produces in a period." },
          { term: "[[pmi|PMI]]", text: "A monthly survey of purchasing managers about activity." },
          { term: "[[diffusion-index|Diffusion index]]", text: "% saying higher + half the % saying no change." },
        ] },
        { kind: "p", text: "A PMI above 50 means more firms reported higher activity than lower. It does not say by how much activity grew." },
        { kind: "callout", tone: "key", title: "Key idea", text: "A PMI measures how widespread a change is, not how big. GDP measures size, but late." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Build a PMI",
      blocks: [
        { kind: "step-list", items: [
          { text: "Set 30% higher and 45% no change: the index is 52.5, just above 50." },
          { text: "Move firms from \"no change\" to \"lower\". Watch the index fall below 50." },
          { text: "Notice that the index never asks how much output changed." },
        ] },
        { kind: "interactive", widget: "macro-pmi", title: "PMI calculator", caption: "Made-up survey shares. The tool computes the diffusion index from the share of firms reporting higher, the same or lower output." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "Two kinds of 52",
      blocks: [
        { kind: "p", text: "Two made-up surveys both read 52. In the first, a few firms are booming and most are flat. In the second, many firms are growing a little and many are shrinking a little." },
        { kind: "callout", tone: "example", title: "Example", text: "The same reading can hide very different economies. That is why PMIs are read with their sub-indices and alongside harder data." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: GDP estimates and survey data",
      blocks: [
        { kind: "concept-card", card: {
          name: "Diffusion index",
          what: "A survey summary: the share reporting improvement plus half the share reporting no change.",
          whyItExists: "Asking firms whether things got better or worse is quick and cheap, so results arrive early.",
          problemSolved: "It gives a timely read on direction before official output data exist.",
          mechanics: "Firms answer higher, same or lower for output, orders, prices and more; each answer set becomes one index.",
          math: "Index = % higher + 0.5 × % same. 50 means as many higher as lower.",
          howTradersUseIt: "They compare the reading with consensus and watch whether it is crossing 50.",
          whenUseful: "Early in the month, before harder data.",
          whenItFails: "When firms' answers reflect mood more than activity, or when a few large firms dominate output.",
          limitations: "It measures breadth, not size; sample sizes are modest.",
          misconceptions: "That a PMI of 55 means 5% growth.",
          realExample: "In the calculator, 30% higher and 45% same gives 52.5.",
          exercise: "In the calculator, find two different answer mixes that both give exactly 50.",
          practicalTest: "Find the next PMI release date for one economy and note the consensus.",
        } },
        { kind: "deeper", title: "Why GDP is revised", blocks: [
          { kind: "p", text: "The first GDP estimate is built from partial data. Later estimates add more complete surveys and tax records, so growth figures can change noticeably months later." },
          { kind: "p", text: "GDP is often quoted as an annualised quarterly rate in the US and as a plain quarterly change elsewhere. Check which before comparing." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Macro traders", view: "Use PMIs as early signals and GDP as confirmation, reading both against consensus." },
          { name: "Economists", view: "Look at sub-indices such as new orders and prices paid, not only the headline." },
          { name: "Equity analysts", view: "Link growth surprises to sectors whose profits depend most on the cycle." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Reading a PMI as a growth rate.", why: "It measures breadth, not size.", instead: "Read it as \"how many firms improved\"." },
          { mistake: "Comparing annualised and plain quarterly GDP.", why: "They differ by about a factor of four.", instead: "Check how each is quoted." },
          { mistake: "Treating first GDP estimates as final.", why: "They are revised.", instead: "Expect changes." },
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
            "GDP measures output; it is late and revised.",
            "A PMI is a diffusion index; 50 means as many higher as lower.",
            "PMIs show breadth of change, not size.",
          ],
          equations: [{ label: "Diffusion index", formula: "% higher + 0.5 × % same" }],
          implications: ["Use PMIs as early, rough signals.", "Check how GDP is quoted.", "Read releases against consensus."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Find the latest PMI for one economy from its publisher and note the headline and new-orders index.",
          "Find the last GDP release and note whether the previous estimate was revised.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "mn-growth-ex",
    title: "Compute a PMI",
    prompt: "In a made-up survey, 40% of firms report higher output and 30% report no change. What is the diffusion index?",
    unit: "index",
    answer: 55,
    tolerance: 0.1,
    hint: "Add the % higher and half the % unchanged.",
    solution: "40 + 0.5 × 30 = 40 + 15 = 55. The other 30% reported lower output.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "What does a PMI of 50 mean?",
      options: [
        { id: "a", text: "Output grew 50%", explain: "It does not measure size." },
        { id: "b", text: "Half of all firms closed", explain: "Not what it means." },
        { id: "c", text: "As many firms reported higher activity as lower", explain: "Right." },
        { id: "d", text: "The economy is in recession, as officially declared by the government's statistics agency", explain: "PMIs do not declare recessions." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "Why are PMIs watched even though GDP is broader?",
      options: [
        { id: "a", text: "They arrive much earlier", explain: "Right. Timeliness is their value." },
        { id: "b", text: "They are never revised and always exactly right", explain: "They are survey estimates." },
        { id: "c", text: "They measure output in money", explain: "They measure breadth." },
        { id: "d", text: "Central banks set them", explain: "Private and public publishers compile them." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      prompt: "Why is GDP revised?",
      options: [
        { id: "a", text: "Mistakes are made on purpose", explain: "No. Revisions come from new data, not deliberate errors." },
        { id: "b", text: "Later estimates use more complete data", explain: "Right. Early figures rely on partial surveys that are filled in later." },
        { id: "c", text: "It is never revised", explain: "It often is." },
        { id: "d", text: "Markets ask for higher numbers and the agency agrees to change them after the release", explain: "No. Statistical agencies revise for data, not for market pressure." },
      ],
      correct: "b",
    },
    {
      id: "q4",
      prompt: "Two PMIs both read 52. What can differ between them?",
      options: [
        { id: "a", text: "Nothing at all", explain: "The mix behind them can differ." },
        { id: "b", text: "Only the date", explain: "The mix can differ too." },
        { id: "c", text: "The share of firms reporting higher, which is always identical when the reading matches", explain: "It can differ." },
        { id: "d", text: "How much activity actually changed", explain: "Right. The index ignores size." },
      ],
      correct: "d",
    },
  ],
  practical: {
    title: "Growth data diary",
    instructions: "Research only. Do not place any trades.",
    steps: [
      "Write the next PMI and GDP release dates for one economy.",
      "After each, note actual versus consensus.",
      "Write whether the PMI direction matched the GDP direction.",
    ],
    reflectionPrompt: "Which growth number had you heard of before, and did you know what it measured?",
  },
  glossary: ["gdp", "pmi", "diffusion-index"],
  next: "mn-yield-curve",
};

export const MN5_YIELD_CURVE: Lesson = {
  id: "mn-yield-curve",
  trackId: T,
  order: 5,
  format: "full",
  title: "Yields and the yield curve",
  summary: "Bond yields across maturities form the yield curve. Its slope reflects expected rates and a term premium. An inversion has often come before US recessions, but it is not a timing tool.",
  minutes: 22,
  objectives: [
    "Explain what a bond yield is and why it moves opposite to bond prices.",
    "Draw normal, flat and inverted yield curves and say what each suggests.",
    "Compute a term spread and classify a curve.",
    "State honestly what the evidence on inversions does and does not show.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "The yield curve sums up what bond markets expect about rates and growth. Talk of an \"inverted curve\" often fills the news." },
        { kind: "p", text: "Knowing what the curve shows, and how weak it is as a timing signal, protects you from both ignoring it and over-trading it." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "From one yield to a curve",
      blocks: [
        { kind: "interactive", widget: "macro-fig-yield-curve", title: "Three curve shapes", caption: "A drawing of normal, flat and inverted curves across maturities from 3 months to 30 years. The heights show the idea, not real yields." },
        { kind: "defs", items: [
          { term: "[[bond-yield|Yield]]", text: "The yearly return from buying a bond today and holding it to maturity." },
          { term: "[[yield-curve|Yield curve]]", text: "Yields of one issuer's bonds across maturities." },
          { term: "[[term-spread|Term spread]]", text: "A long yield minus a short yield." },
          { term: "[[yield-curve-inversion|Inversion]]", text: "Short yields above long yields." },
        ] },
        { kind: "p", text: "When a bond's price falls, its fixed payments are bought more cheaply, so its yield rises. Price and yield always move in opposite directions." },
        { kind: "callout", tone: "key", title: "Key idea", text: "Long yields reflect expected future short rates plus a [[term-premium|term premium]]. An inverted curve often means markets expect rates to be cut later." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Build a yield curve",
      blocks: [
        { kind: "step-list", items: [
          { text: "Start from \"normal\". Drag the 3-month point up until it passes the 10-year point." },
          { text: "Watch the 10-year minus 3-month spread turn negative and the label change to inverted." },
          { text: "Try a curve that is inverted at the short end but rises again at 30 years." },
        ] },
        { kind: "interactive", widget: "macro-yield-curve", title: "Yield-curve builder", caption: "Made-up yields. Drag each point, or focus it and use the arrow keys. The tool classifies the curve from its 10-year minus 3-month spread." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "A warning light, not a clock",
      blocks: [
        { kind: "p", text: "In past US data, the curve inverted before most recessions since the late 1960s. But the delay from inversion to recession varied a lot, and markets often kept rising for a long time after an inversion." },
        { kind: "callout", tone: "warn", title: "Watch out", text: "A trader who sold shares on the day the curve inverted could have waited a long time, and missed gains, before any recession arrived." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: the evidence",
      blocks: [
        { kind: "concept-card", card: {
          name: "Term spread",
          what: "A long-term yield minus a short-term yield on government bonds, such as 10-year minus 3-month.",
          whyItExists: "It condenses the curve's slope into one number.",
          problemSolved: "It gives a simple, market-based gauge of expected rates and growth.",
          mechanics: "If markets expect the central bank to cut later, long yields fall below short ones and the spread turns negative.",
          math: "Spread = y(10y) − y(3m). Below zero means inverted.",
          howTradersUseIt: "As one input on the business cycle, not as a trading trigger.",
          whenUseful: "For thinking about recession risk over the next year or two.",
          whenItFails: "When term premiums are unusually low or distorted, for example by bond buying; and as a timing tool.",
          limitations: "A small number of past recessions means few data points; delays are long and uneven.",
          misconceptions: "That an inversion causes recessions, or tells you when one will start.",
          realExample: "In the builder, raising only the 3-month yield can flip the curve to inverted while long yields stay put.",
          exercise: "In the builder, make a curve that is inverted by the 10y−3m spread but not by the 10y−2y spread.",
          practicalTest: "Find the current 10-year and 3-month yields on an official source and compute the spread.",
        } },
        { kind: "research", research: {
          title: "The Term Structure as a Predictor of Real Economic Activity",
          authors: "Arturo Estrella and Gikas A. Hardouvelis",
          year: 1991,
          venue: "Journal of Finance 46(2), 555–576",
          peerReviewed: true,
          question: "Does the slope of the yield curve predict future US economic activity?",
          methodology: "Regressions of future growth in output and its components on the spread between long and short yields, compared with other predictors.",
          data: "US yields and macroeconomic data.",
          findings: "A positive slope predicted future growth in consumption, durables and investment, and did better than several alternatives, including survey forecasts.",
          limitations: "US data only; relationships estimated on the past can weaken as policy and markets change.",
          practicalMeaning: "The slope carries information about growth, which is why it is watched.",
          status: "regime-sensitive",
          url: "https://ideas.repec.org/a/bla/jfinan/v46y1991i2p555-76.html",
          verified: true,
        } },
        { kind: "research", research: {
          title: "Predicting U.S. Recessions: Financial Variables as Leading Indicators",
          authors: "Arturo Estrella and Frederic S. Mishkin",
          year: 1998,
          venue: "Review of Economics and Statistics 80(1), 45–61",
          peerReviewed: true,
          question: "Which financial variables best predict US recessions out of sample?",
          methodology: "Probit models of recession, one to eight quarters ahead, tested out of sample.",
          data: "US interest rates, spreads, stock prices and monetary aggregates.",
          findings: "Beyond one quarter ahead, the slope of the yield curve was the clearest single predictor, and it did better on its own out of sample than combined with other variables.",
          limitations: "Few recessions in the sample; the result is about probabilities, not dates.",
          practicalMeaning: "An inverted curve raises the estimated chance of a recession, without saying when.",
          status: "regime-sensitive",
          url: "https://ideas.repec.org/a/tpr/restat/v80y1998i1p45-61.html",
          verified: true,
        } },
        { kind: "research", research: {
          title: "Information in the Yield Curve about Future Recessions",
          authors: "Michael D. Bauer and Thomas M. Mertens",
          year: 2018,
          venue: "Federal Reserve Bank of San Francisco Economic Letter 2018-20",
          peerReviewed: false,
          question: "Which yield spread best predicts US recessions, and should it be adjusted for the term premium?",
          methodology: "Comparison of several spreads as recession predictors.",
          data: "US Treasury yields and recession dates since the 1970s.",
          findings: "The 10-year minus 3-month spread was the most reliable single measure. Spreads generally turned negative about one to two years before recessions. Subtracting an estimated term premium made predictions worse.",
          limitations: "A short policy note, not a peer-reviewed paper; correlation does not show causation.",
          practicalMeaning: "Watch the 10y−3m spread as a long-range warning, not a short-range trigger.",
          status: "regime-sensitive",
          url: "https://www.frbsf.org/research-and-insights/publications/economic-letter/2018/08/information-in-yield-curve-about-future-recessions/",
          verified: true,
        } },
        { kind: "deeper", title: "Why the evidence is thinner than it looks", blocks: [
          { kind: "p", text: "There have been only a handful of US recessions in the data these studies use. A rule that fitted a handful of past cases well can still fail next time." },
          { kind: "p", text: "Most of this evidence is from the US. How well inversions predict recessions in other countries is less clear (Unverified: not checked across countries for this course)." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Economists", view: "Use the spread as one input to recession probabilities, with other indicators." },
          { name: "Bond traders", view: "Trade changes in the slope (steepening or flattening) around policy expectations." },
          { name: "Equity investors", view: "Note inversions as a warning but avoid timing exits on them alone." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Treating inversion as a sell signal.", why: "Delays are long and uneven.", instead: "Treat it as one warning sign." },
          { mistake: "Forgetting price and yield move oppositely.", why: "It confuses what a move means.", instead: "Rising yields mean falling bond prices." },
          { mistake: "Mixing up which spread is quoted.", why: "10y−2y and 10y−3m can disagree.", instead: "Check the maturities." },
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
            "Yields move opposite to bond prices.",
            "The curve's slope reflects expected rates plus a term premium.",
            "Inversions have often preceded US recessions, with long, uneven delays.",
          ],
          equations: [{ label: "Term spread", formula: "y(10y) − y(3m)" }],
          implications: ["Do not time trades on inversion alone.", "Check which spread is quoted.", "Remember the small number of past cases."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Find today's 3-month, 2-year and 10-year government yields from an official source.",
          "Compute both spreads and classify the curve.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "mn-yield-curve-ex",
    title: "Name the shape",
    prompt: "Classify each made-up curve by its 10-year minus 3-month spread, using this course's 0.5-point band for flat.",
    categories: [
      { id: "normal", label: "Normal" },
      { id: "flat", label: "Flat" },
      { id: "inverted", label: "Inverted" },
    ],
    items: [
      { id: "1", text: "3-month 2.0%, 10-year 3.5%", category: "normal", explain: "Spread +1.5: normal." },
      { id: "2", text: "3-month 4.0%, 10-year 4.2%", category: "flat", explain: "Spread +0.2: flat." },
      { id: "3", text: "3-month 5.0%, 10-year 4.1%", category: "inverted", explain: "Spread −0.9: inverted." },
      { id: "4", text: "3-month 1.0%, 10-year 1.3%", category: "flat", explain: "Spread +0.3: flat." },
      { id: "5", text: "3-month 3.0%, 10-year 2.9%", category: "inverted", explain: "Spread −0.1: inverted." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "A bond's price falls. What happens to its yield?",
      options: [
        { id: "a", text: "It rises", explain: "Right. Price and yield move oppositely." },
        { id: "b", text: "It falls", explain: "The opposite." },
        { id: "c", text: "It stays the same until the bond matures, because the coupon is fixed", explain: "The yield changes with price." },
        { id: "d", text: "It becomes zero", explain: "A falling price means a higher yield, not zero." },
      ],
      correct: "a",
    },
    {
      id: "q2",
      prompt: "What does an inverted curve mean?",
      options: [
        { id: "a", text: "Long yields are above short yields", explain: "That is normal." },
        { id: "b", text: "All yields are negative", explain: "Not required." },
        { id: "c", text: "Short yields are above long yields", explain: "Right." },
        { id: "d", text: "A recession has officially begun and the central bank has confirmed the start date", explain: "Inversion is a warning sign, not a declared recession." },
      ],
      correct: "c",
    },
    {
      id: "q3",
      prompt: "What did Estrella and Mishkin (1998) find?",
      options: [
        { id: "a", text: "The curve's slope was useless for prediction", explain: "The opposite." },
        { id: "b", text: "Stock prices beat every other predictor at every horizon, including two years ahead", explain: "Not their finding." },
        { id: "c", text: "Recessions can be dated to the week", explain: "No such claim." },
        { id: "d", text: "Beyond a quarter ahead, the slope was the clearest single predictor of recessions", explain: "Right." },
      ],
      correct: "d",
    },
    {
      id: "q4",
      prompt: "Why is an inversion a poor timing signal?",
      options: [
        { id: "a", text: "Inversions never happen", explain: "They do." },
        { id: "b", text: "The delay to any recession has been long and uneven", explain: "Right." },
        { id: "c", text: "It is illegal to trade on yields", explain: "Trading on yields is legal; timing is the problem." },
        { id: "d", text: "Yields are only published once a year, so no one knows when the curve inverts", explain: "They are quoted continuously." },
      ],
      correct: "b",
    },
  ],
  practical: {
    title: "Track the curve",
    instructions: "Research only. Do not place any trades.",
    steps: [
      "Once a week for a month, note the 3-month and 10-year yields from an official source.",
      "Compute the spread each time.",
      "Write whether the shape changed, and what news happened in between.",
    ],
    reflectionPrompt: "Had you heard that an inversion means a recession is coming? How would you put it now?",
  },
  glossary: ["bond-yield", "yield-curve", "yield-curve-inversion", "term-spread", "term-premium"],
  next: "mn-rate-differentials",
};

export const MN6_DIFFERENTIALS: Lesson = {
  id: "mn-rate-differentials",
  trackId: T,
  order: 6,
  format: "full",
  title: "Interest-rate differentials and FX",
  summary: "The gap between two countries' rates affects their exchange rate and pays carry. Carry is slow and small; currency moves can be fast and large.",
  minutes: 20,
  objectives: [
    "Explain an interest-rate differential and how it relates to carry.",
    "Compute carry over a holding period and the move that wipes it out.",
    "Describe uncovered interest parity and why tests often reject it.",
    "Explain why carry trades are exposed to sudden crashes.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Changes in expected rates in one country compared with another are one of the main drivers of currencies. Holding a currency pair also earns or pays the rate gap each day." },
        { kind: "callout", tone: "info", title: "Linked lesson", text: "Forex Foundations covered swaps and the daily financing on a position.", link: { lessonId: "fx-costs", label: "Forex costs and swaps" } },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "The gap between two rates",
      blocks: [
        { kind: "interactive", widget: "macro-fig-differential", title: "Differential and carry", caption: "A drawing of two made-up interest rates, the gap between them, and the carry earned against the risk of the exchange rate moving." },
        { kind: "defs", items: [
          { term: "[[interest-rate-differential|Rate differential]]", text: "One country's rate minus another's." },
          { term: "[[carry-trade|Carry trade]]", text: "Holding the higher-rate currency against the lower-rate one to earn the gap." },
          { term: "[[uncovered-interest-parity|Uncovered interest parity]]", text: "The theory that the higher-rate currency falls by about the gap." },
        ] },
        { kind: "p", text: "What tends to move a currency is a change in the expected differential, not its level. A widening gap that was already priced may do little." },
        { kind: "callout", tone: "key", title: "Key idea", text: "Carry is earned slowly. A small move in the exchange rate can wipe out months of it." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Carry calculator",
      blocks: [
        { kind: "step-list", items: [
          { text: "Leave the defaults: the made-up differential earns carry over 90 days." },
          { text: "Raise the broker's mark-up and see how much of the differential you keep." },
          { text: "Move the exchange rate against you until the total turns negative." },
        ] },
        { kind: "interactive", widget: "macro-carry", title: "Rate-differential and carry calculator", caption: "Made-up rates, size and moves. The tool computes carry from the differential after the broker's mark-up, plus the gain or loss from the exchange rate." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "Months of carry, one bad week",
      blocks: [
        { kind: "p", text: "A made-up trader holds a high-rate currency for six months and collects carry every day. Then risk appetite drops, many carry traders sell at once, and the currency falls sharply in a week." },
        { kind: "callout", tone: "example", title: "Example", text: "Carry returns tend to come in small steps up and sudden steps down. Size for the sudden step, not the small ones." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: parity and crashes",
      blocks: [
        { kind: "concept-card", card: {
          name: "Carry",
          what: "The income from holding a higher-yielding currency funded by a lower-yielding one, paid through the daily swap.",
          whyItExists: "Each currency earns its own interest rate; a position in both earns the difference.",
          problemSolved: "It explains swap charges and why rate gaps attract money.",
          mechanics: "Brokers credit or debit the swap each day, after their own mark-up.",
          math: "Carry over d days ≈ size × (differential − mark-up) × d ÷ 365.",
          howTradersUseIt: "Some hold carry positions in calm markets; others just account for swap costs on short-term trades.",
          whenUseful: "To understand overnight costs and the pull of rate gaps.",
          whenItFails: "In sudden risk-off moves, when carry trades unwind together.",
          limitations: "Swap rates differ by broker and change with policy rates.",
          misconceptions: "That a positive swap makes a trade low-risk.",
          realExample: "In the calculator, a 2.5% adverse move can wipe out more than the carry from months of holding.",
          exercise: "In the calculator, find the adverse move that wipes out 90 days of carry at the default rates.",
          practicalTest: "Look up your broker's swap rates for one pair and compare them with the policy rates.",
        } },
        { kind: "research", research: {
          title: "Forward and Spot Exchange Rates",
          authors: "Eugene F. Fama",
          year: 1984,
          venue: "Journal of Monetary Economics 14(3), 319–338",
          peerReviewed: true,
          question: "Do forward exchange rates, which reflect interest differentials, predict future spot rates as theory suggests?",
          methodology: "Regressions of changes in spot rates on the gap between forward and spot rates.",
          data: "Exchange rates of several major currencies against the US dollar.",
          findings: "The slope coefficients were mostly negative rather than near one, which Fama read as a risk premium that varies over time and is large relative to expected spot changes.",
          limitations: "An older sample of major currencies; the size of the effect varies across periods.",
          practicalMeaning: "On average, higher-rate currencies did not fall by the rate gap, which is why carry can pay, and why it carries risk.",
          status: "replicated",
          url: "https://ideas.repec.org/a/eee/moneco/v14y1984i3p319-338.html",
          verified: true,
        } },
        { kind: "research", research: {
          title: "Carry Trades and Currency Crashes",
          authors: "Markus K. Brunnermeier, Stefan Nagel and Lasse H. Pedersen",
          year: 2009,
          venue: "NBER Macroeconomics Annual 2008, volume 23, 313–347",
          peerReviewed: false,
          question: "Why do carry trades earn returns, and what risks do they carry?",
          methodology: "Study of exchange-rate moves between high- and low-rate currencies, and of links to funding liquidity.",
          data: "Major currency exchange rates and interest rates.",
          findings: "Moves between high- and low-rate currencies were negatively skewed: crashes were more likely than sudden gains. The authors linked the crashes to sudden unwinding of carry trades when risk appetite and funding liquidity fell.",
          limitations: "A conference volume chapter with discussion rather than a standard journal review; sample-specific.",
          practicalMeaning: "Carry is exposed to rare, sharp losses that a calm period hides.",
          status: "replicated",
          url: "https://econpapers.repec.org/RePEc:nbr:nberch:7286",
          verified: true,
        } },
        { kind: "deeper", title: "Covered and uncovered", blocks: [
          { kind: "p", text: "Forward exchange rates are set so that locking in both the rate gap and the future exchange rate earns nothing extra: covered parity. Uncovered parity is the riskier claim that spot rates will move to cancel the gap." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "FX macro traders", view: "Trade changes in expected rate gaps around data and central bank meetings." },
          { name: "Carry investors", view: "Diversify across many currencies and cut exposure when volatility rises." },
          { name: "Short-term traders", view: "Treat swaps as a cost or a small bonus, never as the reason for a trade." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Treating positive carry as safe income.", why: "Currency moves can be far larger.", instead: "Size for sudden adverse moves." },
          { mistake: "Ignoring the broker's mark-up.", why: "It can take much of the differential.", instead: "Check the actual swap rates." },
          { mistake: "Trading the level of rates.", why: "Changes in expectations drive moves.", instead: "Watch the expected differential." },
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
            "A rate differential pays carry through the daily swap.",
            "Changes in the expected differential move currencies.",
            "Carry returns are prone to sudden crashes.",
          ],
          equations: [{ label: "Carry", formula: "size × (differential − mark-up) × days ÷ 365" }],
          implications: ["Check your broker's swaps.", "Size for the bad week.", "Watch expected rate changes, not levels."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Find the policy rates of two central banks on their websites and compute the differential.",
          "Compare it with your broker's swap rates for that pair.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "mn-rate-differentials-ex",
    title: "Carry over a period",
    prompt: "A made-up position of 10,000 earns a differential of 3 points a year after the broker's mark-up. How much carry does it earn in 73 days?",
    unit: "money",
    answer: 60,
    tolerance: 0.5,
    hint: "Size × differential × days ÷ 365.",
    solution: "10,000 × 0.03 × 73 ÷ 365 = 300 × 0.2 = 60. A 0.6% adverse move in the exchange rate would wipe it out.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "What is a carry trade?",
      options: [
        { id: "a", text: "Buying the cheaper of two currencies", explain: "Price level is not the point." },
        { id: "b", text: "Holding a higher-rate currency against a lower-rate one", explain: "Right." },
        { id: "c", text: "Moving money abroad physically", explain: "It is about interest rates, not moving cash." },
        { id: "d", text: "A trade that is guaranteed to earn the rate differential with no risk from exchange rates", explain: "The exchange rate can move." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "What did Fama (1984) find?",
      options: [
        { id: "a", text: "Forward rates predicted spot rates perfectly", explain: "Forward rates were poor predictors of spot rates." },
        { id: "b", text: "Exchange rates never move", explain: "They move all the time; that is the carry risk." },
        { id: "c", text: "Higher-rate currencies fell by more than the gap every year, in every currency studied", explain: "The opposite on average." },
        { id: "d", text: "Slopes were mostly negative, pointing to a varying risk premium", explain: "Right." },
      ],
      correct: "d",
    },
    {
      id: "q3",
      prompt: "Brunnermeier, Nagel and Pedersen linked carry crashes to what?",
      options: [
        { id: "a", text: "Sudden unwinding when risk appetite and funding fell", explain: "Right." },
        { id: "b", text: "Holidays", explain: "Holidays play no part in carry crashes." },
        { id: "c", text: "Central banks forbidding carry trades on certain dates of the year", explain: "No central bank bans carry trades on set dates." },
        { id: "d", text: "Rising swap mark-ups", explain: "Not their finding." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "Rates in two countries stay the same, but markets now expect one to cut soon. What may happen?",
      options: [
        { id: "a", text: "Nothing, since rates did not change", explain: "Expectations matter." },
        { id: "b", text: "The currency expected to cut may weaken", explain: "Right. The expected gap changed." },
        { id: "c", text: "Both currencies must strengthen by the same amount against every other currency", explain: "No such rule." },
        { id: "d", text: "Swaps become zero", explain: "Swaps follow current rates." },
      ],
      correct: "b",
    },
  ],
  practical: {
    title: "Your swap costs",
    instructions: "Research only. Do not place any trades.",
    steps: [
      "Find your broker's long and short swap for two currency pairs.",
      "Compute the yearly cost or income on a small position.",
      "Compare with the policy-rate differential and estimate the mark-up.",
    ],
    reflectionPrompt: "Have you ever held a position for the swap? How big was the risk compared with the income?",
  },
  glossary: ["interest-rate-differential", "carry-trade", "uncovered-interest-parity"],
  next: "mn-risk-on-off",
};

export const MN7_RISK_ON_OFF: Lesson = {
  id: "mn-risk-on-off",
  trackId: T,
  order: 7,
  format: "full",
  title: "Risk-on, risk-off and correlations that change",
  summary: "Markets often move together on risk appetite, but the links between assets shift over time. A correlation from one period is a weak guide to the next.",
  minutes: 18,
  objectives: [
    "Explain risk-on and risk-off and which assets tend to move together.",
    "Explain why correlations change between periods.",
    "Use a rolling correlation and see how the window changes what you measure.",
    "Describe the evidence that the stock–bond link has changed sign.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Positions that look different can turn out to be the same bet on risk appetite. When fear hits, they can all lose at once." },
        { kind: "callout", tone: "info", title: "Linked lesson", text: "Risk Management showed how correlated positions add up to more risk than they seem.", link: { lessonId: "rm-correlation-heat", label: "Correlation and portfolio heat" } },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "A see-saw that can slip",
      blocks: [
        { kind: "interactive", widget: "macro-fig-risk-on-off", title: "Risk-on and risk-off", caption: "A drawing of riskier assets and havens on a see-saw. It shows the habit, not real data or a fixed rule." },
        { kind: "defs", items: [
          { term: "[[risk-on-risk-off|Risk-on / risk-off]]", text: "Broad buying of riskier assets, or flight to havens." },
          { term: "[[safe-haven|Safe haven]]", text: "An asset people buy when they are afraid." },
          { term: "[[rolling-correlation|Rolling correlation]]", text: "Correlation over a moving recent window." },
        ] },
        { kind: "p", text: "Shares and higher-yielding currencies often rise together on risk-on days, while some government bonds and some currencies rise on risk-off days. Often is not always." },
        { kind: "callout", tone: "warn", title: "Watch out", text: "A correlation measured over a calm year can flip in a crisis, exactly when you rely on it." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "A correlation that switches",
      blocks: [
        { kind: "step-list", items: [
          { text: "The two simulated series switch true correlation every 250 days. Grey shows the truth." },
          { text: "Shorten the window: the blue line reacts faster but jumps around." },
          { text: "Read the full-period number. It describes neither period." },
        ] },
        { kind: "interactive", widget: "macro-correlation", title: "Rolling correlation lab", caption: "Two simulated return series from a seeded model whose true correlation switches every 250 days. Not market data." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "When the hedge stops hedging",
      blocks: [
        { kind: "p", text: "A made-up investor holds shares and government bonds, expecting bonds to rise when shares fall. In a period when inflation is the main worry, both fall together." },
        { kind: "callout", tone: "example", title: "Example", text: "The hedge relied on a correlation that held in one kind of world and not in another." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: measuring a moving target",
      blocks: [
        { kind: "concept-card", card: {
          name: "Rolling correlation",
          what: "The correlation of two return series over a moving window, recomputed each day.",
          whyItExists: "One number over a long period hides changes in the relationship.",
          problemSolved: "It shows when and how much a relationship has shifted.",
          mechanics: "Take the last n days of both series, compute their correlation, move one day and repeat.",
          math: "ρ = Σ(x − x̄)(y − ȳ) ÷ √(Σ(x − x̄)² × Σ(y − ȳ)²) over each window.",
          howTradersUseIt: "To check whether a hedge or a diversifying position still behaves as assumed.",
          whenUseful: "Before relying on one position to offset another.",
          whenItFails: "Short windows are noisy; long windows lag; neither predicts the next switch.",
          limitations: "Correlation captures only linear co-movement, and can change suddenly in stress.",
          misconceptions: "That a long-run average correlation will hold in a crisis.",
          realExample: "In the lab, a full-period correlation near zero can hide periods of strong positive and strong negative correlation.",
          exercise: "In the lab, find a window length that tracks the switch within about a month without wild swings.",
          practicalTest: "For two positions you might hold together, ask what would make them fall at the same time.",
        } },
        { kind: "research", research: {
          title: "Inflation Bets or Deflation Hedges? The Changing Risks of Nominal Bonds",
          authors: "John Y. Campbell, Adi Sunderam and Luis M. Viceira",
          year: 2017,
          venue: "Critical Finance Review 6(2), 263–301",
          peerReviewed: true,
          question: "Why has the relationship between US Treasury bond returns and stock returns changed over time?",
          methodology: "Measurement of the changing stock–bond covariance and a model of the yield curve that allows it to vary.",
          data: "US bond and stock returns from 1953 to 2014.",
          findings: "The covariance was slightly positive on average, unusually high in the early 1980s and negative from the early 2000s, especially in the downturns of that decade.",
          limitations: "US data; a model-based interpretation of why the link changed.",
          practicalMeaning: "Whether bonds hedge shares depends on the economic regime; it is not fixed.",
          status: "regime-sensitive",
          url: "https://ideas.repec.org/a/now/jnlcfr/104.00000043.html",
          verified: true,
        } },
        { kind: "deeper", title: "Correlations in stress", blocks: [
          { kind: "p", text: "Many traders find that correlations between risky assets rise in sell-offs, so diversification helps least when it is needed most (Unverified: a common observation; the size varies by market and period)." },
        ] },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Portfolio managers", view: "Stress-test portfolios assuming correlations jump toward one in a crisis." },
          { name: "Macro traders", view: "Ask what regime the market is in, such as growth fears or inflation fears, before assuming a link." },
          { name: "Risk managers", view: "Track rolling correlations and cap total exposure to one theme." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Assuming a hedge will always work.", why: "Correlations change.", instead: "Check the current regime and stress cases." },
          { mistake: "Holding many positions on one theme.", why: "They can all fall together.", instead: "Count theme exposure, not number of trades." },
          { mistake: "Trusting one long-run number.", why: "It can hide opposite periods.", instead: "Look at rolling windows." },
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
            "Risk-on and risk-off describe broad moves in risk appetite.",
            "Correlations shift between regimes, sometimes sign.",
            "Rolling windows trade speed for noise.",
          ],
          equations: [{ label: "Correlation", formula: "cov(x, y) ÷ (sd(x) × sd(y))" }],
          implications: ["Stress-test hedges.", "Limit exposure to one theme.", "Do not trust one long-run correlation."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "List the positions you might hold together and the theme each depends on.",
          "Write what event could make them all lose at once.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "match",
    id: "mn-risk-on-off-ex",
    title: "Risk-on or risk-off?",
    prompt: "Match each made-up market day with its most likely label.",
    pairs: [
      { id: "1", left: "Shares up, higher-yielding currencies up, havens down", right: "Risk-on" },
      { id: "2", left: "Shares down, havens up", right: "Risk-off" },
      { id: "3", left: "Shares and government bonds both down on an inflation scare", right: "The usual hedge failing" },
    ],
    explanation: "The labels describe habits. The third day shows that bonds do not always rise when shares fall.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "What does risk-off usually describe?",
      options: [
        { id: "a", text: "Markets closed", explain: "Risk-off happens while markets are open." },
        { id: "b", text: "A day when every asset rises", explain: "In risk-off, riskier assets usually fall." },
        { id: "c", text: "Investors selling riskier assets and buying havens", explain: "Right." },
        { id: "d", text: "Brokers switching off risk limits on all accounts so that traders can buy more", explain: "It is about investor behaviour, not broker settings." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "What did Campbell, Sunderam and Viceira (2017) find about stocks and bonds?",
      options: [
        { id: "a", text: "Their link was constant", explain: "It changed." },
        { id: "b", text: "Their covariance changed over time, turning negative in the 2000s", explain: "Right." },
        { id: "c", text: "Bonds always fell with shares", explain: "Not always." },
        { id: "d", text: "Stocks and bonds are unrelated in every period and in every country they examined", explain: "They found a link that changed over time." },
      ],
      correct: "b",
    },
    {
      id: "q3",
      prompt: "A short rolling window compared with a long one is…",
      options: [
        { id: "a", text: "Faster to react but noisier", explain: "Right." },
        { id: "b", text: "Slower and smoother", explain: "That is the long window." },
        { id: "c", text: "Always more accurate", explain: "It trades accuracy for speed." },
        { id: "d", text: "Unable to show any change in correlation, however large the switch in the data", explain: "It can." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "You hold three positions that all gain on risk-on days. What is the main risk?",
      options: [
        { id: "a", text: "None; three positions are diversified", explain: "They share one theme." },
        { id: "b", text: "Too much swap income", explain: "Not the main risk." },
        { id: "c", text: "That brokers will close them", explain: "Not the main risk." },
        { id: "d", text: "They can all lose together on a risk-off day", explain: "Right." },
      ],
      correct: "d",
    },
  ],
  practical: {
    title: "Theme exposure",
    instructions: "Writing only. Do not place any trades.",
    steps: [
      "List any positions you hold or plan to hold.",
      "Label each with the theme it depends on.",
      "Add up your total risk per theme and compare with your risk limit.",
    ],
    reflectionPrompt: "Have you ever been surprised that several trades lost at once?",
  },
  glossary: ["risk-on-risk-off", "rolling-correlation", "safe-haven"],
  next: "mn-calendar",
};
