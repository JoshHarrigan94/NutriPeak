import { getDailyNutrition } from "./dailyNutritionEngine.js";
import { calculateDailyEnergyBalance } from "./energyBalanceEngine.js";

function round(value, dp = 1) {
  return Number.isFinite(value)
    ? Number(value.toFixed(dp))
    : 0;
}

function findExistingDailyEntry(state, date) {
  return (state.entries || []).find(entry => entry.date === date) || null;
}

function shouldUseNutritionValue(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

export function buildCoachingEntryFromNutrition({
  state,
  date = new Date().toISOString().slice(0, 10),
  metrics = null,
  preserveManualFields = true,
  requireFoodEntries = true
}) {
  const existing = findExistingDailyEntry(state, date);
  const dailyNutrition = getDailyNutrition(date);

  if (requireFoodEntries && dailyNutrition.entryCount === 0) {
    return existing || null;
  }

  const energyBalance = calculateDailyEnergyBalance({
    state,
    date,
    metrics
  });

  const totals = dailyNutrition.totals;

  return {
    id: existing?.id,
    date,

    calories: shouldUseNutritionValue(totals.calories)
      ? round(totals.calories)
      : Number(existing?.calories || 0),

    protein: shouldUseNutritionValue(totals.protein)
      ? round(totals.protein)
      : Number(existing?.protein || 0),

    carbs: shouldUseNutritionValue(totals.carbs)
      ? round(totals.carbs)
      : Number(existing?.carbs || 0),

    fat: shouldUseNutritionValue(totals.fat)
      ? round(totals.fat)
      : Number(existing?.fat || 0),

    fibre: shouldUseNutritionValue(totals.fibre)
      ? round(totals.fibre)
      : Number(existing?.fibre || 0),

    sodium: shouldUseNutritionValue(totals.sodium)
      ? round(totals.sodium)
      : Number(existing?.sodium || 0),

    weightKg: preserveManualFields
      ? Number(existing?.weightKg || 0)
      : 0,

    steps: preserveManualFields
      ? Number(existing?.steps || 0)
      : 0,

    adherence: preserveManualFields
      ? Number(existing?.adherence || 100)
      : 100,

    sleepHours: preserveManualFields
      ? Number(existing?.sleepHours || 0)
      : 0,

    stress: preserveManualFields
      ? Number(existing?.stress || 0)
      : 0,

    soreness: preserveManualFields
      ? Number(existing?.soreness || 0)
      : 0,

    notes: existing?.notes || "",

    nutritionSource: "food-log",
    mealEntryCount: dailyNutrition.entryCount,

    energyBalance: {
      caloriesIn: energyBalance.caloriesIn,
      caloriesOut: energyBalance.caloriesOut,
      balance: energyBalance.balance,
      deficit: energyBalance.deficit,
      surplus: energyBalance.surplus,
      status: energyBalance.status
    },

    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function buildCoachingEntriesFromNutritionRange({
  state,
  startDate,
  endDate,
  metrics = null,
  preserveManualFields = true,
  requireFoodEntries = true
}) {
  const dates = [];
  const cursor = new Date(startDate);
  const end = new Date(endDate);

  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates
    .map(date =>
      buildCoachingEntryFromNutrition({
        state,
        date,
        metrics,
        preserveManualFields,
        requireFoodEntries
      })
    )
    .filter(Boolean);
}

export function mergeNutritionEntriesIntoState({
  state,
  entries
}) {
  const incomingDates = new Set(entries.map(entry => entry.date));

  const preservedEntries = (state.entries || []).filter(entry =>
    !incomingDates.has(entry.date)
  );

  return {
    ...state,
    entries: [
      ...preservedEntries,
      ...entries
    ].sort((a, b) => a.date.localeCompare(b.date))
  };
}

export function syncNutritionDayToCoachingState({
  state,
  date = new Date().toISOString().slice(0, 10),
  metrics = null,
  preserveManualFields = true,
  requireFoodEntries = true
}) {
  const entry = buildCoachingEntryFromNutrition({
    state,
    date,
    metrics,
    preserveManualFields,
    requireFoodEntries
  });

  if (!entry) return state;

  return mergeNutritionEntriesIntoState({
    state,
    entries: [entry]
  });
}

export function syncNutritionRangeToCoachingState({
  state,
  startDate,
  endDate,
  metrics = null,
  preserveManualFields = true,
  requireFoodEntries = true
}) {
  const entries = buildCoachingEntriesFromNutritionRange({
    state,
    startDate,
    endDate,
    metrics,
    preserveManualFields,
    requireFoodEntries
  });

  if (!entries.length) return state;

  return mergeNutritionEntriesIntoState({
    state,
    entries
  });
}