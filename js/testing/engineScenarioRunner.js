import { generateMetabolicReport } from "../engine/metabolicReportEngine.js";
import { getAllScenarios } from "./scenarioFactory.js";

function scoreScenario(scenario, report) {
  const checks = [];

  if (scenario.id === "responsive") {
    checks.push(report.schema.currentState.id === "responsive");
    checks.push(report.schema.keyMetrics.dryEfficiency >= 80);
    checks.push(report.schema.summary.primaryAction.toLowerCase().includes("continue"));
  }

  if (scenario.id === "masked_loss") {
    checks.push(report.schema.currentState.id === "masked" || report.schema.risks.retention >= 50);
    checks.push(report.schema.keyMetrics.waterLoad >= 0.6);
    checks.push(!report.schema.summary.primaryAction.toLowerCase().includes("cut"));
  }

  if (scenario.id === "true_plateau") {
    checks.push(report.schema.keyMetrics.dryEfficiency < 70);
    checks.push(report.schema.risks.adaptation >= 45 || report.schema.risks.compensation >= 45);
  }

  if (scenario.id === "fatigue_crash") {
    checks.push(report.schema.risks.dietFatigue >= 60);
    checks.push(report.schema.summary.avoidAction.toLowerCase().includes("cut") || report.schema.summary.avoidAction.toLowerCase().includes("pressure"));
  }

  if (scenario.id === "adherence_drift") {
    checks.push(report.schema.risks.adherence >= 10);
    checks.push(report.schema.experiment.type === "execution-reset" || report.schema.summary.priority === "Adherence");
  }

  if (scenario.id === "low_data") {
    checks.push(report.schema.confidence.overall < 55);
    checks.push(report.schema.experiment.type === "baseline");
  }

  if (scenario.id === "high_steps_low_output") {
    checks.push(report.schema.risks.compensation >= 60);
    checks.push(report.schema.summary.avoidAction.toLowerCase().includes("steps"));
  }

  const passed = checks.filter(Boolean).length;

  return {
    passed,
    total: checks.length,
    score: checks.length ? Math.round((passed / checks.length) * 100) : 0
  };
}

export function runEngineScenarios() {
  return getAllScenarios().map(scenario => {
    const report = generateMetabolicReport(scenario.state);
    const result = scoreScenario(scenario, report);

    return {
      id: scenario.id,
      title: scenario.title,
      expected: scenario.expected,
      result,
      summary: {
        action: report.schema.summary.primaryAction,
        state: report.schema.currentState.label,
        experiment: report.schema.experiment.title,
        confidence: report.schema.confidence.overall,
        dryEfficiency: report.schema.keyMetrics.dryEfficiency,
        waterLoad: report.schema.keyMetrics.waterLoad,
        compensation: report.schema.risks.compensation,
        fatigue: report.schema.risks.dietFatigue,
        adaptation: report.schema.risks.adaptation
      }
    };
  });
}