import type { AssessmentQuestion, ChoiceOption, ConceptRemediation, GradedItem, ScenarioItem, TrackAssessment } from "../types";

/*
  Track 9 assessment: Trading Psychology.
  Outcome bias, revenge trading and the daily loss stop are safety-critical:
  getting them wrong is how a trader learns the wrong lesson from luck, or
  turns one bad day into an account-ending one. Contested findings (the size
  of loss aversion, ego depletion, the hot hand) are asked about as contested.
*/

const T = "trading-psychology";

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
    "Questions on every idea from the twelve lessons: loss aversion, the disposition effect, overconfidence, hindsight, confirmation and recency bias, streaks and variance, outcome bias, FOMO and revenge trading, the daily loss stop, tilt, stress and sleep, checklists, journals, realistic expectations and the trading plan, with calculations and applied scenarios. You need 90% or more, a sound decision in the scenario, and every safety-critical question right: outcome bias, revenge trading and the daily loss stop.",
  concepts: [
    {
      id: "psy-loss-aversion",
      title: "Loss aversion and prospect theory",
      lessonIds: ["psy-prospect-theory"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Many people quote \"losses hurt 2.25 times more than gains\" as a law of nature. It is one small study's median estimate, and the size of loss aversion is debated.",
        altExplanation: "Prospect theory says we judge results from a reference point, with a curve that is steeper for losses. The broad patterns replicate in many countries, but how much steeper varies by person, task and study, and some researchers argue losses do not generally loom larger.",
        altExample: "Two traders face the same 50/50 bet: win 120 or lose 100 points. One happily accepts, the other refuses. Both behaviours fit prospect theory with different loss aversion settings.",
        practice: single("What does prospect theory say outcomes are judged against?", [
          ["a", "Final wealth after the outcome, measured in the same currency", "That is expected utility theory's view."],
          ["b", "A reference point, such as the entry price", "Right. Results are coded as gains or losses from it."],
          ["c", "The market index", "Not part of the model."],
          ["d", "Nothing; only the probabilities matter", "Outcomes matter, judged from a reference point."],
        ], "b"),
      },
      flashcard: { front: "Prospect theory", back: "Gains and losses from a reference point; steeper for losses; patterns replicate, size of loss aversion debated." },
    },
    {
      id: "psy-disposition",
      title: "The disposition effect",
      lessonIds: ["psy-disposition"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Selling a winner to \"lock in profit\" feels prudent, and holding a loser \"until it comes back\" feels patient. Together they are the disposition effect.",
        altExplanation: "The question for any open position is the same whether it is up or down: would I enter this trade now, at this price, under my plan? The sign of the open profit is not information about the future, so it should not decide the exit.",
        altExample: "A trader closes three winning positions on Friday because they are green and keeps four losers because selling would \"make the loss real\". On Monday the portfolio holds only the losers.",
        practice: numeric("On the days they sold, a trader realised 4 gains and left 12 gains open. What is their PGR, in percent?", "%", 25, 0.5, "PGR = 4 / (4 + 12) = 0.25 = 25%."),
      },
      flashcard: { front: "Disposition effect", back: "Selling winners sooner than losers. PGR = realised gains / all gains; PLR the same for losses." },
    },
    {
      id: "psy-overtrading",
      title: "Overconfidence and overtrading",
      lessonIds: ["psy-overconfidence"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "More trades feel like more chances to make money. But every trade has a cost that is certain, while any skill benefit is uncertain or zero.",
        altExplanation: "Think of each trade as needing to pay its own entry fee. A trader who feels skilled trades more, so pays more fees. If the extra trades are not better than average, the fees alone lower the result.",
        altExample: "Two traders with the same 7% a year before costs pay 0.4% a round trip. One turns over 50% a year and keeps 6.8%; the other turns over 1,200% and keeps 2.2%.",
        practice: numeric("A trader makes 12% before costs, turns the account over 300% a year and pays 0.5% per round trip. What is the return after costs, in percent?", "%", 10.5, 0.1, "Cost = 3 × 0.5% = 1.5%. 12% − 1.5% = 10.5%."),
      },
      flashcard: { front: "Overtrading", back: "Return after costs ≈ before costs − (turnover/100%) × round-trip cost. Heaviest-trading households earned least." },
    },
    {
      id: "psy-biases",
      title: "Hindsight, confirmation and recency bias",
      lessonIds: ["psy-biases"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "It is easy to believe that knowing a bias's name protects you from it. In studies, people often show the bias even after being told about it.",
        altExplanation: "Each bias bends a different step. Hindsight bends memory of what you expected; confirmation bends which evidence you look at; recency bends how much weight recent results get. A written record made before the outcome is the common fix.",
        altExample: "Before an earnings release, a trader writes \"60% sure it beats\". It misses. A week later they remember being doubtful all along; the note says otherwise.",
        practice: single("A trader reads only bullish posts about a share they own. Which bias is this?", [
          ["a", "Recency bias, because the posts are recent", "Recency is about overweighting the latest results."],
          ["b", "Hindsight bias", "Hindsight is about outcomes seeming predictable afterwards."],
          ["c", "Confirmation bias", "Right. Seeking evidence that agrees with your view."],
          ["d", "Loss aversion", "Not about losses here."],
        ], "c"),
      },
      flashcard: { front: "Three biases", back: "Hindsight: \"I knew it\". Confirmation: seek agreement. Recency: overweight the latest. Fix: write it down first." },
    },
    {
      id: "psy-randomness",
      title: "Streaks, the gambler's fallacy and the hot hand",
      lessonIds: ["psy-randomness"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "After a run of losses, a win can feel \"due\". For independent trades the odds of the next trade do not depend on the last ones.",
        altExplanation: "A coin, or an independent trade, has no memory. Long runs are simply common in random sequences, so they do not need correcting. The hot-hand debate shows even experts misjudge streaks: the classic test was itself biased.",
        altExample: "A roulette wheel shows red eight times running and a crowd bets on black. The wheel's next spin has the same odds it always had.",
        practice: tf("For independent 50/50 trades, a run of losses makes the next trade more likely to win.", false, "False. Independent trades have no memory; the next one is still 50/50."),
      },
      flashcard: { front: "Gambler's fallacy vs hot hand", back: "One expects reversal, one continuation. Independent events have no memory. The hot-hand fallacy itself is contested." },
    },
    {
      id: "psy-variance",
      title: "Variance and losing streaks with an edge",
      lessonIds: ["psy-variance"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "A long losing run feels like proof a method is broken. With a real edge, long losing runs are still expected over many trades.",
        altExplanation: "Expectancy is the average per trade; variance is how far results wander around it. Over a few dozen trades the wandering usually matters more than the average. Size so the worst likely run is survivable, and judge the method on a large sample.",
        altExample: "A method that wins 55% of trades with 1R wins and 1R losses has a small edge, yet over a year a run of six or more losses is quite likely.",
        practice: numeric("A method wins 50% of trades, its average win is 1.5R and a loss is 1R. What is its expectancy per trade, in R?", "R", 0.25, 0.01, "0.5 × 1.5 − 0.5 × 1 = 0.25R."),
      },
      flashcard: { front: "Variance", back: "Expectancy = win rate × avg win − loss rate × 1R. Long losing runs are normal with an edge; size for them." },
    },
    {
      id: "psy-outcome-bias",
      title: "Outcome bias: judging decisions, not results (the risk of learning the wrong lesson)",
      lessonIds: ["psy-outcome-bias"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "A trade that made money feels like a good decision. But a single result is mostly luck, so judging by it rewards rule breaks that happened to pay.",
        altExplanation: "Separate the two questions. Was the decision sound given the plan and what was known? What happened? Score the first before you look at the second. A rule break that won is still a rule break, and the one most likely to be repeated with more size.",
        altExample: "A driver runs a red light and arrives early without an accident. Arriving early does not make running the light a good decision.",
        practice: single("A trader ignored their stop and the trade recovered for a profit. How should it be scored?", [
          ["a", "A good trade, since it made money", "That is outcome bias."],
          ["b", "A poor decision with a good outcome", "Right. Log it as a mistake."],
          ["c", "Proof the stop rule is wrong and should be removed from the plan", "One lucky trade says nothing about the rule."],
          ["d", "Not worth recording", "Every trade should be logged."],
        ], "b"),
      },
      flashcard: { front: "Outcome bias", back: "Judge the decision (process), not the result. Poor decision + good outcome = dumb luck, the dangerous cell." },
    },
    {
      id: "psy-revenge",
      title: "Revenge trading and tilt risk",
      lessonIds: ["psy-fomo-revenge", "psy-tilt-stress"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "Doubling up after a loss can seem like a quick way back to even, and it often works. But it wins small and often, and loses rarely and hugely.",
        altExplanation: "After a loss your reference point is the starting balance, and getting back to it feels urgent, which favours risk. Doubling after each loss makes the total risked grow as 2^k − 1, so a run of losses that would be normal at fixed size becomes ruinous.",
        altExample: "Starting at 1R and doubling after each loss, six losses in a row cost 63R before any win. At fixed 1R, the same six losses cost 6R.",
        practice: numeric("Starting at 1R and doubling size after each loss, how many R are lost in total after four losses in a row?", "R", 15, 0.1, "1 + 2 + 4 + 8 = 15R."),
      },
      flashcard: { front: "Revenge trading", back: "Bigger size to win back a loss. Total after k doubled losses = 2^k − 1. Wins often, loses rarely and hugely." },
    },
    {
      id: "psy-daily-stop",
      title: "The daily loss stop and risk limits",
      lessonIds: ["psy-fomo-revenge"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "A daily loss stop can feel like giving up, or like something to move on an unusual day. A stop you can move in the moment is not a stop.",
        altExplanation: "The daily loss stop is set on a calm day so that it decides for you on a bad one. When the day's loss reaches it, you close or protect positions, close the platform and stop until the next session. It caps the worst day, so one session cannot do lasting damage.",
        altExample: "A trader's plan says stop at −2R for the day. At −2R by midday, they close the platform and log the day, and the week's limit still has room left.",
        practice: single("You reach your daily loss stop with an hour of the session left. What does the rule say?", [
          ["a", "One more trade at half size", "Any further trade breaks the rule."],
          ["b", "Raise the limit for today only, because the market is unusual", "A stop you move is not a stop."],
          ["c", "Wait thirty minutes, then trade again if you feel calm", "The stop is for the day, not for half an hour."],
          ["d", "Stop trading until the next session", "Right. That is what the lesson describes."],
        ], "d"),
      },
      flashcard: { front: "Daily loss stop", back: "Set in advance; when hit, stop for the day, close the platform, journal. Never move it in the moment." },
    },
    {
      id: "psy-tilt",
      title: "Tilt, stress, sleep and contested findings",
      lessonIds: ["psy-tilt-stress"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Popular advice treats self-control as a fuel tank that empties (ego depletion). Large preregistered replications found little or no such effect.",
        altExplanation: "Rather than planning around willpower running out, plan around rules that decide for you. Tilt, stress and short sleep are when judgement is weakest, so the if-then rules you wrote on a calm day do the work.",
        altExample: "A trader writes on Sunday: \"If I sleep under six hours, I trade half size. If I feel angry at the market, I leave the screen for 30 minutes.\"",
        practice: tf("The 2016 multilab replication found a large, clear ego-depletion effect.", false, "False. The effect was close to zero, d = 0.04."),
      },
      flashcard: { front: "Tilt and sleep", back: "Tilt: emotion overrides rules. Sleep loss hurts flexible decisions. Ego depletion is contested; use rules, not willpower." },
    },
    {
      id: "psy-process",
      title: "Checklists, journals and the trading plan",
      lessonIds: ["psy-checklists-journal", "psy-trading-plan"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "A checklist or plan can feel like paperwork that slows you down. Its job is to block trades that break your rules before you make them.",
        altExplanation: "Every item should be a fact you can answer yes or no. If any answer is no, there is no trade. The journal records each decision before its result is known, and the weekly review scores the process before looking at P&L.",
        altExample: "A pilot reads the same short checklist before every take-off, however experienced. A trader can do the same: six yes/no checks before each order.",
        practice: single("Which is a checkable plan rule?", [
          ["a", "Be careful with risk", "Not checkable."],
          ["b", "Stop for the day at −3R", "Right. Anyone can check it."],
          ["c", "Only trade when you feel confident about the market's direction", "Feelings cannot be checked."],
          ["d", "Try to win more than you lose", "Not a rule."],
        ], "b"),
      },
      flashcard: { front: "Process tools", back: "Short yes/no checklist; journal every trade; review process before P&L; change rules only on large samples." },
    },
    {
      id: "psy-expectations",
      title: "Realistic expectations for retail traders",
      lessonIds: ["psy-expectations"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Success stories make profitable trading look common. The research and regulators' figures show most retail traders lose, and visible winners include many who were lucky.",
        altExplanation: "Start from the base rate: most retail CFD accounts lost money, and persistent day-trading skill was rare in the studies. Among many traders with no edge, luck alone produces some with impressive records, so a short record cannot tell luck from skill.",
        altExample: "Out of 2,048 coin-flip traders with no skill, about 64 would win five trades in a row and could look like experts.",
        practice: numeric("512 traders with no edge each take four 50/50 trades. About how many win all four by luck?", "traders", 32, 1, "512 × 0.5^4 = 512 / 16 = 32."),
      },
      flashcard: { front: "Base rate", back: "ESMA 2018: 74–89% of retail CFD accounts lost. Taiwan: <1% of day traders predictably profitable. Luck looks like skill." },
    },
    {
      id: "psy-applied",
      title: "Applying trading psychology to live decisions",
      lessonIds: ["psy-outcome-bias", "psy-fomo-revenge", "psy-tilt-stress", "psy-trading-plan"],
      critical: true,
      safetyCritical: false,
      applied: true,
      remediation: {
        misconception: "In the moment, the choice that relieves the feeling (win it back, chase the move, hold the loser) seems reasonable. The sound choice is the one the plan made in advance.",
        altExplanation: "A sound decision under pressure asks: what does my written plan say, have I broken any rule today, and am I trying to undo a feeling rather than take a planned setup? If a rule is broken or a loss stop is hit, the answer is to stop, not to trade differently.",
        altExample: "After two losses and a sharp move in a stock everyone is talking about, a sound trader checks the daily stop, finds there is room, sees the move is not a planned setup, and skips it.",
        practice: scenario(
          "A trader is down 2.5R today with a 3R daily stop. A fast move appears in a pair they do not usually trade. They feel they must catch it to end the day positive.",
          "What is the soundest decision?",
          [
            ["a", "Take it at double size to end the day green", "Revenge sizing on an unplanned setup.", "unsound"],
            ["b", "Skip it: it is not a planned setup and the urge is to win back the loss", "Sound: the plan and the feeling both point to no trade.", "sound"],
            ["c", "Take it at normal size with a 0.5R stop, since that stays inside the daily stop", "Inside the limit, but still an unplanned trade driven by the loss.", "partial"],
            ["d", "Take it with no stop so the daily stop cannot be hit", "Removes the protection entirely.", "unsound"],
          ],
        ),
      },
      flashcard: { front: "Under pressure", back: "Ask: what does the plan say, is a rule broken, am I trying to undo a feeling? If so, stop." },
    },
  ],
  questions: [
    // psy-loss-aversion
    q("psyq-la-1", "psy-loss-aversion", "knowledge", single("What is loss aversion?", [
      ["a", "Avoiding all trades that could lose money", "That would mean no trading at all."],
      ["b", "Preferring assets with low volatility over assets with high volatility", "That is risk aversion in general."],
      ["c", "A loss feeling larger than a gain of the same size", "Right. That is what the lesson describes."],
      ["d", "Using a stop-loss", "A stop is a rule, not a feeling."],
    ], "c"), "Loss aversion is the tendency for a loss to feel larger than a gain of the same size. Its strength is debated."),
    q("psyq-la-2", "psy-loss-aversion", "knowledge", tf("The λ = 2.25 estimate from Tversky and Kahneman (1992) is a fixed constant that applies to every trader.", false, "False. It is one small study's median; estimates vary widely."), "λ = 2.25 is a median estimate from one study's participants. Later estimates vary, and some researchers question loss aversion's generality."),
    q("psyq-la-3", "psy-loss-aversion", "calculation", numeric("With a linear value function (α = β = 1) and λ = 2, how many points of felt value does a loss of 150 points carry? Give the size without the minus sign.", "points", 300, 1, "2 × 150 = 300."), "With α = β = 1, v(−x) = −λx, so a loss of 150 carries 2 × 150 = 300 points of felt value."),
    q("psyq-la-4", "psy-loss-aversion", "knowledge", single("What did Ruggeri and colleagues (2020) find when they repeated the 1979 prospect theory study in 19 countries?", [
      ["a", "Most of the original choice patterns replicated, with some weakening", "Right. 94% of items replicated."],
      ["b", "None of the patterns replicated", "Most of them did replicate."],
      ["c", "Loss aversion was exactly 2.25 in every country they tested, in all 13 languages", "The study tested choice patterns, not a single λ."],
      ["d", "Only professional traders showed the effects", "Participants were the general public."],
    ], "a"), "Ruggeri et al. (2020) replicated 94% of the original items with some attenuation, across 4,098 participants in 19 countries."),

    // psy-disposition
    q("psyq-di-1", "psy-disposition", "knowledge", single("Which pattern is the disposition effect?", [
      ["a", "Buying more of a share as it falls", "That is averaging down."],
      ["b", "Holding winners and losers equally long", "That is no effect."],
      ["c", "Trading more often after a run of wins, when confidence is highest", "That is overconfidence."],
      ["d", "Selling winners sooner than losers", "Right. That is what the lesson describes."],
    ], "d"), "The disposition effect is realising gains more readily than losses, measured by PGR above PLR."),
    q("psyq-di-2", "psy-disposition", "calculation", numeric("On the days they sold, a trader realised 2 losses and left 18 losses open. What is their PLR, in percent?", "%", 10, 0.2, "2 / (2 + 18) = 0.10 = 10%."), "PLR = realised losses / (realised + paper losses) = 2 / 20 = 10%."),
    q("psyq-di-3", "psy-disposition", "knowledge", tf("In Odean's (1998) data, the winners investors sold went on to do better than the losers they kept.", true, "True. So the pattern lowered returns."), "Odean found the disposition effect was not justified by later performance: the winners sold outperformed the losers held."),
    q("psyq-di-4", "psy-disposition", "knowledge", single("Which exit rule does not depend on whether the position is in profit?", [
      ["a", "Sell anything showing a gain at the close", "Depends on the sign of the profit."],
      ["b", "Exit at the stop or target set before entry", "Right. That is what the lesson describes."],
      ["c", "Hold losers until they return to the entry price, however long that takes", "Depends on the sign of the profit."],
      ["d", "Close the biggest loser every Friday", "Still decided by profit or loss."],
    ], "b"), "A stop and target set before entry decide the exit regardless of the open profit, which counters the disposition effect."),

    // psy-overtrading
    q("psyq-ot-1", "psy-overtrading", "calculation", numeric("A trader makes 9% a year before costs, turns over 400% a year and pays 0.75% per round trip. What is the return after costs, in percent?", "%", 6, 0.1, "Cost = 4 × 0.75% = 3%. 9% − 3% = 6%."), "Cost = (turnover / 100%) × round-trip cost = 4 × 0.75% = 3%, leaving 6%."),
    q("psyq-ot-2", "psy-overtrading", "knowledge", single("In Barber and Odean (2000), how did the heaviest-trading households compare with the market?", [
      ["a", "They earned 11.4% a year against the market's 17.9%", "Right, in 1991–1996."],
      ["b", "They beat the market", "The opposite."],
      ["c", "They matched it exactly", "They trailed it."],
      ["d", "The study only covered professional fund managers, not households", "It covered 66,465 households."],
    ], "a"), "Barber and Odean found the households that traded most earned 11.4% a year against 17.9% for the market, after costs."),
    q("psyq-ot-3", "psy-overtrading", "knowledge", tf("Every extra round trip adds cost, whether or not the trade adds any skill.", true, "True. Costs are certain; skill benefit is not."), "Each round trip pays commission and spread. If the extra trade is not better than average, the cost lowers the result."),
    q("psyq-ot-4", "psy-overtrading", "knowledge", single("What does good calibration mean?", [
      ["a", "Feeling confident on every trade", "Confidence is not calibration."],
      ["b", "Using the same position size on every trade, whatever the setup or the market", "That is a sizing rule."],
      ["c", "Your stated confidence matches how often you turn out right", "Right. That is what the lesson describes."],
      ["d", "Winning most trades", "That is a win rate."],
    ], "c"), "Calibration means that, for example, trades you are 70% sure about win about 70% of the time."),

    // psy-biases
    q("psyq-bi-1", "psy-biases", "knowledge", single("After a fall, a trader says \"it was obvious\", though they made no such forecast. Which bias is this?", [
      ["a", "Confirmation bias, because they agree with the move", "Confirmation is about seeking agreeing evidence."],
      ["b", "Hindsight bias", "Right. That is what the lesson describes."],
      ["c", "Recency bias", "Recency is about overweighting the latest results."],
      ["d", "The disposition effect", "That is about selling winners and holding losers."],
    ], "b"), "Hindsight bias makes outcomes seem more predictable after they are known than they were before."),
    q("psyq-bi-2", "psy-biases", "knowledge", tf("Knowing the name of a bias is usually enough to stop it affecting you.", false, "False. Written checks work better than awareness."), "Studies such as Fischhoff's found people were largely unaware of hindsight bias even while showing it, so written records made before the outcome are the stronger defence."),
    q("psyq-bi-3", "psy-biases", "knowledge", single("Which habit best counters confirmation bias before a trade?", [
      ["a", "Writing the strongest reason the trade could fail, then looking for it", "Right. That is what the lesson describes."],
      ["b", "Reading more sources that agree", "That feeds the bias."],
      ["c", "Trading faster", "Speed skips the check."],
      ["d", "Ignoring all news, opinion and research of any kind, including your own analysis", "That throws away evidence too."],
    ], "a"), "Actively seeking the case against your trade exposes the evidence confirmation bias would filter out."),
    q("psyq-bi-4", "psy-biases", "knowledge", tf("Recency bias can lead a trader to drop a method with a long sound record after a few recent losses.", true, "True. A few recent results outweigh the long record."), "Recency bias gives the latest results more weight than the long record; judging methods on large samples counters it."),

    // psy-randomness
    q("psyq-ra-1", "psy-randomness", "knowledge", single("A fair coin lands heads six times in a row. What is the chance of heads next?", [
      ["a", "Below 50%, since tails is due after so long", "That is the gambler's fallacy."],
      ["b", "Above 50%", "That is the hot-hand belief."],
      ["c", "It depends on the previous ten flips", "The coin has no memory."],
      ["d", "50%", "Right. That is what the lesson describes."],
    ], "d"), "For a fair coin each flip is independent, so the next flip is 50/50 whatever came before."),
    q("psyq-ra-2", "psy-randomness", "knowledge", single("Why is the hot-hand fallacy now described as contested?", [
      ["a", "Miller and Sanjurjo (2018) showed the classic test was biased against finding streaks", "Right. That is what the lesson describes."],
      ["b", "Coins were shown to have memory", "They do not."],
      ["c", "The original authors withdrew the paper", "Not what happened."],
      ["d", "Later studies found that every basketball player is streaky in every game and every season", "Not a finding."],
    ], "a"), "Miller and Sanjurjo showed that the share of hits after a streak is biased downwards in finite sequences; correcting it reverses the 1985 conclusion."),
    q("psyq-ra-3", "psy-randomness", "calculation", numeric("A trader's win rate is 50%. What is the chance, in percent, that a given four trades all lose? Round to one decimal place.", "%", 6.3, 0.1, "0.5^4 = 0.0625 = 6.25%, about 6.3%."), "For independent trades, the chance a given four all lose is 0.5^4 = 6.25%."),
    q("psyq-ra-4", "psy-randomness", "knowledge", tf("A long losing streak can reflect a change in the trader, such as trading worse on tilt, rather than only chance.", true, "True. If results are not independent, a streak may reflect you."), "Streaks are common by chance, but when results are not independent (for example tilt), a streak can signal a real change in behaviour worth reviewing."),

    // psy-variance
    q("psyq-va-1", "psy-variance", "calculation", numeric("A method wins 35% of the time with an average win of 2.5R and a loss of 1R. What is its expectancy per trade, in R? Round to two decimal places.", "R", 0.23, 0.01, "0.35 × 2.5 − 0.65 = 0.875 − 0.65 = 0.225 ≈ 0.23R."), "Expectancy = 0.35 × 2.5 − 0.65 × 1 = 0.225R, about 0.23R a trade."),
    q("psyq-va-2", "psy-variance", "knowledge", single("A method with a tested positive expectancy has eight losses in a row, within its tested range. What is the sound response?", [
      ["a", "Abandon it for a method that did well last month", "That is recency bias."],
      ["b", "Double the size to recover faster", "That turns normal variance into possible ruin."],
      ["c", "Check the rules were followed, then continue at planned size", "Right. That is what the lesson describes."],
      ["d", "Stop journalling until the streak ends, so that the bad run does not affect your mood", "That hides the evidence."],
    ], "c"), "Long losing runs are normal with an edge. If the rules were followed and the run is within the tested range, the method has not been shown to fail."),
    q("psyq-va-3", "psy-variance", "knowledge", tf("Even with a positive expectancy, a long run of losses is likely over hundreds of trades.", true, "True. There are many places for a run to start."), "One specific run is rare, but across hundreds of trades there are many starting points, so long runs become likely."),
    q("psyq-va-4", "psy-variance", "calculation", numeric("Risking 2% of the account per trade, about what percentage drawdown do ten losses in a row cause? Ignore compounding.", "%", 20, 0.5, "10 × 2% = 20%."), "Ten losses at 2% each is about 20% (a little less with compounding), so size must be set with such streaks in mind."),

    // psy-outcome-bias (safety-critical)
    q("psyq-ob-1", "psy-outcome-bias", "knowledge", single("What is outcome bias?", [
      ["a", "Choosing trades with the best expected outcome", "That is planning."],
      ["b", "Judging a decision by how it turned out", "Right. That is what the lesson describes."],
      ["c", "Ignoring all results, even over hundreds of trades spread across several years", "Results matter over large samples."],
      ["d", "Preferring sure gains to gambles", "That is risk aversion for gains."],
    ], "b"), "Outcome bias is judging a single decision by its single result instead of by the process and information behind it."),
    q("psyq-ob-2", "psy-outcome-bias", "knowledge", single("Which of the four decision–outcome groups is most dangerous for a trader's habits?", [
      ["a", "Sound decision, bad outcome", "Harmless if you keep the process."],
      ["b", "Sound decision, good outcome", "Earned: the process worked."],
      ["c", "Poor decision, good outcome", "Right. It rewards the bad habit."],
      ["d", "Poor decision, bad outcome, especially one that ends in a large loss", "Painful, but it teaches the right lesson."],
    ], "c"), "A poor decision rewarded by luck teaches you to repeat it, often with more confidence and size."),
    q("psyq-ob-3", "psy-outcome-bias", "knowledge", tf("A trade that followed every rule and hit its stop for −1R can still be a good decision.", true, "True. The process was sound; the result was bad luck."), "Decision quality depends on the process and information at the time. A sound process will lose some of the time."),
    q("psyq-ob-4", "psy-outcome-bias", "knowledge", multi("Which journal entries judge the decision rather than the outcome? Choose all that apply.", [
      ["a", "Risk was 1% as planned", "Right. A process fact."],
      ["b", "The trade made +3R", "That is the outcome."],
      ["c", "The checklist was complete before entry", "Right. A process fact."],
      ["d", "It was my best day this month", "That is the outcome."],
    ], ["a", "c"]), "Process facts (risk as planned, checklist complete) judge the decision; P&L and \"best day\" judge the outcome."),

    // psy-revenge (safety-critical)
    q("psyq-rv-1", "psy-revenge", "calculation", numeric("Starting at 1R and doubling size after each loss, how many R are lost in total after six losses in a row?", "R", 63, 0.5, "1 + 2 + 4 + 8 + 16 + 32 = 63R."), "Doubling after each loss loses 2^k − 1 units after k losses: 2^6 − 1 = 63R."),
    q("psyq-rv-2", "psy-revenge", "knowledge", single("Why can revenge sizing look like it works?", [
      ["a", "It wins on many days, while its losses are rare but huge", "Right. That is what the lesson describes."],
      ["b", "It changes the odds of each trade", "It does not."],
      ["c", "It reduces costs", "It increases the risk traded."],
      ["d", "It only works for professionals with enough capital to keep doubling after every loss", "Nobody can double forever."],
    ], "a"), "Doubling up usually gets back to even, so it wins often, but a long run of losses produces a loss far beyond the planned worst day."),
    q("psyq-rv-3", "psy-revenge", "knowledge", tf("Coval and Shumway (2005) found that professional CBOT traders with morning losses took above-average risk in the afternoon.", true, "True. Even professionals did it."), "Coval and Shumway found CBOT proprietary traders regularly took above-average afternoon risk to recover morning losses."),
    q("psyq-rv-4", "psy-revenge", "knowledge", single("Which is a warning sign of tilt?", [
      ["a", "Following your checklist on every trade, even when the setup looks obvious", "That is the process working."],
      ["b", "Wanting to win back today's loss before you stop", "Right. That is what the lesson describes."],
      ["c", "Taking a planned break", "That is regulation, not tilt."],
      ["d", "Keeping size fixed", "That is the plan."],
    ], "b"), "The urge to win back a loss, bigger size and skipped checks are signs that emotion is taking over from the rules."),

    // psy-daily-stop (safety-critical)
    q("psyq-ds-1", "psy-daily-stop", "knowledge", single("When should a daily loss stop be set?", [
      ["a", "When the first loss of the day happens", "Then you are already under pressure."],
      ["b", "Only on days that look volatile from the open", "It should apply every day."],
      ["c", "After the day ends, depending on how the session went and how you feel about it", "Too late to help."],
      ["d", "In advance, in the written plan", "Right. That is what the lesson describes."],
    ], "d"), "A daily loss stop works because it is decided on a calm day and applied mechanically on a bad one."),
    q("psyq-ds-2", "psy-daily-stop", "knowledge", tf("Once the daily loss stop is hit, the trader must stop trading for the rest of the session.", true, "True. That is the whole rule."), "The daily loss stop ends the session. \"One more trade\" or a smaller trade both break it."),
    q("psyq-ds-3", "psy-daily-stop", "calculation", numeric("A trader's daily loss stop is 3R. They are down 1.5R after two trades. How many more R can they lose today before the stop is hit?", "R", 1.5, 0.05, "3 − 1.5 = 1.5R."), "The stop is 3R for the day and 1.5R is already lost, so 1.5R remains before trading must end."),
    q("psyq-ds-4", "psy-daily-stop", "knowledge", single("Which is the weakness of a daily loss stop on its own?", [
      ["a", "It caps one day but not a run of bad days", "Right. Pair it with a weekly limit and a drawdown rule."],
      ["b", "It increases the worst day", "It caps it."],
      ["c", "It cannot be written down", "It can and should be."],
      ["d", "It makes revenge trading more likely by ending the day early, when losses still feel fresh", "It is designed to stop revenge trading."],
    ], "a"), "A daily stop limits a single session. A weekly loss limit and a drawdown rule are needed for a run of bad days."),

    // psy-tilt
    q("psyq-ti-1", "psy-tilt", "knowledge", single("What did the 2016 multilab replication of ego depletion find?", [
      ["a", "A large effect in every lab", "The opposite."],
      ["b", "An effect close to zero", "Right. d = 0.04, interval including zero."],
      ["c", "An effect only in traders", "Traders were not studied."],
      ["d", "That self-control always runs out after exactly one hour of effort on any task", "Not a finding."],
    ], "b"), "Hagger et al. (2016) ran one protocol in 23 labs with 2,141 participants and found d = 0.04, so ego depletion is contested."),
    q("psyq-ti-2", "psy-tilt", "knowledge", single("According to Harrison and Horne's review, which kinds of decision suffer most from sleep loss?", [
      ["a", "Simple, repetitive logic tasks", "These held up fairly well."],
      ["b", "Only decisions about money made by people who are new to the task", "Not what the review says."],
      ["c", "Flexible ones: the unexpected, updating plans, resisting distraction", "Right. That is what the lesson describes."],
      ["d", "None", "Several kinds were impaired."],
    ], "c"), "The review found simple logical tasks fairly robust to short sleep loss, but flexible, innovative and plan-updating decisions impaired."),
    q("psyq-ti-3", "psy-tilt", "knowledge", tf("A tilt self-check is a reflection tool, not a medical diagnosis.", true, "True. It prompts you to act on your own rules."), "The self-check asks about warning signs so you can apply your rules. It does not diagnose anything."),
    q("psyq-ti-4", "psy-tilt", "knowledge", tf("Willpower can always be relied on to keep you on plan when you are tired or upset.", false, "False. Rules written in advance are more reliable."), "Judgement is weakest when tired or upset, and the willpower-as-fuel idea is contested, so if-then rules written on a calm day are safer."),

    // psy-process
    q("psyq-pr-1", "psy-process", "knowledge", single("One item on your pre-trade checklist is not true. What happens?", [
      ["a", "Trade at half size", "The rule is all items or no trade."],
      ["b", "Trade anyway if the setup looks very strong on the chart and you feel sure", "That is how checklists get skipped."],
      ["c", "No trade", "Right. That is what the lesson describes."],
      ["d", "Delete the item", "That defeats the checklist."],
    ], "c"), "A checklist only works if every item is required: any no means no trade."),
    q("psyq-pr-2", "psy-process", "calculation", numeric("Of 20 trades this week, 17 followed every rule. What is the process score, in percent?", "%", 85, 0.5, "17 / 20 = 85%."), "Process score = trades with every rule followed / all trades = 17 / 20 = 85%."),
    q("psyq-pr-3", "psy-process", "knowledge", single("When should a trading plan be changed?", [
      ["a", "Mid-session, when a rule feels wrong", "Judgement is worst then."],
      ["b", "At a scheduled review, based on a large sample", "Right. That is what the lesson describes."],
      ["c", "After any losing trade, so that the same thing cannot happen again", "One trade is mostly luck."],
      ["d", "Never", "Plans should improve on evidence."],
    ], "b"), "Proposed changes are written down and decided at the scheduled review, using many trades, not one result or one session."),
    q("psyq-pr-4", "psy-process", "knowledge", tf("A perfect checklist and journal can create an edge where none exists.", false, "False. They protect an edge; they cannot invent one."), "Process tools stop rule breaks and outcome bias, but a method with no edge still loses after costs."),

    // psy-expectations
    q("psyq-ex-1", "psy-expectations", "knowledge", single("What share of retail CFD accounts did ESMA report typically lost money in 2018?", [
      ["a", "About 10–20%", "Far too low."],
      ["b", "About half, which is what you would expect from a fair coin flip", "The figure was higher."],
      ["c", "74–89%", "Right. That is what the lesson describes."],
      ["d", "Nobody lost money", "Most retail accounts lost money."],
    ], "c"), "ESMA's March 2018 press release said national authorities found 74–89% of retail CFD accounts typically lost money."),
    q("psyq-ex-2", "psy-expectations", "calculation", numeric("1,024 traders with no edge each take six 50/50 trades. About how many win all six by luck?", "traders", 16, 0.5, "1,024 × 0.5^6 = 1,024 / 64 = 16."), "The chance of six wins in a row is 0.5^6 = 1/64, so about 1,024 / 64 = 16 traders."),
    q("psyq-ex-3", "psy-expectations", "knowledge", tf("Barber, Lee, Liu and Odean (2014) found that fewer than 1% of Taiwanese day traders could predictably earn positive returns after fees.", true, "True. That is what the study reported."), "Using complete Taiwan Stock Exchange records from 1992 to 2006, they found fewer than 1% of day traders predictably earned positive abnormal returns net of fees."),
    q("psyq-ex-4", "psy-expectations", "knowledge", single("Why is a trader's one great year weak evidence of skill?", [
      ["a", "Luck alone produces some great years among many traders", "Right. That is what the lesson describes."],
      ["b", "Great years are always faked", "Some are real; you cannot tell from a short record."],
      ["c", "One year is too long a period", "It is too short, not too long."],
      ["d", "Regulators do not allow anyone to publish their results online in most countries", "Not the reason."],
    ], "a"), "Among many traders, chance alone produces some with impressive short records (survivorship bias), so a long, verified record is needed."),

    // psy-applied
    q("psyq-app-1", "psy-applied", "applied", scenario(
      "A trader broke their stop rule yesterday and the trade recovered for +4R. Today a similar trade goes against them and reaches the stop.",
      "What is the soundest decision?",
      [
        ["a", "Hold again: yesterday showed the stop is too tight", "Learning from one lucky outcome.", "unsound"],
        ["b", "Close at the stop, and log yesterday's trade as a mistake with a good outcome", "Sound: judges the process, not the result.", "sound"],
        ["c", "Move the stop a little further away as a compromise between the plan and yesterday's result", "Still lets one result change the rule.", "partial"],
        ["d", "Double the position to make the most of the recovery", "Adds risk on a losing trade.", "unsound"],
      ],
    ), "Yesterday's profit came from a rule break; outcome bias would make it a lesson. The sound choice follows the stop and records the break as a mistake."),
    q("psyq-app-2", "psy-applied", "applied", scenario(
      "A trader's daily loss stop is 3R. After three losing trades they are down exactly 3R. Their setup appears again and they feel sure this one will win.",
      "What is the soundest decision?",
      [
        ["a", "Take it, because the setup is valid", "The daily stop has been hit; no more trades today.", "unsound"],
        ["b", "Take it at half size", "Still breaks the daily stop.", "unsound"],
        ["c", "Stop for the day, close the platform and write the journal entry", "Sound: the rule decides.", "sound"],
        ["d", "Stop for an hour, then take it if it is still there and the urge to trade has faded", "Better than trading now, but the stop is for the whole day.", "partial"],
      ],
    ), "The daily loss stop ends the session whatever the next setup looks like. The feeling of certainty is exactly what the rule protects against."),
    q("psyq-app-3", "psy-applied", "applied", scenario(
      "A trader slept four hours. Their plan says: \"If I sleep under six hours, trade half size or not at all.\" The market is quiet and they feel fine.",
      "What is the soundest decision?",
      [
        ["a", "Trade normal size: feeling fine means the rule does not apply", "The rule exists because tiredness is hard to judge from inside.", "unsound"],
        ["b", "Trade half size or skip, as the plan says", "Sound: the rule made on a rested day decides.", "sound"],
        ["c", "Trade double size because the market is quiet and the risk is therefore lower than usual today", "Raises risk against the plan.", "unsound"],
        ["d", "Trade normal size but skip the checklist to save energy", "Removes a protection when it matters most.", "unsound"],
      ],
    ), "Sleep loss can impair flexible decisions without feeling it, which is why the plan's if-then rule, not the morning's feeling, should decide."),
    q("psyq-app-4", "psy-applied", "applied", scenario(
      "A share everyone is discussing is up 30% today. A trader with no plan for it feels they will miss out. Their checklist requires a planned setup with a stop set before entry.",
      "What is the soundest decision?",
      [
        ["a", "Buy now at market so as not to miss more", "FOMO: no setup, no stop.", "unsound"],
        ["b", "Buy a small amount with no stop, \"just to be in it\"", "Smaller, but still unplanned and unprotected.", "partial"],
        ["c", "Skip it, and note it for review in case a planned setup appears later", "Sound: the checklist is not met, and missing a move costs nothing.", "sound"],
        ["d", "Short it because it has risen too far", "An unplanned trade in the other direction.", "unsound"],
      ],
    ), "FOMO pushes an unplanned entry. A missed move costs nothing; the checklist says no trade without a planned setup and stop."),
  ],
};

const MORE_REMEDIATION: Record<string, ConceptRemediation> = {
  "psy-loss-aversion": {
    misconception: "Some readers conclude that because loss aversion is debated, prospect theory is wrong. The choice patterns replicate well; it is the size and generality of loss aversion that is argued over.",
    altExplanation: "Separate the two claims. The patterns, such as taking a sure gain but gambling to avoid a sure loss, held up in a 19-country replication. The claim that losses always loom about twice as large as gains is the contested part.",
    altExample: "A trader closes a +0.5R winner at once but lets a −1R loser run to −2R hoping it comes back. That pattern fits prospect theory whatever its exact loss aversion number.",
    practice: tf("The 2020 replication by Ruggeri and colleagues found that most of the original prospect theory choice patterns held up.", true, "True. 94% of items replicated, with some weakening."),
  },
  "psy-disposition": {
    misconception: "A PGR above PLR from a handful of trades is easy to over-read. Like any statistic, it needs a large sample before it means much.",
    altExplanation: "PGR and PLR are shares. With five trades, one sale changes them hugely. Measure over many selling days, and remember that taxes or planned targets can explain some sales of winners.",
    altExample: "A trader with three positions sells one winner: PGR jumps to 100% for the day. Over a year of 200 sales the gap may be much smaller.",
    practice: single("PGR is 45% and PLR is 20% over a year of trading. What does it suggest?", [
      ["a", "Losses are being cut quickly", "PLR is the lower figure."],
      ["b", "Gains are realised more readily than losses", "Right. The disposition pattern."],
      ["c", "The trader has an edge in every market they trade and in every month", "The ratios say nothing about edge."],
      ["d", "Nothing", "Over a year it is a clear signal to review exits."],
    ], "b"),
  },
  "psy-overtrading": {
    misconception: "It is tempting to think costs only matter for tiny accounts. Costs are a percentage of the value traded, so they scale with turnover at any size.",
    altExplanation: "Turnover tells you how many times a year you pay the round-trip cost on the whole account. Double the turnover and you double the cost drag, whatever the account size.",
    altExample: "An account turned over 800% a year at 0.6% a round trip loses 4.8 points a year to costs before any skill is counted.",
    practice: tf("Doubling turnover doubles the yearly cost drag, if the cost per round trip stays the same.", true, "True. Cost drag = turnover × round-trip cost."),
  },
  "psy-biases": {
    misconception: "Hindsight bias is often confused with learning from experience. Learning updates rules from many cases; hindsight rewrites what you thought before one case.",
    altExplanation: "Learning: after 200 trades, a setup's record shows it works worse in thin markets, so you change the rule. Hindsight: after one loss, you feel you \"knew\" it would fail, though your notes said you were confident.",
    altExample: "A trader's note before a central bank meeting says \"no idea which way\". After a big move, they tell friends it was an easy call.",
    practice: tf("Recency bias means giving the latest results more weight than the long record supports.", true, "True. That is what the study reported."),
  },
  "psy-randomness": {
    misconception: "Many people expect random sequences to alternate often. Real random sequences have longer runs than intuition suggests.",
    altExplanation: "In 100 fair flips, a run of five or more of the same side is very likely somewhere. Seeing one is not evidence that anything changed, in a coin or in a set of independent trades.",
    altExample: "Asked to write down a \"random\" sequence of 50 flips, most people switch sides too often and include no run longer than three or four.",
    practice: single("What does the gambler's fallacy expect after a streak?", [
      ["a", "The streak will continue", "That is the hot-hand belief."],
      ["b", "Nothing changes", "That is the correct view for independent events."],
      ["c", "The opposite result is now due", "Right. That is what the lesson describes."],
      ["d", "The odds double for the next event, then fall back once the streak has been broken", "Not a real rule."],
    ], "c"),
  },
  "psy-variance": {
    misconception: "Some traders size as if their worst losing run will be about as long as the worst they have seen so far. Over more trades, longer runs become likely.",
    altExplanation: "The longest streak grows with the number of trades. Plan for a run longer than any in your short history, and check that your risk per trade keeps that drawdown survivable.",
    altExample: "A trader saw at most four losses in a row in their first 40 trades, but over the next 400 a run of eight would be unremarkable at a 50% loss rate.",
    practice: tf("The longest losing streak you should plan for grows as you take more trades.", true, "True. More trades give more places for a long run to start."),
  },
  "psy-outcome-bias": {
    misconception: "Some traders think ignoring outcomes means results never matter. Over a large sample, results do tell you about a method; outcome bias is judging one decision by one result.",
    altExplanation: "Use two time scales. For each trade, score the process: were the rules followed? For the method, look at results over hundreds of trades. One result is mostly luck; many results are mostly edge.",
    altExample: "A poker player folds a strong hand on a sound read and the next card would have won. The fold was still right; the player judges the read over hundreds of hands.",
    practice: tf("A trade that broke a rule and made money should be logged as a mistake with a good outcome.", true, "True. The process was poor, whatever the result."),
  },
  "psy-revenge": {
    misconception: "Revenge trading is often seen as a willpower problem only. It is also a sizing problem: the maths of doubling guarantees huge losses on long runs.",
    altExplanation: "Each doubling makes the next loss as big as all previous losses plus one unit. Losing runs are normal, so a sizing method that explodes on them will eventually meet one. Fixed size makes losses grow in a straight line instead.",
    altExample: "Seven losses in a row at fixed 1R cost 7R. Doubling from 1R, the same seven losses cost 127R.",
    practice: single("What is the main danger of doubling size after every loss?", [
      ["a", "A normal losing run produces a loss far beyond the planned worst day", "Right. That is what the lesson describes."],
      ["b", "It wins too rarely", "It usually wins, which is why it is tempting."],
      ["c", "It lowers the spread", "Sizing does not change the spread."],
      ["d", "Brokers do not allow anyone to increase their position size after a loss on the same day", "Not true, and not the danger."],
    ], "a"),
  },
  "psy-daily-stop": {
    misconception: "Traders sometimes set a daily loss stop so wide it never triggers. A stop that a normal bad day cannot reach does not protect anything.",
    altExplanation: "Set the daily stop as a small number of R, such as 2–3R, and pair it with a weekly limit. Check that a run of bad days at those limits still fits within your drawdown limit.",
    altExample: "A trader with 1% risk per trade sets a 3R daily stop and a 6R weekly stop, so the worst week costs about 6% of the account.",
    practice: tf("A daily loss stop should be set in advance, as part of the written plan.", true, "True. Decided while calm, applied on a bad day."),
  },
  "psy-tilt": {
    misconception: "Many traders believe they can feel when they are too tired to trade. Studies of sleep loss suggest flexible judgement can suffer before you notice.",
    altExplanation: "Because impairment may not be obvious from the inside, the plan uses outside facts, such as hours slept or a broken rule, to set size. That way the decision does not depend on judging yourself while impaired.",
    altExample: "A trader who slept five hours feels alert, but their plan says half size under six hours, so they trade half size.",
    practice: single("Which is a sound if-then rule for tilt?", [
      ["a", "If I feel angry at the market, I leave the screen for a set time", "Right. That is what the lesson describes."],
      ["b", "If I feel angry, I trade bigger to win it back", "That is revenge trading."],
      ["c", "If I feel tired, I skip the checklist to save my energy for the trades themselves", "Removes a protection when it matters most."],
      ["d", "If I break a rule, I carry on as normal", "A broken rule is reason to stop."],
    ], "a"),
  },
  "psy-process": {
    misconception: "Some traders review only losing trades. Winning trades can hide rule breaks, which is exactly where outcome bias does its damage.",
    altExplanation: "Journal every trade, winners and losers. In the weekly review, first count rule-following trades (the process score), then look at P&L, and only change rules on large samples.",
    altExample: "A weekly review finds that two of the five winners skipped the checklist. Without journalling winners, those breaks would never have been seen.",
    practice: tf("A weekly review should look at the process score before looking at P&L.", true, "True. Results first invite outcome bias."),
  },
  "psy-expectations": {
    misconception: "A trader may think the loss statistics apply to others who did not study. The studies cover persistent and active traders too, and found no evidence of learning in one large sample.",
    altExplanation: "Base rates do not decide your fate, but they are where the evidence starts. Treat your own short record as weak evidence, keep leverage low, and judge yourself over hundreds of trades.",
    altExample: "In one Brazilian working paper, 97% of individuals who day traded futures for at least 300 days lost money.",
    practice: single("What is survivorship bias in trading success stories?", [
      ["a", "Judging from visible winners and ignoring those who stopped", "Right. That is what the lesson describes."],
      ["b", "Only trading shares of companies that survived the last recession", "Not the meaning here."],
      ["c", "Keeping a stop-loss", "A stop-loss is a risk rule, not a bias."],
      ["d", "A broker's rule", "It is a reasoning error."],
    ], "a"),
  },
  "psy-applied": {
    misconception: "A partial fix, such as trading smaller instead of stopping, can feel like a sensible compromise. When a rule is broken or a stop is hit, the plan's answer is to stop.",
    altExplanation: "Under pressure, check three things in order: is any loss stop hit, has any rule been broken today, and is this trade a planned setup or an urge? Any red flag means no trade; a smaller trade is still a trade.",
    altExample: "After hitting the weekly loss limit on Thursday, a trader stops until Monday, even though Friday's calendar looks busy and tempting.",
    practice: scenario(
      "A trader broke their size rule on the last trade and it won +2R. They now want to take another trade at the same larger size.",
      "What is the soundest decision?",
      [
        ["a", "Take it at the larger size, since it worked", "Outcome bias plus a broken rule.", "unsound"],
        ["b", "Take it at normal size and say nothing", "Better size, but ignores the broken rule.", "partial"],
        ["c", "Stop for the day as the plan says after a broken rule, and journal it", "Sound: the rule and the process decide.", "sound"],
        ["d", "Take it at double the larger size to make the most of the run", "Escalates risk after a rule break.", "unsound"],
      ],
    ),
  },
};

export const PSYCHOLOGY_ASSESSMENT: TrackAssessment = {
  ...BASE,
  concepts: BASE.concepts.map((c) => ({ ...c, moreRemediation: MORE_REMEDIATION[c.id] ? [MORE_REMEDIATION[c.id]] : [] })),
};
