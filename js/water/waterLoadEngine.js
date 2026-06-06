function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function average(values) {
  const clean = values.filter(value =>
    Number.isFinite(value) && value > 0
  );

  if (!clean.length) return 0;

  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function latestValid(entries, key) {
  return [...entries]
    .reverse()
    .find(entry => Number(entry[key]) > 0)?.[key] || 0;
}

export function estimateWaterLoad(metrics, entries) {
  const sorted = [...entries].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const last7 = sorted.slice(-7);
  const previous7 = sorted.slice(-14, -7);

  const latestWeight = latestValid(sorted, "weightKg") || metrics.latestWeight;

  const recentAvgWeight = average(last7.map(entry => entry.weightKg));
  const previousAvgWeight = average(previous7.map(entry => entry.weightKg));

  const recentCarbs = average(last7.map(entry => entry.carbs));
  const previousCarbs = average(previous7.map(entry => entry.carbs));

  const recentSodium = average(last7.map(entry => entry.sodium));
  const previousSodium = average(previous7.map(entry => entry.sodium));

  const recentStress = average(last7.map(entry => entry.stress));
  const recentSoreness = average(last7.map(entry => entry.soreness));
  const recentSleep = average(last7.map(entry => entry.sleepHours));

  const scaleAboveTrend =
    latestWeight && recentAvgWeight
      ? latestWeight - recentAvgWeight
      : 0;

  const carbDelta =
    recentCarbs && previousCarbs
      ? recentCarbs - previousCarbs
      : 0;

  const sodiumDelta =
    recentSodium && previousSodium
      ? recentSodium - previousSodium
      : 0;

  const carbWaterKg = clamp(carbDelta / 220, -0.4, 0.8);
  const sodiumWaterKg = clamp(sodiumDelta / 1800, -0.3, 0.7);

  const sorenessWaterKg =
    recentSoreness >= 7 ? 0.45 :
    recentSoreness >= 5.5 ? 0.25 :
    0;

  const stressWaterKg =
    recentStress >= 7 ? 0.35 :
    recentStress >= 5.5 ? 0.18 :
    0;

  const sleepWaterKg =
    recentSleep > 0 && recentSleep < 6.2 ? 0.25 :
    recentSleep > 0 && recentSleep < 6.8 ? 0.12 :
    0;

  const trendDeviationWaterKg = clamp(scaleAboveTrend, -0.4, 1.2);

  const estimatedWaterLoadKg = clamp(
    carbWaterKg +
    sodiumWaterKg +
    sorenessWaterKg +
    stressWaterKg +
    sleepWaterKg +
    Math.max(0, trendDeviationWaterKg),
    0,
    2.5
  );

  const predictedDryWeight =
    latestWeight
      ? latestWeight - estimatedWaterLoadKg
      : 0;

  let label = "Low water load";
  if (estimatedWaterLoadKg >= 1.2) label = "High water load";
  else if (estimatedWaterLoadKg >= 0.6) label = "Moderate water load";

  const evidence = [];

  if (carbWaterKg > 0.15) {
    evidence.push("Recent carbohydrate intake is higher than the previous window.");
  }

  if (sodiumWaterKg > 0.15) {
    evidence.push("Recent sodium intake is higher than the previous window.");
  }

  if (sorenessWaterKg > 0) {
    evidence.push("Soreness is elevated, which may increase inflammation-related water retention.");
  }

  if (stressWaterKg > 0) {
    evidence.push("Stress is elevated, which may increase transient scale weight.");
  }

  if (sleepWaterKg > 0) {
    evidence.push("Sleep is low, which can worsen water retention and scale noise.");
  }

  if (scaleAboveTrend > 0.3) {
    evidence.push("Latest weight is sitting above recent average trend.");
  }

  if (!evidence.length) {
    evidence.push("No strong water-load driver detected.");
  }

  return {
    label,
    estimatedWaterLoadKg,
    predictedDryWeight,
    latestWeight,
    scaleAboveTrend,
    contributors: {
      carbWaterKg,
      sodiumWaterKg,
      sorenessWaterKg,
      stressWaterKg,
      sleepWaterKg,
      trendDeviationWaterKg
    },
    evidence,
    summary:
      latestWeight
        ? `Current scale weight is ${latestWeight.toFixed(1)}kg. Estimated transient water load is ${estimatedWaterLoadKg.toFixed(1)}kg, giving a predicted dry weight of ${predictedDryWeight.toFixed(1)}kg.`
        : "Not enough weigh-in data to estimate dry weight."
  };
}