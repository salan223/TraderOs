import type { AssessmentQuestion, ChoiceOption, ConceptRemediation, GradedItem, ScenarioItem, TrackAssessment } from "../types";

/*
  Track 5 assessment: Commodities.
  Futures leverage and expiry are safety-critical: sizing from the margin
  instead of the contract value, or drifting into delivery, are how a
  beginner turns a small idea into a large loss. Every price here is a
  made-up number for the sums.
*/

const T = "commodities";

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
    "Questions on every idea from the five lessons: energy benchmarks, inventories and crack spreads, precious and industrial metals, crops and stocks-to-use, futures expiry and rolling, and the dollar, with calculations and applied scenarios. You need 90% or more, a sound decision in the scenario, and every safety-critical question right: futures leverage and expiry.",
  concepts: [
    {
      id: "co-energy-c",
      title: "Energy benchmarks, inventories and refining margins",
      lessonIds: ["co-energy"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Every oil price rise can look like the same event. A rise driven by booming demand and one driven by a supply cut can mean opposite things for shares and currencies.",
        altExplanation: "Prices react to surprises against expectations: an inventory build bigger than forecast tends to weigh on price. Refining margins (crack spreads) show how profitable it is to turn crude into fuel, which drives refiners' demand for crude.",
        altExample: "In a made-up week analysts expect stocks to fall by 2 million barrels but they rise by 4 million. The surprise is a 6-million-barrel build, and crude slips.",
        practice: single("Which is a major US crude benchmark delivered at Cushing, Oklahoma?", [
          ["a", "Brent", "That is the North Sea benchmark."],
          ["b", "WTI", "Right. That is what the lesson showed."],
          ["c", "OPEC+", "That is a producer group."],
          ["d", "The dollar index", "Not a crude benchmark."],
        ], "b"),
      },
      flashcard: { front: "Energy basics", back: "WTI and Brent benchmarks. Inventory surprises move prices. Crack spread = refining margin. Ask whether a move is supply- or demand-driven." },
    },
    {
      id: "co-metals-c",
      title: "Precious and industrial metals",
      lessonIds: ["co-metals"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Gold is often described as a reliable inflation hedge. Evidence shows it can lose real value for long stretches, and over short and medium horizons it has not tracked inflation closely.",
        altExplanation: "Gold pays nothing, so higher real yields (bond yields after inflation) raise the cost of holding it. Copper follows building and factory activity. Silver sits in between. Contract sizes are large, so small price moves are large sums.",
        altExample: "In a made-up year inflation runs at 5% but real bond yields rise sharply. Gold falls, because holding it now means giving up a bigger real income from bonds.",
        practice: numeric("Gold is a made-up $2,700 an ounce and silver $30. What is the gold-silver ratio?", "ratio", 90, 0.5, "2,700 ÷ 30 = 90."),
      },
      flashcard: { front: "Metals", back: "Gold: fear, real yields, the dollar. Copper: growth. Silver: both. Gold-silver ratio = gold ÷ silver." },
    },
    {
      id: "co-ag",
      title: "Agricultural supply, storage and stocks-to-use",
      lessonIds: ["co-agriculture"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A big weather scare can seem bound to send crop prices soaring. If storage is full, the shortfall is met from stocks and prices may rise only modestly.",
        altExplanation: "Ending stocks = start + production − use. The stocks-to-use ratio compares that buffer with a year's use. When it is low, there is little to absorb shocks, so prices swing much more in both directions.",
        altExample: "A made-up crop starts with 300 in store, harvests 900 and uses 1,000. Ending stocks are 200, a fifth of a year's use: a comfortable buffer.",
        practice: numeric("Made-up crop: ending stocks 90, annual use 1,000. What is the stocks-to-use ratio, in %?", "%", 9, 0.1, "90 ÷ 1,000 = 9%."),
      },
      flashcard: { front: "Stocks-to-use", back: "Ending stocks ÷ annual use. Low = tight market, bigger price swings. Ending stocks = start + harvest − use." },
    },
    {
      id: "co-futures",
      title: "Futures leverage, expiry and rolling",
      lessonIds: ["co-futures-roll"],
      critical: true,
      safetyCritical: true,
      remediation: {
        misconception: "The small margin deposit on a futures contract can make the position feel small. Gains and losses follow the full contract value, so losses can exceed the deposit.",
        altExplanation: "Size from contract value (price × contract size), not margin. Roll or close before first notice day to avoid delivery. In contango, each roll buys the next contract dearer, so a long position loses a little each month even if spot is flat.",
        altExample: "A made-up gold contract covers 100 ounces at $2,400: $240,000 of exposure for a deposit of about a tenth of that. A 5% fall costs $12,000.",
        practice: numeric("A made-up oil contract covers 1,000 barrels at $70. What is its contract value, in $?", "$", 70000, 1, "1,000 × 70 = 70,000."),
      },
      flashcard: { front: "Futures safety", back: "Size from contract value, not margin. Roll before first notice day. Contango costs long rollers; backwardation pays." },
    },
    {
      id: "co-usd",
      title: "Commodities and the US dollar",
      lessonIds: ["co-dollar"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A weaker dollar can sound like a guarantee of higher commodity prices. The link is a tendency; supply shocks and crises can make both move the same way.",
        altExplanation: "Most commodities are priced in dollars. A stronger dollar raises prices for non-US buyers, which can damp demand. Local price = dollar price × local units per dollar. A non-US trader's result also includes the currency move.",
        altExample: "A made-up barrel at $90 with 0.85 euros per dollar costs a European buyer €76.50; if the dollar strengthens to 0.95, the same barrel costs €85.50.",
        practice: numeric("Oil is a made-up $60 and one dollar buys 150 yen. What does a barrel cost in yen?", "JPY", 9000, 1, "60 × 150 = 9,000 yen."),
      },
      flashcard: { front: "Dollar link", back: "Local price = $ price × local units per $. Stronger dollar tends to weigh on commodities, but not always." },
    },
    {
      id: "co-applied",
      title: "Applying commodity knowledge to decisions",
      lessonIds: ["co-energy", "co-futures-roll", "co-agriculture"],
      critical: true,
      safetyCritical: false,
      applied: true,
      remediation: {
        misconception: "It can seem enough to be right about a commodity's direction. Contract size, expiry dates, roll costs and scheduled reports decide whether a correct view becomes a profit or a loss.",
        altExplanation: "Before any commodity trade: work out the contract value and size from it; note expiry and first notice day; check the curve for roll costs; know the next scheduled report; and ask whether moves are supply- or demand-driven.",
        altExample: "A made-up trader expects oil to rise over six months. They find the curve in steep contango, so a rolled long would lose to roll costs, and they choose a smaller position further out the curve.",
        practice: scenario(
          "A trader wants long exposure to oil for a year and buys a fund that rolls monthly futures. The curve is in steep contango.",
          "What is the soundest view?",
          [
            ["a", "The fund will match the spot price exactly", "Rolling in contango makes it lag.", "unsound"],
            ["b", "Expect the fund to lag spot by roll costs, and size and choose products with that in mind", "Sound: accounts for the curve.", "sound"],
            ["c", "Buy twice as much to make up for roll costs", "Adds risk without fixing the cost.", "unsound"],
            ["d", "Check the curve once and assume it never changes", "Curves change; review it.", "partial"],
          ],
        ),
      },
      flashcard: { front: "Commodity routine", back: "Contract value, dates, curve, reports, cause of the move. Then size." },
    },

    {
      id: "co-crack",
      title: "Crack spreads and refining margins",
      lessonIds: ["co-energy"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Products and crude are quoted in different units, which makes it easy to subtract a per-gallon price from a per-barrel price. The spread only makes sense once both are in dollars per barrel.",
        altExplanation: "Gasoline and heating oil are quoted per gallon; crude per barrel of 42 gallons. Multiply product prices by 42, then take 2 × gasoline + 1 × heating oil − 3 × crude, and divide by 3 to get the 3-2-1 crack spread per barrel.",
        altExample: "In a made-up market gasoline is $2.10 a gallon, which is $88.20 a barrel once multiplied by 42, against crude at $78 a barrel.",
        practice: numeric("Gasoline is a made-up $2.20 a gallon. What is that per 42-gallon barrel, in $?", "$", 92.4, 0.05, "2.20 × 42 = 92.40."),
      },
      flashcard: { front: "Crack spread", back: "(2 × gasoline + 1 × heating oil − 3 × crude) ÷ 3, all in $ per barrel (products × 42). A rough refining margin." },
    },
    {
      id: "co-gold",
      title: "Gold, real yields and inflation",
      lessonIds: ["co-metals"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Gold can seem certain to rise whenever inflation is high. What matters more is the real yield: if bond yields rise faster than inflation, holding gold gets more costly and its price can fall.",
        altExplanation: "Real yield ≈ nominal yield − expected inflation. It is the income you give up by holding gold, which pays nothing. Rising real yields have tended to weigh on gold and falling ones to support it, though the link breaks at times.",
        altExample: "In a made-up year inflation is 6% and bond yields climb from 2% to 7%. Real yields turn positive, and gold drifts lower despite high inflation.",
        practice: numeric("A bond yields a made-up 4.5% and expected inflation is 3%. What is the real yield, in %?", "%", 1.5, 0.01, "4.5 − 3 = 1.5%."),
      },
      flashcard: { front: "Gold and real yields", back: "Real yield ≈ nominal − expected inflation = the cost of holding gold. Not a reliable year-to-year inflation hedge." },
    },
    {
      id: "co-reports",
      title: "Crop reports, seasonality and price limits",
      lessonIds: ["co-agriculture"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "A seasonal pattern on a long-term chart can look like a dependable trading rule. Weather, export policy and energy prices break it often, sometimes for several years running.",
        altExplanation: "Seasonality describes tendencies around planting, growing and harvest. Use it as context alongside stocks-to-use and the report calendar, and test any seasonal rule over many years and out of sample before trusting it.",
        altExample: "A made-up grain tends to rise into early summer in most years, but in a year with a record crop and full storage it falls through the whole season.",
        practice: tf("Seasonal patterns in crop prices fail in some years.", true, "True. They are tendencies, not rules."),
      },
      flashcard: { front: "Reports and seasons", back: "WASDE surprises move prices. Seasonality is context, not a rule. Some contracts have daily price limits." },
    },
    {
      id: "co-roll",
      title: "Contango, backwardation and roll yield",
      lessonIds: ["co-futures-roll"],
      critical: false,
      safetyCritical: false,
      remediation: {
        misconception: "Contango can sound like a sign that prices are about to rise. It only describes the curve's shape: later contracts cost more, often because storage and financing cost money.",
        altExplanation: "In contango, a long position rolled forward sells the expiring contract and buys a dearer one each time, losing a little; in backwardation it buys cheaper and gains. A steady monthly gap c gives roughly (1 ÷ (1 + c))^12 − 1 a year with flat spot.",
        altExample: "A made-up curve has each month 1.5% above the previous one for a year. A fund rolling monthly loses about 16% even though spot never moves.",
        practice: single("In backwardation, which contract costs more?", [
          ["a", "The later one", "That describes contango."],
          ["b", "They always cost the same", "Not in backwardation."],
          ["c", "Whichever has more trading volume", "Volume is not the definition."],
          ["d", "The nearer one", "Right. That is what the lesson showed."],
        ], "d"),
      },
      flashcard: { front: "Roll yield", back: "Contango: rolling a long loses. Backwardation: rolling a long gains. Curves change shape." },
    },
  ],
  questions: [
    // co-energy-c
    q("coq-en-1", "co-crack", "calculation", numeric("Made-up prices: crude $80 a barrel, gasoline $2.50 a gallon, heating oil $3.00 a gallon (42 gallons a barrel). What is the 3-2-1 crack spread, in $ per barrel?", "$/bbl", 32, 0.1, "(2 × 105 + 126 − 240) ÷ 3 = 96 ÷ 3 = 32."), "Convert products to $ per barrel, add two gasoline and one heating oil, subtract three crude, divide by three."),
    q("coq-en-2", "co-energy-c", "knowledge", single("US crude inventories rise much more than expected. What tends to happen?", [
      ["a", "Crude prices tend to fall", "Right. That is what the lesson showed."],
      ["b", "Crude must rise", "A surprise build usually weighs on price."],
      ["c", "Nothing; inventories never matter", "Surprises matter."],
      ["d", "Only natural gas reacts", "Crude reacts directly."],
    ], "a"), "An unexpected build means more supply relative to use than thought, which tends to push prices down."),
    q("coq-en-3", "co-energy-c", "knowledge", tf("Kilian (2009) found that oil price moves were driven mainly by supply disruptions.", false, "False. Demand shocks mattered more."), "Kilian found global demand and oil-specific demand shocks were the main drivers, and the different shocks affected the economy differently."),
    q("coq-en-4", "co-energy-c", "knowledge", single("Oil rises 10% because a major exporter halts shipments. What is the most likely effect on shares, compared with a rise driven by strong global demand?", [
      ["a", "Shares must rise either way", "The cause matters."],
      ["b", "No difference", "Supply and demand shocks differ."],
      ["c", "Shares tend to do worse, as higher costs hit growth", "Right. That is what the lesson showed."],
      ["d", "Shares can only move when the next official inventory figures are released", "Shares react at once."],
    ], "c"), "A supply shock raises costs without the boost from strong demand, so it tends to hurt growth and shares."),

    // co-metals-c
    q("coq-me-1", "co-metals-c", "knowledge", single("Which metal's price tends to follow factory and building activity most closely?", [
      ["a", "Gold", "Driven more by fear and real yields."],
      ["b", "Silver", "Partly; it is half precious."],
      ["c", "Platinum coins sold as gifts", "Not a benchmark."],
      ["d", "Copper", "Right. That is what the lesson showed."],
    ], "d"), "Copper is used heavily in construction and manufacturing, so its demand follows economic activity."),
    q("coq-me-2", "co-gold", "knowledge", tf("Rising real yields have tended to weigh on gold.", true, "True. They raise the cost of holding it."), "Gold pays nothing, so higher real yields on safe bonds increase what you give up by holding gold."),
    q("coq-me-3", "co-metals-c", "calculation", numeric("A made-up gold futures contract covers 100 troy ounces. Gold moves $15. How much does one contract's value change, in $?", "$", 1500, 1, "100 × 15 = 1,500."), "Value change = price change × contract size. Large contracts turn small price moves into large sums."),
    q("coq-me-4", "co-gold", "knowledge", tf("Erb and Harvey (2013) found gold to be a reliable inflation hedge over every horizon.", false, "False. Not over short and medium horizons."), "They found gold did not reliably track inflation over short and medium horizons, and its real price was historically high."),

    // co-ag
    q("coq-ag-1", "co-ag", "calculation", numeric("Made-up crop: starting stocks 200, harvest 1,050, use 1,100. What are ending stocks?", "units", 150, 0.5, "200 + 1,050 − 1,100 = 150."), "Ending stocks = start + production − use. They become the buffer for the next season."),
    q("coq-ag-2", "co-ag", "knowledge", single("Why do low stocks-to-use ratios make prices more volatile?", [
      ["a", "Exchanges raise their fees", "Not the mechanism."],
      ["b", "There is little buffer to absorb shocks", "Right. That is what the lesson showed."],
      ["c", "Farmers stop planting", "No: that is not how it works."],
      ["d", "Low stocks mean demand has vanished, so prices can only rise from here", "Prices can move both ways."],
    ], "b"), "With storage nearly empty, a small change in supply or demand must be met by price, not by drawing on stocks."),
    q("coq-ag-3", "co-reports", "knowledge", tf("Seasonal price patterns in crops are reliable enough to trade as fixed rules.", false, "False. Weather and policy break them."), "Seasonality is a tendency. Weather, export bans and energy prices regularly override it."),
    q("coq-ag-4", "co-reports", "knowledge", single("What is the WASDE report?", [
      ["a", "The USDA's monthly supply and demand estimates", "Right. That is what the lesson showed."],
      ["b", "A weather forecast", "Not a forecast service."],
      ["c", "A list of shop food prices", "No: that is not how it works."],
      ["d", "A trading signal service run by a private bank for its clients", "It is a public government report."],
    ], "a"), "WASDE is the US Department of Agriculture's World Agricultural Supply and Demand Estimates, a key scheduled release."),

    // co-futures (safety-critical)
    q("coq-fu-1", "co-roll", "calculation", numeric("Steady contango: each month the next contract is 1% above spot, and spot stays flat. Roughly what does a long position rolled monthly return over 12 months, in %? (1 ÷ 1.01¹² ≈ 0.887)", "%", -11.3, 0.3, "0.887 − 1 ≈ −11.3%."), "Each roll buys the next contract 1% dearer than the expiring one converges to, compounding to about −11% a year with flat spot."),
    q("coq-fu-2", "co-futures", "knowledge", single("Why should a speculator close or roll before first notice day?", [
      ["a", "Prices always jump after it", "No such rule."],
      ["b", "Margin is refunded only before it", "Not the reason."],
      ["c", "To avoid being assigned physical delivery", "Right. That is what the lesson showed."],
      ["d", "Exchanges close that week", "They do not."],
    ], "c"), "Holders of long, physically delivered contracts can be told to take delivery from first notice day, and trading near expiry can be thin and wild."),
    q("coq-fu-3", "co-futures", "knowledge", tf("A futures loss can be larger than the margin deposit.", true, "True. Losses follow the full contract value."), "Margin is a deposit, not a cap. A big enough move costs more than the deposit, and the shortfall is owed."),
    q("coq-fu-4", "co-roll", "knowledge", single("Spot oil is flat over a year, but a fund holding rolled oil futures fell 12%. What is the most likely cause?", [
      ["a", "Rolling in contango", "Right. That is what the lesson showed."],
      ["b", "The fund holds gold by mistake", "Unlikely to explain it."],
      ["c", "The dollar", "Spot is in dollars too."],
      ["d", "A bug in the chart software", "Unlikely to explain it."],
    ], "a"), "When later contracts cost more, each roll loses a little; repeated monthly it adds up."),
    q("coq-fu-5", "co-roll", "knowledge", multi("Which describe backwardation? Select all that apply.", [
      ["a", "Later contracts cost less than nearer ones", "Right. It belongs in the answer."],
      ["b", "Common when supplies are tight", "Right. It belongs in the answer."],
      ["c", "Rolling a long position costs money each month", "That is contango."],
      ["d", "Storage tanks are usually full", "That tends to give contango."],
    ], ["a", "b"]), "Backwardation, with later contracts cheaper, tends to appear when supplies are tight, and rolling a long position then adds return."),

    // co-usd
    q("coq-us-1", "co-usd", "calculation", numeric("Gold is a made-up $2,000 and one dollar buys 0.80 pounds. What does an ounce cost in pounds?", "GBP", 1600, 1, "2,000 × 0.80 = 1,600."), "Local price = dollar price × local units per dollar."),
    q("coq-us-2", "co-usd", "knowledge", single("The dollar strengthens against the yen. What happens to the yen price of a $70 barrel?", [
      ["a", "It falls", "A stronger dollar costs more yen."],
      ["b", "It is unchanged", "It changes with the rate."],
      ["c", "Oil cannot be priced in yen", "It can be converted."],
      ["d", "It rises", "Right. That is what the lesson showed."],
    ], "d"), "More yen per dollar means more yen for the same dollar price."),
    q("coq-us-3", "co-usd", "knowledge", tf("Oil and the dollar always move in opposite directions.", false, "False. A supply shock can lift both."), "The opposite-direction link is a tendency. In supply shocks or some crises, both can rise together."),
    q("coq-us-4", "co-usd", "knowledge", single("Which is usually called a commodity currency?", [
      ["a", "The Swiss franc", "A safe haven, not a commodity currency."],
      ["b", "The Australian dollar", "Right. That is what the lesson showed."],
      ["c", "The euro", "Not usually."],
      ["d", "Any stablecoin", "Unrelated to the question."],
    ], "b"), "Australia's exports rely heavily on commodities such as iron ore and coal, so its currency often moves with them."),

    // co-applied (scenarios)
    q("coq-ap-1", "co-applied", "applied", scenario(
      "A trader with a $20,000 account buys two made-up crude contracts (1,000 barrels each at $75) because the margin is only $6,000 each.",
      "What is the soundest assessment?",
      [
        ["a", "Fine, the margin fits the account", "Sizes from margin, not exposure.", "unsound"],
        ["b", "The exposure is $150,000, 7.5× the account; size from contract value and a planned stop instead", "Sound: recognises the real exposure.", "sound"],
        ["c", "Keep both but set a very tight stop", "A tight stop in oil is often hit by noise; exposure is still too large.", "partial"],
        ["d", "Add a third contract to average the price", "Adds more leverage.", "unsound"],
      ],
    ), "Futures losses follow contract value. Size from exposure and the stop distance, not from the margin requirement."),
    q("coq-ap-2", "co-applied", "applied", scenario(
      "A trader holds a long, physically delivered grain contract. First notice day is tomorrow and they plan to keep the position for another month.",
      "What is the soundest action?",
      [
        ["a", "Do nothing; delivery never really happens", "It can, for long holders.", "unsound"],
        ["b", "Wait and see if a notice arrives", "Risks delivery and thin trading.", "partial"],
        ["c", "Roll to the next contract month today", "Sound: keeps the exposure without delivery risk.", "sound"],
        ["d", "Double the position before expiry", "Adds risk at the worst time.", "unsound"],
      ],
    ), "Speculators roll or close before first notice day to avoid delivery and the thin, erratic trading near expiry."),
    q("coq-ap-3", "co-applied", "applied", scenario(
      "A WASDE report is due in an hour. A trader holds a large corn position, and stocks-to-use is already very low.",
      "What is the soundest process?",
      [
        ["a", "Add more before the report to catch the move", "Increases exposure into a jump.", "unsound"],
        ["b", "Cut the size to what a large surprise move could safely cost, or wait until after", "Sound: plans for report risk in a tight market.", "sound"],
        ["c", "Remove the stop to avoid being shaken out", "Removes protection.", "unsound"],
        ["d", "Keep the full size but tell yourself to watch closely", "Watching does not limit a gap.", "partial"],
      ],
    ), "Low stocks plus a scheduled report means large possible moves. Size for the worst plausible surprise."),
    q("coq-ap-4", "co-applied", "applied", scenario(
      "A European trader buys gold in dollars. Over a month gold rises 4% and the dollar falls 4% against the euro.",
      "What is the soundest description of their result?",
      [
        ["a", "About flat in euros: the currency move cancelled the gain", "Sound: thinks in the account currency.", "sound"],
        ["b", "Up 4%, the currency does not matter", "Ignores the exchange rate.", "unsound"],
        ["c", "Up 8%", "Adds the moves the wrong way.", "unsound"],
        ["d", "Roughly flat, but only because gold is a perfect hedge", "Right result, wrong reason.", "partial"],
      ],
    ), "For a non-US trader, a dollar-priced commodity carries a currency position. Measure results in your own currency."),

    // added: co-energy-c
    q("coq-en-5", "co-energy-c", "knowledge", single("Which group agrees oil production targets among major producers?", [
      ["a", "OPEC+", "Right. That is what the lesson showed."],
      ["b", "The WASDE", "That is a crop report."],
      ["c", "The dollar index", "That is a currency index."],
      ["d", "The International Monetary Fund's trading desk", "Not an oil producer group."],
    ], "a"), "OPEC+ is the producer group, including allies such as Russia, whose output decisions can move oil prices."),
    // added: co-crack
    q("coq-ck-2", "co-crack", "knowledge", single("What does the crack spread roughly measure?", [
      ["a", "The cost of shipping oil", "Shipping is not part of it."],
      ["b", "The gap between WTI and Brent", "That is a benchmark spread."],
      ["c", "A refiner's margin from turning crude into products", "Right. That is what the lesson showed."],
      ["d", "The tax on gasoline at the pump", "Taxes are not part of it."],
    ], "c"), "Products' value minus crude's cost approximates what refiners earn before their own costs."),
    q("coq-ck-3", "co-crack", "calculation", numeric("Made-up prices: crude $70 a barrel, gasoline $2.00 a gallon, heating oil $2.50 a gallon. What is the 3-2-1 crack spread, in $ per barrel?", "$/bbl", 21, 0.1, "(2 × 84 + 105 − 210) ÷ 3 = 63 ÷ 3 = 21."), "Convert products to $ per barrel (× 42), add two gasoline and one heating oil, subtract three crude, divide by three."),
    q("coq-ck-4", "co-crack", "knowledge", tf("A wider crack spread can encourage refiners to buy more crude.", true, "True. Refining is then more profitable."), "A wide spread makes refining profitable, so refiners tend to run harder and buy more crude."),
    // added: co-metals-c
    q("coq-me-5", "co-metals-c", "calculation", numeric("A made-up silver futures contract covers 5,000 ounces. Silver moves $0.50. How much does one contract's value change, in $?", "$", 2500, 1, "5,000 × 0.50 = 2,500."), "Value change = price change × contract size. Silver contracts are large in ounces."),
    q("coq-me-6", "co-metals-c", "knowledge", tf("Silver is used only for jewellery and has no industrial demand.", false, "False. Electronics and solar panels use it."), "Silver is partly a precious metal and partly an industrial metal, which is why it sits between gold and copper in behaviour."),
    // added: co-gold
    q("coq-gd-3", "co-gold", "calculation", numeric("A made-up 10-year bond yields 5% and expected inflation is 2.5%. What is the real yield, in %?", "%", 2.5, 0.01, "5 − 2.5 = 2.5%."), "Real yield ≈ nominal yield − expected inflation: the income given up by holding gold instead."),
    q("coq-gd-4", "co-gold", "knowledge", single("Gold pays no interest. What does that mean for holding it?", [
      ["a", "It can never lose value", "It can and has lost value."],
      ["b", "You give up the income safe bonds would pay", "Right. That is what the lesson showed."],
      ["c", "It is taxed at zero everywhere", "Tax rules vary by country."],
      ["d", "It must rise when interest rates rise", "Often the opposite."],
    ], "b"), "The opportunity cost of gold is the real income from safe bonds; when that rises, gold tends to be less attractive."),
    // added: co-ag
    q("coq-ag-5", "co-ag", "calculation", numeric("Made-up crop: ending stocks 120, annual use 1,500. What is the stocks-to-use ratio, in %?", "%", 8, 0.05, "120 ÷ 1,500 = 8%."), "Stocks-to-use = ending stocks ÷ annual use; 8% would be a tight market for many crops."),
    q("coq-ag-6", "co-ag", "knowledge", single("Two years have the same 10% harvest shortfall. In which is the price rise likely to be larger?", [
      ["a", "The year with large starting stocks", "Stocks absorb the shortfall."],
      ["b", "Both the same", "The buffer differs."],
      ["c", "Neither; harvests never move prices", "They do move prices."],
      ["d", "The year with small starting stocks", "Right. That is what the lesson showed."],
    ], "d"), "With little in storage, the shortfall must be met by higher prices that ration demand."),
    // added: co-reports
    q("coq-rp-3", "co-reports", "knowledge", tf("A WASDE report usually has no effect on grain prices.", false, "False. Surprises can move prices sharply."), "Reports that differ from expectations, especially on ending stocks, can move prices within minutes of release."),
    q("coq-rp-4", "co-reports", "knowledge", single("How should a trader treat a strong seasonal tendency in a crop?", [
      ["a", "As a rule to trade every year", "Weather and policy break it."],
      ["b", "As context that needs testing and can fail", "Right. That is what the lesson showed."],
      ["c", "As noise to ignore completely", "It can be useful context."],
      ["d", "As a reason to use more leverage", "Tendencies never justify extra risk."],
    ], "b"), "Seasonality helps frame expectations, but it fails in some years and should be tested before use."),
    // added: co-futures
    q("coq-fu-6", "co-futures", "calculation", numeric("A made-up silver contract covers 5,000 ounces at $28. Its margin is $14,000. Roughly what leverage is that, as a multiple?", "×", 10, 0.05, "5,000 × 28 = 140,000; 140,000 ÷ 14,000 = 10×."), "Leverage ≈ contract value ÷ margin. A 10% move against the position equals the whole deposit."),
    q("coq-fu-7", "co-futures", "knowledge", single("A trader with a $25,000 account wants one made-up gold contract (100 oz at $2,500). What is the soundest first step?", [
      ["a", "Check the margin fits, then buy", "That sizes from margin, not exposure."],
      ["b", "Work out the $250,000 exposure and whether a planned stop's loss fits the risk limit", "Right. That is what the lesson showed."],
      ["c", "Buy two to average down later", "Adds leverage before any plan."],
      ["d", "Skip the stop because gold is a safe haven", "Gold can move sharply."],
    ], "b"), "Exposure is ten times the account here. Size from contract value and a stop, not from the margin requirement."),
    // added: co-roll
    q("coq-ro-4", "co-roll", "knowledge", single("Why is contango common when storage is plentiful?", [
      ["a", "Later delivery must cover storage and financing costs", "Right. That is what the lesson showed."],
      ["b", "Exchanges require it", "No such rule exists."],
      ["c", "Buyers expect prices to collapse", "Not the main reason."],
      ["d", "Spot prices are fixed by producers", "Spot prices are not fixed."],
    ], "a"), "Holding a commodity for later delivery costs storage and interest, which tends to make later contracts dearer."),
  ],
};

const MORE_REMEDIATION: Record<string, ConceptRemediation> = {
  "co-energy-c": {
    misconception: "A wide crack spread can look like a sign that crude is expensive. It means refined products are valuable relative to crude, which makes refining profitable.",
    altExplanation: "The 3-2-1 crack spread takes two barrels of gasoline plus one of heating oil, subtracts three barrels of crude and divides by three. Products are priced per gallon, so multiply by 42 first. A wide spread encourages refiners to buy more crude.",
    altExample: "In a made-up month gasoline jumps on a refinery outage while crude is steady. The crack spread widens and refiners elsewhere run harder.",
    practice: tf("A negative crack spread means refining loses money.", true, "True. Products are worth less than the crude."),
  },
  "co-metals-c": {
    misconception: "A gold-silver ratio far from its average can look like a sure trade back to normal. Ratios can stay stretched for years.",
    altExplanation: "The ratio is simply gold ÷ silver. It reflects their different drivers: gold's role as a store of value and silver's industrial use. Any rule that trades it back to an average needs proper testing, not just a chart that looks stretched.",
    altExample: "In a made-up decade the ratio rises from 60 to 100 and stays above 80 for five years, while a trader keeps betting on a fall.",
    practice: single("What does real yield mean?", [
      ["a", "The yield on gold", "Gold pays none."],
      ["b", "A bond yield after expected inflation", "Right. That is what the lesson showed."],
      ["c", "The dividend on mining shares", "Not what it means."],
      ["d", "The interest a broker pays on cash held overnight", "Not what it means."],
    ], "b"),
  },
  "co-ag": {
    misconception: "Government crop reports can seem like old news by the time they appear. They often contain surprises against market expectations and can move prices sharply on release.",
    altExplanation: "Track the WASDE calendar. Before each report, note what analysts expect for ending stocks; after it, compare. Low stocks-to-use magnifies the price effect of any surprise, and some contracts have daily price limits that can trap you.",
    altExample: "In a made-up report, ending stocks come in a tenth below expectations in an already tight market. The price rises by its daily limit and trading stops for the day.",
    practice: tf("Some agricultural futures have daily price limits that can stop you exiting.", true, "True. Check each contract's rules."),
  },
  "co-futures": {
    misconception: "A commodity fund can seem to be the same as owning the commodity. Because it holds futures and rolls them, its returns can drift far from the spot price.",
    altExplanation: "Each month the fund sells the expiring contract and buys a later one. In contango it buys higher, which costs return; in backwardation it buys lower, which adds return. Over a year with a steady curve: roll return ≈ (1 ÷ (1 + monthly gap))^12 − 1.",
    altExample: "A made-up fund rolls in 2% monthly contango while spot rises 5% over a year. The fund still ends the year down, because roll costs outweigh the spot gain.",
    practice: single("In contango, which contract costs more?", [
      ["a", "The nearer one", "That is backwardation."],
      ["b", "They always cost the same", "Not in contango."],
      ["c", "The later one", "Right. That is what the lesson showed."],
      ["d", "Whichever has more open interest", "Not the definition."],
    ], "c"),
  },
  "co-usd": {
    misconception: "Holding a dollar-priced commodity can seem like a pure bet on the commodity. For anyone whose account is in another currency, it is also a bet on the dollar.",
    altExplanation: "Your return in your own currency ≈ commodity return + currency return (for small moves). A strong dollar can erase a commodity gain for a non-US investor, or add to a commodity loss.",
    altExample: "A made-up Japanese investor buys oil; oil rises 6% in dollars but the yen strengthens 6% against the dollar. In yen, the trade is about flat.",
    practice: tf("A non-US trader's result in a dollar-priced commodity depends only on the commodity's price.", false, "False. The exchange rate matters too."),
  },
  "co-applied": {
    misconception: "Planning for expiry, reports and roll costs can feel like detail. In leveraged futures, these details decide whether a good idea survives.",
    altExplanation: "Before each trade, write down: contract value and size from it, first notice and last trading days, curve shape and roll cost, upcoming scheduled reports, and whether the move you expect is supply- or demand-driven.",
    altExample: "A made-up trader expects copper to rise on growth. They check the contract size, see an index of factory surveys is due tomorrow, and wait for it before entering at a smaller size.",
    practice: scenario(
      "A trader sees oil up 8% in a morning on a headline about an export halt and wants to buy a full position immediately with futures.",
      "What is the soundest approach?",
      [
        ["a", "Buy the maximum size the margin allows", "Sizes from margin into a volatile spike.", "unsound"],
        ["b", "Confirm the news from primary sources, then size from contract value and a stop outside the now-wider swings", "Sound: it follows the lesson's process.", "sound"],
        ["c", "Buy half now without a stop", "Smaller, but unprotected.", "partial"],
        ["d", "Sell short because spikes always reverse", "Assumes a rule that does not exist.", "unsound"],
      ],
    ),
  },

  "co-crack": {
    misconception: "Refiners can seem to want crude whatever its price. They buy crude to sell products, so when the crack spread turns thin or negative they tend to cut how much they process.",
    altExplanation: "The crack spread is roughly a refiner's gross margin. Wide spreads encourage higher refinery runs and more crude buying; narrow or negative ones discourage it. Traders watch it as a sign of refiners' demand for crude.",
    altExample: "In a made-up season of weak driving demand, gasoline prices sag while crude holds firm. Margins shrink and several refiners schedule early maintenance.",
    practice: tf("When crack spreads are negative, refiners typically process more crude.", false, "False. Refining then loses money."),
  },
  "co-gold": {
    misconception: "Gold's long history can make it seem like a safe store of value over any period. Its price has fallen by large amounts for years at a time.",
    altExplanation: "Erb and Harvey found gold was not a reliable inflation hedge over short and medium horizons, and that its real price was high by historical standards. Treat it as a volatile asset with its own drivers: fear, real yields, the dollar and central bank buying.",
    altExample: "In a made-up decade gold peaks early, then loses close to half its value over the following years while consumer prices keep rising.",
    practice: single("Which tends to raise the cost of holding gold?", [
      ["a", "Rising real yields", "Right. That is what the lesson showed."],
      ["b", "Falling real yields", "That lowers the cost."],
      ["c", "A weaker dollar", "That tends to support gold."],
      ["d", "Higher demand for jewellery during festivals", "That is demand, not holding cost."],
    ], "a"),
  },
  "co-reports": {
    misconception: "It can seem that you can always exit a futures position at some price. Some agricultural contracts have daily price limits, and on a limit day trading can stop with you still in the position.",
    altExplanation: "When a contract moves by its daily limit, trading at worse prices is not allowed until the next session, so a losing position can be trapped. Check each contract's limit rules and size positions so that a limit move against you is survivable.",
    altExample: "On a made-up report day a corn contract jumps by its limit within minutes. Short sellers cannot buy back at any allowed price until the next day.",
    practice: single("What can happen on a limit-move day in some agricultural futures?", [
      ["a", "Trading at worse prices stops until the next session", "Right. That is what the lesson showed."],
      ["b", "The exchange refunds all losses", "There are no refunds."],
      ["c", "Prices reset to the previous week's level", "Prices do not reset."],
      ["d", "Only farmers may trade", "Everyone may trade within the limit."],
    ], "a"),
  },
  "co-roll": {
    misconception: "Curve shapes can look permanent. A market in contango can flip to backwardation when supplies tighten, and the roll cost or gain changes with it.",
    altExplanation: "Check the curve before holding exposure for months and recheck it regularly. Ample stocks and costly storage tend to give contango; shortages tend to give backwardation. Some funds roll further out or less often to reduce the cost.",
    altExample: "In a made-up year oil starts in mild contango, then a supply disruption tightens stocks and the curve flips into backwardation within weeks.",
    practice: tf("A futures curve can switch from contango to backwardation.", true, "True. Curves change with supply and storage."),
  },
};

export const COMMODITIES_ASSESSMENT: TrackAssessment = {
  ...BASE,
  concepts: BASE.concepts.map((c) => ({ ...c, moreRemediation: MORE_REMEDIATION[c.id] ? [MORE_REMEDIATION[c.id]] : [] })),
};
