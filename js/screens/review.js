import { calculateMetrics } from "../metrics/coreMetrics.js";
import { runDiagnostics } from "../diagnostics/diagnosticEngine.js";
import { getDecision } from "../decisions/decisionEngine.js";
import { investigateStall } from "../investigations/stallInvestigator.js";
import { getPhaseRecommendation } from "../phases/phaseEngine.js";
import { calculateDataQuality } from "../quality/dataQualityEngine.js";
import { renderTrendChart } from "../charts/trendChart.js";
import { analyseScaleNoise } from "../insights/scaleNoiseEngine.js";

function pct(value) {
  return `${Math.max(0, Math.min(100, value)).toFixed(0)}%`;
}

function num(value, dp = 0) {
  return Number.isFinite(value) ? value.toFixed(dp) : "0";
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

export function renderReview(state) {
  const metrics = calculateMetrics(state);
  const diagnostics = runDiagnostics(metrics);
  const decision = getDecision(diagnostics, metrics);
  const investigation = investigateStall(metrics, diagnostics);
  const phase = getPhaseRecommendation(diagnostics, metrics, decision, investigation);
  const quality = calculateDataQuality(state);
  const noise = analyseScaleNoise(metrics, state.entries);

  const adjustedConfidence = Math.round(
    decision.confidence * (0.65 + quality.score / 285)
  );

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
      <h2>Next Checkpoint</h2>
      <p class="note">${decision.nextCheck}</p>
    </section>
  `;
}