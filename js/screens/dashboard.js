import { generateMetabolicReport } from "../engine/metabolicReportEngine.js";
import { renderTrendChart } from "../charts/trendChart.js";
import { metricCard, diagnosticPill } from "../ui/cards.js";

function round(value, dp = 0) {
  return Number.isFinite(value) ? value.toFixed(dp) : "0";
}

function signed(value) {
  const rounded = Math.round(value);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

export function renderDashboard(state) {
  const report = generateMetabolicReport(state);

  const {
    metrics,
    diagnostics,
    decision,
    metabolicState,
    investigation,
    quality,
    waterLoad,
    efficiency,
    calorieAdjustment,
    projection,
    reviewPattern,
    noise,
    phase
  } = report;

  return `
    <section class="card decision-card">
      <span class="decision-label">${decision.label}</span>
      <p class="eyebrow">Current decision</p>
      <div class="review-action">${decision.action}</div>
      ${diagnosticPill(diagnostics)}
      <p class="note">${decision.summary}</p>
    </section>

    <section class="card">
      <p class="eyebrow">Metabolic state</p>
      <h2>${metabolicState.primary.label}</h2>
      <p class="note">${metabolicState.primary.summary}</p>
      <p class="note">
        Confidence: <strong>${metabolicState.confidence}</strong>.
        Secondary: <strong>${metabolicState.secondary.label}</strong>.
      </p>
    </section>

    <section class="card">
      <p class="eyebrow">Calorie guidance</p>
      <div class="adjustment-card">
        <span class="noise-label">${calorieAdjustment.label}</span>
        <div class="adjustment-value">${calorieAdjustment.targetCalories}</div>
        <p class="note">${calorieAdjustment.summary}</p>
        <div class="adjustment-meta">
          <span>Change</span>
          <strong>${signed(calorieAdjustment.delta)} kcal</strong>
        </div>
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">Goal projection</p>
      <div class="projection-card">
        <span class="noise-label">${projection.label}</span>
        <div class="projection-date">${projection.projectedDate}</div>
        <p class="note">${projection.summary}</p>
      </div>
    </section>

    <section class="card chart-card">
      <p class="eyebrow">Trend weight</p>
      <h2>Scale vs signal</h2>
      ${renderTrendChart(state.entries)}
    </section>

    <section class="card">
      <p class="eyebrow">Dry weight estimate</p>
      <h2>${waterLoad.label}</h2>
      <div class="grid">
        ${metricCard("Scale", round(waterLoad.latestWeight, 1), "kg")}
        ${metricCard("Water", round(waterLoad.estimatedWaterLoadKg, 1), "kg")}
        ${metricCard("Dry", round(waterLoad.predictedDryWeight, 1), "kg")}
        ${metricCard("Above Trend", round(waterLoad.scaleAboveTrend, 1), "kg")}
      </div>
      <p class="note">${waterLoad.summary}</p>
    </section>

    <section class="card">
      <p class="eyebrow">Efficiency model</p>
      <h2>${efficiency.label}</h2>
      <p class="note">${efficiency.summary}</p>
      <div class="grid">
        ${metricCard("Raw Eff", round(efficiency.rawEfficiency), "%")}
        ${metricCard("Dry Eff", round(efficiency.dryAdjustedEfficiency), "%")}
        ${metricCard("Mask Gap", round(efficiency.maskingGap), "%")}
        ${metricCard("Loss Signal", round(efficiency.dryAdjustedLossSignal, 2), "kg/wk")}
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">Adaptive maintenance</p>
      <h2>${metrics.adaptiveMaintenance.label}</h2>
      <p class="note">${metrics.adaptiveMaintenance.summary}</p>
      <div class="grid">
        ${metricCard("Observed", metrics.adaptiveMaintenance.estimatedMaintenance, " kcal")}
        ${metricCard("Original", metrics.adaptiveMaintenance.userEstimatedTdee, " kcal")}
        ${metricCard("Delta", metrics.adaptiveMaintenance.delta, " kcal")}
        ${metricCard("Confidence", metrics.adaptiveMaintenance.confidence, "")}
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">Review memory</p>
      <div class="${reviewPattern.hasPattern ? "pattern-alert" : "noise-card"}">
        <span class="noise-label">${reviewPattern.hasPattern ? "Pattern found" : "No pattern"}</span>
        <h2>${reviewPattern.title}</h2>
        <p class="note">${reviewPattern.summary}</p>
      </div>
    </section>

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

    <section class="card">
      <p class="eyebrow">Most likely limiter</p>
      <h2>${investigation.primary.title}</h2>
      <p class="note">${investigation.primary.summary}</p>
    </section>

    <section class="card">
      <p class="eyebrow">Scale noise</p>
      <h2>${noise.label}</h2>
      <p class="note">${noise.summary}</p>
    </section>

    <section class="card">
      <p class="eyebrow">Recommended phase</p>
      <h2>${phase.title}</h2>
      <p class="note">${phase.summary}</p>
    </section>

    <section class="card">
      <h2>Control Centre</h2>
      <div class="grid">
        ${metricCard("Avg Calories", round(metrics.avgCalories), "")}
        ${metricCard("Effective TDEE", round(metrics.effectiveTdee), "")}
        ${metricCard("Trend Loss", round(metrics.trendLossPerWeek, 2), "kg/wk")}
        ${metricCard("Expected Loss", round(metrics.expectedLossKg, 2), "kg/wk")}
      </div>
    </section>
  `;
}