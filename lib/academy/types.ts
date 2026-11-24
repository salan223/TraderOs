/**
 * Academy content model.
 *
 * Content is plain data (no functions, no JSX) so it can be passed from server
 * to client components, checked by tests, and later moved into the database
 * tables defined in supabase/migrations/0002_academy.sql.
 *
 * Inline glossary references inside any text use the form [[term-id]] or
 * [[term-id|shown text]]. They render as <Term> tooltips (see RichText).
 */

export type GlossaryEntry = {
  id: string;
  term: string;
  /** Plain-English definition for a complete beginner. */
  def: string;
};

/** Ids of the inline SVG diagrams in components/academy/visuals.tsx. */
export type VisualId =
  | "market-meeting"
  | "supply-demand"
  | "participants-map"
  | "share-ownership"
  | "currency-pair"
  | "index-basket"
  | "commodity-groups"
  | "blockchain-chain"
  | "time-horizons"
  | "bid-ask-spread";

/** Ids of the live, manipulable illustrations in components/academy/widgets. */
export type WidgetId =
  | "fx-rate-converter"
  | "fx-spread"
  | "fx-pip-calculator"
  | "fx-position-size"
  | "fx-margin-sim"
  | "fx-pair-explorer"
  | "fx-session-clock"
  | "fx-drivers"
  | "fx-cost-calculator"
  | "si-order-book"
  | "si-earnings"
  | "si-cap-bubbles"
  | "si-index-builder"
  | "si-etf-basket"
  | "si-futures"
  | "si-corporate-actions"
  | "cr-trade-tape"
  | "cr-chart-types"
  | "cr-candle-builder"
  | "cr-pattern-lab"
  | "cr-timeframes"
  | "cr-structure"
  | "cr-trend-tools"
  | "cr-volume"
  | "cr-scale"
  | "cr-levels"
  | "cr-gaps"
  | "cr-exam"
  | "rm-risk-budget"
  | "rm-position-size"
  | "rm-stop-placement"
  | "rm-expectancy"
  | "rm-drawdown"
  | "rm-leverage"
  | "rm-heat"
  | "rm-gap-limits"
  | "rm-averaging-down"
  | "rm-monte-carlo"
  // Static diagrams for Track 8 (components/academy/widgets/risk-illustrations.tsx)
  | "rm-fig-r-ladder"
  | "rm-fig-stop-size"
  | "rm-fig-stop-methods"
  | "rm-fig-breakeven"
  | "rm-fig-recovery"
  | "rm-fig-margin-ladder"
  | "rm-fig-heat-stack"
  | "rm-fig-gap"
  | "rm-fig-averaging"
  | "rm-fig-sizing-paths"
  // Track 7, Technical Analysis (components/academy/widgets/ta-lab.tsx, ta-tools.tsx)
  | "ta-lab"
  | "ta-lab-rsi"
  | "ta-lab-macd"
  | "ta-lab-stoch"
  | "ta-lab-bands"
  | "ta-lab-volume"
  | "ta-divergence"
  | "ta-trendlines"
  | "ta-patterns"
  | "ta-fibonacci"
  | "ta-confluence"
  | "ta-overfitting"
  // Track 7 static diagrams (components/academy/widgets/ta-illustrations.tsx)
  | "ta-fig-ma-lag"
  | "ta-fig-rsi"
  | "ta-fig-macd"
  | "ta-fig-stoch"
  | "ta-fig-bands"
  | "ta-fig-true-range"
  | "ta-fig-vwap-obv"
  | "ta-fig-divergence"
  | "ta-fig-trendline"
  | "ta-fig-head-shoulders"
  | "ta-fig-triangles"
  | "ta-fig-fibonacci"
  | "ta-fig-timeframes"
  | "ta-fig-redundancy"
  | "ta-fig-rule"
  | "ta-fig-overfit"
  // Track 13, Market Structure
  | "ms-book"
  | "ms-book-types"
  | "ms-book-slippage"
  | "ms-book-thin"
  | "ms-venues"
  | "ms-spread"
  | "ms-impact-curve"
  | "ms-auction"
  | "ms-nbbo"
  | "ms-dark-pool"
  | "ms-latency"
  | "ms-retail"
  | "ms-halts"
  | "ms-fig-venues"
  | "ms-fig-spread"
  | "ms-fig-ladder"
  | "ms-fig-queue"
  | "ms-fig-stop-gap"
  | "ms-fig-walk"
  | "ms-fig-auction"
  | "ms-fig-nbbo"
  | "ms-fig-dark"
  | "ms-fig-latency"
  | "ms-fig-retail-route"
  | "ms-fig-luld"
  // Track 9, Trading Psychology
  | "psy-prospect"
  | "psy-disposition"
  | "psy-overtrading"
  | "psy-bias-trainer"
  | "psy-streaks"
  | "psy-edge-sim"
  | "psy-outcome-sorter"
  | "psy-revenge"
  | "psy-tilt-check"
  | "psy-checklist"
  | "psy-expectations"
  | "psy-plan"
  | "psy-fig-value"
  | "psy-fig-disposition"
  | "psy-fig-overconfidence"
  | "psy-fig-biases"
  | "psy-fig-gamblers"
  | "psy-fig-streaks"
  | "psy-fig-outcome"
  | "psy-fig-revenge"
  | "psy-fig-tilt"
  | "psy-fig-checklist"
  | "psy-fig-expectations"
  | "psy-fig-plan"
  | "strat-rule-builder"
  | "strat-edge-sorter"
  | "strat-playground"
  | "strat-exit-entry"
  | "strat-regime-filter"
  | "strat-overfit"
  | "strat-spec"
  | "strat-sample-size"
  | "strat-kill"
  | "strat-diversify"
  | "strat-decay"
  | "strat-fig-anatomy"
  | "strat-fig-edges"
  | "strat-fig-rules"
  | "strat-fig-archetypes"
  | "strat-fig-exits"
  | "strat-fig-regimes"
  | "strat-fig-overfit"
  | "strat-fig-spec"
  | "strat-fig-pipeline"
  | "strat-fig-kill"
  | "strat-fig-diversify"
  | "strat-fig-lifecycle"
  | "bt-lab"
  | "bt-adjust"
  | "bt-lookahead"
  | "bt-survivorship"
  | "bt-costs"
  | "bt-metrics"
  | "bt-sweep"
  | "bt-walk-forward"
  | "bt-monte-carlo"
  | "bt-snooping"
  | "bt-regimes"
  | "bt-forward"
  | "bt-checklist"
  | "bt-fig-what"
  | "bt-fig-data"
  | "bt-fig-bias"
  | "bt-fig-costs"
  | "bt-fig-metrics"
  | "bt-fig-split"
  | "bt-fig-walkforward"
  | "bt-fig-plateau"
  | "bt-fig-montecarlo"
  | "bt-fig-snooping"
  | "bt-fig-regimes"
  | "bt-fig-forward"
  | "bt-fig-checklist"
  // Track 12, Macro and News (components/academy/widgets/macro-tools.tsx, macro-illustrations.tsx)
  | "macro-surprise"
  | "macro-carry"
  | "macro-yield-curve"
  | "macro-news-spike"
  | "macro-tone"
  | "macro-sources"
  | "macro-inflation"
  | "macro-pmi"
  | "macro-correlation"
  | "macro-earnings-gap"
  | "macro-fig-central-bank"
  | "macro-fig-inflation"
  | "macro-fig-labour"
  | "macro-fig-growth"
  | "macro-fig-yield-curve"
  | "macro-fig-differential"
  | "macro-fig-risk-on-off"
  | "macro-fig-calendar"
  | "macro-fig-news-spike"
  | "macro-fig-earnings"
  | "macro-fig-shocks"
  | "macro-fig-statement"
  | "macro-fig-sources";

/** Ids of the static, labelled teaching illustrations in components/academy/illustrations.tsx. */
export type IllustrationId =
  | "candle-anatomy"
  | "candle-types"
  | "ohlc-to-candle"
  | "pattern-hammer"
  | "pattern-hanging-man"
  | "pattern-inverted-hammer"
  | "pattern-shooting-star"
  | "pattern-doji"
  | "pattern-marubozu"
  | "pattern-pin-bar"
  | "pattern-engulfing"
  | "pattern-harami"
  | "pattern-inside-bar"
  | "pattern-outside-bar"
  | "pattern-morning-star"
  | "pattern-three-soldiers"
  | "timeframe-aggregation"
  | "swing-structure"
  | "trend-vs-range"
  | "support-resistance"
  | "linear-vs-log"
  | "gaps"
  | "gap-stop";

/**
 * Lesson text markup (any string field): [[term-id]] or [[term-id|text]] for
 * a glossary tooltip, and **text** to highlight a key term or number.
 */
export type Block =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | {
      kind: "callout";
      /** key = "Key idea", warn = "Watch out", example = "Example", info = a neutral note. */
      tone: "info" | "warn" | "key" | "example";
      /** Short title, e.g. "Key idea", "Watch out", "Example". */
      title: string;
      text: string;
      /** Optional link to another lesson, for cross-references instead of repeating content. */
      link?: { lessonId: string; label: string };
    }
  | { kind: "visual"; visual: VisualId; caption: string }
  /** A static, labelled illustration (not data). Always shown with an "Illustration" label and caption. */
  | { kind: "illustration"; illustration: IllustrationId; caption: string }
  /** Definition rows: a short term and its explanation, one per row. */
  | { kind: "defs"; items: { term: string; text: string }[] }
  /** Numbered steps, each with an optional short title. */
  | { kind: "step-list"; items: { title?: string; text: string }[] }
  /** A grid of small cards, each with an optional illustration and labelled rows (e.g. candle patterns). */
  | { kind: "cards"; items: { title: string; illustration?: IllustrationId; rows: { label: string; text: string }[] }[] }
  /** A collapsible "Go deeper" part, closed by default, for long or optional detail. */
  | { kind: "deeper"; title: string; blocks: Block[] }
  /** A live illustration the learner can manipulate. All numbers in it are illustrative. */
  | { kind: "interactive"; widget: WidgetId; title: string; caption: string }
  /** A generic interaction (see Interaction): a check, flashcards, a reveal, a guided sequence. */
  | { kind: "interaction"; id: string; title: string; interaction: Interaction }
  /** A summary of a piece of research. Must say whether it has been verified. */
  | { kind: "research"; research: ResearchItem }
  /** A structured explanation of one advanced concept. */
  | { kind: "concept-card"; card: ConceptCard }
  /** "What professionals look for": several methodologies, not one universal answer. */
  | { kind: "methodologies"; items: { name: string; view: string }[] }
  /** "Common mistakes": the mistake, why it happens or why it hurts, and what to do instead. */
  | { kind: "mistakes"; items: { mistake: string; why: string; instead: string }[] }
  /** "Summary": key concepts, equations and practical implications. */
  | { kind: "summary"; keyConcepts: string[]; equations?: { label: string; formula: string }[]; implications: string[] }
  /** "Practical homework": tasks to do away from the lesson. */
  | { kind: "homework"; tasks: string[] };

/**
 * The parts of the full lesson format used by new lessons (tracks 4–14).
 * A section may declare which part it is; older lessons leave it out and
 * render exactly as before. A lesson with `format: "full"` must cover every
 * part (A–L, see LESSON_PARTS), which the content tests check.
 */
export type LessonPartId =
  | "objective"      // A Learning objective (Lesson.objectives)
  | "why"            // B Why it matters
  | "beginner"       // C Beginner explanation
  | "visual"         // D Visual explanation (interactive)
  | "example"        // E Real-world example
  | "deep-dive"      // F Technical deep dive
  | "professionals"  // G What professionals look for
  | "mistakes"       // H Common mistakes
  | "exercise"       // I Interactive exercise (Lesson.exercise)
  | "checkpoint"     // J Knowledge checkpoint (Lesson.quiz)
  | "summary"        // K Summary
  | "homework";      // L Practical homework (Lesson.practical)

export type Section = { id: string; heading: string; blocks: Block[]; /** Which lesson-format part this section is. */ part?: LessonPartId };

// ── Research and concept cards ───────────────────────────────────────────────

export type ResearchStatus = "replicated" | "disputed" | "outdated" | "regime-sensitive";

export type ResearchItem = {
  title: string;
  authors: string;
  year: number;
  venue: string;
  /** true: peer-reviewed journal or conference. false: working paper, preprint or report. */
  peerReviewed: boolean;
  question: string;
  methodology: string;
  data: string;
  findings: string;
  limitations: string;
  practicalMeaning: string;
  status: ResearchStatus;
  url?: string;
  /**
   * true only once a person has checked the citation and the summary against the
   * source. Anything else renders with a clear "Unverified" label.
   */
  verified: boolean;
};

/** The 13 fields of an advanced-concept card. */
export type ConceptCard = {
  name: string;
  what: string;
  whyItExists: string;
  problemSolved: string;
  mechanics: string;
  math: string;
  howTradersUseIt: string;
  whenUseful: string;
  whenItFails: string;
  limitations: string;
  misconceptions: string;
  realExample: string;
  exercise: string;
  practicalTest: string;
};

// ── Generic interactions ─────────────────────────────────────────────────────
// Used inside lessons (Block "interaction"), in track assessments and in
// remediation. Graded kinds have a pure grader in lib/academy/interactions.ts.

export type ChoiceOption = { id: string; text: string; /** Why this option is right or wrong. */ explain: string };

export type SingleChoiceItem = { kind: "single"; prompt: string; options: ChoiceOption[]; correct: string };
export type TrueFalseItem = { kind: "true-false"; statement: string; answer: boolean; /** Why the statement is true or false. */ explain: string };
export type NumericItem = {
  kind: "numeric";
  prompt: string;
  unit: string;
  answer: number;
  /** Accepted absolute difference from the answer. */
  tolerance: number;
  /** Worked solution, shown after answering. */
  explain: string;
};
export type MultiSelectItem = { kind: "multi-select"; prompt: string; options: ChoiceOption[]; /** Every option that must be selected (and no others). */ correct: string[] };
/**
 * A decision in a scenario. It is scored on the PROCESS (was the reasoning
 * sound given what was known?), never on what happened next: a sound
 * decision can lose money and a reckless one can win.
 */
export type ScenarioItem = {
  kind: "scenario";
  situation: string;
  question: string;
  options: (ChoiceOption & { process: "sound" | "partial" | "unsound" })[];
  /** Optional: what happened afterwards, shown only to make the point that the outcome does not grade the decision. */
  outcome?: string;
};
/** "Find the error": select every line that contains a mistake. */
export type FindErrorItem = {
  kind: "find-error";
  prompt: string;
  lines: { id: string; text: string; /** Present only on lines with a mistake: what is wrong. */ error?: string }[];
  explain: string;
};
/** Click (or use the keyboard) to mark a level or a point on an illustrative chart. */
export type ChartAnnotateItem = {
  kind: "chart-annotate";
  prompt: string;
  /** Illustrative, made-up closing prices, oldest first. Never real market data. */
  series: number[];
  /** Decimal places for showing prices. */
  decimals: number;
  /** "level": `value` is a price. "point": `value` is a bar index (0 = oldest). Tolerance is in the same unit. */
  target: { mode: "level" | "point"; value: number; tolerance: number };
  explain: string;
};

export type GradedItem = SingleChoiceItem | TrueFalseItem | NumericItem | MultiSelectItem | ScenarioItem | FindErrorItem | ChartAnnotateItem;
export type GradedKind = GradedItem["kind"];

export type FlashcardsItem = { kind: "flashcards"; cards: { front: string; back: string }[] };
export type RevealItem = { kind: "reveal"; prompt: string; /** Button text, e.g. "Show the worked answer". */ label: string; content: string };
export type StepsItem = {
  kind: "steps";
  steps: { title: string; text: string; /** Optional check that must be answered correctly before the next step. */ check?: SingleChoiceItem | TrueFalseItem | NumericItem }[];
};

export type Interaction = GradedItem | FlashcardsItem | RevealItem | StepsItem;
export type InteractionKind = Interaction["kind"];

/** What a learner can answer, per graded kind. */
export type AnswerValue = string | boolean | number | string[];

// ── Track assessments ────────────────────────────────────────────────────────

export type ConceptRemediation = {
  /** Why people typically get this wrong. */
  misconception: string;
  /** The idea explained a different way from the lesson. */
  altExplanation: string;
  /** A new example or illustration, different from the lesson's. */
  altExample: string;
  /** A practice question, not used anywhere in the assessment itself. */
  practice: GradedItem;
};

export type AssessmentConcept = {
  id: string;
  title: string;
  /** Lessons where this is taught (linked from the error analysis). */
  lessonIds: string[];
  /** Must be answered correctly in a passing attempt ("demonstrated understanding"). */
  critical: boolean;
  /** Safety-critical (risk, sizing, leverage, backtesting validity): every such question must be right. */
  safetyCritical: boolean;
  /** This concept's questions are applied scenarios; one must be passed. */
  applied?: boolean;
  remediation: ConceptRemediation;
  /** Further remediation variants (at least one), rotated each time the concept is missed again. */
  moreRemediation?: ConceptRemediation[];
  /** A revision card shown before the assessment. */
  flashcard: { front: string; back: string };
};

export type AssessmentQuestion = {
  id: string;
  concept: string;
  type: "knowledge" | "applied" | "calculation";
  item: GradedItem;
  /** Why the right answer is right; shown in the error analysis. */
  explanation: string;
};

export type TrackAssessment = {
  trackId: string;
  intro: string;
  concepts: AssessmentConcept[];
  /** Pool: at least four questions per concept, so three retests in a row can use different ones. */
  questions: AssessmentQuestion[];
};

export type OrderExercise = {
  kind: "order";
  id: string;
  title: string;
  prompt: string;
  /** Items listed in the CORRECT order. The UI shuffles them deterministically. */
  items: { id: string; text: string }[];
  explanation: string;
};

export type ClassifyExercise = {
  kind: "classify";
  id: string;
  title: string;
  prompt: string;
  categories: { id: string; label: string }[];
  items: { id: string; text: string; category: string; explain: string }[];
};

export type MatchExercise = {
  kind: "match";
  id: string;
  title: string;
  prompt: string;
  /** Each left item must be matched with its own right item. */
  pairs: { id: string; left: string; right: string }[];
  explanation: string;
};

export type CalculateExercise = {
  kind: "calculate";
  id: string;
  title: string;
  prompt: string;
  /** Short label shown next to the input, e.g. "US dollars". */
  unit: string;
  answer: number;
  /** Accepted absolute difference from the answer. */
  tolerance: number;
  hint: string;
  solution: string;
};

export type Exercise = OrderExercise | ClassifyExercise | MatchExercise | CalculateExercise;
export type ExerciseKind = Exercise["kind"];

export type QuizOption = { id: string; text: string; /** Why this option is right or wrong. */ explain: string };
export type QuizQuestion = { id: string; prompt: string; options: QuizOption[]; correct: string };

export type Practical = {
  title: string;
  instructions: string;
  steps: string[];
  reflectionPrompt: string;
};

export type Lesson = {
  id: string;
  trackId: string;
  order: number;
  title: string;
  summary: string;
  minutes: number;
  objectives: string[];
  sections: Section[];
  exercise: Exercise;
  quiz: QuizQuestion[];
  practical: Practical;
  /** Glossary ids this lesson introduces. */
  glossary: string[];
  /** Recommended next lesson id, or null if this is the last written lesson. */
  next: string | null;
  /**
   * "full": the lesson follows the full A–L lesson format and must cover every
   * part. Absent: an earlier lesson, rendered as written.
   */
  format?: "full";
};

export type Track = {
  id: string;
  order: number;
  title: string;
  summary: string;
  /** "written": lessons exist. "planned": only an outline, no content yet. */
  status: "written" | "planned";
  /** Lesson ids, in order (written tracks only). */
  lessonIds: string[];
  /** Planned lesson titles (planned tracks only). Not written yet. */
  planned: string[];
  /** Tracks that must be complete (lessons + assessment) before this one unlocks. Forms a DAG. */
  prerequisites: string[];
};
