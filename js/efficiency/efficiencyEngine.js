function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function calculateEfficiency(metrics, waterLoad) {
  const rawLossSignal =
    metrics.trendLossPerWeek > 0
      ? metrics.trendLossPerWeek
      : metrics.sevenDayLoss;

  const expectedLoss = metrics.expectedLossKg || 0;

  const rawEfficiency =
    expectedLoss > 0
      ? clamp((rawLossSignal / expectedLoss) * 100)
      : 0;

  const dryWeightAdjustment =
    waterLoad?.estimatedWaterLoadKg > 0.3
      ? Math.min(waterLoad.estimatedWaterLoadKg, 1.5)
      : 0;

  const dryAdjustedLossSignal =
    rawLossSignal + dryWeightAdjustment * 0.35;

  const dryAdjustedEfficiency =
    expectedLoss > 0
      ? clamp((dryAdjustedLossSignal / expectedLoss) * 100)
      : rawEfficiency;

  const maskingGap = dryAdjustedEfficiency - rawEfficiency;

  let label = "Raw signal";
  if (maskingGap >= 20) label = "Masked progress likely";
  else if (maskingGap >= 10) label = "Some masking likely";

  return {
    rawLossSignal,
    rawEfficiency,
    dryAdjustedLossSignal,
    dryAdjustedEfficiency,
    maskingGap,
    dryWeightAdjustment,
    label,
    summary:
      maskingGap >= 10
        ? `Raw efficiency is ${rawEfficiency.toFixed(0)}%, but dry-adjusted efficiency is ${dryAdjustedEfficiency.toFixed(0)}%. The engine should avoid treating this as a clean stall.`
        : `Raw and dry-adjusted efficiency are closely aligned. The scale signal is probably usable.`
  };
}