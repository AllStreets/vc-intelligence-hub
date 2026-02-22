import { useState, useEffect } from 'react';
import { Cog6ToothIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { fetchTrendsWithCache, fetchDealsWithCache } from '../services/dataCache';

export function Settings() {
  const [preferences, setPreferences] = useState({
    defaultMomentumThreshold: 50
  });
  const [systemInfo, setSystemInfo] = useState({});
  const [searchHistory, setSearchHistory] = useState([]);
  const [thesisPresets, setThesisPresets] = useState([]);
  const [showThesisDropdown, setShowThesisDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    fetchSystemInfo();
  }, []);

  const fetchSettings = async () => {
    try {
      // Load search history from localStorage
      try {
        const saved = localStorage.getItem('vc-search-history');
        if (saved) {
          setSearchHistory(JSON.parse(saved));
        }
      } catch (err) {
        setSearchHistory([]);
      }

      // Load investment thesis presets from localStorage
      try {
        const saved = localStorage.getItem('vc-thesis-presets');
        if (saved) {
          setThesisPresets(JSON.parse(saved));
        }
      } catch (err) {
        setThesisPresets([]);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      // Get data from cache to display system info
      const trendsData = await fetchTrendsWithCache();
      const dealsData = await fetchDealsWithCache();

      const trendCount = (trendsData.trends || []).length;
      const dealCount = (dealsData.deals || []).length;

      // Count unique founders
      const founderSet = new Set();
      (trendsData.trends || []).forEach(trend => {
        if (trend.founders && Array.isArray(trend.founders)) {
          trend.founders.forEach(founder => {
            founderSet.add(founder.id || founder.name);
          });
        }
      });

      setSystemInfo({
        trendsLoaded: trendCount,
        dealsLoaded: dealCount,
        foundersLoaded: founderSet.size,
        dataSourcesActive: 6,
        databaseStatus: 'Connected',
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching system info:', error);
      setSystemInfo({
        trendsLoaded: 0,
        dealsLoaded: 0,
        foundersLoaded: 0,
        dataSourcesActive: 0,
        databaseStatus: 'Error',
        lastUpdated: null
      });
    }
  };

  const updatePreferences = (newPrefs) => {
    setPreferences(newPrefs);
    try {
      localStorage.setItem('vc-momentum-threshold', JSON.stringify(newPrefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vc-momentum-threshold');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-400 mb-4">SETTINGS</h1>
        <p className="text-slate-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-400 mb-8">SETTINGS</h1>

      {/* Display Preferences */}
      <div className="space-y-6">
        <section className="bg-dark-700 rounded-lg border border-dark-600 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Cog6ToothIcon className="w-5 h-5" /> Preferences
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Default Momentum Threshold: {preferences.defaultMomentumThreshold}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={preferences.defaultMomentumThreshold}
                onChange={(e) => updatePreferences({ ...preferences, defaultMomentumThreshold: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* Search History */}
        <section className="bg-dark-700 rounded-lg border border-dark-600 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Search History</h2>
            {searchHistory.length > 0 && (
              <button
                onClick={() => {
                  setSearchHistory([]);
                  localStorage.removeItem('vc-search-history');
                }}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {searchHistory.length === 0 ? (
            <p className="text-slate-400 text-sm">No search history yet</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {searchHistory.map((search) => (
                <div key={search.id} className="flex justify-between items-start p-3 bg-dark-600 rounded text-sm">
                  <div>
                    <p className="text-slate-300 font-medium">"{search.query}"</p>
                  </div>
                  <p className="text-xs text-slate-500">{search.displayTime}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Investment Thesis Presets */}
        <section className="bg-dark-700 rounded-lg border border-dark-600 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Investment Thesis Presets</h2>
            {thesisPresets.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowThesisDropdown(!showThesisDropdown)}
                  className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                >
                  View ({thesisPresets.length})
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${showThesisDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showThesisDropdown && (
                  <div className="absolute top-full right-0 mt-2 bg-dark-600 border border-dark-500 rounded-lg shadow-lg z-50 min-w-96 max-h-64 overflow-y-auto">
                    {thesisPresets.map((thesis) => (
                      <div key={thesis.id} className="px-4 py-3 border-b border-dark-500 hover:bg-dark-700 transition-colors text-sm">
                        <p className="text-slate-300 font-medium mb-1">{new Date(thesis.timestamp).toLocaleDateString()} {new Date(thesis.timestamp).toLocaleTimeString()}</p>
                        <p className="text-slate-400 text-xs line-clamp-2">{thesis.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {thesisPresets.length === 0 ? (
            <p className="text-slate-400 text-sm">No thesis presets saved yet. They'll appear here as you save them on the DECIDE page.</p>
          ) : (
            <p className="text-slate-400 text-sm">{thesisPresets.length} thesis preset(s) saved</p>
          )}
        </section>

        {/* System Information */}
        <section className="bg-dark-700 rounded-lg border border-dark-600 p-6">
          <h2 className="text-lg font-bold text-white mb-4">System Information</h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Data Sources Active</p>
              <p className="text-white font-semibold">{systemInfo.dataSourcesActive || 0}</p>
            </div>
            <div>
              <p className="text-slate-400">Trends Loaded</p>
              <p className="text-white font-semibold">{systemInfo.trendsLoaded || 0}</p>
            </div>
            <div>
              <p className="text-slate-400">Deals Loaded</p>
              <p className="text-white font-semibold">{systemInfo.dealsLoaded || 0}</p>
            </div>
            <div>
              <p className="text-slate-400">Founders Tracked</p>
              <p className="text-white font-semibold">{systemInfo.foundersLoaded || 0}</p>
            </div>
            <div>
              <p className="text-slate-400">Last Updated</p>
              <p className="text-white font-semibold">
                {systemInfo.lastUpdated ? new Date(systemInfo.lastUpdated).toLocaleTimeString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Database Status</p>
              <p className={`font-semibold ${systemInfo.databaseStatus === 'Connected' ? 'text-green-400' : 'text-red-400'}`}>
                {systemInfo.databaseStatus || 'Unknown'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
