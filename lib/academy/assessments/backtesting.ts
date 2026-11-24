import type { AssessmentQuestion, ChoiceOption, ConceptRemediation, GradedItem, ScenarioItem, TrackAssessment } from "../types";

/*
  Track 11 assessment: Backtesting.
  Lookahead bias, survivorship bias, costs and fills, out-of-sample testing,
  and overfitting through multiple testing are safety-critical: getting them
  wrong is how a trader risks money on a backtest that could never have been
  traded. All accounts, prices and results here are made-up numbers for the
  sums; findings attributed to papers are the ones cited in the lessons.
*/

const T = "backtesting";

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
    "Questions on every idea from the thirteen lessons: what a backtest can show, data adjustments, lookahead and survivorship bias, costs and fills, metrics, in-sample and out-of-sample testing, walk-forward, parameter robustness, Monte Carlo and the bootstrap, multiple testing, regimes, forward tests and the validity checklist, with calculations and applied scenarios. You need 90% or more, a sound decision in the scenario, and every safety-critical question right: lookahead, survivorship, costs, out-of-sample testing and multiple testing.",
  concepts: [
    {
      id: "bt-limits",
      title: "What a backtest can and cannot show",
      lessonIds: ["bt-what-it-tells"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A strong backtest feels like a forecast. It is one replay of one past path under a model of fills, so it can rule ideas out far better than it can prove them.",
        altExplanation: "Think of a backtest as a filter. A rule that loses on the past, with fair fills and costs, has given you strong evidence against it. A rule that wins has only passed the first gate; the path could have gone differently, and the future may not look like the past.",
        altExample: "A rule shows a smooth curve on one simulated path. On the next path from the same model, with the same rule and costs, its curve is flat. Neither path is the future.",
        practice: single("Which is the fairest reading of a strong backtest?", [
          ["a", "The strategy will very likely make money from now on", "A backtest is not a forecast."],
          ["b", "The rules were not ruled out by this past data", "Right. It passed a first filter, nothing more."],
          ["c", "Live drawdowns will match the backtest's", "Live drawdowns can be deeper."],
          ["d", "No further testing is needed", "Many checks remain."],
        ], "b"),
      },
      flashcard: { front: "Backtest: filter, not forecast", back: "A bad result is strong evidence against a rule; a good one is weak evidence until it survives fair checks." },
    },
    {
      id: "bt-data",
      title: "Data quality and adjustments",
      lessonIds: ["bt-data-quality"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Raw prices feel like the most honest data. But splits, dividends and futures rolls create jumps in raw series that no holder actually gained or lost.",
        altExplanation: "Adjusted data rewrites earlier prices so that corporate actions and contract changes do not look like moves. For a split, divide earlier prices by the split ratio. For dividends, add the payouts back. For futures, remove the gap between old and new contracts.",
        altExample: "A raw chart shows a stock falling by two thirds on one day. The company did a 3-for-1 split that morning; each holder simply had three times as many shares.",
        practice: numeric("Before a 4-for-1 split a share traded at 200. What is that old price in split-adjusted data?", "price", 50, 0.5, "200 ÷ 4 = 50."),
      },
      flashcard: { front: "Adjusting prices", back: "Split: earlier prices ÷ ratio. Dividends: add payouts back. Futures: remove roll gaps. Adjusted prices were never traded." },
    },
    {
      id: "bt-lookahead",
      title: "Lookahead bias in backtests",
      lessonIds: ["bt-biases"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "A tiny timing slip, such as filling at the same bar whose close made the signal, feels harmless. It lets the test use a price it could not yet know, so the result is not a test of anything.",
        altExplanation: "For every number a rule uses, ask when it became known. The fill must come after that moment. A signal from a bar's close can only be traded at the next bar's open or later; data published later, such as earnings, can only be used from the date it was released.",
        altExample: "A test buys a stock on the day a quarter ends using that quarter's profit, but the figure was published three weeks later. In real life the trade could not have happened that day.",
        practice: tf("Filling at the next bar's open after a signal on a bar's close avoids this kind of lookahead.", true, "True. The fill comes after the close is known."),
      },
      flashcard: { front: "Lookahead", back: "Using information before it was available. Signal on bar t's close → fill at bar t + 1's open. Check every number's release time." },
    },
    {
      id: "bt-survivorship",
      title: "Survivorship bias in backtests",
      lessonIds: ["bt-biases", "bt-data-quality"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "A list of today's stocks looks like a fair sample of the past. It is the list of winners: the companies that failed, were delisted or were taken over cheaply have been removed.",
        altExplanation: "If you test only on survivors, every loser you could have bought is missing, so averages rise for no reason except the choice of data. A fair test needs the stocks as they were listed at each past date, including the ones that later died.",
        altExample: "In the lab, 200 simulated stocks have no built-in edge. After the weak ones are delisted, the survivors' average return is well above the average of all 200.",
        practice: numeric("Five funds: three survivors averaged +10% and two closed funds averaged −40%. What was the average of all five, in %?", "%", -10, 0.2, "(3 × 10 + 2 × −40) ÷ 5 = (30 − 80) ÷ 5 = −10%."),
      },
      flashcard: { front: "Survivorship", back: "Testing only on what still exists today. Losers are missing, so results look better. Use point-in-time lists with delisted names." },
    },
    {
      id: "bt-costs",
      title: "Costs and realistic fills in a backtest",
      lessonIds: ["bt-costs-fills"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "A few basis points per trade sound too small to matter. Multiplied by two sides and dozens of round trips a year, they can take a large share of a small edge.",
        altExplanation: "Charge every entry and every exit: commission, half the spread and slippage. Costs grow with turnover, so a fast rule needs a much larger gross edge than a slow one. Stops are not guaranteed: if the market gaps past a stop, the fill is at the gap price.",
        altExample: "A slow rule trades 4 times a year and barely notices costs. A fast one on the same market trades 80 times a year and its net result falls below zero.",
        practice: numeric("A rule makes 60 round trips a year at 5 bp per side, using all its equity each time. Roughly what yearly cost is that, in %?", "%", 6, 0.1, "60 × 2 × 0.05% = 6% a year."),
      },
      flashcard: { front: "Costs", back: "Yearly cost ≈ round trips × 2 × cost per side. Charge commission, spread and slippage on every fill; stops can gap." },
    },
    {
      id: "bt-metrics",
      title: "Backtest metrics and which ones mislead",
      lessonIds: ["bt-metrics"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "It is tempting to judge a backtest by one headline number, such as win rate or Sharpe. Each metric answers only one question and can look good for the wrong reason.",
        altExplanation: "Read the trade count and exposure first: they tell you how much evidence there is and how much risk was taken. Then read return (CAGR), risk (drawdown, Sharpe, Sortino) and trade quality (profit factor, expectancy) together.",
        altExample: "Rule A wins 75% of its trades but loses money overall; rule B wins 35% and makes money. Rule C has the smallest drawdown only because it was in the market a tenth of the time.",
        practice: numeric("Equity peaked at 80,000 and later fell to 60,000 before recovering. What was the maximum drawdown, in %?", "%", 25, 0.3, "(80,000 − 60,000) ÷ 80,000 = 25%."),
      },
      flashcard: { front: "Reading metrics", back: "Trades and exposure first. Then CAGR, max drawdown, Sharpe, Sortino, profit factor, expectancy in R, together." },
    },
    {
      id: "bt-oos",
      title: "Out-of-sample testing of a backtest",
      lessonIds: ["bt-is-oos"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "Checking the held-out period, disliking the result and tweaking the rules feels like normal research. Each look and tweak turns the held-out data into more in-sample data.",
        altExplanation: "In-sample data is where you build and tune. Out-of-sample data is kept closed until the rules are final, then used once. If you change the rules after seeing it, you need new data that has never been looked at.",
        altExample: "A trader tunes on 2010–2018 and opens 2019–2022 once. It is weak. If they now adjust the rules and check 2019–2022 again, that period has become part of the tuning.",
        practice: tf("You can keep an out-of-sample test valid while changing the rules after each look at it.", false, "False. Once it has guided a change, it is in-sample."),
      },
      flashcard: { front: "In-sample / out-of-sample", back: "Build on in-sample. Open out-of-sample once, after rules are fixed. Gap = IS Sharpe − OOS Sharpe estimates fitting." },
    },
    {
      id: "bt-walk-forward",
      title: "Walk-forward analysis",
      lessonIds: ["bt-walk-forward"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Walk-forward can look like a way to find the best settings. It is really a test of your method for choosing settings, run again and again on data the method had not seen.",
        altExplanation: "Pick settings on a training window, trade them on the next test window, then slide forward and repeat. Stitch the test windows together. If the choosing method works, the stitched result holds up; if it fits noise, the stitched result is much weaker than the training results.",
        altExample: "With 8 years of data, a 3-year training window and 1-year test steps, there are 5 test windows, covering years 4 to 8.",
        practice: numeric("With 10 years of data, a 2-year training window and 6-month test windows, how many test windows are there?", "windows", 16, 0, "(10 − 2) ÷ 0.5 = 16."),
      },
      flashcard: { front: "Walk-forward", back: "Train → test → slide. Windows ≈ (total − training) ÷ test length. It tests the choosing process, not one setting." },
    },
    {
      id: "bt-robustness",
      title: "Parameter robustness: plateaus and spikes",
      lessonIds: ["bt-robustness"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "The single brightest cell in a heatmap looks like the answer. If its neighbours are much worse, the result depends on an exact setting, which is what fitted noise looks like.",
        altExplanation: "A real effect should not care much whether an average is 45 or 50 bars. Look for a broad region of similar results and choose from its middle. Compare a chosen cell with the average of its neighbours; a big gap is a spike.",
        altExample: "On a sweep, a 37-bar breakout shows a Sharpe far above everything around it, while 30 and 45 bars both lose. A rule that works only at 37 is unlikely to keep working.",
        practice: single("Which choice from a parameter sweep is most likely to hold up?", [
          ["a", "The single best cell, wherever it is", "Often a spike."],
          ["b", "A setting in the middle of a broad region of good results", "Right. Nearby settings agree."],
          ["c", "The cell with the most trades", "Trade count alone says little."],
          ["d", "A cell at the edge of the grid, because it was tested last", "Position in the grid is not evidence."],
        ], "b"),
      },
      flashcard: { front: "Plateau vs spike", back: "Plateau: neighbours similar, more trustworthy. Spike: one cell far above its neighbours, likely noise. Neighbours share trades, so plateaus can still be luck." },
    },
    {
      id: "bt-monte-carlo",
      title: "Monte Carlo reshuffles and the bootstrap",
      lessonIds: ["bt-monte-carlo"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "The drawdown in a backtest feels like the drawdown to plan for. It is only the drawdown of one order of trades; the same trades in another order can dig a much deeper hole.",
        altExplanation: "Reshuffling the order keeps every trade, so the total is the same, but the path and the drawdown change. Resampling with replacement (the bootstrap) changes which trades appear, so it shows how uncertain the average trade is. Both assume trades are independent.",
        altExample: "A trader has 30 trades and a 12% backtest drawdown. In a thousand reshuffles, the worse 5% have drawdowns beyond 20%. The total return is the same in every reshuffle.",
        practice: numeric("In how many different orders can 6 trades be arranged?", "orders", 720, 0, "6! = 6 × 5 × 4 × 3 × 2 × 1 = 720."),
      },
      flashcard: { front: "Monte Carlo and bootstrap", back: "Reshuffle: same trades, new order → range of drawdowns. Bootstrap: resample trades → interval for the average. Both assume independence." },
    },
    {
      id: "bt-multiple-testing",
      title: "Overfitting and multiple testing in backtests",
      lessonIds: ["bt-multiple-testing", "bt-robustness"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "The best of many backtests looks like the best strategy. When many variants are tried on the same data, the best one is expected to look good by luck alone.",
        altExplanation: "Count every try: rules, settings, markets, filters and periods. Then ask whether the best result beats the best you would expect from that many tries of pure noise. The deflated Sharpe ratio and Sharpe haircuts do this; Harvey, Liu and Zhu argued new findings need a t-statistic above about 3.",
        altExample: "A trader tests 500 settings on noise. About one in twenty passes a 5% test by luck, and the best of them has a Sharpe ratio that would look convincing on its own.",
        practice: numeric("You test 40 variants with no edge, each at a 5% significance level. How many would you expect to pass by luck?", "variants", 2, 0, "40 × 0.05 = 2."),
      },
      flashcard: { front: "Multiple testing", back: "False passes ≈ N × significance level. Count every try; deflate or haircut the best Sharpe; demand t above about 3 for new claims." },
    },
    {
      id: "bt-regimes",
      title: "Regime dependence",
      lessonIds: ["bt-regimes"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A backtest over a long period can feel like it covers every kind of market. If one regime dominated that period, the result mostly describes that regime.",
        altExplanation: "A rule's average result is a mix: the time spent in each regime times the result in that regime. Trend rules tend to suffer in ranges; mean-reversion rules tend to suffer in strong trends. Check each regime, and ask whether you could survive the bad one.",
        altExample: "A trend rule tested only on a long bull run looks excellent. The same rule on a sideways decade is whipsawed in and out and loses its gains to costs.",
        practice: numeric("A rule earns +0.3R per trade in trends (70% of the time) and −0.5R in ranges (30%). What is its average per trade, in R?", "R", 0.06, 0.002, "0.7 × 0.3 + 0.3 × (−0.5) = 0.21 − 0.15 = 0.06R."),
      },
      flashcard: { front: "Regimes", back: "Average ≈ Σ (time share × result) over regimes. Every rule has a bad regime: know it and size to survive it." },
    },
    {
      id: "bt-forward",
      title: "Paper and forward tests versus backtests",
      lessonIds: ["bt-forward-vs-backtest"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "A forward test can feel like a formality after a strong backtest. It is the first data the rules were not chosen on, and it often shows a gap.",
        altExplanation: "In a forward test the rules are fixed and decisions are made in real time, so there is no hindsight and no tuning. Changing the rules mid-way restarts it. Paper fills ignore queue position, partial fills and slippage, so small live size adds what paper cannot.",
        altExample: "A trader's backtest shows a Sharpe of 1.4. Six months of fixed-rule paper trading show 0.3. The gap points to fitting or costs, not to bad luck alone.",
        practice: tf("Changing the rules part-way through a forward test means the test has to start again.", true, "True. Otherwise you are fitting again, just more slowly."),
      },
      flashcard: { front: "Forward test", back: "Fixed rules, real time, new data. Gap = backtest Sharpe − forward Sharpe. Change the rules → restart." },
    },
    {
      id: "bt-applied",
      title: "Applying backtest checks to real decisions",
      lessonIds: ["bt-checklist", "bt-biases", "bt-is-oos", "bt-multiple-testing"],
      critical: true,
      safetyCritical: false,
      applied: true,
      remediation: {
        misconception: "When a backtest looks great, the urge is to trade it before anything spoils the picture. The checks matter most exactly then, because a great result is what most bugs and biases produce.",
        altExplanation: "Before acting on a backtest, run the must-pass checks: exact rules, honest fill timing, delisted data, full costs, an out-of-sample period used once, and a count of variants tried. Count an unsure check as failed. Passing makes the test fair; only a forward test adds new evidence.",
        altExample: "A trader's best backtest passes everything except costs, which were left out. Adding them turns a 15% yearly return into a small loss, so the idea goes back to research.",
        practice: scenario(
          "After trying about 300 settings, a trader's best backtest has a Sharpe of 1.1. The deflated Sharpe ratio for that many tries is low.",
          "What is the soundest view?",
          [
            ["a", "Trade it: a Sharpe above 1 is good", "Ignores the 300 tries.", "unsound"],
            ["b", "Treat it as likely luck unless it holds on unseen data", "Sound: the search explains much of the result.", "sound"],
            ["c", "Try 300 more settings to find a better one", "Makes the problem worse.", "unsound"],
            ["d", "Trade it at half size while testing more settings on the same data", "Smaller, but still trusts a likely fluke.", "partial"],
          ],
        ),
      },
      flashcard: { front: "Before acting on a backtest", back: "Must-pass: exact rules, honest fills, delisted data, full costs, OOS used once, variants counted. Unsure = failed." },
    },
  ],
  questions: [
    // bt-limits
    q("btq-li-1", "bt-limits", "knowledge", single("What can a strong backtest result tell you?", [
      ["a", "That the strategy will make money in the future", "A backtest is not a forecast."],
      ["b", "The exact drawdown you will face when trading live", "Live paths differ."],
      ["c", "That the rules were not ruled out by this past data", "Right. It passed one filter."],
      ["d", "Nothing at all, because every backtest is worthless whatever its design or data", "A fair backtest is a useful filter."],
    ], "c"), "A backtest replays fixed rules on one past path under a model of fills and costs. A strong result means the idea survived that filter, not that it will work."),
    q("btq-li-2", "bt-limits", "knowledge", tf("A backtest shows how fixed rules would have behaved on one past path, under a stated model of fills and costs.", true, "True. One path, one execution model."), "That is what a backtest is: exact rules, past data and an execution model. Every result depends on all three."),
    q("btq-li-3", "bt-limits", "knowledge", single("In the lab, when does an order decided on a bar's close fill?", [
      ["a", "At that same close", "The close is the moment of decision; the order goes after it."],
      ["b", "At the next bar's open", "Right. The first price after the signal is known."],
      ["c", "At the next bar's close", "The lab uses the next open."],
      ["d", "At the best price of the next bar", "No one can count on the best price."],
    ], "b"), "The lab checks rules on the close of bar t and fills at the open of bar t + 1, so no fill uses a price before the signal existed."),
    q("btq-li-4", "bt-limits", "calculation", numeric("At a close, an account holds 40,000 in cash and 300 units of a stock that closed at 200. What is its equity?", "money", 100000, 10, "40,000 + 300 × 200 = 100,000."), "Equity = cash + units × close = 40,000 + 60,000 = 100,000. Every metric is computed from equity like this at each close."),

    // bt-data
    q("btq-da-1", "bt-data", "calculation", numeric("A stock traded at 90 before a 3-for-1 split. What is that old price in split-adjusted data?", "price", 30, 0.2, "90 ÷ 3 = 30."), "Earlier prices are divided by the split ratio: 90 ÷ 3 = 30. The split then no longer shows up as a fall."),
    q("btq-da-2", "bt-data", "knowledge", single("Raw prices show a 50% fall on the day of a 2-for-1 split. What should the backtest use?", [
      ["a", "The raw prices, since they are what was quoted that day", "Then the split looks like a crash."],
      ["b", "Split-adjusted prices, so the split is not a loss", "Right. Holders lost nothing."],
      ["c", "Only data from after the split", "Throws away history for no reason."],
      ["d", "Either; it does not matter", "It changes signals and returns."],
    ], "b"), "A split changes the number of shares, not their total value. Adjusted prices remove the artificial fall, so signals and returns are not distorted."),
    q("btq-da-3", "bt-data", "knowledge", tf("Price-only data that leaves out dividends tends to overstate what a holder of a dividend-paying stock earned.", false, "False. It understates it: the price drops by each payout, which the holder received."), "On each ex-dividend date the price falls by about the payout. A holder received the dividend, so price-only returns understate the total."),
    q("btq-da-4", "bt-data", "knowledge", single("Why does a naively stitched futures series jump at each roll?", [
      ["a", "The exchange changes the price on purpose", "Not the cause."],
      ["b", "Traders all buy on roll day", "Not the cause."],
      ["c", "Futures data is always wrong, so continuous series should never be used in a backtest", "It needs stitching, not discarding."],
      ["d", "The new contract trades at a different price from the expiring one", "Right. The gap is between contracts, not a move."],
    ], "d"), "Contracts with different expiry dates trade at different prices. Stitching them end to end creates gaps that no one could have traded, so continuous series are back-adjusted."),

    // bt-lookahead
    q("btq-lo-1", "bt-lookahead", "knowledge", single("Which timing contains a lookahead bug?", [
      ["a", "Signal from yesterday's close, fill at today's open", "Honest: the fill comes after the signal."],
      ["b", "Signal from today's close, fill at tomorrow's open", "Honest timing."],
      ["c", "Signal from today's close, fill at today's open", "Right. The open came before the close it needs."],
      ["d", "Signal from last week's close, fill at this week's first open", "Honest, just slower."],
    ], "c"), "A rule cannot act at the open on a close that has not happened yet. Filling at the same bar's open uses information from the future."),
    q("btq-lo-2", "bt-lookahead", "knowledge", tf("A lookahead bug always makes a backtest look better.", false, "False. It can make results worse, but they are wrong either way."), "In the lab the bug flattered some rules and hurt others, such as a mean-reversion rule that now buys before the fall it reacts to. Either way the test is invalid."),
    q("btq-lo-3", "bt-lookahead", "knowledge", single("A test uses each quarter's profit figure on the day the quarter ended, though it was published weeks later. What is the problem?", [
      ["a", "Lookahead: the figure was not known that day", "Right. Use it only from its release date."],
      ["b", "Survivorship bias", "That is about missing dead companies."],
      ["c", "Too few trades", "Not the issue here."],
      ["d", "Nothing, since the number itself is correct and will not change later on", "Correct, but not yet known."],
    ], "a"), "Data must be used from the moment it became available. Quarter-end figures are released later, so using them on the quarter's last day is lookahead."),
    q("btq-lo-4", "bt-lookahead", "knowledge", multi("Which of these are signs of possible lookahead? Choose all that apply.", [
      ["a", "Fills at a price from before the signal was known", "Right. The classic bug."],
      ["b", "Using revised data that was published later", "Right. Later revisions were not known at the time."],
      ["c", "A fill at the next bar's open after a signal", "Honest timing."],
      ["d", "A stop filled at the open when the market gapped through it", "A realistic fill, not lookahead."],
    ], ["a", "b"]), "Lookahead is any use of information before it existed: fills before the signal, or data that was only published or revised later."),

    // bt-survivorship
    q("btq-su-1", "bt-survivorship", "knowledge", single("A test uses today's index members over the last 20 years. Which bias does that add?", [
      ["a", "Lookahead, because the trades are filled before their signals are known", "Fill timing is a separate check."],
      ["b", "None", "Today's members were partly chosen by their past success."],
      ["c", "Cost bias", "Not about costs."],
      ["d", "Survivorship: companies that failed or left are missing", "Right. Today's list holds the winners."],
    ], "d"), "Today's index holds companies that survived and grew. Those that shrank, failed or were removed over 20 years are missing, so the test looks better."),
    q("btq-su-2", "bt-survivorship", "knowledge", tf("Leaving delisted stocks out of a backtest tends to make the results look better than they were.", true, "True. Many delisted stocks fell hard before leaving."), "Stocks delisted for bad reasons often had large losses. Leaving them out removes losers you could have bought."),
    q("btq-su-3", "bt-survivorship", "calculation", numeric("Ten stocks: eight survivors returned +25% each, and two delisted stocks returned −90% each. What was the average return of all ten, in %?", "%", 2, 0.05, "(8 × 25 + 2 × −90) ÷ 10 = (200 − 180) ÷ 10 = 2%."), "All ten average (200 − 180) ÷ 10 = 2%. A survivor-only database would show 25%: the gap is pure survivorship."),
    q("btq-su-4", "bt-survivorship", "knowledge", single("What did Shumway (1997) report about the CRSP stock database?", [
      ["a", "It held every delisting return correctly", "The opposite."],
      ["b", "Delisted stocks had higher returns than the rest", "Not his finding."],
      ["c", "Correct delisting returns were missing for most stocks delisted for bad reasons", "Right. And the missing returns were large."],
      ["d", "It contained no delisted stocks at all", "It contained them, without the right returns."],
    ], "c"), "Shumway found that correct delisting returns were missing for most stocks delisted for negative reasons since 1962, and that the omitted returns were substantial."),

    // bt-costs
    q("btq-co-1", "bt-costs", "calculation", numeric("A rule makes 40 round trips a year. Costs are 10 bp per side and each trade uses all equity. Roughly what yearly cost is that, in %?", "%", 8, 0.1, "40 × 2 × 0.1% = 8%."), "Each round trip has two sides: 2 × 10 bp = 0.2%. Over 40 round trips that is about 8% of equity a year."),
    q("btq-co-2", "bt-costs", "knowledge", tf("For the same gross edge, a rule that trades ten times as often pays about the same total costs.", false, "False. It pays roughly ten times as much: costs scale with turnover."), "Every round trip pays commission, spread and slippage on both sides, so costs rise in step with how often a rule trades."),
    q("btq-co-3", "bt-costs", "knowledge", single("A stop sits at 50. The market closes at 52, then opens the next day at 47. Where is a realistic fill?", [
      ["a", "At 50, the stop price set in advance", "A stop is not a guaranteed price."],
      ["b", "At 52, the last close", "The market has already moved."],
      ["c", "At the day's high", "No reason to expect that."],
      ["d", "At 47, or close to it", "Right. A gap fills at the first available price."],
    ], "d"), "When the market gaps past a stop, the stop turns into a market order at the open. The lab fills at the lower of the stop and the open."),
    q("btq-co-4", "bt-costs", "knowledge", single("What did Novy-Marx and Velikov (2016) find about anomalies and trading costs?", [
      ["a", "Most low-turnover anomalies kept net returns; few high-turnover ones did", "Right. Turnover was the dividing line."],
      ["b", "Costs did not matter for any anomaly", "They mattered a great deal."],
      ["c", "All anomalies lost money after costs, whatever their turnover or their design", "Many low-turnover ones survived."],
      ["d", "Costs helped returns", "Costs always reduce returns."],
    ], "a"), "Most anomalies with monthly turnover below 50% still earned significant net returns when designed to limit costs; few with higher turnover did."),

    // bt-metrics
    q("btq-me-1", "bt-metrics", "calculation", numeric("Equity peaked at 150,000, fell to 105,000, then reached a new high of 160,000. What was the maximum drawdown, in %?", "%", 30, 0.3, "(150,000 − 105,000) ÷ 150,000 = 30%."), "Maximum drawdown is the largest fall from a peak: 45,000 ÷ 150,000 = 30%. The later new high does not change it."),
    q("btq-me-2", "bt-metrics", "calculation", numeric("An account grows from 100,000 to 144,000 in 2 years. What is its CAGR, in %?", "%", 20, 0.2, "(144,000 ÷ 100,000)^(1/2) − 1 = 1.2 − 1 = 20%."), "CAGR = (end ÷ start)^(1 ÷ years) − 1 = 1.44^0.5 − 1 = 20% a year."),
    q("btq-me-3", "bt-metrics", "knowledge", tf("A rule with a high win rate can still have a negative expectancy.", true, "True. If its losses are much bigger than its wins."), "Win rate is one of three inputs to expectancy. Small wins and large losses can give a high win rate and a losing strategy."),
    q("btq-me-4", "bt-metrics", "knowledge", single("A rule shows a tiny drawdown but was in the market only 5% of the time. Which reading is fairest?", [
      ["a", "It is the safest rule possible", "It just took little risk."],
      ["b", "The small drawdown mostly reflects low exposure", "Right. Read exposure and trade count first."],
      ["c", "Its Sharpe ratio must be high", "Exposure does not tell you that."],
      ["d", "Exposure has no bearing on drawdown or on any other metric in the table", "It has a large bearing."],
    ], "b"), "A rule that is rarely in the market rarely loses much. Exposure and trade count tell you how much risk and evidence lie behind the other numbers."),

    // bt-oos
    q("btq-os-1", "bt-oos", "knowledge", single("After a weak out-of-sample result, a trader changes the rules and checks the same period again. What is that period now?", [
      ["a", "Still out-of-sample", "It has guided a change."],
      ["b", "A walk-forward window", "Not what happened."],
      ["c", "A forward test, because it comes after the backtest period", "No new data was used."],
      ["d", "In-sample, since it shaped the rules", "Right. A fresh held-out period is needed."],
    ], "d"), "Out-of-sample data is valid only until it influences a decision. Once the rules are changed because of it, it is in-sample data."),
    q("btq-os-2", "bt-oos", "calculation", numeric("A rule has an in-sample Sharpe of 1.6 and an out-of-sample Sharpe of 0.4. What is the fitting gap?", "Sharpe", 1.2, 0.02, "1.6 − 0.4 = 1.2."), "Gap = in-sample Sharpe − out-of-sample Sharpe = 1.2. A large gap suggests much of the in-sample result was fitting or luck."),
    q("btq-os-3", "bt-oos", "knowledge", tf("Once the rules are fixed, the out-of-sample period can be reopened to tune them again without any harm to the test.", false, "False. Tuning on it turns it into in-sample data."), "An out-of-sample period is used once, after the rules are fixed. Its value comes from having no influence on the rules; tuning on it removes that value."),
    q("btq-os-4", "bt-oos", "knowledge", single("McLean and Pontiff (2016) found that predictor returns in the period after the original studies' samples, but before publication, were about…", [
      ["a", "26% lower", "Right. And about 58% lower after publication."],
      ["b", "Unchanged", "They fell by about 26% before publication."],
      ["c", "Twice as large as in the original study's sample", "The opposite."],
      ["d", "Gone entirely", "Lower, not zero."],
    ], "a"), "Across 97 predictors, returns were about 26% lower out of sample and about 58% lower after publication: in-sample results tend to shrink."),

    // bt-walk-forward
    q("btq-wf-1", "bt-walk-forward", "calculation", numeric("With 12 years of data, a 4-year training window and 1-year test steps, how many test windows are there?", "windows", 8, 0, "(12 − 4) ÷ 1 = 8."), "Windows ≈ (total length − training length) ÷ test length = (12 − 4) ÷ 1 = 8, covering years 5 to 12."),
    q("btq-wf-2", "bt-walk-forward", "knowledge", single("What does walk-forward analysis test?", [
      ["a", "Whether one fixed setting is the best across the whole history at once", "It tests the choosing process."],
      ["b", "Live fills", "It is still a backtest."],
      ["c", "Trading costs", "Costs are a separate check."],
      ["d", "The process of choosing settings, on data that process had not seen", "Right. Choose on training, judge on test."],
    ], "d"), "Each window chooses settings on training data and is judged on the next test window, so walk-forward tests how well the choosing method works on new data."),
    q("btq-wf-3", "bt-walk-forward", "knowledge", tf("In walk-forward analysis, the settings for each test window are chosen using only data from before that window.", true, "True. Otherwise the test window would leak into the choice."), "If a test window's data helped choose its settings, the test would be in-sample. Each choice must use only earlier data."),
    q("btq-wf-4", "bt-walk-forward", "knowledge", single("The chosen setting changes in almost every window, and the stitched test results are poor. What does that suggest?", [
      ["a", "The method is working well", "Poor test results say otherwise."],
      ["b", "The test windows are too long", "Not the main signal."],
      ["c", "The choosing process is fitting noise in each training window", "Right. Unstable choices and weak tests go together."],
      ["d", "The rule needs more settings to choose from in each training window", "A bigger search fits more noise."],
    ], "c"), "If the best setting jumps around and does not carry into the next window, each choice is mostly noise. That is a warning sign even if a few windows look good."),

    // bt-robustness
    q("btq-ro-1", "bt-robustness", "knowledge", single("Which heatmap result is more reassuring?", [
      ["a", "One bright cell surrounded by losing cells", "A lone spike usually means a lucky fit."],
      ["b", "The highest single number anywhere on the grid", "Could be a spike."],
      ["c", "Only the cells at the edge doing well", "Edges hint the search is not finished."],
      ["d", "A broad region where nearby settings all do fairly well", "Right. A plateau."],
    ], "d"), "A broad plateau means the result does not depend on an exact setting, which is what a real effect should look like."),
    q("btq-ro-2", "bt-robustness", "calculation", numeric("A chosen cell has an in-sample Sharpe of 1.4. Its neighbours average 0.5. What is the spike gap?", "Sharpe", 0.9, 0.02, "1.4 − 0.5 = 0.9."), "Gap = chosen Sharpe − neighbour average = 0.9. A gap this large means small changes in the setting lose most of the result."),
    q("btq-ro-3", "bt-robustness", "knowledge", tf("If a 47-bar average is best but 45 and 50 bars both lose money, the 47-bar result is likely to hold up.", false, "False. That is a spike, a sign of fitting noise."), "A real effect should not care much about two or three bars. When neighbours lose, the best cell is likely luck."),
    q("btq-ro-4", "bt-robustness", "knowledge", single("Why can even a plateau mislead?", [
      ["a", "Neighbouring settings share most trades, so a plateau of luck is possible", "Right. They are not independent tests."],
      ["b", "Plateaus are always caused by bugs", "Not always; they can be luck or a real effect."],
      ["c", "Plateaus always have too few trades to mean anything, however long the test", "Not in general."],
      ["d", "They never mislead", "They can, as the right answer explains."],
    ], "a"), "Nearby settings take many of the same trades, so a lucky stretch can lift a whole region. A plateau is better evidence than a spike, not proof."),

    // bt-monte-carlo
    q("btq-mc-1", "bt-monte-carlo", "calculation", numeric("In how many different orders can 4 trades be arranged?", "orders", 24, 0, "4! = 4 × 3 × 2 × 1 = 24."), "n trades can be ordered in n! ways: 4! = 24. With real trade counts the number is huge, so the lab samples random orders."),
    q("btq-mc-2", "bt-monte-carlo", "knowledge", single("Reshuffling the order of a backtest's trades changes which result?", [
      ["a", "The total return at the end of the whole backtest", "Same trades, same total."],
      ["b", "The number of trades", "Every trade is kept."],
      ["c", "The average trade, in R", "Same trades, same average."],
      ["d", "The path, and so the maximum drawdown", "Right. Order changes the path, not the total."],
    ], "d"), "Reshuffling keeps every trade, so the total and the average are unchanged. Only the order changes, and with it the drawdowns along the way."),
    q("btq-mc-3", "bt-monte-carlo", "knowledge", tf("If a bootstrap interval for the average trade includes zero, the edge may not be real, given this many trades.", true, "True. The data cannot rule out no edge."), "An interval that includes zero means resampling the same trades often gives an average at or below zero, so the evidence is weak."),
    q("btq-mc-4", "bt-monte-carlo", "knowledge", single("What do simple trade reshuffling and the bootstrap both assume?", [
      ["a", "That every trade wins", "No such assumption."],
      ["b", "That costs are zero", "Costs are already in each trade."],
      ["c", "That the strategy has an edge", "They test whether it might not."],
      ["d", "That trades are independent of each other", "Right. Clustered results break this."],
    ], "d"), "Both treat trades as independent draws. When results cluster in time, block resampling keeps some of that clustering; the lab resamples single trades."),

    // bt-multiple-testing
    q("btq-mt-1", "bt-multiple-testing", "calculation", numeric("You test 200 variants with no edge, each at a 5% significance level. How many would you expect to pass by luck?", "variants", 10, 0, "200 × 0.05 = 10."), "Expected false passes ≈ N × significance level = 200 × 0.05 = 10, and the best of them will look convincing."),
    q("btq-mt-2", "bt-multiple-testing", "knowledge", single("Harvey, Liu and Zhu (2016) argued that a newly discovered factor needs a t-statistic above about…", [
      ["a", "1.0", "Far too low."],
      ["b", "2.0, as in a single test", "That is the old bar they criticised."],
      ["c", "3.0", "Right. Because so many factors have been tried."],
      ["d", "10, so that almost no new factor could ever pass the bar again", "Not their number."],
    ], "c"), "Because hundreds of factors have been tried on similar data, they argued a new one needs a t-statistic above about 3.0, not the usual 2.0."),
    q("btq-mt-3", "bt-multiple-testing", "knowledge", tf("For the same best Sharpe ratio, the deflated Sharpe ratio falls as the number of trials rises.", true, "True. More trials raise the bar set by noise."), "More trials raise the best Sharpe expected from noise, so the same result is less likely to reflect a real edge."),
    q("btq-mt-4", "bt-multiple-testing", "knowledge", tf("Harvey and Liu (2015) found that a flat 50% haircut is right for every Sharpe ratio.", false, "False. Weak results need bigger haircuts; very strong ones smaller."), "Their haircut is not flat: it is larger for weaker results and smaller for very strong ones."),
    q("btq-mt-5", "bt-multiple-testing", "knowledge", single("What should count as a \"try\" when you report how many variants you tested?", [
      ["a", "Every rule, setting, market, filter and period you looked at", "Right. All of them were chances to find luck."],
      ["b", "Only settings that made money", "Losers were tries too."],
      ["c", "Only the final version", "Hides the search."],
      ["d", "Only the runs you did this week, on the computer you use today", "The search counts wherever it happened."],
    ], "a"), "Each variant you looked at was a chance for luck to produce a winner, so all of them belong in the count."),

    // bt-regimes
    q("btq-re-1", "bt-regimes", "knowledge", single("Which kind of market tends to hurt a moving-average trend rule most?", [
      ["a", "A long, steady trend", "That suits it."],
      ["b", "A ranging, sideways market", "Right. It is whipsawed in and out."],
      ["c", "Any market, equally", "Results differ by regime."],
      ["d", "A trend that starts slowly and then speeds up for many months", "Still a trend."],
    ], "b"), "In a range, a trend rule's signals keep flipping, so it takes many small losses and pays costs each time."),
    q("btq-re-2", "bt-regimes", "calculation", numeric("A rule earns +0.4R per trade in trends (60% of the time) and −0.2R in ranges (40%). What is its average per trade, in R?", "R", 0.16, 0.005, "0.6 × 0.4 + 0.4 × (−0.2) = 0.24 − 0.08 = 0.16R."), "Average ≈ Σ (time share × result) = 0.24 − 0.08 = 0.16R. A period with more ranging would give less."),
    q("btq-re-3", "bt-regimes", "knowledge", tf("A backtest run only in a trending period tells you reliably how the rule will do in a range.", false, "False. It never met a range."), "A rule's result depends on the regimes in the data. A test that saw one regime tells you mostly about that one."),
    q("btq-re-4", "bt-regimes", "knowledge", single("What did Kaminski and Lo (2014) find about simple stop-loss rules when returns follow a random walk?", [
      ["a", "They always add value", "Not under a random walk."],
      ["b", "They have no effect at all on expected returns, whatever the market does", "They lower it in a random walk."],
      ["c", "They lower the expected return", "Right. With momentum they can add value."],
      ["d", "They double the return", "No such finding."],
    ], "c"), "Under a random walk, simple stop-loss rules always lower the expected return; when returns show momentum, they can add value. The effect depends on the regime."),

    // bt-forward
    q("btq-fw-1", "bt-forward", "knowledge", single("What does a forward test give that a backtest cannot?", [
      ["a", "Data the rules were not chosen on, met in real time", "Right. No hindsight and no tuning."],
      ["b", "A guarantee of future profits", "Nothing gives that."],
      ["c", "More years of history", "It is usually shorter."],
      ["d", "A way to skip costs", "Costs still apply."],
    ], "a"), "In a forward test the rules are fixed before the data arrives, so the result cannot have been fitted to it."),
    q("btq-fw-2", "bt-forward", "calculation", numeric("A strategy's backtest Sharpe was 1.3 and its forward Sharpe is 0.5. What is the forward gap?", "Sharpe", 0.8, 0.02, "1.3 − 0.5 = 0.8."), "Forward gap = backtest Sharpe − forward Sharpe = 0.8. A large gap suggests overfitting or unrealistic costs."),
    q("btq-fw-3", "bt-forward", "knowledge", tf("Paper trading may give better fills than live trading would.", true, "True. Paper ignores queue position, partial fills and some slippage."), "Paper fills do not wait in a queue, are rarely partial and often skip slippage, so live results can be worse."),
    q("btq-fw-4", "bt-forward", "knowledge", single("Halfway through a forward test, a trader tweaks the exit rule. What follows?", [
      ["a", "Nothing; the test carries on", "The rules being tested have changed."],
      ["b", "The test restarts with the new rules", "Right. Otherwise it is fitting, just slower."],
      ["c", "The earlier forward trades now count as in-sample backtest results for the new rule", "That mixes two different rule sets."],
      ["d", "Only the next trade is affected", "Every later trade is."],
    ], "b"), "A forward test tests one fixed rule set. Changing the rules mid-way means the earlier results belong to a different strategy."),

    // bt-applied
    q("btq-ap-1", "bt-applied", "applied", scenario(
      "A friend shares a backtest with a Sharpe of 3. It uses today's index members, charges no costs, and they say they \"tried a lot of versions\".",
      "What is the soundest response?",
      [
        ["a", "Trade it: a Sharpe of 3 is rare", "A rare result needs more checks, not fewer.", "unsound"],
        ["b", "Add another filter to make the equity curve even smoother before deciding", "Adds more fitting.", "unsound"],
        ["c", "Trade it at small size while you look into it", "Smaller, but still untested.", "partial"],
        ["d", "Ask for delisted data, full costs and the variant count, then rerun", "Sound: fixes three failed must-pass checks.", "sound"],
      ],
    ), "Survivor-only data, no costs and an unknown number of tries each inflate a backtest. All three must be fixed before the result means anything."),
    q("btq-ap-2", "bt-applied", "applied", scenario(
      "A trader's rule looked strong in-sample. They opened the held-out period once and the result was weak. They now want to adjust the exit and check that period again.",
      "What is the soundest next step?",
      [
        ["a", "Adjust and recheck the same period until it looks good", "Turns it into in-sample data.", "unsound"],
        ["b", "Record the failure; test any new idea on fresh data or a forward test", "Sound: the held-out period has been used.", "sound"],
        ["c", "Adjust and recheck once more only", "Even one more look uses up the period.", "partial"],
        ["d", "Ignore the held-out period and trade the in-sample version at full size", "Ignores the only fair check.", "unsound"],
      ],
    ), "The held-out period was used once and the rule failed it. Any new version needs data that has never guided a choice."),
    q("btq-ap-3", "bt-applied", "applied", scenario(
      "While reviewing code, a trader finds their backtest has been filling each trade at the open of the same bar whose close made the signal.",
      "What is the soundest decision?",
      [
        ["a", "Fix the fills, rerun everything and revisit decisions made on old results", "Sound: every result used future prices.", "sound"],
        ["b", "Fix it for future tests only", "Past decisions rest on bad results.", "partial"],
        ["c", "Keep the results, since the bug only affects timing", "Timing is the whole point.", "unsound"],
        ["d", "Go live now, since the edge is probably real, and check all of the results later", "Risks money on an invalid test.", "unsound"],
      ],
    ), "A lookahead bug makes every result invalid, whatever direction it pushed them. All results and any decisions built on them need redoing."),
    q("btq-ap-4", "bt-applied", "applied", scenario(
      "A strong backtest passes every must-pass check except one: the trader is not sure whether their data includes delisted stocks.",
      "What is the soundest view?",
      [
        ["a", "Treat that check as failed until the data source confirms it", "Sound: unsure counts as failed.", "sound"],
        ["b", "Count it as passed, since most data is probably fine", "Unsure is not a pass.", "unsound"],
        ["c", "Pass it because the result is strong", "A strong result is a reason to check harder.", "unsound"],
        ["d", "Skip the check this time but note it down for later in the research log", "Better than ignoring, but still unchecked.", "partial"],
      ],
    ), "Survivorship can create a strong result from nothing. The check stays failed until the data is confirmed to include delisted names."),
  ],
};

const MORE_REMEDIATION: Record<string, ConceptRemediation> = {
  "bt-limits": {
    misconception: "Some decide that because backtests can mislead, they are useless. A fair backtest is very good at rejecting bad ideas cheaply, before any money is risked.",
    altExplanation: "The value of a backtest is uneven. A loss, with honest fills and costs, is strong evidence against an idea. A win is only a reason to keep testing: out of sample, across regimes, with a count of tries, and then forward.",
    altExample: "A trader backtests ten ideas. Seven lose clearly and are dropped in an afternoon. The three that win go on to out-of-sample and forward tests, where one survives.",
    practice: numeric("At a close, an account holds 25,000 in cash and 50 units of a stock that closed at 150. What is its equity?", "money", 32500, 10, "25,000 + 50 × 150 = 32,500."),
  },
  "bt-data": {
    misconception: "Adjusted prices can seem like the prices that were really traded. They are rewritten history: fine for returns and signals, but not the levels anyone could buy or sell at.",
    altExplanation: "Use adjusted data for returns and most signals. Take care with rules that use price levels, such as \"buy above 50\", because the adjusted level differs from the quoted one. When one day dominates a result, check that date's data first.",
    altExample: "A back-adjusted futures series shows an early price of 62, but the contract traded then at 55. A rule that buys at round levels would have acted on prices no one saw.",
    practice: single("A rule says \"buy when the price is above 50\" and is tested on adjusted prices. What is the main risk?", [
      ["a", "None; adjusted prices are the real prices", "They are rewritten for earlier dates."],
      ["b", "The adjusted level may differ from what was quoted, so the signal may fire at the wrong times", "Right. Levels shift with adjustment."],
      ["c", "Adjusted data has no dividends", "It can include them."],
      ["d", "The test will be too slow", "Speed is not the issue."],
    ], "b"),
  },
  "bt-lookahead": {
    misconception: "Lookahead is often thought of as a coding typo. It also hides in data: revised figures, index lists made later, or prices adjusted with information from after the date.",
    altExplanation: "Point-in-time data stores each value as it was known on each date. Without it, revisions and later corrections leak into the past. The check is the same for every input: was this exact value available before the fill?",
    altExample: "Economic data is often revised months after release. A test that uses today's revised numbers for last year's decisions knows things the trader could not have known.",
    practice: single("A rule buys when today's close is above the 20-day high, and the backtest buys at today's open. What is wrong?", [
      ["a", "Nothing, since the open is a real traded price", "Real, but too early."],
      ["b", "The open happened before the close the signal needs", "Right. Fill at the next open instead."],
      ["c", "The 20-day high should be a 50-day high", "The window is not the problem."],
      ["d", "It should buy at the day's low", "That would be worse lookahead."],
    ], "b"),
  },
  "bt-survivorship": {
    misconception: "Survivorship can seem to affect only stock pickers. It affects any test on a list chosen today: funds, coins, futures markets and even trading strategies that are still being sold.",
    altExplanation: "Whenever a list is built from what exists now, the failures have been filtered out. Use the list as it was on each past date, keep dead names in the data and use their final returns, including delisting losses.",
    altExample: "A study of fund managers looks only at funds open today. Funds closed after poor years are missing, so the average manager looks more skilled than the full group was.",
    practice: single("Which data choice reduces survivorship bias?", [
      ["a", "Using only stocks listed today", "That creates the bias."],
      ["b", "Using point-in-time index members, including delisted stocks", "Right. The losers stay in."],
      ["c", "Using the largest stocks today", "Still a list of survivors."],
      ["d", "Using a longer history of the same survivors", "More years of survivors only."],
    ], "b"),
  },
  "bt-costs": {
    misconception: "Some assume the stop price in a backtest is the price they would get. Stops become market orders when hit, and in a gap they fill at the first price available.",
    altExplanation: "A realistic execution model charges commission and half the spread plus slippage on every fill, and fills stops at the worse of the stop and the open after a gap. Testing at higher costs than you expect shows how much margin the edge has.",
    altExample: "A trader's stop is at 120. The market closes at 123 and opens at 114 after bad news. The fill is near 114, a much bigger loss than the plan assumed.",
    practice: single("A stop sits at 80. The market closes at 83, then opens at 76. Where does the lab fill the stop?", [
      ["a", "At 80", "The market never traded there after the gap."],
      ["b", "At 83", "That was the close before the gap."],
      ["c", "At 76, the open", "Right. The lower of the stop and the open."],
      ["d", "Halfway between, at 78", "No such rule."],
    ], "c"),
  },
  "bt-metrics": {
    misconception: "A Sharpe ratio can look like a precise grade. It is an estimate with error, and short samples or returns that move together over time can make it look better than it is.",
    altExplanation: "Lo (2002) showed Sharpe ratios carry estimation error, and that scaling a monthly Sharpe by √12 is valid only in special cases. Read a Sharpe with its sample length, and next to drawdown and trade count.",
    altExample: "Two years of data give one rule a Sharpe of 1.5. Over a longer test the same rule comes out near 0.5. The short sample's number had wide error around it.",
    practice: single("What does the Sortino ratio change compared with the Sharpe ratio?", [
      ["a", "It ignores losses", "It focuses on them."],
      ["b", "It only penalises downside moves, not upside ones", "Right. Downside deviation replaces standard deviation."],
      ["c", "It counts trades instead of returns", "Not how it works."],
      ["d", "It is always higher than the Sharpe for any return series", "Not always."],
    ], "b"),
  },
  "bt-oos": {
    misconception: "A single good out-of-sample result can feel like proof. It is one more filter passed; with a short hold-out and few trades, luck still plays a large part.",
    altExplanation: "The gap between in-sample and out-of-sample results estimates how much was fitting. A small gap is encouraging; a large one says much of the in-sample result was noise. The size of the hold-out should depend on how many trades it contains.",
    altExample: "A rule with an in-sample Sharpe of 2.0 shows 0.6 out of sample. The drop of 1.4 is the part of the result the search fitted to the first period.",
    practice: numeric("A rule has an in-sample Sharpe of 0.9 and an out-of-sample Sharpe of 0.15. What is the fitting gap?", "Sharpe", 0.75, 0.02, "0.9 − 0.15 = 0.75."),
  },
  "bt-walk-forward": {
    misconception: "A high average training Sharpe can look like the walk-forward result. The number that matters is the stitched test result; the training numbers only show what the search found.",
    altExplanation: "Compare the average training Sharpe of the chosen settings with the stitched test Sharpe. A big drop means the process picks noise. Also watch how often the chosen setting changes: stable choices are a better sign.",
    altExample: "In a walk-forward run, chosen settings average a training Sharpe of 1.8, while the stitched test windows give 0.2. The choosing process mostly found luck.",
    practice: single("Which walk-forward number is closest to what the process would really have earned?", [
      ["a", "The best training Sharpe of any window", "That is the search result."],
      ["b", "The average training Sharpe", "Still in-sample."],
      ["c", "The stitched test-window Sharpe", "Right. Each window was unseen when chosen."],
      ["d", "The full-sample Sharpe of the best setting", "Chosen with hindsight."],
    ], "c"),
  },
  "bt-robustness": {
    misconception: "A precise setting such as 47 can feel more scientific than a round 50. The precision usually comes from fitting the search to noise, not from the market.",
    altExplanation: "Choose from the middle of a good region, and prefer round settings unless there is a reason not to. Check how much the result changes when each setting moves by one step; a big change is a warning.",
    altExample: "A breakout rule does well for entry lookbacks from 30 to 60 bars. A trader picks 45, in the middle, rather than the single best cell at 38.",
    practice: tf("A cell far above the average of its neighbours on a heatmap is a warning sign of fitting noise.", true, "True. That is a spike."),
  },
  "bt-monte-carlo": {
    misconception: "A bootstrap interval can seem to cover every risk. It only resamples the trades you have, so it cannot show risks that never appeared in the sample, such as a crash it did not include.",
    altExplanation: "Use reshuffles to plan for the bad end of the drawdown range, such as the worse 5%, and the bootstrap to see how uncertain the average trade is. Then add a margin for risks the sample never contained.",
    altExample: "A rule's 40 trades give a bootstrap interval for the average trade from −0.1R to +0.5R. The sample holds no crash, so the true worst case could be outside anything resampled.",
    practice: single("Resampling trades with replacement (the bootstrap) mainly shows what?", [
      ["a", "How uncertain the average trade is with this many trades", "Right. It gives an interval."],
      ["b", "The one true drawdown", "No single drawdown is true."],
      ["c", "Future market regimes", "It only uses past trades."],
      ["d", "Whether there was lookahead", "That needs a timing check."],
    ], "a"),
  },
  "bt-multiple-testing": {
    misconception: "Testing more ideas can feel like doing more careful research. More tries on the same data make the best result more likely to be luck, unless the bar rises with them.",
    altExplanation: "The deflated Sharpe ratio (Bailey and López de Prado, 2014) asks how likely the true Sharpe is to be above zero, given how many trials were run and how fat-tailed the returns are. The more trials, the higher the Sharpe needed to pass.",
    altExample: "With five years of daily data, the best of 50 no-edge variants is expected to reach an annual Sharpe of about 1 by luck. A best result of 1 is then no evidence at all.",
    practice: single("What does the deflated Sharpe ratio estimate?", [
      ["a", "The Sharpe ratio after costs", "Costs are a separate step."],
      ["b", "The chance that the true Sharpe is above zero, given the trials run", "Right. It allows for the search."],
      ["c", "The best Sharpe you can find", "It discounts the best one."],
      ["d", "The number of trades needed", "Not what it measures."],
    ], "b"),
  },
  "bt-regimes": {
    misconception: "Regime filters can seem to fix regime dependence. They are built from past bars, so they switch on and off late, and each one adds settings to fit.",
    altExplanation: "Real markets carry no labels; regimes are only clear in hindsight. Rather than hoping to predict them, know which regime hurts your rule, test how much it can lose there, and size so you can survive it.",
    altExample: "A mean-reversion rule does well for three choppy years, then a long one-way rally arrives. It keeps buying dips that do not bounce until its drawdown passes anything seen in the test.",
    practice: single("Which kind of market tends to hurt an RSI mean-reversion rule most?", [
      ["a", "A choppy range", "That tends to suit it."],
      ["b", "A strong, persistent one-way trend", "Right. Stretched moves keep going."],
      ["c", "A quiet market with small moves", "Often a range."],
      ["d", "None; it works everywhere", "Every rule has a bad regime."],
    ], "b"),
  },
  "bt-forward": {
    misconception: "A short forward test that goes well can feel like enough to scale up. A few dozen trades can easily be lucky in either direction.",
    altExplanation: "Decide in writing, before starting, how long the forward test runs, at what size, and what result would stop it. Move from paper to small live size before full size, since live fills add costs paper does not show.",
    altExample: "After 20 forward trades a trader is up 6R. The plan says 100 trades at small size first, so the size stays small and the record keeps growing.",
    practice: numeric("A strategy's backtest Sharpe was 1.1 and its forward Sharpe is 0.35. What is the forward gap?", "Sharpe", 0.75, 0.02, "1.1 − 0.35 = 0.75."),
  },
  "bt-applied": {
    misconception: "A forward test that starts badly can push a trader to change the rules or quit early. The plan written before the test should decide, not the first few results.",
    altExplanation: "Separate running a test from researching new ideas. Keep running the fixed rules for the planned length unless a written stop rule is hit. Put any new idea through the full checklist as a new version.",
    altExample: "Ten trades into a planned 100, a forward test is down 3R. The written stop is at 15R, so the trader keeps the rules unchanged and notes a new exit idea for later research.",
    practice: scenario(
      "A forward test planned for 100 trades is down after 20. Its written stop rule has not been hit. The trader has a new filter idea that would have avoided most of the losses.",
      "What is the soundest decision?",
      [
        ["a", "Add the filter now and keep going", "Fits the rules to the last 20 trades.", "unsound"],
        ["b", "Stop the test because it is losing", "The written stop has not been hit.", "unsound"],
        ["c", "Keep the rules fixed, finish the test, and test the filter separately as a new version", "Sound: the plan decides; new ideas get their own test.", "sound"],
        ["d", "Run the filter in parallel on the same trades and switch if it does better", "Still choosing with hindsight.", "partial"],
      ],
    ),
  },
};

export const BACKTESTING_ASSESSMENT: TrackAssessment = {
  ...BASE,
  concepts: BASE.concepts.map((c) => ({ ...c, moreRemediation: MORE_REMEDIATION[c.id] ? [MORE_REMEDIATION[c.id]] : [] })),
};
