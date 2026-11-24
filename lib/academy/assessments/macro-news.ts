import type { AssessmentQuestion, ChoiceOption, ConceptRemediation, GradedItem, ScenarioItem, TrackAssessment } from "../types";

/*
  Track 12 assessment: Macro and News.
  News-trading risk (spreads, slippage and gaps around releases and shocks)
  is safety-critical: getting it wrong is how a beginner turns a planned
  one-unit loss into several. All releases, rates, prices and statements here
  are made-up numbers for the sums; findings attributed to papers are the
  ones cited in the lessons.
*/

const T = "macro-news";

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
    "Questions on every idea from the thirteen lessons: central bank tools, inflation measures, jobs data, GDP and PMIs, the yield curve, rate differentials and carry, risk-on and risk-off, the economic calendar and surprises, trading around news, earnings, unscheduled shocks, reading statements and checking sources, with calculations and applied scenarios. You need 90% or more, a sound decision in the scenario, and every safety-critical question right: spreads, slippage and gaps around news.",
  concepts: [
    {
      id: "mn-cb-tools",
      title: "Central bank tools and expectations",
      lessonIds: ["mn-central-banks"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "It is natural to think a rate rise must lift a currency. Markets have usually priced the expected decision already, so only the surprise, in the action or the words, moves prices much.",
        altExplanation: "Picture the price before the meeting as a bet on what the bank will do. If the bank does exactly what was bet on, the bet pays nothing new. If it does more or less, or hints at a different path, prices adjust to the new expectation.",
        altExample: "Markets expect a hold and the bank holds, but it adds a line saying it is ready to raise rates soon. Short-term yields rise and the currency firms, though the rate did not move.",
        practice: single("A bank cuts by a quarter point when markets expected a half point. Which way might its currency move?", [
          ["a", "Down, because rates fell", "The cut was smaller than priced."],
          ["b", "Up, because the cut was smaller than expected", "Right. A hawkish surprise."],
          ["c", "No move is possible, because the decision was a cut either way", "Surprises usually move prices."],
          ["d", "Only bonds react", "Currencies react too."],
        ], "b"),
      },
      flashcard: { front: "Central bank tools", back: "Policy rate, forward guidance, QE and QT. Markets react to the surprise against expectations, not the decision itself." },
    },
    {
      id: "mn-inflation-measures",
      title: "Inflation measures: CPI, PCE, headline and core",
      lessonIds: ["mn-inflation"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Core inflation can sound like the \"real\" inflation and headline like noise. Both are real; core leaves out food and energy because their prices swing most, which makes the trend easier to see.",
        altExplanation: "Headline is the whole basket. Core removes the most volatile parts. When energy jumps, headline rises faster than core; when energy falls, headline can drop below core. Central banks watch both, and many put weight on core to judge where inflation is heading.",
        altExample: "In a made-up month, fuel prices fall sharply while rents keep rising. Headline inflation drops, but core barely moves, so the bank does not see the fall as a lasting change.",
        practice: numeric("A made-up basket: energy weighs 10% and rose 20%; everything else weighs 90% and rose 3%. What is headline inflation, in %?", "%", 4.7, 0.05, "0.1 × 20 + 0.9 × 3 = 2 + 2.7 = 4.7%."),
      },
      flashcard: { front: "Headline vs core", back: "Headline: the whole basket. Core: without food and energy. The US Federal Reserve's 2% goal is measured by PCE inflation." },
    },
    {
      id: "mn-jobs",
      title: "The labour market: payrolls and unemployment",
      lessonIds: ["mn-labour"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A jobs figure can seem final when it is published. First estimates are revised later, sometimes a lot, and revisions to earlier months can matter as much as the new number.",
        altExplanation: "In the US jobs report, payrolls come from a survey of employers and the unemployment rate from a survey of households. The two can point different ways in one month. Each first estimate is revised as more replies arrive.",
        altExample: "A made-up report shows a strong new month, but the two previous months are revised down by more than the new month's gain. The picture is weaker than the headline.",
        practice: single("Where does the US unemployment rate come from?", [
          ["a", "Company tax returns filed each year", "Not the source."],
          ["b", "The employer payroll survey", "That gives payrolls."],
          ["c", "The household survey", "Right. That is what the lesson showed."],
          ["d", "Central bank estimates published with each policy decision", "Not the source."],
        ], "c"),
      },
      flashcard: { front: "Jobs report", back: "Payrolls: employer survey. Unemployment rate: household survey. First estimates get revised." },
    },
    {
      id: "mn-growth-data",
      title: "GDP and PMIs",
      lessonIds: ["mn-growth"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A PMI of 52 can look like 2% growth. A PMI is a diffusion index: it counts how many firms say things got better versus worse, not how much output changed.",
        altExplanation: "A diffusion index takes the share of firms reporting higher activity and adds half the share reporting no change. Above 50 means more firms improved than worsened. It arrives early, before GDP, which is the slower, fuller measure of output.",
        altExample: "In a made-up survey a quarter of firms say output rose and half say it held steady. Half of those unchanged count, giving an index exactly at the line between growth and contraction.",
        practice: numeric("In a made-up survey 35% of firms report higher output and 40% report no change. What is the diffusion index?", "index", 55, 0.5, "35 + 0.5 × 40 = 35 + 20 = 55."),
      },
      flashcard: { front: "PMI", back: "Diffusion index = % higher + ½ × % unchanged. 50 = as many better as worse. Early and survey-based; GDP is later and fuller." },
    },
    {
      id: "mn-curve",
      title: "Yields and the yield curve",
      lessonIds: ["mn-yield-curve"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "An inverted curve is often treated as a timer for recession. The evidence shows it has tended to come before US recessions, with a lead of about one to two years, but the lag varies and it is not a trading signal for next week.",
        altExplanation: "The term spread compares a long yield with a short one; this course uses 10-year minus 3-month. Negative is inverted. Research by Estrella and Mishkin and later work found the slope was a strong single predictor of US recessions beyond a quarter ahead, but evidence for other countries is less clear.",
        altExample: "A made-up curve has a 3-month yield of 4.8% and a 10-year of 4.3%. It is inverted. That says recession risk is higher, not when a recession will start or what shares will do tomorrow.",
        practice: numeric("A made-up curve: 3-month yield 3.9%, 10-year yield 3.1%. What is the 10-year minus 3-month spread, in points?", "points", -0.8, 0.02, "3.1 − 3.9 = −0.8 points: inverted."),
      },
      flashcard: { front: "Yield curve", back: "Term spread = 10y − 3m. Negative = inverted. Has tended to come before US recessions by about 1–2 years; not a precise timer." },
    },
    {
      id: "mn-rate-diff",
      title: "Rate differentials, carry and FX",
      lessonIds: ["mn-rate-differentials"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Carry can look like free money: hold the high-rate currency and collect the difference. The exchange rate can move against you by more than the carry, and carry trades have tended to suffer sudden crashes.",
        altExplanation: "The carry over a period is roughly the rate difference times the fraction of a year, minus costs. The exchange-rate move is added on top. Theory (uncovered interest parity) says the high-rate currency should fall by the difference; Fama found it often did not, but Brunnermeier, Nagel and Pedersen found the returns were prone to crashes.",
        altExample: "A made-up position earns a 3-point difference for a quarter of a year, about 0.75% of notional. A 2% fall in the high-rate currency over that time turns the trade into a loss.",
        practice: numeric("A made-up carry trade on 100,000 earns a net rate difference of 4% a year. Ignoring exchange-rate moves, what is the carry over half a year?", "money", 2000, 50, "100,000 × 4% × 0.5 = 2,000."),
      },
      flashcard: { front: "Carry", back: "Carry ≈ notional × rate difference × time − costs. Exchange-rate moves can wipe it out; carry returns are prone to crashes." },
    },
    {
      id: "mn-risk-regimes",
      title: "Risk-on, risk-off and changing correlations",
      lessonIds: ["mn-risk-on-off"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Correlations are often treated as fixed facts, such as \"bonds always rise when shares fall\". They change with the regime: the stock-bond relationship has been positive in some decades and negative in others.",
        altExplanation: "A rolling correlation is measured over a recent window, so it lags real changes. When the true relationship switches, the measured one takes time to follow. Campbell, Sunderam and Viceira found the stock-bond covariance was high in the early 1980s and negative from the early 2000s.",
        altExample: "In a made-up market two assets move together for a year, then apart. A 60-day rolling correlation shows the change only weeks after it has happened.",
        practice: tf("A correlation measured over the last few months can change sign later.", true, "True. Correlations shift with the regime."),
      },
      flashcard: { front: "Risk-on / risk-off", back: "Risk-on: appetite for risky assets. Risk-off: flight to safe havens. Correlations change by regime; rolling windows lag." },
    },
    {
      id: "mn-surprise",
      title: "Surprises against consensus",
      lessonIds: ["mn-calendar", "mn-labour"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "A big number feels like good news for the currency. The level was mostly expected; what moves prices is the gap between actual and consensus, scaled by how big misses usually are.",
        altExplanation: "Surprise = actual − consensus. Divide by the typical miss for that release to see whether it is unusual. Andersen, Bollerslev, Diebold and Vega found exchange rates jump quickly on surprises, with bad news having the larger effect.",
        altExample: "A made-up inflation figure is high but exactly equal to the consensus. Prices barely move, because nothing new was learned.",
        practice: numeric("A made-up release: consensus 2.4, actual 2.1, typical miss 0.2. How many typical sizes is the surprise? (Use a negative number for a miss below consensus.)", "typical sizes", -1.5, 0.05, "(2.1 − 2.4) ÷ 0.2 = −0.3 ÷ 0.2 = −1.5."),
      },
      flashcard: { front: "Surprise", back: "S = (actual − consensus) ÷ typical miss. Prices react to S, not to the level." },
    },
    {
      id: "mn-news-risk",
      title: "News trading risk: spreads, slippage and gaps",
      lessonIds: ["mn-news-trading", "mn-shocks", "mn-earnings"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "A stop-loss feels like a guaranteed exit at its price. In a news jump the price skips levels, the stop becomes a market order and fills at the next available price, which can be far beyond the plan.",
        altExplanation: "Around releases and shocks, liquidity providers widen spreads and shrink quotes. At the moment of the news prices jump, slippage grows and gaps skip stop levels. Loss in R = fill distance ÷ planned stop distance. For a beginner the safest plan is to stand aside, and to size any position held through news for the gap, not the stop.",
        altExample: "A made-up trade has a 12-pip stop. A release makes the price jump 36 pips at once and the stop fills there: three times the planned loss, plus the wider spread.",
        practice: numeric("A made-up stop is 25 pips away, sized to lose 1R. A release gaps the price and the stop fills 60 pips away. What is the loss in R?", "R", 2.4, 0.05, "60 ÷ 25 = 2.4R."),
      },
      flashcard: { front: "Trading around news", back: "Spreads widen, slippage grows, gaps skip stops. Loss in R = fill distance ÷ stop distance. Beginners: stand aside." },
    },
    {
      id: "mn-earnings-risk",
      title: "Earnings and company news",
      lessonIds: ["mn-earnings"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Beating the profit consensus sounds like a sure rise. Guidance about coming quarters and what was already expected can outweigh the beat, so shares can fall on good results.",
        altExplanation: "Results are the company's own data release: the surprise against consensus and the change in outlook move the price. Because results often come out while the market is closed, the move tends to appear as a gap at the next open. Ball and Brown found returns moved with the earnings surprise, with much of it anticipated.",
        altExample: "A made-up company reports profit above forecast but warns that sales will slow next year. The shares open lower the next morning.",
        practice: numeric("A made-up trade: 300 shares bought at 25, stop at 24. After results the shares open at 22. What is the loss in R?", "R", 3, 0.05, "Planned risk 300 × 1 = 300. Loss 300 × 3 = 900. 900 ÷ 300 = 3R."),
      },
      flashcard: { front: "Earnings", back: "Surprise and guidance move the price, often as an overnight gap. Know the results date before every share trade." },
    },
    {
      id: "mn-shock-risk",
      title: "Geopolitics and unscheduled shocks",
      lessonIds: ["mn-shocks"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Some believe a fixed safe-haven trade works in every crisis. Reactions depend on what the shock means for growth, inflation and policy, and early reports are often wrong.",
        altExplanation: "An unscheduled shock has no time and no consensus, so you cannot stand aside beforehand. The defences are position sizes that survive a gap and a written routine: no new trade on the first headline, check exposure, confirm, wait for spreads, then decide.",
        altExample: "A made-up report of an attack spreads on a Friday night. By Monday it is partly corrected, but prices open lower. A small position stays within its weekly limit; a large one does not.",
        practice: single("What does the Caldara and Iacoviello geopolitical risk index measure?", [
          ["a", "Defence budgets", "Not this index."],
          ["b", "How often major newspapers write about adverse geopolitical events", "Right. That is what the lesson showed."],
          ["c", "The odds of war", "It measures coverage."],
          ["d", "Gold and oil prices in the days after conflicts begin, averaged over many past crises", "Not this index."],
        ], "b"),
      },
      flashcard: { front: "Unscheduled shocks", back: "No warning, no consensus, wider spreads, more gaps, early misinformation. Defend with size and a routine." },
    },
    {
      id: "mn-statement-reading",
      title: "Reading central bank statements",
      lessonIds: ["mn-statements", "mn-central-banks"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A statement can seem to need reading from scratch each time. Most of it repeats; the signal is in the sentences that changed, especially those about the future.",
        altExplanation: "Lay the new statement beside the last one and mark additions and deletions. Judge each change as hawkish, dovish or neutral, and watch for negation, which word counts miss. Gürkaynak, Sack and Swanson found statements moved long yields more than rate decisions did.",
        altExample: "A made-up statement keeps every line but one: \"the committee will be patient\" becomes \"the committee will act as needed\". That single edit is the news.",
        practice: single("Which made-up phrase is dovish?", [
          ["a", "Further tightening may be needed", "Hawkish: it points to tighter policy."],
          ["b", "It is too early to discuss cuts", "Hawkish: cuts are not coming."],
          ["c", "Inflation risks remain to the upside, so policy will stay restrictive for longer", "Hawkish: it points to tighter policy."],
          ["d", "The committee stands ready to ease", "Right. It signals possible cuts."],
        ], "d"),
      },
      flashcard: { front: "Statements", back: "Compare with the last one. The changed, forward-looking sentences carry the signal. Word counts miss negation." },
    },
    {
      id: "mn-source-check",
      title: "Sources and reliability",
      lessonIds: ["mn-sources"],
      critical: true,
      safetyCritical: false,
      remediation: {
        misconception: "A widely shared post can feel confirmed by its reach. Vosoughi, Roy and Aral found false news spread farther and faster than true news, so reach says nothing about truth.",
        altExplanation: "Primary sources are the original publishers: the statistics agency, the central bank, the company. Secondary sources report on them and are usually reliable but can misread figures. Unverified posts, screenshots and claimed leaks are noise until confirmed. The more surprising the claim, the more confirmation it needs.",
        altExample: "A made-up post claims a central bank will make an emergency cut tonight. No wire or official page mentions it. The right move is to do nothing until the bank's own site says so.",
        practice: tf("A figure reported by a reputable wire service is a primary source.", false, "False. The wire reports the agency's release, so it is secondary."),
      },
      flashcard: { front: "Sources", back: "Primary: the original publisher. Secondary: reports on it. Unverified: noise until confirmed. False news spreads faster." },
    },
    {
      id: "mn-applied",
      title: "Applying macro and news knowledge to decisions",
      lessonIds: ["mn-news-trading", "mn-calendar", "mn-sources", "mn-earnings"],
      critical: true,
      safetyCritical: false,
      applied: true,
      remediation: {
        misconception: "News days can feel like the best days to trade because prices move most. They are also when costs, gaps and misinformation are worst, so the sound decision is often to wait.",
        altExplanation: "Before any decision around news, ask four things: is a high-importance release or results date close; what is the consensus; is the source primary; and would the worst plausible gap break my loss limit? If any answer is unclear, standing aside or cutting size is the sound default.",
        altExample: "A made-up trader sees a large move start two minutes after a release. Instead of chasing it, they note the spread, wait for it to settle and check the release on the agency's site.",
        practice: scenario(
          "Five minutes before a high-importance release, a beginner sees a chat post saying the figure will be far above consensus.",
          "What is the soundest action?",
          [
            ["a", "Trade the post at full size", "Acts on an unverified claim at the worst time.", "unsound"],
            ["b", "Trade it at small size", "Smaller, but still acting on noise into a release.", "partial"],
            ["c", "Ignore the post, stay flat through the release and check the agency's figure afterwards", "Sound: no unverified claim, no release risk.", "sound"],
            ["d", "Place a stop very close to the entry and trade, so any loss stays small if the post is wrong", "A gap jumps a close stop.", "unsound"],
          ],
        ),
      },
      flashcard: { front: "News-day decisions", back: "Check the calendar, the consensus, the source and the gap risk. When unsure, stand aside or cut size." },
    },
  ],
  questions: [
    // mn-cb-tools
    q("mnq-cb-1", "mn-cb-tools", "knowledge", single("What is forward guidance?", [
      ["a", "Analysts' rate forecasts", "Not from the bank."],
      ["b", "A legal rule that forces the bank to change rates at every meeting", "No such rule."],
      ["c", "Bond buying", "That is QE."],
      ["d", "What the central bank says about its likely next steps", "Right. That is what the lesson showed."],
    ], "d"), "Forward guidance is the bank's own communication about the future path of policy. It shapes expectations, and so prices, before any action."),
    q("mnq-cb-2", "mn-cb-tools", "knowledge", tf("A rate decision that markets fully expected usually moves prices a lot.", false, "False. It is already priced."), "An expected decision is already in prices. The surprise, in the action or the guidance, is what moves markets."),
    q("mnq-cb-3", "mn-cb-tools", "knowledge", single("What does quantitative tightening do?", [
      ["a", "Raises the policy rate", "That is a rate rise."],
      ["b", "Prints banknotes and hands them to banks to lend", "Not what it does."],
      ["c", "Shrinks the central bank's bond holdings", "Right. That is what the lesson showed."],
      ["d", "Buys more bonds", "That is QE."],
    ], "c"), "QT is the reverse of QE: the bank lets bonds mature or sells them, shrinking its holdings, which can push long yields up."),
    q("mnq-cb-4", "mn-cb-tools", "knowledge", single("According to Gagnon and co-authors (2011), how did the Federal Reserve's bond purchases mainly lower long-term rates?", [
      ["a", "By lowering risk premiums, including term premiums", "Right. That is what the lesson showed."],
      ["b", "By raising the policy rate", "Rates were near zero."],
      ["c", "They did not lower rates", "They found meaningful reductions."],
      ["d", "By making every bank lend more money to households and small firms at once", "Not their finding."],
    ], "a"), "They found meaningful, lasting reductions in long rates, mostly through lower risk premiums rather than lower expected short rates."),
    q("mnq-cb-5", "mn-cb-tools", "calculation", numeric("In a simple model, a 10-year yield ≈ average expected short rate + term premium. If the average expected short rate is 3.2% and the term premium is 0.5%, what is the 10-year yield, in %?", "%", 3.7, 0.05, "3.2 + 0.5 = 3.7%."), "Long yield ≈ expected short rates + term premium = 3.2 + 0.5 = 3.7%. Guidance moves the first part; QE mainly the second."),

    // mn-inflation-measures
    q("mnq-in-1", "mn-inflation-measures", "knowledge", single("What does core inflation leave out?", [
      ["a", "Housing and rents", "Housing is in core."],
      ["b", "Food and energy", "Right. That is what the lesson showed."],
      ["c", "Services of all kinds", "Services are in core."],
      ["d", "Imported goods of every kind, whatever their category", "Not what core removes."],
    ], "b"), "Core removes food and energy, whose prices swing most, so the underlying trend is easier to see."),
    q("mnq-in-2", "mn-inflation-measures", "calculation", numeric("A made-up basket: food and energy weigh 25% and rose 8%; the rest weighs 75% and rose 2%. What is headline inflation, in %?", "%", 3.5, 0.05, "0.25 × 8 + 0.75 × 2 = 2 + 1.5 = 3.5%."), "Headline = Σ weight × change = 0.25 × 8 + 0.75 × 2 = 3.5%. Core here is 2%."),
    q("mnq-in-3", "mn-inflation-measures", "knowledge", tf("The US Federal Reserve states its longer-run inflation goal in terms of the PCE price index.", true, "True. 2% as measured by PCE."), "The Federal Reserve's statement on longer-run goals sets 2% inflation measured by the PCE price index, not CPI."),
    q("mnq-in-4", "mn-inflation-measures", "knowledge", single("Energy prices drop sharply in a month while other prices rise steadily. What is likely?", [
      ["a", "Headline falls below core", "Right. Energy is in headline only."],
      ["b", "Core falls more than headline", "Core excludes energy."],
      ["c", "Both stay the same", "Headline changes."],
      ["d", "Neither measure can be calculated for that month by the agency", "They can; both are published."],
    ], "a"), "Headline includes energy, so a big energy drop pulls it down; core, which excludes energy, barely moves."),

    // mn-jobs
    q("mnq-lb-1", "mn-jobs", "knowledge", single("Where does the US nonfarm payrolls figure come from?", [
      ["a", "The household survey", "That gives the unemployment rate."],
      ["b", "Tax records filed by every worker", "Not the source."],
      ["c", "Bank deposits", "Not the source."],
      ["d", "A survey of employers' payrolls", "Right. That is what the lesson showed."],
    ], "d"), "Payrolls come from the establishment, or employer, survey; the unemployment rate from the household survey."),
    q("mnq-lb-2", "mn-jobs", "knowledge", tf("First estimates of monthly job gains are usually final and are not revised later.", false, "False. More replies arrive after the first release, and estimates are revised."), "Initial estimates use incomplete replies, so later releases revise them, sometimes by a lot."),
    q("mnq-lb-3", "mn-jobs", "calculation", numeric("A made-up report: the new month shows 150 thousand jobs, and the two previous months are revised down by 40 and 30 thousand. What is the net news in thousands, new month plus revisions?", "thousand", 80, 1, "150 − 40 − 30 = 80."), "Net news = new month + revisions = 150 − 70 = 80 thousand: weaker than the headline suggests."),
    q("mnq-lb-4", "mn-jobs", "knowledge", single("What did Andersen, Bollerslev, Diebold and Vega (2007) find about stock market reactions to news?", [
      ["a", "They depend on the phase of the business cycle", "Right. That is what the lesson showed."],
      ["b", "Stocks never react", "They do react."],
      ["c", "They are the same in every phase", "They differ."],
      ["d", "They are always larger than bond reactions, in every phase of the cycle", "Not their finding."],
    ], "a"), "They found stock reactions to the same news differed across expansions and contractions, which helps explain weak stock-bond correlation over a cycle."),

    // mn-growth-data
    q("mnq-gr-1", "mn-growth-data", "knowledge", single("What does a PMI of 50 mean?", [
      ["a", "Output grew 50%", "It does not measure size."],
      ["b", "Half of firms closed", "Not what it means."],
      ["c", "As many firms reported better as worse", "Right. That is what the lesson showed."],
      ["d", "The country is officially in recession, as declared by the statistics agency", "PMIs do not declare recessions."],
    ], "c"), "A diffusion index of 50 means the share of firms improving equals the share worsening."),
    q("mnq-gr-2", "mn-growth-data", "calculation", numeric("A made-up survey: 45% of firms report higher output and 20% report no change. What is the diffusion index?", "index", 55, 0.5, "45 + 0.5 × 20 = 55."), "Diffusion index = % higher + ½ × % unchanged = 45 + 10 = 55."),
    q("mnq-gr-3", "mn-growth-data", "knowledge", tf("A PMI of 52 means output grew by 2%.", false, "False. It counts firms, not the size of growth."), "A PMI measures how widespread improvement is, not its size. 52 means slightly more firms improved than worsened."),
    q("mnq-gr-4", "mn-growth-data", "knowledge", single("Why do traders watch PMIs as well as GDP?", [
      ["a", "PMIs are more accurate", "GDP is fuller."],
      ["b", "PMIs measure the money supply and interest rates directly", "They survey firms."],
      ["c", "GDP is not published", "It is, but later than PMIs."],
      ["d", "PMIs arrive earlier", "Right. They are a timely early read."],
    ], "d"), "PMIs come out early in the month after, before GDP, so they give a timely, if rough, read on activity."),

    // mn-curve
    q("mnq-yc-1", "mn-curve", "calculation", numeric("A made-up curve: 3-month 4.6%, 10-year 4.1%. What is the 10-year minus 3-month spread, in points?", "points", -0.5, 0.02, "4.1 − 4.6 = −0.5."), "Term spread = 10y − 3m = −0.5 points. Negative means inverted."),
    q("mnq-yc-2", "mn-curve", "knowledge", tf("An inverted yield curve has always been followed by a US recession within exactly 12 months.", false, "False. The lead has varied, roughly one to two years."), "The evidence links inversions to later US recessions, but the lead time has varied and it is not a precise timer."),
    q("mnq-yc-3", "mn-curve", "knowledge", single("What did Estrella and Mishkin (1998) find about predicting US recessions beyond one quarter ahead?", [
      ["a", "Stock prices were the best predictor", "The slope did better."],
      ["b", "Nothing predicts recessions", "The slope did."],
      ["c", "The yield curve slope was the clearest single predictor", "Right. That is what the lesson showed."],
      ["d", "A mix of many indicators always beat any single one, in and out of sample", "The slope alone did better out of sample."],
    ], "c"), "Beyond a quarter ahead, the slope was the clearest single predictor, and did better alone out of sample than combined with others."),
    q("mnq-yc-4", "mn-curve", "knowledge", single("Bauer and Mertens (2018) compared spread measures. Which did they find most reliable?", [
      ["a", "10-year minus 3-month", "Right. That is what the lesson showed."],
      ["b", "30-year minus 10-year", "Not their finding."],
      ["c", "The level of the 10-year yield on its own", "A level, not a spread."],
      ["d", "A spread adjusted for the term premium", "That made predictions worse."],
    ], "a"), "They found the 10-year minus 3-month spread most reliable, and subtracting a term premium estimate made predictions worse."),
    q("mnq-yc-5", "mn-curve", "knowledge", tf("Using this course's 0.5-point band, a curve with a 10-year minus 3-month spread of +0.3 is classed as flat.", true, "True. Between 0 and 0.5 is flat here."), "In this course a spread below 0 is inverted, from 0 up to 0.5 is flat, and above that is normal. The band is a teaching convention."),

    // mn-rate-diff
    q("mnq-fx-1", "mn-rate-diff", "calculation", numeric("A made-up carry trade on 50,000 earns a net rate difference of 3% a year. Ignoring exchange-rate moves, what is the carry over one year?", "money", 1500, 50, "50,000 × 3% = 1,500."), "Carry ≈ notional × net rate difference × time = 50,000 × 0.03 × 1 = 1,500."),
    q("mnq-fx-2", "mn-rate-diff", "knowledge", single("What does uncovered interest parity predict for a high-rate currency?", [
      ["a", "It should rise by the rate difference", "The opposite."],
      ["b", "It should stay fixed", "Not the prediction."],
      ["c", "It should fall by about the rate difference", "Right. In theory, carry earns nothing extra."],
      ["d", "It should move randomly, with no link to the interest rates in either of the two countries", "UIP links them."],
    ], "c"), "UIP says the expected fall of the high-rate currency offsets the rate difference, so carry earns no excess return on average."),
    q("mnq-fx-3", "mn-rate-diff", "knowledge", tf("Fama (1984) found that high-rate currencies fell by about the rate difference, as parity predicts.", false, "False. The slope coefficients were mostly negative."), "Fama found the forward premium predicted moves in the opposite direction to parity on average, which he read as a varying risk premium."),
    q("mnq-fx-4", "mn-rate-diff", "knowledge", single("What did Brunnermeier, Nagel and Pedersen find about carry trade returns?", [
      ["a", "They are negatively skewed: crashes were more likely than sudden gains", "Right. That is what the lesson showed."],
      ["b", "They are risk-free", "They carry crash risk."],
      ["c", "They have no link at all to risk appetite, funding liquidity or how crowded the trade is", "They linked crashes to it."],
      ["d", "They rise in crises", "They tended to crash."],
    ], "a"), "They found carry returns were negatively skewed, with crashes linked to sudden unwinding when risk appetite and funding liquidity fell."),

    // mn-risk-regimes
    q("mnq-ro-1", "mn-risk-regimes", "knowledge", single("What usually happens in a risk-off move?", [
      ["a", "Money flows toward safe havens", "Right. That is what the lesson showed."],
      ["b", "Every asset rises together at once", "Not risk-off."],
      ["c", "Prices stop moving entirely for the day", "Risk-off moves prices."],
      ["d", "Risky assets rise while safe havens fall, as investors look for higher returns", "That is risk-on."],
    ], "a"), "In risk-off, investors cut risky positions and buy assets seen as safer, such as some government bonds or currencies."),
    q("mnq-ro-2", "mn-risk-regimes", "knowledge", tf("The correlation between stocks and bonds has always been negative.", false, "False. It changed sign over time."), "Campbell, Sunderam and Viceira found the stock-bond covariance was high in the early 1980s and negative from the early 2000s."),
    q("mnq-ro-3", "mn-risk-regimes", "knowledge", single("Why does a 60-day rolling correlation lag a real change in relationship?", [
      ["a", "It uses future data", "It uses past data."],
      ["b", "It never changes", "It changes slowly."],
      ["c", "It is a random number that a data provider recalculates from scratch every day", "It is a calculation."],
      ["d", "It averages over the past 60 days, which still include the old regime", "Right. That is what the lesson showed."],
    ], "d"), "A rolling window mixes old and new data until the old regime drops out of the window, so it shows changes late."),
    q("mnq-ro-4", "mn-risk-regimes", "knowledge", multi("Which of these are commonly treated as risk-on assets? Choose all that apply.", [
      ["a", "Broad stock indices", "Usually risk-on."],
      ["b", "High-yield or commodity-linked currencies", "Usually risk-on."],
      ["c", "Short-term government bills of large, stable countries", "Usually seen as safe."],
      ["d", "Cash held at a central bank", "Usually seen as a safe asset."],
    ], ["a", "b"]), "Shares and higher-yielding or commodity currencies tend to do well when appetite for risk is high; short bills and cash are havens. These are tendencies, not rules."),

    // mn-surprise
    q("mnq-su-1", "mn-surprise", "calculation", numeric("A made-up release: consensus 200, actual 260, typical miss 40. How many typical sizes is the surprise?", "typical sizes", 1.5, 0.05, "(260 − 200) ÷ 40 = 1.5."), "Standardised surprise = (actual − consensus) ÷ typical miss = 60 ÷ 40 = 1.5."),
    q("mnq-su-2", "mn-surprise", "knowledge", single("Jobs grew strongly but less than consensus. What might the currency do?", [
      ["a", "Rise, because the number was big", "The level was expected."],
      ["b", "Nothing", "Misses usually move prices."],
      ["c", "Rise for exactly an hour and then return to its starting level", "No such pattern."],
      ["d", "Fall, because the figure missed expectations", "Right. That is what the lesson showed."],
    ], "d"), "The level was mostly priced; the negative surprise lowers expectations, so the currency may fall on a strong figure."),
    q("mnq-su-3", "mn-surprise", "knowledge", tf("A release that exactly matches consensus can still be followed by price moves.", true, "True. Revisions, details and other news still move prices."), "With zero surprise the average move is small, but revisions, details within the release and other news can still move prices."),
    q("mnq-su-4", "mn-surprise", "knowledge", single("What did Andersen, Bollerslev, Diebold and Vega (2003) find about exchange rates and announcements?", [
      ["a", "Surprises caused quick jumps, with bad news having a larger effect", "Right. That is what the lesson showed."],
      ["b", "Reactions took days", "They were quick."],
      ["c", "Levels mattered, surprises did not", "Surprises mattered."],
      ["d", "Good and bad news had identical effects, whatever the release and the time of day", "Bad news had more."],
    ], "a"), "Surprises produced quick conditional mean jumps in exchange rates, and bad news tended to have the bigger impact."),
    q("mnq-su-5", "mn-surprise", "knowledge", tf("Only the unexpected part of a policy rate decision tends to move stock prices much.", true, "True. Bernanke and Kuttner's finding."), "Bernanke and Kuttner found expected changes did little; an unanticipated quarter-point cut went with about a 1% rise in broad indices on average."),

    // mn-news-risk
    q("mnq-nr-1", "mn-news-risk", "calculation", numeric("A made-up trade has a stop 20 pips away, sized to lose 1R. A release gaps the price and the stop fills 50 pips away. What is the loss in R?", "R", 2.5, 0.05, "50 ÷ 20 = 2.5R."), "Loss in R = fill distance ÷ planned stop distance = 50 ÷ 20 = 2.5R, before any extra spread."),
    q("mnq-nr-2", "mn-news-risk", "knowledge", tf("A stop-loss order guarantees that a loss will not exceed the planned amount.", false, "False. In a gap it fills at the next available price."), "A stop becomes a market order when triggered. In a jump the next available price can be far beyond the stop."),
    q("mnq-nr-3", "mn-news-risk", "knowledge", single("Why do spreads widen just before a major release?", [
      ["a", "Brokers stop working", "Not the reason."],
      ["b", "The exchange or the statistics agency sets a wider spread by law for every release", "No such rule."],
      ["c", "Liquidity providers quote wider and smaller to avoid being caught by the jump", "Right. That is what the lesson showed."],
      ["d", "They never widen", "They usually do."],
    ], "c"), "Market makers fear trading just before a jump, so they widen and shrink quotes or step away; Fleming and Remolona saw spreads widen sharply at releases."),
    q("mnq-nr-4", "mn-news-risk", "knowledge", single("What is the safest plan for a beginner around a high-importance release?", [
      ["a", "Double size to catch the move", "Doubles the gap risk."],
      ["b", "Remove stops so they cannot be hit by a spike, and wait for the price to come back", "Removes protection."],
      ["c", "Move the stop very close", "A gap skips a close stop too."],
      ["d", "Stand aside until spreads settle", "Right. That is what the lesson showed."],
    ], "d"), "Costs, slippage and gap risk peak at the release. Standing aside avoids all three while learning."),
    q("mnq-nr-5", "mn-news-risk", "calculation", numeric("A position is sized to lose 400 at a 10-pip stop. A shock gaps the price 35 pips through the stop. Roughly how much is lost, ignoring spread?", "money", 1400, 20, "35 ÷ 10 = 3.5R; 3.5 × 400 = 1,400."), "Loss = (fill distance ÷ stop distance) × planned loss = 3.5 × 400 = 1,400."),
    q("mnq-nr-6", "mn-news-risk", "knowledge", tf("Holding through a major release usually costs no more than the planned stop, as long as a stop is in place.", false, "False. Gaps and slippage can multiply the loss."), "A jump past the stop makes the loss depend on the jump, not the stop, so it can be several times the plan."),

    // mn-earnings-risk
    q("mnq-er-1", "mn-earnings-risk", "calculation", numeric("A made-up trade: 200 shares bought at 40, stop at 38. After results the shares open at 34. What is the loss in R?", "R", 3, 0.05, "Planned 200 × 2 = 400; loss 200 × 6 = 1,200; 1,200 ÷ 400 = 3."), "Loss in R = (entry − open) ÷ (entry − stop) = 6 ÷ 2 = 3R."),
    q("mnq-er-2", "mn-earnings-risk", "knowledge", single("A company beats the profit consensus but lowers its guidance. What can happen?", [
      ["a", "The shares must rise", "Guidance can outweigh the beat."],
      ["b", "Trading in the shares stops until next quarter's results", "No such rule."],
      ["c", "The shares can fall on the weaker outlook", "Right. That is what the lesson showed."],
      ["d", "Nothing happens", "Results usually move prices."],
    ], "c"), "Markets price the future. Weaker guidance can outweigh a beat on the past quarter."),
    q("mnq-er-3", "mn-earnings-risk", "knowledge", tf("Earnings moves often appear as gaps because results are usually released outside main trading hours.", true, "True."), "With the market closed, the new price is set at the next open, often skipping stop levels."),
    q("mnq-er-4", "mn-earnings-risk", "knowledge", single("What did Ball and Brown (1968) find?", [
      ["a", "Earnings had no link to returns", "The opposite."],
      ["b", "Prices only reacted years later", "Much was priced before."],
      ["c", "Only dividends mattered", "They studied income."],
      ["d", "Returns moved with the earnings surprise, and much was anticipated before the report", "Right. That is what the lesson showed."],
    ], "d"), "Returns moved in the direction of the forecast error, and no more than about 10–15% of the information was unanticipated by the report month."),

    // mn-shock-risk
    q("mnq-sh-1", "mn-shock-risk", "knowledge", single("What makes an unscheduled shock harder to manage than a scheduled release?", [
      ["a", "It always moves prices less", "Often more."],
      ["b", "There is no warning to stand aside and no consensus", "Right. That is what the lesson showed."],
      ["c", "It is announced in advance", "Then it would be scheduled."],
      ["d", "It only affects one market and never spreads to others", "Shocks often spread."],
    ], "b"), "With no known time you cannot step aside beforehand, and with no consensus there is nothing to measure the surprise against."),
    q("mnq-sh-2", "mn-shock-risk", "knowledge", tf("After a geopolitical shock, safe-haven assets can be relied on to rise every time.", false, "False. Reactions depend on the shock."), "Havens have often gained at first, but the direction depends on what the shock means for growth, inflation and policy."),
    q("mnq-sh-3", "mn-shock-risk", "knowledge", single("What did Caldara and Iacoviello (2022) find about high geopolitical risk?", [
      ["a", "It raised investment", "The opposite."],
      ["b", "It had no economic effect", "It did: weaker investment and jobs."],
      ["c", "It was followed by lower investment and employment, and larger downside risks", "Right. That is what the lesson showed."],
      ["d", "It predicted the exact timing of the next war", "It measures coverage."],
    ], "c"), "Their news-based index showed high geopolitical risk was followed by lower investment and jobs and larger risks of bad outcomes."),
    q("mnq-sh-4", "mn-shock-risk", "knowledge", tf("A position sized so that a large gap stays within your loss limit is one of the few defences against shocks you cannot foresee.", true, "True. Size is what you control."), "Shocks cannot be timed, so the size of what you hold, and a ready routine, are the main defences."),

    // mn-statement-reading
    q("mnq-st-1", "mn-statement-reading", "knowledge", single("What is the best first step when a new policy statement comes out?", [
      ["a", "Compare it with the previous statement", "Right. That is what the lesson showed."],
      ["b", "Count its words", "Length says little."],
      ["c", "Read only the first line", "Changes can be anywhere."],
      ["d", "Ignore it and wait for the minutes, since statements never contain new information", "Statements often move markets."],
    ], "a"), "Most of a statement repeats. The changed sentences are where the new information is."),
    q("mnq-st-2", "mn-statement-reading", "knowledge", tf("\"It is not yet appropriate to cut rates\" is a dovish phrase because it mentions cutting.", false, "False. The cut is negated: it is hawkish."), "Negation flips the meaning, which simple word counts miss."),
    q("mnq-st-3", "mn-statement-reading", "knowledge", single("What did Gürkaynak, Sack and Swanson (2005) find?", [
      ["a", "Statements moved long-term yields more than rate decisions did", "Right. That is what the lesson showed."],
      ["b", "Only rate decisions matter, and markets ignore the words in the statement", "Statements mattered more for long yields."],
      ["c", "Statements never move prices", "They did, especially long yields."],
      ["d", "Statements only moved currencies", "They studied rates and stocks."],
    ], "a"), "They needed a second factor for the future path of policy, tied to statements, and found it had bigger effects on longer yields."),
    q("mnq-st-4", "mn-statement-reading", "calculation", numeric("A made-up statement has 200 words, with 6 hawkish and 2 dovish words on the course's lists. What is the crude tone score, (hawkish − dovish) ÷ total words?", "score", 0.02, 0.0005, "(6 − 2) ÷ 200 = 0.02."), "Tone = (6 − 2) ÷ 200 = 0.02. It is only a rough comparison between statements."),

    // mn-source-check
    q("mnq-so-1", "mn-source-check", "knowledge", single("Which is a primary source for an inflation figure?", [
      ["a", "A newspaper article", "Secondary: it reports on the release."],
      ["b", "A broker's note", "Secondary: it reports on the release."],
      ["c", "A social media post that quotes the figure", "Unverified."],
      ["d", "The statistics agency's own release", "Right. That is what the lesson showed."],
    ], "d"), "The agency that publishes the figure is the primary source; everything else reports on it."),
    q("mnq-so-2", "mn-source-check", "knowledge", single("A \"leaked\" figure appears in a chat group before the release. What should you do?", [
      ["a", "Trade it before others", "Probably fake, and possibly illegal."],
      ["b", "Trade a smaller size in case it turns out to be fake", "Still acting on noise."],
      ["c", "Share it", "Spreads noise."],
      ["d", "Ignore it and wait for the official release", "Right. That is what the lesson showed."],
    ], "d"), "Real early leaks of official data are rare and may be illegal to trade on; screenshots are easy to fake."),
    q("mnq-so-3", "mn-source-check", "knowledge", tf("Vosoughi, Roy and Aral (2018) found that false news spread farther and faster than true news.", true, "True. In all categories."), "False stories spread farther, faster, deeper and more broadly, and people rather than bots drove the difference."),
    q("mnq-so-4", "mn-source-check", "knowledge", tf("A claim that has been shared many times can be trusted without checking its source.", false, "False. Reach says nothing about truth."), "Wide sharing is not confirmation; false news often spreads faster. Check the original source."),

    // mn-applied
    q("mnq-ap-1", "mn-applied", "applied", scenario(
      "A beginner holds a currency position with a 15-pip stop. A high-importance release is due in ten minutes, and a gap of 60 pips would break their daily loss limit.",
      "What is the soundest decision?",
      [
        ["a", "Hold; the stop sits 15 pips away and will close the trade if the price moves against them", "A gap can skip the stop.", "unsound"],
        ["b", "Close or cut the position before the release so a gap stays within the limit", "Sound: size for the gap, not the stop.", "sound"],
        ["c", "Move the stop to 5 pips", "A gap skips a close stop too.", "unsound"],
        ["d", "Hedge half", "Cuts risk but may still breach the limit.", "partial"],
      ],
    ), "When a plausible gap would break a loss limit, the sound move is to reduce or close before the event, not to trust the stop."),
    q("mnq-ap-2", "mn-applied", "applied", scenario(
      "A jobs figure comes out well above its level last month but below consensus. The currency starts to fall and a trader is tempted to buy, because \"the number was strong\".",
      "What is the soundest view?",
      [
        ["a", "Buy: strong numbers lift currencies", "Ignores the surprise.", "unsound"],
        ["b", "Buy a small size to test the idea, then add more if the price starts to recover after the first drop", "Still trading on the level, in the release window.", "partial"],
        ["c", "Sell at once to follow the move", "Chases a fast market with wide spreads.", "unsound"],
        ["d", "Read the fall as a reaction to the miss, and wait for spreads to settle before any decision", "Sound: surprise explains it, and costs are high now.", "sound"],
      ],
    ), "The level was expected; the negative surprise explains the fall. In the release window, costs are high, so waiting is sound."),
    q("mnq-ap-3", "mn-applied", "applied", scenario(
      "Late on a Friday, a video spreads claiming a conflict has started between two countries. No major outlet or government has confirmed it. A trader holds a large position over the weekend.",
      "What is the soundest response?",
      [
        ["a", "Do nothing; it is probably fake", "Ignores weekend gap risk on a large position.", "partial"],
        ["b", "Add to safe-haven positions at once", "Acts on an unconfirmed video.", "unsound"],
        ["c", "Seek confirmation from reliable sources, and cut the position to a size a weekend gap would not make ruinous", "Sound: confirm, and size for the gap.", "sound"],
        ["d", "Double the position to profit from the news", "Adds risk on unverified news.", "unsound"],
      ],
    ), "The video is unverified, so do not trade it, but a large weekend position is exposed whatever the truth, so size it for a gap."),
    q("mnq-ap-4", "mn-applied", "applied", scenario(
      "A trader plans to buy a share on Monday. Its results are due Tuesday night. Their usual size would lose 3R if the shares opened 15% lower.",
      "What is the soundest plan?",
      [
        ["a", "Buy full size; stops will handle it", "Results gaps skip stops.", "unsound"],
        ["b", "Wait until after the results, or trade a size where a gap stays within the limit", "Sound: plan for the gap.", "sound"],
        ["c", "Buy full size and remove the stop", "Removes protection.", "unsound"],
        ["d", "Buy half size, since that halves the loss if the shares do gap lower after the results", "Smaller, but not checked against the limit.", "partial"],
      ],
    ), "Results often cause gaps. Either avoid holding through them or choose a size whose gap loss stays within the loss limit."),
  ],
};

const MORE_REMEDIATION: Record<string, ConceptRemediation> = {
  "mn-cb-tools": {
    misconception: "Some think only the rate decision matters and the words are padding. Guidance about the future can move markets more than the rate itself, and QE or QT can move long yields on their own.",
    altExplanation: "Split policy into three levers. The policy rate sets overnight money. Guidance shifts what markets expect future rates to be. Bond buying or selling moves long yields more directly, mainly through the term premium. A long yield is roughly the average expected short rate plus that premium.",
    altExample: "In a made-up meeting the bank leaves its rate alone but says it will stop shrinking its bond holdings early. Long yields dip, while short yields barely move.",
    practice: tf("A central bank can move longer-term yields without changing its policy rate.", true, "True. Guidance and bond purchases can both do it."),
  },
  "mn-inflation-measures": {
    misconception: "CPI and PCE are often assumed to be the same figure. They are different indexes with different weights and coverage, so they can give different readings in the same month.",
    altExplanation: "Both track prices paid by households, but they weigh items differently and PCE covers some spending made on households' behalf. Central banks pick one to define their goal; the US Federal Reserve uses PCE. Traders still watch both, because CPI comes out first and moves markets.",
    altExample: "In a made-up month, housing costs rise fast. An index that weighs housing more heavily shows higher inflation than one that weighs it less.",
    practice: single("Why might headline and core inflation differ a lot in one month?", [
      ["a", "Core includes energy", "Core excludes it."],
      ["b", "A big swing in food or energy prices", "Right. That is what the lesson showed."],
      ["c", "They use different currencies", "Same currency."],
      ["d", "Headline is revised and core is never revised by the statistics agency", "Not the reason."],
    ], "b"),
  },
  "mn-jobs": {
    misconception: "The unemployment rate and payrolls are sometimes read as one measure. They come from two different surveys and can tell different stories in a single month.",
    altExplanation: "The household survey asks people whether they are working or looking, which gives the unemployment rate. The employer survey counts jobs on payrolls. Sampling error, timing and who is counted differ, so a rise in jobs can come with a rise in unemployment if more people start looking.",
    altExample: "In a made-up month, many people who had stopped looking start searching again. Payrolls rise, yet the unemployment rate ticks up, because more people now count as in the labour force.",
    practice: tf("In the same month, payrolls can rise while the unemployment rate also rises.", true, "True. The surveys differ, and more people may start looking."),
  },
  "mn-growth-data": {
    misconception: "GDP can seem like the timely way to judge the economy. It arrives late and is revised, which is why traders lean on faster surveys like PMIs, while knowing they are rough.",
    altExplanation: "GDP adds up the value of everything produced, with first estimates weeks after the quarter ends and revisions after that. PMIs ask purchasing managers simple better-same-worse questions each month, so they come out early. They are good at direction, weaker at size.",
    altExample: "A made-up PMI dips just below the line between growth and contraction for one month, then recovers. GDP for that quarter later shows modest growth.",
    practice: single("What is a diffusion index built from?", [
      ["a", "Total output in money terms", "That is closer to GDP."],
      ["b", "Prices paid by shoppers", "That is inflation."],
      ["c", "Shares of firms reporting better, the same or worse", "Right. That is what the lesson showed."],
      ["d", "The number of firms that opened or closed in the month, counted from company registers", "Not a diffusion index."],
    ], "c"),
  },
  "mn-curve": {
    misconception: "A flat or inverted curve is sometimes treated as proof that a recession has started. It has tended to come before US recessions, not mark them, and the course's flat band is a convention, not a law.",
    altExplanation: "Short yields follow the policy rate; long yields reflect expected future short rates plus a term premium. When markets expect cuts later, long yields can sit below short ones. Research links this slope to later US recessions, but the lead time has varied and evidence elsewhere is less clear.",
    altExample: "A made-up curve with a 3-month yield of 2.2% and a 10-year of 2.4% is flat by this course's band, though it is not inverted.",
    practice: single("Using this course's band, how is a curve with a 10-year minus 3-month spread of −0.2 classed?", [
      ["a", "Normal", "Normal is above +0.5."],
      ["b", "Flat", "Flat is from 0 to +0.5."],
      ["c", "Very steep", "Not a class here."],
      ["d", "Inverted", "Right. Below zero."],
    ], "d"),
  },
  "mn-rate-diff": {
    misconception: "It is easy to assume the currency with the higher rate must strengthen. Rates matter through changes in expected differentials, and the exchange-rate move can swamp the carry either way.",
    altExplanation: "What moves a pair is usually a change in the expected gap between two countries' rates, not the gap itself. Carry collects the current gap over time. If the high-rate currency falls by more than the carry earned, the trade loses; the breakeven move equals the carry over the period.",
    altExample: "In a made-up pair, the rate gap stays the same, but markets start to expect the high-rate country to cut. The high-rate currency falls, even though nothing has changed yet.",
    practice: numeric("A made-up trade earns 1.2% carry over its holding period. What adverse exchange-rate move, in %, would wipe it out exactly?", "%", 1.2, 0.05, "The breakeven move equals the carry over the period: 1.2%."),
  },
  "mn-risk-regimes": {
    misconception: "Diversifying across assets can seem to protect a portfolio in every sell-off. In stressed markets, correlations between risky assets can rise, and havens do not always behave the same way.",
    altExplanation: "Risk-on and risk-off describe swings in appetite for risk. In risk-off, risky assets tend to fall together and havens tend to rise, but which assets act as havens, and how strongly, changes with the regime, especially with inflation and policy.",
    altExample: "In a made-up year with rising inflation, shares and bonds fall together, so a mix of the two loses more than its history suggested.",
    practice: single("What does a rolling correlation measure?", [
      ["a", "The future link between two assets, forecast from today's prices", "It uses past data."],
      ["b", "The link over a recent past window, updated as it moves", "Right. That is what the lesson showed."],
      ["c", "A fixed number for all time", "It changes."],
      ["d", "The price of one asset in units of the other", "That is a ratio."],
    ], "b"),
  },
  "mn-surprise": {
    misconception: "Every miss can look important. Small misses happen all the time; only misses that are large compared with the usual miss tend to bring a clear reaction.",
    altExplanation: "Each release has a typical miss size. Divide the surprise by it: around ±0.5 is ordinary noise, beyond about ±1 starts to matter. Even then, revisions and details can change the reaction, and the response to the same surprise varies over time.",
    altExample: "A made-up release misses by 0.1 when misses are usually about 0.3. The market hardly reacts, because that is a third of a normal miss.",
    practice: tf("A miss that is small compared with the release's usual miss tends to move prices less than a large one.", true, "True. Scale matters."),
  },
  "mn-news-risk": {
    misconception: "Reacting faster than others can seem like the way to win on news. Retail orders are not faster than professionals, and the release moment is when spreads, slippage and gaps are worst.",
    altExplanation: "Fleming and Remolona saw prices adjust almost at once while spreads widened sharply and volume dropped. By the time an order from a phone arrives, the price has already moved and the cost of crossing the spread is several times normal. A personal no-trade window around high-importance releases avoids the worst of it.",
    altExample: "A made-up trader sends a market order a second after a release. The spread is eight times normal and the fill is 14 pips worse than the price on screen.",
    practice: single("A beginner wants a simple rule for high-importance releases. Which is soundest?", [
      ["a", "Trade only in the first minute", "That is when costs peak."],
      ["b", "No new trades in a set window before and after, and cut positions a gap could make too large", "Right. That is what the lesson showed."],
      ["c", "Use market orders only", "Market orders take the worst slippage."],
      ["d", "Rely on tight stops", "Gaps skip them."],
    ], "b"),
  },
  "mn-earnings-risk": {
    misconception: "Some assume a stop below a share's price limits the loss through results. Results usually come out while the market is shut, so the next open can be well past the stop.",
    altExplanation: "Plan the loss from the gap, not the stop: gap loss = shares × (entry − open). Divide by the planned risk, shares × (entry − stop), to get the loss in R. If a plausible gap would break your limit, cut the size or wait until after results.",
    altExample: "In a made-up case a share bought at 60 with a stop at 57 opens at 51 after a profit warning. The loss is three times the stop distance.",
    practice: tf("Beating the profit consensus guarantees that a share will rise.", false, "False. Guidance and expectations can outweigh it."),
  },
  "mn-shock-risk": {
    misconception: "Reacting to the first shock headline can feel like getting ahead. Early reports are often wrong or incomplete, and spreads are at their widest just then.",
    altExplanation: "A sound shock routine puts safety first: no new trade on the first headline, then check open exposure and worst-case loss, then confirm from reliable sources, then let spreads settle, then decide from the written plan.",
    altExample: "A made-up headline reports a large explosion at a port. An hour later the official account says it was a small fire. Traders who waited lost nothing.",
    practice: single("What should come first when a shock headline appears?", [
      ["a", "Trade in its direction before the price moves further", "Early reports are often wrong."],
      ["b", "Double size", "Adds risk at the worst moment."],
      ["c", "Delete stops", "Removes protection."],
      ["d", "No new trades, and check open exposure", "Right. That is what the lesson showed."],
    ], "d"),
  },
  "mn-statement-reading": {
    misconception: "A tone score from word counts can look like an objective reading of a statement. It misses negation and context, and the market's expectations decide how a change is received.",
    altExplanation: "Use the score only to compare two statements quickly. Then read each changed sentence: is it about the future or the past, is a key word negated, and did markets already expect the change? The press conference can confirm or undo the text.",
    altExample: "A made-up statement adds the word \"easing\" in the line \"easing is not under discussion\". A word count marks it dovish; a reader sees it is hawkish.",
    practice: tf("Hansen and McMahon (2016) found communication about current conditions mattered more for markets than forward guidance.", false, "False. Forward guidance shocks mattered more."),
  },
  "mn-source-check": {
    misconception: "Secondary sources are sometimes dismissed as unreliable. Major wire services are usually fast and accurate; the problem is acting on any report without checking the original when it matters.",
    altExplanation: "Rank sources by distance from the original and how easy the claim is to check: the publisher's own page, then reputable wires, then analysis, then commentary, then anonymous posts. Bookmark the primary pages for the releases you follow so checking takes seconds.",
    altExample: "A made-up wire headline reports a growth figure with a typo in the decimal place. The agency's own page shows the correct figure a minute later.",
    practice: single("Which is the most reliable source for a central bank's decision?", [
      ["a", "A commentator's summary", "Further from the source."],
      ["b", "The statement on the bank's own website", "Right. That is what the lesson showed."],
      ["c", "An anonymous post", "Unverified."],
      ["d", "A screenshot shared in a chat group by someone who says they work in finance", "Unverified."],
    ], "b"),
  },
  "mn-applied": {
    misconception: "Cutting size before news can feel like giving up profit. The aim is to survive the worst plausible outcome; a missed move costs nothing, a gap through a large position can cost a lot.",
    altExplanation: "Turn the checks into a routine. Each morning list the releases and results dates for what you trade. Mark no-trade windows. For anything you hold through news, compute the gap loss for a plausible move and compare it with your limit. Act only on primary or well-confirmed sources.",
    altExample: "A made-up trader sees results are due after the close. A 20% gap on their usual size would cost a week's loss limit, so they halve the size and set a reminder to review after the open.",
    practice: scenario(
      "A trader sees a news headline on a wire service that a central bank has made a surprise cut. The bank's website has not yet posted anything, and spreads have widened sharply.",
      "What is the soundest action?",
      [
        ["a", "Trade at once before the website updates", "Acts at peak spreads on an unconfirmed report.", "unsound"],
        ["b", "Wait for the bank's own statement and for spreads to settle, then decide from the plan", "Sound: confirm, then trade at normal costs.", "sound"],
        ["c", "Trade small now and add later", "Still pays peak spreads.", "partial"],
        ["d", "Trade the opposite way in case it is fake", "Acts on a guess.", "unsound"],
      ],
    ),
  },
};

export const MACRO_NEWS_ASSESSMENT: TrackAssessment = {
  ...BASE,
  concepts: BASE.concepts.map((c) => ({ ...c, moreRemediation: MORE_REMEDIATION[c.id] ? [MORE_REMEDIATION[c.id]] : [] })),
};
