import { calculateMetrics } from "../metrics/coreMetrics.js";
import { runDiagnostics } from "../diagnostics/diagnosticEngine.js";
import { getRecommendation } from "../recommendations/recommendationEngine.js";
import { getDecision } from "../decisions/decisionEngine.js";
import { investigateStall } from "../investigations/stallInvestigator.js";
import { getPhaseRecommendation } from "../phases/phaseEngine.js";
import { calculateDataQuality } from "../quality/dataQualityEngine.js";
import { renderTrendChart } from "../charts/trendChart.js";
import { analyseScaleNoise } from "../insights/scaleNoiseEngine.js";
import { calculateProjection } from "../projections/projectionEngine.js";
import { getCalorieAdjustment } from "../calories/calorieAdjustmentEngine.js";
import { analyseReviewHistory } from "../history/reviewHistory.js";
import { metricCard, diagnosticPill } from "../ui/cards.js";

function round(value, dp = 0) {
  return Number.isFinite(value) ? value.toFixed(dp) : "0";
}

function signed(value) {
  const rounded = Math.round(value);
  if (rounded > 0) return `+${rounded}`;
  return `${rounded}`;
}

function renderPhase(phase) {
  return `
    <section class="card">
      <p class="eyebrow">Recommended phase</p>

      <div class="phase-card">
        <div class="phase-title">
          <div>
            <h3>${phase.title}</h3>
            <p class="note">${phase.duration}</p>
          </div>
          <span class="phase-tag">${phase.tag}</span>
        </div>

        <p class="note">${phase.summary}</p>
      </div>
    </section>
  `;
}

function renderScaleNoise(noise) {
  return `
    <section class="card">
      <p class="eyebrow">Scale noise</p>

      <div class="noise-card">
        <span class="noise-label">${noise.label}</span>
        <p class="note">${noise.summary}</p>

        <div class="noise-list">
          ${noise.drivers.map(driver => `
            <div class="noise-item">
              <span>${driver.label}</span>
              <strong>${driver.value}</strong>
            </div>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderProjection(projection) {
  return `
    <section class="card">
      <p class="eyebrow">Goal projection</p>

      <div class="projection-card">
        <span class="noise-label">${projection.label}</span>
        <div class="projection-date">${projection.projectedDate}</div>
        <p class="note">${projection.summary}</p>
      </div>
    </section>
  `;
}

function renderCalories(adjustment) {
  return `
    <section class="card">
      <p class="eyebrow">Calorie guidance</p>

      <div class="adjustment-card">
        <span class="noise-label">${adjustment.label}</span>
        <div class="adjustment-value">${adjustment.targetCalories}</div>
        <p class="note">${adjustment.summary}</p>

        <div class="adjustment-meta">
          <span>Change</span>
          <strong>${signed(adjustment.delta)} kcal</strong>
        </div>

        ${
          adjustment.warning
            ? `<div class="warn-box">${adjustment.warning}</div>`
            : ""
        }
      </div>
    </section>
  `;
}

function renderHistoryPattern(pattern) {
  return `
    <section class="card">
      <p class="eyebrow">Review memory</p>

      <div class="${pattern.hasPattern ? "pattern-alert" : "noise-card"}">
        <span class="noise-label">${pattern.hasPattern ? "Pattern found" : "No pattern"}</span>
        <h2>${pattern.title}</h2>
        <p class="note">${pattern.summary}</p>
      </div>
    </section>
  `;
}

export function renderDashboard(state) {
  const metrics = calculateMetrics(state);
  const diagnostics = runDiagnostics(metrics);
  const decision = getDecision(diagnostics, metrics);
  const investigation = investigateStall(metrics, diagnostics);
  const phase = getPhaseRecommendation(diagnostics, metrics, decision, investigation);
  const recommendation = getRecommendation(diagnostics, metrics);
  const quality = calculateDataQuality(state);
  const noise = analyseScaleNoise(metrics, state.entries);
  const projection = calculateProjection(metrics, state);
  const adjustment = getCalorieAdjustment(metrics, diagnostics, decision, investigation, state);
  const pattern = analyseReviewHistory(state.reviews);

  return `
    <section class="card decision-card">
      <span class="decision-label">${decision.label}</span>
      <p class="eyebrow">Current decision</p>
      <div class="review-action">${decision.action}</div>
      ${diagnosticPill(diagnostics)}
      <p class="note">${decision.summary}</p>
    </section>

    ${renderHistoryPattern(pattern)}
    ${renderCalories(adjustment)}
    ${renderProjection(projection)}

    <section class="card chart-card">
      <p class="eyebrow">Trend weight</p>
      <h2>Scale vs signal</h2>
      ${renderTrendChart(state.entries)}
    </section>

    ${renderScaleNoise(noise)}

    <section class="card">
      <p class="eyebrow">Data confidence</p>
      <h2>${quality.label}</h2>

      <div class="quality-ring" style="--value:${quality.score}%">
        <div class="quality-ring-inner">${quality.score}%</div>
      </div>

      <p class="note">
        ${quality.missingToday.length
          ? `Missing today: ${quality.missingToday.map(item => item.label).join(", ")}.`
          : "Today’s check-in is complete enough for a strong read."}
      </p>
    </section>

    ${renderPhase(phase)}

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