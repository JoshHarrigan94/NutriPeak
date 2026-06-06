function average(values) {
  const clean = values.filter(value =>
    Number.isFinite(value) && value > 0
  );

  if (!clean.length) return 0;

  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundToNearest(value, step = 25) {
  return Math.round(value / step) * step;
}

function calculateWindow(entries, days) {
  const window = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-days);

  const weightEntries = window.filter(entry => entry.weightKg > 0);

  const avgCalories = average(window.map(entry => entry.calories));

  if (weightEntries.length < 2 || !avgCalories) {
    return null;
  }

  const first = weightEntries[0];
  const last = weightEntries[weightEntries.length - 1];

  const dayDiff =
    (new Date(last.date) - new Date(first.date)) /
    (1000 * 60 * 60 * 24);

  if (dayDiff <= 0) return null;

  const weightChange = last.weightKg - first.weightKg;
  const weeklyChange = (weightChange / dayDiff) * 7;

  const dailyEnergyChange = (weeklyChange * 7700) / 7;

  const observedMaintenance = avgCalories + dailyEnergyChange;

  return {
    days,
    entries: window.length,
    avgCalories,
    weeklyChange,
    observedMaintenance
  };
}

export function estimateAdaptiveMaintenance(state, metrics) {
  const windows = [28, 21, 14]
    .map(days => calculateWindow(state.entries, days))
    .filter(Boolean);

  if (!windows.length) {
    return {
      available: false,
      label: "Not enough data",
      estimatedMaintenance: state.user.estimatedTdee,
      userEstimatedTdee: state.user.estimatedTdee,
      delta: 0,
      confidence: "Low",
      windows: [],
      summary:
        "The engine needs at least two reliable weigh-ins with calorie data before it can estimate observed maintenance."
    };
  }

  const weighted = windows.reduce((acc, window) => {
    const weight =
      window.days === 28 ? 0.5 :
      window.days === 21 ? 0.3 :
      0.2;

    return {
      total: acc.total + window.observedMaintenance * weight,
      weight: acc.weight + weight
    };
  }, { total: 0, weight: 0 });

  const rawEstimate = weighted.total / weighted.weight;

  const boundedEstimate = clamp(
    rawEstimate,
    state.user.estimatedTdee * 0.65,
    state.user.estimatedTdee * 1.2
  );

  const estimatedMaintenance = roundToNearest(boundedEstimate, 25);
  const delta = estimatedMaintenance - state.user.estimatedTdee;

  let label = "Aligned";
  if (delta <= -300) label = "Lower than expected";
  else if (delta >= 300) label = "Higher than expected";

  let confidence = "Low";
  if (windows.some(window => window.days === 28) && metrics.daysLogged >= 21) {
    confidence = "Moderate";
  }
  if (windows.some(window => window.days === 28) && metrics.daysLogged >= 28) {
    confidence = "High";
  }

  return {
    available: true,
    label,
    estimatedMaintenance,
    userEstimatedTdee: state.user.estimatedTdee,
    delta,
    confidence,
    windows,
    summary:
      `Observed maintenance is estimated at ${estimatedMaintenance} kcal/day, compared with your starting estimate of ${state.user.estimatedTdee} kcal/day.`
  };
}