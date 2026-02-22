import { MomentumIndicator } from './MomentumIndicator';
import { SearchFilter } from './SearchFilter';
import { FounderDetailsPanel } from './FounderDetailsPanel';
import { SourceLinks } from './SourceLinks';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

// Map frontend category display names to backend category values
const categoryMapping = {
  'AI/ML': 'ai-ml',
  'Fintech': 'fintech',
  'Climate': 'climate',
  'Healthcare': 'healthcare',
  'Cybersecurity': 'cybersecurity',
  'Web3': 'web3-crypto',
  'SaaS': 'saas',
  'EdTech': 'edtech',
  'Biotech': 'biotech',
  'Enterprise': 'enterprise'
};

// Reverse mapping for display
const backendToFrontendCategory = Object.fromEntries(
  Object.entries(categoryMapping).map(([display, backend]) => [backend, display])
);

const trendColors = {
  'ai-ml': 'from-indigo-600 to-indigo-700',
  'fintech': 'from-pink-600 to-pink-700',
  'climate': 'from-emerald-600 to-emerald-700',
  'healthcare': 'from-red-600 to-red-700',
  'cybersecurity': 'from-purple-600 to-purple-700',
  'web3-crypto': 'from-orange-600 to-orange-700',
  'saas': 'from-cyan-600 to-cyan-700',
  'edtech': 'from-teal-600 to-teal-700',
  'biotech': 'from-magenta-600 to-magenta-700',
  'enterprise': 'from-slate-600 to-slate-700',
  'other': 'from-amber-600 to-amber-700',
}

export default function TrendsFeed({ trends, selectedTrend, onSelectTrend, onSearchSubmit }) {
  const [allTrends, setAllTrends] = useState([]);
  const [filteredTrends, setFilteredTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFounder, setSelectedFounder] = useState(null);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    fetchTrends();
    loadWatchlist();
  }, []);

  // Sync trends prop with internal state whenever it changes
  useEffect(() => {
    if (trends && trends.length > 0) {
      setAllTrends(trends);
      setFilteredTrends(trends);
      setLoading(false);
    }
  }, [trends]);

  const loadWatchlist = () => {
    try {
      const saved = localStorage.getItem('vc-watchlist');
      if (saved) {
        setWatchlist(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error loading watchlist:', err);
    }
  };

  const toggleWatchlist = (trendId) => {
    const newWatchlist = watchlist.includes(trendId)
      ? watchlist.filter(id => id !== trendId)
      : [...watchlist, trendId];

    setWatchlist(newWatchlist);
    try {
      localStorage.setItem('vc-watchlist', JSON.stringify(newWatchlist));
    } catch (err) {
      console.error('Error saving watchlist:', err);
    }
  };

  const fetchTrends = async () => {
    try {
      // Use the trends passed as prop if available, otherwise try API
      if (trends && trends.length > 0) {
        setAllTrends(trends);
        setFilteredTrends(trends);
      } else {
        const response = await fetch('/api/trends/scored');
        const data = await response.json();
        const trendsList = data.trends || data;
        setAllTrends(trendsList);
        setFilteredTrends(trendsList);
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilters(query, selectedCategories);
  };

  const handleFilterChange = (categories) => {
    setSelectedCategories(categories);
    applyFilters(searchQuery, categories);
  };

  const applyFilters = (query, categories) => {
    let filtered = allTrends;

    // Apply search filter
    if (query) {
      filtered = filtered.filter(trend =>
        trend.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply category filter
    if (categories.length > 0) {
      // Convert frontend category names to backend values
      const backendCategories = categories.map(cat => categoryMapping[cat]);
      filtered = filtered.filter(trend =>
        backendCategories.includes(trend.category)
      );
    }

    setFilteredTrends(filtered);
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400">Loading trends...</p>
      </div>
    );
  }

  return (
    <div>
      <SearchFilter onSearch={handleSearch} onFilterChange={handleFilterChange} onSearchSubmit={onSearchSubmit} />

      {filteredTrends.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">No trends found matching your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrends.slice(0, 20).map((trend) => (
            <button
              key={trend.id}
              onClick={() => onSelectTrend(trend)}
              className={`card w-full text-left transition-all hover:shadow-xl ${
                selectedTrend?.id === trend.id
                  ? 'border-blue-500 bg-dark-700 shadow-lg shadow-blue-500/20'
                  : 'hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-lg truncate">{trend.name}</h3>
                  <p className="text-sm text-gray-400 mt-1 capitalize truncate">{trend.category?.replace('-', ' ')}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(trend.id);
                    }}
                    className="p-2 rounded-lg hover:bg-dark-600 transition-colors group"
                    title={watchlist.includes(trend.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    {watchlist.includes(trend.id) ? (
                      <BookmarkSolidIcon className="w-6 h-6 text-amber-400" />
                    ) : (
                      <BookmarkIcon className="w-6 h-6 text-slate-400 group-hover:text-amber-400 transition-colors" />
                    )}
                  </button>
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${trendColors[trend.category] || trendColors['other']} flex items-center justify-center font-bold text-lg`}>
                    {trend.momentum_score}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  trend.lifecycle === 'peak' ? 'bg-green-900 text-green-200' :
                  trend.lifecycle === 'emerging' ? 'bg-blue-900 text-blue-200' :
                  trend.lifecycle === 'established' ? 'bg-gray-700 text-gray-200' :
                  'bg-red-900 text-red-200'
                }`}>
                  {trend.lifecycle}
                </span>
              </div>

              {trend.confidence && (
                <div className="mt-3 text-xs text-gray-400">
                  Confidence: <span className="text-gray-300 font-semibold">{trend.confidence}</span>
                </div>
              )}

              {/* Founders section */}
              <div className="mt-3">
                <p className="text-xs text-slate-400 mb-1">Founders:</p>
                <div className="flex flex-wrap gap-1">
                  {trend.founders?.map(founder => (
                    <button
                      key={founder.id}
                      onClick={() => setSelectedFounder(founder)}
                      className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      @{founder.name}
                    </button>
                  ))}
                </div>
              </div>

              <SourceLinks sources={trend.sources} />

              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-slate-400">Score: {trend.score}/100</span>
                <MomentumIndicator momentum={trend.momentum} change={trend.momentumChange} />
              </div>
            </button>
          ))}

          {filteredTrends.length > 20 && (
            <p className="text-center text-gray-500 py-4 text-sm">
              Showing 20 of {filteredTrends.length} trends
            </p>
          )}
        </div>
      )}

      <FounderDetailsPanel
        founderId={selectedFounder?.id}
        founderData={selectedFounder}
        onClose={() => setSelectedFounder(null)}
      />
    </div>
  );
}
