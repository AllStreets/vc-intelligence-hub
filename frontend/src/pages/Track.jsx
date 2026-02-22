import { useState, useEffect } from 'react';
import { TrendHistoryChart } from '../components/TrendHistoryChart';
import { SectorDistributionChart } from '../components/SectorDistributionChart';
import { TrendVelocity } from '../components/TrendVelocity';
import { exportPDF, exportCSV } from '../utils/exportUtils';
import { fetchTrendsWithCache } from '../services/dataCache';

export function Track() {
  const [trends, setTrends] = useState([]);
  const [dateRange, setDateRange] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const data = await fetchTrendsWithCache();
      setTrends(data.trends || []);
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    exportPDF('VC-Trends-Report', 'Historical Trend Analysis Report');
  };

  const handleExportCSV = () => {
    const data = trends.map(t => ({
      'Trend Name': t.name,
      'Category': t.category,
      'Momentum Score': t.momentum_score,
      'Score': Math.min(100, t.momentum_score * 2),
      'Lifecycle': t.lifecycle,
      'Confidence': t.confidence
    }));
    exportCSV('trends-data', data);
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-emerald-500 mb-4">TRACK</h1>
        <p className="text-slate-400">Loading historical analysis...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-emerald-500 mb-2">TRACK</h1>
          <p className="text-slate-400 mb-6">Historical analysis and reporting</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-emerald-600 text-white rounded text-sm font-semibold hover:bg-emerald-500 transition-colors"
          >
            Export PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 text-white rounded text-sm font-semibold hover:bg-emerald-500 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm font-semibold text-slate-300">Time Period:</label>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(parseInt(e.target.value))}
          className="bg-dark-700 text-slate-300 px-3 py-2 rounded border border-dark-600"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Historical Trend Chart */}
        <div className="bg-dark-700 rounded-lg border border-dark-600 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Trend Momentum Over Time</h2>
          <p className="text-sm text-slate-400 mb-4">Click on a trend name to add it to the chart</p>
          <TrendHistoryChart trends={trends} />
        </div>

        {/* Sector Distribution Chart */}
        <div className="bg-dark-700 rounded-lg border border-dark-600 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Sector Distribution Trends</h2>
          <SectorDistributionChart />
        </div>

        {/* Velocity Table */}
        <div>
          <TrendVelocity trends={trends} />
        </div>
      </div>
    </div>
  );
}
