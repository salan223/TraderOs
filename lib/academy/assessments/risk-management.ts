import type { ConceptRemediation, TrackAssessment } from "../types";

/*
  Track 8 assessment: Risk Management.
  All accounts, prices and results are illustrative, made-up numbers.
  Risk per trade, position sizing, stops, leverage and margin, and gap risk
  with loss limits are safety-critical: every such question must be right.
*/

const T = "risk-management";

const BASE: TrackAssessment = {
  trackId: T,
  intro:
    "Questions on every idea from the ten lessons: risk per trade, sizing shares, forex and futures, stops, expectancy, drawdowns, leverage, portfolio heat, gaps and loss limits, averaging down and risk of ruin, with calculations and applied scenarios. You need 90% or more, a sound decision in the scenario, and every safety-critical question right: risk per trade, sizing, stops, leverage and margin, and gaps and loss limits.",
  concepts: [
    {
      id: "rm-risk-per-trade",
      title: "Risk per trade and R",
      lessonIds: ["rm-risk-per-trade"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "The most common confusion is between the value of a position and its risk. Risk per trade is the loss if the stop is hit, not the amount of money in the position.",
        altExplanation: "Think of risk as an entry fee you agree to before the game: the most you are prepared to pay if the idea is wrong. You choose that fee as a share of the account first. The size of the position is only a way of making the fee come out right, given where the stop is.",
        altExample: "Two traders each have $20,000 and risk 1% ($200). One buys $4,000 of a share with a stop 5% away; the other buys $10,000 with a stop 2% away. Different positions, identical risk: $200 each.",
        practice: {
          kind: "numeric",
          prompt: "An account holds $12,000 and risks 0.5% per trade. How much money is at risk on one trade?",
          unit: "US dollars",
          answer: 60,
          tolerance: 0.5,
          explain: "12,000 × 0.5 ÷ 100 = 60.",
        },
      },
      flashcard: { front: "Risk per trade", back: "The planned loss if the stop is hit: account × risk%. Results are measured in R, multiples of it." },
    },
    {
      id: "rm-sizing",
      title: "Position sizing for shares, forex and futures",
      lessonIds: ["rm-position-sizing"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "Many mistakes come from assuming a pip or a point is worth the same in every market. Its value depends on the pair and the account currency, or on the contract's multiplier.",
        altExplanation: "Every sizing problem asks: how much do I lose per unit if the stop is hit? For shares that is the distance to the stop. For forex it is pips × the value of one pip on one unit, converted into your account currency. For futures it is points × the value of one point. Divide the risk by that, and round down.",
        altExample: "Risk $90. A share with a $1.50 stop: 60 shares. EUR/USD with a 30-pip stop in a USD account: 90 ÷ (30 × 0.0001) = 30,000 units. A future worth $10 a point with a 4-point stop: 90 ÷ 40 = 2.25 → 2 contracts.",
        practice: {
          kind: "numeric",
          prompt: "Risk $300 on a share with entry $62.00 and stop $59.50. How many shares (rounded down)?",
          unit: "shares",
          answer: 120,
          tolerance: 0,
          explain: "Loss per share = 2.50. 300 ÷ 2.50 = 120 shares.",
        },
      },
      flashcard: { front: "Size formula", back: "Size = risk ÷ loss per unit at the stop. Shares: |entry − stop|. FX: pips × pip value per unit. Futures: points × point value. Round down." },
    },
    {
      id: "rm-stops",
      title: "Stop placement: structure and ATR",
      lessonIds: ["rm-stop-placement"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "A frequent error is choosing the stop to fit a size you wanted, or moving it further away when price approaches. Both turn a planned loss into an unplanned one.",
        altExplanation: "Ask what would have to happen for your reason for the trade to be false. That place on the chart, plus a small buffer, is the stop. Check it against ATR: if it is inside one ATR, normal noise will often reach it. Then the size follows. Once the trade is open, the stop may only move to reduce risk.",
        altExample: "You buy a pullback in an uptrend at $45 because the last swing low at $43 held. If $43 breaks, the higher-low idea is gone, so the stop goes at about $42.80. ATR is $0.90, so the stop is about 2.5 ATR away: outside ordinary noise.",
        practice: {
          kind: "single",
          prompt: "Entry $120, ATR(14) $3. Where is a 1.5 × ATR stop for a long position?",
          options: [
            { id: "a", text: "$124.50", explain: "Above the entry is the side for a short." },
            { id: "b", text: "$118.50", explain: "That is half an ATR." },
            { id: "c", text: "$115.50", explain: "Right. 120 − 1.5 × 3 = 115.50." },
            { id: "d", text: "$117.00, one ATR below the entry", explain: "One ATR is $3; the rule asks for 1.5 of them." },
          ],
          correct: "c",
        },
      },
      flashcard: { front: "Where does a stop go?", back: "Where the idea is proved wrong (structure), checked against volatility (ATR). Size follows. Never widen it." },
    },
    {
      id: "rm-expectancy",
      title: "Risk-reward, win rate and expectancy",
      lessonIds: ["rm-risk-reward"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "People often judge a method by its win rate alone. A win rate means nothing without the size of the average win and loss.",
        altExplanation: "Imagine 100 trades. Expectancy asks what the pile of money looks like at the end: the winners times the average win, minus the losers times the average loss, divided by 100. A high win rate with tiny wins can lose; a low win rate with big wins can make money. The break-even win rate, 1 ÷ (1 + reward-to-risk), tells you where the line is.",
        altExample: "Method A: 75 wins of $40, 25 losses of $150: 3,000 − 3,750 = −$750 over 100 trades. Method B: 30 wins of $300, 70 losses of $100: 9,000 − 7,000 = +$2,000.",
        practice: {
          kind: "numeric",
          prompt: "A method wins 30% of trades with an average win of 3R and an average loss of 1R. What is its expectancy per trade, in R?",
          unit: "R",
          answer: 0.2,
          tolerance: 0.005,
          explain: "0.3 × 3 − 0.7 × 1 = 0.9 − 0.7 = 0.2R.",
        },
      },
      flashcard: { front: "Expectancy and break-even", back: "E = p × W − (1 − p) × L. Break-even win rate = 1 ÷ (1 + W/L)." },
    },
    {
      id: "rm-drawdown",
      title: "Drawdowns, recovery and losing streaks",
      lessonIds: ["rm-drawdowns"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "It feels natural that a 30% loss needs a 30% gain to recover. It needs more, because the gain is earned on a smaller account.",
        altExplanation: "After losing x, you have (1 − x) left. To get back to 1 you must multiply by 1 ÷ (1 − x), which is a gain of x ÷ (1 − x). The deeper the loss, the faster that number grows: it doubles the loss at 50%, triples it at about 67%. Drawdowns are always measured from the highest point reached, not from the start.",
        altExample: "A $40,000 account falls to $30,000: a 25% drawdown. Getting back needs $10,000 on $30,000, a 33.3% gain, not 25%.",
        practice: {
          kind: "numeric",
          prompt: "What percentage gain is needed to recover from a 60% loss?",
          unit: "%",
          answer: 150,
          tolerance: 0.5,
          explain: "0.6 ÷ 0.4 = 1.5, a 150% gain.",
        },
      },
      flashcard: { front: "Recovery gain", back: "A loss of x needs x ÷ (1 − x): 20% → 25%, 50% → 100%, 75% → 300%. Drawdown is measured from the peak." },
    },
    {
      id: "rm-leverage",
      title: "Leverage, margin calls and liquidation",
      lessonIds: ["rm-leverage-margin"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "Many people believe the broker's maximum leverage is their leverage. Effective leverage is the position value divided by your equity, whatever the broker allows.",
        altExplanation: "The maximum leverage only sets the deposit (margin) the broker holds. Your exposure is the full position. Divide the position value by your equity: that number tells you how many percent the account moves for each 1% move in the price. As losses shrink equity, effective leverage rises and the margin level falls towards the broker's call and stop-out levels.",
        altExample: "$4,000 of equity and an $80,000 position: 20 : 1. A 2% move against you costs about 40% of the account, whether the broker's maximum is 1:30 or 1:500.",
        practice: {
          kind: "numeric",
          prompt: "Equity is $8,000 and the open position is worth $120,000. What is the effective leverage (the x in x : 1)?",
          unit: "times",
          answer: 15,
          tolerance: 0,
          explain: "120,000 ÷ 8,000 = 15.",
        },
      },
      flashcard: { front: "Effective leverage", back: "Position value ÷ equity. Equity moves about that many times the price move. The broker's maximum only sets the margin." },
    },
    {
      id: "rm-heat",
      title: "Correlation and portfolio heat",
      lessonIds: ["rm-correlation-heat"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Spreading risk over several positions feels safer, but positions driven by the same thing are one bet. Their stops can all be hit together.",
        altExplanation: "Before opening a position, ask what would make it lose. If the answer is the same as for a position you already hold, for example 'the dollar strengthens', it is the same bet. Add up the risk of everything open (heat) and the risk on each idea, and keep both under limits you set in advance. Correlations measured in calm times tend to rise in sell-offs.",
        altExample: "Long EUR/USD, long GBP/USD and short USD/JPY at 1% each are three ways of selling the dollar: about 3% on one idea, not three separate 1% risks.",
        practice: {
          kind: "multi-select",
          prompt: "You are long EUR/USD. Which of these would mostly add to the same bet? Select all that apply.",
          options: [
            { id: "a", text: "Long GBP/USD", explain: "Right: another position against the US dollar." },
            { id: "b", text: "Short USD/CAD", explain: "Right: selling the dollar again." },
            { id: "c", text: "Long a wheat futures contract", explain: "Mostly driven by crops and weather instead." },
            { id: "d", text: "Long a Japanese share priced in yen", explain: "Mostly driven by that company and Japan's market." },
          ],
          correct: ["a", "b"],
        },
      },
      flashcard: { front: "Portfolio heat", back: "The total risk to every open stop. Similar positions are one bet; correlations rise in sell-offs." },
    },
    {
      id: "rm-gaps-limits",
      title: "Gap and slippage risk, and daily loss limits",
      lessonIds: ["rm-gaps-limits"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "Many traders think a stop-loss guarantees the exit price. A normal stop becomes a market order, and after a gap it fills at the first available price.",
        altExplanation: "A stop is an instruction that waits for a price to trade. If the market jumps past it, as after news while the market was shut, there is no trade at the stop, so the order fills at the open. The only things that limit that loss in advance are the size of the position, not holding through the event, or a guaranteed stop or option, which cost money. Separately, a daily loss limit protects you from trading larger after a bad morning.",
        altExample: "A short at $30 with a stop at $31.50 (a $1.50 risk) faces a takeover bid overnight; the share opens at $39. The stop fills near $39: a $9 loss per share, six times the plan.",
        practice: {
          kind: "numeric",
          prompt: "Long 40 shares at $25 with a stop at $24. The share opens at $21 and the stop fills there. What is the loss in dollars?",
          unit: "US dollars",
          answer: 160,
          tolerance: 0.5,
          explain: "(25 − 21) × 40 = $160, four times the planned $40.",
        },
      },
      flashcard: { front: "Gaps and stops", back: "A stop is not a guaranteed price: after a gap it fills at the open. Size for gaps; set a daily loss limit in advance." },
    },
    {
      id: "rm-averaging",
      title: "Averaging down and martingales",
      lessonIds: ["rm-averaging-down"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "A lower average price feels like progress. It comes with a larger position, so every further fall costs more than before.",
        altExplanation: "Each buy at a lower price pulls the average down, but it adds shares. The loss per point of further fall equals the total number of shares. So averaging down trades a lower break-even price for a bigger, often unprotected, losing position. A martingale doubles each time, so the position grows 1, 3, 7, 15 times the first size.",
        altExample: "50 shares at $40, then 50 at $30: average $35, 100 shares. A fall to $25 now costs $1,000 instead of $750 with the original 50 alone, and needs a 40% rise to break even.",
        practice: {
          kind: "numeric",
          prompt: "A trader buys 200 shares at $10 and 200 more at $8. What is the average price per share?",
          unit: "US dollars",
          answer: 9,
          tolerance: 0.01,
          explain: "(2,000 + 1,600) ÷ 400 = 9.",
        },
      },
      flashcard: { front: "Averaging down", back: "Lowers the average but raises size and open loss. A martingale doubles and fails on a long enough run." },
    },
    {
      id: "rm-ruin",
      title: "Risk of ruin, Monte Carlo and Kelly",
      lessonIds: ["rm-risk-of-ruin"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "A positive edge feels like protection against ruin. It is not: bets that are large relative to the account can still wipe it out.",
        altExplanation: "Risk of ruin falls very fast as bets shrink relative to the account. In the classic even-money game it is ((1 − p) ÷ p) raised to the number of units you can lose, so doubling the units squares the probability. A Monte Carlo simulation shows the same for realistic payoffs: many random paths, and the share that hit the ruin level. It describes the model, not the future.",
        altExample: "With a 52% win chance, 10 units gives ((0.48 ÷ 0.52)^10) ≈ 45% risk of ruin; 50 units gives about 1.8%.",
        practice: {
          kind: "true-false",
          statement: "In a Monte Carlo simulation, fixed-fractional sizing can never take the account exactly to zero.",
          answer: true,
          explain: "True. Each bet is a fraction of what is left, so equity shrinks towards zero but does not reach it (it can still fall a very long way).",
        },
      },
      flashcard: { front: "Risk of ruin", back: "Depends on bet size as much as edge. Fixed fractional cannot hit zero; fixed dollar can. Bet well below Kelly." },
    },
    {
      id: "rm-applied",
      title: "Applied risk decisions",
      lessonIds: ["rm-risk-per-trade", "rm-position-sizing", "rm-leverage-margin", "rm-gaps-limits", "rm-averaging-down"],
      critical: true,
      safetyCritical: false,
      applied: true,
      remediation: {
        misconception: "In applied questions the tempting answer is often the one that feels decisive or that recovers a loss fastest. Sound risk decisions are usually the ones that keep the planned loss fixed.",
        altExplanation: "For any risk scenario, check four things in order: is the loss to the stop within the per-trade limit; is total open risk within the heat limit; is there a known event that could gap through the stop; and is the decision being made to recover a loss? An option that passes all four is usually the sound one.",
        altExample: "After three losses, a trader wants to double size on the next trade 'to get back to even'. It fails the fourth check outright. Keeping size fixed, or stopping for the day at the loss limit, passes all four.",
        practice: {
          kind: "scenario",
          situation: "A trader with a $10,000 account risks 1% per trade. They are already long EUR/USD and GBP/USD at 1% each, and their heat limit is 3%. They see a good set-up in AUD/USD, also long against the dollar.",
          question: "What is the soundest decision?",
          options: [
            { id: "a", text: "Take it at 1% because it is a separate trade", explain: "It is the same dollar bet; heat would reach 3% on one idea.", process: "unsound" },
            { id: "b", text: "Take it at 3% because the set-up is strong", explain: "Confidence is not a reason to triple risk.", process: "unsound" },
            { id: "c", text: "Skip it or take it small, keeping total dollar risk within a limit set in advance", explain: "Sound: it counts the shared risk.", process: "sound" },
            { id: "d", text: "Take it, but plan to close all three positions at once if the dollar starts to rise against them", explain: "Watching helps a little, but the risk is unchanged.", process: "partial" },
          ],
        },
      },
      flashcard: { front: "Four checks", back: "Stop within the per-trade limit? Heat within its limit? Event that could gap? Am I trying to win back a loss?" },
    },
  ],
  questions: [
    // rm-risk-per-trade
    {
      id: "rmq-risk-1", concept: "rm-risk-per-trade", type: "calculation",
      item: { kind: "numeric", prompt: "An account holds $15,000 and risks 2% per trade. How much money is at risk on one trade?", unit: "US dollars", answer: 300, tolerance: 0.5, explain: "15,000 × 2 ÷ 100 = 300." },
      explanation: "Money at risk = account × risk% ÷ 100. It is the loss if the stop is hit, decided before entering.",
    },
    {
      id: "rmq-risk-2", concept: "rm-risk-per-trade", type: "knowledge",
      item: {
        kind: "single",
        prompt: "A trader buys a $6,000 position with a stop that would lose $90. What is the trade's risk?",
        options: [
          { id: "a", text: "$6,000, the value of the position", explain: "That is the position value; it is only all lost in an extreme case." },
          { id: "b", text: "$90", explain: "Right. Risk is the loss to the stop." },
          { id: "c", text: "Unknown until the trade closes", explain: "The planned risk is known before entry." },
          { id: "d", text: "$6,090, the position value plus the loss to the stop", explain: "Adding the two has no meaning." },
        ],
        correct: "b",
      },
      explanation: "Risk per trade is the planned loss if the stop is hit. Position value is a separate number, which matters for leverage and gaps.",
    },
    {
      id: "rmq-risk-3", concept: "rm-risk-per-trade", type: "calculation",
      item: { kind: "numeric", prompt: "A trader risks $250 per trade and closes a trade with a $625 profit. What is the result in R?", unit: "R", answer: 2.5, tolerance: 0.01, explain: "625 ÷ 250 = 2.5R." },
      explanation: "A result in R is the profit or loss divided by the amount risked. It lets trades of different sizes be compared.",
    },
    {
      id: "rmq-risk-4", concept: "rm-risk-per-trade", type: "knowledge",
      item: { kind: "true-false", statement: "With fixed-fractional risk, every loss takes the same percentage of the current account, so the money at risk on the next trade is smaller after a loss.", answer: true, explain: "True. Risk is a share of what is left, so it shrinks after losses and grows after wins." },
      explanation: "Fixed-fractional sizing risks a constant share of current equity. That is why losses compound: (1 − r)^n of the account remains after n losses.",
    },
    {
      id: "rmq-risk-5", concept: "rm-risk-per-trade", type: "calculation",
      item: { kind: "numeric", prompt: "Risking 10% of the current account per trade, roughly what percentage of the account is left after 4 losses in a row? (to the nearest whole percent)", unit: "%", answer: 66, tolerance: 0.6, explain: "0.9^4 = 0.6561, about 66%." },
      explanation: "Losses compound: after n losses at risk r, (1 − r)^n remains. Large risk levels fall quickly in an ordinary losing run.",
    },
    // rm-sizing
    {
      id: "rmq-size-1", concept: "rm-sizing", type: "calculation",
      item: { kind: "numeric", prompt: "Account $25,000, risk 1%. Entry $80.00, stop $76.00. How many shares (rounded down)?", unit: "shares", answer: 62, tolerance: 0, explain: "Risk $250 ÷ $4 a share = 62.5 → 62 shares." },
      explanation: "Shares = floor(risk ÷ |entry − stop|). Rounding down keeps the actual risk at or under the plan.",
    },
    {
      id: "rmq-size-2", concept: "rm-sizing", type: "calculation",
      item: { kind: "numeric", prompt: "A USD account risks $120 on EUR/USD with a 40-pip stop. How many units (one pip on one unit is worth 0.0001 USD)?", unit: "units", answer: 30000, tolerance: 0, explain: "120 ÷ (40 × 0.0001) = 120 ÷ 0.004 = 30,000 units (0.3 lots)." },
      explanation: "When the quote currency is the account currency, a pip on one unit is worth the pip size (0.0001). Units = risk ÷ (pips × pip value per unit).",
    },
    {
      id: "rmq-size-3", concept: "rm-sizing", type: "knowledge",
      item: {
        kind: "single",
        prompt: "Your account is in US dollars and you trade EUR/GBP. What do you need to turn its pip value into dollars?",
        options: [
          { id: "a", text: "Nothing: a pip is worth $10 a lot on every pair", explain: "Only true when the quote currency is the dollar." },
          { id: "b", text: "The EUR/GBP rate itself", explain: "That converts between euros and pounds, not into dollars." },
          { id: "c", text: "The USD/JPY rate", explain: "The yen plays no part in this pair." },
          { id: "d", text: "A GBP/USD rate, to convert the pound value", explain: "Right. The pip is in pounds; GBP/USD converts it." },
        ],
        correct: "d",
      },
      explanation: "On a cross, the pip value is in the quote currency (here GBP) and must be converted into the account currency with a cross rate (GBP/USD).",
    },
    {
      id: "rmq-size-4", concept: "rm-sizing", type: "applied",
      item: {
        kind: "single",
        prompt: "A futures contract is worth $20 a point. You may risk $150 and your chart-based stop is 10 points away. What fits the plan?",
        options: [
          { id: "a", text: "One contract, after tightening the stop to 7 points", explain: "The stop should come from the chart, not from the size." },
          { id: "b", text: "No contracts: one would risk $200", explain: "Right. 10 × 20 = $200 per contract, more than $150." },
          { id: "c", text: "One contract, rounded up", explain: "That risks a third more than the plan." },
          { id: "d", text: "Seven contracts", explain: "That divides the risk by the point value and ignores the stop." },
        ],
        correct: "b",
      },
      explanation: "Contracts = floor(risk ÷ (stop points × point value)). If that is zero, the trade does not fit; a smaller contract or no trade are the honest answers.",
    },
    {
      id: "rmq-size-5", concept: "rm-sizing", type: "calculation",
      item: { kind: "numeric", prompt: "A USD account risks $100 on USD/JPY at 125.00 with a 20-pip stop. One pip on one unit is 0.01 JPY = 0.01 ÷ 125 USD. How many units?", unit: "units", answer: 62500, tolerance: 0, explain: "Pip value per unit = 0.00008 USD. 100 ÷ (20 × 0.00008) = 100 ÷ 0.0016 = 62,500 units." },
      explanation: "When the base currency is the account currency, divide the pip size by the rate to get the pip value per unit in the account currency.",
    },
    // rm-stops
    {
      id: "rmq-stop-1", concept: "rm-stops", type: "knowledge",
      item: {
        kind: "single",
        prompt: "You buy because a share keeps making higher lows; the last swing low is $33.40. Where does a structure stop belong?",
        options: [
          { id: "a", text: "Slightly below $33.40", explain: "Right. Below it, the higher-low idea fails." },
          { id: "b", text: "At the entry price, to avoid any loss", explain: "Ordinary noise will hit it; it is not tied to the idea." },
          { id: "c", text: "Wherever the size you want comes out at your risk", explain: "That fits the stop to the size." },
          { id: "d", text: "Slightly above the last swing high, where the uptrend would be confirmed", explain: "For a long, the stop is below the entry." },
        ],
        correct: "a",
      },
      explanation: "A structure stop sits beyond the point that would invalidate the idea, with a small buffer: for a long based on higher lows, below the last swing low.",
    },
    {
      id: "rmq-stop-2", concept: "rm-stops", type: "calculation",
      item: { kind: "numeric", prompt: "Entry $64.00, ATR(14) $1.60. What is the price of a 2.5 × ATR stop for a long position?", unit: "US dollars", answer: 60, tolerance: 0.01, explain: "64 − 2.5 × 1.60 = 64 − 4 = 60." },
      explanation: "An ATR stop for a long is entry − k × ATR. It scales the stop to how much the market usually moves.",
    },
    {
      id: "rmq-stop-3", concept: "rm-stops", type: "knowledge",
      item: { kind: "true-false", statement: "Once a trade is open, a stop may be moved to reduce risk but must never be moved further away.", answer: true, explain: "True. Widening a stop turns a planned loss into an unplanned, larger one." },
      explanation: "Stops can only tighten. Moving a stop away when price approaches it is one of the most common ways planned risk is broken.",
    },
    {
      id: "rmq-stop-4", concept: "rm-stops", type: "knowledge",
      item: {
        kind: "multi-select",
        prompt: "Which of these are sound reasons for where a stop is placed? Select all that apply.",
        options: [
          { id: "a", text: "Beyond the swing point that would invalidate the idea", explain: "Right: structure." },
          { id: "b", text: "A multiple of ATR from the entry", explain: "Right: volatility." },
          { id: "c", text: "Close enough to allow the size you wanted", explain: "That puts the size before the market." },
          { id: "d", text: "At an amount of loss that feels bearable today", explain: "A feeling, not a level in the market." },
        ],
        correct: ["a", "b"],
      },
      explanation: "Stops should come from the market: the structure that would prove the idea wrong, or the volatility that ordinary moves produce.",
    },
    {
      id: "rmq-stop-5", concept: "rm-stops", type: "knowledge",
      item: { kind: "true-false", statement: "A structure stop that sits less than one ATR from the entry is usually safe from ordinary noise.", answer: false, explain: "False. Inside one ATR, ordinary bar-to-bar movement will often reach it." },
      explanation: "Check structure stops against ATR. A stop inside the typical bar range is likely to be hit by noise even if the idea is right.",
    },
    // rm-expectancy
    {
      id: "rmq-exp-1", concept: "rm-expectancy", type: "calculation",
      item: { kind: "numeric", prompt: "A method wins 45% of trades with an average win of $200 and an average loss of $100. What is its expectancy per trade in dollars?", unit: "US dollars", answer: 35, tolerance: 0.5, explain: "0.45 × 200 − 0.55 × 100 = 90 − 55 = 35." },
      explanation: "Expectancy = win rate × average win − loss rate × average loss.",
    },
    {
      id: "rmq-exp-2", concept: "rm-expectancy", type: "calculation",
      item: { kind: "numeric", prompt: "What is the break-even win rate, in percent, for a reward-to-risk ratio of 4 : 1?", unit: "%", answer: 20, tolerance: 0.5, explain: "1 ÷ (1 + 4) = 0.2 = 20%." },
      explanation: "Break-even win rate = 1 ÷ (1 + reward-to-risk). Higher payoffs need fewer wins to break even.",
    },
    {
      id: "rmq-exp-3", concept: "rm-expectancy", type: "knowledge",
      item: {
        kind: "single",
        prompt: "An advert promises '85% winning trades'. What is the most important missing information?",
        options: [
          { id: "a", text: "Which markets it trades", explain: "Useful, but it does not tell you whether it makes money." },
          { id: "b", text: "The average win and average loss", explain: "Right. Without them the win rate says almost nothing." },
          { id: "c", text: "How many people use it", explain: "Popularity says nothing about expectancy." },
          { id: "d", text: "The name of the person who designed it and how long they have traded", explain: "Credentials do not replace the numbers." },
        ],
        correct: "b",
      },
      explanation: "Expectancy needs the win rate and the payoff together. An 85% win rate with small wins and large losses can lose money.",
    },
    {
      id: "rmq-exp-4", concept: "rm-expectancy", type: "knowledge",
      item: { kind: "true-false", statement: "A method that wins only 30% of its trades can still have a positive expectancy.", answer: true, explain: "True, if its average win is large enough: above 2.33 times the average loss in this case." },
      explanation: "With a 30% win rate the break-even payoff is 0.7 ÷ 0.3 ≈ 2.33. Above that, the expectancy is positive.",
    },
    {
      id: "rmq-exp-5", concept: "rm-expectancy", type: "applied",
      item: {
        kind: "single",
        prompt: "A trader's first 12 trades show an expectancy of +0.8R. What is the soundest next step?",
        options: [
          { id: "a", text: "Triple the risk per trade, since the method is clearly profitable", explain: "Twelve trades are far too few to rely on." },
          { id: "b", text: "Stop trading it, since early profits mean it is overfitted", explain: "There is no such rule." },
          { id: "c", text: "Keep risk small and record many more trades", explain: "Right. The sample is too small to tell skill from luck." },
          { id: "d", text: "Switch to a method with a higher win rate", explain: "Win rate alone is not the goal." },
        ],
        correct: "c",
      },
      explanation: "Expectancy estimated from a few trades is dominated by chance. Keep risk small until there are many trades, after costs.",
    },
    // rm-drawdown
    {
      id: "rmq-dd-1", concept: "rm-drawdown", type: "calculation",
      item: { kind: "numeric", prompt: "What percentage gain is needed to recover from a 20% loss?", unit: "%", answer: 25, tolerance: 0.2, explain: "0.2 ÷ 0.8 = 0.25, a 25% gain." },
      explanation: "A loss of x needs a gain of x ÷ (1 − x), because the gain is earned on the smaller account.",
    },
    {
      id: "rmq-dd-2", concept: "rm-drawdown", type: "calculation",
      item: { kind: "numeric", prompt: "An account rises from $20,000 to $25,000 and then falls to $21,000. What is the drawdown in percent?", unit: "%", answer: 16, tolerance: 0.2, explain: "(25,000 − 21,000) ÷ 25,000 = 0.16 = 16%." },
      explanation: "Drawdown is measured from the running peak, not from the starting balance.",
    },
    {
      id: "rmq-dd-3", concept: "rm-drawdown", type: "knowledge",
      item: { kind: "true-false", statement: "A 25% loss followed by a 25% gain brings an account exactly back to where it started.", answer: false, explain: "False. 0.75 × 1.25 = 0.9375, about 6% below the start." },
      explanation: "Percentage losses and gains apply to different bases. Recovering from 25% needs 33.3%.",
    },
    {
      id: "rmq-dd-4", concept: "rm-drawdown", type: "knowledge",
      item: { kind: "true-false", statement: "Over hundreds of trades, even a method with a positive expectancy will often have long losing streaks.", answer: true, explain: "True. Streaks happen by chance; their likelihood rises with the number of trades." },
      explanation: "Expectancy is an average. Over many trades, long losing runs are likely, and clustering makes them more likely still.",
    },
    {
      id: "rmq-dd-5", concept: "rm-drawdown", type: "knowledge",
      item: {
        kind: "single",
        prompt: "The streak probabilities in lesson 5 assume independent trades. If losses tend to cluster in real trading, what follows?",
        options: [
          { id: "a", text: "Long streaks are less likely than the numbers show", explain: "Clustering makes them more likely." },
          { id: "b", text: "The numbers are exact anyway", explain: "They rest on the independence assumption." },
          { id: "c", text: "Streaks stop mattering for risk", explain: "They matter more." },
          { id: "d", text: "Long losing streaks are more likely, so the figures are a floor", explain: "Right. Plan for longer runs than the model shows." },
        ],
        correct: "d",
      },
      explanation: "Independent-trade figures understate streaks when results cluster. Treat them as a minimum when planning drawdown rules.",
    },
    // rm-leverage
    {
      id: "rmq-lev-1", concept: "rm-leverage", type: "calculation",
      item: { kind: "numeric", prompt: "A broker allows 1:50. You open a position worth $75,000. How much margin is used?", unit: "US dollars", answer: 1500, tolerance: 0.5, explain: "75,000 ÷ 50 = 1,500." },
      explanation: "Margin = position value ÷ maximum leverage. It is a deposit, not the risk.",
    },
    {
      id: "rmq-lev-2", concept: "rm-leverage", type: "calculation",
      item: { kind: "numeric", prompt: "Effective leverage is 12 : 1. The price moves 1.5% against the position. Roughly how much of the equity is lost, in percent?", unit: "%", answer: 18, tolerance: 0.2, explain: "12 × 1.5% = 18%." },
      explanation: "Equity changes by about effective leverage × the price move.",
    },
    {
      id: "rmq-lev-3", concept: "rm-leverage", type: "knowledge",
      item: {
        kind: "single",
        prompt: "Two traders hold the same $50,000 position with $5,000 of equity, one at a broker allowing 1:30 and one at 1:400. Which statement is right?",
        options: [
          { id: "a", text: "The 1:400 trader has more exposure", explain: "Same position, same exposure." },
          { id: "b", text: "Both have 10 : 1 effective leverage", explain: "Right. 50,000 ÷ 5,000." },
          { id: "c", text: "The 1:30 trader is at greater risk because more margin is held", explain: "Margin held does not change the exposure." },
          { id: "d", text: "Neither is leveraged", explain: "A position ten times equity is leveraged." },
        ],
        correct: "b",
      },
      explanation: "Effective leverage depends on position value and equity. The broker's maximum only sets how much margin is held.",
    },
    {
      id: "rmq-lev-4", concept: "rm-leverage", type: "calculation",
      item: { kind: "numeric", prompt: "Balance $4,000. Long 100,000 units of a pair at 1.0000 with used margin $2,000 (USD account). The broker stops out at a 50% margin level. At what price is the stop-out? (equity must fall to 50% × $2,000)", unit: "price", answer: 0.97, tolerance: 0.0005, explain: "Equity must fall to $1,000, a loss of $3,000. 3,000 ÷ 100,000 = 0.03, so 1.0000 − 0.03 = 0.9700." },
      explanation: "Solve balance − (entry − P) × units = stop-out% × used margin for P. Here a 3% fall closes the position automatically.",
    },
    {
      id: "rmq-lev-5", concept: "rm-leverage", type: "knowledge",
      item: { kind: "true-false", statement: "A broker's stop-out level can be used as a substitute for your own stop-loss.", answer: false, explain: "False. It closes positions at a level you did not choose, often in a fast market, after most of the account is gone." },
      explanation: "Your own stop should be far inside the stop-out level. The broker's forced close is a last resort, not a plan.",
    },
    // rm-heat
    {
      id: "rmq-heat-1", concept: "rm-heat", type: "calculation",
      item: { kind: "numeric", prompt: "Open positions risk 0.5%, 1%, 1% and 0.75% to their stops. What is the portfolio heat in percent?", unit: "%", answer: 3.25, tolerance: 0.01, explain: "0.5 + 1 + 1 + 0.75 = 3.25%." },
      explanation: "Heat is the sum of the open risk to every stop: what is lost if everything goes wrong at once.",
    },
    {
      id: "rmq-heat-2", concept: "rm-heat", type: "knowledge",
      item: {
        kind: "single",
        prompt: "What did Longin and Solnik (2001) find about the correlation between national equity markets?",
        options: [
          { id: "a", text: "It rose in bear markets but not in bull markets", explain: "Right. Diversification helped least in sell-offs." },
          { id: "b", text: "It was stable at all times", explain: "They found it depended on the market trend." },
          { id: "c", text: "It fell during sell-offs", explain: "The opposite." },
          { id: "d", text: "It rose with volatility in both rising and falling markets alike", explain: "They linked it to the trend, not to volatility itself." },
        ],
        correct: "a",
      },
      explanation: "Correlation rose in bear markets. Positions that look diversified in calm times can fall together when it matters most.",
    },
    {
      id: "rmq-heat-3", concept: "rm-heat", type: "calculation",
      item: { kind: "numeric", prompt: "Two positions each risk 3% and their correlation is 0. Treating each risk as a standard deviation, what is the combined risk √(r₁² + r₂²), in percent? (to one decimal)", unit: "%", answer: 4.2, tolerance: 0.06, explain: "√(9 + 9) = √18 ≈ 4.24%." },
      explanation: "With zero correlation, combined risk is the square root of the sum of squares. With correlation +1 it is the simple sum (6%), which is what heat counts.",
    },
    {
      id: "rmq-heat-4", concept: "rm-heat", type: "knowledge",
      item: { kind: "true-false", statement: "Opening more positions always reduces the risk of the portfolio.", answer: false, explain: "False. Positions driven by the same thing add up to one larger bet." },
      explanation: "Only positions with genuinely different drivers reduce risk. Similar ones increase concentration.",
    },
    {
      id: "rmq-heat-5", concept: "rm-heat", type: "knowledge",
      item: {
        kind: "multi-select",
        prompt: "You are long the US dollar against the euro (short EUR/USD). Which of these are mostly the same bet? Select all that apply.",
        options: [
          { id: "a", text: "Short GBP/USD", explain: "Right: long the dollar again." },
          { id: "b", text: "Long USD/CHF", explain: "Right: long the dollar again." },
          { id: "c", text: "Long USD/JPY", explain: "Right: long the dollar again." },
          { id: "d", text: "Long a coffee futures contract", explain: "Mostly driven by crops and weather." },
        ],
        correct: ["a", "b", "c"],
      },
      explanation: "Any position that gains when the dollar strengthens repeats the same idea. Count their risk together.",
    },
    // rm-gaps-limits
    {
      id: "rmq-gap-1", concept: "rm-gaps-limits", type: "calculation",
      item: { kind: "numeric", prompt: "Long 100 shares at $30 with a stop at $28.50. The share opens at $26 and the stop fills there. How much is lost, in dollars?", unit: "US dollars", answer: 400, tolerance: 0.5, explain: "(30 − 26) × 100 = $400, compared with a planned $150." },
      explanation: "After a gap through the stop, the fill is at the open. Loss = (entry − fill) × size, here 2.67 times the plan.",
    },
    {
      id: "rmq-gap-2", concept: "rm-gaps-limits", type: "knowledge",
      item: { kind: "true-false", statement: "A normal stop-loss order guarantees that you exit at the stop price.", answer: false, explain: "False. It becomes a market order; in a gap it fills at the next available price." },
      explanation: "Only a guaranteed stop (where offered, usually for a fee) fills at exactly its price. Normal stops can slip, sometimes a long way.",
    },
    {
      id: "rmq-gap-3", concept: "rm-gaps-limits", type: "knowledge",
      item: {
        kind: "single",
        prompt: "You hold a full-size position in a share that reports results tonight. Which action reduces gap risk?",
        options: [
          { id: "a", text: "Moving the stop further away", explain: "A gap can pass any stop; the loss can be larger." },
          { id: "b", text: "Adding to the position to improve the average", explain: "That increases exposure to the gap." },
          { id: "c", text: "Reducing the position before the report", explain: "Right. Size decides what a gap costs." },
          { id: "d", text: "Placing the stop at a round number", explain: "Round numbers attract clustered stops." },
        ],
        correct: "c",
      },
      explanation: "Size, timing (not holding through events) and paid protection limit gap losses. Moving the stop does not.",
    },
    {
      id: "rmq-gap-4", concept: "rm-gaps-limits", type: "knowledge",
      item: {
        kind: "single",
        prompt: "Coval and Shumway studied proprietary traders at the Chicago Board of Trade. What did traders with morning losses tend to do?",
        options: [
          { id: "a", text: "Stop trading early", explain: "That is what a loss limit would make them do, not what they did." },
          { id: "b", text: "Take above-average risk in the afternoon", explain: "Right. They tried to win the losses back." },
          { id: "c", text: "Trade exactly as they did on other days", explain: "Their behaviour changed." },
          { id: "d", text: "Make their best trades of the day in the afternoon session", explain: "They bought higher and sold lower than usual." },
        ],
        correct: "b",
      },
      explanation: "Loss-chasing affects even professionals. A daily loss limit set in advance is one way to stop it.",
    },
    {
      id: "rmq-gap-5", concept: "rm-gaps-limits", type: "calculation",
      item: { kind: "numeric", prompt: "A daily loss limit is $300. The day's trades so far are −$120, +$40, −$150 and −$90. After which trade (1, 2, 3 or 4) should trading stop?", unit: "trade number", answer: 4, tolerance: 0, explain: "Running total: −120, −80, −230, −320. The limit is reached after trade 4." },
      explanation: "A daily limit stops trading after the trade that takes the day's total to the limit or beyond.",
    },
    // rm-averaging
    {
      id: "rmq-avg-1", concept: "rm-averaging", type: "calculation",
      item: { kind: "numeric", prompt: "Buy 100 shares at $50, then 100 at $40, then 200 at $30. What is the average price per share?", unit: "US dollars", answer: 37.5, tolerance: 0.01, explain: "(5,000 + 4,000 + 6,000) ÷ 400 = 15,000 ÷ 400 = 37.50." },
      explanation: "Average price = total paid ÷ total shares. The average falls, but the position is now four times its first size.",
    },
    {
      id: "rmq-avg-2", concept: "rm-averaging", type: "knowledge",
      item: { kind: "true-false", statement: "Averaging down lowers the average price, and it also increases the loss for every further point the price falls.", answer: true, explain: "True. The loss per point equals the total size, which has grown." },
      explanation: "Averaging down trades a lower break-even for a larger losing position.",
    },
    {
      id: "rmq-avg-3", concept: "rm-averaging", type: "knowledge",
      item: {
        kind: "single",
        prompt: "A martingale starts with 1 unit and doubles after each loss. How many units are held in total after the third add (four buys)?",
        options: [
          { id: "a", text: "4", explain: "That counts the buys, not the units." },
          { id: "b", text: "8", explain: "That is only the last add." },
          { id: "c", text: "16", explain: "That would be the next add." },
          { id: "d", text: "15", explain: "Right. 1 + 2 + 4 + 8 = 15." },
        ],
        correct: "d",
      },
      explanation: "Martingale holdings grow as 2ⁿ⁺¹ − 1. A long enough run exhausts any account.",
    },
    {
      id: "rmq-avg-4", concept: "rm-averaging", type: "knowledge",
      item: {
        kind: "single",
        prompt: "What did Odean (1998) find in the trading records of 10,000 brokerage accounts?",
        options: [
          { id: "a", text: "Investors preferred to realise winners rather than losers", explain: "Right. The disposition effect." },
          { id: "b", text: "Investors sold losers quickly", explain: "The opposite." },
          { id: "c", text: "Holding losers was justified by their later returns", explain: "He found it was not." },
          { id: "d", text: "Investors' choices of what to sell were explained by rebalancing their portfolios", explain: "He tested and rejected that explanation." },
        ],
        correct: "a",
      },
      explanation: "Holding losers too long is a documented tendency. Averaging down is one way it shows up.",
    },
    // rm-ruin
    {
      id: "rmq-ruin-1", concept: "rm-ruin", type: "calculation",
      item: { kind: "numeric", prompt: "What is the Kelly fraction, in percent, for a bet with a 40% win chance that pays 2 : 1?", unit: "%", answer: 10, tolerance: 0.2, explain: "f* = 0.4 − 0.6 ÷ 2 = 0.4 − 0.3 = 0.1 = 10%." },
      explanation: "Kelly f* = p − (1 − p) ÷ b. It assumes the odds are known exactly; with estimated odds, bet far less.",
    },
    {
      id: "rmq-ruin-2", concept: "rm-ruin", type: "knowledge",
      item: {
        kind: "single",
        prompt: "Which sizing rule can take an account all the way to zero in a long losing run?",
        options: [
          { id: "a", text: "Risking a fixed % of current equity", explain: "Each bet shrinks with the account, so it never quite reaches zero." },
          { id: "b", text: "Risking the same dollar amount every trade", explain: "Right. The bet does not shrink as the account does." },
          { id: "c", text: "Neither, provided the method has a positive edge over many trades", explain: "Fixed dollar can still be wiped out by a long run." },
          { id: "d", text: "Both equally", explain: "They behave very differently in losing runs." },
        ],
        correct: "b",
      },
      explanation: "Fixed-fractional bets shrink after losses; fixed-dollar bets do not, so a long run can exhaust the account.",
    },
    {
      id: "rmq-ruin-3", concept: "rm-ruin", type: "knowledge",
      item: { kind: "true-false", statement: "A Monte Carlo simulation of a trading method gives the exact probability of ruin in real trading.", answer: false, explain: "False. It gives the probability under its assumptions; real win rates change and results cluster." },
      explanation: "Simulations describe their model. Uncertainty about the inputs, costs and gaps adds risk on top.",
    },
    {
      id: "rmq-ruin-4", concept: "rm-ruin", type: "knowledge",
      item: { kind: "true-false", statement: "With the same positive edge, a larger risk per trade can make the typical drawdown deeper.", answer: true, explain: "True. Larger bets widen the spread of outcomes and deepen drawdowns." },
      explanation: "Risk per trade controls how far the account swings, even when the edge is unchanged.",
    },
    {
      id: "rmq-ruin-5", concept: "rm-ruin", type: "calculation",
      item: { kind: "numeric", prompt: "In an even-money game with a 60% win chance, starting with 5 units and betting 1 unit at a time, what is the risk of ruin ((0.4 ÷ 0.6)^5), in percent? (to one decimal)", unit: "%", answer: 13.2, tolerance: 0.1, explain: "(2/3)^5 = 32 ÷ 243 ≈ 0.1317, about 13.2%." },
      explanation: "Classic gambler's ruin: ((1 − p) ÷ p)^units. More units (smaller bets relative to the account) cut it sharply.",
    },
    // rm-applied
    {
      id: "rmq-app-1", concept: "rm-applied", type: "applied",
      item: {
        kind: "scenario",
        situation: "A trader risks 1% per trade. After three losing trades this morning they are down 3%, and their daily loss limit is 3%. They see what looks like an excellent set-up.",
        question: "What is the soundest decision?",
        options: [
          { id: "a", text: "Take it at 3% to get back to even in one trade", explain: "Raising risk to recover a loss is exactly what the limit exists to stop.", process: "unsound" },
          { id: "b", text: "Stop for the day as the limit says, and note the set-up for review", explain: "Sound: the limit was set for this moment.", process: "sound" },
          { id: "c", text: "Take it at the usual 1%", explain: "Size is normal, but it breaks the daily limit set in advance.", process: "partial" },
          { id: "d", text: "Remove the daily limit, since today is unusual", explain: "Every bad day feels unusual.", process: "unsound" },
        ],
        outcome: "The set-up would have made 2R. That does not change the grade: the decision was about keeping a rule set in advance, and on other days the same trade loses.",
      },
      explanation: "A daily loss limit is judged on process, not on what the next trade would have done. Keeping it is sound even if the skipped trade would have won.",
    },
    {
      id: "rmq-app-2", concept: "rm-applied", type: "applied",
      item: {
        kind: "scenario",
        situation: "A trader holds a share position sized to risk 1% to its stop. The company reports results after tonight's close; the share has gapped more than 8% after several past reports. The stop is 3% below the price.",
        question: "What is the soundest decision?",
        options: [
          { id: "a", text: "Hold the full position; the stop limits the loss to 1%", explain: "An 8% gap through a 3% stop could lose close to 3%.", process: "unsound" },
          { id: "b", text: "Move the stop to 6% below to avoid being stopped out by the gap", explain: "A wider stop does not stop a gap and can enlarge the loss.", process: "unsound" },
          { id: "c", text: "Hold, and decide what to do once the results come out tonight", explain: "Deciding after the event leaves the gap risk unmanaged.", process: "partial" },
          { id: "d", text: "Reduce the position (or close it) so that a gap like past ones would cost no more than acceptable", explain: "Sound: size the position for the gap, not for the stop.", process: "sound" },
        ],
      },
      explanation: "Before a known event, size for the gap the event might cause. The stop controls ordinary moves, not jumps.",
    },
    {
      id: "rmq-app-3", concept: "rm-applied", type: "applied",
      item: {
        kind: "scenario",
        situation: "A trader bought a share at $40 with a stop at $37. It is now $37.20. They feel sure it will bounce and are thinking of buying the same amount again to lower their average to $38.60.",
        question: "What is the soundest decision?",
        options: [
          { id: "a", text: "Keep the original stop and do not add; if $37 trades, accept the planned loss", explain: "Sound: the planned risk stays fixed.", process: "sound" },
          { id: "b", text: "Buy the same again and move the stop to $35 to give it room", explain: "Doubles the size and widens the stop: risk grows several times.", process: "unsound" },
          { id: "c", text: "Buy the same again and keep the stop at $37", explain: "The loss at $37 is now larger than planned, and the add was made because the trade was losing.", process: "unsound" },
          { id: "d", text: "Halve the position now to reduce risk, while keeping the original stop for the rest", explain: "Reducing is allowed, though it is a new decision made under stress.", process: "partial" },
        ],
      },
      explanation: "Adding to a losing position raises size exactly when the market says the idea may be wrong. The sound choice keeps the original plan.",
    },
    {
      id: "rmq-app-4", concept: "rm-applied", type: "applied",
      item: {
        kind: "scenario",
        situation: "A trader with $3,000 wants to trade EUR/USD. The broker allows 1:500. They plan a 15-pip stop and risk 1% ($30), which gives 20,000 units. A friend says, 'with 1:500 you could trade 10 lots'.",
        question: "What is the soundest decision?",
        options: [
          { id: "a", text: "Trade 10 lots, since the broker allows it", explain: "Effective leverage about 370 : 1; a small move would stop the account out.", process: "unsound" },
          { id: "b", text: "Trade 1 lot as a compromise between the two", explain: "That risks about $150, five times the plan, at about 37 : 1.", process: "unsound" },
          { id: "c", text: "Trade 20,000 units, as the risk calculation says, regardless of the broker's maximum", explain: "Sound: size comes from risk and stop.", process: "sound" },
          { id: "d", text: "Trade 20,000 units but remove the stop because the margin is small", explain: "Without the stop there is no planned loss at all.", process: "unsound" },
        ],
      },
      explanation: "The maximum leverage only sets the margin. The size comes from the risk and the stop; the result here is about 7 : 1 effective leverage.",
    },
  ],
};

/** A second set of questions, kept separate for easier review. */
const MORE_QUESTIONS: TrackAssessment["questions"] = [];

/** A second remediation variant for every concept, used when it is missed again. */
const MORE_REMEDIATION: Record<string, ConceptRemediation> = {
  "rm-risk-per-trade": {
    misconception: "A second trap is thinking that a small risk per trade means small results. Risk per trade controls how fast the account can fall; the method decides whether it grows.",
    altExplanation: "Compare two runners with the same speed: one carries a heavy pack, the other a light one. Over a short race the pack matters little; over a marathon it decides who finishes. Risk per trade is the pack. With a good method, smaller risk still grows the account, just more slowly, while surviving the bad stretches that every method has.",
    altExample: "Eight losses in a row at 1% leave about 92% of the account; at 10% they leave about 43%. Recovering from those needs about 8.4% and about 132% respectively.",
    practice: {
      kind: "single",
      prompt: "Which is the best description of choosing a risk per trade of 1%?",
      options: [
        { id: "a", text: "A legal limit for retail traders", explain: "There is no such law." },
        { id: "b", text: "A guarantee of at most a 1% loss", explain: "Gaps can make a loss larger." },
        { id: "c", text: "A choice that limits how fast a losing run can hurt", explain: "Right. It is a convention you choose." },
        { id: "d", text: "The level that maximises profit for every method", explain: "No single level is best for all." },
      ],
      correct: "c",
    },
  },
  "rm-sizing": {
    misconception: "Another common slip is rounding a size up 'to a round number'. That quietly risks more than planned on every single trade.",
    altExplanation: "Sizing is a division followed by a floor. The division gives the exact size for the risk; the floor drops any fraction of a share, micro lot or contract, so the actual risk is never above the plan. If the floor gives zero, the trade does not fit the account and the risk you chose.",
    altExample: "Risk $100 with a $3 stop: 33.33 shares → 33, risking $99. Rounding to 34 risks $102; to 35, $105. Small amounts, but on every trade.",
    practice: {
      kind: "true-false",
      statement: "If the size calculation for a futures trade gives 0.6 contracts, the trader must not round up to one contract and keep the same stop and risk plan.",
      answer: true,
      explain: "True. One contract would risk two thirds more than the plan; the honest answers are no trade or a smaller contract.",
    },
  },
  "rm-stops": {
    misconception: "Many people believe a wider stop is a safer stop. With a fixed risk it only means a smaller size; with a fixed size it means a bigger loss.",
    altExplanation: "Think of the stop distance and the size as two ends of a seesaw balanced on your risk. Push the stop further away and the size must come down to keep the balance. The stop's job is to sit where the idea is wrong, outside normal noise. 'Safer' is not about distance but about whether the stop is in the right place and the total risk is fixed.",
    altExample: "Risk $300. A $2 stop gives 150 shares; a $6 stop gives 50 shares. Either way, hitting the stop loses $300.",
    practice: {
      kind: "numeric",
      prompt: "With $240 at risk, how many shares does a stop $8 away allow?",
      unit: "shares",
      answer: 30,
      tolerance: 0,
      explain: "240 ÷ 8 = 30 shares.",
    },
  },
  "rm-expectancy": {
    misconception: "A second trap is thinking a distant target makes a trade good. A target only matters together with how often it is reached.",
    altExplanation: "Raising the target raises the payoff but lowers the win rate. Expectancy combines the two, so the question is never 'is 4 : 1 better than 2 : 1?' but 'how often does each get reached, and what does that do to p × W − (1 − p) × L?'. Only many recorded trades can answer it.",
    altExample: "Targets at 2R reached 40% of the time: 0.4 × 2 − 0.6 = +0.2R. Targets at 4R reached 18% of the time: 0.18 × 4 − 0.82 = −0.1R. The bigger target loses.",
    practice: {
      kind: "single",
      prompt: "A method's average win is 2R. What win rate does it need to break even?",
      options: [
        { id: "a", text: "50%", explain: "That is for 1 : 1." },
        { id: "b", text: "About 33%", explain: "Right. 1 ÷ (1 + 2)." },
        { id: "c", text: "20%", explain: "That is for 4 : 1." },
        { id: "d", text: "66%, two wins for every loss", explain: "At 2 : 1, one win pays for two losses." },
      ],
      correct: "b",
    },
  },
  "rm-drawdown": {
    misconception: "Some people measure a drawdown from where they started, so a fall after a good run looks smaller than it is. It is measured from the highest point reached.",
    altExplanation: "Keep a running record of the highest value the account has reached. The drawdown at any moment is the gap between that high and today's value, divided by the high. The largest such gap over a period is the maximum drawdown, and that is what you have to recover from.",
    altExample: "$10,000 rises to $14,000 then falls to $11,200. It is still 12% above the start, but the drawdown is 20%, and it needs a 25% gain to get back to $14,000.",
    practice: {
      kind: "true-false",
      statement: "An account that is above its starting balance can still be in a drawdown.",
      answer: true,
      explain: "True. Drawdown is measured from the running peak, not from the start.",
    },
  },
  "rm-leverage": {
    misconception: "Some traders think the margin they put up is the most they can lose. Losses come from the whole position and can exceed the deposit.",
    altExplanation: "Margin is a deposit, a small slice of the position held by the broker. If the position falls, the whole loss comes out of your equity, not just the margin. When equity falls far enough relative to the margin, the broker calls and then closes the position. In a gap, losses can even exceed the account unless negative balance protection applies.",
    altExample: "A $100,000 position with $2,000 of margin in a $5,000 account: a 4% fall costs $4,000, twice the margin, and is about where a 50% stop-out would close it.",
    practice: {
      kind: "single",
      prompt: "A position worth $80,000 uses $1,600 of margin in a $4,000 account. Roughly how much does a 3% fall cost?",
      options: [
        { id: "a", text: "$48, which is 3% of the margin held by the broker", explain: "The loss is on the whole position." },
        { id: "b", text: "$120", explain: "That is 3% of the account." },
        { id: "c", text: "$1,600, the margin", explain: "Margin is not the limit of the loss." },
        { id: "d", text: "$2,400", explain: "Right. 3% of $80,000." },
      ],
      correct: "d",
    },
  },
  "rm-heat": {
    misconception: "A second trap is trusting a correlation measured over a calm year. Correlations change, and research found they rose in bear markets.",
    altExplanation: "A correlation is an average of how two markets moved together over a past window. It is not a property of the markets. In a crisis, many investors sell everything at once, so markets that usually move separately can fall together. That is why limits are set on the simple total of open risk, and correlation is used to spot concentration, not to justify more risk.",
    altExample: "Two share indices with a calm-period correlation of 0.4 can both fall 10% in the same week of a sell-off. Two 2% positions then behave like one 4% position.",
    practice: {
      kind: "true-false",
      statement: "A correlation measured over a calm period may understate how closely positions move together in a sell-off.",
      answer: true,
      explain: "True. Correlations tend to rise in bear markets.",
    },
  },
  "rm-gaps-limits": {
    misconception: "Another trap is removing a daily loss limit 'just this once' after a bad morning. That is the moment the limit exists for.",
    altExplanation: "A daily loss limit is a decision made while calm, for a moment when you will not be. Research on professional traders found they took more risk in the afternoon after morning losses, and did worse for it. The limit works only if it is fixed in advance and kept, whether or not the skipped trades would have won.",
    altExample: "A trader sets a 2R daily limit. After −2R by 11am they stop. The next set-up would have won; on another day it would have lost. Over months, the limit removes the worst days.",
    practice: {
      kind: "single",
      prompt: "What is a daily loss limit mainly for?",
      options: [
        { id: "a", text: "Making sure every day ends in profit", explain: "It cannot do that." },
        { id: "b", text: "Capping bad days and stopping loss-chasing", explain: "Right. It limits damage, not opportunity." },
        { id: "c", text: "Choosing the best time to stop each day by reading how the market is moving", explain: "It is a fixed rule, not a forecast." },
        { id: "d", text: "Allowing larger trades until the limit is reached", explain: "It is not a licence to raise size." },
      ],
      correct: "b",
    },
  },
  "rm-averaging": {
    misconception: "Some confuse averaging down with planned scaling. Planned scaling fixes the total risk before the first order; averaging down adds because the trade is losing.",
    altExplanation: "Ask when the decision to add was made. If it was before the trade, with set prices, one stop for the whole position and a total risk that never exceeds the plan, it is planned scaling. If it was made after the price fell, to lower the average or 'give it a chance', it is averaging down and the total risk is no longer controlled.",
    altExample: "Plan: buy a third at $50, $48 and $46, one stop at $44, total risk 1%. That is scaling. Buying more at $44 instead of exiting at the stop is averaging down.",
    practice: {
      kind: "true-false",
      statement: "Buying more of a losing position always reduces the money you would lose if the price falls further.",
      answer: false,
      explain: "False. It increases the size, so each further point of fall costs more.",
    },
  },
  "rm-ruin": {
    misconception: "A second trap is betting the full Kelly fraction. Kelly assumes the odds are known exactly; with an estimated edge it can be far too large.",
    altExplanation: "Kelly gives the bet size that grows capital fastest in the long run when the probabilities are exactly right. Above it, growth falls and drawdowns deepen; at twice Kelly growth is roughly zero. Because a trader's edge is only an estimate, often an optimistic one, practitioners bet a fraction of Kelly or start from the drawdown they can tolerate instead.",
    altExample: "A trader estimates p = 0.55 at 1 : 1, so Kelly is 10%. If the true p is 0.52, true Kelly is 4%, and betting 10% is about two and a half times it.",
    practice: {
      kind: "numeric",
      prompt: "What is the Kelly fraction, in percent, for an even-money bet (1 : 1) with a 60% win chance?",
      unit: "%",
      answer: 20,
      tolerance: 0.2,
      explain: "f* = 2p − 1 = 2 × 0.60 − 1 = 0.20 = 20%.",
    },
  },
  "rm-applied": {
    misconception: "A second trap in scenarios is judging a decision by what happened next. A sound decision can lose and a reckless one can win.",
    altExplanation: "Grade the process. Did the decision keep the loss to the stop within the per-trade limit, keep total risk within its limit, account for known events, and avoid chasing a loss? If yes, it was sound even if the trade lost. If no, it was unsound even if it made money, because repeated often enough it ends the account.",
    altExample: "A trader doubles size after three losses and wins. The outcome was good, the process unsound: on the days the doubled trade loses, the drawdown deepens fast.",
    practice: {
      kind: "scenario",
      situation: "A trader's method has a positive expectancy over 300 recorded trades. They are in a 12% drawdown after an ordinary-looking losing streak, within what their simulation said to expect.",
      question: "What is the soundest decision?",
      options: [
        { id: "a", text: "Double the risk per trade to recover faster", explain: "It deepens the hole if the streak continues.", process: "unsound" },
        { id: "b", text: "Abandon the method and look for a new one", explain: "The drawdown is within what was expected; abandoning it on that basis alone is premature.", process: "partial" },
        { id: "c", text: "Keep the risk per trade fixed (or reduce it) and follow the pre-set drawdown rules", explain: "Sound: the plan anticipated this.", process: "sound" },
        { id: "d", text: "Switch to fixed-dollar sizing at the original amount", explain: "That raises the effective risk on a smaller account.", process: "unsound" },
      ],
    },
  },
};

export const RISK_MANAGEMENT_ASSESSMENT: TrackAssessment = {
  ...BASE,
  concepts: BASE.concepts.map((c) => ({ ...c, moreRemediation: MORE_REMEDIATION[c.id] ? [MORE_REMEDIATION[c.id]] : [] })),
  questions: [...BASE.questions, ...MORE_QUESTIONS],
};
