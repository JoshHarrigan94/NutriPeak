import { createCanonicalFood, FOOD_SOURCE, FOOD_TYPE } from "./foodSchema.js";

function kjToKcal(kj) {
  return Number(kj || 0) / 4.184;
}

function sodiumFromSalt(salt) {
  return Number(salt || 0) * 400;
}

export function mapOpenFoodFactsProduct(product = {}) {
  const nutriments = product.nutriments || {};

  const calories =
    nutriments["energy-kcal_100g"] ||
    nutriments["energy-kcal"] ||
    kjToKcal(nutriments["energy_100g"]);

  const salt = nutriments["salt_100g"] || 0;
  const sodium = nutriments["sodium_100g"]
    ? Number(nutriments["sodium_100g"]) * 1000
    : sodiumFromSalt(salt);

  return createCanonicalFood({
    source: FOOD_SOURCE.OPEN_FOOD_FACTS,
    sourceId: product._id || product.code || "",
    type: FOOD_TYPE.BRANDED,

    name: product.product_name || product.generic_name || "Unknown product",
    brand: product.brands || "",
    barcode: product.code || product._id || "",
    category: product.categories || "",

    servingName: product.serving_size || "100g",
    servingSize: 100,
    servingUnit: "g",

    nutritionPer100g: {
      calories,
      protein: nutriments["proteins_100g"],
      carbs: nutriments["carbohydrates_100g"],
      fat: nutriments["fat_100g"],
      fibre: nutriments["fiber_100g"],
      sugar: nutriments["sugars_100g"],
      saturatedFat: nutriments["saturated-fat_100g"],
      salt,
      sodium
    },

    metadata: {
      confidence: product.nutrition_grade_fr ? "medium" : "unknown",
      verified: Boolean(product.states_tags?.includes("en:complete")),
      country: product.countries || "",
      lastUpdated: product.last_modified_t
        ? new Date(product.last_modified_t * 1000).toISOString()
        : new Date().toISOString()
    }
  });
}

export function mapCofidFood(row = {}) {
  return createCanonicalFood({
    source: FOOD_SOURCE.COFID,
    sourceId: row.id || row.food_code || row.code || "",
    type: FOOD_TYPE.GENERIC,

    name: row.name || row.food_name || "Unknown CoFID food",
    brand: "",
    barcode: "",
    category: row.category || row.group || "",

    servingName: "100g",
    servingSize: 100,
    servingUnit: "g",

    nutritionPer100g: {
      calories: row.calories || row.energy_kcal || row.kcal,
      protein: row protein || row.protein_g,
      carbs: row.carbs || row.carbohydrate_g,
      fat: row.fat || row.fat_g,
      fibre: row.fibre || row.fiber_g,
      sugar: row.sugar || row.sugars_g,
      saturatedFat: row.saturatedFat || row.saturates_g,
      salt: row.salt || row.salt_g,
      sodium: row.sodium || row.sodium_mg
    },

    metadata: {
      confidence: "high",
      verified: true,
      country: "UK",
      lastUpdated: new Date().toISOString()
    }
  });
}

export function mapCustomFood(input = {}) {
  return createCanonicalFood({
    ...input,
    source: FOOD_SOURCE.CUSTOM,
    type: FOOD_TYPE.CUSTOM,
    metadata: {
      ...(input.metadata || {}),
      confidence: input.metadata?.confidence || "user-entered",
      verified: false
    }
  });
}