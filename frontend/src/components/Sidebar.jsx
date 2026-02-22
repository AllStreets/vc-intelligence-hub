import { usePageContext } from './PageRouter';
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const pages = [
  { id: 'discover', label: 'DISCOVER', icon: MagnifyingGlassIcon, color: 'slate-300' },
  { id: 'evaluate', label: 'EVALUATE', icon: UserGroupIcon, color: 'red-600' },
  { id: 'decide', label: 'DECIDE', icon: CurrencyDollarIcon, color: 'amber-400' },
  { id: 'track', label: 'TRACK', icon: ChartBarIcon, color: 'emerald-500' },
  { id: 'settings', label: 'SETTINGS', icon: Cog6ToothIcon, color: 'slate-400' }
];

export function Sidebar() {
  const { activePage, setActivePage } = usePageContext();

  return (
    <aside className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col p-6">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">VC Intelligence</h1>
        <p className="text-xs text-slate-400 mt-1">Hub</p>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-2 flex-1">
        {pages.map(page => {
          const Icon = page.icon;
          const isActive = activePage === page.id;

          return (
            <button
              key={page.id}
              onClick={() => setActivePage(page.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? `bg-dark-700 text-${page.color} border-l-4 border-${page.color}`
                  : 'text-slate-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-semibold">{page.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="text-xs text-slate-500 border-t border-dark-700 pt-4">
        <p>155 Trends</p>
        <p>100+ Founders</p>
        <p>97 Deals</p>
      </div>
    </aside>
  );
}
