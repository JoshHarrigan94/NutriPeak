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

  return {
    ...report,
    transition
  };
}