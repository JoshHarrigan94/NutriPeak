function makeResolution({
  primaryAction,
  supportingAction,
  avoidAction,
  rationale,
  priority,
  confidence
}) {
  return {
    primaryAction,
    supportingAction,
    avoidAction,
    rationale,
    priority,
    confidence
  };
}

export function resolveRecommendation(report) {
  const {
    diagnostics,
    investigation,
    metabolicState,
    compensation,
    dietFatigue,
    transition,
    experiment,
    calorieAdjustment,
    quality,
    confidence,
    waterLoad,
    efficiency
  } = report;

  if (quality.score < 45) {
    return makeResolution({
      primaryAction: "Improve data quality",
      supportingAction: "Complete daily weight, calories, steps and adherence logs.",
      avoidAction: "Avoid changing calories based on incomplete signal.",
      rationale:
        "The engine does not have enough reliable data to separate true plateaus from noise.",
      priority: "Data first",
      confidence: "High"
    });
  }

  if (
    transition.direction === "worsening" &&
    dietFatigue.fatigueScore >= 70
  ) {
    return makeResolution({
      primaryAction: "Reduce diet pressure",
      supportingAction: calorieAdjustment.summary,
      avoidAction: "Avoid cutting calories or adding more steps this week.",
      rationale:
        "Direction of travel is worsening and fatigue is high, so more pressure is unlikely to be the cleanest solution.",
      priority: "Recovery",
      confidence: confidence.recommendation.label
    });
  }

  if (
    investigation.primary.id === "retention" ||
    waterLoad.estimatedWaterLoadKg >= 0.8 ||
    efficiency.maskingGap >= 15
  ) {
    return makeResolution({
      primaryAction: "Hold inputs steady",
      supportingAction: "Stabilise sodium, carbs, sleep and training soreness for 7 days.",
      avoidAction: "Avoid reacting to single-day scale changes.",
      rationale:
        "The engine detects masking risk, so a calorie cut may solve the wrong problem.",
      priority: "Signal clarity",
      confidence: confidence.recommendation.label
    });
  }

  if (
    compensation.compensationScore >= 70 &&
    metabolicState.primary.id !== "responsive"
  ) {
    return makeResolution({
      primaryAction: "Test compensation before adding pressure",
      supportingAction: experiment.hypothesis,
      avoidAction: "Avoid automatically increasing steps or reducing calories.",
      rationale:
        "High activity and/or deficit may not be translating into proportional output.",
      priority: "Efficiency",
      confidence: confidence.recommendation.label
    });
  }

  if (
    investigation.primary.id === "adherence" ||
    metabolicState.primary.id === "execution_drift"
  ) {
    return makeResolution({
      primaryAction: "Tighten execution",
      supportingAction: "Improve adherence quality before changing the calorie target.",
      avoidAction: "Avoid lowering calories while execution quality is drifting.",
      rationale:
        "The gap may be caused by inconsistent execution rather than an incorrect calorie target.",
      priority: "Adherence",
      confidence: confidence.recommendation.label
    });
  }

  if (
    investigation.primary.id === "nutrients" ||
    report.metrics.lowProteinDays >= 3 ||
    report.metrics.lowFibreDays >= 3
  ) {
    return makeResolution({
      primaryAction: "Improve nutrition quality",
      supportingAction: "Hit protein and fibre targets while keeping calories stable.",
      avoidAction: "Avoid solving diet discomfort by cutting calories further.",
      rationale:
        "Protein and fibre issues can worsen hunger, adherence and recovery.",
      priority: "Nutrition quality",
      confidence: confidence.recommendation.label
    });
  }

  if (
    diagnostics.efficiency >= 85 &&
    dietFatigue.fatigueScore < 50 &&
    transition.direction !== "worsening"
  ) {
    return makeResolution({
      primaryAction: "Continue the current plan",
      supportingAction: "Keep calories, steps and protein consistent.",
      avoidAction: "Avoid unnecessary changes while the system is responding.",
      rationale:
        "Efficiency is strong and fatigue pressure is manageable.",
      priority: "Consistency",
      confidence: confidence.recommendation.label
    });
  }

  return makeResolution({
    primaryAction: "Run the weekly experiment",
    supportingAction: experiment.title,
    avoidAction: "Avoid making multiple changes at once.",
    rationale:
      "The signal is mixed, so the cleanest next step is a controlled experiment.",
    priority: "Controlled learning",
    confidence: confidence.recommendation.label
  });
}