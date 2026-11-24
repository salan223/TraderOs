import type { Lesson } from "../types";

/*
  Risk Management (track 8), lessons 1–5.
  Every number here is an illustrative, made-up example, or a result computed
  by the formulas in lib/academy/risk.ts. Simulated charts are labelled
  "Simulated". Research summaries were checked against the sources linked in
  each item. Nothing here is advice to trade or a recommended risk level.
*/

const T = "risk-management";

export const RM1_RISK_PER_TRADE: Lesson = {
  id: "rm-risk-per-trade",
  trackId: T,
  order: 1,
  format: "full",
  title: "Risk per trade",
  summary: "Deciding in advance how much of the account one trade may lose, and why that single number shapes everything else.",
  minutes: 22,
  objectives: [
    "Define risk per trade as the loss if the stop-loss is hit, in money and as a percentage of the account.",
    "Work out the money at risk from an account size and a risk percentage.",
    "Explain why losses compound and how many losses in a row a given risk level can survive.",
    "Measure results in R, multiples of the amount risked.",
    "Explain why a percentage such as 1% is a convention people choose, not a rule of the market.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Nobody knows which trade will win. What you can decide, before every trade, is how much you are prepared to lose if it does not." },
        { kind: "p", text: "That decision, your [[risk-per-trade|risk per trade]], is the one part of trading that is fully in your control, and it decides whether a normal run of bad luck is an annoyance or the end of the account." },
        { kind: "p", text: "Large studies of individual traders find that many of them lose money over time (see the research below). Risk management does not create an edge. It decides how long you survive while you find out whether you have one." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Risk per trade from zero",
      blocks: [
        { kind: "p", text: "Before you enter, you choose a [[stop-loss]]: the price at which you will accept that the idea was wrong and get out. The money you lose if price reaches that stop is the trade's risk. It is not the size of the [[position]], and it is not the amount the price might move. It is the planned loss." },
        { kind: "p", text: "Most traders express it as a percentage of the account. With a $10,000 account and 1% risk per trade, each trade is sized so that hitting the stop loses about $100. The formula is simple: money at risk = account × risk% ÷ 100." },
        { kind: "list", items: [
          "Risk is decided first; the position size is worked out from it (lesson 2).",
          "Results are easier to compare in [[r-multiple|R]]: if you risk $100 and make $250, that is +2.5R. A loss at the stop is −1R.",
          "[[fixed-fractional|Fixed-fractional]] sizing risks the same percentage of the current [[equity]] each time, so the money at risk falls after losses and rises after wins.",
        ] },
        { kind: "interactive", widget: "rm-fig-r-ladder", title: "The R-multiple ladder", caption: "Results measured in R when $100 is risked. Made-up numbers for illustration." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "See what a losing streak does",
      blocks: [
        { kind: "p", text: "Choose an account size and a risk level, then a number of losses in a row. The line shows what is left of the account after each loss. Compare 1% with 5% or 10% for the same streak." },
        { kind: "interactive", widget: "rm-risk-budget", title: "Risk per trade and a losing streak", caption: "Computed from your inputs with (1 − risk)^losses. The account and streaks are examples, not a forecast of any strategy." },
        { kind: "callout", tone: "info", title: "Why it compounds", text: "At a fixed percentage, each loss takes a share of what is left, not of what you started with. Ten 10% losses leave 0.9^10 ≈ 35% of the account, not 0%. Ten 1% losses leave about 90%.", link: { lessonId: "fx-leverage-margin", label: "Revisit leverage and margin from Forex Foundations" } },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "An example, worked through",
      blocks: [
        { kind: "p", text: "Two traders each start with $10,000 and use the same method, so their trades win and lose at the same moments. One risks 1% per trade; the other risks 10%. The method hits a run of eight losses in a row, something that happens to real methods." },
        { kind: "p", text: "The 1% trader ends the run with 0.99^8 ≈ $9,227: a fall of about 8%, which needs a gain of about 8.4% to recover. The 10% trader ends with 0.9^8 ≈ $4,305: a fall of about 57%, which needs a gain of about 132% to get back. Same method, same luck; the only difference is the number they chose before the first trade." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: R, compounding and choosing a level",
      blocks: [
        { kind: "concept-card", card: {
          name: "Risk per trade (fixed-fractional risk)",
          what: "The planned loss on a trade if its stop-loss is hit, set as a fixed share of the account's current equity.",
          whyItExists: "Outcomes of single trades are uncertain. A fixed, small risk keeps any one trade, or any one bad run, from doing damage the account cannot recover from.",
          problemSolved: "It turns 'how much should I buy?' into a calculation that starts from what you can afford to lose, instead of from how confident you feel.",
          mechanics: "Choose the stop from the chart. Measure the loss per unit if it is hit. Divide the money at risk (account × risk%) by that loss per unit to get the size.",
          math: "Money at risk = equity × r. After n losses in a row: equity × (1 − r)^n. Losses to fall by d: ceil(ln(1 − d) ÷ ln(1 − r)). At r = 1%, a 20% fall takes 23 losses in a row; at r = 5%, it takes 5.",
          howTradersUseIt: "Many retail and professional traders cap risk per trade at a small percentage, often between about 0.25% and 2%, and record every result in R so that different trades can be compared.",
          whenUseful: "Always: every position needs a known worst planned loss, whatever the market.",
          whenItFails: "When the stop does not fill at its price (gaps, fast markets, lesson 8), when positions are correlated so several stops are hit together (lesson 7), or when the 'stop' is only in the trader's head and is moved.",
          limitations: "It controls the planned loss, not the real one. It does not make a losing method profitable. The 'right' percentage depends on the method, its streaks and the trader, and no number is correct for everyone.",
          misconceptions: "That 1% is a law. It is a convention. Another is that small risk means small profits: risk per trade controls how fast the account can fall, while the method decides whether it grows.",
          realExample: "A $25,000 account risking 0.5% per trade plans to lose $125 if a stop is hit. After a $2,000 drawdown it risks 0.5% of $23,000, or $115.",
          exercise: "In the illustration, find the risk level at which 10 losses in a row would leave more than 90% of the account.",
          practicalTest: "Write your own maximum risk per trade as a percentage and a dollar amount, and explain why you chose it.",
        } },
        { kind: "p", text: "Recording results in R separates the quality of a method from the size of the account. A method with an average of +0.2R per trade is the same method whether R is $10 or $1,000. It also makes problems visible: a −3R loss on a trade that was meant to risk 1R means the stop did not work as planned." },
        { kind: "research", research: {
          title: "Just How Much Do Individual Investors Lose by Trading?",
          authors: "Brad M. Barber, Yi-Tsung Lee, Yu-Jane Liu and Terrance Odean",
          year: 2009,
          venue: "The Review of Financial Studies, 22(2), 609–632",
          peerReviewed: true,
          question: "How large are the trading losses of individual investors when every trade in a whole stock market is counted?",
          methodology: "The authors reconstruct the trades of all investors in the Taiwan stock market and compare the performance of individuals' trades with that of institutions.",
          data: "The complete trading history of the Taiwan stock market, including individual and institutional investors.",
          findings: "Individual investors' trading lowered the performance of their aggregate portfolio by 3.8 percentage points a year. These losses were equivalent to 2.2% of Taiwan's GDP. Almost all of them came from aggressive orders, those that cross the spread. Institutions gained 1.5 percentage points a year from their trading.",
          limitations: "One market and one period. It measures investors as a group, so some individuals may do well. Losses include costs and taxes, not only poor decisions.",
          practicalMeaning: "Starting out, the realistic expectation is that trading is hard and often unprofitable after costs. Keeping risk per trade small buys time to learn without large damage.",
          status: "replicated",
          url: "https://ideas.repec.org/a/oup/rfinst/v22y2009i2p609-632.html",
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
          { name: "Fixed-fractional risk", view: "Risks a set percentage of current equity per trade. Simple and self-correcting: losses automatically shrink the next bet." },
          { name: "Volatility targeting", view: "Funds often size positions so that each contributes a set amount of expected volatility, instead of a set loss to a stop. The idea is the same: decide the risk first." },
          { name: "Risk budgets", view: "Trading desks give each trader a loss limit per day, month or year. Individual trades are sized so that ordinary bad runs stay well inside it." },
          { name: "Discretionary scaling", view: "Some traders vary risk with their confidence. Critics point out that confidence is often highest when it is least justified, so many cap the variation tightly." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Deciding the size first and the stop afterwards.", why: "The stop then ends up wherever it makes the size 'work', not where the idea is proved wrong.", instead: "Place the stop from the chart, then calculate the size from the stop and your risk." },
          { mistake: "Confusing position value with risk.", why: "A $5,000 position with a stop 2% away risks $100, not $5,000.", instead: "Always state the risk as the money lost if the stop is hit." },
          { mistake: "Raising risk after a loss to 'win it back'.", why: "It raises risk exactly when judgement is weakest, and turns a normal streak into a deep hole.", instead: "Keep the percentage fixed. If anything, reduce it during a bad run." },
          { mistake: "Treating 1% (or any number) as a rule of the market.", why: "It is a choice. The right level depends on the method's streaks and on you.", instead: "Pick a level you could live with through twenty losses in a row, and write it down." },
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
            "Risk per trade is the planned loss if the stop is hit, set before the trade.",
            "Money at risk = account × risk%. Results are measured in R, multiples of that amount.",
            "Losses compound: after n losses at r, (1 − r)^n of the account is left.",
            "Small percentages survive long streaks; large ones do not.",
            "No percentage is a law. It is a choice that controls how fast the account can fall.",
          ],
          equations: [
            { label: "Money at risk", formula: "risk = equity × r" },
            { label: "After n losses", formula: "equity × (1 − r)^n" },
            { label: "Result in R", formula: "R = profit or loss ÷ amount risked" },
          ],
          implications: [
            "Write down your maximum risk per trade before you look at any chart.",
            "Record every trade's result in R as well as in money.",
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
          "Using the illustration, find how many losses in a row at your chosen risk would take your account down 20%.",
          "Write one sentence explaining your risk level to someone else, including what you would do after a 10% drawdown.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "rm-risk-per-trade-ex",
    title: "How much is at risk?",
    prompt: "An account holds $8,000. The trader risks 1.5% of the account per trade. How much money does one trade risk if its stop is hit?",
    unit: "US dollars",
    answer: 120,
    tolerance: 0.5,
    hint: "Multiply the account by the risk percentage, then divide by 100.",
    solution: "8,000 × 1.5 ÷ 100 = 120. Each trade is sized so that hitting the stop loses about $120.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "What is a trade's 'risk' in the sense used in this lesson?",
      options: [
        { id: "a", text: "The full value of the position you open on the trade", explain: "That is the position value; you only lose all of it in extreme cases." },
        { id: "b", text: "The loss if the stop-loss is hit", explain: "Right. It is the planned loss, decided before entry." },
        { id: "c", text: "How far the price could move in a day", explain: "That is volatility, which helps set the stop but is not the risk itself." },
        { id: "d", text: "The chance that the trade will lose", explain: "Probability matters, but risk per trade here means the planned loss in money." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "A trader risks $200 on a trade and closes it with a $500 profit. What is the result in R?",
      options: [
        { id: "a", text: "+0.4R", explain: "That divides the risk by the profit, the wrong way round." },
        { id: "b", text: "+5R", explain: "R divides by the amount risked ($200), not by $100." },
        { id: "c", text: "+300R", explain: "R is a ratio, not a difference in dollars." },
        { id: "d", text: "+2.5R", explain: "Right. 500 ÷ 200 = 2.5." },
      ],
      correct: "d",
    },
    {
      id: "q3",
      prompt: "With fixed-fractional risk of 10%, roughly how much of the account is left after 5 losses in a row?",
      options: [
        { id: "a", text: "About 59%", explain: "Right. 0.9^5 ≈ 0.59." },
        { id: "b", text: "50%, because each of the five losses takes 10% of the account", explain: "Each loss takes 10% of what is left, not of the start." },
        { id: "c", text: "About 90%", explain: "That is after one loss." },
        { id: "d", text: "Nothing", explain: "Fixed-fractional risk never quite reaches zero this way." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "Which order of decisions does this lesson recommend?",
      options: [
        { id: "a", text: "Choose a size you like, then place the stop where it costs your risk", explain: "This puts the stop where the numbers fit, not where the idea fails." },
        { id: "b", text: "Choose the risk, place the stop from the chart, then calculate the size", explain: "Right. Size is the output, not the input." },
        { id: "c", text: "Enter first and decide on a stop if the trade goes against you", explain: "Without a stop there is no planned risk." },
        { id: "d", text: "Pick the size from how confident you feel about the trade today", explain: "Confidence is a poor guide and often highest when least justified." },
      ],
      correct: "b",
    },
    {
      id: "q5",
      prompt: "What is the best description of '1% risk per trade'?",
      options: [
        { id: "a", text: "A rule set by regulators for retail accounts", explain: "Regulators limit leverage in some places, not your risk per trade." },
        { id: "b", text: "The level that maximises profit for any method", explain: "No single level is best for every method." },
        { id: "c", text: "A widely used convention that limits how fast the account can fall", explain: "Right. It is a choice, often a sensible one." },
        { id: "d", text: "A guarantee that you cannot lose more than 1% on the trade", explain: "Gaps and slippage can make a real loss larger than planned." },
      ],
      correct: "c",
    },
  ],
  practical: {
    title: "Set your risk level",
    instructions: "This is planning only. Do not place any trades.",
    steps: [
      "Write down a practice account size (real or imagined) and the most you would accept losing on one trade, in money and as a percentage.",
      "Use the illustration to see what 10, 15 and 20 losses in a row would do at that level.",
      "If any of those results would make you abandon the plan, lower the percentage and repeat.",
    ],
    reflectionPrompt: "What would you do, specifically, after a 10% fall in the account?",
  },
  glossary: ["risk-per-trade", "r-multiple", "fixed-fractional", "losing-streak", "equity", "drawdown"],
  next: "rm-position-sizing",
};

export const RM2_POSITION_SIZING: Lesson = {
  id: "rm-position-sizing",
  trackId: T,
  order: 2,
  format: "full",
  title: "Position sizing for shares, forex and futures",
  summary: "Turning a risk amount and a stop distance into a number of shares, units or contracts, including pip values for every kind of currency pair.",
  minutes: 30,
  objectives: [
    "Calculate a share position from account size, risk percentage and stop distance.",
    "Calculate a forex position when the account currency is the quote currency, the base currency, or neither (a cross).",
    "Calculate a futures position from the point value and see when even one contract is too large.",
    "Explain why sizes are rounded down, and why position value is not the same as risk.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Two traders can buy the same share at the same price with the same stop and have completely different outcomes, because one bought 50 shares and the other 500. [[position-sizing|Position sizing]] is where your risk decision becomes a real order. Get it wrong and a 1% plan quietly becomes a 10% loss." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "One formula, three markets",
      blocks: [
        { kind: "p", text: "Every sizing calculation has the same shape: size = money at risk ÷ loss per unit if the stop is hit. What changes between markets is how you measure the loss per unit." },
        { kind: "list", items: [
          "Shares: the loss per share is the distance from entry to stop. Entry $50, stop $48: $2 a share. Risking $100 → 50 shares.",
          "Forex: the loss per unit is the stop distance in [[pip|pips]] × the [[pip-value|pip value]] of one unit, in your [[account-currency|account currency]].",
          "Futures: the loss per contract is the stop distance in points × the [[point-value|point value]], set by the contract's [[contract-multiplier|multiplier]].",
        ] },
        { kind: "p", text: "Sizes are rounded down, never up: rounding up means risking more than you planned. In forex the smallest step is often a [[micro-lot|micro lot]] of 1,000 units; futures come in whole contracts." },
        { kind: "interactive", widget: "rm-fig-stop-size", title: "Stop distance sets the size", caption: "Three positions with the same $100 risk: the wider the stop, the fewer the shares. Made-up numbers." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Size a position yourself",
      blocks: [
        { kind: "p", text: "Pick a market, set the account and risk, then the stop. For forex, try all three pairs: EUR/USD (the account currency is the quote), USD/JPY (it is the base) and EUR/GBP (a cross, which needs a [[cross-rate|cross rate]])." },
        { kind: "interactive", widget: "rm-position-size", title: "Position size calculator", caption: "Computed from your inputs. Exchange rates and contract values are round example numbers, not live quotes; real contracts and brokers have their own specifications and rounding." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "Worked examples",
      blocks: [
        { kind: "p", text: "Shares. Account $20,000, risk 1% = $200. Entry $40.00, stop $37.50, so $2.50 a share. 200 ÷ 2.5 = 80 shares, a position worth $3,200 (16% of the account) that risks $200." },
        { kind: "p", text: "Forex, three ways, with a USD account risking $100 and a 20-pip stop:" },
        { kind: "list", items: [
          "EUR/USD (account = quote): one pip on one unit is 0.0001 USD, so 100 ÷ (20 × 0.0001) = 50,000 units (0.5 lots).",
          "USD/JPY at 150.00 (account = base): one pip is 0.01 JPY = 0.01 ÷ 150 ≈ 0.0000667 USD per unit, so 100 ÷ (20 × 0.0000667) = 75,000 units.",
          "EUR/GBP with GBP/USD at 1.25 (a cross): one pip is 0.0001 GBP = 0.000125 USD per unit, so 100 ÷ (20 × 0.000125) = 40,000 units.",
        ] },
        { kind: "p", text: "Futures. A stock index future worth $5 a point, risking $100 with a 10-point stop: 10 × 5 = $50 a contract, so 2 contracts. A contract worth $50 a point with the same stop risks $500 a contract: with $100 to risk, the answer is zero contracts, not one." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: pip values and rounding",
      blocks: [
        { kind: "concept-card", card: {
          name: "Pip value in the account currency",
          what: "How much one pip of movement is worth, per unit or per lot, once converted into the currency your account is held in.",
          whyItExists: "A pip is measured in the pair's quote currency. Your profit and loss, and your risk limit, are in your account currency, so the two have to be connected.",
          problemSolved: "Without it, a 20-pip stop on USD/JPY and a 20-pip stop on EUR/USD look like the same risk, when per unit they are worth different amounts of money.",
          mechanics: "Pip value in quote currency = pip size × units. If the account currency is the quote, that is the answer. If it is the base, divide by the pair's rate. If it is neither, multiply by the rate that converts the quote currency into the account currency.",
          math: "Per unit: quote = account → 0.0001 (0.01 for JPY pairs). Base = account → pip size ÷ rate. Cross → pip size × (quote→account rate). Units = risk ÷ (stop pips × pip value per unit), rounded down.",
          howTradersUseIt: "Traders calculate the pip value of each pair before sizing, or let a trusted calculator do it and check the result on one example by hand.",
          whenUseful: "On every forex trade, and especially on crosses and yen pairs, where the conversion is easy to forget.",
          whenItFails: "If the conversion rate moves a lot while the trade is open, the pip value moves with it, so the risk in account currency drifts from the plan.",
          limitations: "It ignores spread, commission and swap, which add to the real cost (Forex Foundations, lesson 7). Brokers may round lots differently.",
          misconceptions: "That a pip is always worth $10 a lot. That is only true when the quote currency is the US dollar and the account is in dollars.",
          realExample: "With a USD account, a standard lot of EUR/USD has a pip value of $10. A standard lot of USD/JPY at 150 has a pip value of about $6.67.",
          exercise: "In the illustration, set a 30-pip stop and compare the units for the three pairs with the same $100 risk.",
          practicalTest: "Calculate the pip value of one standard lot of GBP/JPY for a USD account, given made-up rates for GBP/JPY and USD/JPY, and explain each step.",
        } },
        { kind: "p", text: "Two different checks belong next to every size. First, the actual risk after rounding: it should be at or just below the plan." },
        { kind: "p", text: "Second, the position value compared with the account: a position worth more than the account uses [[leverage]], which brings margin rules (lesson 6) and makes a gap past the stop (lesson 8) much more dangerous." },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Stop-based sizing", view: "Size from the distance to a stop that would prove the idea wrong. Common among discretionary and systematic traders." },
          { name: "Volatility-based sizing", view: "Size so that each position has a similar expected daily move in money, for example using average true range. Common in managed futures." },
          { name: "Notional limits", view: "Risk desks also cap the total position value and the share of daily trading volume, so a position can be exited without moving the market." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Assuming every pip is worth $10 a lot.", why: "It is only true when the quote currency is your account currency.", instead: "Work out the pip value for the pair and your account currency every time." },
          { mistake: "Rounding the size up 'to make it a round number'.", why: "It risks more than planned on every trade.", instead: "Round down, and accept a slightly smaller risk." },
          { mistake: "Taking one futures contract when the plan allows less than one.", why: "The real risk is then a multiple of the plan.", instead: "Skip the trade or use a smaller contract if one exists. Do not tighten the stop to make it fit." },
          { mistake: "Using the position value as the risk.", why: "It leads to positions that are far too small or, when leveraged, far too large.", instead: "Risk is the loss to the stop; check position value separately." },
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
            "Size = money at risk ÷ loss per unit if the stop is hit.",
            "Shares: loss per share = |entry − stop|.",
            "Forex: loss per unit = stop pips × pip value per unit in the account currency (quote, base or cross).",
            "Futures: loss per contract = stop points × point value; whole contracts only.",
            "Round down, then check the actual risk and the position value.",
          ],
          equations: [
            { label: "Shares", formula: "shares = floor(risk ÷ |entry − stop|)" },
            { label: "Forex", formula: "units = floor(risk ÷ (stop pips × pip value per unit))" },
            { label: "Futures", formula: "contracts = floor(risk ÷ (stop points × point value))" },
          ],
          implications: [
            "If the calculated size is zero, the trade does not fit your plan.",
            "Check one calculation by hand before trusting any calculator, including this one.",
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
          "Size three imaginary trades, one share, one forex pair that is a cross, one future, from the same account and risk. Show your working.",
          "Look up the contract specification (point value) of one futures contract on an exchange website and calculate the risk of a 20-point stop.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "rm-position-sizing-ex",
    title: "How many shares?",
    prompt: "An account holds $20,000 and risks 1% per trade. The entry is $40.00 and the stop is $37.50. How many shares should the trader buy?",
    unit: "shares",
    answer: 80,
    tolerance: 0,
    hint: "Work out the money at risk, then the loss per share, then divide.",
    solution: "Risk = 20,000 × 1% = $200. Loss per share = 40.00 − 37.50 = $2.50. 200 ÷ 2.50 = 80 shares.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "Entry $25.00, stop $24.00, money at risk $150. How many shares?",
      options: [
        { id: "a", text: "6 shares", explain: "That divides by the price, not the loss per share." },
        { id: "b", text: "150", explain: "Right. 150 ÷ (25 − 24) = 150." },
        { id: "c", text: "3,750 shares, the money at risk times the price", explain: "Multiplying by the price gives a value, not a size." },
        { id: "d", text: "1,500 shares", explain: "That would risk $1,500." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "Your account is in US dollars. For which pair is one pip on a standard lot worth exactly $10?",
      options: [
        { id: "a", text: "USD/JPY", explain: "There the quote is yen, so the pip value depends on the rate." },
        { id: "b", text: "EUR/GBP", explain: "A cross: the GBP pip value has to be converted." },
        { id: "c", text: "GBP/USD", explain: "Right. The quote currency is USD, so 0.0001 × 100,000 = $10." },
        { id: "d", text: "USD/CHF, because the US dollar is the first currency of the pair", explain: "Being the base is not enough; the quote here is the Swiss franc." },
      ],
      correct: "c",
    },
    {
      id: "q3",
      prompt: "A futures contract is worth $50 a point. You can risk $300 and your stop is 8 points away. How many contracts fit the plan?",
      options: [
        { id: "a", text: "None: one contract would risk $400", explain: "Right. 8 × 50 = $400 per contract, more than $300." },
        { id: "b", text: "One, as the nearest whole number", explain: "Rounding up to one contract risks $400, a third more than the plan." },
        { id: "c", text: "Six", explain: "That divides the risk by the point value and ignores the stop." },
        { id: "d", text: "One, after moving the stop to 6 points so the numbers work", explain: "The stop should come from the chart, not from the contract size." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "Why are position sizes rounded down rather than to the nearest step?",
      options: [
        { id: "a", text: "Because brokers reject orders that are not round", explain: "Brokers accept many sizes; the reason is risk." },
        { id: "b", text: "So the actual risk never exceeds the planned risk", explain: "Right. Rounding up would risk more than you decided." },
        { id: "c", text: "To save on commission", explain: "A tiny effect at most, and not the reason." },
        { id: "d", text: "Because smaller positions always have higher expectancy", explain: "Size does not change a method's expectancy in R." },
      ],
      correct: "b",
    },
    {
      id: "q5",
      prompt: "A share position is worth $30,000 in a $10,000 account, with a stop that risks $100. Which statement is right?",
      options: [
        { id: "a", text: "The risk is $30,000", explain: "The planned risk is the $100 loss to the stop." },
        { id: "b", text: "The position cannot lose more than $100 under any circumstances at all", explain: "A gap past the stop can cost far more." },
        { id: "c", text: "It is unleveraged, since the stop is close", explain: "A position worth three times the account is leveraged." },
        { id: "d", text: "The planned risk is $100, but it uses leverage and gap risk is large", explain: "Right. Both checks matter." },
      ],
      correct: "d",
    },
  ],
  practical: {
    title: "Size three trades by hand",
    instructions: "Use made-up prices or prices from any free chart. Do not place trades.",
    steps: [
      "Choose an account size and risk percentage and write down the money at risk.",
      "Size one share trade, one forex trade on a cross pair and one futures trade, each with a stop you place from a chart.",
      "Check each answer with the illustration, then write down the position value as a percentage of the account.",
    ],
    reflectionPrompt: "Which of the three was easiest to get wrong, and what would you check next time?",
  },
  glossary: ["point-value", "cross-rate"],
  next: "rm-stop-placement",
};

export const RM3_STOP_PLACEMENT: Lesson = {
  id: "rm-stop-placement",
  trackId: T,
  order: 3,
  format: "full",
  title: "Placing stop-losses: structure and volatility",
  summary: "Putting the stop where the idea is proved wrong, using chart structure or the average true range, and letting the size follow.",
  minutes: 26,
  objectives: [
    "Place a structure stop beyond the swing point that would invalidate a trade idea.",
    "Place a volatility stop at a multiple of the average true range (ATR).",
    "Explain why stops too close are hit by ordinary noise and stops too far make positions small.",
    "Describe what research says about when stop-loss rules help and when they hurt.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "The stop defines your risk per unit, and so your size. If it sits where ordinary wobbles reach it, you will be stopped out of ideas that were not wrong. If it sits arbitrarily far away, the position becomes tiny or, worse, the trader keeps the size and quietly risks far more." },
        { kind: "p", text: "A stop should answer one question: at what price is my reason for this trade no longer true?" },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Two ways to place a stop",
      blocks: [
        { kind: "p", text: "A [[structure-stop|structure stop]] uses the chart. If you buy because price is making higher lows, the idea is wrong once price falls below the most recent [[swing-low|swing low]]. The stop goes just below it, with a small [[stop-buffer|buffer]], at the point of [[invalidation]]." },
        { kind: "p", text: "An [[atr-stop|ATR stop]] uses volatility. The [[average-true-range|average true range]] measures how far price typically moves in a bar. A stop 2 × ATR below the entry sits outside most ordinary bar-to-bar movement, the market's [[market-noise|noise]]." },
        { kind: "list", items: [
          "Both methods give a distance. The size then comes from that distance and your risk (lesson 2).",
          "A wider stop means a smaller size for the same risk; a tighter stop means a larger size. The money at risk stays the same.",
          "A stop chosen to fit a size you wanted ('my stop is $1 because I want 100 shares') is not a stop based on the market.",
        ] },
        { kind: "interactive", widget: "rm-fig-stop-methods", title: "Structure stop and ATR stop", caption: "A sketch of an uptrend, not real prices: one stop below the swing low, one two ATRs below the entry." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Compare the two methods on a chart",
      blocks: [
        { kind: "p", text: "The chart is a simulated uptrend. Imagine buying at the last close. Switch between a structure stop and an ATR stop, change the buffer or the multiple, and watch the stop line, the distance and the share count change." },
        { kind: "interactive", widget: "rm-stop-placement", title: "Structure stop or ATR stop", caption: "Simulated prices from a seeded random model, not real market data. Position sizes assume a $10,000 account risking 1%." },
        { kind: "callout", tone: "info", title: "Swings and ATR", text: "Swing lows and the average true range were introduced in Chart Reading. Here they become inputs to a risk decision.", link: { lessonId: "cr-structure", label: "Revisit market structure and swings" } },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "An example, worked through",
      blocks: [
        { kind: "p", text: "A share trades at $60.00 in an uptrend. The last swing low is $57.20, and ATR(14) is $1.10. A structure stop with a $0.20 buffer sits at $57.00: $3.00 away. A 2 × ATR stop sits at $57.80: $2.20 away. With $150 at risk, the structure stop gives 50 shares and the ATR stop 68 shares." },
        { kind: "p", text: "Neither is 'correct'. The structure stop is tied to the idea; the ATR stop is tied to how much the market moves. Many traders check one against the other: a structure stop less than one ATR away is likely to be hit by noise, and one five ATRs away may mean the idea is too loose to trade." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: what a stop can and cannot do",
      blocks: [
        { kind: "concept-card", card: {
          name: "ATR stop",
          what: "A stop placed a chosen multiple of the average true range away from the entry.",
          whyItExists: "Markets differ in how much they move. A fixed $1 stop is wide for a calm share and tiny for a volatile one; ATR scales the stop to the market.",
          problemSolved: "It reduces the chance that ordinary, meaningless movement hits the stop, and gives comparable stops across very different markets.",
          mechanics: "Calculate ATR over n bars (often 14). Long: stop = entry − k × ATR. Short: stop = entry + k × ATR. Size from the resulting distance.",
          math: "True range = max(high − low, |high − previous close|, |low − previous close|). ATR = Wilder average of true range. Stop distance = k × ATR; shares = risk ÷ (k × ATR).",
          howTradersUseIt: "Trend followers often use 2–4 × ATR. Some move the stop up as price rises ('trailing'), never down.",
          whenUseful: "When comparing positions across markets with different volatility, or when there is no clear structure on the chart.",
          whenItFails: "Volatility changes. After a quiet spell ATR is small, so stops are tight just before volatility returns. Gaps ignore ATR entirely.",
          limitations: "ATR measures past movement, not future movement. The multiple is a choice; there is no correct value.",
          misconceptions: "That a wider stop is 'safer'. With a fixed risk the money lost is the same; only the size changes. With a fixed size, a wider stop simply risks more.",
          realExample: "With ATR at $1.10, a 2 × ATR stop is $2.20 away. If ATR doubles to $2.20 next month, the same rule puts the stop $4.40 away and halves the size.",
          exercise: "In the illustration, find the ATR multiple at which the ATR stop and the structure stop are about the same distance.",
          practicalTest: "On a real chart, mark the last swing low and calculate a 2 × ATR stop from a free ATR indicator. Explain which you would use and why.",
        } },
        { kind: "research", research: {
          title: "When do stop-loss rules stop losses?",
          authors: "Kathryn M. Kaminski and Andrew W. Lo",
          year: 2014,
          venue: "Journal of Financial Markets, 18, 234–254",
          peerReviewed: true,
          question: "Under what conditions do stop-loss rules, which cut exposure after losses past a threshold, add to or subtract from a strategy's expected return and volatility?",
          methodology: "An analytical framework for the effect of simple stop-loss rules on a portfolio's return and volatility, followed by empirical tests applying stop-loss policies to buy-and-hold strategies.",
          data: "The published article tests stop-loss policies on buy-and-hold strategies in index futures using daily futures prices. An earlier working-paper version used monthly US equity returns from 1950 to 2004, switching into long-term US government bonds when stopped out.",
          findings: "If returns follow a random walk, simple stop-loss rules always lower the expected return (they still change volatility). When returns show momentum, stop-loss rules can add value. In the data, some stop-loss policies raised expected return while substantially lowering volatility at longer sampling frequencies.",
          limitations: "The rules studied are portfolio-level switches between assets, not stops on single trades. Results depend on the return process, which can change, and on the sample.",
          practicalMeaning: "A stop is first a risk-control tool: it caps how much one idea can cost. Whether stops also improve returns depends on how the market behaves, so expect them to cost something in some conditions.",
          status: "regime-sensitive",
          url: "https://ideas.repec.org/a/eee/finmar/v18y2014icp234-254.html",
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
          { name: "Structure first", view: "Discretionary traders often place the stop where the chart idea fails, then check it is not inside normal noise." },
          { name: "Volatility multiples", view: "Systematic trend followers commonly use ATR or standard-deviation multiples, applied the same way in every market." },
          { name: "Time stops", view: "Some exit a trade that has not worked within a set time, freeing risk for other ideas." },
          { name: "Portfolio stops", view: "Funds may cut overall exposure after a set drawdown, the kind of rule Kaminski and Lo study, instead of (or as well as) stops on single positions." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Placing the stop at an obvious round number or exactly on the swing low.", why: "Many orders cluster there, and a brief poke through can trigger it.", instead: "Add a buffer beyond the level, and accept the slightly smaller size." },
          { mistake: "Moving the stop further away when price approaches it.", why: "It turns a planned loss into an open-ended one.", instead: "Only ever move a stop to reduce risk, never to increase it." },
          { mistake: "Choosing a tight stop to allow a bigger size.", why: "The stop then sits inside the noise and is hit more often.", instead: "Let the stop come from the market and the size from the stop." },
          { mistake: "Believing a stop guarantees the exit price.", why: "A normal stop becomes a market order; in a gap it fills at the next available price.", instead: "Treat the stop price as a plan and size for the possibility of a worse fill (lesson 8)." },
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
            "A stop belongs where the trade idea is proved wrong.",
            "Structure stops sit beyond the swing that invalidates the idea; ATR stops sit k × ATR away.",
            "Stop distance and size move in opposite directions for a fixed risk.",
            "Under a random walk, stop rules lower expected return; with momentum they can help. They are a risk-control tool first.",
          ],
          equations: [
            { label: "ATR stop (long)", formula: "stop = entry − k × ATR" },
            { label: "Structure stop (long)", formula: "stop = swing low − buffer" },
            { label: "Size", formula: "shares = risk ÷ (entry − stop)" },
          ],
          implications: [
            "Check every structure stop against ATR: less than one ATR away is likely noise.",
            "Never widen a stop once the trade is open.",
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
          "On three charts, mark the swing low you would use for a long trade's stop and the 2 × ATR level. Note the difference in distance.",
          "For each, calculate the size for the same risk and write which stop you prefer and why.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "rm-stop-placement-ex",
    title: "What is each stop based on?",
    prompt: "Sort each stop description by what it is based on.",
    categories: [
      { id: "structure", label: "Chart structure" },
      { id: "vol", label: "Volatility (ATR)" },
      { id: "none", label: "Not based on the market" },
    ],
    items: [
      { id: "a", text: "Just below the most recent swing low, with a small buffer.", category: "structure", explain: "Tied to the point that would invalidate an uptrend idea." },
      { id: "b", text: "2.5 × ATR(14) below the entry.", category: "vol", explain: "A multiple of typical movement." },
      { id: "c", text: "$1 below the entry, because that allows 300 shares.", category: "none", explain: "Chosen to fit a size, not the market." },
      { id: "d", text: "Above the last swing high for a short position.", category: "structure", explain: "Above that high, the downtrend idea fails." },
      { id: "e", text: "Wherever the loss would feel bearable today.", category: "none", explain: "A feeling, not a level in the market." },
      { id: "f", text: "Three average daily ranges away from the entry.", category: "vol", explain: "Scaled to how much the market usually moves." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "You buy because price is making higher lows. Where does a structure stop go?",
      options: [
        { id: "a", text: "Just below the most recent swing low", explain: "Right. Below it, the higher-low structure is broken." },
        { id: "b", text: "Exactly at the entry price, so the trade can never lose", explain: "That is not a stop based on the idea, and it will be hit by noise." },
        { id: "c", text: "Just above the most recent swing high, where the trend could pause", explain: "For a long trade, the stop must be below the entry." },
        { id: "d", text: "At a level that allows the size you wanted", explain: "That fits the stop to the size, the wrong way round." },
      ],
      correct: "a",
    },
    {
      id: "q2",
      prompt: "Entry $80, ATR(14) $2.50. Where is a 2 × ATR stop for a long position?",
      options: [
        { id: "a", text: "$77.50", explain: "That is 1 × ATR." },
        { id: "b", text: "$85.00", explain: "That is above the entry, the side for a short." },
        { id: "c", text: "$75.00", explain: "Right. 80 − 2 × 2.50 = 75." },
        { id: "d", text: "$78.00, two dollars below", explain: "The rule uses two ATRs, not two dollars." },
      ],
      correct: "c",
    },
    {
      id: "q3",
      prompt: "With a fixed risk of $200, you widen your stop from $2 to $4. What happens?",
      options: [
        { id: "a", text: "The risk doubles to $400", explain: "Only if you keep the size. The rule recalculates the size." },
        { id: "b", text: "The size halves, and the money at risk stays $200", explain: "Right. 200 ÷ 4 = 50 shares instead of 100." },
        { id: "c", text: "Nothing changes", explain: "The size must change for the risk to stay the same." },
        { id: "d", text: "The trade becomes safe from gaps because the stop is now further away", explain: "A gap can go past any stop." },
      ],
      correct: "b",
    },
    {
      id: "q4",
      prompt: "What did Kaminski and Lo find about simple stop-loss rules when returns follow a random walk?",
      options: [
        { id: "a", text: "They always raise expected return", explain: "The opposite: under a random walk they lower it." },
        { id: "b", text: "They make no difference to anything at all, return or volatility", explain: "They change both return and volatility." },
        { id: "c", text: "They guarantee lower losses on every single trade", explain: "No rule guarantees that." },
        { id: "d", text: "They lower expected return; with momentum they can add value", explain: "Right. The effect depends on how returns behave." },
      ],
      correct: "d",
    },
    {
      id: "q5",
      prompt: "Price approaches your stop. What does this lesson say you may do with the stop?",
      options: [
        { id: "a", text: "Move it further away to give the trade more room", explain: "That increases the risk after the fact." },
        { id: "b", text: "Remove it and decide later", explain: "Then there is no planned loss at all." },
        { id: "c", text: "Leave it, or move it only to reduce risk", explain: "Right. Stops may tighten, never widen." },
        { id: "d", text: "Double the position size to bring the average entry price closer", explain: "That is averaging down (lesson 9), adding risk to a losing idea." },
      ],
      correct: "c",
    },
  ],
  practical: {
    title: "Stops on real charts",
    instructions: "Use any free charting tool with an ATR indicator. You are only observing.",
    steps: [
      "Pick a share or a currency pair in a clear uptrend on a daily chart.",
      "Mark the last swing low and write down a structure stop with a small buffer.",
      "Add ATR(14) and write down a 2 × ATR stop from the last close.",
      "Calculate the size for 1% of a $10,000 account for both stops.",
    ],
    reflectionPrompt: "Was your structure stop inside one ATR of the entry? What would that mean for how often it gets hit?",
  },
  glossary: ["structure-stop", "atr-stop", "stop-buffer", "market-noise"],
  next: "rm-risk-reward",
};

export const RM4_RISK_REWARD: Lesson = {
  id: "rm-risk-reward",
  trackId: T,
  order: 4,
  format: "full",
  title: "Risk-reward, win rate and expectancy",
  summary: "Why a win rate means nothing on its own, how to calculate expectancy and the break-even win rate, and what these numbers can and cannot tell you.",
  minutes: 26,
  objectives: [
    "Calculate a risk-reward ratio from entry, stop and target.",
    "Calculate expectancy from win rate, average win and average loss, in money and in R.",
    "Calculate the break-even win rate for a given reward-to-risk ratio.",
    "Explain why a high win rate can lose money and a low win rate can make money.",
    "Explain why these numbers are only estimates when based on few trades.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Adverts for trading methods love a high [[win-rate|win rate]]: '80% winners!' On its own that number says almost nothing. A method that wins $10 eight times and loses $100 twice loses $120. What matters is [[expectancy]]: how much the average trade makes or loses once wins and losses are both counted." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Win rate, payoff and expectancy from zero",
      blocks: [
        { kind: "p", text: "The [[risk-reward-ratio|risk-reward ratio]] compares what a trade could make with what it risks. Entry $50, stop $48 ($2 risk), target $56 ($6 reward): 3 : 1. Over many trades, the average win divided by the average loss plays the same role." },
        { kind: "p", text: "Expectancy combines both: expectancy = win rate × average win − loss rate × average loss. Winning 40% of trades with an average win of $300 and an average loss of $100 gives 0.4 × 300 − 0.6 × 100 = $60 per trade, or +0.6R." },
        { kind: "p", text: "For each reward-to-risk ratio there is a [[breakeven-win-rate|break-even win rate]]: 1 ÷ (1 + reward-to-risk). At 1 : 1 it is 50%; at 2 : 1, 33%; at 3 : 1, 25%. Win more often than that and, on these numbers, the method makes money; less often and it loses." },
        { kind: "interactive", widget: "rm-fig-breakeven", title: "Break-even win rate", caption: "The win rate needed to break even for each reward-to-risk ratio, before costs." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Explore win rate and payoff together",
      blocks: [
        { kind: "p", text: "Change the win rate and the average win and loss. The grey line is the break-even win rate for each reward-to-risk ratio; your point is above it when the expectancy is positive." },
        { kind: "interactive", widget: "rm-expectancy", title: "Expectancy and break-even calculator", caption: "Computed from your inputs. The numbers are examples; real averages come from many recorded trades and change over time." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "Two methods compared",
      blocks: [
        { kind: "p", text: "Method A wins 70% of the time, with an average win of $50 and an average loss of $150. Its expectancy is 0.7 × 50 − 0.3 × 150 = −$10 per trade: it loses money while feeling successful most days." },
        { kind: "p", text: "Method B wins 35% of the time, with an average win of $300 and an average loss of $100: 0.35 × 300 − 0.65 × 100 = +$40 per trade, but it spends long stretches losing." },
        { kind: "p", text: "Which one a trader can stick with is a separate, very human question. Method B's long losing runs (lesson 5) are where many people abandon a method that was working on paper." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: expectancy, profit factor and uncertainty",
      blocks: [
        { kind: "concept-card", card: {
          name: "Expectancy",
          what: "The average profit or loss per trade of a method, combining how often it wins with how much it wins and loses.",
          whyItExists: "Neither the win rate nor the payoff alone says whether a method makes money; only both together do.",
          problemSolved: "It gives one number to compare methods and to check whether a method is worth trading at all, before thinking about size.",
          mechanics: "Record many trades of one consistent method. Calculate the win rate, the average win and the average loss after costs. Combine them.",
          math: "E = p × W − (1 − p) × L. In R: E = p × (W/L) − (1 − p). Break-even win rate = L ÷ (W + L) = 1 ÷ (1 + W/L). Profit factor = (p × W) ÷ ((1 − p) × L).",
          howTradersUseIt: "Traders review expectancy in R from their trade journal every month or every 50 trades, and look at whether it is stable or drifting.",
          whenUseful: "When deciding whether a method deserves real money, and when spotting that a method has stopped working.",
          whenItFails: "With few trades the estimate is very noisy: 20 trades can show a positive expectancy by luck alone. Market conditions change, so past expectancy may not hold.",
          limitations: "It is an average. It says nothing about the order of results, the streaks or the drawdowns, which decide whether you survive to collect the average (lessons 5 and 10).",
          misconceptions: "That a high win rate means a good method, or that a 3 : 1 target makes a trade good. The target only matters together with how often it is reached.",
          realExample: "A journal of 200 trades shows 42% winners, an average win of 1.8R and an average loss of 1.0R after costs: E = 0.42 × 1.8 − 0.58 = +0.176R per trade.",
          exercise: "In the illustration, find the lowest win rate at which a 2 : 1 payoff stops losing money.",
          practicalTest: "From any set of 20 or more recorded paper trades, calculate win rate, average win, average loss and expectancy in R.",
        } },
        { kind: "p", text: "Estimates need a lot of data. If a method's true win rate is 50%, a sample of 30 trades will often show anything from about 32% to 68% purely by chance. That is why a few good weeks prove little, and why lesson 10 uses simulation to show how wide the range of outcomes is even when the true numbers are known." },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Trade journals in R", view: "Record every trade's planned risk, result in R, and reason. Expectancy and its stability come from the journal, not from memory." },
          { name: "Statistical significance", view: "Quantitative traders ask whether the expectancy is distinguishable from zero given the number of trades, and test on data the method was not designed on." },
          { name: "Costs first", view: "Many methods with a small positive expectancy before costs are negative after spread, commission and slippage. Professionals compute it net of costs." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Judging a method by its win rate.", why: "A high win rate with small wins and big losses loses money.", instead: "Always look at the win rate together with the average win and loss." },
          { mistake: "Setting distant targets to get a 'good' risk-reward ratio.", why: "A target that is rarely reached lowers the win rate; the ratio alone means nothing.", instead: "Judge targets by how often similar targets have actually been reached." },
          { mistake: "Trusting expectancy from a handful of trades.", why: "Small samples are dominated by luck.", instead: "Treat early results as provisional, and keep risk small until you have many trades." },
          { mistake: "Ignoring costs.", why: "Spread and commission come out of every trade, winners and losers.", instead: "Calculate the averages after all costs." },
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
            "Risk-reward compares the possible gain with the risk to the stop.",
            "Expectancy = win rate × average win − loss rate × average loss.",
            "Break-even win rate = 1 ÷ (1 + reward-to-risk).",
            "Neither win rate nor payoff alone decides whether a method makes money.",
            "Estimates from few trades are unreliable; costs must be included.",
          ],
          equations: [
            { label: "Expectancy", formula: "E = p × W − (1 − p) × L" },
            { label: "In R", formula: "E(R) = p × RR − (1 − p)" },
            { label: "Break-even win rate", formula: "p* = 1 ÷ (1 + RR)" },
            { label: "Profit factor", formula: "PF = (p × W) ÷ ((1 − p) × L)" },
          ],
          implications: [
            "Ignore any advert that quotes a win rate without the average win and loss.",
            "Calculate expectancy in R from your own journal, after costs.",
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
          "Find one trading advert or social post that quotes a win rate. Write down what extra numbers you would need to judge it.",
          "Calculate the break-even win rate for reward-to-risk ratios of 0.5, 1, 1.5, 2 and 4.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "rm-risk-reward-ex",
    title: "Break-even win rate",
    prompt: "A method's average win is three times its average loss (3 : 1). What win rate, in percent, does it need just to break even, before costs?",
    unit: "%",
    answer: 25,
    tolerance: 0.5,
    hint: "Break-even win rate = 1 ÷ (1 + reward-to-risk).",
    solution: "1 ÷ (1 + 3) = 0.25 = 25%. Winning more than 25% of trades makes money on these numbers; fewer loses.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "Entry $100, stop $96, target $110. What is the reward-to-risk ratio?",
      options: [
        { id: "a", text: "2.5 : 1", explain: "Right. Reward 10 ÷ risk 4 = 2.5." },
        { id: "b", text: "0.4 : 1", explain: "That divides risk by reward." },
        { id: "c", text: "10 : 1, because the target is ten dollars above the entry", explain: "The reward has to be divided by the risk of $4." },
        { id: "d", text: "1.1 : 1", explain: "That compares the prices, not the distances." },
      ],
      correct: "a",
    },
    {
      id: "q2",
      prompt: "A method wins 60% of trades, with an average win of $80 and an average loss of $100. What is its expectancy per trade?",
      options: [
        { id: "a", text: "+$48", explain: "That counts only the wins." },
        { id: "b", text: "−$20", explain: "The loss side is 0.4 × 100 = 40, not 100 minus 80." },
        { id: "c", text: "+$8", explain: "Right. 0.6 × 80 − 0.4 × 100 = 48 − 40 = 8." },
        { id: "d", text: "Positive and large, since most of its trades are winners", explain: "Win rate alone does not decide expectancy." },
      ],
      correct: "c",
    },
    {
      id: "q3",
      prompt: "What is the break-even win rate for a 1 : 1 reward-to-risk ratio?",
      options: [
        { id: "a", text: "25%", explain: "That is for 3 : 1." },
        { id: "b", text: "33%", explain: "That is for 2 : 1." },
        { id: "c", text: "66%, two winners for each loser", explain: "At 1 : 1, one winner pays for one loser." },
        { id: "d", text: "50%", explain: "Right. 1 ÷ (1 + 1) = 0.5." },
      ],
      correct: "d",
    },
    {
      id: "q4",
      prompt: "A method has a positive expectancy over its first 15 trades. What is the soundest conclusion?",
      options: [
        { id: "a", text: "It is proven and can be traded with larger size", explain: "Fifteen trades are far too few to separate skill from luck." },
        { id: "b", text: "The result is encouraging but too small a sample to rely on", explain: "Right. Keep risk small and keep recording." },
        { id: "c", text: "It must be curve-fitted", explain: "Possibly, but a small sample does not show that either." },
        { id: "d", text: "Positive early results usually mean the method will fail later", explain: "There is no such rule." },
      ],
      correct: "b",
    },
    {
      id: "q5",
      prompt: "Which statement about win rate is true?",
      options: [
        { id: "a", text: "A method with a 30% win rate can make money", explain: "Right, if the average win is large enough compared with the average loss." },
        { id: "b", text: "A method needs to win more than half of its trades before it can make any money", explain: "Not with a payoff above 1 : 1." },
        { id: "c", text: "A higher win rate is always better than a lower one", explain: "Only if the payoff stays the same." },
        { id: "d", text: "Win rate is the same as expectancy", explain: "Expectancy also needs the average win and loss." },
      ],
      correct: "a",
    },
  ],
  practical: {
    title: "Calculate expectancy from a journal",
    instructions: "Use paper trades, or the made-up list below if you have none. Do not trade.",
    steps: [
      "Write down at least 20 trade results in R (for example from paper trades, or invent a list).",
      "Count the wins and losses and calculate the win rate.",
      "Calculate the average win and the average loss in R.",
      "Calculate expectancy in R and the break-even win rate for your average payoff.",
    ],
    reflectionPrompt: "How much would your expectancy change if your two best trades had been average ones?",
  },
  glossary: ["risk-reward-ratio", "win-rate", "expectancy", "breakeven-win-rate", "profit-factor"],
  next: "rm-drawdowns",
};

export const RM5_DRAWDOWNS: Lesson = {
  id: "rm-drawdowns",
  trackId: T,
  order: 5,
  format: "full",
  title: "Drawdowns, recovery and losing streaks",
  summary: "Why losses are harder to recover than they look, how to measure a drawdown, and how likely long losing streaks are.",
  minutes: 24,
  objectives: [
    "Measure a drawdown from a peak and find the maximum drawdown of an equity curve.",
    "Calculate the gain needed to recover from a loss: x ÷ (1 − x).",
    "Estimate the probability of a losing streak of a given length over many trades.",
    "Explain why streaks and drawdowns, not averages, decide whether a trader survives.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "A 50% loss needs a 100% gain to get back. That asymmetry is the single most important arithmetic fact in risk management. It means deep [[drawdown|drawdowns]] are not just painful but slow, sometimes impossible, to recover from, and it is why the earlier lessons insist on small, fixed risk." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Drawdown and recovery from zero",
      blocks: [
        { kind: "p", text: "A drawdown is the fall from the highest point an account has reached to a later low, as a percentage of that high. If an account grows from $10,000 to $12,000 and then falls to $9,000, the drawdown is (12,000 − 9,000) ÷ 12,000 = 25%, even though it is only 10% below the start." },
        { kind: "p", text: "The largest one over a period is the [[max-drawdown|maximum drawdown]]." },
        { kind: "p", text: "The [[recovery-gain|recovery gain]] is the gain needed to get back to the high. After a loss of x, what is left is 1 − x, so you need x ÷ (1 − x). A 10% loss needs 11.1%; 25% needs 33.3%; 50% needs 100%; 75% needs 300%." },
        { kind: "p", text: "Losing streaks cause most drawdowns. Even when trades are independent, a long run of losses somewhere in hundreds of trades is likely. With a 50% chance of losing each trade, the chance of at least one run of 6 or more losses in 100 trades is about 55%." },
        { kind: "interactive", widget: "rm-fig-recovery", title: "Losses and the gains needed to recover", caption: "Each loss on the left needs the gain on the right to get back to the peak: gain = loss ÷ (1 − loss)." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "See the recovery curve and the streak odds",
      blocks: [
        { kind: "p", text: "Move the loss slider to see the gain needed to recover. Then set a loss rate, a streak length and a number of trades to see how likely such a streak is." },
        { kind: "interactive", widget: "rm-drawdown", title: "Drawdown, recovery and losing streaks", caption: "Computed: recovery = x ÷ (1 − x), and streak probabilities calculated exactly for independent trades. Real trade results can cluster, which makes long streaks more likely." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "An example, worked through",
      blocks: [
        { kind: "p", text: "A method wins 40% of the time. Over a year of 250 trades, the chance of at least one streak of 10 or more losses is about 45%, not far from a coin toss. At 2% risk per trade, ten losses in a row is a drawdown of about 18%; at 5% it is about 40%, which then needs a gain of about 67% to recover." },
        { kind: "p", text: "The trader who knows this in advance can decide, calmly, what a 'normal bad run' looks like for their method and size for it. The trader who does not tends to conclude, ten losses in, that the method is broken, or to raise risk to win it back." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: measuring drawdowns and streaks",
      blocks: [
        { kind: "concept-card", card: {
          name: "Recovery gain",
          what: "The percentage gain needed to return to a previous peak after a given percentage loss.",
          whyItExists: "Gains and losses are percentages of different amounts: a loss shrinks the base, so the same percentage gain afterwards recovers less.",
          problemSolved: "It makes the cost of deep losses concrete, which helps set limits on risk per trade and on total drawdown.",
          mechanics: "After a loss of x (as a fraction), the account is (1 − x) of its peak. Multiplying by (1 + g) must give 1, so g = 1 ÷ (1 − x) − 1.",
          math: "g = x ÷ (1 − x). 10% → 11.1%, 20% → 25%, 33.3% → 50%, 50% → 100%, 75% → 300%, 90% → 900%.",
          howTradersUseIt: "Traders and funds set maximum-drawdown limits (for example, reduce risk at −10%, stop at −20%) partly because recovery beyond that becomes very slow.",
          whenUseful: "When choosing risk per trade and when deciding in advance what to do during a drawdown.",
          whenItFails: "It is exact arithmetic; it does not fail, but it is easy to forget in the moment.",
          limitations: "It says how much gain is needed, not how long it takes. That depends on the method's expectancy and on the risk taken afterwards.",
          misconceptions: "That a 20% loss followed by a 20% gain gets you back. It leaves you at 0.8 × 1.2 = 96% of the start.",
          realExample: "An account falls from $50,000 to $35,000, a 30% drawdown. Getting back to $50,000 needs a gain of 15,000 ÷ 35,000 ≈ 42.9%.",
          exercise: "In the illustration, find the loss at which the recovery gain is exactly double the loss.",
          practicalTest: "Explain to someone, without a calculator, why a 50% loss needs a 100% gain.",
        } },
        { kind: "p", text: "The streak probability in the illustration is calculated exactly by tracking the current run of losses trade by trade. It assumes each trade is independent with the same loss rate." },
        { kind: "p", text: "Real results are often less tidy: a method can go through a period that suits it badly, so losses cluster and long streaks are more common than the independent model suggests. Treat the numbers as a floor, not a ceiling." },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Drawdown limits", view: "Funds and prop firms often set hard limits on drawdown (daily and overall). Breaching one usually means a cut in risk or the end of the account." },
          { name: "Risk-adjusted return", view: "Analysts compare returns with drawdowns (for example return ÷ maximum drawdown) rather than looking at return alone." },
          { name: "Expected streaks", view: "Systematic traders estimate the longest losing run to expect from their win rate and number of trades, and size so they can survive at least that." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Measuring drawdown from the starting balance.", why: "A fall from a higher peak is still a drawdown, and it feels like one.", instead: "Measure from the running peak." },
          { mistake: "Thinking a gain of the same percentage undoes a loss.", why: "The loss shrank the base.", instead: "Use x ÷ (1 − x) to see the gain needed." },
          { mistake: "Believing a long losing streak means the method is broken.", why: "Streaks are expected, even with a positive expectancy.", instead: "Estimate the normal streak length in advance and review the method only after one longer than that, or after a clear change." },
          { mistake: "Raising risk during a drawdown to recover faster.", why: "It deepens the hole if the run continues, and the recovery gain needed grows fast.", instead: "Keep risk fixed or reduce it." },
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
            "Drawdown is measured from the running peak; the largest is the maximum drawdown.",
            "Recovering from a loss x needs a gain of x ÷ (1 − x).",
            "Long losing streaks are likely over many trades, even with an edge.",
            "Independence is an assumption: real streaks can be longer than the model suggests.",
          ],
          equations: [
            { label: "Drawdown", formula: "DD = (peak − value) ÷ peak" },
            { label: "Recovery gain", formula: "g = x ÷ (1 − x)" },
            { label: "After n losses", formula: "equity × (1 − r)^n" },
          ],
          implications: [
            "Decide in advance what you will do at a 10% and a 20% drawdown.",
            "Size so that the longest streak you expect would not force you to stop.",
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
          "Using the illustration, find the chance of a streak of 8 or more losses in 200 trades for your expected loss rate.",
          "Write down your drawdown rules: at what drawdown you would halve your risk, and at what drawdown you would stop and review.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "match",
    id: "rm-drawdowns-ex",
    title: "Loss and recovery",
    prompt: "Match each loss with the gain needed to get back to where you started.",
    pairs: [
      { id: "a", left: "10% loss", right: "About 11.1% gain" },
      { id: "b", left: "20% loss", right: "25% gain" },
      { id: "c", left: "25% loss", right: "About 33.3% gain" },
      { id: "d", left: "50% loss", right: "100% gain" },
      { id: "e", left: "75% loss", right: "300% gain" },
    ],
    explanation: "Each pair follows g = x ÷ (1 − x): for example 0.5 ÷ 0.5 = 1, a 100% gain, and 0.75 ÷ 0.25 = 3, a 300% gain.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "An account rises from $10,000 to $15,000, then falls to $12,000. What is the drawdown?",
      options: [
        { id: "a", text: "None, as it is still above the start", explain: "Drawdown is measured from the peak, not the start." },
        { id: "b", text: "20%", explain: "Right. (15,000 − 12,000) ÷ 15,000 = 20%." },
        { id: "c", text: "25%, measured from the low of $12,000", explain: "It is divided by the peak, not the low." },
        { id: "d", text: "30%", explain: "That divides the fall by the start." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "What gain is needed to recover from a 40% loss?",
      options: [
        { id: "a", text: "40%", explain: "That leaves you at 0.6 × 1.4 = 84% of the start." },
        { id: "b", text: "60%, the share of the account that is left", explain: "The gain needed is the loss divided by what is left." },
        { id: "c", text: "About 66.7%", explain: "Right. 0.4 ÷ 0.6 ≈ 0.667." },
        { id: "d", text: "80%", explain: "Too much: 0.6 × 1.8 = 108%." },
      ],
      correct: "c",
    },
    {
      id: "q3",
      prompt: "A method has a positive expectancy. Can it still have a streak of 10 losses in a row?",
      options: [
        { id: "a", text: "No, a positive expectancy rules that out", explain: "Expectancy is an average; streaks happen anyway." },
        { id: "b", text: "Only if the market has changed", explain: "Streaks happen by chance alone too." },
        { id: "c", text: "Only if the trader made mistakes", explain: "Even perfectly executed trades can lose ten times in a row." },
        { id: "d", text: "Yes; over enough trades it can be quite likely", explain: "Right. With a 60% loss rate, a run of 10 somewhere in 250 trades has about a 45% chance." },
      ],
      correct: "d",
    },
    {
      id: "q4",
      prompt: "A 20% loss is followed by a 20% gain. Where does the account end up?",
      options: [
        { id: "a", text: "At 96% of the start", explain: "Right. 0.8 × 1.2 = 0.96." },
        { id: "b", text: "Exactly back at the start, since the two percentages cancel out", explain: "The gain is on a smaller base." },
        { id: "c", text: "At 104% of the start", explain: "The order does not change the result: 1.2 × 0.8 = 0.96 too." },
        { id: "d", text: "At 80%", explain: "That ignores the gain." },
      ],
      correct: "a",
    },
    {
      id: "q5",
      prompt: "The streak probabilities in the illustration assume independent trades. Why does that matter?",
      options: [
        { id: "a", text: "Real trades are always independent, so it does not matter", explain: "They are not always: results can cluster." },
        { id: "b", text: "Clustered losses make long streaks more likely than the numbers show", explain: "Right. Treat the numbers as a floor." },
        { id: "c", text: "Independence makes the numbers higher than real life", explain: "Usually the opposite." },
        { id: "d", text: "It means the probabilities only apply to coin tosses and never to trading", explain: "They are a useful baseline for trading too, with that caveat." },
      ],
      correct: "b",
    },
  ],
  practical: {
    title: "Measure a drawdown",
    instructions: "Use your paper-trading results, or this made-up series of account values: 10,000, 10,400, 10,900, 10,300, 9,800, 10,200, 11,000, 10,100.",
    steps: [
      "Write down the running peak after each value.",
      "Calculate the drawdown at each point from the running peak.",
      "Find the maximum drawdown and the gain that was needed to recover from it.",
    ],
    reflectionPrompt: "How would you have felt at the deepest point, and what would you have been tempted to do?",
  },
  glossary: ["max-drawdown", "recovery-gain"],
  next: "rm-leverage-margin",
};
