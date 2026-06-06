export function getDecision(diagnostics, metrics) {
  const reasons = [];

  if (metrics.daysLogged < 7) {
    return {
      state: "collect",
      label: "Collect Baseline",
      action: "Keep logging",
      confidence: 35,
      summary:
        "There is not enough data yet to distinguish a real stall from normal daily noise.",
      reasons: [
        {
          title: "Insufficient trend data",
          body: "The system needs at least 7 logged days before decisions are useful."
        }
      ],
      nextCheck: "Review again after 7 logged days."
    };
  }

  if (diagnostics.efficiency >= 85 && diagnostics.fatigueRisk < 45) {
    reasons.push({
      title: "Output matches expectation",
      body: `Trend loss is close to expected loss. Efficiency is ${diagnostics.efficiency.toFixed(0)}%.`
    });

    reasons.push({
      title: "Fatigue pressure manageable",
      body: "The current deficit and activity load are not yet creating a high-risk signal."
    });

    return {
      state: "continue",
      label: "Continue",
      action: "Keep the plan unchanged",
      confidence: 86,
      summary:
        "The current strategy is working. The smartest move is consistency, not adjustment.",
      reasons,
      nextCheck: "Review again in 7 days."
    };
  }

  if (
    diagnostics.efficiency < 45 &&
    diagnostics.fatigueRisk >= 55 &&
    metrics.estimatedDeficit >= 700 &&
metrics.avgSteps > 10000
  ) {
    reasons.push({
      title: "Low output despite high pressure",
      body:
        "Estimated deficit is large, steps are high, but the scale is not moving as expected."
    });

    reasons.push({
      title: "Aggressive restriction may backfire",
      body:
        "Cutting harder may increase fatigue, water retention and adherence risk without improving the trend."
    });

    return {
      state: "maintenance",
      label: "Maintenance Candidate",
      action: "Do not cut harder",
      confidence: 78,
      summary:
        "This is the core problem state: high effort, low output. First investigate masking and fatigue before reducing calories again.",
      reasons,
      nextCheck:
        "Hold or slightly ease the plan for 3–7 days, then reassess trend weight."
    };
  }

  if (diagnostics.retentionRisk >= 50 && diagnostics.fatigueRisk < 65) {
    reasons.push({
      title: "Possible masking phase",
      body:
        "The model sees low scale output, but fatigue is not high enough to confirm true failure."
    });

    reasons.push({
      title: "Avoid emotional changes",
      body:
        "Water, glycogen, inflammation or stress can temporarily hide fat loss."
    });

    return {
      state: "hold",
      label: "Hold",
      action: "Keep plan stable",
      confidence: 68,
      summary:
        "The safest decision is to hold the current plan and wait for the trend to reveal itself.",
      reasons,
      nextCheck: "Review after 3 more morning weigh-ins."
    };
  }

  if (diagnostics.adherenceRisk >= 25) {
    reasons.push({
      title: "Execution gap detected",
      body:
        "The gap between expected and actual progress may be explained by adherence drift."
    });

    return {
      state: "tighten",
      label: "Tighten Execution",
      action: "Improve adherence before changing calories",
      confidence: 72,
      summary:
        "The plan may not be broken. Execution quality should be improved before changing the target.",
      reasons,
      nextCheck: "Review after 7 days of cleaner execution."
    };
  }

  reasons.push({
    title: "Mixed signal",
    body:
      "The engine cannot yet confidently separate adaptation, retention and adherence."
  });

  return {
    state: "monitor",
    label: "Monitor",
    action: "Wait before changing",
    confidence: 58,
    summary:
      "There is not enough signal for a major decision. Controlled observation is better than reactive adjustment.",
    reasons,
    nextCheck: "Review in 3–7 days."
  };
}