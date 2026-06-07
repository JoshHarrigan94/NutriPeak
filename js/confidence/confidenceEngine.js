function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function label(score) {
  if (score >= 80) return "High";
  if (score >= 55) return "Moderate";
  if (score >= 35) return "Low";
  return "Very low";
}

function makeConfidence(score, evidence) {
  const clean = clamp(Math.round(score));

  return {
    score: clean,
    label: label(clean),
    evidence
  };
}

export function analyseConfidence(report) {
  const {
    metrics,
    quality,
    waterLoad,
    efficiency,
    diagnostics,
    metabolicState,
    transition,
    learning
  } = report;

  const dataDepthScore = clamp(
    (metrics.daysLogged / 28) * 100
  );

  const dataQualityScore = quality.score;

  const maintenanceScore = makeConfidence(
    dataDepthScore * 0.5 +
    dataQualityScore * 0.3 +
    (metrics.adaptiveMaintenance.available ? 20 : 0),
    [
      `${metrics.daysLogged} logged day(s).`,
      `Data quality is ${quality.score}%.`,
      `Maintenance confidence is ${metrics.adaptiveMaintenance.confidence}.`
    ]
  );

  const waterScore = makeConfidence(
    dataQualityScore * 0.45 +
    dataDepthScore * 0.25 +
    (metrics.avgCarbs > 0 ? 10 : 0) +
    (metrics.avgSodium > 0 ? 10 : 0) +
    (metrics.avgSleep > 0 ? 10 : 0),
    [
      "Water model uses carbs, sodium, soreness, stress, sleep and scale trend.",
      `Estimated water load is ${waterLoad.estimatedWaterLoadKg.toFixed(1)}kg.`
    ]
  );

  const efficiencyScore = makeConfidence(
    dataQualityScore * 0.35 +
    dataDepthScore * 0.3 +
    (metrics.expectedLossKg > 0 ? 15 : 0) +
    (efficiency.maskingGap < 20 ? 10 : 0),
    [
      `Raw efficiency is ${efficiency.rawEfficiency.toFixed(0)}%.`,
      `Dry-adjusted efficiency is ${efficiency.dryAdjustedEfficiency.toFixed(0)}%.`,
      `Masking gap is ${efficiency.maskingGap.toFixed(0)}%.`
    ]
  );

  const stateScore = makeConfidence(
    dataQualityScore * 0.3 +
    dataDepthScore * 0.25 +
    metabolicState.primary.score * 0.25 +
    (metabolicState.confidence === "High" ? 20 : metabolicState.confidence === "Moderate" ? 10 : 0),
    [
      `Primary state is ${metabolicState.primary.label}.`,
      `Secondary state is ${metabolicState.secondary.label}.`,
      `State confidence is ${metabolicState.confidence}.`
    ]
  );

  const transitionScore = makeConfidence(
    dataQualityScore * 0.25 +
    Math.min((report.state.reviews || []).length * 18, 45) +
    (transition.direction !== "uncertain" ? 20 : 0),
    [
      `${(report.state.reviews || []).length} saved review(s).`,
      `Transition direction is ${transition.direction}.`,
      `Transition risk is ${transition.riskLevel}.`
    ]
  );

  const recommendationScore = makeConfidence(
    efficiencyScore.score * 0.25 +
    stateScore.score * 0.25 +
    transitionScore.score * 0.2 +
    dataQualityScore * 0.3,
    [
      "Recommendation confidence blends efficiency, state, transition and data quality.",
      `Diagnostic status is ${diagnostics.label}.`
    ]
  );

  const learningScore = makeConfidence(
    learning.confidenceScore,
    [
      `Learning confidence is ${learning.confidence}.`,
      learning.summary
    ]
  );

  const overall = makeConfidence(
    maintenanceScore.score * 0.15 +
    waterScore.score * 0.15 +
    efficiencyScore.score * 0.2 +
    stateScore.score * 0.2 +
    recommendationScore.score * 0.2 +
    learningScore.score * 0.1,
    [
      "Overall confidence blends the full engine stack.",
      `Data quality is ${quality.score}%.`,
      `${metrics.daysLogged} day(s) logged.`
    ]
  );

  return {
    overall,
    maintenance: maintenanceScore,
    water: waterScore,
    efficiency: efficiencyScore,
    state: stateScore,
    transition: transitionScore,
    recommendation: recommendationScore,
    learning: learningScore
  };
}