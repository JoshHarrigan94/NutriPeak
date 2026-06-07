import { createCanonicalFood, FOOD_SOURCE, FOOD_TYPE } from "./foodSchema.js";

export const SEED_FOODS = [
  createCanonicalFood({
    id: "seed-chicken-breast-raw",
    source: FOOD_SOURCE.SYSTEM,
    type: FOOD_TYPE.GENERIC,
    name: "Chicken breast, raw",
    category: "Meat",
    nutritionPer100g: {
      calories: 120,
      protein: 23,
      carbs: 0,
      fat: 2.6,
      fibre: 0,
      sugar: 0,
      saturatedFat: 0.7,
      salt: 0.15,
      sodium: 60
    },
    metadata: {
      confidence: "medium",
      verified: true,
      country: "UK"
    }
  }),

  createCanonicalFood({
    id: "seed-rice-white-cooked",
    source: FOOD_SOURCE.SYSTEM,
    type: FOOD_TYPE.GENERIC,
    name: "White rice, cooked",
    category: "Carbohydrate",
    nutritionPer100g: {
      calories: 130,
      protein: 2.7,
      carbs: 28,
      fat: 0.3,
      fibre: 0.4,
      sugar: 0.1,
      saturatedFat: 0.1,
      salt: 0,
      sodium: 0
    },
    metadata: {
      confidence: "medium",
      verified: true,
      country: "UK"
    }
  }),

  createCanonicalFood({
    id: "seed-potato-baked",
    source: FOOD_SOURCE.SYSTEM,
    type: FOOD_TYPE.GENERIC,
    name: "Potato, baked",
    category: "Carbohydrate",
    nutritionPer100g: {
      calories: 93,
      protein: 2.5,
      carbs: 21,
      fat: 0.1,
      fibre: 2.2,
      sugar: 1.2,
      saturatedFat: 0,
      salt: 0.02,
      sodium: 8
    },
    metadata: {
      confidence: "medium",
      verified: true,
      country: "UK"
    }
  }),

  createCanonicalFood({
    id: "seed-avocado",
    source: FOOD_SOURCE.SYSTEM,
    type: FOOD_TYPE.GENERIC,
    name: "Avocado",
    category: "Fruit",
    nutritionPer100g: {
      calories: 160,
      protein: 2,
      carbs: 8.5,
      fat: 14.7,
      fibre: 6.7,
      sugar: 0.7,
      saturatedFat: 2.1,
      salt: 0.02,
      sodium: 7
    },
    metadata: {
      confidence: "medium",
      verified: true,
      country: "UK"
    }
  }),

  createCanonicalFood({
    id: "seed-egg-whole",
    source: FOOD_SOURCE.SYSTEM,
    type: FOOD_TYPE.GENERIC,
    name: "Egg, whole",
    category: "Protein",
    servingName: "1 medium egg",
    servingSize: 58,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 143,
      protein: 12.6,
      carbs: 0.7,
      fat: 9.5,
      fibre: 0,
      sugar: 0.4,
      saturatedFat: 3.1,
      salt: 0.35,
      sodium: 140
    },
    metadata: {
      confidence: "medium",
      verified: true,
      country: "UK"
    }
  }),

  createCanonicalFood({
    id: "seed-0-greek-yogurt",
    source: FOOD_SOURCE.SYSTEM,
    type: FOOD_TYPE.GENERIC,
    name: "Greek yogurt, 0% fat",
    category: "Dairy",
    nutritionPer100g: {
      calories: 59,
      protein: 10.3,
      carbs: 3.6,
      fat: 0.4,
      fibre: 0,
      sugar: 3.6,
      saturatedFat: 0.1,
      salt: 0.1,
      sodium: 40
    },
    metadata: {
      confidence: "medium",
      verified: true,
      country: "UK"
    }
  }),

  createCanonicalFood({
    id: "seed-oats",
    source: FOOD_SOURCE.SYSTEM,
    type: FOOD_TYPE.GENERIC,
    name: "Oats",
    category: "Carbohydrate",
    nutritionPer100g: {
      calories: 389,
      protein: 16.9,
      carbs: 66.3,
      fat: 6.9,
      fibre: 10.6,
      sugar: 0.9,
      saturatedFat: 1.2,
      salt: 0.01,
      sodium: 4
    },
    metadata: {
      confidence: "medium",
      verified: true,
      country: "UK"
    }
  }),

  createCanonicalFood({
    id: "seed-whey-protein",
    source: FOOD_SOURCE.SYSTEM,
    type: FOOD_TYPE.GENERIC,
    name: "Whey protein powder",
    category: "Supplement",
    servingName: "1 scoop",
    servingSize: 30,
    servingUnit: "g",
    nutritionPer100g: {
      calories: 400,
      protein: 80,
      carbs: 8,
      fat: 6,
      fibre: 0,
      sugar: 5,
      saturatedFat: 3,
      salt: 1,
      sodium: 400
    },
    metadata: {
      confidence: "medium",
      verified: true,
      country: "UK"
    }
  })
];