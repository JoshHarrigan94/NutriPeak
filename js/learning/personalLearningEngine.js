function average(values) {
  const clean = values.filter(value => Number.isFinite(value));
  if (!clean.length) return 0;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function bandCalories(value) {
  if (!Number.isFinite(value) || value <= 0) return "Unknown";
  const lower = Math.floor(value / 250) * 250;
  const upper = lower + 249;
  return `${lower}-${upper}`;
}

function countBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

function makeInsight(type, title, body, strength = "Moderate") {
  return {
    type,
    title,
    body,
    strength
  };
}

export function analysePersonalLearning(report) {
  const reviews = report.state.reviews || [];

  if (reviews.length < 3) {
    return {
      confidence: "Low",
      confidenceScore: clamp(reviews.length * 22),
      learnedProfile: {
        calorieRange: "Learning",
        preferredDeficit: "Learning",
        fatigueSensitivity: "Learning",
        activitySensitivity: "Learning",
        maintenanceResponse: "Learning"
      },
      bestSignals: [
        makeInsight(
          "baseline",
          "Not enough history yet",
          "Save at least 3 weekly reviews before the engine starts forming personal patterns.",
          "Low"
        )
      ],
      riskPatterns: [],
      recommendations: [
        "Keep saving weekly reviews.",
        "Do not overfit one week of data.",
        "Use current diagnostics until personal history is stronger."
      ],
      summary:
        "Personal learning is warming up. The engine needs more saved review history before it can distinguish a true personal pattern from normal noise."
    };
  }

  const recent = reviews.slice(0, 8);

  const highEfficiency = recent.filter(review => review.efficiency >= 80);
  const lowEfficiency = recent.filter(review => review.efficiency < 70);

  const calorieBands = countBy(highEfficiency, review =>
    bandCalories(review.avgCalories)
  );

  const bestCalorieBandEntry = Object.entries(calorieBands)
    .sort((a, b) => b[1].length - a[1].length)[0];

  const bestCalorieRange = bestCalorieBandEntry
    ? `${bestCalorieBandEntry[0]} kcal`
    : "Unclear";

  const avgHighEfficiencyCalories = average(
    highEfficiency.map(review => review.avgCalories)
  );

  const avgLowEfficiencyCalories = average(
    lowEfficiency.map(review => review.avgCalories)
  );

  const avgHighEfficiencySteps = average(
    highEfficiency.map(review => review.avgSteps)
  );

  const avgLowEfficiencySteps = average(
    lowEfficiency.map(review => review.avgSteps)
  );

  const avgHighEfficiencyFatigue = average(
    highEfficiency.map(review => review.fatigueRisk)
  );

  const avgLowEfficiencyFatigue = average(
    lowEfficiency.map(review => review.fatigueRisk)
  );

  const repeatedCauses = Object.entries(
    recent.reduce((acc, review) => {
      acc[review.primaryCauseId] = acc[review.primaryCauseId] || {
        id: review.primaryCauseId,
        label: review.primaryCause,
        count: 0
      };

      acc[review.primaryCauseId].count += 1;
      return acc;
    }, {})
  )
    .map(([, value]) => value)
    .sort((a, b) => b.count - a.count);

  const mostRepeatedCause = repeatedCauses[0];

  const maintenanceReviews = recent.filter(review =>
    review.phaseTag === "Recover" ||
    review.decisionState === "maintenance" ||
    review.calorieLabel?.toLowerCase().includes("maintenance")
  );

  const postMaintenanceImprovement =
    maintenanceReviews.length >= 1 &&
    highEfficiency.length >= 1;

  const fatigueSensitivity =
    avgLowEfficiencyFatigue - avgHighEfficiencyFatigue >= 15
      ? "High"
      : avgLowEfficiencyFatigue - avgHighEfficiencyFatigue >= 8
        ? "Moderate"
        : "Low / unclear";

  const activitySensitivity =
    avgLowEfficiencySteps - avgHighEfficiencySteps >= 1500
      ? "High activity may reduce efficiency"
      : avgHighEfficiencySteps - avgLowEfficiencySteps >= 1500
        ? "Higher steps may support efficiency"
        : "Unclear";

  const bestSignals = [];

  if (bestCalorieBandEntry) {
    bestSignals.push(makeInsight(
      "calories",
      `Best calorie band: ${bestCalorieRange}`,
      `${bestCalorieBandEntry[1].length} high-efficiency review(s) occurred in this calorie range.`,
      bestCalorieBandEntry[1].length >= 3 ? "High" : "Moderate"
    ));
  }

  if (avgHighEfficiencySteps > 0) {
    bestSignals.push(makeInsight(
      "steps",
      "Best-performing step range emerging",
      `High-efficiency weeks averaged around ${avgHighEfficiencySteps.toFixed(0)} steps/day.`,
      highEfficiency.length >= 3 ? "Moderate" : "Low"
    ));
  }

  if (avgHighEfficiencyFatigue > 0) {
    bestSignals.push(makeInsight(
      "fatigue",
      "Lower fatigue supports better output",
      `High-efficiency weeks averaged ${avgHighEfficiencyFatigue.toFixed(0)}% fatigue risk.`,
      "Moderate"
    ));
  }

  const riskPatterns = [];

  if (mostRepeatedCause?.count >= 2) {
    riskPatterns.push(makeInsight(
      "limiter",
      `Repeated limiter: ${mostRepeatedCause.label}`,
      `This limiter appeared ${mostRepeatedCause.count} times in recent saved reviews.`,
      mostRepeatedCause.count >= 3 ? "High" : "Moderate"
    ));
  }

  if (avgLowEfficiencyFatigue - avgHighEfficiencyFatigue >= 8) {
    riskPatterns.push(makeInsight(
      "fatigue",
      "Fatigue predicts weaker output",
      `Low-efficiency weeks averaged ${avgLowEfficiencyFatigue.toFixed(0)}% fatigue risk versus ${avgHighEfficiencyFatigue.toFixed(0)}% in high-efficiency weeks.`,
      fatigueSensitivity === "High" ? "High" : "Moderate"
    ));
  }

  if (avgLowEfficiencySteps - avgHighEfficiencySteps >= 1500) {
    riskPatterns.push(makeInsight(
      "activity",
      "High activity may be costing efficiency",
      `Low-efficiency weeks averaged ${avgLowEfficiencySteps.toFixed(0)} steps/day versus ${avgHighEfficiencySteps.toFixed(0)} in high-efficiency weeks.`,
      "Moderate"
    ));
  }

  const recommendations = [];

  if (bestCalorieRange !== "Unclear") {
    recommendations.push(`Prefer testing calorie targets near ${bestCalorieRange} before making larger changes.`);
  }

  if (fatigueSensitivity === "High") {
    recommendations.push("Trigger recovery or maintenance earlier when fatigue climbs.");
  }

  if (activitySensitivity === "High activity may reduce efficiency") {
    recommendations.push("Avoid solving stalls by automatically adding more steps.");
  }

  if (mostRepeatedCause?.count >= 2) {
    recommendations.push(`Build experiments around the repeated limiter: ${mostRepeatedCause.label}.`);
  }

  if (postMaintenanceImprovement) {
    recommendations.push("Maintenance-style phases may be useful when fatigue or adaptation pressure rises.");
  }

  if (!recommendations.length) {
    recommendations.push("Keep saving reviews until stronger personal patterns emerge.");
  }

  const confidenceScore = clamp(
    recent.length * 10 +
    highEfficiency.length * 6 +
    lowEfficiency.length * 4 +
    (mostRepeatedCause?.count >= 2 ? 12 : 0)
  );

  let confidence = "Low";
  if (confidenceScore >= 75) confidence = "High";
  else if (confidenceScore >= 45) confidence = "Moderate";

  return {
    confidence,
    confidenceScore,
    learnedProfile: {
      calorieRange: bestCalorieRange,
      preferredDeficit:
        report.metrics.estimatedDeficit > 0
          ? `${report.metrics.estimatedDeficit.toFixed(0)} kcal current estimated deficit`
          : "Unclear",
      fatigueSensitivity,
      activitySensitivity,
      maintenanceResponse:
        postMaintenanceImprovement
          ? "Potentially positive"
          : "Not enough evidence"
    },
    bestSignals,
    riskPatterns,
    recommendations,
    summary:
      `Personal learning confidence is ${confidence}. The engine has ${recent.length} recent saved review(s), ${highEfficiency.length} high-efficiency week(s), and ${lowEfficiency.length} low-efficiency week(s).`
  };
}