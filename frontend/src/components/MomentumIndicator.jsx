export function MomentumIndicator({ momentum, change }) {
  const isPositive = change >= 0;
  const arrowDirection = isPositive ? '↑' : '↓';
  const colorClass = isPositive ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className={`flex items-center gap-1 ${colorClass} font-semibold`}>
      <span className="text-lg animate-momentum">{arrowDirection}</span>
      <span className="text-sm">{Math.abs(change).toFixed(1)}%</span>
    </div>
  );
}
