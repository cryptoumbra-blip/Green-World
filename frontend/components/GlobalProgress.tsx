"use client";

type GlobalProgressProps = {
  totalGreen: number;
  totalTiles: number;
};

export function GlobalProgress({ totalGreen, totalTiles }: GlobalProgressProps) {
  const pct = totalTiles > 0 ? (totalGreen / totalTiles) * 100 : 0;
  const displayPct = pct < 0.01 && totalGreen > 0 ? pct.toFixed(4) : pct.toFixed(2);

  return (
    <div className="global-progress">
      <div className="global-progress-header">
        <span className="global-progress-label">World greenified</span>
        <span className="global-progress-value">
          {totalGreen.toLocaleString()} / {totalTiles.toLocaleString()} ({displayPct}%)
        </span>
      </div>
      <div className="global-progress-track">
        <div
          className="global-progress-fill"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}
