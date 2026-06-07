export const THRESHOLDS = {
  deficit: {
    moderate: 500,
    large: 700,
    aggressive: 900,
    veryAggressive: 950
  },

  steps: {
    elevated: 10000,
    high: 12000,
    veryHigh: 14000,
    frequentHighDays: 4
  },

  sleep: {
    low: 6.5,
    veryLow: 6.2,
    repeatedLowDays: 3
  },

  stress: {
    high: 7,
    elevated: 5.5,
    repeatedHighDays: 3
  },

  soreness: {
    high: 7,
    elevated: 5.5,
    repeatedHighDays: 2
  },

  nutrition: {
    lowFibre: 20,
    targetFibreMin: 25,
    targetFibreMax: 35,
    highSodium: 3500,
    veryLowFat: 45,
    veryLowCarbs: 120
  },

  adherence: {
    drift: 90,
    poor: 80,
    good: 90
  },

  efficiency: {
    poor: 45,
    low: 70,
    good: 85,
    strong: 90,
    maskingGap: 15
  },

  maintenance: {
    meaningfulSuppression: -300,
    majorSuppression: -500,
    meaningfulElevation: 300
  },

  data: {
    minimumDays: 7,
    strongerTrendDays: 14,
    learningReviews: 3,
    goodQuality: 65,
    highQuality: 85
  }
};