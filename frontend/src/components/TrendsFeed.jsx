import { MomentumIndicator } from './MomentumIndicator';
import { SearchFilter } from './SearchFilter';
import { useState, useEffect } from 'react';

const trendColors = {
  'ai-ml': 'from-indigo-600 to-indigo-700',
  'fintech': 'from-pink-600 to-pink-700',
  'climate': 'from-emerald-600 to-emerald-700',
  'healthcare': 'from-red-600 to-red-700',
  'cybersecurity': 'from-purple-600 to-purple-700',
  'web3-crypto': 'from-orange-600 to-orange-700',
  'saas': 'from-cyan-600 to-cyan-700',
  'robotics': 'from-teal-600 to-teal-700',
  'creator': 'from-magenta-600 to-magenta-700',
  'other': 'from-amber-600 to-amber-700',
}

export default function TrendsFeed({ trends, selectedTrend, onSelectTrend }) {
  const [allTrends, setAllTrends] = useState([]);
  const [filteredTrends, setFilteredTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      // Use the trends passed as prop if available, otherwise try API
      if (trends && trends.length > 0) {
        setAllTrends(trends);
        setFilteredTrends(trends);
      } else {
        const response = await fetch('/api/trends/scored');
        const data = await response.json();
        setAllTrends(data);
        setFilteredTrends(data);
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
      filtered = filtered.filter(trend =>
        categories.includes(trend.category)
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
      <SearchFilter onSearch={handleSearch} onFilterChange={handleFilterChange} />

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
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg truncate">{trend.name}</h3>
                  <p className="text-sm text-gray-400 mt-1 capitalize">{trend.category?.replace('-', ' ')}</p>
                </div>
                <div className="text-right flex-shrink-0">
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

                {trend.sources && trend.sources.map((source) => (
                  <span key={source} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                    {source}
                  </span>
                ))}
              </div>

              {trend.confidence && (
                <div className="mt-3 text-xs text-gray-400">
                  Confidence: <span className="text-gray-300 font-semibold">{trend.confidence}</span>
                </div>
              )}

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
    </div>
  );
}
