import { calculateMetrics } from "../metrics/coreMetrics.js";
import { runDiagnostics } from "../diagnostics/diagnosticEngine.js";
import { getDecision } from "../decisions/decisionEngine.js";

function pct(value) {
  return `${Math.max(0, Math.min(100, value)).toFixed(0)}%`;
}

function num(value, dp = 0) {
  return Number.isFinite(value) ? value.toFixed(dp) : "0";
}

export function renderReview(state) {
  const metrics = calculateMetrics(state);
  const diagnostics = runDiagnostics(metrics);
  const decision = getDecision(diagnostics, metrics);

  return `
    <section class="card decision-card">
      <span class="decision-label">${decision.label}</span>
      <p class="eyebrow">Weekly decision</p>
      <div class="review-action">${decision.action}</div>
      <p class="note">${decision.summary}</p>

      <div class="progress-track">
        <div class="progress-fill" style="--value:${pct(decision.confidence)}"></div>
      </div>

      <p class="note">
        Decision confidence: <strong>${pct(decision.confidence)}</strong>
      </p>
    </section>

    <section class="card">
      <h2>Why the engine thinks this</h2>

      <div class="reason-list">
        ${decision.reasons.map(reason => `
          <div class="reason-item">
            <strong>${reason.title}</strong>
            <span class="note">${reason.body}</span>
          </div>
        `).join("")}
      </div>
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