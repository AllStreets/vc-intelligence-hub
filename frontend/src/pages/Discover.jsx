import { useState, useEffect } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import TrendsFeed from '../components/TrendsFeed'
import TrendDrilldown from '../components/TrendDrilldown'
import DealDiscovery from '../components/DealDiscovery'
import APIStatusBar from '../components/APIStatusBar'
import { fetchTrends, fetchDeals, fetchAPIStatus } from '../services/api'
import { fetchTrendsWithCache, fetchDealsWithCache, fetchAPIStatusWithCache, clearAllCache } from '../services/dataCache'

export function Discover() {
  const [trends, setTrends] = useState([])
  const [deals, setDeals] = useState([])
  const [apiStatus, setApiStatus] = useState({})
  const [selectedTrend, setSelectedTrend] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('trends')
  const [searchHistory, setSearchHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadAPIStatus()
    loadSearchHistory()
  }, [])

  const loadSearchHistory = () => {
    try {
      const saved = localStorage.getItem('vc-search-history')
      if (saved) {
        setSearchHistory(JSON.parse(saved))
      }
    } catch (err) {
      console.error('Error loading search history:', err)
    }
  }

  const addToSearchHistory = (type, count) => {
    const newEntry = {
      id: Date.now(),
      type,
      count,
      timestamp: new Date().toISOString(),
      displayTime: new Date().toLocaleTimeString()
    }

    const updated = [newEntry, ...searchHistory].slice(0, 20) // Keep last 20
    setSearchHistory(updated)

    try {
      localStorage.setItem('vc-search-history', JSON.stringify(updated))
    } catch (err) {
      console.error('Error saving search history:', err)
    }
  }

  const clearSearchHistory = () => {
    setSearchHistory([])
    try {
      localStorage.removeItem('vc-search-history')
    } catch (err) {
      console.error('Error clearing search history:', err)
    }
  }

  const loadAPIStatus = async (forceRefresh = false) => {
    try {
      const status = await fetchAPIStatusWithCache(forceRefresh)
      setApiStatus(status)
    } catch (err) {
      console.error('Error fetching API status:', err)
    }
  }

  const handleLoadTrends = async (forceRefresh = false) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTrendsWithCache(forceRefresh)
      setTrends(data.trends || [])
      if (data.trends && data.trends.length > 0) {
        setSelectedTrend(data.trends[0])
        addToSearchHistory('Trends', data.trends.length)
      }
      setActiveTab('trends')
    } catch (err) {
      setError(err.message || 'Failed to load trends')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadDeals = async (forceRefresh = false) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDealsWithCache(forceRefresh)
      setDeals(data.deals || [])
      addToSearchHistory('Deals', (data.deals || []).length)
      setActiveTab('deals')
    } catch (err) {
      setError(err.message || 'Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshData = async () => {
    clearAllCache()
    await Promise.all([
      handleLoadTrends(true),
      handleLoadDeals(true)
    ])
    loadAPIStatus()
  }

  return (
    <div>
      <header className="border-b border-slate-700 border-t-4 border-t-slate-500 bg-dark-800 sticky top-0 z-40">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2 text-slate-300">
                DISCOVER
              </h1>
              <p className="text-slate-400 font-light">Real-time trend analysis for venture capital</p>
            </div>
            <div className="text-right text-sm text-gray-400">
              <p>Market Intelligence Platform</p>
              <p className="text-xs mt-1">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <APIStatusBar status={apiStatus} />
        </div>
      </header>

      <main className="p-6">
        <div className="mb-8 flex flex-wrap gap-4 items-center">
          <button
            onClick={handleLoadTrends}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              'Load Trends'
            )}
          </button>

          {trends.length > 0 && (
            <button
              onClick={handleRefreshData}
              disabled={loading}
              className="btn btn-ghost"
              title="Refresh trend data from all plugins"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Data
                </span>
              )}
            </button>
          )}

          <button
            onClick={handleLoadDeals}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              'Load Deals'
            )}
          </button>

          <button
            onClick={loadAPIStatus}
            disabled={loading}
            className="btn btn-ghost"
            title="Check plugin status and API availability"
          >
            Plugin Status
          </button>

          {/* Search History Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="btn btn-ghost flex items-center gap-2"
              title="View recent searches"
            >
              Search History {searchHistory.length > 0 && `(${searchHistory.length})`}
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
            </button>

            {showHistory && (
              <div className="absolute top-full left-0 mt-2 bg-dark-700 border border-dark-600 rounded-lg shadow-lg z-50 min-w-64 max-h-96 overflow-y-auto">
                {searchHistory.length === 0 ? (
                  <div className="p-4 text-slate-400 text-sm">No search history yet</div>
                ) : (
                  <>
                    <div className="sticky top-0 bg-dark-700 border-b border-dark-600 p-3 flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-300">Recent Searches</span>
                      <button
                        onClick={clearSearchHistory}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    {searchHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="px-4 py-3 border-b border-dark-600 hover:bg-dark-600 transition-colors cursor-pointer text-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-slate-300 font-medium">{entry.type}</p>
                            <p className="text-xs text-slate-500">{entry.count} items loaded</p>
                          </div>
                          <p className="text-xs text-slate-500">{entry.displayTime}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-700/50 text-red-200">
            <p className="font-semibold mb-1">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6 border-b border-dark-600 flex gap-4">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'trends'
                ? 'border-b-2 border-slate-400 text-slate-300'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Trends ({trends.length})
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'deals'
                ? 'border-b-2 border-slate-400 text-slate-300'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Deals ({deals.length})
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'trends' ? (
              <TrendsFeed trends={trends} selectedTrend={selectedTrend} onSelectTrend={setSelectedTrend} />
            ) : (
              <DealDiscovery deals={deals} />
            )}
          </div>

          {activeTab === 'trends' && selectedTrend && (
            <div className="lg:col-span-1">
              <TrendDrilldown trend={selectedTrend} />
            </div>
          )}
        </div>

        {trends.length === 0 && deals.length === 0 && !loading && activeTab === 'trends' && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-4">No trends loaded yet</p>
            <p className="text-sm">Click "Load Trends" to start discovering market opportunities</p>
          </div>
        )}

        {deals.length === 0 && !loading && activeTab === 'deals' && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-4">No deals loaded yet</p>
            <p className="text-sm">Click "Load Deals" to discover funding announcements</p>
          </div>
        )}
      </main>
    </div>
  );
}
