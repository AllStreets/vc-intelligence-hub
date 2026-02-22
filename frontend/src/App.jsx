import { useState, useEffect } from 'react'
import TrendsFeed from './components/TrendsFeed'
import TrendDrilldown from './components/TrendDrilldown'
import DealDiscovery from './components/DealDiscovery'
import APIStatusBar from './components/APIStatusBar'
import { fetchTrends, fetchDeals, fetchAPIStatus } from './services/api'

export default function App() {
  const [trends, setTrends] = useState([])
  const [deals, setDeals] = useState([])
  const [apiStatus, setApiStatus] = useState({})
  const [selectedTrend, setSelectedTrend] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('trends')

  // Fetch API status on mount
  useEffect(() => {
    loadAPIStatus()
  }, [])

  const loadAPIStatus = async () => {
    try {
      const status = await fetchAPIStatus()
      setApiStatus(status)
    } catch (err) {
      console.error('Error fetching API status:', err)
    }
  }

  const handleLoadTrends = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTrends()
      setTrends(data.trends || [])
      if (data.trends && data.trends.length > 0) {
        setSelectedTrend(data.trends[0])
      }
      setActiveTab('trends')
    } catch (err) {
      setError(err.message || 'Failed to load trends')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadDeals = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDeals()
      setDeals(data.deals || [])
      setActiveTab('deals')
    } catch (err) {
      setError(err.message || 'Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-700 bg-dark-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                VC Intelligence Hub
              </h1>
              <p className="text-gray-400 font-light">Real-time trend analysis for venture capital</p>
            </div>
            <div className="text-right text-sm text-gray-400">
              <p>Market Intelligence Platform</p>
              <p className="text-xs mt-1">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* API Status Bar */}
          <APIStatusBar status={apiStatus} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Control Panel */}
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
          >
            Refresh Status
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-700/50 text-red-200">
            <p className="font-semibold mb-1">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-700 flex gap-4">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'trends'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Trends ({trends.length})
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'deals'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Deals ({deals.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trends Feed or Deals */}
          <div className="lg:col-span-2">
            {activeTab === 'trends' ? (
              <TrendsFeed trends={trends} selectedTrend={selectedTrend} onSelectTrend={setSelectedTrend} />
            ) : (
              <DealDiscovery deals={deals} />
            )}
          </div>

          {/* Right Sidebar - Trend Details */}
          {activeTab === 'trends' && selectedTrend && (
            <div className="lg:col-span-1">
              <TrendDrilldown trend={selectedTrend} />
            </div>
          )}
        </div>

        {/* Empty State */}
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

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-dark-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>VC Intelligence Hub © 2026 | Powered by plugin-based data aggregation</p>
        </div>
      </footer>
    </div>
  )
}
