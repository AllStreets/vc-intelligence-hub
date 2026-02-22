import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { memo, useMemo } from 'react';

const SectorDistributionChart = memo(function SectorDistributionChart({ dateRange = 30 }) {
  const colors = ['#4F46E5', '#EC4899', '#10B981', '#F59E0B', '#06B6D4'];
  const sectors = ['AI/ML', 'Fintech', 'Climate', 'Healthcare', 'Web3'];

  // Generate mock data: average momentum per sector over the specified date range
  const data = useMemo(() => {
    const result = [];
    const today = new Date();
    const step = Math.max(1, Math.floor(dateRange / 7)); // Show roughly 7 data points

    for (let i = dateRange - 1; i >= 0; i -= step) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dataPoint = {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };

      sectors.forEach((sector, idx) => {
        const baseValue = 40 + idx * 5;
        dataPoint[sector] = baseValue + Math.random() * 20 + (dateRange - i) / dateRange * 10;
      });

      result.push(dataPoint);
    }

    return result;
  }, [dateRange]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#94A3B8" />
        <YAxis stroke="#94A3B8" />
        <Tooltip
          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}
          labelStyle={{ color: '#FFF' }}
        />
        <Legend />
        {sectors.map((sector, idx) => (
          <Area
            key={sector}
            type="monotone"
            dataKey={sector}
            stackId="1"
            stroke={colors[idx]}
            fill={colors[idx]}
            fillOpacity={0.6}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
});

export { SectorDistributionChart };
