import type { ConceptRemediation, TrackAssessment } from "../types";

/*
  Track 2 assessment: Forex Foundations.
  Every rate, size and charge is a made-up example, not a live quote.
  Leverage, margin and position sizing are safety-critical: every question
  on them must be right to pass.
*/

const T = "forex-foundations";

const BASE: TrackAssessment = {
  trackId: T,
  intro:
    "One question for each key idea from the seven lessons, with calculations and an applied scenario. You need 90% or more AND every safety-critical question right: position sizing, margin, margin calls and leverage. A high score with a single safety-critical miss is not a pass, because those are the mistakes that empty accounts.",
  concepts: [
    {
      id: "fx-quotes",
      title: "Reading and converting quotes",
      lessonIds: ["fx-quotes"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "The usual slips are multiplying when you should divide (or the reverse), and using the mid-price instead of the ask when buying.",
        altExplanation: "Write the units next to the rate and let them cancel. EUR/USD 1.0850 means 1.0850 USD per 1 EUR. Euros × (USD per EUR) gives USD; USD ÷ (USD per EUR) gives EUR. When you buy the base currency now you pay the [[ask]]; when you sell it you get the [[bid]].",
        altExample: "USD/CHF at 0.9000 means 0.90 francs per dollar. 500 dollars × 0.90 = 450 francs. 450 francs ÷ 0.90 = 500 dollars. The units tell you which way to go.",
        practice: {
          kind: "numeric",
          prompt: "EUR/USD is bid 1.0998, ask 1.1000. You buy 3,000 euros straight away. How many US dollars do you pay?",
          unit: "US dollars",
          answer: 3300,
          tolerance: 0.01,
          explain: "Buying the base currency happens at the ask: 3,000 × 1.1000 = 3,300 dollars.",
        },
      },
      flashcard: { front: "Which price do you pay?", back: "Buy the base currency at the ask; sell it at the bid. You never trade at the mid-price." },
    },
    {
      id: "fx-pips",
      title: "Finding the pip",
      lessonIds: ["fx-pips-lots"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "It is easy to count the extra fifth digit (the pipette) as a pip, or to use the fourth decimal for yen pairs, where the pip is the second decimal.",
        altExplanation: "Find the pip first, then count. For most pairs the pip is 0.0001: the fourth decimal. For yen pairs it is 0.01: the second decimal. Any digit after that is a [[pipette]], a tenth of a pip. Subtract the two prices and divide by the pip size.",
        altExample: "AUD/USD from 0.65432 to 0.65512: the difference is 0.00080, and 0.00080 ÷ 0.0001 = 8 pips (the last digit is pipettes). EUR/JPY from 160.10 to 160.85: 0.75 ÷ 0.01 = 75 pips.",
        practice: {
          kind: "numeric",
          prompt: "EUR/JPY moves from 161.40 to 160.95. How many pips is that move?",
          unit: "pips",
          answer: 45,
          tolerance: 0,
          explain: "Yen pair, so the pip is 0.01. 161.40 − 160.95 = 0.45, and 0.45 ÷ 0.01 = 45 pips.",
        },
      },
      flashcard: { front: "Pip size", back: "0.0001 for most pairs, 0.01 for yen pairs. A fifth (or third) decimal is a pipette, a tenth of a pip." },
    },
    {
      id: "fx-pip-value",
      title: "What a pip is worth",
      lessonIds: ["fx-pips-lots"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "\"Ten dollars a pip per standard lot\" is often used for every pair. It is exact only when the US dollar is the quote currency and the account is in dollars.",
        altExplanation: "[[pip-value|Pip value]] is always worked out in the QUOTE currency first: pip size × units. Then convert into your [[account-currency|account currency]]. If the account currency is the base, divide by the pair's rate.",
        altExample: "20,000 units of USD/CHF: 0.0001 × 20,000 = 2 francs per pip. In a dollar account, with USD/CHF at 0.8000, that is 2 ÷ 0.80 = 2.50 dollars per pip.",
        practice: {
          kind: "numeric",
          prompt: "You trade 30,000 units of GBP/USD in a US dollar account. What is one pip worth, in dollars?",
          unit: "US dollars",
          answer: 3,
          tolerance: 0.001,
          explain: "The quote currency is the dollar: 0.0001 × 30,000 = 3 dollars per pip, no conversion needed.",
        },
      },
      flashcard: { front: "Pip value", back: "Pip size × units, in the quote currency; then convert to your account currency." },
    },
    {
      id: "fx-sizing",
      title: "Position sizing from risk",
      lessonIds: ["fx-pips-lots"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "The dangerous habit is picking a size that \"feels right\" and then placing the stop to fit, or believing that the planned loss is the most you can lose.",
        altExplanation: "Work backwards, always in this order. 1) Decide the most you will lose: account × risk %. 2) Put the stop where the trade idea is proved wrong; that gives the stop distance. 3) Size = money at risk ÷ (stop distance × pip value per unit). The planned loss assumes the stop fills at its level; a gap or a fast market can fill it further away.",
        altExample: "A $2,000 account risking 2% has $40 at risk. With a 20-pip stop on EUR/USD (0.0001 dollars per unit per pip): 40 ÷ (20 × 0.0001) = 20,000 units. Move the stop to 40 pips and the size halves to 10,000 units: the risk stays $40.",
        practice: {
          kind: "numeric",
          prompt: "Your account is $4,000 and you risk 1% per trade. Your stop is 25 pips away on EUR/USD (0.0001 dollars per unit per pip). How many units should you trade?",
          unit: "units",
          answer: 16000,
          tolerance: 0,
          explain: "Risk: $40. Size = 40 ÷ (25 × 0.0001) = 40 ÷ 0.0025 = 16,000 units.",
        },
      },
      flashcard: { front: "Position size", back: "Units = (account × risk %) ÷ (stop distance in pips × pip value per unit). Decide the risk first." },
    },
    {
      id: "fx-margin",
      title: "Margin is a deposit, not the price",
      lessonIds: ["fx-leverage-margin"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "The dangerous belief is that the margin is what the trade costs, so it is the most you can lose. Margin is only a deposit; gains and losses are on the full notional value.",
        altExplanation: "Two numbers matter: the [[notional-value|notional value]] (units × price, the size of your exposure) and the [[margin]] (notional ÷ leverage, the deposit the broker locks). Your profit and loss come from the notional, not the margin.",
        altExample: "Renting a car needs a $300 deposit, but if you crash a $30,000 car the bill is not capped at $300. Margin is the deposit; the notional value is the car.",
        practice: {
          kind: "numeric",
          prompt: "You open 20,000 units of GBP/USD at 1.2500 in a US dollar account, at 1:30 leverage. How much margin is locked, in dollars? Round to the nearest dollar.",
          unit: "US dollars",
          answer: 833,
          tolerance: 1,
          explain: "Notional: 20,000 × 1.25 = 25,000 dollars. Margin: 25,000 ÷ 30 ≈ 833 dollars.",
        },
      },
      flashcard: { front: "Margin", back: "Notional value ÷ leverage. A deposit, not a price: losses are on the full notional value." },
    },
    {
      id: "fx-margin-call",
      title: "Margin level, margin calls and stop-outs",
      lessonIds: ["fx-leverage-margin"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "Two beliefs cause damage: that a margin call is just a friendly email, and that a stop-out always closes at the stop-out level.",
        altExplanation: "[[margin-level|Margin level]] = equity ÷ used margin × 100. As losses grow, equity falls while used margin stays the same, so the level drops. At the broker's [[margin-call|margin call]] level you are warned and usually blocked from new trades. At its [[stop-out]] level it closes positions automatically, at the next available price, which after a gap can be well past that level.",
        altExample: "Equity $900, used margin $600: margin level 150%. Lose $300 and equity is $600: margin level 100%, a typical margin-call level. Lose another $300 and equity is $300: 50%, a typical stop-out level.",
        practice: {
          kind: "numeric",
          prompt: "Your equity is $500 and your used margin is $400. What is your margin level, in %?",
          unit: "%",
          answer: 125,
          tolerance: 0.01,
          explain: "500 ÷ 400 × 100 = 125%.",
        },
      },
      flashcard: { front: "Margin level", back: "Equity ÷ used margin × 100. Margin call at the broker's warning level; stop-out closes positions automatically." },
    },
    {
      id: "fx-leverage",
      title: "Why high leverage hurts",
      lessonIds: ["fx-leverage-margin"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "A common confusion is that leverage changes how much each pip is worth. It does not: position size does. Leverage decides how big a position your deposit ALLOWS, and big positions are what wipe accounts out.",
        altExplanation: "Hold the position size fixed and change the leverage: the pip value does not change, only the margin locked does. The danger is what high leverage tempts you to do: open a position so large that a normal wobble of a few dozen pips erases the account.",
        altExample: "A $1,000 account at 1:500 can open about 4.5 lots of EUR/USD near 1.10, where a pip is worth about $45. A 20-pip move, well under a normal day's range, would take about $900. At 0.10 lots (any leverage), the same move costs $20.",
        practice: {
          kind: "true-false",
          statement: "If you keep the same position size, switching from 1:30 to 1:500 leverage makes each pip worth more.",
          answer: false,
          explain: "False. Pip value depends on position size, not on leverage. Higher leverage only lowers the margin needed, which makes bigger positions possible.",
        },
      },
      flashcard: { front: "Leverage and pip value", back: "Leverage does not change pip value; position size does. High leverage makes dangerously large positions possible." },
    },
    {
      id: "fx-pairs",
      title: "Majors, minors and exotics",
      lessonIds: ["fx-pairs"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "It is tempting to treat every pair as the same product. Exotic pairs usually cost more to trade and can jump further and faster, and a pegged currency can break suddenly.",
        altExplanation: "Liquidity follows volume. [[major-pair|Major pairs]] (the US dollar against the euro, yen, pound, Swiss franc, Australian, Canadian or New Zealand dollar) trade in enormous volume, so many market makers compete and spreads are tight. [[exotic-pair|Exotic pairs]] trade far less, so fewer firms quote them and spreads are wider.",
        altExample: "A busy high street has many coffee shops, so prices stay close. A remote village with one shop can charge more and might shut without warning. Majors are the high street; exotics are the village.",
        practice: {
          kind: "single",
          prompt: "Which of these is a minor pair (a cross), rather than a major or an exotic?",
          options: [
            { id: "a", text: "USD/JPY (US dollar and Japanese yen)", explain: "The US dollar against the yen is a major." },
            { id: "b", text: "EUR/GBP (the euro and the British pound)", explain: "Right. Two major currencies without the US dollar make a minor pair, or cross." },
            { id: "c", text: "USD/ZAR (US dollar and South African rand)", explain: "The South African rand makes this an exotic." },
            { id: "d", text: "GBP/USD (British pound and US dollar)", explain: "The pound against the US dollar is a major." },
          ],
          correct: "b",
        },
      },
      flashcard: { front: "Major pair", back: "The US dollar against EUR, JPY, GBP, CHF, AUD, CAD or NZD. Deepest liquidity, tightest spreads." },
    },
    {
      id: "fx-sessions",
      title: "Sessions, liquidity and weekend gaps",
      lessonIds: ["fx-sessions"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Because forex trades around the clock on weekdays, people assume it is always equally liquid, and that the weekend pauses risk. Spreads change through the day, and news over the weekend can gap the price at the reopen.",
        altExplanation: "Liquidity is about people at their desks. When two big centres are open at once (a [[session-overlap|session overlap]]), more people trade and spreads tighten. Late in the New York afternoon and over holidays, fewer people trade, so spreads widen. Over the weekend the market is shut but the news is not, so Sunday's first price can be far from Friday's close.",
        altExample: "A shop's queues are shortest when all the tills are open. When most tills close, you wait longer and pay for it in time. Spreads are the market's queue.",
        practice: {
          kind: "true-false",
          statement: "The London–New York overlap usually brings the most participants and the tightest spreads in the major pairs.",
          answer: true,
          explain: "True. Two of the biggest centres are open at once, so liquidity is deepest. Important US data often comes out then too, so sharp moves are possible.",
        },
      },
      flashcard: { front: "Weekend gap", back: "News over the weekend can open the market far from Friday's close. Stops fill at the first available price." },
    },
    {
      id: "fx-drivers",
      title: "Rates, expectations and surprise",
      lessonIds: ["fx-drivers"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "The mistake is to read the headline (\"rates up\") and expect the textbook move. Markets react to the difference between what happened and what was expected.",
        altExplanation: "Interest rates are the main long-run engine: other things equal, a currency whose central bank is expected to raise rates tends to be supported. But by decision day, the expected move is usually [[priced-in|priced in]]. Watch the expectation, then the surprise; and remember that other news and positioning can override the textbook reaction.",
        altExample: "If everyone expects a 0.25% rise and the bank raises by 0.50%, that is a hawkish surprise. If it raises by 0.25% but signals no more rises, the currency can fall on a rate rise, because the outlook was less hawkish than expected.",
        practice: {
          kind: "single",
          prompt: "Markets expect a central bank to cut rates. It holds them unchanged instead. Other things equal, what is the textbook reaction for its currency?",
          options: [
            { id: "a", text: "It tends to weaken, because no change means no news", explain: "No change WAS news here: a cut was expected and did not happen." },
            { id: "c", text: "No reaction at all, because only rate rises ever move currencies", explain: "Holds and cuts move currencies too when they differ from expectations." },
            { id: "b", text: "It tends to strengthen, because rates are higher than expected", explain: "Right. Relative to expectations, this is a hawkish surprise." },
            { id: "d", text: "It always falls on any central bank meeting day", explain: "There is no such rule; the reaction depends on the surprise." },
          ],
          correct: "b",
        },
      },
      flashcard: { front: "Surprise vs expectation", back: "Markets move on the gap between what happened and what was expected. Expected news is mostly priced in." },
    },
    {
      id: "fx-costs",
      title: "Spreads, commissions and swaps",
      lessonIds: ["fx-costs"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "People tend to count only the spread, forget the commission on both sides, and assume a negative swap on one side means a positive swap on the other.",
        altExplanation: "Turn every cost into money for your size. Spread cost = spread in pips × pip value. Add the round-trip [[commission]]. For each night held, add or subtract the [[swap]]; the Wednesday rollover usually counts three days because settlement moves across the weekend. The broker's markup is taken on both sides, so both swaps can be negative.",
        altExample: "0.5 lots of EUR/USD (pip value $5) with a 1.0-pip spread and a $3.50 round-trip commission: 1.0 × 5 + 3.50 = $8.50 before swaps. Held over Wednesday night with a −$0.60 nightly swap: another 3 × 0.60 = $1.80.",
        practice: {
          kind: "numeric",
          prompt: "You trade 2 standard lots of EUR/USD (pip value $20 in total) with a 0.8-pip spread and a total round-trip commission of $14, in a dollar account. What is the total cost of opening and closing, in dollars?",
          unit: "US dollars",
          answer: 30,
          tolerance: 0.01,
          explain: "Spread: 0.8 × $20 = $16. Plus commission $14 = $30.",
        },
      },
      flashcard: { front: "Triple swap", back: "The Wednesday rollover usually counts three days, because settlement moves across the weekend." },
    },
    {
      id: "fx-applied",
      title: "Applied scenario: leverage around news",
      lessonIds: ["fx-leverage-margin", "fx-drivers", "fx-pips-lots"],
      critical: true,
      safetyCritical: false,
      applied: true,
      remediation: {
        misconception: "The trap is letting a big expected move, or a good outcome, justify a big position. A sound plan sizes from a small fixed risk and accounts for wider spreads and slippage around news.",
        altExplanation: "For every trade, write three lines before you click: how much you will lose if wrong (in money), where the stop goes and why, and what could make the fill worse than planned (news, gaps, thin hours). If you cannot fill in all three, the sound decision is not to trade yet.",
        altExample: "A pilot runs the same checklist on a calm day and a stormy day. A storm (a news release) is a reason to be more careful, not a reason to skip the checklist.",
        practice: {
          kind: "scenario",
          situation: "Your EUR/USD trade is 30 pips in profit an hour before a major US jobs report. Your written plan says: stop at entry, and if a major release is due while the trade is open, cut the position to half beforehand.",
          question: "Which response follows a sound process?",
          options: [
            { id: "a", text: "Double the position before the report to make more", explain: "Adding size before a release raises the risk exactly when slippage is most likely, and breaks the plan.", process: "unsound" },
            { id: "b", text: "Remove the stop so a spike can't knock you out", explain: "A spike against you could then cost far more than planned.", process: "unsound" },
            { id: "d", text: "Keep the full position because it is in profit and the news rule feels too cautious", explain: "The stop stays, but you drop your own news rule at the moment it was written for.", process: "partial" },
            { id: "c", text: "Follow the plan: cut to half before the report and keep the stop at entry", explain: "Right. You follow the rules you set, knowing the stop may still fill worse in a spike.", process: "sound" },
          ],
        },
      },
      flashcard: { front: "Sound process", back: "Decide the money at risk, the stop and what could make the fill worse, before entering. Outcomes do not grade decisions." },
    },
  ],
  questions: [
    // fx-quotes
    {
      id: "fx-q-quotes-1", concept: "fx-quotes", type: "calculation",
      explanation: "Buying euros (the base) happens at the ask: 2,000 × 1.0850 = 2,170 dollars.",
      item: { kind: "numeric", prompt: "EUR/USD is bid 1.0848, ask 1.0850. You buy 2,000 euros straight away. How many US dollars do you pay?", unit: "US dollars", answer: 2170, tolerance: 0.01, explain: "Pay the ask: 2,000 × 1.0850 = 2,170 dollars." },
    },
    {
      id: "fx-q-quotes-2", concept: "fx-quotes", type: "calculation",
      explanation: "USD/JPY 150 means 150 yen per dollar. 45,000 ÷ 150 = 300 dollars.",
      item: { kind: "numeric", prompt: "USD/JPY is 150.00. How many US dollars is 45,000 yen, ignoring costs?", unit: "US dollars", answer: 300, tolerance: 0.01, explain: "Yen are the quote currency, so divide: 45,000 ÷ 150 = 300 dollars." },
    },
    {
      id: "fx-q-quotes-3", concept: "fx-quotes", type: "knowledge",
      explanation: "A rising EUR/USD means one euro buys more dollars: the euro has appreciated against the dollar.",
      item: {
        kind: "single",
        prompt: "EUR/USD rises from 1.0800 to 1.0900. What has happened?",
        options: [
          { id: "b", text: "The euro has strengthened against the dollar", explain: "Right. The euro appreciated: it buys more dollars than before." },
          { id: "a", text: "The dollar has strengthened against the euro by 100 pips", explain: "The reverse: one euro now buys more dollars." },
          { id: "c", text: "Both currencies have lost value", explain: "A pair's price only shows one currency against the other." },
          { id: "d", text: "The spread has widened by 100 pips", explain: "That is a move in the price, not the spread." },
        ],
        correct: "b",
      },
    },
    // fx-pips
    {
      id: "fx-q-pips-1", concept: "fx-pips", type: "calculation",
      explanation: "1.2671 − 1.2634 = 0.0037, and 0.0037 ÷ 0.0001 = 37 pips.",
      item: { kind: "numeric", prompt: "GBP/USD moves from 1.2634 to 1.2671. How many pips is that move?", unit: "pips", answer: 37, tolerance: 0, explain: "0.0037 ÷ 0.0001 = 37 pips." },
    },
    {
      id: "fx-q-pips-2", concept: "fx-pips", type: "calculation",
      explanation: "Yen pair, so the pip is 0.01. 150.25 − 149.80 = 0.45, which is 45 pips.",
      item: { kind: "numeric", prompt: "USD/JPY moves from 149.80 to 150.25. How many pips is that move?", unit: "pips", answer: 45, tolerance: 0, explain: "0.45 ÷ 0.01 = 45 pips." },
    },
    {
      id: "fx-q-pips-3", concept: "fx-pips", type: "knowledge",
      explanation: "The digit after the pip is a pipette, a tenth of a pip.",
      item: {
        kind: "single",
        prompt: "A broker shows EUR/USD as 1.10253. What is the final 3?",
        options: [
          { id: "a", text: "Three pips", explain: "The pip is the fourth decimal; the 3 is the fifth." },
          { id: "c", text: "Three pipettes: tenths of a pip", explain: "Right. Brokers show one extra digit, the pipette." },
          { id: "b", text: "The spread in pips", explain: "The spread is the gap between bid and ask, not a digit of one price." },
          { id: "d", text: "The broker's commission", explain: "Commission is charged separately, not shown inside the price." },
        ],
        correct: "c",
      },
    },
    // fx-pip-value
    {
      id: "fx-q-pv-1", concept: "fx-pip-value", type: "calculation",
      explanation: "The dollar is the quote currency: 0.0001 × 50,000 = 5 dollars per pip.",
      item: { kind: "numeric", prompt: "You trade 50,000 units of EUR/USD in a US dollar account. What is one pip worth, in dollars?", unit: "US dollars", answer: 5, tolerance: 0.001, explain: "0.0001 × 50,000 = 5 dollars per pip." },
    },
    {
      id: "fx-q-pv-2", concept: "fx-pip-value", type: "calculation",
      explanation: "In the quote currency: 0.01 × 100,000 = 1,000 yen. The account is in dollars (the base), so divide by the rate: 1,000 ÷ 125 = 8 dollars.",
      item: { kind: "numeric", prompt: "You trade 100,000 units of USD/JPY in a US dollar account, with USD/JPY at 125.00. What is one pip worth, in dollars?", unit: "US dollars", answer: 8, tolerance: 0.01, explain: "1,000 yen ÷ 125 = 8 dollars per pip." },
    },
    // fx-sizing (safety-critical)
    {
      id: "fx-q-size-1", concept: "fx-sizing", type: "calculation",
      explanation: "Risk: 1% of $8,000 = $80. Units = 80 ÷ (40 × 0.0001) = 80 ÷ 0.004 = 20,000 units.",
      item: { kind: "numeric", prompt: "Your account is $8,000 and you risk 1% per trade. Your stop is 40 pips away on EUR/USD (0.0001 dollars per unit per pip). How many units should you trade?", unit: "units", answer: 20000, tolerance: 0, explain: "80 ÷ (40 × 0.0001) = 20,000 units." },
    },
    {
      id: "fx-q-size-2", concept: "fx-sizing", type: "knowledge",
      explanation: "The planned loss assumes the stop fills at its level. A gap or a fast market can fill it further away, so the real loss can be larger.",
      item: {
        kind: "single",
        prompt: "You size a trade so that hitting your 25-pip stop loses $50. Which statement is right?",
        options: [
          { id: "a", text: "The stop-loss guarantees the loss can be $50 at the very most", explain: "A stop fills at the next available price; a gap can make it worse." },
          { id: "c", text: "Leverage decides the loss, so it could be any amount", explain: "Position size and stop distance decide the planned loss, not leverage." },
          { id: "b", text: "$50 is the plan; a gap could fill the stop further away", explain: "Right. Sizing controls the planned loss, but slippage and gaps can add to it." },
          { id: "d", text: "Pick the size first, then place the stop to fit it", explain: "That is backwards. Place the stop where the idea is wrong, then size from the risk." },
        ],
        correct: "b",
      },
    },
    {
      id: "fx-q-size-3", concept: "fx-sizing", type: "applied",
      explanation: "A long trade's stop goes below the entry. 1.1000 − 40 pips (0.0040) = 1.0960.",
      item: {
        kind: "chart-annotate",
        prompt: "You buy EUR/USD at 1.1000, the last close on this illustrative chart, and your plan risks 40 pips. Mark the level where your stop-loss belongs.",
        series: [1.0955, 1.0975, 1.0962, 1.0981, 1.0994, 1.0987, 1.1006, 1.1018, 1.1009, 1.1023, 1.1012, 1.1000],
        decimals: 4,
        target: { mode: "level", value: 1.096, tolerance: 0.0005 },
        explain: "For a long (buy) trade the stop sits below the entry: 1.1000 − 0.0040 = 1.0960. Anything within 5 pips counts.",
      },
    },
    // fx-margin (safety-critical)
    {
      id: "fx-q-margin-1", concept: "fx-margin", type: "calculation",
      explanation: "Notional: 10,000 × 1.20 = 12,000 dollars. Margin: 12,000 ÷ 30 = 400 dollars.",
      item: { kind: "numeric", prompt: "You open 10,000 units of EUR/USD at 1.2000 in a US dollar account, at 1:30 leverage. How much margin is locked, in dollars?", unit: "US dollars", answer: 400, tolerance: 1, explain: "12,000 ÷ 30 = 400 dollars." },
    },
    {
      id: "fx-q-margin-2", concept: "fx-margin", type: "calculation",
      explanation: "Margin = notional ÷ leverage = 50,000 ÷ 100 = 500 dollars.",
      item: { kind: "numeric", prompt: "A position has a notional value of $50,000 and your leverage is 1:100. How much margin is locked, in dollars?", unit: "US dollars", answer: 500, tolerance: 1, explain: "50,000 ÷ 100 = 500 dollars." },
    },
    {
      id: "fx-q-margin-3", concept: "fx-margin", type: "knowledge",
      explanation: "Margin is a deposit. Profit and loss are calculated on the full notional value, so losses can exceed the margin.",
      item: { kind: "true-false", statement: "At 1:30 leverage, the margin is the price of the position, so it is the most you can lose on it.", answer: false, explain: "False. Margin is a deposit. Losses are on the full notional value, so they can be many times the margin." },
    },
    // fx-margin-call (safety-critical)
    {
      id: "fx-q-mcall-1", concept: "fx-margin-call", type: "calculation",
      explanation: "Margin level = equity ÷ used margin × 100 = 600 ÷ 400 × 100 = 150%.",
      item: { kind: "numeric", prompt: "Your equity is $600 and your used margin is $400. What is your margin level, in %?", unit: "%", answer: 150, tolerance: 0.01, explain: "600 ÷ 400 × 100 = 150%." },
    },
    {
      id: "fx-q-mcall-2", concept: "fx-margin-call", type: "knowledge",
      explanation: "At the stop-out level the broker starts closing positions automatically. Which one goes first depends on the broker; some close the largest loser first. The loss becomes real.",
      item: {
        kind: "single",
        prompt: "Your broker's stop-out level is 50%, and your margin level falls to 50%. What happens?",
        options: [
          { id: "a", text: "You get an email, and the trade stays open until you act", explain: "That is closer to a margin call. At stop-out the broker acts without waiting." },
          { id: "b", text: "Your leverage is lowered and the trade carries on", explain: "Brokers do not lower leverage to keep a losing trade open." },
          { id: "d", text: "The losses are paused until the market recovers", explain: "Markets do not pause losses for anyone." },
          { id: "c", text: "The broker starts closing your positions automatically", explain: "Right. Positions are closed at the next available price, and the loss is now real." },
        ],
        correct: "c",
      },
    },
    {
      id: "fx-q-mcall-3", concept: "fx-margin-call", type: "knowledge",
      explanation: "A stop-out is processed at the next available price. After a gap, the loss can be larger than the stop-out level suggests.",
      item: { kind: "true-false", statement: "A stop-out closes your position at the stop-out level, so you know the loss in advance.", answer: false, explain: "False. It is processed at the next available price. After a weekend gap or a shock, the loss can go past that level and, without protection, beyond your deposit." },
    },
    // fx-leverage (safety-critical)
    {
      id: "fx-q-lev-1", concept: "fx-leverage", type: "knowledge",
      explanation: "Leverage does not change pip value; position size does. A's much bigger position makes each pip worth far more, so a small move wipes out the account.",
      item: {
        kind: "single",
        prompt: "Two traders each have $1,000. A uses 1:500 to open 4 lots of EUR/USD; B uses 1:30 to open 0.2 lots. Why is A far more likely to be wiped out?",
        options: [
          { id: "b", text: "A's position is 20 times bigger, so each pip costs 20 times more", explain: "Right. About $40 a pip against $2: a 25-pip move costs A about $1,000." },
          { id: "a", text: "1:500 leverage makes each pip worth more, whatever the position size", explain: "Pip value depends on position size, not leverage." },
          { id: "c", text: "Brokers charge higher spreads at higher leverage", explain: "Spreads are not set by your leverage." },
          { id: "d", text: "B's trade can never lose money at 1:30", explain: "B can lose too, just far more slowly." },
        ],
        correct: "b",
      },
    },
    {
      id: "fx-q-lev-2", concept: "fx-leverage", type: "knowledge",
      explanation: "Leverage lets a small deposit control a larger position, and losses are on the full position. It does not change pip value at a given size, and low leverage does not make trading safe.",
      item: {
        kind: "multi-select",
        prompt: "Which statements about leverage are true? Select all that apply.",
        options: [
          { id: "a", text: "It lets a small deposit control a larger position", explain: "True. That is what leverage is." },
          { id: "b", text: "Losses are calculated on the full position, not just the margin", explain: "True. Margin is only the deposit." },
          { id: "c", text: "Higher leverage makes each pip worth more at the same position size", explain: "False. Pip value depends on position size, not on leverage." },
          { id: "d", text: "Using low leverage makes trading safe", explain: "False. Low leverage keeps a normal wobble from ending your account, but trading still carries risk." },
        ],
        correct: ["a", "b"],
      },
    },
    // fx-pairs
    {
      id: "fx-q-pairs-1", concept: "fx-pairs", type: "knowledge",
      explanation: "Exotics trade less, so fewer market makers compete to quote them, and spreads are wider.",
      item: {
        kind: "single",
        prompt: "Why do exotic pairs usually have wider spreads than major pairs?",
        options: [
          { id: "a", text: "Regulators set a minimum spread for exotics", explain: "There is no such general rule; spreads come from competition and liquidity." },
          { id: "c", text: "Fewer market makers compete, and they trade less", explain: "Right. Thinner trading means less competition and wider spreads." },
          { id: "b", text: "Exotic currencies are always worth less than the US dollar", explain: "A currency's price level does not set the spread." },
          { id: "d", text: "Majors are quoted with fewer decimal places", explain: "Decimal places do not explain the cost difference." },
        ],
        correct: "c",
      },
    },
    {
      id: "fx-q-pairs-2", concept: "fx-pairs", type: "knowledge",
      explanation: "Majors are the US dollar against EUR, JPY, GBP, CHF, AUD, CAD or NZD, so EUR/USD, USD/JPY and USD/CAD. EUR/GBP is a minor (cross); USD/TRY is an exotic.",
      item: {
        kind: "multi-select",
        prompt: "Which of these are major pairs? Select all that apply.",
        options: [
          { id: "a", text: "EUR/USD", explain: "Major: the euro against the US dollar." },
          { id: "b", text: "EUR/GBP", explain: "Minor (a cross): no US dollar." },
          { id: "c", text: "USD/JPY", explain: "Major: the US dollar against the yen." },
          { id: "d", text: "USD/TRY", explain: "Exotic: the Turkish lira is an emerging-market currency." },
          { id: "e", text: "USD/CAD", explain: "Major: the US dollar against the Canadian dollar." },
        ],
        correct: ["a", "c", "e"],
      },
    },
    // fx-sessions
    {
      id: "fx-q-sess-1", concept: "fx-sessions", type: "knowledge",
      explanation: "The London–New York overlap usually brings the most participants and the tightest spreads in the majors.",
      item: {
        kind: "single",
        prompt: "When are spreads on EUR/USD usually tightest?",
        options: [
          { id: "a", text: "Around the 17:00 New York rollover", explain: "Spreads often widen around the rollover, when trading is thin." },
          { id: "c", text: "On Sunday evening, as the market opens", explain: "The reopen is often thin, and prices can gap." },
          { id: "b", text: "During the London–New York overlap", explain: "Right. Two big centres are open, so liquidity is deepest." },
          { id: "d", text: "On public holidays in London", explain: "Holidays thin out trading, which tends to widen spreads." },
        ],
        correct: "b",
      },
    },
    {
      id: "fx-q-sess-2", concept: "fx-sessions", type: "knowledge",
      explanation: "Stops cannot fill inside a gap. They fill at the first available price when the market reopens.",
      item: { kind: "true-false", statement: "If big news breaks over the weekend, your stop-loss fills at its exact level when the market reopens on Sunday evening.", answer: false, explain: "False. The first price on Sunday can be well away from Friday's close. The stop fills at that first available price." },
    },
    // fx-drivers
    {
      id: "fx-q-drv-1", concept: "fx-drivers", type: "knowledge",
      explanation: "A fully expected rise is priced in before the announcement. Only the difference from expectations moves the price much.",
      item: {
        kind: "single",
        prompt: "Markets fully expect a central bank to raise rates by 0.25%, and it does exactly that. Its currency barely moves. Why?",
        options: [
          { id: "a", text: "Rate decisions do not affect currencies", explain: "They are among the biggest drivers, when they surprise." },
          { id: "c", text: "Currencies only move on inflation data", explain: "Many things move currencies, especially rate expectations." },
          { id: "d", text: "The bank announced it at the weekend", explain: "Nothing in the question suggests that, and it would not explain a non-reaction." },
          { id: "b", text: "The rise was already priced in", explain: "Right. Nothing surprised the market, so there was little to react to." },
        ],
        correct: "b",
      },
    },
    {
      id: "fx-q-drv-2", concept: "fx-drivers", type: "knowledge",
      explanation: "Other things equal, expectations of higher rates attract money and tend to support a currency, often before the rise happens.",
      item: {
        kind: "single",
        prompt: "Other things being equal, which of these tends to SUPPORT a currency?",
        options: [
          { id: "a", text: "Markets starting to expect its central bank to raise rates", explain: "Right. Higher expected rates attract investors' money." },
          { id: "b", text: "Its central bank signalling a series of rate cuts", explain: "A dovish turn tends to weaken a currency." },
          { id: "c", text: "Inflation falling well below what was expected", explain: "That tends to lower rate expectations, weakening the currency." },
          { id: "d", text: "A sudden rush into safe havens, when it is a higher-risk currency", explain: "Risk-off moods tend to hurt higher-risk currencies." },
        ],
        correct: "a",
      },
    },
    // fx-costs
    {
      id: "fx-q-cost-1", concept: "fx-costs", type: "calculation",
      explanation: "Spread cost: 1.2 pips × $10 per pip = $12. Add the $7 commission: $19.",
      item: { kind: "numeric", prompt: "You trade 1 standard lot (100,000 units) of EUR/USD in a dollar account, with a 1.2-pip spread and a $7 round-trip commission. What is the total cost of opening and closing, in dollars?", unit: "US dollars", answer: 19, tolerance: 0.01, explain: "1.2 × $10 + $7 = $19." },
    },
    {
      id: "fx-q-cost-2", concept: "fx-costs", type: "knowledge",
      explanation: "Holding over the Wednesday rollover moves settlement from Friday to Monday, so that night's swap covers Saturday and Sunday too.",
      item: {
        kind: "single",
        prompt: "Why is the swap for holding over the Wednesday rollover usually three times the normal amount?",
        options: [
          { id: "a", text: "Brokers charge extra midweek, when trading is busiest", explain: "It is not a busy-day charge; it follows the settlement dates." },
          { id: "b", text: "Settlement moves across the weekend, so it covers three days", explain: "Right. Friday's value date rolls to Monday, so Saturday and Sunday are included." },
          { id: "c", text: "Interest rates are set on Wednesdays", explain: "Central banks do not all meet on Wednesdays, and it would not triple a swap." },
          { id: "d", text: "It is a penalty for holding positions too long", explain: "It is interest for the extra days, not a penalty." },
        ],
        correct: "b",
      },
    },
    {
      id: "fx-q-cost-3", concept: "fx-costs", type: "knowledge",
      explanation: "The broker subtracts its markup in both directions, so both the long and the short swap can be negative.",
      item: { kind: "true-false", statement: "If a pair's long swap is negative, its short swap is positive.", answer: false, explain: "False. The broker takes a markup on both sides, so both swaps can be negative." },
    },
    // fx-applied (scenario)
    {
      id: "fx-q-applied-1", concept: "fx-applied", type: "applied",
      explanation: "The sound choice either stays out or sizes from a small fixed risk with a stop, accepting that spreads widen and the stop can slip around the release. Using the maximum leverage because a big move is expected is gambling on the outcome.",
      item: {
        kind: "scenario",
        situation: "A central bank decision is due in ten minutes. You have $2,000, your broker allows 1:500, and you think the currency will rise.",
        question: "What is the soundest plan?",
        options: [
          { id: "a", text: "Use the full 1:500, since the move should be big", explain: "A huge position at a moment of widened spreads and slippage can wipe out the account in seconds.", process: "unsound" },
          { id: "b", text: "Trade at 1:30 instead, but with no stop, and watch the screen", explain: "Smaller exposure helps, but with no stop the loss is not limited, and you cannot react faster than a release.", process: "partial" },
          { id: "c", text: "Stay out, or size from a small fixed risk with a stop; expect slippage", explain: "Right. Either way the possible loss is decided in advance, and the wider spreads are allowed for.", process: "sound" },
          { id: "d", text: "Wait for the first move after the release, then double the size if it goes your way", explain: "Chasing the first spike with double size piles risk on at the worst moment.", process: "unsound" },
        ],
        outcome: "Say the currency jumped and the full 1:500 position made 60% in a minute. That outcome does not make it sound: the same position would have been stopped out by a move the other way.",
      },
    },
    {
      id: "fx-q-applied-2", concept: "fx-applied", type: "applied",
      explanation: "The sound process keeps the planned stop (or closes early) and does not add money to keep a losing trade alive. Moving the stop away or depositing more turns a planned, limited loss into an open-ended one.",
      item: {
        kind: "scenario",
        situation: "Your EUR/USD trade is losing. Your margin level has fallen to 120% and the broker's margin call is at 100%. Your planned stop is 10 pips away.",
        question: "What do you do?",
        options: [
          { id: "a", text: "Deposit more money so the trade cannot be stopped out", explain: "This throws more money at a losing trade and abandons the plan.", process: "unsound" },
          { id: "c", text: "Move the stop further away to give the trade more room", explain: "Moving a stop away after entry to avoid taking the loss is a classic risk error: it makes the loss bigger than the one you planned.", process: "unsound" },
          { id: "d", text: "Open a second trade in the same direction to average down your entry price", explain: "Adding to a loser raises used margin and risk exactly when the account is weakest.", process: "unsound" },
          { id: "b", text: "Keep the planned stop where it is, or close the trade early", explain: "Right. The loss stays within the limit you decided before the trade.", process: "sound" },
        ],
      },
    },
  ],
};

// ── Added in the step-1 rework: at least four questions per concept, and a second remediation variant ──
// Each new question uses a new situation, new numbers or a new angle, not a rewording.

const MORE_QUESTIONS: TrackAssessment["questions"] = [
  // fx-quotes
  {
    id: "fx-q-quotes-4", concept: "fx-quotes", type: "knowledge",
    explanation: "GBP/USD is the price of one pound in dollars. A fall from 1.2700 to 1.2600 means a pound buys fewer dollars: the pound has weakened against the dollar.",
    item: {
      kind: "true-false",
      statement: "Whenever GBP/USD falls, the pound has weakened against the dollar.",
      answer: true,
      explain: "True. GBP/USD is the price of one pound in dollars, so a fall always means a pound buys fewer dollars: from 1.2700 to 1.2600, a pound buys 1.26 dollars instead of 1.27.",
    },
  },
  // fx-pips
  {
    id: "fx-q-pips-4", concept: "fx-pips", type: "calculation",
    explanation: "With five decimals, the fifth digit is a tenth of a pip. 0.65467 − 0.65412 = 0.00055, which is 5.5 pips.",
    item: { kind: "numeric", prompt: "AUD/USD, quoted to five decimals, moves from 0.65412 to 0.65467. How many pips is that move? Give one decimal place.", unit: "pips", answer: 5.5, tolerance: 0.05, explain: "0.00055 ÷ 0.0001 = 5.5 pips; the last digit is a tenth of a pip." },
  },
  // fx-pip-value
  {
    id: "fx-q-pv-3", concept: "fx-pip-value", type: "calculation",
    explanation: "For a pair quoted in dollars (xxx/USD), one pip is 0.0001 dollars per unit: 200,000 × 0.0001 = $20.",
    item: { kind: "numeric", prompt: "You trade 2 standard lots (200,000 units) of GBP/USD in a US dollar account. What is one pip worth, in dollars?", unit: "US dollars", answer: 20, tolerance: 0.01, explain: "200,000 × 0.0001 = $20 per pip." },
  },
  {
    id: "fx-q-pv-4", concept: "fx-pip-value", type: "knowledge",
    explanation: "On USD/JPY a pip is 0.01 yen per unit. For a dollar account that amount has to be converted at the current rate, so its dollar value changes as the rate moves.",
    item: {
      kind: "single",
      prompt: "In a US dollar account, why is a pip on USD/JPY not worth a fixed number of dollars, while a pip on EUR/USD is?",
      options: [
        { id: "a", text: "Yen pairs have no pips, only points", explain: "Yen pairs do have pips; they are the second decimal." },
        { id: "b", text: "The broker sets a new pip value for yen pairs every day", explain: "The pip value follows from the rate; the broker does not choose it." },
        { id: "c", text: "Because the yen is not allowed to be traded in dollar accounts", explain: "Yen pairs can be traded from dollar accounts." },
        { id: "d", text: "Its pip is in yen, so it must be converted at the moving rate", explain: "Right. EUR/USD pips are already in dollars; USD/JPY pips are in yen and change in dollar terms as the rate moves." },
      ],
      correct: "d",
    },
  },
  // fx-sizing (safety-critical)
  {
    id: "fx-q-size-4", concept: "fx-sizing", type: "calculation",
    explanation: "Risk = 2% × $5,000 = $100. Loss per unit at the stop = 25 pips × 0.0001 = $0.0025. Units = 100 ÷ 0.0025 = 40,000.",
    item: { kind: "numeric", prompt: "Your account is $5,000 and you risk 2% per trade. Your stop is 25 pips away on GBP/USD (0.0001 dollars per unit per pip). How many units should you trade?", unit: "units", answer: 40000, tolerance: 1, explain: "$100 ÷ (25 × 0.0001) = 40,000 units." },
  },
  // fx-margin (safety-critical)
  {
    id: "fx-q-margin-4", concept: "fx-margin", type: "knowledge",
    explanation: "Leverage only changes how much margin is locked. The position's size, and so its profit or loss per pip, is the same whichever leverage you use.",
    item: {
      kind: "single",
      prompt: "You open the same 20,000-unit EUR/USD position once at 1:30 and once at 1:100. What is different between the two?",
      options: [
        { id: "a", text: "Only the margin locked; the profit or loss per pip is the same", explain: "Right. Higher leverage locks less margin, but the position, and its risk per pip, is unchanged." },
        { id: "b", text: "The 1:100 position loses less per pip, because less money is used", explain: "The loss per pip depends on the position size, which is the same." },
        { id: "c", text: "The 1:30 position cannot lose more than its margin, unlike the 1:100 one", explain: "Neither margin is a limit on the loss." },
        { id: "d", text: "Nothing at all: margin is the same at any leverage", explain: "The margin locked does change: 1:30 locks more than 1:100." },
      ],
      correct: "a",
    },
  },
  // fx-margin-call (safety-critical)
  {
    id: "fx-q-mcall-4", concept: "fx-margin-call", type: "calculation",
    explanation: "Equity falls by the new losses: 1,500 − 700 = $800. Margin level = 800 ÷ 1,000 × 100 = 80%.",
    item: { kind: "numeric", prompt: "Your equity is $1,500 and your used margin is $1,000. Your open trades then lose another $700. What is your new margin level, in %?", unit: "%", answer: 80, tolerance: 0.1, explain: "(1,500 − 700) ÷ 1,000 × 100 = 80%." },
  },
  // fx-leverage (safety-critical)
  {
    id: "fx-q-lev-3", concept: "fx-leverage", type: "calculation",
    explanation: "The loss is on the whole $50,000 position: 1% × 50,000 = $500, which is half of the $1,000 account.",
    item: { kind: "numeric", prompt: "With a $1,000 account you open a EUR/USD position worth $50,000 (1:50). The price moves 1% against you. What percentage of the account have you lost?", unit: "%", answer: 50, tolerance: 0.1, explain: "1% × $50,000 = $500; 500 ÷ 1,000 = 50% of the account." },
  },
  {
    id: "fx-q-lev-4", concept: "fx-leverage", type: "knowledge",
    explanation: "A stop limits a loss only when it fills near its level. With maximum leverage the position is so large that even the planned loss is a big share of the account, and gaps or slippage cost more still.",
    item: {
      kind: "true-false",
      statement: "Using maximum leverage every time is fine as long as each trade has a stop-loss.",
      answer: false,
      explain: "False. A stop limits the loss only if it fills near its level, and a huge position makes even a planned loss large. Gaps and slippage can then cost far more.",
    },
  },
  // fx-pairs
  {
    id: "fx-q-pairs-3", concept: "fx-pairs", type: "knowledge",
    explanation: "Majors all include the US dollar. A cross (minor) pair pairs two major currencies without the dollar, such as EUR/GBP.",
    item: {
      kind: "single",
      prompt: "Which of these is a cross pair (a minor), with no US dollar in it?",
      options: [
        { id: "a", text: "USD/JPY", explain: "This includes the US dollar, so it is a major." },
        { id: "b", text: "GBP/USD", explain: "This includes the US dollar, so it is a major." },
        { id: "c", text: "EUR/GBP", explain: "Right. Two major currencies, no dollar: a cross." },
        { id: "d", text: "USD/CHF", explain: "This includes the US dollar, so it is a major." },
      ],
      correct: "c",
    },
  },
  {
    id: "fx-q-pairs-4", concept: "fx-pairs", type: "knowledge",
    explanation: "Exotic pairs trade far less than majors, so dealers quote wider spreads to cover the extra risk, and the prices can jump on local news.",
    item: {
      kind: "true-false",
      statement: "Exotic pairs are usually cheaper to trade than majors, because fewer people compete to trade them.",
      answer: false,
      explain: "False. Fewer traders means less liquidity, so spreads are usually wider and trading exotics costs more.",
    },
  },
  // fx-sessions
  {
    id: "fx-q-sess-3", concept: "fx-sessions", type: "knowledge",
    explanation: "Around the daily rollover (about 5 pm New York time) most centres are quiet and banks reset positions, so spreads often widen.",
    item: {
      kind: "single",
      prompt: "When are EUR/USD spreads often at their WIDEST on a normal weekday?",
      options: [
        { id: "a", text: "When London and New York are both open", explain: "That overlap is usually the busiest time, with the tightest spreads." },
        { id: "b", text: "Around the daily rollover, about 5 pm New York time", explain: "Right. Liquidity is thin around the rollover, so spreads often widen." },
        { id: "c", text: "In the middle of the London morning", explain: "London is the largest centre; spreads there are usually tight." },
        { id: "d", text: "Around lunchtime in London, when many traders there take a break", explain: "Trading slows a little over London lunch, but Europe is still open and New York is about to join, so spreads stay tight." },
      ],
      correct: "b",
    },
  },
  {
    id: "fx-q-sess-4", concept: "fx-sessions", type: "knowledge",
    explanation: "When two big centres are open at once, more banks and traders are active, so volume is high and spreads tend to be tight.",
    item: {
      kind: "true-false",
      statement: "EUR/USD trading volume is often highest while the London and New York sessions overlap.",
      answer: true,
      explain: "True. Both of the largest centres are open then, so more buyers and sellers are active.",
    },
  },
  // fx-drivers
  {
    id: "fx-q-drv-3", concept: "fx-drivers", type: "applied",
    explanation: "The market had expected a cut. Holding rates leaves them higher than expected, which tends to support the currency.",
    item: {
      kind: "single",
      prompt: "Markets had fully expected a central bank to CUT rates. Instead it leaves them unchanged. What tends to happen to its currency?",
      options: [
        { id: "a", text: "It tends to fall, because rates did not go up", explain: "The comparison is with what was expected, and a cut was expected." },
        { id: "b", text: "Nothing, because rates did not change", explain: "The decision differed from expectations, which is what moves prices." },
        { id: "c", text: "It must fall, because any central bank decision weakens a currency", explain: "There is no such rule." },
        { id: "d", text: "It tends to rise, because rates are higher than expected", explain: "Right. Compared with the expected cut, the outcome is a surprise in the currency's favour." },
      ],
      correct: "d",
    },
  },
  {
    id: "fx-q-drv-4", concept: "fx-drivers", type: "knowledge",
    explanation: "A rate rise that was fully expected is already priced in, and other news can outweigh it, so the currency does not have to rise.",
    item: {
      kind: "true-false",
      statement: "When a central bank raises interest rates, its currency rises.",
      answer: false,
      explain: "False. If the rise was expected it is mostly priced in, and a cautious outlook from the bank can even make the currency fall.",
    },
  },
  // fx-costs
  {
    id: "fx-q-cost-4", concept: "fx-costs", type: "calculation",
    explanation: "Held from Monday to Friday, the position crosses four rollovers (Mon, Tue, Wed, Thu nights). Wednesday counts three times, so 6 × $4 = $24.",
    item: { kind: "numeric", prompt: "Your position's swap is −$4.00 per night. You open on Monday and close on Friday, holding over four nightly rollovers, and Wednesday's is charged three times. What is the total swap cost, in dollars? Enter it as a positive number.", unit: "US dollars", answer: 24, tolerance: 0.01, explain: "1 + 1 + 3 + 1 = 6 nights of swap; 6 × $4 = $24." },
  },
  // fx-applied (critical, applied)
  {
    id: "fx-q-applied-3", concept: "fx-applied", type: "applied",
    explanation: "1% of $3,000 is $30. With a 30-pip stop on EUR/USD, 10,000 units risk 30 × 0.0001 × 10,000 = $30. The platform's default size is not a plan.",
    item: {
      kind: "scenario",
      situation: "You have $3,000 and your rules risk 1% per trade. A setup on EUR/USD needs a 30-pip stop. The platform's order ticket defaults to 1 standard lot (100,000 units).",
      question: "What is the soundest process?",
      options: [
        { id: "a", text: "Accept the default lot, since the platform suggests it", explain: "1 lot risks 30 × $10 = $300, ten times your planned risk.", process: "unsound" },
        { id: "b", text: "Trade half a lot because it feels more careful", explain: "Half a lot still risks 30 × $5 = $150, which is 5% of the account and five times your 1% rule. The size came from a feeling, not from the stop and the money at risk.", process: "unsound" },
        { id: "c", text: "Size it so 30 pips costs about $30 (10,000 units) and set the stop", explain: "Right. Size comes from the money you decided to risk and the stop distance.", process: "sound" },
        { id: "d", text: "Trade one lot without a stop and watch the screen closely", explain: "Watching is not a stop, and the size is far too large.", process: "unsound" },
      ],
    },
  },
  {
    id: "fx-q-applied-4", concept: "fx-applied", type: "applied",
    explanation: "A daily loss limit exists for exactly this moment. Keeping it protects the account from decisions made to win losses back.",
    item: {
      kind: "scenario",
      situation: "After three losing trades today you are down 4% of your account. Your written rules say to stop trading for the day after a 3% loss. Now you see a setup you like.",
      question: "What do you do?",
      options: [
        { id: "a", text: "Take it at double size to win today's losses back", explain: "This is chasing losses with more risk, the pattern the rule is there to stop.", process: "unsound" },
        { id: "b", text: "Switch off the daily loss rule just for today", explain: "A rule that is switched off when it matters is not a rule.", process: "unsound" },
        { id: "c", text: "Take it at half size to keep the risk down", explain: "This breaks your own written rule. The rule says stop for the day, not trade smaller; a rule kept only partly at the moment it matters is not being kept.", process: "unsound" },
        { id: "d", text: "Stop for the day as your rule says and review the trades tomorrow", explain: "Right. You keep to the plan you made when you were calm.", process: "sound" },
      ],
    },
  },
];

const MORE_REMEDIATION: Record<string, ConceptRemediation> = {
  "fx-quotes": {
    misconception: "Another slip is using the wrong side of the quote. You buy the base currency at the ask (the higher price) and sell it at the bid (the lower price).",
    altExplanation: "Read EUR/USD 1.0848 / 1.0850 as a shop board: the shop buys euros from you at 1.0848 and sells euros to you at 1.0850. Then convert: euros × rate = dollars; dollars ÷ rate = euros. A rising rate means the first currency got stronger.",
    altExample: "USD/CHF is bid 0.8810, ask 0.8813. To buy 5,000 dollars with francs you pay the ask: 5,000 × 0.8813 = 4,406.50 francs. Selling them straight back gets only 5,000 × 0.8810 = 4,405 francs.",
    practice: {
      kind: "numeric",
      prompt: "GBP/USD is bid 1.2648, ask 1.2650. You sell 2,000 British pounds straight away. How many US dollars do you receive?",
      unit: "US dollars",
      answer: 2529.6,
      tolerance: 0.01,
      explain: "Selling the base currency (GBP) happens at the bid, the lower price: 2,000 × 1.2648 = 2,529.60 dollars. At the ask it would have been 2,530, so the spread costs you 40 cents.",
    },
  },
  "fx-pips": {
    misconception: "The fifth decimal trips people up: on a five-decimal quote, the last digit is a tenth of a pip (a pipette), not a pip.",
    altExplanation: "Find the pip digit first: the fourth decimal for most pairs, the second for yen pairs. Anything after it is a fraction of a pip. Then the number of pips is the price change divided by the pip size, and it can include a decimal.",
    altExample: "EUR/USD moves from 1.08503 to 1.08561: change 0.00058, which is 5.8 pips. GBP/JPY moves from 191.205 to 191.355: change 0.150, which is 15 pips.",
    practice: {
      kind: "numeric",
      prompt: "USD/JPY moves from 151.482 to 151.207. How many pips is that move?",
      unit: "pips",
      answer: 27.5,
      tolerance: 0.05,
      explain: "Yen pair, so the pip is 0.01 and the third decimal is a pipette. 151.482 − 151.207 = 0.275, and 0.275 ÷ 0.01 = 27.5 pips.",
    },
  },
  "fx-pip-value": {
    misconception: "A second trap is forgetting the conversion for pairs not quoted in your account currency: a USD/JPY pip is in yen and must be turned into dollars.",
    altExplanation: "Pip value = units × pip size, in the QUOTE currency. If the quote currency is your account currency (EUR/USD in a dollar account), you are done. If not (USD/JPY), divide by the rate to convert into dollars.",
    altExample: "40,000 units of USD/JPY at 160.00: 40,000 × 0.01 = 400 yen per pip; 400 ÷ 160 = $2.50 per pip. The same 40,000 units of EUR/USD: 40,000 × 0.0001 = $4 per pip.",
    practice: {
      kind: "numeric",
      prompt: "You trade 25,000 units of USD/JPY in a US dollar account, with USD/JPY at 125.00. What is one pip worth, in dollars?",
      unit: "US dollars",
      answer: 2,
      tolerance: 0.01,
      explain: "In the quote currency: 25,000 × 0.01 = 250 yen per pip. Convert to dollars: 250 ÷ 125 = $2 per pip.",
    },
  },
  "fx-sizing": {
    misconception: "People often pick a size first and then see what it risks. Sound sizing works backwards: decide the money at risk, then let the stop distance set the size.",
    altExplanation: "Use one line: units = money at risk ÷ (stop in pips × value of one pip per unit). The money at risk comes from your rule (say 1% of the account). A wider stop means fewer units, so the money at risk stays the same.",
    altExample: "A $12,000 account at 0.5% risk is $60. With a 20-pip stop on EUR/USD: 60 ÷ (20 × 0.0001) = 30,000 units. If the stop must be 60 pips instead, the size drops to 10,000 units for the same $60.",
    practice: {
      kind: "numeric",
      prompt: "Your account is $9,000 and you risk 0.5% per trade. Your stop is 30 pips away on EUR/USD (0.0001 dollars per unit per pip). How many units should you trade?",
      unit: "units",
      answer: 15000,
      tolerance: 1,
      explain: "0.5% × 9,000 = $45 at risk. 45 ÷ (30 × 0.0001) = 45 ÷ 0.003 = 15,000 units.",
    },
  },
  "fx-margin": {
    misconception: "A second confusion is thinking higher leverage makes a trade smaller or safer. It only locks less margin; the position and its risk per pip stay the same.",
    altExplanation: "Margin = position value ÷ leverage. It is a deposit the broker holds while the trade is open. Your profit or loss is still worked out on the full position value, so losses can be much larger than the margin.",
    altExample: "A €30,000 position on EUR/USD at 1.1000 is worth $33,000. At 1:30 the margin is $1,100; at 1:200 it is $165. Either way, a 100-pip move against you costs $300.",
    practice: {
      kind: "numeric",
      prompt: "You open 50,000 units of EUR/USD at 1.0800 in a US dollar account, at 1:30 leverage. How much margin is locked, in dollars?",
      unit: "US dollars",
      answer: 1800,
      tolerance: 0.01,
      explain: "Position value: 50,000 × 1.0800 = $54,000. Margin: 54,000 ÷ 30 = $1,800. Gains and losses are still worked out on the full $54,000.",
    },
  },
  "fx-margin-call": {
    misconception: "Another slip is to forget that open losses come straight out of equity, so the margin level falls as the trade loses, even before you close anything.",
    altExplanation: "Margin level = equity ÷ used margin × 100. Equity is your balance plus or minus open profit and loss. As losses grow, equity shrinks and the margin level falls: first to the margin call level (a warning), then to the stop-out level, where the broker closes positions at the next available price.",
    altExample: "Balance $2,000, used margin $800. Open loss of $600 → equity $1,400 → margin level 175%. Another $1,000 of losses → equity $400 → 50%, which at many brokers is the stop-out.",
    practice: {
      kind: "single",
      prompt: "Your open trades are losing more and more. What happens to your margin level?",
      options: [
        { id: "a", text: "It stays the same until you close a trade", explain: "Open losses reduce equity straight away." },
        { id: "b", text: "It rises, because more margin is needed", explain: "Used margin does not grow with losses; equity shrinks." },
        { id: "c", text: "It falls, because the losses reduce your equity", explain: "Right. Lower equity over the same used margin means a lower margin level." },
        { id: "d", text: "It resets to 100% every evening at the daily rollover", explain: "There is no such reset." },
      ],
      correct: "c",
    },
  },
  "fx-leverage": {
    misconception: "It is easy to think a stop-loss makes high leverage safe. The stop limits the loss only if it fills near its level, and with a huge position even a small planned move is a large share of the account.",
    altExplanation: "Leverage turns a price move into an account move: account move ≈ price move × (position ÷ account). At 1:30 a 1% move is about 30% of the money used; at 1:500 the same 1% is far beyond the account. Gaps and slippage then hit the bigger position harder.",
    altExample: "Two climbers on the same cliff: one on a short rope, one on a very long one. If either slips, the one with the long rope falls much further before the rope catches, if it holds at all.",
    practice: {
      kind: "single",
      prompt: "With a $2,000 account, you open a position worth $100,000. Roughly what price move against you would wipe out the account?",
      options: [
        { id: "a", text: "About 2%", explain: "Right. 2% of $100,000 is $2,000, the whole account." },
        { id: "b", text: "About 20%", explain: "The account would be gone long before that." },
        { id: "c", text: "About 50%", explain: "Far too large: 2% is already enough." },
        { id: "d", text: "None: the stop-loss guarantees a smaller loss", explain: "A standard stop can slip, and it does not change how small the margin for error is." },
      ],
      correct: "a",
    },
  },
  "fx-pairs": {
    misconception: "A common mix-up is thinking any pair with a well-known currency is a major. Majors are the most traded pairs and all include the US dollar; crosses pair two majors without it; exotics include a smaller or emerging currency.",
    altExplanation: "Sort a pair in two steps. Does it include USD and another big currency? Major. Two big currencies but no USD? Cross. One smaller or emerging-market currency? Exotic. Then expect the costs to follow liquidity: majors cheapest, exotics dearest.",
    altExample: "EUR/USD: major. EUR/JPY: cross. USD/TRY or EUR/ZAR: exotic, with wider spreads and sudden jumps on local news.",
    practice: {
      kind: "single",
      prompt: "Which of these pairs is an exotic?",
      options: [
        { id: "a", text: "EUR/GBP", explain: "Two major currencies without the dollar: a cross." },
        { id: "b", text: "USD/ZAR", explain: "Right. The South African rand is an emerging-market currency, so this is an exotic." },
        { id: "c", text: "AUD/USD", explain: "A major: the Australian dollar against the US dollar." },
        { id: "d", text: "EUR/JPY", explain: "Two major currencies: a cross." },
      ],
      correct: "b",
    },
  },
  "fx-sessions": {
    misconception: "Another trap is assuming the market is equally liquid at all hours. Liquidity follows the big centres, so spreads widen in quiet hours and prices can gap over the weekend.",
    altExplanation: "Picture a relay of trading centres: Sydney and Tokyo, then London, then New York. When two big ones overlap, most traders are active and spreads are tight. Around the daily rollover and at the weekend open, few are active, spreads widen and prices can jump.",
    altExample: "A big shop at the busiest hour has every till open and short queues. Just before closing, one till is left and the queue moves slowly. The goods are the same; the ease of buying is not.",
    practice: {
      kind: "single",
      prompt: "When does EUR/USD usually have its tightest spreads?",
      options: [
        { id: "a", text: "Late Friday evening, just before the weekend close", explain: "Liquidity is thinning then, so spreads often widen." },
        { id: "b", text: "When the London and New York sessions overlap", explain: "Right. The two largest centres are open at once." },
        { id: "c", text: "At the Sunday evening open", explain: "The weekend open is often thin, with wide spreads and gaps." },
        { id: "d", text: "Around the daily rollover", explain: "Spreads often widen around the rollover." },
      ],
      correct: "b",
    },
  },
  "fx-drivers": {
    misconception: "A second slip is reading a rate decision on its own. The currency reacts to the decision compared with what was expected, and to what the bank says about the future.",
    altExplanation: "Line up three things: what the market expected, what the bank did, and what it signalled for next time. A move that matches expectations changes little. A surprise, or a change in the outlook, moves the currency, sometimes in the opposite direction to the headline.",
    altExample: "A bank raises rates as expected but says it is probably done raising. Traders had hoped for more rises, so the currency falls on a rate rise.",
    practice: {
      kind: "true-false",
      statement: "A currency can fall on the day its central bank raises rates.",
      answer: true,
      explain: "True. If the rise was expected and the bank hints that no more are coming, the outlook is weaker than hoped and the currency can fall.",
    },
  },
  "fx-costs": {
    misconception: "Costs are easy to underestimate because they come in pieces: the spread on every trade, commissions, and a swap for every night a position is held, three times over the Wednesday rollover.",
    altExplanation: "Add up a trade's cost in three parts. One: spread in pips × pip value. Two: commission, usually per lot per round trip. Three: swap per night × nights held, counting Wednesday's rollover three times for the weekend. Swaps can be negative on both sides.",
    altExample: "0.5 lot of EUR/USD with a 1.0-pip spread: 1.0 × $5 = $5. Commission $3.50. Held three ordinary nights at −$1.20: $3.60. Total about $12.10 before the price moves at all.",
    practice: {
      kind: "numeric",
      prompt: "You trade 0.3 lot (30,000 units) of EUR/USD in a dollar account, so one pip is worth $3. The spread is 1.5 pips, the round-trip commission is $2.10, and you hold the trade over two ordinary nights (not Wednesday) with a swap of −$0.70 a night. What is the total cost, in dollars?",
      unit: "US dollars",
      answer: 8,
      tolerance: 0.01,
      explain: "Spread: 1.5 × $3 = $4.50. Commission: $2.10. Swaps: 2 × $0.70 = $1.40. Total: 4.50 + 2.10 + 1.40 = $8.00.",
    },
  },
  "fx-applied": {
    misconception: "Another trap is deciding the size by what the platform offers or by how sure you feel. Sound size comes from a small fixed risk and the stop distance, and the plan's rules apply most when emotions are strongest.",
    altExplanation: "Run the same three checks every time: money at risk (a fixed small share of the account), where the stop goes and the size that follows from it, and what could make the fill worse (news, thin hours, gaps). Then keep to the rules you wrote while calm, including daily loss limits.",
    altExample: "A shop owner sets a rule: never spend more than 2% of the cash float on a single order. A pushy supplier, or a gut feeling that something will sell, does not change the rule; that is why it was written down.",
    practice: {
      kind: "scenario",
      situation: "Your account is $4,000 and your rules risk 1% per trade. You find a GBP/USD setup with a 40-pip stop. You feel very confident about it.",
      question: "What is the soundest process?",
      options: [
        { id: "a", text: "Size it to risk about $40: 10,000 units with the 40-pip stop", explain: "Right. 40 pips × 0.0001 × 10,000 = $40, 1% of the account.", process: "sound" },
        { id: "b", text: "Risk 5% this time because you are confident", explain: "Confidence is not information; this breaks your own rule.", process: "unsound" },
        { id: "c", text: "Risk 1% but skip the stop, since you will close it by hand", explain: "Right risk in theory, but no stop means no limit if you are away or the price jumps.", process: "partial" },
        { id: "d", text: "Use the largest size the margin allows", explain: "Size from available margin, not from risk, can lose far more than planned.", process: "unsound" },
      ],
    },
  },
};

export const FOREX_FOUNDATIONS_ASSESSMENT: TrackAssessment = {
  ...BASE,
  concepts: BASE.concepts.map((c) => ({ ...c, moreRemediation: MORE_REMEDIATION[c.id] ? [MORE_REMEDIATION[c.id]] : [] })),
  questions: [...BASE.questions, ...MORE_QUESTIONS],
};
