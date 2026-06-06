import { calculateMetrics } from "../metrics/coreMetrics.js";

export function renderReview(state) {
  const metrics = calculateMetrics(state);

  return `
    <section class="card">
      <h2>Weekly Review</h2>

      <p class="note">
        This screen will become the decision checkpoint:
        continue, monitor, review, refeed, or maintenance.
      </p>

      <div class="grid">
        <div class="metric">
          <span>Entries</span>
          <strong>${metrics.entryCount}</strong>
        </div>

        <div class="metric">
          <span>Estimated Daily Deficit</span>
          <strong>${metrics.estimatedDeficit.toFixed(0)}</strong>
        </div>

        <div class="metric">
          <span>Latest Weight</span>
          <strong>${metrics.latestWeight.toFixed(1)}kg</strong>
        </div>

        <div class="metric">
          <span>Avg Adherence</span>
          <strong>${metrics.avgAdherence.toFixed(0)}%</strong>
        </div>
      </div>
    </section>
  `;
}