function makeDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function buildEntries({
  startWeight = 100,
  dailyLoss = 0.08,
  noise = 0.1,
  calories = 2500,
  protein = 190,
  carbs = 240,
  fat = 70,
  fibre = 28,
  sodium = 2700,
  steps = 10000,
  sleepHours = 7,
  stress = 4,
  soreness = 4,
  adherence = 95,
  days = 28
}) {
  return Array.from({ length: days }, (_, index) => {
    const daysAgo = days - 1 - index;
    const wave = Math.sin(index / 2) * noise;
    const weight = startWeight - index * dailyLoss + wave;

    return {
      id: crypto.randomUUID(),
      date: makeDate(daysAgo),

      calories:
        typeof calories === "function" ? calories(index) : calories,
      protein:
        typeof protein === "function" ? protein(index) : protein,
      carbs:
        typeof carbs === "function" ? carbs(index) : carbs,
      fat:
        typeof fat === "function" ? fat(index) : fat,
      fibre:
        typeof fibre === "function" ? fibre(index) : fibre,
      sodium:
        typeof sodium === "function" ? sodium(index) : sodium,

      weightKg: Number(weight.toFixed(2)),
      steps:
        typeof steps === "function" ? steps(index) : steps,
      sleepHours:
        typeof sleepHours === "function" ? sleepHours(index) : sleepHours,
      stress:
        typeof stress === "function" ? stress(index) : stress,
      soreness:
        typeof soreness === "function" ? soreness(index) : soreness,
      adherence:
        typeof adherence === "function" ? adherence(index) : adherence,

      notes: "",
      createdAt: new Date().toISOString()
    };
  });
}

function baseUser() {
  return {
    name: "Scenario",
    startWeightKg: 100,
    goalWeightKg: 90,
    targetRateKgPerWeek: 0.8,
    estimatedTdee: 3300,
    minimumCalories: 2200,
    highStepThreshold: 12000
  };
}

export function createScenarioState(id) {
  const user = baseUser();

  const scenarios = {
    responsive: {
      id: "responsive",
      title: "Responsive fat loss",
      expected: [
        "State should lean Responsive.",
        "Recommendation should continue or hold.",
        "Efficiency should be strong."
      ],
      state: {
        user,
        entries: buildEntries({
          startWeight: 100,
          dailyLoss: 0.11,
          calories: 2500,
          steps: 9500,
          sleepHours: 7.4,
          stress: 3,
          soreness: 3,
          adherence: 96
        }),
        reviews: []
      }
    },

    masked_loss: {
      id: "masked_loss",
      title: "Water-masked loss",
      expected: [
        "State should lean Masked Loss.",
        "Water load should be elevated.",
        "Engine should avoid cutting calories."
      ],
      state: {
        user,
        entries: buildEntries({
          startWeight: 100,
          dailyLoss: 0.075,
          noise: 0.35,
          calories: 2500,
          carbs: index => index > 20 ? 360 : 230,
          sodium: index => index > 20 ? 4200 : 2500,
          steps: 10500,
          sleepHours: index => index > 21 ? 6.1 : 7,
          stress: index => index > 21 ? 7 : 4,
          soreness: index => index > 21 ? 8 : 4,
          adherence: 94
        }),
        reviews: []
      }
    },

    true_plateau: {
      id: "true_plateau",
      title: "True plateau / low output",
      expected: [
        "Efficiency should be low.",
        "Adaptation or compensation should rise.",
        "Engine should avoid blind overreaction."
      ],
      state: {
        user,
        entries: buildEntries({
          startWeight: 100,
          dailyLoss: 0.005,
          noise: 0.08,
          calories: 2450,
          steps: 11000,
          sleepHours: 7,
          stress: 4,
          soreness: 4,
          adherence: 96
        }),
        reviews: []
      }
    },

    fatigue_crash: {
      id: "fatigue_crash",
      title: "Diet fatigue crash",
      expected: [
        "Diet fatigue should be high.",
        "Transition may be uncertain without reviews.",
        "Experiment should favour recovery or controlled monitoring."
      ],
      state: {
        user,
        entries: buildEntries({
          startWeight: 100,
          dailyLoss: 0.03,
          calories: 2050,
          steps: 14500,
          sleepHours: 5.8,
          stress: 8,
          soreness: 8,
          adherence: index => index > 18 ? 78 : 92
        }),
        reviews: []
      }
    },

    adherence_drift: {
      id: "adherence_drift",
      title: "Adherence drift",
      expected: [
        "Execution drift should be elevated.",
        "Calorie reduction should be avoided.",
        "Experiment should favour execution reset."
      ],
      state: {
        user,
        entries: buildEntries({
          startWeight: 100,
          dailyLoss: 0.02,
          calories: index => index % 5 === 0 ? 3300 : 2500,
          steps: 9000,
          sleepHours: 7,
          stress: 4,
          soreness: 3,
          adherence: index => index > 14 ? 78 : 88
        }),
        reviews: []
      }
    },

    low_data: {
      id: "low_data",
      title: "Low data quality",
      expected: [
        "Confidence should be low.",
        "Experiment should be baseline collection.",
        "Primary action should improve data quality."
      ],
      state: {
        user,
        entries: buildEntries({
          startWeight: 100,
          dailyLoss: 0.08,
          days: 4,
          calories: 2500,
          steps: 9000,
          sleepHours: 0,
          stress: 0,
          soreness: 0,
          adherence: 90
        }),
        reviews: []
      }
    },

    high_steps_low_output: {
      id: "high_steps_low_output",
      title: "High steps, low output",
      expected: [
        "Compensation should be elevated.",
        "Activity compensation experiment should be likely.",
        "Avoid automatically increasing steps."
      ],
      state: {
        user,
        entries: buildEntries({
          startWeight: 100,
          dailyLoss: 0.01,
          calories: 2450,
          steps: 16000,
          sleepHours: 6.3,
          stress: 6,
          soreness: 7,
          adherence: 94
        }),
        reviews: []
      }
    }
  };

  return scenarios[id];
}

export function getAllScenarios() {
  return [
    "responsive",
    "masked_loss",
    "true_plateau",
    "fatigue_crash",
    "adherence_drift",
    "low_data",
    "high_steps_low_output"
  ].map(createScenarioState);
}