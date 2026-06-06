import { calculateMetrics } from "../metrics/coreMetrics.js";
import { runDiagnostics } from "../diagnostics/diagnosticEngine.js";
import { getRecommendation } from "../recommendations/recommendationEngine.js";
import { getDecision } from "../decisions/decisionEngine.js";
import { investigateStall } from "../investigations/stallInvestigator.js";
import { metricCard, diagnosticPill } from "../ui/cards.js";

function round(value, dp = 0) {
  return Number.isFinite(value) ? value.toFixed(dp) : "0";
}

export function renderDashboard(state) {
  const metrics = calculateMetrics(state);
  const diagnostics = runDiagnostics(metrics);
  const decision = getDecision(diagnostics, metrics);
  const investigation = investigateStall(metrics, diagnostics);
  const recommendation = getRecommendation(diagnostics, metrics);

  return `
    <section class="card decision-card">
      <span class="decision-label">${decision.label}</span>
      <p class="eyebrow">Current decision</p>
      <div class="review-action">${decision.action}</div>
      ${diagnosticPill(diagnostics)}
      <p class="note">${decision.summary}</p>
    </section>

    <section class="card">
      <p class="eyebrow">Most likely limiter</p>
      <h2>${investigation.primary.title}</h2>
      <p class="note">${investigation.primary.summary}</p>
    </section>

    <section class="card">
      <p class="eyebrow">Current metabolic signal</p>
      <div class="hero-score">${round(diagnostics.efficiency)}%</div>
      <p class="note">
        ${state.user.name || "Athlete"}, your current trend loss is 
        <strong>${round(diagnostics.activeLossSignal, 2)}kg/week</strong> against an expected 
        <strong>${round(metrics.expectedLossKg, 2)}kg/week</strong>.
      </p>
    </section>

    <section class="card">
      <h2>Nutrition Context</h2>
      <div class="grid">
        ${metricCard("Protein", round(metrics.avgProtein), "g")}
        ${metricCard("Carbs", round(metrics.avgCarbs), "g")}
        ${metricCard("Fat", round(metrics.avgFat), "g")}
        ${metricCard("Fibre", round(metrics.avgFibre), "g")}
      </div>
    </section>

    <section class="card">
      <h2>Control Centre</h2>
      <div class="grid">
        ${metricCard("Avg Calories", round(metrics.avgCalories), "")}
        ${metricCard("Avg Steps", round(metrics.avgSteps), "")}
        ${metricCard("Trend Loss", round(metrics.trendLossPerWeek, 2), "kg/wk")}
        ${metricCard("Expected Loss", round(metrics.expectedLossKg, 2), "kg/wk")}
        ${metricCard("Total Loss", round(metrics.totalLoss, 1), "kg")}
        ${metricCard("Remaining", round(metrics.remainingLoss, 1), "kg")}
      </div>
    </section>

    <section class="card recommendation">
      <p class="eyebrow">Recommendation</p>
      <h2>${diagnostics.label}</h2>
      <p class="note">${recommendation}</p>
    </section>
  `;
}