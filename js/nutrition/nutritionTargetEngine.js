import { getDailyNutrition } from "./dailyNutritionEngine.js";

function round(value, dp = 1) {
  return Number.isFinite(value)
    ? Number(value.toFixed(dp))
    : 0;
}

function clamp(value, min = 0, max = 999999) {
  return Math.max(min, Math.min(max, value));
}

function calculateRemaining(target, consumed) {
  return round(target - consumed);
}

function calculateProgress(consumed, target) {
  if (!target) return 0;
  return round((consumed / target) * 100);
}

function getStatus(consumed, target, tolerance = 0.05) {
  if (!target) return "unknown";

  const lower = target * (1 - tolerance);
  const upper = target * (1 + tolerance);

  if (consumed < lower) return "under";
  if (consumed > upper) return "over";
  return "on-target";
}

export function calculateMacroTargets({
  calorieTarget,
  bodyWeightKg = 100,
  proteinPerKg = 1.8,
  fatPercent = 0.25,
  fibreTarget = 30
}) {
  const protein = bodyWeightKg * proteinPerKg;
  const proteinCalories = protein * 4;

  const fatCalories = calorieTarget * fatPercent;
  const fat = fatCalories / 9;

  const remainingCalories =
    calorieTarget - proteinCalories - fatCalories;

  const carbs = Math.max(0, remainingCalories / 4);

  return {
    calories: round(calorieTarget),
    protein: round(protein),
    carbs: round(carbs),
    fat: round(fat),
    fibre: round(fibreTarget)
  };
}

export function buildNutritionBudget({
  date,
  calorieTarget,
  bodyWeightKg,
  proteinPerKg = 1.8,
  fatPercent = 0.25,
  fibreTarget = 30
}) {
  const daily = getDailyNutrition(date);

  const targets = calculateMacroTargets({
    calorieTarget,
    bodyWeightKg,
    proteinPerKg,
    fatPercent,
    fibreTarget
  });

  const consumed = daily.totals;

  const remaining = {
    calories: calculateRemaining(targets.calories, consumed.calories),
    protein: calculateRemaining(targets.protein, consumed.protein),
    carbs: calculateRemaining(targets.carbs, consumed.carbs),
    fat: calculateRemaining(targets.fat, consumed.fat),
    fibre: calculateRemaining(targets.fibre, consumed.fibre)
  };

  const progress = {
    calories: calculateProgress(consumed.calories, targets.calories),
    protein: calculateProgress(consumed.protein, targets.protein),
    carbs: calculateProgress(consumed.carbs, targets.carbs),
    fat: calculateProgress(consumed.fat, targets.fat),
    fibre: calculateProgress(consumed.fibre, targets.fibre)
  };

  return {
    date,
    entryCount: daily.entryCount,
    targets,
    consumed,
    remaining,
    progress,
    status: {
      calories: getStatus(consumed.calories, targets.calories),
      protein: getStatus(consumed.protein, targets.protein, 0.1),
      carbs: getStatus(consumed.carbs, targets.carbs, 0.15),
      fat: getStatus(consumed.fat, targets.fat, 0.15),
      fibre:
        consumed.fibre >= targets.fibre
          ? "hit"
          : "under"
    }
  };
}

export function buildBudgetFromUser({
  state,
  date = new Date().toISOString().slice(0, 10),
  calorieTarget
}) {
  const latestWeight =
    [...(state.entries || [])]
      .reverse()
      .find(entry => entry.weightKg > 0)
      ?.weightKg ||
    state.user.startWeightKg ||
    100;

  const target =
    calorieTarget ||
    state.user.currentCalorieTarget ||
    Math.max(
      state.user.minimumCalories || 1800,
      state.user.estimatedTdee - 500
    );

  return buildNutritionBudget({
    date,
    calorieTarget: target,
    bodyWeightKg: latestWeight,
    proteinPerKg: state.user.proteinPerKg || 1.8,
    fatPercent: state.user.fatPercent || 0.25,
    fibreTarget: state.user.fibreTarget || 30
  });
}