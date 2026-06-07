import { calculateNutritionForServing } from "../nutrition/servingEngine.js";

export const MEAL_TYPE = {
  BREAKFAST: "breakfast",
  LUNCH: "lunch",
  DINNER: "dinner",
  SNACK: "snack"
};

export const MEAL_TYPES = [
  MEAL_TYPE.BREAKFAST,
  MEAL_TYPE.LUNCH,
  MEAL_TYPE.DINNER,
  MEAL_TYPE.SNACK
];

export function normaliseMealType(mealType = MEAL_TYPE.SNACK) {
  const clean = String(mealType || "").toLowerCase();

  return MEAL_TYPES.includes(clean)
    ? clean
    : MEAL_TYPE.SNACK;
}

export function createMealEntry({
  id,
  date,
  mealType = MEAL_TYPE.SNACK,
  food,
  amount,
  unit = "g",
  notes = ""
}) {
  if (!food) {
    throw new Error("Cannot create meal entry without a food.");
  }

  const nutrition = calculateNutritionForServing(food, amount, unit);

  return {
    id: id || crypto.randomUUID(),
    date: date || new Date().toISOString().slice(0, 10),
    mealType: normaliseMealType(mealType),

    foodId: food.id,
    foodName: food.name,
    brand: food.brand || "",
    source: food.source || "",
    barcode: food.barcode || "",

    amount: nutrition.amount,
    unit: nutrition.unit,
    grams: nutrition.grams,

    nutrition,

    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function updateMealEntryServing(entry, food, amount, unit = "g") {
  const nutrition = calculateNutritionForServing(food, amount, unit);

  return {
    ...entry,
    amount: nutrition.amount,
    unit: nutrition.unit,
    grams: nutrition.grams,
    nutrition,
    updatedAt: new Date().toISOString()
  };
}