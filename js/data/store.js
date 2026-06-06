import { loadState, saveState } from "./storage.js";

let state = loadState();
let listeners = [];

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter(listener => listener !== fn);
  };
}

function commit(nextState) {
  state = nextState;
  saveState(state);
  listeners.forEach(fn => fn(state));
}

export function updateUserSettings(settings) {
  commit({
    ...state,
    user: {
      ...state.user,
      name: settings.name || "Athlete",
      startWeightKg: Number(settings.startWeightKg || 0),
      goalWeightKg: Number(settings.goalWeightKg || 0),
      targetRateKgPerWeek: Number(settings.targetRateKgPerWeek || 0),
      estimatedTdee: Number(settings.estimatedTdee || 0),
      minimumCalories: Number(settings.minimumCalories || 0),
      highStepThreshold: Number(settings.highStepThreshold || 0)
    }
  });
}

export function addEntry(entry) {
  const date = entry.date || new Date().toISOString().slice(0, 10);

  const nextEntry = {
    id: entry.id || crypto.randomUUID(),
    date,

    calories: Number(entry.calories || 0),
    protein: Number(entry.protein || 0),
    carbs: Number(entry.carbs || 0),
    fat: Number(entry.fat || 0),
    fibre: Number(entry.fibre || 0),
    sodium: Number(entry.sodium || 0),

    weightKg: Number(entry.weightKg || 0),
    steps: Number(entry.steps || 0),
    adherence: Number(entry.adherence || 100),

    sleepHours: Number(entry.sleepHours || 0),
    stress: Number(entry.stress || 0),
    soreness: Number(entry.soreness || 0),

    notes: entry.notes || "",
    createdAt: entry.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const existing = state.entries.find(item => item.date === date);

  const nextEntries = existing
    ? state.entries.map(item =>
        item.date === date
          ? { ...nextEntry, id: item.id, createdAt: item.createdAt }
          : item
      )
    : [...state.entries, nextEntry];

  commit({
    ...state,
    entries: nextEntries.sort((a, b) => a.date.localeCompare(b.date))
  });
}

export function deleteEntry(id) {
  commit({
    ...state,
    entries: state.entries.filter(entry => entry.id !== id)
  });
}

export function saveWeeklyReview(review) {
  const today = new Date().toISOString().slice(0, 10);

  const existing = (state.reviews || []).find(item => item.date === today);

  const reviewRecord = {
    id: existing?.id || crypto.randomUUID(),
    date: today,
    ...review,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const nextReviews = existing
    ? state.reviews.map(item => item.date === today ? reviewRecord : item)
    : [reviewRecord, ...(state.reviews || [])];

  commit({
    ...state,
    reviews: nextReviews.slice(0, 24)
  });
}

export function deleteReview(id) {
  commit({
    ...state,
    reviews: (state.reviews || []).filter(review => review.id !== id)
  });
}

export function seedDemoData() {
  const today = new Date();

  const entries = Array.from({ length: 28 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (27 - index));

    const weightDrift =
      101 -
      index * 0.052 +
      Math.sin(index / 2) * 0.22;

    return {
      id: crypto.randomUUID(),
      date: date.toISOString().slice(0, 10),

      calories: Math.round(2500 + Math.sin(index) * 160),
      protein: Math.round(185 + Math.sin(index / 2) * 18),
      carbs: Math.round(255 + Math.cos(index / 3) * 45),
      fat: Math.round(72 + Math.sin(index / 4) * 10),
      fibre: Math.round(26 + Math.cos(index / 2) * 7),
      sodium: Math.round(2600 + Math.sin(index / 1.4) * 700),

      weightKg: Number(weightDrift.toFixed(2)),
      steps: Math.round(10800 + Math.cos(index / 1.7) * 2600),
      adherence: index % 8 === 5 ? 78 : 93,

      sleepHours: Number((6.6 + Math.sin(index / 2) * 0.8).toFixed(1)),
      stress: index % 6 === 0 ? 8 : 5,
      soreness: index % 5 === 0 ? 8 : 4,

      notes: "",
      createdAt: new Date().toISOString()
    };
  });

  commit({
    ...state,
    entries
  });
}