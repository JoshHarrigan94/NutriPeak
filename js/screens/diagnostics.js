 import { generateMetabolicReport } from "../engine/metabolicReportEngine.js";
import { metricCard } from "../ui/cards.js";

function round(value, dp = 0) {
  return Number.isFinite(value) ? value.toFixed(dp) : "0";
}

function renderEvidence(items) {
  if (!items?.length) {
    return `<div class="reason-item"><strong>Evidence</strong><span class="note">No strong evidence detected yet.</span></div>`;
  }

  return items.map(item => `
    <div class="reason-item">
      <strong>Evidence</strong>
      <span class="note">${item}</span>
    </div>
  `).join("");
}

export function renderDiagnostics(state) {
  const report = generateMetabolicReport(state);

  const {
  metrics,
  diagnostics,
  efficiency,
  compensation,
  dietFatigue,
  transition,
  experiment,
  learning,
  waterLoad,
  metabolicState,
  investigation,
  quality,
  noise,
  phase,
  calorieAdjustment,
  projection
} = report;

  return `
    <section class="card">
      <h2>Diagnostic Engine</h2>
      <p class="note">
        One orchestrated report now runs metrics, maintenance, water load, efficiency,
        diagnostics, investigation, state classification and recommendations.
      </p>

      <div class="diagnostic-strip">
        ${metricCard("Dry Efficiency", round(diagnostics.efficiency), "%")}
        ${metricCard("Raw Efficiency", round(diagnostics.rawEfficiency), "%")}
        ${metricCard("Masking Gap", round(diagnostics.maskingGap), "%")}
        ${metricCard("Adaptation", round(diagnostics.adaptationRisk), "%")}
        ${metricCard("Fatigue", round(diagnostics.fatigueRisk), "%")}
        ${metricCard("Retention", round(diagnostics.retentionRisk), "%")}
        ${metricCard("Data Quality", quality.score, "%")}
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">Metabolic State Classification</p>
      <h2>${metabolicState.primary.label}</h2>
      <p class="note">${metabolicState.primary.summary}</p>

      <div class="reason-list">
        ${metabolicState.ranked.map(item => `
          <div class="reason-item">
            <strong>${item.label} · ${round(item.score)}%</strong>
            <span class="note">${item.summary}</span>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">Adaptive maintenance</p>
      <h2>${metrics.adaptiveMaintenance.label}</h2>
      <p class="note">${metrics.adaptiveMaintenance.summary}</p>

      <div class="reason-list">
        ${metrics.adaptiveMaintenance.windows.map(window => `
          <div class="reason-item">
            <strong>${window.days}-day window</strong>
            <span class="note">
              Avg intake ${round(window.avgCalories)} kcal ·
              weight change ${round(window.weeklyChange, 2)}kg/week ·
              observed maintenance ${round(window.observedMaintenance)} kcal
            </span>
          </div>
        `).join("") || `<div class="reason-item"><strong>Window</strong><span class="note">More data needed.</span></div>`}
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">Water-load model</p>
      <h2>${waterLoad.label}</h2>
      <p class="note">${waterLoad.summary}</p>
      <div class="grid">
        ${metricCard("Estimated Water", round(waterLoad.estimatedWaterLoadKg, 1), "kg")}
        ${metricCard("Predicted Dry", round(waterLoad.predictedDryWeight, 1), "kg")}
        ${metricCard("Carb Load", round(waterLoad.contributors.carbWaterKg, 1), "kg")}
        ${metricCard("Sodium Load", round(waterLoad.contributors.sodiumWaterKg, 1), "kg")}
      </div>
      <div class="reason-list">${renderEvidence(waterLoad.evidence)}</div>
    </section>

    <section class="card">
      <p class="eyebrow">Efficiency model</p>
      <h2>${efficiency.label}</h2>
      <p class="note">${efficiency.summary}</p>
      <div class="grid">
        ${metricCard("Raw Eff", round(efficiency.rawEfficiency), "%")}
        ${metricCard("Dry Eff", round(efficiency.dryAdjustedEfficiency), "%")}
        ${metricCard("Dry Adj", round(efficiency.dryWeightAdjustment, 1), "kg")}
        ${metricCard("Loss Signal", round(efficiency.dryAdjustedLossSignal, 2), "kg/wk")}
      </div>
    </section>

    <section class="card">
  <p class="eyebrow">Energy compensation</p>
  <h2>${compensation.label}</h2>
  <p class="note">${compensation.summary}</p>

  <div class="grid">
    ${metricCard("Compensation", round(compensation.compensationScore), "%")}
    ${metricCard("Activity Efficiency", round(compensation.activityEfficiencyScore), "%")}
    ${metricCard("High Activity", compensation.highActivity ? "Yes" : "No", "")}
    ${metricCard("Large Deficit", compensation.largeDeficit ? "Yes" : "No", "")}
  </div>

  <div class="reason-list">
    ${compensation.evidence.map(item => `
      <div class="reason-item">
        <strong>Evidence</strong>
        <span class="note">${item}</span>
      </div>
    `).join("")}
  </div>

  <p class="note">${compensation.interpretation}</p>
</section>

<section class="card">
  <p class="eyebrow">Diet fatigue</p>
  <h2>${dietFatigue.label}</h2>
  <p class="note">${dietFatigue.recommendation}</p>

  <div class="grid">
    ${metricCard("Fatigue", round(dietFatigue.fatigueScore), "%")}
    ${metricCard("Diet Load", round(dietFatigue.dietLoad), "%")}
    ${metricCard("Recovery Debt", round(dietFatigue.recoveryDebt), "%")}
    ${metricCard("Collapse Risk", round(dietFatigue.adherenceCollapseRisk), "%")}
  </div>

  <div class="reason-list">
    ${dietFatigue.evidence.map(item => `
      <div class="reason-item">
        <strong>Evidence</strong>
        <span class="note">${item}</span>
      </div>
    `).join("")}
  </div>
</section>

<section class="card">
  <p class="eyebrow">State transition</p>
  <h2>${transition.transitionLabel}</h2>
  <p class="note">${transition.summary}</p>

  <div class="grid">
    ${metricCard("Direction", transition.direction, "")}
    ${metricCard("Risk", transition.riskLevel, "")}
    ${metricCard("Score", round(transition.score), "%")}
    ${metricCard("Eff Delta", round(transition.deltas.efficiencyDelta), "%")}
  </div>

  <div class="reason-list">
    ${transition.evidence.map(item => `
      <div class="reason-item">
        <strong>Evidence</strong>
        <span class="note">${item}</span>
      </div>
    `).join("")}
  </div>

  <p class="note">
    <strong>Next best move:</strong> ${transition.nextBestMove}
  </p>
</section>

<section class="card">
  <p class="eyebrow">Weekly experiment</p>
  <h2>${experiment.title}</h2>
  <p class="note"><strong>Hypothesis:</strong> ${experiment.hypothesis}</p>
  <p class="note"><strong>Expected outcome:</strong> ${experiment.expectedOutcome}</p>

  <div class="grid">
    ${metricCard("Type", experiment.type, "")}
    ${metricCard("Confidence", experiment.confidence, "")}
  </div>

  <div class="reason-list">
    <div class="reason-item">
      <strong>Protocol</strong>
      <span class="note">
        ${experiment.protocol.map(item => `• ${item}`).join("<br>")}
      </span>
    </div>

    <div class="reason-item">
      <strong>Success criteria</strong>
      <span class="note">
        ${experiment.successCriteria.map(item => `• ${item}`).join("<br>")}
      </span>
    </div>

    <div class="reason-item">
      <strong>Stop criteria</strong>
      <span class="note">
        ${experiment.stopCriteria.map(item => `• ${item}`).join("<br>")}
      </span>
    </div>
  </div>
</section>

<section class="card">
  <p class="eyebrow">Personal learning</p>
  <h2>Learning confidence: ${learning.confidence}</h2>
  <p class="note">${learning.summary}</p>

  <div class="grid">
    ${metricCard("Confidence", learning.confidenceScore, "%")}
    ${metricCard("Calories", learning.learnedProfile.calorieRange, "")}
    ${metricCard("Fatigue Sens.", learning.learnedProfile.fatigueSensitivity, "")}
    ${metricCard("Activity Sens.", learning.learnedProfile.activitySensitivity, "")}
  </div>

  <div class="reason-list">
    <div class="reason-item">
      <strong>Best signals</strong>
      <span class="note">
        ${learning.bestSignals.map(item =>
          `• ${item.title}: ${item.body}`
        ).join("<br>")}
      </span>
    </div>

    <div class="reason-item">
      <strong>Risk patterns</strong>
      <span class="note">
        ${
          learning.riskPatterns.length
            ? learning.riskPatterns.map(item =>
                `• ${item.title}: ${item.body}`
              ).join("<br>")
            : "• No strong personal risk pattern yet."
        }
      </span>
    </div>

    <div class="reason-item">
      <strong>Recommendations</strong>
      <span class="note">
        ${learning.recommendations.map(item => `• ${item}`).join("<br>")}
      </span>
    </div>
  </div>
</section>

    <section class="card">
      <p class="eyebrow">Stall investigation</p>
      <h2>${investigation.primary.title}</h2>
      <p class="note">${investigation.primary.summary}</p>

      <div class="investigation-grid">
        ${investigation.causes.map(cause => `
          <article class="investigation-card ${cause.id === investigation.primary.id ? "primary-cause" : ""}">
            <header>
              <h3>${cause.title}</h3>
              <span class="investigation-score">${round(cause.score)}%</span>
            </header>
            <p class="note">${cause.summary}</p>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">Action layer</p>
      <h2>${calorieAdjustment.label}</h2>
      <p class="note">${calorieAdjustment.summary}</p>
      <div class="grid">
        ${metricCard("Target", calorieAdjustment.targetCalories, " kcal")}
        ${metricCard("Phase", phase.title, "")}
        ${metricCard("Projection", projection.projectedDate, "")}
        ${metricCard("Scale Noise", noise.label, "")}
      </div>
    </section>
  `;
}