function movingAverage(values, windowSize = 7) {
  return values.map((item, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const slice = values.slice(start, index + 1);
    const valid = slice.filter(point => point.value > 0);

    if (!valid.length) {
      return {
        ...item,
        value: 0
      };
    }

    return {
      ...item,
      value:
        valid.reduce((sum, point) => sum + point.value, 0) /
        valid.length
    };
  });
}

function normalise(value, min, max, height, padding) {
  if (max === min) return height / 2;

  const usableHeight = height - padding * 2;
  return padding + (1 - (value - min) / (max - min)) * usableHeight;
}

function buildPath(points) {
  return points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    )
    .join(" ");
}

export function renderTrendChart(entries) {
  const weightPoints = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter(entry => entry.weightKg > 0)
    .slice(-28)
    .map(entry => ({
      date: entry.date,
      value: entry.weightKg
    }));

  if (weightPoints.length < 2) {
    return `
      <div class="trend-empty">
        Add at least two weigh-ins to see your trend.
      </div>
    `;
  }

  const trendPoints = movingAverage(weightPoints, 7);

  const width = 640;
  const height = 220;
  const padding = 28;

  const allValues = [
    ...weightPoints.map(point => point.value),
    ...trendPoints.map(point => point.value)
  ];

  const min = Math.min(...allValues) - 0.3;
  const max = Math.max(...allValues) + 0.3;

  const xStep =
    weightPoints.length > 1
      ? (width - padding * 2) / (weightPoints.length - 1)
      : 0;

  const raw = weightPoints.map((point, index) => ({
    x: padding + index * xStep,
    y: normalise(point.value, min, max, height, padding)
  }));

  const trend = trendPoints.map((point, index) => ({
    x: padding + index * xStep,
    y: normalise(point.value, min, max, height, padding)
  }));

  const start = weightPoints[0];
  const end = weightPoints[weightPoints.length - 1];

  return `
    <svg class="trend-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Weight trend chart">
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="rgba(23,23,23,.16)" />
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(23,23,23,.16)" />

      <path d="${buildPath(raw)}" fill="none" stroke="rgba(23,23,23,.28)" stroke-width="2" stroke-dasharray="4 6" />

      <path d="${buildPath(trend)}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />

      ${raw.map(point => `
        <circle cx="${point.x}" cy="${point.y}" r="3" fill="currentColor" opacity=".36" />
      `).join("")}

      <text x="${padding}" y="18" font-size="12" fill="currentColor">${max.toFixed(1)}kg</text>
      <text x="${padding}" y="${height - 8}" font-size="12" fill="currentColor">${min.toFixed(1)}kg</text>
    </svg>

    <div class="chart-caption">
      <span>${start.date}</span>
      <span>${end.date}</span>
    </div>
  `;
}