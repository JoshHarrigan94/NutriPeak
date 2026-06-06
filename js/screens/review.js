import { calculateMetrics } from "../metrics/coreMetrics.js";
import { runDiagnostics } from "../diagnostics/diagnosticEngine.js";
import { getDecision } from "../decisions/decisionEngine.js";
import { investigateStall } from "../investigations/stallInvestigator.js";
import { getPhaseRecommendation } from "../phases/phaseEngine.js";
import { calculateDataQuality } from "../quality/dataQualityEngine.js";
import { renderTrendChart } from "../charts/trendChart.js";
import { analyseScaleNoise } from "../insights/scaleNoiseEngine.js";
import { calculateProjection } from "../projections/projectionEngine.js";
import { getCalorieAdjustment } from "../calories/calorieAdjustmentEngine.js";
import { saveWeeklyReview, deleteReview } from "../data/store.js";
import { buildReviewSnapshot, analyseReviewHistory } from "../history/reviewHistory.js";
import { classifyMetabolicState } from "../stateEngine/metabolicStateEngine.js";
function pct(value) {
  return `${Math.max(0, Math.min(100, value)).toFixed(0)}%`;
}

function num(value, dp = 0) {
  return Number.isFinite(value) ? value.toFixed(dp) : "0";
}

function signed(value) {
  const rounded = Math.round(value);
  if (rounded > 0) return `+${rounded}`;
  return `${rounded}`;
}

function evidenceList(items) {
  if (!items.length) {
    return `<p class="note">No strong evidence detected yet.</p>`;
  }

  return `
    <div class="evidence-list">
      ${items.map(item => `
        <div class="evidence-item">
          <span class="evidence-dot"></span>
          <span>${item}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderPhaseSteps(phase) {
  return `
    <div class="phase-steps">
      ${phase.steps.map((step, index) => `
        <div class="phase-step">
          <span class="phase-step-index">${index + 1}</span>
          <span>${step}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderNoise(noise) {
  return `
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
  `;
}

function renderHistory(reviews) {
  if (!reviews?.length) {
    return `<p class="note">No saved weekly reviews yet.</p>`;
  }

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
            <div class="history-metric">
              <span>Eff</span>
              <strong>${review.efficiency}%</strong>
            </div>

            <div class="history-metric">
              <span>Trend</span>
              <strong>${review.trendLoss}kg</strong>
            </div>

            <div class="history-metric">
              <span>Quality</span>
              <strong>${review.dataQuality}%</strong>
            </div>
          </div>

          <div class="history-actions">
            <button class="delete-btn" data-delete-review="${review.id}">
              Delete
            </button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

export function renderReview(state) {
  const metrics = calculateMetrics(state);
  const diagnostics = runDiagnostics(metrics);
  const decision = getDecision(diagnostics, metrics);
  const investigation = investigateStall(metrics, diagnostics);
  const phase = getPhaseRecommendation(diagnostics, metrics, decision, investigation);
  const quality = calculateDataQuality(state);
  const noise = analyseScaleNoise(metrics, state.entries);
  const metabolicState = classifyMetabolicState(
  metrics,
  diagnostics,
  investigation,
  quality,
  noise
);
  const projection = calculateProjection(metrics, state);
  const adjustment = getCalorieAdjustment(metrics, diagnostics, decision, investigation, state);
  const pattern = analyseReviewHistory(state.reviews);

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
    adjustment,
    quality,
    noise
  });

  return `
    <section class="card decision-card">
      <span class="decision-label">${decision.label}</span>
      <p class="eyebrow">Weekly decision</p>
      <div class="review-action">${decision.action}</div>
      <p class="note">${decision.summary}</p>

      <section class="card">
  <p class="eyebrow">Current metabolic state</p>
  <h2>${metabolicState.primary.label}</h2>
  <p class="note">${metabolicState.primary.summary}</p>

  <div class="reason-list">
    ${metabolicState.primary.evidence.map(item => `
      <div class="reason-item">
        <strong>Evidence</strong>
        <span class="note">${item}</span>
      </div>
    `).join("")}
  </div>
</section>

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
      <p class="eyebrow">Review memory</p>
      <div class="${pattern.hasPattern ? "pattern-alert" : "noise-card"}">
        <span class="noise-label">${pattern.hasPattern ? "Pattern found" : "No pattern"}</span>
        <h2>${pattern.title}</h2>
        <p class="note">${pattern.summary}</p>
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">Calorie guidance</p>

      <div class="adjustment-card">
        <span class="noise-label">${adjustment.label}</span>
        <div class="adjustment-value">${adjustment.targetCalories}</div>
        <p class="note">${adjustment.summary}</p>

        <div class="adjustment-meta">
          <span>Suggested change</span>
          <strong>${signed(adjustment.delta)} kcal</strong>
        </div>

        ${
          adjustment.warning
            ? `<div class="warn-box">${adjustment.warning}</div>`
            : ""
        }
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
      <p class="eyebrow">Scale-noise check</p>
      <h2>Should you trust today's weight?</h2>
      ${renderNoise(noise)}
    </section>

    <section class="card">
      <p class="eyebrow">Data confidence</p>
      <h2>${quality.label}</h2>

      <div class="quality-ring" style="--value:${quality.score}%">
        <div class="quality-ring-inner">${quality.score}%</div>
      </div>

      <p class="note">
        Logged days in recent window: <strong>${quality.loggedDays}/7</strong>.
      </p>
    </section>

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
        ${renderPhaseSteps(phase)}
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">Primary investigation result</p>
      <h2>${investigation.primary.title}</h2>
      <p class="note">${investigation.primary.summary}</p>
      ${evidenceList(investigation.primary.evidence)}
    </section>

    <section class="card">
      <h2>Weekly Signal</h2>

      <div class="grid">
        <div class="metric">
          <span>Efficiency</span>
          <strong>${pct(diagnostics.efficiency)}</strong>
        </div>

        <div class="metric">
          <span>Trend Loss</span>
          <strong>${num(diagnostics.activeLossSignal, 2)}kg/wk</strong>
        </div>

        <div class="metric">
          <span>Expected Loss</span>
          <strong>${num(metrics.expectedLossKg, 2)}kg/wk</strong>
        </div>

        <div class="metric">
          <span>Avg Adherence</span>
          <strong>${num(metrics.avgAdherence)}%</strong>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>Saved Reviews</h2>
      ${renderHistory(state.reviews)}
    </section>

    <section class="card">
      <h2>Next Checkpoint</h2>
      <p class="note">${decision.nextCheck}</p>
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