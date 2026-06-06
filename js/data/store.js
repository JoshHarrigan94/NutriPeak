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

export function upsertUser(patch) {
  commit({
    ...state,
    user: {
      ...state.user,
      ...patch
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

  const entries = Array.from({ length: 21 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (20 - index));

    const weightDrift =
      101 -
      index * 0.055 +
      Math.sin(index / 2) * 0.18;

    return {
      id: crypto.randomUUID(),
      date: date.toISOString().slice(0, 10),
      calories: Math.round(2550 + Math.sin(index) * 180),
      weightKg: Number(weightDrift.toFixed(2)),
      steps: Math.round(10500 + Math.cos(index / 1.7) * 2200),
      adherence: index % 7 === 5 ? 78 : 92,
      createdAt: new Date().toISOString()
    };
  });

  commit({
    ...state,
    entries
  });
}