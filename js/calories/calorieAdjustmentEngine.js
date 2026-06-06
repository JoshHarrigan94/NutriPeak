function roundToNearest(value, step = 50) {
  return Math.round(value / step) * step;
}

export function getCalorieAdjustment(metrics, diagnostics, decision, investigation, state) {
  const currentCalories = metrics.avgCalories || state.user.estimatedTdee;
  const effectiveMaintenance = metrics.effectiveTdee || state.user.estimatedTdee;
  const minCalories = state.user.minimumCalories;

  if (metrics.daysLogged < 7) {
    return {
      label: "Hold calories",
      targetCalories: Math.round(currentCalories),
      delta: 0,
      confidence: "Low",
      summary: "Build a baseline before trusting calorie changes.",
      warning: "Changing calories too early makes the engine harder to calibrate."
    };
  }

  if (decision.state === "continue") {
    return {
      label: "Hold calories",
      targetCalories: roundToNearest(currentCalories),
      delta: 0,
      confidence: "High",
      summary: "Current intake is producing enough output. Keep calories stable.",
      warning: ""
    };
  }

  if (decision.state === "maintenance" || investigation.primary.id === "adaptation") {
    const target = roundToNearest(
      Math.min(effectiveMaintenance, currentCalories + 300)
    );

    return {
      label: "Raise toward observed maintenance",
      targetCalories: target,
      delta: target - currentCalories,
      confidence: "Moderate",
      summary: `Observed maintenance is around ${effectiveMaintenance} kcal. A temporary rise may improve recovery and signal clarity.`,
      warning: "Expect short-term scale increase from glycogen and water, not necessarily fat regain."
    };
  }

  if (investigation.primary.id === "retention") {
    return {
      label: "Hold calories",
      targetCalories: roundToNearest(currentCalories),
      delta: 0,
      confidence: "Moderate",
      summary: "Scale noise may be masking progress. Hold calories until the trend resolves.",
      warning: "Do not cut based on one noisy weigh-in."
    };
  }

  if (decision.state === "tighten") {
    return {
      label: "Keep target, improve execution",
      targetCalories: roundToNearest(currentCalories),
      delta: 0,
      confidence: "Moderate",
      summary: "The first adjustment is behavioural, not numerical.",
      warning: "Lowering calories while adherence is drifting often makes execution worse."
    };
  }

  if (
    diagnostics.efficiency < 70 &&
    diagnostics.fatigueRisk < 45 &&
    metrics.avgAdherence >= 90 &&
    metrics.estimatedDeficit < 700
  ) {
    const target = Math.max(
      minCalories,
      roundToNearest(currentCalories - 150)
    );

    return {
      label: "Small reduction candidate",
      targetCalories: target,
      delta: target - currentCalories,
      confidence: "Moderate",
      summary: "A cautious reduction may be justified if the same signal repeats.",
      warning: "Only apply this if the pattern persists across the next review."
    };
  }

  return {
    label: "Monitor calories",
    targetCalories: roundToNearest(currentCalories),
    delta: 0,
    confidence: "Low",
    summary: "The signal is mixed. Keep calories consistent until the next review.",
    warning: "Mixed signals are where reactive changes usually create confusion."
  };
}