function makeExperiment({
  type,
  title,
  hypothesis,
  protocol,
  successCriteria,
  stopCriteria,
  expectedOutcome,
  confidence = "Moderate"
}) {
  return {
    type,
    title,
    hypothesis,
    protocol,
    successCriteria,
    stopCriteria,
    expectedOutcome,
    confidence
  };
}

export function prescribeWeeklyExperiment(report) {
  const {
    metrics,
    diagnostics,
    investigation,
    metabolicState,
    compensation,
    dietFatigue,
    transition,
    waterLoad,
    efficiency,
    quality
  } = report;

  if (metrics.daysLogged < 7 || quality.score < 45) {
    return makeExperiment({
      type: "baseline",
      title: "Baseline Signal Collection",
      hypothesis:
        "The engine cannot distinguish true fat-loss response from noise until the core data is consistent.",
      protocol: [
        "Log morning weight daily.",
        "Log calories, protein, steps and adherence daily.",
        "Do not deliberately change calories this week.",
        "Keep weigh-in conditions as consistent as possible."
      ],
      successCriteria: [
        "At least 6 out of 7 days logged.",
        "At least 5 morning weigh-ins.",
        "Calories and steps logged on at least 6 days."
      ],
      stopCriteria: [
        "None. This is a data collection phase."
      ],
      expectedOutcome:
        "A cleaner baseline that allows the engine to classify the next state with higher confidence.",
      confidence: "High"
    });
  }

  if (
    transition.direction === "worsening" &&
    dietFatigue.fatigueScore >= 70
  ) {
    return makeExperiment({
      type: "recovery-maintenance",
      title: "Recovery Maintenance Test",
      hypothesis:
        "The current deficit is creating too much fatigue for the output it is producing.",
      protocol: [
        "Raise calories toward observed maintenance for 7 days.",
        "Keep protein high.",
        "Avoid adding extra cardio or steps.",
        "Keep training intensity controlled and avoid unnecessary soreness.",
        "Track morning weight without reacting to the first 2–4 days."
      ],
      successCriteria: [
        "Sleep, stress or soreness improves.",
        "Adherence returns above 90%.",
        "Scale volatility reduces after the initial water/glycogen rise.",
        "Diet fatigue score falls by the next review."
      ],
      stopCriteria: [
        "Weight jumps sharply for more than 5–7 days with no improvement in fatigue or adherence.",
        "Calories exceed observed maintenance consistently."
      ],
      expectedOutcome:
        "Improved recovery and a cleaner signal, even if scale weight temporarily rises.",
      confidence: "Moderate"
    });
  }

  if (
    investigation.primary.id === "retention" ||
    waterLoad.estimatedWaterLoadKg >= 0.8 ||
    efficiency.maskingGap >= 15
  ) {
    return makeExperiment({
      type: "masking-control",
      title: "Scale Masking Control Test",
      hypothesis:
        "Fat loss may be occurring, but water, sodium, carbs, stress or soreness are masking the scale.",
      protocol: [
        "Hold calories stable for 7 days.",
        "Keep sodium intake consistent day to day.",
        "Keep carbohydrate intake consistent day to day.",
        "Avoid unusually high soreness training.",
        "Prioritise sleep consistency.",
        "Judge progress by 7-day trend, not single weigh-ins."
      ],
      successCriteria: [
        "Scale volatility reduces.",
        "Dry-adjusted efficiency and raw efficiency move closer together.",
        "Trend weight drops without reducing calories.",
        "Water-load estimate falls."
      ],
      stopCriteria: [
        "Raw and dry-adjusted efficiency remain low for another full week.",
        "Adherence falls below 85%."
      ],
      expectedOutcome:
        "Clearer trend data and reduced false-stall risk.",
      confidence: "High"
    });
  }

  if (
    compensation.compensationScore >= 70 &&
    metrics.avgSteps >= 11000
  ) {
    return makeExperiment({
      type: "activity-compensation",
      title: "Activity Compensation Test",
      hypothesis:
        "High steps may be increasing fatigue or compensation without producing proportional fat-loss output.",
      protocol: [
        "Reduce average daily steps by 10–20% for 7 days.",
        "Keep calories unchanged.",
        "Keep protein and fibre high.",
        "Do not add extra conditioning to replace the steps.",
        "Track sleep, soreness and hunger."
      ],
      successCriteria: [
        "Fatigue or soreness improves.",
        "Adherence improves.",
        "Weight trend does not worsen meaningfully.",
        "Efficiency improves despite slightly lower activity."
      ],
      stopCriteria: [
        "Trend loss clearly worsens and fatigue does not improve.",
        "Steps fall below a healthy minimum for the user."
      ],
      expectedOutcome:
        "A clearer view of whether more activity is helping or simply increasing system stress.",
      confidence: "Moderate"
    });
  }

  if (
    investigation.primary.id === "adherence" ||
    metabolicState.primary.id === "execution_drift"
  ) {
    return makeExperiment({
      type: "execution-reset",
      title: "Execution Reset Test",
      hypothesis:
        "The plan may not be broken; execution drift may be reducing the true deficit.",
      protocol: [
        "Do not lower calories.",
        "Hit the existing calorie target within a narrow range.",
        "Pre-plan protein at every main meal.",
        "Track sauces, oils, snacks and weekend intake carefully.",
        "Keep steps stable."
      ],
      successCriteria: [
        "Average adherence rises above 90%.",
        "Expected and actual loss begin to align.",
        "No increase in fatigue score.",
        "Fewer untracked or estimated meals."
      ],
      stopCriteria: [
        "Adherence remains below 80% despite tighter planning.",
        "Hunger, stress or fatigue rises sharply."
      ],
      expectedOutcome:
        "Clear separation between a broken calorie target and inconsistent execution.",
      confidence: "High"
    });
  }

  if (
    investigation.primary.id === "nutrients" ||
    metrics.lowProteinDays >= 3 ||
    metrics.lowFibreDays >= 3
  ) {
    return makeExperiment({
      type: "nutrition-quality",
      title: "Nutrition Quality Test",
      hypothesis:
        "Macro quality may be making the deficit harder to sustain than necessary.",
      protocol: [
        `Hit at least ${metrics.proteinTarget.toFixed(0)}g protein on 6 out of 7 days.`,
        "Hit 25–35g fibre daily.",
        "Keep dietary fat above a minimum comfort threshold.",
        "Keep calories unchanged.",
        "Track hunger, adherence and digestion notes."
      ],
      successCriteria: [
        "Hunger becomes easier to manage.",
        "Adherence improves.",
        "Fewer low-protein or low-fibre days.",
        "No worsening of scale trend."
      ],
      stopCriteria: [
        "Digestion worsens significantly.",
        "Fibre increase causes persistent bloating or discomfort."
      ],
      expectedOutcome:
        "Improved diet comfort without needing a calorie reduction.",
      confidence: "Moderate"
    });
  }

  if (
    diagnostics.efficiency >= 85 &&
    dietFatigue.fatigueScore < 50 &&
    transition.direction !== "worsening"
  ) {
    return makeExperiment({
      type: "continue-control",
      title: "Continue Control Week",
      hypothesis:
        "The current plan is working and should not be disrupted.",
      protocol: [
        "Keep calories stable.",
        "Keep steps stable.",
        "Keep protein and fibre consistent.",
        "Do not add extra restriction.",
        "Save another weekly review after 7 days."
      ],
      successCriteria: [
        "Efficiency remains above 80%.",
        "Fatigue remains below moderate-high.",
        "Adherence stays above 90%.",
        "Trend loss remains near expected."
      ],
      stopCriteria: [
        "Fatigue rises sharply.",
        "Adherence drops below 85%.",
        "Weight trend stalls for another full review window."
      ],
      expectedOutcome:
        "Continued fat loss with minimal unnecessary intervention.",
      confidence: "High"
    });
  }

  return makeExperiment({
    type: "controlled-monitoring",
    title: "Controlled Monitoring Week",
    hypothesis:
      "The signal is mixed, so the best experiment is consistency rather than intervention.",
    protocol: [
      "Keep calories unchanged.",
      "Keep steps within a consistent range.",
      "Keep sodium and carbs consistent.",
      "Prioritise sleep and recovery.",
      "Save a review after 7 days."
    ],
    successCriteria: [
      "Signal becomes clearer.",
      "State classification confidence improves.",
      "Trend weight confirms either progress or true stall."
    ],
    stopCriteria: [
      "Fatigue or adherence deteriorates sharply."
    ],
    expectedOutcome:
      "A cleaner next decision with lower risk of overreacting.",
    confidence: "Moderate"
  });
}