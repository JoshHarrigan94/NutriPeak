import { THRESHOLDS } from "../config/engineThresholds.js";

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function evidence(condition, text) {
  return condition ? [text] : [];
}

export function analyseDietFatigue(metrics, diagnostics, compensation) {
  const aggressiveDeficit = metrics.estimatedDeficit >= THRESHOLDS.deficit.large;
  const veryAggressiveDeficit = metrics.estimatedDeficit >= THRESHOLDS.deficit.veryAggressive;

  const longDietWindow = metrics.daysLogged >= 21;
  const lowSleep = metrics.lowSleepDays >= THRESHOLDS.sleep.repeatedLowDays;
  const highStress = metrics.highStressDays >= THRESHOLDS.stress.repeatedHighDays;
  const highSoreness = metrics.highSorenessDays >= THRESHOLDS.soreness.repeatedHighDays;
  const lowProtein = metrics.lowProteinDays >= 3;
  const lowFibre = metrics.lowFibreDays >= 3;
  const highActivity = metrics.highStepDays >= THRESHOLDS.steps.frequentHighDays;
  const adherenceDrift = metrics.avgAdherence < THRESHOLDS.adherence.drift;
  const poorAdherence = metrics.avgAdherence < THRESHOLDS.adherence.poor;

  const recoveryDebt = clamp(
    (lowSleep ? 24 : 0) +
    (highStress ? 22 : 0) +
    (highSoreness ? 16 : 0) +
    (highActivity ? 12 : 0) +
    (veryAggressiveDeficit ? 18 : aggressiveDeficit ? 10 : 0)
  );

  const dietLoad = clamp(
    (aggressiveDeficit ? 20 : 0) +
    (veryAggressiveDeficit ? 16 : 0) +
    (longDietWindow ? 15 : 0) +
    (metrics.lowCalorieDays >= 4 ? 18 : 0) +
    (highActivity ? 12 : 0)
  );

  const adherenceCollapseRisk = clamp(
    (adherenceDrift ? 24 : 0) +
    (poorAdherence ? 20 : 0) +
    (lowProtein ? 10 : 0) +
    (lowFibre ? 10 : 0) +
    (recoveryDebt >= 55 ? 18 : 0) +
    (dietLoad >= 60 ? 18 : 0) +
    (compensation.compensationScore >= 65 ? 12 : 0)
  );

  const fatigueScore = clamp(
    dietLoad * 0.42 +
    recoveryDebt * 0.36 +
    adherenceCollapseRisk * 0.22
  );

  let label = "Low diet fatigue";
  let recommendation =
    "Current fatigue pressure appears manageable. Continue monitoring recovery and adherence.";

  if (fatigueScore >= 75) {
    label = "High diet fatigue";
    recommendation =
      "Avoid adding more restriction. Consider a recovery-focused maintenance phase or a controlled diet break if this signal persists.";
  } else if (fatigueScore >= 50) {
    label = "Moderate diet fatigue";
    recommendation =
      "Hold the deficit steady and improve recovery inputs before cutting harder.";
  }

  const evidenceList = [
    ...evidence(aggressiveDeficit, "Estimated deficit is large."),
    ...evidence(veryAggressiveDeficit, "Estimated deficit is very aggressive."),
    ...evidence(longDietWindow, "Diet duration is long enough for fatigue to accumulate."),
    ...evidence(metrics.lowCalorieDays >= 4, "Multiple recent days are below the minimum calorie warning threshold."),
    ...evidence(highActivity, "High step days are frequent."),
    ...evidence(lowSleep, "Low sleep is repeated across the recent window."),
    ...evidence(highStress, "High stress is repeated across the recent window."),
    ...evidence(highSoreness, "Soreness is elevated on multiple days."),
    ...evidence(adherenceDrift, "Adherence is beginning to drift."),
    ...evidence(lowProtein, "Protein is below target on multiple days."),
    ...evidence(lowFibre, "Fibre is low on multiple days."),
    ...evidence(compensation.compensationScore >= 65, "Energy compensation risk is elevated.")
  ];

  if (!evidenceList.length) {
    evidenceList.push("No strong diet-fatigue driver detected.");
  }

  return {
    label,
    fatigueScore,
    dietLoad,
    recoveryDebt,
    adherenceCollapseRisk,
    recommendation,
    evidence: evidenceList,
    flags: {
      aggressiveDeficit,
      veryAggressiveDeficit,
      longDietWindow,
      lowSleep,
      highStress,
      highSoreness,
      lowProtein,
      lowFibre,
      highActivity,
      adherenceDrift,
      poorAdherence
    }
  };
}