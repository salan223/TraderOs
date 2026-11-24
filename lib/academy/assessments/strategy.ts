import type { AssessmentQuestion, ChoiceOption, ConceptRemediation, GradedItem, ScenarioItem, TrackAssessment } from "../types";

/*
  Track 10 assessment: Strategy Development.
  Rule ambiguity, curve-fitting and kill criteria are safety-critical:
  getting them wrong is how a trader risks money on a strategy that was
  never really tested, was fitted to noise, or keeps losing with no rule to
  stop it. Numbers come from the lessons' formulas, not from real markets.
*/

const T = "strategy-development";

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
    "Questions on every idea from the twelve lessons: the parts of a strategy, edge sources, exact rules, the four archetypes, exits and sizing, regime filters, curve-fitting, the spec document, forward-testing, kill criteria, diversification and decay, with calculations and applied scenarios. You need 90% or more, a sound decision in the scenario, and every safety-critical question right: rule ambiguity, curve-fitting and kill criteria.",
  concepts: [
    {
      id: "strat-anatomy",
      title: "The parts of a trading strategy",
      lessonIds: ["strat-anatomy"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Many traders think a strategy is an indicator or a setup. Those are inputs; a strategy also needs exits, a stop, sizing, a market and a reason it should work.",
        altExplanation: "Picture handing your method to a stranger. They would need to know why it should work, what to trade, on which bars, when to get in and out, how much to risk and when to sit out. Each of those is one of the eight parts.",
        altExample: "\"Buy RSI dips\" is a setup. Adding a named market, daily bars, an exact exit, a stop, 0.5% risk per trade and a reason turns it into a strategy.",
        practice: single("Which part should a strategy be built from first?", [
          ["a", "The hypothesis: why it should make money", "Right. The other parts follow from the reason."],
          ["b", "The indicator settings that looked best on a recent chart of the market you like", "Settings come later, and need a reason."],
          ["c", "The broker", "Not a part of the strategy's logic."],
          ["d", "The yearly profit goal", "A goal is not a reason the method works."],
        ], "a"),
      },
      flashcard: { front: "Eight parts", back: "Hypothesis, edge source, market, timeframe, entry, exit (with stop), sizing, filters. Testable is not profitable." },
    },
    {
      id: "strat-edges",
      title: "Where edges come from",
      lessonIds: ["strat-edge-sources"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "A pattern that made money on past charts can feel like an edge. Without a reason and someone who keeps paying, it is most likely chance.",
        altExplanation: "Ask two questions of any idea: who is on the other side, and why would they keep losing? Risk premia pay for risk, behavioural edges use others' errors, structural edges use forced trades, and information edges use better analysis. If none fits, call it noise.",
        altExample: "A trader notices a coin's price rose on most Tuesdays this quarter. Nobody is forced to sell on Mondays, and no risk is being paid for, so the pattern has no source.",
        practice: single("Trading ahead of a fund's forced month-end rebalancing relies on which edge source?", [
          ["a", "Information", "No special information is involved."],
          ["b", "Risk premium", "Not pay for bearing a risk."],
          ["c", "Structural or flow", "Right. The other side must trade by its rules."],
          ["d", "Behavioural, because fund managers are biased about the end of the month", "The fund is forced by rules, not by bias."],
        ], "c"),
      },
      flashcard: { front: "Edge sources", back: "Risk premium, behavioural, structural/flow, information. No source and no counterparty → treat as noise." },
    },
    {
      id: "strat-testability",
      title: "Rule ambiguity and testability risk",
      lessonIds: ["strat-testable-rules", "strat-anatomy"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "A rule like \"buy when it looks strong\" feels clear to the person who wrote it. Another reader, or the same person in hindsight, can apply it differently, so it cannot be tested fairly.",
        altExplanation: "Every vague word hides a choice: which price, how many bars, what threshold, when checked. In a backtest you tend to make each choice in the way that worked, so the test looks better than anything you could do live. Replacing each word with a number removes the hidden choices.",
        altExample: "\"Sell when the trend weakens\" could mean a close below a 10-, 20- or 50-bar average. Three readings, three different trade lists from the same chart.",
        practice: single("Which stop rule has no discretion gap?", [
          ["a", "A mental stop just below support", "No price and no order; it can move."],
          ["b", "Wherever feels right for the trade", "Pure judgement."],
          ["c", "A sensible stop", "Sensible is a judgement."],
          ["d", "A stop order 2 × ATR(14) below entry, never widened", "Right. Anyone can compute the same price."],
        ], "d"),
      },
      flashcard: { front: "Discretion gap", back: "Any place two people could apply a rule differently. Each gap is a hidden choice a backtest makes in your favour." },
    },
    {
      id: "strat-archetypes",
      title: "Trend, mean-reversion, breakout and carry",
      lessonIds: ["strat-archetypes"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "It is tempting to look for the one archetype that always works. Each one bets on a market behaviour, so each loses when that behaviour is absent.",
        altExplanation: "Trend and breakout bet that moves continue; they suffer in sideways markets. Mean-reversion bets that stretched moves fade; it suffers in strong trends. Carry earns income and loses in sudden sell-offs. In a random, choppy market with costs, they all tend to lose.",
        altExample: "Through a quiet, range-bound summer, a trend rule takes many small losses while a mean-reversion rule on the same market gains. In an autumn sell-off they swap places.",
        practice: single("Which archetype tends to suffer most in a long sideways range?", [
          ["a", "Mean-reversion", "Ranges tend to suit it."],
          ["b", "Trend-following", "Right. Its signals keep flipping and paying costs."],
          ["c", "None of them, since a range is the easiest condition for every type of strategy", "Ranges hurt trend rules."],
          ["d", "Carry", "Carry is hurt mainly by sharp falls."],
        ], "b"),
      },
      flashcard: { front: "Archetypes", back: "Trend/breakout: continuation, hurt by ranges. Mean-reversion: fading, hurt by trends. Carry: income, hurt by crashes." },
    },
    {
      id: "strat-exits",
      title: "Entries, exits and expectancy",
      lessonIds: ["strat-exits-entries"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "A high win rate feels like proof of a good strategy. If the average loss is much bigger than the average win, it can still lose money.",
        altExplanation: "Expectancy combines three numbers: how often you win, how much you win on average and how much you lose on average. The exit and stop set two of those three. That is why the exit can matter as much as the entry, and why win rate alone says little.",
        altExample: "A trader wins 8 trades in 10 at +0.25R each, then loses 2 at −1.5R each. Ten trades, eight winners, and the total is −1R.",
        practice: numeric("A strategy wins 30% of trades. Winners average 3R and losers 1R. What is its expectancy per trade, in R?", "R", 0.2, 0.005, "0.3 × 3 − 0.7 × 1 = 0.9 − 0.7 = 0.2R."),
      },
      flashcard: { front: "Expectancy", back: "E = p × average win − (1 − p) × average loss. Exits set the averages; win rate alone tells you little." },
    },
    {
      id: "strat-regimes",
      title: "Filters and regime detection",
      lessonIds: ["strat-filters-regimes"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Adding filters until the backtest is smooth feels like making a strategy safer. Each filter and setting is another chance to fit noise.",
        altExplanation: "A filter should have a reason tied to the archetype's weak regime, one fixed setting chosen before testing, and a check on new data. Filters built from past bars always lag, so they switch on late and off late.",
        altExample: "A trader adds a volume filter, a day-of-week filter and a volatility filter after three losing months. The backtest improves, but each filter was chosen by looking at those three months.",
        practice: numeric("Over 10 bars a price moved from 50 to 52, and the absolute bar-to-bar moves added up to 8. What is the efficiency ratio, as a percentage?", "%", 25, 0.5, "Net change 2 ÷ total travel 8 = 0.25 = 25%."),
      },
      flashcard: { front: "Regime filter", back: "Exact on/off rule by regime, e.g. ER = |net change| ÷ total travel. Lags; fix settings first; keep few." },
    },
    {
      id: "strat-curve-fitting",
      title: "Curve-fitting and backtest overfitting risk",
      lessonIds: ["strat-curve-fitting"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "The best of many backtests looks like the best strategy. On noise, picking the maximum picks the luckiest variant, so its result is expected to shrink on new data.",
        altExplanation: "Each variant's result is real edge plus luck. The more variants you try, the more luck the winner carries. That is why you record the number tried, keep out-of-sample data aside and use it once, and trust simple rules with reasons over finely tuned ones.",
        altExample: "Fifty students each flip a coin 20 times. The best scores 15 heads. Asked to flip 20 more, that student is expected to get about 10.",
        practice: numeric("A trader tests 4 lookbacks, 3 stop distances and 5 exit rules, every combination. How many variants has the trader tried?", "variants", 60, 1, "4 × 3 × 5 = 60 variants."),
      },
      flashcard: { front: "Curve-fitting", back: "Best of N is biased upward. Count variants, keep out-of-sample data and use it once, prefer simple rules." },
    },
    {
      id: "strat-spec",
      title: "The strategy spec document",
      lessonIds: ["strat-spec-doc"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Some traders treat a spec as paperwork for systematic funds. Any repeated method has rules that drift unless they are written down and dated.",
        altExplanation: "The spec is the fixed reference: hypothesis, rules, costs, tests and variant count, and kill criteria. It lets you ask whether the strategy is failing or whether you stopped following it, and it keeps results from different versions apart.",
        altExample: "A trader's notes say the stop is 2 × ATR, yet a review finds five trades with wider stops. The spec turns a vague worry into a clear finding: the live trades were not the tested strategy.",
        practice: single("Which line belongs in the spec's test section?", [
          ["a", "Buy at the next open after a close above the 20-bar high", "That is an entry rule."],
          ["b", "Stop if drawdown exceeds the tested 99th percentile", "That is a kill criterion."],
          ["c", "200 variants tried; 2024 kept out of sample", "Right. Tests done and the variant count."],
          ["d", "Commission plus half the spread on every entry and every exit, on all markets", "That is the costs section."],
        ], "c"),
      },
      flashcard: { front: "Spec", back: "Dated, versioned: hypothesis, markets, entry, exit, sizing, filters, costs, tests (with variant count), kill criteria." },
    },
    {
      id: "strat-forward",
      title: "Paper-trading and forward-testing",
      lessonIds: ["strat-forward-testing"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "A few good weeks of paper trading feel like confirmation. For a small edge, weeks of results are mostly noise.",
        altExplanation: "The standard error of an average shrinks with the square root of the number of trades. To tell an edge from zero at about two standard errors needs roughly (2 × spread ÷ edge)² trades, which for small edges runs into the hundreds.",
        altExample: "An edge of +0.1R with a spread of 1.5R needs about (2 × 1.5 ÷ 0.1)² = 900 trades to tell from zero. At ten trades a week that is close to two years.",
        practice: numeric("A strategy's edge is +0.2R a trade with a spread of 1.5R. Using n ≈ (2 × sd ÷ mean)², about how many trades are needed to tell it from zero?", "trades", 225, 5, "2 × 1.5 ÷ 0.2 = 15, and 15² = 225."),
      },
      flashcard: { front: "Forward test length", back: "n ≈ (2 × sd ÷ mean)². Halve the edge → four times the trades. Paper first, then small live, then full." },
    },
    {
      id: "strat-kill",
      title: "Kill criteria: when to stop a strategy (drawdown and risk limits)",
      lessonIds: ["strat-kill-criteria"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "Many traders decide when to quit in the middle of a drawdown. Under stress they either drop a sound strategy at a normal low or keep a broken one far too long.",
        altExplanation: "Set three rules before trading: a drawdown level from the simulated range of the tested strategy, a shortfall test comparing the live average with the tested one, and a hard money limit. The hard limit protects the account while the statistics are still too slow to decide.",
        altExample: "A spec says: halve size at a 20R drawdown, stop at 28R, and stop at any 8% account loss from peak. At 22R the trader halves size and carries on.",
        practice: single("Why is a hard money limit needed alongside statistical kill criteria?", [
          ["a", "Statistical tests are always wrong", "They are slow, not wrong."],
          ["b", "Tests can take hundreds of trades to detect a broken edge", "Right. The hard limit caps the damage meanwhile."],
          ["c", "It lets you trade larger", "It does the opposite."],
          ["d", "Because brokers close any account that has no written loss limit on file", "Not a general rule."],
        ], "b"),
      },
      flashcard: { front: "Kill criteria", back: "Set before trading: drawdown level (from simulated range), shortfall z-test, hard money limit. Follow, don't renegotiate." },
    },
    {
      id: "strat-diversify",
      title: "Diversifying across strategies",
      lessonIds: ["strat-diversification"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Running more strategies feels like more diversification. If they share the same main risk, they behave like one strategy.",
        altExplanation: "The benefit depends on correlation. With n strategies of Sharpe s and average correlation ρ, the combined Sharpe is s × √(n ÷ (1 + (n − 1)ρ)), with a ceiling of s ÷ √ρ. Correlations also tend to rise in crises.",
        altExample: "Trend rules on gold, silver and platinum look like three strategies, but their returns move closely together, so the combined Sharpe barely rises.",
        practice: numeric("Four uncorrelated strategies each have a Sharpe ratio of 0.3. Using s × √n, what is the combined Sharpe ratio?", "Sharpe", 0.6, 0.01, "0.3 × √4 = 0.3 × 2 = 0.6."),
      },
      flashcard: { front: "Diversification", back: "Combined Sharpe = s × √(n ÷ (1 + (n − 1)ρ)); ceiling s ÷ √ρ. Count by risk, not by name." },
    },
    {
      id: "strat-decay",
      title: "Strategy lifecycle and decay",
      lessonIds: ["strat-lifecycle"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A strategy that worked for years seems likely to keep working. Edges draw competition, and known ones tend to shrink.",
        altExplanation: "As others find an edge, they trade it and share the profit. McLean and Pontiff found US stock predictors' returns about 58% lower after publication; Jacobs and Müller found that reliable post-publication decline mainly in the US. Review rolling results and retire by rule.",
        altExample: "A strategy is up a lot since launch, but its last 150 trades average close to zero. Total profit hides the decay; the rolling average shows it.",
        practice: numeric("An edge starts at 0.8R a trade and halves every year. What is it after 2 years, in R?", "R", 0.2, 0.005, "0.8 → 0.4 → 0.2R."),
      },
      flashcard: { front: "Decay", back: "Edges shrink as others trade them. Review rolling recent results, not total profit; retire by a written rule." },
    },
    {
      id: "strat-applied",
      title: "Applying strategy development to real decisions",
      lessonIds: ["strat-testable-rules", "strat-curve-fitting", "strat-forward-testing", "strat-kill-criteria"],
      critical: true,
      safetyCritical: false,
      applied: true,
      remediation: {
        misconception: "Under pressure, a quick tweak to the rules or a jump to full size can look like good judgement. The sound move is the one the spec set out before the pressure arrived.",
        altExplanation: "When a decision comes up, check: is this in the spec, is any kill criterion hit, has enough data arrived to judge, and would this change fit the rules to recent results? If the answer is to change the rules, it becomes a new version with its own test.",
        altExample: "After a strong first month, a trader wants to triple size. The spec says small live size for 300 trades first, so they keep the size and keep recording.",
        practice: scenario(
          "A strategy's backtest looked strong after testing about 200 settings. The trader has kept the last year of data aside and not looked at it.",
          "What is the soundest next step?",
          [
            ["a", "Go live at full size, since the backtest is strong", "Ignores the 200 tries and the unused check.", "unsound"],
            ["b", "Run the fixed rules once on the held-out year, then forward test at small size", "Sound: a fair check, then new data.", "sound"],
            ["c", "Test on the held-out year, and re-tune if it disappoints, then test again on the same year", "Re-tuning on that year makes it in-sample.", "partial"],
            ["d", "Try another 200 settings to be sure", "Adds more luck to the winner.", "unsound"],
          ],
        ),
      },
      flashcard: { front: "Under pressure", back: "Is it in the spec? Is a kill rule hit? Is there enough data? Would this fit rules to recent noise?" },
    },
  ],
  questions: [
    // strat-anatomy
    q("stratq-an-1", "strat-anatomy", "knowledge", single("Which list contains only parts of a complete strategy?", [
      ["a", "Hypothesis, entry, exit, sizing", "Right. All four are parts of the rule set."],
      ["b", "Broker, platform, screen layout", "Tools, not parts of the strategy."],
      ["c", "Indicator, chart colour, news feed and a favourite trading forum for ideas", "Mostly not rules at all."],
      ["d", "Profit goal, mood, luck", "None of these are rules."],
    ], "a"), "A strategy is a written rule set: hypothesis, edge source, market, timeframe, entry, exit, sizing and filters."),
    q("stratq-an-2", "strat-anatomy", "knowledge", tf("A complete, testable rule set guarantees that the strategy will make money.", false, "False. Testable means it can be judged, not that it is profitable."), "Writing every rule exactly makes a strategy testable. Whether it has an edge is a separate question that only fair testing can answer."),
    q("stratq-an-3", "strat-anatomy", "calculation", numeric("A strategy wins 45% of trades with an average win of 2R and an average loss of 1R. What is its expectancy per trade, in R?", "R", 0.35, 0.01, "0.45 × 2 − 0.55 × 1 = 0.9 − 0.55 = 0.35R."), "Expectancy = win rate × average win − loss rate × average loss = 0.45 × 2 − 0.55 × 1 = 0.35R."),
    q("stratq-an-4", "strat-anatomy", "knowledge", single("Why should the sizing rule be written into the strategy?", [
      ["a", "Brokers require a written size", "They do not."],
      ["b", "Size only affects tax, not results or drawdowns", "Size changes both results and drawdowns."],
      ["c", "Size changes results and drawdowns", "Right. The same trades at different sizes give very different outcomes."],
      ["d", "It is optional, because size can be judged by feel on each trade once the entry rule is exact", "Size by feel tends to grow after wins."],
    ], "c"), "Size turns R results into money and drawdown. Left to feel, it tends to rise after wins, which a backtest cannot copy."),

    // strat-edges
    q("stratq-ed-1", "strat-edges", "knowledge", single("Selling insurance-like options and accepting rare large losses relies mainly on which edge source?", [
      ["a", "Information", "No special information is involved."],
      ["b", "Structural flow from index rebalancing on fixed dates", "Not the source here."],
      ["c", "Noise", "There is an economic reason here."],
      ["d", "A risk premium", "Right. It is pay for bearing a crash risk others avoid."],
    ], "d"), "A risk premium is pay for holding a risk others want to avoid. It can lose heavily when the risk arrives."),
    q("stratq-ed-2", "strat-edges", "knowledge", tf("A pattern found by trying hundreds of settings on one chart is likely to be noise.", true, "True. The best of many tries is expected to look good by chance."), "With many tries and no economic reason, the best-looking pattern is most likely chance. The lesson treats it as noise until shown otherwise."),
    q("stratq-ed-3", "strat-edges", "knowledge", single("What did Barber, Lee, Liu and Odean (2014) find about Taiwanese day traders?", [
      ["a", "Fewer than 1% predictably earned positive abnormal returns net of fees", "Right. Persistent skill was rare."],
      ["b", "Most were profitable after fees", "The opposite."],
      ["c", "All of them lost money in every year, without a single exception in the whole sample", "Not what was reported."],
      ["d", "Skill was common", "It was rare."],
    ], "a"), "Using complete Taiwan Stock Exchange records, 1992–2006, fewer than 1% of day traders were able to predictably earn positive abnormal returns net of fees."),
    q("stratq-ed-4", "strat-edges", "knowledge", multi("Which questions help judge whether an idea has a real edge source? Choose all that apply.", [
      ["a", "Who is on the other side of the trade?", "Right. An edge needs someone who keeps paying."],
      ["b", "Why would they keep losing?", "Right. Without a reason, the edge may vanish."],
      ["c", "Did it win on the last three trades?", "Three trades say almost nothing."],
      ["d", "Does the chart look convincing?", "Looks are not evidence."],
    ], ["a", "b"]), "An edge source names the counterparty and why they keep paying. A few recent wins or a convincing chart do not."),

    // strat-testability
    q("stratq-te-1", "strat-testability", "knowledge", single("Which entry rule is testable as written?", [
      ["a", "Buy when momentum looks strong", "\"Looks strong\" is a judgement."],
      ["b", "Buy on a clear breakout with good volume", "Clear and good are vague."],
      ["c", "Buy at the next open after a close above the 50-bar average", "Right. Data, number and timing are fixed."],
      ["d", "Buy when the trend is obviously up and the news is supportive of a continued move higher", "Several vague words."],
    ], "c"), "A testable rule names the data, the number and the timing, so anyone applying it gets the same trades."),
    q("stratq-te-2", "strat-testability", "knowledge", tf("A vague rule tends to make a backtest look worse than live trading.", false, "False. It tends to look better, because in hindsight you resolve vagueness in the way that worked."), "Each vague word is a hidden choice. In a backtest the choice tends to be made in your favour; live, you cannot know it in advance."),
    q("stratq-te-3", "strat-testability", "calculation", numeric("A rule set has three vague words, each with four plausible readings. How many hidden versions of the strategy does that make?", "versions", 64, 1, "4 × 4 × 4 = 64."), "Hidden versions multiply: 4 × 4 × 4 = 64. A backtest of the vague rules tends to show the best of these."),
    q("stratq-te-4", "strat-testability", "knowledge", single("A rule set is exact but assumes no trading costs. What is the main risk?", [
      ["a", "None: exact rules are enough", "Exact rules can still be tested unfairly."],
      ["b", "Costs make rules vague", "Costs are a separate, exact input."],
      ["c", "The broker will refuse to accept orders from a strategy that was tested without any costs at all", "Not how brokers work."],
      ["d", "A profit in the test that costs would remove", "Right. Costs belong in the spec."],
    ], "d"), "Small edges can vanish once spreads, commission and slippage are paid. A test without costs can show a profit that live trading will not."),

    // strat-archetypes
    q("stratq-ar-1", "strat-archetypes", "knowledge", single("What does a mean-reversion strategy bet on?", [
      ["a", "That prices far from an average move back toward it", "Right. Stretched moves fade."],
      ["b", "That moves continue", "That is trend-following."],
      ["c", "That income covers price losses", "That is closer to carry."],
      ["d", "That a break of a recent range will be followed by a large move in the same direction", "That is a breakout."],
    ], "a"), "Mean-reversion bets that prices stretched away from an average will move back. It suffers in strong trends that do not revert."),
    q("stratq-ar-2", "strat-archetypes", "knowledge", tf("In the lesson's simulation, every archetype tended to lose in the random-walk regime once costs rose.", true, "True. With no pattern to find, costs took the result."), "In a random walk there is no continuation or reversal to exploit, so each archetype pays costs for nothing."),
    q("stratq-ar-3", "strat-archetypes", "knowledge", single("Moskowitz, Ooi and Pedersen (2012) found time-series momentum in what?", [
      ["a", "One technology stock over a single year", "They used 58 futures markets."],
      ["b", "Crypto only", "Not in their sample."],
      ["c", "58 liquid futures across four asset classes", "Right. Returns persisted for 1–12 months."],
      ["d", "Daily bars of a single currency pair, with reversal inside each week", "Not their data or finding."],
    ], "c"), "They studied 58 liquid futures and forwards across equity indices, currencies, commodities and bonds, finding persistence over 1–12 months and partial reversal later."),
    q("stratq-ar-4", "strat-archetypes", "knowledge", single("Koijen and colleagues (2018) linked carry returns to which risks?", [
      ["a", "None: carry was risk-free", "Carry was exposed to several risks."],
      ["b", "Only currency risk", "They studied many asset classes."],
      ["c", "Earnings announcements of single stocks", "Not what they reported."],
      ["d", "Global recession, liquidity and volatility risks", "Right, though these did not fully explain carry returns."],
    ], "d"), "Carry returns were exposed to global recession, liquidity and volatility risks, which tend to hit in bad times, though they did not fully explain the returns."),

    // strat-exits
    q("stratq-ex-1", "strat-exits", "calculation", numeric("A strategy wins 40% of trades. Winners average 2R and losers 1R. Over 50 trades, what total result in R would you expect?", "R", 10, 0.2, "Per trade: 0.4 × 2 − 0.6 × 1 = 0.2R. 50 × 0.2 = 10R."), "Expectancy is 0.4 × 2 − 0.6 × 1 = 0.2R per trade, so 50 trades are expected to give 10R; real runs vary around it."),
    q("stratq-ex-2", "strat-exits", "knowledge", tf("A strategy that wins 70% of its trades can still lose money overall.", true, "True. If losses are much bigger than wins, expectancy is negative."), "Win rate is one of three numbers. With small wins and large losses, a high win rate can hide a negative expectancy."),
    q("stratq-ex-3", "strat-exits", "knowledge", single("In the simulation, what happened to the trailing exit in the ranging regime?", [
      ["a", "It lost, and the quick target did better", "Right. The right exit depended on the regime."],
      ["b", "It did better than in trends", "It lost in ranges."],
      ["c", "Nothing changed, because exit rules work the same way whatever the market is doing", "They do not."],
      ["d", "It made no trades", "It traded and lost."],
    ], "a"), "The trailing exit suited trends; in ranges it gave back gains and lost, while the quick target did better."),
    q("stratq-ex-4", "strat-exits", "knowledge", single("What did Kaminski and Lo (2014) find about stop-loss rules if returns follow a random walk?", [
      ["a", "They always raise the return", "The opposite."],
      ["b", "They have no effect on volatility", "They still change volatility."],
      ["c", "They always lower the expected return", "Right. They can add value only with patterns such as momentum."],
      ["d", "They guarantee a profit as long as the stop sits below the most recent swing low", "No rule guarantees a profit."],
    ], "c"), "Under a random walk, simple stop-loss rules lower expected return; with momentum they can add value. A stop is first a risk control."),

    // strat-regimes
    q("stratq-rg-1", "strat-regimes", "calculation", numeric("Over 20 bars a price moved from 200 to 212, and the absolute bar-to-bar moves added up to 30. What is the efficiency ratio, as a percentage?", "%", 40, 0.5, "12 ÷ 30 = 0.4 = 40%."), "ER = net change ÷ total travel = 12 ÷ 30 = 0.4, or 40%."),
    q("stratq-rg-2", "strat-regimes", "knowledge", tf("Regime filters built from past bars can usually spot a new regime before it starts.", false, "False. They confirm a regime only after it has started."), "Any filter computed from past bars needs some of those bars to change its reading, so it lags turns."),
    q("stratq-rg-3", "strat-regimes", "knowledge", single("When should a filter's setting be chosen?", [
      ["a", "After seeing which setting gave the best backtest", "That fits the filter to the past."],
      ["b", "Each morning, depending on how the market looks", "That is discretion."],
      ["c", "After every losing streak", "That changes rules mid-run."],
      ["d", "Before testing, with a reason", "Right. Then the test is fair."],
    ], "d"), "A filter is a rule like any other: fix its setting with a reason before testing, and count it among the variants tried."),
    q("stratq-rg-4", "strat-regimes", "knowledge", tf("Adding more filters always makes a strategy safer.", false, "False. Each filter adds settings that can fit noise."), "More filters usually make the backtest fit the past more closely, not the strategy safer. Keep one or two with clear reasons."),

    // strat-curve-fitting
    q("stratq-cf-1", "strat-curve-fitting", "knowledge", single("In the overfitting simulation on pure noise, what happened as more variants were tried?", [
      ["a", "Both in-sample and out-of-sample Sharpe rose", "Only the in-sample best rose."],
      ["b", "Nothing changed", "The in-sample best rose."],
      ["c", "The best in-sample Sharpe rose; out-of-sample stayed near zero", "Right. There was nothing real to find."],
      ["d", "Out-of-sample rose while in-sample fell, which shows that more searching is always helpful", "The opposite of the result."],
    ], "c"), "On noise the best in-sample result is pure luck, and luck grows with the number of tries. Out of sample it does not repeat."),
    q("stratq-cf-2", "strat-curve-fitting", "knowledge", tf("Out-of-sample data that has been used to change the rules is no longer out-of-sample.", true, "True. It has then helped tune the strategy."), "Once held-out data influences the rules, it is in-sample. It must be used once, after the rules are fixed."),
    q("stratq-cf-3", "strat-curve-fitting", "calculation", numeric("You test 5 lookbacks, 4 stops and 3 targets, every combination, plus the same set again with a filter on. How many variants is that?", "variants", 120, 1, "5 × 4 × 3 × 2 = 120."), "Every combination counts: 5 × 4 × 3 = 60 without the filter and 60 with it, 120 in all."),
    q("stratq-cf-4", "strat-curve-fitting", "knowledge", single("What did Bajgrowicz and Scaillet (2012) find about technical rules on the Dow?", [
      ["a", "The best rules could not be picked in advance, and low costs offset them", "Right. That is what they reported."],
      ["b", "The best rules could be picked in advance", "They found the opposite."],
      ["c", "Costs did not matter", "Even low costs offset the rules' performance."],
      ["d", "Every rule beat buy-and-hold in every decade between 1897 and 2011 without exception", "Not their finding."],
    ], "a"), "Controlling for false discoveries, investors could not have selected the best rules in advance, and even low transaction costs offset their performance."),

    // strat-spec
    q("stratq-sp-1", "strat-spec", "knowledge", single("When should a strategy spec be written?", [
      ["a", "After a month of live trading", "Then it records what happened, not the plan."],
      ["b", "Only if the strategy fails", "Too late to help."],
      ["c", "Before any live trading", "Right. It fixes the plan in advance."],
      ["d", "Never, because a good trader keeps all the rules in their head and adapts them each day", "Rules in memory drift."],
    ], "c"), "The spec fixes the hypothesis, rules, costs, tests and kill criteria before money is at risk, so later results can be judged against it."),
    q("stratq-sp-2", "strat-spec", "knowledge", tf("Results from two versions of a strategy should be added together as one record.", false, "False. Each version is a different strategy."), "A change to the rules creates a new version. Mixing their results hides which rules produced what."),
    q("stratq-sp-3", "strat-spec", "knowledge", multi("Which belong in a strategy spec? Choose all that apply.", [
      ["a", "The number of variants tried", "Right. It shows how much luck may be in the backtest."],
      ["b", "Kill criteria", "Right. Decided before trading."],
      ["c", "Cost assumptions", "Right. Costs change results."],
      ["d", "How confident you feel today", "A feeling, not a rule."],
    ], ["a", "b", "c"]), "A spec records the rules, costs, tests (with the variant count) and kill criteria, not moods."),
    q("stratq-sp-4", "strat-spec", "knowledge", single("A review shows several stops were widened after entry, against the spec. What can you conclude?", [
      ["a", "The strategy has stopped working", "It was not followed, so it was not tested live."],
      ["b", "Nothing at all", "It shows a gap between rules and actions."],
      ["c", "The spec should be changed to allow wider stops whenever the trade is going against you", "That rewrites rules to fit behaviour."],
      ["d", "Live results are not the tested strategy", "Right. Fix the execution before judging the rules."],
    ], "d"), "A spec separates two questions: is the strategy failing, or am I not following it? Here it is the second."),

    // strat-forward
    q("stratq-fw-1", "strat-forward", "calculation", numeric("A strategy's edge is +0.15R a trade with a spread of 1.2R. Using n ≈ (2 × sd ÷ mean)², about how many trades are needed to tell it from zero?", "trades", 256, 5, "2 × 1.2 ÷ 0.15 = 16, and 16² = 256."), "n ≈ (2 × 1.2 ÷ 0.15)² = 16² = 256 trades."),
    q("stratq-fw-2", "strat-forward", "knowledge", single("If the edge per trade halves, roughly how many trades does a forward test need?", [
      ["a", "Twice as many", "The relationship is squared."],
      ["b", "Half as many", "Smaller edges need more."],
      ["c", "Four times as many", "Right. n grows with (sd ÷ mean)²."],
      ["d", "The same number, since the spread of results per trade has not changed at all", "The edge sits in the denominator."],
    ], "c"), "Because n ≈ (2 × sd ÷ mean)², halving the mean multiplies the trades needed by four."),
    q("stratq-fw-3", "strat-forward", "knowledge", tf("Paper trading can show whether rules can be followed, but it may not show real fills or real emotions.", true, "True. Small live size tests those."), "Paper fills are ideal and paper losses do not hurt, which is why the next stage is small live size."),
    q("stratq-fw-4", "strat-forward", "knowledge", single("What makes a forward test fairer than a backtest?", [
      ["a", "It uses data that did not exist when the rules were fixed", "Right. Nothing could have been tuned to it."],
      ["b", "It uses more data", "It usually uses less."],
      ["c", "It is run by a broker", "Not the point."],
      ["d", "It cannot lose money, because paper results are always a realistic guide to live trading", "Paper results are often too kind."],
    ], "a"), "A forward test runs fixed rules on new data, so it cannot have been fitted to it."),

    // strat-kill
    q("stratq-ki-1", "strat-kill", "knowledge", single("When should kill criteria be set?", [
      ["a", "During the first drawdown, when you know how it feels", "Stress moves the line."],
      ["b", "After a year of trading", "Too late to guide early decisions."],
      ["c", "Never: judge each drawdown on its merits", "Then the decision is made under stress."],
      ["d", "Before the first trade", "Right. They are set while you are calm."],
    ], "d"), "Kill criteria work because they are decided in advance, from the tested strategy, and applied without renegotiation."),
    q("stratq-ki-2", "strat-kill", "calculation", numeric("Tested expectancy is +0.2R with a spread of 1R. After 100 live trades the average is 0R. What is the shortfall z-score, (live − tested) ÷ (sd ÷ √n)?", "z-score", -2, 0.05, "(0 − 0.2) ÷ (1 ÷ 10) = −0.2 ÷ 0.1 = −2."), "The standard error is 1 ÷ √100 = 0.1R, so z = (0 − 0.2) ÷ 0.1 = −2: unusual, but on its own not conclusive."),
    q("stratq-ki-3", "strat-kill", "knowledge", tf("A long losing streak inside the tested range is, on its own, a reason to stop a strategy.", false, "False. Long losing runs are common even with an edge."), "Losing streaks happen often with a real edge. Compare with the tested range and the written kill rules, not with how it feels."),
    q("stratq-ki-4", "strat-kill", "knowledge", single("Why is the backtest's single worst drawdown a poor kill line?", [
      ["a", "It is always too large", "It is usually too small."],
      ["b", "One path's worst understates the range", "Right. Other runs of the same edge go deeper."],
      ["c", "It includes trading costs", "Not the problem."],
      ["d", "Backtests never have drawdowns, because every trade in them is already known in advance", "Every backtest has drawdowns."],
    ], "b"), "One historical path is one draw. Simulating many runs of the tested figures shows how deep normal drawdowns can go."),

    // strat-diversify
    q("stratq-dv-1", "strat-diversify", "calculation", numeric("With average correlation 0.25 between strategies that each have a Sharpe of 0.6, what is the ceiling on the combined Sharpe, s ÷ √ρ?", "Sharpe", 1.2, 0.02, "0.6 ÷ √0.25 = 0.6 ÷ 0.5 = 1.2."), "The ceiling is s ÷ √ρ = 0.6 ÷ 0.5 = 1.2, however many strategies are added."),
    q("stratq-dv-2", "strat-diversify", "knowledge", single("What most decides how much a second strategy helps?", [
      ["a", "Its name", "Names do not diversify."],
      ["b", "How many indicators it uses", "Not what matters."],
      ["c", "Its correlation with the first", "Right. Lower correlation means more swings cancel."],
      ["d", "Whether it runs on the same platform and through the same broker as the first one", "Unrelated to diversification."],
    ], "c"), "The combined risk depends on how closely the strategies' returns move together."),
    q("stratq-dv-3", "strat-diversify", "knowledge", tf("Correlations between strategies can rise in a crisis, just when diversification is needed.", true, "True. Many positions are cut at once."), "Correlations measured in calm periods may not hold in a sell-off; test the mix in stressed periods too."),
    q("stratq-dv-4", "strat-diversify", "knowledge", single("Trend rules on three closely linked stock indices are best counted as…", [
      ["a", "Close to one strategy", "Right. Their returns move together closely."],
      ["b", "Three well-diversified strategies", "They share the same main risk."],
      ["c", "Zero strategies", "They are one strategy."],
      ["d", "Six strategies, because long and short trades on each index count separately", "Not how diversification is counted."],
    ], "a"), "Count strategies by their main risk. Three trend rules on closely linked indices are close to one risk."),

    // strat-decay
    q("stratq-dc-1", "strat-decay", "knowledge", single("McLean and Pontiff (2016) found that after publication, predictor returns were about…", [
      ["a", "Unchanged", "Returns fell after publication."],
      ["b", "Twice as large, as more investors used the research", "The opposite."],
      ["c", "Gone", "Lower, not zero on average."],
      ["d", "58% lower", "Right, across 97 predictors."],
    ], "d"), "Across 97 predictors, returns were about 26% lower out of sample and about 58% lower after publication."),
    q("stratq-dc-2", "strat-decay", "calculation", numeric("An edge starts at 0.6R a trade and halves every 100 trades. What is it after 300 trades, in R?", "R", 0.075, 0.002, "0.6 → 0.3 → 0.15 → 0.075."), "Three halvings: 0.6 × 0.5³ = 0.075R per trade."),
    q("stratq-dc-3", "strat-decay", "knowledge", tf("Jacobs and Müller (2020) found a reliable post-publication decline in every one of the 39 markets they studied.", false, "False. The US was the only market with a reliable decline."), "Their study of 241 anomalies in 39 markets found a reliable post-publication fall only in the US."),
    q("stratq-dc-4", "strat-decay", "knowledge", single("Why can total profit since launch hide decay?", [
      ["a", "Early gains outweigh recent weak results", "Right. Review the rolling recent average."],
      ["b", "Total profit counts only winners", "It counts all trades."],
      ["c", "It cannot", "It can, as the lesson showed."],
      ["d", "Profit since launch is always recalculated by the broker using only the most recent trades", "Not how it works."],
    ], "a"), "A strong start can keep total profit high long after the edge is gone. A rolling average of recent trades shows decay sooner."),

    // strat-applied
    q("stratq-app-1", "strat-applied", "applied", scenario(
      "A trader's spec says: stop the strategy at a 30R drawdown. The strategy is now at 31R, but the trader has a feeling it is about to recover.",
      "What is the soundest decision?",
      [
        ["a", "Keep trading: the feeling is strong", "Overrides the written kill rule.", "unsound"],
        ["b", "Raise the kill line to 40R and continue", "Renegotiates the rule under stress.", "unsound"],
        ["c", "Stop as the spec says, then review whether the edge is gone", "Sound: the rule set in advance decides.", "sound"],
        ["d", "Halve size and continue for another month to see what happens before deciding", "Softer, but still ignores the stop rule.", "partial"],
      ],
    ), "The kill line was set while calm, from the tested range. A feeling of recovery is exactly what it protects against."),
    q("stratq-app-2", "strat-applied", "applied", scenario(
      "After 30 paper trades a new strategy is up 8R. The spec says 300 trades at small live size before full size.",
      "What is the soundest decision?",
      [
        ["a", "Go to full size now: 8R is convincing", "30 trades rarely confirm a small edge.", "unsound"],
        ["b", "Move to small live size and keep recording, as the spec says", "Sound: follows the staged plan.", "sound"],
        ["c", "Skip small size and go to half size to save time", "Shortcuts the plan.", "partial"],
        ["d", "Change the rules to make the good start even better", "Restarts the test.", "unsound"],
      ],
    ), "A good start is consistent with an edge and with luck. The staged plan exists because 30 trades cannot tell them apart."),
    q("stratq-app-3", "strat-applied", "applied", scenario(
      "A friend shares a strategy with an extremely smooth backtest. They say they tried \"a lot of settings\" and the rules include \"enter when the setup looks clean\".",
      "What is the soundest view?",
      [
        ["a", "Trade it: a smooth backtest is strong evidence", "Smoothness is what fitting produces.", "unsound"],
        ["b", "Ask for exact rules and the variant count, then test it out of sample", "Sound: closes the gaps and checks the search.", "sound"],
        ["c", "Trade it at small size while you think about it", "Smaller, but still untested rules.", "partial"],
        ["d", "Add a few more filters to make it even smoother before going live", "Adds more fitting.", "unsound"],
      ],
    ), "A vague rule and an unknown number of tries mean the backtest cannot be judged. Exact rules and a fair out-of-sample test come first."),
    q("stratq-app-4", "strat-applied", "applied", scenario(
      "A trend strategy has had a sideways year. Its drawdown is 18R; the tested 95th percentile is 24R and the kill line is 30R. The trader wants to add a filter that would have avoided this year.",
      "What is the soundest decision?",
      [
        ["a", "Keep trading as written, and study the filter idea as a separate new version", "Sound: inside the range, and changes get their own test.", "sound"],
        ["b", "Add the filter now and keep trading", "Fits the rules to the last year.", "unsound"],
        ["c", "Stop the strategy because the year was bad", "The drawdown is inside the tested range.", "unsound"],
        ["d", "Add the filter but only for the next few months, and then decide whether to keep it", "Still a mid-run change fitted to recent data.", "partial"],
      ],
    ), "A sideways year is the known weak regime for trend rules, and 18R is inside the tested range. A new filter is a new version and needs its own test."),
  ],
};

const MORE_REMEDIATION: Record<string, ConceptRemediation> = {
  "strat-anatomy": {
    misconception: "Some traders write entries in detail and leave exits and size to the moment. Those are parts of the strategy too, and often the parts that decide the result.",
    altExplanation: "A strategy is complete only when every trade it takes, and its size, follows from written rules. If you cannot say from the rules alone how a trade ends and how much it risks, part of the strategy is still missing.",
    altExample: "Two traders use the same entry signal. One exits on a 20-bar low with 0.5% risk; the other exits by feel with growing size. Their results differ completely.",
    practice: tf("A strategy is complete once its entry rule is exact.", false, "False. Exits, stop, sizing, market and filters are parts too."),
  },
  "strat-edges": {
    misconception: "A plausible story can feel like proof of an edge. A reason makes an edge possible; only fair testing on data can show it is real and large enough to beat costs.",
    altExplanation: "Use the edge source as a filter, not a verdict. Ideas without a source go in the noise pile. Ideas with a source still need tests, and the source tells you what change would end them.",
    altExample: "An idea to fade overreactions to company news has a behavioural reason, but a test may show the effect is too small to cover a retail trader's spread.",
    practice: tf("Having a clear economic reason proves that a strategy has an edge.", false, "False. A reason makes it plausible; data must test it."),
  },
  "strat-testability": {
    misconception: "Some think an exact rule must be rigid and worse than judgement. Exactness only means the flexibility is written down and tested, not invented on the day.",
    altExplanation: "If you want flexibility, write it as a rule: for example, a wider stop when ATR is above a level. Now it can be tested. Judgement that cannot be written cannot be tested, and should be sized with that in mind.",
    altExample: "\"Take profits when the move looks tired\" becomes \"exit at the next open after two closes below the 10-bar average\". Both are flexible; only the second can be tested.",
    practice: multi("Which rules have a discretion gap? Choose all that apply.", [
      ["a", "Exit when the trade stops working", "Right. No price or time is given."],
      ["b", "Risk 1% of equity per trade", "A fixed rule, no gap."],
      ["c", "Avoid trading around bad news", "Right. Which news, and for how long?"],
      ["d", "Stop order 1.5 × ATR(20) below entry", "Exact, no gap."],
    ], ["a", "c"]),
  },
  "strat-archetypes": {
    misconception: "A bad year for an archetype in its weak regime can look like proof the strategy is broken. It may simply be the regime it was always expected to struggle in.",
    altExplanation: "Before judging a drawdown, name the regime it happened in. If it is the archetype's known weak regime and the loss is inside the tested range, that is expected. A loss outside the range, or in a regime that should suit it, is the warning sign.",
    altExample: "A mean-reversion rule loses steadily during a month-long one-way rally. That is its weak regime; the question is whether the loss fits the tested range.",
    practice: tf("Each strategy archetype has market conditions in which it tends to lose.", true, "True. Each bets on a behaviour that is not always present."),
  },
  "strat-exits": {
    misconception: "Traders often believe one exit is best everywhere. In the simulation, the trailing exit won in trends and lost in ranges, while the quick target did the reverse.",
    altExplanation: "An exit is a bet on how price behaves after entry. A trailing stop bets on long moves; a quick target bets on short swings. Test exits in more than one regime, and with random entries, to see what the exit itself contributes.",
    altExample: "On the same random entries, a trailing exit gains in a steady uptrend and loses in a choppy range, while a quick target does the opposite.",
    practice: single("Why test an exit with random entries?", [
      ["a", "Random entries are the best entries for live trading", "They are a test tool."],
      ["b", "To see what the exit adds without an entry edge", "Right. Any result then comes from the exit, regime or luck."],
      ["c", "To save time", "Not the reason."],
      ["d", "Because random entries cannot lose money in any regime as long as the exit is good", "They can lose, especially in random markets."],
    ], "b"),
  },
  "strat-regimes": {
    misconception: "A filter that would have avoided last year's losses looks like an obvious improvement. Chosen after seeing those losses, it is fitted to them.",
    altExplanation: "Treat every filter idea as a new version: write the reason, fix the setting, and test it on data it was not chosen from. Count its settings among the variants tried.",
    altExample: "After a bad March, a trader adds a rule to skip trading in March. The backtest improves, but nothing suggests March will be bad next year.",
    practice: tf("A filter chosen after seeing which months lost money is likely to be fitted to those months.", true, "True. It was built from the very data it improves."),
  },
  "strat-curve-fitting": {
    misconception: "A smooth equity line can look like the mark of a robust strategy. Smooth in-sample results are also exactly what heavy fitting produces.",
    altExplanation: "Look for signs a result is not tuned to noise: few parameters, round settings chosen for a reason, similar results at nearby settings, and a held-out period that agrees. Bailey and colleagues showed overfitting grows with the number of configurations tried.",
    altExample: "A rule works best with a 37-bar average and poorly at 35 or 40. That narrow peak suggests the 37 fits noise in that sample.",
    practice: single("Which sign best suggests a rule is not fitted to noise?", [
      ["a", "It works only at one exact setting", "A narrow peak suggests fitting."],
      ["b", "Its backtest equity line is perfectly smooth over the whole sample with no losing months", "Smoothness can come from fitting."],
      ["c", "It works across nearby settings and on held-out data", "Right. Both are hard to get by luck."],
      ["d", "It has many filters", "More filters mean more fitting."],
    ], "c"),
  },
  "strat-spec": {
    misconception: "Some traders edit their written rules quietly as they go. Without versions, results from different rules get mixed and nothing can be judged.",
    altExplanation: "Change the spec only between trades, with a new version number, a date and a reason. A changed number is a minor version; a changed idea is a new major version. Keep each version's results apart.",
    altExample: "A trader moves from version 1.0 to 1.1 when the stop changes from 2 to 2.5 × ATR, and starts a fresh results log for 1.1.",
    practice: tf("Any change to a strategy's rules should get a new version number and date in the spec.", true, "True. Then results from each version can be judged separately."),
  },
  "strat-forward": {
    misconception: "Paper results can feel like real results. Paper fills are ideal and losses do not hurt, so live results are often worse.",
    altExplanation: "Stage the test: paper to check the rules can be followed, small live size to test real fills and feelings, then full size. Write the pass rule for each stage, and the length in trades, before starting.",
    altExample: "A trader passes a paper stage without problems, then finds at small live size that limit orders often go unfilled. The spec is updated to version 1.1.",
    practice: single("What is the main reason for a small-live-size stage after paper trading?", [
      ["a", "To test real fills and real emotions cheaply", "Right. Paper cannot test either."],
      ["b", "To make more money faster than paper trading would allow", "Not the purpose."],
      ["c", "Brokers require it", "They do not."],
      ["d", "To change the rules", "Rules stay fixed during a test."],
    ], "a"),
  },
  "strat-kill": {
    misconception: "Some traders treat any big drawdown as proof a strategy is broken. Many sound strategies have large drawdowns, and quitting at the normal low point locks in the worst part.",
    altExplanation: "Simulate many runs of the tested figures to see the drawdown range. A drawdown inside the 95th percentile is common; one beyond the 99th is rare if the edge is intact. Set the reduce and stop levels from that range, plus a hard limit.",
    altExample: "A strategy's simulated range shows a typical worst drawdown near 12R over 200 trades. A live drawdown of 14R is uncomfortable but ordinary.",
    practice: numeric("Tested expectancy is +0.3R with a spread of 1.5R. After 225 live trades the average is 0R. What is the shortfall z-score?", "z-score", -3, 0.05, "Standard error = 1.5 ÷ √225 = 0.1. z = (0 − 0.3) ÷ 0.1 = −3."),
  },
  "strat-diversify": {
    misconception: "Adding any new strategy can seem to help diversification. A strategy with no edge adds costs, and one with the same main risk adds little.",
    altExplanation: "Each added strategy must pass its own tests and carry a different main risk. Then the combined Sharpe can rise, up to a ceiling set by correlation. Check correlations in stressed periods as well as calm ones.",
    altExample: "A trader running a stock-index trend rule adds a bond trend rule and a short-term mean-reversion rule, each tested separately, rather than a fourth stock-index trend rule.",
    practice: tf("Combining strategies always raises the combined Sharpe ratio, whatever their correlation.", false, "False. Highly correlated or edgeless strategies add little or nothing."),
  },
  "strat-decay": {
    misconception: "A strategy from a book or a popular post can seem proven because of its long history. Known edges tend to shrink as more traders use them.",
    altExplanation: "Decay is slow and noisy. Compare a rolling average of recent trades with the tested expectancy and its standard error, on a fixed review schedule, and retire by a rule written in the spec.",
    altExample: "A once-popular pattern averages +0.3R in its published history; a trader's last 200 trades with it average close to zero.",
    practice: single("What is the best way to spot decay early?", [
      ["a", "Check total profit since launch", "Early gains hide recent decay."],
      ["b", "Compare a rolling recent average with the tested figure", "Right, at set review dates."],
      ["c", "Wait for a feeling that something is wrong", "Feelings are unreliable here."],
      ["d", "Count only the winning trades in the last month and compare them with the backtest's best month", "Ignores losses."],
    ], "b"),
  },
  "strat-applied": {
    misconception: "A small change to the rules after a bad patch can feel like learning. Made mid-run and fitted to recent results, it is curve-fitting in real time.",
    altExplanation: "Separate running the strategy from researching it. Keep running the current version by its spec and kill rules. Put any new idea through the same path: exact rules, a variant count, a held-out test and a forward test.",
    altExample: "After three losing weeks, a trader writes a new exit idea into a research log, tests it on held-out data a month later, and adopts it only as version 2.0.",
    practice: scenario(
      "Two strategies a trader runs are both down. One is at 12R, inside its tested range; the other has passed its 25R kill line.",
      "What is the soundest decision?",
      [
        ["a", "Stop both to be safe", "Stops a strategy that is inside its range.", "partial"],
        ["b", "Keep both running and wait for a recovery", "Ignores a kill line that was hit.", "unsound"],
        ["c", "Stop the one past its kill line and keep the other as written", "Sound: each follows its own written rule.", "sound"],
        ["d", "Move the money from the stopped strategy into the other one at double size", "Raises risk on impulse.", "unsound"],
      ],
    ),
  },
};

export const STRATEGY_ASSESSMENT: TrackAssessment = {
  ...BASE,
  concepts: BASE.concepts.map((c) => ({ ...c, moreRemediation: MORE_REMEDIATION[c.id] ? [MORE_REMEDIATION[c.id]] : [] })),
};
