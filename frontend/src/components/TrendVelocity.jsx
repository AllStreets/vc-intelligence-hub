import { useState } from 'react';

export function TrendVelocity({ trends }) {
  const [sortBy, setSortBy] = useState('rising');

  // Generate mock velocity data
  const trendVelocity = trends?.map(trend => {
    const momentum = Math.min(100, trend.momentum_score * 2);
    // Mock 30-day change
    const change = Math.floor((Math.random() - 0.4) * 40);
    const previousMomentum = momentum - change;
    const changePercent = previousMomentum > 0
      ? Math.round(((momentum - previousMomentum) / previousMomentum) * 100)
      : 0;

    return {
      ...trend,
      momentum,
      change: changePercent,
      trajectory: changePercent > 0 ? 'rising' : 'falling'
    };
  }) || [];

  // Sort by trend
  const sorted = sortBy === 'rising'
    ? trendVelocity.sort((a, b) => b.change - a.change)
    : trendVelocity.sort((a, b) => a.change - b.change);

  return (
    <div className="bg-dark-700 rounded-lg border border-dark-600 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Trends Rising & Falling</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-dark-600 text-slate-300 px-3 py-1 rounded text-sm border border-dark-500"
        >
          <option value="rising">Rising Fastest</option>
          <option value="falling">Falling Fastest</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-600">
              <th className="text-left px-4 py-3 text-slate-400 font-semibold">Trend</th>
              <th className="text-left px-4 py-3 text-slate-400 font-semibold">Category</th>
              <th className="text-right px-4 py-3 text-slate-400 font-semibold">30-Day Change</th>
              <th className="text-right px-4 py-3 text-slate-400 font-semibold">Current Score</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 15).map(trend => (
              <tr key={trend.id} className="border-b border-dark-600 hover:bg-dark-600 transition-colors">
                <td className="px-4 py-3 text-white">{trend.name}</td>
                <td className="px-4 py-3 text-slate-400 capitalize">{trend.category?.replace('-', ' ')}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-bold ${trend.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trend.change > 0 ? '+' : ''}{trend.change}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-white">{Math.min(100, trend.momentum).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
