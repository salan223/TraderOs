import type { Lesson } from "../types";

/*
  Track 14: Advanced Trading Concepts, lessons 1–5. Correlation, portfolio-
  level risk, options basics, futures in depth and measuring performance.
  Every series in the tools is generated from a seed or set by the learner;
  option prices come from the Black-Scholes model, not the market. Research
  items not checked line by line against the paper are marked "Unverified".
*/

const T = "advanced";

export const ADV1_CORRELATION: Lesson = {
  id: "adv-correlation",
  trackId: T,
  order: 1,
  format: "full",
  title: "Correlation, properly",
  summary: "Correlation measures how two returns move together. It is estimated with error, it changes over time, and it tends to rise in sell-offs, when diversification matters most.",
  minutes: 22,
  objectives: [
    "Explain covariance and correlation and how they relate.",
    "Show why a correlation measured on a short sample is unreliable.",
    "Explain why correlations tend to rise in falling markets.",
    "Read a correlation matrix with appropriate caution.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Risk Management showed that correlated positions add up to more risk than they look. This lesson asks how far you can trust the correlation number itself." },
        { kind: "callout", tone: "info", title: "Linked lesson", text: "Correlation and portfolio heat were introduced in Risk Management.", link: { lessonId: "rm-correlation-heat", label: "Correlation and portfolio heat" } },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Moving together, measured",
      blocks: [
        { kind: "p", text: "[[covariance|Covariance]] measures whether two returns tend to be above or below their averages at the same time. [[correlation|Correlation]] rescales it to lie between −1 and +1." },
        { kind: "defs", items: [
          { term: "+1", text: "They always move in the same direction, in proportion." },
          { term: "0", text: "No straight-line relationship." },
          { term: "−1", text: "They always move in opposite directions, in proportion." },
        ] },
        { kind: "p", text: "A [[correlation-matrix|correlation matrix]] lists every pair in a portfolio. Each entry is an estimate from past data." },
        { kind: "callout", tone: "key", title: "Key idea", text: "A correlation measured over a few weeks can be far from the truth, and the truth itself changes." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Measure it yourself",
      blocks: [
        { kind: "interactive", widget: "adv-correlation", title: "True versus measured correlation", caption: "Set a true correlation and how many days you measure. Each dot is one made-up day of returns for two assets. Redraw to see how much the measured value moves by chance." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "Diversification that disappears",
      blocks: [
        { kind: "p", text: "In calm markets, shares in different countries may show correlations around 0.5. In a crash, many fall together and measured correlations jump." },
        { kind: "callout", tone: "example", title: "Example", text: "A made-up portfolio of five \"diversified\" share positions each risks 1%. In a sell-off they fall together, and the loss looks like one 5% bet." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: correlation in the tails",
      blocks: [
        { kind: "concept-card", card: {
          name: "Correlation",
          what: "A number from −1 to +1 measuring the straight-line relationship between two series of returns.",
          whyItExists: "Portfolio risk depends on how positions move together, not only on each one's volatility.",
          problemSolved: "It lets you estimate how much combining assets reduces risk.",
          mechanics: "Correlation = covariance ÷ (σA × σB). Estimated over a window of past returns.",
          math: "ρ = cov(A, B) ÷ (σA σB). Its sampling error shrinks roughly with 1/√n.",
          howTradersUseIt: "They use rolling correlations, stress them toward 1 for crisis scenarios, and limit combined exposure.",
          whenUseful: "When sizing a group of positions and checking for hidden concentration.",
          whenItFails: "In regime shifts and crashes, when the measured value from calm times understates how positions move together.",
          limitations: "Measures only straight-line links; two assets can be related in the tails while showing low correlation overall.",
          misconceptions: "That a correlation of 0 means two assets cannot fall together.",
          realExample: "In the tool, with 20 days of data, the measured value often misses a true 0.5 by 0.2 or more.",
          exercise: "Compute a 60-day and a 250-day correlation between two assets you follow and compare them.",
          practicalTest: "Assume all your positions' correlations go to 1 and check whether the total loss is acceptable.",
        } },
        { kind: "research", research: {
          title: "Extreme Correlation of International Equity Markets",
          authors: "François Longin and Bruno Solnik",
          year: 2001,
          venue: "Journal of Finance 56(2)",
          peerReviewed: true,
          question: "Does the correlation between national stock markets change in extreme market conditions?",
          methodology: "Extreme value theory applied to the joint behaviour of large monthly market moves, testing against what a normal distribution would imply.",
          data: "Monthly returns of the US, UK, French, German and Japanese stock markets, 1959–1996.",
          findings: "Correlation increased in bear markets but not in bull markets: large falls were more correlated than a normal model predicts, large rises were not.",
          limitations: "Five developed markets and monthly data; daily and intraday behaviour may differ.",
          practicalMeaning: "Diversification across markets tends to weaken exactly when markets fall hard. Plan for that.",
          status: "replicated",
          url: "https://doi.org/10.1111/0022-1082.00340",
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
          { name: "Risk managers", view: "Run stress tests with correlations pushed toward 1." },
          { name: "Quant analysts", view: "Shrink noisy correlation estimates toward simpler averages before using them." },
          { name: "Discretionary traders", view: "Group positions by theme (for example, \"long risk\") instead of trusting pairwise numbers." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Trusting a short-sample correlation.", why: "Random noise dominates.", instead: "Use longer windows and treat values as rough." },
          { mistake: "Assuming correlations are stable.", why: "They shift with regimes.", instead: "Check them regularly and stress them." },
          { mistake: "Counting positions instead of themes.", why: "Five similar bets are one big bet.", instead: "Group by what drives them." },
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
            "Correlation is covariance rescaled to −1 to +1.",
            "Short samples give noisy estimates.",
            "Correlations change over time and tend to rise in sell-offs.",
          ],
          equations: [{ label: "Correlation", formula: "ρ = cov(A, B) ÷ (σA × σB)" }],
          implications: ["Treat correlation estimates as rough.", "Stress-test with high correlations.", "Group positions by theme."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Pick two assets and estimate their correlation over 60 and 250 days with a spreadsheet's CORREL function.",
          "Write down how your portfolio would fare if every correlation became 1.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "match",
    id: "adv-correlation-ex",
    title: "Correlation values",
    prompt: "Match each correlation with what it means.",
    pairs: [
      { id: "1", left: "+1", right: "Always move together, in proportion" },
      { id: "2", left: "0", right: "No straight-line relationship" },
      { id: "3", left: "−1", right: "Always move in opposite directions" },
      { id: "4", left: "+0.4 from 20 days of data", right: "A noisy estimate that could be far from the truth" },
    ],
    explanation: "The number describes a straight-line relationship, and every measured value carries sampling error.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "What does a correlation of 0 between two assets mean?",
      options: [
        { id: "a", text: "They can never fall on the same day", explain: "They can, by chance or in the tails." },
        { id: "b", text: "No straight-line relationship in the sample", explain: "Right." },
        { id: "c", text: "They are the same asset", explain: "That would be +1." },
        { id: "d", text: "One always rises when the other falls, by exactly the same percentage on every day", explain: "That is −1." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "Longin and Solnik (2001) found that correlation between stock markets…",
      options: [
        { id: "a", text: "Was constant", explain: "It was not." },
        { id: "b", text: "Fell in crashes", explain: "The opposite." },
        { id: "c", text: "Rose in bear markets but not in bull markets", explain: "Right." },
        { id: "d", text: "Only existed in Japan", explain: "They studied five markets." },
      ],
      correct: "c",
    },
    {
      id: "q3",
      prompt: "Why is a correlation measured over 15 days unreliable?",
      options: [
        { id: "a", text: "Few data points make the estimate noisy", explain: "Right." },
        { id: "b", text: "Correlation needs exactly one year of data by law", explain: "No such rule." },
        { id: "c", text: "Markets do not trade for 15 days in a row", explain: "Not the reason." },
        { id: "d", text: "It is always zero", explain: "It can take any value; it is just noisy." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "How do risk managers usually stress-test correlations?",
      options: [
        { id: "a", text: "Set them all to zero", explain: "That understates crisis risk." },
        { id: "b", text: "Ignore them", explain: "Hidden concentration is the risk." },
        { id: "c", text: "Use the lowest value seen in the last month and assume it will hold for the next year as well", explain: "Optimistic." },
        { id: "d", text: "Push them toward 1 and check the combined loss", explain: "Right." },
      ],
      correct: "d",
    },
  ],
  practical: {
    title: "Two correlations",
    instructions: "Research only.",
    steps: [
      "Download daily closing prices for two assets for about a year.",
      "Compute daily returns and their correlation over the last 60 and 250 days.",
      "Note how different the two numbers are.",
    ],
    reflectionPrompt: "Which number would you use for sizing, and why?",
  },
  glossary: ["covariance", "correlation-matrix"],
  next: "adv-portfolio-risk",
};

export const ADV2_PORTFOLIO_RISK: Lesson = {
  id: "adv-portfolio-risk",
  trackId: T,
  order: 2,
  format: "full",
  title: "Portfolio-level risk: volatility, VaR and expected shortfall",
  summary: "A portfolio's risk depends on weights, volatilities and correlations together. Value at Risk gives a loss level for normal bad days; expected shortfall describes the days beyond it.",
  minutes: 24,
  objectives: [
    "Calculate the volatility of a two-asset portfolio.",
    "Explain what Value at Risk does and does not say.",
    "Explain expected shortfall and why it is preferred for tail risk.",
    "Name the main weaknesses of normal-distribution risk models.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Risk per trade controls single positions. Once you hold several at once, you need a number for the whole account." },
        { kind: "p", text: "Banks and funds report Value at Risk every day. Knowing what it leaves out matters as much as knowing what it says." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Adding risks that do not simply add",
      blocks: [
        { kind: "p", text: "[[portfolio-volatility|Portfolio volatility]] is lower than the weighted average of its parts unless everything is perfectly correlated. That gap is the benefit of diversification." },
        { kind: "defs", items: [
          { term: "[[value-at-risk|Value at Risk (VaR)]]", text: "A loss that should be exceeded only on a set share of days, for example 1 day in 20 at 95%." },
          { term: "[[expected-shortfall|Expected shortfall]]", text: "The average loss on the days worse than VaR." },
        ] },
        { kind: "callout", tone: "key", title: "Key idea", text: "VaR tells you where the bad tail starts. It does not tell you how deep it goes. Expected shortfall looks into the tail." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Build a two-asset portfolio",
      blocks: [
        { kind: "interactive", widget: "adv-portfolio-risk", title: "Portfolio volatility, VaR and expected shortfall", caption: "Set two made-up assets' volatilities, their correlation and the weights. See portfolio volatility against the simple average, and a one-day VaR and expected shortfall from a normal model." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "A one-day VaR",
      blocks: [
        { kind: "p", text: "A made-up $1,000,000 portfolio has a daily [[standard-deviation|standard deviation]] of 1%. Under a normal model, the 95% one-day VaR is 1.645 × 1% × $1,000,000 ≈ $16,450." },
        { kind: "p", text: "Expected shortfall at 95% is about 2.06 × 1% × $1,000,000 ≈ $20,600: on the worst 1 day in 20, the average loss is about a quarter larger than VaR." },
        { kind: "callout", tone: "warn", title: "Watch out", text: "Real returns have fatter tails than the normal model. Extreme days happen more often than these formulas suggest." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: what makes a good risk measure",
      blocks: [
        { kind: "concept-card", card: {
          name: "Value at Risk and expected shortfall",
          what: "Two summary numbers for the loss tail of a portfolio over a set horizon.",
          whyItExists: "Managers need one figure to set limits and compare risk across desks and over time.",
          problemSolved: "They turn many positions, volatilities and correlations into a loss figure in money.",
          mechanics: "Parametric versions assume normal returns: VaR = z × σ × value; ES = φ(z) ÷ (1 − c) × σ × value. Historical versions use past returns directly.",
          math: "σp² = Σ wᵢ² σᵢ² + Σ_{i≠j} wᵢ wⱼ σᵢ σⱼ ρᵢⱼ. VaR95 ≈ 1.645 σ; ES95 ≈ 2.063 σ under normality.",
          howTradersUseIt: "They set limits on VaR or ES and run stress tests for scenarios the models miss.",
          whenUseful: "For comparing risk across portfolios and over time in normal markets.",
          whenItFails: "In crises, when volatility and correlations jump and tails are fatter than assumed.",
          limitations: "Both depend on the model and the data window; VaR ignores the size of losses beyond it.",
          misconceptions: "That VaR is the most you can lose. It is a threshold, not a maximum.",
          realExample: "In the tool, a 60/40 mix of 18% and 8% volatility assets with correlation 0.2 has well under the 14% average volatility.",
          exercise: "Calculate the 95% one-day VaR of a made-up $50,000 account with 1.5% daily volatility.",
          practicalTest: "Compare your account's worst day in the last year with what a normal VaR would have predicted.",
        } },
        { kind: "research", research: {
          title: "Coherent Measures of Risk",
          authors: "Philippe Artzner, Freddy Delbaen, Jean-Marc Eber and David Heath",
          year: 1999,
          venue: "Mathematical Finance 9(3)",
          peerReviewed: true,
          question: "What properties should a sensible measure of financial risk have?",
          methodology: "Mathematical analysis proposing four properties (axioms) for a \"coherent\" risk measure and testing common measures against them.",
          data: "None; a theoretical paper with worked examples.",
          findings: "Value at Risk can fail subadditivity: combining two portfolios can show more VaR than the two separately, which contradicts diversification. Measures based on the average of tail losses meet the properties.",
          limitations: "A theoretical framework; practical estimation of tail averages needs a lot of data.",
          practicalMeaning: "Use VaR with care, and look at the average of the worst outcomes too. Regulators later moved toward expected shortfall.",
          status: "replicated",
          url: "https://doi.org/10.1111/1467-9965.00068",
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
          { name: "Bank risk desks", view: "Report VaR and expected shortfall daily and back-test how often losses exceed VaR." },
          { name: "Hedge funds", view: "Combine VaR with scenario stress tests and limits on gross and net exposure." },
          { name: "Individual traders", view: "Use simpler totals: summed risk per trade, worst-case gap loss and a daily loss limit." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Reading VaR as the maximum loss.", why: "It is the start of the tail.", instead: "Look at expected shortfall and stress scenarios." },
          { mistake: "Trusting normal models in crises.", why: "Tails are fatter and correlations rise.", instead: "Add historical and stress scenarios." },
          { mistake: "Using calm-period volatility.", why: "Volatility can double in days.", instead: "Recompute often and stress it." },
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
            "Portfolio volatility is below the weighted average unless correlation is 1.",
            "VaR gives a loss threshold for a set confidence level.",
            "Expected shortfall averages the losses beyond VaR.",
            "Normal models understate extreme days.",
          ],
          equations: [
            { label: "Two-asset volatility", formula: "σp = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂σ₁σ₂ρ)" },
            { label: "Normal VaR / ES (95%)", formula: "≈ 1.645σ × value / 2.063σ × value" },
          ],
          implications: ["Never read VaR as a maximum.", "Stress-test.", "Recompute as volatility changes."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Calculate a 50/50 portfolio's volatility from two made-up assets for correlations of 1, 0.5 and 0.",
          "Compute a normal 95% one-day VaR for your own (or a made-up) account.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "adv-portfolio-risk-ex",
    title: "Diversification in a number",
    prompt: "A portfolio holds 50% in asset A and 50% in asset B. Each has 20% yearly volatility and their correlation is 0. What is the portfolio's volatility, in %?",
    unit: "%",
    answer: 14.1,
    tolerance: 0.1,
    hint: "σp = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂σ₁σ₂ρ). With ρ = 0 the last term vanishes.",
    solution: "√(0.25 × 400 + 0.25 × 400) = √200 ≈ 14.1%, against 20% for each asset alone.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "A 95% one-day VaR is $10,000. What does that mean?",
      options: [
        { id: "a", text: "You can never lose more than $10,000 in a day", explain: "VaR is not a maximum." },
        { id: "b", text: "You will lose $10,000 tomorrow", explain: "It is a threshold, not a forecast." },
        { id: "c", text: "Losses are expected to exceed $10,000 on about 1 day in 20, if the model holds", explain: "Right." },
        { id: "d", text: "The average loss on bad days is $10,000", explain: "That is closer to expected shortfall." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "Why do many prefer expected shortfall to VaR for tail risk?",
      options: [
        { id: "a", text: "It averages the losses beyond the VaR level", explain: "Right." },
        { id: "b", text: "It is always smaller", explain: "It is larger or equal." },
        { id: "c", text: "It needs no data", explain: "It needs more." },
        { id: "d", text: "It ignores the tail entirely and focuses only on the most common daily returns", explain: "The opposite." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      prompt: "When is a portfolio's volatility equal to the weighted average of its parts?",
      options: [
        { id: "a", text: "When correlation is 0", explain: "Then it is lower." },
        { id: "b", text: "Always", explain: "Only in one case." },
        { id: "c", text: "When correlation is −1", explain: "Then it can reach zero." },
        { id: "d", text: "When correlation is +1", explain: "Right." },
      ],
      correct: "d",
    },
    {
      id: "q4",
      prompt: "What is the main weakness of normal-distribution VaR?",
      options: [
        { id: "a", text: "It is too hard to calculate", explain: "It is simple." },
        { id: "b", text: "It understates how often extreme losses happen", explain: "Right. Real tails are fatter." },
        { id: "c", text: "It only works for single stocks", explain: "It works for portfolios." },
        { id: "d", text: "It is banned for retail traders", explain: "Anyone may use it; the issue is its assumptions." },
      ],
      correct: "b",
    },
  ],
  practical: {
    title: "Your worst days",
    instructions: "Review only.",
    steps: [
      "List the five worst daily results in your trading or paper-trading record.",
      "Estimate a normal 95% one-day VaR from the record's daily volatility.",
      "Count how many days were worse than the VaR and by how much.",
    ],
    reflectionPrompt: "Were your worst days worse than a normal model would expect?",
  },
  glossary: ["portfolio-volatility", "value-at-risk", "expected-shortfall"],
  next: "adv-options-basics",
};

export const ADV3_OPTIONS: Lesson = {
  id: "adv-options-basics",
  trackId: T,
  order: 3,
  format: "full",
  title: "Options basics: calls, puts and the Greeks",
  summary: "An option is the right, not the obligation, to buy or sell at a set price by a set date. Its price depends on the underlying, time and volatility, and the Greeks measure how.",
  minutes: 28,
  objectives: [
    "Explain calls and puts, strikes, premiums and expiry.",
    "Split an option's price into intrinsic and time value.",
    "Explain delta, gamma, theta and vega in plain terms.",
    "Describe why buying options is not a cheap way to get rich, and why selling them can be dangerous.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Options are popular with beginners because a small premium can control a large position. That leverage cuts both ways, and time works against the buyer." },
        { kind: "p", text: "Understanding how an option's price is built is the difference between using options deliberately and buying lottery tickets." },
        { kind: "callout", tone: "info", title: "Practise it", text: "The Options module in the sidebar lets you place simulated option trades on real past price paths and skip forward to expiry." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Rights to buy and to sell",
      blocks: [
        { kind: "defs", items: [
          { term: "[[call-option|Call]]", text: "The right to buy at the strike. Gains when the price rises." },
          { term: "[[put-option|Put]]", text: "The right to sell at the strike. Gains when the price falls." },
          { term: "[[strike-price|Strike]]", text: "The agreed buy or sell price." },
          { term: "[[option-premium|Premium]]", text: "What the buyer pays; the most a buyer can lose." },
          { term: "[[expiry-date|Expiry]]", text: "The date the right ends." },
        ] },
        { kind: "p", text: "An [[option]]'s price = [[intrinsic-value|intrinsic value]] (what it is worth if used now) + [[time-value|time value]] (the value of the chance of a bigger move before expiry). Time value shrinks to zero at expiry." },
        { kind: "callout", tone: "key", title: "Key idea", text: "A bought option needs the price to move far enough, fast enough, to beat the premium. Being right about direction is not enough." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Payoff and the Greeks",
      blocks: [
        { kind: "interactive", widget: "adv-option-payoff", title: "Build an option and watch its Greeks", caption: "Choose a call or put, buy or sell it, and set the strike, price, volatility and days to expiry. The chart shows profit at expiry and today; the readouts show the model price and Greeks. Prices come from the Black-Scholes model, not the market." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "The Greeks in one sentence each",
      blocks: [
        { kind: "defs", items: [
          { term: "[[delta|Delta]]", text: "About how much the option moves for a $1 move in the share. A 0.50 delta call gains about $0.50." },
          { term: "[[gamma|Gamma]]", text: "How fast delta changes. Largest for at-the-money options close to expiry." },
          { term: "[[theta|Theta]]", text: "Value lost per day as time passes. Speeds up near expiry." },
          { term: "[[vega|Vega]]", text: "Value gained per 1-point rise in volatility." },
        ] },
        { kind: "callout", tone: "example", title: "Example", text: "A made-up 30-day call at strike 100 on a share at 100, with 30% volatility, costs about $3.50 in the model. If the share is still at 100 in 29 days, most of that is gone: theta took it." },
        { kind: "callout", tone: "warn", title: "Watch out", text: "Selling (writing) a call without owning the shares has unlimited loss if the price soars. Beginners should not sell uncovered options." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: the Black-Scholes model",
      blocks: [
        { kind: "concept-card", card: {
          name: "Black-Scholes option pricing",
          what: "A formula for the fair price of a European option, published by Fischer Black and Myron Scholes in 1973, with Robert Merton's extension.",
          whyItExists: "Before it, there was no agreed way to value an option; it showed that an option's value could be derived from hedging it with the underlying.",
          problemSolved: "It turns five inputs (price, strike, time, rate, volatility) into a price and a set of sensitivities.",
          mechanics: "d₁ = [ln(S/K) + (r + σ²/2)T] ÷ (σ√T); d₂ = d₁ − σ√T. Call = S·N(d₁) − K·e^(−rT)·N(d₂). Put = K·e^(−rT)·N(−d₂) − S·N(−d₁).",
          math: "Delta(call) = N(d₁); gamma = φ(d₁) ÷ (Sσ√T); vega = S·φ(d₁)·√T; theta is mostly −S·φ(d₁)·σ ÷ (2√T).",
          howTradersUseIt: "They run the model backwards: from market prices to [[implied-volatility|implied volatility]], the market's price for expected movement.",
          whenUseful: "To compare options across strikes and dates, and to understand how prices respond to each input.",
          whenItFails: "Real volatility is not constant, prices jump, and implied volatility differs by strike (the \"smile\").",
          limitations: "Assumes no dividends (in this simple form), constant volatility and continuous trading.",
          misconceptions: "That the model's price is what an option \"should\" cost. Market prices include demand, supply and jump risk.",
          realExample: "In the tool, raising volatility from 30% to 50% lifts an at-the-money option's price a lot: that is vega.",
          exercise: "In the tool, set 1 day to expiry and move the share price across the strike. Watch delta and gamma.",
          practicalTest: "Look up a real option's price and its implied volatility on a broker's platform and compare with the stock's recent volatility.",
        } },
        { kind: "research", research: {
          title: "Expected Option Returns",
          authors: "Joshua D. Coval and Tyler Shumway",
          year: 2001,
          venue: "Journal of Finance 56(3)",
          peerReviewed: true,
          question: "What returns do bought options and option combinations earn on average?",
          methodology: "Measurement of weekly returns on index calls, puts and market-neutral straddles, compared with what standard models imply.",
          data: "Options on the S&P 500 and S&P 100 indices, from the late 1980s to the mid-1990s.",
          findings: "Bought puts earned very negative average returns, and zero-beta, at-the-money straddles lost about 3% a week on average: buyers paid for protection against large moves and volatility.",
          limitations: "Index options in one period; individual stock options and other periods differ.",
          practicalMeaning: "On average, option buyers have paid a premium for insurance. Buying options regularly is not a free path to profit.",
          status: "replicated",
          url: "https://doi.org/10.1111/0022-1082.00352",
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
          { name: "Market makers", view: "Hedge delta continuously and earn from the spread and from managing gamma and vega." },
          { name: "Volatility traders", view: "Compare implied volatility with the volatility they expect to see realised." },
          { name: "Hedgers", view: "Buy puts as insurance on holdings, accepting the cost as a premium." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Buying cheap, far out-of-the-money options.", why: "They are cheap because they rarely pay off.", instead: "Check the break-even and the model's chance of finishing in the money." },
          { mistake: "Ignoring time decay.", why: "Theta takes value every day the price does not move.", instead: "Allow enough time for the move you expect." },
          { mistake: "Selling uncovered options for income.", why: "Small steady gains, then a huge loss.", instead: "Learn with defined-risk positions in simulation first." },
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
            "Calls are rights to buy, puts rights to sell, at the strike by expiry.",
            "Price = intrinsic value + time value.",
            "Delta, gamma, theta and vega measure how the price responds.",
            "Bought options lose to time decay; sold options can lose far more than the premium.",
          ],
          equations: [
            { label: "Call break-even at expiry", formula: "= strike + premium" },
            { label: "Put break-even at expiry", formula: "= strike − premium" },
            { label: "Black-Scholes call", formula: "= S·N(d₁) − K·e^(−rT)·N(d₂)" },
          ],
          implications: ["Know your break-even.", "Respect time decay.", "Avoid uncovered selling while learning."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Use the Options module to place one simulated call and one simulated put and run them to expiry.",
          "Write down the break-even of each before you start, and compare with what happened.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "adv-options-basics-ex",
    title: "Call or put?",
    prompt: "Sort each situation by the option that fits it.",
    categories: [
      { id: "call", label: "Bought call" },
      { id: "put", label: "Bought put" },
    ],
    items: [
      { id: "1", text: "Gains if the share price rises well above the strike", category: "call", explain: "A call is the right to buy." },
      { id: "2", text: "Gains if the share price falls well below the strike", category: "put", explain: "A put is the right to sell." },
      { id: "3", text: "Insurance on shares you already own", category: "put", explain: "A put limits losses below the strike." },
      { id: "4", text: "Break-even at expiry is strike plus premium", category: "call", explain: "The price must rise past the strike by the premium." },
      { id: "5", text: "Delta is between −1 and 0", category: "put", explain: "A put loses as the price rises." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "You buy a call with strike 100 for a premium of 4. What is the break-even price at expiry?",
      options: [
        { id: "a", text: "96", explain: "That is the put break-even." },
        { id: "b", text: "100", explain: "You also need to recover the premium." },
        { id: "c", text: "104", explain: "Right. Strike plus premium." },
        { id: "d", text: "4", explain: "That is the premium." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "What does theta measure?",
      options: [
        { id: "a", text: "Value lost as one day passes", explain: "Right." },
        { id: "b", text: "Change for a $1 move", explain: "That is delta." },
        { id: "c", text: "Change for a volatility point", explain: "That is vega." },
        { id: "d", text: "The number of contracts traded in the option on the previous trading day", explain: "That is volume." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      prompt: "Which position has the largest possible loss?",
      options: [
        { id: "a", text: "A bought call", explain: "Its loss is capped at the premium." },
        { id: "b", text: "A bought put", explain: "Also capped at the premium." },
        { id: "c", text: "Shares bought with no stop", explain: "At most the price paid." },
        { id: "d", text: "A sold (written) call without owning the shares", explain: "Right. The loss is unlimited." },
      ],
      correct: "d",
    },
    {
      id: "q4",
      prompt: "Coval and Shumway (2001) found that market-neutral, at-the-money index straddles…",
      options: [
        { id: "a", text: "Earned steady profits", explain: "The opposite." },
        { id: "b", text: "Lost about 3% a week on average", explain: "Right." },
        { id: "c", text: "Had zero return", explain: "They lost." },
        { id: "d", text: "Could not be traded", explain: "They were traded." },
      ],
      correct: "b",
    },
  ],
  practical: {
    title: "Simulated options",
    instructions: "Simulation only. Do not trade real options.",
    steps: [
      "Open the Options module from the sidebar.",
      "Place one call and one put on the same scenario, noting each break-even first.",
      "Skip to expiry and compare the results with the break-evens.",
    ],
    reflectionPrompt: "Did time decay cost you more or less than you expected?",
  },
  glossary: ["option", "call-option", "put-option", "strike-price", "option-premium", "intrinsic-value", "time-value", "implied-volatility", "black-scholes", "delta", "gamma", "theta", "vega"],
  next: "adv-futures",
};

export const ADV4_FUTURES: Lesson = {
  id: "adv-futures",
  trackId: T,
  order: 4,
  format: "full",
  title: "Futures in depth: margin, settlement and basis",
  summary: "Futures settle gains and losses every day. Initial and maintenance margin, daily calls, delivery or cash settlement, and the basis all shape what holding one really means.",
  minutes: 22,
  objectives: [
    "Explain initial and maintenance margin and how a margin call works.",
    "Follow a futures position through daily settlement.",
    "Distinguish cash settlement from physical delivery.",
    "Explain the basis and why it converges at expiry.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "[[futures|Futures]] give large exposure for a small deposit. A move that would be a small dent in a share position can wipe out a futures account." },
        { kind: "callout", tone: "info", title: "Linked lesson", text: "Leverage and margin were covered for all markets in Risk Management.", link: { lessonId: "rm-leverage-margin", label: "Leverage and margin" } },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Daily settlement",
      blocks: [
        { kind: "p", text: "Every day the exchange [[mark-to-market|marks]] each position to the settlement price. Gains are added to your account; losses are taken out in cash that day." },
        { kind: "defs", items: [
          { term: "[[initial-margin|Initial margin]]", text: "The deposit needed to open a position." },
          { term: "[[maintenance-margin|Maintenance margin]]", text: "The minimum balance; below it, a [[margin-call|margin call]] asks you to top back up to initial margin." },
          { term: "[[cash-settlement|Cash settlement]]", text: "At expiry, the difference is paid in cash." },
          { term: "[[physical-delivery|Physical delivery]]", text: "At expiry, the actual commodity or asset changes hands." },
        ] },
        { kind: "callout", tone: "key", title: "Key idea", text: "Futures losses are paid as they happen. A trade that would come good next week can still force you out this week if you cannot meet the call." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Follow the margin account",
      blocks: [
        { kind: "interactive", widget: "adv-futures-margin", title: "Twenty days of daily settlement", caption: "A made-up crude oil-style contract of 1,000 units with $6,000 initial and $5,000 maintenance margin. Choose long or short and the contracts, then see every daily gain or loss and margin call." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "A margin call in numbers",
      blocks: [
        { kind: "p", text: "A made-up contract covers 1,000 barrels. Initial margin is $6,000; maintenance is $5,000. You buy one at $75." },
        { kind: "p", text: "The price falls to $73.80: a $1,200 loss, leaving $4,800, below maintenance. You must add $1,200 to get back to $6,000, or the broker closes the position." },
        { kind: "callout", tone: "warn", title: "Watch out", text: "Contract value here is $75,000 against a $6,000 deposit: about 12.5× leverage. An 8% move against you wipes out the deposit." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: the basis",
      blocks: [
        { kind: "concept-card", card: {
          name: "Basis and convergence",
          what: "The difference between the spot price and a futures price, and its movement toward zero as expiry approaches.",
          whyItExists: "At expiry, a futures contract must be worth the asset it delivers, or there would be a riskless profit.",
          problemSolved: "It explains why futures and spot prices differ before expiry and why hedges are not perfect.",
          mechanics: "Before expiry, futures reflect spot plus carrying costs (financing, storage) minus any income or convenience of holding the physical. At expiry the gap closes.",
          math: "Basis = spot − futures. Fair futures ≈ spot × (1 + financing + storage − income) over the time to expiry.",
          howTradersUseIt: "Hedgers watch basis risk; arbitrageurs trade when the basis moves away from carrying costs.",
          whenUseful: "When hedging with futures or comparing futures with the underlying.",
          whenItFails: "When storage is full or delivery is disrupted, the basis can move wildly near expiry.",
          limitations: "Carrying costs and convenience values are not directly observable.",
          misconceptions: "That a futures hedge removes all risk. Basis risk remains.",
          realExample: "In the commodities track, the April 2020 WTI contract fell below zero as storage ran out near expiry.",
          exercise: "Compare a stock index's level with its front-month futures price and work out the basis.",
          practicalTest: "Check the same basis a week later and note whether it shrank.",
        } },
        { kind: "research", research: {
          title: "Commodity Futures Prices: Some Evidence on Forecast Power, Premiums, and the Theory of Storage",
          authors: "Eugene F. Fama and Kenneth R. French",
          year: 1987,
          venue: "Journal of Business 60(1)",
          peerReviewed: true,
          question: "Do the gaps between futures and spot prices behave as the theory of storage predicts, and do futures prices forecast spot prices?",
          methodology: "Regressions of futures-spot gaps (the basis) on interest rates and seasonal factors, and of later spot changes on the basis.",
          data: "Futures and spot prices for 21 commodities.",
          findings: "The basis varied with interest rates and seasonal storage costs as the theory of storage predicts. Evidence that futures prices forecast spot prices, and of risk premiums, was weaker and differed across commodities.",
          limitations: "Older data and a limited set of commodities; markets have changed since.",
          practicalMeaning: "The basis is largely explained by carrying costs, not by the market's forecast of the future price.",
          status: "replicated",
          url: "https://doi.org/10.1086/296385",
          verified: false,
        } },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Hedgers", view: "Match contract size and dates to their exposure and track basis risk." },
          { name: "Speculators", view: "Size from full contract value and keep spare cash for margin calls." },
          { name: "Arbitrageurs", view: "Trade the basis when it moves away from carrying costs." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Sizing from the margin deposit.", why: "Losses follow the full contract value.", instead: "Size from contract value and planned stop." },
          { mistake: "Keeping no spare cash.", why: "A margin call you cannot meet closes the trade at the worst time.", instead: "Hold reserves well above maintenance." },
          { mistake: "Forgetting settlement type.", why: "Physical delivery can mean taking oil or grain.", instead: "Know whether the contract settles in cash or by delivery." },
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
            "Futures settle daily; losses are paid in cash as they happen.",
            "Falling below maintenance margin triggers a call to return to initial margin.",
            "Contracts settle in cash or by delivery.",
            "The basis shrinks toward zero by expiry.",
          ],
          equations: [
            { label: "Daily P&L", formula: "= price change × contract size × contracts (× −1 if short)" },
            { label: "Leverage", formula: "≈ contract value ÷ margin posted" },
            { label: "Basis", formula: "= spot − futures" },
          ],
          implications: ["Size from contract value.", "Keep margin reserves.", "Know the settlement type and dates."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Look up the contract size and margin for one index future and one commodity future.",
          "Work out the leverage of each from contract value ÷ margin.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "adv-futures-ex",
    title: "Meet the margin call",
    prompt: "Made-up contract: 1,000 units, initial margin $6,000, maintenance margin $5,000. You buy one at $75 and the price settles at $73.50. How much must you add to meet the margin call, in $?",
    unit: "$",
    answer: 1500,
    tolerance: 1,
    hint: "Loss = price fall × 1,000. Balance = 6,000 − loss. If below 5,000, top up to 6,000.",
    solution: "Loss = 1.50 × 1,000 = 1,500. Balance = 6,000 − 1,500 = 4,500, below 5,000. Top-up = 6,000 − 4,500 = 1500.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "When does a futures margin call happen?",
      options: [
        { id: "a", text: "When the balance falls below maintenance margin", explain: "Right." },
        { id: "b", text: "Every Friday", explain: "Calls follow losses, not days." },
        { id: "c", text: "When the position is profitable", explain: "The opposite." },
        { id: "d", text: "Only at expiry, when the final settlement price is published by the exchange", explain: "Daily settlement can trigger them anytime." },
      ],
      correct: "a",
    },
    {
      id: "q2",
      prompt: "A contract is worth $80,000 and margin is $8,000. Roughly what is the leverage?",
      options: [
        { id: "a", text: "1×", explain: "That would be no leverage." },
        { id: "b", text: "8×", explain: "Check the division." },
        { id: "c", text: "100×", explain: "Too high." },
        { id: "d", text: "10×", explain: "Right. 80,000 ÷ 8,000." },
      ],
      correct: "d",
    },
    {
      id: "q3",
      prompt: "What happens to the basis as a futures contract nears expiry?",
      options: [
        { id: "a", text: "It grows without limit", explain: "It shrinks as futures converge to spot." },
        { id: "b", text: "It shrinks toward zero", explain: "Right. Futures converge to spot." },
        { id: "c", text: "It becomes the margin requirement", explain: "Unrelated." },
        { id: "d", text: "It doubles on the final day as dealers close their positions", explain: "No such rule." },
      ],
      correct: "b",
    },
    {
      id: "q4",
      prompt: "Why should futures be sized from contract value, not margin?",
      options: [
        { id: "a", text: "Margin is refunded at expiry", explain: "Not the reason." },
        { id: "b", text: "Exchanges require it by law", explain: "It is about risk." },
        { id: "c", text: "Gains and losses follow the full contract value", explain: "Right." },
        { id: "d", text: "Contract value never changes", explain: "It changes with price." },
      ],
      correct: "c",
    },
  ],
  practical: {
    title: "Contract specifications",
    instructions: "Research only. Do not trade futures as part of this task.",
    steps: [
      "Find the exchange page for one index future and one commodity future.",
      "Note the contract size, tick value, settlement type and last trading day.",
      "Note the broker's initial and maintenance margin for each.",
    ],
    reflectionPrompt: "What move in each contract would wipe out its initial margin?",
  },
  glossary: ["initial-margin", "maintenance-margin", "basis", "cash-settlement", "physical-delivery"],
  next: "adv-performance",
};

export const ADV5_PERFORMANCE: Lesson = {
  id: "adv-performance",
  trackId: T,
  order: 5,
  format: "full",
  title: "Measuring performance properly",
  summary: "Returns alone say little. Compare against a benchmark, separate skill (alpha) from market exposure (beta), and remember that short records are mostly noise.",
  minutes: 22,
  objectives: [
    "Separate return from market exposure using alpha and beta.",
    "Use CAGR, maximum drawdown, Sharpe and information ratios together.",
    "Estimate how uncertain a Sharpe ratio is from a short record.",
    "Spot common ways performance gets overstated.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Most track records shown online are short, cherry-picked or compared with nothing. Judging your own results needs the same care." },
        { kind: "callout", tone: "info", title: "Linked lesson", text: "Backtesting introduced the main metrics. This lesson asks what they can prove.", link: { lessonId: "bt-metrics", label: "Backtest metrics" } },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Skill or the market?",
      blocks: [
        { kind: "p", text: "If shares rose 20% and your strategy rose 22% while holding 1.5 times the market's exposure, you did worse than simply holding more of the market." },
        { kind: "defs", items: [
          { term: "[[beta|Beta]]", text: "How much the strategy tends to move with its [[benchmark]]." },
          { term: "[[alpha|Alpha]]", text: "Return beyond what beta explains; possibly skill, possibly luck." },
          { term: "[[information-ratio|Information ratio]]", text: "Excess return over the benchmark ÷ how much that excess varies." },
        ] },
        { kind: "callout", tone: "key", title: "Key idea", text: "Return that comes from market exposure is not skill. And with a short record, even alpha can be luck." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Luck versus skill",
      blocks: [
        { kind: "interactive", widget: "adv-performance", title: "A made-up track record", caption: "Set a strategy's true skill, market exposure and record length. See its equity curve against a benchmark, and the measured CAGR, drawdown, Sharpe ratio with its uncertainty, alpha and beta. Redraw for different luck." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "Three years is short",
      blocks: [
        { kind: "p", text: "A made-up strategy shows a [[sharpe-ratio|Sharpe ratio]] of 1.0 over 3 years. The approximate standard error is √((1 + 1²/2) ÷ 3) ≈ 0.71." },
        { kind: "p", text: "A rough 95% range is 1.0 ± 1.4: anywhere from below zero to about 2.4. The record cannot tell a good strategy from a lucky one." },
        { kind: "callout", tone: "example", title: "Example", text: "Set skill to zero in the tool and redraw ten times: a few records will show Sharpe ratios above 1 by chance alone." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: the statistics of Sharpe ratios",
      blocks: [
        { kind: "concept-card", card: {
          name: "Alpha, beta and estimation error",
          what: "A way to split returns into market exposure and the rest, and to judge how sure you can be about the rest.",
          whyItExists: "Returns mix skill, exposure and luck; investors pay for skill, not exposure they could get cheaply.",
          problemSolved: "It stops a leveraged market bet from being mistaken for skill.",
          mechanics: "Regress strategy returns on benchmark returns: the slope is beta; the intercept, annualised, is alpha.",
          math: "r = α + β × r_bench + ε. Sharpe SE ≈ √((1 + SR²/2) ÷ years) for independent returns.",
          howTradersUseIt: "They report alpha and beta with every return figure, and demand long records before trusting a Sharpe ratio.",
          whenUseful: "When judging any track record, including your own paper trading.",
          whenItFails: "When returns are autocorrelated or non-normal, simple formulas understate the uncertainty.",
          limitations: "Choice of benchmark changes alpha; a wrong benchmark makes exposure look like skill.",
          misconceptions: "That a high Sharpe ratio over one or two years proves an edge.",
          realExample: "In the tool, with 3 years of data the 95% range around the Sharpe ratio is about ±1.4.",
          exercise: "Compute your paper-trading Sharpe ratio and its standard error from the number of years traded.",
          practicalTest: "Decide in advance how many years of results you need before you would trust a strategy with real money.",
        } },
        { kind: "research", research: {
          title: "The Statistics of Sharpe Ratios",
          authors: "Andrew W. Lo",
          year: 2002,
          venue: "Financial Analysts Journal 58(4)",
          peerReviewed: true,
          question: "How accurately can a Sharpe ratio be estimated, and is the usual way of annualising it correct?",
          methodology: "Derivation of the statistical distribution of the Sharpe ratio estimator, including when returns are serially correlated, applied to mutual and hedge fund data.",
          data: "Monthly returns of mutual funds and hedge funds.",
          findings: "Sharpe ratios are estimated with substantial error. When returns are serially correlated, the common practice of multiplying a monthly Sharpe ratio by √12 can overstate the annual figure considerably, by as much as 65% for some hedge funds.",
          limitations: "Asymptotic formulas need enough data; other features such as fat tails add further uncertainty.",
          practicalMeaning: "Always ask how long a record is and how its Sharpe ratio was annualised before trusting it.",
          status: "replicated",
          url: "https://doi.org/10.2469/faj.v58.n4.2453",
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
          { name: "Fund allocators", view: "Demand long, audited records and judge alpha after fees against the right benchmark." },
          { name: "Quant researchers", view: "Adjust for the number of strategies tried and for serial correlation." },
          { name: "Individual traders", view: "Track risk-adjusted results, drawdowns and rule-following, not just profit." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Comparing with no benchmark.", why: "A rising market lifts everything.", instead: "Compare with a fair benchmark and report beta." },
          { mistake: "Trusting short records.", why: "Luck dominates over months or a few years.", instead: "Look at the uncertainty, not only the number." },
          { mistake: "Ignoring drawdowns.", why: "A strong CAGR can hide a crash you could not sit through.", instead: "Always report max drawdown alongside returns." },
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
            "Beta measures market exposure; alpha is the rest.",
            "Use several metrics together, including drawdown.",
            "Sharpe ratios from short records are very uncertain.",
            "The benchmark choice can make exposure look like skill.",
          ],
          equations: [
            { label: "Regression", formula: "r = α + β × r_bench + ε" },
            { label: "Sharpe standard error", formula: "≈ √((1 + SR²/2) ÷ years)" },
            { label: "CAGR", formula: "= (end ÷ start)^(1 ÷ years) − 1" },
          ],
          implications: ["Always state a benchmark.", "Demand long records.", "Report drawdowns."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Compute CAGR, max drawdown and a Sharpe ratio for any fund or your own paper trading.",
          "Estimate the Sharpe ratio's standard error from the record length.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "match",
    id: "adv-performance-ex",
    title: "Metrics and what they tell you",
    prompt: "Match each metric with what it measures.",
    pairs: [
      { id: "1", left: "Beta", right: "Exposure to the benchmark's moves" },
      { id: "2", left: "Alpha", right: "Return not explained by benchmark exposure" },
      { id: "3", left: "Max drawdown", right: "Largest peak-to-trough fall" },
      { id: "4", left: "Information ratio", right: "Excess return per unit of tracking error" },
    ],
    explanation: "No single number is enough; together they separate exposure, skill and pain.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "A strategy with beta 1.5 rose 22% while its benchmark rose 20%. What does that suggest?",
      options: [
        { id: "a", text: "Clear skill", explain: "Exposure explains more than the return." },
        { id: "b", text: "It underperformed what its market exposure would have earned", explain: "Right. 1.5 × 20% = 30%." },
        { id: "c", text: "Beta does not matter", explain: "It does." },
        { id: "d", text: "It had no market exposure at all and earned everything from skill alone", explain: "Beta 1.5 is a lot of exposure." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "Why is a Sharpe ratio of 1.2 over 2 years weak evidence of skill?",
      options: [
        { id: "a", text: "The estimate's uncertainty is large over short periods", explain: "Right." },
        { id: "b", text: "Sharpe ratios cannot exceed 1", explain: "They can." },
        { id: "c", text: "Two years is too long", explain: "It is too short." },
        { id: "d", text: "The Sharpe ratio ignores volatility", explain: "It divides by it." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      prompt: "What did Lo (2002) say about annualising a monthly Sharpe ratio with √12?",
      options: [
        { id: "a", text: "It is always exact", explain: "Not with correlated returns." },
        { id: "b", text: "It always understates", explain: "It can overstate." },
        { id: "c", text: "It should use 12 instead of √12", explain: "That would overstate it far more." },
        { id: "d", text: "It can overstate the figure when returns are serially correlated", explain: "Right." },
      ],
      correct: "d",
    },
    {
      id: "q4",
      prompt: "Which metric would reveal a crash hidden inside a strong CAGR?",
      options: [
        { id: "a", text: "Beta", explain: "That measures exposure." },
        { id: "b", text: "Win rate", explain: "Not directly." },
        { id: "c", text: "Maximum drawdown", explain: "Right." },
        { id: "d", text: "The number of trades placed over the whole period", explain: "Unrelated." },
      ],
      correct: "c",
    },
  ],
  practical: {
    title: "Judge a record",
    instructions: "Analysis only.",
    steps: [
      "Take any fund's or your own monthly returns for as long as you have them.",
      "Compute CAGR, max drawdown, Sharpe ratio, beta and alpha against a broad index.",
      "Estimate the Sharpe ratio's 95% range from the record length.",
    ],
    reflectionPrompt: "How many years of data would you need before you trusted this record?",
  },
  glossary: ["alpha", "beta", "information-ratio"],
  next: null,
};
