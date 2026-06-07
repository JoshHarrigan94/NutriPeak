export const FOOD_SOURCE = {
  CUSTOM: "custom",
  OPEN_FOOD_FACTS: "open_food_facts",
  COFID: "cofid",
  SYSTEM: "system"
};

export const FOOD_TYPE = {
  GENERIC: "generic",
  BRANDED: "branded",
  RECIPE: "recipe",
  CUSTOM: "custom"
};

export function createCanonicalFood({
  id,
  source = FOOD_SOURCE.CUSTOM,
  sourceId = "",
  type = FOOD_TYPE.CUSTOM,

  name,
  brand = "",
  barcode = "",
  category = "",

  servingName = "100g",
  servingSize = 100,
  servingUnit = "g",

  nutritionPer100g = {},

  metadata = {}
}) {
  return {
    id: id || crypto.randomUUID(),
    source,
    sourceId,
    type,

    name: name || "Unnamed food",
    brand,
    barcode,
    category,

    defaultServing: {
      name: servingName,
      size: Number(servingSize || 100),
      unit: servingUnit || "g"
    },

    nutritionPer100g: {
      calories: Number(nutritionPer100g.calories || 0),
      protein: Number(nutritionPer100g.protein || 0),
      carbs: Number(nutritionPer100g.carbs || 0),
      fat: Number(nutritionPer100g.fat || 0),
      fibre: Number(nutritionPer100g.fibre || 0),
      sugar: Number(nutritionPer100g.sugar || 0),
      saturatedFat: Number(nutritionPer100g.saturatedFat || 0),
      salt: Number(nutritionPer100g.salt || 0),
      sodium: Number(nutritionPer100g.sodium || 0)
    },

    metadata: {
      confidence: metadata.confidence || "unknown",
      verified: Boolean(metadata.verified),
      country: metadata.country || "",
      lastUpdated: metadata.lastUpdated || new Date().toISOString()
    }
  };
}

export function isValidFood(food) {
  return Boolean(
    food &&
    food.name &&
    food.nutritionPer100g &&
    Number.isFinite(Number(food.nutritionPer100g.calories))
  );
}