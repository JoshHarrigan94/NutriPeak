import { calculateMetrics } from "../metrics/coreMetrics.js";
import { runDiagnostics } from "../diagnostics/diagnosticEngine.js";
import { getRecommendation } from "../recommendations/recommendationEngine.js";
import { metricCard, diagnosticPill } from "../ui/cards.js";

function round(value, dp = 0) {
  return Number.isFinite(value) ? value.toFixed(dp) : "0";
}

export function renderDashboard(state) {
  const metrics = calculateMetrics(state);
  const diagnostics = runDiagnostics(metrics);
  const recommendation = getRecommendation(diagnostics, metrics);

  return `
    <section class="card">
      <p class="eyebrow">Current metabolic signal</p>
      <div class="hero-score">${round(diagnostics.efficiency)}%</div>
      ${diagnosticPill(diagnostics)}
      <p class="note">
        Fat-loss efficiency compares expected weight loss against actual trend movement.
      </p>
    </section>

    <section class="card">
      <h2>Control Centre</h2>
      <div class="grid">
        ${metricCard("Avg Calories", round(metrics.avgCalories), "")}
        ${metricCard("Avg Steps", round(metrics.avgSteps), "")}
        ${metricCard("Actual Loss", round(metrics.actualLossKg, 2), "kg")}
        ${metricCard("Expected Loss", round(metrics.expectedLossKg, 2), "kg")}
      </div>
    </section>

    <section class="card recommendation">
      <p class="eyebrow">Recommendation</p>
      <h2>${diagnostics.label}</h2>
      <p class="note">${recommendation}</p>
    </section>
  `;
}
