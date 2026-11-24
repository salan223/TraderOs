import type { Lesson } from "../types";

/*
  Forex Foundations (track 2).
  Every rate, size and charge in examples is a round, made-up number for
  teaching. Rules that differ between brokers or countries are described as
  such. Nothing here is a recommendation to trade.
*/

const T = "forex-foundations";

export const FX1_QUOTES: Lesson = {
  id: "fx-quotes",
  trackId: T,
  order: 1,
  title: "How currency quotes work",
  summary: "Base and quote, bid and ask, and what the numbers on EUR/USD actually mean.",
  minutes: 14,
  objectives: [
    "Read any currency quote and say which currency is being priced.",
    "Convert an amount in either direction using one exchange rate.",
    "Explain what it means when a pair's price rises or falls.",
    "Use the bid and ask to work out what you pay, what you receive and the round-trip cost.",
  ],
  sections: [
    {
      id: "one-price-two-currencies",
      heading: "One price, two currencies",
      blocks: [
        { kind: "p", text: "You met the [[currency-pair]] in Market Foundations. Here is the key idea again, because everything in this track builds on it: a forex price always tells you how many units of the [[quote-currency|quote currency]] you need for ONE unit of the [[base-currency|base currency]]." },
        { kind: "p", text: "EUR/USD at 1.1000 (a sample rate) means one euro costs 1.10 US dollars. The euro is the thing being priced; the dollar is the money you price it in, just as a shop might price a loaf of bread at 1.10 dollars." },
        { kind: "interactive", widget: "fx-rate-converter", title: "Drag the exchange rate", caption: "Sample rates only, not a live quote. Converting base → quote multiplies by the rate; quote → base divides by it." },
      ],
    },
    {
      id: "converting",
      heading: "Converting in both directions",
      blocks: [
        { kind: "list", items: [
          "Base to quote: multiply. 500 euros × 1.10 = 550 US dollars.",
          "Quote to base: divide. 550 US dollars ÷ 1.10 = 500 euros.",
          "The same rate turned upside down gives the other view: if 1 euro = 1.10 dollars, then 1 dollar = 1 ÷ 1.10 ≈ 0.9091 euros.",
        ] },
        { kind: "p", text: "Markets follow conventions about which currency goes first. Euro pairs usually put EUR first, and the US dollar is usually the base against the yen, the Swiss franc and the Canadian dollar (USD/JPY, USD/CHF, USD/CAD), but the quote currency against the euro, pound, Australian and New Zealand dollars (EUR/USD, GBP/USD, AUD/USD, NZD/USD)." },
      ],
    },
    {
      id: "up-and-down",
      heading: "What \"up\" and \"down\" mean",
      blocks: [
        { kind: "p", text: "When EUR/USD rises from 1.1000 to 1.1200, each euro buys more dollars. The euro has gained value against the dollar, called [[appreciation]], and the dollar has lost value against the euro, called [[depreciation]]. Both statements describe the same move." },
        { kind: "p", text: "This trips up many beginners with pairs such as USD/JPY. If USD/JPY falls from 150 to 145, the dollar buys fewer yen, so the yen has strengthened. A falling number does not always mean the currency you care about got weaker: always check which side it is on." },
        { kind: "callout", tone: "info", title: "Strength is always relative", text: "A currency is never simply \"strong\". The euro can rise against the dollar while falling against the Swiss franc on the same day. Each pair is its own comparison." },
      ],
    },
    {
      id: "bid-ask-quotes",
      heading: "Two prices: bid and ask",
      blocks: [
        { kind: "p", text: "A trading screen shows two prices for each pair. The [[bid]] is what you get if you sell the base currency now; the [[ask]] is what you pay to buy it now. The ask is always higher, and the gap is the [[spread]]." },
        { kind: "p", text: "The point halfway between them is the [[mid-price]]. Charts and news often show the mid-price, but you can never trade at it: buying happens at the ask and selling at the bid." },
        { kind: "interactive", widget: "fx-spread", title: "Buy and sell straight back", caption: "Sample prices. The price stays still on purpose so you can see that the spread alone creates a loss." },
        { kind: "p", text: "Buying and then selling the same amount is called a [[round-trip]]. If the price does not move at all, a round trip loses exactly the spread. That is why a new trade always starts slightly negative." },
      ],
    },
    {
      id: "reading-a-screen",
      heading: "Reading a real quote screen",
      blocks: [
        { kind: "p", text: "Broker screens often show prices to five decimal places (three for yen pairs), and highlight the fourth and fifth digits in large type because those are the ones that change most. Market Foundations introduced the [[pip]]; the next lesson shows exactly which digit it is and what it is worth in money." },
        { kind: "p", text: "Prices you see on free websites or charts may be delayed, may show only the mid-price, and can differ slightly between providers because forex has no single central exchange. Your own broker's bid and ask are the prices that count for your trades." },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "ex-fx-convert",
    title: "Pay at the ask",
    prompt: "Sample prices: EUR/USD bid 1.1040, ask 1.1050. You want to buy 2,000 euros straight away. How many US dollars do you pay?",
    unit: "US dollars",
    answer: 2210,
    tolerance: 0.01,
    hint: "Buying straight away happens at the ask. Base → quote means multiply.",
    solution: "You buy at the ask: 2,000 × 1.1050 = 2210 US dollars. Selling the euros straight back at the bid would return 2,000 × 1.1040 = 2,208 dollars, so the round trip costs 2 dollars.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "GBP/USD is quoted at a sample 1.2500. What does that number mean?",
      correct: "b",
      options: [
        { id: "a", text: "One US dollar buys 1.25 British pounds", explain: "That reverses the pair. The price is always for one unit of the base, which is GBP here." },
        { id: "b", text: "One pound costs 1.25 US dollars", explain: "Correct. GBP is the base, USD is the quote." },
        { id: "c", text: "The pound has risen 1.25% today", explain: "The quote is a price, not a percentage change." },
        { id: "d", text: "You can buy and sell pounds at exactly 1.2500", explain: "You buy at the ask and sell at the bid; 1.2500 here is just a single sample price." },
      ],
    },
    {
      id: "q2",
      prompt: "USD/JPY falls from 150 to 145. What happened?",
      correct: "c",
      options: [
        { id: "a", text: "The US dollar strengthened against the yen", explain: "One dollar now buys fewer yen, so the dollar weakened." },
        { id: "b", text: "Both currencies weakened against each other", explain: "In one pair, if one side gains the other side loses." },
        { id: "c", text: "The yen strengthened against the dollar", explain: "Correct. Each dollar buys fewer yen, so each yen is worth more dollars." },
        { id: "d", text: "Nothing, because a fall in a yen pair has no meaning", explain: "Every move in a pair means one currency gained against the other." },
      ],
    },
    {
      id: "q3",
      prompt: "EUR/USD is 1.2500 (sample). Roughly how many euros does one US dollar buy?",
      correct: "a",
      options: [
        { id: "a", text: "0.80", explain: "Correct. 1 ÷ 1.25 = 0.80." },
        { id: "b", text: "1.25", explain: "That is how many dollars one euro buys." },
        { id: "c", text: "0.25", explain: "That is just the decimal part of the rate; you need 1 ÷ 1.25." },
        { id: "d", text: "2.25", explain: "Inverting a rate means dividing 1 by it, not adding 1." },
      ],
    },
    {
      id: "q4",
      prompt: "Which price do you get when you SELL the base currency straight away?",
      correct: "d",
      options: [
        { id: "a", text: "The ask", explain: "The ask is what you pay when you buy." },
        { id: "b", text: "The mid-price shown on charts", explain: "Nobody trades at the mid-price; it is just the halfway point." },
        { id: "c", text: "Whichever price is better for you that day", explain: "The side is fixed: sell at the bid, buy at the ask." },
        { id: "d", text: "The bid", explain: "Correct. The bid is the best price a buyer is offering you." },
      ],
    },
    {
      id: "q5",
      prompt: "You buy and immediately sell back the same amount, and the price does not move. What is the result?",
      correct: "b",
      options: [
        { id: "a", text: "Exactly zero, because the price stayed the same", explain: "You bought at the higher ask and sold at the lower bid." },
        { id: "b", text: "A small loss equal to the spread", explain: "Correct. The round trip costs the spread." },
        { id: "c", text: "A small gain, because brokers reward quick trades", explain: "There is no reward; the spread is a cost." },
        { id: "d", text: "It depends on the news that day", explain: "With no price movement, the result is fixed by the spread." },
      ],
    },
    {
      id: "q6",
      prompt: "Why can the EUR/USD price on a free website differ slightly from your broker's?",
      correct: "c",
      options: [
        { id: "a", text: "One of them must be broken", explain: "Small differences are normal in forex." },
        { id: "b", text: "Websites always show tomorrow's price", explain: "No website can show future prices." },
        { id: "c", text: "Forex has no single exchange; feeds differ", explain: "Correct. Prices come from different dealers and may be delayed or show only the mid-price." },
        { id: "d", text: "Brokers must add 1% to every website price", explain: "There is no such rule. Brokers set their own bid and ask." },
      ],
    },
  ],
  practical: {
    title: "Read three quotes",
    instructions: "Open any free currency quote page or a broker's demo platform (no money needed). Look at EUR/USD, USD/JPY and GBP/USD.",
    steps: [
      "For each pair, write down which currency is the base and which is the quote.",
      "If a bid and ask are shown, write both and work out the spread.",
      "For USD/JPY, write one sentence explaining what a rise in the number would mean for the yen.",
    ],
    reflectionPrompt: "Which pair did you find hardest to read the right way round, and how will you check yourself next time?",
  },
  glossary: ["appreciation", "depreciation", "mid-price", "round-trip"],
  next: "fx-pips-lots",
};

export const FX2_PIPS_LOTS: Lesson = {
  id: "fx-pips-lots",
  trackId: T,
  order: 2,
  title: "Pips, lots and position size",
  summary: "Turn tiny price moves into real money, and size a trade from the amount you are willing to lose.",
  minutes: 18,
  objectives: [
    "Find the pip digit in any quote, including yen pairs, and recognise a pipette.",
    "Convert between standard, mini and micro lots and units.",
    "Work out what one pip is worth in your account currency, including when the dollar is not the quote currency.",
    "Calculate a position size from account size, risk percentage and stop-loss distance.",
  ],
  sections: [
    {
      id: "finding-the-pip",
      heading: "Finding the pip",
      blocks: [
        { kind: "p", text: "A [[pip]] is the fourth decimal place for most pairs (0.0001) and the second decimal place for pairs quoted in Japanese yen (0.01). EUR/USD moving from 1.1025 to 1.1040 is a 15-pip move; USD/JPY moving from 150.25 to 150.40 is also 15 pips." },
        { kind: "p", text: "Most brokers show one more digit, a [[pipette]], which is a tenth of a pip. In a price such as 1.10253 the last 3 is pipettes. Spreads are often quoted with a decimal for this reason, for example 0.8 pips." },
      ],
    },
    {
      id: "lots",
      heading: "Lots: how trade sizes are counted",
      blocks: [
        { kind: "p", text: "Forex positions are measured in units of the base currency, and those units are grouped into a [[lot]]:" },
        { kind: "list", items: [
          "A [[standard-lot|standard lot]] is 100,000 units (1.00 lot).",
          "A [[mini-lot|mini lot]] is 10,000 units (0.10 lot).",
          "A [[micro-lot|micro lot]] is 1,000 units (0.01 lot).",
        ] },
        { kind: "p", text: "So 0.25 lots of EUR/USD means 25,000 euros' worth of exposure, whatever deposit your broker asks for. Not every broker offers every size; check the minimum before you start." },
      ],
    },
    {
      id: "pip-value",
      heading: "What a pip is worth",
      blocks: [
        { kind: "p", text: "The [[pip-value|pip value]] is how much money one pip of movement makes or loses on your position. It is first worked out in the quote currency, then converted into your [[account-currency|account currency]]:" },
        { kind: "list", ordered: true, items: [
          "Pip value in the quote currency = pip size × units. For 100,000 units of EUR/USD that is 0.0001 × 100,000 = 10 US dollars.",
          "If your account is in the quote currency, you are done: 10 dollars per pip.",
          "If your account is in the base currency (a USD account trading USD/JPY), divide by the pair's rate: 0.01 × 100,000 = 1,000 yen, ÷ 150 ≈ 6.67 dollars.",
          "If your account is in neither currency (a USD account trading EUR/GBP), convert using the quote currency's rate to your currency: 10 pounds × a GBP/USD rate of 1.25 = 12.50 dollars.",
        ] },
        { kind: "interactive", widget: "fx-pip-calculator", title: "Pip value calculator", caption: "Sample rates. The working line shows which of the three conversions applies to the pair you pick." },
        { kind: "p", text: "Because pip values depend on exchange rates, they drift a little as prices change. The rule of thumb \"10 dollars a pip per standard lot\" is exact only for pairs quoted in US dollars, in a US dollar account." },
      ],
    },
    {
      id: "position-sizing",
      heading: "Sizing a trade from your risk",
      blocks: [
        { kind: "p", text: "Beginners often pick a size because it \"feels right\". Professionals work backwards from the most they are willing to lose. That is called [[position-sizing|position sizing]], and it connects three numbers you decide before the trade: the account size, the share of it you will risk, and the distance to your [[stop-loss]]." },
        { kind: "p", text: "Units = (account × risk %) ÷ (stop distance in pips × pip value per unit). With a 5,000-dollar account, 1% risk (50 dollars) and a 25-pip stop on EUR/USD: 50 ÷ (25 × 0.0001) = 20,000 units, or 0.20 lots." },
        { kind: "interactive", widget: "fx-position-size", title: "Position size from risk", caption: "Sample account and rates. The result is rounded down to whole micro lots so you never risk more than you chose." },
        { kind: "callout", tone: "warn", title: "A stop is not a guarantee", text: "The planned loss assumes your stop fills at its level. In fast markets, or over a weekend [[market-gap|gap]], it can fill further away ([[slippage]]). The Risk Management track goes deeper; for now, keep risk per trade small." },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "ex-fx-pip-value",
    title: "Pip value with a yen pair",
    prompt: "Your account is in US dollars. You hold 0.5 lots of USD/JPY at a sample rate of 125.00. What is one pip worth in US dollars?",
    unit: "US dollars",
    answer: 4,
    tolerance: 0.01,
    hint: "0.5 lots = 50,000 units. A yen pip is 0.01. Work it out in yen first, then divide by the rate because the dollar is the base.",
    solution: "0.01 × 50,000 = 500 yen per pip. The dollar is the base, so divide by the rate: 500 ÷ 125 = 4 US dollars per pip.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "EUR/USD moves from 1.08350 to 1.08500. How many pips is that?",
      correct: "c",
      options: [
        { id: "a", text: "150 pips", explain: "That counts pipettes (the fifth digit) as pips." },
        { id: "b", text: "1.5 pips", explain: "A pip is the fourth decimal place; 0.0015 is 15 of them." },
        { id: "c", text: "15 pips", explain: "Correct. 1.0850 − 1.0835 = 0.0015, which is 15 × 0.0001." },
        { id: "d", text: "0.15 pips", explain: "Too small by a factor of 100." },
      ],
    },
    {
      id: "q2",
      prompt: "How many units of the base currency are in 0.03 lots?",
      correct: "a",
      options: [
        { id: "a", text: "3,000", explain: "Correct. 0.03 × 100,000 = 3,000, or three micro lots." },
        { id: "b", text: "300", explain: "One micro lot alone is 1,000 units." },
        { id: "c", text: "30,000", explain: "That would be 0.30 lots." },
        { id: "d", text: "It depends on the leverage you choose", explain: "Leverage changes the deposit, not the size of a lot." },
      ],
    },
    {
      id: "q3",
      prompt: "In USD/JPY, what is the size of one pip?",
      correct: "b",
      options: [
        { id: "a", text: "0.0001, the same as every other pair", explain: "Yen pairs are the main exception." },
        { id: "b", text: "0.01", explain: "Correct. Yen-quoted pairs use the second decimal place." },
        { id: "c", text: "1 whole yen", explain: "That is 100 pips." },
        { id: "d", text: "0.001", explain: "That is a pipette in a yen pair." },
      ],
    },
    {
      id: "q4",
      prompt: "Your account is in US dollars and you trade EUR/GBP. Why do you need the GBP/USD rate to find the pip value?",
      correct: "d",
      options: [
        { id: "a", text: "Because every pip value must be quoted against the pound", explain: "The pound only matters here because it is the quote currency." },
        { id: "b", text: "You do not; the pip value is always 10 dollars", explain: "That shortcut works only for USD-quoted pairs in a USD account." },
        { id: "c", text: "Because the euro cannot be converted to dollars", explain: "It can, but the pip value starts in the quote currency, pounds." },
        { id: "d", text: "The pip value comes out in pounds first", explain: "Correct. Pip size × units gives pounds, so you convert pounds to dollars." },
      ],
    },
    {
      id: "q5",
      prompt: "A 10,000-dollar account risks 1% with a 40-pip stop on EUR/USD (USD account). What size fits?",
      correct: "c",
      options: [
        { id: "a", text: "1.00 lot (100,000 units)", explain: "A 40-pip loss on 1 lot is 400 dollars, four times the plan." },
        { id: "b", text: "0.05 lots (5,000 units)", explain: "That risks only 20 dollars; it is smaller than needed." },
        { id: "c", text: "0.25 lots (25,000 units)", explain: "Correct. 100 ÷ (40 × 0.0001) = 25,000 units." },
        { id: "d", text: "As big as the broker allows, since the stop limits the loss", explain: "The stop sets the distance; size decides how much money that distance costs." },
      ],
    },
    {
      id: "q6",
      prompt: "You widen your stop from 20 to 40 pips but keep the same 1% risk. What should happen to your position size?",
      correct: "a",
      options: [
        { id: "a", text: "Halve it", explain: "Correct. Twice the distance at the same money risk means half the units." },
        { id: "b", text: "Double it", explain: "That would quadruple the money at risk." },
        { id: "c", text: "Keep it the same", explain: "Then a stop-out would lose 2% instead of 1%." },
        { id: "d", text: "It does not matter how far the stop is", explain: "Distance × size × pip value is the loss if the stop is hit." },
      ],
    },
  ],
  practical: {
    title: "Size three practice trades",
    instructions: "Use the position-size illustration or a calculator. No real trade is needed.",
    steps: [
      "Pick a pretend account size you might realistically start with.",
      "For a 1% risk, work out the size for stops of 15, 30 and 60 pips on EUR/USD.",
      "Repeat once for USD/JPY at a sample rate, and note how the pip value changes the answer.",
    ],
    reflectionPrompt: "Did any of the sizes surprise you? What would you do if the smallest available size still risked more than you planned?",
  },
  glossary: ["pipette", "lot", "standard-lot", "mini-lot", "micro-lot", "pip-value", "account-currency", "position-sizing"],
  next: "fx-leverage-margin",
};

export const FX3_LEVERAGE_MARGIN: Lesson = {
  id: "fx-leverage-margin",
  trackId: T,
  order: 3,
  title: "Leverage, margin and margin calls",
  summary: "How a small deposit controls a large position, and how quickly that can empty an account.",
  minutes: 20,
  objectives: [
    "Calculate the margin needed for a position at a given leverage.",
    "Explain equity, used margin, free margin and margin level.",
    "Describe what a margin call and a stop-out are and when they happen.",
    "Explain why higher leverage makes a wiped-out account more likely, not less.",
  ],
  sections: [
    {
      id: "deposit-not-price",
      heading: "Margin is a deposit, not the price",
      blocks: [
        { kind: "p", text: "Market Foundations introduced [[leverage]]. Here is how it works in practice. When you open a 0.20-lot EUR/USD position at a sample price of 1.1000, you are exposed to 20,000 euros, worth 22,000 dollars. That full amount is the [[notional-value|notional value]]." },
        { kind: "p", text: "You do not pay 22,000 dollars. The broker locks away a slice of your money as [[margin]], a good-faith deposit. At 1:30 leverage the margin is 22,000 ÷ 30 ≈ 733 dollars. Every gain and loss, though, is calculated on the full 22,000." },
        { kind: "list", items: [
          "Margin = notional value ÷ leverage.",
          "Margin as a percentage = 100 ÷ leverage: 1:30 is about 3.33%, 1:100 is 1%, 1:500 is 0.2%.",
        ] },
      ],
    },
    {
      id: "account-numbers",
      heading: "The four numbers on your account",
      blocks: [
        { kind: "p", text: "Platforms show a row of figures that beginners often ignore until it is too late:" },
        { kind: "list", items: [
          "[[equity|Equity]]: your balance plus or minus the profit or loss on open trades.",
          "[[used-margin|Used margin]]: the deposits locked by your open positions.",
          "[[free-margin|Free margin]]: equity minus used margin. This is what is left to absorb losses or open new trades.",
          "[[margin-level|Margin level]]: equity ÷ used margin × 100, as a percentage. It falls as losses grow.",
        ] },
        { kind: "interactive", widget: "fx-margin-sim", title: "Leverage and margin simulator", caption: "Sample 1,000-dollar account and prices. Margin call at 100% and stop-out at 50% are example levels; each broker publishes its own." },
      ],
    },
    {
      id: "margin-call-stop-out",
      heading: "Margin call and stop-out",
      blocks: [
        { kind: "p", text: "As a position loses money, equity shrinks while used margin stays the same, so the margin level drops. Two thresholds then matter:" },
        { kind: "list", ordered: true, items: [
          "[[margin-call|Margin call]]: the margin level falls to the broker's warning level (often 100%). You are warned, new trades are usually blocked, and you are expected to add money or reduce positions.",
          "[[stop-out|Stop-out]]: the margin level falls to the broker's close-out level. The broker automatically closes positions, usually the biggest loser first, to stop the account going further down. The loss is now real.",
        ] },
        { kind: "p", text: "In the EU and UK, rules for retail [[cfd|CFD]] accounts require the provider to start closing positions once your equity falls to half of the margin required. Brokers elsewhere may use different levels." },
        { kind: "callout", tone: "warn", title: "Gaps can go past the stop-out", text: "A stop-out is processed at the next available price. If the market [[market-gap|gaps]] over a weekend or after a shock, the loss can be bigger than your stop-out level suggested and, without protection, bigger than your whole deposit." },
      ],
    },
    {
      id: "why-high-leverage-hurts",
      heading: "Why more leverage usually means faster losses",
      blocks: [
        { kind: "p", text: "Leverage does not change how much a pip is worth; position size does. What leverage changes is how big a position your deposit allows. With 1:500, a 1,000-dollar account could open about 4.5 lots of EUR/USD at a sample price of 1.1000. At that size each pip is worth about 45 dollars, so a move of about 20 pips (under 0.2%) would wipe out nearly the whole account, and a stop-out would close it even sooner." },
        { kind: "p", text: "That is the trap: high leverage makes huge positions possible, and the excitement of a big position makes people use it. Using low leverage does not make trading safe, but it keeps a normal market wobble from ending your account." },
        { kind: "callout", tone: "info", title: "Retail protections (EU and UK)", text: "For retail clients, EU and UK rules cap CFD leverage, at 30:1 for major currency pairs and lower for other markets, and require [[negative-balance-protection|negative balance protection]], so you cannot lose more than the money in your account. Other countries have different rules, and some offshore brokers offer far higher leverage with fewer protections.", link: { lessonId: "trading-vs-investing", label: "See what regulators found about retail CFD losses (Market Foundations, lesson 9)" } },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "ex-fx-margin",
    title: "How much margin is locked?",
    prompt: "Your account is in US dollars. You buy 0.5 lots of EUR/USD at a sample price of 1.2000 with 1:30 leverage. How many US dollars of margin are used?",
    unit: "US dollars",
    answer: 2000,
    tolerance: 0.5,
    hint: "0.5 lots = 50,000 euros. Find the notional value in dollars, then divide by the leverage.",
    solution: "Notional = 50,000 × 1.2000 = 60,000 dollars. Margin = 60,000 ÷ 30 = 2000 US dollars. Profits and losses are still worked out on the full 60,000.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "What is margin?",
      correct: "b",
      options: [
        { id: "a", text: "The fee a broker charges for each trade", explain: "Fees are spreads and commissions. Margin is returned when you close, minus any loss." },
        { id: "b", text: "A deposit locked while a position is open", explain: "Correct. Gains and losses are on the full position, not on the deposit." },
        { id: "c", text: "The profit you are guaranteed on a leveraged trade", explain: "Nothing is guaranteed." },
        { id: "d", text: "The full price of the position, paid upfront", explain: "That is the notional value; with leverage you pay only a fraction as a deposit." },
      ],
    },
    {
      id: "q2",
      prompt: "Equity is 600 dollars and used margin is 400 dollars. What is the margin level?",
      correct: "d",
      options: [
        { id: "a", text: "67%", explain: "That is margin ÷ equity. The formula is the other way round." },
        { id: "b", text: "200 dollars", explain: "That is the free margin, not the margin level." },
        { id: "c", text: "100%", explain: "100% would mean equity equals used margin." },
        { id: "d", text: "150%", explain: "Correct. 600 ÷ 400 × 100 = 150%." },
      ],
    },
    {
      id: "q3",
      prompt: "What usually happens at a stop-out?",
      correct: "a",
      options: [
        { id: "a", text: "The broker closes positions for you", explain: "Correct. Positions are closed automatically and the loss becomes real." },
        { id: "b", text: "Your losses are refunded", explain: "Nothing is refunded; the loss is locked in." },
        { id: "c", text: "The broker lends you more money to keep the trade open", explain: "A stop-out exists precisely to stop the account going further down." },
        { id: "d", text: "Trading pauses until the price returns", explain: "Prices do not have to return, and the platform will not wait." },
      ],
    },
    {
      id: "q4",
      prompt: "Two traders each have 1,000 dollars. One uses 1:30, the other 1:500, and each opens the biggest position allowed. A 0.5% move goes against both. Who is more likely to be stopped out?",
      correct: "c",
      options: [
        { id: "a", text: "The 1:30 trader, because lower leverage means less margin", explain: "Their position is far smaller, so a 0.5% move costs much less." },
        { id: "b", text: "Neither, because 0.5% is a tiny move", explain: "At 1:500, the maximum position is about 500,000 dollars, so 0.5% is about 2,500: more than the account." },
        { id: "c", text: "The 1:500 trader", explain: "Correct. A bigger position turns the same move into a bigger loss." },
        { id: "d", text: "Both equally, because leverage does not change risk", explain: "Leverage allows the bigger position, and the position size sets the loss." },
      ],
    },
    {
      id: "q5",
      prompt: "Why can a loss sometimes be bigger than the stop-out level suggests?",
      correct: "b",
      options: [
        { id: "a", text: "Brokers are allowed to double losses on Fridays", explain: "There is no such rule." },
        { id: "b", text: "Prices can gap past it", explain: "Correct. Positions close at the next available price, which can be far away after a gap." },
        { id: "c", text: "Margin level is calculated once a month", explain: "It is recalculated continuously while you have open trades." },
        { id: "d", text: "Stop-outs only happen at the end of the day", explain: "They can happen at any moment the level is reached." },
      ],
    },
    {
      id: "q6",
      prompt: "What does negative balance protection do for retail clients in the EU and UK?",
      correct: "d",
      options: [
        { id: "a", text: "Guarantees that you will not have losing trades", explain: "Losing trades are still very common." },
        { id: "b", text: "Lets you borrow from the broker after a stop-out", explain: "It does the opposite: your debt to the broker cannot go below zero." },
        { id: "c", text: "Pays you interest when your balance is negative", explain: "That is not what it does." },
        { id: "d", text: "Stops you losing more than your account", explain: "Correct. The account can fall to zero, but you do not owe the broker more." },
      ],
    },
  ],
  practical: {
    title: "Stress-test a pretend account",
    instructions: "Use the simulator above, or a broker's demo account if you already have one.",
    steps: [
      "Choose a pretend account and a position size you might be tempted to use.",
      "Try leverage of 1:10, 1:30 and 1:500 at that size and note how far the price must move to reach a margin call and a stop-out.",
      "Find your broker's (or a well-known broker's) published margin-call and stop-out levels on its website.",
    ],
    reflectionPrompt: "How many pips against you would it take to lose half of your pretend account at the size you picked? Does that change the size you would use?",
  },
  glossary: ["notional-value", "margin", "equity", "used-margin", "free-margin", "margin-level", "margin-call", "stop-out", "negative-balance-protection"],
  next: "fx-pairs",
};

export const FX4_PAIRS: Lesson = {
  id: "fx-pairs",
  trackId: T,
  order: 4,
  title: "Major, minor and exotic pairs",
  summary: "Why some pairs are cheap and smooth to trade and others are expensive and jumpy.",
  minutes: 12,
  objectives: [
    "Sort currency pairs into majors, minors and exotics.",
    "Explain why majors usually have tighter spreads than exotics.",
    "Describe the extra risks of exotic pairs.",
    "Recognise that one currency pair can affect others through the US dollar.",
  ],
  sections: [
    {
      id: "the-majors",
      heading: "The majors",
      blocks: [
        { kind: "p", text: "A [[major-pair|major pair]] is the US dollar against one of seven other widely held currencies: the euro, Japanese yen, British pound, Swiss franc, Australian dollar, Canadian dollar or New Zealand dollar. That gives EUR/USD, USD/JPY, GBP/USD, USD/CHF, AUD/USD, USD/CAD and NZD/USD." },
        { kind: "p", text: "The US dollar is on one side of the large majority of all forex trades, according to the Bank for International Settlements' surveys, and EUR/USD is the most traded pair. Huge volume means deep [[liquidity]], so spreads in the majors are usually the tightest in the market." },
      ],
    },
    {
      id: "minors-and-exotics",
      heading: "Minors (crosses) and exotics",
      blocks: [
        { kind: "p", text: "A [[minor-pair|minor pair]], also called a cross, pairs two of those major currencies without the dollar, such as EUR/GBP, EUR/JPY or AUD/NZD. They are still widely traded, but spreads are usually a little wider." },
        { kind: "p", text: "An [[exotic-pair|exotic pair]] includes the currency of a smaller or emerging economy, such as USD/TRY (Turkish lira), USD/ZAR (South African rand) or USD/MXN (Mexican peso). Brokers do not all agree where the line is, so the same pair can appear in different groups on different platforms." },
        { kind: "interactive", widget: "fx-pair-explorer", title: "Build a pair", caption: "Pick any two currencies to see how the pair is usually written, which group it falls in and its pip size. Groupings follow common usage; brokers differ at the edges." },
      ],
    },
    {
      id: "exotic-risks",
      heading: "Why exotics are harder",
      blocks: [
        { kind: "list", items: [
          "Wider spreads: fewer market makers compete, so every trade costs more.",
          "Bigger and more sudden moves: political news, capital controls or a central bank surprise can move the price several percent in minutes.",
          "Higher overnight charges, because interest rates in these countries are often very different from those in the US or euro area (lesson 7 explains why).",
          "Thin trading outside local business hours, which can mean jumps and [[slippage]].",
        ] },
        { kind: "callout", tone: "warn", title: "Pegged currencies can break", text: "Some currencies are held at a fixed rate by their central bank. That looks calm until the peg is changed or abandoned, when the price can jump a long way in one go. The Swiss National Bank's removal of its euro cap in January 2015 moved EUR/CHF by well over 10% within minutes." },
      ],
    },
    {
      id: "links-between-pairs",
      heading: "Pairs are linked",
      blocks: [
        { kind: "p", text: "Because so many pairs include the dollar, a big dollar move tends to show up in all of them at once. Buying EUR/USD and GBP/USD together is often close to one larger bet against the dollar, not two separate ideas." },
        { kind: "p", text: "Cross rates are also connected by arithmetic: EUR/GBP is roughly EUR/USD divided by GBP/USD. If those two move, EUR/GBP has to move too, or traders would profit from the mismatch." },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "ex-fx-pair-types",
    title: "Major, minor or exotic?",
    prompt: "Sort each pair into the group most brokers would put it in.",
    categories: [
      { id: "major", label: "Major" },
      { id: "minor", label: "Minor (cross)" },
      { id: "exotic", label: "Exotic" },
    ],
    items: [
      { id: "p1", text: "EUR/USD", category: "major", explain: "The most traded pair: the US dollar against the euro." },
      { id: "p2", text: "USD/CAD", category: "major", explain: "The US dollar against the Canadian dollar, one of the seven majors." },
      { id: "p3", text: "EUR/GBP", category: "minor", explain: "Two major currencies without the US dollar: a cross." },
      { id: "p4", text: "AUD/NZD", category: "minor", explain: "Two major currencies without the US dollar." },
      { id: "p5", text: "GBP/JPY", category: "minor", explain: "Pound against yen, no dollar: a cross, and a famously volatile one." },
      { id: "p6", text: "USD/TRY", category: "exotic", explain: "The Turkish lira is an emerging-market currency." },
      { id: "p7", text: "EUR/ZAR", category: "exotic", explain: "The South African rand makes this exotic even without the dollar." },
      { id: "p8", text: "USD/MXN", category: "exotic", explain: "The Mexican peso is usually treated as exotic, though it is actively traded." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "What makes a currency pair a \"major\"?",
      correct: "c",
      options: [
        { id: "a", text: "Its exchange rate is above 1.0000", explain: "The size of the number has nothing to do with it." },
        { id: "b", text: "It includes the euro", explain: "EUR/GBP includes the euro and is a cross, not a major." },
        { id: "c", text: "It pairs the US dollar with a major currency", explain: "Correct. USD against EUR, JPY, GBP, CHF, AUD, CAD or NZD." },
        { id: "d", text: "It is the pair a broker promotes most on its website", explain: "Classification is about the currencies, not marketing." },
      ],
    },
    {
      id: "q2",
      prompt: "Which pair is a minor (cross)?",
      correct: "a",
      options: [
        { id: "a", text: "EUR/JPY", explain: "Correct. Two major currencies, no US dollar." },
        { id: "b", text: "USD/JPY", explain: "This includes the dollar, so it is a major." },
        { id: "c", text: "USD/ZAR", explain: "The rand makes this exotic." },
        { id: "d", text: "GBP/USD", explain: "This includes the dollar, so it is a major." },
      ],
    },
    {
      id: "q3",
      prompt: "Why are spreads usually tighter on majors than on exotics?",
      correct: "d",
      options: [
        { id: "a", text: "Regulators set lower spreads by law for majors", explain: "Spreads are set by the market and brokers, not fixed by law." },
        { id: "b", text: "Majors move faster, so they cost less", explain: "Speed is not what sets the spread; competition and volume do." },
        { id: "c", text: "Exotic currencies have more decimal places", explain: "Decimal places do not set the cost." },
        { id: "d", text: "Much more trading and competition", explain: "Correct. Deep liquidity lets dealers quote close bid and ask prices." },
      ],
    },
    {
      id: "q4",
      prompt: "You buy EUR/USD and GBP/USD at the same time. What is the main thing to be aware of?",
      correct: "b",
      options: [
        { id: "a", text: "The two trades cancel each other out exactly", explain: "They are both bets against the dollar, so they tend to move together, not cancel." },
        { id: "b", text: "Both are largely a bet against the dollar", explain: "Correct. A strong dollar move would hit both at once." },
        { id: "c", text: "Brokers do not allow two dollar pairs at once", explain: "They do allow it." },
        { id: "d", text: "One of them must be an exotic", explain: "Both are majors." },
      ],
    },
    {
      id: "q5",
      prompt: "Which risk is especially associated with a currency that is pegged by its central bank?",
      correct: "c",
      options: [
        { id: "a", text: "It changes price every second", explain: "A peg usually keeps the price very still." },
        { id: "b", text: "It cannot be traded at all", explain: "Pegged currencies can usually be traded." },
        { id: "c", text: "A sudden jump if the peg is dropped", explain: "Correct. The calm can end in one large move, as with the franc in 2015." },
        { id: "d", text: "Its pip is always worth zero", explain: "Pip values do not depend on a peg." },
      ],
    },
  ],
  practical: {
    title: "Compare spreads across groups",
    instructions: "Open a broker's demo platform or its published spread table (many brokers publish typical spreads).",
    steps: [
      "Note the typical or current spread for EUR/USD, EUR/GBP and one exotic such as USD/TRY or USD/ZAR.",
      "Convert each spread into money for a micro lot using what you learned about pip values.",
      "Check whether the broker lists any pair in a different group from this lesson.",
    ],
    reflectionPrompt: "How many times more expensive was the exotic spread than EUR/USD? Would that change which pairs you practise on first?",
  },
  glossary: ["major-pair", "minor-pair", "exotic-pair"],
  next: "fx-sessions",
};

export const FX5_SESSIONS: Lesson = {
  id: "fx-sessions",
  trackId: T,
  order: 5,
  title: "Trading sessions and liquidity",
  summary: "Forex runs around the clock, but not every hour is the same.",
  minutes: 12,
  objectives: [
    "Describe the forex week and the four main sessions.",
    "Find the session overlaps in your own time zone.",
    "Explain why liquidity and spreads change through the day.",
    "Recognise quiet periods and weekend risks.",
  ],
  sections: [
    {
      id: "around-the-clock",
      heading: "A market that follows the sun",
      blocks: [
        { kind: "p", text: "Spot forex has no single exchange, so it does not open and close like a stock market. Trading starts on Sunday evening New York time (as Monday morning begins in Australia and New Zealand) and runs until Friday evening New York time. Each [[session|trading session]] is the business day of a big financial centre: Sydney, Tokyo, London and New York." },
        { kind: "p", text: "London handles the largest share of global forex trading, followed by New York, according to the Bank for International Settlements' surveys. That is why the London morning and the London–New York afternoon are usually the busiest hours." },
      ],
    },
    {
      id: "your-time-zone",
      heading: "The sessions in your time zone",
      blocks: [
        { kind: "interactive", widget: "fx-session-clock", title: "24-hour session timeline", caption: "Worked out from your device clock and time zone for a sample Wednesday, using approximate local business hours for each centre. Holidays and early closes are ignored." },
        { kind: "p", text: "Session times are approximate business hours, not official opening bells. Daylight saving time starts and ends on different dates in different countries, so the overlaps shift by an hour for a few weeks each spring and autumn." },
      ],
    },
    {
      id: "overlaps",
      heading: "Overlaps and quiet hours",
      blocks: [
        { kind: "p", text: "A [[session-overlap|session overlap]] is a period when two centres are open at once. The London–New York overlap usually brings the most participants and the tightest spreads in the major pairs. Important US economic data is often released during it, so it can also bring sharp moves." },
        { kind: "p", text: "Late in the New York afternoon, before Asia is fully awake, trading is thin. Spreads often widen around the daily rollover at 17:00 New York time, and a single large order can move the price more than usual." },
        { kind: "p", text: "There are also fixed moments when many large orders are executed. The best known is the [[fx-fix|4 p.m. London fix]], a benchmark rate that funds use to value holdings, which can bring a burst of activity just before it." },
      ],
    },
    {
      id: "weekends-holidays",
      heading: "Weekends and holidays",
      blocks: [
        { kind: "p", text: "When the market closes on Friday, news keeps happening. If something big occurs over the weekend, the first price on Sunday evening can be well away from Friday's close: a [[market-gap|gap]]. Stops cannot fill inside the gap; they fill at the first available price." },
        { kind: "p", text: "On public holidays in a major centre (for example, Christmas or a US holiday), volume drops and spreads can widen. Liquidity is about people: fewer people at their desks means a thinner market." },
        { kind: "callout", tone: "info", title: "Match the pair to the hours", text: "A pair is usually most active when its own countries' centres are open. USD/JPY and AUD/USD are lively in Asian hours; EUR/GBP is quiet then and wakes up with London." },
      ],
    },
  ],
  exercise: {
    kind: "order",
    id: "ex-fx-session-order",
    title: "Put the forex week in order",
    prompt: "Starting from the moment the forex week opens, put these in the order they happen.",
    items: [
      { id: "sydney", text: "Sydney session opens (Monday morning in Australia)" },
      { id: "tokyo", text: "Tokyo session opens" },
      { id: "london", text: "London session opens" },
      { id: "overlap", text: "London and New York overlap" },
      { id: "close", text: "Friday: New York closes and the forex week ends" },
    ],
    explanation: "The week begins in Asia-Pacific, passes through Europe and the London–New York overlap each day, and ends with the New York close on Friday.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "When does the spot forex week usually run?",
      correct: "b",
      options: [
        { id: "a", text: "Monday 09:00 to Friday 17:00 London time only", explain: "That is London business hours, not the whole forex week." },
        { id: "b", text: "Sunday evening to Friday evening, New York time", explain: "Correct. It passes from centre to centre around the world." },
        { id: "c", text: "24 hours a day, 7 days a week", explain: "That describes crypto. Spot forex closes for the weekend." },
        { id: "d", text: "Only while the New York Stock Exchange is open for trading", explain: "Forex is not tied to stock exchange hours." },
      ],
    },
    {
      id: "q2",
      prompt: "Which period usually has the highest liquidity in the major pairs?",
      correct: "a",
      options: [
        { id: "a", text: "The London–New York overlap", explain: "Correct. The two biggest centres are trading at the same time." },
        { id: "b", text: "Saturday afternoon", explain: "The spot market is closed then." },
        { id: "c", text: "Just after the 17:00 New York rollover", explain: "That is one of the thinnest times of the day." },
        { id: "d", text: "All hours are exactly the same", explain: "Activity varies a lot through the day." },
      ],
    },
    {
      id: "q3",
      prompt: "What tends to happen to spreads in thin, quiet hours?",
      correct: "d",
      options: [
        { id: "a", text: "They disappear completely", explain: "There is always a spread." },
        { id: "b", text: "They are fixed by regulators at night", explain: "There is no such rule." },
        { id: "c", text: "They always get tighter", explain: "Fewer participants usually means the opposite." },
        { id: "d", text: "They often widen", explain: "Correct. Fewer participants means less competition to quote close prices." },
      ],
    },
    {
      id: "q4",
      prompt: "Why can a stop-loss fill far from its level on Sunday evening?",
      correct: "c",
      options: [
        { id: "a", text: "Brokers delete stops over the weekend", explain: "Stops stay in place; the problem is the price." },
        { id: "b", text: "Sunday prices are always fake", explain: "They are real prices, just possibly far from Friday's." },
        { id: "c", text: "The price can open with a gap", explain: "Correct. A stop fills at the first available price after the gap." },
        { id: "d", text: "The pip size changes at weekends", explain: "Pip sizes never change with the day." },
      ],
    },
    {
      id: "q5",
      prompt: "Why do the session overlaps in your time zone shift by an hour at some points in the year?",
      correct: "a",
      options: [
        { id: "a", text: "Daylight saving changes on different dates", explain: "Correct. Countries move their clocks on different dates, or not at all." },
        { id: "b", text: "Sessions are moved randomly", explain: "They follow local business hours." },
        { id: "c", text: "The forex week gets longer in summer", explain: "Its length stays the same." },
        { id: "d", text: "Exchanges vote on new hours each month", explain: "Spot forex has no central exchange setting hours." },
      ],
    },
  ],
  practical: {
    title: "Map your trading day",
    instructions: "Use the timeline above and your own weekly routine.",
    steps: [
      "Write down when the London–New York overlap happens in your time zone.",
      "Mark the hours you could realistically sit at a screen on a weekday.",
      "Note which sessions those hours fall in and which pairs are usually most active then.",
    ],
    reflectionPrompt: "Do your free hours line up with active, liquid hours? If not, what does that mean for which pairs or timeframes suit you?",
  },
  glossary: ["session-overlap", "fx-fix"],
  next: "fx-drivers",
};

export const FX6_DRIVERS: Lesson = {
  id: "fx-drivers",
  trackId: T,
  order: 6,
  title: "What moves currencies",
  summary: "Interest rates, central banks, inflation, risk mood and trade, and why surprises matter most.",
  minutes: 18,
  objectives: [
    "Explain why interest rates and central bank decisions are the biggest drivers of currencies.",
    "Describe how inflation data feeds into rate expectations.",
    "Explain risk-on and risk-off moods and what safe-haven currencies are.",
    "Use the idea of surprise versus expectation to judge news, and know its limits.",
  ],
  sections: [
    {
      id: "rates",
      heading: "Interest rates: the main engine",
      blocks: [
        { kind: "p", text: "Each [[central-bank|central bank]] sets a short-term [[interest-rate|interest rate]] for its currency. That rate shapes what savers earn on deposits and what investors earn on short-term government bonds in that currency. Its decisions and plans are called [[monetary-policy|monetary policy]]." },
        { kind: "p", text: "Other things being equal, a currency that pays a higher interest rate attracts money from investors, which tends to support it. When markets start to expect a central bank to raise rates, its currency often strengthens before the rise even happens." },
        { kind: "p", text: "Traders describe central banks as [[hawkish]] (leaning towards higher rates to fight inflation) or [[dovish]] (leaning towards lower rates to support growth). A shift in tone in a speech can move a currency as much as a rate decision." },
      ],
    },
    {
      id: "surprise",
      heading: "Surprise matters more than news",
      blocks: [
        { kind: "p", text: "Markets are forward-looking. If everyone expects a rate rise, it is already [[priced-in|priced in]] before the announcement. What moves the price is the difference between what happened and what was expected." },
        { kind: "interactive", widget: "fx-drivers", title: "Cause and effect: what moves a currency", caption: "A teaching toy showing textbook tendencies only. Real reactions depend on expectations, other news and positioning, and can go the other way." },
        { kind: "p", text: "Expected dates and forecasts for decisions and data are listed on an [[economic-calendar|economic calendar]]. The Macro and News track will cover reading one in depth." },
      ],
    },
    {
      id: "inflation-growth",
      heading: "Inflation and economic data",
      blocks: [
        { kind: "p", text: "[[inflation|Inflation]] is the rate at which prices in an economy rise. Most big central banks aim to keep it low and stable, often around 2% a year. When inflation comes in higher than forecast, traders may expect higher rates for longer, which often supports the currency in the short run." },
        { kind: "p", text: "Over many years, though, a country with persistently higher inflation tends to see its currency lose buying power. Short-term reactions and long-term trends can point in opposite directions." },
        { kind: "p", text: "Jobs numbers, growth figures and business surveys matter for the same reason: they change what markets expect central banks to do next." },
      ],
    },
    {
      id: "risk-mood",
      heading: "Risk mood and safe havens",
      blocks: [
        { kind: "p", text: "[[risk-sentiment|Risk sentiment]] is the overall mood of investors. In a confident, risk-on mood, money flows towards riskier assets and higher-yielding or commodity-linked currencies such as the Australian dollar. In a fearful, risk-off mood, money tends to seek safety." },
        { kind: "p", text: "Currencies investors have tended to buy in fearful times are called [[safe-haven|safe havens]]. The Japanese yen, the Swiss franc and often the US dollar have played this role. This is a pattern, not a law: it has broken down at times." },
      ],
    },
    {
      id: "flows",
      heading: "Trade and capital flows",
      blocks: [
        { kind: "p", text: "Every cross-border payment needs a currency exchange. A country's [[trade-balance|trade balance]] is its exports minus its imports. A country that exports more than it imports has foreign buyers needing its currency, which tends to support it over time." },
        { kind: "p", text: "[[capital-flows|Capital flows]], meaning money moving to buy shares, bonds, property and companies abroad, are often far larger than trade flows and can dominate them. A popular stock market can attract foreign money that lifts its currency regardless of the trade figures." },
        { kind: "callout", tone: "warn", title: "No single cause", text: "Several drivers act at once and can cancel out. Explanations written after a move often sound certain; before the move, nobody knew. Treat every \"currency X rose because...\" headline as one possible story." },
      ],
    },
  ],
  exercise: {
    kind: "match",
    id: "ex-fx-drivers",
    title: "Match the event to the textbook reaction",
    prompt: "Match each event to the reaction textbooks usually describe. Real markets do not always follow.",
    pairs: [
      { id: "m1", left: "A central bank raises rates by more than expected", right: "Its currency tends to strengthen" },
      { id: "m2", left: "A central bank does exactly what everyone expected", right: "Often little reaction, because it was priced in" },
      { id: "m3", left: "A sudden global financial scare", right: "Safe-haven currencies tend to be bought" },
      { id: "m4", left: "Inflation comes in well below forecast", right: "Traders may expect rate cuts sooner" },
      { id: "m5", left: "A big rise in a country's exports", right: "More foreign demand for its currency" },
    ],
    explanation: "Each reaction runs through expectations: of interest rates, of safety, or of demand for the currency. When expectations do not change, prices often do not either.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "Why do higher expected interest rates tend to support a currency?",
      correct: "c",
      options: [
        { id: "a", text: "Higher rates make the country's goods cheaper abroad", explain: "That is about the exchange rate's effect, not why investors buy the currency." },
        { id: "b", text: "The central bank prints more of the currency", explain: "Raising rates is usually the opposite of easy money." },
        { id: "c", text: "Savings in it are expected to earn more", explain: "Correct. That can attract investors' money, all else equal." },
        { id: "d", text: "Rates and currencies are legally linked", explain: "There is no legal link; it is about investor demand." },
      ],
    },
    {
      id: "q2",
      prompt: "A central bank raises rates by 0.25 points, exactly as everyone expected. What is a common reaction?",
      correct: "a",
      options: [
        { id: "a", text: "Little movement, because it was priced in", explain: "Correct. The guidance about future moves often matters more." },
        { id: "b", text: "A guaranteed large rise in the currency", explain: "Nothing is guaranteed, and expected news is usually already in the price." },
        { id: "c", text: "The market closes for the day", explain: "Forex keeps trading through announcements." },
        { id: "d", text: "A guaranteed fall, because rises are bad", explain: "No reaction is guaranteed either way." },
      ],
    },
    {
      id: "q3",
      prompt: "What does \"hawkish\" mean when describing a central bank?",
      correct: "d",
      options: [
        { id: "a", text: "It plans to sell all its gold", explain: "That is unrelated." },
        { id: "b", text: "It wants a weaker currency at any cost", explain: "That is not what the term describes." },
        { id: "c", text: "It is about to cut rates", explain: "That would be dovish." },
        { id: "d", text: "It leans towards higher rates", explain: "Correct. Hawkish policy aims to keep inflation down." },
      ],
    },
    {
      id: "q4",
      prompt: "In a sudden risk-off panic, which currencies have tended to be bought?",
      correct: "b",
      options: [
        { id: "a", text: "Those of countries with the highest interest rates", explain: "High-yielding currencies have tended to fall in panics." },
        { id: "b", text: "The yen and the Swiss franc", explain: "Correct, though this is a tendency rather than a rule." },
        { id: "c", text: "Exotic currencies, because they are cheap", explain: "They have tended to be sold in panics." },
        { id: "d", text: "None; all currencies fall together", explain: "Currencies are priced against each other, so not all can fall at once." },
      ],
    },
    {
      id: "q5",
      prompt: "Inflation comes in higher than forecast. What is a common short-term effect on the currency, and why?",
      correct: "c",
      options: [
        { id: "a", text: "It always falls, because inflation is bad", explain: "Over the long run, perhaps; in the short run the rate outlook often dominates." },
        { id: "b", text: "Nothing, because inflation is not a market topic", explain: "Inflation data is among the most watched releases." },
        { id: "c", text: "It may rise, as higher rates look likely", explain: "Correct. The market reprices what the central bank will do." },
        { id: "d", text: "It rises because shops raise prices in that currency", explain: "The effect runs through interest rate expectations." },
      ],
    },
    {
      id: "q6",
      prompt: "Which statement about explanations of currency moves is most accurate?",
      correct: "a",
      options: [
        { id: "a", text: "Several drivers act at once; stories are often told after the fact", explain: "Correct. Treat any single explanation as one possible story." },
        { id: "b", text: "Every currency move has exactly one cause, which the news reports", explain: "Drivers interact and can cancel out." },
        { id: "c", text: "Trade data explains most daily moves", explain: "Capital flows and rate expectations usually matter more day to day." },
        { id: "d", text: "If you know the news, you know the direction", explain: "The reaction depends on what was expected." },
      ],
    },
  ],
  practical: {
    title: "Watch one decision",
    instructions: "Find the next interest rate decision for a major central bank (US Federal Reserve, European Central Bank, Bank of England or Bank of Japan) on a free economic calendar or the bank's own website.",
    steps: [
      "Before the decision, write down what the calendar says is expected.",
      "After it, note what was decided and how the currency moved in the first hour, using a free chart.",
      "Read the first paragraph of the bank's statement and note one hawkish or dovish phrase.",
    ],
    reflectionPrompt: "Did the currency move the way the textbook tendency suggested? If not, what else might have mattered?",
  },
  glossary: ["interest-rate", "monetary-policy", "hawkish", "dovish", "economic-calendar", "inflation", "risk-sentiment", "safe-haven", "trade-balance", "capital-flows"],
  next: "fx-costs",
};

export const FX7_COSTS: Lesson = {
  id: "fx-costs",
  trackId: T,
  order: 7,
  title: "Costs: spreads, swaps and commissions",
  summary: "Every way a forex trade costs you money, and how to add them up before you trade.",
  minutes: 16,
  objectives: [
    "Turn a spread and a commission into money for a given trade size.",
    "Explain what a swap is and why its sign depends on the interest rate gap and the broker's markup.",
    "Explain the Wednesday triple swap.",
    "Add up the total cost of a trade and the move needed just to break even.",
  ],
  sections: [
    {
      id: "spread-and-commission",
      heading: "Spread and commission",
      blocks: [
        { kind: "p", text: "You already know the [[spread]] is paid once per [[round-trip|round trip]]. In money: spread in pips × pip value. A 1.2-pip spread on one standard lot of EUR/USD in a dollar account costs 1.2 × 10 = 12 dollars." },
        { kind: "p", text: "Some accounts add a [[commission]], a fixed fee per lot traded, in exchange for tighter spreads. It may be quoted per side (opening or closing) or per round trip, so check which: \"3.50 per side\" is 7 per round trip." },
        { kind: "p", text: "Accounts advertised as \"no commission\" usually charge a wider spread instead. Neither is automatically cheaper: compare the total for the sizes you trade." },
      ],
    },
    {
      id: "swaps",
      heading: "Swaps: the overnight interest",
      blocks: [
        { kind: "p", text: "Holding a forex position means you are effectively holding one currency and owing another. Each currency earns or costs its own interest rate. The [[interest-rate-differential|interest rate differential]] between them is settled each night as a [[swap]] (also called rollover), charged or paid at the 17:00 New York rollover." },
        { kind: "list", items: [
          "Long a pair: you earn roughly the base currency's rate and pay the quote currency's rate.",
          "Short a pair: the reverse.",
          "On top, the broker subtracts its own markup in both directions. That is why both the long and the short swap on the same pair can be negative.",
        ] },
        { kind: "p", text: "Simplified: one night's swap ≈ position value × (rate you earn − rate you pay − markup) ÷ 365. Brokers publish the actual figures, which change as rates change." },
      ],
    },
    {
      id: "triple-swap",
      heading: "Why Wednesday counts three times",
      blocks: [
        { kind: "p", text: "Spot forex trades usually settle two business days after they are made: the [[value-date|value date]]. (USD/CAD is the common exception: it usually settles one business day after the trade.) Holding a position over the Wednesday rollover moves its settlement from Friday to Monday, across the weekend. So the Wednesday swap usually counts three days: the [[triple-swap|triple swap]]." },
        { kind: "p", text: "Holidays can move the triple day, and some instruments, such as CFDs on other markets, apply it on Friday instead. Your broker's swap table is the final word." },
      ],
    },
    {
      id: "adding-up",
      heading: "Adding it all up",
      blocks: [
        { kind: "interactive", widget: "fx-cost-calculator", title: "What does this trade really cost?", caption: "Sample prices, rates and charges. Swaps are simplified: real brokers publish a fixed figure per lot per night and update it." },
        { kind: "p", text: "Divide the total cost by the pip value and you get the number of pips the price must move in your favour just to break even. For short-term trades, costs can take a large share of the average gain, which is one reason so many short-term traders lose." },
        { kind: "callout", tone: "info", title: "The carry trade", text: "Some traders hold a currency with a high rate against one with a low rate to collect the swap every night. This [[carry-trade|carry trade]] can work for long stretches, then lose months of interest in days when the high-rate currency falls. A positive swap is not free money." },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "ex-fx-total-cost",
    title: "Total cost of a trade",
    prompt: "Sample figures, USD account: you trade 1 lot of EUR/USD with a 1.2-pip spread and a commission of 3.50 dollars per side. You hold it for two ordinary nights with a swap of −3 dollars per night. What is the total cost in US dollars?",
    unit: "US dollars",
    answer: 25,
    tolerance: 0.01,
    hint: "Spread: 1.2 pips × 10 dollars. Commission: two sides. Swap: two nights at 3 dollars each.",
    solution: "Spread 1.2 × 10 = 12. Commission 3.50 × 2 = 7. Swap 2 × 3 = 6. Total 12 + 7 + 6 = 25 US dollars, so the price needs to move 2.5 pips your way just to break even.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "A commission is quoted as 4 dollars per side per lot. You open and close 2 lots. What do you pay in commission?",
      correct: "d",
      options: [
        { id: "a", text: "4 dollars", explain: "That is one side for one lot." },
        { id: "b", text: "8 dollars", explain: "That covers both sides of only one lot." },
        { id: "c", text: "Nothing, because commission is in the spread", explain: "Here it is charged separately." },
        { id: "d", text: "16 dollars", explain: "Correct. 4 × 2 sides × 2 lots = 16." },
      ],
    },
    {
      id: "q2",
      prompt: "You are long a pair whose base currency has a higher interest rate than the quote currency. What is likely on your swap, before the broker's markup?",
      correct: "a",
      options: [
        { id: "a", text: "You tend to receive it", explain: "Correct. You hold the higher-rate currency and owe the lower-rate one. A markup can still make it negative." },
        { id: "b", text: "You always pay the full base rate", explain: "The swap is about the gap between the two rates, not one rate." },
        { id: "c", text: "Swaps only apply to short positions", explain: "Both longs and shorts held overnight get a swap." },
        { id: "d", text: "It is always exactly zero", explain: "Only if the rates are equal and there is no markup." },
      ],
    },
    {
      id: "q3",
      prompt: "Why can both the long and the short swap on a pair be negative?",
      correct: "c",
      options: [
        { id: "a", text: "Because interest rates are always negative", explain: "Most rates are positive." },
        { id: "b", text: "Because one of the currencies does not exist overnight", explain: "Both currencies exist; it is about cost." },
        { id: "c", text: "The broker's markup is taken both ways", explain: "Correct. If the rate gap is small, the markup can outweigh it on both sides." },
        { id: "d", text: "Because swaps are a tax set by governments", explain: "Swaps come from interest rates plus the broker's charge." },
      ],
    },
    {
      id: "q4",
      prompt: "Why is the swap usually tripled on Wednesday night for spot forex?",
      correct: "b",
      options: [
        { id: "a", text: "Wednesday is the busiest trading day by law", explain: "There is no such law." },
        { id: "b", text: "Its settlement date crosses the weekend", explain: "Correct. Settlement moves from Friday to Monday, so three days of interest apply." },
        { id: "c", text: "Banks close on Thursdays", explain: "They do not." },
        { id: "d", text: "It is a penalty for holding trades mid-week", explain: "It is interest for the weekend days, not a penalty." },
      ],
    },
    {
      id: "q5",
      prompt: "A trade's total cost is 15 dollars and each pip is worth 5 dollars. How far must the price move in your favour to break even?",
      correct: "a",
      options: [
        { id: "a", text: "3 pips", explain: "Correct. 15 ÷ 5 = 3." },
        { id: "b", text: "75 pips", explain: "That multiplies instead of dividing." },
        { id: "c", text: "0 pips, because costs are refunded on winners", explain: "Costs are paid on every trade." },
        { id: "d", text: "1.5 pips", explain: "15 ÷ 5 is 3, not 1.5." },
      ],
    },
    {
      id: "q6",
      prompt: "What is the main risk of a carry trade?",
      correct: "d",
      options: [
        { id: "a", text: "The swap might be too large to collect", explain: "Collecting a positive swap is the goal; the risk is elsewhere." },
        { id: "b", text: "Brokers do not allow positions to be held overnight", explain: "Most do, with swaps applied." },
        { id: "c", text: "Interest is only paid once a year", explain: "Swaps are applied nightly." },
        { id: "d", text: "A sharp fall can wipe out months of swaps", explain: "Correct. Price moves can be much bigger than the interest earned." },
      ],
    },
  ],
  practical: {
    title: "Read a real swap table",
    instructions: "Most brokers publish their spreads, commissions and swap rates for each pair on their website or in the platform's symbol details. No account is needed.",
    steps: [
      "Find the long and short swap for EUR/USD and for one exotic pair.",
      "Check which day the broker applies the triple swap.",
      "Using the calculator above, estimate the total cost of holding 0.1 lots of EUR/USD for one week.",
    ],
    reflectionPrompt: "Which cost surprised you most, and how would it change the way you plan the length of a trade?",
  },
  glossary: ["commission", "interest-rate-differential", "swap", "value-date", "triple-swap", "carry-trade"],
  next: "si-exchanges",
};
