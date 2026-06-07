function round(value, dp = 0) {
  return Number.isFinite(value) ? Number(value.toFixed(dp)) : 0;
}

export function buildReportSchema(report) {
  return {
    summary: {
      primaryAction: report.resolution.primaryAction,
      priority: report.resolution.priority,
      confidence: report.resolution.confidence,
      rationale: report.resolution.rationale,
      avoidAction: report.resolution.avoidAction
    },

    currentState: {
      label: report.metabolicState.primary.label,
      id: report.metabolicState.primary.id,
      confidence: report.metabolicState.confidence,
      summary: report.metabolicState.primary.summary,
      secondary: report.metabolicState.secondary.label
    },

    keyMetrics: {
      weight: round(report.metrics.latestWeight, 1),
      dryWeight: round(report.waterLoad.predictedDryWeight, 1),
      waterLoad: round(report.waterLoad.estimatedWaterLoadKg, 1),
      trendLoss: round(report.diagnostics.activeLossSignal, 2),
      expectedLoss: round(report.metrics.expectedLossKg, 2),
      rawEfficiency: round(report.efficiency.rawEfficiency),
      dryEfficiency: round(report.efficiency.dryAdjustedEfficiency),
      maskingGap: round(report.efficiency.maskingGap),
      effectiveTdee: round(report.metrics.effectiveTdee),
      avgCalories: round(report.metrics.avgCalories),
      estimatedDeficit: round(report.metrics.estimatedDeficit)
    },

    risks: {
      adaptation: round(report.diagnostics.adaptationRisk),
      fatigue: round(report.diagnostics.fatigueRisk),
      retention: round(report.diagnostics.retentionRisk),
      adherence: round(report.diagnostics.adherenceRisk),
      compensation: round(report.compensation.compensationScore),
      dietFatigue: round(report.dietFatigue.fatigueScore),
      adherenceCollapse: round(report.dietFatigue.adherenceCollapseRisk)
    },

    recommendation: {
      calorieTarget: report.calorieAdjustment.targetCalories,
      calorieChange: round(report.calorieAdjustment.delta),
      calorieLabel: report.calorieAdjustment.label,
      phase: report.phase.title,
      phaseTag: report.phase.tag,
      phaseSummary: report.phase.summary
    },

    experiment: {
      type: report.experiment.type,
      title: report.experiment.title,
      confidence: report.experiment.confidence,
      hypothesis: report.experiment.hypothesis,
      expectedOutcome: report.experiment.expectedOutcome,
      protocol: report.experiment.protocol,
      successCriteria: report.experiment.successCriteria,
      stopCriteria: report.experiment.stopCriteria
    },

    learning: {
      confidence: report.learning.confidence,
      confidenceScore: report.learning.confidenceScore,
      calorieRange: report.learning.learnedProfile.calorieRange,
      fatigueSensitivity: report.learning.learnedProfile.fatigueSensitivity,
      activitySensitivity: report.learning.learnedProfile.activitySensitivity,
      recommendations: report.learning.recommendations
    },

    confidence: {
      overall: report.confidence.overall.score,
      overallLabel: report.confidence.overall.label,
      maintenance: report.confidence.maintenance.score,
      water: report.confidence.water.score,
      efficiency: report.confidence.efficiency.score,
      state: report.confidence.state.score,
      transition: report.confidence.transition.score,
      learning: report.confidence.learning.score
    },

    evidence: {
      primaryCause: report.investigation.primary.title,
      primaryCauseSummary: report.investigation.primary.summary,
      transition: report.transition.evidence,
      experiment: report.experiment.protocol,
      resolution: [
        report.resolution.rationale,
        report.resolution.supportingAction,
        report.resolution.avoidAction
      ]
    }
  };
}