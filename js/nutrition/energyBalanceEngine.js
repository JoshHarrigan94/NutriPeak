import { getDailyNutrition, getAverageNutrition } from "./dailyNutritionEngine.js";

function round(value, dp = 1) {
  return Number.isFinite(value)
    ? Number(value.toFixed(dp))
    : 0;
}

function clamp(value, min = 0, max = 999999) {
  return Math.max(min, Math.min(max, value));
}

function getDateDaysAgo(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function estimateStepAdjustment(steps = 0, baselineSteps = 8000) {
  const difference = Number(steps || 0) - baselineSteps;

  // Rough practical estimate: 35-50 kcal per 1000 steps.
  // Use conservative value to avoid over-crediting activity.
  return (difference / 1000) * 40;
}

export function estimateDailyExpenditure({
  state,
  date = new Date().toISOString().slice(0, 10),
  metrics = null,
  steps = null
}) {
  const dayEntry = (state.entries || []).find(entry => entry.date === date);

  const loggedSteps =
    steps ??
    dayEntry?.steps ??
    0;

  const baseTdee =
    metrics?.effectiveTdee ||
    metrics?.adaptiveMaintenance?.estimatedMaintenance ||
    state.user.estimatedTdee ||
    0;

  const baselineSteps =
    state.user.baselineSteps ||
    8000;

  const stepAdjustment = estimateStepAdjustment(
    loggedSteps,
    baselineSteps
  );

  const expenditure = clamp(baseTdee + stepAdjustment, 0);

  return {
    date,
    baseTdee: round(baseTdee),
    steps: loggedSteps,
    baselineSteps,
    stepAdjustment: round(stepAdjustment),
    estimatedExpenditure: round(expenditure)
  };
}

export function calculateDailyEnergyBalance({
  state,
  date = new Date().toISOString().slice(0, 10),
  metrics = null
}) {
  const intake = getDailyNutrition(date);
  const expenditure = estimateDailyExpenditure({
    state,
    date,
    metrics
  });

  const caloriesIn = intake.totals.calories;
  const caloriesOut = expenditure.estimatedExpenditure;

  const balance = caloriesIn - caloriesOut;

  return {
    date,
    intake,
    expenditure,
    caloriesIn: round(caloriesIn),
    caloriesOut: round(caloriesOut),
    balance: round(balance),
    deficit: round(Math.max(0, -balance)),
    surplus: round(Math.max(0, balance)),
    status:
      balance < -150
        ? "deficit"
        : balance > 150
          ? "surplus"
          : "maintenance"
  };
}

export function calculateAverageEnergyBalance({
  state,
  days = 7,
  metrics = null
}) {
  const endDate = getDateDaysAgo(0);
  const startDate = getDateDaysAgo(days - 1);

  const avgNutrition = getAverageNutrition(startDate, endDate);

  const recentEntries = (state.entries || [])
    .filter(entry =>
      entry.date >= startDate &&
      entry.date <= endDate
    );

  const avgSteps =
    recentEntries.length
      ? recentEntries.reduce((sum, entry) => sum + Number(entry.steps || 0), 0) /
        recentEntries.length
      : 0;

  const baseTdee =
    metrics?.effectiveTdee ||
    metrics?.adaptiveMaintenance?.estimatedMaintenance ||
    state.user.estimatedTdee ||
    0;

  const baselineSteps =
    state.user.baselineSteps ||
    8000;

  const stepAdjustment = estimateStepAdjustment(avgSteps, baselineSteps);
  const estimatedExpenditure = clamp(baseTdee + stepAdjustment, 0);

  const caloriesIn = avgNutrition.calories;
  const caloriesOut = estimatedExpenditure;
  const balance = caloriesIn - caloriesOut;

  return {
    startDate,
    endDate,
    days,
    avgNutrition,
    avgSteps: round(avgSteps),
    baseTdee: round(baseTdee),
    baselineSteps,
    stepAdjustment: round(stepAdjustment),
    caloriesIn: round(caloriesIn),
    caloriesOut: round(caloriesOut),
    balance: round(balance),
    deficit: round(Math.max(0, -balance)),
    surplus: round(Math.max(0, balance)),
    status:
      balance < -150
        ? "deficit"
        : balance > 150
          ? "surplus"
          : "maintenance"
  };
}

export function estimateExpectedWeightChangeFromBalance(balance, days = 7) {
  const totalBalance = Number(balance || 0) * days;

  // Approximate: 7700 kcal per kg bodyweight change.
  return round(totalBalance / 7700, 2);
}