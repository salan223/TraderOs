import type { Lesson } from "../types";

/*
  Track 5: Commodities, lessons 1–5. Energy, metals, agriculture, futures
  expiry and rolling, and the dollar. Every price, harvest and curve in the
  tools is set by the learner; real events are described in words only.
  Research items not checked line by line against the paper are marked
  "Unverified".
*/

const T = "commodities";

export const CO1_ENERGY: Lesson = {
  id: "co-energy",
  trackId: T,
  order: 1,
  format: "full",
  title: "Energy markets: oil and gas",
  summary: "Oil prices come from global supply and demand, inventories, producer decisions and refining margins. Benchmarks such as WTI and Brent set the price of most of the world's oil.",
  minutes: 22,
  objectives: [
    "Name the main oil benchmarks and what they represent.",
    "Explain how supply, demand and inventories move energy prices.",
    "Calculate a 3-2-1 crack spread and say what it measures.",
    "Distinguish supply shocks from demand shocks.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Oil feeds into transport, plastics, fertiliser and electricity. Its price affects [[inflation]], company profits and whole currencies." },
        { kind: "p", text: "Energy is also among the most traded [[commodity|commodities]], and among the quickest to react to news." },
        { kind: "callout", tone: "info", title: "Linked lesson", text: "Market Foundations introduced commodities. This track goes market by market.", link: { lessonId: "commodities-intro", label: "Commodities: the short version" } },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Benchmarks, producers and stocks",
      blocks: [
        { kind: "defs", items: [
          { term: "[[wti|WTI]]", text: "A US crude benchmark, delivered at Cushing, Oklahoma." },
          { term: "[[brent|Brent]]", text: "A North Sea benchmark used to price much internationally traded oil." },
          { term: "[[opec|OPEC+]]", text: "Producer countries that agree output targets." },
          { term: "Inventories", text: "Oil in storage. Weekly US figures are a scheduled market-moving release." },
        ] },
        { kind: "p", text: "When more oil is produced than used, stocks build up and prices tend to fall; when use exceeds output, stocks are drawn down and prices tend to rise." },
        { kind: "p", text: "Crude is only useful once refined. The [[crack-spread|crack spread]], products' value minus crude's cost, is a rough guide to refiners' margins and so to their demand for crude." },
        { kind: "callout", tone: "key", title: "Key idea", text: "Oil reacts to surprises against expectations: an inventory build that was expected moves the price little; an unexpected one can move it a lot." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Refining margins",
      blocks: [
        { kind: "interactive", widget: "co-crack-spread", title: "The 3-2-1 crack spread", caption: "Set prices for crude, gasoline and heating oil. Three barrels of crude roughly become two of gasoline and one of heating oil; the difference per barrel is the crack spread. Prices are made up." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "Not every oil spike is the same",
      blocks: [
        { kind: "p", text: "A war that cuts supply and a booming world economy can both push oil up. But the first hurts growth while the second reflects it, so shares and currencies often react differently." },
        { kind: "callout", tone: "example", title: "Example", text: "In a made-up month, oil rises 10% because factories everywhere are busy: shares rise too. In another, oil rises 10% because a major supplier stops exporting: shares fall." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: supply and demand shocks",
      blocks: [
        { kind: "concept-card", card: {
          name: "Oil supply and demand balance",
          what: "The relation between how much oil the world produces and how much it uses, with inventories as the buffer.",
          whyItExists: "Oil cannot be produced or stopped instantly, and storage is limited, so short-run imbalances move prices sharply.",
          problemSolved: "It explains why inventories and producer decisions are watched so closely.",
          mechanics: "Production minus consumption equals the change in inventories. Surprising builds tend to push prices down; surprising draws push them up.",
          math: "Δ inventories = production − consumption. Surprise = actual change − expected change.",
          howTradersUseIt: "They compare weekly inventory data and producer announcements with forecasts, and watch refining margins.",
          whenUseful: "Around scheduled inventory reports and producer meetings.",
          whenItFails: "When a geopolitical event or a sudden demand collapse overwhelms the usual data.",
          limitations: "Global inventories are not measured precisely, and data from some producers are unreliable.",
          misconceptions: "That oil always rises in a crisis. A crisis that crushes demand can send it down instead.",
          realExample: "In 2020, as lockdowns cut fuel use, storage filled and one WTI futures contract briefly settled below zero near its expiry.",
          exercise: "Find the date and time of the next weekly US crude inventory release.",
          practicalTest: "Before the next release, note the expected change, then compare with the actual figure and the price reaction.",
        } },
        { kind: "research", research: {
          title: "Not All Oil Price Shocks Are Alike: Disentangling Demand and Supply Shocks in the Crude Oil Market",
          authors: "Lutz Kilian",
          year: 2009,
          venue: "American Economic Review 99(3)",
          peerReviewed: true,
          question: "Are oil price rises driven by supply disruptions or by demand, and does the cause matter for the economy?",
          methodology: "A structural model separating oil supply shocks, shocks to global demand for all industrial commodities, and oil-specific (precautionary) demand shocks.",
          data: "Monthly global oil production, an index of global real economic activity and the real price of oil, 1973–2007.",
          findings: "Oil price moves were driven mainly by global demand and oil-specific demand shocks rather than by supply disruptions, and the different shocks had different effects on the US economy.",
          limitations: "Results depend on the model's assumptions and on the activity index used; later work debates the details.",
          practicalMeaning: "Ask why oil is moving. A demand-driven rise and a supply-driven rise can mean opposite things for other markets.",
          status: "replicated",
          url: "https://doi.org/10.1257/aer.99.3.1053",
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
          { name: "Fundamental analysts", view: "Build supply and demand balances, country by country, and track inventories." },
          { name: "Refiners and hedgers", view: "Trade crack spreads to lock in refining margins." },
          { name: "Macro traders", view: "Ask whether oil moves are demand-driven or supply-driven before trading other markets." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Trading every headline about producers.", why: "Many statements are already expected or later reversed.", instead: "Compare with what was priced in." },
          { mistake: "Ignoring the cause of a move.", why: "Supply and demand shocks affect other markets differently.", instead: "Ask why oil is moving." },
          { mistake: "Holding energy futures into expiry by accident.", why: "Delivery and thin trading near expiry can cause wild moves.", instead: "Know your contract's last dates." },
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
            "WTI and Brent are the main crude benchmarks.",
            "Inventories buffer supply and demand; surprises move prices.",
            "Crack spreads measure refining margins.",
            "Supply-driven and demand-driven oil moves mean different things.",
          ],
          equations: [{ label: "3-2-1 crack", formula: "(2 × gasoline + 1 × heating oil − 3 × crude) ÷ 3, all in $ per barrel" }],
          implications: ["Track scheduled inventory data.", "Ask why prices move.", "Know contract expiry dates."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Find the latest WTI and Brent prices and note the gap between them.",
          "Note the date of the next OPEC+ meeting from a reliable news source.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "co-energy-ex",
    title: "Work out a crack spread",
    prompt: "Made-up prices: crude $75 a barrel, gasoline $2.30 a gallon, heating oil $2.70 a gallon. A barrel holds 42 gallons. What is the 3-2-1 crack spread, in $ per barrel?",
    unit: "$/bbl",
    answer: 27.2,
    tolerance: 0.1,
    hint: "Convert products to $ per barrel (× 42), add 2 gasoline + 1 heating oil, subtract 3 crude, divide by 3.",
    solution: "Gasoline 2.30 × 42 = 96.6; heating oil 2.70 × 42 = 113.4. (2 × 96.6 + 113.4 − 3 × 75) ÷ 3 = (193.2 + 113.4 − 225) ÷ 3 = 81.6 ÷ 3 = 27.2.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "Where is WTI crude delivered?",
      options: [
        { id: "a", text: "Rotterdam", explain: "Not the WTI point." },
        { id: "b", text: "Cushing, Oklahoma", explain: "Right." },
        { id: "c", text: "The North Sea", explain: "That is Brent." },
        { id: "d", text: "Anywhere the buyer chooses, as long as it is a port with enough storage tanks", explain: "Delivery is at a set location." },
      ],
      correct: "b",
    },
    {
      id: "q2",
      prompt: "US crude stocks rise by much more than expected. What tends to happen to the price?",
      options: [
        { id: "a", text: "It tends to fall: more supply than thought", explain: "Right." },
        { id: "b", text: "It must rise", explain: "A surprise build usually weighs on price." },
        { id: "c", text: "Nothing, data never matters", explain: "Surprises matter." },
        { id: "d", text: "Only gold reacts", explain: "Oil reacts directly." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      prompt: "What does a wide crack spread suggest?",
      options: [
        { id: "a", text: "Refining is losing money", explain: "That is a negative spread." },
        { id: "b", text: "Crude is about to be banned", explain: "Unrelated." },
        { id: "c", text: "Gasoline is cheaper than crude, so refiners will cut the amount of crude they process", explain: "That describes a negative spread." },
        { id: "d", text: "Refining is profitable, so refiners want more crude", explain: "Right." },
      ],
      correct: "d",
    },
    {
      id: "q4",
      prompt: "Kilian (2009) found oil price moves were driven mainly by…",
      options: [
        { id: "a", text: "Supply disruptions alone", explain: "He found demand shocks mattered more." },
        { id: "b", text: "Weather in Texas", explain: "Not his finding." },
        { id: "c", text: "Global demand and oil-specific demand shocks", explain: "Right." },
        { id: "d", text: "The US dollar index", explain: "Not his main finding." },
      ],
      correct: "c",
    },
  ],
  practical: {
    title: "An inventory report",
    instructions: "Research only. Do not trade.",
    steps: [
      "Find when the next weekly US crude inventory report is released.",
      "Note the expected change from a news source before it comes out.",
      "Afterwards, note the actual change and how WTI moved in the next hour.",
    ],
    reflectionPrompt: "Did the price move in the direction you expected from the surprise? If not, what else might have mattered?",
  },
  glossary: ["wti", "brent", "crack-spread", "opec"],
  next: "co-metals",
};

export const CO2_METALS: Lesson = {
  id: "co-metals",
  trackId: T,
  order: 2,
  format: "full",
  title: "Precious and industrial metals",
  summary: "Gold trades as money and a safe haven, silver is half precious and half industrial, and copper follows the economy. Their prices respond to different forces.",
  minutes: 20,
  objectives: [
    "Explain why gold behaves differently from industrial metals.",
    "Describe how real yields relate to gold.",
    "Calculate the gold-silver ratio and the value of a futures contract.",
    "Judge how reliable gold is as an inflation hedge.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Gold is the most widely watched commodity outside oil, and many beginners buy it believing it always protects against inflation." },
        { kind: "p", text: "The evidence is more mixed, and industrial metals follow very different drivers." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Three kinds of metal",
      blocks: [
        { kind: "defs", items: [
          { term: "Gold", text: "Held by central banks and investors as a store of value and [[safe-haven|safe haven]]; little is used up." },
          { term: "Silver", text: "Partly a precious metal, partly an [[industrial-metal|industrial metal]] used in electronics and solar panels." },
          { term: "Copper", text: "Used in building and wiring; its price tends to follow factory activity." },
        ] },
        { kind: "p", text: "Gold pays no interest. When the [[real-yield|real yield]] on safe bonds is high, holding gold costs more in lost income, which can weigh on its price." },
        { kind: "callout", tone: "key", title: "Key idea", text: "Gold responds to fear, real interest rates and the dollar; copper responds to growth. Do not treat \"metals\" as one market." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Ratios and contract sizes",
      blocks: [
        { kind: "interactive", widget: "co-metals", title: "Gold, silver and copper contracts", caption: "Set made-up metal prices. See the gold-silver ratio and what one futures contract of each metal is worth. A small price move times a large contract is a large amount of money." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "Measured in ounces",
      blocks: [
        { kind: "p", text: "Precious metals are priced per [[troy-ounce|troy ounce]] (about 31.1 grams). A common gold futures contract covers 100 ounces, so a $1 move changes it by $100." },
        { kind: "p", text: "The [[gold-silver-ratio|gold-silver ratio]] tells you how many ounces of silver buy one ounce of gold. It has ranged widely over decades." },
        { kind: "callout", tone: "example", title: "Example", text: "With gold at a made-up $2,400 and silver at $30, the ratio is 80. If silver rises 10% and gold does not, it falls to about 73." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: is gold an inflation hedge?",
      blocks: [
        { kind: "concept-card", card: {
          name: "Gold and real yields",
          what: "The tendency for gold to be weaker when real (after-inflation) bond yields are high, and stronger when they are low.",
          whyItExists: "Gold pays nothing. Holding it means giving up the real income a safe bond would pay.",
          problemSolved: "It explains periods when gold falls despite high inflation, if real yields are rising.",
          mechanics: "Real yield ≈ nominal yield − expected inflation. Rising real yields raise the cost of holding gold; falling ones lower it.",
          math: "Real yield ≈ nominal yield − expected inflation.",
          howTradersUseIt: "They watch inflation-protected bond yields alongside gold, and the dollar.",
          whenUseful: "When interest rates and inflation expectations are moving.",
          whenItFails: "When central bank buying or a crisis dominates, the relationship can weaken for long periods.",
          limitations: "A tendency, not a law; it has broken down at times.",
          misconceptions: "That gold always rises with inflation. Over short and medium horizons it often has not.",
          realExample: "If inflation is 4% and bonds pay 5%, the real yield is about 1%; at 2% inflation and 5% bonds, it is about 3%, a bigger cost to holding gold.",
          exercise: "Find the current 10-year inflation-protected US bond yield.",
          practicalTest: "Compare a one-year chart of gold with one of that real yield and note when they moved together and when not.",
        } },
        { kind: "research", research: {
          title: "The Golden Dilemma",
          authors: "Claude B. Erb and Campbell R. Harvey",
          year: 2013,
          venue: "Financial Analysts Journal 69(4)",
          peerReviewed: true,
          question: "Is gold a reliable hedge against inflation and currency debasement, and what does its real price suggest about future returns?",
          methodology: "Analysis of gold's real price over long periods and across countries, and its relation to inflation over different horizons.",
          data: "Gold prices and inflation over decades, including very long historical series.",
          findings: "Gold was not a reliable inflation hedge over short and medium horizons. Its real price was high by historical standards, which in the past has been followed by below-average real returns.",
          limitations: "Long-run relationships rest on few independent periods; gold's role may change with central bank demand.",
          practicalMeaning: "Do not buy gold assuming it will track inflation year to year. It can lose real value for long stretches.",
          status: "regime-sensitive",
          url: "https://doi.org/10.2469/faj.v69.n4.1",
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
          { name: "Macro traders", view: "Trade gold against real yields and the dollar." },
          { name: "Industrial analysts", view: "Follow copper with factory surveys and Chinese demand." },
          { name: "Relative-value traders", view: "Watch ratios such as gold-silver, knowing they can stay extreme for years." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Assuming gold always beats inflation.", why: "Evidence shows long periods when it did not.", instead: "Treat it as a volatile asset with its own drivers." },
          { mistake: "Ignoring contract size.", why: "100 ounces of gold or 5,000 of silver is a large position.", instead: "Work out the money per point before trading futures." },
          { mistake: "Trading a ratio as if it must return to an average.", why: "Ratios can trend for years.", instead: "Test any ratio rule properly before relying on it." },
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
            "Gold is a store of value and safe haven; copper tracks growth; silver is in between.",
            "Real yields are the cost of holding gold.",
            "Gold has not reliably tracked inflation over short and medium horizons.",
            "Futures contracts cover large quantities.",
          ],
          equations: [
            { label: "Real yield", formula: "≈ nominal yield − expected inflation" },
            { label: "Gold-silver ratio", formula: "= gold price ÷ silver price" },
          ],
          implications: ["Separate precious from industrial metals.", "Watch real yields when trading gold.", "Check contract sizes."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Find current gold and silver prices and calculate the ratio.",
          "Look up the contract size of one gold futures contract on its exchange's website.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "match",
    id: "co-metals-ex",
    title: "Metals and their main drivers",
    prompt: "Match each metal or idea with its description.",
    pairs: [
      { id: "1", left: "Gold", right: "Store of value watched against real yields" },
      { id: "2", left: "Copper", right: "Tends to follow building and factory activity" },
      { id: "3", left: "Silver", right: "Partly precious, partly industrial" },
      { id: "4", left: "Real yield", right: "Bond yield after expected inflation" },
    ],
    explanation: "Each metal answers to different forces, which is why they do not always move together.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "Why can high real yields weigh on gold?",
      options: [
        { id: "a", text: "Gold mines close", explain: "Not the link." },
        { id: "b", text: "Banks ban gold", explain: "No ban is involved; it is about lost income." },
        { id: "c", text: "Holding gold gives up more real income from safe bonds", explain: "Right." },
        { id: "d", text: "Real yields measure the amount of gold that central banks plan to buy next year", explain: "Not what they measure." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "Gold is $2,000 and silver is $25. What is the gold-silver ratio?",
      options: [
        { id: "a", text: "50", explain: "Check the division." },
        { id: "b", text: "80", explain: "Right. 2,000 ÷ 25." },
        { id: "c", text: "8", explain: "Off by a factor of 10." },
        { id: "d", text: "25", explain: "That is silver's price." },
      ],
      correct: "b",
    },
    {
      id: "q3",
      prompt: "Which metal's price is most closely linked to economic growth?",
      options: [
        { id: "a", text: "Copper", explain: "Right." },
        { id: "b", text: "Gold", explain: "Gold is driven more by fear and real rates." },
        { id: "c", text: "None; metals never respond to growth", explain: "Industrial metals do." },
        { id: "d", text: "Platinum jewellery sold in shops", explain: "Not a market benchmark." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "What did Erb and Harvey (2013) conclude about gold and inflation?",
      options: [
        { id: "a", text: "Gold perfectly tracks inflation each year", explain: "The opposite." },
        { id: "b", text: "Gold cannot fall in value", explain: "It can." },
        { id: "c", text: "Gold is only useful for jewellery", explain: "Not their conclusion." },
        { id: "d", text: "It was not a reliable hedge over short and medium horizons", explain: "Right." },
      ],
      correct: "d",
    },
  ],
  practical: {
    title: "Gold and real yields",
    instructions: "Research only.",
    steps: [
      "Open a one-year chart of gold.",
      "Open a chart of the 10-year inflation-protected US Treasury yield for the same year.",
      "Note one period when they moved in opposite directions and one when they did not.",
    ],
    reflectionPrompt: "Had you thought of gold as an inflation hedge? Does the evidence change how you would use it?",
  },
  glossary: ["gold-silver-ratio", "real-yield", "industrial-metal"],
  next: "co-agriculture",
};

export const CO3_AGRICULTURE: Lesson = {
  id: "co-agriculture",
  trackId: T,
  order: 3,
  format: "full",
  title: "Agricultural commodities",
  summary: "Grain and soft commodity prices depend on harvests, weather and stocks in storage. When stocks are low, small supply shocks cause big price swings.",
  minutes: 20,
  objectives: [
    "Explain how harvests, use and stocks set agricultural prices.",
    "Calculate a stocks-to-use ratio and say what it means.",
    "Describe seasonality and the main scheduled reports.",
    "Explain why low stocks make prices more volatile.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Wheat, corn, soybeans, coffee and sugar feed people and animals. A drought in one region can move prices worldwide." },
        { kind: "p", text: "These markets have their own rhythm: planting, growing and harvest seasons, and government crop reports." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Harvest, use and what is left over",
      blocks: [
        { kind: "p", text: "Each season: stocks at the start + harvest − use = stocks at the end. Those end stocks are the buffer against the next bad harvest." },
        { kind: "p", text: "The [[stocks-to-use-ratio|stocks-to-use ratio]] compares that buffer with a year's use. A low ratio means a tight market." },
        { kind: "defs", items: [
          { term: "[[wasde|WASDE]]", text: "The US Department of Agriculture's monthly supply and demand estimates." },
          { term: "[[seasonality|Seasonality]]", text: "Patterns that tend to repeat each year, such as around harvest." },
          { term: "Softs", text: "Crops like coffee, cocoa, sugar and cotton." },
        ] },
        { kind: "callout", tone: "key", title: "Key idea", text: "With plenty in store, a weather scare is absorbed. With little in store, the same scare can send prices sharply higher." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Tight or comfortable?",
      blocks: [
        { kind: "interactive", widget: "co-stocks-to-use", title: "Stocks-to-use balance", caption: "Set starting stocks, the harvest and a year's use. See what is left and how tight the market is. All quantities are made up." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "One drought, two outcomes",
      blocks: [
        { kind: "p", text: "Two made-up years with the same 10% harvest shortfall. In the first, stocks were large, so the shortfall was met from storage and prices rose modestly." },
        { kind: "p", text: "In the second, stocks were already low after a poor year, so buyers competed for what was left and prices jumped." },
        { kind: "callout", tone: "example", title: "Example", text: "Same weather, different price reaction. The size of the buffer mattered more than the size of the shock." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: storage and price spikes",
      blocks: [
        { kind: "concept-card", card: {
          name: "Stocks-to-use and price volatility",
          what: "The link between how much of a crop is in storage, relative to use, and how sharply its price moves.",
          whyItExists: "Storage smooths supply across years. When storage is nearly empty, it cannot absorb shocks.",
          problemSolved: "It explains why the same harvest problem causes a spike in some years and a shrug in others.",
          mechanics: "Holders release stocks when prices rise, which damps the rise. Near empty storage, that damping disappears.",
          math: "Stocks-to-use = ending stocks ÷ annual use. Ending stocks = start + production − use.",
          howTradersUseIt: "They track estimated stocks-to-use in each WASDE report and compare with expectations.",
          whenUseful: "Around crop reports and during weather scares in key growing regions.",
          whenItFails: "When export bans, policy changes or energy prices (via biofuels) dominate.",
          limitations: "Stock estimates are revised, and hidden private stocks are hard to measure.",
          misconceptions: "That seasonal patterns are reliable trading rules. They are tendencies that often fail.",
          realExample: "In the tool, the same harvest gives a comfortable or a tight market depending on starting stocks.",
          exercise: "Find the latest WASDE report date and the stocks-to-use estimate for one crop.",
          practicalTest: "Compare the estimate with the previous month's and note the price reaction.",
        } },
        { kind: "research", research: {
          title: "The Economics of Grain Price Volatility",
          authors: "Brian D. Wright",
          year: 2011,
          venue: "Applied Economic Perspectives and Policy 33(1)",
          peerReviewed: true,
          question: "What explains spikes in grain prices, such as those of 2007–2008?",
          methodology: "Analysis based on the economics of storage, relating price volatility to available stocks.",
          data: "World grain market data, with focus on the major grains and the 2007–2008 spike.",
          findings: "Price spikes occurred when stocks were low relative to use; with ample stocks, shocks were absorbed. Rising biofuel demand helped deplete stocks before the 2007–2008 spike.",
          limitations: "Measuring global stocks is difficult; policy actions such as export bans complicate the picture.",
          practicalMeaning: "Watch the buffer, not just the shock. Low stocks mean more violent price moves in both directions.",
          status: "replicated",
          url: "https://doi.org/10.1093/aepp/ppq033",
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
          { name: "Crop analysts", view: "Follow weather, planting progress and crop condition reports in key regions." },
          { name: "Commercial hedgers", view: "Farmers and food companies use futures to lock in prices ahead of harvest." },
          { name: "Speculators", view: "Trade surprises in government reports against market expectations." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Trading seasonal patterns as rules.", why: "Weather and policy break them often.", instead: "Treat seasonality as context, not a signal." },
          { mistake: "Ignoring report days.", why: "Prices can jump on a WASDE release.", instead: "Know the report calendar and cut size before it." },
          { mistake: "Forgetting limit moves.", why: "Some agricultural futures have daily price limits, so you may not be able to exit.", instead: "Check the contract's limit rules." },
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
            "Supply is set by harvests, demand by food, feed and fuel use.",
            "Storage buffers shocks; low stocks mean big price swings.",
            "Government reports such as WASDE are key scheduled events.",
            "Seasonality is a tendency, not a rule.",
          ],
          equations: [
            { label: "Ending stocks", formula: "= start + production − use" },
            { label: "Stocks-to-use", formula: "= ending stocks ÷ annual use" },
          ],
          implications: ["Watch the buffer.", "Know the report calendar.", "Check daily limits."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Find the next WASDE release date.",
          "Note the latest estimated stocks-to-use ratio for corn or wheat.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "order",
    id: "co-agriculture-ex",
    title: "A crop year",
    prompt: "Put the stages of a typical grain season in order.",
    items: [
      { id: "1", text: "Farmers decide how much to plant" },
      { id: "2", text: "Weather during growing shapes expected yields" },
      { id: "3", text: "The harvest arrives and supply becomes clearer" },
      { id: "4", text: "Use through the year draws stocks down" },
      { id: "5", text: "Ending stocks are carried into the next season" },
    ],
    explanation: "Uncertainty is highest before and during growing; ending stocks become the next season's buffer.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "Ending stocks are 150 and annual use is 1,000. What is the stocks-to-use ratio?",
      options: [
        { id: "a", text: "1.5%", explain: "Off by a factor of 10." },
        { id: "b", text: "150%", explain: "Check the division." },
        { id: "c", text: "85%", explain: "That is not the ratio." },
        { id: "d", text: "15%", explain: "Right. 150 ÷ 1,000." },
      ],
      correct: "d",
    },
    {
      id: "q2",
      prompt: "Why do low stocks make prices more volatile?",
      options: [
        { id: "a", text: "There is little buffer to absorb supply shocks", explain: "Right." },
        { id: "b", text: "Exchanges raise fees", explain: "Not the reason." },
        { id: "c", text: "Farmers stop reporting data", explain: "Reporting continues; the buffer is the issue." },
        { id: "d", text: "Low stocks mean demand has disappeared, so prices can only move up", explain: "They can move both ways." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      prompt: "What is the WASDE report?",
      options: [
        { id: "a", text: "A weather forecast", explain: "Not a forecast service." },
        { id: "b", text: "The USDA's monthly supply and demand estimates", explain: "Right." },
        { id: "c", text: "A list of farm prices in shops", explain: "Not it." },
        { id: "d", text: "A private newsletter sold to commodity traders by subscription", explain: "It is a public government report." },
      ],
      correct: "b",
    },
    {
      id: "q4",
      prompt: "How should a trader treat a seasonal pattern?",
      options: [
        { id: "a", text: "As a guaranteed rule", explain: "Weather and policy break it." },
        { id: "b", text: "As useless noise", explain: "It is useful context." },
        { id: "c", text: "As context that can fail", explain: "Right." },
        { id: "d", text: "As a reason to double size", explain: "A tendency never justifies extra risk." },
      ],
      correct: "c",
    },
  ],
  practical: {
    title: "A crop report",
    instructions: "Research only. Do not trade.",
    steps: [
      "Find the date of the next WASDE report.",
      "Before it, note what analysts expect for one crop's ending stocks.",
      "Afterwards, compare the actual estimate and the price reaction.",
    ],
    reflectionPrompt: "How big was the surprise, and did the price move match it?",
  },
  glossary: ["stocks-to-use-ratio", "wasde", "seasonality"],
  next: "co-futures-roll",
};

export const CO4_FUTURES_ROLL: Lesson = {
  id: "co-futures-roll",
  trackId: T,
  order: 4,
  format: "full",
  title: "Futures, expiry and rolling",
  summary: "Most commodity trading is in futures, which expire. Holding exposure means rolling to the next contract, and the shape of the futures curve can quietly add or subtract return.",
  minutes: 24,
  objectives: [
    "Explain front-month contracts, expiry and first notice day.",
    "Distinguish contango and backwardation.",
    "Calculate how rolling in contango erodes returns.",
    "Explain why a commodity fund can lag the spot price.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "Many beginners buy a commodity fund expecting it to track the spot price, then find it fell while the commodity went sideways." },
        { kind: "p", text: "The reason is rolling. And because [[futures]] use leverage, knowing their mechanics is a safety matter, not a detail." },
        { kind: "callout", tone: "info", title: "Linked lesson", text: "Stocks and Indices introduced futures on indices. Here the focus is commodity futures and their curves.", link: { lessonId: "si-funds", label: "Funds and futures" } },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "Contracts that expire",
      blocks: [
        { kind: "p", text: "A futures contract is for delivery in a set month. The [[front-month|front month]] is the nearest; it is usually the most traded." },
        { kind: "p", text: "Before [[first-notice-day|first notice day]], speculators close or roll their positions, so they are not asked to take delivery of oil, grain or metal." },
        { kind: "defs", items: [
          { term: "[[contango|Contango]]", text: "Later contracts cost more than nearer ones." },
          { term: "[[backwardation|Backwardation]]", text: "Later contracts cost less than nearer ones." },
          { term: "[[roll-yield|Roll yield]]", text: "The gain or loss from swapping an expiring contract for a later one." },
        ] },
        { kind: "callout", tone: "key", title: "Key idea", text: "In steady contango, each roll buys the next contract higher than the old one is sold, so a long position loses a little each month even if spot is flat." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Roll month after month",
      blocks: [
        { kind: "interactive", widget: "co-roll-yield", title: "What rolling does to a long position", caption: "Choose the curve's shape and the spot trend. The chart compares the spot price with a futures position rolled every month. The curve is made up and held constant." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "When storage runs out",
      blocks: [
        { kind: "p", text: "In April 2020, with fuel demand collapsing and storage near full, the expiring WTI contract briefly settled below zero: holders had to pay to avoid taking delivery." },
        { kind: "callout", tone: "warn", title: "Watch out", text: "Near expiry, trading thins and delivery obligations matter. Beginners should roll or close well before first notice day, and never assume a price cannot go below zero." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: why curves slope",
      blocks: [
        { kind: "concept-card", card: {
          name: "The futures curve and roll yield",
          what: "The set of futures prices for each delivery month, and the return from moving along it.",
          whyItExists: "Holding a physical commodity costs storage and financing; tight supplies make immediate delivery more valuable. Both shape the curve.",
          problemSolved: "It explains the gap between spot returns and the returns of rolled futures positions.",
          mechanics: "Contango is common when stocks are ample (later delivery costs storage and interest). Backwardation is common when supplies are tight.",
          math: "Each roll's return ≈ expiring price ÷ new price − 1. With the next contract 2% above spot every month and spot flat: (1/1.02)^12 − 1 ≈ −21% a year.",
          howTradersUseIt: "They check the curve before holding long positions, and choose contracts or funds that roll less often or further out.",
          whenUseful: "Any time you hold commodity exposure for more than a month.",
          whenItFails: "Curves change shape; a contango can flip to backwardation and back.",
          limitations: "Real returns also include interest on the cash collateral and trading costs.",
          misconceptions: "That a commodity fund is the same as owning the commodity. Rolling makes it different.",
          realExample: "In the tool, 1.5% monthly contango with flat spot loses about 16% over a year.",
          exercise: "Look up the next three monthly futures prices for crude oil and say whether the curve is in contango or backwardation.",
          practicalTest: "Compare a one-year chart of a crude oil fund with the spot price and see how far apart they ended.",
        } },
        { kind: "research", research: {
          title: "Facts and Fantasies about Commodity Futures",
          authors: "Gary Gorton and K. Geert Rouwenhorst",
          year: 2006,
          venue: "Financial Analysts Journal 62(2)",
          peerReviewed: true,
          question: "What returns did a broad, collateralised portfolio of commodity futures earn, and how did it relate to stocks, bonds and inflation?",
          methodology: "Construction of an equally weighted index of fully collateralised commodity futures and comparison with stocks and bonds.",
          data: "Monthly data on futures across many commodities, 1959–2004.",
          findings: "The index earned a risk premium similar to stocks with similar volatility, was negatively correlated with stocks and bonds, and positively correlated with inflation. Returns differed greatly from spot price changes.",
          limitations: "Later work found weaker results after 2004 as more money tracked commodity indices; one historical period.",
          practicalMeaning: "What you earn from commodity futures is not the spot price change; rolling and collateral returns matter.",
          status: "regime-sensitive",
          url: "https://doi.org/10.2469/faj.v62.n2.4083",
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
          { name: "Index managers", view: "Choose when and how far to roll to reduce the cost of contango." },
          { name: "Curve traders", view: "Trade the spread between months instead of the outright price." },
          { name: "Risk managers", view: "Track expiry, first notice and margin dates for every position." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Expecting a commodity fund to match spot.", why: "Rolling costs or adds return.", instead: "Check the curve and the fund's roll method." },
          { mistake: "Holding through first notice day.", why: "You may be assigned delivery or face thin, wild trading.", instead: "Roll or close early." },
          { mistake: "Ignoring leverage.", why: "Futures need only a small margin deposit, so losses can exceed it.", instead: "Size from the full contract value, not the margin." },
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
            "Futures expire; holding exposure means rolling.",
            "Contango costs a long roller; backwardation pays.",
            "Commodity funds can lag or beat spot because of rolling.",
            "Futures are leveraged and have delivery dates.",
          ],
          equations: [
            { label: "Roll return", formula: "≈ expiring price ÷ new contract price − 1" },
            { label: "Steady contango c per month", formula: "≈ (1 ÷ (1 + c))^12 − 1 a year, with flat spot" },
          ],
          implications: ["Check the curve.", "Know the dates.", "Size from contract value."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Look up the first notice day of the current front-month crude oil contract.",
          "Compare a commodity fund's one-year return with the spot change over the same year.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "classify",
    id: "co-futures-roll-ex",
    title: "Contango or backwardation?",
    prompt: "Sort each curve description.",
    categories: [
      { id: "contango", label: "Contango" },
      { id: "backwardation", label: "Backwardation" },
    ],
    items: [
      { id: "1", text: "June 70, July 71, August 72", category: "contango", explain: "Later months cost more." },
      { id: "2", text: "June 70, July 69, August 68", category: "backwardation", explain: "Later months cost less." },
      { id: "3", text: "Storage tanks are full and supplies are plentiful", category: "contango", explain: "Ample stocks tend to give contango." },
      { id: "4", text: "Supplies are tight and buyers want delivery now", category: "backwardation", explain: "Tight markets tend to give backwardation." },
      { id: "5", text: "Rolling a long position earns a little each month", category: "backwardation", explain: "You sell the dearer expiring contract and buy a cheaper one." },
    ],
  },
  quiz: [
    {
      id: "q1",
      prompt: "In contango, what happens to a long position each time it is rolled?",
      options: [
        { id: "a", text: "It gains a little", explain: "That is backwardation." },
        { id: "b", text: "Nothing changes", explain: "The price gap matters." },
        { id: "c", text: "It loses a little, buying the next contract dearer", explain: "Right." },
        { id: "d", text: "It is automatically converted into a physical delivery of the commodity to your home", explain: "Rolling replaces it with a later contract instead." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "Why should a speculator roll or close before first notice day?",
      options: [
        { id: "a", text: "To avoid being asked to take delivery", explain: "Right." },
        { id: "b", text: "Prices are always higher after it", explain: "No such rule." },
        { id: "c", text: "Exchanges close that day", explain: "They do not." },
        { id: "d", text: "Margin is refunded only before it", explain: "Not the reason." },
      ],
      correct: "a",
    },
    {
      id: "q3",
      prompt: "Spot oil is flat for a year, but a fund holding rolled oil futures fell 15%. What is the most likely cause?",
      options: [
        { id: "a", text: "Fund fraud", explain: "Possible, but not the usual reason." },
        { id: "b", text: "The dollar", explain: "Spot is in dollars too." },
        { id: "c", text: "A data error in the price feed that the fund's managers had not noticed", explain: "Unlikely." },
        { id: "d", text: "Rolling in contango", explain: "Right." },
      ],
      correct: "d",
    },
    {
      id: "q4",
      prompt: "Why is a futures position riskier than its margin deposit suggests?",
      options: [
        { id: "a", text: "Margin is a fee you never get back", explain: "It is a deposit." },
        { id: "b", text: "Losses depend on the full contract value and can exceed the margin", explain: "Right." },
        { id: "c", text: "Futures cannot move more than 1% a day", explain: "Many can." },
        { id: "d", text: "Margin is doubled every month", explain: "Margin is set by the exchange and broker, not doubled monthly." },
      ],
      correct: "b",
    },
  ],
  practical: {
    title: "Read a futures curve",
    instructions: "Research only. Do not trade futures as part of this task.",
    steps: [
      "Find the prices of the next four monthly crude oil contracts.",
      "Say whether the curve is in contango or backwardation.",
      "Estimate the monthly roll cost or gain between the first two contracts.",
    ],
    reflectionPrompt: "Would this curve help or hurt someone holding a long oil fund for a year?",
  },
  glossary: ["contango", "backwardation", "roll-yield", "front-month", "first-notice-day"],
  next: "co-dollar",
};

export const CO5_DOLLAR: Lesson = {
  id: "co-dollar",
  trackId: T,
  order: 5,
  format: "full",
  title: "Commodities and the US dollar",
  summary: "Most commodities are priced in dollars, so the dollar's strength changes what everyone else pays. Commodity prices and the dollar have often moved in opposite directions, though not always.",
  minutes: 18,
  objectives: [
    "Explain why a stronger dollar can weigh on commodity prices.",
    "Convert a dollar commodity price into another currency.",
    "Describe commodity currencies and their link to exports.",
    "Judge when the dollar link is likely to be weak.",
  ],
  sections: [
    {
      id: "why",
      part: "why",
      heading: "Why this matters",
      blocks: [
        { kind: "p", text: "A trader in Europe or India buying oil or gold also takes on a currency position, because the price is in dollars." },
        { kind: "p", text: "And the dollar itself is one of the forces moving commodity prices." },
      ],
    },
    {
      id: "beginner",
      part: "beginner",
      heading: "One price, many currencies",
      blocks: [
        { kind: "p", text: "If oil is $80 and one dollar buys 0.90 euros, a barrel costs €72. If the dollar strengthens to 1.00 euro, the same $80 barrel costs €80." },
        { kind: "p", text: "Dearer oil for non-US buyers can reduce their demand, which can pull the dollar price down. That is one reason the two have often moved in opposite directions." },
        { kind: "defs", items: [
          { term: "[[dollar-index|US dollar index]]", text: "The dollar against a basket of major currencies." },
          { term: "[[commodity-currency|Commodity currency]]", text: "A currency, such as the Australian or Canadian dollar, that tends to move with the country's commodity exports." },
        ] },
        { kind: "callout", tone: "key", title: "Key idea", text: "The dollar link is a tendency driven by demand and interest rates, not a fixed rule. Both can rise together in a crisis." },
      ],
    },
    {
      id: "visual",
      part: "visual",
      heading: "Same barrel, different price",
      blocks: [
        { kind: "interactive", widget: "co-dollar", title: "Oil priced in other currencies", caption: "Set the dollar oil price and the exchange rate. See what a buyer paying in euros, yen or rupees pays for the same barrel. All prices and rates are made up." },
      ],
    },
    {
      id: "example",
      part: "example",
      heading: "When the link breaks",
      blocks: [
        { kind: "p", text: "In a sharp global sell-off, investors often rush into the dollar as a [[safe-haven|safe haven]] while commodities fall on fears of weaker demand: the usual opposite moves." },
        { kind: "p", text: "But in a supply shock, such as a war cutting exports, oil and the dollar can both rise. The cause of the move decides the relationship." },
        { kind: "callout", tone: "example", title: "Example", text: "A made-up month: the dollar index rises 3% and copper falls 6% on growth fears. Another: the dollar rises 2% and oil rises 15% after an export halt." },
      ],
    },
    {
      id: "deep-dive",
      part: "deep-dive",
      heading: "Technical deep dive: rates, the dollar and commodities",
      blocks: [
        { kind: "concept-card", card: {
          name: "The dollar channel",
          what: "The ways the dollar's value affects commodity prices: through what foreign buyers pay, through interest rates and through investor flows.",
          whyItExists: "Commodities are priced and financed mostly in dollars.",
          problemSolved: "It explains part of the co-movement between the dollar and commodity prices.",
          mechanics: "A stronger dollar raises local-currency prices abroad, which can reduce demand. Higher US real rates tend to strengthen the dollar and raise the cost of holding inventories.",
          math: "Local price = dollar price × local units per dollar.",
          howTradersUseIt: "They check the dollar index alongside commodity moves, and watch commodity currencies for confirmation.",
          whenUseful: "When the dollar is moving strongly and commodity supply is stable.",
          whenItFails: "When supply shocks or crisis flows dominate, both can move together.",
          limitations: "The relationship has changed sign over different periods.",
          misconceptions: "That a weaker dollar guarantees higher commodity prices.",
          realExample: "In the tool, oil at $80 costs about €72 at 0.90 euros per dollar and €80 at 1.00.",
          exercise: "Compare a one-year chart of the dollar index with one of gold or copper.",
          practicalTest: "Note one period when they moved together and one when they moved apart, and look for the reason.",
        } },
        { kind: "research", research: {
          title: "Commodity prices, interest rates and the dollar",
          authors: "Q. Farooq Akram",
          year: 2009,
          venue: "Energy Economics 31(6)",
          peerReviewed: true,
          question: "How do changes in US interest rates and the dollar affect commodity prices?",
          methodology: "Structural vector autoregression models of commodity prices, real interest rates and the dollar's exchange rate.",
          data: "Quarterly data on prices of oil, food, metals and industrial raw materials with US rates and the dollar, 1990–2007.",
          findings: "Commodity prices rose after falls in real interest rates and in the dollar's value. Some commodity prices, including oil, overshot their long-run response.",
          limitations: "One period and model; the strength of these links varies over time.",
          practicalMeaning: "A weaker dollar and lower real rates have tended to support commodity prices, but not in every period.",
          status: "regime-sensitive",
          url: "https://doi.org/10.1016/j.eneco.2009.05.016",
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
          { name: "Macro traders", view: "Watch the dollar, US real rates and commodities together." },
          { name: "Currency traders", view: "Trade commodity currencies such as the Australian and Canadian dollars against commodity moves." },
          { name: "Non-US buyers", view: "Hedge both the commodity price and the currency." },
        ] },
      ],
    },
    {
      id: "mistakes",
      part: "mistakes",
      heading: "Common mistakes",
      blocks: [
        { kind: "mistakes", items: [
          { mistake: "Forgetting your own currency.", why: "A non-US trader's result depends on the exchange rate too.", instead: "Work out returns in your account currency." },
          { mistake: "Treating the dollar link as a rule.", why: "It breaks in supply shocks and crises.", instead: "Ask what is driving both." },
          { mistake: "Doubling up without noticing.", why: "Long gold and short the dollar can be much the same bet.", instead: "Check how your positions are linked." },
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
            "Most commodities are priced in dollars.",
            "A stronger dollar raises prices for non-US buyers and can damp demand.",
            "Commodity currencies tend to move with export prices.",
            "The dollar-commodity link is a tendency, not a rule.",
          ],
          equations: [{ label: "Local price", formula: "= dollar price × local units per dollar" }],
          implications: ["Think in your account currency.", "Check the dollar when commodities move.", "Watch for doubled-up bets."],
        },
      ],
    },
    {
      id: "homework",
      part: "homework",
      heading: "Practical homework",
      blocks: [
        { kind: "homework", tasks: [
          "Convert today's oil and gold prices into your own currency.",
          "Compare the one-year moves of the Australian dollar and copper.",
        ] },
      ],
    },
  ],
  exercise: {
    kind: "calculate",
    id: "co-dollar-ex",
    title: "Price in another currency",
    prompt: "Made-up numbers: oil costs $80 a barrel and one US dollar buys 0.90 euros. What does a barrel cost in euros?",
    unit: "EUR",
    answer: 72,
    tolerance: 0.1,
    hint: "Multiply the dollar price by euros per dollar.",
    solution: "80 × 0.90 = 72 euros.",
  },
  quiz: [
    {
      id: "q1",
      prompt: "The dollar strengthens against the euro. What happens to the euro price of a $80 barrel?",
      options: [
        { id: "a", text: "It falls", explain: "A stronger dollar costs more euros." },
        { id: "b", text: "It stays the same", explain: "It changes with the rate." },
        { id: "c", text: "It rises", explain: "Right." },
        { id: "d", text: "Oil can no longer be bought in euros once the dollar strengthens past parity", explain: "No such rule." },
      ],
      correct: "c",
    },
    {
      id: "q2",
      prompt: "What is a commodity currency?",
      options: [
        { id: "a", text: "A coin made of gold", explain: "Not the meaning." },
        { id: "b", text: "A currency that tends to move with the country's commodity exports", explain: "Right." },
        { id: "c", text: "The currency used to price oil", explain: "That is the dollar." },
        { id: "d", text: "A stablecoin", explain: "Unrelated." },
      ],
      correct: "b",
    },
    {
      id: "q3",
      prompt: "When can oil and the dollar both rise together?",
      options: [
        { id: "a", text: "In a supply shock, such as an export halt", explain: "Right." },
        { id: "b", text: "Never", explain: "It happens." },
        { id: "c", text: "Only on Mondays", explain: "The day of the week is irrelevant." },
        { id: "d", text: "Only when the euro becomes the main currency used for pricing oil worldwide", explain: "Not required." },
      ],
      correct: "a",
    },
    {
      id: "q4",
      prompt: "A European trader buys gold in dollars. Gold rises 5% but the dollar falls 5% against the euro. Roughly what is the result in euros?",
      options: [
        { id: "a", text: "+10%", explain: "The currency move works against them." },
        { id: "b", text: "−5%", explain: "Gold's rise offsets it." },
        { id: "c", text: "+5%", explain: "That ignores the currency." },
        { id: "d", text: "About 0%", explain: "Right. The two moves roughly cancel." },
      ],
      correct: "d",
    },
  ],
  practical: {
    title: "Your own currency",
    instructions: "Research only.",
    steps: [
      "Find today's dollar prices of oil and gold.",
      "Convert both into your account currency.",
      "Note how much of a one-month move in each came from the exchange rate.",
    ],
    reflectionPrompt: "Had you been ignoring the currency side of commodity trades?",
  },
  glossary: ["dollar-index", "commodity-currency"],
  next: "cr-what-is-a-chart",
};
