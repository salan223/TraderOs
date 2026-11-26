import type { AssessmentQuestion, ChoiceOption, ConceptRemediation, GradedItem, ScenarioItem, TrackAssessment } from "../types";

/*
  Track 4 assessment: Cryptocurrency.
  Position sizing for crypto's much larger daily moves is safety-critical:
  getting it wrong turns a planned small loss into a large one. Every price,
  move and balance here is a made-up number for the sums.
*/

const T = "crypto";

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
    "Questions on every idea from the five lessons: how blockchains record ownership, custody and keys, stablecoins and runs, volatility and position sizing, and scams, with calculations and applied scenarios. You need 90% or more, a sound decision in the scenario, and every safety-critical question right: sizing positions for crypto's larger moves.",
  concepts: [
    {
      id: "cy-chain",
      title: "How blockchains record ownership",
      lessonIds: ["cy-blockchains"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "It is easy to think a secure blockchain makes a coin a safe investment. The chain protects the record of who owns what; it does nothing to stop the price falling.",
        altExplanation: "Each block stores the hash of the block before it. Edit an old transaction and its hash changes, so the next block's stored link no longer matches, and every later block becomes invalid. Proof of work or proof of stake makes rewriting the chain too costly.",
        altExample: "A made-up ledger of four blocks records small payments. Someone edits block two to raise an amount; blocks three and four now point to a fingerprint that no longer exists.",
        practice: single("What does each block store to link it to the one before?", [
          ["a", "The previous block's hash", "Right. That is what the lesson showed."],
          ["b", "The price of the coin", "Not part of the link."],
          ["c", "The owner's name and home address", "Addresses, not names, appear."],
          ["d", "A password", "No password is stored."],
        ], "a"),
      },
      flashcard: { front: "Blockchain link", back: "Each block stores hash(previous block). Editing history breaks every later link. Ledger security ≠ price safety." },
    },
    {
      id: "cy-keys",
      title: "Custody, keys and seed phrases",
      lessonIds: ["cy-custody"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "Coins in an exchange account can feel like coins you own outright. They are a claim on the exchange, which holds the keys; if it fails, you are a creditor.",
        altExplanation: "Whoever holds the private keys controls the coins. Exchange custody adds the exchange's risk. Self-custody removes that, but if you lose the device and the seed phrase, nobody can restore access. The seed phrase is the master key and must never be shared.",
        altExample: "A made-up trader keeps a small working balance on an exchange and moves the rest to a hardware wallet, with the recovery words written on paper in two separate safe places.",
        practice: tf("A genuine wallet support team may need your seed phrase to fix a problem.", false, "False. No genuine support ever needs it."),
      },
      flashcard: { front: "Custody", back: "Keys = control. Exchange balance = claim on the exchange. Never share a seed phrase." },
    },
    {
      id: "cy-stable",
      title: "Stablecoins, pegs and runs",
      lessonIds: ["cy-stablecoins"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Stablecoins are often treated as the same as dollars in a bank. They are promises backed by reserves, usually without deposit insurance, and pegs can break in a run.",
        altExplanation: "A reserve-backed coin holds cash and short bills; arbitrage traders buy below $1 and redeem at $1, which holds the peg. If reserves are risky or stuck, redemptions force sales at a discount, leaving less backing for those who stay, which encourages more to run.",
        altExample: "A made-up coin backs 100 coins with 30 in cash and 70 in risky loans. When half the holders cash out, the loans are sold at a deep discount and the remaining coins are backed by well under $1 each.",
        practice: single("What usually holds a reserve-backed stablecoin near $1?", [
          ["a", "A government guarantee", "Usually none exists."],
          ["b", "Arbitrage through redemption at $1", "Right. That is what the lesson showed."],
          ["c", "Mining rewards", "Unrelated to the question."],
          ["d", "The exchange setting the price by hand each morning before trading opens", "Prices are set by trading."],
        ], "b"),
      },
      flashcard: { front: "Stablecoin peg", back: "Held by redemption and arbitrage; only as strong as reserves that can be sold quickly. Runs reward leaving early." },
    },
    {
      id: "cy-sizing",
      title: "Crypto volatility and position sizing",
      lessonIds: ["cy-volatility"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "A position size that feels normal for a large share can seem fine in crypto. A coin that moves four times as much per day needs about a quarter of the size for the same money at risk.",
        altExplanation: "Pick the money you will risk, put the stop a few typical daily moves away, and divide: size = money at risk ÷ stop distance. Annualised volatility ≈ daily move × √365 for crypto, which trades every day, against √252 for shares.",
        altExample: "A made-up account risks $150 on a coin whose typical daily move is 5%, with a stop two moves away (10%). The position is $1,500, not the $6,000 the trader first planned.",
        practice: numeric("A made-up account will risk $200. The stop is 8% below entry. What position size, in $, risks exactly that?", "$", 2500, 1, "200 ÷ 0.08 = 2,500."),
      },
      flashcard: { front: "Crypto sizing", back: "Size = money at risk ÷ stop distance. Bigger daily moves → smaller positions. Annualise crypto with √365." },
    },
    {
      id: "cy-scam",
      title: "Scams and manipulation",
      lessonIds: ["cy-scams"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Joining a pump group early can look like a way to profit. The organisers bought earlier still and sell into the members' buying, so most members buy near the top.",
        altExplanation: "Warning signs include promised or guaranteed high returns, urgency, unsolicited contact, requests for seed phrases and fees to withdraw. Thin, newly promoted tokens are easy to pump and dump. Crypto payments are usually final, so prevention is the only protection.",
        altExample: "A made-up platform shows a fast-growing balance, then asks for a \"release fee\" before any withdrawal. The balance never existed; the fee is the scam.",
        practice: single("Which is the strongest single sign of a crypto scam?", [
          ["a", "The app has a dark theme", "Irrelevant."],
          ["b", "The token has a long history", "Not a red flag."],
          ["c", "The platform publishes fees", "Normal practice."],
          ["d", "A request for your seed phrase", "Right. That is what the lesson showed."],
        ], "d"),
      },
      flashcard: { front: "Scam red flags", back: "Seed-phrase requests, guaranteed returns, urgency, unsolicited contact, withdrawal fees, thin hyped tokens." },
    },
    {
      id: "cy-applied",
      title: "Applying crypto knowledge to decisions",
      lessonIds: ["cy-custody", "cy-volatility", "cy-scams"],
      critical: true,
      safetyCritical: false,
      applied: true,
      remediation: {
        misconception: "A strong price move or a convincing message can make checks feel like a waste of time. In crypto, skipping checks is how most avoidable losses happen.",
        altExplanation: "Use one routine for every decision: confirm the platform and address yourself, size from the coin's own volatility, keep only a trading balance on any exchange, and walk away from any offer with a red flag. Write it down before you need it.",
        altExample: "A made-up trader is offered a token \"about to list on a big exchange\" by a stranger. They check the volume, find it tiny, and decline without buying.",
        practice: scenario(
          "A friend sends a link saying an exchange is giving away free coins if you connect your wallet and approve a transaction.",
          "What is the soundest response?",
          [
            ["a", "Connect quickly before the offer ends", "Approving unknown transactions can drain the wallet.", "unsound"],
            ["b", "Ignore the link and check the exchange's official site or account directly", "Sound: verify through a channel you trust.", "sound"],
            ["c", "Connect a wallet with only a little in it", "Limits damage but still trusts a likely scam.", "partial"],
            ["d", "Forward it to others first", "Spreads the scam.", "unsound"],
          ],
        ),
      },
      flashcard: { front: "Crypto routine", back: "Verify yourself, size from volatility, limit exchange balances, walk away at red flags." },
    },

    {
      id: "cy-consensus",
      title: "Consensus and the main networks",
      lessonIds: ["cy-blockchains"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Proof of work and proof of stake can sound like marketing labels. They are the rules that decide who adds the next block and what cheating costs.",
        altExplanation: "In proof of work, miners spend computing power and electricity to win the right to add a block; rewriting history means outspending the honest network. In proof of stake, validators lock coins as collateral and lose part of them if they break the rules.",
        altExample: "In a made-up network, a validator signs two conflicting blocks at the same height. The protocol detects it and destroys part of the validator's staked coins.",
        practice: single("Which network switched from proof of work to proof of stake in 2022?", [
          ["a", "Bitcoin", "Bitcoin still uses proof of work."],
          ["b", "Ethereum", "Right. That is what the lesson showed."],
          ["c", "Every network at the same time", "Each network chooses its own rules."],
          ["d", "None; networks cannot change their rules", "Ethereum did change."],
        ], "b"),
      },
      flashcard: { front: "Consensus", back: "Proof of work: costly puzzles (Bitcoin). Proof of stake: locked collateral that cheaters lose (Ethereum since 2022)." },
    },
    {
      id: "cy-runs",
      title: "Stablecoin runs and reserve quality",
      lessonIds: ["cy-stablecoins"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A stablecoin with reserves equal to its coins can seem run-proof. If the reserves are risky or slow to sell, a rush of redemptions forces sales at a discount and leaves later holders short.",
        altExplanation: "Redemptions are paid first from cash, then from assets that must be sold. Fire-sale discounts mean the reserves raise less than their book value. Backing per remaining coin = (reserves − paid out − fire-sale losses) ÷ coins left.",
        altExample: "A made-up coin holds full reserves, but most are in loans that sell at a third off in a hurry. After a wave of redemptions, the remaining coins are backed by about 85 cents each.",
        practice: numeric("A made-up stablecoin has 200 coins outstanding and $180 of reserves left after a run's losses. What is the backing per coin, in $?", "$", 0.9, 0.005, "180 ÷ 200 = 0.90."),
      },
      flashcard: { front: "Runs", back: "Cash pays first; then assets are sold at a discount. Backing per coin = (reserves − paid − losses) ÷ coins left." },
    },
    {
      id: "cy-leverage",
      title: "Leverage, funding and 24/7 risk",
      lessonIds: ["cy-volatility"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "High leverage on crypto perpetual futures can look like a way to make a small account grow fast. In a market that moves several percent in minutes, it mostly makes small accounts disappear fast.",
        altExplanation: "Loss on margin ≈ leverage × price move. At 10×, a 10% move against you wipes out the margin. Perpetual futures also charge or pay a funding rate every few hours, which adds up when a position is held for days.",
        altExample: "A made-up trader opens a 25× long. The coin dips 4% overnight on a weekend while they sleep, and the position is closed with the margin gone.",
        practice: numeric("At 8× leverage, roughly what price move against a position, in %, wipes out its margin?", "%", 12.5, 0.1, "100 ÷ 8 = 12.5%."),
      },
      flashcard: { front: "Crypto leverage", back: "Margin wiped out at a move of about 100% ÷ leverage. Funding is paid every few hours on perpetuals. Moves happen 24/7." },
    },
    {
      id: "cy-pump",
      title: "Pump-and-dumps and thin markets",
      lessonIds: ["cy-scams"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A token rising fast after a group-chat signal can look like proof the tip was good. In a pump, the rise is the organisers' buyers arriving, and it reverses as soon as the organisers sell.",
        altExplanation: "Pumps target thin tokens where modest buying moves the price a lot. Organisers buy first, announce, then sell into the rush. Most members buy near the top and are left holding a falling token.",
        altExample: "A made-up token with almost no daily volume jumps fourfold minutes after a chat announcement, then falls below its starting price within the hour.",
        practice: single("Which tokens do pump-and-dump groups usually target?", [
          ["a", "Bitcoin", "Too large and liquid to move easily."],
          ["b", "Tokens with deep order books on several large exchanges", "Hard to move with modest money."],
          ["c", "Small, thinly traded tokens", "Right. That is what the lesson showed."],
          ["d", "Government bonds", "Not traded in crypto pump groups."],
        ], "c"),
      },
      flashcard: { front: "Pump-and-dump", back: "Organisers buy a thin token, hype it, sell into the rush. Late buyers fund their profit." },
    },
  ],
  questions: [
    // cy-chain
    q("cyq-ch-1", "cy-chain", "knowledge", single("Why does editing an old transaction break a blockchain?", [
      ["a", "Old blocks are encrypted with a password", "Most chains are public."],
      ["b", "The edited block's hash changes, so later links no longer match", "Right. That is what the lesson showed."],
      ["c", "A central bank checks every change", "No central authority."],
      ["d", "Transactions expire", "They do not."],
    ], "b"), "Each block stores the previous block's hash. An edit changes that hash and breaks every later link, which other computers on the network reject."),
    q("cyq-ch-2", "cy-chain", "knowledge", tf("A blockchain that has never been hacked guarantees the coin's price will hold up.", false, "False. Ledger security says nothing about price."), "The chain protects records, not value. Secure coins have fallen by most of their value in bear markets."),
    q("cyq-ch-3", "cy-consensus", "knowledge", single("What secures a proof-of-stake network?", [
      ["a", "Electricity spent on puzzles", "That is proof of work."],
      ["b", "Bank guarantees", "None are involved."],
      ["c", "A vote by every coin holder on each transaction", "Not how it works."],
      ["d", "Validators' locked coins, which they lose for cheating", "Right. That is what the lesson showed."],
    ], "d"), "In proof of stake, validators put up coins as collateral and lose them if they break the rules; Ethereum has used it since 2022."),
    q("cyq-ch-4", "cy-consensus", "knowledge", multi("Which describe Ethereum rather than Bitcoin? Select all that apply.", [
      ["a", "Runs programs called smart contracts", "Right. It belongs in the answer."],
      ["b", "Supply capped at 21 million coins", "That is Bitcoin."],
      ["c", "Users pay gas fees for computation", "Right. It belongs in the answer."],
      ["d", "Uses proof of stake today", "Right. Since 2022."],
    ], ["a", "c", "d"]), "Ethereum is built to run programs, charges gas for computation, and moved to proof of stake in 2022; Bitcoin's supply cap is 21 million."),

    // cy-keys
    q("cyq-ke-1", "cy-keys", "knowledge", single("What do you own when coins show in an exchange account?", [
      ["a", "A claim on the exchange, which holds the keys", "Right. That is what the lesson showed."],
      ["b", "Coins at an address only you control", "That is self-custody."],
      ["c", "Insured bank deposits", "Usually not insured."],
      ["d", "Shares in the exchange", "No: that is not how it works."],
    ], "a"), "The exchange holds the private keys and owes you a balance. If it fails, customers become creditors."),
    q("cyq-ke-2", "cy-keys", "knowledge", tf("Anyone who has your seed phrase can take your coins.", true, "True. It recreates your keys."), "A seed phrase recreates the private keys, so whoever holds it controls the coins. That is why it must never be shared or typed into a website."),
    q("cyq-ke-3", "cy-keys", "knowledge", single("What is the main risk of a hardware (cold) wallet?", [
      ["a", "Exchange bankruptcy", "The coins are not on an exchange."],
      ["b", "Remote hackers reading the keys over the internet", "The keys stay offline."],
      ["c", "Losing both the device and the seed backup", "Right. That is what the lesson showed."],
      ["d", "It stops working at weekends", "No: that is not how it works."],
    ], "c"), "Cold storage moves the risk onto you: lose the device and the backup and the coins are unrecoverable."),
    q("cyq-ke-4", "cy-keys", "knowledge", tf("Proof of reserves usually proves an exchange has more assets than debts.", false, "False. It usually shows assets only."), "A snapshot of assets does not show liabilities, so it is not a full proof of solvency."),

    // cy-stable
    q("cyq-st-1", "cy-stable", "knowledge", single("A dollar stablecoin trades at $0.97 and redemption works. What do arbitrage traders do?", [
      ["a", "Sell it", "Buying is the profitable trade."],
      ["b", "Nothing", "There is a profit."],
      ["c", "Short Bitcoin", "Unrelated to the question."],
      ["d", "Buy it and redeem it for $1", "Right. That is what the lesson showed."],
    ], "d"), "Buying below $1 and redeeming at $1 earns the gap, and the buying pushes the price back toward the peg."),
    q("cyq-st-2", "cy-stable", "knowledge", tf("Algorithmic stablecoins without safe reserves have collapsed in practice.", true, "True. TerraUSD in 2022 is one example."), "TerraUSD lost its peg in May 2022 and collapsed toward zero, along with its sister token."),
    q("cyq-st-3", "cy-runs", "calculation", numeric("A made-up stablecoin has issued 1,000 coins and holds $930 of reserves. Ignoring sale discounts, what is the backing per coin, in $?", "$", 0.93, 0.005, "930 ÷ 1,000 = 0.93."), "Backing per coin = reserves ÷ coins outstanding. Below $1, holders who leave first can be paid in full while later ones may not."),
    q("cyq-st-4", "cy-runs", "knowledge", single("Why can a stablecoin run speed up once it starts?", [
      ["a", "Early leavers get $1; later ones may get less", "Right. That is what the lesson showed."],
      ["b", "The blockchain doubles its fees", "Not the mechanism."],
      ["c", "Regulators require holders to sell", "No: that is not how it works."],
      ["d", "New coins are printed automatically for every redemption", "Not how reserve-backed coins work."],
    ], "a"), "If reserves fall short, there is a first-come advantage, which encourages more holders to redeem early."),

    // cy-sizing (safety-critical)
    q("cyq-sz-1", "cy-sizing", "calculation", numeric("A coin's typical daily move is 2%. Using 365 trading days, what is its annualised volatility, in %? (√365 ≈ 19.1)", "%", 38.2, 0.5, "2 × 19.1 ≈ 38.2%."), "Annualised volatility ≈ daily volatility × √(trading days). Crypto trades every day, so 365 is used."),
    q("cyq-sz-2", "cy-sizing", "calculation", numeric("A made-up account risks $300 on a coin. The stop is placed 6% below entry. What position size, in $, risks exactly $300?", "$", 5000, 1, "300 ÷ 0.06 = 5,000."), "Size = money at risk ÷ stop distance in %. A wider stop for a more volatile coin means a smaller position."),
    q("cyq-sz-3", "cy-sizing", "knowledge", single("A coin moves three times as much per day as a share. For the same money at risk, the coin position should be…", [
      ["a", "Three times larger", "That triples the risk."],
      ["b", "About a third of the size", "Right. That is what the lesson showed."],
      ["c", "The same size with a tighter stop", "A tight stop is hit by normal noise."],
      ["d", "Twice as large", "More risk, not less."],
    ], "b"), "With stops set at a multiple of the typical daily move, size scales inversely with volatility."),
    q("cyq-sz-4", "cy-leverage", "knowledge", tf("At 20× leverage, a 5% move against a position can wipe out its margin.", true, "True. 20 × 5% = 100%."), "Leverage multiplies moves: at 20×, a 5% adverse move equals 100% of the margin. In crypto that can happen in minutes."),
    q("cyq-sz-5", "cy-leverage", "knowledge", single("Why is weekend risk different in crypto than in shares?", [
      ["a", "Crypto keeps trading, so big moves can happen while you are away", "Right. That is what the lesson showed."],
      ["b", "Crypto prices are frozen at weekends", "They are not."],
      ["c", "Stops do not exist in crypto", "They do exist in crypto."],
      ["d", "Weekend volatility is legally capped at 1%", "No such cap."],
    ], "a"), "Crypto trades 24/7, so a stop can be hit at 3 a.m. on a Sunday. Plan for it with size and alerts."),

    // cy-scam
    q("cyq-sc-1", "cy-pump", "knowledge", single("Who usually loses in a pump-and-dump?", [
      ["a", "The organisers", "They profit."],
      ["b", "Members who buy after the signal", "Right. That is what the lesson showed."],
      ["c", "The exchange", "Not usually."],
      ["d", "Nobody", "Late buyers lose."],
    ], "b"), "Organisers buy early and sell into the members' rush; members who buy late are left holding the falling token."),
    q("cyq-sc-2", "cy-scam", "knowledge", tf("A platform that asks for a fee before you can withdraw your profits is likely fake.", true, "True. A classic fake-platform trick."), "Fake platforms show made-up balances and invent fees to extract more money. Test a small withdrawal before depositing more."),
    q("cyq-sc-3", "cy-scam", "knowledge", multi("Which are red flags in a crypto offer? Select all that apply.", [
      ["a", "Guaranteed 2% a day", "Right. It belongs in the answer."],
      ["b", "Pressure to decide within the hour", "Right. It belongs in the answer."],
      ["c", "Published, regulated company details you can check", "Not a red flag."],
      ["d", "A request to connect your wallet and approve an unknown transaction", "Right. It belongs in the answer."],
    ], ["a", "b", "d"]), "Guaranteed returns, urgency and blind transaction approvals are warning signs. Verifiable registration is a good sign, though not proof of safety."),
    q("cyq-sc-4", "cy-scam", "knowledge", tf("A crypto payment sent to a scammer can usually be reversed by your bank.", false, "False. Crypto transfers are usually final."), "There is no chargeback on a blockchain. Prevention is the only reliable protection; report losses to the police and regulator."),

    // cy-applied (scenarios)
    q("cyq-ap-1", "cy-applied", "applied", scenario(
      "A trader keeps all their crypto on one exchange. News reports say the exchange has paused withdrawals \"for maintenance\" during a market sell-off.",
      "Looking back, what should their process have been?",
      [
        ["a", "Keep everything on the biggest exchange, as size means safety", "Large exchanges have failed.", "unsound"],
        ["b", "Keep only a trading balance there and hold the rest in self-custody with a tested backup", "Sound: limits exchange risk.", "sound"],
        ["c", "Spread coins across two exchanges", "Better, but still all exchange risk.", "partial"],
        ["d", "Buy more while the price is low", "Ignores the custody problem.", "unsound"],
      ],
    ), "Custody is a risk decision. Limiting what sits on any platform, and protecting your own keys, prevents a single failure from taking everything."),
    q("cyq-ap-2", "cy-applied", "applied", scenario(
      "A new trader plans to buy $5,000 of a coin that moves about 6% a day, with a stop 3% below entry, risking 1% of a $10,000 account.",
      "What is the soundest assessment of the plan?",
      [
        ["a", "Fine as it is", "The stop is inside normal daily noise and the size is too large for 1% risk.", "unsound"],
        ["b", "Widen the stop to two daily moves (12%) and cut the size to about $833", "Sound: $100 ÷ 0.12 ≈ $833.", "sound"],
        ["c", "Keep the size and remove the stop", "Removes protection.", "unsound"],
        ["d", "Halve the size but keep the 3% stop", "Closer, but the stop is still inside normal noise.", "partial"],
      ],
    ), "Place the stop outside normal noise, then size from it: money at risk ÷ stop distance."),
    q("cyq-ap-3", "cy-applied", "applied", scenario(
      "A stranger in a group chat says a tiny token will \"10× tonight\" and shares a buy link. The token traded $4,000 in the last day.",
      "What is the soundest action?",
      [
        ["a", "Buy a small amount just in case", "Funds the likely pump.", "partial"],
        ["b", "Buy heavily before others do", "Late buyers in pumps lose.", "unsound"],
        ["c", "Decline: thin volume and hype from a stranger are classic pump-and-dump signs", "Sound: it follows the lesson's process.", "sound"],
        ["d", "Share the link with friends", "Spreads the scheme.", "unsound"],
      ],
    ), "Thin volume plus anonymous hype is how pump-and-dumps begin. The organisers profit from people who follow the signal."),
    q("cyq-ap-4", "cy-applied", "applied", scenario(
      "A trader holds most of their cash between trades in one stablecoin. News appears that some of its reserves are at a bank that has just failed, and it trades at $0.92.",
      "What is the soundest process going forward?",
      [
        ["a", "Assume it will recover and do nothing, ever", "Ignores concentration risk.", "unsound"],
        ["b", "Panic-sell everything at once into thin markets", "Acts on fear, at the worst price.", "partial"],
        ["c", "Borrow to buy more at $0.92", "Adds leverage to a risky bet.", "unsound"],
        ["d", "Check the issuer's own statements, then spread large balances across issuers or bank money", "Sound: verify, then reduce concentration.", "sound"],
      ],
    ), "Stablecoins are promises with different backing. Verify from primary sources and avoid holding large balances in a single issuer."),

    // added: cy-chain
    q("cyq-ch-5", "cy-chain", "knowledge", single("What is a hash function?", [
      ["a", "A way to encrypt passwords so they can be read back later", "Hashes are not meant to be reversed."],
      ["b", "The fee paid to miners", "That is a transaction fee."],
      ["c", "A calculation that turns data into a short, fixed-length fingerprint", "Right. That is what the lesson showed."],
      ["d", "A list of all coin owners' names", "Chains record addresses, not names."],
    ], "c"), "A hash function gives a fingerprint of the data; any change to the data gives a completely different fingerprint."),
    q("cyq-ch-6", "cy-chain", "knowledge", tf("Changing one character of a block's data usually leaves its hash almost the same.", false, "False. The fingerprint changes completely."), "Good hash functions are designed so that tiny input changes give completely different outputs, which makes tampering easy to spot."),
    // added: cy-consensus
    q("cyq-cn-3", "cy-consensus", "knowledge", tf("Every Bitcoin block is added through proof of work.", true, "True. Miners compete to add blocks."), "Bitcoin miners spend computing power to solve puzzles and add blocks; rewriting history would mean redoing that work."),
    q("cyq-cn-4", "cy-consensus", "knowledge", single("On Ethereum, what are gas fees paid for?", [
      ["a", "Storing coins on an exchange", "Exchanges charge their own fees."],
      ["b", "Insurance against price falls", "No insurance is involved."],
      ["c", "Converting ether into dollars at a bank", "Not what gas is."],
      ["d", "The computation needed to process a transaction or run a program", "Right. That is what the lesson showed."],
    ], "d"), "Gas pays for the work the network does to process a transaction or run a smart contract; it rises when the network is busy."),
    // added: cy-stable
    q("cyq-st-5", "cy-stable", "knowledge", single("Which describes an algorithmic stablecoin?", [
      ["a", "Backed one-for-one by cash at a bank", "That is a reserve-backed design."],
      ["b", "Holds its peg with rules for creating and destroying coins", "Right. That is what the lesson showed."],
      ["c", "Insured by a government deposit scheme", "Stablecoins usually have no such cover."],
      ["d", "A token whose price is meant to float freely with demand, like any other coin", "That would not be a stablecoin."],
    ], "b"), "Algorithmic designs try to hold the peg through supply rules instead of safe reserves, and several have collapsed."),
    q("cyq-st-6", "cy-stable", "knowledge", tf("Most stablecoins are covered by bank deposit insurance.", false, "False. They usually have none."), "Unlike a bank deposit, a stablecoin is usually a promise from a private issuer without government deposit insurance."),
    // added: cy-runs
    q("cyq-ru-3", "cy-runs", "knowledge", single("In a run, which reserves can be paid out fastest at full value?", [
      ["a", "Loans to crypto firms", "Slow and risky to sell."],
      ["b", "The issuer's own token", "It falls in the same run."],
      ["c", "Cash at banks", "Right. That is what the lesson showed."],
      ["d", "Shares in technology companies bought by the issuer last year", "Their price can fall in a crisis."],
    ], "c"), "Cash can be paid at once and at full value; anything else must be sold, often at a discount when everyone wants cash."),
    q("cyq-ru-4", "cy-runs", "calculation", numeric("A made-up issuer must raise $40 by selling risky assets at a 20% discount. How much of those assets, at book value, must it sell, in $?", "$", 50, 0.1, "40 ÷ (1 − 0.2) = 50."), "Selling at a discount means more assets must be sold to raise the same cash: amount sold = cash needed ÷ (1 − discount)."),
    // added: cy-sizing
    q("cyq-sz-6", "cy-sizing", "knowledge", tf("A wider stop for a more volatile coin should come with a smaller position for the same money at risk.", true, "True. Size = money at risk ÷ stop distance."), "Money at risk is fixed by your plan; a wider stop divides it by a larger distance, giving a smaller position."),
    // added: cy-leverage
    q("cyq-lv-3", "cy-leverage", "calculation", numeric("A made-up $5,000 perpetual long pays a 0.02% funding rate three times a day. What does it pay in funding over 10 days, in $?", "$", 30, 0.1, "5,000 × 0.0002 = 1 per payment; 3 × 10 = 30 payments; 30 × 1 = 30."), "Funding cost ≈ position size × funding rate × number of payments. Small rates add up over days."),
    q("cyq-lv-4", "cy-leverage", "knowledge", single("What keeps a perpetual future's price near the spot price?", [
      ["a", "An expiry date", "Perpetual futures have none."],
      ["b", "A daily price limit set by the government", "Not the mechanism."],
      ["c", "Regular funding payments between longs and shorts", "Right. That is what the lesson showed."],
      ["d", "Exchange staff adjusting it by hand", "Prices come from trading."],
    ], "c"), "Funding payments make it costly to hold the side that pushes the contract away from spot, pulling it back."),
    // added: cy-pump
    q("cyq-pu-2", "cy-pump", "knowledge", single("Why are thin tokens easy to pump?", [
      ["a", "They are regulated more strictly", "Usually the opposite."],
      ["b", "Their blockchains are slower", "Speed is not the reason."],
      ["c", "Little is waiting in the order book, so modest buying moves the price a lot", "Right. That is what the lesson showed."],
      ["d", "Exchanges guarantee their price", "No one guarantees it."],
    ], "c"), "With little depth near the current price, a burst of buying lifts the price sharply, and it falls back once the buying stops."),
    q("cyq-pu-3", "cy-pump", "knowledge", tf("Xu and Livshits (2019) studied pump-and-dump schemes organised in Telegram channels.", true, "True. Over 400 events in 2018–2019."), "They tracked hundreds of pumps announced in public chat channels and the sharp, short-lived price spikes that followed."),
    q("cyq-pu-4", "cy-pump", "knowledge", single("A token's price spikes minutes after a chat announcement. What usually comes next in a pump?", [
      ["a", "A sharp fall as the organisers sell", "Right. That is what the lesson showed."],
      ["b", "A steady rise for months", "Pumps reverse quickly."],
      ["c", "The exchange buys it back at the top", "Exchanges do not do this."],
      ["d", "A regulator fixes the price at the high", "No such rule exists."],
    ], "a"), "Organisers sell into the rush they created; with no real demand behind it, the price collapses."),
    // added: cy-scam
    q("cyq-sc-5", "cy-scam", "knowledge", single("What is a rug pull?", [
      ["a", "A hacked exchange", "That is a hack, not a rug pull."],
      ["b", "A sudden fall caused by bad economic news", "Not specifically a rug pull."],
      ["c", "A fee charged to close an account", "Not what the term means."],
      ["d", "A project's creators take investors' money and disappear", "Right. That is what the lesson showed."],
    ], "d"), "In a rug pull the people behind a token drain its funds, often the trading pool, and vanish."),
  ],
};

const MORE_REMEDIATION: Record<string, ConceptRemediation> = {
  "cy-chain": {
    misconception: "Some think the blockchain is stored by one company that could quietly change it. Thousands of independent computers keep copies and check every new block against the rules.",
    altExplanation: "Agreement comes from the consensus rules. In proof of work, rewriting history means redoing more computing work than the honest network; in proof of stake, cheating validators lose their staked coins. Either way, the cost of cheating is meant to exceed the gain.",
    altExample: "In a made-up network, one miner edits an old block. The other nodes compare it with their copies, see the broken links, and keep following the original chain.",
    practice: tf("Proof of work makes rewriting old blocks expensive because the work must be redone.", true, "True. That is its purpose."),
  },
  "cy-keys": {
    misconception: "Storing a seed phrase as a phone photo can seem safe and convenient. Cloud accounts and phones get hacked, and the photo is a full copy of your keys.",
    altExplanation: "Write the seed phrase on paper or metal and keep it offline in at least two safe places. Protect exchange accounts with a unique password and an authenticator app or hardware key rather than SMS codes, and use withdrawal allow-lists where offered.",
    altExample: "A made-up user keeps their recovery words in a cloud photo album. When the cloud account is breached, the thief restores the wallet elsewhere and empties it within minutes.",
    practice: single("Where is the safest place to keep a seed phrase?", [
      ["a", "In an email to yourself", "Online and searchable."],
      ["b", "As a photo in cloud storage", "Cloud accounts get hacked."],
      ["c", "Written down offline in safe places", "Right. That is what the lesson showed."],
      ["d", "In a chat with a trusted friend", "Messages can leak."],
    ], "c"),
  },
  "cy-stable": {
    misconception: "A stablecoin paying a high yield can look like a safe savings account. Someone is taking risk with the coins to produce that yield, and that risk is yours.",
    altExplanation: "Ask where any yield comes from: lending to traders, risky reserves or new deposits. Check reserve reports and who may redeem. Spread large balances, and remember that stablecoins usually lack deposit insurance.",
    altExample: "A made-up platform pays 18% a year on a stablecoin by lending it to leveraged traders. When several borrowers default in a crash, withdrawals are frozen.",
    practice: tf("A high yield on a stablecoin usually means someone is taking risk with the coins.", true, "True. Yield comes from risk."),
  },
  "cy-sizing": {
    misconception: "A tight stop can seem to make a large crypto position safe. In a market that moves several percent a day, a tight stop is hit by normal noise again and again.",
    altExplanation: "Set the stop outside normal noise, usually a multiple of the typical daily move, then size from it. If that makes the position small, that is the true size the risk allows. Leverage does not change the maths; it only lets you take too much.",
    altExample: "A made-up coin moves 5% on a typical day. A trader puts the stop 10% away and risks $120, so the position is $1,200 instead of the $4,000 they first wanted.",
    practice: single("A trader wants the same money at risk on two coins. Coin X moves 2% a day, coin Y moves 6% a day, and stops are set at two daily moves. Compared with X, the Y position should be…", [
      ["a", "Three times larger", "That adds risk instead."],
      ["b", "The same", "Then Y risks three times as much."],
      ["c", "Twice as large", "That adds risk instead."],
      ["d", "A third of the size", "Right. That is what the lesson showed."],
    ], "d"),
  },
  "cy-scam": {
    misconception: "Recovery services that promise to get scammed coins back can look like help. Many are run by scammers targeting people who have already lost money.",
    altExplanation: "If you are scammed, stop sending money, collect the transaction details, and report to the police and your financial regulator. Do not pay anyone who contacts you offering recovery. Prevention routines (verify, never share seeds, avoid urgency) are the real defence.",
    altExample: "A made-up victim loses coins to a fake platform. A week later a \"blockchain recovery agent\" offers to retrieve them for an upfront fee and then disappears.",
    practice: tf("Paying a recovery service that contacts you is usually a good way to get scammed coins back.", false, "False. Many are further scams."),
  },
  "cy-applied": {
    misconception: "It can feel safe to act quickly when a message seems to come from a friend or a known brand. Accounts get hijacked and brands get impersonated; urgency is the scammer's tool.",
    altExplanation: "Pause, then verify through a channel you already trust: the official website typed by hand, or calling the friend. Size any trade from the coin's own volatility, and limit what sits on any single platform.",
    altExample: "A made-up user gets a message from a friend's account asking them to send coins to help with an emergency. They phone the friend, who has been hacked and knows nothing about it.",
    practice: scenario(
      "An email that looks like it is from your exchange says your account will be closed unless you log in within 30 minutes using the link.",
      "What is the soundest response?",
      [
        ["a", "Click the link and log in quickly", "The classic phishing route.", "unsound"],
        ["b", "Reply asking if it is real", "The reply goes to the sender.", "partial"],
        ["c", "Open the exchange by typing its address or using a bookmark, and check for messages there", "Sound: verify through a trusted route.", "sound"],
        ["d", "Forward your password so support can check", "Hands over the account.", "unsound"],
      ],
    ),
  },

  "cy-consensus": {
    misconception: "Bitcoin and Ethereum can look like two versions of the same thing. Bitcoin is built mainly to be money with a fixed supply; Ethereum is built to run programs.",
    altExplanation: "Bitcoin's rules cap supply at 21 million coins released on a schedule. Ethereum runs smart contracts that power tokens, exchanges and lending apps, and users pay gas fees in ether for the computation.",
    altExample: "A made-up user sends bitcoin to a friend as a payment, then swaps one token for another on an Ethereum app, paying a gas fee for the program that does the swap.",
    practice: tf("Bitcoin's rules cap its supply at 21 million coins.", true, "True. Released on a fixed schedule."),
  },
  "cy-runs": {
    misconception: "Reserve reports can look like a live guarantee. They describe reserves at a past date, and what is held between reports may differ.",
    altExplanation: "Read who prepared the report, whether it is a full audit or a narrower attestation, what share is cash and short government bills, and who may redeem directly. Watch the coin's market price for persistent discounts as an early warning.",
    altExample: "A made-up issuer's quarterly report shows mostly bills, but a news story mid-quarter reveals a large loan to a related company that the report did not cover.",
    practice: tf("A stablecoin's reserve report always shows exactly what it holds today.", false, "False. Reports describe a past date."),
  },
  "cy-leverage": {
    misconception: "A funding rate can look too small to matter, a fraction of a percent. Paid every few hours for days, it can become a large cost on a leveraged position.",
    altExplanation: "Funding is paid between longs and shorts on perpetual futures, usually several times a day. Cost ≈ position size × funding rate × number of payments. When many traders are long, longs usually pay.",
    altExample: "A made-up $12,000 long pays 0.05% twice a day. Over a week that is fourteen payments, about $84, before any price move.",
    practice: tf("When the funding rate on a perpetual future is positive, longs pay shorts.", true, "True. That is how funding works."),
  },
  "cy-pump": {
    misconception: "Being in a pump group early can seem to guarantee a profit. The organisers are always earlier, and the announcement itself is when they start selling.",
    altExplanation: "Xu and Livshits studied hundreds of pumps organised in public chat channels. Prices spiked sharply and briefly, then collapsed; profits went mainly to organisers at the expense of members who bought after the signal.",
    altExample: "In a made-up pump, a member buys two seconds after the signal and still pays near the top, because the organisers had placed their sell orders in advance.",
    practice: tf("In pump-and-dumps, late buyers tend to fund the organisers' profits.", true, "True. They buy what organisers sell."),
  },
};

export const CRYPTO_ASSESSMENT: TrackAssessment = {
  ...BASE,
  concepts: BASE.concepts.map((c) => ({ ...c, moreRemediation: MORE_REMEDIATION[c.id] ? [MORE_REMEDIATION[c.id]] : [] })),
};
