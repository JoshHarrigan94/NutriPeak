import { calculateMetrics } from "../metrics/coreMetrics.js";
import { runDiagnostics } from "../diagnostics/diagnosticEngine.js";
import { metricCard } from "../ui/cards.js";

function round(value) {
  return Number.isFinite(value) ? value.toFixed(0) : "0";
}

export function renderDiagnostics(state) {
  const metrics = calculateMetrics(state);
  const diagnostics = runDiagnostics(metrics);

  return `
    <section class="card">
      <h2>Diagnostic Layer</h2>

      <p class="note">
        This engine infers what may be happening under the hood by comparing restriction,
        activity, adherence and actual trend movement.
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
      <h2>Interpretation</h2>

      <div class="reason-list">
        <div class="reason-item">
          <strong>Adaptation: ${diagnostics.labels.adaptation}</strong>
          <span class="note">
            Pressure from low calories, high steps and low output versus expectation.
          </span>
        </div>

        <div class="reason-item">
          <strong>Fatigue: ${diagnostics.labels.fatigue}</strong>
          <span class="note">
            Pressure from restriction load, activity load, adherence decline and diet duration.
          </span>
        </div>

        <div class="reason-item">
          <strong>Retention / Masking: ${diagnostics.labels.retention}</strong>
          <span class="note">
            Possible water, glycogen, inflammation or stress masking actual fat loss.
          </span>
        </div>

        <div class="reason-item">
          <strong>Adherence Risk: ${diagnostics.labels.adherence}</strong>
          <span class="note">
            Difference between intended execution and recorded adherence.
          </span>
        </div>
      </div>
    </section>
  `;
}