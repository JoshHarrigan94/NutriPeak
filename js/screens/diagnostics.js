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
        This is the first explainable engine. It does not claim to directly measure hormones.
        It infers likely pressure from behaviour versus outcome.
      </p>

      <div class="diagnostic-strip">
        ${metricCard("Fat-loss Efficiency", round(diagnostics.efficiency), "%")}
        ${metricCard("Adaptation Risk", round(diagnostics.adaptationRisk), "%")}
        ${metricCard("Diet Fatigue Risk", round(diagnostics.fatigueRisk), "%")}
        ${metricCard("Retention / Masking Risk", round(diagnostics.retentionRisk), "%")}
        ${metricCard("Adherence Risk", round(diagnostics.adherenceRisk), "%")}
      </div>
    </section>
  `;
} 