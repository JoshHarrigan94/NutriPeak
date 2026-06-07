import {
  getMealEntriesByDate,
  getMealEntriesByRange
} from "../meals/mealLogStore.js";

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