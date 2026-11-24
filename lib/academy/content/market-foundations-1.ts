import type { Lesson } from "../types";

/*
  Market Foundations, lessons 1–5.
  Numbers in examples are hypothetical and labelled as such in the text.
*/

const T = "market-foundations";

export const L1_WHAT_IS_A_MARKET: Lesson = {
  id: "what-is-a-market",
  trackId: T,
  order: 1,
  title: "What is a financial market?",
  summary: "A place, physical or digital, where buyers and sellers exchange assets at agreed prices.",
  minutes: 12,
  objectives: [
    "Describe what a financial market is in one sentence.",
    "Name the kinds of assets that trade in financial markets.",
    "Explain the difference between an exchange and over-the-counter trading.",
    "List the steps a trade goes through, from decision to settlement.",
  ],
  sections: [
    {
      id: "meeting-place",
      heading: "A meeting place for buyers and sellers",
      blocks: [
        { kind: "p", text: "A [[financial-market]] is any place where people buy and sell financial things at prices they agree on. Today that \"place\" is almost always a network of computers rather than a room full of people." },
        { kind: "p", text: "What is bought and sold is called an [[asset]]: something that has value and can be owned. Shares in companies, currencies, gold and government [[bond|bonds]] are all assets." },
        { kind: "p", text: "A market does one simple job. It brings together people who want to buy and people who want to sell, so they can find each other and agree a [[price]]." },
        { kind: "visual", visual: "market-meeting", caption: "Buyers and sellers send orders to the market, which matches them and records the agreed price." },
      ],
    },
    {
      id: "why-markets-exist",
      heading: "Why financial markets exist",
      blocks: [
        { kind: "p", text: "Markets are not only for traders. They do useful work for the whole economy:" },
        { kind: "list", items: [
          "Companies raise money by selling shares or borrowing, and use it to grow.",
          "Businesses that trade abroad exchange one currency for another.",
          "Savers and pension funds put money to work for the long term.",
          "Producers and users of raw materials, like farmers and airlines, manage the risk of prices changing.",
        ] },
        { kind: "p", text: "Because so many people take part, a busy market also shows everyone the current price of an asset. That public price is useful information in itself." },
      ],
    },
    {
      id: "exchange-vs-otc",
      heading: "Exchanges and over-the-counter markets",
      blocks: [
        { kind: "p", text: "Some markets are run by an [[exchange]], an organisation with published rules that matches buy and sell orders in one central place. The New York Stock Exchange and the London Stock Exchange are examples." },
        { kind: "p", text: "Other markets are [[otc|over-the-counter (OTC)]]. Trades happen directly between two parties, usually banks and dealers, without one central [[order-book|order book]]. Most currency trading works this way." },
        { kind: "callout", tone: "info", title: "Why it matters to you", text: "On an exchange, everyone sees the same official prices. In OTC markets, prices from different providers can differ slightly. Later lessons show how to check what you are actually being quoted." },
      ],
    },
    {
      id: "life-of-a-trade",
      heading: "The life of a trade",
      blocks: [
        { kind: "p", text: "Every trade follows the same basic steps, whatever the asset:" },
        { kind: "list", ordered: true, items: [
          "You decide what to buy or sell and how much.",
          "You send an [[order]] through your broker.",
          "The market matches your order with someone on the other side.",
          "The trade is executed at the agreed price.",
          "[[settlement|Settlement]]: the asset and the money actually change hands, sometimes a day or more later.",
        ] },
        { kind: "p", text: "For every buyer there is a seller. A trade only happens when both agree on the same price at the same moment." },
      ],
    },
  ],
  exercise: {
    kind: "order",
    id: "ex-life-of-trade",
    title: "Put a trade in order",
    prompt: "These steps of a trade are mixed up. Move them into the order they happen.",
    items: [
      { id: "decide", text: "Decide what to buy and how much" },
      { id: "order", text: "Send an order through your broker" },
      { id: "match", text: "The market matches you with a seller" },
      { id: "execute", text: "The trade executes at the agreed price" },
      { id: "settle", text: "Settlement: the asset and money change hands" },
    ],
    explanation: "A trade starts with your decision, becomes an order, gets matched with someone on the other side, executes at one agreed price, and only then settles.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "Which is the best description of a financial market?",
      correct: "b",
      options: [
        { id: "a", text: "A building where shares are stored", explain: "Shares are records of ownership, not objects in a building, and most markets are electronic." },
        { id: "b", text: "Anywhere buyers and sellers meet to agree prices for assets", explain: "Correct. The defining feature is bringing buyers and sellers together to agree a price." },
        { id: "c", text: "A website or app that predicts which assets will rise in price next", explain: "No market can tell you what will rise. Markets show current prices, not future ones." },
        { id: "d", text: "A bank account that earns interest", explain: "A bank account is a product, not a marketplace where assets are bought and sold." },
      ],
    },
    {
      id: "q2",
      prompt: "Which of these is NOT a financial asset?",
      correct: "d",
      options: [
        { id: "a", text: "A share in a company", explain: "A share is a financial asset: a unit of ownership in a company." },
        { id: "b", text: "Japanese yen held in a currency account", explain: "Currencies are assets that trade in the forex market." },
        { id: "c", text: "A government bond", explain: "A bond is a loan you can buy and sell, so it is a financial asset." },
        { id: "d", text: "A haircut appointment", explain: "Correct. A service you book is not an asset you can own and trade in a financial market." },
      ],
    },
    {
      id: "q3",
      prompt: "What is the main difference between an exchange and an over-the-counter (OTC) market?",
      correct: "a",
      options: [
        { id: "a", text: "An exchange matches orders centrally; OTC trades are agreed directly between two parties", explain: "Correct. That central matching is what makes an exchange an exchange." },
        { id: "b", text: "Exchanges are only for professional firms, while OTC markets are only for individual traders like you", explain: "Individuals use exchanges every day through brokers, and OTC markets are mostly used by banks and dealers." },
        { id: "c", text: "OTC markets are illegal", explain: "OTC trading is legal and very large. Most currency trading is OTC." },
        { id: "d", text: "There is no difference", explain: "There is: who matches the trade and whether there is one central order book." },
      ],
    },
    {
      id: "q4",
      prompt: "You buy 10 shares. Who is on the other side of your trade?",
      correct: "c",
      options: [
        { id: "a", text: "Nobody: brand-new shares are created by the exchange for each buyer", explain: "Normally a trade needs a seller. New shares are only created in special events like a company issuing stock." },
        { id: "b", text: "The government", explain: "Governments are not usually the seller in everyday share trades." },
        { id: "c", text: "Whoever is willing to sell at that price", explain: "Correct. For every buyer there is a seller, such as another investor or a market maker." },
        { id: "d", text: "Your bank, always", explain: "Your bank or broker may route the order, but the seller can be anyone in the market." },
      ],
    },
    {
      id: "q5",
      prompt: "What happens at settlement?",
      correct: "b",
      options: [
        { id: "a", text: "You decide what to buy", explain: "Deciding comes first, long before settlement." },
        { id: "b", text: "The asset and the money actually change hands", explain: "Correct. Settlement is the final transfer, which can happen after the trade is agreed." },
        { id: "c", text: "The price is locked in and guaranteed to rise from then on", explain: "Nothing guarantees a price rise, at settlement or at any other time." },
        { id: "d", text: "Your order is cancelled", explain: "Settlement completes a trade; it does not cancel it." },
      ],
    },
  ],
  practical: {
    title: "Spot the markets around you",
    instructions: "Over the next day, notice where financial markets touch your life. You do not need to trade or sign up for anything.",
    steps: [
      "Find one company whose products you use and check whether its shares trade on a stock exchange (search its name plus \"stock\").",
      "Look at a currency exchange rate, for example on a travel money site, and note the two currencies involved.",
      "Write down one way a market helps that company or that traveller.",
    ],
    reflectionPrompt: "Which markets did you find, and what job was each one doing?",
  },
  glossary: ["financial-market", "asset", "bond", "price", "exchange", "otc", "order-book", "order", "settlement"],
  next: "why-prices-move",
};

export const L2_WHY_PRICES_MOVE: Lesson = {
  id: "why-prices-move",
  trackId: T,
  order: 2,
  title: "Why do prices move?",
  summary: "Supply, demand, new information and changing expectations.",
  minutes: 14,
  objectives: [
    "Explain how supply and demand set a price.",
    "Describe why new information moves prices, and why expected news may not.",
    "Explain what liquidity and volatility mean.",
    "Recognise that no one can reliably predict short-term price moves.",
  ],
  sections: [
    {
      id: "supply-demand",
      heading: "Supply and demand",
      blocks: [
        { kind: "p", text: "Prices move for one underlying reason: the balance between [[supply]] (how much people want to sell) and [[demand]] (how much people want to buy) changes." },
        { kind: "p", text: "If more people want to buy than sell at today's price, buyers have to offer more to get what they want, and the price rises. If more people want to sell, sellers have to accept less, and the price falls." },
        { kind: "visual", visual: "supply-demand", caption: "When demand increases (the curve shifts right), the meeting point moves to a higher price. Illustrative only." },
      ],
    },
    {
      id: "information",
      heading: "New information changes minds",
      blocks: [
        { kind: "p", text: "Supply and demand change when people learn something new: a company's results, an interest rate decision, a storm hitting oil production, or a change in government policy." },
        { kind: "p", text: "What matters is how the news compares with what people already expected. If everyone expected good results, much of that hope may already be [[priced-in|priced in]], and the price may barely move, or even fall, when the results arrive." },
        { kind: "callout", tone: "warn", title: "Surprise moves prices", text: "Markets react mainly to the difference between what was expected and what actually happened. Good news is not the same as a rising price." },
      ],
    },
    {
      id: "liquidity-volatility",
      heading: "Liquidity and volatility",
      blocks: [
        { kind: "p", text: "[[liquidity|Liquidity]] is how easily you can buy or sell without moving the price. In a liquid market, such as a major currency pair, there are many buyers and sellers ready at prices close together." },
        { kind: "p", text: "[[volatility|Volatility]] is how much and how fast a price moves. Thinly traded markets and uncertain times tend to be more volatile, because a few large orders or surprising news can push the price a long way." },
      ],
    },
    {
      id: "no-certainty",
      heading: "Nobody knows the next move",
      blocks: [
        { kind: "p", text: "Millions of participants with different information, goals and time frames all act at once. That makes short-term price moves very hard to predict, even for professionals." },
        { kind: "p", text: "Good traders do not claim to know what will happen. They think in probabilities, decide in advance what they will do if they are wrong, and keep each loss small." },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "ex-price-pressure",
    title: "Which way is the pressure?",
    prompt: "For each event, decide whether it puts upward or downward pressure on the price mentioned, if nothing else changes.",
    categories: [
      { id: "up", label: "Upward pressure" },
      { id: "down", label: "Downward pressure" },
    ],
    items: [
      { id: "i1", text: "Far more people want to buy a share than sell it at the current price", category: "up", explain: "More demand than supply at the current price pushes the price up until enough sellers appear." },
      { id: "i2", text: "A large shareholder starts selling a big block of shares", category: "down", explain: "Extra supply means sellers must accept lower prices to find buyers." },
      { id: "i3", text: "A strike shuts several large copper mines (price of copper)", category: "up", explain: "Less copper being produced means less supply, which pushes the price up." },
      { id: "i4", text: "A huge new oil field starts producing (price of oil)", category: "down", explain: "More oil available means more supply, which pushes the price down." },
      { id: "i5", text: "A company's profits come in far below what everyone expected (its share price)", category: "down", explain: "A negative surprise lowers what people are willing to pay for the shares." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "At the current price, many more people want to buy than to sell. What is most likely to happen?",
      correct: "a",
      options: [
        { id: "a", text: "The price rises until buyers and sellers balance", explain: "Correct. Buyers compete by offering more, which lifts the price." },
        { id: "b", text: "The price falls", explain: "Falling prices come from more selling than buying, not the other way round." },
        { id: "c", text: "The price cannot change until the next day", explain: "Prices adjust continuously while a market is open." },
        { id: "d", text: "The exchange sets a new price by vote", explain: "Exchanges match orders; they do not vote on prices." },
      ],
    },
    {
      id: "q2",
      prompt: "A company reports good results, but the share price falls. Which is a reasonable explanation?",
      correct: "c",
      options: [
        { id: "a", text: "The market made a mistake, and the price is guaranteed to bounce back up soon", explain: "Markets do not promise to correct anything, and you cannot count on it." },
        { id: "b", text: "Good results always make prices fall", explain: "There is no rule like that. Reactions depend on expectations." },
        { id: "c", text: "People expected even better results, so the news was a disappointment", explain: "Correct. What matters is the result compared with expectations." },
        { id: "d", text: "Share prices do not react to company results", explain: "They often do, sometimes strongly." },
      ],
    },
    {
      id: "q3",
      prompt: "What does it mean for a market to be liquid?",
      correct: "d",
      options: [
        { id: "a", text: "Prices only go up", explain: "Liquidity says nothing about direction." },
        { id: "b", text: "It mainly trades physical liquids such as crude oil and heating oil", explain: "The word is about ease of trading, not about what is traded." },
        { id: "c", text: "It is closed at weekends", explain: "Opening hours are a separate question." },
        { id: "d", text: "You can buy or sell easily without moving the price much", explain: "Correct. Lots of buyers and sellers at close prices make a market liquid." },
      ],
    },
    {
      id: "q4",
      prompt: "What does high volatility mean?",
      correct: "b",
      options: [
        { id: "a", text: "Prices are more likely to rise than fall", explain: "Volatility measures the size of moves in both directions, not the direction." },
        { id: "b", text: "Bigger, faster price swings, in either direction", explain: "Correct. More movement means more potential gain and more potential loss." },
        { id: "c", text: "The asset can only be traded in crypto markets", explain: "Every market has volatility; some just have more than others." },
        { id: "d", text: "The market is broken or about to close for the day", explain: "Volatile markets are open and active. Big moves are not a fault, and calm periods are normal too." },
      ],
    },
    {
      id: "q5",
      prompt: "What is the healthiest way to think about short-term price moves?",
      correct: "a",
      options: [
        { id: "a", text: "In probabilities, with a plan for what you will do if you are wrong", explain: "Correct. Nobody knows the next move for sure, so planning for being wrong is essential." },
        { id: "b", text: "Find an expert who knows what will happen next", explain: "No one reliably predicts short-term moves. Be wary of anyone who claims to." },
        { id: "c", text: "Prices follow the news, so reading the headlines first guarantees a profit", explain: "News is often already priced in, and reactions are hard to predict." },
        { id: "d", text: "Prices move randomly, so there is no point learning", explain: "Prices respond to supply, demand and information. Learning helps you manage risk and avoid common mistakes." },
      ],
    },
  ],
  practical: {
    title: "Watch a price react",
    instructions: "Pick one well-known company or currency and follow it for a few days. You are observing, not trading.",
    steps: [
      "Write down the name of the asset and one piece of news about it.",
      "Before checking its price, write whether you think the news was a surprise or expected.",
      "Look at how the price changed that day on any free finance website. Did it match your guess?",
    ],
    reflectionPrompt: "What surprised you about how the price did (or did not) react to the news?",
  },
  glossary: ["supply", "demand", "priced-in", "liquidity", "volatility"],
  next: "market-participants",
};

export const L3_PARTICIPANTS: Lesson = {
  id: "market-participants",
  trackId: T,
  order: 3,
  title: "Buyers, sellers and market participants",
  summary: "Who is on the other side of a trade: banks, funds, companies and individuals.",
  minutes: 13,
  objectives: [
    "Name the main groups that take part in financial markets.",
    "Explain why different participants buy and sell for different reasons.",
    "Describe what a market maker and a broker do.",
    "Understand what it means to have a counterparty.",
  ],
  sections: [
    {
      id: "who-trades",
      heading: "Who is in the market?",
      blocks: [
        { kind: "p", text: "Every trade has a [[counterparty]]: someone on the other side. Knowing who those people are helps you understand why prices behave the way they do." },
        { kind: "visual", visual: "participants-map", caption: "The main groups of market participants. Each one trades for its own reasons." },
        { kind: "list", items: [
          "[[central-bank|Central banks]] manage interest rates and money, and their decisions affect all markets.",
          "Commercial and investment banks trade for clients and for themselves.",
          "[[institutional-investor|Institutional investors]] such as pension funds and insurers invest very large sums for the long term.",
          "Companies use markets to raise money and to manage risks such as currency changes.",
          "[[retail-trader|Retail traders]]: individuals like you, trading their own money.",
        ] },
      ],
    },
    {
      id: "different-goals",
      heading: "Different goals, same market",
      blocks: [
        { kind: "p", text: "Not everyone is trying to make a quick profit. A pension fund might buy shares to hold for twenty years. A company might buy a currency simply because it has to pay a supplier abroad." },
        { kind: "p", text: "Some participants are [[hedging]]: reducing a risk they already have. An airline that agrees in advance to buy fuel at a fixed price is protecting itself from oil prices rising." },
        { kind: "p", text: "Others are engaged in [[speculation]]: taking on risk in the hope of profiting from a price change. Most individual traders are speculators." },
      ],
    },
    {
      id: "intermediaries",
      heading: "Brokers and market makers",
      blocks: [
        { kind: "p", text: "You cannot usually trade directly on an exchange. You open an account with a [[broker]], which passes your orders to the market or, with some products, fills them itself." },
        { kind: "p", text: "A [[market-maker|market maker]] is a firm that is always ready to both buy and sell. It quotes two prices and aims to earn the small difference between them. Market makers help keep markets liquid." },
        { kind: "callout", tone: "warn", title: "Know who you are trading with", text: "With some products, such as many [[cfd|CFDs]], your broker acts as [[principal]] and is your counterparty. That means your loss can be their gain. Always read how a broker makes money." },
      ],
    },
    {
      id: "retail-reality",
      heading: "The retail trader's position",
      blocks: [
        { kind: "p", text: "Retail traders compete with professionals who have more data, faster systems and full-time research teams. That does not make learning pointless, but it is a reason to start slowly and practise with virtual money first." },
      ],
    },
  ],
  exercise: {
    kind: "match",
    id: "ex-participants",
    title: "Match the participant to the goal",
    prompt: "Choose the most typical reason each participant takes part in markets.",
    pairs: [
      { id: "cb", left: "Central bank", right: "Manage interest rates and the money supply" },
      { id: "pf", left: "Pension fund", right: "Grow savings over decades for future retirees" },
      { id: "mm", left: "Market maker", right: "Quote buy and sell prices and earn the gap between them" },
      { id: "air", left: "Airline buying fuel in advance", right: "Hedge against rising fuel prices" },
      { id: "rt", left: "Retail trader", right: "Speculate with their own money" },
    ],
    explanation: "Each participant has its own reason for being in the market. Seeing those reasons helps explain why prices sometimes move in ways that have nothing to do with short-term trading.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "What is a counterparty?",
      correct: "c",
      options: [
        { id: "a", text: "A party held when a trade makes money", explain: "Nice idea, but it is not a trading term." },
        { id: "b", text: "Your broker's customer support team", explain: "Support staff do not take the other side of your trade." },
        { id: "c", text: "Whoever is on the other side of your trade", explain: "Correct. When you buy, your counterparty is selling." },
        { id: "d", text: "A government regulator", explain: "Regulators oversee markets; they are not normally your counterparty." },
      ],
    },
    {
      id: "q2",
      prompt: "An airline agrees today to buy fuel at a fixed price in six months. What is it doing?",
      correct: "a",
      options: [
        { id: "a", text: "Hedging against fuel prices rising", explain: "Correct. It reduces a risk the business already has." },
        { id: "b", text: "Speculating that fuel prices will fall", explain: "If it expected prices to fall, locking in today's price would not help it." },
        { id: "c", text: "Market making", explain: "Market makers quote both buy and sell prices continuously; the airline is just buying." },
        { id: "d", text: "Paying a dividend", explain: "Dividends are payments to shareholders, unrelated to buying fuel." },
      ],
    },
    {
      id: "q3",
      prompt: "How does a market maker aim to earn money?",
      correct: "d",
      options: [
        { id: "a", text: "By charging the exchange a fee for every trade it handles", explain: "Exchanges do not pay market makers a fee per trade for their main income. Some exchanges pay small rebates to firms that provide liquidity, but the core business is the gap between the buy and sell price." },
        { id: "b", text: "By correctly predicting the next big move and betting heavily on it", explain: "Their main business is quoting both sides, not betting on direction." },
        { id: "c", text: "From government grants", explain: "That is not how market making works." },
        { id: "d", text: "From the gap between its buy price and its sell price", explain: "Correct. Doing this many times a day adds up." },
      ],
    },
    {
      id: "q4",
      prompt: "Which participant sets a country's main interest rate?",
      correct: "b",
      options: [
        { id: "a", text: "A pension fund", explain: "Pension funds invest; they do not set interest rates." },
        { id: "b", text: "The central bank", explain: "Correct. For example, the Federal Reserve in the US." },
        { id: "c", text: "The largest retail broker", explain: "Brokers do not set national interest rates." },
        { id: "d", text: "The stock exchange", explain: "Exchanges run trading; they do not set interest rates." },
      ],
    },
    {
      id: "q5",
      prompt: "Why is practising with virtual money a sensible first step for a retail trader?",
      correct: "c",
      options: [
        { id: "a", text: "Virtual results predict real results exactly", explain: "They do not: real money brings real emotions, costs and slippage." },
        { id: "b", text: "Retail traders are not allowed to trade real money", explain: "They are allowed. Practising first is a choice, not a rule." },
        { id: "c", text: "You can learn the mechanics without risking real money", explain: "Correct. You compete with professionals, and mistakes are much cheaper when the money is not real." },
        { id: "d", text: "Markets are closed to individuals until they finish a course", explain: "There is no such rule." },
      ],
    },
  ],
  practical: {
    title: "Find out how a broker earns money",
    instructions: "Pick any well-known online broker. You are researching, not opening an account.",
    steps: [
      "Find the page on its website that lists fees or costs.",
      "Note whether it charges commissions, spreads, overnight fees or account fees.",
      "Check whether it says it is the counterparty to your trades for any product (look for terms like \"market maker\" or \"we act as [[principal]]\").",
    ],
    reflectionPrompt: "How does this broker make money from its customers, and does anything about that surprise you?",
  },
  glossary: ["counterparty", "central-bank", "institutional-investor", "retail-trader", "hedging", "speculation", "broker", "market-maker", "cfd", "principal"],
  next: "stocks",
};

export const L4_STOCKS: Lesson = {
  id: "stocks",
  trackId: T,
  order: 4,
  title: "Stocks",
  summary: "Owning a small piece of a company, and what makes that piece more or less valuable.",
  minutes: 14,
  objectives: [
    "Explain what owning a share means.",
    "Describe how companies first sell shares and how they trade afterwards.",
    "Calculate a simple gain or loss on a share position.",
    "Explain market capitalisation and what moves share prices.",
  ],
  sections: [
    {
      id: "what-is-a-share",
      heading: "What a share is",
      blocks: [
        { kind: "p", text: "A [[stock|stock, or share]], is a small unit of ownership in a company. If a company is split into one million shares and you own one thousand, you own 0.1% of it." },
        { kind: "p", text: "As a [[shareholder]] you usually get a vote on some company decisions and a share of any [[dividend|dividends]] the company chooses to pay. Dividends are never guaranteed." },
        { kind: "visual", visual: "share-ownership", caption: "A company divided into equal shares. Owning more shares means owning a bigger slice." },
      ],
    },
    {
      id: "how-shares-trade",
      heading: "How shares come to market",
      blocks: [
        { kind: "p", text: "A company first sells shares to the public in an [[ipo|IPO (initial public offering)]] and lists them on a stock exchange. After that, most trading is between investors. The company does not receive money when you buy shares from another investor." },
        { kind: "p", text: "Major US exchanges have regular trading hours of 9:30 to 16:00 New York time on weekdays, with some trading before and after those hours." },
      ],
    },
    {
      id: "value",
      heading: "What makes a share more or less valuable",
      blocks: [
        { kind: "p", text: "In the long run, share prices tend to follow what investors expect the company to earn in the future. That is why [[earnings]] reports, the company's profit figures released every quarter, often move the price." },
        { kind: "p", text: "[[market-cap|Market capitalisation]] is the share price multiplied by the number of shares. It tells you what the market currently values the whole company at." },
        { kind: "p", text: "In the short run, share prices are also pushed around by interest rates, the wider economy, news about competitors and general mood." },
      ],
    },
    {
      id: "gains-losses",
      heading: "Working out a gain or loss",
      blocks: [
        { kind: "p", text: "The basic sum is simple: (selling price − buying price) × number of shares. Here is a hypothetical example with made-up numbers." },
        { kind: "p", text: "You buy 20 shares at $50. The price rises to $55. Your gain before costs is ($55 − $50) × 20 = $100. If instead the price fell to $45, your loss would be $100." },
        { kind: "callout", tone: "warn", title: "Costs and risk", text: "Real results also include broker fees, spreads and, in many countries, taxes. A company can also fail, and its shares can become worthless." },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "ex-share-gain",
    title: "Work out the result",
    prompt: "Hypothetical example: you buy 40 shares of a company at $25 each and later sell them at $28 each. Ignoring costs, what is your gain in US dollars?",
    unit: "US dollars",
    answer: 120,
    tolerance: 0.01,
    hint: "Find the change per share first, then multiply by the number of shares.",
    solution: "Change per share: $28 − $25 = $3. Total: $3 × 40 shares = $120.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "What do you own when you own a share?",
      correct: "b",
      options: [
        { id: "a", text: "A loan to the company that must be repaid", explain: "That describes a bond, not a share." },
        { id: "b", text: "A small part of the company", explain: "Correct. A share is a unit of ownership." },
        { id: "c", text: "A guaranteed yearly payment", explain: "Dividends are optional and can be cut. Nothing is guaranteed." },
        { id: "d", text: "A right to work at the company", explain: "Shareholders own part of the company; it does not give a job." },
      ],
    },
    {
      id: "q2",
      prompt: "You buy shares from another investor on an exchange. Does the company receive your money?",
      correct: "a",
      options: [
        { id: "a", text: "No, it goes to the investor who sold them", explain: "Correct. The company raised money when it first issued the shares." },
        { id: "b", text: "Yes, the company receives a share of every trade in its stock", explain: "Everyday trading is between investors; the company is not part of it." },
        { id: "c", text: "Only if the price goes up", explain: "Price direction does not change who receives the money." },
        { id: "d", text: "Only on Fridays", explain: "There is no such rule." },
      ],
    },
    {
      id: "q3",
      prompt: "A company has 2 million shares priced at $10. What is its market capitalisation?",
      correct: "c",
      options: [
        { id: "a", text: "$2 million", explain: "That is just the number of shares, without multiplying by the price." },
        { id: "b", text: "$10", explain: "That is the price of one share." },
        { id: "c", text: "$20 million", explain: "Correct. 2,000,000 × $10 = $20,000,000." },
        { id: "d", text: "$200,000", explain: "Check the multiplication: 2,000,000 × 10 is 20,000,000." },
      ],
    },
    {
      id: "q4",
      prompt: "Which of these is true about dividends?",
      correct: "d",
      options: [
        { id: "a", text: "Every company must pay them", explain: "Many companies, especially growing ones, pay none." },
        { id: "b", text: "Once announced, they are fixed for as long as you own the shares", explain: "Companies can change or stop dividends." },
        { id: "c", text: "They are paid by the stock exchange", explain: "Dividends come from the company, not the exchange." },
        { id: "d", text: "They are optional and can be cut", explain: "Correct. They are paid out of profits at the company's choice." },
      ],
    },
    {
      id: "q5",
      prompt: "Hypothetical: you buy 10 shares at $80 and sell at $72. Ignoring costs, what is the result?",
      correct: "b",
      options: [
        { id: "a", text: "A gain of $80", explain: "The price fell, so this is a loss, not a gain." },
        { id: "b", text: "A loss of $80", explain: "Correct. ($72 − $80) × 10 = −$80." },
        { id: "c", text: "A loss of $8", explain: "That is the loss per share. Multiply by 10 shares." },
        { id: "d", text: "No gain or loss", explain: "The price changed, so there is a result." },
      ],
    },
  ],
  practical: {
    title: "Read a company snapshot",
    instructions: "Look up one company you know on any free finance website. Do not buy anything.",
    steps: [
      "Write down its market capitalisation and the exchange it trades on.",
      "Find when it last reported earnings.",
      "Check whether it pays a dividend.",
    ],
    reflectionPrompt: "What did you learn about the company that you did not know from using its products?",
  },
  glossary: ["stock", "shareholder", "dividend", "ipo", "earnings", "market-cap"],
  next: "forex",
};

export const L5_FOREX: Lesson = {
  id: "forex",
  trackId: T,
  order: 5,
  title: "Forex",
  summary: "Exchanging one currency for another, the largest market in the world.",
  minutes: 15,
  objectives: [
    "Read a currency pair and say what its price means.",
    "Identify the base and quote currency.",
    "Explain what a pip is.",
    "Describe why leverage makes forex risky for beginners.",
  ],
  sections: [
    {
      id: "what-is-forex",
      heading: "What forex is",
      blocks: [
        { kind: "p", text: "[[forex|Forex]] (foreign exchange, or FX) is the market for swapping one currency for another. Businesses, governments, banks, travellers and traders all take part." },
        { kind: "p", text: "Measured by the value traded each day, it is the largest financial market in the world. Surveys by the Bank for International Settlements put it at trillions of US dollars per day. Most of it is traded over-the-counter between banks, not on one exchange." },
        { kind: "p", text: "Spot forex trades around the clock from Sunday evening to Friday evening (New York time), passing from one [[session|trading session]] to the next: Sydney, Tokyo, London, New York." },
      ],
    },
    {
      id: "reading-a-pair",
      heading: "Reading a currency pair",
      blocks: [
        { kind: "p", text: "Currencies are always quoted in a [[currency-pair]], such as EUR/USD. The first currency is the [[base-currency|base currency]]; the second is the [[quote-currency|quote currency]]." },
        { kind: "p", text: "The price, or [[exchange-rate|exchange rate]], says how much of the quote currency one unit of the base currency buys. If EUR/USD were 1.1000, one euro would buy 1.10 US dollars." },
        { kind: "visual", visual: "currency-pair", caption: "Anatomy of a currency quote. The rate shown is an example, not a live price." },
        { kind: "p", text: "If EUR/USD rises, the euro has strengthened against the dollar (or the dollar has weakened). If it falls, the opposite has happened." },
      ],
    },
    {
      id: "pips",
      heading: "Pips: the small steps",
      blocks: [
        { kind: "p", text: "Currency prices usually move in tiny amounts. A [[pip]] is the standard small unit of movement. For most pairs it is the fourth decimal place: a move from 1.1000 to 1.1001 is one pip." },
        { kind: "p", text: "For pairs that include the Japanese yen, such as USD/JPY, a pip is the second decimal place: 150.00 to 150.01 is one pip." },
      ],
    },
    {
      id: "leverage",
      heading: "Leverage: why forex is risky",
      blocks: [
        { kind: "p", text: "Because daily moves are small, forex brokers usually offer [[leverage]]: you put down a small deposit and control a much bigger position." },
        { kind: "p", text: "Leverage multiplies losses exactly as much as gains. With 30 times leverage, a 1% move against you loses 30% of the deposit you used for that trade." },
        { kind: "callout", tone: "warn", title: "Regulators' warning", text: "Leveraged forex is often sold as [[cfd|CFDs]]. EU and UK rules require CFD providers to show what share of their retail accounts lose money, and those figures are typically well over half." },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "ex-convert",
    title: "Convert a currency",
    prompt: "Hypothetical rate: EUR/USD is 1.2000. How many US dollars would 500 euros buy, ignoring fees?",
    unit: "US dollars",
    answer: 600,
    tolerance: 0.01,
    hint: "The rate tells you how many dollars one euro buys. Multiply by the number of euros.",
    solution: "1 euro buys 1.20 dollars, so 500 euros buy 500 × 1.20 = 600 dollars.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "In the pair GBP/USD, which is the base currency?",
      correct: "a",
      options: [
        { id: "a", text: "GBP (British pound)", explain: "Correct. The base is always the first currency." },
        { id: "b", text: "USD (US dollar)", explain: "USD is second, so it is the quote currency." },
        { id: "c", text: "Both equally", explain: "Each pair has one base and one quote." },
        { id: "d", text: "Neither; the base is gold", explain: "Gold is not part of GBP/USD." },
      ],
    },
    {
      id: "q2",
      prompt: "Hypothetically, USD/JPY is 150.00. What does that mean?",
      correct: "c",
      options: [
        { id: "a", text: "One yen buys 150 US dollars", explain: "It is the other way round: the price describes one unit of the base (USD)." },
        { id: "b", text: "The dollar has risen 150% this year", explain: "A price level is not a percentage change." },
        { id: "c", text: "One US dollar buys 150 Japanese yen", explain: "Correct." },
        { id: "d", text: "150 people traded the pair today", explain: "The price says nothing about how many people traded." },
      ],
    },
    {
      id: "q3",
      prompt: "EUR/USD moves from 1.1050 to 1.1060. How many pips is that?",
      correct: "b",
      options: [
        { id: "a", text: "1 pip", explain: "One pip would be 1.1050 to 1.1051." },
        { id: "b", text: "10 pips", explain: "Correct. The change is 0.0010, which is 10 steps of 0.0001." },
        { id: "c", text: "100 pips", explain: "100 pips would be a move of 0.0100." },
        { id: "d", text: "0.1 pips", explain: "Check the decimal places: 0.0010 is 10 × 0.0001." },
      ],
    },
    {
      id: "q4",
      prompt: "If EUR/USD rises, what has happened?",
      correct: "d",
      options: [
        { id: "a", text: "The dollar has strengthened against the euro", explain: "A higher EUR/USD means a dollar buys less euro, so the dollar has weakened against it." },
        { id: "b", text: "Both currencies became worth more", explain: "A pair only tells you how they compare to each other." },
        { id: "c", text: "Nothing; the price is fixed", explain: "Major exchange rates float and change constantly." },
        { id: "d", text: "The euro has strengthened against the dollar", explain: "Correct. One euro now buys more dollars." },
      ],
    },
    {
      id: "q5",
      prompt: "With 20 times leverage, the market moves 2% against your position. Roughly how much of the deposit used for that trade have you lost?",
      correct: "c",
      options: [
        { id: "a", text: "2%", explain: "That would be true without leverage. Leverage multiplies the effect." },
        { id: "b", text: "20%", explain: "That would be a 1% move. This move is 2%." },
        { id: "c", text: "40%", explain: "Correct. 2% × 20 = 40% of the deposit, before costs." },
        { id: "d", text: "Nothing, leverage protects you", explain: "Leverage increases risk; it never protects you." },
      ],
    },
    {
      id: "q6",
      prompt: "Where does most forex trading take place?",
      correct: "a",
      options: [
        { id: "a", text: "Over-the-counter, between banks and dealers", explain: "Correct. There is no single central forex exchange." },
        { id: "b", text: "On the New York Stock Exchange, alongside US shares", explain: "The NYSE is a stock exchange, not the main venue for currencies." },
        { id: "c", text: "Only at airport currency desks", explain: "Travel money is a tiny part of the market." },
        { id: "d", text: "Only on weekends", explain: "Spot forex is closed for most of the weekend." },
      ],
    },
  ],
  practical: {
    title: "Read three currency pairs",
    instructions: "Look up EUR/USD, GBP/USD and USD/JPY on any free finance website.",
    steps: [
      "For each pair, write down the base currency, the quote currency and the current rate.",
      "Write one sentence for each saying what the rate means, for example \"one euro buys 1.08 dollars\" (1.08 is a made-up example rate, not a real quote).",
      "Check one of them again a few hours later and work out how many pips it moved.",
    ],
    reflectionPrompt: "How many pips did the pair move, and did that feel like a big or small change?",
  },
  glossary: ["forex", "session", "currency-pair", "base-currency", "quote-currency", "exchange-rate", "pip", "leverage"],
  next: "indices",
};
