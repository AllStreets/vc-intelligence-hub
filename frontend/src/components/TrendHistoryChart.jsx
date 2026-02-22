import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

export function TrendHistoryChart() {
  const [data, setData] = useState([]);
  const [selectedTrends, setSelectedTrends] = useState([]);
  const [allTrends, setAllTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  const fetchHistoricalData = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      // Fetch available trends for selection
      const response = await fetch(`${baseUrl}/api/trends/scored`);
      const data = await response.json();
      setAllTrends((data.trends || []).slice(0, 20)); // Top 20 for selection

      // For demo: create mock historical data (30 days)
      const mockData = generateMockHistoricalData();
      setData(mockData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockHistoricalData = () => {
    const data = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'AI/ML': 45 + Math.random() * 30 + i,
        'Fintech': 40 + Math.random() * 25 + i * 0.5,
        'Climate': 35 + Math.random() * 20
      });
    }

    return data;
  };

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

  if (loading) {
    return <p className="text-slate-400">Loading historical data...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap mb-4">
        {['AI/ML', 'Fintech', 'Climate'].map((trend, idx) => (
          <button
            key={trend}
            onClick={() => {
              setSelectedTrends(prev =>
                prev.includes(trend)
                  ? prev.filter(t => t !== trend)
                  : [...prev, trend]
              );
            }}
            className={`px-3 py-1 rounded text-sm ${
              selectedTrends.includes(trend)
                ? 'bg-green-600 text-white'
                : 'bg-dark-600 text-slate-400'
            }`}
          >
            {trend}
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
          {['AI/ML', 'Fintech', 'Climate'].map((trend, idx) => (
            <Line
              key={trend}
              type="monotone"
              dataKey={trend}
              stroke={colors[idx]}
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
