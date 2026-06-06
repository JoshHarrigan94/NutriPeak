const KEY = "metabolic-intelligence-v2";

export const defaultState = {
  user: {
    name: "Josh",
    startWeightKg: 101,
    goalWeightKg: 92,
    targetRateKgPerWeek: 0.8,
    estimatedTdee: 3700,
    minimumCalories: 2200,
    highStepThreshold: 12000
  },
  entries: []
};

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(KEY);
}