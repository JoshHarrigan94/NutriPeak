function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function average(values) {
  const clean = values.filter(value => Number.isFinite(value));
  if (!clean.length) return 0;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function evidence(condition, text) {
  return condition ? [text] : [];
}

export function analyseStateTransition(report) {
  const {
    metrics,
    diagnostics,
    metabolicState,
    dietFatigue,
    compensation,
    reviewPattern,
    state
  } = report;

  const reviews = state.reviews || [];
  const recent = reviews.slice(0, 4);

  if (!recent.length) {
  return {
    direction: "uncertain",
    transitionLabel: "No transition history",
    riskLevel: "Low",
    score: 35,
    summary:
      "No saved reviews exist yet, so the engine can only classify the current state, not direction of travel.",
    evidence: [
      "Save weekly reviews to unlock transition analysis."
    ],
    nextBestMove:
      "Save the current review after each weekly checkpoint.",
    deltas: {
      efficiencyDelta: 0,
      fatigueDelta: 0,
      qualityDelta: 0,
      recentEfficiency: 0,
      recentFatigue: 0,
      recentQuality: 0,
      recentMasking: 0
    }
  };
}

  const recentEfficiency = average(recent.map(review => review.efficiency));
  const recentFatigue = average(recent.map(review => review.fatigueRisk));
  const recentQuality = average(recent.map(review => review.dataQuality));
  const recentMasking = average(recent.map(review => review.maskingGap || 0));

  const efficiencyDelta = diagnostics.efficiency - recentEfficiency;
  const fatigueDelta = diagnostics.fatigueRisk - recentFatigue;
  const qualityDelta = metrics.daysLogged >= 7
    ? diagnostics.efficiency - recentEfficiency
    : 0;

  const repeatedLimiter = reviewPattern.hasPattern;
  const currentStateId = metabolicState.primary.id;

  const worseningPressure = clamp(
    (efficiencyDelta <= -15 ? 24 : 0) +
    (fatigueDelta >= 15 ? 22 : 0) +
    (dietFatigue.fatigueScore >= 70 ? 18 : 0) +
    (compensation.compensationScore >= 70 ? 16 : 0) +
    (repeatedLimiter ? 14 : 0) +
    (["adapted", "fatigued", "execution_drift"].includes(currentStateId) ? 12 : 0)
  );

  const improvingPressure = clamp(
    (efficiencyDelta >= 15 ? 24 : 0) +
    (fatigueDelta <= -15 ? 20 : 0) +
    (diagnostics.efficiency >= 85 ? 18 : 0) +
    (dietFatigue.fatigueScore < 45 ? 12 : 0) +
    (compensation.compensationScore < 45 ? 10 : 0) +
    (currentStateId === "responsive" ? 16 : 0)
  );

  const uncertaintyPressure = clamp(
    (recent.length < 2 ? 25 : 0) +
    (recentQuality < 65 ? 18 : 0) +
    (metrics.daysLogged < 14 ? 14 : 0) +
    (recentMasking >= 15 ? 10 : 0)
  );

  let direction = "stable";
  let transitionLabel = "Stable pattern";
  let riskLevel = "Moderate";
  let summary =
    "The current state looks broadly similar to recent saved reviews.";

  if (uncertaintyPressure >= 45) {
    direction = "uncertain";
    transitionLabel = "Unclear transition";
    riskLevel = "Moderate";
    summary =
      "There is not enough clean history to confidently say whether the system is improving or worsening.";
  } else if (worseningPressure > improvingPressure + 10) {
    direction = "worsening";
    transitionLabel = "Worsening trend";
    riskLevel = worseningPressure >= 70 ? "High" : "Moderate";
    summary =
      "Current signals look worse than recent review history. The engine should avoid adding more pressure.";
  } else if (improvingPressure > worseningPressure + 10) {
    direction = "improving";
    transitionLabel = "Improving trend";
    riskLevel = "Low";
    summary =
      "Current signals look better than recent review history. The plan may be regaining efficiency.";
  }

  const score =
    direction === "worsening"
      ? worseningPressure
      : direction === "improving"
        ? improvingPressure
        : uncertaintyPressure;

  const evidenceList = [
    ...evidence(efficiencyDelta <= -15, `Efficiency is ${Math.abs(efficiencyDelta).toFixed(0)}% lower than recent review average.`),
    ...evidence(efficiencyDelta >= 15, `Efficiency is ${efficiencyDelta.toFixed(0)}% higher than recent review average.`),
    ...evidence(fatigueDelta >= 15, `Fatigue risk is ${fatigueDelta.toFixed(0)}% higher than recent review average.`),
    ...evidence(fatigueDelta <= -15, `Fatigue risk is ${Math.abs(fatigueDelta).toFixed(0)}% lower than recent review average.`),
    ...evidence(dietFatigue.fatigueScore >= 70, "Diet fatigue engine is showing high fatigue."),
    ...evidence(compensation.compensationScore >= 70, "Energy compensation risk is high."),
    ...evidence(repeatedLimiter, "Review memory has detected a repeated limiter."),
    ...evidence(currentStateId === "responsive", "Current state is responsive."),
    ...evidence(["adapted", "fatigued", "execution_drift"].includes(currentStateId), `Current state is ${metabolicState.primary.label}.`),
    ...evidence(recent.length < 2, "Fewer than two saved reviews limits transition confidence."),
    ...evidence(recentQuality < 65, "Recent saved reviews have low data quality."),
    ...evidence(recentMasking >= 15, "Recent reviews show meaningful masking gaps.")
  ];

  if (!evidenceList.length) {
    evidenceList.push("No strong directional driver detected.");
  }

  let nextBestMove =
    "Keep the plan stable and save another review at the next checkpoint.";

  if (direction === "worsening") {
    nextBestMove =
      "Reduce decision aggression. Prioritise recovery, adherence quality and signal clarity before adding more deficit.";
  }

  if (direction === "improving") {
    nextBestMove =
      "Continue the current strategy and avoid unnecessary changes while the system is improving.";
  }

  if (direction === "uncertain") {
    nextBestMove =
      "Improve data quality and build at least two saved review points before making strong directional decisions.";
  }

  return {
    direction,
    transitionLabel,
    riskLevel,
    score: clamp(score),
    summary,
    evidence: evidenceList,
    nextBestMove,
    deltas: {
      efficiencyDelta,
      fatigueDelta,
      qualityDelta,
      recentEfficiency,
      recentFatigue,
      recentQuality,
      recentMasking
    }
  };
}