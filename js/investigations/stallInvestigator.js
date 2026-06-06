function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function addEvidence(condition, list, text) {
  if (condition) list.push(text);
}

function createCause({ id, title, score, summary, evidence }) {
  return {
    id,
    title,
    score: clamp(score),
    summary,
    evidence
  };
}

export function investigateStall(metrics, diagnostics) {
  const isLowOutput = diagnostics.efficiency < 70;
  const isVeryLowOutput = diagnostics.efficiency < 45;

  const adaptationEvidence = [];

  addEvidence(
    metrics.avgCalories < 2600,
    adaptationEvidence,
    "Average calories are relatively low."
  );

  addEvidence(
    metrics.avgSteps > 10000,
    adaptationEvidence,
    "Average steps are high enough to increase total stress load."
  );

  addEvidence(
    metrics.lowCalorieDays >= 4,
    adaptationEvidence,
    "There are multiple low-calorie days in the recent window."
  );

  addEvidence(
    metrics.lowSleepDays >= 3,
    adaptationEvidence,
    "Sleep is repeatedly low, which can worsen hunger, recovery and water retention."
  );

  addEvidence(
    metrics.highStressDays >= 3,
    adaptationEvidence,
    "Stress is repeatedly high, increasing the chance of poor recovery and masking."
  );

  addEvidence(
    isLowOutput,
    adaptationEvidence,
    "Actual trend loss is below expected loss."
  );

  const adaptationScore =
    (isVeryLowOutput ? 34 : isLowOutput ? 22 : 4) +
    metrics.lowCalorieDays * 8 +
    metrics.highStepDays * 6 +
    metrics.lowSleepDays * 5 +
    metrics.highStressDays * 5 +
    (metrics.daysLogged >= 21 ? 10 : 0);

  const retentionEvidence = [];

  addEvidence(
    isLowOutput,
    retentionEvidence,
    "Scale movement is weaker than expected."
  );

  addEvidence(
    metrics.highStepDays >= 4,
    retentionEvidence,
    "High activity days may increase soreness, inflammation or water retention."
  );

  addEvidence(
    metrics.highSorenessDays >= 2,
    retentionEvidence,
    "Soreness is high enough to suggest inflammation-related water holding."
  );

  addEvidence(
    metrics.highSodiumDays >= 2,
    retentionEvidence,
    "Sodium is high enough on multiple days to increase short-term scale noise."
  );

  addEvidence(
    metrics.avgCarbs > 300,
    retentionEvidence,
    "Carbohydrate intake is high enough to create glycogen-linked water fluctuation."
  );

  addEvidence(
    metrics.lowCalorieDays >= 4,
    retentionEvidence,
    "Low intake can increase stress pressure and transient water holding."
  );

  addEvidence(
    diagnostics.fatigueRisk < 65,
    retentionEvidence,
    "Fatigue is not high enough to clearly confirm a true crash."
  );

  const retentionScore =
    (isLowOutput ? 30 : 8) +
    (metrics.highStepDays >= 4 ? 18 : 0) +
    (metrics.highSorenessDays >= 2 ? 14 : 0) +
    (metrics.highSodiumDays >= 2 ? 12 : 0) +
    (metrics.avgCarbs > 300 ? 8 : 0) +
    (metrics.lowCalorieDays >= 4 ? 12 : 0) +
    (diagnostics.fatigueRisk < 65 ? 10 : 0);

  const adherenceEvidence = [];

  addEvidence(
    metrics.avgAdherence < 90,
    adherenceEvidence,
    "Recorded adherence is below 90%."
  );

  addEvidence(
    metrics.avgAdherence < 80,
    adherenceEvidence,
    "Adherence is low enough to materially explain the gap."
  );

  addEvidence(
    metrics.lowProteinDays >= 3,
    adherenceEvidence,
    "Protein is below target on multiple days, which can make the diet harder to sustain."
  );

  addEvidence(
    metrics.lowFibreDays >= 3,
    adherenceEvidence,
    "Fibre is low on multiple days, which may reduce fullness and diet quality."
  );

  addEvidence(
    isLowOutput,
    adherenceEvidence,
    "Expected and actual progress are not aligned."
  );

  const adherenceScore =
    (100 - metrics.avgAdherence) +
    (metrics.avgAdherence < 90 && isLowOutput ? 20 : 0) +
    (metrics.avgAdherence < 80 ? 18 : 0) +
    (metrics.lowProteinDays >= 3 ? 10 : 0) +
    (metrics.lowFibreDays >= 3 ? 8 : 0);

  const nutrientEvidence = [];

  addEvidence(
    metrics.lowProteinDays >= 3,
    nutrientEvidence,
    `Protein is below target on ${metrics.lowProteinDays} recent days.`
  );

  addEvidence(
    metrics.lowFibreDays >= 3,
    nutrientEvidence,
    `Fibre is below 20g on ${metrics.lowFibreDays} recent days.`
  );

  addEvidence(
    metrics.avgFat < 45 && metrics.avgFat > 0,
    nutrientEvidence,
    "Average fat intake is very low, which may affect satiety and diet comfort."
  );

  addEvidence(
    metrics.avgCarbs < 120 && metrics.avgCarbs > 0,
    nutrientEvidence,
    "Average carbohydrate intake is very low, which may affect training output."
  );

  const nutrientScore =
    (metrics.lowProteinDays >= 3 ? 28 : 0) +
    (metrics.lowFibreDays >= 3 ? 22 : 0) +
    (metrics.avgFat < 45 && metrics.avgFat > 0 ? 18 : 0) +
    (metrics.avgCarbs < 120 && metrics.avgCarbs > 0 ? 16 : 0);

  const dataEvidence = [];

  addEvidence(
    metrics.daysLogged < 7,
    dataEvidence,
    "Fewer than 7 days have been logged."
  );

  addEvidence(
    metrics.daysLogged < 14,
    dataEvidence,
    "A stronger trend normally needs 14 days of data."
  );

  addEvidence(
    metrics.recentAvgWeight === 0,
    dataEvidence,
    "Recent average weight is missing."
  );

  const dataScore =
    (metrics.daysLogged < 7 ? 75 : 0) +
    (metrics.daysLogged >= 7 && metrics.daysLogged < 14 ? 38 : 0) +
    (metrics.recentAvgWeight === 0 ? 40 : 0);

  const causes = [
    createCause({
      id: "adaptation",
      title: "Adaptation Pressure",
      score: adaptationScore,
      summary:
        "The plan may be creating enough stress that output is becoming less efficient.",
      evidence: adaptationEvidence
    }),
    createCause({
      id: "retention",
      title: "Water / Masking",
      score: retentionScore,
      summary:
        "Fat loss may be happening, but water, glycogen, stress or soreness may be hiding it.",
      evidence: retentionEvidence
    }),
    createCause({
      id: "adherence",
      title: "Adherence Drift",
      score: adherenceScore,
      summary:
        "The plan may be sound, but execution quality may explain the gap.",
      evidence: adherenceEvidence
    }),
    createCause({
      id: "nutrients",
      title: "Nutrient Quality",
      score: nutrientScore,
      summary:
        "Macro and nutrient quality may be making the deficit harder to sustain or recover from.",
      evidence: nutrientEvidence
    }),
    createCause({
      id: "data",
      title: "Insufficient Signal",
      score: dataScore,
      summary:
        "The system may not yet have enough reliable data to diagnose the pattern.",
      evidence: dataEvidence
    })
  ].sort((a, b) => b.score - a.score);

  const primary = causes[0];

  return {
    primary,
    causes
  };
}