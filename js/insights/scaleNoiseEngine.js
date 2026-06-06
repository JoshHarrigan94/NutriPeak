function average(values) {
  const clean = values.filter(value =>
    Number.isFinite(value) && value > 0
  );

  if (!clean.length) return 0;

  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function standardDeviation(values) {
  const clean = values.filter(value =>
    Number.isFinite(value) && value > 0
  );

  if (clean.length < 2) return 0;

  const mean = average(clean);

  const variance =
    clean.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    clean.length;

  return Math.sqrt(variance);
}

export function analyseScaleNoise(metrics, entries) {
  const sorted = [...entries].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const last7 = sorted.slice(-7);
  const weights = last7.map(entry => entry.weightKg);
  const noise = standardDeviation(weights);

  const latest = [...sorted]
    .reverse()
    .find(entry => entry.weightKg > 0);

  const previous = [...sorted]
    .reverse()
    .filter(entry => entry.weightKg > 0)[1];

  const dailyChange =
    latest && previous
      ? latest.weightKg - previous.weightKg
      : 0;

  const isNoisy =
    noise >= 0.45 ||
    Math.abs(dailyChange) >= 0.6 ||
    metrics.highSodiumDays >= 2 ||
    metrics.highSorenessDays >= 2 ||
    metrics.lowSleepDays >= 3;

  let label = "Stable signal";
  let summary =
    "Scale movement is relatively calm, so trend changes are easier to interpret.";

  if (isNoisy) {
    label = "Noisy signal";
    summary =
      "Single weigh-ins may be misleading right now. Use the trend line before changing calories.";
  }

  const drivers = [];

  if (noise >= 0.45) {
    drivers.push({
      label: "Weight volatility",
      value: `${noise.toFixed(2)}kg`
    });
  }

  if (Math.abs(dailyChange) >= 0.6) {
    drivers.push({
      label: "Latest daily swing",
      value: `${dailyChange > 0 ? "+" : ""}${dailyChange.toFixed(2)}kg`
    });
  }

  if (metrics.highSodiumDays >= 2) {
    drivers.push({
      label: "High sodium days",
      value: metrics.highSodiumDays
    });
  }

  if (metrics.highSorenessDays >= 2) {
    drivers.push({
      label: "High soreness days",
      value: metrics.highSorenessDays
    });
  }

  if (metrics.lowSleepDays >= 3) {
    drivers.push({
      label: "Low sleep days",
      value: metrics.lowSleepDays
    });
  }

  if (!drivers.length) {
    drivers.push({
      label: "No major noise driver",
      value: "Clear"
    });
  }

  return {
    label,
    summary,
    noise,
    dailyChange,
    isNoisy,
    drivers
  };
}