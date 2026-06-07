import { THRESHOLDS } from "../config/engineThresholds.js";
function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function evidence(condition, text) {
  return condition ? [text] : [];
}

export function analyseEnergyCompensation(metrics, diagnostics, efficiency, waterLoad) {
  const highActivity =
    metrics.avgSteps >= THRESHOLDS.steps.elevated ||
    metrics.highStepDays >= THRESHOLDS.steps.frequentHighDays;

  const lowOutput =
    diagnostics.rawEfficiency < THRESHOLDS.efficiency.low;

  const maskedOutput =
    diagnostics.maskingGap >= THRESHOLDS.efficiency.maskingGap ||
    waterLoad.estimatedWaterLoadKg >= 0.8;

  const largeDeficit =
    metrics.estimatedDeficit >= THRESHOLDS.deficit.large;

  const compensationScore = clamp(
    (highActivity ? 22 : 0) +
    (largeDeficit ? 22 : 0) +
    (lowOutput ? 28 : 0) +
    (metrics.lowSleepDays >= THRESHOLDS.sleep.repeatedLowDays ? 10 : 0) +
    (metrics.highStressDays >= THRESHOLDS.stress.repeatedHighDays ? 10 : 0) +
    (metrics.avgAdherence < THRESHOLDS.adherence.drift ? 8 : 0)
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