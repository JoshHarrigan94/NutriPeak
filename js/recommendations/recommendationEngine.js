export function getRecommendation(diagnostics, metrics) {
  if (metrics.entryCount < 7) {
    return "Log at least 7 days before making a decision. Right now the system is collecting baseline signal.";
  }

  if (diagnostics.efficiency >= 85 && diagnostics.fatigueRisk < 45) {
    return "Continue. Fat-loss efficiency is high enough and fatigue pressure is manageable.";
  }

  if (diagnostics.efficiency < 55 && diagnostics.fatigueRisk > 50) {
    return "Do not blindly cut calories. Review adherence, water retention and fatigue first. If this pattern persists, consider a maintenance phase rather than forcing more restriction.";
  }

  if (diagnostics.retentionRisk > 45) {
    return "Hold the plan and monitor trend weight. This looks like a possible masking phase rather than a confirmed fat-loss failure.";
  }

  return "Monitor for another 3–7 days. The signal is mixed, so the safest action is controlled observation rather than aggressive change.";
}