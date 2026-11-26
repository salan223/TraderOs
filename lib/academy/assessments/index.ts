import type { TrackAssessment } from "../types";
import { MARKET_FOUNDATIONS_ASSESSMENT } from "./market-foundations";
import { FOREX_FOUNDATIONS_ASSESSMENT } from "./forex-foundations";
import { STOCKS_INDICES_ASSESSMENT } from "./stocks-indices";
import { CHART_READING_ASSESSMENT } from "./chart-reading";
import { TECHNICAL_ANALYSIS_ASSESSMENT } from "./technical-analysis";
import { RISK_MANAGEMENT_ASSESSMENT } from "./risk-management";
import { MARKET_STRUCTURE_ASSESSMENT } from "./market-structure";
import { PSYCHOLOGY_ASSESSMENT } from "./psychology";
import { STRATEGY_ASSESSMENT } from "./strategy";
import { BACKTESTING_ASSESSMENT } from "./backtesting";
import { MACRO_NEWS_ASSESSMENT } from "./macro-news";
import { CRYPTO_ASSESSMENT } from "./crypto";
import { COMMODITIES_ASSESSMENT } from "./commodities";
import { ADVANCED_ASSESSMENT } from "./advanced";

/** Track assessments by track id. Every written track has one. */
export const ASSESSMENTS: Readonly<Record<string, TrackAssessment>> = {
  [MARKET_FOUNDATIONS_ASSESSMENT.trackId]: MARKET_FOUNDATIONS_ASSESSMENT,
  [FOREX_FOUNDATIONS_ASSESSMENT.trackId]: FOREX_FOUNDATIONS_ASSESSMENT,
  [STOCKS_INDICES_ASSESSMENT.trackId]: STOCKS_INDICES_ASSESSMENT,
  [CHART_READING_ASSESSMENT.trackId]: CHART_READING_ASSESSMENT,
  [TECHNICAL_ANALYSIS_ASSESSMENT.trackId]: TECHNICAL_ANALYSIS_ASSESSMENT,
  [RISK_MANAGEMENT_ASSESSMENT.trackId]: RISK_MANAGEMENT_ASSESSMENT,
  [MARKET_STRUCTURE_ASSESSMENT.trackId]: MARKET_STRUCTURE_ASSESSMENT,
  [PSYCHOLOGY_ASSESSMENT.trackId]: PSYCHOLOGY_ASSESSMENT,
  [STRATEGY_ASSESSMENT.trackId]: STRATEGY_ASSESSMENT,
  [BACKTESTING_ASSESSMENT.trackId]: BACKTESTING_ASSESSMENT,
  [MACRO_NEWS_ASSESSMENT.trackId]: MACRO_NEWS_ASSESSMENT,
  [CRYPTO_ASSESSMENT.trackId]: CRYPTO_ASSESSMENT,
  [COMMODITIES_ASSESSMENT.trackId]: COMMODITIES_ASSESSMENT,
  [ADVANCED_ASSESSMENT.trackId]: ADVANCED_ASSESSMENT,
};

export function getAssessment(trackId: string): TrackAssessment | undefined {
  return Object.prototype.hasOwnProperty.call(ASSESSMENTS, trackId) ? ASSESSMENTS[trackId] : undefined;
}
