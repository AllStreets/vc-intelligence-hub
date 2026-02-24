import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect, memo } from 'react';

/**
 * Generate a color for a trend at a given index
 * @param {number} index - Zero-based index of the trend
 * @param {number} [totalCount=index+1] - Total number of trends (used for spectrum distribution)
 * @returns {string} Hex color for indices 0-7, HSL color for 8+
 */
const generateColor = (index, totalCount = index + 1) => {
  const baseColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  if (index < baseColors.length) {
    return baseColors[index];
  }

  // For colors beyond 8, distribute remaining across full spectrum
  // Adjust for the 8 base colors already used
  const adjustedIndex = index - baseColors.length;
  const remainingColors = Math.max(totalCount - baseColors.length, 1);
  const hue = (adjustedIndex / remainingColors) * 360;
  const saturation = 75;
  const lightness = 50;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const TrendHistoryChart = memo(function TrendHistoryChart({ trends = [], dateRange = 30 }) {
  const [data, setData] = useState([]);
  const [selectedTrends, setSelectedTrends] = useState([]); // ordered array maintaining click sequence
  const [displayTrends, setDisplayTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trends.length > 0) {
      // Get top 15 trends for display
      const topTrends = trends.slice(0, 15);
      setDisplayTrends(topTrends);

      // Auto-select first 3 trends as ordered array
      setSelectedTrends(topTrends.slice(0, 3).map(t => t.id));

      // Generate mock historical data with actual trend names
      const mockData = generateMockHistoricalData(topTrends, dateRange);
      setData(mockData);
      setLoading(false);
    }
  }, [trends, dateRange]);

  const generateMockHistoricalData = (trendsToInclude, days = 30) => {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dayData = {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };

      // Add mock values for each trend
      trendsToInclude.forEach((trend, idx) => {
        const baseValue = 40 + idx * 5;
        dayData[trend.id] = baseValue + Math.random() * 30 + (i / days) * 20;
      });

      data.push(dayData);
    }

    return data;
  };

  const toggleTrendSelection = (trendId) => {
    setSelectedTrends(prev => {
      if (prev.includes(trendId)) {
        // Trend already selected - remove it (deselect)
        return prev.filter(t => t !== trendId);
      } else {
        // Trend not selected - append to end (maintain order by click sequence)
        return [...prev, trendId];
      }
    });
  };

  if (loading) {
    return <p className="text-slate-400">Loading historical data...</p>;
  }

  if (displayTrends.length === 0) {
    return <p className="text-slate-400">No trends available to track</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap mb-4 max-h-24 overflow-y-auto p-2 bg-dark-600 rounded">
        {displayTrends.map((trend, idx) => (
          <button
            key={trend.id}
            onClick={() => toggleTrendSelection(trend.id)}
            className={`px-3 py-1 rounded text-sm whitespace-nowrap transition-colors ${
              selectedTrends.includes(trend.id)
                ? 'bg-emerald-600 text-white'
                : 'bg-dark-700 text-slate-400 hover:bg-dark-600'
            }`}
            title={trend.name}
          >
            {trend.name.substring(0, 20)}...
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#94A3B8" />
          <YAxis stroke="#94A3B8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}
            labelStyle={{ color: '#FFF' }}
          />
          <Legend />
          {displayTrends.map((trend, idx) =>
            selectedTrends.includes(trend.id) ? (
              <Line
                key={trend.id}
                type="monotone"
                dataKey={trend.id}
                stroke={generateColor(idx, displayTrends.length)}
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
                name={trend.name}
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="text-xs text-slate-500 mt-2">
        {selectedTrends.length === 0 && (
          <p>Click on a trend above to add it to the chart</p>
        )}
      </div>
    </div>
  );
});

export { TrendHistoryChart };
