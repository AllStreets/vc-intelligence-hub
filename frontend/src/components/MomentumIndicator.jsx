import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';

export function MomentumIndicator({ momentum, change }) {
  const isPositive = change >= 0;
  const colorClass = isPositive ? 'text-emerald-400' : 'text-red-400';
  const IconComponent = isPositive ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className={`flex items-center gap-1 ${colorClass} font-semibold`}>
      <IconComponent className="w-4 h-4 animate-momentum" />
      <span className="text-sm">{Math.abs(change).toFixed(1)}%</span>
    </div>
  );
}
