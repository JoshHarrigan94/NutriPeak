function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function calculateProjection(metrics, state) {
  const currentRate =
    metrics.trendLossPerWeek > 0
      ? metrics.trendLossPerWeek
      : metrics.longTrendLossPerWeek > 0
        ? metrics.longTrendLossPerWeek
        : 0;

  const targetRate = state.user.targetRateKgPerWeek;
  const remainingKg = metrics.remainingLoss;

  if (!remainingKg || remainingKg <= 0) {
    return {
      status: "complete",
      label: "Goal reached",
      projectedDate: "Now",
      weeksRemaining: 0,
      currentRate,
      targetRate,
      summary: "You are at or below your current goal weight."
    };
  }

  if (!currentRate || currentRate <= 0) {
    return {
      status: "unknown",
      label: "Projection unavailable",
      projectedDate: "Need trend",
      weeksRemaining: null,
      currentRate,
      targetRate,
      summary:
        "The engine needs a positive trend-loss signal before it can project your goal date."
    };
  }

  const weeksRemaining = remainingKg / currentRate;
  const projectedDate = addDays(new Date(), weeksRemaining * 7);

  let status = "on-track";
  let label = "On track";

  if (currentRate < targetRate * 0.65) {
    status = "slow";
    label = "Behind pace";
  } else if (currentRate > targetRate * 1.35) {
    status = "fast";
    label = "Aggressive pace";
  }

  return {
    status,
    label,
    projectedDate: formatDate(projectedDate),
    weeksRemaining,
    currentRate,
    targetRate,
    summary:
      `At your current trend, you are losing about ${currentRate.toFixed(2)}kg/week against a target of ${targetRate.toFixed(2)}kg/week.`
  };
}