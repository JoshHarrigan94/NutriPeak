import { SEED_FOODS } from "./seedFoods.js";
import { isValidFood } from "./foodSchema.js";
import { mapCustomFood } from "./foodSources.js";
import { FOOD_SOURCE } from "./foodSchema.js";
const FOOD_KEY = "nutripeak-foods-v1";
const RECENT_KEY = "nutripeak-recent-foods-v1";

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function normaliseText(value = "") {
  return String(value)
    .toLowerCase()
    .trim();
}

function upsertCustomFood(food) {
  const current = loadCustomFoods();

  const existingById = current.find(item => item.id === food.id);
  const existingByBarcode = food.barcode
    ? current.find(item => item.barcode === food.barcode)
    : null;

  const next = current.filter(item =>
    item.id !== food.id &&
    item.barcode !== food.barcode
  );

  return [
    {
      ...food,
      id: existingById?.id || existingByBarcode?.id || food.id,
      metadata: {
        ...(food.metadata || {}),
        lastUpdated: new Date().toISOString()
      }
    },
    ...next
  ];
}

function scoreFood(food, query) {
  const q = normaliseText(query);
  const name = normaliseText(food.name);
  const brand = normaliseText(food.brand);
  const category = normaliseText(food.category);

  if (!q) return 0;

  let score = 0;

  if (name === q) score += 100;
  if (name.startsWith(q)) score += 70;
  if (name.includes(q)) score += 45;
  if (brand.includes(q)) score += 20;
  if (category.includes(q)) score += 10;

  return score;
}

export function loadCustomFoods() {
  return safeParse(localStorage.getItem(FOOD_KEY), []);
}

export function saveCustomFoods(foods) {
  localStorage.setItem(FOOD_KEY, JSON.stringify(foods));
}

export function getAllFoods() {
  return [
    ...SEED_FOODS,
    ...loadCustomFoods()
  ].filter(isValidFood);
}

export function searchFoods(query, options = {}) {
  const limit = options.limit || 20;

  return getAllFoods()
    .map(food => ({
      food,
      score: scoreFood(food, query)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.food);
}

export function getFoodById(id) {
  return getAllFoods().find(food => food.id === id) || null;
}

export function getFoodByBarcode(barcode) {
  const clean = String(barcode || "").trim();

  if (!clean) return null;

  return getAllFoods().find(food =>
    String(food.barcode || "").trim() === clean
  ) || null;
}

export function addCustomFood(input) {
  const food =
    input.source && input.source !== FOOD_SOURCE.CUSTOM
      ? input
      : mapCustomFood(input);

  if (!isValidFood(food)) {
    throw new Error("Invalid food. Name and calories are required.");
  }

  const next = upsertCustomFood(food);

  saveCustomFoods(next);

  return next[0];
}

export function deleteCustomFood(id) {
  const next = loadCustomFoods().filter(food => food.id !== id);
  saveCustomFoods(next);
}

export function saveRecentFood(foodId) {
  const current = safeParse(localStorage.getItem(RECENT_KEY), []);

  const next = [
    foodId,
    ...current.filter(id => id !== foodId)
  ].slice(0, 30);

  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export function getRecentFoods() {
  const ids = safeParse(localStorage.getItem(RECENT_KEY), []);

  return ids
    .map(getFoodById)
    .filter(Boolean);
}

export function clearRecentFoods() {
  localStorage.removeItem(RECENT_KEY);
}