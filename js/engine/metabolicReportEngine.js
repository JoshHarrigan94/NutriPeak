
import { buildReportSchema } from "../schema/reportSchema.js";
import { resolveRecommendation } from "../resolution/recommendationResolver.js";
import { analyseConfidence } from "../confidence/confidenceEngine.js";
import { analysePersonalLearning } from "../learning/personalLearningEngine.js";
import { analyseEnergyCompensation } from "../compensation/energyCompensationEngine.js";
import { calculateMetrics } from "../metrics/coreMetrics.js";
import { estimateWaterLoad } from "../water/waterLoadEngine.js";
import { calculateEfficiency } from "../efficiency/efficiencyEngine.js";
import { runDiagnostics } from "../diagnostics/diagnosticEngine.js";
import { investigateStall } from "../investigations/stallInvestigator.js";
import { calculateDataQuality } from "../quality/dataQualityEngine.js";
import { analyseScaleNoise } from "../insights/scaleNoiseEngine.js";
import { getDecision } from "../decisions/decisionEngine.js";
import { getPhaseRecommendation } from "../phases/phaseEngine.js";
import { calculateProjection } from "../projections/projectionEngine.js";
import { getCalorieAdjustment } from "../calories/calorieAdjustmentEngine.js";
import { classifyMetabolicState } from "../stateEngine/metabolicStateEngine.js";
import { analyseReviewHistory } from "../history/reviewHistory.js";
import { analyseDietFatigue } from "../fatigue/dietFatigueEngine.js";
import { analyseStateTransition } from "../transitions/stateTransitionEngine.js";
import { prescribeWeeklyExperiment } from "../experiments/weeklyExperimentEngine.js";
export function generateMetabolicReport(state) {
  const metrics = calculateMetrics(state);

  const quality = calculateDataQuality(state);
  const noise = analyseScaleNoise(metrics, state.entries);
  const waterLoad = estimateWaterLoad(metrics, state.entries);
  const efficiency = calculateEfficiency(metrics, waterLoad);

  const diagnostics = runDiagnostics(metrics, efficiency);
  const compensation = analyseEnergyCompensation(
  metrics,
  diagnostics,
  efficiency,
  waterLoad
);

  const dietFatigue = analyseDietFatigue(
  metrics,
  diagnostics,
  compensation
);
  const investigation = investigateStall(metrics, diagnostics);

  const metabolicState = classifyMetabolicState(
    metrics,
    diagnostics,
    investigation,
    quality,
    noise
  );

  const decision = getDecision(diagnostics, metrics);
  const phase = getPhaseRecommendation(
    diagnostics,
    metrics,
    decision,
    investigation
  );

  const projection = calculateProjection(metrics, state);
  const calorieAdjustment = getCalorieAdjustment(
    metrics,
    diagnostics,
    decision,
    investigation,
    state
  );

    const reviewPattern = analyseReviewHistory(state.reviews || []);

    const report = {
    state,
    metrics,
    quality,
    noise,
    waterLoad,
    efficiency,
    diagnostics,
    compensation,
    dietFatigue,
    investigation,
    metabolicState,
    decision,
    phase,
    projection,
    calorieAdjustment,
    reviewPattern
  };

  const transition = analyseStateTransition(report);

  const reportWithTransition = {
    ...report,
    transition
  };

  const experiment = prescribeWeeklyExperiment(reportWithTransition);

  const reportWithExperiment = {
  ...reportWithTransition,
  experiment
};

const learning = analysePersonalLearning(reportWithExperiment);

  const reportWithLearning = {
    ...reportWithExperiment,
    learning
  };

  const confidence = analyseConfidence(reportWithLearning);

    const reportWithConfidence = {
    ...reportWithLearning,
    confidence
  };

  const resolution = resolveRecommendation(reportWithConfidence);

    const reportWithResolution = {
    ...reportWithConfidence,
    resolution
  };

  const schema = buildReportSchema(reportWithResolution);

  return {
    ...reportWithResolution,
    schema
  };
