function average(values) {
  const clean = values.filter(value =>
    Number.isFinite(value) && value > 0
  );

  if (!clean.length) return 0;

  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function recent(entries, days = 7) {
  return [...entries].slice(-days);
}

export function calculateMetrics(state) {
  const entries = [...state.entries].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const last7 = recent(entries, 7);
  const previous7 = entries.slice(-14, -7);

  const avgCalories = average(last7.map(entry => entry.calories));
  const avgSteps = average(last7.map(entry => entry.steps));
  const avgAdherence = average(last7.map(entry => entry.adherence));

  const startWeight =
    entries.find(entry => entry.weightKg > 0)?.weightKg ||
    state.user.startWeightKg;

  const latestWeight =
    [...entries].reverse().find(entry => entry.weightKg > 0)?.weightKg ||
    startWeight;

  const previousAvgWeight = average(previous7.map(entry => entry.weightKg));
  const recentAvgWeight = average(last7.map(entry => entry.weightKg));

  const actualLossKg =
    previousAvgWeight && recentAvgWeight
      ? previousAvgWeight - recentAvgWeight
      : startWeight - latestWeight;

  const estimatedDeficit = Math.max(
    0,
    state.user.estimatedTdee - avgCalories
  );

  const expectedLossKg = estimatedDeficit
    ? (estimatedDeficit * 7) / 7700
    : state.user.targetRateKgPerWeek;

  return {
    entryCount: entries.length,
    avgCalories,
    avgSteps,
    avgAdherence,
    startWeight,
    latestWeight,
    recentAvgWeight,
    previousAvgWeight,
    actualLossKg,
    expectedLossKg,
    estimatedDeficit
  };
} 