import type { AssessmentQuestion, ChoiceOption, ConceptRemediation, GradedItem, ScenarioItem, TrackAssessment } from "../types";

/*
  Track 13 assessment: Market Structure.
  All prices are made up for teaching. Order-type failure modes and slippage
  are safety-critical: misunderstanding them is how traders lose far more
  than they planned on a single order.
*/

const T = "market-structure";

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
    "Questions on every idea from the eleven lessons: venues, market makers and the spread, the order book and priority, order types, slippage, auctions, fragmentation and best execution, dark pools, HFT, payment for order flow and halts, with calculations and applied scenarios. You need 90% or more, a sound decision in the scenario, and every safety-critical question right: order-type failure modes and slippage.",
  concepts: [
    {
      id: "ms-venues",
      title: "Exchanges, OTC and dealer markets",
      lessonIds: ["ms-venues"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Many people think every price on a screen is a public exchange price. In a dealer market the quote is the dealer's own price for you, and the dealer is your counterparty.",
        altExplanation: "Ask one question: who takes the other side? On an exchange it is another trader whose order was waiting in the book, and a clearing house often stands between you. In a dealer market it is the dealer, quoting a price it chooses for your size.",
        altExample: "A retail forex broker that acts as dealer shows you a quote; when you buy, the broker itself sells to you. On a stock exchange, your buy matches someone else's resting sell order.",
        practice: single("You ask three banks for a price on a corporate bond and accept the best quote. What kind of market is this?", [
          ["a", "A dealer market using a request for quote", "Right. Dealers quote and take the other side."],
          ["b", "An order-driven exchange", "There is no central book of orders here."],
          ["c", "A call auction", "No auction is run."],
          ["d", "A dark pool", "You asked dealers for quotes; no hidden book is involved."],
        ], "a"),
      },
      flashcard: { front: "Exchange vs dealer market", back: "Exchange: orders meet in a book. Dealer (OTC): the dealer quotes and is your counterparty." },
    },
    {
      id: "ms-spread",
      title: "Market makers and the bid-ask spread",
      lessonIds: ["ms-market-makers"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "A wide spread is often blamed on greed. Mostly it reflects risk: the chance of trading with someone better informed, inventory risk and costs.",
        altExplanation: "A market maker that sells to a buyer worries the buyer knows something. So it sets its ask at what the asset is worth given that someone wants to buy. The more informed traders there are, the further apart bid and ask must be for it to break even.",
        altExample: "Before an earnings release, a share's spread doubles. Nothing about the market maker's costs changed; the chance that the next buyer knows the result did.",
        practice: numeric("The quote is 20.00 bid, 20.06 ask. Your buy fills at 20.05. What is the effective spread, in cents?", "cents", 4, 0.1, "Mid 20.03; 2 × (20.05 − 20.03) = 0.04."),
      },
      flashcard: { front: "Spread components", back: "Order processing + inventory risk + adverse selection. Effective spread = 2 × |fill − mid|." },
    },
    {
      id: "ms-order-book",
      title: "The order book and price-time priority",
      lessonIds: ["ms-order-book"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Many traders assume that when the price touches their limit, their order filled. Under price-time priority, orders that arrived earlier at that price fill first.",
        altExplanation: "Picture a queue at each price. Better prices are served first; within a price, the earliest order is served first. A trade at your price only means someone in your queue traded, maybe not you.",
        altExample: "Three bids rest at 30.10 in the order X, Y, then yours. A seller sells 500 shares; X had 300 and Y had 400, so your order waits even though trades printed at 30.10.",
        practice: single("Two sell orders rest at the same price. Which fills first when a buy market order arrives?", [
          ["a", "The larger one", "Size does not set priority under price-time rules."],
          ["b", "They split it equally", "That is pro-rata, not price-time."],
          ["c", "The one that arrived first", "Right. Time decides within a price."],
          ["d", "The one from the bigger firm", "Identity does not matter."],
        ], "c"),
      },
      flashcard: { front: "Price-time priority", back: "Best price first; at the same price, earliest order first. Trades happen at the resting price." },
    },
    {
      id: "ms-order-types",
      title: "Order types and how they fail: stops, limits, IOC and FOK",
      lessonIds: ["ms-order-types"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "The most dangerous belief is that a stop guarantees your exit price. A stop becomes a market order when triggered and fills at whatever price is available, which in a gap can be far beyond it.",
        altExplanation: "Every order type protects one thing and gives up another. Market orders protect the fill and give up the price. Limits protect the price and give up the fill. Stops promise to act, not at what price. Stop-limits cap the price but may never fill.",
        altExample: "A sell stop sits at 58. Bad news overnight and the share opens at 51. The stop triggers at the open and sells near 51; a stop-limit at 58 would not sell at all.",
        practice: single("Your sell stop is at 18. The share gaps down and opens at 15. Where does the stop most likely fill?", [
          ["a", "At 18", "Nothing traded at 18."],
          ["b", "Near 15", "Right. It becomes a market order at the open."],
          ["c", "It is cancelled", "It triggers."],
          ["d", "At the previous close", "That price is gone."],
        ], "b"),
      },
      flashcard: { front: "Order-type failure modes", back: "Market: bad price. Limit: no fill. Stop: fills beyond the trigger in gaps. Stop-limit: may not fill. FOK: all or nothing." },
    },
    {
      id: "ms-slippage",
      title: "Slippage and market impact risk",
      lessonIds: ["ms-slippage-impact"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "Traders often plan and backtest as if every order fills at the price on the screen. Larger orders and thinner markets fill at worse prices, sometimes much worse.",
        altExplanation: "The best ask shows a size. An order bigger than that takes the next level, then the next, each at a worse price. Add the cost level by level: the gap between that total and 'size × best ask' is your slippage.",
        altExample: "Asks: 100 at 7.00, 100 at 7.03, 100 at 7.08. Buying 300 at market costs 2,111 dollars instead of 2,100: 11 dollars of slippage.",
        practice: numeric("Asks: 300 at 40.00 and 300 at 40.10. You buy 400 at market. How many dollars of slippage is that against filling all 400 at 40.00?", "dollars", 10, 0.1, "300 × 40.00 + 100 × 40.10 = 16,010 against 16,000."),
      },
      flashcard: { front: "Slippage", back: "Average fill − price expected. Large orders walk the book; thin books make it much worse." },
    },
    {
      id: "ms-auctions",
      title: "Opening and closing auctions",
      lessonIds: ["ms-auctions"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Some traders think auction orders trade one by one at their own prices. In a call auction everyone who trades gets one single price.",
        altExplanation: "For each possible price, add up the shares people would buy at that price or higher and the shares people would sell at that price or lower. The auction price is the one where the smaller of the two is largest, so the most shares trade.",
        altExample: "At 12.00, 900 would buy and 600 would sell, so 600 match. At 12.01, 700 buy and 750 sell, so 700 match. 12.01 matches more and would be the auction price if nothing beats it.",
        practice: numeric("At 30.00, 1,000 would buy and 700 would sell. At 30.01, 800 would buy and 900 would sell. At 30.02, 500 would buy and 1,200 would sell. How many shares trade in the auction?", "shares", 800, 1, "Matched: 700, 800 and 500. The most is 800, at 30.01."),
      },
      flashcard: { front: "Call auction", back: "One price for everyone: the price that matches the most shares. Market orders accept any auction price." },
    },
    {
      id: "ms-fragmentation",
      title: "Fragmentation, the best quote and best execution",
      lessonIds: ["ms-fragmentation"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Many people think one exchange's screen shows the whole market, and that best execution guarantees the best price on every order.",
        altExplanation: "When one share trades on many venues, the market's best bid is the highest bid on any venue, and its best ask the lowest ask anywhere. Best execution is a duty to take reasonable steps for the best overall result, not a promise about every order.",
        altExample: "Venue X bids 14.98, venue Y bids 14.99 and venue Z bids 14.97. The best bid across venues is 14.99 on Y; in the US that is part of the NBBO.",
        practice: single("Venue A asks 9.02, venue B asks 9.01, venue C asks 9.03. Which is the best ask across venues?", [
          ["a", "9.02 on A", "B is lower."],
          ["b", "9.03 on C", "That is the highest ask."],
          ["c", "The average, 9.02", "The best is not the average."],
          ["d", "9.01 on B", "Right. The lowest ask anywhere."],
        ], "d"),
      },
      flashcard: { front: "Best quote and best execution", back: "Best bid = highest anywhere; best ask = lowest anywhere (US: NBBO). Best execution: reasonable steps for the best overall result." },
    },
    {
      id: "ms-dark-pools",
      title: "Dark pools",
      lessonIds: ["ms-dark-pools"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Dark pools are sometimes described as secret, unreported or illegal. They hide orders before trading, but trades are reported afterwards, and the venues are regulated.",
        altExplanation: "A dark pool is a place to leave an order without showing it. If a matching order arrives, both trade, usually at the lit market's mid. You save the spread and avoid showing size, but you may never fill and the price may move while you wait.",
        altExample: "A fund rests a large buy at the midpoint in a dark pool for an hour. A seller arrives and both trade at the lit mid; on another day nobody comes and the fund buys later at a higher price.",
        practice: tf("Trades in dark pools are reported after they happen.", true, "True. Only the order is hidden before trading."),
      },
      flashcard: { front: "Dark pool", back: "No pre-trade display; trades reported after. Usually matches at the lit mid. Saving if filled; risk of no fill." },
    },
    {
      id: "ms-hft",
      title: "High-frequency trading",
      lessonIds: ["ms-hft"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "HFT is often described as purely good or purely bad. The evidence shows both: automated market making narrowed spreads in liquid shares, while speed races to stale quotes are a cost that spreads must cover.",
        altExplanation: "Separate the strategies. Fast market making competes to quote and narrows spreads. Arbitrage keeps related prices together. Latency arbitrage picks off quotes that are a few milliseconds out of date, and quoting firms widen spreads to cover those losses.",
        altExample: "After an index future jumps, a slow quote on the ETF is still showing the old offer. A faster firm buys it before it is cancelled, and the quoting firm charges a little more spread on every trade to make up for such losses.",
        practice: single("Which is an example of latency arbitrage?", [
          ["a", "Quoting a bid and ask all day", "That is market making."],
          ["b", "Holding a share for months", "That is investing."],
          ["c", "Trading against a quote just after news, before its owner can cancel it", "Right. Winning a speed race to a stale quote."],
          ["d", "Splitting a big order into small pieces through the day to hide it from others", "That is execution."],
        ], "c"),
      },
      flashcard: { front: "HFT, honestly", back: "Fast market making can narrow spreads; latency arbitrage on stale quotes is a cost the spread covers." },
    },
    {
      id: "ms-pfof",
      title: "Payment for order flow and retail fills",
      lessonIds: ["ms-retail-fills"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "'Commission-free' is often taken to mean free, and 'price improvement' to mean the best possible price. Both can be misleading.",
        altExplanation: "A wholesaler that fills your order may give you a slightly better price than the quote and pay your broker for the order. Improvement is measured against the quote, not the mid, and the broker's income from the wholesaler is a conflict of interest.",
        altExample: "Quote 60.00 / 60.10. Your buy fills at 60.08: improved by 2 cents against the ask, yet still 3 cents above the mid of 60.05.",
        practice: numeric("The quote is 12.00 / 12.04. You buy 500 shares and are filled at 12.03. How much price improvement did you get, in dollars?", "dollars", 5, 0.01, "(12.04 − 12.03) × 500 = 5."),
      },
      flashcard: { front: "PFOF and retail fills", back: "Wholesalers internalise retail orders, often with price improvement, and may pay the broker. US: allowed with disclosure; EU: banned; UK: discouraged." },
    },
    {
      id: "ms-halts",
      title: "Circuit breakers and trading halts",
      lessonIds: ["ms-halts"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Some traders believe a halt protects their stop. Nothing trades during a halt, so a stop can only act when trading restarts, often at a very different price.",
        altExplanation: "A halt is a gap you can see coming. When trading pauses, orders wait; the reopening is usually an auction that can set a price far from the last trade. A triggered stop then fills at the reopening price or later.",
        altExample: "A share is paused at 33 with your sell stop at 31. It reopens at 26 after news; the stop triggers at the reopening and sells near 26, not 31.",
        practice: numeric("A US Tier 1 stock above $3 has a 5% Limit Up-Limit Down band and a reference price of 60. What is the upper band?", "dollars", 63, 0.01, "60 × 1.05 = 63."),
      },
      flashcard: { front: "Halts", back: "Stops cannot fill during a halt. US LULD: 15 s at a band → 5-minute pause. US market-wide: 7%, 13%, 20%." },
    },
    {
      id: "ms-applied",
      title: "Applying market structure to real orders",
      lessonIds: ["ms-order-types", "ms-slippage-impact", "ms-retail-fills", "ms-halts"],
      critical: true,
      safetyCritical: false,
      applied: true,
      remediation: {
        misconception: "Under pressure it is tempting to pick the order type that feels safest and assume the planned price, ignoring gaps, depth and how the order will be filled.",
        altExplanation: "A sound execution decision asks three questions before sending: what does this order type guarantee and what can go wrong, how much is available at the prices I can accept, and what happens if the market gaps or halts? The answer decides order type, size and limits.",
        altExample: "Before buying a thinly traded share at the open, a sound plan uses a limit order with a price cap, sizes the position so a gap through the stop is survivable, and checks the visible depth first.",
        practice: scenario(
          "A trader wants to sell 5,000 shares of a thin small-cap at once. The best bid is for 300 shares and the next levels are much lower. They plan a single market order.",
          "What is the soundest decision?",
          [
            ["a", "Send the market order: speed matters most", "It will walk far down a thin book.", "unsound"],
            ["b", "Use limit orders with a price floor and sell in pieces, accepting it may take time", "Sound: price protected, impact limited.", "sound"],
            ["c", "Use a stop order below the market", "A stop does not reduce impact.", "unsound"],
            ["d", "Sell it all in the closing auction with a market order, since everyone gets the same price there", "A market order in a thin auction can set a very poor price.", "partial"],
          ],
        ),
      },
      flashcard: { front: "Applying market structure", back: "Before sending: what the order type guarantees, the depth at acceptable prices, and the gap or halt case." },
    },
  ],
  questions: [
    // ms-venues
    q("msq-ven-1", "ms-venues", "knowledge", single("You buy a share on a stock exchange. Who is your counterparty, in practice?", [
      ["a", "Another trader whose order was in the book, usually with a clearing house in between", "Right. Orders meet in the book; clearing stands between the sides."],
      ["b", "The exchange's own trading desk, which buys and sells shares for profit against its customers", "Exchanges run the book; they do not take positions."],
      ["c", "Your broker, always", "A broker may internalise, but on an exchange the other side is another trader."],
      ["d", "The listed company", "The company is not trading with you."],
    ], "a"), "On an order-driven exchange the other side is another trader; a central counterparty often guarantees the trade."),
    q("msq-ven-2", "ms-venues", "knowledge", tf("A dealer's quote can depend on who the client is and how much they want to trade.", true, "True. Dealers set their own prices for each client and size."), "Dealer quotes are the dealer's own prices."),
    q("msq-ven-3", "ms-venues", "knowledge", single("Which market is mainly over the counter?", [
      ["a", "Large-company shares", "These trade mainly on exchanges."],
      ["b", "Index futures", "Futures trade on exchanges."],
      ["c", "Spot forex", "Right. Spot forex trades mainly through dealers."],
      ["d", "Listed options", "Listed options trade on exchanges."],
    ], "c"), "Forex, most bonds and many swaps trade OTC."),
    q("msq-ven-4", "ms-venues", "knowledge", tf("OTC markets are always unregulated.", false, "False. Most OTC dealers are regulated; the structure differs, not the existence of rules."), "OTC describes how trading is organised, not whether it is regulated."),
    // ms-spread
    q("msq-spr-1", "ms-spread", "calculation", numeric("The quote is 50.10 bid, 50.20 ask. Your buy fills at 50.18. What is the effective spread, in cents?", "cents", 6, 0.1, "Mid 50.15; 2 × (50.18 − 50.15) = 0.06."), "Effective spread = 2 × |fill − mid|."),
    q("msq-spr-2", "ms-spread", "knowledge", single("Which part of the spread pays for losses to better-informed traders?", [
      ["a", "Adverse selection", "Right. Informed traders tend to win against the market maker."],
      ["b", "Order processing", "That covers fees and systems."],
      ["c", "Inventory risk", "That covers holding positions while prices move."],
      ["d", "The broker's commission on the order", "Commission is not part of the spread."],
    ], "a"), "Glosten–Milgrom: informed trading alone can create a spread."),
    q("msq-spr-3", "ms-spread", "knowledge", tf("Spreads usually widen when market makers face more risk of trading with better-informed traders.", true, "True. Information risk widens spreads, for example before news."), "The spread is a price for immediacy that rises with risk."),
    q("msq-spr-4", "ms-spread", "knowledge", multi("Which are components of the bid-ask spread? Select all that apply.", [
      ["a", "Order-processing costs", "Right. Fees, systems and staff."],
      ["b", "Inventory risk", "Right. Holding a position before unwinding it."],
      ["c", "Adverse selection", "Right. Losses to informed traders."],
      ["d", "The dividend yield of the share", "Dividends are not part of the spread."],
    ], ["a", "b", "c"]), "The classic split: order processing, inventory and adverse selection."),
    // ms-order-book
    q("msq-ob-1", "ms-order-book", "knowledge", single("Sell orders rest at 10.01 (arrived 09:31), 10.01 (09:30) and 10.00 (09:35). Which trades first with a buy market order?", [
      ["a", "10.01, 09:30", "Price comes before time: 10.00 is better."],
      ["b", "10.01, 09:31", "It is later and at a worse price."],
      ["c", "They split it", "Price-time does not split."],
      ["d", "10.00, 09:35", "Right. The lowest ask trades first, whatever its time."],
    ], "d"), "Better price beats earlier time."),
    q("msq-ob-2", "ms-order-book", "knowledge", tf("A marketable buy limit order trades at the resting sell order's price, not at its own limit.", true, "True. The resting price sets the trade price; your limit is the worst you accept."), "Trades print at the maker's price."),
    q("msq-ob-3", "ms-order-book", "calculation", numeric("Asks: 100 at 5.00 and 300 at 5.02. You buy 200 at market. What is your average price, in dollars?", "dollars", 5.01, 0.001, "(100 × 5.00 + 100 × 5.02) ÷ 200 = 5.01."), "Average = Σ(price × qty) ÷ Σ qty."),
    q("msq-ob-4", "ms-order-book", "knowledge", tf("If a trade prints at your limit price, your limit order must have filled.", false, "False. Orders ahead of you in the queue at that price fill first."), "Queue position decides who fills within a price."),
    // ms-order-types (safety-critical)
    q("msq-ot-1", "ms-order-types", "knowledge", tf("A stop order guarantees that you exit at the stop price.", false, "False. It becomes a market order and can fill beyond the stop, especially in a gap."), "Only a guaranteed stop, where offered and paid for, guarantees the price."),
    q("msq-ot-2", "ms-order-types", "knowledge", single("You send a buy limit IOC for 800 shares. Only 300 are available at your limit. What happens?", [
      ["a", "300 fill and 500 are cancelled", "Right. Immediate or cancel."],
      ["b", "Nothing trades", "That is fill-or-kill."],
      ["c", "300 fill and 500 rest in the book", "That is a day limit order."],
      ["d", "800 fill at worse prices", "A limit is never breached."],
    ], "a"), "IOC fills what it can and cancels the rest at once."),
    q("msq-ot-3", "ms-order-types", "knowledge", single("Your sell stop-limit has a trigger of 50 and a limit of 50. The share gaps from 52 to 47. What happens?", [
      ["a", "It sells at 50", "Nothing trades at 50 after the gap."],
      ["b", "It sells near 47", "That is what a plain stop would do."],
      ["c", "It is cancelled by the exchange because the gap skipped the trigger", "It triggers and rests."],
      ["d", "It triggers and rests unfilled at 50", "Right. The limit is above the market, so you still hold the share."],
    ], "d"), "A stop-limit caps the price but may not fill."),
    q("msq-ot-4", "ms-order-types", "knowledge", single("What does an iceberg order usually give up on refill, on many venues?", [
      ["a", "Its limit price", "The limit stays."],
      ["b", "Its place in the queue", "Right. Each refilled slice joins the back of the queue."],
      ["c", "Its hidden size", "The hidden size remains."],
      ["d", "The right to cancel the order later in the day", "It can still be cancelled."],
    ], "b"), "Hiding size often costs queue priority."),
    q("msq-ot-5", "ms-order-types", "knowledge", tf("A market order can fill at a much worse price than the last trade when the book is thin.", true, "True. It takes whatever is available, walking the book if needed."), "Market orders give certainty of fill, not of price."),
    // ms-slippage (safety-critical)
    q("msq-sl-1", "ms-slippage", "calculation", numeric("Asks: 200 at 15.00, 200 at 15.05, 400 at 15.10. You buy 600 at market. How many dollars of slippage is that against filling all 600 at 15.00?", "dollars", 30, 0.1, "200 × 0 + 200 × 0.05 + 200 × 0.10 = 30."), "Total slippage = Σ(price − best ask) × qty."),
    q("msq-sl-2", "ms-slippage", "knowledge", tf("A backtest that fills every order at the last traded price usually overstates results.", true, "True. Real fills pay the spread and slippage."), "Assumed fills at the last price ignore trading costs."),
    q("msq-sl-3", "ms-slippage", "knowledge", single("Two shares have the same price. One has 50,000 shares at the best ask, the other 500. You buy 5,000 at market in each. Which is true?", [
      ["a", "Slippage will be the same", "Depth differs a lot."],
      ["b", "The deep share will slip more", "It has more at the best price."],
      ["c", "The thin share will slip far more", "Right. Its order walks many levels."],
      ["d", "Neither can slip with a market order", "Market orders are the ones that slip."],
    ], "c"), "Slippage grows with order size relative to depth."),
    q("msq-sl-4", "ms-slippage", "knowledge", single("Why does splitting a large order over time not remove its cost?", [
      ["a", "Price can move against you while you wait", "Right. Less impact, more timing risk."],
      ["b", "Exchanges forbid it", "It is common practice."],
      ["c", "Each piece pays a fixed penalty set by the exchange for small orders", "There is no such penalty."],
      ["d", "Splitting always increases impact", "It usually reduces impact."],
    ], "a"), "Almgren and Chriss: impact cost and timing risk trade off."),
    q("msq-sl-5", "ms-slippage", "knowledge", tf("Slippage can only happen if the broker is acting against you.", false, "False. It mostly comes from spreads, depth and moving prices."), "Slippage is usually the book doing what books do."),
    // ms-auctions
    q("msq-au-1", "ms-auctions", "calculation", numeric("At 8.00, 600 would buy and 300 sell. At 8.01, 500 buy and 450 sell. At 8.02, 300 buy and 700 sell. How many shares trade?", "shares", 450, 1, "Matched: 300, 450 and 300. The most is 450."), "The auction price maximises matched volume."),
    q("msq-au-2", "ms-auctions", "knowledge", tf("In a call auction every matched order trades at one single price.", true, "True. That is what makes it a call auction."), "Everyone matched in a call auction gets the same single price."),
    q("msq-au-3", "ms-auctions", "knowledge", single("Why can a market order in an opening auction be risky?", [
      ["a", "It is always rejected", "It is accepted."],
      ["b", "It trades only after the open, at the first continuous price of the day, not in the auction", "It joins the auction."],
      ["c", "It accepts any auction price, which an imbalance can push far away", "Right. Use a limit to cap the price."],
      ["d", "It pays a higher fee", "Fees are not the main risk."],
    ], "c"), "Market orders in auctions accept whatever price results."),
    q("msq-au-4", "ms-auctions", "knowledge", tf("The official closing price on many exchanges comes from a closing auction.", true, "True. Index funds often trade there for that reason."), "Closing auctions set the official close on many exchanges."),
    // ms-fragmentation
    q("msq-fr-1", "ms-fragmentation", "knowledge", single("Venue A bids 20.03, B bids 20.05, C bids 20.04. You sell 100 shares on A at 20.03. Which is true?", [
      ["a", "You traded through a better bid shown on B", "Right. That is a trade-through."],
      ["b", "You got the best bid", "B's bid was higher."],
      ["c", "This is a dark pool trade", "Nothing here is dark."],
      ["d", "It is impossible to sell below the best bid", "It is possible without protection; that is why rules exist."],
    ], "a"), "A trade at a worse price than another venue's better quote trades through it."),
    q("msq-fr-2", "ms-fragmentation", "knowledge", tf("Best execution means the broker must get the single best price on every order at every instant.", false, "False. It is a duty of reasonable diligence over price, costs, speed and likelihood of execution."), "Best execution is about process and overall result."),
    q("msq-fr-3", "ms-fragmentation", "knowledge", single("What is the NBBO?", [
      ["a", "An EU rule on dark pools", "It is a US term about quotes."],
      ["b", "A type of order that buys at the bid and sells at the offer automatically", "It is a quote, not an order."],
      ["c", "A broker's commission schedule", "Unrelated to quotes."],
      ["d", "The US best bid and offer across all venues", "Right. National Best Bid and Offer."],
    ], "d"), "NBBO is the US consolidated best quote."),
    q("msq-fr-4", "ms-fragmentation", "calculation", numeric("Best asks: venue A 30.02 for 100, venue B 30.01 for 100, venue C 30.03 for 400. A router buys 300 at the best prices. What is the total cost in dollars?", "dollars", 9006, 0.5, "100 × 30.01 + 100 × 30.02 + 100 × 30.03 = 3,001 + 3,002 + 3,003 = 9,006."), "Fill the cheapest venues first."),
    // ms-dark-pools
    q("msq-dp-1", "ms-dark-pools", "knowledge", single("Where does a typical dark pool get its trading price?", [
      ["a", "From the lit market, often the mid", "Right. Dark pools reference lit prices."],
      ["b", "From yesterday's close", "Prices follow the live lit market."],
      ["c", "From its own visible order book, which anyone can watch live", "It has no visible book."],
      ["d", "From the largest trader", "No trader sets it."],
    ], "a"), "Dark pools usually borrow their prices from the lit market, often the mid."),
    q("msq-dp-2", "ms-dark-pools", "knowledge", tf("A midpoint order in a dark pool can save half the spread, but it may never fill.", true, "True. Saving if matched; fill risk if not."), "The dark trade-off: cost against certainty."),
    q("msq-dp-3", "ms-dark-pools", "knowledge", tf("Research found that all dark trading harms price discovery.", false, "False. Comerton-Forde and Putniņš found low levels benign and high levels harmful, with no harm from blocks."), "The level and type of dark trading matter."),
    q("msq-dp-4", "ms-dark-pools", "knowledge", single("Why do large funds use dark pools?", [
      ["a", "To avoid paying any spread at all", "A midpoint fill still has a price."],
      ["b", "To trade without the trade ever being reported to anyone at all", "Trades are reported afterwards."],
      ["c", "To avoid showing their size and moving the price", "Right. Less information leakage."],
      ["d", "Because exchanges refuse large orders", "Exchanges accept large orders."],
    ], "c"), "Hiding size reduces information leakage and market impact."),
    // ms-hft
    q("msq-hft-1", "ms-hft", "knowledge", tf("Hendershott, Jones and Menkveld (2011) found that more algorithmic trading went with narrower spreads in large stocks.", true, "True. They used NYSE autoquoting as a natural experiment."), "Automation improved liquidity in their sample."),
    q("msq-hft-2", "ms-hft", "knowledge", single("Why do latency races make spreads wider?", [
      ["a", "Exchanges charge a speed fee", "No such fee is in the spread."],
      ["b", "Quoters lose money when sniped and charge for it in the spread", "Right. Ordinary traders pay that cost."],
      ["c", "Fast firms never quote", "They quote a great deal."],
      ["d", "More traders in a market always widen spreads, whatever strategies they run", "Competition usually narrows them."],
    ], "b"), "Budish, Cramton and Shim: sniping rents are paid through the spread."),
    q("msq-hft-3", "ms-hft", "knowledge", tf("High-frequency trading only ever harms ordinary investors.", false, "False. Evidence shows benefits, such as narrower spreads, as well as costs."), "HFT has both costs and benefits."),
    q("msq-hft-4", "ms-hft", "knowledge", single("What is a frequent batch auction?", [
      ["a", "A daily closing auction", "That is one auction a day."],
      ["b", "An auction for new shares", "That is an IPO."],
      ["c", "An auction run only when markets crash, to restart trading after a market-wide halt", "That is a reopening after a halt."],
      ["d", "Small auctions run many times a second, so tiny speed edges matter less", "Right. Proposed by Budish, Cramton and Shim."],
    ], "d"), "A market design response to the speed race."),
    // ms-pfof
    q("msq-pf-1", "ms-pfof", "calculation", numeric("The quote is 40.00 / 40.06. You buy 200 shares and are filled at 40.04. How much price improvement did you get, in dollars?", "dollars", 4, 0.01, "(40.06 − 40.04) × 200 = 4."), "Improvement = (ask − fill) × shares for a buy."),
    q("msq-pf-2", "ms-pfof", "knowledge", single("How does the EU treat payment for order flow now?", [
      ["a", "Banned under the revised MiFIR", "Right. A national exemption could last only until 30 June 2026."],
      ["b", "Allowed with disclosure, as in the US", "That is the US approach."],
      ["c", "Required for retail brokers", "No rule requires it."],
      ["d", "Allowed only for bonds", "That is not the rule."],
    ], "a"), "EU: banned; US: allowed with disclosure; UK: discouraged by the FCA."),
    q("msq-pf-3", "ms-pfof", "knowledge", tf("Price improvement against the quote proves your order got the best possible price.", false, "False. Improvement is measured against the quote; you can still pay well above the mid."), "Compare effective spreads, not just improvement."),
    q("msq-pf-4", "ms-pfof", "knowledge", single("Schwarz and co-authors (2025) sent identical orders through several US brokers. What did they find?", [
      ["a", "All brokers got identical prices", "They found large differences."],
      ["b", "Costs differed a lot between brokers", "Right. Wholesalers priced different brokers differently."],
      ["c", "PFOF fully explained the differences", "They found it did not."],
      ["d", "Orders sent to exchanges always got better prices than off-exchange fills", "That was not their finding."],
    ], "b"), "Execution quality can differ widely even for identical orders."),
    // ms-halts
    q("msq-ha-1", "ms-halts", "calculation", numeric("A US Tier 2 stock above $3 has a 10% LULD band and a reference price of 40. What is the lower band, in dollars?", "dollars", 36, 0.01, "40 × 0.90 = 36."), "Lower band = reference × (1 − band%)."),
    q("msq-ha-2", "ms-halts", "knowledge", single("The S&P 500 falls 14% at 1:00 p.m. Eastern. What happens under US rules?", [
      ["a", "Nothing", "13% is level 2."],
      ["b", "Trading stops for the day", "That needs 20%."],
      ["c", "A 15-minute market-wide halt (level 2)", "Right. Before 3:25 p.m."],
      ["d", "Only small stocks pause; large stocks keep trading under their own bands", "Market-wide breakers apply to all."],
    ], "c"), "US levels: 7% and 13% halt for 15 minutes before 3:25 p.m.; 20% for the rest of the day."),
    q("msq-ha-3", "ms-halts", "knowledge", tf("A stop order can fill during a trading halt.", false, "False. Nothing trades during a halt; the stop can act only when trading restarts."), "Halts are gaps you cannot trade through."),
    q("msq-ha-4", "ms-halts", "knowledge", tf("Halt and circuit-breaker rules can differ from country to country.", true, "True. LULD is a US rule; many European exchanges use volatility auctions."), "Halt rules differ by market, so check your own exchange's rules."),
    // ms-applied (scenarios only)
    q("msq-app-1", "ms-applied", "applied", scenario(
      "A trader holds a share with a sell stop at 24. The company reports after the close tonight, and the share often moves 10% on results. The trader's risk plan assumes a loss of no more than the distance to the stop.",
      "What is the soundest decision?",
      [
        ["a", "Keep the full position: the stop caps the loss", "A gap can open far below 24.", "unsound"],
        ["b", "Switch to a stop-limit at 24 to avoid slippage", "It may not sell at all after a gap.", "unsound"],
        ["c", "Reduce the position so that a gap well past the stop is still within the risk plan", "Sound: sizes for the real gap risk.", "sound"],
        ["d", "Add to the position so the stop is further away in percentage terms and the average price improves", "That raises the risk.", "unsound"],
      ],
    ), "Size for the gap, not for the stop distance."),
    q("msq-app-2", "ms-applied", "applied", scenario(
      "Before the open, a trader wants to buy a stock that is moving on news. The opening auction shows a large buy imbalance. They plan a market order for the auction.",
      "What is the soundest decision?",
      [
        ["a", "Send the market order; the auction is fair, so whatever price it sets must be a good one", "A market order accepts any auction price, and the imbalance points to a high one.", "unsound"],
        ["b", "Use a limit order at the most they are willing to pay", "Sound: joins the auction with a price cap.", "sound"],
        ["c", "Send a large stop order above the market", "It becomes a market order when triggered.", "unsound"],
        ["d", "Wait an hour and then decide, without a plan", "Safer than a market order, but no plan.", "partial"],
      ],
    ), "Use limits in auctions with imbalances."),
    q("msq-app-3", "ms-applied", "applied", scenario(
      "A trader's backtest of a short-term strategy in small-cap shares fills every trade at the closing price, with no spread or slippage. It shows a strong profit, and they plan to trade it with large size.",
      "What is the soundest decision?",
      [
        ["a", "Trade it at large size straight away; a backtest this strong is clear enough evidence on its own", "It ignores costs that can erase the profit.", "unsound"],
        ["b", "Re-test with fills at the bid and ask plus slippage that grows with size, before trading", "Sound: realistic costs first.", "sound"],
        ["c", "Trade it, but only with market orders for speed", "Market orders add the costs the test ignored.", "unsound"],
        ["d", "Double the size to make up for any costs", "That increases the costs.", "unsound"],
      ],
    ), "Realistic fills before risking money."),
    q("msq-app-4", "ms-applied", "applied", scenario(
      "A trader compares two commission-free brokers. Broker X advertises 'price improvement on every order'. They decide X must be cheaper without checking anything else.",
      "What is the soundest decision?",
      [
        ["a", "Choose X: price improvement on every order means it must give the best price available", "Improvement is against the quote, not the mid.", "unsound"],
        ["b", "Compare effective spreads and execution reports for both brokers", "Sound: measures what fills actually cost.", "sound"],
        ["c", "Choose the broker with the most adverts", "Unrelated to execution quality.", "unsound"],
        ["d", "Assume all commission-free brokers fill the same", "Research found large differences.", "unsound"],
      ],
    ), "Judge brokers by execution quality."),
  ],
};

// A second remediation variant for every concept (rotated when a concept is missed again).
const MORE_REMEDIATION: Record<string, ConceptRemediation> = {
  "ms-venues": {
    misconception: "It is easy to assume a market without a visible order book has no competition. Clients can still ask several dealers and pick the best quote.",
    altExplanation: "In a dealer market there is no single public book, so price discovery happens through quotes. Asking several dealers for a price at once is how clients make dealers compete.",
    altExample: "A fund asks five dealers to quote a bond for the same size within a minute and trades with the one offering the best price.",
    practice: tf("In a dealer market, the dealer is the counterparty to the client's trade.", true, "True. That is the defining feature."),
  },
  "ms-spread": {
    misconception: "Quoted spread is often taken as the cost of every trade. Your actual cost depends on where you were filled relative to the mid.",
    altExplanation: "Quoted spread is what the screen shows; effective spread is what you paid: twice the distance from your fill to the mid. A fill inside the quote has an effective spread smaller than the quoted one.",
    altExample: "Quote 70.00 / 70.10. A fill at 70.07 is 2 cents above the mid of 70.05, so the effective spread is 4 cents against 10 quoted.",
    practice: single("Which spread measures what your trade really cost?", [
      ["a", "The quoted spread", "That is only the screen quote."],
      ["b", "The effective spread", "Right. Twice the distance from your fill to the mid."],
      ["c", "The day's high minus low", "That is the range."],
      ["d", "The broker's commission", "That is a separate cost."],
    ], "b"),
  },
  "ms-order-book": {
    misconception: "Some traders treat the depth shown in the book as guaranteed. Resting orders can be cancelled at any moment.",
    altExplanation: "Depth is a snapshot of orders that could vanish. Under price-time priority you also need to know how much is ahead of you, not just what is shown.",
    altExample: "A book shows 5,000 shares at the best bid. Seconds after news, most are cancelled and only 400 remain.",
    practice: tf("Orders shown in the book can be cancelled before you trade with them.", true, "True. Displayed depth is not a promise."),
  },
  "ms-order-types": {
    misconception: "Fill-or-kill and immediate-or-cancel are often confused. One is all or nothing; the other keeps what fills.",
    altExplanation: "IOC trades whatever it can at once and cancels the rest. FOK trades the whole size at once or nothing at all. Neither ever rests in the book.",
    altExample: "With only 200 available, an IOC for 700 trades 200 and cancels 500; a FOK for 700 trades nothing.",
    practice: single("A buy FOK for 1,000 shares meets only 600 at its limit. What happens?", [
      ["a", "600 fill, 400 cancelled", "That is IOC."],
      ["b", "600 fill, 400 rest", "That is a day order."],
      ["c", "Nothing trades", "Right. All or nothing."],
      ["d", "1,000 fill at worse prices", "A limit is never breached."],
    ], "c"),
  },
  "ms-slippage": {
    misconception: "Many assume a thin market only costs a slightly wider spread. Thin depth can make a market order fill many levels away.",
    altExplanation: "Liquidity is the amount available at each price. When it is thin, each level holds little, so a modest order uses many levels and its average price moves fast.",
    altExample: "A thin share shows 50 shares at each cent. Buying 250 at market takes five levels, paying up to 4 cents more on the last shares.",
    practice: tf("The same order size slips more in a thin book than in a deep one.", true, "True. Less at each level means more levels used."),
  },
  "ms-auctions": {
    misconception: "Traders sometimes assume the closing price equals the last trade before the auction. The auction sets its own price.",
    altExplanation: "The closing auction collects orders and chooses one price that matches the most shares. That price can differ from the last continuous trade, sometimes by a lot.",
    altExample: "The last trade before a closing auction is 45.10. A large sell imbalance sets the auction price at 44.80, which becomes the official close.",
    practice: single("What sets the official close on many exchanges?", [
      ["a", "The closing auction price", "Right. The auction sets the close."],
      ["b", "The day's average price", "That is VWAP, not the close."],
      ["c", "The last trade before the auction", "The auction sets its own price."],
      ["d", "The opening price", "That is the open."],
    ], "a"),
  },
  "ms-fragmentation": {
    misconception: "US terms such as NBBO and the Order Protection Rule are sometimes treated as universal. They are US rules; other regions have their own.",
    altExplanation: "The idea of a best price across venues and a broker's duty to seek it is general. The US names and enforces it through Regulation NMS and FINRA rules; the EU through MiFID II best-execution rules.",
    altExample: "A UK broker's execution policy lists price, costs, speed and likelihood of execution as factors, without any NBBO, because that is a US construct.",
    practice: tf("NBBO is a US term for the best bid and offer across venues.", true, "True. Other markets use other mechanisms and names."),
  },
  "ms-dark-pools": {
    misconception: "Dark pools are sometimes thought to set their own independent prices. Most match at prices taken from the lit market.",
    altExplanation: "Because a dark pool shows nothing, it has no quotes of its own to form a price. It usually borrows the lit market's mid or best quotes, which is why too much dark trading could weaken lit prices.",
    altExample: "If the lit book shows 25.00 / 25.02, a midpoint match in a dark pool happens at 25.01.",
    practice: single("If the lit quote is 9.98 / 10.00, what is the midpoint price a dark pool would use?", [
      ["a", "9.98", "That is the bid."],
      ["b", "10.00", "That is the ask."],
      ["c", "9.99", "Right. Halfway between bid and ask."],
      ["d", "10.01", "Outside the quote."],
    ], "c"),
  },
  "ms-hft": {
    misconception: "Popular accounts often claim HFT takes a fixed, known amount from every retail order. No single agreed figure exists.",
    altExplanation: "Studies measure specific effects: narrower spreads after automation, or the cost of sniping stale quotes. They do not add up to one number for every order, and results depend on the market and the period.",
    altExample: "One paper finds spreads in large NYSE stocks narrowed with automated quoting; another finds arbitrage races in index products are a cost paid through spreads.",
    practice: tf("There is a single, agreed figure for how much HFT costs each retail order.", false, "False. Evidence measures particular effects, with mixed signs."),
  },
  "ms-pfof": {
    misconception: "It is easy to think zero commission means a trade cost nothing. You still pay part of the spread.",
    altExplanation: "Without commission, the cost of a market order is mostly the distance from the mid to your fill. Price improvement shrinks it but rarely removes it, and the broker may earn order-flow payments from the firm filling you.",
    altExample: "A zero-commission buy at 33.07 with a quote of 33.04 / 33.08 costs 1 cent a share above the mid of 33.06.",
    practice: single("A commission-free buy fills 2 cents above the mid. What did the trade cost, before any fees?", [
      ["a", "Nothing", "The spread is a cost."],
      ["b", "Only the broker's PFOF", "That is paid to the broker, not by you."],
      ["c", "About 2 cents a share against the mid", "Right. That is the effective cost."],
      ["d", "The whole quoted spread", "You were filled inside the quote."],
    ], "c"),
  },
  "ms-halts": {
    misconception: "Some assume market-wide circuit breakers act the same way at any time of day. In the US, levels 1 and 2 only halt trading before 3:25 p.m. Eastern.",
    altExplanation: "US market-wide breakers: a 7% or 13% fall in the S&P 500 before 3:25 p.m. halts all trading for 15 minutes; at or after 3:25 p.m. they do not halt. A 20% fall halts trading for the rest of the day at any time.",
    altExample: "A 9% fall at 3:40 p.m. does not trigger a market-wide halt under US rules, though single-stock bands still apply.",
    practice: single("Under US rules, what happens if the S&P 500 falls 21% at noon?", [
      ["a", "A 15-minute halt", "That is levels 1 and 2."],
      ["b", "Trading stops for the rest of the day", "Right. Level 3."],
      ["c", "Nothing", "20% is level 3."],
      ["d", "A 5-minute pause", "That is a single-stock LULD pause."],
    ], "b"),
  },
  "ms-applied": {
    misconception: "When a trade is urgent, it is tempting to use a market order without looking at the book or thinking about a halt or gap.",
    altExplanation: "Urgency is a reason to plan, not to skip planning. A marketable limit order with a sensible cap gets most of the speed of a market order while capping the worst price.",
    altExample: "To buy quickly in a volatile share, a trader sends a limit a few cents above the ask: it fills at once if depth is there, and stops if the book has emptied.",
    practice: scenario(
      "A share has just reopened after a news halt and is moving fast. A trader wants to buy immediately and plans a market order for their usual size.",
      "What is the soundest decision?",
      [
        ["a", "Send the market order at once", "It can fill far above the quote in a fast, thin market.", "unsound"],
        ["b", "Send a marketable limit order with a price cap and a smaller size", "Sound: speed with a capped price and less risk.", "sound"],
        ["c", "Send a buy stop above the market", "It becomes a market order when triggered.", "unsound"],
        ["d", "Double the usual size with a market order so the fast move is worth the trouble", "That increases risk and impact.", "unsound"],
      ],
    ),
  },
};

export const MARKET_STRUCTURE_ASSESSMENT: TrackAssessment = {
  ...BASE,
  concepts: BASE.concepts.map((c) => ({ ...c, moreRemediation: MORE_REMEDIATION[c.id] ? [MORE_REMEDIATION[c.id]] : [] })),
};
