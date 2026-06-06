export function getPhaseRecommendation(diagnostics, metrics, decision, investigation) {
  if (metrics.daysLogged < 7) {
    return {
      id: "baseline",
      title: "Baseline Collection",
      tag: "Collect",
      duration: "7 days",
      summary:
        "The priority is not changing the plan yet. The system needs a clean baseline before it can diagnose intelligently.",
      steps: [
        "Log weight, calories, steps and adherence daily.",
        "Avoid changing calories aggressively during the baseline window.",
        "Use morning bodyweight where possible to reduce scale noise."
      ]
    };
  }

  if (decision.state === "continue") {
    return {
      id: "continue-cut",
      title: "Continue Fat-Loss Phase",
      tag: "Continue",
      duration: "7 days",
      summary:
        "The current deficit is producing enough output. Keep the plan stable and protect consistency.",
      steps: [
        `Keep average calories near ${metrics.avgCalories.toFixed(0)} kcal.`,
        `Keep steps around ${metrics.avgSteps.toFixed(0)} per day.`,
        "Do not lower calories while efficiency remains strong."
      ]
    };
  }

  if (decision.state === "tighten") {
    return {
      id: "execution-reset",
      title: "Execution Reset",
      tag: "Tighten",
      duration: "7 days",
      summary:
        "Before changing the deficit, tighten the controllable inputs. This tests whether the plan is actually broken.",
      steps: [
        "Hit calorie target within a tighter range for 7 days.",
        "Prioritise protein and fibre at each main meal.",
        "Reduce untracked bites, sauces, oils and weekend drift."
      ]
    };
  }

  if (
    decision.state === "maintenance" ||
    investigation.primary.id === "adaptation"
  ) {
    return {
      id: "maintenance-phase",
      title: "Maintenance Phase Candidate",
      tag: "Recover",
      duration: "7–14 days",
      summary:
        "The pattern suggests high effort with low output. A temporary maintenance phase may restore recovery, adherence and signal clarity.",
      steps: [
        "Raise calories toward estimated maintenance rather than cutting harder.",
        "Keep protein high and steps moderate, not extreme.",
        "Watch morning weight trend after the first few water-weight days."
      ]
    };
  }

  if (investigation.primary.id === "retention") {
    return {
      id: "hold-and-watch",
      title: "Hold & Watch",
      tag: "Hold",
      duration: "3–7 days",
      summary:
        "The issue may be masking rather than failed fat loss. Keep the plan stable and wait for the trend to resolve.",
      steps: [
        "Do not change calories for the next few days.",
        "Keep sodium and carbs more consistent to reduce scale noise.",
        "Watch trend weight, not single-day weigh-ins."
      ]
    };
  }

  if (investigation.primary.id === "nutrients") {
    return {
      id: "nutrition-quality-block",
      title: "Nutrition Quality Block",
      tag: "Quality",
      duration: "7 days",
      summary:
        "The deficit may be harder than it needs to be because macro quality or recovery support is weak.",
      steps: [
        `Aim for at least ${metrics.proteinTarget.toFixed(0)}g protein.`,
        "Push fibre toward 25–35g per day.",
        "Avoid letting dietary fat get extremely low for repeated days."
      ]
    };
  }

  return {
    id: "monitor",
    title: "Controlled Monitoring",
    tag: "Monitor",
    duration: "3–7 days",
    summary:
      "The signal is mixed. Hold the plan steady until the next checkpoint instead of reacting emotionally.",
    steps: [
      "Keep calories, steps and weigh-ins consistent.",
      "Check whether trend loss improves over the next few days.",
      "Only adjust once the same signal repeats."
    ]
  };
}