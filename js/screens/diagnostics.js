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
        This engine infers what is happening under the hood by comparing restriction,
        activity, adherence and actual weight trend.
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

      <p class="note">
        Adaptation: <strong>${diagnostics.labels.adaptation}</strong><br>
        Fatigue: <strong>${diagnostics.labels.fatigue}</strong><br>
        Retention / Masking: <strong>${diagnostics.labels.retention}</strong><br>
        Adherence Risk: <strong>${diagnostics.labels.adherence}</strong>
      </p>
    </section>
  `;
}