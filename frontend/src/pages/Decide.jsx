import { useState, useEffect } from 'react';
import { ThesisMatcher } from '../components/ThesisMatcher';
import { WatchlistManager } from '../components/WatchlistManager';
import { DealPipeline } from '../components/DealPipeline';
import { fetchTrendsWithCache, fetchDealsWithCache } from '../services/dataCache';

export function Decide() {
  const [activeTab, setActiveTab] = useState('thesis');
  const [trends, setTrends] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trendsData, dealsData] = await Promise.all([
        fetchTrendsWithCache(),
        fetchDealsWithCache()
      ]);

      setTrends(trendsData.trends || []);
      setDeals(dealsData.deals || []);
    } catch (error) {
      console.error('Error fetching DECIDE page data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'thesis', label: 'Investment Thesis' },
    { id: 'watchlist', label: 'Watchlist' },
    { id: 'pipeline', label: 'Deal Pipeline' }
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-amber-400 mb-2">DECIDE</h1>
      <p className="text-slate-400 mb-6">Investment thesis matching and deal pipeline</p>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-dark-600">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === tab.id
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {loading ? (
          <p className="text-slate-400">Loading DECIDE page data...</p>
        ) : (
          <>
            {activeTab === 'thesis' && <ThesisMatcher trends={trends} deals={deals} />}
            {activeTab === 'watchlist' && <WatchlistManager />}
            {activeTab === 'pipeline' && <DealPipeline />}
          </>
        )}
      </div>
    </div>
  );
}
