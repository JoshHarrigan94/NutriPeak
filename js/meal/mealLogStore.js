import { createMealEntry, MEAL_TYPES } from "./mealSchema.js";

const MEAL_LOG_KEY = "nutripeak-meal-log-v1";

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function loadMealLog() {
  return safeParse(localStorage.getItem(MEAL_LOG_KEY), []);
}

export function saveMealLog(entries) {
  localStorage.setItem(MEAL_LOG_KEY, JSON.stringify(entries));
}

export function getMealEntriesByDate(date = todayString()) {
  return loadMealLog()
    .filter(entry => entry.date === date)
    .sort((a, b) => {
      const mealOrder =
        MEAL_TYPES.indexOf(a.mealType) - MEAL_TYPES.indexOf(b.mealType);

      if (mealOrder !== 0) return mealOrder;

      return a.createdAt.localeCompare(b.createdAt);
    });
}

export function getMealEntriesByRange(startDate, endDate) {
  return loadMealLog()
    .filter(entry =>
      entry.date >= startDate &&
      entry.date <= endDate
    )
    .sort((a, b) =>
      a.date.localeCompare(b.date) ||
      a.createdAt.localeCompare(b.createdAt)
    );
}

export function addMealEntry({
  date = todayString(),
  mealType,
  food,
  amount,
  unit,
  notes = ""
}) {
  const entry = createMealEntry({
    date,
    mealType,
    food,
    amount,
    unit,
    notes
  });

  const next = [
    ...loadMealLog(),
    entry
  ];

  saveMealLog(next);

  return entry;
}

export function updateMealEntry(id, patch = {}) {
  const current = loadMealLog();

  const next = current.map(entry =>
    entry.id === id
      ? {
          ...entry,
          ...patch,
          updatedAt: new Date().toISOString()
        }
      : entry
  );

  saveMealLog(next);

  return next.find(entry => entry.id === id) || null;
}

export function deleteMealEntry(id) {
  const next = loadMealLog().filter(entry => entry.id !== id);
  saveMealLog(next);
}

export function clearMealEntriesForDate(date = todayString()) {
  const next = loadMealLog().filter(entry => entry.date !== date);
  saveMealLog(next);
}

export function copyMealEntriesToDate(sourceDate, targetDate = todayString()) {
  const sourceEntries = getMealEntriesByDate(sourceDate);

  const copied = sourceEntries.map(entry => ({
    ...entry,
    id: crypto.randomUUID(),
    date: targetDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  const next = [
    ...loadMealLog(),
    ...copied
  ];

  saveMealLog(next);

  return copied;
}

export function getMealGroupsByDate(date = todayString()) {
  const entries = getMealEntriesByDate(date);

  return MEAL_TYPES.reduce((acc, mealType) => {
    acc[mealType] = entries.filter(entry => entry.mealType === mealType);
    return acc;
  }, {});
}