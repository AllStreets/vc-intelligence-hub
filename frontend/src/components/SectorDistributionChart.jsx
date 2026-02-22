import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { memo } from 'react';

const SectorDistributionChart = memo(function SectorDistributionChart() {
  // Mock data: average momentum per sector over 30 days
  const data = [
    { date: 'Jan 1', 'AI/ML': 45, Fintech: 40, Climate: 35, Healthcare: 30, Web3: 25 },
    { date: 'Jan 5', 'AI/ML': 48, Fintech: 42, Climate: 38, Healthcare: 32, Web3: 28 },
    { date: 'Jan 10', 'AI/ML': 52, Fintech: 45, Climate: 42, Healthcare: 35, Web3: 30 },
    { date: 'Jan 15', 'AI/ML': 55, Fintech: 48, Climate: 45, Healthcare: 38, Web3: 35 },
    { date: 'Jan 20', 'AI/ML': 58, Fintech: 50, Climate: 48, Healthcare: 40, Web3: 38 },
    { date: 'Jan 25', 'AI/ML': 60, Fintech: 52, Climate: 50, Healthcare: 42, Web3: 40 },
    { date: 'Jan 30', 'AI/ML': 62, Fintech: 55, Climate: 52, Healthcare: 45, Web3: 42 },
  ];

  const colors = ['#4F46E5', '#EC4899', '#10B981', '#F59E0B', '#06B6D4'];
  const sectors = ['AI/ML', 'Fintech', 'Climate', 'Healthcare', 'Web3'];

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
