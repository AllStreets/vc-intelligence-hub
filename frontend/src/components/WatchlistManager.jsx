import { useState, useEffect, memo } from 'react';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { fetchTrendsWithCache } from '../services/dataCache';

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
};

const WatchlistManager = memo(function WatchlistManager() {
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [allTrends, setAllTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWatchlist();
    loadTrends();
  }, []);

  const loadWatchlist = () => {
    try {
      const saved = localStorage.getItem('vc-watchlist');
      if (saved) {
        setWatchlistIds(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error loading watchlist:', err);
    }
  };

  const loadTrends = async () => {
    try {
      const trendsData = await fetchTrendsWithCache();
      setAllTrends(trendsData.trends || []);
    } catch (error) {
      console.error('Error loading trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = (trendId) => {
    const newWatchlist = watchlistIds.includes(trendId)
      ? watchlistIds.filter(id => id !== trendId)
      : [...watchlistIds, trendId];

    setWatchlistIds(newWatchlist);
    try {
      localStorage.setItem('vc-watchlist', JSON.stringify(newWatchlist));
    } catch (err) {
      console.error('Error saving watchlist:', err);
    }
  };

  const watchlistTrends = allTrends.filter(trend => watchlistIds.includes(trend.id));

  if (loading) {
    return <p className="text-slate-400">Loading watchlist...</p>;
  }

  if (watchlistTrends.length === 0) {
    return <p className="text-slate-400">No trends in watchlist. Add trends from the Discover page!</p>;
  }

  return (
    <div className="space-y-4">
      {watchlistTrends.map((trend) => (
        <div
          key={trend.id}
          className="card hover:shadow-xl transition-all hover:border-gray-600"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-lg truncate">{trend.name}</h3>
              <p className="text-sm text-gray-400 mt-1 capitalize">{trend.category?.replace('-', ' ')}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatchlist(trend.id);
                }}
                className="p-2 rounded-lg hover:bg-dark-600 transition-colors"
                title="Remove from Watchlist"
              >
                <BookmarkSolidIcon className="w-6 h-6 text-amber-400" />
              </button>
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${trendColors[trend.category] || trendColors['other']} flex items-center justify-center font-bold text-lg flex-shrink-0`}>
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

          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-slate-400">Score: {trend.score}/100</span>
          </div>
        </div>
      ))}
    </div>
  );
});

export { WatchlistManager };
