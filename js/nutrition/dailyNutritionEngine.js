import {
  getMealEntriesByDate,
  getMealEntriesByRange
} from "../meal/mealLogStore.js";

function round(value, dp = 1) {
  return Number.isFinite(value)
    ? Number(value.toFixed(dp))
    : 0;
}

function createTotals() {
  return {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fibre: 0,
    sugar: 0,
    saturatedFat: 0,
    salt: 0,
    sodium: 0
  };
}

function addNutrition(target, nutrition) {
  target.calories += nutrition.calories || 0;
  target.protein += nutrition.protein || 0;
  target.carbs += nutrition.carbs || 0;
  target.fat += nutrition.fat || 0;
  target.fibre += nutrition.fibre || 0;
  target.sugar += nutrition.sugar || 0;
  target.saturatedFat += nutrition.saturatedFat || 0;
  target.salt += nutrition.salt || 0;
  target.sodium += nutrition.sodium || 0;

  return target;
}

function finalise(totals) {
  return {
    calories: round(totals.calories),
    protein: round(totals.protein),
    carbs: round(totals.carbs),
    fat: round(totals.fat),
    fibre: round(totals.fibre),
    sugar: round(totals.sugar),
    saturatedFat: round(totals.saturatedFat),
    salt: round(totals.salt),
    sodium: round(totals.sodium)
  };
}

export function getDailyNutrition(date) {
  const entries = getMealEntriesByDate(date);

  const totals = entries.reduce(
    (acc, entry) =>
      addNutrition(acc, entry.nutrition),
    createTotals()
  );

  return {
    date,
    entryCount: entries.length,
    totals: finalise(totals)
  };
}

export function getMealNutrition(date) {
  const entries = getMealEntriesByDate(date);

  const meals = {
    breakfast: createTotals(),
    lunch: createTotals(),
    dinner: createTotals(),
    snack: createTotals()
  };

  entries.forEach(entry => {
    addNutrition(
      meals[entry.mealType],
      entry.nutrition
    );
  });

  return {
    breakfast: finalise(meals.breakfast),
    lunch: finalise(meals.lunch),
    dinner: finalise(meals.dinner),
    snack: finalise(meals.snack)
  };
}

export function getNutritionRange(
  startDate,
  endDate
) {
  const entries =
    getMealEntriesByRange(
      startDate,
      endDate
    );

  const totals = entries.reduce(
    (acc, entry) =>
      addNutrition(acc, entry.nutrition),
    createTotals()
  );

  return {
    startDate,
    endDate,
    entryCount: entries.length,
    totals: finalise(totals)
  };
}

export function getAverageNutrition(
  startDate,
  endDate
) {
  const range =
    getNutritionRange(
      startDate,
      endDate
    );

  const days =
    Math.max(
      1,
      Math.round(
        (
          new Date(endDate) -
          new Date(startDate)
        ) /
        86400000
      ) + 1
    );

  const t = range.totals;

  return {
    calories: round(t.calories / days),
    protein: round(t.protein / days),
    carbs: round(t.carbs / days),
    fat: round(t.fat / days),
    fibre: round(t.fibre / days),
    sugar: round(t.sugar / days),
    saturatedFat: round(t.saturatedFat / days),
    salt: round(t.salt / days),
    sodium: round(t.sodium / days)
  };
}