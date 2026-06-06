export function getRecommendation(diagnostics, metrics) {
  if (metrics.daysLogged < 7) {
    return "Keep logging. The engine needs at least 7 days before it can separate real trend from normal noise.";
  }

  if (diagnostics.efficiency >= 85 && diagnostics.fatigueRisk < 45) {
    return "Continue. Output is matching the expected deficit and fatigue pressure is not yet concerning.";
  }

  if (
    diagnostics.efficiency < 45 &&
    diagnostics.fatigueRisk >= 55 &&
    metrics.avgCalories < 2600 &&
    metrics.avgSteps > 10000
  ) {
    return "Do not cut harder yet. Calories are already low and activity is high. First check adherence, digestion, sleep, soreness and water retention. If this persists for another week, a maintenance phase may be smarter than more restriction.";
  }

  if (diagnostics.retentionRisk >= 50 && diagnostics.fatigueRisk < 65) {
    return "Hold the plan. This may be a masking phase where water, glycogen or stress is hiding fat loss. Watch the 14-day trend before adjusting calories.";
  }

  if (diagnostics.adherenceRisk >= 25) {
    return "Improve execution before changing the plan. The signal suggests adherence drift may explain the gap between expected and actual progress.";
  }

  return "Monitor. The signal is mixed, so avoid emotional changes. Review again after 3–7 more logged days.";
}