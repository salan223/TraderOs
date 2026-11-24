import type { ConceptRemediation, TrackAssessment } from "../types";

/*
  Track 3 assessment: Stocks and Indices.
  Companies, prices and order books are fictional examples, not market data.
  Futures leverage is safety-critical.
*/

const T = "stocks-indices";

const BASE: TrackAssessment = {
  trackId: T,
  intro:
    "One question for each key idea from the six lessons, with calculations and an applied scenario. You need 90% or more, every safety-critical question right (leveraged index futures) and a sound decision in the scenario.",
  concepts: [
    {
      id: "si-primary-secondary",
      title: "Primary and secondary markets",
      lessonIds: ["si-exchanges"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Many people think buying a share puts money into the company. That only happens when the company sells new shares, as in an IPO. Everyday trading is between investors.",
        altExplanation: "There are two markets for the same shares. In the [[primary-market|primary market]] the company sells new shares and receives the cash. In the [[secondary-market|secondary market]], where nearly all trading happens, investors buy from and sell to each other; the company receives nothing.",
        altExample: "A band sells concert tickets: that is the primary market, and the band gets the money. Fans later resell tickets to each other: that is the secondary market, and the band gets nothing from those sales.",
        practice: {
          kind: "true-false",
          statement: "When you buy shares of a large listed company through your broker today, the money usually goes to the company.",
          answer: false,
          explain: "False. You are buying from another investor in the secondary market. The company only receives money when it sells new shares.",
        },
      },
      flashcard: { front: "Primary vs secondary market", back: "Primary: the company sells new shares and gets the cash. Secondary: investors trade with each other." },
    },
    {
      id: "si-order-book",
      title: "Order books, market and limit orders",
      lessonIds: ["si-exchanges"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "It is easy to assume a market order fills entirely at the best price shown. A big order walks up the book through worse prices, and a limit order below the best ask simply waits.",
        altExplanation: "Read the ask side of an [[order-book|order book]] as a staircase. A market buy takes the bottom step first, then the next one up, until it is filled, so the average price rises with size. A limit buy below the bottom step does not climb at all: it waits in the book until a seller comes down to it, and may never fill.",
        altExample: "Asks: 50 at $10.00, 50 at $10.10. A market buy of 100 pays 50 × 10.00 + 50 × 10.10 = $1,005, an average of $10.05, not $10.00.",
        practice: {
          kind: "numeric",
          prompt: "The ask side shows 200 shares at $30.00 and 300 at $30.10. You send a market order to buy 400 shares. What average price do you pay per share? Give 3 decimal places.",
          unit: "US dollars",
          answer: 30.05,
          tolerance: 0.001,
          explain: "200 × 30.00 + 200 × 30.10 = 6,000 + 6,020 = 12,020. 12,020 ÷ 400 = $30.050.",
        },
      },
      flashcard: { front: "Market vs limit order", back: "Market: fills now, walking up the book if needed. Limit: only at your price or better, so it may never fill." },
    },
    {
      id: "si-earnings",
      title: "Revenue, profit, EPS and P/E",
      lessonIds: ["si-earnings"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Common slips: dividing the price by total profit instead of profit per share, and quoting a P/E for a company that made a loss.",
        altExplanation: "Go in two steps. First [[eps|earnings per share]] = yearly net profit ÷ number of shares. Then the [[pe-ratio|P/E]] = share price ÷ EPS: how many years of today's profit you pay for. If profit is negative, there is no meaningful P/E.",
        altExample: "A company earns $10 million a year and has 5 million shares: EPS = $2. At a share price of $30, the P/E is 15. If it had lost $10 million, EPS would be −$2 and the P/E would be meaningless.",
        practice: {
          kind: "numeric",
          prompt: "A company's yearly net profit is $40 million and it has 20 million shares. The share price is $50. What is its P/E ratio?",
          unit: "times earnings",
          answer: 25,
          tolerance: 0.01,
          explain: "EPS = 40 ÷ 20 = $2. P/E = 50 ÷ 2 = 25.",
        },
      },
      flashcard: { front: "P/E ratio", back: "Share price ÷ yearly earnings per share. Not meaningful when earnings are negative." },
    },
    {
      id: "si-expectations",
      title: "Expectations, guidance and surprises",
      lessonIds: ["si-earnings"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "\"The company beat forecasts, so the shares go up\" is the trap. A share price reflects expected future profits, so guidance and expectations matter as much as the last quarter.",
        altExplanation: "Score results against three yardsticks: the published [[consensus-estimate|consensus]], what investors privately hoped for (often shown by a big rise before results), and the company's [[guidance]] for the future. A beat on the past with a cut to the future can lower the value of the shares.",
        altExample: "A shop has a record Christmas but warns that next year's rent will double. Its past quarter was great; its future profits just got smaller. Buyers of the business care about the future.",
        practice: {
          kind: "single",
          prompt: "A company's profit matched the consensus exactly, but its revenue shrank and most of the profit came from a one-off property sale. What is the most likely market reaction?",
          options: [
            { id: "b", text: "A fall is quite possible, because the quality of the result was poor", explain: "Right. Shrinking revenue and one-off gains are signs of weaker future profits." },
            { id: "a", text: "A strong rise, because the profit figure hit the consensus target exactly", explain: "The profit was hit using a one-off gain, so its quality was poor." },
            { id: "c", text: "No change is possible after a matched estimate", explain: "Prices can move a lot on the details behind a headline." },
            { id: "d", text: "The exchange halts the shares until next quarter", explain: "Exchanges do not halt shares for weak results." },
          ],
          correct: "b",
        },
      },
      flashcard: { front: "Guidance", back: "The company's own outlook. A beat on the past with weaker guidance can still send shares down." },
    },
    {
      id: "si-size",
      title: "Sectors and market capitalisation",
      lessonIds: ["si-sectors"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A high share price is often mistaken for a big company. Size is the share price times the number of shares.",
        altExplanation: "[[market-cap|Market capitalisation]] = share price × number of shares. A $1,000 share with 10 million shares ($10 billion) is smaller than a $20 share with 1 billion shares ($20 billion). Sectors group companies by what they do: [[cyclical]] ones swing with the economy; [[defensive]] ones sell things people keep buying.",
        altExample: "A pizza cut into 4 big slices is not bigger than one cut into 12 small ones because each slice is larger. You have to count the slices.",
        practice: {
          kind: "numeric",
          prompt: "A company has 2 billion shares priced at $15. What is its market capitalisation, in billions of dollars?",
          unit: "billion US dollars",
          answer: 30,
          tolerance: 0.01,
          explain: "2 billion × $15 = $30 billion.",
        },
      },
      flashcard: { front: "Market capitalisation", back: "Share price × number of shares. Price alone says nothing about a company's size." },
    },
    {
      id: "si-index-calc",
      title: "Price, cap and equal weighting; free float",
      lessonIds: ["si-index-calc"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "It is easy to apply the wrong recipe: a price-weighted index adds up share prices, a cap-weighted index follows market values (usually free-float), and an equal-weighted one averages percentage moves.",
        altExplanation: "Ask what each member contributes. [[price-weighted|Price-weighted]]: its share price, so a $300 share moves the index more than a $30 one. [[cap-weighted|Cap-weighted]]: its market value, counting only the [[free-float|free float]] in most big indices. [[equal-weighted|Equal-weighted]]: the same slice each, so the index move is the average percentage move.",
        altExample: "Price-weighted index of two shares at $90 and $10 with divisor 2: (90 + 10) ÷ 2 = 50. If the $10 share doubles to $20, the index is (90 + 20) ÷ 2 = 55. If instead the $90 share rises just 11% to $100, the index also becomes 55.",
        practice: {
          kind: "numeric",
          prompt: "A price-weighted index holds three shares at $40, $30 and $20, with a divisor of 3. The $40 share rises to $49. What is the new index level?",
          unit: "index points",
          answer: 33,
          tolerance: 0.01,
          explain: "(49 + 30 + 20) ÷ 3 = 99 ÷ 3 = 33.",
        },
      },
      flashcard: { front: "Free float", back: "Shares available to ordinary investors. Big cap-weighted indices weight by free float, not total shares." },
    },
    {
      id: "si-funds",
      title: "Index funds and ETFs",
      lessonIds: ["si-funds"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "ETFs and mutual funds are often treated as the same thing, and fees are ignored because no bill arrives. They are bought differently, and the [[expense-ratio|expense ratio]] is taken from the fund every year.",
        altExplanation: "A traditional [[mutual-fund|mutual fund]] is bought from and sold back to the fund, usually once a day at that day's [[nav|NAV]]. An [[etf|ETF]] trades on an exchange all day like a share, so you pay the spread and a market price close to NAV. Either can track an index; either charges a yearly fee taken from what you hold.",
        altExample: "On $10,000 a 0.10% fee is about $10 a year and a 1.00% fee about $100 a year. Over decades, and compounding, that gap grows into a large share of the result.",
        practice: {
          kind: "numeric",
          prompt: "You hold $15,000 in a fund with a 0.40% expense ratio. Roughly how much do you pay in fees per year, in dollars?",
          unit: "US dollars",
          answer: 60,
          tolerance: 0.01,
          explain: "15,000 × 0.004 = $60 a year.",
        },
      },
      flashcard: { front: "ETF vs mutual fund", back: "ETFs trade on an exchange all day. Traditional mutual funds deal once a day at NAV." },
    },
    {
      id: "si-futures",
      title: "Index futures are leveraged",
      lessonIds: ["si-funds"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "The dangerous belief is that the margin posted is the most a futures position can lose. Futures are leveraged and settled every day, so losses can exceed the margin.",
        altExplanation: "A futures position's profit or loss = points moved × [[contract-multiplier|contract multiplier]] × number of contracts. The margin you post is only a fraction of the contract's full value. Every day the position is [[mark-to-market|marked to market]]: losses are taken from your account in cash, and if it falls below the maintenance margin you must add money or the position is closed.",
        altExample: "A contract worth $5 per point at an index level of 5,000 controls $25,000 of exposure. If you posted $2,500 of margin and the index falls 600 points, you lose 600 × 5 = $3,000: more than your margin.",
        practice: {
          kind: "numeric",
          prompt: "A micro index future pays $5 per index point. You buy 2 contracts at 4,800 and the index falls to 4,650. What is your loss, in dollars? Enter it as a positive number.",
          unit: "US dollars",
          answer: 1500,
          tolerance: 0.01,
          explain: "150 points × $5 × 2 contracts = $1,500.",
        },
      },
      flashcard: { front: "Mark-to-market", back: "Futures gains and losses are settled in cash every day. A losing position can need more money, and can lose more than the margin." },
    },
    {
      id: "si-dividends",
      title: "Dividends and dividend yield",
      lessonIds: ["si-dividends-actions"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Two myths: that a dividend is free money on top of the share price, and that a very high yield means a bargain.",
        altExplanation: "On the [[ex-dividend-date|ex-dividend date]] the price usually opens lower by about the dividend, because part of the company's value has become cash in shareholders' accounts. The [[dividend-yield|dividend yield]] = yearly dividends ÷ price × 100, so when the price falls on fears of trouble, the yield rises automatically, and the dividend may then be cut.",
        altExample: "A $20 share paying $1 a year yields 5%. If the price halves to $10 on bad news, the yield shows 10%, but only until the company cuts the dividend.",
        practice: {
          kind: "numeric",
          prompt: "A share costs $25 and pays dividends of $0.75 a year. What is its dividend yield, in %?",
          unit: "%",
          answer: 3,
          tolerance: 0.01,
          explain: "0.75 ÷ 25 × 100 = 3%.",
        },
      },
      flashcard: { front: "Ex-dividend date", back: "Buy on or after it and you do not get the dividend. The price usually opens lower by about the dividend." },
    },
    {
      id: "si-splits-buybacks",
      title: "Splits and buybacks",
      lessonIds: ["si-dividends-actions"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A split is often thought to make you richer, and a buyback to be the same as a split. A split only cuts the same value into more pieces; a buyback reduces the number of shares, which raises earnings per share if profit is unchanged.",
        altExplanation: "[[stock-split|Split]]: shares × ratio, price ÷ ratio, total value unchanged. [[share-buyback|Buyback]]: the company spends cash to buy and cancel its own shares, so the same profit is shared among fewer shares: EPS = profit ÷ (fewer shares).",
        altExample: "A 2-for-1 split turns 50 shares at $80 ($4,000) into 100 shares at $40 ($4,000). A buyback that cancels a fifth of the shares with profit unchanged lifts EPS by a quarter: profit ÷ 0.8 = 1.25 × the old EPS.",
        practice: {
          kind: "single",
          prompt: "You own 10 shares at $300. The company does a 5-for-1 split. What do you own afterwards, before any price change?",
          options: [
            { id: "a", text: "10 shares at $60, worth $600", explain: "A split increases the number of shares you hold." },
            { id: "b", text: "50 shares at $60, worth $3,000", explain: "Right. Five times the shares at a fifth of the price: the same $3,000." },
            { id: "c", text: "50 shares at $300, worth $15,000", explain: "The price adjusts down; a split does not create value." },
            { id: "d", text: "2 shares at $1,500, worth $3,000", explain: "That would be a reverse split." },
          ],
          correct: "b",
        },
      },
      flashcard: { front: "Share split", back: "More shares at a proportionally lower price. Your total value does not change." },
    },
    {
      id: "si-applied",
      title: "Applied scenario: understanding a product before acting",
      lessonIds: ["si-funds", "si-earnings"],
      critical: true,
      safetyCritical: false,
      applied: true,
      remediation: {
        misconception: "The trap is acting on a product's story (a price jump, a high yield, a famous name) before understanding what it holds, what it costs and how it can lose.",
        altExplanation: "Describe the product in your own words before anything else: \"This holds …, costs … a year, can lose money when …, and is (or is not) leveraged.\" If a sentence has a gap, that gap is what to learn next. Two products with the same label, such as \"tracks the S&P 500\", can behave very differently.",
        altExample: "Two drinks are both labelled \"orange\". One is fresh juice; the other is 5% juice and sugar. You only know which is which by reading what is inside, not the label on the front.",
        practice: {
          kind: "scenario",
          situation: "You read that an index fund and an index future both \"track the S&P 500\".",
          question: "Which statement shows the soundest understanding of the difference?",
          options: [
            { id: "b", text: "They are the same thing, so it makes no difference which one is used", explain: "The label is the same; how they work and how they can lose is not.", process: "unsound" },
            { id: "c", text: "The future is safer, because it trades on an exchange", explain: "Trading on an exchange does not remove leverage or daily settlement.", process: "unsound" },
            { id: "a", text: "The fund holds the shares; the future is leveraged, settled daily and expires, so losses can exceed the money put in", explain: "Right. Same index, very different products and risks.", process: "sound" },
            { id: "d", text: "The future just costs more in fees; otherwise they behave the same", explain: "Costs differ, but the bigger difference is leverage, daily settlement and expiry.", process: "partial" },
          ],
        },
      },
      flashcard: { front: "Fit before story", back: "Choose a product by goal, horizon, cost and worst realistic loss, not by recent excitement." },
    },
  ],
  questions: [
    // si-primary-secondary
    {
      id: "si-q-ps-1", concept: "si-primary-secondary", type: "knowledge",
      explanation: "Everyday trading is in the secondary market: you buy from another investor and the company receives nothing.",
      item: {
        kind: "single",
        prompt: "You buy shares of a large listed company through your broker. Who usually receives your money?",
        options: [
          { id: "a", text: "The company, to fund its growth", explain: "Only when it sells new shares, as in an IPO." },
          { id: "b", text: "The stock exchange, which owns the shares", explain: "The exchange runs the market; it does not own the shares being traded." },
          { id: "d", text: "Your broker, who keeps it as a fee", explain: "Your broker may charge a fee, but the price goes to the seller." },
          { id: "c", text: "Another investor who sold you the shares", explain: "Right. This is the secondary market." },
        ],
        correct: "c",
      },
    },
    {
      id: "si-q-ps-2", concept: "si-primary-secondary", type: "knowledge",
      explanation: "In an IPO the company sells new shares in the primary market and receives the cash.",
      item: { kind: "true-false", statement: "In an IPO, the company sells new shares in the primary market and receives the money raised.", answer: true, explain: "True. That is the primary market: the cash goes to the company." },
    },
    // si-order-book
    {
      id: "si-q-ob-1", concept: "si-order-book", type: "calculation",
      explanation: "100 × 20.00 + 150 × 20.02 = 2,000 + 3,003 = 5,003. 5,003 ÷ 250 = $20.012.",
      item: { kind: "numeric", prompt: "The ask side shows 100 shares at $20.00, 200 at $20.02 and 300 at $20.05. You send a market order to buy 250 shares. What average price do you pay per share? Give 3 decimal places.", unit: "US dollars", answer: 20.012, tolerance: 0.001, explain: "100 at 20.00 and 150 at 20.02: 5,003 ÷ 250 = 20.012." },
    },
    {
      id: "si-q-ob-2", concept: "si-order-book", type: "knowledge",
      explanation: "A limit buy below the best ask does not fill at once. It waits in the book until a seller accepts that price, and may never fill.",
      item: {
        kind: "single",
        prompt: "The best ask is $15.10. You place a limit order to buy at $15.00. What happens?",
        options: [
          { id: "c", text: "It waits in the book and may never fill", explain: "Right. It joins the bids and fills only if a seller comes down to $15.00." },
          { id: "a", text: "It fills at once at $15.10", explain: "A limit order never pays more than its limit." },
          { id: "b", text: "It fills at once at $15.00", explain: "Nobody is offering at $15.00 yet, so there is nothing to match." },
          { id: "d", text: "The exchange rejects it for being too low", explain: "A limit below the ask is normal; it simply waits." },
        ],
        correct: "c",
      },
    },
    // si-earnings
    {
      id: "si-q-earn-1", concept: "si-earnings", type: "calculation",
      explanation: "EPS = 60 ÷ 30 = $2. P/E = 40 ÷ 2 = 20.",
      item: { kind: "numeric", prompt: "A company's yearly net profit is $60 million and it has 30 million shares. The share price is $40. What is its P/E ratio?", unit: "times earnings", answer: 20, tolerance: 0.01, explain: "EPS $2; 40 ÷ 2 = 20." },
    },
    {
      id: "si-q-earn-2", concept: "si-earnings", type: "knowledge",
      explanation: "With negative earnings the P/E has no useful meaning, so it is usually shown as not applicable.",
      item: {
        kind: "single",
        prompt: "A company made a loss last year. What can you say about its P/E ratio?",
        options: [
          { id: "a", text: "It is very high, so the shares are expensive", explain: "A loss gives a negative or undefined P/E, not a high one." },
          { id: "b", text: "It is not meaningful while earnings are negative", explain: "Right. P/E only makes sense with positive earnings." },
          { id: "c", text: "It is zero, so the shares are free", explain: "That misreads the ratio entirely." },
          { id: "d", text: "It equals the share price", explain: "Only if EPS were exactly 1, which a loss rules out." },
        ],
        correct: "b",
      },
    },
    {
      id: "si-q-earn-3", concept: "si-earnings", type: "calculation",
      explanation: "Profit margin = net profit ÷ revenue × 100 = 30 ÷ 200 × 100 = 15%.",
      item: { kind: "numeric", prompt: "A company's revenue is $200 million and its net profit is $30 million. What is its profit margin, in %?", unit: "%", answer: 15, tolerance: 0.01, explain: "30 ÷ 200 × 100 = 15%." },
    },
    // si-expectations
    {
      id: "si-q-exp-1", concept: "si-expectations", type: "knowledge",
      explanation: "Share prices reflect expected future profits. Cutting guidance lowers those expectations, which can outweigh a beat on the past quarter.",
      item: {
        kind: "single",
        prompt: "A company beats analysts' profit forecasts but cuts its guidance for next year. The shares fall. What is the most likely reason?",
        options: [
          { id: "b", text: "Beating forecasts is always bad news for a company's share price", explain: "Beats often help; here the guidance cut outweighed it." },
          { id: "c", text: "Analysts must sell shares when they are wrong", explain: "There is no such rule." },
          { id: "a", text: "Prices follow expected future profits, and those were cut", explain: "Right. The future matters more than the quarter just reported." },
          { id: "d", text: "The results were published in the wrong currency", explain: "Nothing in the question suggests that." },
        ],
        correct: "a",
      },
    },
    {
      id: "si-q-exp-2", concept: "si-expectations", type: "knowledge",
      explanation: "A beat is no guarantee: investors may have hoped for more, guidance may be weak, or the good news may have been priced in already.",
      item: { kind: "true-false", statement: "If a company beats the consensus estimate, its share price will rise.", answer: false, explain: "False. Higher private hopes, weaker guidance, poor-quality profit or good news already priced in can all send the shares down after a beat." },
    },
    // si-size
    {
      id: "si-q-size-1", concept: "si-size", type: "calculation",
      explanation: "Market cap = 500 million × $12 = $6 billion.",
      item: { kind: "numeric", prompt: "A company has 500 million shares priced at $12. What is its market capitalisation, in billions of dollars?", unit: "billion US dollars", answer: 6, tolerance: 0.01, explain: "500 million × 12 = 6 billion." },
    },
    {
      id: "si-q-size-2", concept: "si-size", type: "knowledge",
      explanation: "Size is price × number of shares, so a share price alone cannot tell you which company is bigger.",
      item: {
        kind: "single",
        prompt: "Company A's shares cost $900 each and Company B's cost $40. Which company is bigger?",
        options: [
          { id: "a", text: "Company A, because its shares cost more", explain: "A high share price says nothing about size on its own." },
          { id: "b", text: "Company B, because cheaper shares trade more", explain: "Trading activity does not decide size either." },
          { id: "d", text: "They are the same size, because both are listed on an exchange", explain: "Being listed says nothing about size." },
          { id: "c", text: "You cannot tell without the number of shares", explain: "Right. Market cap = price × shares." },
        ],
        correct: "c",
      },
    },
    {
      id: "si-q-size-3", concept: "si-size", type: "knowledge",
      explanation: "Utilities are usually called defensive: people keep paying for power and water in a slowdown. Consumer discretionary, industrials and materials are cyclical.",
      item: {
        kind: "single",
        prompt: "Which of these sectors is usually described as defensive?",
        options: [
          { id: "c", text: "Utilities", explain: "Right. Demand for power and water stays fairly steady. Defensive is not the same as safe, though." },
          { id: "a", text: "Consumer discretionary", explain: "Cyclical: people can delay buying cars, holidays and new clothes." },
          { id: "b", text: "Industrials", explain: "Cyclical: orders for machinery and building fall in a slowdown." },
          { id: "d", text: "Materials", explain: "Cyclical: demand for metals and chemicals follows the economy." },
        ],
        correct: "c",
      },
    },
    // si-index-calc
    {
      id: "si-q-idx-1", concept: "si-index-calc", type: "calculation",
      explanation: "Start: (100 + 20) ÷ 2 = 60. After the rise: (110 + 20) ÷ 2 = 65.",
      item: { kind: "numeric", prompt: "A price-weighted index holds two shares, at $100 and $20, with a divisor of 2. The $100 share rises 10% and the other is unchanged. What is the new index level?", unit: "index points", answer: 65, tolerance: 0.01, explain: "(110 + 20) ÷ 2 = 65." },
    },
    {
      id: "si-q-idx-2", concept: "si-index-calc", type: "knowledge",
      explanation: "In a price-weighted index, members count in proportion to their share price, so the highest-priced share moves it most for the same % change.",
      item: {
        kind: "single",
        prompt: "In a price-weighted index such as the Dow, whose 1% move shifts the index the most?",
        options: [
          { id: "a", text: "The company with the most employees", explain: "Employees do not enter the calculation." },
          { id: "b", text: "The company with the highest share price", explain: "Right. A 1% move in a $300 share is $3; in a $30 share it is 30 cents." },
          { id: "c", text: "The company with the largest market value", explain: "That would be true of a cap-weighted index, not a price-weighted one." },
          { id: "d", text: "Every member moves it by the same amount", explain: "That describes an equal-weighted index." },
        ],
        correct: "b",
      },
    },
    {
      id: "si-q-idx-3", concept: "si-index-calc", type: "knowledge",
      explanation: "Big cap-weighted indices count only the free float, so the index stays close to what investors can actually buy.",
      item: {
        kind: "single",
        prompt: "Why do most big cap-weighted indices weight members by free float?",
        options: [
          { id: "b", text: "So that every member has exactly the same weight", explain: "That would be equal weighting." },
          { id: "c", text: "Because companies pay to be weighted more heavily", explain: "Index weights follow published rules, not payments." },
          { id: "a", text: "So only shares that trade freely count, not locked-up blocks", explain: "Right. Blocks held by founders or governments are left out." },
          { id: "d", text: "So that dividends are added back into the index", explain: "That is a total-return index, a separate idea." },
        ],
        correct: "a",
      },
    },
    // si-funds
    {
      id: "si-q-fund-1", concept: "si-funds", type: "knowledge",
      explanation: "ETFs trade on an exchange throughout the day like shares. Traditional mutual funds deal with the fund itself, usually once a day at NAV.",
      item: {
        kind: "single",
        prompt: "What is the main practical difference between an ETF and a traditional mutual fund?",
        options: [
          { id: "a", text: "Only mutual funds can track an index, while ETFs must follow an active strategy", explain: "Both kinds can be index funds." },
          { id: "b", text: "ETFs never charge a yearly fee", explain: "ETFs have expense ratios too, taken from the fund." },
          { id: "d", text: "Mutual funds are always leveraged", explain: "Most are not; leverage is a feature of some specialised products." },
          { id: "c", text: "An ETF trades on an exchange all day; a mutual fund deals once a day at NAV", explain: "Right. That changes how you buy, and the price you get." },
        ],
        correct: "c",
      },
    },
    {
      id: "si-q-fund-2", concept: "si-funds", type: "calculation",
      explanation: "20,000 × 0.0020 = $40 a year, taken from the fund rather than billed.",
      item: { kind: "numeric", prompt: "You hold $20,000 in a fund with a 0.20% expense ratio. Roughly how much do you pay in fees per year, in dollars?", unit: "US dollars", answer: 40, tolerance: 0.01, explain: "20,000 × 0.002 = $40." },
    },
    // si-futures (safety-critical)
    {
      id: "si-q-fut-1", concept: "si-futures", type: "calculation",
      explanation: "40 points × $50 per point = $2,000.",
      item: { kind: "numeric", prompt: "An index future pays $50 per index point. You buy one contract at 5,000 and the index falls to 4,960. What is your loss, in dollars? Enter it as a positive number.", unit: "US dollars", answer: 2000, tolerance: 0.01, explain: "(5,000 − 4,960) × 50 = $2,000." },
    },
    {
      id: "si-q-fut-2", concept: "si-futures", type: "knowledge",
      explanation: "Futures are marked to market daily: losses are taken in cash each day, and falling below the maintenance margin means adding money or being closed out.",
      item: {
        kind: "single",
        prompt: "What does daily settlement (mark-to-market) mean for a losing futures position?",
        options: [
          { id: "b", text: "Losses are taken in cash each day, so you may need to add money", explain: "Right. Below the maintenance margin you must top up or be closed out." },
          { id: "a", text: "Losses are only counted when the contract expires", explain: "The opposite: they are settled every day." },
          { id: "c", text: "The exchange guarantees you will break even by expiry", explain: "No one guarantees that." },
          { id: "d", text: "Your margin is refunded at the end of each day", explain: "Margin stays posted while the position is open; losses reduce your account." },
        ],
        correct: "b",
      },
    },
    {
      id: "si-q-fut-3", concept: "si-futures", type: "knowledge",
      explanation: "Futures are leveraged: the margin is a fraction of the contract value, so a large enough move loses more than the margin posted.",
      item: { kind: "true-false", statement: "With a futures contract, the most you can lose is the initial margin you posted.", answer: false, explain: "False. Margin is only a fraction of the contract's value. A large move can lose more than the margin." },
    },
    // si-dividends
    {
      id: "si-q-div-1", concept: "si-dividends", type: "knowledge",
      explanation: "On the ex-dividend date the price usually opens lower by roughly the dividend, because new buyers no longer get it.",
      item: {
        kind: "single",
        prompt: "A $50 share pays a $1 dividend. All else equal, what usually happens on the ex-dividend date?",
        options: [
          { id: "a", text: "The price opens about $1 higher, as a reward", explain: "The reverse: the value paid out leaves the share price." },
          { id: "b", text: "The price opens about $1 lower", explain: "Right. Buyers from that day do not get the dividend, so they pay less." },
          { id: "c", text: "The price is frozen until the payment date", explain: "Shares keep trading normally." },
          { id: "d", text: "Holders receive a second dividend", explain: "There is only the one announced dividend." },
        ],
        correct: "b",
      },
    },
    {
      id: "si-q-div-2", concept: "si-dividends", type: "calculation",
      explanation: "Dividend yield = yearly dividends ÷ share price × 100 = 1.60 ÷ 40 × 100 = 4%.",
      item: { kind: "numeric", prompt: "A share costs $40 and pays dividends of $1.60 a year. What is its dividend yield, in %?", unit: "%", answer: 4, tolerance: 0.01, explain: "1.60 ÷ 40 × 100 = 4%." },
    },
    {
      id: "si-q-div-3", concept: "si-dividends", type: "knowledge",
      explanation: "A very high yield is often a warning: the price may have fallen on fears of trouble, and the dividend may be cut. Dividends are never guaranteed.",
      item: { kind: "true-false", statement: "A very high dividend yield usually signals that the share is a bargain.", answer: false, explain: "False. Yields rise automatically when a price falls on bad news, and the dividend may then be cut." },
    },
    // si-splits-buybacks
    {
      id: "si-q-split-1", concept: "si-splits-buybacks", type: "knowledge",
      explanation: "A 3-for-1 split triples the shares and divides the price by three: 90 shares at about $30, still $2,700.",
      item: {
        kind: "single",
        prompt: "You own 30 shares at $90. The company does a 3-for-1 split. What do you own afterwards, before any price change?",
        options: [
          { id: "b", text: "90 shares at $90, worth $8,100", explain: "The price adjusts down; a split does not create value." },
          { id: "c", text: "10 shares at $270, worth $2,700", explain: "That describes a reverse split." },
          { id: "a", text: "90 shares at $30, worth $2,700", explain: "Right. Same value, cut into more pieces." },
          { id: "d", text: "30 shares at $30, worth $900", explain: "Your number of shares goes up, so you do not lose value." },
        ],
        correct: "a",
      },
    },
    {
      id: "si-q-split-2", concept: "si-splits-buybacks", type: "calculation",
      explanation: "After cancelling 10 million shares, 40 million remain. EPS = 100 ÷ 40 = $2.50.",
      item: { kind: "numeric", prompt: "A company earns $100 million a year and has 50 million shares (EPS $2). It buys back and cancels 10 million shares, and profit is unchanged. What is the new EPS, in dollars?", unit: "US dollars", answer: 2.5, tolerance: 0.001, explain: "100 ÷ 40 = $2.50." },
    },
    // si-applied (scenario)
    {
      id: "si-q-applied-1", concept: "si-applied", type: "applied",
      explanation: "If two funds hold the same index, what you get is nearly the same, and the main difference is what each keeps from you every year. Understanding that comes before any choice, and the price tag says nothing about quality.",
      item: {
        kind: "scenario",
        situation: "Two funds track the same broad index of large US companies. Fund A charges 0.05% a year and Fund B 0.70%. B's brochure calls it a \"premium\" fund.",
        question: "What is the soundest way to understand the difference?",
        options: [
          { id: "b", text: "Assume B is better run, because it charges more", explain: "A higher fee is not evidence of anything except a higher cost.", process: "unsound" },
          { id: "c", text: "Assume they are identical, so nothing about them needs checking", explain: "Unsound: it skips the checks that matter. Same index does not prove the same holdings or tracking, and it ignores B's yearly cost, which is where they differ most.", process: "unsound" },
          { id: "d", text: "Ignore the fees, since both are below 1% a year", explain: "A 0.65% gap is taken every year on the whole amount, and it compounds.", process: "unsound" },
          { id: "a", text: "Check holdings and tracking; if they match, the main difference is B's higher yearly cost", explain: "Right. That is what each fund holds and what each costs.", process: "sound" },
        ],
      },
    },
    {
      id: "si-q-applied-2", concept: "si-applied", type: "applied",
      explanation: "The sound process checks what actually changed and only acts with a plan and a size you can afford to lose. Chasing a jump, or adding leverage, lets excitement make the decision.",
      item: {
        kind: "scenario",
        situation: "A company's shares jump 15% after its results. You have no plan for it. A message board says \"it can only go up from here\".",
        question: "What is the soundest next step?",
        options: [
          { id: "b", text: "Check what changed and only act with a plan and size you can afford", explain: "Right. Compare the results with expectations and guidance, then decide calmly, or stay out.", process: "sound" },
          { id: "a", text: "Buy with all your spare cash now, before the price rises any further", explain: "This is chasing a move with no plan and too much size.", process: "unsound" },
          { id: "c", text: "Buy a small amount now and work out a stop later", explain: "Smaller is better, but buying first and planning later is the wrong order.", process: "partial" },
          { id: "d", text: "Buy index futures to get leveraged exposure", explain: "Leverage on an excitement-driven idea multiplies the risk.", process: "unsound" },
        ],
        outcome: "Suppose the shares rose another 10% over the next week. Buying with all your spare cash still was not sound: the process would have been the same if they had fallen 10%.",
      },
    },
  ],
};

// ── Added in the step-1 rework: at least four questions per concept, and a second remediation variant ──
// Each new question uses a new situation, new numbers or a new angle, not a rewording.
// The applied scenarios test understanding of a product (what it holds, costs, how it can lose), never a recommendation.

const MORE_QUESTIONS: TrackAssessment["questions"] = [
  // si-primary-secondary
  {
    id: "si-q-ps-3", concept: "si-primary-secondary", type: "knowledge",
    explanation: "After the IPO, shares trade between investors in the secondary market. A rising share price changes what holders own, but the company receives no new money from those trades.",
    item: {
      kind: "single",
      prompt: "Years after its IPO, a company's share price doubles on the stock exchange. How much new money does the company receive from that rise?",
      options: [
        { id: "a", text: "Half of the increase, paid by the exchange", explain: "Exchanges do not pay companies when their share prices rise." },
        { id: "b", text: "None directly: those trades are between investors", explain: "Right. In the secondary market investors buy from other investors, not from the company." },
        { id: "c", text: "All of the increase, because the company owns its shares", explain: "Once sold, the shares belong to investors, not to the company." },
        { id: "d", text: "Money from the investors who buy its shares at the new, higher price", explain: "Those buyers pay the investors who sell to them, not the company. The company raised its money when it first sold the shares." },
      ],
      correct: "b",
    },
  },
  {
    id: "si-q-ps-4", concept: "si-primary-secondary", type: "knowledge",
    explanation: "On an exchange, the buyer of your shares is another investor (or a market maker), not the company that issued them.",
    item: {
      kind: "true-false",
      statement: "When you sell shares on an exchange, the company that issued them is the one that buys them from you.",
      answer: false,
      explain: "False. You sell to another investor or a market maker in the secondary market. A company buys its own shares only in a buyback.",
    },
  },
  // si-order-book
  {
    id: "si-q-ob-3", concept: "si-order-book", type: "calculation",
    explanation: "A market sell order takes the best bids first: 300 at $9.98 and then 100 at $9.95. (300 × 9.98 + 100 × 9.95) ÷ 400 = 3,989 ÷ 400 = $9.9725.",
    item: { kind: "numeric", prompt: "The bid side shows 300 shares at $9.98, 200 at $9.95 and 500 at $9.90. You send a market order to SELL 400 shares. What average price do you receive per share, in dollars?", unit: "US dollars", answer: 9.9725, tolerance: 0.001, explain: "300 × 9.98 + 100 × 9.95 = 3,989; ÷ 400 = $9.9725." },
  },
  {
    id: "si-q-ob-4", concept: "si-order-book", type: "knowledge",
    explanation: "A sell limit order sets the lowest price you will accept. It can fill at your price or better, or not at all, but never below it.",
    item: {
      kind: "true-false",
      statement: "A limit order to sell at $25.00 will never be filled below $25.00.",
      answer: true,
      explain: "True. That is the point of a limit: you choose the worst price you accept. The cost is that it may not fill at all.",
    },
  },
  // si-earnings
  {
    id: "si-q-earn-4", concept: "si-earnings", type: "calculation",
    explanation: "Earnings per share = net profit ÷ number of shares = $45 million ÷ 15 million = $3.",
    item: { kind: "numeric", prompt: "A company's yearly net profit is $45 million and it has 15 million shares. What are its earnings per share (EPS), in dollars?", unit: "US dollars", answer: 3, tolerance: 0.001, explain: "45 ÷ 15 = $3 per share." },
  },
  // si-expectations
  {
    id: "si-q-exp-3", concept: "si-expectations", type: "applied",
    explanation: "The results matched the consensus, so they were priced in. The news was the raised guidance: a better outlook than the market expected.",
    item: {
      kind: "single",
      prompt: "A company's results exactly match analysts' consensus, but management raises its guidance for next year. The shares rise. What is the most likely reason?",
      options: [
        { id: "a", text: "Matching the consensus always makes shares rise", explain: "Results in line with expectations were already priced in." },
        { id: "b", text: "The exchange rewards companies that hit their forecasts", explain: "Exchanges do not adjust prices for results." },
        { id: "c", text: "The raised outlook was better than the market expected", explain: "Right. The surprise was in the guidance, not in the results." },
        { id: "d", text: "Analysts are required to buy the shares after results", explain: "There is no such requirement." },
      ],
      correct: "c",
    },
  },
  {
    id: "si-q-exp-4", concept: "si-expectations", type: "knowledge",
    explanation: "Prices react to results compared with expectations. A record profit that was expected, or that falls short of hopes, can come with a falling share price.",
    item: {
      kind: "true-false",
      statement: "A company can report a record profit and still see its share price fall.",
      answer: true,
      explain: "True. If the market expected even more, or the guidance disappoints, a record profit can still be a negative surprise.",
    },
  },
  // si-size
  {
    id: "si-q-size-4", concept: "si-size", type: "calculation",
    explanation: "Market cap = shares × price, so shares = market cap ÷ price = $6 billion ÷ $30 = 200 million.",
    item: { kind: "numeric", prompt: "A company's market capitalisation is $6 billion and its share price is $30. How many shares does it have, in millions?", unit: "million shares", answer: 200, tolerance: 0.01, explain: "6,000 million ÷ 30 = 200 million shares." },
  },
  // si-index-calc
  {
    id: "si-q-idx-4", concept: "si-index-calc", type: "calculation",
    explanation: "In an equal-weighted index each member counts the same, so the change is the plain average: (8 + 0 + 0 + 0) ÷ 4 = 2%.",
    item: {
      kind: "single",
      prompt: "An equal-weighted index has four members. One rises 8% and the other three are unchanged. What is the index's change?",
      options: [
        { id: "a", text: "+8%", explain: "That ignores the three unchanged members." },
        { id: "b", text: "+0.5%", explain: "Too small: one quarter of 8% is 2%." },
        { id: "c", text: "It depends on which member has the highest share price", explain: "That matters in a price-weighted index, not an equal-weighted one." },
        { id: "d", text: "+2%", explain: "Right. Each member is a quarter of the index: 8% ÷ 4 = 2%." },
      ],
      correct: "d",
    },
  },
  // si-funds
  {
    id: "si-q-fund-3", concept: "si-funds", type: "knowledge",
    explanation: "An index fund pays fees and trading costs that the index itself does not. That shortfall against the index is called the tracking difference.",
    item: {
      kind: "single",
      prompt: "Over a year an index fund returned 9.6% while the index it tracks returned 9.9%. What usually explains most of the gap?",
      options: [
        { id: "a", text: "The fund manager chose different companies to beat the index", explain: "An index fund aims to match the index, not to pick other companies." },
        { id: "b", text: "The fund's fees and running costs, which the index does not pay", explain: "Right. Costs come out of the fund's return; this gap is the tracking difference." },
        { id: "c", text: "Index returns are always rounded up", explain: "There is no rounding rule like this." },
        { id: "d", text: "Funds are taxed by the exchange every year", explain: "Exchanges do not tax funds." },
      ],
      correct: "b",
    },
  },
  {
    id: "si-q-fund-4", concept: "si-funds", type: "knowledge",
    explanation: "Holding many companies spreads company-specific risk, but a broad index fund still falls when the whole market falls, sometimes a lot in one year.",
    item: {
      kind: "true-false",
      statement: "Because a broad index fund holds hundreds of companies, it cannot fall much in a single year.",
      answer: false,
      explain: "False. Diversification reduces the risk of one company failing, not the risk of the whole market falling. Broad indices have had falls of a third or more in a year.",
    },
  },
  // si-futures (safety-critical)
  {
    id: "si-q-fut-4", concept: "si-futures", type: "calculation",
    explanation: "A short position loses when the index rises: 120 points × $20 × 2 contracts = $4,800.",
    item: { kind: "numeric", prompt: "An index future pays $20 per index point. You SELL (go short) 2 contracts at 15,000 and the index rises to 15,120. What is your loss, in dollars? Enter it as a positive number.", unit: "US dollars", answer: 4800, tolerance: 0.01, explain: "(15,120 − 15,000) × $20 × 2 = $4,800." },
  },
  // si-dividends
  {
    id: "si-q-div-4", concept: "si-dividends", type: "calculation",
    explanation: "Four quarterly payments of $0.35 make $1.40 per share a year: 1.40 × 400 = $560.",
    item: { kind: "numeric", prompt: "You own 400 shares. The company pays a dividend of $0.35 per share every quarter. How much do you receive in a year, before tax, in dollars?", unit: "US dollars", answer: 560, tolerance: 0.01, explain: "0.35 × 4 × 400 = $560." },
  },
  // si-splits-buybacks
  {
    id: "si-q-split-3", concept: "si-splits-buybacks", type: "calculation",
    explanation: "A 1-for-5 reverse split turns every five shares into one, at five times the price: 500 ÷ 5 = 100 shares at about $10. The total value stays about $1,000.",
    item: {
      kind: "single",
      prompt: "You own 500 shares at $2. The company does a 1-for-5 reverse split. What do you own afterwards, before any price change?",
      options: [
        { id: "a", text: "2,500 shares at about $0.40", explain: "That is a 5-for-1 split, the other way round." },
        { id: "b", text: "100 shares at about $10", explain: "Right. Five shares become one, at five times the price; the total stays about $1,000." },
        { id: "c", text: "100 shares at $2", explain: "The price adjusts too, or your holding would lose four-fifths of its value." },
        { id: "d", text: "500 shares at $10", explain: "That would multiply your holding's value by five out of nothing." },
      ],
      correct: "b",
    },
  },
  {
    id: "si-q-split-4", concept: "si-splits-buybacks", type: "knowledge",
    explanation: "A split cuts the company into more, smaller slices. The whole company is worth the same, and so is your share of it.",
    item: {
      kind: "true-false",
      statement: "A share split, on its own, never changes what the company is worth.",
      answer: true,
      explain: "True. There are more shares at a lower price each, but the company and your stake in it are worth the same. Only the market's later reaction can move the value.",
    },
  },
  // si-applied (critical, applied): understanding a product, not choosing one
  {
    id: "si-q-applied-3", concept: "si-applied", type: "applied",
    explanation: "A very high yield is a question, not an answer. The sound process is to understand what the fund holds and where the payout comes from before doing anything.",
    item: {
      kind: "scenario",
      situation: "An advert says a fund \"pays 12% a year in dividends\". You know nothing else about it.",
      question: "What is the soundest first step?",
      options: [
        { id: "a", text: "Buy now, before the yield falls", explain: "Acting before you understand the product lets the advert make the decision.", process: "unsound" },
        { id: "b", text: "Find out what it holds and why the yield is so high, including whether the payout could be cut", explain: "Right. A high yield can come from a falling price, risky holdings or paying out capital.", process: "sound" },
        { id: "c", text: "Compare it with one other high-yield fund and pick the higher yield", explain: "A comparison, but only on the number that most needs explaining.", process: "partial" },
        { id: "d", text: "Borrow to buy more, since 12% beats the loan rate", explain: "Borrowing for a payout you do not understand adds risk on risk.", process: "unsound" },
      ],
    },
  },
  {
    id: "si-q-applied-4", concept: "si-applied", type: "applied",
    explanation: "A broad index fund holds the market, so it falls when the market falls; that is how it works, not a sign it is broken. The sound process is to understand that, and check your own plan before acting.",
    item: {
      kind: "scenario",
      situation: "You hold a broad index fund. The index falls 20% in a month and headlines say markets are \"in freefall\".",
      question: "What is the soundest way to think about it?",
      options: [
        { id: "a", text: "Assume the fund is broken because it fell, and sell everything at once", explain: "The fund did what it is built to do: follow the index.", process: "unsound" },
        { id: "b", text: "Switch into leveraged index futures to win the loss back faster", explain: "Leverage after a loss multiplies the risk of a bigger one.", process: "unsound" },
        { id: "c", text: "Sell half to feel less worried, without checking your plan", explain: "Less exposure, but the decision comes from the headline, not from your plan.", process: "partial" },
        { id: "d", text: "Recall that it holds the whole market, so it fell with it, and check whether your plan has changed", explain: "Right. Understanding the product comes first; then decide by your plan, not the headline.", process: "sound" },
      ],
    },
  },
];

const MORE_REMEDIATION: Record<string, ConceptRemediation> = {
  "si-primary-secondary": {
    misconception: "A frequent slip is thinking that buying a share on an exchange gives money to the company. After the first sale, shares change hands between investors.",
    altExplanation: "The primary market is the first sale: the company issues new shares and keeps the money. The secondary market is every sale after that: investors trade with each other, and the company is not a party to the deal. A higher share price helps the company only indirectly, for example if it later issues more shares.",
    altExample: "A band sells its first pressing of a record at a gig: the money goes to the band (primary). Years later fans resell those records online at higher prices: the band gets nothing from those sales (secondary).",
    practice: {
      kind: "single",
      prompt: "Which of these sends new money to the company itself?",
      options: [
        { id: "a", text: "You buy its shares from another investor on the exchange", explain: "A secondary-market trade: the money goes to the seller." },
        { id: "b", text: "Its share price rises 30% over a year", explain: "A price rise does not by itself send money to the company." },
        { id: "c", text: "It sells newly issued shares to investors in an offering", explain: "Right. New shares sold by the company raise money for it (primary market)." },
        { id: "d", text: "A fund sells its whole holding to another fund", explain: "Investor to investor: secondary market." },
      ],
      correct: "c",
    },
  },
  "si-order-book": {
    misconception: "Another mistake is expecting a big market order to fill at the best price shown. It fills level by level, so the average price gets worse the further it reaches.",
    altExplanation: "Read the order book as stacked layers. A market order eats layers in order, best first, until it is filled; your average price is the total cost divided by the shares. A limit order instead waits at your price, so it may fill at your price or better, or not at all.",
    altExample: "Buying 30 tickets when 10 are left at $50, 10 at $55 and 10 at $60: you pay 500 + 550 + 600 = $1,650, an average of $55, not the $50 on the first layer.",
    practice: {
      kind: "numeric",
      prompt: "The ask side shows 100 shares at $50.00, 100 at $50.50 and 200 at $51.00. You send a market order to buy 300 shares. What average price do you pay per share, in dollars?",
      unit: "US dollars",
      answer: 50.5,
      tolerance: 0.001,
      explain: "100 × 50 + 100 × 50.50 + 100 × 51 = 15,150; ÷ 300 = $50.50.",
    },
  },
  "si-earnings": {
    misconception: "It is easy to mix up revenue and profit, or to forget that a P/E ratio needs positive earnings. Revenue is money coming in; profit is what is left after all costs.",
    altExplanation: "Work down the page: revenue (sales), minus all costs, gives net profit. Divide profit by the number of shares for earnings per share (EPS). Divide the share price by EPS for the P/E ratio: how many years of current profit the price represents. With a loss, there is no meaningful P/E.",
    altExample: "A bakery sells $500,000 of bread and spends $440,000 running the business: profit $60,000, a 12% margin. Split into 20,000 shares, EPS is $3. If a share sells for $45, the P/E is 15.",
    practice: {
      kind: "numeric",
      prompt: "A company makes a net profit of $8 million a year and has 2 million shares. Its share price is $72. What is its P/E ratio?",
      unit: "times earnings",
      answer: 18,
      tolerance: 0.01,
      explain: "First EPS: 8 million ÷ 2 million = $4 per share. Then P/E: 72 ÷ 4 = 18.",
    },
  },
  "si-expectations": {
    misconception: "A second trap is looking only at the headline number. Markets also react to guidance, the company's own forecast, which can matter more than the results just reported.",
    altExplanation: "Score results on two lines. Line one: the results against the consensus estimate (beat, in line, miss). Line two: the outlook against what the market hoped for (raised, kept, cut). The share price usually follows the bigger surprise, and the outlook often wins.",
    altExample: "A shop's Christmas sales are a record, as everyone expected, but it warns that spring orders are weak. Shoppers' good December is already priced in; the weak spring is the news, so the shares fall.",
    practice: {
      kind: "true-false",
      statement: "Results that are better than expected are enough, on their own, to make a share price rise.",
      answer: false,
      explain: "False. Weak guidance or other news can outweigh a beat, so the shares can still fall.",
    },
  },
  "si-size": {
    misconception: "Many people judge a company's size by its share price. Size is market capitalisation: the share price times the number of shares.",
    altExplanation: "A share price alone is like the price of one slice without knowing how many slices the cake has. Multiply price by shares to get market capitalisation, and compare companies on that. Sectors group companies by what they do; defensive sectors sell things people buy in good times and bad.",
    altExample: "Company X: $500 shares, 10 million of them = $5 billion. Company Y: $25 shares, 800 million of them = $20 billion. Y is four times bigger despite the cheaper share.",
    practice: {
      kind: "single",
      prompt: "Company P has 4 million shares at $900. Company Q has 300 million shares at $40. Which is bigger by market capitalisation?",
      options: [
        { id: "a", text: "P, because its share price is higher", explain: "The price of one share says nothing about the size of the company." },
        { id: "b", text: "They are about the same size", explain: "P is $3.6 billion and Q is $12 billion." },
        { id: "c", text: "Q, at $12 billion against P's $3.6 billion", explain: "Right. 300 million × $40 = $12 billion; 4 million × $900 = $3.6 billion." },
        { id: "d", text: "It cannot be worked out without the profit", explain: "Market cap only needs the price and the number of shares." },
      ],
      correct: "c",
    },
  },
  "si-index-calc": {
    misconception: "It is easy to apply one weighting rule to every index. In a price-weighted index the highest-priced shares count most; in a cap-weighted one the biggest companies do; in an equal-weighted one every member counts the same.",
    altExplanation: "Ask the index's rule first. Price-weighted: add up the prices and divide by the divisor. Cap-weighted: weight each move by the company's share of total (usually free-float) value. Equal-weighted: average the moves. The same day can give three different index changes.",
    altExample: "Two shares: A at $200 (worth $10 billion), B at $20 (worth $90 billion). If A rises 10%: a price-weighted index rises about 9.1%, a cap-weighted one 1%, and an equal-weighted one 5%.",
    practice: {
      kind: "single",
      prompt: "In a cap-weighted index, which member's 1% rise moves the index the most?",
      options: [
        { id: "a", text: "The one with the highest share price", explain: "That is the rule for a price-weighted index." },
        { id: "b", text: "The one with the largest free-float market value", explain: "Right. Cap-weighted indices weight members by their (free-float) market value." },
        { id: "c", text: "Every member moves it equally", explain: "That is an equal-weighted index." },
        { id: "d", text: "The one that joined the index most recently", explain: "Joining date does not affect weights." },
      ],
      correct: "b",
    },
  },
  "si-funds": {
    misconception: "A common mistake is ignoring a fund's yearly fee because it looks tiny. It is charged every year on the whole amount, so over many years it adds up.",
    altExplanation: "An index fund is a basket that copies an index. Two things decide how close you get to the index: the yearly fee (the expense ratio) and how well the fund tracks. An ETF trades on an exchange during the day; a traditional mutual fund is bought and sold once a day at its end-of-day value.",
    altExample: "Two funds copy the same index. One charges 0.05% a year, the other 0.75%. On $10,000 that is $5 against $75 a year, before any growth, for the same basket of shares.",
    practice: {
      kind: "numeric",
      prompt: "Fund A and Fund B track the same index. A charges 0.10% a year and B charges 0.60%. You have $30,000 to invest. Roughly how much more would you pay in fees each year in B than in A, in dollars?",
      unit: "US dollars",
      answer: 150,
      tolerance: 0.01,
      explain: "A: 0.10% × 30,000 = $30. B: 0.60% × 30,000 = $180. B costs $150 more every year (the 0.50% gap × 30,000), for the same basket of shares.",
    },
  },
  "si-futures": {
    misconception: "Another misunderstanding is that a short futures position is safer. Shorts lose when the index rises, and losses on either side are worked out on the full contract value, settled daily.",
    altExplanation: "A future's result is points moved × dollars per point × contracts, with the sign depending on your side. Every day the position is marked to market: losses are taken from your account in cash, and if the margin runs low you must add money or the position is closed. The initial margin is a deposit, not a cap on losses.",
    altExample: "Short 1 contract at $10 per point at 8,000; the index rallies to 8,250. Loss: 250 × $10 = $2,500, taken over the days of the rise, whatever margin you first posted.",
    practice: {
      kind: "numeric",
      prompt: "A micro index future pays $5 per index point. You sell (go short) 3 contracts at 6,400 and the index rises to 6,580. What is your loss, in dollars? Enter it as a positive number.",
      unit: "US dollars",
      answer: 2700,
      tolerance: 0.01,
      explain: "A short loses when the index rises: 180 points × $5 × 3 contracts = $2,700.",
    },
  },
  "si-dividends": {
    misconception: "A second slip is reading a high yield as a bonus on top of the price. Paying a dividend moves value from the company to you, and the price usually drops by about that amount on the ex-dividend date.",
    altExplanation: "Dividend yield = yearly dividends per share ÷ share price. A yield can be high because the payout is generous or because the price has fallen, which may mean the market expects a cut. On the ex-dividend date the price usually falls by about the dividend, since new buyers no longer get it.",
    altExample: "A share at $80 pays $4 a year: a 5% yield. If bad news drops the price to $50 and the company has not yet cut, the yield shows 8%, which looks better while the outlook is worse.",
    practice: {
      kind: "numeric",
      prompt: "A share pays dividends of $3 a year. After bad news its price falls from $60 to $40, and the company has not cut the dividend yet. What dividend yield does it show now, in %?",
      unit: "%",
      answer: 7.5,
      tolerance: 0.01,
      explain: "3 ÷ 40 = 0.075 = 7.5% (it was 3 ÷ 60 = 5%). The yield rose only because the price fell, and it lasts only as long as the dividend is not cut.",
    },
  },
  "si-splits-buybacks": {
    misconception: "People often think a split makes them richer or a buyback is free money. A split only relabels your stake; a buyback uses company cash to reduce the number of shares, which raises earnings per share if profit holds.",
    altExplanation: "For a split, multiply your shares and divide the price by the same number: your total is unchanged. For a buyback, the company spends cash to buy and cancel shares; each remaining share is a bigger slice, so EPS rises if profit stays the same.",
    altExample: "A 2-for-1 split turns 40 shares at $120 into 80 at $60: still $4,800. A firm earning $60 million with 30 million shares (EPS $2) cancels 5 million: EPS becomes 60 ÷ 25 = $2.40.",
    practice: {
      kind: "numeric",
      prompt: "A company earns $72 million a year and has 36 million shares. It buys back and cancels 4 million shares, and profit is unchanged. What is the new EPS, in dollars?",
      unit: "US dollars",
      answer: 2.25,
      tolerance: 0.001,
      explain: "Before: 72 ÷ 36 = $2. After the buyback 32 million shares are left: 72 ÷ 32 = $2.25.",
    },
  },
  "si-applied": {
    misconception: "Another trap is thinking that a well-known product needs no checking. Even a broad, familiar fund has costs and can fall a lot; knowing how it can lose matters as much as knowing how it can gain.",
    altExplanation: "Use four questions as a checklist for any product, familiar or not. What does it hold? What does it cost each year, and how closely does it track? How can it lose money, and how much in a bad year? Is it leveraged, or does it expire? An answer you cannot give is the next thing to find out.",
    altExample: "A friend calls an index fund \"risk-free because it holds 500 companies\". The checklist shows the gap: it holds 500 companies, so one failure hurts little, but when the whole market falls it falls with it.",
    practice: {
      kind: "scenario",
      situation: "A friend says a broad index fund is \"risk-free because it holds 500 companies\" and plans to put money they need next month into it.",
      question: "What is the soundest response to the claim?",
      options: [
        { id: "a", text: "Agree: 500 companies cannot all fall at once", explain: "They can, and did, fall together in market-wide crashes.", process: "unsound" },
        { id: "b", text: "Explain that it spreads company risk but still falls when the market falls, so money needed soon is exposed", explain: "Right. That is what the fund holds and how it can lose.", process: "sound" },
        { id: "c", text: "Say it is safer than a single share and leave it there", explain: "True as far as it goes, but it misses the market-wide risk to money needed soon.", process: "partial" },
        { id: "d", text: "Suggest index futures instead, to make the money grow faster", explain: "Leverage and expiry add risk to money that is needed soon.", process: "unsound" },
      ],
    },
  },
};

export const STOCKS_INDICES_ASSESSMENT: TrackAssessment = {
  ...BASE,
  concepts: BASE.concepts.map((c) => ({ ...c, moreRemediation: MORE_REMEDIATION[c.id] ? [MORE_REMEDIATION[c.id]] : [] })),
  questions: [...BASE.questions, ...MORE_QUESTIONS],
};
