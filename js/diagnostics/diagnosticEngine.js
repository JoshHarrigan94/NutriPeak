function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function scoreLabel(score) {
  if (score >= 75) return "High";
  if (score >= 45) return "Moderate";
  return "Low";
}

export function runDiagnostics(metrics) {
  const activeLossSignal =
    metrics.trendLossPerWeek > 0
      ? metrics.trendLossPerWeek
      : metrics.sevenDayLoss;

  const efficiency =
    metrics.expectedLossKg > 0
      ? clamp((activeLossSignal / metrics.expectedLossKg) * 100)
      : 0;

  const lowCaloriesPressure = clamp(metrics.lowCalorieDays * 8);
  const highStepsPressure = clamp(metrics.highStepDays * 6);
  const poorOutputPressure =
    efficiency < 45 ? 35 :
    efficiency < 70 ? 22 :
    efficiency < 90 ? 10 :
    0;

  const adaptationRisk = clamp(
    lowCaloriesPressure +
    highStepsPressure +
    poorOutputPressure
  );

  const adherenceRisk = clamp(100 - metrics.avgAdherence);

  const fatigueRisk = clamp(
    lowCaloriesPressure +
    highStepsPressure +
    adherenceRisk +
    (metrics.daysLogged >= 21 ? 12 : 0)
  );

  const retentionRisk = clamp(
    (efficiency < 70 ? 30 : 8) +
    (metrics.highStepDays >= 4 ? 14 : 0) +
    (metrics.lowCalorieDays >= 4 ? 10 : 0)
  );

  let status = "good";
  let label = "Strategy working";

  if (metrics.daysLogged < 7) {
    status = "warn";
    label = "Baseline needed";
  } else if (efficiency < 45 && fatigueRisk >= 55) {
    status = "bad";
    label = "High-pressure stall";
  } else if (efficiency < 70 || adaptationRisk >= 55) {
    status = "warn";
    label = "Efficiency dropping";
  }

  return {
    efficiency,
    adaptationRisk,
    retentionRisk,
    fatigueRisk,
    adherenceRisk,
    activeLossSignal,
    status,
    label,
    labels: {
      adaptation: scoreLabel(adaptationRisk),
      fatigue: scoreLabel(fatigueRisk),
      retention: scoreLabel(retentionRisk),
      adherence: scoreLabel(adherenceRisk)
    }
  };
}