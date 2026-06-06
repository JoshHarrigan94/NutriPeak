function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function evidence(condition, text) {
  return condition ? [text] : [];
}

function makeState({ id, label, score, summary, evidence }) {
  return {
    id,
    label,
    score: clamp(score),
    summary,
    evidence
  };
}

export function classifyMetabolicState(metrics, diagnostics, investigation, quality, noise) {
  const states = [];

  states.push(makeState({
    id: "responsive",
    label: "Responsive",
    score:
      diagnostics.efficiency +
      (diagnostics.fatigueRisk < 45 ? 15 : 0) +
      (quality.score >= 65 ? 10 : 0) -
      (noise.isNoisy ? 12 : 0),
    summary:
      "The current deficit appears to be producing a reliable fat-loss response.",
    evidence: [
      ...evidence(diagnostics.efficiency >= 85, "Fat-loss efficiency is high."),
      ...evidence(diagnostics.fatigueRisk < 45, "Fatigue pressure is manageable."),
      ...evidence(!noise.isNoisy, "Scale signal is relatively stable.")
    ]
  }));

  states.push(makeState({
    id: "masked",
    label: "Masked Loss",
    score:
      diagnostics.retentionRisk +
      (noise.isNoisy ? 25 : 0) +
      (metrics.highSodiumDays >= 2 ? 8 : 0) +
      (metrics.highSorenessDays >= 2 ? 8 : 0),
    summary:
      "Fat loss may be occurring, but water, glycogen, stress or soreness may be hiding it.",
    evidence: [
      ...evidence(noise.isNoisy, "Scale noise is elevated."),
      ...evidence(metrics.highSodiumDays >= 2, "Sodium has been high on multiple days."),
      ...evidence(metrics.highSorenessDays >= 2, "Soreness may be increasing inflammation-related water retention."),
      ...evidence(diagnostics.retentionRisk >= 50, "Retention / masking risk is elevated.")
    ]
  }));

  states.push(makeState({
    id: "adapted",
    label: "Adapted / Suppressed",
    score:
      diagnostics.adaptationRisk +
      (diagnostics.efficiency < 55 ? 20 : 0) +
      (metrics.lowCalorieDays >= 4 ? 10 : 0) +
      (metrics.highStepDays >= 4 ? 10 : 0),
    summary:
      "The current plan may be producing less output than expected for the level of restriction and activity.",
    evidence: [
      ...evidence(diagnostics.efficiency < 55, "Output is low compared with expected loss."),
      ...evidence(metrics.lowCalorieDays >= 4, "There are repeated low-calorie days."),
      ...evidence(metrics.highStepDays >= 4, "There are repeated high-step days."),
      ...evidence(investigation.primary.id === "adaptation", "Stall investigation points toward adaptation pressure.")
    ]
  }));

  states.push(makeState({
    id: "fatigued",
    label: "Diet Fatigued",
    score:
      diagnostics.fatigueRisk +
      (metrics.lowSleepDays >= 3 ? 12 : 0) +
      (metrics.highStressDays >= 3 ? 12 : 0) +
      (metrics.avgAdherence < 85 ? 10 : 0),
    summary:
      "The deficit may be becoming psychologically or physiologically harder to sustain.",
    evidence: [
      ...evidence(diagnostics.fatigueRisk >= 55, "Diet fatigue risk is elevated."),
      ...evidence(metrics.lowSleepDays >= 3, "Sleep has been low repeatedly."),
      ...evidence(metrics.highStressDays >= 3, "Stress has been high repeatedly."),
      ...evidence(metrics.avgAdherence < 85, "Adherence is starting to drift.")
    ]
  }));

  states.push(makeState({
    id: "execution_drift",
    label: "Execution Drift",
    score:
      diagnostics.adherenceRisk +
      (metrics.avgAdherence < 90 ? 25 : 0) +
      (metrics.lowProteinDays >= 3 ? 8 : 0) +
      (metrics.lowFibreDays >= 3 ? 8 : 0),
    summary:
      "The plan may not be the main issue. Execution quality may explain the gap.",
    evidence: [
      ...evidence(metrics.avgAdherence < 90, "Recorded adherence is below 90%."),
      ...evidence(metrics.lowProteinDays >= 3, "Protein has been below target repeatedly."),
      ...evidence(metrics.lowFibreDays >= 3, "Fibre has been low repeatedly."),
      ...evidence(investigation.primary.id === "adherence", "Stall investigation points toward adherence drift.")
    ]
  }));

  states.push(makeState({
    id: "uncertain",
    label: "Uncertain Signal",
    score:
      (quality.score < 65 ? 55 : 10) +
      (metrics.daysLogged < 14 ? 25 : 0),
    summary:
      "The engine does not yet have enough clean signal to make a confident metabolic call.",
    evidence: [
      ...evidence(quality.score < 65, "Data quality is below the preferred threshold."),
      ...evidence(metrics.daysLogged < 14, "Less than 14 days of data reduces trend reliability."),
      ...evidence(metrics.recentAvgWeight === 0, "Recent average weight is missing.")
    ]
  }));

  const ranked = states.sort((a, b) => b.score - a.score);
  const primary = ranked[0];
  const secondary = ranked[1];

  const confidenceGap = primary.score - secondary.score;

  let confidence = "Low";
  if (primary.score >= 75 && confidenceGap >= 15) confidence = "High";
  else if (primary.score >= 60 && confidenceGap >= 8) confidence = "Moderate";

  return {
    primary,
    secondary,
    ranked,
    confidence,
    confidenceGap
  };
}