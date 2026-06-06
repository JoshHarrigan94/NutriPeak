function hasValue(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function getTodayEntry(state) {
  const today = todayString();

  return [...state.entries]
    .reverse()
    .find(entry => entry.date === today) || null;
}

export function calculateDataQuality(state) {
  const entries = [...state.entries].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const last7 = entries.slice(-7);
  const today = getTodayEntry(state);

  const requiredFields = [
    { key: "weightKg", label: "Weight" },
    { key: "calories", label: "Calories" },
    { key: "steps", label: "Steps" },
    { key: "adherence", label: "Adherence" }
  ];

  const advancedFields = [
    { key: "protein", label: "Protein" },
    { key: "fibre", label: "Fibre" },
    { key: "sleepHours", label: "Sleep" },
    { key: "stress", label: "Stress" },
    { key: "soreness", label: "Soreness" }
  ];

  const todayChecks = [...requiredFields, ...advancedFields].map(field => ({
    ...field,
    complete: today ? hasValue(today[field.key]) : false
  }));

  const requiredComplete = todayChecks
    .filter(item => requiredFields.some(field => field.key === item.key))
    .filter(item => item.complete).length;

  const advancedComplete = todayChecks
    .filter(item => advancedFields.some(field => field.key === item.key))
    .filter(item => item.complete).length;

  const loggedDays = new Set(last7.map(entry => entry.date)).size;

  const consistencyScore = Math.min(100, (loggedDays / 7) * 100);
  const requiredScore = (requiredComplete / requiredFields.length) * 60;
  const advancedScore = (advancedComplete / advancedFields.length) * 25;
  const streakScore = consistencyScore * 0.15;

  const score = Math.round(requiredScore + advancedScore + streakScore);

  let label = "Low confidence";

  if (score >= 85) label = "High confidence";
  else if (score >= 65) label = "Good confidence";
  else if (score >= 45) label = "Partial confidence";

  return {
    score,
    label,
    today,
    todayChecks,
    loggedDays,
    missingToday: todayChecks.filter(item => !item.complete)
  };
}