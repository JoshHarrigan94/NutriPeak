import { generateMetabolicReport } from "../engine/metabolicReportEngine.js";
import { renderTrendChart } from "../charts/trendChart.js";
import { saveWeeklyReview, deleteReview } from "../data/store.js";
import { buildReviewSnapshot } from "../history/reviewHistory.js";

function pct(value) {
  return `${Math.max(0, Math.min(100, value)).toFixed(0)}%`;
}

function num(value, dp = 0) {
  return Number.isFinite(value) ? value.toFixed(dp) : "0";
}

function signed(value) {
  const rounded = Math.round(value);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

function renderHistory(reviews) {
  if (!reviews?.length) return `<p class="note">No saved weekly reviews yet.</p>`;

  return `
    <div class="history-list">
      ${reviews.slice(0, 8).map(review => `
        <article class="history-item">
          <div class="history-top">
            <div>
              <strong>${review.decisionLabel}</strong>
              <span>${review.date} · ${review.primaryCause}</span>
            </div>
            <span>${review.phaseTag}</span>
          </div>
          <p class="note">${review.calorieLabel} · ${review.calorieTarget} kcal</p>
          <div class="history-metrics">
            <div class="history-metric"><span>Eff</span><strong>${review.efficiency}%</strong></div>
            <div class="history-metric"><span>Trend</span><strong>${review.trendLoss}kg</strong></div>
            <div class="history-metric"><span>Quality</span><strong>${review.dataQuality}%</strong></div>
          </div>
          <div class="history-actions">
            <button class="delete-btn" data-delete-review="${review.id}">Delete</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

export function renderReview(state) {
  const report = generateMetabolicReport(state);

  const {
    metrics,
    diagnostics,
    decision,
    investigation,
    phase,
    projection,
    calorieAdjustment,
    quality,
    noise,
    waterLoad,
    efficiency,
    metabolicState,
    reviewPattern
  } = report;

  const adjustedConfidence = Math.round(
    decision.confidence * (0.65 + quality.score / 285)
  );

  window.__currentReviewSnapshot = buildReviewSnapshot({
    metrics,
    diagnostics,
    decision,
    investigation,
    phase,
    projection,
    adjustment: calorieAdjustment,
    quality,
    noise
  });

  return `
    <section class="card decision-card">
      <span class="decision-label">${decision.label}</span>
      <p class="eyebrow">Weekly decision</p>
      <div class="review-action">${decision.action}</div>
      <p class="note">${decision.summary}</p>

      <div class="progress-track">
        <div class="progress-fill" style="--value:${pct(adjustedConfidence)}"></div>
      </div>

      <p class="note">
        Decision confidence: <strong>${pct(adjustedConfidence)}</strong>
        after data-quality adjustment.
      </p>

      <button id="save-review" class="primary-button" type="button">
        Save Weekly Review
      </button>
    </section>

    <section class="card">
      <p class="eyebrow">Metabolic state</p>
      <h2>${metabolicState.primary.label}</h2>
      <p class="note">${metabolicState.primary.summary}</p>
    </section>

    <section class="card">
      <p class="eyebrow">Calorie guidance</p>
      <div class="adjustment-card">
        <span class="noise-label">${calorieAdjustment.label}</span>
        <div class="adjustment-value">${calorieAdjustment.targetCalories}</div>
        <p class="note">${calorieAdjustment.summary}</p>
        <div class="adjustment-meta">
          <span>Suggested change</span>
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
      <p class="eyebrow">Trend review</p>
      <h2>Scale vs signal</h2>
      ${renderTrendChart(state.entries)}
    </section>

    <section class="card">
      <p class="eyebrow">Dry-adjusted efficiency</p>
      <h2>${efficiency.label}</h2>
      <p class="note">${efficiency.summary}</p>
      <div class="grid">
        <div class="metric"><span>Raw Eff</span><strong>${num(efficiency.rawEfficiency)}%</strong></div>
        <div class="metric"><span>Dry Eff</span><strong>${num(efficiency.dryAdjustedEfficiency)}%</strong></div>
        <div class="metric"><span>Masking Gap</span><strong>${num(efficiency.maskingGap)}%</strong></div>
        <div class="metric"><span>Loss Signal</span><strong>${num(efficiency.dryAdjustedLossSignal, 2)}kg</strong></div>
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">Dry weight estimate</p>
      <h2>${waterLoad.label}</h2>
      <p class="note">${waterLoad.summary}</p>
      <div class="grid">
        <div class="metric"><span>Scale</span><strong>${num(waterLoad.latestWeight, 1)}kg</strong></div>
        <div class="metric"><span>Water</span><strong>${num(waterLoad.estimatedWaterLoadKg, 1)}kg</strong></div>
        <div class="metric"><span>Dry</span><strong>${num(waterLoad.predictedDryWeight, 1)}kg</strong></div>
        <div class="metric"><span>Above Trend</span><strong>${num(waterLoad.scaleAboveTrend, 1)}kg</strong></div>
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">Primary investigation</p>
      <h2>${investigation.primary.title}</h2>
      <p class="note">${investigation.primary.summary}</p>
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
      <h2>Weekly Signal</h2>
      <div class="grid">
        <div class="metric"><span>Efficiency</span><strong>${pct(diagnostics.efficiency)}</strong></div>
        <div class="metric"><span>Trend Loss</span><strong>${num(diagnostics.activeLossSignal, 2)}kg/wk</strong></div>
        <div class="metric"><span>Expected Loss</span><strong>${num(metrics.expectedLossKg, 2)}kg/wk</strong></div>
        <div class="metric"><span>Avg Adherence</span><strong>${num(metrics.avgAdherence)}%</strong></div>
      </div>
    </section>

    <section class="card">
      <h2>Saved Reviews</h2>
      ${renderHistory(state.reviews)}
    </section>
  `;
}

export function bindReviewEvents() {
  document.querySelector("#save-review")?.addEventListener("click", () => {
    if (window.__currentReviewSnapshot) {
      saveWeeklyReview(window.__currentReviewSnapshot);
    }
  });

  document.querySelectorAll("[data-delete-review]").forEach(button => {
    button.addEventListener("click", () => {
      deleteReview(button.dataset.deleteReview);
    });
  });
}