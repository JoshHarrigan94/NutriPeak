export function buildReviewSnapshot({
  metrics,
  diagnostics,
  decision,
  investigation,
  phase,
  projection,
  adjustment,
  quality,
  noise
}) {
  return {
    decisionLabel: decision.label,
    decisionState: decision.state,
    decisionAction: decision.action,

    phaseTitle: phase.title,
    phaseTag: phase.tag,

    primaryCause: investigation.primary.title,
    primaryCauseId: investigation.primary.id,

    efficiency: Math.round(diagnostics.efficiency),
    rawEfficiency: Math.round(diagnostics.rawEfficiency || diagnostics.efficiency),
    maskingGap: Math.round(diagnostics.maskingGap || 0),

    fatigueRisk: Math.round(diagnostics.fatigueRisk),
    adaptationRisk: Math.round(diagnostics.adaptationRisk),
    retentionRisk: Math.round(diagnostics.retentionRisk),

    dataQuality: quality.score,

    trendLoss: Number(diagnostics.activeLossSignal.toFixed(2)),
    expectedLoss: Number(metrics.expectedLossKg.toFixed(2)),

    avgCalories: Math.round(metrics.avgCalories),
    avgSteps: Math.round(metrics.avgSteps),
    effectiveTdee: Math.round(metrics.effectiveTdee),

    calorieTarget: adjustment.targetCalories,
    calorieLabel: adjustment.label,

    projectionDate: projection.projectedDate,
    scaleNoise: noise.label
  };
}

export function analyseReviewHistory(reviews = []) {
  if (!reviews.length) {
    return {
      hasPattern: false,
      title: "No review history yet",
      summary: "Save your first weekly review to start detecting repeated patterns."
    };
  }

  const recent = reviews.slice(0, 4);

  const causeCounts = recent.reduce((acc, review) => {
    acc[review.primaryCauseId] = (acc[review.primaryCauseId] || 0) + 1;
    return acc;
  }, {});

  const repeatedCause = Object.entries(causeCounts)
    .find(([, count]) => count >= 2);

  if (repeatedCause) {
    const matching = recent.find(review =>
      review.primaryCauseId === repeatedCause[0]
    );

    return {
      hasPattern: true,
      title: `Repeated pattern: ${matching.primaryCause}`,
      summary: `This has appeared ${repeatedCause[1]} times recently. Treat this as a recurring limiter, not a one-off signal.`
    };
  }

  const lowEfficiencyCount = recent.filter(review =>
    review.efficiency < 70
  ).length;

  if (lowEfficiencyCount >= 2) {
    return {
      hasPattern: true,
      title: "Repeated low efficiency",
      summary: "Fat-loss efficiency has been below target more than once recently."
    };
  }

  return {
    hasPattern: false,
    title: "No repeating limiter yet",
    summary: "Recent reviews do not yet show a strong repeated pattern."
  };
}