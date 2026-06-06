function average(values) {
  const clean = values.filter(value =>
    Number.isFinite(value) && value > 0
  );

  if (!clean.length) return 0;

  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function getWeightEntries(entries) {
  return entries.filter(entry => entry.weightKg > 0);
}

function calculateSlope(entries) {
  const weightEntries = getWeightEntries(entries);

  if (weightEntries.length < 2) return 0;

  const first = weightEntries[0];
  const last = weightEntries[weightEntries.length - 1];

  const dayDiff =
    (new Date(last.date) - new Date(first.date)) /
    (1000 * 60 * 60 * 24);

  if (dayDiff <= 0) return 0;

  return ((first.weightKg - last.weightKg) / dayDiff) * 7;
}

export function calculateMetrics(state) {
  const entries = [...state.entries].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const last7 = entries.slice(-7);
  const last14 = entries.slice(-14);
  const previous7 = entries.slice(-14, -7);
  const last28 = entries.slice(-28);

  const avgCalories = average(last7.map(entry => entry.calories));
  const avgSteps = average(last7.map(entry => entry.steps));
  const avgAdherence = average(last7.map(entry => entry.adherence));

  const previousAvgWeight = average(previous7.map(entry => entry.weightKg));
  const recentAvgWeight = average(last7.map(entry => entry.weightKg));

  const firstWeight =
    getWeightEntries(entries)[0]?.weightKg ||
    state.user.startWeightKg;

  const latestWeight =
    [...entries].reverse().find(entry => entry.weightKg > 0)?.weightKg ||
    firstWeight;

  const sevenDayLoss =
    previousAvgWeight && recentAvgWeight
      ? previousAvgWeight - recentAvgWeight
      : 0;

  const trendLossPerWeek =
    calculateSlope(last14.length >= 10 ? last14 : entries);

  const longTrendLossPerWeek = calculateSlope(last28);

  const estimatedDeficit = Math.max(
    0,
    state.user.estimatedTdee - avgCalories
  );

  const expectedLossKg =
    estimatedDeficit > 0
      ? (estimatedDeficit * 7) / 7700
      : state.user.targetRateKgPerWeek;

  const totalLoss = firstWeight - latestWeight;
  const remainingLoss = Math.max(0, latestWeight - state.user.goalWeightKg);

  const daysLogged = new Set(entries.map(entry => entry.date)).size;

  const lowCalorieDays = last7.filter(entry =>
    entry.calories > 0 &&
    entry.calories < state.user.minimumCalories
  ).length;

  const highStepDays = last7.filter(entry =>
    entry.steps >= state.user.highStepThreshold
  ).length;

  const weeklyCalorieDeficit = Math.max(
    0,
    sum(last7.map(entry => state.user.estimatedTdee - entry.calories))
  );

  return {
    entryCount: entries.length,
    daysLogged,
    avgCalories,
    avgSteps,
    avgAdherence,
    firstWeight,
    latestWeight,
    recentAvgWeight,
    previousAvgWeight,
    sevenDayLoss,
    trendLossPerWeek,
    longTrendLossPerWeek,
    expectedLossKg,
    estimatedDeficit,
    weeklyCalorieDeficit,
    totalLoss,
    remainingLoss,
    lowCalorieDays,
    highStepDays
  };
}