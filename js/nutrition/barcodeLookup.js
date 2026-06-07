import { mapOpenFoodFactsProduct } from "./foodSources.js";
import {
  getFoodByBarcode,
  addCustomFood
} from "./foodRepository.js";

const OPEN_FOOD_FACTS_BASE =
  "https://world.openfoodfacts.org/api/v2/product";

function cleanBarcode(barcode) {
  return String(barcode || "")
    .replace(/\D/g, "")
    .trim();
}

function hasUsefulNutrition(food) {
  return Boolean(
    food &&
    food.nutritionPer100g &&
    Number(food.nutritionPer100g.calories) > 0
  );
}

export async function lookupBarcode(barcode) {
  const clean = cleanBarcode(barcode);

  if (!clean) {
    return {
      status: "invalid",
      food: null,
      source: null,
      message: "Barcode is empty or invalid."
    };
  }

  const localMatch = getFoodByBarcode(clean);

  if (localMatch) {
    return {
      status: "found-local",
      food: localMatch,
      source: "local",
      message: "Found in local food database."
    };
  }

  try {
    const url =
      `${OPEN_FOOD_FACTS_BASE}/${clean}.json?fields=code,_id,product_name,generic_name,brands,categories,serving_size,nutriments,countries,last_modified_t,states_tags,nutrition_grade_fr`;

    const response = await fetch(url);

    if (!response.ok) {
      return {
        status: "network-error",
        food: null,
        source: "open_food_facts",
        message: `Open Food Facts request failed with status ${response.status}.`
      };
    }

    const data = await response.json();

    if (!data || data.status !== 1 || !data.product) {
      return {
        status: "not-found",
        food: null,
        source: "open_food_facts",
        message: "No product found for this barcode."
      };
    }

    const food = mapOpenFoodFactsProduct(data.product);

    if (!hasUsefulNutrition(food)) {
      return {
        status: "incomplete",
        food,
        source: "open_food_facts",
        message: "Product found, but nutrition data is incomplete."
      };
    }

    const cachedFood = addCustomFood({
      ...food,
      metadata: {
        ...food.metadata,
        cachedFromBarcode: true
      }
    });

    return {
      status: "found-remote",
      food: cachedFood,
      source: "open_food_facts",
      message: "Product found via Open Food Facts and cached locally."
    };
  } catch (error) {
    return {
      status: "error",
      food: null,
      source: "open_food_facts",
      message: error.message || "Barcode lookup failed."
    };
  }
}

export function isBarcodeLike(value) {
  const clean = cleanBarcode(value);
  return clean.length >= 8 && clean.length <= 14;
}