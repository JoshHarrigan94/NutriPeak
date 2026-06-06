export function metricCard(label, value, suffix = "") {
  return `
    <div class="metric">
      <span>${label}</span>
      <strong>${value}${suffix}</strong>
    </div>
  `;
}

export function diagnosticPill(diagnostics) {
  return `
    <span class="status-pill status-${diagnostics.status}">
      ${diagnostics.label}
    </span>
  `;
} 