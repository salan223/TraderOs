import type { Lesson } from "../types";

/*
  Track 4: Cryptocurrency, lessons 1–5. How blockchains record ownership,
  where coins are held and what can go wrong, stablecoins and their pegs,
  volatility and the 24/7 market, and scams. Every number in the tools is set
  by the learner or made up; real events are described in words only.
  Research items not checked line by line against the paper are marked
  "Unverified".
*/

const T = "crypto";

export const CY1_BLOCKCHAINS: Lesson = {
  id: "cy-blockchains",
  trackId: T,
  order: 1,
  format: "full",
  title: "Bitcoin, Ethereum and how a blockchain works",
  summary: "A blockchain is a shared record that is hard to rewrite. Bitcoin uses it for payments; Ethereum adds programs on top. Neither makes the price stable.",
  minutes: 22,
  objectives: [
    "Explain how blocks are linked by hashes and why that makes past records hard to change.",
    "Describe proof of work and proof of stake in plain terms.",
    "Say how Bitcoin and Ethereum differ in purpose.",
    "Explain why a secure network does not mean a safe investment.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Before trading any [[cryptocurrency]], you should know what you are actually buying: an entry in a shared record, not a share in a company or a claim on a bank." },
        { kind: "p", text: "That record can be very secure while the price is extremely unstable. Mixing up the two is one of the commonest beginner mistakes." },
        { kind: "callout", tone: "info", title: "Linked lesson", text: "Market Foundations introduced crypto in one page. This track goes deeper.", link: { lessonId: "crypto-intro", label: "Crypto: the short version" } },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "A shared notebook nobody can secretly edit",
      blocks: [
        { kind: "p", text: "A [[blockchain]] is a list of transactions grouped into blocks. Each block stores a fingerprint of the block before it, made with a [[hash-function|hash function]]." },
        { kind: "p", text: "Change any old transaction and its block's fingerprint changes, so the next block's stored link no longer matches. Everyone running the software can see the break." },
        { kind: "defs", items: [
          { term: "[[proof-of-work|Proof of work]]", text: "Computers race to solve a costly puzzle to add the next block. Bitcoin uses it." },
          { term: "[[proof-of-stake|Proof of stake]]", text: "Validators lock up coins and lose them if they cheat. Ethereum has used it since 2022." },
          { term: "[[gas-fee|Gas fee]]", text: "What you pay to have a transaction processed. It rises when the network is busy." },
        ] },
        { kind: "callout", tone: "key", title: "Key idea", text: "The chain makes the record hard to rewrite. It does nothing to make the coin's price stable or its value certain." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Try to change history",
      blocks: [
        { kind: "interactive", widget: "cy-hash-chain", title: "Edit a block and watch the chain break", caption: "A four-block chain using a simple toy hash (not a secure one). Change an amount in any block: its fingerprint changes and every later block becomes invalid." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "Two networks, two purposes",
      blocks: [
        { kind: "p", text: "Bitcoin was designed as electronic cash that needs no bank. Its rules cap the supply at 21 million coins, released on a fixed schedule." },
        { kind: "p", text: "Ethereum is built to run programs, called [[smart-contract|smart contracts]], which power tokens, exchanges and lending apps. Its coin, ether, pays for that computation." },
        { kind: "callout", tone: "example", title: "Example", text: "Sending bitcoin moves coins between addresses. Swapping one token for another on Ethereum runs a program that does it automatically, and you pay a gas fee for the computation." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: what moves crypto prices",
      blocks: [
        { kind: "concept-card", card: {
          name: "Blockchain consensus",
          what: "The process by which thousands of independent computers agree on one shared list of transactions.",
          whyItExists: "Without a central bank or company keeping the books, the network needs a way to stop people spending the same coin twice.",
          problemSolved: "Double spending: in proof of work, rewriting history means redoing more work than the honest network; in proof of stake, cheating validators lose their stake.",
          mechanics: "Transactions are gathered into a block. The block includes the hash of the previous block. Miners or validators propose blocks; the rules decide which chain everyone follows.",
          math: "Each block stores hash(previous block). Changing block k changes hash(k), which breaks the link stored in block k + 1, and so on to the end.",
          howTradersUseIt: "Mostly indirectly: to judge network risks (outages, forks, congestion) and why fees rise when the network is busy.",
          whenUseful: "When judging whether a coin's network is mature, how decentralised it is and what could disrupt transfers.",
          whenItFails: "When one group controls most of the mining power or stake, or when software bugs or bridges between chains are attacked.",
          limitations: "Security of the ledger says nothing about the coin's price, the honesty of an exchange or the safety of your own keys.",
          misconceptions: "That \"on the blockchain\" means \"safe\". Most losses happen at exchanges, in apps and through stolen keys, not by breaking the chain.",
          realExample: "In the tool above, editing block 2 breaks blocks 3 and 4. A real network would simply reject the edited version.",
          exercise: "Look up the current block height of Bitcoin on any public block explorer and note how often new blocks appear.",
          practicalTest: "Explain to someone in two sentences why editing an old transaction is hard but losing your coins is still easy.",
        } },
        { kind: "research", research: {
          title: "Risks and Returns of Cryptocurrency",
          authors: "Yukun Liu and Aleh Tsyvinski",
          year: 2021,
          venue: "Review of Financial Studies 34(6)",
          peerReviewed: true,
          question: "Are cryptocurrency returns explained by the same risk factors as shares, currencies and commodities?",
          methodology: "Regressions of Bitcoin, Ripple and Ethereum returns on stock, currency, commodity and macroeconomic factors, and on crypto-specific measures such as momentum and investor attention.",
          data: "Daily and weekly prices of the three largest cryptocurrencies from their early trading years up to 2018.",
          findings: "Crypto returns had little exposure to the usual stock, currency and macro factors. They were predicted mainly by crypto-specific factors: time-series momentum and measures of investor attention.",
          limitations: "A short, unusual period with few coins; relationships with shares appear to have strengthened since, so the findings may not hold today.",
          practicalMeaning: "Do not assume crypto behaves like any other asset. Its drivers are largely its own, and they may change as it matures.",
          status: "regime-sensitive",
          url: "https://doi.org/10.1093/rfs/hhaa113",
          verified: true,
        } },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Network analysts", view: "Study on-chain data: transaction counts, active addresses and fees, as signs of real use." },
          { name: "Macro traders", view: "Treat crypto as a high-risk asset that reacts to liquidity, interest rates and risk appetite." },
          { name: "Sceptics", view: "Point out that a coin's value rests only on what the next buyer will pay, with no cash flows behind it." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Thinking a secure blockchain means a safe investment.", why: "The ledger is secure; the price can still fall 80%.", instead: "Judge price risk separately from network security." },
          { mistake: "Treating all coins as alike.", why: "Bitcoin, Ethereum and small new tokens differ hugely in liquidity, use and risk.", instead: "Look at each coin's purpose, supply rules and trading volume." },
          { mistake: "Ignoring fees.", why: "Gas fees and exchange fees can be large for small, frequent transactions.", instead: "Check the fee before sending, and avoid busy times when possible." },
        ] },
      ],
    },
    {
      id: "summary",
      part: "summary",
      heading: "Summary",
      blocks: [
        { kind: "summary",
          keyConcepts: [
            "A blockchain links blocks by hashes, so past records are hard to change.",
            "Proof of work and proof of stake are two ways for a network to agree on the next block.",
            "Bitcoin aims to be money with a fixed supply; Ethereum runs programs.",
            "Ledger security and price stability are different things.",
          ],
          equations: [{ label: "Link", formula: "block k + 1 stores hash(block k)" }],
          implications: ["Separate network risk from price risk.", "Know which coin you hold and why it exists.", "Expect fees to change with network demand."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Open a public block explorer for Bitcoin and for Ethereum and note the time between recent blocks.",
          "Write down, in one sentence each, what Bitcoin and Ethereum are designed to do.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "order",
    id: "cy-blockchains-ex",
    title: "From payment to confirmation",
    prompt: "Put the steps of a crypto payment in order.",
    items: [
      { id: "1", text: "You sign a transaction with your private key" },
      { id: "2", text: "The transaction is broadcast to the network" },
      { id: "3", text: "A miner or validator includes it in a new block" },
      { id: "4", text: "The block is added to the chain and linked by its hash" },
      { id: "5", text: "Later blocks build on it, making it ever harder to reverse" },
    ],
    explanation: "Signing proves you control the coins; the network then orders the transaction into a block, and each later block adds confirmation.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "Why is it hard to change an old transaction on a blockchain?",
      options: [
        { id: "a", text: "A government agency checks every block", explain: "No central agency is involved." },
        { id: "b", text: "Changing it alters the block's hash and breaks every later link", explain: "Right. The links expose the edit." },
        { id: "c", text: "Old blocks are deleted after a week", explain: "They are kept." },
        { id: "d", text: "Transactions are written in a secret code that nobody except the original sender can ever read again", explain: "Most chains are public." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "What does proof of stake use to secure the network?",
      options: [
        { id: "a", text: "Puzzles solved with electricity", explain: "That is proof of work." },
        { id: "b", text: "A bank's guarantee", explain: "No bank is involved." },
        { id: "c", text: "Coins locked up by validators, which they lose if they cheat", explain: "Right." },
        { id: "d", text: "Votes from coin holders on every single transaction, counted by hand once a day", explain: "Not how it works." },
      ],
      correct: "c",
    },
    {
      id: "q3",
      prompt: "A coin's network has never been hacked. What does that tell you about its price?",
      options: [
        { id: "a", text: "Nothing reliable: price risk is separate", explain: "Right. Security and price are different questions." },
        { id: "b", text: "It cannot fall far", explain: "Secure coins have fallen a lot." },
        { id: "c", text: "It will rise over time", explain: "No such link." },
        { id: "d", text: "It is guaranteed by the developers", explain: "No one guarantees the price." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "What is a gas fee?",
      options: [
        { id: "a", text: "A tax on crypto profits", explain: "Not a tax." },
        { id: "b", text: "The price of ether set by a central bank", explain: "No central bank sets it." },
        { id: "c", text: "A charge for holding coins on an exchange for more than a month without trading them", explain: "Not what it is." },
        { id: "d", text: "A fee for having a transaction processed on a network like Ethereum", explain: "Right." },
      ],
      correct: "d",
    },
  ],
  practical: {
    title: "Read a block explorer",
    instructions: "Research only. Do not buy or send any coins.",
    steps: [
      "Open a public block explorer for Bitcoin.",
      "Find the latest block and note its number, time and number of transactions.",
      "Click into one transaction and note the fee paid.",
    ],
    reflectionPrompt: "Before this lesson, did you think \"on the blockchain\" meant \"safe to invest in\"? What changed?",
  },
  glossary: ["hash-function", "proof-of-work", "proof-of-stake", "gas-fee"],
  next: "cy-custody",
};

export const CY2_CUSTODY: Lesson = {
  id: "cy-custody",
  trackId: T,
  order: 2,
  format: "full",
  title: "Exchanges, wallets and who holds the keys",
  summary: "Whoever holds the private keys controls the coins. Leaving coins on an exchange adds the exchange's risk; holding them yourself puts the risk of losing keys on you.",
  minutes: 22,
  objectives: [
    "Explain what a crypto exchange does and what you own when coins sit there.",
    "Describe hot and cold wallets and what a seed phrase is.",
    "Compare exchange custody and self-custody risks.",
    "List basic steps that protect an account and a wallet.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Many crypto investors have lost money without the price falling at all: their exchange failed, or their keys were stolen or lost." },
        { kind: "p", text: "Where your coins are held is a risk decision, just like how much you buy." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Keys, not coins",
      blocks: [
        { kind: "p", text: "Coins never leave the blockchain. What you hold is the [[private-key|private key]] that can move them. A [[wallet]] is software or a device that keeps keys and signs transactions." },
        { kind: "defs", items: [
          { term: "[[crypto-exchange|Exchange]] custody", text: "The exchange holds the keys; your account shows a balance the exchange owes you." },
          { term: "[[hot-wallet|Hot wallet]]", text: "Keys on an internet-connected device, such as a phone app." },
          { term: "[[cold-wallet|Cold wallet]]", text: "Keys kept offline, usually on a hardware device." },
          { term: "[[seed-phrase|Seed phrase]]", text: "12 or 24 words that can recreate your keys. Whoever has them has your coins." },
        ] },
        { kind: "callout", tone: "warn", title: "Watch out", text: "No real exchange, wallet maker or support agent will ever ask for your seed phrase. Anyone who asks is trying to steal from you." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Where could it go wrong?",
      blocks: [
        { kind: "interactive", widget: "cy-custody", title: "Custody choices against things that go wrong", caption: "Pick where coins are held and a problem. The result shows who bears the loss. No choice removes risk; each moves it." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "When an exchange fails",
      blocks: [
        { kind: "p", text: "Crypto history includes exchanges that froze withdrawals and went bankrupt, among them Mt. Gox in 2014 and FTX in 2022. Customers became creditors waiting for court processes." },
        { kind: "p", text: "Some exchanges publish [[proof-of-reserves|proof of reserves]]. It usually shows assets at one moment, not all debts, so it is not the same as an audit." },
        { kind: "callout", tone: "example", title: "Example", text: "A made-up trader keeps $5,000 on an exchange for daily trading and moves long-term holdings to a hardware wallet, with the seed phrase written on paper in two safe places." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: counterparty risk in crypto",
      blocks: [
        { kind: "concept-card", card: {
          name: "Custody and counterparty risk",
          what: "The risk that whoever holds your assets cannot or will not return them.",
          whyItExists: "Crypto exchanges often combine roles that are separated in regulated markets: broker, exchange, custodian and sometimes lender.",
          problemSolved: "Thinking about custody explicitly stops you treating an exchange balance as if it were coins in your own control.",
          mechanics: "On an exchange, your balance is a ledger entry the exchange owes you. In self-custody, the blockchain records coins at an address only your keys control.",
          math: "Rough expected loss from custody = chance the custodian fails × share of your holdings there × share not recovered.",
          howTradersUseIt: "Keep only what is needed for trading on an exchange, spread funds across venues, and move longer-term holdings to self-custody.",
          whenUseful: "Whenever you hold more crypto than you could afford to lose to a single failure.",
          whenItFails: "Self-custody fails when keys are lost, stolen or typed into a fake site.",
          limitations: "The chance an exchange fails is unknowable in advance; past failures came with little warning.",
          misconceptions: "That a big, well-known exchange cannot fail. Some of the largest have.",
          realExample: "When FTX collapsed in November 2022, customers could not withdraw, and recovery took years of bankruptcy proceedings.",
          exercise: "List where any crypto you hold sits today and whether you or someone else holds the keys.",
          practicalTest: "Without looking, can you say where your seed phrase backups are? If not, fix that first.",
        } },
        { kind: "research", research: {
          title: "Beware the Middleman: Empirical Analysis of Bitcoin-Exchange Risk",
          authors: "Tyler Moore and Nicolas Christin",
          year: 2013,
          venue: "Financial Cryptography and Data Security (FC 2013), Lecture Notes in Computer Science 7859",
          peerReviewed: true,
          question: "How often do Bitcoin exchanges fail or get breached, and what predicts it?",
          methodology: "A survival analysis of Bitcoin exchanges, relating closures and security breaches to trading volume and other features.",
          data: "The 40 Bitcoin exchanges the authors could identify from the early years of Bitcoin up to early 2013.",
          findings: "Close to half of the exchanges studied had closed, often without fully repaying customers. Busier exchanges were more likely to suffer a breach, while quieter ones were more likely to shut down.",
          limitations: "An early, small and unregulated market; today's exchanges are larger and some are regulated, though failures still happen.",
          practicalMeaning: "Exchange failure is not a rare tail event in crypto's history. Limit what you leave with any one platform.",
          status: "outdated",
          url: "https://doi.org/10.1007/978-3-642-39884-1_3",
          verified: false,
        } },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Institutional investors", view: "Use regulated, specialised custodians with separate accounts, insurance and audits." },
          { name: "Active traders", view: "Keep a working balance on exchanges and move the rest out regularly." },
          { name: "Long-term holders", view: "Use hardware wallets, test the seed backup, and never type the seed into a computer." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Storing the seed phrase as a photo or in email.", why: "Cloud accounts get hacked; the photo is a copy of your keys.", instead: "Write it on paper or metal and store it offline in safe places." },
          { mistake: "Leaving everything on one exchange.", why: "One failure takes it all.", instead: "Keep only a trading balance there." },
          { mistake: "Skipping account security.", why: "Weak passwords and SMS codes are easy targets.", instead: "Use a unique password, an authenticator app or hardware key, and withdrawal allow-lists." },
        ] },
      ],
    },
    {
      id: "summary",
      part: "summary",
      heading: "Summary",
      blocks: [
        { kind: "summary",
          keyConcepts: [
            "Whoever holds the private keys controls the coins.",
            "An exchange balance is a claim on the exchange.",
            "Hot wallets are convenient; cold wallets are safer from hackers but easy to lose.",
            "Your seed phrase is the master key and must never be shared.",
          ],
          equations: [{ label: "Custody loss", formula: "≈ P(custodian fails) × share held there × share not recovered" }],
          implications: ["Split holdings by purpose.", "Protect accounts with strong second factors.", "Back up and test your seed phrase offline."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Write a custody plan: how much, if any, you would keep on an exchange and why.",
          "Check that every crypto or broker account you use has a non-SMS second factor.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "cy-custody-ex",
    title: "Whose risk is it?",
    prompt: "Sort each event by where the risk comes from.",
    categories: [
      { id: "exchange", label: "Exchange (counterparty) risk" },
      { id: "self", label: "Self-custody risk" },
    ],
    items: [
      { id: "1", text: "The platform freezes withdrawals", category: "exchange", explain: "Your balance is a claim on the platform." },
      { id: "2", text: "You lose the paper with your seed phrase and your device breaks", category: "self", explain: "No one else can restore your keys." },
      { id: "3", text: "The platform is hacked and customer coins are stolen", category: "exchange", explain: "The platform held the keys." },
      { id: "4", text: "You approve a malicious transaction in your own wallet app", category: "self", explain: "You signed it yourself." },
      { id: "5", text: "The company goes bankrupt with a hole in its accounts", category: "exchange", explain: "Customers become creditors." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "What do you actually own when coins show in your exchange account?",
      options: [
        { id: "a", text: "Coins at an address only you control", explain: "That is self-custody." },
        { id: "b", text: "A guarantee from the government", explain: "There is usually no such guarantee." },
        { id: "c", text: "A claim on the exchange, which holds the keys", explain: "Right." },
        { id: "d", text: "A share in the exchange company that pays you a dividend every quarter from its trading fees", explain: "Not what a balance is." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "Someone from \"wallet support\" asks for your seed phrase to fix a problem. What should you do?",
      options: [
        { id: "a", text: "Give only the first half of the words", explain: "Even part of it helps a thief." },
        { id: "b", text: "Refuse: no genuine support ever needs it", explain: "Right." },
        { id: "c", text: "Send it by email so there is a record", explain: "That hands it over." },
        { id: "d", text: "Type it into their website to verify your identity", explain: "That is how wallets get drained." },
      ],
      correct: "b",
    },
    {
      id: "q3",
      prompt: "What is the main weakness of a cold wallet?",
      options: [
        { id: "a", text: "If the device and seed backup are lost, the coins are gone", explain: "Right. The risk moves onto you." },
        { id: "b", text: "It is easy for hackers to reach online", explain: "Its keys are offline." },
        { id: "c", text: "It charges high monthly fees", explain: "Not typically." },
        { id: "d", text: "It cannot hold Bitcoin", explain: "Most can." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "What does proof of reserves usually NOT show?",
      options: [
        { id: "a", text: "That some assets exist", explain: "It does show assets." },
        { id: "b", text: "The time it was published", explain: "It is dated." },
        { id: "c", text: "Wallet addresses holding coins", explain: "Often included." },
        { id: "d", text: "All of the exchange's debts", explain: "Right. Assets alone do not prove solvency." },
      ],
      correct: "d",
    },
  ],
  practical: {
    title: "A custody check-up",
    instructions: "Review only. Do not move or buy anything as part of this task.",
    steps: [
      "List every place you hold crypto or have a crypto account.",
      "For each, note who holds the keys and what second factor protects it.",
      "Note one change you would make to reduce custody risk.",
    ],
    reflectionPrompt: "Which would be harder for you: protecting your own keys, or trusting an exchange? Why?",
  },
  glossary: ["seed-phrase", "hot-wallet", "cold-wallet", "proof-of-reserves"],
  next: "cy-stablecoins",
};

export const CY3_STABLECOINS: Lesson = {
  id: "cy-stablecoins",
  trackId: T,
  order: 3,
  format: "full",
  title: "Stablecoins and their pegs",
  summary: "A stablecoin tries to hold a fixed value, usually $1. Whether it can depends on what backs it and whether holders can redeem it in a rush.",
  minutes: 20,
  objectives: [
    "Explain what a stablecoin is and why traders use it.",
    "Distinguish reserve-backed and algorithmic stablecoins.",
    "Explain how a run can break a peg.",
    "Say what to check before relying on a stablecoin.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Most crypto trading is priced against [[stablecoin|stablecoins]]. Traders park money in them between trades, assuming they are as good as dollars." },
        { kind: "p", text: "They are not quite. A stablecoin is a promise, and promises can break exactly when markets are stressed." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "How a stablecoin keeps its value",
      blocks: [
        { kind: "p", text: "A reserve-backed stablecoin holds cash and short-term government bills worth at least as much as the coins issued. Approved holders can hand coins back for dollars: a [[redemption]]." },
        { kind: "p", text: "If the coin trades at $0.99, traders can buy it and redeem it for $1, which pushes the price back up. That arbitrage is what holds the [[peg]]." },
        { kind: "defs", items: [
          { term: "Reserve-backed", text: "Backed by cash and bills held by the issuer." },
          { term: "[[algorithmic-stablecoin|Algorithmic]]", text: "Tries to hold the peg with rules for creating and destroying coins, not safe reserves." },
          { term: "[[depeg|Depeg]]", text: "When the coin's price drifts away from its target value." },
        ] },
        { kind: "callout", tone: "key", title: "Key idea", text: "A peg is only as strong as the reserves behind it and the ability to redeem them quickly." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Run on a stablecoin",
      blocks: [
        { kind: "interactive", widget: "cy-stablecoin-run", title: "Can the reserves survive a rush to cash out?", caption: "Choose what the reserves are made of and how many holders cash out at once. Cash pays first, then bills at a small discount, then risky assets at a large one. All numbers are made up." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "When pegs broke",
      blocks: [
        { kind: "p", text: "In May 2022 the algorithmic stablecoin TerraUSD lost its peg and collapsed toward zero within days, along with its sister token." },
        { kind: "p", text: "In March 2023 USDC, a reserve-backed coin, briefly traded well below $1 after its issuer disclosed that some reserves were held at Silicon Valley Bank, which had failed. It recovered once the deposits were made safe." },
        { kind: "callout", tone: "example", title: "Example", text: "Same word, \"stablecoin\"; very different designs. One had no safe reserves and fell apart; the other had reserves, but some were stuck at a failed bank for a weekend." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: runs and redemption",
      blocks: [
        { kind: "concept-card", card: {
          name: "Stablecoin runs",
          what: "A rush by holders to exchange stablecoins for dollars before others do.",
          whyItExists: "Holders who leave first get $1; those who stay may get less if reserves fall short. That rewards running early.",
          problemSolved: "Understanding runs explains why pegs can fail suddenly rather than gradually.",
          mechanics: "Redemptions are paid from cash first. If cash runs out, the issuer sells bills or riskier assets, often at a discount in a hurry, which leaves less backing for remaining holders.",
          math: "Backing per remaining coin = (reserves − cash paid out − fire-sale losses) ÷ coins still outstanding.",
          howTradersUseIt: "They prefer coins with transparent, liquid reserves and spread balances across issuers.",
          whenUseful: "Whenever you hold large balances in stablecoins between trades.",
          whenItFails: "When reserves are risky, illiquid, stuck at a failed bank, or never existed.",
          limitations: "Reserve reports are periodic; what is held between reports may differ.",
          misconceptions: "That a stablecoin is the same as a bank deposit. It usually has no deposit insurance.",
          realExample: "In the tool above, a coin with 70% risky reserves breaks when 60% of holders redeem; a cash-backed one does not.",
          exercise: "Find the latest reserve report of one large stablecoin and note what share is cash and bills.",
          practicalTest: "Decide in advance the largest share of your money you would keep in any one stablecoin.",
        } },
        { kind: "research", research: {
          title: "Is Bitcoin Really Untethered?",
          authors: "John M. Griffin and Amin Shams",
          year: 2020,
          venue: "Journal of Finance 75(4)",
          peerReviewed: true,
          question: "Was the issuance of the Tether stablecoin driven by investor demand, or used to push up Bitcoin's price?",
          methodology: "Analysis of blockchain transaction data between Tether, exchanges and Bitcoin, and of the timing of Tether flows relative to price moves.",
          data: "Tether and Bitcoin flows on the blockchain during the 2017–2018 boom.",
          findings: "Purchases of Bitcoin with Tether were timed after market downturns and were followed by sizeable Bitcoin price increases. The flows came largely from one large account, a pattern the authors say fits supply-driven price support rather than investor demand.",
          limitations: "Tether disputed the conclusions; the study covers one boom and cannot prove intent.",
          practicalMeaning: "Stablecoins can affect the wider crypto market, and their backing and issuance deserve scrutiny.",
          status: "disputed",
          url: "https://doi.org/10.1111/jofi.12903",
          verified: true,
        } },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Treasury managers", view: "Check reserve composition, the auditor or attestation firm, and who may redeem directly." },
          { name: "Traders", view: "Watch the coin's price on several exchanges; a persistent discount is an early warning." },
          { name: "Regulators", view: "Compare stablecoins to money market funds and bank deposits, and focus on run risk." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Treating every stablecoin as cash.", why: "Designs and reserves differ widely.", instead: "Check what backs each coin and how redemption works." },
          { mistake: "Chasing high yields on stablecoins.", why: "High yield means someone is taking risk with your coins.", instead: "Ask where the yield comes from before depositing." },
          { mistake: "Holding everything in one coin.", why: "A single depeg hits it all.", instead: "Spread large balances or convert to bank money when not trading." },
        ] },
      ],
    },
    {
      id: "summary",
      part: "summary",
      heading: "Summary",
      blocks: [
        { kind: "summary",
          keyConcepts: [
            "Stablecoins aim for a fixed value, usually $1.",
            "Redemption and arbitrage hold the peg; reserves make redemption possible.",
            "Algorithmic designs without safe reserves have collapsed.",
            "Runs reward leaving early, so pegs can break suddenly.",
          ],
          equations: [{ label: "Backing", formula: "(reserves − paid out − fire-sale losses) ÷ coins outstanding" }],
          implications: ["Read reserve reports.", "Be wary of high stablecoin yields.", "Do not assume deposit insurance."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Read the most recent reserve report of one large stablecoin and summarise its reserve mix.",
          "Find that coin's price on two exchanges and note any difference.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "match",
    id: "cy-stablecoins-ex",
    title: "Designs and what holds them up",
    prompt: "Match each term with its description.",
    pairs: [
      { id: "1", left: "Reserve-backed stablecoin", right: "Holds cash and bills worth the coins issued" },
      { id: "2", left: "Algorithmic stablecoin", right: "Relies on rules for creating and destroying coins" },
      { id: "3", left: "Redemption", right: "Handing coins back to the issuer for dollars" },
      { id: "4", left: "Depeg", right: "The price drifts away from its target value" },
    ],
    explanation: "Reserves and redemption hold a peg; designs without safe reserves depend on confidence alone.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "A dollar stablecoin trades at $0.98 and redemption works normally. What do arbitrage traders tend to do?",
      options: [
        { id: "a", text: "Sell it, pushing it lower", explain: "Buying is the profitable trade." },
        { id: "b", text: "Ignore it", explain: "It is a profit opportunity." },
        { id: "c", text: "Ask the government to fix it", explain: "Not how pegs work." },
        { id: "d", text: "Buy it and redeem it for $1", explain: "Right. That lifts the price." },
      ],
      correct: "d",
    },
    {
      id: "q2",
      prompt: "Why can a run on a stablecoin speed up once it starts?",
      options: [
        { id: "a", text: "Early leavers get $1; later ones may get less", explain: "Right. That rewards running." },
        { id: "b", text: "The blockchain slows down", explain: "Not the main reason." },
        { id: "c", text: "Regulators order everyone to sell", explain: "Not how runs work." },
        { id: "d", text: "The coin's supply automatically doubles every time anyone redeems a single coin", explain: "No such rule." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      prompt: "Which reserves best protect a peg in a run?",
      options: [
        { id: "a", text: "The issuer's own token", explain: "It falls in the same run." },
        { id: "b", text: "Cash and short-term government bills", explain: "Right. Safe and quick to sell." },
        { id: "c", text: "Loans to other crypto firms", explain: "Risky and hard to sell fast." },
        { id: "d", text: "Shares in technology companies", explain: "Their price can fall in a crisis." },
      ],
      correct: "b",
    },
    {
      id: "q4",
      prompt: "A platform pays 20% a year on your stablecoins. What should you ask first?",
      options: [
        { id: "a", text: "Whether the rate will rise next year", explain: "Not the key question." },
        { id: "b", text: "How quickly you can deposit more money into the account", explain: "Not the key question." },
        { id: "c", text: "Where the yield comes from and who bears the risk", explain: "Right. High yield means risk." },
        { id: "d", text: "Nothing; stablecoins are risk-free", explain: "They are not." },
      ],
      correct: "c",
    },
  ],
  practical: {
    title: "Reserve check",
    instructions: "Research only.",
    steps: [
      "Pick one large stablecoin and find its issuer's latest reserve report or attestation.",
      "Note the share held in cash, bills and anything else.",
      "Note who is allowed to redeem directly with the issuer.",
    ],
    reflectionPrompt: "Would you keep your savings in this coin? What would change your mind?",
  },
  glossary: ["depeg", "algorithmic-stablecoin", "redemption"],
  next: "cy-volatility",
};

export const CY4_VOLATILITY: Lesson = {
  id: "cy-volatility",
  trackId: T,
  order: 4,
  format: "full",
  title: "Crypto volatility and the 24/7 market",
  summary: "Crypto prices typically swing several times more than large shares, trade every day of the year, and are often traded with high leverage. Size positions for that.",
  minutes: 22,
  objectives: [
    "Compare crypto volatility with that of large shares, using annualised volatility.",
    "Size a position so a bigger daily move does not mean a bigger loss.",
    "Explain the risks of a market that never closes.",
    "Describe perpetual futures and funding rates.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "A position size that feels normal for a large share can be several times too big for a crypto coin, because the coin can move much more in a day." },
        { kind: "p", text: "And crypto never closes. A big move can happen at 3 a.m. on a Sunday while you sleep." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Measuring how much it moves",
      blocks: [
        { kind: "p", text: "[[volatility|Volatility]] measures how much a price swings. To compare markets, it is often scaled to a year: [[annualised-volatility|annualised volatility]] ≈ typical daily move × √(trading days a year)." },
        { kind: "p", text: "Shares trade about 252 days a year; crypto trades 365. A coin that moves 4% on a typical day has an annualised volatility around 76%; a share that moves 1% a day is around 16%." },
        { kind: "callout", tone: "key", title: "Key idea", text: "For the same money at risk, a market that moves four times as much needs a position about a quarter of the size." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Same risk, different size",
      blocks: [
        { kind: "interactive", widget: "cy-volatility", title: "Size a crypto position like a share position", caption: "Set a typical daily move for a coin and for a share. Both positions are sized to lose the same amount if the stop, a few daily moves away, is hit. All moves are made up." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "Leverage and funding",
      blocks: [
        { kind: "p", text: "Many crypto venues offer [[perpetual-future|perpetual futures]]: contracts with no expiry that track the coin's price, usually with high [[leverage]]." },
        { kind: "p", text: "Longs and shorts pay each other a [[funding-rate|funding rate]] every few hours to keep the contract near the spot price. In a hot market, longs can pay a lot just to hold." },
        { kind: "callout", tone: "warn", title: "Watch out", text: "At 20× leverage, a 5% move against you can wipe out the margin on the position. In crypto, 5% can happen in minutes." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: fragmented, always-on markets",
      blocks: [
        { kind: "concept-card", card: {
          name: "Volatility-adjusted position size",
          what: "Choosing the position size from how much the market typically moves, so each trade risks a planned amount.",
          whyItExists: "The same position in a calm and a wild market carries very different risk.",
          problemSolved: "It stops a volatile market from quietly turning a small planned loss into a large one.",
          mechanics: "Pick the money you will risk. Put the stop a few typical daily moves away. Size = money at risk ÷ stop distance.",
          math: "Size (units) = account × risk % ÷ (k × daily move % × price). Annualised vol ≈ daily vol × √365 for crypto.",
          howTradersUseIt: "They measure recent volatility (often with the average true range) and resize positions as it changes.",
          whenUseful: "In every market, and most of all in ones whose volatility changes fast.",
          whenItFails: "When the market gaps straight through the stop, as happens around big news or during exchange outages.",
          limitations: "Recent volatility is only an estimate; it can jump suddenly.",
          misconceptions: "That a tight stop makes a big position safe. A tight stop in a wild market is hit by noise.",
          realExample: "In the tool, a coin moving 4% a day gets a position about a quarter the size of a share moving 1% a day, for the same risk.",
          exercise: "Estimate the typical daily move of one coin from the last 20 daily candles on a chart.",
          practicalTest: "Write down the position size you would use in that coin for a 1% risk, before ever trading it.",
        } },
        { kind: "research", research: {
          title: "Trading and arbitrage in cryptocurrency markets",
          authors: "Igor Makarov and Antoinette Schoar",
          year: 2020,
          venue: "Journal of Financial Economics 135(2)",
          peerReviewed: true,
          question: "Do prices of the same coin differ across exchanges, and why do the gaps persist?",
          methodology: "Comparison of tick-level Bitcoin prices across many exchanges and countries, with analysis of what drives the price gaps.",
          data: "Prices and volumes from 34 exchanges in 19 countries, December 2017 to February 2018.",
          findings: "Large, recurring price gaps opened between exchanges, much larger between countries than within them and especially wide in Korea and Japan. The gaps tended to open together when Bitcoin rose sharply; capital controls helped them persist.",
          limitations: "A short and unusually frenzied period; arbitrage has become more efficient since.",
          practicalMeaning: "\"The price\" of a coin depends on where you trade. Fragmented markets can move differently, especially in stress.",
          status: "regime-sensitive",
          url: "https://doi.org/10.1016/j.jfineco.2019.07.001",
          verified: true,
        } },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Systematic traders", view: "Scale every position by recent volatility and cut leverage when volatility rises." },
          { name: "Derivatives desks", view: "Watch funding rates and open interest for signs of crowded leveraged bets." },
          { name: "Risk managers", view: "Plan for weekend and overnight moves, and for exchange outages during spikes." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Using share-sized positions in crypto.", why: "The coin moves several times more each day.", instead: "Size from the coin's own volatility." },
          { mistake: "High leverage on perpetuals.", why: "Small moves wipe out the margin.", instead: "Use low or no leverage while learning." },
          { mistake: "Ignoring funding costs.", why: "Paying funding every few hours adds up.", instead: "Check the funding rate before holding a leveraged position for days." },
        ] },
      ],
    },
    {
      id: "summary",
      part: "summary",
      heading: "Summary",
      blocks: [
        { kind: "summary",
          keyConcepts: [
            "Crypto typically moves several times more than large shares.",
            "It trades 365 days a year, so moves happen when other markets are shut.",
            "Position size should shrink as volatility grows.",
            "Perpetual futures add leverage and funding costs.",
          ],
          equations: [
            { label: "Annualised volatility", formula: "≈ daily volatility × √(trading days a year)" },
            { label: "Size", formula: "= money at risk ÷ (k × daily move × price)" },
          ],
          implications: ["Measure before you size.", "Plan for weekends and nights.", "Keep leverage low."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Estimate the typical daily move of Bitcoin and of one large share from recent charts.",
          "Work out the position size in each for the same 1% risk on a made-up account.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "cy-volatility-ex",
    title: "Annualise a daily move",
    prompt: "A coin's typical daily move is 3%. It trades 365 days a year. Estimate its annualised volatility, in %.",
    unit: "%",
    answer: 57.3,
    tolerance: 0.5,
    hint: "Multiply the daily move by the square root of 365 (about 19.1).",
    solution: "3% × √365 ≈ 3 × 19.10 = 57.3%.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "Why does crypto use 365 rather than 252 when annualising volatility?",
      options: [
        { id: "a", text: "Crypto is more volatile", explain: "That is not why the day count differs." },
        { id: "b", text: "Regulators require it", explain: "No such rule." },
        { id: "c", text: "It trades every day of the year", explain: "Right." },
        { id: "d", text: "It makes the number smaller and easier to compare with the volatility of shares", explain: "It makes it larger, not smaller." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "A coin moves four times as much per day as a share. For the same money at risk, the coin position should be about…",
      options: [
        { id: "a", text: "Four times larger", explain: "That multiplies the risk." },
        { id: "b", text: "A quarter of the size", explain: "Right." },
        { id: "c", text: "The same size", explain: "Then it risks four times as much." },
        { id: "d", text: "Half the size", explain: "Still twice the risk." },
      ],
      correct: "b",
    },
    {
      id: "q3",
      prompt: "What is a funding rate?",
      options: [
        { id: "a", text: "Interest your bank pays", explain: "Unrelated." },
        { id: "b", text: "A one-off exchange sign-up bonus", explain: "Not it." },
        { id: "c", text: "The fee to withdraw coins to your own wallet once a month", explain: "Not it." },
        { id: "d", text: "A regular payment between longs and shorts on perpetual futures", explain: "Right." },
      ],
      correct: "d",
    },
    {
      id: "q4",
      prompt: "What is a risk of a market that never closes?",
      options: [
        { id: "a", text: "Large moves can happen while you are asleep or away", explain: "Right." },
        { id: "b", text: "Prices cannot gap", explain: "Gaps and spikes still happen." },
        { id: "c", text: "You can never place a stop", explain: "You can." },
        { id: "d", text: "Volatility becomes lower at weekends, so there is nothing to worry about", explain: "Not reliably." },
      ],
      correct: "a",
    },
  ],
  practical: {
    title: "Volatility comparison",
    instructions: "Research only. Do not place trades.",
    steps: [
      "On a daily chart, note the size of the last 10 daily ranges of Bitcoin and of a large share.",
      "Average each to estimate a typical daily move.",
      "Size a made-up position in each for the same money at risk.",
    ],
    reflectionPrompt: "How did the crypto position size compare with what you would have guessed?",
  },
  glossary: ["perpetual-future", "funding-rate", "annualised-volatility"],
  next: "cy-scams",
};

export const CY5_SCAMS: Lesson = {
  id: "cy-scams",
  trackId: T,
  order: 5,
  format: "full",
  title: "Scams, manipulation and staying safe",
  summary: "Crypto attracts fraud: fake platforms, giveaways, pump-and-dumps and rug pulls. A few rules stop most of it.",
  minutes: 20,
  objectives: [
    "Recognise the common crypto scams and their warning signs.",
    "Explain how a pump-and-dump works and who loses.",
    "Apply a short safety routine before sending money or connecting a wallet.",
    "Know what to do if you think you have been scammed.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Crypto transfers are usually final. There is no bank to reverse a payment sent to a thief." },
        { kind: "p", text: "Scams target beginners most, often through social media, dating apps and group chats." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "The usual tricks",
      blocks: [
        { kind: "defs", items: [
          { term: "[[phishing|Phishing]]", text: "Fake sites, emails and apps that steal logins or seed phrases." },
          { term: "[[ponzi-scheme|Ponzi scheme]]", text: "Pays old investors with new investors' money and promises steady high returns." },
          { term: "[[pump-and-dump|Pump and dump]]", text: "Organisers buy a tiny token, hype it, and sell to the people who follow." },
          { term: "[[rug-pull|Rug pull]]", text: "A project's creators drain the money and vanish." },
        ] },
        { kind: "callout", tone: "key", title: "Key idea", text: "Guaranteed high returns, urgency and requests for your seed phrase are warning signs on their own. Two together: walk away." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Check an offer",
      blocks: [
        { kind: "interactive", widget: "cy-scam-check", title: "Red-flag checker", caption: "Tick the signs you see in an offer. Each sign adds to a warning score and explains why it matters. A low score does not prove an offer is safe." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "A pump-and-dump, step by step",
      blocks: [
        { kind: "step-list", items: [
          { title: "Quiet buying", text: "Organisers buy a little-traded token cheaply." },
          { title: "The signal", text: "A group chat announces the token at a set time, often with claims of \"big news\"." },
          { title: "The rush", text: "Members buy at once; the price jumps within seconds on thin [[liquidity]]." },
          { title: "The dump", text: "Organisers sell into the buying. The price collapses, often below where it started." },
        ] },
        { kind: "callout", tone: "example", title: "Example", text: "In a made-up pump, the token rises from 1 cent to 4 cents in two minutes and is back at 1 cent in ten. Organisers who bought at 1 and sold at 3 made money; most members bought near the top." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: why thin markets are easy to move",
      blocks: [
        { kind: "concept-card", card: {
          name: "Market manipulation in thin markets",
          what: "Moving a price on purpose through coordinated buying, fake volume or false news, to profit at others' expense.",
          whyItExists: "Small tokens on lightly regulated venues have few real buyers and sellers, so modest money moves the price a lot.",
          problemSolved: "Knowing the mechanics helps you avoid being the late buyer who funds the organisers' profit.",
          mechanics: "With little in the [[order-book|order book]], a burst of buying lifts the price sharply. Early holders sell into it, and with no real demand behind it the price falls back.",
          math: "Price impact grows as the order size becomes large relative to the depth available near the current price.",
          howTradersUseIt: "Experienced traders avoid tokens with low volume, concentrated holders and sudden promotion.",
          whenUseful: "Before buying any small, newly promoted or suddenly popular token.",
          whenItFails: "Large, liquid coins are much harder to move this way, though not immune to manipulation.",
          limitations: "Manipulation is hard to prove from the outside; warning signs are probabilities, not certainty.",
          misconceptions: "That joining early in a pump group guarantees profit. Organisers are earlier still.",
          realExample: "The study below tracked hundreds of pump-and-dump events organised in public chat groups.",
          exercise: "Look up the 24-hour volume of a small token and compare it with Bitcoin's.",
          practicalTest: "Write a rule: the minimum daily volume a coin must have before you would consider trading it.",
        } },
        { kind: "research", research: {
          title: "The Anatomy of a Cryptocurrency Pump-and-Dump Scheme",
          authors: "Jiahua Xu and Benjamin Livshits",
          year: 2019,
          venue: "28th USENIX Security Symposium",
          peerReviewed: true,
          question: "How do organised crypto pump-and-dumps work, and can the targeted coins be predicted?",
          methodology: "Collection of pump announcements from Telegram channels, matched with exchange price and volume data, and a model to predict which coins would be pumped.",
          data: "412 pump-and-dump events organised in Telegram channels between June 2018 and February 2019.",
          findings: "Pumps targeted small, illiquid coins and produced sharp, short-lived price spikes followed by collapses; organisers profited mainly at the expense of members who bought late. The targeted coins could be predicted from market features with some success.",
          limitations: "Covers one period and the channels the authors could observe; schemes adapt.",
          practicalMeaning: "If you hear about a pump in a group, you are almost certainly not early enough. Avoid thin tokens.",
          status: "regime-sensitive",
          url: "https://www.usenix.org/conference/usenixsecurity19/presentation/xu-jiahua",
          verified: true,
        } },
      ],
    },
    {
      id: "professionals",
      part: "professionals",
      heading: "What professionals look for",
      blocks: [
        { kind: "methodologies", items: [
          { name: "Security teams", view: "Assume every link and attachment could be hostile, and verify addresses on a second channel." },
          { name: "Compliance teams", view: "Check that platforms are registered with a financial regulator where you live." },
          { name: "Experienced traders", view: "Ignore unsolicited tips and treat promised returns as a red flag, not a reason to invest." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Trusting a balance on an unknown platform.", why: "Fake platforms show made-up profits, then demand a \"fee\" to withdraw.", instead: "Test a small withdrawal first, and check the regulator's register." },
          { mistake: "Clicking links in messages.", why: "Phishing sites copy real ones closely.", instead: "Type the address yourself or use a saved bookmark." },
          { mistake: "Sending more money to recover losses.", why: "\"Recovery\" services are often the same scammers again.", instead: "Report to the police and your financial regulator." },
        ] },
      ],
    },
    {
      id: "summary",
      part: "summary",
      heading: "Summary",
      blocks: [
        { kind: "summary",
          keyConcepts: [
            "Crypto payments are usually final, so scams are costly.",
            "Seed-phrase requests, guaranteed returns and urgency are red flags.",
            "Pump-and-dumps profit organisers at late buyers' expense.",
            "Fake platforms often block withdrawals behind made-up fees.",
          ],
          implications: ["Never share a seed phrase.", "Avoid thin, hyped tokens.", "Verify every platform and address yourself."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Find your country's financial regulator's warning list of unauthorised firms.",
          "Write your personal rule for checking a crypto platform before sending money.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "cy-scams-ex",
    title: "Scam or not?",
    prompt: "Sort each situation.",
    categories: [
      { id: "scam", label: "Warning sign of a scam" },
      { id: "normal", label: "Normal practice" },
    ],
    items: [
      { id: "1", text: "A message promises 2% a day, guaranteed", category: "scam", explain: "No real investment guarantees that." },
      { id: "2", text: "An exchange asks you to set up an authenticator app", category: "normal", explain: "That protects your account." },
      { id: "3", text: "Support asks for your 24 recovery words", category: "scam", explain: "No genuine support needs them." },
      { id: "4", text: "A wallet shows the full address for you to check before sending", category: "normal", explain: "Checking addresses is good practice." },
      { id: "5", text: "A platform needs a \"tax fee\" before you can withdraw your profits", category: "scam", explain: "A classic fake-platform trick." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "Who usually loses money in a pump-and-dump?",
      options: [
        { id: "a", text: "The organisers", explain: "They profit." },
        { id: "b", text: "Nobody; everyone sells at the top", explain: "Not everyone can." },
        { id: "c", text: "People who buy after the announcement", explain: "Right. They buy from the organisers." },
        { id: "d", text: "The exchange, which has to pay back everyone who bought the token at a loss", explain: "Exchanges do not repay them." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "A platform shows large profits but asks for a fee before you can withdraw. What is most likely?",
      options: [
        { id: "a", text: "A normal tax rule", explain: "Taxes are not collected this way." },
        { id: "b", text: "A fake platform whose balance is not real", explain: "Right." },
        { id: "c", text: "A temporary technical delay", explain: "Fees are the tell." },
        { id: "d", text: "A reward for being an early user of the platform", explain: "Not a reward." },
      ],
      correct: "b",
    },
    {
      id: "q3",
      prompt: "What is the safest way to reach your exchange's website?",
      options: [
        { id: "a", text: "A saved bookmark or typing the address yourself", explain: "Right." },
        { id: "b", text: "A link in an urgent email", explain: "Classic phishing route." },
        { id: "c", text: "The first search advert", explain: "Fake sites buy adverts." },
        { id: "d", text: "A link from a friend's message", explain: "Accounts get hijacked." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "You realise you sent coins to a scammer. What should you do?",
      options: [
        { id: "a", text: "Pay a \"recovery service\" that contacts you", explain: "Often the same scammers." },
        { id: "b", text: "Send more to unlock the first payment", explain: "That loses more." },
        { id: "c", text: "Delete everything and say nothing", explain: "Reporting helps others and may help you." },
        { id: "d", text: "Report it to the police and your financial regulator", explain: "Right." },
      ],
      correct: "d",
    },
  ],
  practical: {
    title: "A personal safety routine",
    instructions: "Writing only.",
    steps: [
      "Write three rules you will follow before sending any crypto.",
      "Find your regulator's register and warning list and bookmark both.",
      "Share the rules with someone you trade with.",
    ],
    reflectionPrompt: "Which of the red flags would be most likely to catch you out, and why?",
  },
  glossary: ["pump-and-dump", "rug-pull", "phishing", "ponzi-scheme"],
  next: "co-energy",
};
