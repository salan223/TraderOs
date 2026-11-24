import type { ConceptRemediation, TrackAssessment } from "../types";

/*
  Track 1 assessment: Market Foundations.
  Every number is a made-up example for the question, not market data.
  At least four questions per concept, so three retests in a row use different ones.
*/

const T = "market-foundations";

const BASE: TrackAssessment = {
  trackId: T,
  intro:
    "One question for each key idea from the ten lessons, plus an applied scenario. You need 90% or more, every safety-critical question right (leverage and stop-losses) and a sound decision in the scenario. If you miss something, you will see exactly why, work through it a different way, and retest with different questions.",
  concepts: [
    {
      id: "mf-markets",
      title: "How markets and trades work",
      lessonIds: ["what-is-a-market"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "It is easy to treat \"the trade\" as one moment. In fact matching, execution and settlement are separate steps, and exchanges and OTC markets match orders in different ways.",
        altExplanation: "Think of an exchange as one public noticeboard where every buy and sell order is pinned up and matched by the same rules. An OTC market is more like phoning several dealers: each one quotes you its own price, and the deal is between you and that dealer. In both, the deal is agreed first and the asset and the money swap hands later, at [[settlement]].",
        altExample: "Buying a used car from a dealer: you agree the price and sign (the trade is executed), but the keys and the money change hands on collection day (settlement). If you had asked three dealers, you could have had three slightly different prices, as in an OTC market.",
        practice: {
          kind: "single",
          prompt: "Which step comes LAST in the life of a trade?",
          options: [
            { id: "c", text: "The asset and the money change hands", explain: "Right. This is settlement, the final step, sometimes a day or more after the trade." },
            { id: "a", text: "Your broker passes your order to the market", explain: "This happens early, before any match is found." },
            { id: "b", text: "Your order is matched with someone on the other side", explain: "Matching comes before execution and settlement." },
            { id: "d", text: "You decide what to buy and how much", explain: "This is the very first step." },
          ],
          correct: "c",
        },
      },
      flashcard: { front: "Exchange vs over-the-counter (OTC)", back: "An exchange matches orders centrally under published rules. OTC deals are agreed directly between two parties, so quotes can differ between providers." },
    },
    {
      id: "mf-price-drivers",
      title: "Why prices move: supply, demand and surprise",
      lessonIds: ["why-prices-move"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "The common mistake is to think good news must make a price rise. Prices react to the gap between what happened and what people already expected.",
        altExplanation: "A price is a running vote on the future. By the time news arrives, people have already voted on what they expected. Only the part that is new, the surprise, changes the vote. Expected good news is often already [[priced-in|priced in]].",
        altExample: "A football team everyone expects to win does win. Its betting odds barely change after the match, because the win was expected. A shock defeat moves the odds a lot. Markets treat company results and economic data the same way.",
        practice: {
          kind: "true-false",
          statement: "If a company reports exactly the profit everyone expected, its share price will usually jump.",
          answer: false,
          explain: "False. If the result matches expectations, it was mostly priced in already, so there is little reason for a big move. Surprises move prices.",
        },
      },
      flashcard: { front: "Priced in", back: "When expected news is already reflected in today's price, so it moves the price little when it arrives." },
    },
    {
      id: "mf-liquidity",
      title: "Liquidity and volatility",
      lessonIds: ["why-prices-move"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Liquidity is often confused with price level or popularity. It is about how easily you can trade without moving the price, and thin markets tend to jump more, not less.",
        altExplanation: "[[liquidity|Liquidity]] is a question about crowds: are there many buyers and sellers waiting close to the current price? If yes, your order is absorbed quietly. If not, your order, or anyone else's, has to reach further for a match, so prices jump. That is why thin markets tend to be more [[volatility|volatile]].",
        altExample: "Selling a common smartphone is quick, and you get close to the usual price, because many people want one. Selling a rare painting can take months, and the price you get depends heavily on who happens to be interested that week.",
        practice: {
          kind: "single",
          prompt: "Which market is most likely to show large, sudden price jumps?",
          options: [
            { id: "a", text: "One with many buyers and sellers waiting at close prices", explain: "That is a liquid market: orders are absorbed without big jumps." },
            { id: "b", text: "One with few traders, where a large order is rare", explain: "Right. In a thin market a single large order or a surprise has to reach far for a match, so the price jumps." },
            { id: "c", text: "One where prices are quoted in US dollars", explain: "The currency of the quote does not decide how jumpy a market is." },
            { id: "d", text: "One that is open on weekdays only", explain: "Opening hours do not by themselves make a market jumpy." },
          ],
          correct: "b",
        },
      },
      flashcard: { front: "Liquidity", back: "How easily you can buy or sell without moving the price. Thin, illiquid markets tend to be more volatile." },
    },
    {
      id: "mf-participants",
      title: "Participants, brokers and counterparties",
      lessonIds: ["market-participants"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Many people assume their broker is always a neutral middleman. With some products the broker is the other side of your trade, and people also mix up hedging (reducing a risk you already have) with speculation (taking on risk for profit).",
        altExplanation: "Ask two questions about any trade. First: who is on the other side? If your broker acts as [[principal]], it is your [[counterparty]], and what you lose it may keep. Second: why is each side trading? A hedger already has a risk and wants less of it; a speculator takes on a risk hoping to profit.",
        altExample: "A farmer agrees today to sell next autumn's wheat at a fixed price, so a price fall cannot ruin the harvest: that is [[hedging]]. A trader with no wheat buys the same contract because they think prices will rise: that is [[speculation]]. Same contract, different reasons.",
        practice: {
          kind: "single",
          prompt: "A chocolate maker agrees now to buy cocoa at a fixed price for delivery in six months. What is it most likely doing?",
          options: [
            { id: "a", text: "Speculating that the price of cocoa will fall soon", explain: "Fixing a purchase price protects against a rise; it is not a bet on a fall." },
            { id: "b", text: "Acting as a market maker", explain: "A market maker quotes both a buy and a sell price; this firm is simply buying what it needs." },
            { id: "c", text: "Hedging the cost of an input it needs", explain: "Right. It already needs cocoa and wants to remove the risk of a price rise." },
            { id: "d", text: "Avoiding having a counterparty", explain: "Every trade has a counterparty; fixing a price does not remove it." },
          ],
          correct: "c",
        },
      },
      flashcard: { front: "Principal (broker)", back: "A broker that fills your orders itself is your counterparty: your loss can be its gain." },
    },
    {
      id: "mf-share-pnl",
      title: "Working out a gain or loss on shares",
      lessonIds: ["stocks"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "The usual slips are working out the change per share but forgetting to multiply by the number of shares, or getting the sign wrong on a loss.",
        altExplanation: "Use one line every time: result = (sell price − buy price) × number of shares. If the sell price is lower, the bracket is negative, so the result is a loss. Do the bracket first, then multiply.",
        altExample: "Buy 30 shares at $12.00, sell at $11.40. Bracket: 11.40 − 12.00 = −0.60. Multiply: −0.60 × 30 = −$18, an $18 loss before costs.",
        practice: {
          kind: "numeric",
          prompt: "You buy 60 shares at $15.00 and sell them at $16.25. Ignoring costs, what is your result in dollars?",
          unit: "US dollars",
          answer: 75,
          tolerance: 0.01,
          explain: "(16.25 − 15.00) × 60 = 1.25 × 60 = $75 gain.",
        },
      },
      flashcard: { front: "Gain or loss on shares", back: "(Sell price − buy price) × number of shares. Negative means a loss." },
    },
    {
      id: "mf-currency-pairs",
      title: "Reading currency pairs and pips",
      lessonIds: ["forex"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "The base and quote currencies are easy to swap round. The price always says how much of the SECOND (quote) currency buys one unit of the FIRST (base) currency.",
        altExplanation: "Read a pair as a price tag on its first currency. EUR/USD 1.0850 is a tag on one euro saying \"1.0850 dollars\". To turn euros into dollars, multiply by the rate; to turn dollars into euros, divide. A [[pip]] is the standard small step: the fourth decimal for most pairs, the second decimal for yen pairs.",
        altExample: "AUD/USD at 0.6600 means one Australian dollar costs 66 US cents. 200 Australian dollars are 200 × 0.6600 = 132 US dollars. A move to 0.6605 is 5 pips.",
        practice: {
          kind: "numeric",
          prompt: "USD/CAD is 1.3600. How many Canadian dollars is 250 US dollars, ignoring costs?",
          unit: "Canadian dollars",
          answer: 340,
          tolerance: 0.01,
          explain: "The base is the US dollar, so 1 USD = 1.36 CAD. 250 × 1.36 = 340 Canadian dollars.",
        },
      },
      flashcard: { front: "Base and quote currency", back: "In EUR/USD 1.0850, the euro is the base, the dollar the quote: one euro costs 1.0850 dollars." },
    },
    {
      id: "mf-leverage",
      title: "Leverage multiplies losses",
      lessonIds: ["forex", "trading-vs-investing"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "The dangerous belief is that leverage only makes gains bigger, or that you can lose no more than a small deposit. Leverage multiplies losses by exactly the same factor as gains.",
        altExplanation: "With [[leverage]], your deposit is a down-payment on a much bigger position, and every price move is applied to the full position. Divide the move by your deposit's share of the position: at 20:1 the deposit is 1/20 of the position, so every 1% move is 20% of your deposit, in either direction.",
        altExample: "Like buying a $200,000 house with a $10,000 deposit (20:1). If the house price falls 5%, that is $10,000: your whole deposit is gone, although the house only lost a twentieth of its value.",
        practice: {
          kind: "numeric",
          prompt: "You use 10:1 leverage. The price moves 3% against you. What percentage of the deposit you used for that trade have you lost?",
          unit: "% of the deposit",
          answer: 30,
          tolerance: 0.01,
          explain: "Leverage multiplies the move: 3% × 10 = 30% of the deposit.",
        },
      },
      flashcard: { front: "Leverage", back: "A small deposit controls a big position. Gains AND losses are multiplied by the same factor." },
    },
    {
      id: "mf-spread-orders",
      title: "Bid, ask and spread",
      lessonIds: ["terminology"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "People often think they trade at the price shown on a chart. Buying straight away happens at the higher ask and selling at the lower bid, so a new trade starts slightly behind.",
        altExplanation: "Picture a currency exchange booth: it shows a \"we buy\" price and a higher \"we sell\" price. You always get the side that suits the booth. The [[bid]] is what you receive when you sell; the [[ask]] is what you pay when you buy; the gap, the [[spread]], is the cost of trading immediately.",
        altExample: "At an airport booth, dollars might be sold to you at £0.82 and bought back at £0.76. Swap £100 into dollars and straight back, and you lose the gap even though the rate never moved.",
        practice: {
          kind: "single",
          prompt: "A share is quoted bid $8.00 and ask $8.04. You own some and want to sell straight away. Which price do you usually receive?",
          options: [
            { id: "a", text: "$8.04, the ask", explain: "The ask is what buyers pay. A seller receives the lower price." },
            { id: "c", text: "$8.02, the middle", explain: "You can see the mid-price, but you cannot usually trade at it." },
            { id: "d", text: "$8.08, ask plus spread", explain: "There is no such price; you sell at the bid." },
            { id: "b", text: "$8.00, the bid", explain: "Right. Selling straight away usually gets the bid, the best price a buyer offers." },
          ],
          correct: "b",
        },
      },
      flashcard: { front: "Bid, ask and spread", back: "Buy now at the ask, sell now at the bid. The gap is the spread, a cost of trading immediately." },
    },
    {
      id: "mf-stop-loss",
      title: "What a stop-loss can and cannot do",
      lessonIds: ["terminology"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "The dangerous belief is that a stop-loss guarantees your exit price. A standard stop becomes an order to close at the next available price, and when the price gaps past it, that price can be much worse.",
        altExplanation: "A [[stop-loss]] is an instruction, not a safety net with a fixed height. When the price reaches your level, the stop triggers and the position is closed at the best price then available. If the market jumps straight past your level ([[market-gap|a gap]]), there is no trading at your level, so the fill is lower ([[slippage]]).",
        altExample: "You tell a friend: \"Sell my concert ticket if the price drops to $80.\" Overnight the band cancels half the tour and the next offer anyone makes is $50. Your friend sells at $50, not $80, because nobody was buying at $80 any more.",
        practice: {
          kind: "true-false",
          statement: "If a share gaps from $30 to $26 overnight, a standard stop-loss at $28 usually fills near $26.",
          answer: true,
          explain: "True. No trades happened at $28: the first available price was about $26, so the stop triggers and fills there. The loss is bigger than planned.",
        },
      },
      flashcard: { front: "Stop-loss", back: "Closes a position at the next available price once your level is hit. Gaps and fast markets can fill it worse than your level." },
    },
    {
      id: "mf-indices",
      title: "How indices are weighted",
      lessonIds: ["indices"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "It is easy to assume every company in an index counts the same. Most big indices give bigger companies (by market value) more weight, and price-weighted ones give higher-priced shares more weight.",
        altExplanation: "An [[index]] is a recipe. The [[weighting]] says how much of each ingredient goes in. In a market-cap weighted index, a giant company is a large share of the recipe, so its move changes the taste most. In an equal-weighted index, each ingredient is the same amount, so the index move is the average of the members' moves.",
        altExample: "A class's average height changes a lot if the tallest pupil is counted ten times (like a heavily weighted giant), and much less if each pupil counts once (equal weighting).",
        practice: {
          kind: "numeric",
          prompt: "An equal-weighted index has four members. Today they move +2%, +2%, −4% and +4%. What is the index's percentage change?",
          unit: "%",
          answer: 1,
          tolerance: 0.01,
          explain: "Equal weights: average the moves. (2 + 2 − 4 + 4) ÷ 4 = 4 ÷ 4 = 1%.",
        },
      },
      flashcard: { front: "Market-cap weighting", back: "Bigger companies (by total market value) count more. A few giants can drive much of the index." },
    },
    {
      id: "mf-commodities",
      title: "Commodities and futures",
      lessonIds: ["commodities-intro"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "People often think trading oil or wheat means owning a barrel or a sack. Most commodity trading uses futures, which are leveraged and expire, so they behave differently from simply holding something.",
        altExplanation: "A [[futures]] contract is a promise made today about a trade on a later date: how much, at what price, and when. Because you only post a deposit, it is leveraged. Because it has a date, someone must deal with the delivery or close the contract before then.",
        altExample: "Ordering a sofa today at a fixed price for delivery in three months is like a futures contract. If you have nowhere to put the sofa when it arrives, you have to pay someone to take your place. In April 2020 some oil futures holders faced exactly that problem.",
        practice: {
          kind: "single",
          prompt: "Which feature of a futures contract creates a risk that simply owning shares does not?",
          options: [
            { id: "c", text: "It has a fixed expiry date and is leveraged", explain: "Right. Expiry forces a decision by a date, and leverage multiplies losses." },
            { id: "a", text: "It is traded through a broker", explain: "Shares are traded through brokers too, so this is not the difference." },
            { id: "b", text: "Its price can go up or down", explain: "Share prices can go up or down as well." },
            { id: "d", text: "It has a buyer and a seller", explain: "Every trade has a buyer and a seller." },
          ],
          correct: "c",
        },
      },
      flashcard: { front: "Futures contract", back: "An agreement to buy or sell a set amount at a set price on a future date. Leveraged, and it expires." },
    },
    {
      id: "mf-crypto",
      title: "Crypto custody and stablecoin risk",
      lessonIds: ["crypto-intro"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Two beliefs cause losses: that coins held on an exchange are as safe as money in a bank, and that a stablecoin cannot lose its value.",
        altExplanation: "In crypto, whoever holds the [[private-key|private keys]] controls the coins. Leave coins on an exchange and the exchange holds the keys: you have its promise, not the coins themselves ([[custody]]). A [[stablecoin]] aims to stay at one dollar, but that is a design goal; when trust or backing fails, the [[peg]] can break.",
        altExample: "Leaving coins on an exchange is like leaving your cash in a friend's wallet: fine until the friend loses the wallet or disappears. When FTX collapsed in November 2022, many customers could not withdraw.",
        practice: {
          kind: "true-false",
          statement: "If a crypto exchange holding your coins is hacked, you still control the coins because they are registered in your name.",
          answer: false,
          explain: "False. On an exchange, the exchange holds the private keys. Whoever holds the keys controls the coins, so a hack or failure can mean you lose them.",
        },
      },
      flashcard: { front: "Custody (crypto)", back: "Whoever holds the private keys controls the coins. On an exchange, the exchange holds them." },
    },
    {
      id: "mf-trading-investing",
      title: "Costs and the evidence on short-term trading",
      lessonIds: ["trading-vs-investing"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "It is tempting to think more trades mean more chances to win. Every trade pays costs, and the evidence shows most retail traders in leveraged products lose money.",
        altExplanation: "Think of each trade as paying a small toll before you know whether the journey was worth it. A few tolls a year hardly matter; hundreds of tolls take a big share of any gains. That is one reason the regulator's 2018 review found most retail CFD accounts lost money.",
        altExample: "Two people each make a 1% gross gain per month. One trades twice a month, the other forty times, each trade costing 0.1%. The first keeps about 0.8% a month; the second's costs (about 4%) turn the gain into a loss.",
        practice: {
          kind: "numeric",
          prompt: "Your trades gain 2% a month before costs. You make 25 trades a month and each costs 0.1% of your account. What is your monthly result after costs, in %?",
          unit: "%",
          answer: -0.5,
          tolerance: 0.01,
          explain: "Costs: 25 × 0.1% = 2.5%. Result: 2% − 2.5% = −0.5%, a loss.",
        },
      },
      flashcard: { front: "Costs and trading often", back: "Every trade pays spreads and commissions. The more often you trade, the more of your result goes to costs." },
    },
    {
      id: "mf-applied",
      title: "Applied scenario: making a sound decision",
      lessonIds: ["terminology", "trading-vs-investing", "crypto-intro"],
      critical: true,
      safetyCritical: false,
      applied: true,
      remediation: {
        misconception: "The trap is judging a decision by what might happen next, or by what a friend says worked. A sound decision is one that follows good rules with the information you have: money you can afford to lose, known risks, and no pressure.",
        altExplanation: "Before any money decision, run a short checklist. Can I afford to lose this money? Do I understand the product and its costs? Is someone pressuring me, or promising a guaranteed return? Is there an event (like results or news) that could make the price jump past my exit? If any answer is a red flag, the sound decision is to wait or say no.",
        altExample: "A seatbelt is a sound decision even on the many trips with no crash. Driving without one and arriving safely does not make it a good decision. Judge the process, not the single outcome.",
        practice: {
          kind: "scenario",
          situation: "A colleague says a new coin \"cannot lose\" because a celebrity is promoting it, and the offer to buy at a discount ends tonight.",
          question: "What is the soundest response?",
          options: [
            { id: "a", text: "Buy a little tonight so you don't miss out, then research it properly tomorrow", explain: "This lets the deadline decide for you. Researching after you have paid is the wrong order.", process: "partial" },
            { id: "b", text: "Treat the guarantee, celebrity and deadline as warning signs; don't buy", explain: "Right. Guaranteed returns, celebrity endorsements and pressure to act fast are classic scam signs.", process: "sound" },
            { id: "c", text: "Buy, because a famous person would never risk their reputation on a bad coin", explain: "Endorsements are often paid and are not evidence of value.", process: "unsound" },
            { id: "d", text: "Buy with a stop-loss so the loss can't be large", explain: "Stops do not protect against a coin that collapses or cannot be sold, and they do not make a scam safe.", process: "unsound" },
          ],
        },
      },
      flashcard: { front: "Process over outcome", back: "Judge a decision by the reasoning and risk at the time, not by whether it happened to make money." },
    },
  ],
  questions: [
    // mf-markets
    {
      id: "mf-q-markets-1", concept: "mf-markets", type: "knowledge",
      explanation: "An exchange matches orders centrally under published rules. In an OTC market each deal is agreed directly between two parties, usually banks and dealers, and quotes can differ.",
      item: {
        kind: "single",
        prompt: "What is the main difference between an exchange and an over-the-counter (OTC) market?",
        options: [
          { id: "a", text: "Exchanges are only for shares and OTC markets are only for currencies, so the two never overlap", explain: "Many assets trade both ways; the difference is how orders are matched, not what is traded." },
          { id: "c", text: "OTC trades never settle, so the asset and the money never actually change hands", explain: "OTC trades settle too. Settlement is part of every trade." },
          { id: "b", text: "An exchange matches orders centrally; OTC deals are agreed directly between two parties", explain: "Right. That is why OTC prices from different providers can differ slightly." },
          { id: "d", text: "On an exchange, every dealer quotes a different official price for the same share", explain: "The reverse: on an exchange everyone sees the same official prices." },
        ],
        correct: "b",
      },
    },
    {
      id: "mf-q-markets-2", concept: "mf-markets", type: "knowledge",
      explanation: "Matching and execution come first. Settlement, when the asset and the money change hands, comes last and can be a day or more later.",
      item: {
        kind: "true-false",
        statement: "Settlement is the moment your order is matched with someone on the other side.",
        answer: false,
        explain: "False. Matching happens first and the trade is executed at the agreed price. Settlement is the later step when the asset and the money actually change hands.",
      },
    },
    // mf-price-drivers
    {
      id: "mf-q-drivers-1", concept: "mf-price-drivers", type: "knowledge",
      explanation: "Prices react mainly to surprises. Results that match what everyone expected were largely priced in already.",
      item: {
        kind: "single",
        prompt: "A company reports record profits, exactly as analysts widely expected, and its share price barely moves. What is the most likely reason?",
        options: [
          { id: "a", text: "Record profits never affect a share price", explain: "Profits matter a lot; what was missing here was a surprise." },
          { id: "b", text: "The exchange stopped the price from changing that day", explain: "Nothing in the question suggests trading was halted." },
          { id: "d", text: "Supply and demand do not apply to profitable companies", explain: "Supply and demand set every market price." },
          { id: "c", text: "The good news was already priced in", explain: "Right. The result matched expectations, so there was little new information to move the price." },
        ],
        correct: "c",
      },
    },
    {
      id: "mf-q-drivers-2", concept: "mf-price-drivers", type: "knowledge",
      explanation: "When more people want to buy than sell at the current price, buyers have to offer more to find sellers, so the price tends to rise.",
      item: {
        kind: "single",
        prompt: "At today's price, far more people want to buy a share than want to sell it. What tends to happen?",
        options: [
          { id: "b", text: "The price rises until enough sellers are willing to sell", explain: "Right. Buyers bid higher to find sellers, and the price climbs until the two sides balance." },
          { id: "a", text: "The price falls, because sellers are in short supply", explain: "A shortage of sellers pushes prices up, not down." },
          { id: "c", text: "Nothing, because the price is fixed by the company", explain: "A listed company does not fix its share price; the market does." },
          { id: "d", text: "The share is removed from the exchange until demand falls", explain: "Exchanges do not remove shares because demand is high." },
        ],
        correct: "b",
      },
    },
    // mf-liquidity
    {
      id: "mf-q-liq-1", concept: "mf-liquidity", type: "knowledge",
      explanation: "Liquidity means you can trade a normal amount quickly without moving the price much, because many buyers and sellers are ready at close prices.",
      item: {
        kind: "single",
        prompt: "Which description fits a liquid market best?",
        options: [
          { id: "a", text: "Prices there rarely change at all", explain: "Liquid markets can move a lot; liquidity is about how easily you can trade." },
          { id: "c", text: "A normal-sized order fills quickly without moving the price much", explain: "Right. Many buyers and sellers wait at close prices, so orders are absorbed." },
          { id: "b", text: "Only large banks and funds are allowed to trade in it, not retail traders", explain: "Who is allowed in is a separate question from liquidity." },
          { id: "d", text: "Its prices are always quoted to many decimal places", explain: "The number of decimals says nothing about liquidity." },
        ],
        correct: "c",
      },
    },
    {
      id: "mf-q-liq-2", concept: "mf-liquidity", type: "knowledge",
      explanation: "Thin markets tend to be MORE volatile: with few orders waiting, a large order or a surprise can push the price a long way.",
      item: {
        kind: "true-false",
        statement: "Thinly traded markets tend to be less volatile, because fewer people are trading.",
        answer: false,
        explain: "False. With few buyers and sellers waiting, one large order or a surprise can move the price a long way, so thin markets tend to be more volatile.",
      },
    },
    // mf-participants
    {
      id: "mf-q-part-1", concept: "mf-participants", type: "knowledge",
      explanation: "A broker acting as principal fills your trades itself, so it is your counterparty: your loss can be its gain.",
      item: {
        kind: "single",
        prompt: "Your CFD broker acts as principal on your trades. What does that mean for you?",
        options: [
          { id: "b", text: "The broker must send every order to a public exchange", explain: "Acting as principal means the broker fills orders itself rather than passing them on." },
          { id: "c", text: "The broker guarantees that you cannot lose money", explain: "No broker can guarantee that, and acting as principal does not mean it." },
          { id: "a", text: "The broker is the other side of your trades", explain: "Right. It is your counterparty, so your loss can be its gain. Always read how a broker makes money." },
          { id: "d", text: "Your orders are matched with other retail traders only", explain: "As principal, the broker itself takes the other side." },
        ],
        correct: "a",
      },
    },
    {
      id: "mf-q-part-2", concept: "mf-participants", type: "knowledge",
      explanation: "Hedging reduces a risk you already have (fuel costs, a future payment in another currency). Buying in the hope of a rise is speculation.",
      item: {
        kind: "multi-select",
        prompt: "Which of these are hedging rather than speculation? Select all that apply.",
        options: [
          { id: "a", text: "An airline fixes the price of fuel it will need next year", explain: "Hedging: it already needs fuel and is reducing the risk of a price rise." },
          { id: "b", text: "An exporter locks in an exchange rate for a payment due in three months", explain: "Hedging: it will receive foreign currency and is removing the exchange-rate risk." },
          { id: "c", text: "A trader buys a currency because they expect it to rise", explain: "Speculation: they had no existing risk and are taking one on for profit." },
          { id: "d", text: "Someone buys a share after a news story, hoping for a quick profit", explain: "Speculation: a bet on a price move, not protection against an existing risk." },
        ],
        correct: ["a", "b"],
      },
    },
    // mf-share-pnl
    {
      id: "mf-q-pnl-1", concept: "mf-share-pnl", type: "calculation",
      explanation: "(23.50 − 25.00) × 40 = −1.50 × 40 = −$60, a $60 loss before costs.",
      item: { kind: "numeric", prompt: "You buy 40 shares at $25.00 and sell them at $23.50. Ignoring costs, what is your result in dollars? Enter a loss as a negative number.", unit: "US dollars", answer: -60, tolerance: 0.01, explain: "(23.50 − 25.00) × 40 = −$60." },
    },
    {
      id: "mf-q-pnl-2", concept: "mf-share-pnl", type: "calculation",
      explanation: "(9.05 − 8.20) × 120 = 0.85 × 120 = $102 gain before costs.",
      item: { kind: "numeric", prompt: "You buy 120 shares at $8.20 and sell them at $9.05. Ignoring costs, what is your gain in dollars?", unit: "US dollars", answer: 102, tolerance: 0.01, explain: "(9.05 − 8.20) × 120 = $102." },
    },
    // mf-currency-pairs
    {
      id: "mf-q-pairs-1", concept: "mf-currency-pairs", type: "knowledge",
      explanation: "In EUR/USD the euro is the base and the dollar the quote: the price is how many dollars one euro costs.",
      item: {
        kind: "single",
        prompt: "EUR/USD is quoted at 1.0850. What does that mean?",
        options: [
          { id: "a", text: "One US dollar costs 1.0850 euros", explain: "That swaps the currencies round. The first currency (the base) is the one being priced." },
          { id: "c", text: "The euro rose 1.085% against the dollar today", explain: "A quote is a price, not a percentage change." },
          { id: "d", text: "You need 1,085 euros to trade", explain: "The quote says nothing about the minimum trade size." },
          { id: "b", text: "One euro costs 1.0850 US dollars", explain: "Right. The price says how much of the quote currency buys one unit of the base." },
        ],
        correct: "b",
      },
    },
    {
      id: "mf-q-pairs-2", concept: "mf-currency-pairs", type: "calculation",
      explanation: "The pound is the base, so multiply: 400 × 1.25 = 500 US dollars.",
      item: { kind: "numeric", prompt: "GBP/USD is 1.2500. How many US dollars do you get for 400 pounds, ignoring costs?", unit: "US dollars", answer: 500, tolerance: 0.01, explain: "Pounds are the base, so multiply by the rate: 400 × 1.25 = 500." },
    },
    {
      id: "mf-q-pairs-3", concept: "mf-currency-pairs", type: "knowledge",
      explanation: "For pairs that include the Japanese yen, a pip is the second decimal place, so 150.00 to 150.01 is one pip.",
      item: { kind: "true-false", statement: "For USD/JPY, every move of 0.01 is one pip.", answer: true, explain: "True. For yen pairs the pip is the second decimal place (0.01)." },
    },
    // mf-leverage (safety-critical)
    {
      id: "mf-q-lev-1", concept: "mf-leverage", type: "calculation",
      explanation: "Leverage multiplies the move: 2% × 20 = 40% of the deposit used for the trade.",
      item: { kind: "numeric", prompt: "You use 20:1 leverage. The price moves 2% against your position. What percentage of the deposit you used for that trade have you lost?", unit: "% of the deposit", answer: 40, tolerance: 0.01, explain: "2% × 20 = 40% of the deposit." },
    },
    {
      id: "mf-q-lev-2", concept: "mf-leverage", type: "knowledge",
      explanation: "Leverage multiplies losses by exactly the same factor as gains, so a small move can take a large part of the deposit.",
      item: {
        kind: "single",
        prompt: "Why does leverage make forex especially risky for beginners?",
        options: [
          { id: "c", text: "It multiplies losses as much as gains, so small moves hurt", explain: "Right. A 1% move at 30:1 is 30% of the deposit, either way." },
          { id: "a", text: "It makes the spread wider on every trade", explain: "Spreads are set separately; leverage changes position size, not the spread." },
          { id: "b", text: "It multiplies gains, while losses stay the size of the move", explain: "This is the dangerous myth. Losses are multiplied exactly as much as gains." },
          { id: "d", text: "It means a broker must close every trade within one day", explain: "Leverage has nothing to do with how long you can hold a trade." },
        ],
        correct: "c",
      },
    },
    {
      id: "mf-q-lev-3", concept: "mf-leverage", type: "knowledge",
      explanation: "Losses are calculated on the full position. A large enough move takes more than the trade's deposit, and in a fast move, without negative balance protection, more than the whole account.",
      item: { kind: "true-false", statement: "With leverage, the deposit you put down for a trade is the most you can lose on it.", answer: false, explain: "False. At 30:1, a 4% move against you is 120% of the trade's deposit. The extra comes out of the rest of your account, and without negative balance protection a fast move can cost more than everything in it." },
    },
    // mf-spread-orders
    {
      id: "mf-q-spread-1", concept: "mf-spread-orders", type: "knowledge",
      explanation: "Buying straight away usually fills at the ask, the lowest price a seller will accept.",
      item: {
        kind: "single",
        prompt: "A share is quoted bid $50.00 and ask $50.10. You buy straight away with a market order. Which price do you usually pay?",
        options: [
          { id: "a", text: "$50.00, the bid", explain: "The bid is what a seller receives, not what a buyer pays." },
          { id: "c", text: "$50.10, the ask", explain: "Right. Buyers pay the ask; the 10-cent gap is the spread." },
          { id: "b", text: "$50.05, the midpoint", explain: "The mid-price is shown on charts, but you cannot usually trade at it." },
          { id: "d", text: "Any price you type into the order", explain: "That is a limit order. A market order takes the best available price." },
        ],
        correct: "c",
      },
    },
    {
      id: "mf-q-spread-2", concept: "mf-spread-orders", type: "calculation",
      explanation: "You pay the ask and receive the bid: (10.05 − 10.00) × 200 = $10, lost to the spread although the price never moved.",
      item: { kind: "numeric", prompt: "You buy 200 shares at the ask of $10.05 and immediately sell them at the bid of $10.00. Prices have not moved. How much have you lost, in dollars? Enter it as a positive number.", unit: "US dollars", answer: 10, tolerance: 0.01, explain: "Spread 0.05 × 200 shares = $10." },
    },
    // mf-stop-loss (safety-critical)
    {
      id: "mf-q-stop-1", concept: "mf-stop-loss", type: "applied",
      explanation: "There was no trading at $19 because the price gapped. The stop triggers at the open and fills at the first available price, near $17.",
      item: {
        kind: "single",
        prompt: "You buy a share at $20 with a stop-loss at $19. Overnight, bad news comes out and the share opens at $17. What usually happens?",
        options: [
          { id: "a", text: "The stop fills at exactly $19, as you set it", explain: "That would need someone buying at $19, but the price jumped straight past it." },
          { id: "c", text: "The stop is cancelled and the position stays open", explain: "The stop is not cancelled; it triggers and closes the position at the next price." },
          { id: "b", text: "The stop fills near $17, a bigger loss than planned", explain: "Right. A gap means no trades at your level, so the stop fills at the next available price." },
          { id: "d", text: "The broker pays you back the gap between $19 and $17", explain: "Brokers do not refund gap losses on standard stops." },
        ],
        correct: "b",
      },
    },
    {
      id: "mf-q-stop-2", concept: "mf-stop-loss", type: "knowledge",
      explanation: "A standard stop-loss closes the position at the next available price once your level is reached. In a gap or a fast market, that can be worse than your level.",
      item: { kind: "true-false", statement: "A standard stop-loss order makes sure your loss stops at the level you chose.", answer: false, explain: "False. It becomes an order at the next available price. Gaps and slippage can make the fill worse than your level." },
    },
    {
      id: "mf-q-stop-3", concept: "mf-stop-loss", type: "applied",
      explanation: "Two lines assume the stop is a guarantee. A gap, especially around a results announcement, can fill the stop well below $28.",
      item: {
        kind: "find-error",
        prompt: "Find the mistakes in this trade plan. Select every line that is wrong.",
        lines: [
          { id: "l1", text: "Buy 100 shares of a large, actively traded company at about $30." },
          { id: "l2", text: "Place a stop-loss at $28 to limit the loss if the price falls." },
          { id: "l3", text: "Because the stop is at $28, the most I can possibly lose is $200.", error: "A gap or slippage can fill the stop below $28, so the loss can be more than $200." },
          { id: "l4", text: "Hold through tomorrow's results announcement; the stop protects me fully.", error: "Results are often released outside trading hours, and the price can gap straight past the stop." },
          { id: "l5", text: "Write down the reason for the trade before placing it." },
        ],
        explain: "Lines 1, 2 and 5 are reasonable. Lines 3 and 4 treat the stop as a guarantee, which it is not.",
      },
    },
    // mf-indices
    {
      id: "mf-q-idx-1", concept: "mf-indices", type: "knowledge",
      explanation: "In a market-cap weighted index, bigger companies (by total market value) count more, so a few giants can drive much of the move.",
      item: {
        kind: "single",
        prompt: "In a market-cap weighted index such as the S&P 500, which companies move the index the most?",
        options: [
          { id: "a", text: "Those with the highest share price, whatever their size", explain: "That describes a price-weighted index, such as the Dow." },
          { id: "b", text: "Every company moves it equally", explain: "That describes an equal-weighted index." },
          { id: "c", text: "The ones that joined most recently", explain: "When a company joined does not set its weight." },
          { id: "d", text: "The ones with the largest market value", explain: "Right. Weight follows market capitalisation." },
        ],
        correct: "d",
      },
    },
    {
      id: "mf-q-idx-2", concept: "mf-indices", type: "calculation",
      explanation: "Equal weights: the index change is the average. (3 − 1 + 4) ÷ 3 = 2%.",
      item: { kind: "numeric", prompt: "A simple equal-weighted index has three members. Today they move +3%, −1% and +4%. What is the index's percentage change?", unit: "%", answer: 2, tolerance: 0.01, explain: "(3 − 1 + 4) ÷ 3 = 2%." },
    },
    // mf-commodities
    {
      id: "mf-q-com-1", concept: "mf-commodities", type: "knowledge",
      explanation: "A futures contract fixes the amount, price and date of a future trade. Most commodity trading uses them.",
      item: {
        kind: "single",
        prompt: "What is a futures contract?",
        options: [
          { id: "b", text: "An agreement to trade a set amount at a set price on a future date", explain: "Right. Futures are leveraged and have an expiry date." },
          { id: "a", text: "A share in a company that produces commodities", explain: "That is a share, not a futures contract." },
          { id: "c", text: "A guarantee that a commodity's price will rise", explain: "Nothing guarantees a price will rise." },
          { id: "d", text: "A warehouse receipt for goods you already own", explain: "That describes a record of stored goods, not an agreement about a future trade." },
        ],
        correct: "b",
      },
    },
    {
      id: "mf-q-com-2", concept: "mf-commodities", type: "knowledge",
      explanation: "In April 2020, with storage nearly full, holders of the May WTI contract who could not take delivery had to pay to exit. Expiry and delivery create risks shares do not have.",
      item: { kind: "true-false", statement: "In April 2020 a US oil futures contract briefly traded below zero, because holders who could not take delivery had to pay to get out.", answer: true, explain: "True. With storage nearly full, the May WTI contract briefly went negative near expiry. It shows that futures carry delivery and expiry risks that shares do not." },
    },
    // mf-crypto
    {
      id: "mf-q-crypto-1", concept: "mf-crypto", type: "knowledge",
      explanation: "On an exchange, the exchange holds the private keys (custody). If it fails or is hacked, you can lose the coins.",
      item: {
        kind: "single",
        prompt: "You keep your coins on a crypto exchange. Who holds the private keys that control them?",
        options: [
          { id: "a", text: "You do, because the account is in your name", explain: "The account is yours, but the keys stay with the exchange." },
          { id: "c", text: "The exchange, so its failure can cost you", explain: "Right. Whoever holds the keys controls the coins." },
          { id: "b", text: "Your bank, which guarantees the balance", explain: "Banks do not hold or guarantee coins kept on a crypto exchange." },
          { id: "d", text: "Nobody, because blockchains have no keys", explain: "Private keys are exactly what control coins on a blockchain." },
        ],
        correct: "c",
      },
    },
    {
      id: "mf-q-crypto-2", concept: "mf-crypto", type: "knowledge",
      explanation: "A stablecoin's one-dollar value is a design goal, not a guarantee. TerraUSD lost its peg and collapsed in May 2022.",
      item: { kind: "true-false", statement: "A stablecoin that has kept its one-dollar value for years has shown it will not fall below a dollar.", answer: false, explain: "False. Holding the peg is a design goal. TerraUSD lost its peg and collapsed within days in May 2022." },
    },
    // mf-trading-investing
    {
      id: "mf-q-ti-1", concept: "mf-trading-investing", type: "knowledge",
      explanation: "Every trade pays spreads, commissions and sometimes overnight fees, so trading more often hands more of the result to costs.",
      item: {
        kind: "single",
        prompt: "All else being equal, why does trading more often usually make results worse?",
        options: [
          { id: "a", text: "Brokers deliberately slow down busy accounts", explain: "There is no such general rule; the problem is cost." },
          { id: "c", text: "Prices always move against frequent traders", explain: "Prices do not know who is trading. Costs are the reliable drag." },
          { id: "b", text: "Each trade pays costs, so more trades mean more costs", explain: "Right. Spreads and commissions add up with every trade." },
          { id: "d", text: "Taxes are charged only on short-term trades", explain: "Tax rules vary by country; the general point here is trading costs." },
        ],
        correct: "b",
      },
    },
    {
      id: "mf-q-ti-2", concept: "mf-trading-investing", type: "knowledge",
      explanation: "ESMA's 2018 review found that between 74% and 89% of retail CFD accounts typically lost money.",
      item: { kind: "true-false", statement: "When the EU's markets regulator (ESMA) reviewed retail CFD trading in 2018, it found that most retail accounts typically lost money.", answer: true, explain: "True. It found that between 74% and 89% of retail CFD accounts typically lost money." },
    },
    // mf-applied (scenario)
    {
      id: "mf-q-applied-1", concept: "mf-applied", type: "applied",
      explanation: "The sound choice treats the guarantee and the deadline as warning signs and keeps real money out. Sending a small \"test\" amount still lets a likely scam decide the timing, and early payouts are a common trick to win trust.",
      item: {
        kind: "scenario",
        situation: "You have finished Market Foundations and have £500 you could afford to lose. A friend shares a post from a crypto trading group promising \"guaranteed 5% a week\", and says you must join today to get in.",
        question: "What do you do?",
        options: [
          { id: "a", text: "Send £50 first to test whether the returns are real", explain: "Smaller, but it ignores the red flags. Scams often pay out early to build trust before taking more.", process: "partial" },
          { id: "b", text: "Join today with the full £500, since your friend says it works", explain: "A friend's say-so is not evidence, and the guarantee plus the deadline are classic scam signs.", process: "unsound" },
          { id: "d", text: "Join, but first ask the group to put its guarantee in writing and sign it", explain: "A written promise from a scam is worthless. The problem is the guarantee itself.", process: "unsound" },
          { id: "c", text: "See the guarantee and deadline as red flags and send nothing", explain: "Right. No legitimate investment guarantees profits, and pressure to act fast is a warning sign.", process: "sound" },
        ],
        outcome: "Suppose the group really did pay your friend 5% for a few weeks. That would not make joining sound: early payouts from new members' money are how many schemes grow before they collapse.",
      },
    },
    {
      id: "mf-q-applied-2", concept: "mf-applied", type: "applied",
      explanation: "Money you need soon should not be at risk, and a results announcement can gap the price past any stop. The sound decision is not to trade with rent money, whatever the outcome might have been.",
      item: {
        kind: "scenario",
        situation: "A company you like reports its results tomorrow morning, before the market opens. You want to buy its shares today with a stop-loss, using money set aside for next month's rent.",
        question: "What is the soundest decision?",
        options: [
          { id: "d", text: "Don't trade with money you need soon; results can gap past a stop", explain: "Right. Only risk money you can afford to lose, and know that a stop is not a guarantee.", process: "sound" },
          { id: "a", text: "Buy, because the stop-loss caps exactly how much you can lose on this trade", explain: "A results gap can open far below the stop, and rent money should not be at risk at all.", process: "unsound" },
          { id: "b", text: "Buy a smaller amount with a tighter stop", explain: "Unsound: it is still rent money, which should not be at risk at all, and a results gap jumps a tight stop as easily as a wide one.", process: "unsound" },
          { id: "c", text: "Buy with leverage to make the most of good results", explain: "Leverage multiplies a gap loss too, with money you cannot afford to lose.", process: "unsound" },
        ],
        outcome: "Suppose the results were good and the shares opened 8% higher. Buying with rent money still was not a sound decision: the same plan could just as easily have opened 15% lower, straight past the stop.",
      },
    },
  ],
};

// ── Added in the step-1 rework: at least four questions per concept, and a second remediation variant ──
// Each new question uses a new situation, new numbers or a new angle, not a rewording.

const MORE_QUESTIONS: TrackAssessment["questions"] = [
  // mf-markets
  {
    id: "mf-q-markets-3", concept: "mf-markets", type: "applied",
    explanation: "In an OTC market each dealer quotes its own price and you deal with that dealer, so two quotes for the same thing at the same moment can differ slightly.",
    item: {
      kind: "single",
      prompt: "At the same moment, two OTC currency dealers quote you 1.2010 and 1.2013 for the same pair. What best explains the difference?",
      options: [
        { id: "a", text: "One of them has made a mistake, since there is one official price", explain: "There is no single official price in an OTC market; each dealer sets its own quote." },
        { id: "b", text: "OTC quotes are published a day late", explain: "Dealers quote live prices; the gap is not a delay." },
        { id: "d", text: "It is the exchange's settlement fee added to one quote", explain: "No exchange is involved in an OTC deal, and settlement fees are not built into a quote like this." },
        { id: "c", text: "Each dealer sets its own quote for deals made directly with it", explain: "Right. OTC deals are agreed with one dealer at a time, so quotes can differ a little." },
      ],
      correct: "c",
    },
  },
  {
    id: "mf-q-markets-4", concept: "mf-markets", type: "knowledge",
    explanation: "Execution (the deal at an agreed price) and settlement (the swap of asset and money) are separate steps. For many shares settlement happens a business day or more after the trade.",
    item: {
      kind: "true-false",
      statement: "A trade can be executed today and settled on a later day.",
      answer: true,
      explain: "True. The price is agreed when the trade executes; the asset and the money usually change hands later, at settlement.",
    },
  },
  // mf-price-drivers
  {
    id: "mf-q-drivers-3", concept: "mf-price-drivers", type: "applied",
    explanation: "Prices react to the gap between the news and what was expected. A smaller fall in profit than everyone feared is, for the price, good news.",
    item: {
      kind: "single",
      prompt: "A company says its profit fell 10%. Analysts had expected a fall of about 30%. The share price rises. What is the most likely reason?",
      options: [
        { id: "a", text: "Investors always buy when profits fall", explain: "There is no such rule; the reaction depends on expectations." },
        { id: "c", text: "The result was much less bad than the market expected", explain: "Right. The price had already allowed for a 30% fall, so a 10% fall was a pleasant surprise." },
        { id: "b", text: "A falling profit makes the company cheaper to buy", explain: "The price is what you pay; a lower profit does not by itself make the shares more attractive." },
        { id: "d", text: "The exchange raised the price to protect shareholders after the bad news was published", explain: "Exchanges do not set or adjust share prices." },
      ],
      correct: "c",
    },
  },
  {
    id: "mf-q-drivers-4", concept: "mf-price-drivers", type: "knowledge",
    explanation: "If many more people want to sell while buyers stay the same, sellers have to accept lower prices to find buyers, so the price tends to fall.",
    item: {
      kind: "true-false",
      statement: "If the number of sellers suddenly rises while the number of buyers stays the same, the price tends to fall.",
      answer: true,
      explain: "True. Sellers compete for the same buyers by asking less, so the price drops until the two sides balance again.",
    },
  },
  // mf-liquidity
  {
    id: "mf-q-liq-3", concept: "mf-liquidity", type: "applied",
    explanation: "In a thin market there are few bids near the current price. A large sell order has to reach down to lower bids, so the seller moves the price against themselves.",
    item: {
      kind: "single",
      prompt: "You need to sell a large holding of a small company's shares that trade only a few times a day, and you need to sell today. What is the main risk?",
      options: [
        { id: "a", text: "Your own selling pushes the price down as you reach lower bids", explain: "Right. With few buyers near the price, a big order fills at worse and worse prices." },
        { id: "b", text: "The shares cannot be sold until the next settlement date", explain: "Selling is possible at any time the market is open; the problem is the price you get." },
        { id: "c", text: "Small companies are not allowed to have their shares sold quickly", explain: "No such rule exists." },
        { id: "d", text: "Spreads are always zero in small shares, so nothing can go wrong", explain: "The reverse: thin markets usually have wider spreads." },
      ],
      correct: "a",
    },
  },
  {
    id: "mf-q-liq-4", concept: "mf-liquidity", type: "knowledge",
    explanation: "Narrow spreads, many orders close to the price and high trading volume are signs of a liquid market. Infrequent trades and big jumps from single orders point the other way.",
    item: {
      kind: "multi-select",
      prompt: "Which of these usually point to a MORE liquid market? Select all that apply.",
      options: [
        { id: "a", text: "A narrow gap between the bid and the ask", explain: "Yes. Tight spreads usually mean many competing buyers and sellers." },
        { id: "b", text: "Trades happen only a few times a day", explain: "No. Infrequent trading is a sign of a thin market." },
        { id: "c", text: "Plenty of orders waiting close to the current price", explain: "Yes. That is what lets a normal order fill without moving the price." },
        { id: "d", text: "A single medium-sized order often moves the price a lot", explain: "No. That happens in thin markets." },
        { id: "e", text: "High trading volume every day", explain: "Yes. Lots of trading usually means it is easy to find someone on the other side." },
      ],
      correct: ["a", "c", "e"],
    },
  },
  // mf-participants
  {
    id: "mf-q-part-3", concept: "mf-participants", type: "knowledge",
    explanation: "Every trade needs someone on the other side: another trader, a market maker, or your broker acting as principal. Knowing who it is tells you whose gain your loss can be.",
    item: {
      kind: "true-false",
      statement: "Every trade has a counterparty, even when your broker is the one on the other side.",
      answer: true,
      explain: "True. If the broker acts as principal it is your counterparty; otherwise another trader or a market maker is.",
    },
  },
  {
    id: "mf-q-part-4", concept: "mf-participants", type: "applied",
    explanation: "The same contract can be a hedge or a speculation; what matters is the reason. The airline already has fuel-price risk and reduces it; the trader takes on price risk hoping to profit.",
    item: {
      kind: "single",
      prompt: "An airline buys oil futures to fix next year's fuel cost. A trader who owns no planes buys the same contract because she expects oil to rise. Which description is right?",
      options: [
        { id: "a", text: "Both are speculating, because both bought the same contract", explain: "The contract is the same, but the reasons are different." },
        { id: "b", text: "Both are hedging, because futures are hedging tools", explain: "Futures can be used either way; the trader has no risk to hedge." },
        { id: "c", text: "The trader is hedging and the airline is speculating", explain: "This is the wrong way round." },
        { id: "d", text: "The airline is hedging; the trader is speculating", explain: "Right. The airline reduces a risk it already has; the trader takes on a risk for profit." },
      ],
      correct: "d",
    },
  },
  // mf-share-pnl
  {
    id: "mf-q-pnl-3", concept: "mf-share-pnl", type: "calculation",
    explanation: "(4.12 − 4.40) × 250 = −0.28 × 250 = −$70, a $70 loss before costs.",
    item: { kind: "numeric", prompt: "You buy 250 shares at $4.40 and sell them at $4.12. Ignoring costs, what is your result in dollars? Enter a loss as a negative number.", unit: "US dollars", answer: -70, tolerance: 0.01, explain: "(4.12 − 4.40) × 250 = −$70." },
  },
  {
    id: "mf-q-pnl-4", concept: "mf-share-pnl", type: "calculation",
    explanation: "Price gain: (33.00 − 31.50) × 80 = $120. Costs: $5 to buy plus $5 to sell = $10. Net: 120 − 10 = $110.",
    item: { kind: "numeric", prompt: "You buy 80 shares at $31.50 and sell them at $33.00. You pay a $5 commission to buy and another $5 to sell. What is your net result in dollars?", unit: "US dollars", answer: 110, tolerance: 0.01, explain: "(33.00 − 31.50) × 80 = $120, minus $10 of commission = $110." },
  },
  // mf-currency-pairs
  {
    id: "mf-q-pairs-4", concept: "mf-currency-pairs", type: "calculation",
    explanation: "EUR/GBP is not a yen pair, so a pip is the fourth decimal: 0.8540 − 0.8512 = 0.0028, which is 28 pips.",
    item: { kind: "numeric", prompt: "EUR/GBP moves from 0.8540 to 0.8512. How many pips is that move? Enter the size of the move as a positive number.", unit: "pips", answer: 28, tolerance: 0, explain: "0.8540 − 0.8512 = 0.0028; at 0.0001 per pip that is 28 pips." },
  },
  // mf-leverage (safety-critical)
  {
    id: "mf-q-lev-4", concept: "mf-leverage", type: "calculation",
    explanation: "The loss is on the full $10,000 position, not on the $500 deposit: 3% × $10,000 = $300, which is 60% of the deposit.",
    item: { kind: "numeric", prompt: "You put down a $500 deposit to control a $10,000 position (20:1). The price falls 3%. How much have you lost, in dollars? Enter it as a positive number.", unit: "US dollars", answer: 300, tolerance: 0.01, explain: "3% of the $10,000 position = $300, which is 60% of your $500 deposit." },
  },
  // mf-spread-orders (critical)
  {
    id: "mf-q-spread-3", concept: "mf-spread-orders", type: "knowledge",
    explanation: "Selling straight away means accepting the best price a buyer is offering, which is the bid, the lower of the two prices.",
    item: {
      kind: "single",
      prompt: "A currency pair is quoted 1.2500 / 1.2503. You want to SELL straight away. Which price do you usually get?",
      options: [
        { id: "a", text: "1.2503, the ask", explain: "The ask is what you pay when you buy." },
        { id: "b", text: "1.25015, halfway between the two prices", explain: "The midpoint is not a price you can usually trade at straight away." },
        { id: "d", text: "1.2500, the bid", explain: "Right. When you sell at once you receive the bid." },
        { id: "c", text: "Whichever price you type into the order ticket, even if no buyer is offering it", explain: "A market order takes the best price available, not the one you would like." },
      ],
      correct: "d",
    },
  },
  {
    id: "mf-q-spread-4", concept: "mf-spread-orders", type: "calculation",
    explanation: "Buying at the ask and selling at the bid straight away costs the spread on every share: $0.04 × 500 = $20.",
    item: { kind: "numeric", prompt: "A share's spread is $0.04 (bid $7.96, ask $8.00). You buy 500 shares and sell them all at once a moment later, with no price change. How much have you lost, in dollars? Enter it as a positive number.", unit: "US dollars", answer: 20, tolerance: 0.01, explain: "0.04 × 500 = $20 lost to the spread." },
  },
  // mf-stop-loss (safety-critical)
  {
    id: "mf-q-stop-4", concept: "mf-stop-loss", type: "applied",
    explanation: "A standard stop becomes a market order once triggered. In a fast fall the next available price can be below the stop level; the difference is slippage.",
    item: {
      kind: "single",
      prompt: "You bought at $50 with a stop-loss at $48. During a fast fall the price drops through $48 and the next trade happens at $47.60. Where is your sale usually filled?",
      options: [
        { id: "a", text: "At exactly $48, because that is where you set the stop", explain: "The stop triggers at $48, but it fills at the next price a buyer offers." },
        { id: "b", text: "Near $47.60, the next available price", explain: "Right. The gap between $48 and the fill is slippage, and it can be larger in fast markets." },
        { id: "c", text: "It is not filled until the price returns to $48", explain: "That would be a limit order; a standard stop sells at the next available price." },
        { id: "d", text: "At $50, because the broker refunds the fall", explain: "No broker refunds losses on a standard stop." },
      ],
      correct: "b",
    },
  },
  // mf-indices
  {
    id: "mf-q-idx-3", concept: "mf-indices", type: "knowledge",
    explanation: "In a cap-weighted index, a member's effect is its weight times its move: 10% × 2% = 0.2 points of the index, against 0.5% × 10% = 0.05 points.",
    item: {
      kind: "true-false",
      statement: "In a cap-weighted index, a 2% fall in a member worth 10% of the index moves it more than a 10% fall in a member worth 0.5%.",
      answer: true,
      explain: "True. 10% × 2% = 0.2% of the index, while 0.5% × 10% = 0.05%. Size, not the size of the move alone, decides the effect.",
    },
  },
  {
    id: "mf-q-idx-4", concept: "mf-indices", type: "calculation",
    explanation: "Weights by size: A is 300 / 400 = 75%, B is 25%. Change: 0.75 × 2% + 0.25 × (−4%) = 1.5% − 1% = +0.5%.",
    item: { kind: "numeric", prompt: "A cap-weighted index has two members: A is worth $300 billion and B $100 billion. Today A rises 2% and B falls 4%. What is the index's percentage change? Enter a fall as a negative number.", unit: "%", answer: 0.5, tolerance: 0.01, explain: "0.75 × 2 + 0.25 × (−4) = 0.5%." },
  },
  // mf-commodities
  {
    id: "mf-q-com-3", concept: "mf-commodities", type: "knowledge",
    explanation: "Most futures traders never want the physical goods, so they close or roll a position into a later contract before expiry to avoid delivery.",
    item: {
      kind: "single",
      prompt: "Why do most traders of oil futures close or roll their positions before the contract expires?",
      options: [
        { id: "a", text: "Futures cannot be held for more than one day", explain: "Futures can be held until expiry; that is the point of the date." },
        { id: "b", text: "Prices are fixed during the last month", explain: "Futures prices keep moving right up to expiry." },
        { id: "c", text: "To avoid having to take or make delivery of the physical commodity", explain: "Right. Holding to expiry can mean dealing with real barrels, which most traders cannot do." },
        { id: "d", text: "Because brokers pay a bonus for closing early", explain: "There is no such bonus; the reason is delivery." },
      ],
      correct: "c",
    },
  },
  {
    id: "mf-q-com-4", concept: "mf-commodities", type: "knowledge",
    explanation: "A futures price is for delivery on a future date, so it reflects storage, financing and expectations, and can differ from today's spot price.",
    item: {
      kind: "true-false",
      statement: "The price of a futures contract is the same as today's spot price of the commodity.",
      answer: false,
      explain: "False. A futures price is for delivery later, so storage costs, interest and expectations can put it above or below the spot price.",
    },
  },
  // mf-crypto
  {
    id: "mf-q-crypto-3", concept: "mf-crypto", type: "knowledge",
    explanation: "Self-custody removes the risk of an exchange failing, but the keys are then yours alone: lose them, or the recovery phrase, and nobody can restore access.",
    item: {
      kind: "single",
      prompt: "You move your coins from an exchange to a wallet where only you hold the keys. Which new risk do you take on?",
      options: [
        { id: "a", text: "If you lose the keys or the recovery phrase, nobody can restore access", explain: "Right. With self-custody there is no help desk that can reset your access." },
        { id: "b", text: "The coins stop changing in value once they leave the exchange", explain: "The price keeps moving wherever the coins are held." },
        { id: "c", text: "The exchange can still freeze the coins whenever it likes", explain: "Once you hold the keys, the exchange no longer controls the coins." },
        { id: "d", text: "Anyone who knows your wallet's address can then move the coins out", explain: "An address can be seen by others, like an account number, but only whoever holds the private key can move the coins." },
      ],
      correct: "a",
    },
  },
  {
    id: "mf-q-crypto-4", concept: "mf-crypto", type: "knowledge",
    explanation: "Blockchain transfers are final. Whoever controls the coins is responsible for every transfer, and there is no bank or help desk that can pull back coins sent to the wrong address.",
    item: {
      kind: "true-false",
      statement: "Coins sent from your own wallet to a wrong address usually cannot be recovered, because a blockchain transfer cannot be reversed.",
      answer: true,
      explain: "True. A blockchain transfer cannot be undone by a bank or anyone else, so check the address before sending (many people send a small test amount first).",
    },
  },
  // mf-trading-investing
  {
    id: "mf-q-ti-3", concept: "mf-trading-investing", type: "calculation",
    explanation: "Each round trip costs 0.2% × $5,000 = $10. Fifty round trips cost 50 × $10 = $500, a tenth of the account, before any gain or loss.",
    item: { kind: "numeric", prompt: "Each round trip (buy then sell) costs you 0.2% of the trade in spread and commission. You trade the same $5,000 fifty times in a year. What do the costs add up to, in dollars?", unit: "US dollars", answer: 500, tolerance: 0.01, explain: "0.2% × 5,000 = $10 per round trip; × 50 = $500." },
  },
  {
    id: "mf-q-ti-4", concept: "mf-trading-investing", type: "knowledge",
    explanation: "The warning describes what happened to most of that provider's clients. Losing is the common outcome, so it should be planned for, not treated as unlucky.",
    item: {
      kind: "single",
      prompt: "A CFD provider must show a warning that most of its retail clients' accounts lose money. What is the most sensible reading?",
      options: [
        { id: "a", text: "Only clients who break the rules lose", explain: "The warning covers ordinary clients, not just rule-breakers." },
        { id: "b", text: "Losing is the usual outcome there, not bad luck", explain: "Right. It reports what most clients actually experienced, so a beginner should expect it may apply to them too." },
        { id: "c", text: "It is a legal formality and says nothing about real results", explain: "It is based on the provider's own client results." },
        { id: "d", text: "It shows this provider charges more than others, so switching provider fixes it", explain: "It reports clients' results, not a price comparison. Similar warnings apply across the industry, because the products themselves are risky." },
      ],
      correct: "b",
    },
  },
  // mf-applied (critical, applied)
  {
    id: "mf-q-applied-3", concept: "mf-applied", type: "applied",
    explanation: "The stop was set when you could think clearly, for money you can afford to lose. Moving it or adding to the loser because you feel sure is how small planned losses become large unplanned ones.",
    item: {
      kind: "scenario",
      situation: "You bought a share at $30 with a planned stop-loss at $27, risking money you can afford to lose. It has fallen to $27.40, and you feel sure it will bounce.",
      question: "What is the soundest process?",
      options: [
        { id: "a", text: "Move the stop down to $24 to give it room to recover", explain: "Moving a stop further away after entry to avoid a loss increases the risk you planned to take.", process: "unsound" },
        { id: "b", text: "Leave the stop where the plan put it and accept the result", explain: "Right. The plan already priced in this loss; a feeling is not new information.", process: "sound" },
        { id: "c", text: "Sell half now to feel better and keep the stop for the rest", explain: "It keeps a stop, but it changes the plan on a feeling rather than a reason.", process: "partial" },
        { id: "d", text: "Buy more to lower your average price and remove the stop", explain: "This doubles down on a losing trade and removes your protection.", process: "unsound" },
      ],
      outcome: "Suppose the share did bounce to $32 the next day. Keeping the stop would still have been the sound process: on another day the same feeling is followed by a fall to $20.",
    },
  },
  {
    id: "mf-q-applied-4", concept: "mf-applied", type: "applied",
    explanation: "Screenshots are not audited results, and nobody can promise beginners they cannot lose. The sound process is to treat the promise itself as the warning sign and not pay or trade on it.",
    item: {
      kind: "scenario",
      situation: "A social media account posts screenshots of large profits and sells a $99-a-month \"signal group\", saying beginners \"can't lose\" if they copy its trades.",
      question: "What is the soundest response?",
      options: [
        { id: "a", text: "Join for one month with a small amount to see if it works", explain: "Smaller, but a month of results tells you little, and you would still be paying a seller who promises no losses.", process: "partial" },
        { id: "b", text: "Join and copy every signal with leverage to earn the fee back quickly", explain: "This adds leverage to unverified advice: the worst combination.", process: "unsound" },
        { id: "c", text: "Treat the no-loss promise as a red flag and do not pay or copy the trades", explain: "Right. Profit screenshots can be selected or faked, and a promise of no losses is a warning sign.", process: "sound" },
        { id: "d", text: "Borrow money so you can follow more of the signals at once", explain: "Borrowing to follow unverified signals risks money you do not have.", process: "unsound" },
      ],
    },
  },
];

const MORE_REMEDIATION: Record<string, ConceptRemediation> = {
  "mf-markets": {
    misconception: "Another common slip is thinking an OTC price is \"wrong\" when it differs from another dealer's. In OTC markets there is no single official price, only each dealer's quote.",
    altExplanation: "Picture the steps as a relay: you decide, your broker routes the order, it is matched, the trade executes at an agreed price, and only then do the asset and the money swap at settlement. On an exchange the matching uses one shared order book; OTC, you deal with one dealer at a time.",
    altExample: "Buying concert tickets: the box office sells at one listed price (like an exchange); three resale sites may each quote a different price for the same seat (like OTC). You pay today, but the tickets may only arrive in your account next week (settlement).",
    practice: {
      kind: "true-false",
      statement: "In an OTC market, two dealers can quote slightly different prices for the same thing at the same moment.",
      answer: true,
      explain: "True. Each OTC dealer quotes its own price for deals made with it, so quotes can differ a little.",
    },
  },
  "mf-price-drivers": {
    misconception: "It is tempting to judge news as good or bad on its own. The market judges it against what it already expected, so bad news can lift a price if it is less bad than feared.",
    altExplanation: "Think of the price as already containing a forecast. When news arrives, only the difference between the news and that forecast moves the price. Better than forecast pushes it up, worse pushes it down, and exactly as forecast moves it little. Behind every move is a change in how many people want to buy or sell at the current price.",
    altExample: "A weather forecast says 30°C tomorrow and ice-cream sellers stock up. If it turns out 28°C, sales are a little disappointing, even though 28°C is hot. The stock-up already assumed heat; only the surprise matters.",
    practice: {
      kind: "single",
      prompt: "Everyone expected a company's sales to fall 20%. They fall 5%. What does the share price most likely do?",
      options: [
        { id: "a", text: "It rises, because the fall was smaller than expected", explain: "Right. The price had allowed for a 20% fall, so 5% is better news than expected." },
        { id: "b", text: "It falls sharply, because any fall in sales is bad", explain: "The price reacts to the surprise, and this surprise is positive." },
        { id: "c", text: "It cannot change until the next set of results", explain: "Prices react straight away to new information." },
        { id: "d", text: "It is fixed by the company until the annual meeting", explain: "Companies do not fix their share prices." },
      ],
      correct: "a",
    },
  },
  "mf-liquidity": {
    misconception: "People often think a big, well-known asset is liquid because it is famous or expensive. Liquidity is about how many buyers and sellers are ready right now, which can also change by the hour.",
    altExplanation: "Imagine the order book as two queues, buyers below the price and sellers above. A liquid market has long queues packed close together, so your order is absorbed with little change. A thin market has short, spread-out queues, so an order has to reach further and the price jumps.",
    altExample: "A busy farmers' market at noon: dozens of stalls sell apples at similar prices, so you buy instantly at the usual price. At closing time only one stall is left, and it can charge what it likes, or you wait.",
    practice: {
      kind: "true-false",
      statement: "A famous, expensive asset is easy to trade at any hour of the day.",
      answer: false,
      explain: "False. Liquidity depends on how many buyers and sellers are active right now. Even big assets can trade thinly at quiet times.",
    },
  },
  "mf-participants": {
    misconception: "A frequent confusion is to think the type of contract decides whether someone is hedging. It is the reason that decides: reducing a risk you already have is hedging; taking on a new one for profit is speculation.",
    altExplanation: "Draw two columns for every trade: what risk did this person have BEFORE the trade, and what do they have AFTER? If the risk shrank, they hedged. If they had none and now have some, they speculated. Then ask who the counterparty is: a broker acting as principal is on the other side of your trade.",
    altExample: "A coffee shop fixes next year's bean price with a supplier: hedging. A friend with no coffee shop bets online that beans will get dearer: speculation. A bookmaker taking that bet is the friend's counterparty.",
    practice: {
      kind: "multi-select",
      prompt: "Which of these people are speculating? Select all that apply.",
      options: [
        { id: "a", text: "A trader with no wheat who buys wheat futures expecting a rise", explain: "Yes. He had no wheat risk and took some on for profit." },
        { id: "b", text: "A baker who fixes the price of next year's flour", explain: "No. The baker reduces a risk the business already has." },
        { id: "c", text: "A student who buys a currency CFD hoping it will rise this week", explain: "Yes. A new risk taken on for profit." },
        { id: "d", text: "An exporter who locks in an exchange rate for a payment due in March", explain: "No. That reduces a currency risk the exporter already has." },
      ],
      correct: ["a", "c"],
    },
  },
  "mf-share-pnl": {
    misconception: "Costs are easy to forget: a trade that looks like a small gain on price alone can be a loss once commissions and the spread are included.",
    altExplanation: "Work in three short lines. One: change per share = sell − buy. Two: price result = change × number of shares. Three: net result = price result − every cost (commission in, commission out). Keep the sign: a minus means a loss.",
    altExample: "Buy 50 shares at $20.00, sell at $20.10, paying $3 commission each way. Price result: 0.10 × 50 = $5. Net: 5 − 6 = −$1, a small loss despite the price rising.",
    practice: {
      kind: "numeric",
      prompt: "You buy 100 shares at $12.00 and sell them at $12.06, paying $4 commission to buy and $4 to sell. What is your net result in dollars? Enter a loss as a negative number.",
      unit: "US dollars",
      answer: -2,
      tolerance: 0.01,
      explain: "(12.06 − 12.00) × 100 = $6, minus $8 of commission = −$2.",
    },
  },
  "mf-currency-pairs": {
    misconception: "A second trap is the pip size: for most pairs a pip is the fourth decimal, but for yen pairs it is the second. Counting the wrong decimal makes a move look 100 times too big or too small.",
    altExplanation: "Before counting pips, look at the quote. Four or five decimals (like 1.08503): a pip is 0.0001, and a fifth digit is a fraction of a pip. Two or three decimals, usually a yen pair (like 150.253): a pip is 0.01. Then subtract the two prices and divide by the pip size.",
    altExample: "EUR/JPY moves from 162.40 to 162.95: that is 0.55, and at 0.01 per pip it is 55 pips. NZD/USD moves from 0.5980 to 0.6015: that is 0.0035, which is 35 pips.",
    practice: {
      kind: "numeric",
      prompt: "GBP/JPY moves from 188.20 to 187.60. How many pips is that move?",
      unit: "pips",
      answer: 60,
      tolerance: 0,
      explain: "188.20 − 187.60 = 0.60; a yen-pair pip is 0.01, so 0.60 ÷ 0.01 = 60 pips.",
    },
  },
  "mf-leverage": {
    misconception: "Many people think of the deposit as the size of the trade. Profit and loss are worked out on the full position, so a small price move becomes a large share of the deposit.",
    altExplanation: "Multiply, then compare. Loss = position size × price move. Then divide by your deposit to see how much of it went. With 20:1 leverage, every 1% move against you costs 20% of the deposit, so a 5% move wipes it out, and losses can go beyond it.",
    altExample: "A $1,000 deposit controls $25,000 (25:1). A 2% fall costs 2% × 25,000 = $500, half the deposit, from a move that would cost only $20 without leverage.",
    practice: {
      kind: "single",
      prompt: "With 40:1 leverage, roughly what price move against you would wipe out the whole deposit used for the trade?",
      options: [
        { id: "a", text: "40%", explain: "That would be the case with no leverage at 40%; with 40:1 a much smaller move is enough." },
        { id: "b", text: "2.5%", explain: "Right. 40 × 2.5% = 100% of the deposit." },
        { id: "c", text: "25%", explain: "Far too large: the deposit would be gone long before that." },
        { id: "d", text: "It cannot be wiped out, because leverage protects the deposit", explain: "Leverage magnifies losses; it does not protect the deposit." },
      ],
      correct: "b",
    },
  },
  "mf-spread-orders": {
    misconception: "Another slip is to think the spread is only paid on the way in. Every immediate buy pays the ask and every immediate sell gets the bid, so each round trip pays the whole spread once.",
    altExplanation: "Remember a shop that buys and sells used phones. It buys from you at the low price (the bid) and sells to you at the high price (the ask). Trading with it straight away means accepting its prices, and the gap is its income and your cost.",
    altExample: "A currency exchange kiosk buys euros at 1.05 and sells them at 1.10. If you change dollars to euros and straight back, you lose about 5 cents per euro without the rate moving at all.",
    practice: {
      kind: "numeric",
      prompt: "A share is quoted bid $15.00, ask $15.05. You buy 300 shares and sell them at once, with no price change. How much have you lost, in dollars? Enter it as a positive number.",
      unit: "US dollars",
      answer: 15,
      tolerance: 0.01,
      explain: "0.05 × 300 = $15 lost to the spread.",
    },
  },
  "mf-stop-loss": {
    misconception: "A second misunderstanding is that a stop waits for your exact price. A standard stop is a trigger: once the price reaches or passes it, it sells at whatever the next available price is.",
    altExplanation: "Think of a stop as a smoke alarm that calls a taxi to get you out. The alarm goes off at your level, but the taxi takes you at whatever price the next driver charges. In a calm market that is close to your level; in a fast fall or a gap it can be well below.",
    altExample: "A share closes at $40 with your stop at $38. Bad news comes out overnight and it opens at $33. The stop triggers at the open and sells near $33: a $7 loss per share instead of the $2 you planned.",
    practice: {
      kind: "single",
      prompt: "Which statement about a standard stop-loss is right?",
      options: [
        { id: "a", text: "It sells at exactly your level, whatever the market does", explain: "Only a guaranteed stop does that, usually for a fee." },
        { id: "b", text: "It turns into an order to sell at the next available price once triggered", explain: "Right. That is why gaps and fast markets can fill it below your level." },
        { id: "c", text: "It stops the price from falling below your level", explain: "Your order cannot stop the market moving." },
        { id: "d", text: "It cancels itself if the price gaps", explain: "It does not cancel; it triggers and fills at the next price." },
      ],
      correct: "b",
    },
  },
  "mf-indices": {
    misconception: "It is easy to assume every member of an index counts equally. In most big indices a member's weight depends on its size, so a few giants can move the whole index.",
    altExplanation: "An index move is a weighted average: each member's move times its weight, added up. In a cap-weighted index the weight is the company's share of the total value. In an equal-weighted index every member has the same weight, so the move is the plain average.",
    altExample: "A three-member cap-weighted index: A is 60% of the value, B 30%, C 10%. A rises 1%, B is flat, C falls 5%. Change: 0.6 × 1 + 0.3 × 0 + 0.1 × (−5) = 0.6 − 0.5 = +0.1%.",
    practice: {
      kind: "numeric",
      prompt: "A cap-weighted index has two members: A is 80% of its value and B 20%. A falls 1% and B rises 6%. What is the index's percentage change? Enter a fall as a negative number.",
      unit: "%",
      answer: 0.4,
      tolerance: 0.01,
      explain: "0.8 × (−1) + 0.2 × 6 = −0.8 + 1.2 = +0.4%.",
    },
  },
  "mf-commodities": {
    misconception: "People often think trading commodity futures is like buying the commodity today. A future is an agreement about a later date, with its own price, and holding it to expiry can mean delivery.",
    altExplanation: "Think of a future as a booking: you agree today on the price for something handed over later. Its price reflects today's price plus storage, interest and expectations about the future. Most traders never want the goods, so they close or roll the booking before the date arrives.",
    altExample: "In January a bakery agrees to buy 20 tonnes of wheat in July at a price fixed today. If wheat gets dearer by July, the bakery still pays the agreed price; if it gets cheaper, it still pays the agreed price. On the delivery date a lorry of wheat turns up at the agreed place. A trader who only wanted the price move, and has no silo, has to close or roll the agreement before then.",
    practice: {
      kind: "true-false",
      statement: "Holding a physically settled futures contract to expiry can mean having to take delivery of the commodity.",
      answer: true,
      explain: "True. That is why traders who do not want the goods close or roll their positions before expiry.",
    },
  },
  "mf-crypto": {
    misconception: "A second mistake is treating any one custody choice as risk-free. Leaving coins on an exchange exposes you to the exchange; holding your own keys exposes you to losing them.",
    altExplanation: "Ask: who can move these coins? On an exchange, the exchange holds the keys, so its failure, a hack or a freeze can block you. In self-custody only you can move them, so a lost recovery phrase means they are gone. A stablecoin adds another question: what backs its value, and can those reserves fail?",
    altExample: "Cash kept in a shop's safe for you depends on the shop staying honest and solvent. Cash in your own safe depends on you not losing the combination. Neither is risk-free; the risks are just different.",
    practice: {
      kind: "single",
      prompt: "Your coins are on an exchange that suddenly stops withdrawals. Why can't you simply move them out?",
      options: [
        { id: "a", text: "The exchange holds the private keys, so it controls the coins", explain: "Right. Whoever holds the keys can move the coins; on an exchange, that is the exchange." },
        { id: "b", text: "Coins can only be moved once a year", explain: "There is no such limit; the exchange is blocking you." },
        { id: "c", text: "Moving coins is illegal while prices are falling", explain: "No such law exists." },
        { id: "d", text: "Your wallet's recovery phrase has expired, as they do after a while", explain: "On an exchange you do not have the keys at all; recovery phrases do not expire." },
      ],
      correct: "a",
    },
  },
  "mf-trading-investing": {
    misconception: "It is easy to see costs as small because each one is small. Repeated many times, they add up to a large share of the account and must be beaten before any profit.",
    altExplanation: "Treat costs as a head wind on every trip. One trip costing 0.1% of the account hardly shows; two hundred trips a year at 0.1% each is 200 × 0.1% = 20% of the account, before a single winning idea. And regulators' reviews have found that most retail accounts in short-term leveraged products lose money, so frequent trading starts behind, not level.",
    altExample: "A delivery driver pays $2 in tolls on every trip. One trip is nothing; 500 trips a year is $1,000 that must come out of the earnings before any profit is made.",
    practice: {
      kind: "numeric",
      prompt: "Your costs are $6 per round trip. You make 4 round trips a week for 50 weeks. What do the costs add up to over the year, in dollars?",
      unit: "US dollars",
      answer: 1200,
      tolerance: 0.01,
      explain: "4 × 50 = 200 round trips; 200 × $6 = $1,200.",
    },
  },
  "mf-applied": {
    misconception: "A common trap is judging a decision by its result. A reckless choice that happens to win is still reckless, and a careful plan that happens to lose was still sound.",
    altExplanation: "Score your decision before you know the outcome. Ask: is the money at risk money I can afford to lose? Is the claim backed by evidence, or by a promise and pressure? Do I have a planned exit, and am I keeping to it? If the answers are yes, no and yes, the process is sound, whatever happens next.",
    altExample: "Two drivers run the same red light. One gets through safely, the other crashes. The safe arrival does not make running the light a good decision; it was equally risky for both.",
    practice: {
      kind: "scenario",
      situation: "A coworker says he doubled his money in a week on a little-known coin and urges you to buy before \"it goes to the moon\". You have savings for a house deposit.",
      question: "What is the soundest decision?",
      options: [
        { id: "a", text: "Put in a small part of the house savings, just in case it works", explain: "Smaller, but it still puts money you need at risk on a tip.", process: "partial" },
        { id: "b", text: "Keep the house savings out of it and ignore the pressure", explain: "Right. Money you need should not be at risk, and urgency plus hype are warning signs.", process: "sound" },
        { id: "c", text: "Put in most of the savings because he has already doubled his money", explain: "One person's result is not evidence, and it risks money you need.", process: "unsound" },
      ],
    },
  },
};

export const MARKET_FOUNDATIONS_ASSESSMENT: TrackAssessment = {
  ...BASE,
  concepts: BASE.concepts.map((c) => ({ ...c, moreRemediation: MORE_REMEDIATION[c.id] ? [MORE_REMEDIATION[c.id]] : [] })),
  questions: [...BASE.questions, ...MORE_QUESTIONS],
};
