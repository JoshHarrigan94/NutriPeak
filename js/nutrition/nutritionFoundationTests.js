import { SEED_FOODS } from "./seedFoods.js";
import { calculateNutritionForServing } from "./servingEngine.js";
import { searchFoods, getFoodById } from "./foodRepository.js";
import { addMealEntry, getMealEntriesByDate, clearMealEntriesForDate } from "../meal/mealLogStore.js";
import { getDailyNutrition } from "./dailyNutritionEngine.js";
import { buildNutritionBudget } from "./nutritionTargetEngine.js";
import { calculateDailyEnergyBalance } from "./energyBalanceEngine.js";
import { buildCoachingEntryFromNutrition } from "./nutritionCoachingBridge.js";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function assert(condition, label) {
  return {
    label,
    pass: Boolean(condition)
  };
}

export function runNutritionFoundationTests() {
  const date = today();

  clearMealEntriesForDate(date);

  const chicken =
    getFoodById("seed-chicken-breast-raw") ||
    SEED_FOODS.find(food => food.id === "seed-chicken-breast-raw");

  const rice =
    getFoodById("seed-rice-white-cooked") ||
    SEED_FOODS.find(food => food.id === "seed-rice-white-cooked");

  const chickenServing = calculateNutritionForServing(chicken, 200, "g");

  addMealEntry({
    date,
    mealType: "lunch",
    food: chicken,
    amount: 200,
    unit: "g"
  });

  addMealEntry({
    date,
    mealType: "lunch",
    food: rice,
    amount: 250,
    unit: "g"
  });

  const entries = getMealEntriesByDate(date);
  const daily = getDailyNutrition(date);

  const budget = buildNutritionBudget({
    date,
    calorieTarget: 2500,
    bodyWeightKg: 100
  });

  const mockState = {
    user: {
      estimatedTdee: 3300,
      startWeightKg: 100,
      minimumCalories: 2200
    },
    entries: [
      {
        date,
        weightKg: 100,
        steps: 10000,
        adherence: 100
      }
    ]
  };

  const balance = calculateDailyEnergyBalance({
    state: mockState,
    date
  });

  const coachingEntry = buildCoachingEntryFromNutrition({
    state: mockState,
    date
  });

  const results = [
    assert(SEED_FOODS.length >= 5, "Seed foods exist"),
    assert(searchFoods("chicken").length > 0, "Food search finds chicken"),
    assert(chickenServing.protein > 40, "Serving engine calculates protein"),
    assert(entries.length === 2, "Meal log stores entries"),
    assert(daily.totals.calories > 500, "Daily nutrition totals calories"),
    assert(daily.totals.protein > 40, "Daily nutrition totals protein"),
    assert(budget.targets.calories === 2500, "Nutrition budget sets calorie target"),
    assert(budget.remaining.calories < 2500, "Nutrition budget calculates remaining calories"),
    assert(balance.caloriesOut > 0, "Energy balance estimates expenditure"),
    assert(coachingEntry.calories > 0, "Bridge creates coaching calories"),
    assert(coachingEntry.weightKg === 100, "Bridge preserves manual weight")
  ];

  clearMealEntriesForDate(date);

  return {
    passed: results.filter(result => result.pass).length,
    total: results.length,
    score: Math.round(
      (results.filter(result => result.pass).length / results.length) * 100
    ),
    results
  };
}