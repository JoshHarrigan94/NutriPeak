const UNIT_TO_GRAMS = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  ml: 1,
  l: 1000
};

function round(value, dp = 1) {
  return Number.isFinite(value) ? Number(value.toFixed(dp)) : 0;
}

export function normaliseServingAmount(amount, unit = "g") {
  const cleanAmount = Number(amount || 0);
  const cleanUnit = String(unit || "g").toLowerCase();

  const multiplier = UNIT_TO_GRAMS[cleanUnit] || 1;

  return {
    grams: cleanAmount * multiplier,
    originalAmount: cleanAmount,
    originalUnit: unit
  };
}

export function calculateNutritionForServing(food, amount, unit = "g") {
  const serving = normaliseServingAmount(amount, unit);
  const factor = serving.grams / 100;

  const n = food.nutritionPer100g || {};

  return {
    foodId: food.id,
    foodName: food.name,
    brand: food.brand || "",
    amount: serving.originalAmount,
    unit: serving.originalUnit,
    grams: round(serving.grams, 1),

    calories: round(Number(n.calories || 0) * factor),
    protein: round(Number(n.protein || 0) * factor),
    carbs: round(Number(n.carbs || 0) * factor),
    fat: round(Number(n.fat || 0) * factor),
    fibre: round(Number(n.fibre || 0) * factor),
    sugar: round(Number(n.sugar || 0) * factor),
    saturatedFat: round(Number(n.saturatedFat || 0) * factor),
    salt: round(Number(n.salt || 0) * factor),
    sodium: round(Number(n.sodium || 0) * factor)
  };
}

export function scaleFoodToCalories(food, targetCalories) {
  const caloriesPer100g = Number(food.nutritionPer100g?.calories || 0);

  if (!caloriesPer100g || !targetCalories) {
    return null;
  }

  const grams = (Number(targetCalories) / caloriesPer100g) * 100;

  return calculateNutritionForServing(food, grams, "g");
}