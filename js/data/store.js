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
  const nextEntry = {
    id: crypto.randomUUID(),
    date: entry.date || new Date().toISOString().slice(0, 10),
    calories: Number(entry.calories || 0),
    weightKg: Number(entry.weightKg || 0),
    steps: Number(entry.steps || 0),
    adherence: Number(entry.adherence || 100),
    notes: entry.notes || "",
    createdAt: new Date().toISOString()
  };

  commit({
    ...state,
    entries: [...state.entries, nextEntry].sort((a, b) =>
      a.date.localeCompare(b.date)
    )
  });
}

export function deleteEntry(id) {
  commit({
    ...state,
    entries: state.entries.filter(entry => entry.id !== id)
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
      weightKg: Number(weightDrift.toFixed(2)),
      steps: Math.round(10800 + Math.cos(index / 1.7) * 2600),
      adherence: index % 8 === 5 ? 78 : 93,
      notes: "",
      createdAt: new Date().toISOString()
    };
  });

  commit({
    ...state,
    entries
  });
}