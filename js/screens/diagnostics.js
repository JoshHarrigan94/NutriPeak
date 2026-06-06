import { calculateMetrics } from "../metrics/coreMetrics.js";
import { runDiagnostics } from "../diagnostics/diagnosticEngine.js";
import { investigateStall } from "../investigations/stallInvestigator.js";
import { metricCard } from "../ui/cards.js";

function round(value) {
  return Number.isFinite(value) ? value.toFixed(0) : "0";
}

function renderEvidence(items) {
  if (!items.length) {
    return `
      <div class="evidence-item">
        <span class="evidence-dot"></span>
        <span>No strong evidence detected yet.</span>
      </div>
    `;
  }

  return items.map(item => `
    <div class="evidence-item">
      <span class="evidence-dot"></span>
      <span>${item}</span>
    </div>
  `).join("");
}

function renderInvestigationCard(cause, primaryId) {
  const isPrimary = cause.id === primaryId;

  return `
    <article class="investigation-card ${isPrimary ? "primary-cause" : ""}">
      <header>
        <h3>${cause.title}</h3>
        <span class="investigation-score">${round(cause.score)}%</span>
      </header>

      <p class="note">${cause.summary}</p>

      <div class="evidence-list">
        ${renderEvidence(cause.evidence)}
      </div>
    </article>
  `;
}

export function renderDiagnostics(state) {
  const metrics = calculateMetrics(state);
  const diagnostics = runDiagnostics(metrics);
  const investigation = investigateStall(metrics, diagnostics);

  return `
    <section class="card">
      <h2>Diagnostic Layer</h2>

      <p class="note">
        This engine compares restriction, activity, adherence and trend movement to explain
        whether fat loss is efficient, masked, drifting, or under too much pressure.
      </p>

      <div class="diagnostic-strip">
        ${metricCard("Fat-loss Efficiency", round(diagnostics.efficiency), "%")}
        ${metricCard("Adaptation Risk", round(diagnostics.adaptationRisk), "%")}
        ${metricCard("Diet Fatigue Risk", round(diagnostics.fatigueRisk), "%")}
        ${metricCard("Retention / Masking Risk", round(diagnostics.retentionRisk), "%")}
        ${metricCard("Adherence Risk", round(diagnostics.adherenceRisk), "%")}
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">Stall Investigation</p>
      <h2>Most likely cause: ${investigation.primary.title}</h2>
      <p class="note">${investigation.primary.summary}</p>
    </section>

    <section class="card">
      <h2>Cause Breakdown</h2>

      <div class="investigation-grid">
        ${investigation.causes.map(cause =>
          renderInvestigationCard(cause, investigation.primary.id)
        ).join("")}
      </div>
    </section>
  `;
}