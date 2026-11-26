import type { AssessmentQuestion, ChoiceOption, ConceptRemediation, GradedItem, ScenarioItem, TrackAssessment } from "../types";

/*
  Track 14 assessment: Advanced Trading Concepts.
  Futures margin and leverage are safety-critical: daily settlement turns a
  leveraged mistake into a cash call the same day. Option prices here come
  from the Black-Scholes model or are made up; every portfolio and track
  record is invented for the sums.
*/

const T = "advanced";

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
    "Questions on every idea from the five lessons: correlation and its limits, portfolio volatility, VaR and expected shortfall, options and the Greeks, futures margin and basis, and measuring performance, with calculations and applied scenarios. You need 90% or more, a sound decision in the scenario, and every safety-critical question right: futures margin and leverage.",
  concepts: [
    {
      id: "adv-corr",
      title: "Correlation and its limits",
      lessonIds: ["adv-correlation"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A correlation number can look like a fixed fact about two assets. It is an estimate with sampling error, it changes over time, and it tends to rise in sell-offs.",
        altExplanation: "Correlation = covariance ÷ (σA × σB), between −1 and +1. With few data points, the measured value can be far from the truth. Longin and Solnik found correlations between stock markets rose in bear markets but not in bull markets.",
        altExample: "Two made-up assets show a correlation near zero over a calm quarter. In a sharp sell-off the next month, both fall on most days and the measured value jumps.",
        practice: tf("A correlation of zero means two assets can never fall on the same day.", false, "False. They can, by chance or in the tails."),
      },
      flashcard: { front: "Correlation", back: "ρ = cov ÷ (σA σB). Noisy on short samples, changes with regimes, tends to rise in sell-offs." },
    },
    {
      id: "adv-port",
      title: "Portfolio volatility, VaR and expected shortfall",
      lessonIds: ["adv-portfolio-risk"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Value at Risk is often read as the most you can lose. It is a threshold that losses should exceed only on a set share of days, and says nothing about how bad those days are.",
        altExplanation: "Under a normal model, VaR95 ≈ 1.645 × σ × value and expected shortfall at 95% ≈ 2.06 × σ × value. Portfolio volatility is below the weighted average unless correlation is 1. Real markets have fatter tails than the normal model.",
        altExample: "A made-up $200,000 portfolio with 2% daily volatility has a normal 95% VaR of about $6,580; on the worst 1 day in 20 the average loss is closer to $8,250.",
        practice: numeric("A made-up $500,000 portfolio has 1% daily volatility. What is its normal 95% one-day VaR, in $? (z = 1.645)", "$", 8225, 5, "1.645 × 0.01 × 500,000 = 8,225."),
      },
      flashcard: { front: "VaR and ES", back: "VaR = loss threshold at a confidence level, not a maximum. ES = average loss beyond it. Normal models understate extremes." },
    },
    {
      id: "adv-opt",
      title: "Options: calls, puts and the Greeks",
      lessonIds: ["adv-options-basics"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Buying a cheap option can look like a low-risk way to make a lot. The premium is the most a buyer can lose, but time decay eats it every day, and far out-of-the-money options rarely pay off.",
        altExplanation: "Price = intrinsic value + time value. Delta ≈ change per $1 move; gamma = change in delta; theta = value lost per day; vega = change per volatility point. A call's break-even at expiry is strike + premium; a put's is strike − premium.",
        altExample: "A made-up 20-day put at strike 50 costs 1.80. If the share stays at 52 until expiry, the put expires worthless and the whole premium is lost to time.",
        practice: numeric("You buy a put with strike 80 for a premium of 3. What is the break-even share price at expiry?", "price", 77, 0.01, "80 − 3 = 77."),
      },
      flashcard: { front: "Options", back: "Call = right to buy, put = right to sell. Price = intrinsic + time value. Δ, Γ, Θ, ν measure sensitivity. Sold calls: unlimited loss." },
    },
    {
      id: "adv-fut",
      title: "Futures margin, leverage and settlement",
      lessonIds: ["adv-futures"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "A futures loss can feel like it only matters at expiry. Futures settle every day: losses are taken from your account in cash, and a margin call must be met now.",
        altExplanation: "Daily P&L = price change × contract size × contracts. If the balance drops below maintenance margin, you must top it back up to initial margin. Leverage ≈ contract value ÷ margin. Size from contract value, never from the deposit.",
        altExample: "A made-up index future worth $200,000 needs $16,000 of margin, about 12.5× leverage. A 4% fall costs $8,000 in a day, half the deposit.",
        practice: numeric("A made-up contract is worth $120,000 and needs $10,000 of initial margin. What is the leverage, as a multiple?", "×", 12, 0.05, "120,000 ÷ 10,000 = 12×."),
      },
      flashcard: { front: "Futures margin", back: "Daily settlement. Below maintenance → top up to initial. Leverage ≈ contract value ÷ margin. Size from contract value." },
    },
    {
      id: "adv-perf",
      title: "Measuring performance properly",
      lessonIds: ["adv-performance"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A strategy that beat the market can look skilled. If it held more market exposure (beta above 1), the extra return may simply be leverage on the market, not skill.",
        altExplanation: "Regress returns on a benchmark: beta is the slope, alpha the rest. Report drawdown with return. A Sharpe ratio's standard error ≈ √((1 + SR²/2) ÷ years), so short records are very uncertain.",
        altExample: "A made-up strategy with beta 2 rises 18% while its benchmark rises 10%. Twice the benchmark would have been 20%, so it trailed its own exposure.",
        practice: numeric("A made-up record shows a Sharpe ratio of 0 over 4 years. What is the approximate standard error of that Sharpe ratio?", "SE", 0.5, 0.01, "√((1 + 0) ÷ 4) = 0.5."),
      },
      flashcard: { front: "Performance", back: "Beta = exposure, alpha = the rest. Always show drawdown. Sharpe SE ≈ √((1 + SR²/2) ÷ years)." },
    },
    {
      id: "adv-applied",
      title: "Applying advanced concepts to decisions",
      lessonIds: ["adv-portfolio-risk", "adv-options-basics", "adv-futures", "adv-performance"],
      critical: true,
      safetyCritical: false,
      applied: true,
      remediation: {
        misconception: "Advanced tools such as options, futures and risk models can feel like they make trading safer by themselves. Used without limits, they mainly make it easier to take too much risk.",
        altExplanation: "Before using any advanced tool: know the worst plausible loss in money (not a model's typical day), size so it fits your limits, prefer defined-risk positions while learning, and judge results over long enough records with a fair benchmark.",
        altExample: "A made-up trader likes a stock and considers selling uncovered calls for income. They work out that a 40% jump would cost ten months of premium and choose a defined-risk spread in simulation instead.",
        practice: scenario(
          "A trader's portfolio shows a 95% one-day VaR of $3,000, so they decide no day can lose more than that and remove all stops.",
          "What is the soundest assessment?",
          [
            ["a", "Correct; VaR is the maximum loss", "VaR is a threshold, not a maximum.", "unsound"],
            ["b", "VaR is exceeded on about 1 day in 20 and tails are fat; keep stops and stress-test", "Sound: it follows the lesson's process.", "sound"],
            ["c", "Use 99% VaR instead and remove stops", "Better number, same mistake.", "partial"],
            ["d", "Double the size since risk is known", "Adds risk on a misreading.", "unsound"],
          ],
        ),
      },
      flashcard: { front: "Advanced routine", back: "Worst plausible loss in money, size to limits, defined risk while learning, long records and fair benchmarks." },
    },

    {
      id: "adv-corr-est",
      title: "Estimating correlation from data",
      lessonIds: ["adv-correlation"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A correlation computed by a spreadsheet can look exact because it has many decimal places. With a short window of data, the true value could be far away.",
        altExplanation: "Each estimate uses a sample of returns, so it carries sampling error that shrinks only slowly as the sample grows, roughly with 1 ÷ √n. Compare short and long windows, and treat a difference of a few tenths as possibly noise.",
        altExample: "Two made-up assets with a true correlation of 0.3 show 0.65 over one month and 0.1 over the next, purely by chance.",
        practice: single("Other things equal, which window gives the most reliable correlation estimate?", [
          ["a", "20 days", "Few observations make it noisy."],
          ["b", "5 days", "Very noisy."],
          ["c", "500 days", "Right. That is what the lesson showed."],
          ["d", "1 day", "Correlation needs many data points."],
        ], "c"),
      },
      flashcard: { front: "Estimating correlation", back: "ρ = cov ÷ (σA σB). Sampling error shrinks roughly with 1/√n, so short windows are noisy." },
    },
    {
      id: "adv-port-vol",
      title: "Portfolio volatility and diversification",
      lessonIds: ["adv-portfolio-risk"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Adding a second asset can seem to add risk in proportion to its size. Unless the two are perfectly correlated, the combined volatility is less than the weighted average of the parts.",
        altExplanation: "σp = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂σ₁σ₂ρ). The cross term shrinks as correlation falls: at ρ = 1 it gives the weighted average, at ρ = 0 the cross term disappears, and at ρ = −1 the right weights can cancel risk.",
        altExample: "Two made-up assets with volatilities of 10% and 25%, held 70/30 with correlation 0.1, give a portfolio volatility of about 11%, below the 14.5% average.",
        practice: numeric("A 50/50 portfolio holds two made-up assets with 16% volatility each and correlation 1. What is the portfolio volatility, in %?", "%", 16, 0.05, "With correlation 1 it equals the weighted average: 16%."),
      },
      flashcard: { front: "Portfolio volatility", back: "σp = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂σ₁σ₂ρ). Below the weighted average unless ρ = 1." },
    },
    {
      id: "adv-greeks",
      title: "The Greeks and time decay",
      lessonIds: ["adv-options-basics"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Delta can look like a fixed number for an option. It changes as the share price moves and as time passes, which is what gamma measures.",
        altExplanation: "Delta ≈ the option's change per $1 move in the share. Gamma is how fast delta changes; it is largest for at-the-money options near expiry, which is why their value can swing so much. Theta is daily time decay; vega is sensitivity to volatility.",
        altExample: "A made-up at-the-money call two days from expiry has a delta near 0.5; a small rise in the share pushes delta toward 0.9 within hours.",
        practice: numeric("A made-up call has delta 0.40. The share rises $2. Roughly how much does the call's price change, in $?", "$", 0.8, 0.01, "0.40 × 2 = 0.80."),
      },
      flashcard: { front: "Greeks", back: "Δ: change per $1. Γ: change in Δ (largest at the money near expiry). Θ: daily decay. ν: per volatility point." },
    },
    {
      id: "adv-sharpe",
      title: "Sharpe ratios and record length",
      lessonIds: ["adv-performance"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A high Sharpe ratio over a year or two can look like proof of an edge. Its standard error over short periods is so large that luck explains it easily.",
        altExplanation: "For independent returns, the standard error of an annual Sharpe ratio is about √((1 + SR²/2) ÷ years). A rough 95% range is the estimate ± 2 standard errors. Short records give ranges that include zero.",
        altExample: "A made-up record of two years shows a Sharpe ratio of 1.2; its rough range runs from about −0.7 to 3.1, so it cannot separate skill from luck.",
        practice: numeric("A made-up record of 9 years shows a Sharpe ratio of 0. What is the approximate standard error?", "SE", 0.333, 0.005, "√(1 ÷ 9) ≈ 0.333."),
      },
      flashcard: { front: "Sharpe uncertainty", back: "SE ≈ √((1 + SR²/2) ÷ years). 95% range ≈ estimate ± 2 SE. Short records prove little." },
    },
  ],
  questions: [
    // adv-corr
    q("advq-co-1", "adv-corr", "knowledge", single("What did Longin and Solnik (2001) find about correlations between stock markets?", [
      ["a", "They were constant", "They changed."],
      ["b", "They fell in crashes", "The opposite."],
      ["c", "They rose in bear markets but not in bull markets", "Right. That is what the lesson showed."],
      ["d", "They existed only for Japan", "Five markets were studied."],
    ], "c"), "Large falls were more correlated than a normal model predicts; large rises were not. Diversification weakens when it is needed most."),
    q("advq-co-2", "adv-corr-est", "knowledge", tf("A correlation measured over 15 days is usually a precise estimate.", false, "False. Few data points make it noisy."), "Sampling error shrinks only slowly with more data; very short windows give unreliable estimates."),
    q("advq-co-3", "adv-corr", "knowledge", single("How do risk managers usually stress-test correlations?", [
      ["a", "Push them toward 1 and check the combined loss", "Right. That is what the lesson showed."],
      ["b", "Set them all to zero", "Understates crisis risk."],
      ["c", "Ignore them", "Hidden concentration is the risk."],
      ["d", "Use the lowest correlation seen in the last month for every pair", "Optimistic."],
    ], "a"), "Assuming positions fall together shows the loss if diversification disappears, as it tends to in sell-offs."),
    q("advq-co-4", "adv-corr-est", "calculation", numeric("Two made-up assets have covariance 0.0006, and volatilities of 0.03 and 0.04 (same units). What is their correlation?", "ρ", 0.5, 0.01, "0.0006 ÷ (0.03 × 0.04) = 0.0006 ÷ 0.0012 = 0.5."), "Correlation rescales covariance by the two standard deviations: ρ = cov ÷ (σA σB)."),

    // adv-port
    q("advq-po-1", "adv-port-vol", "calculation", numeric("A 50/50 portfolio holds two made-up assets with 30% volatility each and correlation 0. What is the portfolio volatility, in %?", "%", 21.2, 0.1, "√(0.25 × 900 + 0.25 × 900) = √450 ≈ 21.2%."), "With correlation 0 the cross term vanishes: σp = √(w₁²σ₁² + w₂²σ₂²)."),
    q("advq-po-2", "adv-port", "knowledge", single("A 95% one-day VaR is $20,000. What does it mean?", [
      ["a", "No day can lose more than $20,000", "VaR is not a maximum."],
      ["b", "Losses should exceed $20,000 on about 1 day in 20, if the model holds", "Right. That is what the lesson showed."],
      ["c", "Tomorrow's loss will be $20,000", "It is not a forecast."],
      ["d", "The average loss on every losing day is $20,000", "Not what it measures."],
    ], "b"), "VaR is a loss threshold at a confidence level. Expected shortfall describes the average beyond it."),
    q("advq-po-3", "adv-port", "knowledge", tf("Expected shortfall at a given confidence level is never smaller than VaR at that level.", true, "True. It averages the losses beyond VaR."), "Because expected shortfall is the average of losses worse than VaR, it is at least as large."),
    q("advq-po-4", "adv-port", "knowledge", single("Artzner and co-authors (1999) showed that VaR can fail which property?", [
      ["a", "Being measured in money", "It is in money."],
      ["b", "Being positive", "Not the issue."],
      ["c", "Being calculable daily", "It can be, so that is not the issue."],
      ["d", "Subadditivity: combined risk not above the sum of parts", "Right. That is what the lesson showed."],
    ], "d"), "VaR can show more risk for a combined portfolio than for its parts, which contradicts diversification; tail-average measures avoid this."),

    // adv-opt
    q("advq-op-1", "adv-opt", "calculation", numeric("You buy a call with strike 120 for a premium of 6. What is the break-even share price at expiry?", "price", 126, 0.01, "120 + 6 = 126."), "A call buyer needs the share to finish above strike + premium to profit at expiry."),
    q("advq-op-2", "adv-greeks", "knowledge", single("What does vega measure?", [
      ["a", "Change in price per $1 move", "That is delta."],
      ["b", "Value lost per day", "That is theta."],
      ["c", "Change in price per 1-point change in volatility", "Right. That is what the lesson showed."],
      ["d", "The number of contracts outstanding", "That is open interest."],
    ], "c"), "Vega shows how much an option gains or loses as implied volatility rises or falls."),
    q("advq-op-3", "adv-opt", "knowledge", tf("The most a buyer of a call option can lose is the premium paid.", true, "True. The buyer's loss is capped."), "A bought option can expire worthless, losing the premium, but no more. Sellers face larger losses."),
    q("advq-op-4", "adv-opt", "knowledge", single("Which position has unlimited possible loss?", [
      ["a", "A bought put", "Capped at the premium."],
      ["b", "A sold call without owning the shares", "Right. That is what the lesson showed."],
      ["c", "A bought call", "Capped at the premium."],
      ["d", "Shares bought outright", "At most the price paid."],
    ], "b"), "If the share price soars, the writer of an uncovered call must deliver shares bought at ever-higher prices."),
    q("advq-op-5", "adv-greeks", "knowledge", tf("Coval and Shumway (2001) found that bought index straddles tended to earn steady profits.", false, "False. They lost about 3% a week on average."), "Buyers of index options paid, on average, for protection against large moves; the straddles lost money on average."),

    // adv-fut (safety-critical)
    q("advq-fu-1", "adv-fut", "calculation", numeric("Made-up contract: 1,000 units, initial margin $5,000, maintenance $4,000. You buy at $60 and it settles at $58.20. How much must you add, in $?", "$", 1800, 1, "Loss 1.80 × 1,000 = 1,800; balance 3,200 < 4,000; top up 5,000 − 3,200 = 1,800."), "Below maintenance, a margin call asks you to restore the balance to initial margin."),
    q("advq-fu-2", "adv-fut", "knowledge", single("When are futures gains and losses settled?", [
      ["a", "Every day, through mark-to-market", "Right. That is what the lesson showed."],
      ["b", "Only at expiry", "They settle daily."],
      ["c", "Once a quarter", "No: that is not how it works."],
      ["d", "Only when you close the position", "Daily settlement happens regardless."],
    ], "a"), "Each day positions are marked to the settlement price and cash moves between accounts."),
    q("advq-fu-3", "adv-fut", "knowledge", tf("Sizing a futures position from the margin deposit understates its risk.", true, "True. Losses follow contract value."), "Margin is a fraction of contract value; size from the full exposure and the planned stop."),
    q("advq-fu-4", "adv-fut", "knowledge", single("What happens to the basis as expiry approaches?", [
      ["a", "It grows without limit", "It shrinks."],
      ["b", "It becomes the margin requirement", "Unrelated to the question."],
      ["c", "It doubles on the last day", "No such rule."],
      ["d", "It shrinks toward zero as futures converge to spot", "Right. That is what the lesson showed."],
    ], "d"), "At expiry a contract must be worth what it delivers, so futures and spot converge."),
    q("advq-fu-5", "adv-fut", "calculation", numeric("A made-up index future is worth $250,000 and margin is $12,500. Roughly what move against you, in %, wipes out the margin?", "%", 5, 0.05, "12,500 ÷ 250,000 = 5%."), "With 20× leverage, a 5% adverse move equals the whole deposit."),

    // adv-perf
    q("advq-pe-1", "adv-perf", "knowledge", single("A strategy with beta 1.5 returned 24% while its benchmark returned 20%. What does that suggest?", [
      ["a", "Strong skill", "Exposure explains more than the return."],
      ["b", "Beta is irrelevant", "It is central."],
      ["c", "It trailed what its market exposure would have earned", "Right. That is what the lesson showed."],
      ["d", "It had no exposure to the market at all", "Beta 1.5 is high exposure."],
    ], "c"), "1.5 × 20% = 30%, so the strategy returned less than its exposure alone implied: negative alpha."),
    q("advq-pe-2", "adv-sharpe", "calculation", numeric("A made-up account grows from 100 to 150 over 5 years. What is the CAGR, in %? (1.5^(1/5) ≈ 1.0845)", "%", 8.45, 0.05, "1.0845 − 1 = 8.45%."), "CAGR = (end ÷ start)^(1 ÷ years) − 1, the steady yearly rate that gives the same result."),
    q("advq-pe-3", "adv-sharpe", "knowledge", tf("A Sharpe ratio of 1.5 over 18 months is strong evidence of skill.", false, "False. Short records are very uncertain."), "With about 1.5 years of data the Sharpe ratio's standard error is close to 1, so the range easily includes zero."),
    q("advq-pe-4", "adv-perf", "knowledge", multi("Which should be reported alongside a strategy's return? Select all that apply.", [
      ["a", "Maximum drawdown", "Right. It belongs in the answer."],
      ["b", "Beta to a fair benchmark", "Right. It belongs in the answer."],
      ["c", "The length of the record", "Right. It belongs in the answer."],
      ["d", "The colour scheme of the trading app", "Irrelevant."],
    ], ["a", "b", "c"]), "Drawdown shows the pain, beta separates exposure from skill, and record length decides how much the numbers can prove."),

    // adv-applied (scenarios)
    q("advq-ap-1", "adv-applied", "applied", scenario(
      "A trader sells uncovered calls on a volatile stock every month for steady income. They have collected premium for eight months in a row.",
      "What is the soundest assessment?",
      [
        ["a", "The strategy is proven safe by eight wins", "Small steady wins can precede a large loss.", "unsound"],
        ["b", "Increase size to earn more premium", "Adds tail risk.", "unsound"],
        ["c", "Work out the loss from a large jump, cap it with defined-risk positions or stop, and size to that", "Sound: plans for the tail.", "sound"],
        ["d", "Keep going but watch the news closely", "Watching does not cap a gap.", "partial"],
      ],
    ), "Uncovered call selling has unlimited loss. Define the worst case and limit it before collecting premium."),
    q("advq-ap-2", "adv-applied", "applied", scenario(
      "A trader buys two index futures because the margin fits their account, without a stop. The market falls 3% the next day and a margin call arrives.",
      "Looking back, what should their process have been?",
      [
        ["a", "Size from contract value and a planned stop, keeping spare cash above maintenance", "Sound: it follows the lesson's process.", "sound"],
        ["b", "Buy one contract instead, still without a stop", "Smaller but still unplanned.", "partial"],
        ["c", "Ignore margin calls until the price recovers", "The broker closes the position.", "unsound"],
        ["d", "Use the remaining cash to add a third contract", "More leverage into losses.", "unsound"],
      ],
    ), "Daily settlement means losses are due at once. Plan size, stop and reserves before entering."),
    q("advq-ap-3", "adv-applied", "applied", scenario(
      "An online trader shows a 14-month record with a Sharpe ratio of 2.2 and invites people to copy their trades for a fee.",
      "What is the soundest response?",
      [
        ["a", "Copy at once; a Sharpe ratio above 2 is exceptional", "Ignores how short the record is.", "unsound"],
        ["b", "Ask for a longer, verified record, the benchmark and beta, and the maximum drawdown before deciding", "Sound: it follows the lesson's process.", "sound"],
        ["c", "Copy with half the planned size", "Smaller, but still unexamined.", "partial"],
        ["d", "Copy only their losing trades in reverse", "Not a process.", "unsound"],
      ],
    ), "Short records are mostly noise and can be cherry-picked. Demand length, verification and risk figures."),
    q("advq-ap-4", "adv-applied", "applied", scenario(
      "A trader holds five share positions in different sectors, each risking 1%. Their measured pairwise correlations over the last month are all below 0.2.",
      "What is the soundest view of their total risk?",
      [
        ["a", "Total risk is about 1% because correlations are low", "Correlations can jump in a sell-off.", "unsound"],
        ["b", "Use last month's correlation and add a sixth position", "Builds on a noisy estimate.", "unsound"],
        ["c", "Assume about 2%, a middle guess", "A guess, not a stress test.", "partial"],
        ["d", "Plan for up to 5% if all fall together, and size so that is acceptable", "Sound: stress-tests correlations.", "sound"],
      ],
    ), "Short-window correlations are noisy and tend to rise in sell-offs. Stress-test with correlations near 1."),

    // added: adv-corr
    q("advq-co-5", "adv-corr", "knowledge", tf("Correlations between markets usually stay fixed over decades.", false, "False. They shift with regimes."), "Stock-bond and cross-market correlations have changed sign and size over different periods."),
    q("advq-co-6", "adv-corr", "knowledge", single("A trader holds five positions driven by the same theme. In a sell-off they are most likely to behave like…", [
      ["a", "Five independent bets", "They share the same driver."],
      ["b", "One large bet", "Right. That is what the lesson showed."],
      ["c", "A hedge against each other", "They point the same way."],
      ["d", "Cash", "They still carry market risk."],
    ], "b"), "Positions with a common driver fall together when it turns, so their risks add up."),
    // added: adv-corr-est
    q("advq-ce-3", "adv-corr-est", "knowledge", tf("Correlation captures every kind of relationship between two assets, including links that appear only in extreme moves.", false, "False. It measures straight-line links."), "Two assets can show low overall correlation yet still fall together in crashes; correlation misses such tail links."),
    q("advq-ce-4", "adv-corr-est", "calculation", numeric("Two made-up assets have volatilities of 0.02 and 0.05 and a correlation of 0.6. What is their covariance?", "cov", 0.0006, 0.00001, "0.6 × 0.02 × 0.05 = 0.0006."), "Covariance = ρ × σA × σB, the reverse of the correlation formula."),
    // added: adv-port
    q("advq-po-5", "adv-port", "knowledge", single("Which risk measure averages the worst losses rather than giving a single threshold?", [
      ["a", "Value at Risk", "That is a threshold."],
      ["b", "Beta", "That measures market exposure."],
      ["c", "Win rate", "Unrelated to the loss tail."],
      ["d", "Expected shortfall", "Right. That is what the lesson showed."],
    ], "d"), "Expected shortfall is the average loss on days worse than the VaR level, so it describes the tail."),
    // added: adv-port-vol
    q("advq-pv-2", "adv-port-vol", "calculation", numeric("A 50/50 portfolio holds two made-up assets with 20% volatility each and correlation 0.5. What is the portfolio volatility, in %? (√300 ≈ 17.3)", "%", 17.3, 0.1, "√(0.25 × 400 + 0.25 × 400 + 2 × 0.25 × 400 × 0.5) = √300 ≈ 17.3%."), "The cross term adds risk in proportion to the correlation; at 0.5 the result is between the uncorrelated 14.1% and the fully correlated 20%."),
    q("advq-pv-3", "adv-port-vol", "knowledge", single("With correlation −1 and the right weights, two assets' combined volatility can be…", [
      ["a", "Higher than either asset's", "Not with correlation −1."],
      ["b", "Zero", "Right. That is what the lesson showed."],
      ["c", "Exactly the weighted average", "That needs correlation +1."],
      ["d", "Unaffected by the weights", "Weights decide the result."],
    ], "b"), "Perfectly opposite moves can cancel when weighted in inverse proportion to the volatilities."),
    q("advq-pv-4", "adv-port-vol", "knowledge", tf("With positive weights, a portfolio's volatility is never higher than the weighted average of its assets' volatilities.", true, "True. It equals it only at correlation +1."), "Because correlation cannot exceed 1, the cross term can at most make the result equal the weighted average."),
    // added: adv-opt
    q("advq-op-6", "adv-opt", "knowledge", single("A call has strike 50 and the share is at 56. What is its intrinsic value?", [
      ["a", "0", "It is in the money."],
      ["b", "50", "That is the strike."],
      ["c", "56", "That is the share price."],
      ["d", "6", "Right. That is what the lesson showed."],
    ], "d"), "A call's intrinsic value is the amount the share price exceeds the strike: 56 − 50 = 6."),
    // added: adv-greeks
    q("advq-gk-3", "adv-greeks", "knowledge", single("Which Greek is largest for at-the-money options close to expiry?", [
      ["a", "Rho", "Rate sensitivity is small here."],
      ["b", "Gamma", "Right. That is what the lesson showed."],
      ["c", "Vega", "Vega is larger with more time left."],
      ["d", "None of them; Greeks do not change with time", "They all change with time."],
    ], "b"), "Near expiry, a small move can flip an at-the-money option between worthless and in the money, so delta changes fast."),
    q("advq-gk-4", "adv-greeks", "knowledge", tf("Implied volatility is the volatility that makes a pricing model match an option's market price.", true, "True. That is its definition."), "It is backed out of market prices, so it reflects demand and supply for options, not a guaranteed future move."),
    // added: adv-perf
    q("advq-pe-5", "adv-perf", "calculation", numeric("A made-up strategy has beta 0.8 and returned 13% while its benchmark returned 10%. What is its alpha for the year, in %? (alpha = return − beta × benchmark)", "%", 5, 0.05, "13 − 0.8 × 10 = 5%."), "Alpha removes the part of return explained by market exposure: here 8% came from beta, 5% from the rest."),
    q("advq-pe-6", "adv-perf", "knowledge", single("Why must performance be compared with a fair benchmark?", [
      ["a", "Benchmarks make returns look higher", "That is not their purpose."],
      ["b", "Regulators always require it", "Not the main reason."],
      ["c", "A rising market lifts most strategies; the benchmark shows what exposure alone earned", "Right. That is what the lesson showed."],
      ["d", "Benchmarks remove all risk", "They remove none."],
    ], "c"), "Without a benchmark, market gains can be mistaken for skill."),
    // added: adv-sharpe
    q("advq-sh-3", "adv-sharpe", "calculation", numeric("A made-up record of 4 years shows a Sharpe ratio of 2. What is the approximate standard error? (√((1 + 2²/2) ÷ 4))", "SE", 0.866, 0.005, "√(3 ÷ 4) ≈ 0.866."), "Even a high Sharpe ratio over four years carries an uncertainty of nearly 0.9."),
    q("advq-sh-4", "adv-sharpe", "knowledge", single("A Sharpe ratio estimate is 0.8 with a standard error of 0.6. What is a rough 95% range?", [
      ["a", "0.2 to 1.4", "That is only ± one standard error."],
      ["b", "Exactly 0.8", "Every estimate carries error."],
      ["c", "About −0.4 to 2.0", "Right. That is what the lesson showed."],
      ["d", "0 to 0.8", "Not centred on the estimate."],
    ], "c"), "Estimate ± 2 standard errors: 0.8 ± 1.2. The range includes zero, so skill is not established."),
  ],
};

const MORE_REMEDIATION: Record<string, ConceptRemediation> = {
  "adv-corr": {
    misconception: "Counting positions can look like a measure of diversification. Several positions driven by the same theme behave like one large bet.",
    altExplanation: "Group positions by what drives them, such as growth, rates or the dollar, rather than by name. Check correlations over long and short windows, treat each number as rough, and plan for them all rising together in a sell-off.",
    altExample: "A made-up trader holds four technology shares and a growth-stock fund. In a made-up rate scare all five fall together on the same morning.",
    practice: single("Which correlation describes two assets that always move in opposite directions, in proportion?", [
      ["a", "0", "No straight-line link."],
      ["b", "+1", "Same direction."],
      ["c", "+0.5", "Partly together."],
      ["d", "−1", "Right. That is what the lesson showed."],
    ], "d"),
  },
  "adv-port": {
    misconception: "Diversification can seem to need many positions. Even two assets with low correlation can cut portfolio volatility well below the average of the two.",
    altExplanation: "σp = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂σ₁σ₂ρ). With ρ = 1 it equals the weighted average; any lower correlation reduces it; at ρ = −1 it can reach zero with the right weights.",
    altExample: "Two made-up assets each with 15% volatility, held equally with correlation 0.2, give a portfolio volatility near 11%, well under 15%.",
    practice: tf("A portfolio's volatility equals the weighted average of its assets' volatilities only when their correlation is +1.", true, "True. Any lower correlation reduces it."),
  },
  "adv-opt": {
    misconception: "Implied volatility can sound like a forecast that the stock will move that much. It is the market's price for expected movement, which includes demand for protection, not a promise.",
    altExplanation: "Implied volatility is the volatility that makes a pricing model match an option's market price. Comparing it with the volatility the stock actually shows over time tells you whether options are expensive or cheap relative to realised moves.",
    altExample: "A made-up stock's options imply 45% volatility before results. After results the stock moves only modestly, implied volatility drops, and option buyers lose on vega.",
    practice: single("What is implied volatility?", [
      ["a", "The volatility that makes a model price match the market price", "Right. That is what the lesson showed."],
      ["b", "The stock's volatility over the past year", "That is historical volatility."],
      ["c", "A guaranteed future move", "It is a price, not a promise."],
      ["d", "The broker's commission rate on option trades", "Unrelated to the question."],
    ], "a"),
  },
  "adv-fut": {
    misconception: "A margin call can seem like a warning you may ignore until prices recover. If it is not met, the broker closes the position, locking in the loss.",
    altExplanation: "Keep spare cash well above maintenance margin, size from contract value and a planned stop, and know the daily settlement time. Leverage ≈ contract value ÷ margin; the move that wipes out the deposit ≈ margin ÷ contract value.",
    altExample: "A made-up trader holds a futures position with no spare cash. A sharp fall triggers a call they cannot meet, and the broker closes the position at the day's low.",
    practice: tf("If a margin call is not met, the broker may close the position.", true, "True. That is how margin is enforced."),
  },
  "adv-perf": {
    misconception: "Annualising a monthly Sharpe ratio by multiplying by √12 can seem always correct. Lo (2002) showed it can overstate the figure when returns are serially correlated.",
    altExplanation: "When monthly returns are smoothed or correlated over time, the simple √12 scaling understates true annual volatility, so it inflates the Sharpe ratio. Check how any reported figure was annualised and over how many years.",
    altExample: "A made-up fund reports smooth monthly returns that are correlated month to month. Its quoted annual Sharpe ratio is well above what its yearly returns support.",
    practice: single("What does beta measure?", [
      ["a", "Return beyond the benchmark", "That is alpha."],
      ["b", "The largest fall", "That is drawdown."],
      ["c", "How much the strategy tends to move with its benchmark", "Right. That is what the lesson showed."],
      ["d", "The number of trades made in a year", "Unrelated to the question."],
    ], "c"),
  },
  "adv-applied": {
    misconception: "A model's risk number can feel like permission to take more risk. Models describe typical bad days; the account must survive the untypical ones.",
    altExplanation: "Use models as one input. Alongside VaR, compute worst-case gap losses, stress correlations toward 1, keep stops and margin reserves, and prefer defined-risk option positions while learning.",
    altExample: "A made-up portfolio's VaR looks small after a calm year. A stress test with correlations at 1 and a 10% gap shows a loss four times larger, so the trader trims positions.",
    practice: scenario(
      "A beginner wants to buy far out-of-the-money calls expiring next week because they are \"cheap\" and could pay 20×.",
      "What is the soundest approach?",
      [
        ["a", "Buy as many as possible; the upside is huge", "Ignores how rarely they pay.", "unsound"],
        ["b", "Check the break-even, the model's chance of finishing in the money and time decay, then practise in simulation", "Sound: it follows the lesson's process.", "sound"],
        ["c", "Buy a few and hope", "Small, but no process.", "partial"],
        ["d", "Sell the same calls uncovered instead", "Unlimited risk.", "unsound"],
      ],
    ),
  },

  "adv-corr-est": {
    misconception: "Covariance and correlation can seem interchangeable. Covariance depends on the assets' volatility units, so it cannot be compared across pairs the way correlation can.",
    altExplanation: "Correlation = covariance ÷ (σA × σB). Dividing by both standard deviations removes the units and puts every pair on the same −1 to +1 scale, which is what makes correlation matrices readable.",
    altExample: "Two made-up pairs have covariances of 0.0002 and 0.0008. Once each is divided by its own volatilities, both turn out to have the same correlation of 0.4.",
    practice: tf("Correlation is covariance divided by the product of the two standard deviations.", true, "True. That is the definition."),
  },
  "adv-port-vol": {
    misconception: "Diversification can seem to remove risk entirely if you hold enough positions. Risk shared by all assets, such as a broad market sell-off, does not diversify away.",
    altExplanation: "Combining assets reduces the part of risk that is specific to each one. The part they share remains, and in crises correlations rise, so the shared part grows. That is why portfolio risk should be stress-tested, not only averaged.",
    altExample: "A made-up portfolio of twenty shares across sectors halves its day-to-day swings compared with one share, yet still falls sharply on the day the whole market drops.",
    practice: tf("Holding many assets can remove risk that all of them share.", false, "False. Shared market risk remains."),
  },
  "adv-greeks": {
    misconception: "Time decay can seem steady from purchase to expiry. It speeds up near expiry, especially for at-the-money options.",
    altExplanation: "Theta is the value an option loses as a day passes, other things equal. Far from expiry it is small; in the last weeks it grows quickly, because there is less time left for a large move. Option buyers need the move to come soon enough.",
    altExample: "A made-up at-the-money option loses a few cents a day two months out, but loses several times that per day in its final week.",
    practice: tf("Time decay usually speeds up as an at-the-money option nears expiry.", true, "True. Theta grows near expiry."),
  },
  "adv-sharpe": {
    misconception: "Testing a long list of strategies can make the best one look skilled. The more variations you try, the higher the best result tends to be by luck alone.",
    altExplanation: "If you test many variations and keep the best, its Sharpe ratio is biased upward. Adjust expectations for the number of trials, demand out-of-sample confirmation, and prefer simple rules with few settings.",
    altExample: "A made-up trader tries forty versions of a rule on the same data. The best shows a Sharpe ratio above 1, but on fresh data it performs like the average version.",
    practice: tf("The best of many strategies tested on the same data tends to overstate its true Sharpe ratio.", true, "True. Selection bias inflates it."),
  },
};

export const ADVANCED_ASSESSMENT: TrackAssessment = {
  ...BASE,
  concepts: BASE.concepts.map((c) => ({ ...c, moreRemediation: MORE_REMEDIATION[c.id] ? [MORE_REMEDIATION[c.id]] : [] })),
};
