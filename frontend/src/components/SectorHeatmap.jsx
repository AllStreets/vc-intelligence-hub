import { useState, useMemo } from 'react';

export function SectorHeatmap({ trends }) {
  const [hoveredCell, setHoveredCell] = useState(null);

  const sectors = ['AI/ML', 'Fintech', 'Climate', 'Healthcare', 'Cybersecurity', 'Web3', 'SaaS', 'EdTech', 'Biotech', 'Enterprise'];
  const momentumBuckets = ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '91-100'];

  // Build heatmap matrix
  const heatmapData = useMemo(() => {
    const matrix = {};

    sectors.forEach(sector => {
      matrix[sector] = {};
      momentumBuckets.forEach(bucket => {
        matrix[sector][bucket] = [];
      });
    });

    // Map trends to matrix
    trends?.forEach(trend => {
      const sector = trend.category?.replace('-', ' ') || 'Unknown';
      const momentum = Math.min(100, trend.momentum_score * 2);

      if (sectors.includes(sector)) {
        let bucket;
        if (momentum <= 10) bucket = '0-10';
        else if (momentum <= 20) bucket = '11-20';
        else if (momentum <= 30) bucket = '21-30';
        else if (momentum <= 40) bucket = '31-40';
        else if (momentum <= 50) bucket = '41-50';
        else if (momentum <= 60) bucket = '51-60';
        else if (momentum <= 70) bucket = '61-70';
        else if (momentum <= 80) bucket = '71-80';
        else if (momentum <= 90) bucket = '81-90';
        else bucket = '91-100';

        matrix[sector][bucket].push(trend);
      }
    });

    return matrix;
  }, [trends]);

  const getColor = (count) => {
    if (count === 0) return 'bg-dark-700';
    if (count === 1) return 'bg-red-900';
    if (count <= 3) return 'bg-red-700';
    if (count <= 5) return 'bg-red-600';
    return 'bg-red-500';
  };

  const getTrendsForCell = (sector, bucket) => {
    return heatmapData[sector]?.[bucket] || [];
  };

  return (
    <div className="w-full bg-dark-700 rounded-lg border border-dark-600 p-6">
      <h2 className="text-lg font-bold text-white mb-4">Sector Momentum Heatmap</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left px-2 py-2 text-slate-400 font-semibold">Sector</th>
              {momentumBuckets.map(bucket => (
                <th key={bucket} className="px-2 py-2 text-slate-400 font-semibold text-center">{bucket}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sectors.map(sector => (
              <tr key={sector}>
                <td className="px-2 py-2 text-slate-300 font-semibold">{sector}</td>
                {momentumBuckets.map(bucket => {
                  const cellTrends = getTrendsForCell(sector, bucket);
                  const count = cellTrends.length;

                  return (
                    <td
                      key={`${sector}-${bucket}`}
                      onMouseEnter={() => setHoveredCell({ sector, bucket, trends: cellTrends })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`px-2 py-2 text-center cursor-pointer transition-all ${getColor(count)}`}
                    >
                      <span className="text-white font-semibold">{count}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hovered cell details */}
      {hoveredCell && hoveredCell.trends.length > 0 && (
        <div className="mt-6 p-4 bg-dark-800 rounded border border-red-600">
          <p className="text-sm text-slate-300 mb-3">
            <span className="font-semibold">{hoveredCell.sector}</span> • Momentum {hoveredCell.bucket}
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {hoveredCell.trends.map(trend => (
              <p key={trend.id} className="text-xs text-slate-400">
                • {trend.name} (Score: {Math.min(100, trend.momentum_score * 2).toFixed(0)})
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-slate-500">
        Color intensity shows number of trends in each momentum bracket
      </div>
    </div>
  );
}
