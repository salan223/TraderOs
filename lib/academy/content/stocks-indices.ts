import type { Lesson } from "../types";

/*
  Stocks and Indices (track 3).
  Companies in examples and illustrations are fictional, and all their
  figures are made up. Index methods are described as their providers
  publish them, in simplified form. Nothing here is a recommendation.
*/

const T = "stocks-indices";

export const SI1_EXCHANGES: Lesson = {
  id: "si-exchanges",
  trackId: T,
  order: 1,
  title: "How stock exchanges work",
  summary: "From a company's first share sale to how your order meets someone else's in the order book.",
  minutes: 16,
  objectives: [
    "Explain the difference between the primary and secondary market, and where an IPO fits.",
    "Describe the role of the exchange and your broker in a share trade.",
    "Read a simple order book and say what a market order would pay.",
    "Predict whether a limit order fills, partly fills or waits in the book.",
  ],
  sections: [
    {
      id: "primary-secondary",
      heading: "Two markets for the same shares",
      blocks: [
        { kind: "p", text: "Market Foundations introduced the [[stock]] and the [[ipo|IPO]]. When a company sells new shares to raise money, that happens in the [[primary-market|primary market]]: the cash goes to the company. In an IPO, investment banks usually help set the price and find buyers, and the company then gets a [[listing]] on a stock exchange." },
        { kind: "p", text: "After that, nearly all trading happens in the [[secondary-market|secondary market]]: investors buying from and selling to each other. When you buy a share of a large company today, the company receives nothing; you are buying from another investor. Prices there still matter to the company, because they set what it would cost to raise money again." },
      ],
    },
    {
      id: "who-does-what",
      heading: "Who does what",
      blocks: [
        { kind: "list", items: [
          "The [[exchange]] runs the marketplace: it sets the rules, matches orders and publishes prices. Well-known examples are the New York Stock Exchange, Nasdaq and the London Stock Exchange.",
          "Your [[broker]] gives you access. It takes your order, checks you can pay, sends the order to an exchange or another trading venue, and holds the shares for you.",
          "After the trade, a clearing house stands between buyer and seller and makes sure [[settlement]] happens. In the US, share trades settle one business day after the trade (T+1); many other markets use two days.",
        ] },
        { kind: "p", text: "Each listed share has a short code, its [[ticker]]. Most exchanges trade during set hours on weekdays, for example 09:30–16:00 New York time for regular US trading. Trading before and after those hours exists but is usually thinner, with wider spreads." },
      ],
    },
    {
      id: "order-book",
      heading: "Inside the order book",
      blocks: [
        { kind: "p", text: "An exchange keeps an [[order-book|order book]] for each share: buy orders (bids) on one side and sell orders (asks) on the other, each with a price and a quantity. The best bid is the highest price a buyer offers; the best ask is the lowest price a seller accepts. The gap is the [[spread]]." },
        { kind: "p", text: "Orders are matched by [[price-time-priority|price-time priority]]: better prices go first, and at the same price, the order that arrived first goes first." },
        { kind: "interactive", widget: "si-order-book", title: "Send an order into the book", caption: "A made-up order book for a fictional company. Real books for large shares are far deeper and change many times a second." },
      ],
    },
    {
      id: "order-types",
      heading: "Market and limit orders, again",
      blocks: [
        { kind: "p", text: "A [[market-order|market order]] takes the best prices available now. If it is bigger than the quantity at the best ask, it carries on to the next price, and the next: the average price gets worse. That is [[slippage]] caused by your own size." },
        { kind: "p", text: "A [[limit-order|limit order]] sets the worst price you will accept. Any part that can trade at your price or better fills straight away; the rest waits in the book. When only part of an order trades, that is a [[partial-fill|partial fill]]. A waiting limit order may fill later, or never." },
        { kind: "callout", tone: "info", title: "Opening and closing auctions", text: "Many exchanges start and end the day with an auction: orders are collected for a few minutes and matched at one price. The closing price you see quoted for a share often comes from this auction." },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "ex-si-primary-secondary",
    title: "Primary or secondary market?",
    prompt: "Decide whether each event happens in the primary market (the company sells new shares and gets the money) or the secondary market (investors trade existing shares with each other).",
    categories: [
      { id: "primary", label: "Primary market" },
      { id: "secondary", label: "Secondary market" },
    ],
    items: [
      { id: "s1", text: "A company sells shares to the public for the first time in an IPO", category: "primary", explain: "The company receives the money from the new shares." },
      { id: "s2", text: "You buy 10 shares of a large listed company through your broker app", category: "secondary", explain: "You buy from another investor; the company receives nothing." },
      { id: "s3", text: "A listed company issues extra new shares to fund a factory", category: "primary", explain: "New shares, and the cash goes to the company." },
      { id: "s4", text: "A pension fund sells part of its holding on the exchange", category: "secondary", explain: "Existing shares change hands between investors." },
      { id: "s5", text: "A market maker buys shares from a seller and later sells them to a buyer", category: "secondary", explain: "Trading in existing shares, even with a dealer in the middle." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "You buy shares of a large, long-listed company on the exchange. Who receives your money?",
      correct: "c",
      options: [
        { id: "a", text: "The company, to invest in its business", explain: "That only happens when the company sells new shares." },
        { id: "b", text: "The exchange keeps it as a fee", explain: "The exchange charges small fees but does not receive the price." },
        { id: "c", text: "The investor who sold the shares", explain: "Correct. This is the secondary market." },
        { id: "d", text: "The government, as a share tax", explain: "Some countries tax share purchases, but the price goes to the seller." },
      ],
    },
    {
      id: "q2",
      prompt: "Best bid $49.99, best ask $50.02 (sample). You place a small market buy order. At what price do you most likely buy?",
      correct: "b",
      options: [
        { id: "a", text: "$49.99", explain: "That is what buyers are offering. A market buy takes the sellers' price." },
        { id: "b", text: "$50.02", explain: "Correct. A market buy takes the best ask." },
        { id: "c", text: "$50.005, the midpoint", explain: "You normally cannot trade at the midpoint with a simple market order." },
        { id: "d", text: "Whatever price you type in", explain: "That describes a limit order." },
      ],
    },
    {
      id: "q3",
      prompt: "In the same book, you place a limit buy at $49.97. What happens?",
      correct: "d",
      options: [
        { id: "a", text: "It fills at $50.02", explain: "A limit buy never pays more than its limit." },
        { id: "b", text: "It fills at $49.97 straight away", explain: "Nobody is selling that cheaply yet." },
        { id: "c", text: "It is rejected because it is below the bid", explain: "It is allowed; it just waits in the book." },
        { id: "d", text: "It waits in the book until a seller accepts", explain: "Correct. It may fill later, or never." },
      ],
    },
    {
      id: "q4",
      prompt: "A market buy for 1,000 shares meets only 300 shares at the best ask. What happens next?",
      correct: "a",
      options: [
        { id: "a", text: "The rest fills at the next prices up", explain: "Correct. The average price ends up worse than the best ask." },
        { id: "b", text: "All 1,000 fill at the best ask anyway", explain: "Only 300 are offered at that price." },
        { id: "c", text: "The order is cancelled completely", explain: "A market order keeps taking available prices." },
        { id: "d", text: "The exchange creates 700 new shares", explain: "Exchanges do not create shares." },
      ],
    },
    {
      id: "q5",
      prompt: "Two buy limit orders are at the same price. Which fills first?",
      correct: "c",
      options: [
        { id: "a", text: "The bigger one", explain: "Size does not set priority in standard price-time matching." },
        { id: "b", text: "The one from the more famous broker", explain: "Brokers do not get priority by reputation." },
        { id: "c", text: "The one that arrived first", explain: "Correct. At the same price, earlier orders go first." },
        { id: "d", text: "They are chosen at random", explain: "Matching follows published rules, not chance." },
      ],
    },
    {
      id: "q6",
      prompt: "What is the main job of an exchange?",
      correct: "b",
      options: [
        { id: "a", text: "To decide which shares are good investments for you", explain: "Exchanges set listing rules but do not judge investments for you." },
        { id: "b", text: "To run the rules and match buy and sell orders", explain: "Correct." },
        { id: "c", text: "To hold your account and give you an app", explain: "That is your broker's role." },
        { id: "d", text: "To guarantee that prices go up", explain: "No one can guarantee that." },
      ],
    },
  ],
  practical: {
    title: "Look at a real order book",
    instructions: "Many broker apps and some free sites can show the order book for a share, often labelled \"market depth\" or \"Level 2\": the waiting buy and sell orders at several prices, not just the best bid and ask. A demo account is enough.",
    steps: [
      "Pick a very large, well-known company and note its best bid, best ask and spread.",
      "Note how many shares wait at the best ask and the next two prices.",
      "Do the same for a much smaller company and compare.",
    ],
    reflectionPrompt: "How would a market order for 1,000 shares behave differently in the two books?",
  },
  glossary: ["primary-market", "listing", "secondary-market", "ticker", "price-time-priority", "partial-fill"],
  next: "si-earnings",
};

export const SI2_EARNINGS: Lesson = {
  id: "si-earnings",
  trackId: T,
  order: 2,
  title: "Reading a company's earnings",
  summary: "Revenue, profit, EPS and P/E, and why shares can fall on \"good\" results.",
  minutes: 18,
  objectives: [
    "Explain the difference between revenue and profit, and calculate a profit margin.",
    "Calculate earnings per share and a P/E ratio, and know when P/E is meaningless.",
    "Explain what consensus estimates and guidance are.",
    "Explain why a share can fall after beating forecasts.",
  ],
  sections: [
    {
      id: "results",
      heading: "What an earnings report is",
      blocks: [
        { kind: "p", text: "Listed companies publish their [[earnings]] on a regular schedule: in the US every quarter, in many other countries every half year. Lots of companies report in the same few weeks, which traders call [[earnings-season|earnings season]]." },
        { kind: "p", text: "A report shows what the business sold, what it spent and what was left. The three headline numbers are revenue, profit and earnings per share." },
      ],
    },
    {
      id: "revenue-profit",
      heading: "Revenue and profit",
      blocks: [
        { kind: "list", items: [
          "[[revenue|Revenue]] (sales or \"the top line\") is the money from selling goods and services, before any costs.",
          "[[net-profit|Net profit]] (net income, \"the bottom line\") is what is left after all costs, interest and tax. It can be negative: a loss.",
          "[[profit-margin|Profit margin]] = profit ÷ revenue × 100. A shop selling 100 dollars of goods and keeping 5 has a 5% margin.",
        ] },
        { kind: "p", text: "A company can grow its revenue fast and still lose money, and a company with flat revenue can grow profit by cutting costs. Watching both tells you more than either alone." },
      ],
    },
    {
      id: "eps-pe",
      heading: "Earnings per share and P/E",
      blocks: [
        { kind: "p", text: "[[eps|EPS]] (earnings per share) = net profit ÷ number of shares. It turns the company's profit into each share's slice of it. A company earning 60 million dollars with 40 million shares has EPS of 1.50 dollars." },
        { kind: "p", text: "The [[pe-ratio|P/E ratio]] = share price ÷ EPS (usually over the last or next 12 months). A share at 30 dollars with EPS of 1.50 has a P/E of 20: investors pay 20 dollars for each dollar of yearly profit. A high P/E usually means investors expect strong growth, or are paying a lot. A low P/E can mean a bargain, or a business in trouble." },
        { kind: "p", text: "P/E is not meaningful when EPS is zero or negative, and comparing P/Es only makes sense between similar companies. It is one rough yardstick, not a verdict." },
        { kind: "interactive", widget: "si-earnings", title: "Earnings beat or miss", caption: "A fictional company with made-up figures. The reaction text describes common patterns, not predictions." },
      ],
    },
    {
      id: "expectations",
      heading: "Expectations and guidance",
      blocks: [
        { kind: "p", text: "Before results, analysts publish forecasts. Their average is the [[consensus-estimate|consensus estimate]]. When results come out, the market compares them with that consensus: a result above it is a \"beat\", below it a \"miss\". The gap is the [[earnings-surprise|earnings surprise]]." },
        { kind: "p", text: "Many companies also give [[guidance]]: their own forecast for coming quarters or the year. Because share prices reflect expectations about the future, a change in guidance can matter more than the quarter just reported." },
      ],
    },
    {
      id: "good-news-falls",
      heading: "Why shares can fall on good results",
      blocks: [
        { kind: "list", items: [
          "Expectations were higher than the published consensus. If the price rose a lot before results, investors may have hoped for more.",
          "Guidance was cut: this quarter was good, but the company expects a weaker future.",
          "The quality was poor: a beat made of one-off gains, or profit up while revenue shrank.",
          "The good news was already [[priced-in|priced in]], so some holders sell to lock in gains.",
        ] },
        { kind: "callout", tone: "warn", title: "Earnings days are risky", text: "Shares often [[market-gap|gap]] after results, because reports are usually released outside regular trading hours. A stop-loss cannot protect you from a gap. Holding a short-term trade through an earnings release is a deliberate risk, not a detail." },
        { kind: "p", text: "Companies sometimes highlight \"adjusted\" profit that leaves out certain costs. That can be useful, but read what was left out: the official figure is the one prepared under accounting rules." },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "ex-si-pe",
    title: "Work out a P/E",
    prompt: "A fictional company made a net profit of 60 million dollars over the last year and has 40 million shares. Its share price is 30 dollars. What is its P/E ratio?",
    unit: "P/E",
    answer: 20,
    tolerance: 0.01,
    hint: "First EPS = profit ÷ shares. Then P/E = price ÷ EPS.",
    solution: "EPS = 60 million ÷ 40 million = 1.50 dollars. P/E = 30 ÷ 1.50 = 20.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "What is the difference between revenue and net profit?",
      correct: "a",
      options: [
        { id: "a", text: "Revenue is sales; net profit is what is left after all costs", explain: "Correct." },
        { id: "b", text: "They are two names for the same thing", explain: "Revenue is before costs; profit is after them." },
        { id: "c", text: "Net profit is always bigger than revenue, as it includes investments", explain: "Profit is what remains of revenue after costs, so it is smaller." },
        { id: "d", text: "Revenue includes tax refunds only", explain: "Revenue is income from selling goods and services." },
      ],
    },
    {
      id: "q2",
      prompt: "A company has a net profit of 10 million dollars and 5 million shares. What is its EPS?",
      correct: "c",
      options: [
        { id: "a", text: "$0.50", explain: "That divides shares by profit." },
        { id: "b", text: "$5", explain: "That is the number of shares in millions." },
        { id: "c", text: "$2", explain: "Correct. 10 million ÷ 5 million = 2 dollars." },
        { id: "d", text: "$50", explain: "That multiplies instead of dividing." },
      ],
    },
    {
      id: "q3",
      prompt: "When is a P/E ratio not meaningful?",
      correct: "d",
      options: [
        { id: "a", text: "When the share price is above 100 dollars", explain: "The price level does not make P/E meaningless." },
        { id: "b", text: "When the company pays a dividend", explain: "Dividends do not affect whether P/E can be calculated." },
        { id: "c", text: "When the company is in the technology sector", explain: "Any sector can have a P/E." },
        { id: "d", text: "When the company is making a loss", explain: "Correct. With zero or negative EPS the ratio has no useful meaning." },
      ],
    },
    {
      id: "q4",
      prompt: "A company beats the consensus estimate but cuts its guidance. The share falls. What is the most likely reason?",
      correct: "b",
      options: [
        { id: "a", text: "The beat was reported incorrectly", explain: "The result can be accurate and the share still fall." },
        { id: "b", text: "Investors care more about the weaker outlook", explain: "Correct. Prices reflect expectations about the future." },
        { id: "c", text: "Shares always fall on earnings day", explain: "Reactions go both ways." },
        { id: "d", text: "Beating forecasts is against exchange rules", explain: "There is no such rule." },
      ],
    },
    {
      id: "q5",
      prompt: "What is a consensus estimate?",
      correct: "a",
      options: [
        { id: "a", text: "The average of analysts' forecasts", explain: "Correct. Results are compared against it." },
        { id: "b", text: "The company's guaranteed result", explain: "Nothing about future results is guaranteed." },
        { id: "c", text: "A vote by shareholders on the share price", explain: "Shareholders do not vote on the price." },
        { id: "d", text: "The exchange's official forecast for the company", explain: "Exchanges do not forecast company results." },
      ],
    },
    {
      id: "q6",
      prompt: "Why can a stop-loss fail to protect a short-term trade held through an earnings release?",
      correct: "c",
      options: [
        { id: "a", text: "Stops are cancelled on earnings days by law", explain: "There is no such law." },
        { id: "b", text: "Earnings only affect long-term investors", explain: "Results can move prices sharply the next session." },
        { id: "c", text: "The price can gap past the stop", explain: "Correct. Results usually come out outside trading hours, and the next price can be far away." },
        { id: "d", text: "Stops only work on indices", explain: "Stops work on shares too; gaps are the problem." },
      ],
    },
  ],
  practical: {
    title: "Read one real results release",
    instructions: "Pick a large company you know. Its investor relations page (search \"[company] investor relations\") publishes results free.",
    steps: [
      "Find the latest revenue, net profit and EPS, and whether profit was up or down on a year ago.",
      "Find any guidance for the next period.",
      "On a free finance site, look at how the share moved on the day after the release.",
    ],
    reflectionPrompt: "Did the share react the way the headline numbers suggested? What else in the release might explain the move?",
  },
  glossary: ["earnings-season", "revenue", "net-profit", "profit-margin", "eps", "pe-ratio", "consensus-estimate", "earnings-surprise", "guidance"],
  next: "si-sectors",
};

export const SI3_SECTORS: Lesson = {
  id: "si-sectors",
  trackId: T,
  order: 3,
  title: "Sectors and market capitalisation",
  summary: "Grouping companies by what they do and by how big they are, and why both matter.",
  minutes: 14,
  objectives: [
    "Name the main stock market sectors and give an example of each.",
    "Explain cyclical and defensive sectors.",
    "Calculate market capitalisation and place a company in a rough size group.",
    "Explain why share price alone says nothing about a company's size.",
  ],
  sections: [
    {
      id: "sectors",
      heading: "Sectors: what a company does",
      blocks: [
        { kind: "p", text: "Companies are grouped into a [[sector]] by their main business, so that investors can compare like with like. The most widely used system is [[gics|GICS]], created by MSCI and S&P Dow Jones Indices. It has 11 sectors:" },
        { kind: "list", items: [
          "Information technology, communication services, consumer discretionary (things people want but can delay, such as cars and holidays), consumer staples (everyday needs such as food), health care, financials, industrials, energy, materials, utilities and real estate.",
        ] },
        { kind: "p", text: "Companies in one sector often react to the same news. Higher oil prices tend to help energy producers and hurt airlines; higher interest rates affect banks and property companies in particular." },
      ],
    },
    {
      id: "cyclical-defensive",
      heading: "Cyclical and defensive",
      blocks: [
        { kind: "p", text: "[[cyclical|Cyclical]] sectors, such as consumer discretionary, industrials and materials, tend to do better when the economy is growing and worse in a slowdown, because their customers can delay spending." },
        { kind: "p", text: "[[defensive|Defensive]] sectors, such as consumer staples, utilities and health care, sell things people keep buying in bad times, so their profits tend to be steadier. Defensive does not mean safe: their shares can still fall a lot." },
      ],
    },
    {
      id: "market-cap",
      heading: "Size: market capitalisation",
      blocks: [
        { kind: "p", text: "Market Foundations defined [[market-cap|market capitalisation]]: share price × number of shares. It is the market's current price tag for the whole company, and it changes whenever the share price does." },
        { kind: "interactive", widget: "si-cap-bubbles", title: "Market value bubbles", caption: "Fictional companies with made-up figures. Bubble area is proportional to market cap. Size labels use common rule-of-thumb cut-offs that differ between providers." },
        { kind: "list", items: [
          "[[large-cap|Large-cap]]: roughly 10 billion dollars and above. The very biggest are sometimes called mega-caps.",
          "[[mid-cap|Mid-cap]]: roughly 2 to 10 billion dollars.",
          "[[small-cap|Small-cap]]: roughly 300 million to 2 billion dollars; below that, micro-cap.",
        ] },
        { kind: "p", text: "These cut-offs are conventions, not rules, and index providers use their own. Smaller companies tend to have thinner trading, wider spreads and bigger price swings than large ones." },
      ],
    },
    {
      id: "price-is-not-size",
      heading: "A high price does not mean a big company",
      blocks: [
        { kind: "p", text: "A 500-dollar share is not \"more expensive\" than a 20-dollar share in any useful sense. What matters is the price compared with what you get: the company's profits, assets and prospects per share. Two companies with the same market cap can have very different share prices simply because one has issued more shares." },
        { kind: "callout", tone: "info", title: "Concentration", text: "In many markets a handful of very large companies make up a big share of the total market value. That is why a few names can move a whole cap-weighted index, as the next lesson shows." },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "ex-si-cap-size",
    title: "Large, mid or small?",
    prompt: "Work out each fictional company's market cap (price × shares) and sort it using the rough cut-offs from this lesson: large ≥ $10bn, mid $2bn–$10bn, small $300m–$2bn.",
    categories: [
      { id: "large", label: "Large-cap" },
      { id: "mid", label: "Mid-cap" },
      { id: "small", label: "Small-cap" },
    ],
    items: [
      { id: "c1", text: "$50 × 2 billion shares", category: "large", explain: "$100bn: well above $10bn." },
      { id: "c2", text: "$400 × 30 million shares", category: "large", explain: "$12bn: a high price with few shares, still large." },
      { id: "c3", text: "$25 × 200 million shares", category: "mid", explain: "$5bn: between $2bn and $10bn." },
      { id: "c4", text: "$120 × 40 million shares", category: "mid", explain: "$4.8bn: mid-cap despite a high share price." },
      { id: "c5", text: "$8 × 100 million shares", category: "small", explain: "$800m: between $300m and $2bn." },
      { id: "c6", text: "$3 × 500 million shares", category: "small", explain: "$1.5bn: a low price, but many shares." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "Which sector is usually described as defensive?",
      correct: "b",
      options: [
        { id: "a", text: "Consumer discretionary", explain: "Spending on cars, holidays and luxuries can be delayed, so it is cyclical." },
        { id: "b", text: "Consumer staples", explain: "Correct. People keep buying food and household basics in bad times." },
        { id: "c", text: "Materials", explain: "Demand for raw materials rises and falls with the economy." },
        { id: "d", text: "Industrials", explain: "Usually treated as cyclical." },
      ],
    },
    {
      id: "q2",
      prompt: "A company's share price is $40 and it has 500 million shares. What is its market cap?",
      correct: "d",
      options: [
        { id: "a", text: "$540 million", explain: "Price and shares are multiplied, not added." },
        { id: "b", text: "$12.5 million", explain: "That divides shares by price." },
        { id: "c", text: "$2 billion", explain: "That is $4 × 500 million." },
        { id: "d", text: "$20 billion", explain: "Correct. 40 × 500 million = 20 billion." },
      ],
    },
    {
      id: "q3",
      prompt: "Company A's shares cost $500 and company B's cost $20. What can you conclude about their size?",
      correct: "c",
      options: [
        { id: "a", text: "A is 25 times bigger than B", explain: "That ignores how many shares each has." },
        { id: "b", text: "B is cheaper, so it is a better buy", explain: "Price per share alone says nothing about value." },
        { id: "c", text: "Nothing, without the number of shares", explain: "Correct. Size is price × shares." },
        { id: "d", text: "A must be in the technology sector", explain: "Share price does not tell you the sector." },
      ],
    },
    {
      id: "q4",
      prompt: "Why do traders pay attention to which sector a company is in?",
      correct: "a",
      options: [
        { id: "a", text: "Companies in a sector often react to the same news", explain: "Correct. Oil prices, interest rates and consumer spending hit sectors in different ways." },
        { id: "b", text: "Each sector has its own separate stock exchange and trading hours", explain: "Sectors are categories, not exchanges." },
        { id: "c", text: "Sector decides the share price by law", explain: "Prices are set by trading." },
        { id: "d", text: "Only one sector can rise at a time", explain: "Many sectors can rise or fall together." },
      ],
    },
    {
      id: "q5",
      prompt: "What is generally true of small-cap shares compared with large-caps?",
      correct: "b",
      options: [
        { id: "a", text: "They always grow faster", explain: "Some do, many do not. Nothing is guaranteed." },
        { id: "b", text: "Thinner trading, wider spreads, bigger swings", explain: "Correct, as a general tendency." },
        { id: "c", text: "They cannot be bought by individuals", explain: "They can, through most brokers." },
        { id: "d", text: "They never pay dividends", explain: "Some do." },
      ],
    },
  ],
  practical: {
    title: "Classify five companies",
    instructions: "Use a free finance website that shows each company's sector and market cap.",
    steps: [
      "Choose five companies you have heard of from different industries.",
      "Write down each one's sector and market cap, and label it large, mid or small using this lesson's rough cut-offs.",
      "Mark each sector as cyclical or defensive.",
    ],
    reflectionPrompt: "Were any companies bigger or smaller than you expected from their share price or their fame?",
  },
  glossary: ["sector", "gics", "cyclical", "defensive", "large-cap", "mid-cap", "small-cap"],
  next: "si-index-calc",
};

export const SI4_INDEX_CALC: Lesson = {
  id: "si-index-calc",
  trackId: T,
  order: 4,
  title: "How indices are calculated",
  summary: "Price-weighted, cap-weighted and equal-weighted indices, free float and the divisor.",
  minutes: 18,
  objectives: [
    "Calculate a price-weighted, a cap-weighted and an equal-weighted index move.",
    "Explain free float and why big indices adjust for it.",
    "Describe how the Dow, the S&P 500 and the Nasdaq-100 are weighted.",
    "Explain what the divisor does and why indices are rebalanced.",
  ],
  sections: [
    {
      id: "three-ways",
      heading: "Three ways to combine prices",
      blocks: [
        { kind: "p", text: "Market Foundations introduced the [[index]] and its [[weighting]]. Now we will calculate them. Every index answers one question: when the members move, how much does each one count?" },
        { kind: "list", items: [
          "[[price-weighted|Price-weighted]]: add up the share prices and divide by a fixed number. A 1-dollar move counts the same in any member, so the highest-priced shares count most.",
          "[[cap-weighted|Market-cap-weighted]]: each member counts in proportion to its market value. The biggest companies count most.",
          "[[equal-weighted|Equal-weighted]]: every member counts the same, so the index move is the average of the members' percentage moves.",
        ] },
        { kind: "interactive", widget: "si-index-builder", title: "Index builder", caption: "Four fictional companies with made-up prices, share counts and float. The cap option is a simplified version of how capped indices limit their biggest members." },
      ],
    },
    {
      id: "free-float",
      heading: "Free float",
      blocks: [
        { kind: "p", text: "Not all of a company's shares are available to ordinary investors. Founders, governments or other companies may hold large blocks they rarely sell. The shares that do trade freely are the [[free-float|free float]]." },
        { kind: "p", text: "Most big cap-weighted indices count only the free float. If 40% of a company is locked up with a founder, only 60% of its market cap counts towards its weight. This keeps the index closer to what investors can actually buy." },
      ],
    },
    {
      id: "famous-methods",
      heading: "How the famous indices do it",
      blocks: [
        { kind: "list", items: [
          "Dow Jones Industrial Average: 30 large US companies, price-weighted. A company with a high share price moves it more than a bigger company with a lower price.",
          "S&P 500: about 500 large US companies chosen by a committee against published rules, weighted by float-adjusted market cap.",
          "Nasdaq-100: 100 of the largest non-financial companies listed on Nasdaq, using a \"modified\" market-cap method. Its rules limit how much weight the biggest members can have, and it is rebalanced when they get too large.",
        ] },
        { kind: "p", text: "Equal-weighted versions of big indices also exist, such as an equal-weight S&P 500. Because small members count as much as giants, they can behave quite differently from the standard version." },
      ],
    },
    {
      id: "divisor-rebalancing",
      heading: "The divisor and rebalancing",
      blocks: [
        { kind: "p", text: "An index level is a sum divided by an [[index-divisor|index divisor]]. When something happens that should not move the index, such as a member being replaced or a price-weighted member splitting its shares, the provider changes the divisor so the level stays the same." },
        { kind: "p", text: "Index providers also review their members on a schedule, adding and removing companies and resetting weights where the rules require it. This is [[rebalancing]]. Funds that track the index must then buy and sell the same shares, which can cause heavy trading on rebalancing days." },
        { kind: "callout", tone: "info", title: "Concentration risk", text: "In a cap-weighted index, a rising company becomes a bigger weight, which can leave the index dominated by a few names. A broad-sounding index can then be less diversified than it looks. Capped and equal-weighted methods exist partly to limit this." },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "ex-si-price-weighted",
    title: "A price-weighted move",
    prompt: "A fictional price-weighted index has three members priced $10, $50 and $140. One day only the $140 share rises by 10% and the others do not move. By what percentage does the index rise?",
    unit: "%",
    answer: 7,
    tolerance: 0.01,
    hint: "In a price-weighted index, compare the sum of prices before and after. The divisor cancels out.",
    solution: "Before: 10 + 50 + 140 = 200. After: 10 + 50 + 154 = 214. Change = 14 ÷ 200 = 7%. A 10% move in the $10 share would only have moved it 0.5%.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "In a price-weighted index, which member has the most influence?",
      correct: "d",
      options: [
        { id: "a", text: "The one with the biggest market value", explain: "That is true of a cap-weighted index." },
        { id: "b", text: "The one with the most employees", explain: "Employees play no part in index weights." },
        { id: "c", text: "All members equally", explain: "That is an equal-weighted index." },
        { id: "d", text: "The one with the highest share price", explain: "Correct. A $1 move counts the same in any member, so high prices dominate." },
      ],
    },
    {
      id: "q2",
      prompt: "How is the S&P 500 weighted?",
      correct: "b",
      options: [
        { id: "a", text: "By share price, like the Dow", explain: "The Dow is price-weighted; the S&P 500 is not." },
        { id: "b", text: "By float-adjusted market capitalisation", explain: "Correct." },
        { id: "c", text: "Every company is exactly 0.2%", explain: "That would be equal weighting; the standard S&P 500 is cap-weighted." },
        { id: "d", text: "By how many people own each share", explain: "Weights come from market value, not the number of owners." },
      ],
    },
    {
      id: "q3",
      prompt: "A company's founder holds 30% of its shares and rarely sells. How does a float-adjusted index treat the company?",
      correct: "a",
      options: [
        { id: "a", text: "It counts about 70% of its market cap", explain: "Correct. Only freely tradable shares count." },
        { id: "b", text: "It removes the company from the index", explain: "Locked-up shares reduce the weight; they do not usually exclude the company." },
        { id: "c", text: "It counts the founder's shares twice", explain: "That would make no sense; the point is to count fewer." },
        { id: "d", text: "Float makes no difference to weights", explain: "In a float-adjusted index it does." },
      ],
    },
    {
      id: "q4",
      prompt: "An equal-weighted index has three members that move +6%, −3% and 0%. What is the index move?",
      correct: "c",
      options: [
        { id: "a", text: "+3%", explain: "That adds the moves without dividing by three." },
        { id: "b", text: "+6%", explain: "That is only the best member." },
        { id: "c", text: "+1%", explain: "Correct. (6 − 3 + 0) ÷ 3 = 1." },
        { id: "d", text: "−1%", explain: "Check the sign: 6 − 3 is positive." },
      ],
    },
    {
      id: "q5",
      prompt: "A member of a price-weighted index splits its shares. Why does the index level not jump?",
      correct: "b",
      options: [
        { id: "a", text: "Splits are not allowed for index members", explain: "Index members split their shares from time to time." },
        { id: "b", text: "The provider adjusts the divisor", explain: "Correct. The divisor is changed so the level stays continuous." },
        { id: "c", text: "The index is closed for a week", explain: "Indices keep being calculated." },
        { id: "d", text: "All other members split too", explain: "Other members are not affected." },
      ],
    },
    {
      id: "q6",
      prompt: "Why does the Nasdaq-100 use a modified market-cap method?",
      correct: "d",
      options: [
        { id: "a", text: "To make every member exactly equal", explain: "It stays cap-based, just with limits." },
        { id: "b", text: "To include only financial companies", explain: "It excludes financial companies." },
        { id: "c", text: "To follow share prices like the Dow", explain: "It is not price-weighted." },
        { id: "d", text: "To limit how heavy its biggest members get", explain: "Correct. Its rules cap the weight of the largest companies." },
      ],
    },
  ],
  practical: {
    title: "Check an index's top weights",
    instructions: "Index providers (S&P Dow Jones Indices, Nasdaq, FTSE Russell) and fund factsheets publish the largest members and their weights.",
    steps: [
      "Find the top 10 members of the S&P 500 or Nasdaq-100 and add up their weights.",
      "Find the share price of the highest-weighted member of the Dow and compare it with its market cap rank.",
      "Write one sentence on how concentrated the index you chose is.",
    ],
    reflectionPrompt: "Would you call the index you looked at well diversified? What would change your answer?",
  },
  glossary: ["price-weighted", "cap-weighted", "equal-weighted", "free-float", "index-divisor", "rebalancing"],
  next: "si-funds",
};

export const SI5_FUNDS: Lesson = {
  id: "si-funds",
  trackId: T,
  order: 5,
  title: "Index funds, ETFs and index futures",
  summary: "Three ways to follow an index: what each one is, what it costs and where the risks hide.",
  minutes: 18,
  objectives: [
    "Explain how an index fund follows an index and what NAV is.",
    "Describe how ETFs differ from traditional mutual funds.",
    "Explain expense ratios, tracking difference and tracking error.",
    "Explain how index futures work, including multipliers, margin, daily settlement and expiry.",
  ],
  sections: [
    {
      id: "index-funds",
      heading: "Index funds and NAV",
      blocks: [
        { kind: "p", text: "Market Foundations explained that an index cannot be bought directly. An [[index-fund|index fund]] solves that by holding the index's members, usually in the same weights. Your money is pooled with other investors' and you own units of the fund." },
        { kind: "p", text: "The value of one unit is its [[nav|NAV]] (net asset value): the value of everything the fund holds, plus cash, minus what it owes, divided by the number of units." },
        { kind: "interactive", widget: "si-etf-basket", title: "Inside a fund", caption: "A fictional fund holding four fictional shares. Fees are shown with no growth assumed, because the lesson does not predict returns." },
      ],
    },
    {
      id: "etf-vs-mutual",
      heading: "ETFs versus mutual funds",
      blocks: [
        { kind: "list", items: [
          "A traditional [[mutual-fund|mutual fund]] (in the UK, often called an open-ended investment company or a unit trust) is bought from and sold back to the fund itself, usually once a day at that day's NAV.",
          "An [[etf|ETF]] trades on a stock exchange throughout the day, like a share, through any broker. You pay the spread and the market price, which can sit slightly above or below NAV.",
          "Large firms called [[authorised-participant|authorised participants]] can create new ETF units or redeem existing ones in big blocks. If the price drifts away from NAV, doing this is profitable, which pulls the price back. For large ETFs the gap is usually tiny; in stressed or thin markets it can widen.",
        ] },
        { kind: "p", text: "Both kinds can be index funds. Some ETFs are not: they may follow an active strategy, a single commodity or a leveraged multiple of an index, which behave very differently." },
      ],
    },
    {
      id: "costs-tracking",
      heading: "Fees and tracking",
      blocks: [
        { kind: "p", text: "Funds charge a yearly fee, the [[expense-ratio|expense ratio]] (also called the ongoing charge), as a percentage of what you hold. It is taken from the fund, so you never see a bill." },
        { kind: "p", text: "Because of fees, cash holdings and trading costs, a fund never matches its index exactly. The gap in return over a period is the tracking difference; how much that gap wobbles from period to period is the [[tracking-error|tracking error]]. Small, steady gaps are a sign of a well-run index fund." },
      ],
    },
    {
      id: "futures",
      heading: "Index futures",
      blocks: [
        { kind: "p", text: "An index [[futures|futures contract]] is an exchange-traded agreement whose value moves with an index. It does not hold any shares. Instead, each contract has a [[contract-multiplier|contract multiplier]]: for example, the CME's E-mini S&P 500 is worth 50 dollars for every index point, and the Micro E-mini 5 dollars." },
        { kind: "list", items: [
          "You post [[margin]] with your broker, a fraction of the contract's full value, so futures are leveraged.",
          "Gains and losses are settled every day: [[mark-to-market]]. If your account falls below the maintenance margin (the minimum you must keep while the position is open, set a little below the margin needed to open it), you must add money or the position is closed.",
          "Each contract has an [[expiry-date|expiry date]]. Major US index futures expire quarterly, in March, June, September and December, and are settled in cash. Traders who want to stay in \"roll\" to the next contract before expiry.",
        ] },
        { kind: "interactive", widget: "si-futures", title: "Futures exposure and leverage", caption: "A sample index level and margin, not current market figures. Multipliers match the standard and micro contract styles described above." },
        { kind: "callout", tone: "warn", title: "Same leverage trap as forex", text: "A futures position can lose more than the margin posted. The leverage warnings from the forex track apply here too.", link: { lessonId: "fx-leverage-margin", label: "Review leverage, margin and margin calls" } },
      ],
    },
  ],
  exercise: {
    kind: "match",
    id: "ex-si-fund-types",
    title: "Match the product to its feature",
    prompt: "Match each term to the description that fits it best.",
    pairs: [
      { id: "f1", left: "Mutual fund", right: "Bought from the fund, usually once a day at NAV" },
      { id: "f2", left: "ETF", right: "Trades on an exchange throughout the day" },
      { id: "f3", left: "Index future", right: "Leveraged contract with an expiry date" },
      { id: "f4", left: "Expense ratio", right: "Yearly fee as a percentage of what you hold" },
      { id: "f5", left: "Tracking error", right: "How much a fund's returns wander around its index" },
    ],
    explanation: "Funds hold the index's shares and differ mainly in how you buy them. Futures follow the index without holding it, with leverage and expiry.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "A fund holds $1,000,000 of shares and $10,000 of cash, owes nothing, and has 10,000 units. What is its NAV per unit?",
      correct: "c",
      options: [
        { id: "a", text: "$100", explain: "That leaves out the cash." },
        { id: "b", text: "$1,010", explain: "That is the total in thousands, not per unit." },
        { id: "c", text: "$101", explain: "Correct. 1,010,000 ÷ 10,000 = 101." },
        { id: "d", text: "$10", explain: "Divide the total value by the number of units." },
      ],
    },
    {
      id: "q2",
      prompt: "What is a key difference between an ETF and a traditional mutual fund?",
      correct: "a",
      options: [
        { id: "a", text: "An ETF trades on an exchange all day", explain: "Correct. A mutual fund is usually dealt once a day at NAV." },
        { id: "b", text: "Only mutual funds can follow an index", explain: "Many ETFs are index funds." },
        { id: "c", text: "ETFs never charge fees", explain: "ETFs have expense ratios too." },
        { id: "d", text: "Mutual funds trade 24 hours a day", explain: "They are usually priced once per day." },
      ],
    },
    {
      id: "q3",
      prompt: "Why does an index fund's return usually trail its index slightly?",
      correct: "d",
      options: [
        { id: "a", text: "The fund buys different companies on purpose", explain: "An index fund aims to hold the same companies." },
        { id: "b", text: "Indices are calculated incorrectly", explain: "The index is the benchmark; the fund is what differs." },
        { id: "c", text: "The fund pays the index provider for each share", explain: "Licence fees exist but are part of overall costs, not per share." },
        { id: "d", text: "Fees, cash and trading costs", explain: "Correct. The index has no costs; the fund does." },
      ],
    },
    {
      id: "q4",
      prompt: "An index futures contract is worth $50 per point. The index rises 20 points. What is the profit on one long contract?",
      correct: "b",
      options: [
        { id: "a", text: "$20", explain: "Multiply the points by the multiplier." },
        { id: "b", text: "$1,000", explain: "Correct. 20 × 50 = 1,000 dollars." },
        { id: "c", text: "$70", explain: "That adds instead of multiplying." },
        { id: "d", text: "Nothing until the contract expires", explain: "Futures are settled daily (marked to market)." },
      ],
    },
    {
      id: "q5",
      prompt: "What happens with index futures as the expiry date approaches?",
      correct: "c",
      options: [
        { id: "a", text: "The contract automatically turns into shares of every member", explain: "Major index futures are settled in cash." },
        { id: "b", text: "Nothing, because futures last forever", explain: "Each contract has an expiry date." },
        { id: "c", text: "It settles; holders can roll to the next contract", explain: "Correct. Rolling means closing this one and opening a later one." },
        { id: "d", text: "The margin is refunded with interest", explain: "Margin is returned only after gains or losses are settled." },
      ],
    },
    {
      id: "q6",
      prompt: "What do authorised participants do for an ETF?",
      correct: "a",
      options: [
        { id: "a", text: "Create and redeem units, keeping the price near NAV", explain: "Correct." },
        { id: "b", text: "Pick which companies the ETF buys", explain: "For an index ETF, the index rules decide that." },
        { id: "c", text: "Guarantee every investor in the fund against losses on any day", explain: "No one guarantees against losses." },
        { id: "d", text: "Set the ETF's expense ratio each day", explain: "The fund company sets fees." },
      ],
    },
  ],
  practical: {
    title: "Read an ETF factsheet",
    instructions: "Find the factsheet of a large ETF that tracks a broad index (fund companies publish them free). Do not buy anything.",
    steps: [
      "Write down the index it tracks, its expense ratio and its number of holdings.",
      "Find its tracking difference or its return compared with the index, if shown.",
      "Note whether it holds the shares directly (physical) or is synthetic: it holds other assets and gets the index return from a contract with a bank, which adds the risk that the bank fails to pay.",
    ],
    reflectionPrompt: "What was one thing on the factsheet you did not understand yet? Where could you find out?",
  },
  glossary: ["nav", "mutual-fund", "authorised-participant", "expense-ratio", "tracking-error", "contract-multiplier", "mark-to-market", "expiry-date"],
  next: "si-dividends-actions",
};

export const SI6_DIVIDENDS_ACTIONS: Lesson = {
  id: "si-dividends-actions",
  trackId: T,
  order: 6,
  title: "Dividends, splits and buybacks",
  summary: "What happens to prices and your holding when a company pays out, splits or buys back shares.",
  minutes: 15,
  objectives: [
    "Describe the dividend timeline and why the price usually drops on the ex-dividend date.",
    "Calculate a dividend yield and explain why a high yield can be a warning sign.",
    "Explain why a share split does not change what you own.",
    "Explain how a buyback changes earnings per share.",
  ],
  sections: [
    {
      id: "dividend-timeline",
      heading: "How a dividend is paid",
      blocks: [
        { kind: "p", text: "A [[dividend]] is cash a company pays its shareholders. A [[corporate-action|corporate action]] like this follows a timeline:" },
        { kind: "list", ordered: true, items: [
          "The board announces the dividend, its amount and its dates.",
          "On the [[ex-dividend-date|ex-dividend date]] the share starts trading without the right to that dividend. Buy on or after this day and you do not get it.",
          "The company checks its list of shareholders on the record date. (In the US, where trades settle in one day, this is now usually the same day as the ex-date.)",
          "The cash arrives on the payment date, often a few weeks later.",
        ] },
        { kind: "p", text: "On the ex-date the price usually opens lower by roughly the dividend, because buyers no longer get it. Holders are not richer: part of the company's value has become cash in their account, and it may be taxed." },
      ],
    },
    {
      id: "yield",
      heading: "Dividend yield",
      blocks: [
        { kind: "p", text: "The [[dividend-yield|dividend yield]] = yearly dividends per share ÷ share price × 100. A 50-dollar share paying 2 dollars a year yields 4%." },
        { kind: "p", text: "A very high yield is often a warning, not a gift. If the share price has fallen because investors fear trouble, the yield rises automatically, and the dividend may then be cut. Dividends are never guaranteed." },
        { kind: "callout", tone: "info", title: "Price indices and total return", text: "Most headline indices, such as the S&P 500, are price indices: they ignore dividends. Total-return versions add dividends back in. Germany's DAX is a notable exception that is usually quoted as a total-return index. Over long periods the difference can be large." },
      ],
    },
    {
      id: "splits",
      heading: "Splits and reverse splits",
      blocks: [
        { kind: "p", text: "In a [[stock-split|stock split]], a company gives each shareholder more shares and the price falls in proportion. In a 2-for-1 split, 10 shares at 300 dollars become 20 shares at 150. Your holding is still worth 3,000 dollars, and the company is unchanged." },
        { kind: "p", text: "A [[reverse-split|reverse split]] does the opposite: 10 shares at 0.50 dollars might become 1 share at 5 dollars. Companies often do this after a long fall, sometimes to meet an exchange's minimum price rule." },
        { kind: "interactive", widget: "si-corporate-actions", title: "Split, dividend or buyback", caption: "Fictional share prices and company figures. Results ignore taxes, fees and all other news on the day." },
      ],
    },
    {
      id: "buybacks",
      heading: "Buybacks",
      blocks: [
        { kind: "p", text: "In a [[share-buyback|share buyback]], a company uses cash to buy its own shares in the market and usually cancels them. With profit unchanged, fewer shares means higher [[eps|EPS]], and each remaining shareholder owns a slightly bigger slice." },
        { kind: "p", text: "Buybacks are another way of returning cash to owners besides dividends. Whether one is good value depends on the price the company pays: buying back overpriced shares destroys value for the remaining owners." },
        { kind: "callout", tone: "warn", title: "Read the reason, not the headline", text: "A split, a big dividend or a buyback announcement can move a share on the day, but none of them changes how profitable the business is. Ask what the company could have done with the money instead." },
      ],
    },
  ],
  exercise: {
    kind: "order",
    id: "ex-si-dividend-timeline",
    title: "Put the dividend steps in order",
    prompt: "Put these steps in the order they happen for a typical dividend.",
    items: [
      { id: "earn", text: "The company earns a profit" },
      { id: "declare", text: "The board announces the dividend and its dates" },
      { id: "ex", text: "Ex-dividend date: new buyers no longer get this dividend" },
      { id: "pay", text: "Payment date: cash arrives in shareholders' accounts" },
    ],
    explanation: "Profit comes first, then the announcement, then the ex-dividend date (when the price usually drops by about the dividend), and the cash is paid last.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "A share closes at $40 the day before its ex-dividend date. The dividend is $1. Ignoring all other news, where is it likely to open?",
      correct: "b",
      options: [
        { id: "a", text: "Around $41", explain: "The price does not rise by the dividend; value leaves the share." },
        { id: "b", text: "Around $39", explain: "Correct. New buyers no longer get the $1." },
        { id: "c", text: "Exactly $40", explain: "The share is now worth less to buyers, because the dividend is gone." },
        { id: "d", text: "Around $20", explain: "That would be a 2-for-1 split, not a dividend." },
      ],
    },
    {
      id: "q2",
      prompt: "A $25 share pays $0.25 every quarter. What is its yearly dividend yield?",
      correct: "d",
      options: [
        { id: "a", text: "1%", explain: "That uses only one quarter's dividend." },
        { id: "b", text: "25%", explain: "That divides the wrong way." },
        { id: "c", text: "0.25%", explain: "The dividend is in dollars, not percent." },
        { id: "d", text: "4%", explain: "Correct. $1 a year ÷ $25 = 4%." },
      ],
    },
    {
      id: "q3",
      prompt: "You own 10 shares at $300. The company does a 3-for-1 split. What do you own afterwards?",
      correct: "a",
      options: [
        { id: "a", text: "30 shares at about $100", explain: "Correct. Still about $3,000." },
        { id: "b", text: "30 shares at $300", explain: "That would triple your money from nothing." },
        { id: "c", text: "10 shares at $100", explain: "You would lose two-thirds of your value." },
        { id: "d", text: "3 shares at $1,000", explain: "That describes a reverse split." },
      ],
    },
    {
      id: "q4",
      prompt: "A company's profit stays the same and it buys back and cancels 10% of its shares. What happens to EPS?",
      correct: "c",
      options: [
        { id: "a", text: "It falls by 10%", explain: "Fewer shares share the same profit, so EPS rises." },
        { id: "b", text: "It stays the same", explain: "The number of shares in the calculation has changed." },
        { id: "c", text: "It rises by about 11%", explain: "Correct. Profit ÷ 0.9 of the shares = 1.11 × the old EPS." },
        { id: "d", text: "It doubles", explain: "Only cancelling half the shares would do that." },
      ],
    },
    {
      id: "q5",
      prompt: "A share's dividend yield has jumped to 12% because its price fell sharply. What is the most careful reading?",
      correct: "b",
      options: [
        { id: "a", text: "It is a bargain that guarantees 12% every year", explain: "Dividends are never guaranteed." },
        { id: "b", text: "Investors may expect the dividend to be cut", explain: "Correct. A high yield can signal trouble." },
        { id: "c", text: "The company has doubled its profits", explain: "The yield rose because the price fell, not because profits rose." },
        { id: "d", text: "Yield has no connection to the share price", explain: "Yield is dividend ÷ price, so price falls push it up." },
      ],
    },
  ],
  practical: {
    title: "Follow one dividend",
    instructions: "Pick a large company that pays dividends. Its investor relations page or a free finance site lists its dividend history and dates.",
    steps: [
      "Find the amount and the ex-dividend and payment dates of its latest dividend.",
      "Look at the share's price change on the ex-dividend date and compare it with the dividend.",
      "Work out its yearly dividend yield at today's price.",
    ],
    reflectionPrompt: "Did the price drop by about the dividend on the ex-date? If not, what else might have been going on that day?",
  },
  glossary: ["corporate-action", "ex-dividend-date", "dividend-yield", "stock-split", "reverse-split", "share-buyback"],
  next: "cy-blockchains",
};
