function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function evidence(condition, text) {
  return condition ? [text] : [];
}

export function analyseEnergyCompensation(metrics, diagnostics, efficiency, waterLoad) {
  const highActivity =
    metrics.avgSteps >= 10000 ||
    metrics.highStepDays >= 4;

  const lowOutput =
    diagnostics.rawEfficiency < 70;

  const maskedOutput =
    diagnostics.maskingGap >= 15 ||
    waterLoad.estimatedWaterLoadKg >= 0.8;

  const largeDeficit =
    metrics.estimatedDeficit >= 700;

  const compensationScore = clamp(
    (highActivity ? 22 : 0) +
    (largeDeficit ? 22 : 0) +
    (lowOutput ? 28 : 0) +
    (metrics.lowSleepDays >= 3 ? 10 : 0) +
    (metrics.highStressDays >= 3 ? 10 : 0) +
    (metrics.avgAdherence < 90 ? 8 : 0)
  );

  const activityEfficiencyScore = clamp(
    100 -
    compensationScore +
    (diagnostics.efficiency >= 85 ? 18 : 0) -
    (maskedOutput ? 8 : 0)
  );

  let label = "Low compensation";
  let summary =
    "Activity and deficit currently appear to be translating into expected fat-loss output.";

  if (compensationScore >= 70) {
    label = "High compensation risk";
    summary =
      "The body may be offsetting the apparent deficit through fatigue, reduced output, water masking, or reduced non-exercise efficiency.";
  } else if (compensationScore >= 45) {
    label = "Moderate compensation risk";
    summary =
      "There are signs that more activity or restriction may not be producing proportional fat-loss output.";
  }

  const evidenceList = [
    ...evidence(highActivity, "Steps/activity are high in the recent window."),
    ...evidence(largeDeficit, "Estimated deficit is large relative to observed maintenance."),
    ...evidence(lowOutput, "Raw fat-loss output is below expected output."),
    ...evidence(maskedOutput, "Dry-adjusted efficiency suggests some output may be masked."),
    ...evidence(metrics.lowSleepDays >= 3, "Low sleep may reduce recovery and increase compensation pressure."),
    ...evidence(metrics.highStressDays >= 3, "High stress may worsen fatigue and water retention."),
    ...evidence(metrics.avgAdherence < 90, "Adherence drift may be reducing real-world deficit.")
  ];

  if (!evidenceList.length) {
    evidenceList.push("No strong compensation driver detected.");
  }

  return {
    label,
    compensationScore,
    activityEfficiencyScore,
    highActivity,
    largeDeficit,
    lowOutput,
    maskedOutput,
    summary,
    evidence: evidenceList,
    interpretation:
      compensationScore >= 70
        ? "Adding more steps or cutting calories is unlikely to be the cleanest next move."
        : compensationScore >= 45
          ? "Hold inputs steady and watch whether output improves before adding more pressure."
          : "Current activity level appears productive."
  };
}