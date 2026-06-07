import { THRESHOLDS } from "../config/engineThresholds.js";
function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function scoreLabel(score) {
  if (score >= 75) return "High";
  if (score >= 45) return "Moderate";
  return "Low";
}

export function runDiagnostics(metrics, efficiencyModel = null) {
  const activeLossSignal =
  efficiencyModel?.dryAdjustedLossSignal ??
  (metrics.trendLossPerWeek > 0
    ? metrics.trendLossPerWeek
    : metrics.sevenDayLoss);

const rawEfficiency =
  efficiencyModel?.rawEfficiency ?? (
    metrics.expectedLossKg > 0
      ? clamp((activeLossSignal / metrics.expectedLossKg) * 100)
      : 0
  );

const efficiency =
  efficiencyModel?.dryAdjustedEfficiency ?? rawEfficiency;

const maskingGap =
  efficiencyModel?.maskingGap ?? 0;

  const deficitPressure =
    metrics.estimatedDeficit > THRESHOLDS.deficit.aggressive ? 24 :
    metrics.estimatedDeficit > THRESHOLDS.deficit.large ? 18 :
    metrics.estimatedDeficit > THRESHOLDS.deficit.moderate ? 10 :
    4;

  const lowCaloriesPressure = clamp(metrics.lowCalorieDays * 7);
  const highStepsPressure = clamp(metrics.highStepDays * 6);

  const maintenanceSuppressionPressure =
    metrics.adaptiveMaintenance?.delta <= THRESHOLDS.maintenance.majorSuppression ? 24 :
    metrics.adaptiveMaintenance?.delta <= THRESHOLDS.maintenance.meaningfulSuppression ? 16 :
    metrics.adaptiveMaintenance?.delta <= -150 ? 8 :
    0;

  const poorOutputPressure =
    efficiency < THRESHOLDS.efficiency.poor ? 35 :
    efficiency < THRESHOLDS.efficiency.low? 22 :
    efficiency < THRESHOLDS.efficiency.strong ? 10 :
    0;

  const adaptationRisk = clamp(
    deficitPressure +
    lowCaloriesPressure +
    highStepsPressure +
    maintenanceSuppressionPressure +
    poorOutputPressure
  );

  const adherenceRisk = clamp(100 - metrics.avgAdherence);

  const fatigueRisk = clamp(
    deficitPressure +
    lowCaloriesPressure +
    highStepsPressure +
    adherenceRisk +
    (metrics.daysLogged >= 21 ? 12 : 0) +
    (metrics.lowSleepDays >= 3 ? 10 : 0) +
    (metrics.highStressDays >= 3 ? 10 : 0)
  );

  const retentionRisk = clamp(
  (rawEfficiency < THRESHOLDS.efficiency.low ? 30 : 8) +
  (maskingGap >= THRESHOLDS.efficiency.maskingGap ? 20 : 0) +
  (metrics.highStepDays >= 4 ? 14 : 0) +
  (metrics.lowCalorieDays >= 4 ? 10 : 0) +
  (metrics.highSodiumDays >= 2 ? 10 : 0) +
  (metrics.highSorenessDays >= 2 ? 10 : 0)
);

  let status = "good";
  let label = "Strategy working";

  if (metrics.daysLogged < THRESHOLDS.data.minimumDays) {
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
rawEfficiency,
maskingGap,
adaptationRisk,
    retentionRisk,
    fatigueRisk,
    adherenceRisk,
    activeLossSignal,
    deficitPressure,
    maintenanceSuppressionPressure,
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