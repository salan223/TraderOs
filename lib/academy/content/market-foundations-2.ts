import type { Lesson } from "../types";

/*
  Market Foundations, lessons 6–10.
  Numbers in examples are hypothetical and labelled as such in the text.
*/

const T = "market-foundations";

export const L6_INDICES: Lesson = {
  id: "indices",
  trackId: T,
  order: 6,
  title: "Indices",
  summary: "A single number that summarises a group of stocks.",
  minutes: 12,
  objectives: [
    "Explain what a stock market index measures.",
    "Describe how weighting changes an index's behaviour.",
    "Name some well-known indices and what they contain.",
    "Explain how people get exposure to an index.",
  ],
  sections: [
    {
      id: "what-is-an-index",
      heading: "What an index is",
      blocks: [
        { kind: "p", text: "An [[index]] is a single number that tracks the combined value of a chosen group of assets. A stock index lets you see how a whole slice of the market is doing without checking hundreds of companies one by one." },
        { kind: "visual", visual: "index-basket", caption: "An index combines many companies into one number. Bigger companies carry more weight in a market-cap-weighted index. Illustrative weights." },
      ],
    },
    {
      id: "weighting",
      heading: "Weighting: who moves the index",
      blocks: [
        { kind: "p", text: "Each index has rules for how much each member counts, called its [[weighting]]." },
        { kind: "list", items: [
          "Market-cap weighted: bigger companies count more. The S&P 500 works this way, so a handful of very large companies can drive much of its movement.",
          "Price weighted: companies with a higher share price count more, whatever their size. The Dow Jones Industrial Average, with 30 companies, works this way.",
          "Equal weighted: every member counts the same.",
        ] },
        { kind: "p", text: "In a simple equal-weighted index, the index's percentage change is the average of its members' percentage changes." },
      ],
    },
    {
      id: "well-known",
      heading: "Well-known indices",
      blocks: [
        { kind: "list", items: [
          "S&P 500: about 500 large US companies.",
          "Nasdaq 100: 100 of the largest non-financial companies listed on the Nasdaq exchange, heavy in technology.",
          "FTSE 100: the 100 largest companies by market value listed on the London Stock Exchange.",
          "DAX: 40 large German companies.",
          "Nikkei 225: 225 large Japanese companies, price weighted.",
        ] },
        { kind: "p", text: "Index members change over time. Companies that shrink are removed and growing ones are added, so an index is not a fixed group of companies." },
      ],
    },
    {
      id: "getting-exposure",
      heading: "You cannot buy an index directly",
      blocks: [
        { kind: "p", text: "An index is a calculation, not something you can own. To follow one, people use products built on it: an [[index-fund|index fund]] or [[etf|ETF]] that holds the member companies, or leveraged contracts such as [[futures]] and [[cfd|CFDs]]." },
        { kind: "p", text: "Holding many companies through an index fund is a form of [[diversification]]: one company doing badly does less damage. It does not protect you when the whole market falls." },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "ex-equal-index",
    title: "Calculate a mini index",
    prompt: "Hypothetical example: a tiny equal-weighted index holds three companies. Today they move +3%, −1% and +4%. By what percentage does the index move? (Enter a number; use a minus sign for a fall.)",
    unit: "%",
    answer: 2,
    tolerance: 0.01,
    hint: "In an equal-weighted index, add the changes and divide by the number of members.",
    solution: "(3 + (−1) + 4) ÷ 3 = 6 ÷ 3 = +2%.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "What does a stock index measure?",
      correct: "d",
      options: [
        { id: "a", text: "The price of a single company", explain: "One company's price is just its share price, not an index." },
        { id: "b", text: "How many people are trading today", explain: "That would be closer to volume or activity, not an index." },
        { id: "c", text: "The future direction of the market", explain: "An index measures what has happened, not what will happen." },
        { id: "d", text: "The combined value of a chosen group of stocks", explain: "Correct." },
      ],
    },
    {
      id: "q2",
      prompt: "In a market-cap-weighted index, which company moves the index most?",
      correct: "b",
      options: [
        { id: "a", text: "The one with the highest share price", explain: "That is true for a price-weighted index, not a market-cap-weighted one." },
        { id: "b", text: "The one with the largest total market value", explain: "Correct. Bigger companies carry more weight." },
        { id: "c", text: "All companies move it equally", explain: "That is an equal-weighted index." },
        { id: "d", text: "The newest member", explain: "Joining date does not set weight." },
      ],
    },
    {
      id: "q3",
      prompt: "Which is a common way for an individual to follow the S&P 500?",
      correct: "a",
      options: [
        { id: "a", text: "Buy an index fund or ETF that tracks it", explain: "Correct. The fund holds the companies so its value follows the index, minus fees." },
        { id: "b", text: "Buy one share of the index directly from the exchange", explain: "An index is a calculation and cannot be bought directly." },
        { id: "c", text: "Open a savings account", explain: "A savings account is not linked to the index." },
        { id: "d", text: "It is impossible for individuals", explain: "Index funds make it widely available." },
      ],
    },
    {
      id: "q4",
      prompt: "Which statement about diversification through an index fund is true?",
      correct: "c",
      options: [
        { id: "a", text: "It guarantees you cannot lose money", explain: "Index funds can and do fall, sometimes sharply." },
        { id: "b", text: "It means you hold only technology companies, which grow fastest", explain: "That depends on the index; broad indices cover many sectors." },
        { id: "c", text: "It limits damage from one company, not from a market-wide fall", explain: "Correct." },
        { id: "d", text: "It doubles your returns", explain: "Diversification spreads risk; it does not multiply returns." },
      ],
    },
    {
      id: "q5",
      prompt: "Why might an index's list of companies change over time?",
      correct: "b",
      options: [
        { id: "a", text: "It never changes once created", explain: "Most indices are reviewed and updated regularly." },
        { id: "b", text: "Members that no longer meet its rules are replaced", explain: "Correct. That keeps the index representative of what it is meant to measure." },
        { id: "c", text: "Members are picked at random each day to keep things fair", explain: "Index rules are published and changes are announced." },
        { id: "d", text: "Only when the index falls", explain: "Changes follow the index rules, not its direction." },
      ],
    },
  ],
  practical: {
    title: "Look inside an index",
    instructions: "Search for the S&P 500 or the FTSE 100 and find a list of its largest members on any free finance website.",
    steps: [
      "Write down the five largest members and their weights if shown.",
      "Add up those five weights. How much of the index do they make up?",
      "Note which sectors (technology, banks, energy and so on) they belong to.",
    ],
    reflectionPrompt: "Does the index spread its weight as evenly as you expected? What does that mean for its risk?",
  },
  glossary: ["index", "weighting", "index-fund", "etf", "diversification", "futures"],
  next: "commodities-intro",
};

export const L7_COMMODITIES: Lesson = {
  id: "commodities-intro",
  trackId: T,
  order: 7,
  title: "Commodities",
  summary: "Raw materials like gold and oil, and why they trade differently from shares.",
  minutes: 13,
  objectives: [
    "Explain what makes something a commodity.",
    "Sort commodities into energy, metals and agriculture.",
    "Describe what drives commodity prices.",
    "Explain what a futures contract is and why most commodity trading uses them.",
  ],
  sections: [
    {
      id: "what-is-a-commodity",
      heading: "What a commodity is",
      blocks: [
        { kind: "p", text: "A [[commodity]] is a raw material that is basically the same whoever produces it. A barrel of a given grade of crude oil is interchangeable with another barrel of the same grade, which is what lets it trade in large standard amounts." },
        { kind: "visual", visual: "commodity-groups", caption: "Commodities are usually grouped into energy, metals and agriculture." },
      ],
    },
    {
      id: "how-quoted",
      heading: "How commodities are priced",
      blocks: [
        { kind: "p", text: "Major commodities are usually priced in US dollars. Crude oil is quoted per barrel, with Brent and WTI as the two main benchmarks. Gold is quoted per [[troy-ounce|troy ounce]]." },
        { kind: "p", text: "The [[spot-price|spot price]] is the price for delivery now. Most trading, though, happens through [[futures|futures contracts]]: agreements to buy or sell a set amount at a set price on a future date." },
        { kind: "p", text: "Futures expire. Most traders close their contract before expiry so they never take delivery of the actual oil or wheat." },
      ],
    },
    {
      id: "drivers",
      heading: "What moves commodity prices",
      blocks: [
        { kind: "list", items: [
          "Supply shocks: weather, harvests, strikes, wars and production decisions by large producers.",
          "Demand from the world economy: factories, transport and construction use energy and metals.",
          "Storage and transport: costs and capacity affect prices, especially for oil and gas.",
          "The US dollar: because most commodities are priced in dollars, changes in the dollar's value can affect their prices.",
        ] },
        { kind: "p", text: "Gold is unusual. It is used less in industry and more as a store of value, so investors' fears and interest rates play a bigger role in its price." },
      ],
    },
    {
      id: "futures-risk",
      heading: "Futures bring their own risks",
      blocks: [
        { kind: "p", text: "Futures are leveraged and have expiry dates, which create risks that owning shares does not." },
        { kind: "callout", tone: "warn", title: "A real example", text: "In April 2020, with oil storage nearly full, the US WTI oil futures contract for May delivery briefly traded below zero. Holders who could not take delivery had to pay to get out of their contracts." },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "ex-commodity-groups",
    title: "Sort the commodities",
    prompt: "Put each commodity into its group.",
    categories: [
      { id: "energy", label: "Energy" },
      { id: "metals", label: "Metals" },
      { id: "agri", label: "Agriculture" },
    ],
    items: [
      { id: "oil", text: "Crude oil", category: "energy", explain: "Oil is the most traded energy commodity." },
      { id: "gas", text: "Natural gas", category: "energy", explain: "Natural gas is used for heating and electricity, so it is energy." },
      { id: "gold", text: "Gold", category: "metals", explain: "Gold is a precious metal." },
      { id: "copper", text: "Copper", category: "metals", explain: "Copper is an industrial metal used in wiring and construction." },
      { id: "wheat", text: "Wheat", category: "agri", explain: "Wheat is a grain, so it is agricultural." },
      { id: "coffee", text: "Coffee", category: "agri", explain: "Coffee is a crop, so it is agricultural." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "What makes something a commodity?",
      correct: "a",
      options: [
        { id: "a", text: "It is a raw material that is the same whoever produces it", explain: "Correct. That sameness lets it trade in standard amounts." },
        { id: "b", text: "It is made by one famous brand", explain: "Branded products differ by maker, which is the opposite of a commodity." },
        { id: "c", text: "It is always cheap", explain: "Price has nothing to do with it; gold is a commodity." },
        { id: "d", text: "It can only be bought and sold online, through a commodity app", explain: "Commodities trade in many ways, including physical delivery." },
      ],
    },
    {
      id: "q2",
      prompt: "What is a futures contract?",
      correct: "c",
      options: [
        { id: "a", text: "A guarantee from the exchange that the price will rise by that date", explain: "A future fixes a price for a later trade; it guarantees nothing about direction." },
        { id: "b", text: "A share in a commodity company", explain: "That is a stock, not a future." },
        { id: "c", text: "An agreement to buy or sell a set amount at a set price on a future date", explain: "Correct." },
        { id: "d", text: "A savings plan for buying gold", explain: "That is a product some providers offer, not a futures contract." },
      ],
    },
    {
      id: "q3",
      prompt: "Which unit is gold usually quoted in?",
      correct: "b",
      options: [
        { id: "a", text: "Per barrel", explain: "Barrels are for oil." },
        { id: "b", text: "US dollars per troy ounce", explain: "Correct." },
        { id: "c", text: "Per bushel", explain: "Bushels are used for grains like wheat and corn." },
        { id: "d", text: "Per share", explain: "Gold itself has no shares." },
      ],
    },
    {
      id: "q4",
      prompt: "A drought badly damages the wheat harvest. All else equal, what pressure does that put on wheat prices?",
      correct: "d",
      options: [
        { id: "a", text: "Downward, because there is less wheat", explain: "Less supply usually means higher prices, not lower." },
        { id: "b", text: "None; weather does not affect commodities", explain: "Weather is one of the biggest drivers of agricultural prices." },
        { id: "c", text: "It depends only on the stock market", explain: "Wheat prices are driven mainly by wheat supply and demand." },
        { id: "d", text: "Upward, because supply falls", explain: "Correct." },
      ],
    },
    {
      id: "q5",
      prompt: "What happened to a US oil futures contract in April 2020?",
      correct: "a",
      options: [
        { id: "a", text: "It briefly traded below zero as storage ran out", explain: "Correct. It shows that futures carry risks beyond simple price moves." },
        { id: "b", text: "It doubled in a single day because of a sudden shortage", explain: "The opposite: there was too much oil and too little storage." },
        { id: "c", text: "Trading was banned permanently", explain: "Trading continued." },
        { id: "d", text: "Nothing unusual", explain: "It was one of the most unusual events in commodity market history." },
      ],
    },
  ],
  practical: {
    title: "Track two commodities",
    instructions: "Look up the gold price and the Brent crude oil price on any free finance website for a week.",
    steps: [
      "Write down each price and its unit (per troy ounce, per barrel) once a day.",
      "Note one news story each day that might affect either one.",
      "At the end of the week, compare which moved more in percentage terms.",
    ],
    reflectionPrompt: "Which of the two moved more, and could you link any move to news about supply or demand?",
  },
  glossary: ["commodity", "troy-ounce", "spot-price", "futures"],
  next: "crypto-intro",
};

export const L8_CRYPTO: Lesson = {
  id: "crypto-intro",
  trackId: T,
  order: 8,
  title: "Cryptocurrency",
  summary: "Digital assets, why they are volatile, and what can go wrong.",
  minutes: 14,
  objectives: [
    "Explain what a cryptocurrency and a blockchain are.",
    "Describe how crypto markets differ from traditional markets.",
    "Explain why wallets and private keys matter.",
    "Name the main risks of holding and trading crypto.",
  ],
  sections: [
    {
      id: "what-is-crypto",
      heading: "What cryptocurrency is",
      blocks: [
        { kind: "p", text: "A [[cryptocurrency]] is a digital asset whose ownership is recorded on a [[blockchain]]: a shared record kept by many computers instead of one bank." },
        { kind: "p", text: "Bitcoin, launched in 2009, was the first. Its rules cap the total supply at 21 million coins. Ether is the currency of the Ethereum network, which also runs programs called [[smart-contract|smart contracts]]." },
        { kind: "visual", visual: "blockchain-chain", caption: "Each block holds transactions and a fingerprint (hash) of the block before it, which makes changing history very difficult." },
      ],
    },
    {
      id: "how-it-trades",
      heading: "How crypto markets differ",
      blocks: [
        { kind: "list", items: [
          "They trade 24 hours a day, 7 days a week, including weekends and holidays.",
          "Most trading happens on [[crypto-exchange|crypto exchanges]], companies that vary widely in quality and regulation.",
          "Prices are very volatile. Bitcoin has fallen more than 70% from a previous high on more than one occasion.",
          "Rules differ a lot between countries and are still changing.",
        ] },
      ],
    },
    {
      id: "keys-and-wallets",
      heading: "Wallets and keys",
      blocks: [
        { kind: "p", text: "A crypto [[wallet]] stores the [[private-key|private keys]] that let you move your coins. Whoever has the keys controls the coins." },
        { kind: "p", text: "Crypto transfers generally cannot be reversed. If you send coins to the wrong address, lose your keys or are tricked by a scammer, there is usually no bank to call and no way to get them back." },
        { kind: "p", text: "If you leave coins on an exchange, the exchange has [[custody]] of them: it holds the keys for you. If it fails or is hacked, you can lose them. The collapse of the FTX exchange in November 2022 left many customers unable to withdraw their funds." },
      ],
    },
    {
      id: "risks",
      heading: "Stablecoins and other risks",
      blocks: [
        { kind: "p", text: "A [[stablecoin]] is designed to hold a steady value, usually one US dollar. That is a design goal, not a guarantee: in May 2022 the TerraUSD stablecoin [[peg|lost its peg]] and collapsed within days." },
        { kind: "callout", tone: "warn", title: "Scams are common", text: "Promises of guaranteed returns, celebrity endorsements and pressure to act fast are classic warning signs. No legitimate investment guarantees profits." },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "ex-crypto-facts",
    title: "True or false?",
    prompt: "Decide whether each statement about cryptocurrency is true or false.",
    categories: [
      { id: "true", label: "True" },
      { id: "false", label: "False" },
    ],
    items: [
      { id: "s1", text: "Crypto markets close at the weekend, like stock exchanges.", category: "false", explain: "Crypto trades 24 hours a day, 7 days a week." },
      { id: "s2", text: "Crypto sent to a wrong address can usually be recovered by calling your bank.", category: "false", explain: "Transfers are generally irreversible, and banks do not control blockchains." },
      { id: "s3", text: "Bitcoin's rules cap its total supply at 21 million coins.", category: "true", explain: "That limit is built into Bitcoin's software rules." },
      { id: "s4", text: "A stablecoin can never lose its value.", category: "false", explain: "Several have lost their peg, including TerraUSD in 2022." },
      { id: "s5", text: "Whoever controls the private keys controls the coins.", category: "true", explain: "Keys authorise transfers, which is why protecting them is critical." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "What is a blockchain?",
      correct: "b",
      options: [
        { id: "a", text: "A network of banks that jointly guarantee everyone's crypto deposits", explain: "Blockchains are not run by banks and do not guarantee deposits." },
        { id: "b", text: "A shared record of transactions kept by many computers", explain: "Correct." },
        { id: "c", text: "A type of stock exchange", explain: "A blockchain records ownership; exchanges are separate companies." },
        { id: "d", text: "A password manager", explain: "Wallets store keys; the blockchain is the shared record." },
      ],
    },
    {
      id: "q2",
      prompt: "You keep your bitcoin on a crypto exchange, which then collapses. What is the main risk?",
      correct: "c",
      options: [
        { id: "a", text: "None: crypto held on exchanges is protected like a bank deposit everywhere", explain: "Crypto on exchanges generally does not have bank-style deposit protection." },
        { id: "b", text: "Your bitcoin automatically moves to another exchange", explain: "Nothing moves automatically." },
        { id: "c", text: "You may lose access to your funds, as FTX customers did", explain: "Correct. The exchange held the keys." },
        { id: "d", text: "The price of bitcoin becomes fixed", explain: "One exchange failing does not fix the price." },
      ],
    },
    {
      id: "q3",
      prompt: "When are crypto markets open?",
      correct: "a",
      options: [
        { id: "a", text: "24 hours a day, 7 days a week", explain: "Correct." },
        { id: "b", text: "Weekdays from 9:30 to 16:00 New York time", explain: "Those are US stock market hours." },
        { id: "c", text: "Only during the London session", explain: "Crypto does not follow forex sessions." },
        { id: "d", text: "Only when bitcoin's price is rising", explain: "Opening hours do not depend on price." },
      ],
    },
    {
      id: "q4",
      prompt: "What does a stablecoin aim to do?",
      correct: "d",
      options: [
        { id: "a", text: "Rise steadily in price every year", explain: "Stablecoins aim to stay flat, not to grow." },
        { id: "b", text: "Guarantee your money against any loss", explain: "There is no such guarantee, and some have collapsed." },
        { id: "c", text: "Replace all bank accounts by law", explain: "No law does that." },
        { id: "d", text: "Keep a steady value, usually one US dollar", explain: "Correct, though this is a goal, not a promise." },
      ],
    },
    {
      id: "q5",
      prompt: "Which is a classic warning sign of a crypto scam?",
      correct: "b",
      options: [
        { id: "a", text: "A clear explanation of the risks", explain: "Explaining risks honestly is a good sign, not a warning sign." },
        { id: "b", text: "A promise of guaranteed high returns", explain: "Correct. No legitimate investment guarantees profits." },
        { id: "c", text: "Being told to research before investing", explain: "That is sensible advice." },
        { id: "d", text: "Prices that go down as well as up", explain: "Prices moving both ways is normal." },
      ],
    },
  ],
  practical: {
    title: "Check a crypto platform's small print",
    instructions: "Pick any well-known crypto exchange. Research only; do not deposit money.",
    steps: [
      "Find where it is regulated, if anywhere, and in which countries.",
      "Find what it says about holding customers' coins (look for \"[[custody]]\").",
      "Write down whether customer funds are protected and by whom, if the site says so.",
    ],
    reflectionPrompt: "Would you be comfortable leaving money on this platform? Why or why not?",
  },
  glossary: ["cryptocurrency", "blockchain", "smart-contract", "crypto-exchange", "wallet", "private-key", "custody", "stablecoin", "peg"],
  next: "trading-vs-investing",
};

export const L9_TRADING_VS_INVESTING: Lesson = {
  id: "trading-vs-investing",
  trackId: T,
  order: 9,
  title: "Trading versus investing",
  summary: "Time horizons, goals and why most short-term traders lose money.",
  minutes: 14,
  objectives: [
    "Explain the difference between trading and investing.",
    "Describe common time horizons, from day trading to long-term investing.",
    "Explain why costs and leverage make short-term trading hard.",
    "Describe what the evidence says about retail trading results.",
  ],
  sections: [
    {
      id: "two-approaches",
      heading: "Two different approaches",
      blocks: [
        { kind: "p", text: "[[trading|Trading]] means buying and selling over short periods, from minutes to weeks, to profit from price movements. [[investing|Investing]] means buying assets to hold for years, aiming to benefit from long-term growth and income." },
        { kind: "p", text: "The main difference is the [[time-horizon|time horizon]]: how long you plan to hold. That choice changes almost everything else: what you study, how often you act and which costs matter." },
        { kind: "visual", visual: "time-horizons", caption: "Typical holding periods, from very short-term trading to long-term investing." },
      ],
    },
    {
      id: "styles",
      heading: "Common styles",
      blocks: [
        { kind: "list", items: [
          "[[day-trading|Day trading]]: positions opened and closed within one day.",
          "Swing trading: holding for days to a few weeks to catch a larger move.",
          "Position trading: holding for weeks to months based on a bigger trend or theme.",
          "Long-term investing: holding for years, often through funds, and adding regularly.",
        ] },
      ],
    },
    {
      id: "costs-evidence",
      heading: "Why short-term trading is hard",
      blocks: [
        { kind: "p", text: "Every trade has costs: spreads, commissions and sometimes overnight fees. The more often you trade, the more of your result goes to costs." },
        { kind: "p", text: "Many retail traders use leveraged products such as [[cfd|CFDs]]. When the EU's markets regulator (ESMA) reviewed CFD trading in 2018, it found that between 74% and 89% of retail accounts typically lost money." },
        { kind: "callout", tone: "warn", title: "Be honest with yourself", text: "Losing money is the most common outcome for beginners who trade short term. Learning, practising with virtual money and strict risk limits are how you avoid paying for lessons with real savings." },
      ],
    },
    {
      id: "investing-basics",
      heading: "What long-term investors rely on",
      blocks: [
        { kind: "p", text: "Long-term investors rely on businesses growing over time, on diversification, and on [[compounding]]: earning returns on earlier returns. These effects need years to work and do not remove the risk of losses, especially over shorter periods." },
        { kind: "p", text: "Trader OS teaches trading skills, but it is worth knowing that trading is not the only way to take part in markets. Neither approach is guaranteed to make money." },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "ex-trading-or-investing",
    title: "Trading or investing?",
    prompt: "Decide whether each person is mainly trading or investing.",
    categories: [
      { id: "trading", label: "Trading" },
      { id: "investing", label: "Investing" },
    ],
    items: [
      { id: "p1", text: "Ana buys an index fund every month and plans to hold it until she retires", category: "investing", explain: "Regular buying with a decades-long horizon is investing." },
      { id: "p2", text: "Ben buys a currency pair at 10:00 and closes it at 11:30 the same day", category: "trading", explain: "Holding for an hour and a half is day trading." },
      { id: "p3", text: "Chen holds a share for two weeks to catch a move after earnings", category: "trading", explain: "A few weeks for a specific price move is swing trading." },
      { id: "p4", text: "Dara buys shares in companies she believes will grow for the next ten years", category: "investing", explain: "A ten-year horizon based on business growth is investing." },
      { id: "p5", text: "Eli opens and closes ten leveraged CFD positions every day", category: "trading", explain: "Frequent, short, leveraged positions are trading, and costs add up quickly." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "What is the main difference between trading and investing?",
      correct: "c",
      options: [
        { id: "a", text: "Traders use computers and investors do not", explain: "Both use computers." },
        { id: "b", text: "Investing is always safe; trading is always risky", explain: "Both carry risk. Investments can fall too." },
        { id: "c", text: "The time horizon: how long positions are held", explain: "Correct. Trading is short term; investing is long term." },
        { id: "d", text: "Only investors can buy shares", explain: "Traders buy shares too." },
      ],
    },
    {
      id: "q2",
      prompt: "What is day trading?",
      correct: "a",
      options: [
        { id: "a", text: "Opening and closing positions within the same day", explain: "Correct." },
        { id: "b", text: "Trading only during daylight", explain: "It is about holding period, not daylight." },
        { id: "c", text: "Holding each position for exactly one trading day a week", explain: "That is not a standard definition." },
        { id: "d", text: "Investing for a decade", explain: "That is long-term investing." },
      ],
    },
    {
      id: "q3",
      prompt: "In ESMA's 2018 review, what share of retail CFD accounts typically lost money?",
      correct: "d",
      options: [
        { id: "a", text: "About 10%", explain: "The real figure was far higher." },
        { id: "b", text: "About 50%", explain: "Higher than that." },
        { id: "c", text: "Almost none", explain: "Most lost money." },
        { id: "d", text: "Between 74% and 89%", explain: "Correct. Most retail CFD accounts lost money." },
      ],
    },
    {
      id: "q4",
      prompt: "Why do trading costs matter more for short-term traders?",
      correct: "b",
      options: [
        { id: "a", text: "Short-term traders are charged higher prices for the same shares", explain: "Everyone pays market prices; the issue is how often costs are paid." },
        { id: "b", text: "They pay spreads and fees many more times", explain: "Correct. Costs add up with every trade." },
        { id: "c", text: "Costs only apply to short-term trades", explain: "Investors pay costs too, just less often." },
        { id: "d", text: "They do not matter", explain: "Costs can turn a small edge into a loss." },
      ],
    },
    {
      id: "q5",
      prompt: "What is compounding?",
      correct: "c",
      options: [
        { id: "a", text: "Combining several trades into one", explain: "That is not compounding." },
        { id: "b", text: "Guaranteed growth that the stock market pays to long-term holders", explain: "Nothing about markets is guaranteed." },
        { id: "c", text: "Earning returns on your earlier returns", explain: "Correct. Over long periods it can make growth speed up." },
        { id: "d", text: "A type of leverage", explain: "Compounding involves no borrowing." },
      ],
    },
  ],
  practical: {
    title: "Write your own time horizon",
    instructions: "Think about your goals before you think about strategies. Write honestly; nobody else sees this.",
    steps: [
      "Write why you want to learn trading, in one or two sentences.",
      "Write how much time each week you can realistically spend on it.",
      "Based on that, note which style (day, swing, position or long-term investing) fits your life best right now.",
    ],
    reflectionPrompt: "What is your goal, how much time do you have, and which time horizon fits?",
  },
  glossary: ["trading", "investing", "time-horizon", "day-trading", "cfd", "compounding"],
  next: "terminology",
};

export const L10_TERMINOLOGY: Lesson = {
  id: "terminology",
  trackId: T,
  order: 10,
  title: "Market terminology",
  summary: "The core vocabulary you will use in every other lesson.",
  minutes: 15,
  objectives: [
    "Explain bid, ask and spread, and which price you buy and sell at.",
    "Explain going long and going short.",
    "Describe market, limit, stop-loss and take-profit orders.",
    "Use the words volume, slippage, bull market and bear market correctly.",
  ],
  sections: [
    {
      id: "bid-ask",
      heading: "Bid, ask and spread",
      blocks: [
        { kind: "p", text: "At any moment there are two prices. The [[bid]] is the highest price a buyer will pay. The [[ask]] is the lowest price a seller will accept. In a normal market the ask is above the bid." },
        { kind: "p", text: "If you buy straight away you usually pay the ask. If you sell straight away you usually receive the bid. The gap between them is the [[spread]], and it is a cost of trading immediately." },
        { kind: "visual", visual: "bid-ask-spread", caption: "Buyers wait at the bid, sellers wait at the ask. Example prices, not a live quote." },
      ],
    },
    {
      id: "long-short",
      heading: "Long and short",
      blocks: [
        { kind: "p", text: "Going [[long]] means buying, so you profit if the price rises. Going [[short]] means selling first (with borrowed shares or a contract) so you profit if the price falls." },
        { kind: "p", text: "Either way, an open trade is called a [[position]]. A long position's loss is limited to what you paid (without leverage). A short position's loss has no fixed limit, because a price can keep rising." },
      ],
    },
    {
      id: "order-types",
      heading: "Order types",
      blocks: [
        { kind: "list", items: [
          "[[market-order|Market order]]: buy or sell now at the best available price. Fast, but the exact price is not guaranteed.",
          "[[limit-order|Limit order]]: buy or sell only at your price or better. You control the price, but it may never fill.",
          "[[stop-loss|Stop-loss]]: closes a trade if the price moves against you to a chosen level, to limit the loss.",
          "[[take-profit|Take-profit]]: closes a trade when the price reaches your chosen profit level.",
        ] },
        { kind: "p", text: "[[slippage|Slippage]] is the difference between the price you expected and the one you got. It happens most in fast or quiet markets, and when the price [[market-gap|gaps]] past your level it can affect stop-losses too." },
      ],
    },
    {
      id: "market-words",
      heading: "Describing the market",
      blocks: [
        { kind: "p", text: "[[volume|Volume]] is how much was traded over a period. A [[bull-market|bull market]] is a long period of generally rising prices; a [[bear-market|bear market]] is a long period of falling prices." },
        { kind: "p", text: "You now have the vocabulary for the rest of the Academy. When in doubt, every term is in the glossary." },
      ],
    },
  ],
  exercise: {
    kind: "match",
    id: "ex-terms",
    title: "Match the term",
    prompt: "Match each term to its meaning.",
    pairs: [
      { id: "bid", left: "Bid", right: "Highest price a buyer is willing to pay" },
      { id: "ask", left: "Ask", right: "Lowest price a seller is willing to accept" },
      { id: "spread", left: "Spread", right: "The gap between the two prices" },
      { id: "limit", left: "Limit order", right: "Fills only at your price or better" },
      { id: "short", left: "Going short", right: "Profits if the price falls" },
      { id: "slip", left: "Slippage", right: "Getting a different price from the one you expected" },
    ],
    explanation: "These six ideas come up in almost every trade. If any felt shaky, reread the section and check the glossary.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "A quote shows bid 1.2500 and ask 1.2502 (example prices). If you buy immediately, which price do you usually pay?",
      correct: "b",
      options: [
        { id: "a", text: "1.2500, the bid", explain: "The bid is what you receive when you sell." },
        { id: "b", text: "1.2502, the ask", explain: "Correct. Buyers pay the ask." },
        { id: "c", text: "1.2501, the middle", explain: "The middle price is a reference; you cannot usually trade at it immediately." },
        { id: "d", text: "Whatever price you choose", explain: "That is a limit order, which may not fill immediately." },
      ],
    },
    {
      id: "q2",
      prompt: "In that same example, what is the spread?",
      correct: "a",
      options: [
        { id: "a", text: "0.0002 (2 pips)", explain: "Correct. 1.2502 − 1.2500 = 0.0002." },
        { id: "b", text: "1.2501", explain: "That is the mid price, not the spread." },
        { id: "c", text: "0.02 (200 pips)", explain: "Check the decimals: the difference is 0.0002." },
        { id: "d", text: "There is no spread", explain: "Whenever bid and ask differ, there is a spread." },
      ],
    },
    {
      id: "q3",
      prompt: "You think a price will fall. Which position would profit if you are right?",
      correct: "d",
      options: [
        { id: "a", text: "A long position", explain: "Long positions profit from rises." },
        { id: "b", text: "A take-profit order on its own", explain: "A take-profit closes a trade; it is not a position by itself." },
        { id: "c", text: "A bull position", explain: "Bull describes rising markets." },
        { id: "d", text: "A short position", explain: "Correct. Shorts profit when the price falls, but losses have no fixed limit." },
      ],
    },
    {
      id: "q4",
      prompt: "What is the main trade-off of a limit order?",
      correct: "c",
      options: [
        { id: "a", text: "It always fills but at a random price", explain: "That is closer to a market order in a fast market." },
        { id: "b", text: "It removes all risk from the trade", explain: "No order type removes risk." },
        { id: "c", text: "You control the price, but it may never fill", explain: "Correct." },
        { id: "d", text: "It can only be used for crypto", explain: "Limit orders are available in almost every market." },
      ],
    },
    {
      id: "q5",
      prompt: "You are long with a stop-loss at 100. The market [[market-gap|gaps]] from 102 straight to 97. What might happen?",
      correct: "b",
      options: [
        { id: "a", text: "You are guaranteed to exit at exactly 100, because that is the level you set", explain: "A standard stop-loss is not guaranteed in a gap." },
        { id: "b", text: "Your stop may fill near 97, worse than 100, because of slippage", explain: "Correct. Stops become market orders once triggered, and the next price may be worse." },
        { id: "c", text: "The trade stays open forever", explain: "The stop is triggered once the price passes 100." },
        { id: "d", text: "The broker refunds the difference", explain: "Ordinary stop-losses do not come with refunds." },
      ],
    },
    {
      id: "q6",
      prompt: "What is a bear market?",
      correct: "a",
      options: [
        { id: "a", text: "A long period of generally falling prices", explain: "Correct. For stocks, a 20% fall from a recent high is a common rule of thumb." },
        { id: "b", text: "A market that only trades in the morning", explain: "Bear has nothing to do with hours." },
        { id: "c", text: "A sudden one-day rise", explain: "Rising markets are bull markets." },
        { id: "d", text: "A market with no volume", explain: "Volume is a separate idea." },
      ],
    },
  ],
  practical: {
    title: "Read a live quote",
    instructions: "Open any free finance website or a broker's demo platform that shows bid and ask prices. Do not place real trades.",
    steps: [
      "For one currency pair and one share, write down the bid, ask and spread.",
      "Check the same instruments at a quiet time (for example late at night your time) and compare the spread.",
      "Explain in your own words which price you would pay to buy and receive to sell.",
    ],
    reflectionPrompt: "Did the spread change between busy and quiet times? What does that tell you about liquidity?",
  },
  glossary: ["bid", "ask", "spread", "long", "short", "position", "market-order", "limit-order", "stop-loss", "take-profit", "slippage", "market-gap", "volume", "bull-market", "bear-market"],
  next: "fx-quotes",
};
