function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function runDiagnostics(metrics) {
  const efficiency =
    metrics.expectedLossKg > 0
      ? clamp((metrics.actualLossKg / metrics.expectedLossKg) * 100)
      : 0;

  const lowCaloriesPressure =
    metrics.estimatedDeficit > 900
      ? 25
      : metrics.estimatedDeficit > 600
        ? 14
        : 4;

  const highStepsPressure =
    metrics.avgSteps > 12000
      ? 16
      : metrics.avgSteps > 9000
        ? 8
        : 2;

  const poorOutputPressure =
    efficiency < 55
      ? 32
      : efficiency < 75
        ? 18
        : 4;

  const adaptationRisk = clamp(
    lowCaloriesPressure +
    highStepsPressure +
    poorOutputPressure
  );

  const adherenceRisk = clamp(100 - metrics.avgAdherence);

  const retentionRisk = clamp(
    (efficiency < 65 ? 34 : 12) +
    (metrics.avgSteps > 11000 ? 12 : 0)
  );

  const fatigueRisk = clamp(
    lowCaloriesPressure +
    highStepsPressure +
    adherenceRisk +
    (metrics.entryCount > 14 ? 10 : 0)
  );

  let status = "good";
  let label = "Strategy working";

  if (efficiency < 55 && fatigueRisk > 45) {
    status = "bad";
    label = "Stall likely";
  } else if (efficiency < 75 || adaptationRisk > 45) {
    status = "warn";
    label = "Monitor closely";
  }

  return {
    efficiency,
    adaptationRisk,
    retentionRisk,
    fatigueRisk,
    adherenceRisk,
    status,
    label
  };
} 